import { User } from "./User";


export interface ApiResponse {
    success: boolean;
    message: string;
    token?: string;
    user?: User;
    data?: any
}