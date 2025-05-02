export interface LeaveType {
    id: string;
    name: string;
    defaultAnnualAllocation: number;
    accrualRate: number;
    maxCarryoverDays: number;
    active: boolean;
}

export interface LeaveTypeFormData {
    name: string;
    defaultAnnualAllocation: number;
    accrualRate: number;
    maxCarryoverDays: number;
}

export interface LeaveTypeUpdateFormData {
    id: string,
    formData: LeaveTypeFormData
}