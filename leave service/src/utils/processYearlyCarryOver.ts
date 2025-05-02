import {AppDataSource} from '../dbConfig';
import LeaveType from '../entities/LeaveType';
import LeaveBalance from '../entities/LeaveBalance';


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
        
        const leaveTypes = await leaveTypeRepository.find();
        
        for (const leaveType of leaveTypes) {
            const balances = await leaveBalanceRepository.find({
                where: { leaveType: { id: leaveType.id } }
            });
            
            for (const balance of balances) {
                try {
                    const carryover = Math.min(balance.balance, leaveType.maxCarryoverDays);
                    
                    balance.carriedOver = carryover;
                    balance.balance = carryover;
                    
                    await leaveBalanceRepository.save(balance);
                    
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