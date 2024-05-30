import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import axios from "axios";

const initialState = {
    users: [],
}

export const fetchUsers = createAsyncThunk(
    'users/fetchUsers',
    async ({username, token} : {username: string, token:string}) => {
    const response = await axios.get(`http://localhost:3001/users/${username}`, {
        headers: {'Authorization': `Bearer ${token}`}
    } );
    return response.data;
    }
);

export const usersSlice = createSlice({
    name: 'allUsers',
    initialState,
    reducers: {
    },
    extraReducers: (builder) => {
        builder
          .addCase(fetchUsers.pending, () => {
          })
          .addCase(fetchUsers.fulfilled, (state, action) => {
            state.users = action.payload;
          })
          .addCase(fetchUsers.rejected, (state, action) => {
            console.log(action.error.message);
          });
      },
})

export default usersSlice.reducer

