import { configureStore } from '@reduxjs/toolkit';
import pushTokenReducer from './pushNotice/pushTokenSlice';

export const store = configureStore({
  reducer: {
    pushToken: pushTokenReducer, // key must match slice usage
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
