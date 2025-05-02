import { AppDataSource } from '../dbConfig'
import Notification from '../entities/Notification'
import {Request, Response} from 'express'
import moment from 'moment-timezone'
import { getUserById } from '../utils/userCache'

const notificationRepository = AppDataSource.getRepository(Notification)

export default class NotificationController {
    static async getNotifications(req: Request, res: Response) {
        const userId = req.user!.id

        try {
            const notifications = await notificationRepository.find({
                where: {
                    userId: userId
                },
                order: {
                    createdAt: "DESC",
                },
            })

            // Get user data from cache
            const user = getUserById(userId);

            // Enrich notifications with user data and format timestamps
            const enrichedNotifications = notifications.map(notification => {
                return {
                    ...notification,
                    user: user,
                    createdAt: moment(notification.createdAt).tz('Africa/Kigali').format("MMM D, [at] h:mm A")
                }
            })

            return res.json(enrichedNotifications)
        } catch(err) {
            return res.status(500).json({status: 'error', message: 'Internal Server Error'})
        }
    }

    static async markNotificationAsRead(req: Request, res: Response) {
        const userId = req.user!.id
        const notificationId = req.params.id

        try {
            const notification = await notificationRepository.findOne({
                where: {
                    id: notificationId,
                    userId: userId
                }
            })

            if(!notification) {
                return res.status(404).json({status: 'error', message: 'Notification not found'})
            }

            notification.read = true
            await notificationRepository.save(notification)

            // Get user data from cache
            const user = getUserById(userId);

            return res.json({
                ...notification,
                user: user,
                createdAt: moment(notification.createdAt).tz('Africa/Kigali').format("MMM D, [at] h:mm A")
            })
        } catch(err) {
            return res.status(500).json({status: 'error', message: 'Internal Server Error'})
        }
    }

    static async markAllNotificationAsRead(req: Request, res: Response) {
        const userId = req.user!.id

        try {
            await notificationRepository.update(
                { userId: userId, read: false },
                { read: true }
            )

            const notifications = await notificationRepository.find({
                where: {
                    userId: userId
                },
                order: {
                    createdAt: "DESC",
                },
            })

            // Get user data from cache
            const user = getUserById(userId);

            // Enrich notifications with user data and format timestamps
            const enrichedNotifications = notifications.map(notification => {
                return {
                    ...notification,
                    user: user,
                    createdAt: moment(notification.createdAt).tz('Africa/Kigali').format("MMM D, [at] h:mm A")
                }
            })

            return res.json(enrichedNotifications)
        } catch(err) {
            return res.status(500).json({status: 'error', message: 'Internal Server Error'})
        }
    }
}