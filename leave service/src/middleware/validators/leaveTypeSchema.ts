import { NextFunction } from 'express';
import * as yup from 'yup';
import { Request, Response } from 'express';


const createLeaveTypeSchema = yup.object().shape({
  name: yup.string().required('Leave type name is required'),
  defaultAnnualAllocation: yup
    .number()
    .min(0, 'Default annual allocation must be a positive number or zero')
    .required('Default annual allocation is required'),
  accrualRate: yup
    .number()
    .min(0, 'Accrual rate must be a positive number or zero')
    .required('Accrual rate is required'),
  maxCarryoverDays: yup
    .number()
    .integer('Max carryover days must be an integer')
    .min(0, 'Max carryover days must be a positive number or zero')
    .required('Max carryover days is required'),
});

const updateLeaveTypeSchema = yup.object().shape({
  name: yup.string(),
  defaultAnnualAllocation: yup
    .number()
    .min(0, 'Default annual allocation must be a positive number or zero'),
  accrualRate: yup
    .number()
    .min(0, 'Accrual rate must be a positive number or zero'),
  maxCarryoverDays: yup
    .number()
    .integer('Max carryover days must be an integer')
    .min(0, 'Max carryover days must be a positive number or zero'),
}).test(
  'at-least-one-field',
  'At least one field must be provided for update',
  (value) => Object.keys(value).length > 0
);


export const validateCreateLeaveType = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await createLeaveTypeSchema.validate(req.body, { abortEarly: false });
        next();
    } catch (error) {
        console.log(error.errors);
        res.status(400).json({
        status: "error",
        message: "Validation Error",
        errors: error.errors,
        });
    }
}

export const validateUpdateLeaveType = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await updateLeaveTypeSchema.validate(req.body, { abortEarly: false });
        next();
    } catch (error) {
        console.log(error.errors);
        res.status(400).json({
            status: "error",
            message: "Validation Error",
            errors: error.errors,
        });
    }
}