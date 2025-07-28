import jwt from "jsonwebtoken";

export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];

  console.log('Auth middleware - Auth header:', authHeader);
  console.log('Auth middleware - Token:', token);

  if (!token) return res.status(401).json({ status: "error", message: "Access denied" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret123");
    console.log('Auth middleware - Decoded token:', decoded);
    req.user = decoded;
    next();
  } catch (err) {
    console.log('Auth middleware - Token verification failed:', err.message);
    return res.status(403).json({ status: "error", message: "Invalid token" });
  }
}

