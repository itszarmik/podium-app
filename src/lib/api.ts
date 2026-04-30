import axios, { AxiosInstance, AxiosError } from 'axios'
import * as SecureStore from 'expo-secure-store'
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://podium-api-production.up.railway.app/api/v1'
const TOKEN_KEY = 'podium_token'
const REFRESH_KEY = 'podium_refresh'

class MobileApiClient {
  private client: AxiosInstance
  private refreshPromise: Promise<string> | null = null
  constructor() {
    this.client = axios.create({ baseURL: BASE_URL, timeout: 12_000 })
    this.client.interceptors.request.use(async config => {
      const t = await this.getToken(); if (t) config.headers.Authorization = `Bearer ${t}`; return config
    })
    this.client.interceptors.response.use(res => res, async (err: AxiosError) => {
      const orig = err.config as any & {_retry?:boolean}
      if (err.response?.status === 401 && !orig._retry) {
        orig._retry = true
        try { const t = await this.doRefresh(); if (orig.headers) orig.headers.Authorization = `Bearer ${t}`; return this.client(orig) }
        catch { await this.clearAuth() }
      }
      return Promise.reject(err)
    })
  }
  async getToken() { return SecureStore.getItemAsync(TOKEN_KEY) }
  async setAuth(t: string, r: string) { await SecureStore.setItemAsync(TOKEN_KEY,t); await SecureStore.setItemAsync(REFRESH_KEY,r) }
  async clearAuth() { await SecureStore.deleteItemAsync(TOKEN_KEY); await SecureStore.deleteItemAsync(REFRESH_KEY) }
  private async doRefresh(): Promise<string> {
    if (this.refreshPromise) return this.refreshPromise
    const r = await SecureStore.getItemAsync(REFRESH_KEY); if (!r) throw new Error('No refresh')
    this.refreshPromise = axios.post(`${BASE_URL}/auth/refresh`, {refreshToken:r}).then(async res => { await this.setAuth(res.data.token,res.data.refreshToken); return res.data.token }).finally(()=>{this.refreshPromise=null})
    return this.refreshPromise
  }
  async register(d:any) { const res=await this.client.post('/auth/register',d); await this.setAuth(res.data.token,res.data.refreshToken); return res.data }
  async login(d:any) { const res=await this.client.post('/auth/login',d); await this.setAuth(res.data.token,res.data.refreshToken); return res.data }
  async getMe() { return (await this.client.get('/auth/me')).data }
  logout() { return this.clearAuth() }
  async createBoard(d:any) { return (await this.client.post('/boards',d)).data }
  async getMyBoards() { return (await this.client.get('/boards/me')).data }
  async getPublicBoards(params?:any) { return (await this.client.get('/boards/public',{params})).data }
  async getBoard(id:string) { return (await this.client.get(`/boards/${id}`)).data }
  async joinBoard(code:string) { return (await this.client.post('/boards/join',{inviteCode:code})).data }
  async getBoardEntries(id:string,limit=50) { return (await this.client.get(`/boards/${id}/entries`,{params:{limit}})).data }
  async submitScore(d:any) { return (await this.client.post('/scores',d)).data }
  async getFeed(params?:any) { return (await this.client.get('/feed',{params})).data }
  async getNotifications() { return (await this.client.get('/notifications')).data }
  async markNotificationRead(id:string) { await this.client.patch(`/notifications/${id}/read`) }
  async markAllNotificationsRead() { await this.client.patch('/notifications/read-all') }
}
export const api = new MobileApiClient(); export default api
