import { LeaveType } from "./LeaveType";
import { User } from "./User";

export type LeaveStatus = 'Pending' | 'Approved' | 'Rejected';

export interface LeaveApplication {
    id: string;
    employeeId: string;
    employee: User;
    leaveType: LeaveType;
    startDate: string;
    endDate: string;
    reason?: string;
    documentUrl?: string;
    managerComment?:string;
    status: LeaveStatus;
    createdAt: string;
    updatedAt: string;
}

export interface LeaveApplicationFormData {
    leaveTypeId: string;
    startDate: string;
    endDate: string;
    reason?: string;
    documentUrl?: string;
}

export interface UpdateLeaveStatusFormData {
    id: string;
    formData:{
        status: LeaveStatus;
        managerComment?:string
    }
}