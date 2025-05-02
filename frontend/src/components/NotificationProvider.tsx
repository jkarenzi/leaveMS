import { useEffect, useRef, useState } from "react";
import Pusher from "pusher-js";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { Notification as UserNotification } from "../types/Notification";
import { addNotification } from "../redux/slices/notificationSlice";
import { infoToast } from "../utils/toast";


const pusherCluster = import.meta.env.VITE_PUSHER_CLUSTER
const pusherKey = import.meta.env.VITE_PUSHER_KEY
//const baseUrl = import.meta.env.VITE_BASE_URL

interface IProps {
    children: React.ReactNode
}


const NotificationProvider = ({ children }:IProps) => {
    const {user} = useAppSelector(state => state.user)
    const [isPageVisible, setIsPageVisible] = useState(true)
    const dispatch = useAppDispatch()

    const handleVisibilityChange = () => {
        setIsPageVisible(document.visibilityState === "visible");
      };

    const isPageVisibleRef = useRef(isPageVisible);

    useEffect(() => {
        document.addEventListener("visibilitychange", handleVisibilityChange);

        if (Notification.permission !== "granted") {
            Notification.requestPermission().then(permission => console.log(permission))
        }

        if (user) {
            const pusher = new Pusher(pusherKey, {
                cluster: pusherCluster,
                // channelAuthorization:{
                //     transport: "ajax",
                //     endpoint: `${baseUrl}/auth/pusher`,
                //     headers:{
                //         Authorization: `Bearer ${token}`
                //     }
                // }
            });

            const channel = pusher.subscribe(`public-${user.id}`);
            channel.bind("new-notification", (notification: UserNotification) => {
                dispatch(addNotification(notification))

                if (Notification.permission === 'granted' && !isPageVisibleRef.current) {
                    new Notification('TeamSync', {
                        body: notification.message,
                        icon: '/logo.png'
                    })
                }else{
                    if(notification.message.startsWith('New message')){
                        if(!location.pathname.endsWith('chat')){
                            infoToast(notification.message)
                        }
                    }else{
                        infoToast(notification.message)
                    }
                }
            });

            return () => {
                document.removeEventListener("visibilitychange", handleVisibilityChange);
                if (channel) {
                    channel.unbind_all()
                    channel.unsubscribe();
                }
            };
        }
    }, [user])

    useEffect(() => {
        isPageVisibleRef.current = isPageVisible
    }, [isPageVisible])

    return <>{children}</>
};

export default NotificationProvider