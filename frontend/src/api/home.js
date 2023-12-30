import { request } from "../utils/request";

export const getCatalogListApi = () => {
  const url = "/catalog/list";
  return request.get(url);
};

export const addCatalogApi = (data) => {
  const url = "/catalog/add";
  return request.post(url, data);
};

export const editCatalogApi = (data) => {
  const url = "/catalog/edit";
  return request.post(url, data);
};

export const deleteCatalogApi = (params) => {
  const url = "/catalog/delete";
  return request.get(url, {}, { params });
};
