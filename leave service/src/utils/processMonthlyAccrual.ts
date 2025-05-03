import { AppDataSource } from '../dbConfig';
import LeaveBalance from '../entities/LeaveBalance';
import createNotifications from './createNotifications';
import { getUserById } from './userCache';


const processMonthlyAccrual = async () => {
  const leaveBalanceRepository = AppDataSource.getRepository(LeaveBalance);
  
  const summary = {
    success: true,
    processed: 0,
    errors: 0,
    message: ''
  };

  try {
    console.log('Starting monthly leave accrual process...');
    
    // Get all leave balances with their related leave types
    const leaveBalances = await leaveBalanceRepository.find({
      relations: ['leaveType']
    });
    
    if (leaveBalances.length === 0) {
      summary.message = 'No leave balances found to process';
      return summary;
    }
    
    console.log(`Processing ${leaveBalances.length} leave balances...`);
    
    // Process each balance
    for (const balance of leaveBalances) {
      try {
        if (!balance.leaveType) {
          console.warn(`Leave balance ${balance.id} has no leave type, skipping`);
          continue;
        }
        
        // Only accrue if the accrual rate is greater than zero
        const accrualRate = Number(balance.leaveType.accrualRate);
        if (accrualRate <= 0) {
          continue;
        }
        
        // Increase the balance by the accrual rate
        const oldBalance = Number(balance.balance);
        balance.balance = oldBalance + accrualRate;
        
        // Save the updated balance
        await leaveBalanceRepository.save(balance);
        
        // Send notification to employee
        const employee = getUserById(balance.employeeId);
        if (employee) {
          const notificationMessage = `Your ${balance.leaveType.name} leave balance has been increased by ${accrualRate.toFixed(2)} days. New balance: ${Number(balance.balance).toFixed(2)} days.`;
          createNotifications([balance.employeeId], notificationMessage);
        }
        
        summary.processed++;
      } catch (error) {
        console.error(`Error processing leave balance ${balance.id}:`, error);
        summary.errors++;
      }
    }
    
    summary.message = `Successfully processed ${summary.processed} leave balances. Encountered ${summary.errors} errors.`;
    console.log(summary.message);
    
    return summary;
  } catch (error) {
    console.error('Error processing monthly leave accrual:', error);
    summary.success = false;
    summary.message = `Failed to process monthly leave accrual: ${error.message}`;
    return summary;
  }
};

export default processMonthlyAccrual;