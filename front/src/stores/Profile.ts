import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";


interface data {
  id:number;
  nickname:string;
  email:string;
  auth2F: boolean;
  avatarURI:string;
  login42:string;
  blockedUsers:[];
}

interface profileDataState {
    status: boolean;
    token: string;
    data: data;
    isLoading: boolean;
    error: string | null;
    sideBar: boolean;
  }
  
  let initialState: profileDataState = {
    status: false,
    data: {id:0, email:"", nickname:"", auth2F:false, avatarURI:'', login42:'', blockedUsers:[]},
    isLoading: false,
    error: null,
    token: "",
    sideBar: false,
  };

  export const fetchUserProfile = createAsyncThunk(
    'profileData/fetchUserProfile',
    async ({username, token} : {username: string, token:string}) => {
      const response = await axios.get(`http://localhost:3001/user/${username}`, {
        headers: {'Authorization': `Bearer ${token}`}
      } );
      return response.data;
    }
  );

export const profileDataSlice = createSlice({
    name: 'profileData',
    initialState,
    reducers: {
        updateStatus: (state, action: PayloadAction<boolean>) => {
            state.status = action.payload;
        },
        updateToken: (state, action: PayloadAction<string>) => {
          state.token = action.payload;
        },
        updateAuth2F: (state, action: PayloadAction<boolean>) => {
          state.data.auth2F = action.payload;
        },
        updateNickname: (state, action: PayloadAction<string>) => {
          state.data.nickname = action.payload;
        },
        updateSideBar: (state, action: PayloadAction<boolean>) => {
          state.sideBar = action.payload;
        },
        updateAvatar: (state, action: PayloadAction<string>) => {
          state.data.avatarURI = action.payload;
        },
        resetProfile: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        console.log(action.error.message);
        state.error = action.error.message || 'Une erreur s\'est produite.';
      });
  },
}
)

export const {updateStatus, resetProfile, updateToken, updateAuth2F, updateNickname,updateSideBar} = profileDataSlice.actions

export default profileDataSlice.reducer