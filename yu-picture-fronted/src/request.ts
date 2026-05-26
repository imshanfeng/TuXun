import axios from 'axios'
import { message } from 'ant-design-vue'
import JSONBig from 'json-bigint'

// 判断当前是否是本地开发环境
const isDev = import.meta.env.DEV

// 本地开发环境的后端地址
const DEV_BASE_URL = 'http://localhost:8888'

// 生产环境（线上服务器）的后端地址：
// 置空代表：前端被哪个域名加载，发出的请求就相对哪个域名！之后会被 Nginx 直接拦截并代理到 8888 端口。
const PROD_BASE_URL = ''

// 创建 Axios 实例
const myAxios = axios.create({
  baseURL: isDev ? DEV_BASE_URL : PROD_BASE_URL,
  timeout: 10000,
  withCredentials: true,
  transformResponse: [
    function (data) {
      try {
        // 使用 json-bigint 解析，并将长数字处理为字符串
        return JSONBig({ storeAsString: true }).parse(data)
      } catch {
        return data
      }
    },
  ],
})

// 全局请求拦截器
myAxios.interceptors.request.use(
  function (config) {
    // Do something before request is sent
    return config
  },
  function (error) {
    // Do something with request error
    return Promise.reject(error)
  },
)

// 全局响应拦截器
myAxios.interceptors.response.use(
  function (response) {
    const { data } = response
    // 未登录 — 由 access.ts 路由守卫统一处理跳转，此处仅提示
    if (data.code === 40100) {
      const requestUrl = response.request?.responseURL ?? ''
      if (
        !requestUrl.includes('user/get/login') &&
        !window.location.pathname.includes('/user/login')
      ) {
        message.warning('请先登录')
      }
    }
    return response
  },
  function (error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    return Promise.reject(error)
  },
)

export default myAxios
