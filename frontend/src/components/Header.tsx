import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { logout } from "../redux/slices/userSlice";
import { Notification } from "../types/Notification";
import { getAllNotifications } from "../redux/actions/notificationActions";
import { IoMdNotificationsOutline } from "react-icons/io";
import NotificationBox from './Notification'


export default function Header() {
  const {user} = useAppSelector((state) => state.user);
  const {notifications} = useAppSelector((state) => state.notification);
  const dispatch = useAppDispatch()
  const [toggleNotifications, setToggleNotifications] = useState(false)
  const unRead = notifications.find(notification => !notification.read)
  const [unReadNotification, setUnReadNotification] = useState<Notification | undefined>(unRead)

  useEffect(() => {
    dispatch(getAllNotifications())
  },[])

  useEffect(() => {
      setUnReadNotification(notifications.find(notification => !notification.read))
  },[notifications])

  return (
    <header className="w-full h-16 pr-12 flex items-center justify-end bg-white border-b shadow-sm">
      <div className="flex items-center gap-12">
        <div className="relative cursor-pointer" onClick={() => setToggleNotifications(true)}>
          <IoMdNotificationsOutline size={23} color="black"/>
          {unReadNotification && <div className="absolute top-0 right-[0.2rem] w-[0.4rem] h-[0.4rem] rounded-full bg-red-500 animate-pulse"></div>}
        </div>

        <div className="flex items-center gap-3 cursor-pointer" onClick={() => dispatch(logout())}>
          <img
            src={user?.avatarUrl}
            alt="avatar"
            className="w-10 h-10 rounded-full object-cover"
          />
          <span className="text-sm font-medium">{user?.name}</span>
        </div>
      </div>

      {toggleNotifications && <NotificationBox setToggleNotifications={setToggleNotifications}/>}
    </header>
  );
  }
  