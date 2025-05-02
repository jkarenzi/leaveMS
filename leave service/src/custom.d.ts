export interface IUser {
    id:string,
    email:string,
    avatarUrl:string,
    department:string,
    role: 'admin' | 'manager' | 'employee',
    name: string
}

declare module 'express-serve-static-core' {
    interface Request {
      user?: IUser
    }
}