const API_BASE = '/api';

/**
 * Retrieve current JWT access token from memory / localStorage
 */
export const getStoredToken = () => localStorage.getItem('noolz_admin_token');

/**
 * Store JWT access token
 */
export const setStoredToken = (token) => {
  if (token) {
    localStorage.setItem('noolz_admin_token', token);
  } else {
    localStorage.removeItem('noolz_admin_token');
  }
};

// Concurrency lock for refresh token request
let refreshPromise = null;

async function attemptTokenRefresh() {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const response = await fetch(`${API_BASE}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include', // sends HTTP-only refreshToken cookie
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok || !data.accessToken) {
          setStoredToken(null);
          window.dispatchEvent(new CustomEvent('noolz:auth-expired'));
          throw new Error(data.message || 'Session expired. Please log in again.');
        }

        setStoredToken(data.accessToken);
        window.dispatchEvent(
          new CustomEvent('noolz:token-refreshed', { detail: { token: data.accessToken, admin: data.admin } })
        );
        return data.accessToken;
      } catch (err) {
        setStoredToken(null);
        window.dispatchEvent(new CustomEvent('noolz:auth-expired'));
        throw err;
      } finally {
        refreshPromise = null;
      }
    })();
  }
  return refreshPromise;
}

/**
 * Centralized fetch wrapper with automatic Authorization header,
 * credentials, and automatic token refresh on expiration.
 */
async function request(endpoint, options = {}, isRetry = false) {
  const url = `${API_BASE}${endpoint}`;
  let token = getStoredToken();

  const headers = {
    ...options.headers,
  };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
    credentials: 'include', // Send cookies (including refreshToken)
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json().catch(() => ({}));

    // If access token is expired or unauthorized, and not already retrying
    const isAuthRoute = endpoint.startsWith('/auth/login') || endpoint.startsWith('/auth/refresh');
    if (response.status === 401 && !isRetry && !isAuthRoute) {
      try {
        const newToken = await attemptTokenRefresh();
        if (newToken) {
          return await request(endpoint, options, true);
        }
      } catch (refreshErr) {
        // Refresh failed: surface original unauthorized error
        const error = new Error(data.message || 'Session expired');
        error.status = 401;
        error.data = data;
        throw error;
      }
    }

    if (!response.ok) {
      const error = new Error(data.message || `Request failed with status ${response.status}`);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    console.error(`[API Error] ${endpoint}:`, error.message);
    throw error;
  }
}

export const api = {
  // Authentication
  auth: {
    login: (identifier, password) =>
      request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ identifier, password }),
      }),
    refresh: () => attemptTokenRefresh(),
    logout: () =>
      request('/auth/logout', {
        method: 'POST',
      }),
    getMe: () => request('/auth/me'),
  },

  // Products
  products: {
    getAll: (params = {}) => {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => {
        if (v && v !== 'all') query.set(k, v);
      });
      const qs = query.toString();
      return request(`/products${qs ? `?${qs}` : ''}`);
    },
    getFeatured: () => request('/products/featured'),
    getById: (id) => request(`/products/${id}`),
    create: (data) =>
      request('/products', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id, data) =>
      request(`/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id) =>
      request(`/products/${id}`, {
        method: 'DELETE',
      }),
    uploadImages: async (files) => {
      const formData = new FormData();
      for (const file of files) {
        formData.append('images', file);
      }
      return request('/products/upload-images', {
        method: 'POST',
        body: formData,
      });
    },
  },

  // Stock Management
  stock: {
    getOverview: () => request('/stock/overview'),
    getAlerts: () => request('/stock/alerts'),
    getHistory: (params = {}) => {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => {
        if (v && v !== 'all') query.set(k, v);
      });
      const qs = query.toString();
      return request(`/stock/history${qs ? `?${qs}` : ''}`);
    },
    updateVariant: (productId, { color, size, quantity, note }) =>
      request(`/stock/${productId}`, {
        method: 'PUT',
        body: JSON.stringify({ color, size, quantity, note }),
      }),
    adjustVariant: (productId, { color, size, change, note }) =>
      request(`/stock/${productId}/adjust`, {
        method: 'POST',
        body: JSON.stringify({ color, size, change, note }),
      }),
  },

  // Hero Banners Management
  heroBanners: {
    getAll: () => request('/hero-banners'),
    getActive: () => request('/hero-banners/active'),
    getById: (id) => request(`/hero-banners/${id}`),
    create: (data) => {
      const isFormData = data instanceof FormData;
      return request('/hero-banners', {
        method: 'POST',
        body: isFormData ? data : JSON.stringify(data),
      });
    },
    update: (id, data) => {
      const isFormData = data instanceof FormData;
      return request(`/hero-banners/${id}`, {
        method: 'PUT',
        body: isFormData ? data : JSON.stringify(data),
      });
    },
    delete: (id) =>
      request(`/hero-banners/${id}`, {
        method: 'DELETE',
      }),
  },
};

export default api;
