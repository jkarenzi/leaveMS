import { User } from "./User";


export interface Notification {
    id:string,
    message:string,
    user: User,
    read:boolean,
    createdAt:string
}