export default (sequelize, DataTypes) => {
  const SkipRule = sequelize.define('SkipRule', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    parent_question_text: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    trigger_answer: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    skip_child_text: {
      type: DataTypes.TEXT,
      allowNull: false,
    }
  }, {
    tableName: 'skip_rules',
    timestamps: false,
  });

  return SkipRule;
};

