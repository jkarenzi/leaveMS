import { createAsyncThunk } from "@reduxjs/toolkit";
import {axiosInstance as api} from "../../services/api";
import { LeaveBalance, UpdateLeaveBalanceFormData, UserWithLeaveBalances } from "../../types/LeaveBalance";

// Leave Balance Actions
export const getAllLeaveBalances = createAsyncThunk<UserWithLeaveBalances[]>(
    'leave/getAllLeaveBalances',
    async (_, { rejectWithValue }) => {
      try {
        const response = await api.get('/leave/balances');
        return response.data.data;
      } catch (error) {
        return rejectWithValue(error);
      }
    }
  );
  
  export const getMyLeaveBalances = createAsyncThunk<LeaveBalance[]>(
    'leave/getMyLeaveBalances',
    async (_, { rejectWithValue }) => {
      try {
        const response = await api.get('/leave/balances/own');
        return response.data.data;
      } catch (error) {
        return rejectWithValue(error);
      }
    }
  );
  
  export const getEmployeeLeaveBalances = createAsyncThunk<LeaveBalance[], string>(
    'leave/getEmployeeLeaveBalances',
    async (employeeId: string, { rejectWithValue }) => {
      try {
        const response = await api.get(`/leave/balances/employee/${employeeId}`);
        return response.data.data;
      } catch (error) {
        return rejectWithValue(error);
      }
    }
  );
  
  export const adjustLeaveBalance = createAsyncThunk<LeaveBalance, UpdateLeaveBalanceFormData>(
    'leave/adjustLeaveBalance',
    async ({ id, formData }, { rejectWithValue }) => {
      try {
        const response = await api.patch(`/leave/balances/${id}`, formData);
        return response.data.data;
      } catch (error) {
        return rejectWithValue(error);
      }
    }
  );
  
  export const initializeLeaveBalances = createAsyncThunk<LeaveBalance[], {employeeId:string}>(
    'leave/initializeLeaveBalances',
    async (data, { rejectWithValue }) => {
      try {
        const response = await api.post('/leave/balances', data);
        return response.data.data;
      } catch (error) {
        return rejectWithValue(error);
      }
    }
  );