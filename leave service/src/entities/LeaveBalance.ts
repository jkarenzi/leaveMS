import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Relation } from 'typeorm';
import LeaveType from './LeaveType';


@Entity()
export default class LeaveBalance {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text')
    employeeId: string;

    @ManyToOne(() => LeaveType, (type) => type.leaveBalances)
    leaveType: Relation<LeaveType>;

    @Column('decimal', { precision: 5, scale: 2, default: 0 })
    balance: number;

    @Column('decimal', { precision: 5, scale: 2, default: 0 })
    carriedOver: number;

    @Column({type: 'decimal', precision: 10, scale: 2, default: 0})
    excessDays: number;
}