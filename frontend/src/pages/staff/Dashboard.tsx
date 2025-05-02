// src/pages/dashboard/staff/StaffDashboard.tsx
import React from "react";

const mockLeaveBalance = {
  annual: 12.32,
  sick: 4,
  maternity: 0,
  compassionate: 1,
};

const leaveHistory = [
  { type: "Annual", dateRange: "Mar 1–Mar 5, 2025", status: "Approved" },
  { type: "Sick", dateRange: "Feb 15–Feb 16, 2025", status: "Rejected" },
  { type: "Compassionate", dateRange: "Jan 10–Jan 12, 2025", status: "Pending" },
];

const colleaguesOnLeave = [
  { name: "Jane Doe", avatar: "/user.png", leaveUntil: "May 2, 2025" },
  { name: "John Smith", avatar: "/user.png", leaveUntil: "May 5, 2025" },
];

const colorMap: Record<string, string> = {
  annual: "bg-blue-100",
  sick: "bg-yellow-100",
  maternity: "bg-pink-100",
  compassionate: "bg-green-100",
};

const StaffDashboard: React.FC = () => {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Leave Balances</h1>

      {/* Leave Balances */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(mockLeaveBalance).map(([type, balance]) => (
          <div
            key={type}
            className={`rounded-lg shadow p-4 ${colorMap[type] || "bg-gray-100"}`}
          >
            <p className="text-sm capitalize text-gray-600">{type} Leave</p>
            <p className="text-2xl font-bold">{balance.toFixed(2)} days</p>
          </div>
        ))}
      </div>

      {/* Leave History */}
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-xl font-semibold mb-4">Leave History</h2>
        <div className="space-y-3">
          {leaveHistory.map((entry, idx) => (
            <div
              key={idx}
              className="flex justify-between items-center border-b pb-2"
            >
              <div>
                <p className="font-medium">{entry.type} Leave</p>
                <p className="text-sm text-gray-600">{entry.dateRange}</p>
              </div>
              <span
                className={`text-sm font-semibold ${
                  entry.status === "Approved"
                    ? "text-green-600"
                    : entry.status === "Rejected"
                    ? "text-red-600"
                    : "text-yellow-600"
                }`}
              >
                {entry.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Colleagues on Leave */}
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-xl font-semibold mb-4">Colleagues on Leave</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {colleaguesOnLeave.map((colleague, idx) => (
            <div
              key={idx}
              className="flex items-center space-x-3 border rounded p-2 hover:bg-gray-50"
            >
              <img
                src={colleague.avatar}
                alt={colleague.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <p className="font-medium">{colleague.name}</p>
                <p className="text-sm text-gray-600">
                  On leave until {colleague.leaveUntil}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
