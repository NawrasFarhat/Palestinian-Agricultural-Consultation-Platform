export default (sequelize, DataTypes) => {
  const PendingChange = sequelize.define('PendingChange', {
    disease_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    engineer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    change_type: {
      type: DataTypes.ENUM('disease_add', 'disease_edit'),
      allowNull: false,
    },
    disease_data: {
      type: DataTypes.JSON,
      allowNull: false,
      comment: 'Stores the disease data (name, symptoms, solution, questions)',
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      defaultValue: 'pending',
      allowNull: false,
    },
    submitted_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    reviewed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    manager_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    review_notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    tableName: 'pending_changes',
    timestamps: false,
  });
  return PendingChange;
}; 