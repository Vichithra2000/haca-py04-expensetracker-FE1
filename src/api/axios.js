import axios from "axios";
const API = axios.create({
    baseURL: "http://127.0.0.1:8000/"
})


//token attach
API.interceptors.request.use((req)=>{
    const token = localStorage.getItem("access")

    if (token) {
        req.headers.Authorization = `Bearer ${token}`
    }
    return req
})
 // refresh token

 API.interceptors.response.use(
    (response)=>response,
    async (error) => {
        const originalRequest = error.config

        if(error.response?.status == 401){

            const refresh = localStorage.getItem("refresh");
            const res = await axios.post(
                "http://127.0.0.1:8000/api/token/refresh/",{refresh:refresh}
            )
            const newToken = res.data.access;
            localStorage.setItem("access", newToken)
            API.defaults.headers.Authorization = `Bearer ${newToken}`
            originalRequest.headers.Authorization = `Bearer ${newToken}`
            return API(originalRequest)
        }

        return Promise.reject(error)
    }
    
    
)
export default API;