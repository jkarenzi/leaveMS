import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaExclamationTriangle, FaFileDownload } from 'react-icons/fa';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { ClipLoader } from 'react-spinners';
import { useAppSelector, useAppDispatch } from '../../redux/hooks';
import { 
  getAllLeaveTypes, 
  createLeaveType, 
  updateLeaveType, 
  deleteLeaveType 
} from '../../redux/actions/leaveTypeActions';
import { resetLeaveTypeStatus } from '../../redux/slices/leaveSlice';
import { LeaveType } from '../../types/LeaveType';
import * as XLSX from 'xlsx';


const LeaveTypes: React.FC = () => {
  // Redux with typed hooks
  const dispatch = useAppDispatch();
  const { leaveTypes, fetchingTypes, submitting, leaveTypeStatus } = useAppSelector(
    (state) => state.leave
  );

  // States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedLeaveType, setSelectedLeaveType] = useState<LeaveType | null>(null);

  // Fetch leave types on component mount
  useEffect(() => {
    dispatch(getAllLeaveTypes());
  }, []);

  // Reset form status after successful operation
  useEffect(() => {
    if (leaveTypeStatus === 'successful') {
      setIsModalOpen(false);
      setIsDeleteModalOpen(false);
      setSelectedLeaveType(null);
      
      // Reset status immediately
      dispatch(resetLeaveTypeStatus());
    }
  }, [leaveTypeStatus]);

  // Calculate accrual rate based on defaultAnnualAllocation
  const calculateAccrualRate = (defaultAnnualAllocation: number) => {
    return defaultAnnualAllocation / 12;
  };

  // Validation schema matching backend requirements (without accrualRate)
  const validationSchema = Yup.object().shape({
    name: Yup.string().required('Leave type name is required'),
    defaultAnnualAllocation: Yup.number()
      .min(0, 'Default annual allocation must be a positive number or zero')
      .required('Default annual allocation is required'),
    maxCarryoverDays: Yup.number()
      .integer('Max carryover days must be an integer')
      .min(0, 'Max carryover days must be a positive number or zero')
      .required('Max carryover days is required')
  });

  // Initialize formik
  const formik = useFormik({
    initialValues: {
      name: '',
      defaultAnnualAllocation: 0,
      accrualRate: 0,
      maxCarryoverDays: 0
    },
    validationSchema,
    onSubmit: (values) => {
      // Calculate accrual rate before submission
      const submissionValues = {
        ...values,
        accrualRate: calculateAccrualRate(values.defaultAnnualAllocation)
      };
      
      if (selectedLeaveType) {
        // Update existing leave type using Redux
        dispatch(
          updateLeaveType({
            id: selectedLeaveType.id,
            formData: submissionValues
          })
        );
      } else {
        // Create new leave type using Redux
        dispatch(createLeaveType(submissionValues));
      }
    },
  });

  // Update accrual rate when defaultAnnualAllocation changes
  useEffect(() => {
    const accrualRate = calculateAccrualRate(formik.values.defaultAnnualAllocation);
    formik.setFieldValue('accrualRate', accrualRate);
  }, [formik.values.defaultAnnualAllocation]);

  // Handle opening the modal for creating a new leave type
  const handleAddNew = () => {
    setSelectedLeaveType(null);
    formik.resetForm({
      values: {
        name: '',
        defaultAnnualAllocation: 0,
        accrualRate: 0,
        maxCarryoverDays: 0
      }
    });
    setIsModalOpen(true);
  };

  // Handle opening the modal for editing a leave type
  const handleEdit = (leaveType: LeaveType) => {
    setSelectedLeaveType(leaveType);
    formik.resetForm({
      values: {
        name: leaveType.name,
        defaultAnnualAllocation: leaveType.defaultAnnualAllocation,
        accrualRate: leaveType.accrualRate,
        maxCarryoverDays: leaveType.maxCarryoverDays
      }
    });
    setIsModalOpen(true);
  };

  // Handle opening the delete confirmation modal
  const handleDeleteClick = (leaveType: LeaveType) => {
    setSelectedLeaveType(leaveType);
    setIsDeleteModalOpen(true);
  };

  // Handle delete confirmation
  const handleDelete = () => {
    if (!selectedLeaveType) return;
    dispatch(deleteLeaveType(selectedLeaveType.id));
  };

  // Handle exporting leave types to Excel
  const handleExport = () => {
    const data = leaveTypes.map(leaveType => ({
      'Type': leaveType.name,
      'Default Annual Allocation': `${leaveType.defaultAnnualAllocation} days`,
      'Accrual Rate': `${leaveType.accrualRate.toFixed(2)} days/month`,
      'Max Carryover Days': `${leaveType.maxCarryoverDays} days`,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    // Set column widths for better readability
    const wscols = [
      { wch: 25 }, // Type name
      { wch: 25 }, // Default annual allocation
      { wch: 20 }, // Accrual rate
      { wch: 20 }  // Max carryover days
    ];
    worksheet['!cols'] = wscols;
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Leave Types");
    XLSX.writeFile(workbook, "leave_types.xlsx");
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Leave Types</h1>
          <p className="text-gray-600">Manage leave types and policies</p>
        </div>
        <div className='flex space-x-3'>
          <button
            onClick={handleExport}
            disabled={fetchingTypes || leaveTypes.length === 0}
            className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 flex items-center disabled:opacity-50"
          >
            <FaFileDownload className="mr-2" />
            Export
          </button>
          <button
            onClick={handleAddNew}
            disabled={submitting}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center disabled:opacity-50"
          >
            <FaPlus className="mr-2" />
            Add Leave Type
          </button>
        </div>
      </div>
      
      {/* Leave types table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {fetchingTypes ? (
          <div className="p-8 flex justify-center">
            <ClipLoader size={40} color="#3B82F6" />
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Default Annual Allocation
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Accrual Rate
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Max Carryover Days
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {leaveTypes.map((leaveType) => (
                <tr key={leaveType.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {leaveType.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{leaveType.defaultAnnualAllocation} days</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{leaveType.accrualRate.toFixed(2)} days/month</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{leaveType.maxCarryoverDays} days</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(leaveType)}
                      disabled={submitting}
                      className="text-indigo-600 hover:text-indigo-900 mr-3 disabled:opacity-50"
                    >
                      <FaEdit className="inline mr-1" /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClick(leaveType)}
                      disabled={submitting}
                      className="text-red-600 hover:text-red-900 disabled:opacity-50"
                    >
                      <FaTrash className="inline mr-1" /> Delete
                    </button>
                  </td>
                </tr>
              ))}
              {leaveTypes.length === 0 && !fetchingTypes && (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    No leave types found. Add your first leave type to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
      
      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              {selectedLeaveType ? 'Edit Leave Type' : 'Add New Leave Type'}
            </h2>
            
            <form onSubmit={formik.handleSubmit}>
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                    formik.touched.name && formik.errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {formik.touched.name && formik.errors.name && (
                  <p className="mt-1 text-sm text-red-600">{formik.errors.name}</p>
                )}
              </div>
              
              <div className="mb-4">
                <label htmlFor="defaultAnnualAllocation" className="block text-sm font-medium text-gray-700 mb-1">
                  Default Annual Allocation (days)
                </label>
                <input
                  type="number"
                  id="defaultAnnualAllocation"
                  name="defaultAnnualAllocation"
                  value={formik.values.defaultAnnualAllocation}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  min="0"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                    formik.touched.defaultAnnualAllocation && formik.errors.defaultAnnualAllocation ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {formik.touched.defaultAnnualAllocation && formik.errors.defaultAnnualAllocation && (
                  <p className="mt-1 text-sm text-red-600">{formik.errors.defaultAnnualAllocation}</p>
                )}
              </div>
              
              <div className="mb-4">
                <label htmlFor="accrualRate" className="block text-sm font-medium text-gray-700 mb-1">
                  Accrual Rate (days/month)
                </label>
                <input
                  type="number"
                  id="accrualRate"
                  name="accrualRate"
                  value={formik.values.accrualRate.toFixed(2)}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Automatically calculated as annual allocation ÷ 12
                </p>
              </div>
              
              <div className="mb-6">
                <label htmlFor="maxCarryoverDays" className="block text-sm font-medium text-gray-700 mb-1">
                  Max Carryover Days
                </label>
                <input
                  type="number"
                  id="maxCarryoverDays"
                  name="maxCarryoverDays"
                  value={formik.values.maxCarryoverDays}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  min="0"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                    formik.touched.maxCarryoverDays && formik.errors.maxCarryoverDays ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {formik.touched.maxCarryoverDays && formik.errors.maxCarryoverDays && (
                  <p className="mt-1 text-sm text-red-600">{formik.errors.maxCarryoverDays}</p>
                )}
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={submitting}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !formik.isValid}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
                >
                  {submitting && <ClipLoader size={16} color="#FFFFFF" className="mr-2" />}
                  {selectedLeaveType ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && selectedLeaveType && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center mb-4 text-red-600">
              <FaExclamationTriangle className="text-xl mr-2" />
              <h2 className="text-xl font-semibold">Delete Leave Type</h2>
            </div>
            
            <p className="mb-6 text-gray-700">
              Are you sure you want to delete "{selectedLeaveType.name}"? This action cannot be undone and may affect employee leave balances.
            </p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={submitting}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={submitting}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center"
              >
                {submitting && <ClipLoader size={16} color="#FFFFFF" className="mr-2" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveTypes;