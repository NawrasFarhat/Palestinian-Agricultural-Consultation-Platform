export default (sequelize, DataTypes) => {
  const DiagnosisAnswer = sequelize.define("DiagnosisAnswer", {
    diagnosis_id: {
      type: DataTypes.INTEGER,
      allowNull: false, // مرتبط بمحاولة التشخيص (DiagnosisHistory)
    },
    question_id: {
      type: DataTypes.INTEGER,
      allowNull: false, // السؤال الذي أجاب عليه المزارع
    },
    answer_text: {
      type: DataTypes.TEXT,
      allowNull: false, // إجابة المزارع الفعلية
    }
  }, {
    tableName: "diagnosis_answers",
    timestamps: true, // لتخزين تاريخ الإدخال
  });

  return DiagnosisAnswer;
};
