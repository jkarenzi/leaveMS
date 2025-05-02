import { configureStore } from "@reduxjs/toolkit";
import appSettingReducer from './slices/appSettingSlice'
import userReducer from './slices/userSlice'
import notificationReducer from './slices/notificationSlice'
import leaveReducer from './slices/leaveSlice'


const store = configureStore({
    reducer:{
        appSetting: appSettingReducer,
        user: userReducer,
        leave: leaveReducer,
        notification: notificationReducer
    }
})


export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store