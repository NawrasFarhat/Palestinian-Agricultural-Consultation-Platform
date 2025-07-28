// services/auth.service.js
import db from "../models/index.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const findUserByUsername = async (username) => {
  // const [rows] = await db.execute("SELECT * FROM users WHERE username = ?", [username]);
  // return rows[0];
  return await db.User.findOne({ where: { username } });
};

const registerUser = async ({ username, password, role }) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  // await db.execute(
  //   "INSERT INTO users (username, password, role) VALUES (?, ?, ?)",
  //   [username, hashedPassword, role]
  // );
  await db.User.create({ username, password: hashedPassword, role });
};

const generateToken = (user) => {
  return jwt.sign(
    { username: user.username, role: user.role },
    process.env.JWT_SECRET || "secret123",
    { expiresIn: "24h" }
  );
};

const comparePassword = async (plain, hashed) => {
  return bcrypt.compare(plain, hashed);
};

export default {
  findUserByUsername,
  registerUser,
  generateToken,
  comparePassword,
};

