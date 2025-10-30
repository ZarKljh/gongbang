import axios from 'axios'

const api = axios.create({
    baseURL: 'http://localhost:8090/api/v1/',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
})

export const fetchStats = async (userId: number) => {
    const { data } = await api.get(`/mypage/stats?userId=${userId}`);
    return data;
}

export default api;

