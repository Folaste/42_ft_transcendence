import { combineReducers, configureStore } from '@reduxjs/toolkit'
import profileDataReducer from './Profile'
import chatReducer from './Chat'
import usersReducer from './Users'
import storage from 'redux-persist/lib/storage'; 
import { persistReducer } from 'redux-persist';
import {
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist'

const persistConfig={
  key:'main-root',
  storage,
}

const reducer = combineReducers({
  profileData: profileDataReducer,
  chat: chatReducer,
  users: usersReducer,

})

const persistedReducer = persistReducer(persistConfig, reducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
  getDefaultMiddleware({
    serializableCheck: {
      ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
    },
  }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch

export default store;