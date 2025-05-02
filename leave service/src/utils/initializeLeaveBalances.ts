import LeaveType from "../entities/LeaveType";
import LeaveBalance from '../entities/LeaveBalance';
import { AppDataSource } from "../dbConfig";
import { getAllUsers } from "../utils/userCache";
import { UserType } from "./createNotifications";

const leaveTypeRepository = AppDataSource.getRepository(LeaveType);
const leaveBalanceRepository = AppDataSource.getRepository(LeaveBalance);

/**
 * Initialize leave balances for all users for a specific leave type
 */
export const initializeLeaveBalances = async (leaveTypeId: string) => {
    try {
        // Find the leave type
        const leaveType = await leaveTypeRepository.findOne({
            where: { id: leaveTypeId }
        });
        
        if (!leaveType) {
            console.error(`Leave type with ID ${leaveTypeId} not found`);
            return [];
        }
        
        // Get all employees from cache instead of making API call
        const employees = getAllUsers() as UserType[];
        
        if (employees.length === 0) {
            console.log('No employees found in cache to initialize leave balances');
            return [];
        }
        
        console.log(`Initializing leave balances for ${employees.length} employees...`);
        
        // Check which employees already have this leave type
        const existingBalances = await leaveBalanceRepository.find({
            where: { leaveType: { id: leaveTypeId } },
            relations: ['leaveType']
        });
        
        const existingEmployeeIds = new Set(
            existingBalances.map(balance => balance.employeeId)
        );
        
        // Only create balances for employees who don't have one yet
        const newBalances = [];
        
        for (const employee of employees) {
            if (!existingEmployeeIds.has(employee.id)) {
                const newBalance = leaveBalanceRepository.create({
                    employeeId: employee.id,
                    leaveType,
                    balance: leaveType.defaultAnnualAllocation,
                    carriedOver: 0
                });
                
                newBalances.push(newBalance);
            }
        }
        
        if (newBalances.length === 0) {
            console.log(`All employees already have balances for leave type: ${leaveType.name}`);
            return [];
        }
        
        // Save new balances
        const savedBalances = await leaveBalanceRepository.save(newBalances);
        
        console.log(`Successfully initialized ${savedBalances.length} leave balances for leave type: ${leaveType.name}`);
        
        return savedBalances;
    } catch (error) {
        console.error('Error initializing leave balances for new leave type:', error);
        return [];
    }
};

/**
 * Initialize leave balances for a single employee
 */
export const initializeEmployeeLeaveBalances = async (employeeId: string) => {
    try {
        // Get all active leave types
        const leaveTypes = await leaveTypeRepository.find();
        
        if (leaveTypes.length === 0) {
            console.log('No leave types found');
            return [];
        }
        
        const newBalances = [];
        
        for (const leaveType of leaveTypes) {
            // Check if employee already has this leave type
            const existingBalance = await leaveBalanceRepository.findOne({
                where: {
                    employeeId,
                    leaveType: { id: leaveType.id }
                }
            });
            
            if (!existingBalance) {
                const newBalance = leaveBalanceRepository.create({
                    employeeId,
                    leaveType,
                    balance: leaveType.defaultAnnualAllocation,
                    carriedOver: 0
                });
                
                newBalances.push(newBalance);
            }
        }
        
        if (newBalances.length === 0) {
            console.log(`Employee ${employeeId} already has all leave types`);
            return [];
        }
        
        const savedBalances = await leaveBalanceRepository.save(newBalances);
        
        console.log(`Successfully initialized ${savedBalances.length} leave balances for employee: ${employeeId}`);
        
        return savedBalances;
    } catch (error) {
        console.error(`Error initializing leave balances for employee ${employeeId}:`, error);
        return [];
    }
};