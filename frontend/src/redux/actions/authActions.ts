import { createAsyncThunk } from "@reduxjs/toolkit"
import {axiosAuthInstance as axios} from "../../services/api"
import { ApiResponse } from "../../types/ApiResponse"
import { User } from "../../types/User"
import {jwtDecode} from 'jwt-decode'

interface IAuth {
    token: string,
    user: User | null
}

// interface IParams {
//     name?:string,
//     startYear?:string,
//     program?:string,
//     intake?:string,
//     role?:string
// }


export const login = createAsyncThunk<ApiResponse, {idToken:string}>('auth/login', async(formData, thunkAPI) => {
    try{
        const response = await axios.post('auth/login', formData)
        console.log(response)
        return response.data
    }catch(err){
        return thunkAPI.rejectWithValue(err)
    }
})

export const getOwnProfile = createAsyncThunk<User>('auth/getOwnProfile', async(_, thunkAPI) => {
    try{
        const response = await axios.get('user/own')
        return response.data
    }catch(err){
        return thunkAPI.rejectWithValue(err)
    }
})

export const initiateAuth = createAsyncThunk<IAuth>('auth/initiate', async(_, thunkAPI) => {
    try{
        const token = localStorage.getItem('token')
        if(!token){
            return { token: '', user: null };
        }

        const decodedToken: any = jwtDecode(token)

        const response = await axios.get(`auth/users/${decodedToken.id}`)
        return {token, user: response.data.user}
    }catch(err){
        console.log(err)
        return thunkAPI.rejectWithValue({ token: '', user: null })
    }
})

export const getUsers = createAsyncThunk<User[]>("user/getAll", async (_, thunkAPI) => {
    try {
      const response = await axios.get('auth/users')
      return response.data.users
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
});