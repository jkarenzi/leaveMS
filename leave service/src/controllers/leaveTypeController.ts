import { Request, Response } from 'express';
import { AppDataSource } from '../dbConfig';
import LeaveType from '../entities/LeaveType';
import { initializeLeaveBalances } from '../utils/initializeLeaveBalances';


const leaveTypeRepository = AppDataSource.getRepository(LeaveType);

export default class LeaveTypeController {
    static async createLeaveType(req: Request, res: Response) {
        try {
            const { name, defaultAnnualAllocation, accrualRate, maxCarryoverDays } = req.body;
            
            const existingLeaveType = await leaveTypeRepository.findOne({
                where: { name }
            });
            
            if (existingLeaveType) {
                return res.status(400).json({
                status: 'error',
                message: 'Leave type with this name already exists'
                });
            }
            
            const leaveType = leaveTypeRepository.create({
                name,
                defaultAnnualAllocation,
                accrualRate,
                maxCarryoverDays
            });
            
            await leaveTypeRepository.save(leaveType);

            initializeLeaveBalances(leaveType.id);
            
            return res.status(201).json({
                status: 'success',
                message: 'Leave type created successfully',
                data: {
                    ...leaveType,
                    defaultAnnualAllocation: Number(leaveType.defaultAnnualAllocation),
                    accrualRate: Number(leaveType.accrualRate),
                }
            });
        } catch (error) {
            console.error('Error creating leave type:', error);
            return res.status(500).json({
                status: 'error',
                message: 'Failed to create leave type',
                error: error.message
            });
        }
    }
  
    static async getAllLeaveTypes(req: Request, res: Response) {
        try {
            const leaveTypes = await leaveTypeRepository.find({
                order: { name: 'ASC' }
            });
            
            return res.status(200).json({
                status: 'success',
                data: leaveTypes.map(leaveType => {
                    return {
                        ...leaveType,
                        defaultAnnualAllocation: Number(leaveType.defaultAnnualAllocation),
                        accrualRate: Number(leaveType.accrualRate)
                    }
                })
            });
        } catch (error) {
            return res.status(500).json({
                status: 'error',
                message: 'Failed to fetch leave types',
                error: error.message
            });
        }
    }

    static async updateLeaveType(req: Request, res: Response) {
        try {
        const { id } = req.params;
        const { name, defaultAnnualAllocation, accrualRate, maxCarryoverDays } = req.body;
        
        const leaveType = await leaveTypeRepository.findOne({
            where: { id }
        });
        
        if (!leaveType) {
            return res.status(404).json({
            status: 'error',
            message: 'Leave type not found'
            });
        }
        
        if (name && name !== leaveType.name) {
            const existingLeaveType = await leaveTypeRepository.findOne({
            where: { name }
            });
            
            if (existingLeaveType) {
            return res.status(400).json({
                status: 'error',
                message: 'Leave type with this name already exists'
            });
            }
        }
        
        if (name) leaveType.name = name;
        if (defaultAnnualAllocation) leaveType.defaultAnnualAllocation = defaultAnnualAllocation;
        if (accrualRate) leaveType.accrualRate = accrualRate;
        if (maxCarryoverDays) leaveType.maxCarryoverDays = maxCarryoverDays;
        
        await leaveTypeRepository.save(leaveType);
        
        return res.status(200).json({
            status: 'success',
            message: 'Leave type updated successfully',
            data: {
                ...leaveType,
                defaultAnnualAllocation: Number(leaveType.defaultAnnualAllocation),
                accrualRate: Number(leaveType.accrualRate),
            }
        });
        } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Failed to update leave type',
            error: error.message
        });
        }
    }

    static async deleteLeaveType(req: Request, res: Response) {
        try {
            const { id } = req.params;
            
            const leaveType = await leaveTypeRepository.findOne({
                where: { id },
                relations: ['leaveApplications', 'leaveBalances']
            });
            
            if (!leaveType) {
                return res.status(404).json({
                status: 'error',
                message: 'Leave type not found'
                });
            }
            
            if (leaveType.leaveApplications?.length > 0) {
                return res.status(400).json({
                status: 'error',
                message: 'Cannot delete leave type that is associated with leave applications'
                });
            }
            
            if (leaveType.leaveBalances?.length > 0) {
                return res.status(400).json({
                status: 'error',
                message: 'Cannot delete leave type that is associated with leave balances'
                });
            }
            
            await leaveTypeRepository.remove(leaveType);
            
            return res.status(200).json({
                status: 'success',
                message: 'Leave type deleted successfully'
            });
        } catch (error) {
            return res.status(500).json({
                status: 'error',
                message: 'Failed to delete leave type',
                error: error.message
            });
        }
    }
}