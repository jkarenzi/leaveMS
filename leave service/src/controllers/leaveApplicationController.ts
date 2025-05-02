import { Request, Response } from 'express';
import { AppDataSource } from '../dbConfig';
import LeaveApplication from '../entities/LeaveApplication';
import LeaveBalance from '../entities/LeaveBalance';
import LeaveType from '../entities/LeaveType';
import { differenceInBusinessDays, parseISO } from 'date-fns';
import { getUserById } from '../utils/userCache';

// Keep repositories outside the class
const leaveApplicationRepository = AppDataSource.getRepository(LeaveApplication);
const leaveBalanceRepository = AppDataSource.getRepository(LeaveBalance);
const leaveTypeRepository = AppDataSource.getRepository(LeaveType);

export default class LeaveApplicationController {
  /**
   * Create a new leave application
   */
  static async createLeaveApplication(req: Request, res: Response) {
    const employeeId = req.user.id;
    try {
      const { leaveTypeId, startDate, endDate, reason, documentUrl } = req.body;
      
      const leaveType = await leaveTypeRepository.findOne({ where: { id: leaveTypeId } });
      if(!leaveType){
        return res.status(400).json({
          status: 'error',
          message: 'Leave type not found'
        });
      }
      
      const numDays = differenceInBusinessDays(
        parseISO(endDate), 
        parseISO(startDate)
      ) + 1;
      
      const leaveBalance = await leaveBalanceRepository.findOne({
        where: {
          employeeId,
          leaveType: { id: leaveTypeId }
        },
        relations: ['leaveType']
      });
      
      if (!leaveBalance) {
        return res.status(400).json({
          status: 'error',
          message: 'Leave balance record not found for this employee and leave type'
        });
      }
      
      if (leaveBalance.balance < numDays) {
        return res.status(400).json({
          status: 'error',
          message: `Insufficient leave balance. Available: ${leaveBalance.balance}, Requested: ${numDays}`
        });
      }
      
      const leaveApplication = leaveApplicationRepository.create({
        employeeId,
        leaveType,
        startDate,
        endDate,
        reason,
        documentUrl,
        status: 'Pending'
      });
      
      await leaveApplicationRepository.save(leaveApplication);

      // Get employee from cache instead of making API call
      const employee = getUserById(employeeId);
      if (!employee) {
        return res.status(404).json({
          status: 'error',
          message: 'Employee not found in cache'
        });
      }
      
      return res.status(201).json({
        status: 'success',
        message: 'Leave application created successfully',
        data: {
          ...leaveApplication,
          employee
        }
      });
    } catch (error) {
      console.error('Error creating leave application:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to create leave application',
        error: error.message
      });
    }
  }

  /**
   * Get all leave applications
   */
  static async getAllLeaveApplications(req: Request, res: Response) {
    try {
      const applications = await leaveApplicationRepository.find({
        relations: ['leaveType'],
        order: { createdAt: 'DESC' }
      });
      
      // Enrich applications with employee data from cache
      const enrichedApplications = applications.map(application => {
        const employee = getUserById(application.employeeId);
        return {
          ...application,
          employee: employee
        };
      });
      
      return res.status(200).json({
        status: 'success',
        data: enrichedApplications
      });
    } catch (error) {
      return res.status(500).json({
        status: 'error',
        message: 'Failed to fetch leave applications',
        error: error.message
      });
    }
  }
  
  /**
   * Get leave applications for a specific employee
   */
  static async getEmployeeLeaveApplications(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const applications = await leaveApplicationRepository.find({
        where: { employeeId: id },
        relations: ['leaveType'],
        order: { createdAt: 'DESC' }
      });
      
      // Get employee data from cache
      const employee = getUserById(id);
      if (!employee) {
        return res.status(404).json({
          status: 'error',
          message: 'Employee not found in cache'
        });
      }
      
      // Enrich applications with employee data
      const enrichedApplications = applications.map(application => ({
        ...application,
        employee
      }));
      
      return res.status(200).json({
        status: 'success',
        data: {
          employee,
          applications: enrichedApplications
        }
      });
    } catch (error) {
      return res.status(500).json({
        status: 'error',
        message: 'Failed to fetch employee leave applications',
        error: error.message
      });
    }
  }
  
  /**
   * Update leave application status
   */
  static async updateLeaveStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status, managerComment } = req.body;
      
      const leaveApplication = await leaveApplicationRepository.findOne({
        where: { id },
        relations: ['leaveType']
      });
      
      if (!leaveApplication) {
        return res.status(404).json({
          status: 'error',
          message: 'Leave application not found'
        });
      }
      
      leaveApplication.status = status;
      leaveApplication.managerComment = managerComment || leaveApplication.managerComment;
      
      await leaveApplicationRepository.save(leaveApplication);
      
      if (status === 'Approved') {
        const numDays = differenceInBusinessDays(
          leaveApplication.endDate, 
          leaveApplication.startDate
        ) + 1;
        
        const leaveBalance = await leaveBalanceRepository.findOne({
          where: {
            employeeId: leaveApplication.employeeId,
            leaveType: { id: leaveApplication.leaveType.id }
          }
        });
        
        if (leaveBalance) {
          leaveBalance.balance -= numDays;
          await leaveBalanceRepository.save(leaveBalance);
        }
      }
      
      // Get employee data from cache
      const employee = getUserById(leaveApplication.employeeId);
      
      // Include employee data in response
      return res.status(200).json({
        status: 'success',
        message: `Leave application ${status.toLowerCase()} successfully`,
        data: {
          ...leaveApplication,
          employee: employee
        }
      });
    } catch (error) {
      return res.status(500).json({
        status: 'error',
        message: 'Failed to update leave application status',
        error: error.message
      });
    }
  }
  
  /**
   * Get leave application by ID
   */
  static async getLeaveApplicationById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const leaveApplication = await leaveApplicationRepository.findOne({
        where: { id },
        relations: ['leaveType']
      });
      
      if (!leaveApplication) {
        return res.status(404).json({
          status: 'error',
          message: 'Leave application not found'
        });
      }
      
      // Get employee data from cache
      const employee = getUserById(leaveApplication.employeeId);
      
      return res.status(200).json({
        status: 'success',
        data: {
          ...leaveApplication,
          employee: employee
        }
      });
    } catch (error) {
      return res.status(500).json({
        status: 'error',
        message: 'Failed to fetch leave application',
        error: error.message
      });
    }
  }
  
  /**
   * Delete a leave application
   */
  static async deleteLeaveApplication(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const employeeId = req.user.id;
      
      const leaveApplication = await leaveApplicationRepository.findOne({
        where: { id },
        relations: ['leaveType']
      });
      
      if (!leaveApplication) {
        return res.status(404).json({
          status: 'error',
          message: 'Leave application not found'
        });
      }
      
      // Only the employee who created the application or admin can delete it
      if (leaveApplication.employeeId !== employeeId && req.user.role !== 'admin') {
        return res.status(403).json({
          status: 'error',
          message: 'You are not authorized to delete this application'
        });
      }
      
      // Only pending applications can be deleted
      if (leaveApplication.status !== 'Pending') {
        return res.status(400).json({
          status: 'error',
          message: 'Only pending applications can be deleted'
        });
      }
      
      await leaveApplicationRepository.remove(leaveApplication);
      
      return res.status(200).json({
        status: 'success',
        message: 'Leave application deleted successfully'
      });
    } catch (error) {
      return res.status(500).json({
        status: 'error',
        message: 'Failed to delete leave application',
        error: error.message
      });
    }
  }
}