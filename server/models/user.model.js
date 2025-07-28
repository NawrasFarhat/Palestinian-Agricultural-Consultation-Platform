// models/user.model.js
/*
import db from '../config/db.config.js';

export const createUser = async (username, hashedPassword, role) => {
  await db.execute(
    'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
    [username, hashedPassword, role]
  );
};

export const getUserByUsername = async (username) => {
  const [rows] = await db.execute(
    'SELECT * FROM users WHERE username = ?',
    [username]
  );
  return rows[0];
};

export const getUserById = async (id) => {
  const [rows] = await db.execute(
    'SELECT id, username, role FROM users WHERE id = ?',
    [id]
  );
  return rows[0];
};

export const getAllUsers = async () => {
  const [rows] = await db.execute(
    'SELECT id, username, role FROM users'
  );
  return rows;
};

export const updateUserRole = async (id, newRole) => {
  await db.execute(
    'UPDATE users SET role = ? WHERE id = ?',
    [newRole, id]
  );
};

export const deleteUserById = async (id) => {
  await db.execute(
    'DELETE FROM users WHERE id = ?',
    [id]
  );
};
*/

export default (sequelize, DataTypes) => {
  const User = sequelize.define("User", {
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true, // إجباري فقط للفلاح
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM("farmer", "engineer", "manager", "it"),
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  }, {
    tableName: "users",
    timestamps: true,
  });

  return User;
};
