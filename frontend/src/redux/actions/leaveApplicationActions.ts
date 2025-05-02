import { createAsyncThunk } from "@reduxjs/toolkit";
import {axiosInstance as api} from "../../services/api";
import { LeaveApplication, LeaveApplicationFormData, UpdateLeaveStatusFormData } from "../../types/LeaveApplication";


// Leave Application Actions
export const createLeaveApplication = createAsyncThunk<LeaveApplication, LeaveApplicationFormData>(
    'leave/createLeaveApplication',
    async (data, { rejectWithValue }) => {
      try {
        const response = await api.post('/leave/requests', data);
        return response.data.data;
      } catch (error) {
        return rejectWithValue(error);
      }
    }
  );
  
  export const getAllLeaveApplications = createAsyncThunk<LeaveApplication[]>(
    'leave/getAllLeaveApplications',
    async (_, { rejectWithValue }) => {
      try {
        const response = await api.get('/leave/requests');
        return response.data.data;
      } catch (error) {
        return rejectWithValue(error);
      }
    }
  );
  
  export const getEmployeeLeaveApplications = createAsyncThunk<LeaveApplication[], string>(
    'leave/getEmployeeLeaveApplications',
    async (employeeId: string, { rejectWithValue }) => {
      try {
        const response = await api.get(`/leave/requests/employee/${employeeId}`);
        return response.data.data;
      } catch (error) {
        return rejectWithValue(error);
      }
    }
  );
  
  export const updateLeaveStatus = createAsyncThunk<LeaveApplication, UpdateLeaveStatusFormData>(
    'leave/updateLeaveStatus',
    async ({ id, formData }, { rejectWithValue }) => {
      try {
        const response = await api.patch(`/leave/requests/${id}`, formData);
        return response.data.data;
      } catch (error) {
        return rejectWithValue(error);
      }
    }
  );
  
  export const deleteLeaveApplication = createAsyncThunk<string, string>(
    'leave/deleteLeaveApplication',
    async (id, { rejectWithValue }) => {
      try {
        await api.delete(`/leave/requests/${id}`);
        return id;
      } catch (error) {
        return rejectWithValue(error);
      }
    }
  );