import axios from "axios";

const instance = axios.create({
  baseURL: "https://api.pubxmedia.com/",
  headers: { },
});

instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = 'Bearer ' + token;  // for Spring Boot back-end
      // config.headers["x-access-token"] = token; // for Node.js Express back-end
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

instance.interceptors.response.use(
  (res) => {
    return res;
  },
  async (err) => {
    const originalConfig = err.config;

    if (originalConfig.url !== "/login" && err.response) {
      // Access Token was expired
      if (err.response.status === 0 && !originalConfig._retry) {
        originalConfig._retry = true;

        try {
          
          var data = JSON.stringify({
            "token": localStorage.getItem("token")
          });
          
          var config = {
            method: 'post',
            url: 'https://api.pubxmedia.com//auth/token/refresh',
            headers: { 
              'Content-Type': 'application/json'
            },
            data : data
          };
          
          const rs = await instance(config);

          const { token } = rs.data;
          localStorage.setItem("token", token);

          return instance(originalConfig);
        } catch (_error) {
          return Promise.reject(_error);
        }
      }
    }

    return Promise.reject(err);
  }
);

export default instance;
