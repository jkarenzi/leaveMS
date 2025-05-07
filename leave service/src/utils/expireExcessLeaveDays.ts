import { AppDataSource } from '../dbConfig';
import LeaveType from '../entities/LeaveType';
import LeaveBalance from '../entities/LeaveBalance';
import createNotifications from './createNotifications';
import { getUserById } from './userCache';

/**
 * Function to run on January 31st to expire excess leave days
 * not officially carried over from the previous year
 */
export const expireExcessLeaveDays = async () => {
    const leaveTypeRepository = AppDataSource.getRepository(LeaveType);
    const leaveBalanceRepository = AppDataSource.getRepository(LeaveBalance);
    
    const summary = {
        success: true,
        processed: 0,
        errors: 0,
        message: ''
    };

    try {
        console.log('Starting process to expire excess leave days...');
        
        const leaveTypes = await leaveTypeRepository.find();
        
        for (const leaveType of leaveTypes) {
            const balances = await leaveBalanceRepository.find({
                where: { leaveType: { id: leaveType.id } },
                relations: ['leaveType']
            });
            
            for (const balance of balances) {
                try {
                    const currentBalance = Number(balance.balance);
                    const carriedOver = Number(balance.carriedOver);
                    
                    const expiringDays = balance.excessDays;
                    
                    if (balance.excessDays > 0) {
                        // Reduce the balance to only include carried over days
                        balance.balance = currentBalance - expiringDays;
                        const expiredAmount = balance.excessDays;
                        balance.excessDays = 0;
                        await leaveBalanceRepository.save(balance);
                        
                        // Notify the employee
                        const employee = getUserById(balance.employeeId);
                        if (employee) {
                            const message = `${expiredAmount} days of your ${leaveType.name} leave from last year have expired. Your current balance is ${balance.balance} days.`;
                            await createNotifications([balance.employeeId], message);
                        }
                        
                        summary.processed++;
                    }
                } catch (err) {
                    console.error('Error expiring excess days for balance:', err);
                    summary.errors++;
                }
            }
        }
        
        console.log('Excess leave days expiry process completed successfully');
    } catch (error) {
        console.error('Error in excess days expiry process:', error);
        summary.success = false;
        summary.message = error.message;
    }
    
    return summary;
};

export default expireExcessLeaveDays;