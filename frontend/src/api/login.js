import { request } from "../utils/request";

export const toLoginApi = (data) => {
  const url = window.appConfig.loginUrl + "/login";
  return request.post(url, data);
};
