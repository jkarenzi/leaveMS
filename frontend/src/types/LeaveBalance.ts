import { LeaveType } from "./LeaveType";
import { User } from "./User";


export interface LeaveBalance {
    id: string;
    employeeId: string;
    leaveType: LeaveType;
    balance: number;
    carriedOver: number;
    employee: User
}

export interface LeaveBalanceFormData {
    balance: number;
    carriedOver: number;
}

export interface UpdateLeaveBalanceFormData {
    id:string,
    formData: LeaveBalanceFormData
}

export interface UserWithLeaveBalances extends User {
    leaveBalances: LeaveBalance[];
}