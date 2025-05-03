import React, { useState, useEffect } from "react";
import { FaFilter, FaSearch, FaFileDownload, FaEye, FaTimes, FaExclamationTriangle } from "react-icons/fa";
import { format, parseISO } from "date-fns";
import { ClipLoader } from "react-spinners";
import { useAppSelector, useAppDispatch } from "../../redux/hooks";
import { getEmployeeLeaveApplications, deleteLeaveApplication } from "../../redux/actions/leaveApplicationActions";
import { resetApplicationStatus } from "../../redux/slices/leaveSlice";
import { LeaveApplication, LeaveStatus } from "../../types/LeaveApplication";
import { differenceInBusinessDays } from "date-fns";
import * as XLSX from 'xlsx';

const LeaveHistory: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.user);
  const { myLeaveApplications, fetchingApplications, submitting, applicationStatus } = useAppSelector(state => state.leave);
  
  // Local state
  const [searchTerm, setSearchTerm] = useState("");
  const [filterYear, setFilterYear] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedLeave, setSelectedLeave] = useState<LeaveApplication | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [leaveToDelete, setLeaveToDelete] = useState<string | null>(null);
  
  // Fetch leave applications on component mount
  useEffect(() => {
    if (user?.id) {
      dispatch(getEmployeeLeaveApplications(user.id));
    }
  }, [dispatch, user?.id]);
  
  // Reset application status when component unmounts
  useEffect(() => {
    return () => {
      dispatch(resetApplicationStatus());
    };
  }, [dispatch]);
  
  // Close the delete modal and refresh data when operation is successful
  useEffect(() => {
    if (applicationStatus === 'successful' && !submitting) {
      setIsDeleteModalOpen(false);
      setLeaveToDelete(null);
    }
  }, [applicationStatus, submitting]);

  // Format date to readable format
  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), "MMM d, yyyy");
    } catch (error) {
      return dateString;
    }
  };
  
  // Format date range
  const formatDateRange = (startDate: string, endDate: string) => {
    try {
      const start = format(parseISO(startDate), "MMM d");
      const end = format(parseISO(endDate), "MMM d, yyyy");
      return `${start}–${end}`;
    } catch (error) {
      return `${startDate} - ${endDate}`;
    }
  };
  
  // Calculate business days
  const calculateBusinessDays = (startDate: string, endDate: string) => {
    try {
      return differenceInBusinessDays(parseISO(endDate), parseISO(startDate)) + 1;
    } catch (error) {
      return 0;
    }
  };
  
  // Filter leave history based on search and filters
  const filteredLeaveHistory = myLeaveApplications.filter(leave => {
    const matchesSearch = 
      (leave.leaveType?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${formatDateRange(leave.startDate, leave.endDate)}`.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesYear = filterYear === "all" || 
                       (filterYear && leave.startDate && leave.startDate.startsWith(filterYear));
                       
    const matchesType = filterType === "all" || 
                       (leave.leaveType?.name.toLowerCase() === filterType.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || 
                         (leave.status.toLowerCase() === filterStatus.toLowerCase());
    
    return matchesSearch && matchesYear && matchesType && matchesStatus;
  });

  // Get unique years from leave applications
  const years = ["all", ...Array.from(new Set(
    myLeaveApplications
      .map(leave => leave.startDate?.substring(0, 4))
      .filter(Boolean)
  ))];
  
  // Get unique leave types from applications
  const leaveTypes = ["all", ...Array.from(new Set(
    myLeaveApplications
      .map(leave => leave.leaveType?.name)
      .filter(Boolean)
  ))];
  
  // All possible statuses
  const statuses: Array<"all" | LeaveStatus> = ["all", "Approved", "Rejected", "Pending"];
  
  // Color utilities
  const getStatusColor = (status: string) => {
    switch(status) {
      case "Approved": return "text-green-600";
      case "Rejected": return "text-red-600";
      case "Pending": return "text-yellow-600";
      default: return "text-gray-600";
    }
  };
  
  const getLeaveTypeColor = (type: string) => {
    switch(type.toLowerCase()) {
      case "annual": return "bg-blue-100 text-blue-800";
      case "sick": return "bg-yellow-100 text-yellow-800";
      case "compassionate": return "bg-green-100 text-green-800";
      case "maternity": return "bg-pink-100 text-pink-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };
  
  // Handle delete confirmation
  const handleDeleteClick = (leaveId: string) => {
    setLeaveToDelete(leaveId);
    setIsDeleteModalOpen(true);
  };
  
  // Delete the leave application
  const confirmDelete = () => {
    if (leaveToDelete) {
      dispatch(deleteLeaveApplication(leaveToDelete));
    }
  };
  
  // Export leave history to Excel
  const handleExport = () => {
    const data = filteredLeaveHistory.map(leave => ({
      'ID': leave.id,
      'Type': leave.leaveType?.name,
      'Start Date': formatDate(leave.startDate),
      'End Date': formatDate(leave.endDate),
      'Days': calculateBusinessDays(leave.startDate, leave.endDate),
      'Reason': leave.reason || 'N/A',
      'Status': leave.status,
      'Applied On': formatDate(leave.createdAt),
      'Manager Comment': leave.managerComment || 'N/A'
    }));
    
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Leave History");
    XLSX.writeFile(workbook, "leave_history.xlsx");
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 my-6">
        <h1 className="text-2xl font-bold">Leave History</h1>
        
        <div className="flex items-center space-x-2">
          <button 
            className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center"
            onClick={handleExport}
          >
            <FaFileDownload className="mr-2" />
            Export
          </button>
        </div>
      </div>
      
      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-4  my-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-grow relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search leave requests..."
              className="pl-10 pr-4 py-2 w-full border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex flex-col md:flex-row gap-2 md:items-center">
            <div className="flex items-center">
              <FaFilter className="text-gray-500 mr-2" />
              <span className="text-sm text-gray-500 mr-2">Filters:</span>
            </div>
            
            <select 
              className="border rounded-md px-3 py-2 text-sm"
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
            >
              {years.map(year => (
                <option key={year} value={year}>{year === "all" ? "All Years" : year}</option>
              ))}
            </select>
            
            <select 
              className="border rounded-md px-3 py-2 text-sm"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              {leaveTypes.map(type => (
                <option key={type} value={type}>{type === "all" ? "All Types" : `${type} Leave`}</option>
              ))}
            </select>
            
            <select 
              className="border rounded-md px-3 py-2 text-sm"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              {statuses.map(status => (
                <option key={status} value={status}>{status === "all" ? "All Statuses" : status}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {/* Leave History Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden my-6">
        {fetchingApplications ? (
          <div className="p-8 flex justify-center">
            <ClipLoader size={40} color="#3B82F6" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date Range
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Days
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applied On
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLeaveHistory.length > 0 ? (
                  filteredLeaveHistory.map((leave) => (
                    <tr key={leave.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {leave.id.substring(0, 8)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getLeaveTypeColor(leave.leaveType?.name || '')}`}>
                          {leave.leaveType?.name}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDateRange(leave.startDate, leave.endDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {calculateBusinessDays(leave.startDate, leave.endDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(leave.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-semibold ${getStatusColor(leave.status)}`}>
                          {leave.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => setSelectedLeave(leave)}
                            className="p-1 text-blue-600 hover:text-blue-800"
                            title="View details"
                          >
                            <FaEye />
                          </button>
                          
                          {leave.status === "Pending" && (
                            <button 
                              onClick={() => handleDeleteClick(leave.id)}
                              className="p-1 text-red-600 hover:text-red-800"
                              title="Cancel request"
                              disabled={submitting}
                            >
                              <FaTimes />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                      No leave requests found matching your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Leave Details Modal */}
      {selectedLeave && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Leave Request Details</h3>
                <button 
                  onClick={() => setSelectedLeave(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimes />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Request ID</p>
                  <p className="font-medium">{selectedLeave.id}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Type</p>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getLeaveTypeColor(selectedLeave.leaveType?.name || '')}`}>
                    {selectedLeave.leaveType?.name} Leave
                  </span>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Date Range</p>
                  <p className="font-medium">{formatDateRange(selectedLeave.startDate, selectedLeave.endDate)}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Days Requested</p>
                  <p className="font-medium">{calculateBusinessDays(selectedLeave.startDate, selectedLeave.endDate)}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className={`font-semibold ${getStatusColor(selectedLeave.status)}`}>
                    {selectedLeave.status}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Applied On</p>
                  <p className="font-medium">{formatDate(selectedLeave.createdAt)}</p>
                </div>
                
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">Reason</p>
                  <p className="font-medium">{selectedLeave.reason || "No reason provided"}</p>
                </div>
                
                {selectedLeave.documentUrl && (
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500">Supporting Document</p>
                    <p className="font-medium">
                      <a 
                        href={selectedLeave.documentUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        View Document
                      </a>
                    </p>
                  </div>
                )}
                
                {selectedLeave.status !== "Pending" && (
                  <>
                    <div>
                      <p className="text-sm text-gray-500">Comments</p>
                      <p className="font-medium">{selectedLeave.managerComment || "No comments"}</p>
                    </div>
                  </>
                )}
              </div>
              
              {selectedLeave.status === "Pending" && (
                <div className="mt-6 flex justify-end">
                  <button 
                    className="px-4 py-2 bg-red-600 text-white rounded-md flex items-center"
                    onClick={() => {
                      setSelectedLeave(null);
                      handleDeleteClick(selectedLeave.id);
                    }}
                    disabled={submitting}
                  >
                    {submitting && <ClipLoader size={16} color="#FFFFFF" className="mr-2" />}
                    Cancel Request
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center mb-4 text-red-600">
                <FaExclamationTriangle className="text-xl mr-2" />
                <h3 className="text-lg font-bold">Cancel Leave Request</h3>
              </div>
              
              <p className="mb-6 text-gray-700">
                Are you sure you want to cancel this leave request? This action cannot be undone.
              </p>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  disabled={submitting}
                >
                  No, Keep It
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-red-400 flex items-center"
                  disabled={submitting}
                >
                  {submitting && <ClipLoader size={16} color="#FFFFFF" className="mr-2" />}
                  Yes, Cancel Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveHistory;