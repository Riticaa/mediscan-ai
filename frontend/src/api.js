import axios from 'axios'

const API = axios.create({
  baseURL: 'http://127.0.0.1:8000'
})

export const analyseReport = async (file, language = 'english') => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('language', language)
  formData.append('use_vision', 'false')

  const response = await API.post('/analyse/report', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return response.data
}