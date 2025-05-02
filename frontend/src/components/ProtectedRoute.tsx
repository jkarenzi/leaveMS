import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { errorToast } from '../utils/toast';
import { resetInitializeStatus } from '../redux/slices/userSlice';


interface PrivateProps {
  children: React.ReactNode,
  allowedRoles: string[]
}

const PrivateRoute = ({ children, allowedRoles }: PrivateProps) => {
  const navigate = useNavigate();
  const {user, initializeStatus, token} = useAppSelector((state) => state.user);
  const dispatch = useAppDispatch()


  useEffect(() => {
    if (initializeStatus !== 'complete') return

    dispatch(resetInitializeStatus());

    if (!token || !user) {
      navigate('/');
      return
    }

    if (!allowedRoles.includes(user.role)) {
      errorToast('You do not have the necessary permissions to access this page');
      navigate('/');
      return
    }  
  }, [initializeStatus])


  if (!token || !user) return <></>

  return <>{children}</>
};

export default PrivateRoute;
