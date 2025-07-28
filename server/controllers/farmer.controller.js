import db from "../models/index.js";

export const farmerDashboard = (req, res) => {
  res.json({ message: `Welcome farmer ${req.user.username}!` });
};

export const getDiseases = async (req, res) => {
  try {
    const diseases = await db.Disease.findAll({
      attributes: ['name', 'symptoms', 'solution'],
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json(diseases);
  } catch (err) {
    console.error("Error in getDiseases:", err);
    res.status(500).json({ status: "error", message: err.message });
  }
};

export const submitSymptoms = async (req, res) => {
  try {
    const { description } = req.body;
    if (!description || description.trim().length < 10) {
      return res.status(400).json({ status: "error", message: "Please provide a valid description of symptoms." });
    }

    const user = await db.User.findOne({
      where: { username: req.user.username },
      attributes: ['id']
    });
    
    if (!user) {
      return res.status(404).json({ status: "error", message: "User not found." });
    }

    await db.Consultation.create({
      farmer_id: user.id,
      description,
      response: null,
      status: 'pending'
    });

    res.status(201).json({ status: "success", message: "Symptoms received and pending diagnosis." });
  } catch (err) {
    console.error("Error in submitSymptoms:", err);
    res.status(500).json({ status: "error", message: err.message });
  }
};

export const getMyDiagnoses = async (req, res) => {
  try {
    const userId = req.user.id;
    const diagnoses = await db.DiagnosisHistory.findAll({
      where: { user_id: userId },
      include: [
        { model: db.Disease, attributes: ['name'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    // Format response
    const result = diagnoses.map(d => ({
      id: d.id,
      diseaseName: d.Disease?.name || '',
      date: d.createdAt,
      result: d.result || ''
    }));
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch diagnosis history', error });
  }
};

export const submitAnswers = async (req, res) => {
  try {
    const { answers } = req.body;

    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ status: "error", message: "Answers must be a non-empty array." });
    }

    const user = await db.User.findOne({
      where: { username: req.user.username },
      attributes: ['id']
    });
    
    if (!user) {
      return res.status(404).json({ status: "error", message: "User not found." });
    }

    for (const item of answers) {
      const { question_id, answer } = item;

      if (!question_id || !answer) continue;

      await db.FarmerAnswer.create({
        question_id,
        farmer_id: user.id,
        answer
      });
    }

    res.status(201).json({ status: "success", message: "Answers saved successfully!" });
  } catch (err) {
    console.error("Error in submitAnswers:", err);
    res.status(500).json({ status: "error", message: err.message });
  }
};

export const autoDiagnose = async (req, res) => {
  try {
    const user = await db.User.findOne({
      where: { username: req.user.username },
      attributes: ['id']
    });
    
    if (!user) {
      return res.status(404).json({ status: "error", message: "User not found." });
    }

    const farmerAnswers = await db.FarmerAnswer.findAll({
      where: { farmer_id: user.id },
      include: [
        {
          model: db.Question,
          attributes: ['disease_id']
        }
      ]
    });

    if (farmerAnswers.length === 0) {
      return res.status(400).json({ status: "error", message: "No answers found for this farmer." });
    }

    const matchCount = {};
    for (const answer of farmerAnswers) {
      const diseaseId = answer.Question.disease_id;
      matchCount[diseaseId] = (matchCount[diseaseId] || 0) + 1;
    }

    let maxDiseaseId = null;
    let maxMatches = 0;

    for (const [diseaseId, count] of Object.entries(matchCount)) {
      if (count > maxMatches) {
        maxMatches = count;
        maxDiseaseId = diseaseId;
      }
    }

    if (!maxDiseaseId) return res.status(400).json({ status: "error", message: "Diagnosis failed." });

    const disease = await db.Disease.findByPk(maxDiseaseId, {
      attributes: ['name', 'solution']
    });

    if (!disease) {
      return res.status(404).json({ status: "error", message: "Disease not found." });
    }

    const diagnosisResult = `تم التشخيص: ${disease.name} — العلاج المقترح: ${disease.solution}`;

    // Update the latest consultation for this farmer
    const latestConsultation = await db.Consultation.findOne({
      where: { farmer_id: user.id },
      order: [['createdAt', 'DESC']]
    });

    if (latestConsultation) {
      await latestConsultation.update({
        response: diagnosisResult,
        status: 'diagnosed'
      });
    }

    res.status(200).json({ status: "success", message: "Diagnosis complete", diagnosis: diagnosisResult });
  } catch (err) {
    console.error("Error in autoDiagnose:", err);
    res.status(500).json({ status: "error", message: err.message });
  }
};

// POST /farmer/feedback
export const submitFeedback = async (req, res) => {
  try {
    const userId = req.user.id;
    const { message } = req.body;
    if (!message || message.trim().length < 5) {
      return res.status(400).json({ message: 'Feedback message is too short.' });
    }
    await db.Feedback.create({ user_id: userId, message });
    res.status(201).json({ message: 'Feedback submitted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to submit feedback', error });
  }
};

// POST /farmer/support
export const submitSupportRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    const { subject, message } = req.body;
    if (!subject || subject.trim().length < 3) {
      return res.status(400).json({ message: 'Subject is too short.' });
    }
    if (!message || message.trim().length < 5) {
      return res.status(400).json({ message: 'Message is too short.' });
    }
    await db.SupportRequest.create({ user_id: userId, subject, message });
    res.status(201).json({ message: 'Support request submitted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to submit support request', error });
  }
};

