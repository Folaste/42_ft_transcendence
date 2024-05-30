import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import axios from "axios";

const initialState = {
    chatrooms: [],
}

export const fetchChat = createAsyncThunk(
    'chat/fetchChat',
    async ({username, token} : {username: string, token:string}) => {
    const response = await axios.get(`http://localhost:3001/chatroom/${username}`, {
        headers: {'Authorization': `Bearer ${token}`}
    } );
    return response.data;
    }
);

export const chatSlice = createSlice({
    name: 'chat',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
          .addCase(fetchChat.pending, () => {
          })
          .addCase(fetchChat.fulfilled, (state, action) => {
            state.chatrooms = action.payload;
          })
          .addCase(fetchChat.rejected, () => {
          });
      },
})

export default chatSlice.reducer

