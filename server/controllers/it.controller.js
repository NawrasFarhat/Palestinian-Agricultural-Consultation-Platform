import * as itService from '../services/it.service.js';
import db from '../models/index.js';
import bcrypt from 'bcrypt';

export const getAllUsers = async (req, res) => {
  try {
    const users = await itService.fetchAllUsers();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { newRole } = req.body;
    await itService.changeUserRole(id, newRole);
    res.status(200).json({
      status: "success",
      message: "User role updated successfully"
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await itService.removeUser(id);
    res.status(200).json({
      status: "success",
      message: "User deleted successfully"
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /it/questions - Get all questions with answers
export const getAllQuestions = async (req, res) => {
  try {
    const questions = await db.Question.findAll({
      include: [
        {
          model: db.Answer,
          attributes: ['expected_text']
        },
        {
          model: db.Disease,
          attributes: ['name']
        }
      ],
      order: [['createdAt', 'ASC']]
    });

    // Transform the data to match the frontend expectations
    const transformedQuestions = questions.map(q => ({
      id: q.id,
      text: q.text,
      disease_id: q.disease_id,
      answer: q.Answers?.map(a => a.expected_text).join(', ') || '',
      disease_name: q.Disease?.name || ''
    }));
    

    res.status(200).json(transformedQuestions);
  } catch (err) {
    console.error("Error in getAllQuestions:", err);
    res.status(500).json({ 
      status: "error",
      message: "Failed to fetch questions" 
    });
  }
};

// POST /it/questions - Add question with answer
export const addQuestionWithAnswer = async (req, res) => {
  try {
    const { text, answer, diseaseId } = req.body;
    
    // Validate required fields
    if (!text || !answer || !diseaseId) {
      return res.status(400).json({ 
        status: "error",
        message: "Question text, answer, and disease ID are required" 
      });
    }

    // Check if disease exists
    const disease = await db.Disease.findByPk(diseaseId);
    if (!disease) {
      return res.status(404).json({ 
        status: "error",
        message: "Disease not found" 
      });
    }

    // Create the question
    const question = await db.Question.create({
      text: text.trim(),
      disease_id: diseaseId,
      source: 'manual',
      input_type: 'choice'
    });

    // Create the answer
    const answerRecord = await db.Answer.create({
      question_id: question.id,
      expected_text: answer.trim()
    });

    res.status(201).json({
      status: "success",
      message: "Question and answer added successfully",
      data: {
        question: question,
        answer: answerRecord
      }
    });
  } catch (err) {
    console.error("Error in addQuestionWithAnswer:", err);
    res.status(500).json({ 
      status: "error",
      message: "Failed to add question and answer" 
    });
  }
};

// System monitoring functions
export const getSystemHealth = async (req, res) => {
  try {
    const health = await itService.getSystemHealth();
    res.status(200).json(health);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getSystemLogs = async (req, res) => {
  try {
    const logs = await itService.getSystemLogs();
    res.status(200).json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createBackup = async (req, res) => {
  try {
    const backup = await itService.createBackup();
    res.status(200).json({ message: "Backup created successfully", backup });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const restoreBackup = async (req, res) => {
  try {
    const { backupId } = req.body;
    await itService.restoreBackup(backupId);
    res.status(200).json({ message: "Backup restored successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const addUser = async (req, res) => {
  try {
    const { username, email, password, role, phone } = req.body;
    if (!username || !password || !role || !phone) {
      return res.status(400).json({ message: 'Username, password, role, and phone are required.' });
    }
    
    // Check for existing user by username
    const existingUser = await req.db.User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(409).json({ message: 'Username already exists.' });
    }
    
    // Check for existing user by phone
    const existingPhone = await req.db.User.findOne({ where: { phone } });
    if (existingPhone) {
      return res.status(409).json({ message: 'Phone number already exists.' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await req.db.User.create({ 
      username, 
      email, 
      password: hashedPassword, 
      role, 
      phone 
    });
    const { password: _, ...userData } = user.toJSON();
    res.status(201).json(userData);
  } catch (err) {
    console.error('Error in addUser:', err);
    // Sequelize unique constraint error
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ message: 'Username, email, or phone number already exists.' });
    }
    // Sequelize validation error
    if (err.name === 'SequelizeValidationError') {
      return res.status(400).json({ message: err.errors.map(e => e.message).join(', ') });
    }
    res.status(500).json({ message: 'Failed to add user.' });
  }
};
