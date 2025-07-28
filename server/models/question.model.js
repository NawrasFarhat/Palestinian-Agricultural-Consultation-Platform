// models/question.model.js
/*
import db from '../config/db.config.js';

export const addQuestion = async (diseaseId, questionText) => {
  await db.execute(
    'INSERT INTO questions (disease_id, question_text) VALUES (?, ?)',
    [diseaseId, questionText]
  );
};

export const getQuestionsByDiseaseId = async (diseaseId) => {
  const [rows] = await db.execute(
    'SELECT id, question_text FROM questions WHERE disease_id = ?',
    [diseaseId]
  );
  return rows;
};
*/
export default (sequelize, DataTypes) => {
  const Question = sequelize.define("Question", {
    text: {
      type: DataTypes.STRING,
      allowNull: false, // نص السؤال نفسه
    },
    disease_id: {
      type: DataTypes.INTEGER,
      allowNull: false, // مرتبط بمرض معين
    },
    source: {
      type: DataTypes.ENUM("manual", "ai"),
      allowNull: false,
      defaultValue: "manual", // يوضح مصدر السؤال: يدوي أم من الذكاء الاصطناعي
    },
    input_type: {
      type: DataTypes.ENUM("text", "choice"),
      allowNull: false,
      defaultValue: "choice", // يحدد إذا كان السؤال إجابته اختيار أو نص مفتوح
    }
  }, {
    tableName: "questions",
    timestamps: true,
  });

  return Question;
};

