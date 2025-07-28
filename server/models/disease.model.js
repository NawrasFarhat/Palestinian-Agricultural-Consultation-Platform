// models/disease.model.js
/*
import db from '../config/db.config.js';

export const createDisease = async (name, symptoms, solution, createdBy) => {
  const [result] = await db.execute(
    'INSERT INTO diseases (name, symptoms, solution, created_by) VALUES (?, ?, ?, ?)',
    [name, symptoms, solution, createdBy]
  );
  return result.insertId;
};

export const getAllDiseases = async () => {
  const [rows] = await db.execute(
    'SELECT name, symptoms, solution FROM diseases ORDER BY created_at DESC'
  );
  return rows;
};

export const getAllDiseasesWithEngineers = async () => {
  const [rows] = await db.execute(`
    SELECT d.id, d.name, d.symptoms, d.solution, d.created_at, u.username AS engineer
    FROM diseases d
    JOIN users u ON d.created_by = u.id
  `);
  return rows;
};

export const getDiseaseById = async (id) => {
  const [rows] = await db.execute(
    'SELECT * FROM diseases WHERE id = ?',
    [id]
  );
  return rows[0];
};
*/
export default (sequelize, DataTypes) => {
  const Disease = sequelize.define("Disease", {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true, // لا يمكن تكرار نفس اسم المرض
    },
    symptoms: {
      type: DataTypes.TEXT,
      allowNull: false, // وصف الأعراض مطلوب
    },
    solution: {
      type: DataTypes.TEXT,
      allowNull: false, // العلاج أو التوصيات
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false, // معرف المهندس الذي أضاف المرض
    }
  }, {
    tableName: "diseases",
    timestamps: true,
  });

  return Disease;
};

