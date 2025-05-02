import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaUserClock, FaUserCheck, FaUserTimes, FaUsers } from 'react-icons/fa';
import { format } from 'date-fns';
import { ClipLoader } from 'react-spinners';
import { useAppSelector, useAppDispatch } from '../../redux/hooks';
import { 
  getAllLeaveApplications, 
  updateLeaveStatus 
} from '../../redux/actions/leaveApplicationActions';
import { UpdateLeaveStatusFormData } from '../../types/LeaveApplication';

const AdminDashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { 
    leaveApplications, 
    fetchingApplications, 
    submitting 
  } = useAppSelector(state => state.leave);
  
  const { usersWithLeaveBalances } = useAppSelector(state => state.leave);

  // Fetch data on component mount
  useEffect(() => {
    dispatch(getAllLeaveApplications());
  }, [dispatch]);

  // Calculate dashboard statistics
  const stats = {
    pendingRequests: leaveApplications.filter(app => app.status === 'Pending').length,
    approvedRequests: leaveApplications.filter(app => app.status === 'Approved').length,
    rejectedRequests: leaveApplications.filter(app => app.status === 'Rejected').length,
    totalEmployees: usersWithLeaveBalances.length
  };

  // Get only pending applications for the table
  const pendingApplications = leaveApplications.filter(app => app.status === 'Pending');

  // Handler for approving or rejecting leave
  const handleUpdateLeaveStatus = (id: string, status: 'Approved' | 'Rejected') => {
    const updateData: UpdateLeaveStatusFormData = {
      id,
      formData: {
        status
      }
    };
    
    dispatch(updateLeaveStatus(updateData));
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Overview of leave management system</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="rounded-full bg-blue-100 p-3 mr-4">
              <FaUserClock className="text-blue-600 text-xl" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Pending Requests</p>
              <p className="text-2xl font-semibold">{stats.pendingRequests}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="rounded-full bg-green-100 p-3 mr-4">
              <FaUserCheck className="text-green-600 text-xl" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Approved</p>
              <p className="text-2xl font-semibold">{stats.approvedRequests}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="rounded-full bg-red-100 p-3 mr-4">
              <FaUserTimes className="text-red-600 text-xl" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Rejected</p>
              <p className="text-2xl font-semibold">{stats.rejectedRequests}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="rounded-full bg-indigo-100 p-3 mr-4">
              <FaUsers className="text-indigo-600 text-xl" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Total Employees</p>
              <p className="text-2xl font-semibold">{stats.totalEmployees}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Pending approvals list */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="font-semibold text-lg">Pending Leave Applications</h2>
            <p className="text-sm text-gray-500">Requests waiting for approval</p>
          </div>
          <Link to="/admin/leave-requests" className="text-sm text-blue-600 hover:text-blue-800 hover:underline">
            View All
          </Link>
        </div>
        
        {fetchingApplications ? (
          <div className="p-8 flex justify-center">
            <ClipLoader size={40} color="#3B82F6" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Leave Type</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Document</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applied On</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pendingApplications.map((application) => (
                  <tr key={application.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{application.employee?.name}</div>
                          <div className="text-xs text-gray-500">{application.employeeId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{application.employee?.department}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800`}>
                        {application.leaveType.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {formatDate(application.startDate)} - {formatDate(application.endDate)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {application.documentUrl ? (
                        <a 
                          href={application.documentUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 hover:underline text-sm"
                        >
                          View
                        </a>
                      ) : (
                        <span className="text-gray-400 text-sm">None</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {application.createdAt ? formatDate(application.createdAt) : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => handleUpdateLeaveStatus(application.id, 'Approved')}
                        className="text-green-600 hover:text-green-900 mr-4"
                        disabled={submitting}
                      >
                        {submitting ? <ClipLoader size={12} color="#22C55E" /> : 'Approve'}
                      </button>
                      <button 
                        onClick={() => handleUpdateLeaveStatus(application.id, 'Rejected')}
                        className="text-red-600 hover:text-red-900"
                        disabled={submitting}
                      >
                        {submitting ? <ClipLoader size={12} color="#EF4444" /> : 'Reject'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {pendingApplications.length === 0 && !fetchingApplications && (
              <div className="text-center py-8 text-gray-500">
                No pending leave applications to review.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;