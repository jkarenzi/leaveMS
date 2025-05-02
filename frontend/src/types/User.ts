export type UserRole = 'staff' | 'admin' | 'manager';

export interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    department: string;
    avatarUrl: string;
}