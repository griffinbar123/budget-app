// store/store.js
import { configureStore } from '@reduxjs/toolkit';
import transactionsReducer from './transactionsSlice'; // Import the reducers
import categoriesReducer from './categoriesSlice';
import incomeSourcesReducer from './incomeSourcesSlice';
import { combineReducers } from '@reduxjs/toolkit';

const rootReducer = combineReducers({
  transactions: transactionsReducer,
  categories: categoriesReducer,
  incomeSources: incomeSourcesReducer
})

const store = configureStore({
  reducer: rootReducer,   // Use combined reducers
});

export default store;