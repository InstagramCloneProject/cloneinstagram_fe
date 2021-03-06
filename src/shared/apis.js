import axios from "axios";
import { history } from "../redux/configureStore";

const api = axios.create({
  baseURL: "https://hyeonjun.shop/",
  headers: {
    "content-type": "application/json;charset=UTF-8",
    accept: "application/json,",
  },
});

// request interceptors
api.interceptors.request.use(function (config) {
  const atoken = localStorage.getItem("access_token");
  const rtoken = localStorage.getItem("refresh_token");

  config.headers.common["authorization"] = `Bearer ${atoken}`;
  config.headers.common["reauthorization"] = `Bearer ${rtoken}`;

  return config;
});

// response intercepters
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const {
      config,
      response: { status },
      response,
    } = error;
    const originalRequest = config;

    // 401 에러 발생시 토큰 만료되었을 때,
    if (status === 401) {
      if (response.data.accessToken) {
        // access token이 재발급 된 상태,
        console.log(response);
        localStorage.setItem("access_token", response.data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
        return axios(originalRequest);
      }
      if (response.data.reason === "refreshtoken expired") {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        history.replace("/");
      }
    }
  }
);

export const apis = {
  // feed
  get: () => api.get("/api/feed"),
  add: (content) => api.post("/api/feed", content),
  edit: (id, content) => api.patch(`/api/feed/${id}`, content),
  delete: (id) => api.delete(`/api/feed/${id}`),
  getDetail: (id) => api.get(`/api/feed/${id}`),
  like: (id, likeId) => api.post(`/api/feed/${id}/likes`, { likeId }),
  unLike: (id) => api.delete(`/api/feed/${id}/unlikes`),

  // comment
  addComment: (content, feed_Id) =>
    api.post("/api/comment", { content, feed_Id }),
  delComment: (commentId) => api.delete(`/api/comment/${commentId}`),
  commentLike: (commentId, likeId) =>
    api.post(`/api/comment/${commentId}/likes`, { likeId }),
  commentUnlike: (commentId) => api.delete(`/api/comment/${commentId}/unlikes`),

  // user
  login: (payload) => api.post("/api/user/login", payload),
  join: (payload) => api.post("/api/user/join", payload),
  getUser: (payload) => api.get(`/api/user/${payload}`),
  editProfileImg: (formData, __userId) =>
    api.patch(`/api/user/${__userId}/profileImg`, formData),
  follow_user: (__userId_storage, __profile_userId) =>
    api.post(`/api/user/${__userId_storage}/follow`, {
      followId: __profile_userId,
    }),
  unfollow_user: (__userId_storage, __profile_userId) =>
    api.delete(`/api/user/${__userId_storage}/follow`, {
      data: { followId: __profile_userId },
    }),
  // userinfo: () => api.get(`/userinfo`),
};
