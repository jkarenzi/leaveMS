import { createAsyncThunk } from "@reduxjs/toolkit";
import {axiosInstance as axios} from "../../services/api";
import { Notification } from "../../types/Notification";


export const getAllNotifications = createAsyncThunk<Notification[]>(
    'notifications/getAll',
    async (_, thunkAPI) => {
      try {
        const response = await axios.get('/notifications');
        return response.data;
      } catch (error) {
          return thunkAPI.rejectWithValue(error);
      }
    }
)

export const markNotificationAsRead = createAsyncThunk<Notification, string>(
    'notifications/markAsRead',
    async (id, thunkAPI) => {
      try {
        const response = await axios.patch(`/notifications/${id}`);
        return response.data;
      } catch (error) {
          return thunkAPI.rejectWithValue(error);
      }
    }
)

export const markAllNotificationsAsRead = createAsyncThunk<Notification[]>(
    'notifications/markAllAsRead',
    async (_, thunkAPI) => {
      try {
        const response = await axios.patch(`/notifications`);
        return response.data;
      } catch (error) {
          return thunkAPI.rejectWithValue(error);
      }
    }
)