import { AppDataSource } from '../dbConfig';
import LeaveApplication from '../entities/LeaveApplication';
import { Between, MoreThan } from 'typeorm';
import { addDays, format } from 'date-fns';
import createNotifications, { UserType } from './createNotifications';
import { getAllUsers, getUserById } from './userCache';

/**
 * Checks for leave applications starting in the next N days
 * and sends notifications to relevant admins and managers
 */
export const checkForUpcomingLeaves = async (daysInAdvance: number = 3) => {
  try {
    console.log(`Checking for leave applications starting in the next ${daysInAdvance} days...`);
    
    const leaveApplicationRepository = AppDataSource.getRepository(LeaveApplication);
    
    // Calculate date range (from tomorrow to N days ahead)
    const tomorrow = new Date();
    tomorrow.setHours(0, 0, 0, 0);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const futureDate = addDays(tomorrow, daysInAdvance);
    
    // Fetch leave applications starting in the next N days
    const upcomingLeaves = await leaveApplicationRepository.find({
      where: {
        startDate: Between(tomorrow, futureDate),
        status: 'Approved'
      },
      relations: ['leaveType']
    });
    
    if (upcomingLeaves.length === 0) {
      console.log('No upcoming leaves found');
      return;
    }
    
    console.log(`Found ${upcomingLeaves.length} upcoming leaves`);
    
    // Get all users
    const allUsers = getAllUsers() as UserType[];
    
    // Process each upcoming leave
    for (const leave of upcomingLeaves) {
      // Get employee details
      const employee = getUserById(leave.employeeId) as UserType;
      
      if (!employee) {
        console.log(`Employee ${leave.employeeId} not found in cache, skipping notification`);
        continue;
      }
      
      // Determine notification recipients (admins and managers in the same department)
      const recipientIds = allUsers
        .filter(user => 
          // Include admins
          user.role === 'admin' || 
          // Include managers from the same department
          (user.role === 'manager' && user.department === employee.department)
        )
        .map(user => user.id);
      
      if (recipientIds.length === 0) {
        console.log(`No admins or managers found for employee ${employee.name}, skipping notification`);
        continue;
      }
      
      // Format dates for display
      const startDate = format(new Date(leave.startDate), 'MMM d, yyyy');
      const endDate = format(new Date(leave.endDate), 'MMM d, yyyy');
      
      // Create notification message
      const notificationMessage = `Reminder: ${employee.name} will be on ${leave.leaveType.name} leave starting ${startDate} until ${endDate}.`;
      
      // Send notifications
      await createNotifications(recipientIds, notificationMessage);
      
      console.log(`Sent upcoming leave notifications for ${employee.name}'s leave starting on ${startDate}`);
    }
    
    console.log('Upcoming leave notification check completed successfully');
  } catch (error) {
    console.error('Error checking for upcoming leaves:', error);
  }
};

export default checkForUpcomingLeaves;