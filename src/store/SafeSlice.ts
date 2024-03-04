import { createSlice } from '@reduxjs/toolkit';

const SafeSlice = createSlice({
  name: 'safeStore',
  initialState: {
    safeInfo: {},
    balanceInfo: {},
  },
  reducers: {
    setSafeInfo: (state, action) => {
      state.safeInfo = action.payload;
    },
    setBalanceInfo: (state, action) => {
      state.balanceInfo = action.payload;
    },
  },
});

export default SafeSlice.reducer;
export const { setSafeInfo, setBalanceInfo } = SafeSlice.actions;
