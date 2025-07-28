import db from '../models/index.js';
import { Sequelize } from 'sequelize';

export const engineerDashboard = (req, res) => {
  res.json({ message: `Welcome engineer ${req.user.username}!` });
};

export const addDiseaseWithQuestions = async (req, res) => {
  console.log('🔍 [DEBUG] addDiseaseWithQuestions - Function started');
  console.log('🔍 [DEBUG] addDiseaseWithQuestions - req.user:', JSON.stringify(req.user, null, 2));
  console.log('🔍 [DEBUG] addDiseaseWithQuestions - req.body:', JSON.stringify(req.body, null, 2));
  
  try {
    console.log('🔍 [DEBUG] addDiseaseWithQuestions - Starting request body destructuring');
    const { name, symptoms, solution, questions, answers } = req.body;
    console.log('🔍 [DEBUG] addDiseaseWithQuestions - Destructured values:', {
      name: name,
      symptoms: symptoms,
      solution: solution,
      questionsLength: questions ? questions.length : 'undefined',
      answersLength: answers ? answers.length : 'undefined'
    });

    console.log('🔍 [DEBUG] addDiseaseWithQuestions - Starting validation checks');
    if (!name || !symptoms || !solution || !Array.isArray(questions) || questions.length === 0) {
      console.log('🔍 [DEBUG] addDiseaseWithQuestions - Validation failed, returning 400');
      return res.status(400).json({ message: "All fields are required including at least one question." });
    }
    console.log('🔍 [DEBUG] addDiseaseWithQuestions - Validation passed');

    console.log('🔍 [DEBUG] addDiseaseWithQuestions - Starting User.findOne query');
    console.log('🔍 [DEBUG] addDiseaseWithQuestions - Searching for username:', req.user.username);
    const engineer = await db.User.findOne({ where: { username: req.user.username }, attributes: ['id'] });
    console.log('🔍 [DEBUG] addDiseaseWithQuestions - User.findOne result:', JSON.stringify(engineer, null, 2));
    
    if (!engineer) {
      console.log('🔍 [DEBUG] addDiseaseWithQuestions - Engineer not found, returning 404');
      return res.status(404).json({ message: "Engineer not found." });
    }
    const engineerId = engineer.id;
    console.log('🔍 [DEBUG] addDiseaseWithQuestions - Engineer ID:', engineerId);

    console.log('🔍 [DEBUG] addDiseaseWithQuestions - Starting Disease.findOne query');
    console.log('🔍 [DEBUG] addDiseaseWithQuestions - Searching for disease name:', name.trim());
    // Check if disease name already exists
    const existingDisease = await db.Disease.findOne({ where: { name: name.trim() } });
    console.log('🔍 [DEBUG] addDiseaseWithQuestions - Disease.findOne result:', JSON.stringify(existingDisease, null, 2));
    
    if (existingDisease) {
      console.log('🔍 [DEBUG] addDiseaseWithQuestions - Disease already exists, returning 400');
      return res.status(400).json({ message: "A disease with this name already exists. Please choose a different name." });
    }
    console.log('🔍 [DEBUG] addDiseaseWithQuestions - Disease name is unique');

    console.log('🔍 [DEBUG] addDiseaseWithQuestions - Creating diseaseData object');
    // Create pending change request instead of directly creating the disease
    const diseaseData = {
      name: name.trim(),
      symptoms: symptoms.trim(),
      solution: solution.trim(),
      questions: questions,
      answers: answers
    };
    console.log('🔍 [DEBUG] addDiseaseWithQuestions - diseaseData created:', JSON.stringify(diseaseData, null, 2));

    console.log('🔍 [DEBUG] addDiseaseWithQuestions - Starting PendingChange.create');
    console.log('🔍 [DEBUG] addDiseaseWithQuestions - PendingChange.create parameters:', {
      engineer_id: engineerId,
      change_type: 'disease_add',
      disease_data: diseaseData,
      status: 'pending',
      submitted_at: new Date()
    });
    
    const pendingChange = await db.PendingChange.create({
      engineer_id: engineerId,
      change_type: 'disease_add',
      disease_data: diseaseData,
      status: 'pending',
      submitted_at: new Date()
    });
    console.log('🔍 [DEBUG] addDiseaseWithQuestions - PendingChange.create successful:', JSON.stringify(pendingChange, null, 2));

    console.log('🔍 [DEBUG] addDiseaseWithQuestions - Sending success response');
    res.status(201).json({ message: "Disease and questions submitted for approval. A manager will review your request." });
  } catch (err) {
    console.error('❌ [ERROR] addDiseaseWithQuestions - Caught exception:', err);
    console.error('❌ [ERROR] addDiseaseWithQuestions - Error name:', err.name);
    console.error('❌ [ERROR] addDiseaseWithQuestions - Error message:', err.message);
    console.error('❌ [ERROR] addDiseaseWithQuestions - Error stack:', err.stack);
    
    // Handle specific database errors
    if (err.name === 'SequelizeUniqueConstraintError') {
      console.log('🔍 [DEBUG] addDiseaseWithQuestions - Handling SequelizeUniqueConstraintError');
      return res.status(400).json({ message: "A disease with this name already exists. Please choose a different name." });
    }
    
    if (err.name === 'SequelizeForeignKeyConstraintError') {
      console.log('🔍 [DEBUG] addDiseaseWithQuestions - Handling SequelizeForeignKeyConstraintError');
      return res.status(400).json({ message: "Invalid user reference. Please try logging in again." });
    }
    
    if (err.name === 'SequelizeValidationError') {
      console.log('🔍 [DEBUG] addDiseaseWithQuestions - Handling SequelizeValidationError');
      return res.status(400).json({ message: "Validation error: " + err.message });
    }
    
    console.log('🔍 [DEBUG] addDiseaseWithQuestions - No specific error handler matched, sending generic 500');
    // Generic error response
    res.status(500).json({ message: "Failed to submit disease for approval. Please try again." });
  }
};

