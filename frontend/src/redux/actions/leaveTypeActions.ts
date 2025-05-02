import { createAsyncThunk } from "@reduxjs/toolkit";
import {axiosInstance as api} from "../../services/api";
import { LeaveType, LeaveTypeFormData, LeaveTypeUpdateFormData } from "../../types/LeaveType";

// Leave Type Actions
export const getAllLeaveTypes = createAsyncThunk<LeaveType[]>(
    'leave/getAllLeaveTypes',
    async (_, { rejectWithValue }) => {
      try {
        const response = await api.get('leave/types');
        return response.data.data;
      } catch (error) {
        return rejectWithValue(error);
      }
    }
  );
  
  export const createLeaveType = createAsyncThunk<LeaveType, LeaveTypeFormData>(
    'leave/createLeaveType',
    async (data, { rejectWithValue }) => {
      try {
        const response = await api.post('leave/types', data);
        return response.data.data;
      } catch (error) {
        return rejectWithValue(error);
      }
    }
  );
  
  export const updateLeaveType = createAsyncThunk<LeaveType, LeaveTypeUpdateFormData>(
    'leave/updateLeaveType',
    async ({ id, formData }, { rejectWithValue }) => {
      try {
        const response = await api.patch(`leave/types/${id}`, formData);
        return response.data.data;
      } catch (error) {
        return rejectWithValue(error);
      }
    }
  );
  
  export const deleteLeaveType = createAsyncThunk<string, string>(
    'leave/deleteLeaveType',
    async (id, { rejectWithValue }) => {
      try {
        await api.delete(`leave/types/${id}`);
        return id;
      } catch (error) {
        return rejectWithValue(error);
      }
    }
  );