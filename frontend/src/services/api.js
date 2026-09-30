const API_BASE = '/api';

export function getAuthToken() {
  return localStorage.getItem('agri_token');
}

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem('agri_token', token);
  } else {
    localStorage.removeItem('agri_token');
  }
}

async function request(endpoint, options = {}) {
  const headers = options.headers || {};
  const token = getAuthToken();

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // If body is FormData, do not set Content-Type header (browser will set multipart boundary)
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const config = {
    ...options,
    headers
  };

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, config);
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMsg = data?.detail || `Request failed with status ${response.status}`;
      throw new Error(errorMsg);
    }

    return data;
  } catch (err) {
    throw err;
  }
}

export const api = {
  // Auth
  register: (name, email, password) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password })
    }),

  login: (email, password) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    }),

  getCurrentUser: () => request('/auth/me'),

  // Crops
  getCrops: (params = {}) => {
    const searchParams = new URLSearchParams();
    if (params.category) searchParams.append('category', params.category);
    if (params.ai_supported !== undefined && params.ai_supported !== '') {
      searchParams.append('ai_supported', params.ai_supported);
    }
    if (params.search) searchParams.append('search', params.search);
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return request(`/crops${query}`);
  },
  getCropDetail: (id) => request(`/crops/${id}`),

  // Assessments
  createAssessment: (cropId, imageFile, imageSource = 'manual') => {
    const formData = new FormData();
    formData.append('crop_id', cropId);
    formData.append('image_source', imageSource);
    formData.append('file', imageFile);

    return request('/assessments', {
      method: 'POST',
      body: formData
    });
  },

  getAssessment: (id) => request(`/assessments/${id}`),

  listAssessments: (params = {}) => {
    const searchParams = new URLSearchParams();
    if (params.cropId) searchParams.append('crop_id', params.cropId);
    if (params.status) searchParams.append('status', params.status);
    if (params.search) searchParams.append('search', params.search);
    if (params.page) searchParams.append('page', params.page);
    if (params.limit) searchParams.append('limit', params.limit);

    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return request(`/assessments${query}`);
  },

  getStats: () => request('/assessments/stats'),

  // Health
  getHealth: () => request('/health'),
  getAiHealth: () => request('/health/ai')
};
