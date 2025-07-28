// models/feedback.model.js
/*
import db from '../config/db.config.js';

export const addFeedback = async (farmerId, feedbackText) => {
  await db.execute(
    'INSERT INTO feedback (farmer_id, feedback_text) VALUES (?, ?)',
    [farmerId, feedbackText]
  );
};

export const getAllFeedback = async () => {
  const [rows] = await db.execute(
    'SELECT f.id, f.feedback_text, f.created_at, u.username AS farmer FROM feedback f JOIN users u ON f.farmer_id = u.id ORDER BY f.created_at DESC'
  );
  return rows;
};
*/
export default (sequelize, DataTypes) => {
  const Feedback = sequelize.define("Feedback", {
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false, // المستخدم الذي أرسل الملاحظة
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false, // نص الملاحظة أو التعليق
    }
  }, {
    tableName: "feedback",
    timestamps: true, // createdAt و updatedAt تلقائيًا
  });

  return Feedback;
};

