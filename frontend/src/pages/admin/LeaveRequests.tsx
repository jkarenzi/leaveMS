import React, { useState, useEffect, useMemo } from 'react';
import { FaSearch, FaFilter, FaEye, FaCheckCircle, FaTimesCircle, FaFileDownload, FaEllipsisV, FaTimes } from 'react-icons/fa';
import { format } from 'date-fns';
import { ClipLoader } from 'react-spinners';
import { useAppSelector, useAppDispatch } from '../../redux/hooks';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { 
  getAllLeaveApplications, 
  updateLeaveStatus 
} from '../../redux/actions/leaveApplicationActions';
import { LeaveApplication, LeaveStatus, UpdateLeaveStatusFormData } from '../../types/LeaveApplication';
import * as XLSX from 'xlsx';


const LeaveRequests: React.FC = () => {
  // Redux
  const dispatch = useAppDispatch();
  const { 
    leaveApplications, 
    fetchingApplications, 
    submitting,
    applicationStatus 
  } = useAppSelector(state => state.leave);
  const { user } = useAppSelector(state => state.user);

  // States for filters
  const [statusFilter, setStatusFilter] = useState<LeaveStatus | 'ALL'>('ALL');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  
  // State for modals
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<LeaveApplication | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Fetch all leave applications on component mount
  useEffect(() => {
    dispatch(getAllLeaveApplications());
  }, [dispatch]);

  // Filter leave applications based on user role
  const roleFilteredApplications = useMemo(() => {
  if (!user) return leaveApplications;
  
  // Admin sees all applications
  if (user.role === 'admin') return leaveApplications;
  
  // Manager sees only applications from their department
  return leaveApplications.filter(app => 
    app.employee?.department === user.department
  );
}, [leaveApplications, user]);

  // Reset states when operation completes
  useEffect(() => {
    if (applicationStatus === 'successful' && !submitting) {
      setIsApproveModalOpen(false);
      setIsRejectModalOpen(false);
      setSelectedRequest(null);
    }
  }, [applicationStatus, submitting]);

  // Get unique departments from leave applications
  const departments = ['ALL', ...Array.from(
    new Set(leaveApplications.map(request => request.employee?.department || ''))
  ).filter(Boolean)];

  // Filter leave requests based on filters
  // Filter leave requests based on filters
  const filteredRequests = roleFilteredApplications.filter(request => {
    // Status filter
    if (statusFilter !== 'ALL' && request.status !== statusFilter) return false;
    
    // Department filter (only relevant for admins)
    if (user?.role === 'admin' && departmentFilter !== 'ALL' && request.employee?.department !== departmentFilter) return false;
    
    // Search query (search in employee name, ID, or reason)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        (request.employee?.name || '').toLowerCase().includes(query) ||
        request.employeeId.toLowerCase().includes(query) ||
        (request.reason || '').toLowerCase().includes(query);
      
      if (!matchesSearch) return false;
    }
    
    // Date range filter
    if (dateRange.start && new Date(request.startDate) < new Date(dateRange.start)) return false;
    if (dateRange.end && new Date(request.endDate) > new Date(dateRange.end)) return false;
    
    return true;
  });

  // Export data to Excel
  const handleExport = () => {
    const data = filteredRequests.map(request => ({
      'Employee': request.employee?.name || 'Unknown',
      'Employee ID': request.employeeId,
      'Department': request.employee?.department || 'Unknown',
      'Leave Type': request.leaveType.name,
      'Start Date': formatDate(request.startDate),
      'End Date': formatDate(request.endDate),
      'Days': getBusinessDays(request.startDate, request.endDate),
      'Status': request.status,
      'Applied On': formatDate(request.createdAt),
      'Reason': request.reason || 'N/A',
      'Manager Comment': request.managerComment || 'N/A'
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Leave Requests");
    XLSX.writeFile(workbook, "leave_requests.xlsx");
  };
  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (openMenuId && !(event.target as Element).closest('.leave-action-menu')) {
        setOpenMenuId(null);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openMenuId]);

  // Toggle dropdown menu
  const toggleMenu = (id: string) => {
    setOpenMenuId(openMenuId === id ? null : id);
  };

  // Handler for opening the view modal
  const handleViewRequest = (request: LeaveApplication) => {
    setSelectedRequest(request);
    setIsViewModalOpen(true);
    setOpenMenuId(null);
  };

  // Handler for opening the approve modal
  const handleOpenApproveModal = (request: LeaveApplication) => {
    setSelectedRequest(request);
    setIsApproveModalOpen(true);
    setOpenMenuId(null);
  };

  // Handler for opening the reject modal
  const handleOpenRejectModal = (request: LeaveApplication) => {
    setSelectedRequest(request);
    setIsRejectModalOpen(true);
    setOpenMenuId(null);
  };

  // Approve leave request
  const handleApproveRequest = () => {
    if (!selectedRequest) return;
    
    const updateData: UpdateLeaveStatusFormData = {
      id: selectedRequest.id,
      formData: {
        status: 'Approved'
      }
    };
    
    dispatch(updateLeaveStatus(updateData));
  };

  // Validation schema for reject form
  const rejectValidationSchema = Yup.object().shape({
    managerComment: Yup.string().nullable()
  });

  // Initialize formik for reject form
  const rejectFormik = useFormik({
    initialValues: {
      managerComment: ''
    },
    validationSchema: rejectValidationSchema,
    onSubmit: (values) => {
      if (!selectedRequest) return;
      
      const updateData: UpdateLeaveStatusFormData = {
        id: selectedRequest.id,
        formData: {
          status: 'Rejected',
          managerComment: values.managerComment
        }
      };
      
      dispatch(updateLeaveStatus(updateData));
    }
  });

  // Helper to format date strings
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  // Calculate number of business days between two dates (simplified version)
  const getBusinessDays = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // For a more accurate calculation, you would use a library like date-fns
    const daysBetween = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return daysBetween;
  };

  return (
    <div className="p-6 w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Leave Requests</h1>
          <p className="text-gray-600">Manage and process employee leave applications</p>
        </div>
        <button 
          onClick={handleExport}
          className="mt-3 md:mt-0 flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <FaFileDownload className="mr-2" />
          Export Data
        </button>
      </div>
      
      {/* Filters row */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-4">
          {/* Search bar */}
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by employee name or reason..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {/* Status filter */}
          <div className="w-full md:w-48">
            <select
              className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as LeaveStatus | 'ALL')}
            >
              <option value="ALL">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
          
          {/* Department filter - only for admins */}
          {user?.role === 'admin' && (
            <div className="w-full md:w-48">
              <select
                className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
              >
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept === 'ALL' ? 'All Departments' : dept}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          {/* Date filter */}
          <div className="flex space-x-2">
            <div className="w-full md:w-auto flex items-center">
              <FaFilter className="mr-2 text-gray-400" />
              <input
                type="date"
                className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Start date"
                value={dateRange.start}
                onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
              />
            </div>
            <div className="w-full md:w-auto">
              <input
                type="date"
                className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="End date"
                value={dateRange.end}
                onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                min={dateRange.start}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Leave requests table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden w-full">
        {fetchingApplications ? (
          <div className="p-8 flex justify-center">
            <ClipLoader size={40} color="#3B82F6" />
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Leave Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Days
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applied On
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRequests.length > 0 ? (
                  filteredRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{request.employee?.name}</div>
                            <div className="text-xs text-gray-500">{request.employeeId}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{request.employee?.department}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {request.leaveType.name}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {formatDate(request.startDate)} - {formatDate(request.endDate)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {getBusinessDays(request.startDate, request.endDate)} days
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          request.status === 'Approved' ? 'bg-green-100 text-green-800' :
                          request.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                          request.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {request.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(request.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="relative leave-action-menu">
                          <button
                            onClick={() => toggleMenu(request.id)}
                            className="text-gray-500 hover:text-gray-700 focus:outline-none p-1"
                            disabled={submitting}
                          >
                            <FaEllipsisV />
                          </button>
                          {openMenuId === request.id && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                              <div className="py-1" role="menu">
                                <button
                                  onClick={() => handleViewRequest(request)}
                                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  <FaEye className="inline mr-2" /> View Details
                                </button>
                                
                                {request.status === 'Pending' && (
                                  <>
                                    <button
                                      onClick={() => handleOpenApproveModal(request)}
                                      className="block w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-gray-100"
                                    >
                                      <FaCheckCircle className="inline mr-2" /> Approve
                                    </button>
                                    <button
                                      onClick={() => handleOpenRejectModal(request)}
                                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                    >
                                      <FaTimesCircle className="inline mr-2" /> Reject
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                      No leave requests found matching your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* View Leave Request Modal */}
      {isViewModalOpen && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b p-4">
              <h3 className="text-lg font-medium text-gray-900">Leave Request Details</h3>
              <button 
                onClick={() => setIsViewModalOpen(false)} 
                className="text-gray-400 hover:text-gray-500"
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="p-6">
              {/* Employee details */}
              <div className="mb-6 pb-6 border-b">
                <h4 className="text-sm font-medium text-gray-500 mb-4">Employee Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500">Name</div>
                    <div className="font-medium">{selectedRequest.employee?.name}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">ID</div>
                    <div className="font-medium">{selectedRequest.employeeId}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Department</div>
                    <div className="font-medium">{selectedRequest.employee?.department}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Email</div>
                    <div className="font-medium">{selectedRequest.employee?.email}</div>
                  </div>
                </div>
              </div>
              
              {/* Leave details */}
              <div className="mb-6 pb-6 border-b">
                <h4 className="text-sm font-medium text-gray-500 mb-4">Leave Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500">Leave Type</div>
                    <div className="font-medium">{selectedRequest.leaveType.name}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Status</div>
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      selectedRequest.status === 'Approved' ? 'bg-green-100 text-green-800' :
                      selectedRequest.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                      selectedRequest.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedRequest.status}
                    </span>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Duration</div>
                    <div className="font-medium">
                      {formatDate(selectedRequest.startDate)} - {formatDate(selectedRequest.endDate)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Number of Days</div>
                    <div className="font-medium">
                      {getBusinessDays(selectedRequest.startDate, selectedRequest.endDate)} business days
                    </div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-sm text-gray-500">Reason</div>
                    <div className="font-medium">{selectedRequest.reason || "No reason provided"}</div>
                  </div>
                  {selectedRequest.documentUrl && (
                    <div className="col-span-2">
                      <div className="text-sm text-gray-500">Supporting Document</div>
                      <div className="font-medium">
                        <a 
                          href={selectedRequest.documentUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          View Document
                        </a>
                      </div>
                    </div>
                  )}
                  {selectedRequest.managerComment && (
                    <div className="col-span-2">
                      <div className="text-sm text-gray-500">Manager Comment</div>
                      <div className="font-medium">{selectedRequest.managerComment}</div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Application timeline */}
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-4">Timeline</h4>
                <div className="space-y-3">
                  <div className="flex">
                    <div className="w-12 flex-shrink-0 flex justify-center">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-1"></div>
                    </div>
                    <div className="flex-grow">
                      <p className="text-sm font-medium">Application Submitted</p>
                      <p className="text-xs text-gray-500">{formatDate(selectedRequest.createdAt)}</p>
                    </div>
                  </div>
                  {selectedRequest.status !== 'Pending' && (
                    <div className="flex">
                      <div className="w-12 flex-shrink-0 flex justify-center">
                        <div className={`w-2 h-2 rounded-full mt-1 ${
                          selectedRequest.status === 'Approved' ? 'bg-green-600' : 'bg-red-600'
                        }`}></div>
                      </div>
                      <div className="flex-grow">
                        <p className="text-sm font-medium">
                          {selectedRequest.status === 'Approved' ? 'Approved' : 'Rejected'}
                        </p>
                        <p className="text-xs text-gray-500">{formatDate(selectedRequest.updatedAt)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 px-4 py-3 border-t flex justify-end">
              {selectedRequest.status === 'Pending' && (
                <div className="space-x-3">
                  <button
                    onClick={() => {
                      setIsViewModalOpen(false);
                      handleOpenRejectModal(selectedRequest);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-gray-50"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => {
                      setIsViewModalOpen(false);
                      handleOpenApproveModal(selectedRequest);
                    }}
                    className="px-4 py-2 bg-green-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-green-700"
                  >
                    Approve
                  </button>
                </div>
              )}
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Approve Leave Request Modal */}
      {isApproveModalOpen && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="flex justify-between items-center border-b p-4">
              <h3 className="text-lg font-medium text-gray-900">Approve Leave Request</h3>
              <button 
                onClick={() => setIsApproveModalOpen(false)} 
                className="text-gray-400 hover:text-gray-500"
                disabled={submitting}
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="p-6">
              <div className="flex items-center mb-4 text-green-600">
                <FaCheckCircle className="text-xl mr-2" />
                <h4 className="text-lg font-medium">Confirm Approval</h4>
              </div>
              
              <p className="mb-4 text-gray-700">
                Are you sure you want to approve the leave request for <span className="font-medium">{selectedRequest.employee?.name}</span>?
              </p>
              
              <div className="bg-gray-50 rounded-md p-4 mb-4">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500">Leave Type:</span>
                    <span className="font-medium ml-1">{selectedRequest.leaveType.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Duration:</span>
                    <span className="font-medium ml-1">
                      {getBusinessDays(selectedRequest.startDate, selectedRequest.endDate)} days
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-500">Period:</span>
                    <span className="font-medium ml-1">
                      {formatDate(selectedRequest.startDate)} - {formatDate(selectedRequest.endDate)}
                    </span>
                  </div>
                </div>
              </div>
              
              <p className="text-sm text-gray-500 mb-4">
                Approving this request will reduce the employee's leave balance accordingly.
              </p>
            </div>
            
            <div className="bg-gray-50 px-4 py-3 border-t flex justify-end space-x-3">
              <button
                onClick={() => setIsApproveModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                onClick={handleApproveRequest}
                className="px-4 py-2 bg-green-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-green-700 flex items-center"
                disabled={submitting}
              >
                {submitting && <ClipLoader size={16} color="#FFFFFF" className="mr-2" />}
                Approve
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Reject Leave Request Modal */}
      {isRejectModalOpen && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <form onSubmit={rejectFormik.handleSubmit}>
              <div className="flex justify-between items-center border-b p-4">
                <h3 className="text-lg font-medium text-gray-900">Reject Leave Request</h3>
                <button 
                  type="button"
                  onClick={() => setIsRejectModalOpen(false)} 
                  className="text-gray-400 hover:text-gray-500"
                  disabled={submitting}
                >
                  <FaTimes />
                </button>
              </div>
              
              <div className="p-6">
                <div className="flex items-center mb-4 text-red-600">
                  <FaTimesCircle className="text-xl mr-2" />
                  <h4 className="text-lg font-medium">Confirm Rejection</h4>
                </div>
                
                <p className="mb-4 text-gray-700">
                  Are you sure you want to reject the leave request for <span className="font-medium">{selectedRequest.employee?.name}</span>?
                </p>
                
                <div className="bg-gray-50 rounded-md p-4 mb-4">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-500">Leave Type:</span>
                      <span className="font-medium ml-1">{selectedRequest.leaveType.name}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Duration:</span>
                      <span className="font-medium ml-1">
                        {getBusinessDays(selectedRequest.startDate, selectedRequest.endDate)} days
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-500">Period:</span>
                      <span className="font-medium ml-1">
                        {formatDate(selectedRequest.startDate)} - {formatDate(selectedRequest.endDate)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="managerComment" className="block text-sm font-medium text-gray-700 mb-1">
                    Comment (Optional)
                  </label>
                  <textarea
                    id="managerComment"
                    name="managerComment"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
                    placeholder="Provide a reason for rejection (optional)"
                    value={rejectFormik.values.managerComment || ''}
                    onChange={rejectFormik.handleChange}
                    disabled={submitting}
                  ></textarea>
                </div>
              </div>
              
              <div className="bg-gray-50 px-4 py-3 border-t flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsRejectModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-red-700 flex items-center"
                  disabled={submitting}
                >
                  {submitting && <ClipLoader size={16} color="#FFFFFF" className="mr-2" />}
                  Reject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveRequests;