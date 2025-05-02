import { createSlice } from '@reduxjs/toolkit';


interface IinitialState {
  isSideMenuExpanded: boolean
}

const appSettingSlice = createSlice({
  name: 'appSetting',
  initialState: {
    isSideMenuExpanded: true,
    devotionView: 'list'
  } as IinitialState,
  reducers: {
    toggleSideMenu: (state, action) => {
      state.isSideMenuExpanded = action.payload
    }
  }
});

export default appSettingSlice.reducer;
export const {toggleSideMenu} = appSettingSlice.actions