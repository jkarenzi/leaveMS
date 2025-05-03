import { createSlice } from '@reduxjs/toolkit';
import { LeaveType } from '../../types/LeaveType';
import { errorToast, successToast } from '../../utils/toast';
import { LeaveApplication } from '../../types/LeaveApplication';
import { LeaveBalance, UserWithLeaveBalances } from '../../types/LeaveBalance';
import { getAllLeaveApplications, getEmployeeLeaveApplications, createLeaveApplication, updateLeaveStatus, deleteLeaveApplication } from '../actions/leaveApplicationActions';
import { getAllLeaveBalances, getMyLeaveBalances, getEmployeeLeaveBalances, adjustLeaveBalance, initializeLeaveBalances } from '../actions/leaveBalanceActions';
import { getAllLeaveTypes, createLeaveType, updateLeaveType, deleteLeaveType } from '../actions/leaveTypeActions';

// Status type for tracking operation results
export type FormStatus = 'idle' | 'successful' | 'failed';

// State interface
interface LeaveState {
  leaveApplications: LeaveApplication[];
  myLeaveApplications: LeaveApplication[];
  leaveTypes: LeaveType[];
  leaveBalances: LeaveBalance[];
  myLeaveBalances: LeaveBalance[];
  fetchingApplications: boolean;
  fetchingTypes: boolean;
  fetchingBalances: boolean;
  submitting: boolean;
  applicationStatus: FormStatus;
  leaveTypeStatus: FormStatus;
  leaveBalanceStatus: FormStatus;
  usersWithLeaveBalances: UserWithLeaveBalances[];
}

// Initial state
const initialState: LeaveState = {
  leaveApplications: [],
  myLeaveApplications: [],
  leaveTypes: [],
  leaveBalances: [],
  myLeaveBalances: [],
  fetchingApplications: false,
  fetchingTypes: false,
  fetchingBalances: false,
  submitting: false,
  applicationStatus: 'idle',
  leaveTypeStatus: 'idle',
  leaveBalanceStatus: 'idle',
  usersWithLeaveBalances: []
};

