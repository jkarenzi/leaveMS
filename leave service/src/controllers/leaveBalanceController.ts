import { Request, Response } from 'express';
import LeaveBalance from '../entities/LeaveBalance';
import LeaveType from '../entities/LeaveType';
import { AppDataSource } from '../dbConfig';
import { getUserById, refreshUserCache } from '../utils/userCache';
import { UserType } from '../utils/createNotifications';

const leaveBalanceRepository = AppDataSource.getRepository(LeaveBalance);
const leaveTypeRepository = AppDataSource.getRepository(LeaveType);

export default class LeaveBalanceController {
    static async getMyLeaveBalances(req: Request, res: Response) {
        try {
            const employeeId = req.user?.id;
            
            const leaveBalances = await leaveBalanceRepository.find({
                where: { employeeId },
                relations: ['leaveType'],
                order: { leaveType: { name: 'ASC' } }
            });
            
            // Get employee data from cache
            const employee = getUserById(employeeId);
            
            // Add employee data to each leave balance record
            const enrichedBalances = leaveBalances.map(balance => ({
                ...balance,
                balance: Number(balance.balance),
                carriedOver: Number(balance.carriedOver),
                employee: employee
            }));
            
            return res.status(200).json({
                status: 'success',
                data: enrichedBalances
            });
        } catch (error) {
            console.error('Error fetching leave balances:', error);
            return res.status(500).json({
                status: 'error',
                message: 'Failed to fetch leave balances',
                error: error.message
            });
        }
    }
  
    static async getEmployeeLeaveBalances(req: Request, res: Response) {
        try {
            const { id } = req.params;
            
            const leaveBalances = await leaveBalanceRepository.find({
                where: { employeeId: id },
                relations: ['leaveType'],
                order: { leaveType: { name: 'ASC' } }
            });
            
            // Get employee data from cache
            const employee = getUserById(id);
            
            // Add employee data to each leave balance record
            const enrichedBalances = leaveBalances.map(balance => ({
                ...balance,
                balance: Number(balance.balance),
                carriedOver: Number(balance.carriedOver),
                employee: employee
            }));
            
            return res.status(200).json({
                status: 'success',
                data: enrichedBalances
            });
        } catch (error) {
            console.error('Error fetching employee leave balances:', error);
            return res.status(500).json({
                status: 'error',
                message: 'Failed to fetch employee leave balances',
                error: error.message
            });
        }
    }
  
    static async getAllLeaveBalances(req: Request, res: Response) {
        try {
            const leaveBalances = await leaveBalanceRepository.find({
                relations: ['leaveType'],
                order: { employeeId: 'ASC', leaveType: { name: 'ASC' } }
              });
              
              // Group leave balances by employee ID
              const balancesByEmployee: Record<string, LeaveBalance[]> = {};
              
              leaveBalances.forEach(balance => {
                if (!balancesByEmployee[balance.employeeId]) {
                  balancesByEmployee[balance.employeeId] = [];
                }
                balancesByEmployee[balance.employeeId].push({
                    ...balance,
                    balance: Number(balance.balance),
                    carriedOver: Number(balance.carriedOver),
                });
              });
              
              // Create user-based structure with their leave balances
              const users = Object.keys(balancesByEmployee).map(employeeId => {
                const employee = getUserById(employeeId) as UserType;
                if (!employee) {
                  return null; // Skip users not found in cache
                }
                
                return {
                  ...employee,
                  leaveBalances: balancesByEmployee[employeeId]
                };
              }).filter(Boolean); // Remove null entries (users not found)
              
              return res.status(200).json({
                status: 'success',
                data: users
              });
        } catch (error) {
            console.error('Error fetching all leave balances:', error);
            return res.status(500).json({
                status: 'error',
                message: 'Failed to fetch all leave balances',
                error: error.message
            });
        }
    }
  
    static async adjustLeaveBalance(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { balance, carriedOver } = req.body;
            
            const leaveBalance = await leaveBalanceRepository.findOne({
                where: { id },
                relations: ['leaveType']
            });
            
            if (!leaveBalance) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Leave balance not found'
                });
            }
            
            if (balance !== undefined) leaveBalance.balance = balance;
            if (carriedOver !== undefined) leaveBalance.carriedOver = carriedOver;
            
            await leaveBalanceRepository.save(leaveBalance);
            
            // Get employee data from cache
            const employee = getUserById(leaveBalance.employeeId);
            
            // Add employee data to the leave balance record
            const enrichedBalance = {
                ...leaveBalance,
                balance: Number(leaveBalance.balance),
                carriedOver: Number(leaveBalance.carriedOver),
                employee: employee
            };
            
            return res.status(200).json({
                status: 'success',
                message: 'Leave balance adjusted successfully',
                data: enrichedBalance
            });
        } catch (error) {
            console.error('Error adjusting leave balance:', error);
            return res.status(500).json({
                status: 'error',
                message: 'Failed to adjust leave balance',
                error: error.message
            });
        }
    }
  
    static async initializeEmployeeLeaveBalances(req: Request, res: Response) {
        try {
            const { employeeId } = req.body;
            
            if (!employeeId) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Employee ID is required'
                });
            }
            
            await refreshUserCache()
            // Get employee data from cache
            const employee = getUserById(employeeId);
            if (!employee) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Employee not found in cache'
                });
            }
            
            const leaveTypes = await leaveTypeRepository.find();
            
            const leaveBalances = [];
            
            for (const leaveType of leaveTypes) {
                const existingBalance = await leaveBalanceRepository.findOne({
                    where: {
                        employeeId,
                        leaveType: { id: leaveType.id }
                    }
                });
                
                if (!existingBalance) {
                    const leaveBalance = leaveBalanceRepository.create({
                        employeeId,
                        leaveType,
                        balance: 0,
                        carriedOver: 0
                    });
                    
                    await leaveBalanceRepository.save(leaveBalance);
                    leaveBalances.push(leaveBalance);
                }
            }
            
            // Add employee data to each leave balance record
            const enrichedBalances = leaveBalances.map(balance => ({
                ...balance,
                balance: Number(balance.balance),
                carriedOver: Number(balance.carriedOver),
                employee
            }));
            
            return res.status(201).json({
                status: 'success',
                message: 'Leave balances initialized successfully',
                data: enrichedBalances
            });
        } catch (error) {
            console.error('Error initializing employee leave balances:', error);
            return res.status(500).json({
                status: 'error',
                message: 'Failed to initialize employee leave balances',
                error: error.message
            });
        }
    }
}