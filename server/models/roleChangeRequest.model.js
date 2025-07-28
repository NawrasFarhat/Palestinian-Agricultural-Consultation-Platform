export default (sequelize, DataTypes) => {
  const RoleChangeRequest = sequelize.define('RoleChangeRequest', {
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    requested_role: {
      type: DataTypes.ENUM('farmer', 'engineer', 'manager', 'it'),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      defaultValue: 'pending',
      allowNull: false,
    },
    created_at: {
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
    reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    tableName: 'role_change_requests',
    timestamps: false,
  });
  return RoleChangeRequest;
}; 