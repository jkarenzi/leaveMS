import { NextFunction } from 'express';
import * as yup from 'yup';
import { Request, Response } from 'express';


const createLeaveApplicationSchema = yup.object().shape({
  employeeId: yup.string().required('Employee ID is required'),
  leaveTypeId: yup.string().required('Leave type is required'),
  startDate: yup.date().required('Start date is required'),
  endDate: yup
    .date()
    .required('End date is required')
    .min(yup.ref('startDate'), 'End date must be after or equal to start date'),
  reason: yup.string().nullable(),
  documentUrl: yup.string().nullable().url('Document URL must be a valid URL')
});


const updateLeaveStatusSchema = yup.object().shape({
  status: yup
    .string()
    .oneOf(['PENDING', 'APPROVED', 'REJECTED'], 'Status must be PENDING, APPROVED, or REJECTED')
    .required('Status is required'),
  managerComment: yup.string().nullable()
});

export const validateCreateLeaveApplication = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await createLeaveApplicationSchema.validate(req.body, { abortEarly: false });
    next();
  } catch (error) {
    console.log(error.errors);
    res.status(400).json({
      status: "error",
      message: "Validation Error",
      errors: error.errors,
    });
  }
};

export const validateUpdateLeaveStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await updateLeaveStatusSchema.validate(req.body, { abortEarly: false });
    next();
  } catch (error) {
    console.log(error.errors);
    res.status(400).json({
      status: "error",
      message: "Validation Error",
      errors: error.errors,
    });
  }
};