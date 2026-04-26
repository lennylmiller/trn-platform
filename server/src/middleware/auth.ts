import type { Request, Response, NextFunction } from 'express';

export interface AuthUser {
  id: string;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  if (process.env.AUTH_DISABLED === 'true') {
    req.user = { id: 'dev-user', email: 'dev@localhost' };
    return next();
  }

  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Missing or invalid Authorization header' });
    return;
  }

  const token = header.slice(7);
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    req.user = {
      id: payload.sub || payload.id,
      email: payload.email || payload.preferred_username,
    };
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
}
