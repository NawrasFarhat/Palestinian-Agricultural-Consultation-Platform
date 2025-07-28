import db from '../models/index.js';
import { Sequelize } from 'sequelize';

export const changeUserRole = async (req, res) => {
  try {
    const { username, newRole } = req.body;
    const allowedRoles = ["farmer", "engineer", "manager", "it"];

    if (!allowedRoles.includes(newRole)) {
      return res.status(400).json({ status: "error", message: "Invalid role." });
    }

    const user = await db.User.findOne({ where: { username } });
    if (!user) {
      return res.status(404).json({ status: "error", message: "User not found." });
    }

    await user.update({ role: newRole });
    res.status(200).json({ status: "success", message: `Role of ${username} updated to ${newRole}.` });
  } catch (err) {
    console.error("Error in changeUserRole:", err);
    res.status(500).json({ status: "error", message: err.message });
  }
};

export const getAllDiseasesWithEngineers = async (req, res) => {
  try {
    const diseases = await db.Disease.findAll({
      include: [{ model: db.User, attributes: ['username'] }],
      order: [['createdAt', 'DESC']]
    });
    const result = diseases.map(d => ({
      id: d.id,
      name: d.name,
      symptoms: d.symptoms,
      solution: d.solution,
      created_at: d.createdAt,
      engineer: d.User?.username || ''
    }));
    res.status(200).json(result);
  } catch (err) {
    console.error("Error in getAllDiseases:", err);
    res.status(500).json({ message: err.message });
  }
};

// GET /manager/pending-changes
export const getPendingChanges = async (req, res) => {
  console.log('🔍 [DEBUG] getPendingChanges - Function started');
  console.log('🔍 [DEBUG] getPendingChanges - req.user:', JSON.stringify(req.user, null, 2));
  
  try {
    console.log('🔍 [DEBUG] getPendingChanges - Starting database query');
    console.log('🔍 [DEBUG] getPendingChanges - Query parameters:', {
      status: 'pending',
      change_type: ['disease_add', 'disease_edit']
    });

    const pendingChanges = await db.PendingChange.findAll({
      where: { 
        status: 'pending',
        change_type: { [db.Sequelize.Op.in]: ['disease_add', 'disease_edit'] }
      },
      include: [
        { model: db.Disease, attributes: ['name'], required: false },
        { model: db.User, as: 'Engineer', attributes: ['username'] }
      ],
      order: [['submitted_at', 'DESC']]
    });

    console.log('🔍 [DEBUG] getPendingChanges - Database query successful');
    console.log('🔍 [DEBUG] getPendingChanges - Raw pendingChanges count:', pendingChanges.length);
    console.log('🔍 [DEBUG] getPendingChanges - Raw pendingChanges:', JSON.stringify(pendingChanges, null, 2));

    console.log('🔍 [DEBUG] getPendingChanges - Starting data formatting');
    const formattedChanges = pendingChanges.map((change, index) => {
      console.log(`🔍 [DEBUG] getPendingChanges - Processing change ${index + 1}:`, {
        id: change.id,
        change_type: change.change_type,
        disease_id: change.disease_id,
        engineer_id: change.engineer_id,
        hasDisease: !!change.Disease,
        hasEngineer: !!change.Engineer,
        disease_data: change.disease_data,
        submitted_at: change.submitted_at
      });

      const formattedChange = {
        id: change.id,
        change_type: change.change_type,
        disease_name: change.Disease?.name || change.disease_data?.name || 'New Disease',
        engineer_username: change.Engineer?.username,
        disease_data: change.disease_data,
        submitted_at: change.submitted_at,
        notes: change.review_notes
      };

      console.log(`🔍 [DEBUG] getPendingChanges - Formatted change ${index + 1}:`, JSON.stringify(formattedChange, null, 2));
      return formattedChange;
    });

    console.log('🔍 [DEBUG] getPendingChanges - Data formatting completed');
    console.log('🔍 [DEBUG] getPendingChanges - Final formattedChanges count:', formattedChanges.length);
    console.log('🔍 [DEBUG] getPendingChanges - Sending response');

    res.json(formattedChanges);
  } catch (error) {
    console.error('❌ [ERROR] getPendingChanges - Caught exception:', error);
    console.error('❌ [ERROR] getPendingChanges - Error name:', error.name);
    console.error('❌ [ERROR] getPendingChanges - Error message:', error.message);
    console.error('❌ [ERROR] getPendingChanges - Error stack:', error.stack);
    
    res.status(500).json({ message: 'Failed to fetch pending changes', error: error.message });
  }
};

