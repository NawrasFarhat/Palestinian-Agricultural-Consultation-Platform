export default (sequelize, DataTypes) => {
  const Consultation = sequelize.define("Consultation", {
    farmer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    response: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('pending', 'diagnosed', 'completed'),
      defaultValue: 'pending',
      allowNull: false,
    }
  }, {
    tableName: "consultations",
    timestamps: true,
  });

  return Consultation;
}; 