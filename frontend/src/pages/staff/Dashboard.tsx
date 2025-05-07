import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { FaArrowRight, FaPlus } from "react-icons/fa";
import { format, parseISO } from "date-fns";
import { ClipLoader } from "react-spinners";
import { useAppSelector, useAppDispatch } from "../../redux/hooks";
import { getMyLeaveBalances } from "../../redux/actions/leaveBalanceActions";
import { getEmployeeLeaveApplications } from "../../redux/actions/leaveApplicationActions";

// Tailwind color palette for leave types (bg colors with matching text colors)
const COLOR_PALETTE = [
  { bg: "bg-blue-100", text: "text-blue-800" },
  { bg: "bg-yellow-100", text: "text-yellow-800" },
  { bg: "bg-green-100", text: "text-green-800" },
  { bg: "bg-pink-100", text: "text-pink-800" },
  { bg: "bg-purple-100", text: "text-purple-800" },
  { bg: "bg-indigo-100", text: "text-indigo-800" },
  { bg: "bg-red-100", text: "text-red-800" },
  { bg: "bg-orange-100", text: "text-orange-800" },
  { bg: "bg-teal-100", text: "text-teal-800" },
  { bg: "bg-cyan-100", text: "text-cyan-800" },
  { bg: "bg-lime-100", text: "text-lime-800" },
  { bg: "bg-amber-100", text: "text-amber-800" }
];

const StaffDashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.user);
  const { myLeaveBalances, fetchingBalances } = useAppSelector(state => state.leave);
  const { myLeaveApplications, fetchingApplications } = useAppSelector(state => state.leave);

  // Fetch data on component mount
  useEffect(() => {
    dispatch(getMyLeaveBalances());
    if (user?.id) {
      dispatch(getEmployeeLeaveApplications(user.id));
    }
  }, [dispatch, user?.id]);

  // Generate a hash code from a string (for deterministic color assignment)
  const getHashCode = (str: string): number => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash);
  };

  // Get color for a leave type - deterministic but consistent
  const getLeaveTypeColors = (leaveTypeName: string) => {
    const index = getHashCode(leaveTypeName) % COLOR_PALETTE.length;
    return COLOR_PALETTE[index];
  };

  // Format date range for display
  const formatDateRange = (startDate: string, endDate: string) => {
    try {
      const start = format(parseISO(startDate), "MMM d");
      const end = format(parseISO(endDate), "MMM d, yyyy");
      return `${start}–${end}`;
    } catch (error) {
      console.error("Error formatting date range:", error);
      return `${startDate} - ${endDate}`;
    }
  };

  // Get recent leave applications
  const recentLeaves = [...myLeaveApplications]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  return (
    <div className="p-6 space-y-6">
      {/* Header with action */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold">Your Dashboard</h1>
        <Link 
          to="/staff/apply" 
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <FaPlus className="mr-2" />
          Apply for Leave
        </Link>
      </div>

      {/* Leave Balances */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Leave Balances</h2>
          <Link 
            to="/staff/leave-history" 
            className="text-blue-600 hover:text-blue-800 flex items-center text-sm font-medium"
          >
            View History
            <FaArrowRight className="ml-1" size={12} />
          </Link>
        </div>

        {fetchingBalances ? (
          <div className="flex justify-center py-8">
            <ClipLoader size={40} color="#3B82F6" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {myLeaveBalances.length > 0 ? (
              myLeaveBalances.map((balance) => {
                const colors = getLeaveTypeColors(balance.leaveType.name);
                return (
                  <div
                    key={balance.id}
                    className={`rounded-lg shadow p-4 ${colors.bg}`}
                  >
                    <p className={`text-sm font-medium ${colors.text}`}>
                      {balance.leaveType.name} Leave
                    </p>
                    <p className={`text-2xl font-bold ${colors.text}`}>
                      {balance.balance.toFixed(2)} days
                    </p>
                    {balance.excessDays > 0 && (
                      <p className="text-xs mt-1 text-red-600 font-medium">
                        {balance.excessDays.toFixed(2)} days expire on Jan 31st
                      </p>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="col-span-full text-center py-8 text-gray-500">
                No leave balances available.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Recent Leave Applications */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Recent Applications</h2>
          <Link 
            to="/staff/leave-history"
            className="text-blue-600 hover:text-blue-800 flex items-center text-sm font-medium"
          >
            View All
            <FaArrowRight className="ml-1" size={12} />
          </Link>
        </div>

        {fetchingApplications ? (
          <div className="flex justify-center py-8">
            <ClipLoader size={24} color="#3B82F6" />
          </div>
        ) : (
          <div className="space-y-3">
            {recentLeaves.length > 0 ? (
              recentLeaves.map((leave) => {
                const colors = getLeaveTypeColors(leave.leaveType.name);
                return (
                  <div
                    key={leave.id}
                    className="flex justify-between items-center border-b pb-3"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-0.5 text-xs rounded-full ${colors.bg} ${colors.text}`}>
                          {leave.leaveType.name}
                        </span>
                        <p className="text-sm text-gray-600">
                          {formatDateRange(leave.startDate, leave.endDate)}
                        </p>
                      </div>
                      {leave.reason && (
                        <p className="text-xs text-gray-500 mt-1 truncate max-w-md">
                          {leave.reason}
                        </p>
                      )}
                    </div>
                    <span
                      className={`text-sm font-semibold ${
                        leave.status === "Approved"
                          ? "text-green-600"
                          : leave.status === "Rejected"
                          ? "text-red-600"
                          : "text-yellow-600"
                      }`}
                    >
                      {leave.status}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-gray-500">
                No leave applications found.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-xl font-semibold mb-4">Quick Links</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <Link 
            to="/staff/apply"
            className="flex items-center p-3 rounded-md border hover:bg-gray-50 transition-colors"
          >
            <FaPlus className="text-blue-500 mr-3" />
            <span>Apply for Leave</span>
          </Link>
          <Link 
            to="/staff/leave-history"
            className="flex items-center p-3 rounded-md border hover:bg-gray-50 transition-colors"
          >
            <FaArrowRight className="text-blue-500 mr-3" />
            <span>View Leave History</span>
          </Link>
          <Link 
            to="/staff/team-calendar"
            className="flex items-center p-3 rounded-md border hover:bg-gray-50 transition-colors sm:col-span-2"
          >
            <FaArrowRight className="text-blue-500 mr-3" />
            <span>View Team Calendar</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;