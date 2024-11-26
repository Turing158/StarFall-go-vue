import axios from 'axios'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'

export const url = 'http://localhost:9090'
export const getUrl = ()=>url
const request = axios.create({
  baseURL: url,
  timeout: 3000,
  withCredentials: true
})

request.interceptors.request.use((config) => {
  const userStore = useUserStore()
  if (userStore.token) {
    config.headers.Authorization = userStore.token
  }
  return config
})

request.interceptors.response.use((res)=>{
  const userStore = useUserStore()
  let authorization = res.headers.get("Authorization")
  if (authorization){
    userStore.token = authorization
  }
  
  // if(msg == "NOT_PERMISSION"){
  //   ElMessage.error("权限不足，你想干嘛？")
  // }
  return res
},(err)=>{
  let errMsg = err.response.data.ERROR
  if(errMsg == "The token is null"){
    ElMessage.error("为获取到用户信息，请登录！")
  }else if(errMsg == "The token has expired" || errMsg == "Token is expired"){
    ElMessage.error("token已过期,请重新登录！")
  }else if(errMsg == "The current token does not allow access, please log in again"){
    ElMessage.error("当前token不允许访问，请重新登录!")
  }
  return Promise.reject(err)
})
export default request
