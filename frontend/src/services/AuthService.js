import http from './http-common';

const API_URL = '/auth';

const login = (loginData) => {
    return http.post(`${API_URL}/login`, loginData); 
}

const register = (registerData) => {
    return http.post(`${API_URL}/register`, registerData); 
}

const authService = {
    login,
    register
}

export default authService;
