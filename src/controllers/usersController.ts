import { type Request, type Response } from 'express';

export const getProfile = (req: Request, res: Response) => {
  res.status(200).json({ user: req.user });
};
