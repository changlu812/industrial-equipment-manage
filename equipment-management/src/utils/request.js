import axios from "axios";
import { useAuthStore } from "@stores/auth";

//创建axios实例
const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "", //接口基地址
  timeout: 10000, //请求超时时间10s
  headers: {
    "Content-Type": "application/json", //默认请求头格式
  },
});

let isRefreshing = false; //标记是否正在刷新token
let isRefreshSubscribers = []; //订阅器：存储token 刷新成功后需要重试的请求
//发布-订阅模式，解决「多个请求同时触发 401 时，只刷新一次 token，然后重试所有请求」的问题
//订阅token刷新：把需要重试的请求回调存入数组
const subscribeTokenRefresh = (cb) => {
  refreshSubscribers.push(cb);
};
//token刷新成功后：执行所有订阅的回调，重试原请求
const onTokenRefreshed = (token) => {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = []; //清空订阅器
};

request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

request.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;
    if (!error.response) {
      return Promise.reject(new Error("网络连接失败，请检查网络设置"));
    }

    const { status, data } = error.response;

    if (status === 401) {
      if (!originalRequest._retry) {
        if (isRefreshing) {
          return new Promise((resolve) => {
            subscribeTokenRefresh((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(request(originalRequest));
            });
          });
        }
        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const refreshToken = localStorage.getItem("refreshToken");
          if (!refreshToken) {
            throw new Error("没有刷新令牌");
          }

          const response = await axios.post("/api/auth/refresh", {
            refreshToken,
          });

          const { token, refreshToken: newRefreshToken } = response.data;
          localStorage.setItem("token", token);
          localStorage.setItem("refreshToken", newRefreshToken);

          onTokenRefreshed(token);
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return request(originalRequest);
        } catch (refreshError) {
          const authStore = useAuthStore();
          authStore.handleLogout();
          window.location.href = "/login";
          return Promise.reject(new Error("登陆已过期，请重新登录"));
        } finally {
          isRefreshing = false;
        }
      }
    }
    if (status === 403) {
      return Promise.reject(new Error("没有权限执行此操作"));
    }
    if (status === 404) {
      return Promise.reject(new Error("请求的资源不存在"));
    }
    if (status >= 500) {
      return Promise.reject(new Error("服务器内部错误，请稍后重试"));
    }

    const errorMessage = data?.error || data?.message || `请求失败(${status})`;
    return Promise.reject(new Error(errorMessage));
  },
);
//导出实例供全局使用
export default request;
