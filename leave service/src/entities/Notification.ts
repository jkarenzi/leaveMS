import {
    Entity,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    Column,
} from 'typeorm';
import dotenv from 'dotenv'
dotenv.config()

  
@Entity()
export default class Notification {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column('text')
    userId!: string 

    @Column('text')
    message!: string

    @Column('boolean', {default: false})
    read!: boolean
    
    @CreateDateColumn({type:'timestamptz'})
    createdAt!: Date;

    @UpdateDateColumn({type:'timestamptz'})
    updatedAt!: Date;
}