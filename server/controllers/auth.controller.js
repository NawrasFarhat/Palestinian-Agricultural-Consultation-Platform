import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
  try {
    const { username, phone, password } = req.body;
    // Check for existing user by username or phone
    const existingUser = await req.db.User.findOne({ where: { [req.db.Sequelize.Op.or]: [{ username }, { phone }] } });
    if (existingUser) {
      return res.status(409).json({ message: 'Username or phone already exists.' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await req.db.User.create({ username, phone, password: hashedPassword, role: 'farmer' });
    const { password: _, ...userData } = user.toJSON();
    res.status(201).json({ message: 'Farmer registered successfully', user: userData });
  } catch (err) {
    console.error('Error in register:', err);
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ message: 'Username or phone already exists.' });
    }
    if (err.name === 'SequelizeValidationError') {
      return res.status(400).json({ message: err.errors.map(e => e.message).join(', ') });
    }
    res.status(500).json({ message: 'Failed to register user.' });
  }
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const user = await req.db.User.findOne({ where: { username } });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { 
        id: user.id,
        username: user.username, 
        role: user.role 
      },
      process.env.JWT_SECRET || "secret123",
      { expiresIn: "24h" }
    );

    return res.status(200).json({
      message: "Logged in successfully!",
      token: token,
      role: user.role,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });
  } catch (err) {
    console.error("Error in login:", err);
    return res.status(500).json({ message: err.message });
  }
};

// POST /auth/request-role-change
export const requestRoleChange = async (req, res) => {
  try {
    const userId = req.user.id;
    const { requested_role } = req.body;
    const allowedRoles = ['farmer', 'engineer', 'manager', 'it'];
    if (!allowedRoles.includes(requested_role)) {
      return res.status(400).json({ message: 'Invalid requested role.' });
    }
    // Only one pending request per user
    const existing = await req.db.RoleChangeRequest.findOne({ where: { user_id: userId, status: 'pending' } });
    if (existing) {
      return res.status(400).json({ message: 'You already have a pending role change request.' });
    }
    await req.db.RoleChangeRequest.create({ user_id: userId, requested_role });
    res.status(201).json({ message: 'Role change request submitted.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to submit role change request', error });
  }
};
