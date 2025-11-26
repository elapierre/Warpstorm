import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { persistOfflineRequest } from '../sqlite/db'; // write to SQLite

type Item = { id: string; name: string; synced: number; updatedAt: string };

const itemsSlice = createSlice({
  name: 'items',
  initialState: [] as Item[],
  reducers: {
    addItem: (state, action: PayloadAction<Item>) => {
      state.push(action.payload);
      persistOfflineRequest({
        requestType: 'addItem',
        payload: JSON.stringify(action.payload)
      }); // keep SQLite in sync
    },
    setItems: (_, action: PayloadAction<Item[]>) => {
      return action.payload;
    }
  }
});

export const { addItem, setItems } = itemsSlice.actions;

export const store = configureStore({
  reducer: {
    items: itemsSlice.reducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
