import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface PushTokenState {
  expoPushToken: string | null;
}

const initialState: PushTokenState = {
  expoPushToken: null,
};

const pushTokenSlice = createSlice({
  name: 'pushToken',
  initialState,
  reducers: {
    setExpoPushToken: (state, action: PayloadAction<string>) => {
      state.expoPushToken = action.payload;
    },
  },
});

export const { setExpoPushToken } = pushTokenSlice.actions;
export default pushTokenSlice.reducer;
