export default (sequelize, DataTypes) => {
  const GeneralQuestion = sequelize.define('GeneralQuestion', {
    question_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    question_text: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    possible_answers: {
      type: DataTypes.TEXT, // "/" separated choices
      allowNull: true,
    }
  }, {
    tableName: 'general_questions',
    timestamps: false,
  });

  return GeneralQuestion;
};