// POST /manager/approve/:id
export const approveSubmission = async (req, res) => {
  try {
    const { id } = req.params;
    const managerId = req.user.id;
    
    const pendingChange = await db.PendingChange.findByPk(id);
    if (!pendingChange) {
      return res.status(404).json({ message: 'Submission not found' });
    }
    if (pendingChange.status !== 'pending') {
      return res.status(400).json({ message: 'Submission is not pending' });
    }

    const { disease_data } = pendingChange;

    if (pendingChange.change_type === 'disease_add') {
      // Create new disease and questions
      const disease = await db.Disease.create({
        name: disease_data.name,
        symptoms: disease_data.symptoms,
        solution: disease_data.solution,
        created_by: pendingChange.engineer_id
      });

      // Create questions for the new disease
      for (const question of disease_data.questions) {
        await db.Question.create({
          disease_id: disease.id,
          text: question,
          source: 'manual',
          input_type: 'choice'
        });
      }

    } else if (pendingChange.change_type === 'disease_edit') {
      // Update existing disease
      const disease = await db.Disease.findByPk(pendingChange.disease_id);
      if (!disease) {
        return res.status(404).json({ message: 'Disease not found' });
      }

      await disease.update({
        name: disease_data.name,
        symptoms: disease_data.symptoms,
        solution: disease_data.solution
      });

      // Remove existing questions and add new ones
      await db.Question.destroy({ where: { disease_id: pendingChange.disease_id } });
      
      for (const question of disease_data.questions) {
        await db.Question.create({
          disease_id: pendingChange.disease_id,
          text: question,
          source: 'manual',
          input_type: 'choice'
        });
      }
    }

    // Update pending change status
    await pendingChange.update({
      status: 'approved',
      reviewed_at: new Date(),
      manager_id: managerId
    });

    res.json({ message: 'Disease change approved successfully' });
  } catch (error) {
    console.error('Error in approveSubmission:', error);
    res.status(500).json({ message: 'Failed to approve submission', error });
  }
};

// POST /manager/reject/:id
export const rejectSubmission = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const managerId = req.user.id;
    
    const pendingChange = await db.PendingChange.findByPk(id);
    if (!pendingChange) {
      return res.status(404).json({ message: 'Submission not found' });
    }
    if (pendingChange.status !== 'pending') {
      return res.status(400).json({ message: 'Submission is not pending' });
    }

    await pendingChange.update({
      status: 'rejected',
      reviewed_at: new Date(),
      manager_id: managerId,
      review_notes: reason || 'Rejected by manager'
    });

    res.json({ message: 'Disease change rejected successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to reject submission', error });
  }
};

// GET /manager/role-requests
export const getRoleRequests = async (req, res) => {
  try {
    const db = (await import('../models/index.js')).default;
    const requests = await db.RoleChangeRequest.findAll({
      where: { status: 'pending' },
      include: [{ model: db.User, attributes: ['username', 'role'] }],
      order: [['created_at', 'DESC']]
    });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch role change requests', error });
  }
};

// POST /manager/role-requests/:id/approve
export const approveRoleRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const managerId = req.user.id;
    const db = (await import('../models/index.js')).default;
    const request = await db.RoleChangeRequest.findByPk(id, { include: db.User });
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.status !== 'pending') return res.status(400).json({ message: 'Request is not pending' });
    // Update user role
    await request.User.update({ role: request.requested_role });
    await request.update({ status: 'approved', reviewed_at: new Date(), manager_id: managerId });
    res.json({ message: 'Role change approved and user updated.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to approve role change', error });
  }
};

// POST /manager/role-requests/:id/reject
export const rejectRoleRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const managerId = req.user.id;
    const db = (await import('../models/index.js')).default;
    const request = await db.RoleChangeRequest.findByPk(id);
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.status !== 'pending') return res.status(400).json({ message: 'Request is not pending' });
    await request.update({ status: 'rejected', reviewed_at: new Date(), manager_id: managerId, reason: reason || 'Rejected by manager' });
    res.json({ message: 'Role change request rejected.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to reject role change', error });
  }
};

