import axios from 'axios'

const rawBaseUrl = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' && window.location.port === '5173' ? '/api' : 'http://127.0.0.1:8000')
const API_BASE_URL = rawBaseUrl.replace(/\/+$/, '')

const API = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000,
})

// ─── Health check ────────────────────────────────────────────────────────────
export const checkBackendHealth = async () => {
  try {
    const res = await API.get('/health')
    return res.data?.status === 'healthy'
  } catch {
    return false
  }
}

// ─── Auth token helpers ───────────────────────────────────────────────────────
export const getToken  = ()          => localStorage.getItem('mediscan_token')
export const setToken  = (t)         => localStorage.setItem('mediscan_token', t)
export const clearToken = ()         => localStorage.removeItem('mediscan_token')
export const getUser   = ()          => {
  try { return JSON.parse(localStorage.getItem('mediscan_user') || 'null') } catch { return null }
}
export const setUser   = (u)         => localStorage.setItem('mediscan_user', JSON.stringify(u))
export const clearUser = ()          => localStorage.removeItem('mediscan_user')

// Attach JWT to every request automatically
API.interceptors.request.use(config => {
  const token = getToken()
  if (token) config.headers['Authorization'] = `Bearer ${token}`
  return config
})

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const register = async (name, email, password) => {
  const res = await API.post('/auth/register', { name, email, password })
  setToken(res.data.access_token)
  setUser(res.data.user)
  return res.data
}

export const login = async (email, password) => {
  const res = await API.post('/auth/login/json', { name: '', email, password })
  setToken(res.data.access_token)
  setUser(res.data.user)
  return res.data
}

export const logout = () => {
  clearToken()
  clearUser()
}

export const fetchMe = async () => {
  const res = await API.get('/auth/me')
  return res.data
}

// ─── Analyse report (upload) ─────────────────────────────────────────────────
export const analyseReport = async (file, language = 'english', gender = 'female') => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('language', language)
  formData.append('gender', gender)

  try {
    // Note: Do NOT set Content-Type header manually for FormData;
    // Axios / browser will automatically set 'multipart/form-data; boundary=...'
    const response = await API.post('/analyse/report', formData)
    return response.data
  } catch (err) {
    if (err.response?.status === 404) {
      const fallbackRes = await API.post('/analyze/report', formData)
      return fallbackRes.data
    }
    throw err
  }
}

// ─── Chat ─────────────────────────────────────────────────────────────────────
export const chatWithReport = async (messages, reportContext, language = 'english') => {
  const response = await API.post('/chat', { messages, report_context: reportContext, language })
  return response.data
}

// ─── History ──────────────────────────────────────────────────────────────────
export const saveReport = async (filename, language, analysis) => {
  try {
    const response = await API.post('/history/save', { filename, language, analysis })
    return response.data
  } catch (err) {
    console.warn('History save failed:', err.message)
    return null
  }
}

export const getHistory = async (limit = 20) => {
  const response = await API.get('/history', { params: { limit } })
  return response.data
}

export const getHistoryReport = async (id) => {
  const response = await API.get(`/history/${id}`)
  return response.data
}

export const deleteHistoryReport = async (id) => {
  const response = await API.delete(`/history/${id}`)
  return response.data
}

export default API