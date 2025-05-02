import { Request, Response, NextFunction } from 'express';
import { IUser } from '../custom'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()


export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const header = req.header('Authorization');

  if (!header) {
    return res.status(401).json({ status: 'error', message: 'Unauthorized' });
  }

  const token = header.split(' ')[1];

  try {
    const decoded = await jwt.verify(token, process.env.JWT_SECRET as string) as IUser;
    console.log(decoded)

    if(!decoded){
      return res.status(401).json({ status: 'error', message: 'Unauthorized' });
    }

    req.user = decoded

    next();
  } catch (err) {
    console.log(err)
    return res.status(401).json({ status: 'error', message: 'Unauthorized' });
  }
};

export const checkRole = (allowedRoles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
      const userRole = req.user!.role
      if(!allowedRoles.includes(userRole)){
          return res.status(403).json({message:'Forbidden'})
      }
      next()
    }
}