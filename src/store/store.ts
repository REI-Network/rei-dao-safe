import { configureStore } from '@reduxjs/toolkit';
import SafeSlice from './SafeSlice';

export default configureStore({
  reducer: {
    safeSlice: SafeSlice,
  },
});
