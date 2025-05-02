import { Entity, PrimaryGeneratedColumn, Column, OneToMany, Relation } from 'typeorm';
import LeaveApplication from './LeaveApplication';
import LeaveBalance from './LeaveBalance';

@Entity()
export default class LeaveType {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text')
    name: string;

    @Column('decimal', { precision: 5, scale: 2, default: 0 })
    defaultAnnualAllocation: number;

    @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
    accrualRate: number;

    @Column({ type: 'int', default: 0 })
    maxCarryoverDays: number;

    @Column('boolean', { default: true })
    active: boolean;

    @OneToMany(() => LeaveApplication, (leaveApplication) => leaveApplication.leaveType)
    leaveApplications: Relation<LeaveApplication[]>;

    @OneToMany(() => LeaveBalance, (leaveBalance) => leaveBalance.leaveType)
    leaveBalances: Relation<LeaveBalance[]>;
}