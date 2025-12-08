import { configureStore } from '@reduxjs/toolkit';
import pushTokenReducer from './pushNotice/pushTokenSlice';
import jobReducer from './job/jobSlice';

export const store = configureStore({
  reducer: {
    pushToken: pushTokenReducer, // key must match slice usage
    job: jobReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
