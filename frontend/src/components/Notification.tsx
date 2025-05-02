import { useState, useRef, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { IoClose, IoCheckmarkCircle } from "react-icons/io5";
import { GoKebabHorizontal } from "react-icons/go";
import { markAllNotificationsAsRead, markNotificationAsRead } from "../redux/actions/notificationActions";
import { setTempNotifications, setNotifications } from "../redux/slices/notificationSlice";
import { HiOutlineBell } from "react-icons/hi";

interface IProps {
    setToggleNotifications: React.Dispatch<React.SetStateAction<boolean>>
}

const Notification = ({setToggleNotifications}:IProps) => {
    const {notifications, fetching} = useAppSelector(state => state.notification)
    const [toggleMenu, setToggleMenu] = useState({state:false, id:''})
    const unReadNotification = notifications.find(notification => !notification.read)
    const dispatch = useAppDispatch()
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setToggleMenu({state:false, id:''});
            }
        }
        
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [toggleMenu]);

    const handleMarkAll = () => {
        const readNotifications = notifications.map(notification => ({
            ...notification,
            read: true
        }))
        dispatch(setTempNotifications(notifications))
        dispatch(setNotifications(readNotifications))
        dispatch(markAllNotificationsAsRead())
    }

    const handleMarkOne = (id: string) => {
        const readNotifications = notifications.map(notification => {
            if(notification.id === id){
                return {
                    ...notification,
                    read: true
                }
            }else{
                return notification
            }
        })

        dispatch(setTempNotifications(notifications))
        dispatch(setNotifications(readNotifications))
        setToggleMenu({state:false, id:''})
        dispatch(markNotificationAsRead(id))
    }

    return (
        <div className="absolute top-16 right-0 xs:w-full lg:w-[25rem] bg-white z-20 shadow-xl rounded-lg border border-gray-200 animate-fadeIn overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
                <h2 className="text-gray-800 font-semibold">Notifications</h2>
                <div className="flex items-center gap-4">
                    {unReadNotification && 
                        <button 
                            onClick={handleMarkAll} 
                            className="text-custom-blue text-sm hover:underline flex items-center gap-1"
                        >
                            <IoCheckmarkCircle size={14} />
                            Mark all as read
                        </button>
                    }
                    <button 
                        className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                        onClick={() => setToggleNotifications(false)}
                    >
                        <IoClose size={16} className="text-gray-600" />
                    </button>
                </div>
            </div>
            
            <div className="flex flex-col overflow-y-auto xs:max-h-[70vh] lg:max-h-[60vh] divide-y divide-gray-200">
                {notifications.length > 0 ? (
                    notifications.map(notification => (
                        <div 
                            key={notification.id}
                            className={`relative flex flex-col gap-2 p-4 w-full transition-colors duration-200 ${
                                notification.read 
                                    ? 'bg-gray-50' 
                                    : 'bg-white'
                            }`}
                        >
                            {!notification.read && 
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-custom-blue"></div>
                            }
                            <p className={`text-sm ${notification.read ? 'text-gray-600' : 'text-gray-800 font-medium'}`}>
                                {notification.message}
                            </p>
                            <div className="relative flex items-center justify-between w-full">
                                <span className="text-xs text-gray-500">
                                    {notification.createdAt}
                                </span>
                                {!notification.read && (
                                    <div className="relative" ref={menuRef}>
                                        <button 
                                            onClick={() => setToggleMenu(prev => ({
                                                state: prev.id === notification.id ? !prev.state : true, 
                                                id: notification.id
                                            }))}
                                            className="p-1 rounded-full hover:bg-gray-100"
                                        >
                                            <GoKebabHorizontal size={15} className="text-gray-600" />
                                        </button>
                                        
                                        {toggleMenu.id === notification.id && toggleMenu.state && (
                                            <div className="absolute top-full right-0 mt-1 flex flex-col items-center rounded-md w-40 z-30 shadow-lg border border-gray-200 bg-white animate-fadeIn">
                                                <button
                                                    className="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-custom-blue hover:text-white transition-colors flex items-center gap-2"
                                                    onClick={() => handleMarkOne(notification.id)}
                                                >
                                                    <IoCheckmarkCircle size={14} />
                                                    Mark as read
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>                           
                        </div>
                    ))
                ) : !fetching ? (
                    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                        <div className="w-16 h-16 flex items-center justify-center rounded-full bg-gray-100 mb-4">
                            <HiOutlineBell size={32} className="text-gray-400" />
                        </div>
                        <h3 className="text-gray-600 font-medium">No notifications</h3>
                        <p className="text-gray-500 text-sm mt-1">You're all caught up!</p>
                    </div>
                ) : (
                    <div className="py-10 flex justify-center">
                        <div className="animate-pulse flex space-x-4">
                            <div className="flex-1 space-y-4 py-1">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="space-y-2">
                                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                        <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
 
export default Notification;