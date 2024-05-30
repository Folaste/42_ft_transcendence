import axios from "axios";
import store from "../stores/store";

//Creating an instance of axios, so we can use base url without having to specify it

const api = axios.create(
    {
        baseURL: 'http://localhost:3001/',
        //We can set timeout option, we will see this later
        // withCredentials: true,
    }
);

api.interceptors.request.use(function (config) {
    const token = store.getState()?.profileData?.token;
      config.headers.Authorization = `Bearer ${token}`;
      return config;
  });

export default api;