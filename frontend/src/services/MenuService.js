import http from './http-common';

const API_URL = '/menus';

const getAllMenus = (params) => {
    return http.get(`${API_URL}`, params);
};

const getMenuById = (id) => {
    return http.get(`${API_URL}/${id}`);
};

const createMenu = (menuData) => {
    return http.post(API_URL, menuData);
};

const updateMenu = (id, menuData) => {
    return http.put(`${API_URL}/${id}`, menuData);
};

const deleteMenu = (id) => {
    return http.delete(`${API_URL}/${id}`);
};

const toggleMenuActive = (id) => {
    return http.patch(`${API_URL}/${id}/toggle`);
};

const createMenuWithImage = (formData) => {
    return http.post(API_URL, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
};

const updateMenuWithImage = (id, formData) => {
    return http.put(`${API_URL}/${id}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
};

const menuService = {
    getAllMenus,
    getMenuById,
    createMenu,
    updateMenu,
    deleteMenu,
    toggleMenuActive,
    createMenuWithImage,
    updateMenuWithImage
};

export default menuService;