import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000',
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json'
  }
})

export async function checkHealth() {
  const response = await api.get('/health')
  return response.data
}

export async function askAgent(question) {
  const response = await api.post('/ask', { question })
  return response.data
}

export default api