// Leave slice
const leaveSlice = createSlice({
  name: 'leave',
  initialState,
  reducers: {
    resetApplicationStatus: (state) => {
      state.applicationStatus = 'idle';
    },
    resetLeaveTypeStatus: (state) => {
      state.leaveTypeStatus = 'idle';
    },
    resetLeaveBalanceStatus: (state) => {
      state.leaveBalanceStatus = 'idle';
    }
  },
  extraReducers: (builder) => {
    // Leave Application actions
    builder
      .addCase(getAllLeaveApplications.pending, (state) => {
        state.fetchingApplications = true;
      })
      .addCase(getAllLeaveApplications.fulfilled, (state, action) => {
        state.fetchingApplications = false;
        state.leaveApplications = action.payload;
      })
      .addCase(getAllLeaveApplications.rejected, (state, action) => {
        state.fetchingApplications = false;
        errorToast(action.payload as string);
      })
      
      .addCase(getEmployeeLeaveApplications.pending, (state) => {
        state.fetchingApplications = true;
      })
      .addCase(getEmployeeLeaveApplications.fulfilled, (state, action) => {
        state.fetchingApplications = false;
        state.myLeaveApplications = action.payload;
      })
      .addCase(getEmployeeLeaveApplications.rejected, (state, action) => {
        state.fetchingApplications = false;
        errorToast(action.payload as string);
      })
      
      .addCase(createLeaveApplication.pending, (state) => {
        state.submitting = true;
      })
      .addCase(createLeaveApplication.fulfilled, (state, action) => {
        state.submitting = false;
        state.myLeaveApplications.unshift(action.payload);
        state.applicationStatus = 'successful';
        successToast('Leave application submitted successfully');
      })
      .addCase(createLeaveApplication.rejected, (state, action) => {
        state.submitting = false;
        state.applicationStatus = 'failed';
        errorToast(action.payload as string);
      })
      
      .addCase(updateLeaveStatus.pending, (state) => {
        state.submitting = true;
      })
      .addCase(updateLeaveStatus.fulfilled, (state, action) => {
        state.submitting = false;
        
        // Update in admin list
        const index = state.leaveApplications.findIndex(app => app.id === action.payload.id);
        if (index !== -1) {
          state.leaveApplications[index] = action.payload;
        }
        
        // Update in personal list if present
        const myIndex = state.myLeaveApplications.findIndex(app => app.id === action.payload.id);
        if (myIndex !== -1) {
          state.myLeaveApplications[myIndex] = action.payload;
        }
        
        state.applicationStatus = 'successful';
        successToast(`Leave application ${action.payload.status.toLowerCase()}`);
      })
      .addCase(updateLeaveStatus.rejected, (state, action) => {
        state.submitting = false;
        state.applicationStatus = 'failed';
        errorToast(action.payload as string);
      })
      
      .addCase(deleteLeaveApplication.pending, (state) => {
        state.submitting = true;
      })
      .addCase(deleteLeaveApplication.fulfilled, (state, action) => {
        state.submitting = false;
        state.myLeaveApplications = state.myLeaveApplications.filter(app => app.id !== action.payload);
        state.applicationStatus = 'successful';
        successToast('Leave application deleted successfully');
      })
      .addCase(deleteLeaveApplication.rejected, (state, action) => {
        state.submitting = false;
        state.applicationStatus = 'failed';
        errorToast(action.payload as string);
      })
      
      // Leave Type actions
      .addCase(getAllLeaveTypes.pending, (state) => {
        state.fetchingTypes = true;
      })
      .addCase(getAllLeaveTypes.fulfilled, (state, action) => {
        state.fetchingTypes = false;
        state.leaveTypes = action.payload;
      })
      .addCase(getAllLeaveTypes.rejected, (state, action) => {
        state.fetchingTypes = false;
        errorToast(action.payload as string);
      })
      
      .addCase(createLeaveType.pending, (state) => {
        state.submitting = true;
      })
      .addCase(createLeaveType.fulfilled, (state, action) => {
        state.submitting = false;
        state.leaveTypes.push(action.payload);
        state.leaveTypeStatus = 'successful';
        successToast(`Leave type "${action.payload.name}" created successfully`);
      })
      .addCase(createLeaveType.rejected, (state, action) => {
        state.submitting = false;
        state.leaveTypeStatus = 'failed';
        errorToast(action.payload as string);
      })
      
      .addCase(updateLeaveType.pending, (state) => {
        state.submitting = true;
      })
      .addCase(updateLeaveType.fulfilled, (state, action) => {
        state.submitting = false;
        const index = state.leaveTypes.findIndex(type => type.id === action.payload.id);
        if (index !== -1) {
          state.leaveTypes[index] = action.payload;
        }
        state.leaveTypeStatus = 'successful';
        successToast(`Leave type "${action.payload.name}" updated successfully`);
      })
      .addCase(updateLeaveType.rejected, (state, action) => {
        state.submitting = false;
        state.leaveTypeStatus = 'failed';
        errorToast(action.payload as string);
      })
      
      .addCase(deleteLeaveType.pending, (state) => {
        state.submitting = true;
      })
      .addCase(deleteLeaveType.fulfilled, (state, action) => {
        state.submitting = false;
        state.leaveTypes = state.leaveTypes.filter(type => type.id !== action.payload);
        state.leaveTypeStatus = 'successful';
        successToast('Leave type deleted successfully');
      })
      .addCase(deleteLeaveType.rejected, (state, action) => {
        state.submitting = false;
        state.leaveTypeStatus = 'failed';
        errorToast(action.payload as string);
      })
      
      // Leave Balance actions
      .addCase(getAllLeaveBalances.pending, (state) => {
        state.fetchingBalances = true;
      })
      .addCase(getAllLeaveBalances.fulfilled, (state, action) => {
        state.fetchingBalances = false;
        state.usersWithLeaveBalances = action.payload;
      })
      .addCase(getAllLeaveBalances.rejected, (state, action) => {
        state.fetchingBalances = false;
        errorToast(action.payload as string);
      })
      
      .addCase(getMyLeaveBalances.pending, (state) => {
        state.fetchingBalances = true;
      })
      .addCase(getMyLeaveBalances.fulfilled, (state, action) => {
        state.fetchingBalances = false;
        state.myLeaveBalances = action.payload;
      })
      .addCase(getMyLeaveBalances.rejected, (state, action) => {
        state.fetchingBalances = false;
        errorToast(action.payload as string);
      })
      
      .addCase(getEmployeeLeaveBalances.pending, (state) => {
        state.fetchingBalances = true;
      })
      .addCase(getEmployeeLeaveBalances.fulfilled, (state, action) => {
        state.fetchingBalances = false;
        state.leaveBalances = action.payload;
      })
      .addCase(getEmployeeLeaveBalances.rejected, (state, action) => {
        state.fetchingBalances = false;
        errorToast(action.payload as string);
      })
      
      .addCase(adjustLeaveBalance.pending, (state) => {
        state.submitting = true;
      })
      .addCase(adjustLeaveBalance.fulfilled, (state, action) => {
        state.submitting = false;

        state.usersWithLeaveBalances = state.usersWithLeaveBalances.map(user => {
          const obj = {...user}
          const leaveBalances = user.leaveBalances.map(balance => {
            if (balance.id === action.payload.id) {
              return action.payload;
            }
            return balance;
          })
          obj.leaveBalances = leaveBalances;
          return obj;
        })
        
        state.leaveBalanceStatus = 'successful';
        successToast('Leave balance adjusted successfully');
      })
      .addCase(adjustLeaveBalance.rejected, (state, action) => {
        state.submitting = false;
        state.leaveBalanceStatus = 'failed';
        errorToast(action.payload as string);
      })
      
      .addCase(initializeLeaveBalances.pending, (state) => {
        state.submitting = true;
      })
      .addCase(initializeLeaveBalances.fulfilled, (state, action) => {
        state.submitting = false;
        state.leaveBalances = [...state.leaveBalances, ...action.payload];
        state.leaveBalanceStatus = 'successful';
        successToast('Leave balances initialized successfully');
      })
      .addCase(initializeLeaveBalances.rejected, (state, action) => {
        state.submitting = false;
        state.leaveBalanceStatus = 'failed';
        errorToast(action.payload as string);
      });
  }
});

export const { resetApplicationStatus, resetLeaveTypeStatus, resetLeaveBalanceStatus } = leaveSlice.actions;
export default leaveSlice.reducer;