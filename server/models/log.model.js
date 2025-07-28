// models/log.model.js
/*
import db from '../config/db.config.js';

export const addLog = async (userId, action, details = null) => {
  await db.execute(
    'INSERT INTO logs (user_id, action, details) VALUES (?, ?, ?)',
    [userId, action, details]
  );
};

export const getLogs = async () => {
  const [rows] = await db.execute(
    'SELECT l.id, l.action, l.details, l.created_at, u.username FROM logs l JOIN users u ON l.user_id = u.id ORDER BY l.created_at DESC'
  );
  return rows;
};
*/
export default (sequelize, DataTypes) => {
  const Log = sequelize.define("Log", {
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false, // المستخدم الذي قام بالنشاط
    },
    action: {
      type: DataTypes.STRING,
      allowNull: false, // وصف النشاط (مثل: "تسجيل الدخول", "إضافة مرض", "تعديل سؤال")
    },
    metadata: {
      type: DataTypes.TEXT,
      allowNull: true, // معلومات إضافية (مثل ID العنصر المعدل)
    }
  }, {
    tableName: "logs",
    timestamps: true, // يتضمن createdAt تلقائيًا لتحديد وقت الحدث
  });

  return Log;
};

