import { createSlice } from "@reduxjs/toolkit";
import { Notification } from "../../types/Notification";
import { getAllNotifications, markAllNotificationsAsRead, markNotificationAsRead } from "../actions/notificationActions";
import { errorToast } from "../../utils/toast";


interface IinitialState {
    tempNotifications: Notification[]
    notifications: Notification[]
    fetching: boolean
    loading: boolean
    status: 'idle' | 'successful' | 'failed'
}

const notificationSlice = createSlice({
    name: 'notification',
    initialState:{
        tempNotifications: [],
        notifications: [],
        fetching: false,
        loading:false,
        status: 'idle'
    } as IinitialState,
    reducers:{
        resetStatus: (state) => {
            state.status = 'idle'
        },
        setNotifications: (state, action) => {
            state.notifications = action.payload
        },
        addNotification: (state, action) => {
            state.notifications = [action.payload, ...state.notifications]
        },
        setTempNotifications: (state, action) => {
            state.tempNotifications = action.payload
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(getAllNotifications.pending, (state) => {
                state.fetching = true
            })
            .addCase(getAllNotifications.fulfilled, (state, action) => {
                state.fetching = false
                state.notifications = action.payload
            })
            .addCase(getAllNotifications.rejected, (state, action) => {
                state.fetching = false
                errorToast(action.payload as string)
            })
            .addCase(markNotificationAsRead.pending, (state) => {
                state.loading = true
            })
            .addCase(markNotificationAsRead.fulfilled, (state) => {
                state.loading = false
            })
            .addCase(markNotificationAsRead.rejected, (state, action) => {
                state.loading = false
                state.notifications = state.tempNotifications
                errorToast(action.payload as string)
            })
            .addCase(markAllNotificationsAsRead.pending, (state) => {
                state.loading = true
            })
            .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
                state.loading = false
                state.tempNotifications = []
            })
            .addCase(markAllNotificationsAsRead.rejected, (state, action) => {
                state.loading = false
                state.notifications = state.tempNotifications
                errorToast(action.payload as string)
            })
    }
})


export const {resetStatus, addNotification, setNotifications, setTempNotifications} = notificationSlice.actions
export default notificationSlice.reducer