// store/store.js
import { configureStore } from '@reduxjs/toolkit';
import transactionsReducer from './transactionsSlice'; // Import the reducers
import categoriesReducer from './categoriesSlice';
import incomeSourcesReducer from './incomeSourcesSlice';
import { combineReducers } from '@reduxjs/toolkit';

// Combine reducers into a root reducer object
const rootReducer = combineReducers({
  transactions: transactionsReducer,
  categories: categoriesReducer,
  incomeSources: incomeSourcesReducer
  // Add other reducers here if you create more slices
})

// Configure the store
const store = configureStore({
  reducer: rootReducer,
  // Optional: Configure middleware (e.g., for logging in development)
  // middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(logger),
  // Optional: Enable Redux DevTools Extension
  devTools: process.env.NODE_ENV !== 'production',
});

export default store;
