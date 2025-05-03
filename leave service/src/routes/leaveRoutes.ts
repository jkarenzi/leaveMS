import { Router } from "express";
import { authenticateToken, checkRole } from "../middleware/authenticate";
import { validateCreateLeaveApplication } from "middleware/validators/leaveApplicationSchema";
import LeaveApplicationController from "../controllers/leaveApplicationController";
import LeaveTypeController from "../controllers/leaveTypeController";
import LeaveBalanceController from "../controllers/leaveBalanceController";
import { validateAdjustLeaveBalance, validateInitializeLeaveBalances } from "middleware/validators/leaveBalanceSchema";


const router = Router()

router.use(authenticateToken)

router.route('/requests')
    .post(validateCreateLeaveApplication, LeaveApplicationController.createLeaveApplication)
    .get(LeaveApplicationController.getAllLeaveApplications)

router.get('/requests/employee/:id', LeaveApplicationController.getEmployeeLeaveApplications)   

router.route('/requests/:id')
    .patch(LeaveApplicationController.updateLeaveStatus)
    .delete(LeaveApplicationController.deleteLeaveApplication)

router.route('/types')
    .get(LeaveTypeController.getAllLeaveTypes)
    .post(checkRole(['admin']), LeaveTypeController.createLeaveType)

router.route('/types/:id')
    .patch(checkRole(['admin']), LeaveTypeController.updateLeaveType)
    .delete(checkRole(['admin']), LeaveTypeController.deleteLeaveType) 
    

router.post('/balances', validateInitializeLeaveBalances, checkRole(['admin']), LeaveBalanceController.initializeEmployeeLeaveBalances)   
router.get('/balances', checkRole(['admin', 'manager']), LeaveBalanceController.getAllLeaveBalances)
router.get('/balances/own', LeaveBalanceController.getMyLeaveBalances)  
router.get('/balances/employee/:id', checkRole(['admin', 'manager']), LeaveBalanceController.getEmployeeLeaveBalances) 
router.patch('/balances/:id', checkRole(['admin']), validateAdjustLeaveBalance, LeaveBalanceController.adjustLeaveBalance)

export default router