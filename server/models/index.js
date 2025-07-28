/*
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("senior", "root", "", {
  host: "localhost",
  dialect: "mysql",
});

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.Disease = require("./Disease")(sequelize, Sequelize.DataTypes);
module.exports = db;
*/

import { Sequelize, DataTypes } from 'sequelize';
import sequelize from '../db.js';

// تعريف الكائن الرئيسي
const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// تحميل الموديلات
db.User = (await import('./user.model.js')).default(sequelize, DataTypes);
db.Disease = (await import('./disease.model.js')).default(sequelize, DataTypes);
db.Question = (await import('./question.model.js')).default(sequelize, DataTypes);
db.Answer = (await import('./answer.model.js')).default(sequelize, DataTypes);
db.DiagnosisHistory = (await import('./diagnosisHistory.model.js')).default(sequelize, DataTypes);
db.DiagnosisAnswer = (await import('./diagnosisAnswer.model.js')).default(sequelize, DataTypes);
db.Feedback = (await import('./feedback.model.js')).default(sequelize, DataTypes);
db.SupportRequest = (await import('./supportRequest.model.js')).default(sequelize, DataTypes);
db.Log = (await import('./log.model.js')).default(sequelize, DataTypes);
db.PendingChange = (await import('./pendingChange.model.js')).default(sequelize, DataTypes);
db.RoleChangeRequest = (await import('./roleChangeRequest.model.js')).default(sequelize, DataTypes);
db.Consultation = (await import('./consultation.model.js')).default(sequelize, DataTypes);
db.FarmerAnswer = (await import('./farmerAnswer.model.js')).default(sequelize, DataTypes);
db.GeneralQuestion = (await import('./general_questions.js')).default(sequelize, DataTypes);
db.SkipRule = (await import('./skip_rules.js')).default(sequelize, DataTypes);

// العلاقات بين الجداول

// User ↔️ Disease
db.User.hasMany(db.Disease, { foreignKey: 'created_by' });
db.Disease.belongsTo(db.User, { foreignKey: 'created_by' });

// Disease ↔️ Question
db.Disease.hasMany(db.Question, { foreignKey: 'disease_id' });
db.Question.belongsTo(db.Disease, { foreignKey: 'disease_id' });

// Question ↔️ Answer (expected answers)
db.Question.hasMany(db.Answer, { foreignKey: 'question_id' });
db.Answer.belongsTo(db.Question, { foreignKey: 'question_id' });

// User ↔️ Consultation
db.User.hasMany(db.Consultation, { foreignKey: 'farmer_id' });
db.Consultation.belongsTo(db.User, { foreignKey: 'farmer_id' });

// User ↔️ FarmerAnswer
db.User.hasMany(db.FarmerAnswer, { foreignKey: 'farmer_id' });
db.FarmerAnswer.belongsTo(db.User, { foreignKey: 'farmer_id' });

// Question ↔️ FarmerAnswer
db.Question.hasMany(db.FarmerAnswer, { foreignKey: 'question_id' });
db.FarmerAnswer.belongsTo(db.Question, { foreignKey: 'question_id' });

// User ↔️ DiagnosisHistory
db.User.hasMany(db.DiagnosisHistory, { foreignKey: 'user_id' });
db.DiagnosisHistory.belongsTo(db.User, { foreignKey: 'user_id' });

// Disease ↔️ DiagnosisHistory
db.Disease.hasMany(db.DiagnosisHistory, { foreignKey: 'disease_id' });
db.DiagnosisHistory.belongsTo(db.Disease, { foreignKey: 'disease_id' });

// DiagnosisHistory ↔️ DiagnosisAnswer
db.DiagnosisHistory.hasMany(db.DiagnosisAnswer, { foreignKey: 'diagnosis_id' });
db.DiagnosisAnswer.belongsTo(db.DiagnosisHistory, { foreignKey: 'diagnosis_id' });

// Question ↔️ DiagnosisAnswer
db.Question.hasMany(db.DiagnosisAnswer, { foreignKey: 'question_id' });
db.DiagnosisAnswer.belongsTo(db.Question, { foreignKey: 'question_id' });

// User ↔️ Feedback
db.User.hasMany(db.Feedback, { foreignKey: 'user_id' });
db.Feedback.belongsTo(db.User, { foreignKey: 'user_id' });

// User ↔️ SupportRequest
db.User.hasMany(db.SupportRequest, { foreignKey: 'user_id' });
db.SupportRequest.belongsTo(db.User, { foreignKey: 'user_id' });

// User ↔️ Log
db.User.hasMany(db.Log, { foreignKey: 'user_id' });
db.Log.belongsTo(db.User, { foreignKey: 'user_id' });

// A PendingChange belongs to a Disease and a User (engineer)
db.PendingChange.belongsTo(db.Disease, { foreignKey: 'disease_id' });
db.PendingChange.belongsTo(db.User, { foreignKey: 'engineer_id', as: 'Engineer' });

// RoleChangeRequest belongs to a User
db.RoleChangeRequest.belongsTo(db.User, { foreignKey: 'user_id' });

export default db;
