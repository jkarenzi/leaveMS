import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, Relation } from 'typeorm';
import LeaveType from './LeaveType';

@Entity()
export default class LeaveApplication {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text')
    employeeId: string;

    @ManyToOne(() => LeaveType, (type) => type.leaveApplications)
    leaveType: Relation<LeaveType>;

    @Column('date')
    startDate: Date;

    @Column('date')
    endDate: Date;

    @Column('text', { nullable: true })
    reason: string;

    @Column('text', { nullable: true })
    documentUrl: string;

    @Column('text', { default: 'Pending' })
    status: 'Pending' | 'Approved' | 'Rejected';

    @Column('text', { nullable: true })
    managerComment: string;

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updatedAt: Date;
}