import axios from 'axios';

const api = axios.create({
    baseURL: 'https://lnh1dhp1mj.execute-api.us-east-1.amazonaws.com/api-pokemon',
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;
