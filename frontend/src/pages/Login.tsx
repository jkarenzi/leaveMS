import { useEffect } from "react";
import { login } from "../redux/actions/authActions";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { useNavigate } from "react-router-dom";
import BeatLoader from "react-spinners/BeatLoader";

export default function Login() {
  const {user, isLoggingIn} = useAppSelector((state) => state.user);
  const dispatch = useAppDispatch()
  const navigate = useNavigate();

  const loadGoogleScript = () => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.id = 'google-identity';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: (response:any) => {
          console.log(response.credential)
          if (response.credential) {
            dispatch(login({idToken: response.credential}));
          }
        },
      });

      // Show the Google One Tap UI
      window.google.accounts.id.prompt();

      window.google.accounts.id.renderButton(
        document.getElementById('google-button')!,
        { theme: 'outline', size: 'large'}
      );
    }
  };

  useEffect(() => {
    loadGoogleScript();
  }, []);

  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if(user.role === 'manager') {
        navigate('/manager/dashboard');
      }else{
        navigate('/staff/dashboard');
      }
    }
  }, [user]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
        <h2 className="text-2xl font-semibold text-center">Welcome to HR LMS</h2>
        <p className="text-center text-gray-500">Sign in with your Google account to continue</p>

        <div id="google-button"></div>
        {isLoggingIn && <div className="w-full flex items-center justify-center mt-4">
          <BeatLoader size={15} color={"#586AEA"} />
        </div>}
      </div>
    </div>
  );
}
