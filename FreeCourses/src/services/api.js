// src/services/ApiService.js

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:9000/api';

class ApiService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes cache
  }

  // Generic fetch with error handling and caching
  async fetchWithCache(url, options = {}) {
    const cacheKey = `${url}_${JSON.stringify(options)}`;
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Cache the result
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now(),
      });

      return data;
    } catch (error) {
      console.error('API fetch error:', error);
      throw error;
    }
  }

  // Fetch courses with filters, pagination
  async getCourses({ category = '', search = '', level = '', limit = 9, offset = 0 } = {}) {
    const queryParams = new URLSearchParams();

    if (category && category !== 'All') queryParams.append('category', category);
    if (search) queryParams.append('search', search);
    if (level) queryParams.append('level', level);
    if (limit) queryParams.append('limit', limit);
    if (offset) queryParams.append('offset', offset);

    const url = `${API_BASE_URL}/courses${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    return this.fetchWithCache(url);
  }

  // Fetch single course detail by id or slug
  async getCourse(idOrSlug) {
    // Assuming backend supports slug-based fetching, else use ID
    const url = `${API_BASE_URL}/courses/${idOrSlug}`;
    return this.fetchWithCache(url);
  }

  // Fetch categories list (optional, if your backend supports)
  async getCategories() {
    const url = `${API_BASE_URL}/categories`;
    return this.fetchWithCache(url);
  }

  // Clear all cache - useful for updates
  clearCache() {
    this.cache.clear();
  }

  // Clear specific cache entry by url+options key
  clearCacheEntry(key) {
    this.cache.delete(key);
  }
}

export const apiService = new ApiService();
