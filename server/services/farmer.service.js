// services/farmer.service.js
import db from "../models/index.js";

const getFarmerId = async (username) => {
  // const [rows] = await db.execute("SELECT id FROM users WHERE username = ?", [username]);
  // return rows[0]?.id;
  const user = await db.User.findOne({ where: { username }, attributes: ['id'] });
  return user?.id;
};

const getAllDiseases = async () => {
  // const [rows] = await db.execute(
  //   "SELECT name, symptoms, solution FROM diseases ORDER BY created_at DESC"
  // );
  // return rows;
  return await db.Disease.findAll({
    attributes: ['name', 'symptoms', 'solution'],
    order: [['createdAt', 'DESC']]
  });
};

const submitManualDiagnosis = async (farmerId, description) => {
  // await db.execute(
  //   "INSERT INTO consultations (farmer_id, description, response) VALUES (?, ?, ?)",
  //   [farmerId, description, null]
  // );
  await db.Consultation.create({ farmer_id: farmerId, description, response: null, status: 'pending' });
};

const getFarmerDiagnoses = async (farmerId) => {
  // const [rows] = await db.execute(
  //   "SELECT description, response, created_at FROM consultations WHERE farmer_id = ? ORDER BY created_at DESC",
  //   [farmerId]
  // );
  // return rows;
  return await db.Consultation.findAll({
    where: { farmer_id: farmerId },
    attributes: ['description', 'response', 'createdAt'],
    order: [['createdAt', 'DESC']]
  });
};

const saveAnswers = async (farmerId, answers) => {
  for (const { question_id, answer } of answers) {
    if (!question_id || !answer) continue;
    // await db.execute(
    //   "INSERT INTO answers (question_id, farmer_id, answer) VALUES (?, ?, ?)",
    //   [question_id, farmerId, answer]
    // );
    await db.FarmerAnswer.create({ question_id, farmer_id: farmerId, answer });
  }
};

const getFarmerAnswers = async (farmerId) => {
  // const [answers] = await db.execute(
  //   `SELECT a.question_id, a.answer, q.disease_id
  //    FROM answers a
  //    JOIN questions q ON a.question_id = q.id
  //    WHERE a.farmer_id = ?`,
  //   [farmerId]
  // );
  // return answers;
  return await db.FarmerAnswer.findAll({
    where: { farmer_id: farmerId },
    include: [{ model: db.Question, attributes: ['disease_id'] }]
  });
};

const getDiseaseInfo = async (diseaseId) => {
  // const [info] = await db.execute(
  //   "SELECT name, solution FROM diseases WHERE id = ?",
  //   [diseaseId]
  // );
  // return info[0];
  return await db.Disease.findByPk(diseaseId, { attributes: ['name', 'solution'] });
};

const updateLastConsultation = async (farmerId, response) => {
  // await db.execute(
  //   "UPDATE consultations SET response = ? WHERE farmer_id = ? ORDER BY created_at DESC LIMIT 1",
  //   [response, farmerId]
  // );
  const latestConsultation = await db.Consultation.findOne({
    where: { farmer_id: farmerId },
    order: [['createdAt', 'DESC']]
  });
  if (latestConsultation) {
    await latestConsultation.update({ response, status: 'diagnosed' });
  }
};

export default {
  getFarmerId,
  getAllDiseases,
  submitManualDiagnosis,
  getFarmerDiagnoses,
  saveAnswers,
  getFarmerAnswers,
  getDiseaseInfo,
  updateLastConsultation,
};

