// models/diagnosis.model.js
/*
import db from '../config/db.config.js';

export const createConsultation = async (farmerId, description) => {
  await db.execute(
    'INSERT INTO consultations (farmer_id, description, response) VALUES (?, ?, ?)',
    [farmerId, description, null]
  );
};

export const updateLatestDiagnosis = async (farmerId, response) => {
  await db.execute(
    'UPDATE consultations SET response = ? WHERE farmer_id = ? ORDER BY created_at DESC LIMIT 1',
    [response, farmerId]
  );
};

export const getDiagnosesByFarmerId = async (farmerId) => {
  const [rows] = await db.execute(
    'SELECT description, response, created_at FROM consultations WHERE farmer_id = ? ORDER BY created_at DESC',
    [farmerId]
  );
  return rows;
};
*/
export default (sequelize, DataTypes) => {
  const DiagnosisHistory = sequelize.define("DiagnosisHistory", {
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false, // المزارع الذي قام بمحاولة التشخيص
    },
    disease_id: {
      type: DataTypes.INTEGER,
      allowNull: true, // المرض المتوقع أو الذي تم تشخيصه (يمكن أن يبقى فارغًا إذا لم يُحدد)
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true, // وصف الأعراض المقدمة من المزارع
    },
    result: {
      type: DataTypes.TEXT,
      allowNull: true, // نتيجة التشخيص أو التوصيات
    },
    confidence: {
      type: DataTypes.FLOAT,
      allowNull: true, // مستوى الثقة في التشخيص (0-1)
    }
  }, {
    tableName: "diagnosis_history",
    timestamps: true, // Sequelize يضيف createdAt و updatedAt
  });

  return DiagnosisHistory;
};

