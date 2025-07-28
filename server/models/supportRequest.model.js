// models/support.model.js
/*
import db from '../config/db.config.js';

export const submitSupportRequest = async (userId, message) => {
  await db.execute(
    'INSERT INTO support_requests (user_id, message) VALUES (?, ?)',
    [userId, message]
  );
};

export const getAllSupportRequests = async () => {
  const [rows] = await db.execute(
    'SELECT s.id, s.message, s.created_at, u.username FROM support_requests s JOIN users u ON s.user_id = u.id ORDER BY s.created_at DESC'
  );
  return rows;
};

export const deleteSupportRequest = async (id) => {
  await db.execute('DELETE FROM support_requests WHERE id = ?', [id]);
};
*/
export default (sequelize, DataTypes) => {
  const SupportRequest = sequelize.define("SupportRequest", {
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false, // المستخدم الذي قدم طلب الدعم
    },
    subject: {
      type: DataTypes.STRING,
      allowNull: false, // عنوان الطلب أو فئة المشكلة
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false, // التفاصيل الكاملة للمشكلة
    },
    status: {
      type: DataTypes.ENUM("open", "in_progress", "resolved"),
      defaultValue: "open", // الحالة الحالية للطلب
    }
  }, {
    tableName: "support_requests",
    timestamps: true,
  });

  return SupportRequest;
};

