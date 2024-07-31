import jwt from "jsonwebtoken";

const verifyToken = (req, res, next) => {
  const token = req.body.token;

  if (!token) {
    return res.status(400).json({ error: 'Token is required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = decoded;
    next();
  });
};

export default verifyToken;