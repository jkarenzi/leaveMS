import { NextFunction } from 'express';
import * as yup from 'yup';
import { Request, Response } from 'express';


const adjustLeaveBalanceSchema = yup.object().shape({
    balance: yup
        .number()
        .min(0, 'Balance must be a positive number or zero')
        .nullable(),
    carriedOver: yup
        .number()
        .min(0, 'Carried over days must be a positive number or zero')
        .nullable(),
    reason: yup
        .string()
        .nullable()
}).test(
    'at-least-one-field',
    'At least one of balance or carriedOver must be provided',
    value => value.balance !== undefined || value.carriedOver !== undefined
);


const initializeLeaveBalancesSchema = yup.object().shape({
    employeeId: yup
        .string()
        .required('Employee ID is required')
});


export const validateAdjustLeaveBalance = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await adjustLeaveBalanceSchema.validate(req.body, { abortEarly: false });
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

export const validateInitializeLeaveBalances = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await initializeLeaveBalancesSchema.validate(req.body, { abortEarly: false });
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