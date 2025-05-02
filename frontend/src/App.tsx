import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom';
import './App.css'
import { ToastContainer, Bounce } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Login from './pages/Login';
import StaffLayout from './components/layouts/staffLayout';
import Dashboard from './pages/staff/Dashboard';
import LeaveHistory from './pages/staff/LeaveHistory';
import Apply from './pages/staff/Apply';
import TeamCalendar from './pages/staff/TeamCalendar';
import AdminCalendar from './pages/admin/AdminCalendar';
import AdminLayout from './components/layouts/adminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import LeaveRequests from './pages/admin/LeaveRequests';
import LeaveTypes from './pages/admin/LeaveTypes';
import Employees from './pages/admin/Employees';
import ProtectedRoute from './components/ProtectedRoute';
import { useEffect } from 'react';
import { initiateAuth } from './redux/actions/authActions';
import { useAppDispatch } from './redux/hooks';
// import Signup from './pages/Signup';
// import GroupChat from './pages/student/GroupChat';
// import Tasks from './pages/student/Tasks';
// import PeerAssessment from './pages/student/PeerAssessment';
// import SelfAssessment from './pages/student/SelfAssessment';
// import Report from './pages/student/Report'
// import Settings from './pages/student/Settings';
// import InstructorSettings from './pages/instructor/Settings'
// import StudentSubLayout from './components/layouts/StudentSubLayout';
// import StudentMainLayout from './components/layouts/StudentMainLayout';
// import InstructorMainLayout from './components/layouts/InstructorMainLayout';
// import InstructorSubLayout from './components/layouts/InstructorSubLayout';
// import Groups from './pages/instructor/Groups';
// import Assessments from './pages/instructor/Assessments';
// import Reports from './pages/instructor/Reports';
// import Assignments from './pages/instructor/Assignments';
// import Dashboard from './pages/instructor/Dashboard';
// import StudentDashboard from './pages/student/Dashboard'
// import ProtectedRoute from './components/ProtectedRoute';
// import Home from './pages/instructor/Home';
// import { useEffect } from 'react';
// import { initiateAuth } from './redux/actions/authActions';
// import { useAppDispatch } from './redux/hooks';
// import Classes from './pages/instructor/Classes';


function App() {
  const dispatch = useAppDispatch()
  useEffect(() => {
    dispatch(initiateAuth())
  },[])

  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/">
        <Route index element={<Login/>}/>
        <Route path='/staff' element={
          <ProtectedRoute allowedRoles={['staff']}>
            <StaffLayout/>
          </ProtectedRoute>
        }>
          <Route path='dashboard' element={<Dashboard/>}/>
          <Route path='apply' element={<Apply/>}/>
          <Route path='leave-history' element={<LeaveHistory/>}/>
          <Route path='team-calendar' element={<TeamCalendar/>}/>
        </Route>

        <Route path='admin' element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminLayout/>
          </ProtectedRoute>
        }>
          <Route path='dashboard' element={<AdminDashboard/>}/>
          <Route path='leave-requests' element={<LeaveRequests/>}/>
          <Route path='employees' element={<Employees/>}/>
          <Route path='leave-types' element={<LeaveTypes/>}/>
          <Route path='leave-balances' element={<TeamCalendar/>}/>
          <Route path='calendar' element={<AdminCalendar/>}/>
        </Route>

        {/* <Route path='signup' element={<Signup/>}/>
        <Route path='student' element={
          <ProtectedRoute allowedRoles={['user']}>
            <StudentMainLayout/>
          </ProtectedRoute>
          }>
          <Route index element={<Home/>}/>
          <Route path='settings' element={<Settings/>}/>
          <Route path='projects' element={<Assignments/>}/>
          <Route path='projects/:projectId' element={<StudentSubLayout/>}>
            <Route index element={<StudentDashboard/>}/>
            <Route path='chat' element={<GroupChat/>}/>
            <Route path='tasks' element={<Tasks/>}/>
            <Route path='peerAssessment' element={<PeerAssessment/>}/>
            <Route path='selfAssessment' element={<SelfAssessment/>}/>
            <Route path='report' element={<Report/>}/>
          </Route>
        </Route>
        <Route path='instructor' element={
          <ProtectedRoute allowedRoles={['instructor']}>
            <InstructorMainLayout/>
          </ProtectedRoute>
          }>
          <Route index element={<Home/>}/>
          <Route path='assignments' element={<Assignments/>}/>
          <Route path='classes' element={<Classes/>}/>
          <Route path='settings' element={<InstructorSettings/>}/>
          <Route path='assignments/:assignmentId' element={<InstructorSubLayout/>}>
            <Route index element={<Dashboard/>}/>
            <Route path='groups' element={<Groups/>}/>
            <Route path='assessments' element={<Assessments/>}/>
            <Route path='reports' element={<Reports/>}/>
          </Route>
        </Route> */}
      </Route>
    )
  );
  return (
    <>
    <ToastContainer 
      position="top-right"
      autoClose={5000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="light"
      transition={Bounce}
    />
      <RouterProvider router={router}/>
    </>
  )
}

export default App
