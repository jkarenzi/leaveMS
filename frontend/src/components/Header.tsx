import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { logout } from "../redux/slices/userSlice";

export default function Header() {
  const {user} = useAppSelector((state) => state.user);
  const dispatch = useAppDispatch()

  return (
    <header className="w-full h-16 pr-12 flex items-center justify-end bg-white border-b shadow-sm">
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => dispatch(logout())}>
        <img
          src={user?.avatarUrl}
          alt="avatar"
          className="w-10 h-10 rounded-full object-cover"
        />
        <span className="text-sm font-medium">{user?.name}</span>
      </div>
    </header>
  );
  }
  