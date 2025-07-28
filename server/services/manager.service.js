// services/manager.service.js
import db from "../models/index.js";

const changeUserRole = async (username, newRole) => {
  // const [userRows] = await db.execute("SELECT id FROM users WHERE username = ?", [username]);
  // if (userRows.length === 0) {
  //   throw new Error("User not found.");
  // }
  const user = await db.User.findOne({ where: { username } });
  if (!user) {
    throw new Error("User not found.");
  }
  // await db.execute("UPDATE users SET role = ? WHERE username = ?", [newRole, username]);
  await user.update({ role: newRole });
};

const getAllDiseases = async () => {
  // const [rows] = await db.execute(`
  //   SELECT d.id, d.name, d.symptoms, d.solution, d.created_at, u.username AS engineer
  //   FROM diseases d
  //   JOIN users u ON d.created_by = u.id
  // `);
  // return rows;
  const diseases = await db.Disease.findAll({
    include: [{ model: db.User, attributes: ['username'], as: 'User' }],
    order: [['createdAt', 'DESC']]
  });
  return diseases.map(d => ({
    id: d.id,
    name: d.name,
    symptoms: d.symptoms,
    solution: d.solution,
    created_at: d.createdAt,
    engineer: d.User?.username || ''
  }));
};

export default {
  changeUserRole,
  getAllDiseases,
};

