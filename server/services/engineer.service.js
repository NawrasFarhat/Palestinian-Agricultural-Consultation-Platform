// services/engineer.service.js
import db from "../models/index.js";

const getEngineerId = async (username) => {
  // const [rows] = await db.execute("SELECT id FROM users WHERE username = ?", [username]);
  // return rows[0]?.id;
  const user = await db.User.findOne({ where: { username }, attributes: ['id'] });
  return user?.id;
};

const addDisease = async (name, symptoms, solution, engineerId) => {
  // const [result] = await db.execute(
  //   "INSERT INTO diseases (name, symptoms, solution, created_by) VALUES (?, ?, ?, ?)",
  //   [name, symptoms, solution, engineerId]
  // );
  // return result.insertId;
  const disease = await db.Disease.create({ name, symptoms, solution, created_by: engineerId });
  return disease.id;
};

const addQuestions = async (diseaseId, questions) => {
  for (const question of questions) {
    // await db.execute(
    //   "INSERT INTO questions (disease_id, question_text) VALUES (?, ?)",
    //   [diseaseId, question]
    // );
    await db.Question.create({ 
      disease_id: diseaseId, 
      text: question,
      source: 'manual',  // Explicitly set the source
      input_type: 'choice'  // Explicitly set the input type
    });
  }
};

export default {
  getEngineerId,
  addDisease,
  addQuestions,
};

