import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

export const protect = (req: Request, res: Response, next: NextFunction) => {
  const bearer = req.headers.authorization;

  if (!bearer) {
    res.status(401).json({ message: 'Not authorized.' });
    return;
  }

  const [, token] = bearer.split(' ');

  if (!token) {
    res.status(401).json({ message: 'Not authorized.' });
    return;
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET as string);
    (req as any).user = payload;

    next();
  } catch (e) {
    console.error(e);
    res.status(401).json({ message: 'Not authorized.' });
    return;
  }
};
