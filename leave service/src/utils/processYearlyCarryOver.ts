import {AppDataSource} from '../dbConfig';
import LeaveType from '../entities/LeaveType';
import LeaveBalance from '../entities/LeaveBalance';
import createNotifications, { UserType } from './createNotifications';
import { getUserById } from './userCache';


export const processYearlyCarryOver = async () => {
    const leaveTypeRepository = AppDataSource.getRepository(LeaveType);
    const leaveBalanceRepository = AppDataSource.getRepository(LeaveBalance);
    
    const summary = {
        success: true,
        processed: 0,
        errors: 0,
        message: ''
    };

    try {
        console.log('Starting yearly leave carryover process...');
        
        const nextYear = new Date().getFullYear() + 1;
        const leaveTypes = await leaveTypeRepository.find();
        
        for (const leaveType of leaveTypes) {
            const balances = await leaveBalanceRepository.find({
                where: { leaveType: { id: leaveType.id } }
            });
            
            for (const balance of balances) {
                try {
                    const currentBalance = Number(balance.balance);
                    const maxCarryOver = Number(leaveType.maxCarryoverDays);

                    const carryover = Math.min(currentBalance, maxCarryOver);
                    const excessDays = Math.max(0, currentBalance - maxCarryOver);
                    
                    balance.carriedOver = carryover;
                    balance.excessDays = excessDays;
                    
                    await leaveBalanceRepository.save(balance);

                    // Notify employee about carryover and expiring days
                    const employee = getUserById(balance.employeeId) as UserType;
                    
                    if (employee) {
                        let message = `Your ${leaveType.name} leave balance for year-end: `;
                        
                        if (currentBalance === 0) {
                            message += `You have no remaining leave days to carry over.`;
                        } else {
                            message += `Out of your ${currentBalance.toFixed(1)} available days, `;
                            
                            if (carryover > 0) {
                                message += `${carryover.toFixed(1)} days have been carried over to ${nextYear}. `;
                            } else {
                                message += `no days could be carried over. `;
                            }
                            
                            if (excessDays > 0) {
                                message += `You have ${excessDays.toFixed(1)} excess days that must be used by January 31st, ${nextYear} or they will expire.`;
                            }
                        }
                        
                        // Send notification to the employee
                        await createNotifications([balance.employeeId], message);
                        console.log(`Notified employee ${balance.employeeId} about carryover status`);
                    }
                    
                    summary.processed++;
                } catch (err) {
                    console.log(err)
                }
            }
        }
        
        console.log('Carry over process completed successfully...')
    } catch (error) {
        console.log(error)
    }
}