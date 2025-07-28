export default (sequelize, DataTypes) => {
  const FarmerAnswer = sequelize.define("FarmerAnswer", {
    question_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    farmer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    answer: {
      type: DataTypes.TEXT,
      allowNull: false,
    }
  }, {
    tableName: "farmer_answers",
    timestamps: true,
  });

  return FarmerAnswer;
}; 