// GET /engineer/diseases/:diseaseId/questions
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

// POST /engineer/diseases/:diseaseId/questions
export const addQuestionToDisease = async (req, res) => {
  try {
    const { diseaseId } = req.params;
    const { text, answer } = req.body;
    if (!text || text.trim().length < 3) {
      return res.status(400).json({ message: 'Question text is too short.' });
    }
    const question = await db.Question.create({ 
      disease_id: diseaseId, 
      text,
      source: 'manual',  // Explicitly set the source
      input_type: 'choice'  // Explicitly set the input type
    });
    
    // Create answer if provided
    if (answer && answer.trim() !== '') {
      await db.Answer.create({
        question_id: question.id,
        expected_text: answer.trim()
      });
    }
    
    res.status(201).json(question);
  } catch (error) {
    res.status(500).json({ message: 'Failed to add question', error });
  }
};

// PUT /engineer/questions/:questionId
export const updateQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;
    const { text, answer } = req.body;
    if (!text || text.trim().length < 3) {
      return res.status(400).json({ message: 'Question text is too short.' });
    }
    const question = await db.Question.findByPk(questionId);
    if (!question) return res.status(404).json({ message: 'Question not found' });
    await question.update({ text });
    
    // Handle answer update
    const existingAnswer = await db.Answer.findOne({ where: { question_id: questionId } });
    
    if (answer && answer.trim() !== '') {
      if (existingAnswer) {
        // Update existing answer
        await existingAnswer.update({ expected_text: answer.trim() });
      } else {
        // Create new answer
        await db.Answer.create({
          question_id: questionId,
          expected_text: answer.trim()
        });
      }
    } else if (existingAnswer) {
      // Remove answer if empty
      await existingAnswer.destroy();
    }
    
    res.json(question);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update question', error });
  }
};

// DELETE /engineer/questions/:questionId
export const deleteQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;
    const question = await db.Question.findByPk(questionId);
    if (!question) return res.status(404).json({ message: 'Question not found' });
    await question.destroy();
    res.json({ message: 'Question deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete question', error });
  }
};

// POST /engineer/submit-change
export const submitChange = async (req, res) => {
  try {
    const { diseaseId } = req.body;
    const engineerId = req.user.id;
    if (!diseaseId) {
      return res.status(400).json({ message: 'diseaseId is required.' });
    }
    // Check for existing pending submission
    const existing = await db.PendingChange.findOne({
      where: { disease_id: diseaseId, engineer_id: engineerId, status: 'pending' }
    });
    if (existing) {
      return res.status(400).json({ message: 'A pending submission already exists for this disease.' });
    }
    await db.PendingChange.create({
      disease_id: diseaseId,
      engineer_id: engineerId,
      status: 'pending',
      submitted_at: new Date()
    });
    res.status(201).json({ message: 'Submission sent for approval.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to submit for approval', error });
  }
};

// POST /engineer/submit-disease-edit
export const submitDiseaseEdit = async (req, res) => {
  try {
    const { diseaseId, name, symptoms, solution, questions, answers } = req.body;
    const engineerId = req.user.id;

    if (!diseaseId || !name || !symptoms || !solution) {
      return res.status(400).json({ message: "Disease ID, name, symptoms, and solution are required." });
    }

    // Check if disease exists
    const existingDisease = await db.Disease.findByPk(diseaseId);
    if (!existingDisease) {
      return res.status(404).json({ message: "Disease not found." });
    }

    // Check for existing pending submission for this disease
    const existingPending = await db.PendingChange.findOne({
      where: { disease_id: diseaseId, status: 'pending' }
    });
    if (existingPending) {
      return res.status(400).json({ message: "A pending submission already exists for this disease." });
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

    // Handle questions and answers for disease editing
    let finalQuestions = [];
    let finalAnswers = [];
    
    // If questions are provided in the request, use them
    if (questions && Array.isArray(questions) && questions.length > 0) {
      finalQuestions = questions;
      finalAnswers = answers && Array.isArray(answers) ? answers : [];
    } else {
      // If no questions provided, load existing questions and answers from the database
      const existingQuestions = await db.Question.findAll({
        where: { disease_id: diseaseId },
        include: [{
          model: db.Answer,
          attributes: ['expected_text']
        }],
        order: [['createdAt', 'ASC']]
      });
      finalQuestions = existingQuestions.map(q => q.text);
      finalAnswers = existingQuestions.map(q => q.Answers && q.Answers.length > 0 ? q.Answers[0].expected_text : '');
    }

    // For disease editing, we don't require questions to be present
    // The disease can be edited without changing its questions

    // Create pending change request
    const diseaseData = {
      name: name.trim(),
      symptoms: symptoms.trim(),
      solution: solution.trim(),
      questions: finalQuestions,
      answers: finalAnswers
    };

    await db.PendingChange.create({
      disease_id: diseaseId,
      engineer_id: engineerId,
      change_type: 'disease_edit',
      disease_data: diseaseData,
      status: 'pending',
      submitted_at: new Date()
    });

    res.status(201).json({ message: "Disease edit submitted for approval. A manager will review your request." });
  } catch (err) {
    console.error("Error in submitDiseaseEdit:", err);
    
    if (err.name === 'SequelizeValidationError') {
      return res.status(400).json({ message: "Validation error: " + err.message });
    }
    
    res.status(500).json({ message: "Failed to submit disease edit for approval. Please try again." });
  }
};
