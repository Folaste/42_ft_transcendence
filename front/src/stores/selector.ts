import { createSelector } from '@reduxjs/toolkit';
import { RootState } from './store'; // Importez RootState ou utilisez votre propre interface d'état global

const selectProfileData = (state: RootState) => state.profileData;

export const selectStatus = createSelector(
  selectProfileData,
  (profileData) => profileData.status
);

export const selectDatas = createSelector(
  selectProfileData,
  (profileData) => profileData.data
);

export const selectToken = createSelector(
  selectProfileData,
  (profileData) => profileData.token
);

createSelector(
  selectProfileData,
  (profileData) => profileData.error
);

const selectChat = (state: RootState) => state.chat;

createSelector(
  selectChat,
  (chat) => chat.chatrooms
);

createSelector(
  selectProfileData,
  (profileData) => profileData.sideBar
);

const selectAllUsers = (state: RootState) => state.users;

createSelector(
  selectAllUsers,
  (allUsers) => allUsers.users
);
