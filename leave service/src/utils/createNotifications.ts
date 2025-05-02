import moment from "moment-timezone"
import { AppDataSource } from "../dbConfig"
import Notification from "../entities/Notification"
import sendNotification from "./sendNotification"
import sendEmail from "./emails/sendMail"
import { getUserById } from "../utils/userCache"
import dotenv from 'dotenv'
dotenv.config()

export type UserType = {
    id:string,
    name:string,
    role:string,
    department:string,
    avatarUrl:string,
    email:string
}

const nodeEnv = process.env.NODE_ENV
const notificationRepository = AppDataSource.getRepository(Notification)

const createNotifications = async(userIds: string[], message: string) => {
    if(nodeEnv === 'TEST') return
    
    try {
        for(const userId of userIds) {
            // Get user from cache instead of database query
            const user = getUserById(userId) as UserType;
            if(!user) {
                console.log(`User ${userId} not found in cache, skipping notification`);
                continue;
            }
            
            // Create notification with userId reference
            const newNotification = notificationRepository.create({
                userId: userId,
                message: message,
                read: false
            });
            
            await notificationRepository.save(newNotification);
            
            // Format created notification with consistent structure
            const formattedNotification = {
                ...newNotification,
                user: user, // Add user object from cache
                createdAt: moment(newNotification.createdAt).tz('Africa/Kigali').format("MMM D, [at] h:mm A")
            };
            
            // Send realtime notification
            sendNotification(userId, formattedNotification);
            
            // Send email notification
            sendEmail(
                'notification', 
                user.email, 
                {
                    name: user.name, // Using standard name field
                    message: newNotification.message
                }
            );
        }
    } catch(err) {
        console.error('Failed to create notifications:', err.message);
    }
}

export default createNotifications;