import React, { useState, useEffect } from 'react';
import { FaSearch, FaPlus, FaEllipsisV, FaFileDownload, FaTimes } from 'react-icons/fa';
import { useFormik } from 'formik';
import * as Yup from 'yup';
// import { format } from 'date-fns';
import { ClipLoader } from 'react-spinners';
import { useAppSelector, useAppDispatch } from '../../redux/hooks';
import { 
  getAllLeaveBalances, 
  adjustLeaveBalance, 
  initializeLeaveBalances 
} from '../../redux/actions/leaveBalanceActions';
import { getAllLeaveTypes } from '../../redux/actions/leaveTypeActions';
import { LeaveBalance, UpdateLeaveBalanceFormData, UserWithLeaveBalances } from '../../types/LeaveBalance';
import * as XLSX from 'xlsx';


const Employees: React.FC = () => {
  // Redux
  const dispatch = useAppDispatch();
  const { 
    usersWithLeaveBalances,  
    fetchingBalances, 
    submitting,
    leaveBalanceStatus 
  } = useAppSelector(state => state.leave);
  const { leaveTypes } = useAppSelector(state => state.leave);
  const { user } = useAppSelector(state => state.user);

  // States
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [selectedEmployee, setSelectedEmployee] = useState<UserWithLeaveBalances | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isAdjustBalanceModalOpen, setIsAdjustBalanceModalOpen] = useState(false);
  const [selectedBalance, setSelectedBalance] = useState<LeaveBalance | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Export employee data to Excel
  const handleExport = () => {
    const data = filteredEmployees.map(employee => ({
      'Name': employee.name,
      'Email': employee.email,
      'Department': employee.department,
      'Role': employee.role || 'Staff',
      ...employee.leaveBalances?.reduce((acc, balance) => ({
        ...acc,
        [`${balance.leaveType.name} Balance`]: balance.balance.toFixed(1) + ' days',
        [`${balance.leaveType.name} Carried Over`]: balance.carriedOver.toFixed(1) + ' days'
      }), {})
    }));
  
    const worksheet = XLSX.utils.json_to_sheet(data);
      // Set column widths for better readability
    const wscols = [
      { wch: 25 }, // Name
      { wch: 35 }, // Email 
      { wch: 20 }, // Department
      { wch: 15 }, // Role
      // Dynamic columns for leave balances
      ...Array(leaveTypes.length * 2).fill({ wch: 15 })
    ];
    worksheet['!cols'] = wscols;
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Employees");
    XLSX.writeFile(workbook, "employees_data.xlsx");
  };
  
  // Generate unique departments list from users data
  const departments = usersWithLeaveBalances 
    ? ['ALL', ...Array.from(new Set(usersWithLeaveBalances.map(user => user.department)))]
    : ['ALL'];

  // Load data on component mount
  useEffect(() => {
    dispatch(getAllLeaveTypes());
    dispatch(getAllLeaveBalances());
  }, [dispatch]);

  // Reset states when operation completes
  useEffect(() => {
    if (leaveBalanceStatus === 'successful' && !submitting) {
      setIsAdjustBalanceModalOpen(false);
      setSelectedBalance(null);
    }
  }, [leaveBalanceStatus, submitting]);

  // Filter employees based on search and department
  // Filter employees based on search, department, and user role
  const filteredEmployees = usersWithLeaveBalances.filter(employee => {
    // Base filtering for search
    const fullName = `${employee.name}`.toLowerCase();
    const matchesSearch = 
      searchQuery === '' || 
      fullName.includes(searchQuery.toLowerCase()) || 
      employee.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Department filtering is different based on role
    let matchesDepartment = true;
    
    if (user?.role === 'admin') {
      // Admins can filter by any department
      matchesDepartment = departmentFilter === 'ALL' || employee.department === departmentFilter;
    } else if (user?.role === 'manager') {
      // Managers can only see employees in their department
      matchesDepartment = employee.department === user?.department;
    }
    
    return matchesSearch && matchesDepartment;
  });

  // Handle viewing employee details
  const handleViewEmployee = (employee: UserWithLeaveBalances) => {
    setSelectedEmployee(employee);
    setIsViewModalOpen(true);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (openMenuId && !(event.target as Element).closest('.employee-action-menu')) {
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

  // Handle opening the adjust balance modal
  const handleAdjustBalance = (balance: LeaveBalance) => {
    setSelectedBalance(balance);
    setIsAdjustBalanceModalOpen(true);
  };

  // Validation schema for balance adjustment
  const adjustBalanceSchema = Yup.object().shape({
    balance: Yup.number()
      .min(0, 'Balance must be a positive number or zero')
      .nullable(),
    carriedOver: Yup.number()
      .min(0, 'Carried over days must be a positive number or zero')
      .nullable(),
  }).test(
    'at-least-one-field',
    'At least one of balance or carried over must be provided',
    values => values.balance !== undefined || values.carriedOver !== undefined
  );

  // Initialize formik for balance adjustment
  const adjustBalanceFormik = useFormik({
    initialValues: {
      balance: selectedBalance?.balance || 0,
      carriedOver: selectedBalance?.carriedOver || 0,
    },
    enableReinitialize: true,
    validationSchema: adjustBalanceSchema,
    onSubmit: (values) => {
      if (!selectedBalance) return;
      
      // Create the update data payload
      const updateData: UpdateLeaveBalanceFormData = {
        id: selectedBalance.id,
        formData: {
          balance: values.balance !== undefined ? values.balance : selectedBalance.balance,
          carriedOver: values.carriedOver !== undefined ? values.carriedOver : selectedBalance.carriedOver,
        }
      };
      
      // Dispatch the adjustment action
      dispatch(adjustLeaveBalance(updateData));
    }
  });

  // Initialize leave balances for an employee
  const initializeEmployeeBalances = (employeeId: string) => {
    dispatch(initializeLeaveBalances({ employeeId }));
  };

  // Helper function to format date
  // const formatDate = (dateString: string) => {
  //   return format(new Date(dateString), 'MMM d, yyyy');
  // };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Employees</h1>
          <p className="text-gray-600">Manage employees and their leave balances</p>
        </div>
        <button 
          onClick={() => console.log('Add new employee')} 
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
        >
          <FaPlus className="mr-2" />
          Add Employee
        </button>
      </div>
      
      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-grow">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search employees by name, email..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          {/* Only show department filter for admins */}
          {user?.role === 'admin' && (
            <div>
              <select
                className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
          
          <div>
            <button 
              onClick={handleExport} 
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <FaFileDownload className="mr-2" />
              Export
            </button>
          </div>
        </div>
      </div>
      
      {/* Employees Table */}
      <div className="bg-white rounded-lg shadow">
        {fetchingBalances ? (
          <div className="flex justify-center items-center p-8">
            <ClipLoader size={40} color="#3B82F6" />
          </div>
        ) : (
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
                  Leave Balances
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEmployees.length > 0 ? (
                filteredEmployees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {employee.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {employee.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{employee.department}</div>
                    </td>
                    <td className="px-6 py-4">
                      {employee.leaveBalances && employee.leaveBalances.length > 0 ? (
                        <div className="text-sm text-gray-900">
                          {employee.leaveBalances.slice(0, 2).map((balance) => (
                            <div key={balance.id} className="mb-1">
                              <span className="font-medium">{balance.leaveType.name}:</span> {balance.balance.toFixed(1)} days
                              {balance.carriedOver > 0 && (
                                <span className="ml-1 text-gray-500 text-xs">
                                  (incl. {balance.carriedOver.toFixed(1)} carried over)
                                </span>
                              )}
                            </div>
                          ))}
                          {employee.leaveBalances.length > 2 && (
                            <div className="text-blue-600 text-xs cursor-pointer" onClick={() => handleViewEmployee(employee)}>
                              + {employee.leaveBalances.length - 2} more
                            </div>
                          )}
                        </div>
                      ) : (
                        <button 
                          onClick={() => initializeEmployeeBalances(employee.id)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          disabled={submitting}
                        >
                          {submitting ? <ClipLoader size={12} color="#3B82F6" /> : 'Initialize balances'}
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="relative employee-action-menu">
                        <button
                          onClick={() => toggleMenu(employee.id)}
                          className="text-gray-500 hover:text-gray-700 focus:outline-none p-1"
                        >
                          <FaEllipsisV />
                        </button>
                        {openMenuId === employee.id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                            <div className="py-1" role="menu">
                              <button
                                onClick={() => handleViewEmployee(employee)}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                View Details
                              </button>
                              {employee.leaveBalances && employee.leaveBalances.length > 0 && (
                                <button
                                  onClick={() => handleViewEmployee(employee)}
                                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  Manage Leave Balances
                                </button>
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
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No employees found matching your search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Employee Details Modal with Leave Balances */}
      {isViewModalOpen && selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl mx-4">
            <div className="flex justify-between items-center border-b p-4">
              <h3 className="text-lg font-medium text-gray-900">Employee Details</h3>
              <button 
                onClick={() => setIsViewModalOpen(false)} 
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6 mb-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Name</h4>
                  <p className="mt-1">{selectedEmployee.name}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Email</h4>
                  <p className="mt-1">{selectedEmployee.email}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Department</h4>
                  <p className="mt-1">{selectedEmployee.department}</p>
                </div>
              </div>
              
              <div className="mt-6">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-medium">Leave Balances</h4>
                  {(!selectedEmployee.leaveBalances || selectedEmployee.leaveBalances.length === 0) && (
                    <button 
                      onClick={() => initializeEmployeeBalances(selectedEmployee.id)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      disabled={submitting}
                    >
                      {submitting ? <ClipLoader size={12} color="#3B82F6" /> : 'Initialize balances'}
                    </button>
                  )}
                </div>
                
                {selectedEmployee.leaveBalances && selectedEmployee.leaveBalances.length > 0 ? (
                  <div className="bg-gray-50 rounded-md overflow-hidden">
                    <table className="min-w-full">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Leave Type
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Current Balance
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Carried Over
                          </th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {selectedEmployee.leaveBalances.map(balance => (
                          <tr key={balance.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 whitespace-nowrap text-sm">
                              {balance.leaveType.name}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm">
                              {balance.balance.toFixed(1)} days
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm">
                              {balance.carriedOver.toFixed(1)} days
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-right text-sm">
                              <button 
                                onClick={() => handleAdjustBalance(balance)}
                                className="text-blue-600 hover:text-blue-900"
                                disabled={submitting}
                              >
                                {submitting ? <ClipLoader size={12} color="#3B82F6" /> : 'Adjust'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    No leave balances available for this employee.
                  </p>
                )}
              </div>
            </div>
            
            <div className="bg-gray-50 px-4 py-3 border-t flex justify-end">
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

      {/* Adjust Balance Modal */}
      {isAdjustBalanceModalOpen && selectedBalance && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <form onSubmit={adjustBalanceFormik.handleSubmit}>
              <div className="flex justify-between items-center border-b p-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Adjust Leave Balance
                </h3>
                <button 
                  type="button"
                  onClick={() => setIsAdjustBalanceModalOpen(false)} 
                  className="text-gray-400 hover:text-gray-500 focus:outline-none"
                  disabled={submitting}
                >
                  <FaTimes />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">
                    {selectedBalance.leaveType.name} Balance for {selectedBalance.employee?.name}
                  </h4>
                  <p className="text-sm text-gray-500 mb-4">
                    Current balance: {selectedBalance.balance.toFixed(1)} days 
                    (including {selectedBalance.carriedOver.toFixed(1)} carried over)
                  </p>
                </div>
                
                <div>
                  <label htmlFor="balance" className="block text-sm font-medium text-gray-700 mb-1">
                    Update Balance
                  </label>
                  <input
                    type="number"
                    id="balance"
                    name="balance"
                    value={adjustBalanceFormik.values.balance}
                    onChange={adjustBalanceFormik.handleChange}
                    onBlur={adjustBalanceFormik.handleBlur}
                    step="0.5"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    disabled={submitting}
                  />
                  {adjustBalanceFormik.touched.balance && adjustBalanceFormik.errors.balance && (
                    <p className="mt-1 text-sm text-red-600">{adjustBalanceFormik.errors.balance}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="carriedOver" className="block text-sm font-medium text-gray-700 mb-1">
                    Carried Over Days
                  </label>
                  <input
                    type="number"
                    id="carriedOver"
                    name="carriedOver"
                    value={adjustBalanceFormik.values.carriedOver}
                    onChange={adjustBalanceFormik.handleChange}
                    onBlur={adjustBalanceFormik.handleBlur}
                    step="0.5"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    disabled={submitting}
                  />
                  {adjustBalanceFormik.touched.carriedOver && adjustBalanceFormik.errors.carriedOver && (
                    <p className="mt-1 text-sm text-red-600">{adjustBalanceFormik.errors.carriedOver}</p>
                  )}
                </div>
                
                {/* If form-level validation error exists, show it */}
                {typeof adjustBalanceFormik.errors === 'string' && (
                  <p className="mt-1 text-sm text-red-600">{adjustBalanceFormik.errors}</p>
                )}
              </div>
              
              <div className="bg-gray-50 px-4 py-3 border-t flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsAdjustBalanceModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-200"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 flex items-center"
                  disabled={submitting}
                >
                  {submitting && <ClipLoader size={16} color="#FFFFFF" className="mr-2" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;