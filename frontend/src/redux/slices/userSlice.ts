import { createSlice } from "@reduxjs/toolkit";
import { errorToast, successToast } from "../../utils/toast";
import { getOwnProfile, getUsers, initiateAuth, login } from "../actions/authActions";
import { User } from "../../types/User";


interface InitialState {
    token: string | null,
    user: User | null,
    signUpState: 'successful' | 'failed' | 'idle',
    isLoggingIn: boolean,
    isSigningUp: boolean,
    isInitializing: boolean,
    initializeStatus: 'idle'|'complete',
    isChangingPass: boolean,
    changePassState: 'successful' | 'failed' | 'idle',
    loading: boolean,
    loggingOut: boolean,
    fetching: boolean,
    users: User[],
    fetchStatus: 'successful' | 'failed' | 'idle'
}

const initialState: InitialState = {
    token: null,
    user: null,
    signUpState: 'idle',
    isLoggingIn: false,
    isSigningUp: false,
    isInitializing: false,
    isChangingPass: false,
    changePassState: 'idle',
    initializeStatus: 'idle',
    loading: false,
    loggingOut: false,
    fetching: false,
    users: [],
    fetchStatus: 'idle'
}


const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers:{
        logout: (state) => {
            localStorage.removeItem('token')
            state.token = null
            state.user = null
            state.initializeStatus = 'complete'
        },
        resetInitializeStatus: (state) => {
            state.initializeStatus = 'idle'
        }
    },
    extraReducers: (builder) => {
        builder
        .addCase(initiateAuth.pending, (state) => {
            state.isInitializing = true
        })
        .addCase(initiateAuth.fulfilled, (state, action) => {
            state.token = action.payload.token
            state.user = action.payload.user
            state.isInitializing = false
            state.initializeStatus = 'complete'
        })
        .addCase(initiateAuth.rejected, (state) => {
            state.token = ''
            state.user = null
            state.isInitializing = false
            state.initializeStatus = 'complete'
        })
        .addCase(login.pending, (state) => {
            state.isLoggingIn = true
        })
        .addCase(login.fulfilled, (state, action) => {
            localStorage.setItem("token", action.payload.token!);
            state.token = action.payload.token!
            state.user = action.payload.user!
            state.isLoggingIn = false
            successToast('Login successful')
        })
        .addCase(login.rejected, (state, action) => {
            state.isLoggingIn = false
            errorToast(action.payload as string)
        })
        .addCase(getOwnProfile.fulfilled, (state, action) => {
            state.isLoggingIn = false
            state.user = action.payload
            successToast('Login successful')
        })
        .addCase(getOwnProfile.rejected, (state, action) => {
            state.isLoggingIn = false
            errorToast(action.payload as string)
        })
        .addCase(getUsers.pending, (state) => {
            state.fetching = true
        })
        .addCase(getUsers.fulfilled, (state, action) => {
            state.fetching = false
            state.users = action.payload
            state.fetchStatus = 'successful'
        })
        .addCase(getUsers.rejected, (state, action) => {
            state.fetching = false
            state.fetchStatus = 'failed'
            errorToast(action.payload as string)
        })
    }
})

export const {logout, resetInitializeStatus} = userSlice.actions
export default userSlice.reducer