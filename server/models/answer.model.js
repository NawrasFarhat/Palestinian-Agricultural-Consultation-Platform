export default (sequelize, DataTypes) => {
  const Answer = sequelize.define("Answer", {
    question_id: {
      type: DataTypes.INTEGER,
      allowNull: false, // مرتبط بالسؤال
    },
    expected_text: {
      type: DataTypes.STRING,
      allowNull: false, // النص المتوقع كإجابة (مثل: "نعم", "لا", "أوراق")
    }
  }, {
    tableName: "answers",
    timestamps: true,
  });

  return Answer;
};
