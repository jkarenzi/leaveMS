import React, { useState } from "react";
import { FaFilter, FaSearch, FaFileDownload, FaEye, FaTimes } from "react-icons/fa";

// Mock data for leave history
const mockLeaveHistory = [
  { 
    id: "LR-001",
    type: "Annual", 
    dateRange: "Mar 1–Mar 5, 2025", 
    startDate: "2025-03-01",
    endDate: "2025-03-05",
    daysCount: 5,
    reason: "Family vacation",
    appliedOn: "Feb 20, 2025",
    status: "Approved",
    approvedBy: "Jane Manager",
    comments: "Approved as requested"
  },
  { 
    id: "LR-002",
    type: "Sick", 
    dateRange: "Feb 15–Feb 16, 2025",
    startDate: "2025-02-15",
    endDate: "2025-02-16", 
    daysCount: 2,
    reason: "Flu",
    appliedOn: "Feb 15, 2025",
    status: "Rejected",
    approvedBy: "John Director",
    comments: "Need medical certificate" 
  },
  { 
    id: "LR-003",
    type: "Compassionate", 
    dateRange: "Jan 10–Jan 12, 2025",
    startDate: "2025-01-10",
    endDate: "2025-01-12", 
    daysCount: 3,
    reason: "Family emergency",
    appliedOn: "Jan 9, 2025",
    status: "Pending",
    approvedBy: "",
    comments: "" 
  },
  { 
    id: "LR-004",
    type: "Annual", 
    dateRange: "Dec 20–Dec 31, 2024",
    startDate: "2024-12-20",
    endDate: "2024-12-31", 
    daysCount: 12,
    reason: "End of year break",
    appliedOn: "Nov 15, 2024",
    status: "Approved",
    approvedBy: "Jane Manager",
    comments: "Enjoy your holiday!" 
  },
  { 
    id: "LR-005",
    type: "Maternity", 
    dateRange: "Sep 1–Nov 30, 2024",
    startDate: "2024-09-01",
    endDate: "2024-11-30", 
    daysCount: 91,
    reason: "Maternity leave",
    appliedOn: "Jul 15, 2024",
    status: "Approved",
    approvedBy: "John Director",
    comments: "Congratulations!" 
  },
];

const LeaveHistory: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterYear, setFilterYear] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedLeave, setSelectedLeave] = useState<typeof mockLeaveHistory[0] | null>(null);
  
  // Filter leave history based on search and filters
  const filteredLeaveHistory = mockLeaveHistory.filter(leave => {
    const matchesSearch = leave.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          leave.dateRange.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          leave.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesYear = filterYear === "all" || 
                       (filterYear === "2025" && leave.startDate.startsWith("2025")) ||
                       (filterYear === "2024" && leave.startDate.startsWith("2024"));
                       
    const matchesType = filterType === "all" || leave.type.toLowerCase() === filterType.toLowerCase();
    
    const matchesStatus = filterStatus === "all" || leave.status.toLowerCase() === filterStatus.toLowerCase();
    
    return matchesSearch && matchesYear && matchesType && matchesStatus;
  });

  // Available years, leave types and statuses for filtering
  const years = ["all", "2025", "2024"];
  const leaveTypes = ["all", "Annual", "Sick", "Compassionate", "Maternity"];
  const statuses = ["all", "Approved", "Rejected", "Pending"];
  
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

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 my-6">
        <h1 className="text-2xl font-bold">Leave History</h1>
        
        <div className="flex items-center space-x-2">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center">
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
                filteredLeaveHistory.map((leave, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {leave.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getLeaveTypeColor(leave.type)}`}>
                        {leave.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {leave.dateRange}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {leave.daysCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {leave.appliedOn}
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
                            className="p-1 text-red-600 hover:text-red-800"
                            title="Cancel request"
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
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getLeaveTypeColor(selectedLeave.type)}`}>
                    {selectedLeave.type} Leave
                  </span>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Date Range</p>
                  <p className="font-medium">{selectedLeave.dateRange}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Days Requested</p>
                  <p className="font-medium">{selectedLeave.daysCount}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className={`font-semibold ${getStatusColor(selectedLeave.status)}`}>
                    {selectedLeave.status}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Applied On</p>
                  <p className="font-medium">{selectedLeave.appliedOn}</p>
                </div>
                
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">Reason</p>
                  <p className="font-medium">{selectedLeave.reason || "No reason provided"}</p>
                </div>
                
                {selectedLeave.status !== "Pending" && (
                  <>
                    <div>
                      <p className="text-sm text-gray-500">Reviewed By</p>
                      <p className="font-medium">{selectedLeave.approvedBy}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Comments</p>
                      <p className="font-medium">{selectedLeave.comments || "No comments"}</p>
                    </div>
                  </>
                )}
              </div>
              
              {selectedLeave.status === "Pending" && (
                <div className="mt-6 flex justify-end">
                  <button className="px-4 py-2 bg-red-600 text-white rounded-md">
                    Cancel Request
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveHistory;