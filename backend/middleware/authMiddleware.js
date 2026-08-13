import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

export const protect = async (req, res, next) => {
  try {
    let token = req.cookies?.token;

    if (token && token.includes(';')) {
      token = token.split(';')[0].trim();
    }

    // Optional fallback for Bearer token in Authorization header if needed for API clients
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token provided' });
    }

    const secret = process.env.JWT_SECRET || 'finly_jwt_secret_key_892347109283471';
    let decoded;
    try {
      decoded = jwt.verify(token, secret);
    } catch (err) {
      console.error('[AuthMiddleware Error]:', err.message, 'Received Token:', token);
      return res.status(401).json({ message: 'Not authorized, token verification failed' });
    }

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: 'Not authorized, user not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Not authorized, token verification failed' });
  }
};