// POST /manager/update-disease
export const updateDiseaseDirectly = async (req, res) => {
  try {
    const { diseaseId, name, symptoms, solution, questions, answers } = req.body;
    const managerId = req.user.id;

    if (!diseaseId || !name || !symptoms || !solution || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: "All fields are required including at least one question." });
    }

    // Check if disease exists
    const existingDisease = await db.Disease.findByPk(diseaseId);
    if (!existingDisease) {
      return res.status(404).json({ message: "Disease not found." });
    }

    // Check if new name conflicts with existing diseases (excluding the current one)
    const nameConflict = await db.Disease.findOne({ 
      where: { 
        name: name.trim(),
        id: { [db.Sequelize.Op.ne]: diseaseId }
      }
    });
    if (nameConflict) {
      return res.status(400).json({ message: "A disease with this name already exists. Please choose a different name." });
    }

    // Update disease directly (managers have direct access)
    await existingDisease.update({
      name: name.trim(),
      symptoms: symptoms.trim(),
      solution: solution.trim()
    });

    // Remove existing questions and answers, then add new ones
    // First get existing questions to delete their answers
    const existingQuestions = await db.Question.findAll({
      where: { disease_id: diseaseId },
      include: [db.Answer]
    });
    
    // Delete answers first
    for (const question of existingQuestions) {
      if (question.Answers) {
        await db.Answer.destroy({ where: { question_id: question.id } });
      }
    }
    
    // Then delete questions
    await db.Question.destroy({ where: { disease_id: diseaseId } });
    
    for (let i = 0; i < questions.length; i++) {
      const questionText = questions[i];
      const answerText = answers && answers[i] ? answers[i] : '';
      
      const question = await db.Question.create({
        disease_id: diseaseId,
        text: questionText,
        source: 'manual',
        input_type: 'choice'
      });
      
      // Create answer if provided
      if (answerText && answerText.trim() !== '') {
        await db.Answer.create({
          question_id: question.id,
          expected_text: answerText
        });
      }
    }

    res.status(200).json({ message: "Disease updated successfully." });
  } catch (err) {
    console.error("Error in updateDiseaseDirectly:", err);
    
    if (err.name === 'SequelizeValidationError') {
      return res.status(400).json({ message: "Validation error: " + err.message });
    }
    
    res.status(500).json({ message: "Failed to update disease. Please try again." });
  }
};

// GET /manager/diseases/:diseaseId/questions
export const getQuestionsForDisease = async (req, res) => {
  try {
    const { diseaseId } = req.params;
    const questions = await db.Question.findAll({
      where: { disease_id: diseaseId },
      include: [{
        model: db.Answer,
        attributes: ['expected_text']
      }],
      order: [['createdAt', 'ASC']]
    });
    
    // Transform the data to include answers
    const questionsWithAnswers = questions.map(question => ({
      id: question.id,
      text: question.text,
      disease_id: question.disease_id,
      source: question.source,
      input_type: question.input_type,
      createdAt: question.createdAt,
      updatedAt: question.updatedAt,
      answer: question.Answers && question.Answers.length > 0 ? question.Answers[0].expected_text : ''
    }));
    
    res.json(questionsWithAnswers);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch questions', error });
  }
};

// POST /manager/add-disease
export const addDiseaseAsManager = async (req, res) => {
  try {
    const { name, symptoms, solution, questions, answers } = req.body;
    const managerId = req.user.id;

    // Create the disease
    const disease = await db.Disease.create({
      name,
      symptoms,
      solution,
      created_by: managerId
    });

    // Create questions and answers for the disease
    if (questions && questions.length > 0) {
      for (let i = 0; i < questions.length; i++) {
        const questionText = questions[i];
        const answerText = answers && answers[i] ? answers[i] : '';
        const question = await db.Question.create({
          disease_id: disease.id,
          text: questionText,
          source: 'manual',
          input_type: 'choice'
        });
        // Create answer if provided
        if (answerText && answerText.trim() !== '') {
          await db.Answer.create({
            question_id: question.id,
            expected_text: answerText
          });
        }
      }
    }

    res.status(201).json({
      message: 'Disease added successfully',
      disease: {
        id: disease.id,
        name: disease.name,
        symptoms: disease.symptoms,
        solution: disease.solution
      }
    });
  } catch (error) {
    console.error('Error in addDiseaseAsManager:', error);
    res.status(500).json({ message: 'Failed to add disease', error: error.message });
  }
};

// GET /manager/users - Allow managers to get users for role management
export const getAllUsers = async (req, res) => {
  try {
    const users = await db.User.findAll({ 
      attributes: ['id', 'username', 'role'],
      order: [['username', 'ASC']]
    });
    res.status(200).json(users);
  } catch (err) {
    console.error("Error in getAllUsers:", err);
    res.status(500).json({ message: err.message });
  }
};
