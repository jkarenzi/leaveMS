import { Router } from "express";
import notificationRoutes from "./notificationRoutes";
import leaveRoutes from "./leaveRoutes";

const router = Router()

router.use('/leave', leaveRoutes)
router.use('/notifications', notificationRoutes)


export default router