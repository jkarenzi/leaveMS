import NotificationController from "../controllers/notificationController";
import { Router } from "express";
import { authenticateToken, checkRole } from "../middleware/authenticate";

const notificationRouter = Router()

notificationRouter.use(authenticateToken)

notificationRouter.get('/', NotificationController.getNotifications)
notificationRouter.patch('/', NotificationController.markAllNotificationAsRead)
notificationRouter.patch('/:id', NotificationController.markNotificationAsRead)


export default notificationRouter