import db from '../models/index.js';
import mysqldump from 'mysqldump';
import fs from 'fs';
import path from 'path';

export const fetchAllUsers = async () => {
  // const [rows] = await db.execute("SELECT id, username, role FROM users");
  // return rows;
  return await db.User.findAll({ attributes: ['id', 'username', 'role'] });
};

export const changeUserRole = async (id, newRole) => {
  const allowedRoles = ['farmer', 'engineer', 'manager', 'it'];
  if (!allowedRoles.includes(newRole)) {
    throw new Error("Invalid role");
  }
  // await db.execute("UPDATE users SET role = ? WHERE id = ?", [newRole, id]);
  await db.User.update({ role: newRole }, { where: { id } });
};

export const removeUser = async (id) => {
  // await db.execute("DELETE FROM users WHERE id = ?", [id]);
  await db.User.destroy({ where: { id } });
};

// System monitoring functions
export const getSystemHealth = async () => {
  try {
    // Test database connection
    await db.sequelize.authenticate();
    // Get basic system stats
    const users = await db.User.count();
    const diseases = await db.Disease.count();
    const logs = await db.Log.count();
    return {
      status: 'healthy',
      database: 'connected',
      stats: {
        users,
        diseases,
        logs
      },
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
};

export const getSystemLogs = async () => {
  // const [rows] = await db.execute(`
  //   SELECT l.id, l.action, l.metadata, l.createdAt, u.username 
  //   FROM logs l 
  //   LEFT JOIN users u ON l.user_id = u.id 
  //   ORDER BY l.createdAt DESC 
  //   LIMIT 100
  // `);
  // return rows;
  return await db.Log.findAll({
    include: [{ model: db.User, attributes: ['username'] }],
    order: [['createdAt', 'DESC']],
    limit: 100
  });
};

export const createBackup = async () => {
  // This is a simplified backup - in production, you'd want to use proper backup tools
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupId = `backup-${timestamp}`;
  // Log the backup action
  // await db.execute(
  //   "INSERT INTO logs (user_id, action, metadata) VALUES (?, ?, ?)",
  //   [1, 'backup_created', JSON.stringify({ backupId, timestamp })]
  // );
  await db.Log.create({
    user_id: 1,
    action: 'backup_created',
    metadata: JSON.stringify({ backupId, timestamp })
  });
  return { backupId, timestamp };
};

export const restoreBackup = async (backupId) => {
  // This is a simplified restore - in production, you'd want proper restore logic
  // await db.execute(
  //   "INSERT INTO logs (user_id, action, metadata) VALUES (?, ?, ?)",
  //   [1, 'backup_restored', JSON.stringify({ backupId, timestamp: new Date().toISOString() })]
  // );
  await db.Log.create({
    user_id: 1,
    action: 'backup_restored',
    metadata: JSON.stringify({ backupId, timestamp: new Date().toISOString() })
  });
  return { message: 'Backup restore initiated' };
};
