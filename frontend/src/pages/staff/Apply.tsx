import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { FaPaperclip, FaInfoCircle } from "react-icons/fa";
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { useUploadImage } from "../../services/upload";

// Mock data for leave types
const leaveTypes = [
  { id: "annual", name: "Annual", balance: 16.5, requiresReason: false, requiresDocument: false },
  { id: "sick", name: "Sick", balance: 10, requiresReason: true, requiresDocument: true },
  { id: "compassionate", name: "Compassionate", balance: 3, requiresReason: true, requiresDocument: false },
  { id: "maternity", name: "Maternity", balance: 90, requiresReason: false, requiresDocument: true },
];

const ApplyLeave: React.FC = () => {
  const [daysRequested, setDaysRequested] = useState(0);
  const [selectedLeaveType, setSelectedLeaveType] = useState<typeof leaveTypes[0] | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [imageProgress, setImageProgress] = useState<number | null>(null);
  const [imageLoading, setImageLoading] = useState(false);

  // Validation schema to match the backend schema
  const validationSchema = Yup.object({
    leaveTypeId: Yup.string().required("Leave type is required"),
    startDate: Yup.date().required("Start date is required"),
    endDate: Yup.date()
      .required("End date is required")
      .min(Yup.ref("startDate"), "End date must be after or equal to start date"),
    reason: Yup.string().nullable(),
    documentUrl: Yup.string().nullable().url("Document URL must be a valid URL")
  });

  const formik = useFormik({
    initialValues: {
      employeeId: "", // This will be set from authenticated user info in Redux
      leaveTypeId: "",
      startDate: "",
      endDate: "",
      reason: "",
      documentUrl: null,
    },
    validationSchema,
    onSubmit: async (values) => {
      console.log("Form submitted:", values);
      // Will be implemented in Stage 2 with Redux
      alert("Leave application submitted successfully!");
    },
  });

  // Calculate business days between dates
  const calculateBusinessDays = () => {
    if (!formik.values.startDate || !formik.values.endDate) return 0;

    let count = 0;
    const startDate = new Date(formik.values.startDate);
    const endDate = new Date(formik.values.endDate);
    
    // Reset time to avoid time zone issues
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);
    
    const current = new Date(startDate);
    while (current <= endDate) {
      const dayOfWeek = current.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) count++; // Skip weekends
      current.setDate(current.getDate() + 1);
    }
    
    setDaysRequested(count);
    return count;
  };

    // Update days calculation when dates change
    useEffect(() => {
        calculateBusinessDays();
    }, [formik.values.startDate, formik.values.endDate]);

    // Update selected leave type when form value changes
    useEffect(() => {
        const selected = leaveTypes.find(lt => lt.id === formik.values.leaveTypeId);
        setSelectedLeaveType(selected || null);
    }, [formik.values.leaveTypeId]);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.currentTarget.files?.[0];
        if (file) {
            setSelectedFileName(file.name);
            const {url} = await useUploadImage(file, setImageProgress, setImageLoading);
            formik.setFieldValue("documentUrl", url);
        }
    };

  // Check if there's enough balance
  const isBalanceExceeded = () => {
    if (!selectedLeaveType || daysRequested <= 0) return false;
    return daysRequested > selectedLeaveType.balance;
  };

  // Get today's date formatted for min attribute
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Apply for Leave</h1>
      
      <form onSubmit={formik.handleSubmit}>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Leave Type */}
            <div>
              <label htmlFor="leaveTypeId" className="block text-sm font-medium text-gray-700 mb-1">
                Leave Type*
              </label>
              <select
                id="leaveTypeId"
                name="leaveTypeId"
                className={`w-full border rounded-md px-3 py-2 ${
                  formik.touched.leaveTypeId && formik.errors.leaveTypeId
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.leaveTypeId}
              >
                <option value="">Select Leave Type</option>
                {leaveTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name} Leave (Balance: {type.balance} days)
                  </option>
                ))}
              </select>
              {formik.touched.leaveTypeId && formik.errors.leaveTypeId ? (
                <p className="mt-1 text-xs text-red-500">{formik.errors.leaveTypeId}</p>
              ) : null}
            </div>

            {/* Start Date */}
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                Start Date*
              </label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                className={`w-full border rounded-md px-3 py-2 ${
                  formik.touched.startDate && formik.errors.startDate
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
                value={formik.values.startDate}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                min={today}
              />
              {formik.touched.startDate && formik.errors.startDate ? (
                <p className="mt-1 text-xs text-red-500">{String(formik.errors.startDate)}</p>
              ) : null}
            </div>

            {/* End Date */}
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                End Date*
              </label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                className={`w-full border rounded-md px-3 py-2 ${
                  formik.touched.endDate && formik.errors.endDate
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
                value={formik.values.endDate}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                min={formik.values.startDate || today}
              />
              {formik.touched.endDate && formik.errors.endDate ? (
                <p className="mt-1 text-xs text-red-500">{String(formik.errors.endDate)}</p>
              ) : null}
            </div>

            {/* Reason */}
            <div>
              <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
                Reason {selectedLeaveType?.requiresReason ? "*" : "(Optional)"}
              </label>
              <textarea
                id="reason"
                name="reason"
                rows={4}
                className={`w-full border rounded-md px-3 py-2 ${
                  formik.touched.reason && formik.errors.reason
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.reason || ""}
                placeholder="Please provide a reason for your leave"
              />
              {formik.touched.reason && formik.errors.reason ? (
                <p className="mt-1 text-xs text-red-500">{formik.errors.reason}</p>
              ) : null}
            </div>

            {/* Document Upload */}
            <div>
              <label htmlFor="documentUrl" className="block text-sm font-medium text-gray-700 mb-1">
                Supporting Document {selectedLeaveType?.requiresDocument ? "*" : "(Optional)"}
              </label>
              <div className="mt-1">
                {imageLoading ? (
                  <div className="flex items-center space-x-4">
                    <div style={{ width: 50, height: 50 }}>
                      <CircularProgressbar 
                        value={imageProgress || 0} 
                        text={`${imageProgress || 0}%`} 
                        strokeWidth={8}
                      />
                    </div>
                    <span className="text-sm text-gray-600">Uploading document...</span>
                  </div>
                ) : (
                  <label
                    htmlFor="file-upload"
                    className={`relative cursor-pointer flex items-center justify-center px-4 py-2 border ${
                      formik.touched.documentUrl && formik.errors.documentUrl
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none`}
                  >
                    <FaPaperclip className="mr-2" />
                    <span>{selectedFileName || "Upload a file"}</span>
                    <input
                      id="file-upload"
                      name="documentUrl"
                      type="file"
                      className="sr-only"
                      onChange={handleFileChange}
                      accept=".pdf,.jpg,.jpeg,.png"
                      disabled={imageLoading}
                    />
                  </label>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Accepted formats: PDF, JPG, PNG (Max 5MB)
                </p>
                {formik.touched.documentUrl && formik.errors.documentUrl ? (
                  <p className="mt-1 text-xs text-red-500">{String(formik.errors.documentUrl)}</p>
                ) : null}
              </div>
            </div>
          </div>

          {/* Information section */}
          {daysRequested > 0 && (
            <div className={`mt-6 p-4 rounded-md ${
              isBalanceExceeded() ? "bg-yellow-50" : "bg-blue-50"
            }`}>
              <div className="flex">
                <div className="flex-shrink-0">
                  <FaInfoCircle className={isBalanceExceeded() ? "text-yellow-600" : "text-blue-600"} />
                </div>
                <div className="ml-3 flex-1 md:flex md:justify-between">
                  <p className={`text-sm ${isBalanceExceeded() ? "text-yellow-700" : "text-blue-700"}`}>
                    You're requesting <span className="font-medium">{daysRequested} business day{daysRequested !== 1 && 's'}</span>
                    {selectedLeaveType && (
                      <>
                        {" "}of leave. Your current {selectedLeaveType.name} leave balance: <span className="font-medium">{selectedLeaveType.balance} days</span>
                        {isBalanceExceeded() && (
                          <span className="block mt-1 font-medium">Warning: Your request exceeds your available balance.</span>
                        )}
                      </>
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Form actions */}
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
              onClick={() => formik.resetForm()}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none disabled:bg-blue-300"
              disabled={formik.isSubmitting || !formik.isValid || imageLoading}
            >
              Submit Application
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ApplyLeave;