import http from './http-common';

const API_URL = '/menu-packages';

const createMenuPackage = (menuPackageData) => {
    return http.post(API_URL, menuPackageData);
};

const getAllMenuPackages = () => {
    return http.get(API_URL);
};

const getMenuPackageById = (id) => {
    return http.get(`${API_URL}/${id}`);
};

const updateMenuPackage = (id, menuPackageData) => {
    return http.put(`${API_URL}/${id}`, menuPackageData);
};

const deleteMenuPackage = (id) => {
    return http.delete(`${API_URL}/${id}`);
};

const menuPackageService = {
    createMenuPackage,
    getAllMenuPackages,
    getMenuPackageById,
    updateMenuPackage,
    deleteMenuPackage
};

export default menuPackageService;