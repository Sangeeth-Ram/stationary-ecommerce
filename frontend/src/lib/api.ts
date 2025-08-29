import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { store } from '@/store/store';
import { AuthResponse } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

class ApiClient {
  private client: AxiosInstance;
  private authToken: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });

    // Load token from localStorage on initialization
    this.loadToken();

    // Add request interceptor
    this.client.interceptors.request.use(
      (config) => {
        if (this.authToken) {
          config.headers.Authorization = `Bearer ${this.authToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as any;

        // If the error is 401 and we haven't tried to refresh yet
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            // Try to refresh the token
            const { data } = await this.refreshToken();
            this.setAuthToken(data.token);
            
            // Retry the original request with the new token
            originalRequest.headers.Authorization = `Bearer ${data.token}`;
            return this.client(originalRequest);
          } catch (refreshError) {
            // If refresh fails, clear auth state and redirect to login
            this.clearAuth();
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private loadToken() {
    if (typeof window !== 'undefined') {
      this.authToken = localStorage.getItem('authToken');
    }
  }

  setAuthToken(token: string) {
    this.authToken = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('authToken', token);
    }
  }

  clearAuth() {
    this.authToken = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
    }
  }

  // Auth methods
  async login(credentials: { email: string; password: string }): Promise<AuthResponse> {
    const { data } = await this.client.post<AuthResponse>('/auth/login', credentials);
    this.setAuthToken(data.token);
    return data;
  }

  async register(userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }): Promise<AuthResponse> {
    const { data } = await this.client.post<AuthResponse>('/auth/register', userData);
    this.setAuthToken(data.token);
    return data;
  }

  async refreshToken(): Promise<{ token: string }> {
    const { data } = await this.client.post<{ token: string }>('/auth/refresh-token');
    this.setAuthToken(data.token);
    return data;
  }

  async logout(): Promise<void> {
    try {
      await this.client.post('/auth/logout');
    } finally {
      this.clearAuth();
    }
  }

  // Generic request method
  async request<T = any>(config: AxiosRequestConfig): Promise<T> {
    const response = await this.client.request<T>(config);
    return response.data;
  }

  // API methods
  // Products
  getProducts(params?: any) {
    return this.request<{ products: any[]; total: number }>({
      method: 'GET',
      url: '/products',
      params,
    });
  }

  getProduct(slug: string) {
    return this.request({
      method: 'GET',
      url: `/products/${slug}`,
    });
  }

  // Cart
  getCart() {
    return this.request({
      method: 'GET',
      url: '/cart',
    });
  }

  addToCart(productId: string, quantity: number = 1) {
    return this.request({
      method: 'POST',
      url: '/cart/items',
      data: { productId, quantity },
    });
  }

  updateCartItem(itemId: string, quantity: number) {
    return this.request({
      method: 'PATCH',
      url: `/cart/items/${itemId}`,
      data: { quantity },
    });
  }

  removeCartItem(itemId: string) {
    return this.request({
      method: 'DELETE',
      url: `/cart/items/${itemId}`,
    });
  }

  // Orders
  createOrder(orderData: any) {
    return this.request({
      method: 'POST',
      url: '/orders',
      data: orderData,
    });
  }

  getOrders() {
    return this.request({
      method: 'GET',
      url: '/orders',
    });
  }

  getOrder(orderId: string) {
    return this.request({
      method: 'GET',
      url: `/orders/${orderId}`,
    });
  }

  // Admin methods
  createProduct(productData: any) {
    return this.request({
      method: 'POST',
      url: '/admin/products',
      data: productData,
    });
  }

  updateProduct(productId: string, productData: any) {
    return this.request({
      method: 'PATCH',
      url: `/admin/products/${productId}`,
      data: productData,
    });
  }

  deleteProduct(productId: string) {
    return this.request({
      method: 'DELETE',
      url: `/admin/products/${productId}`,
    });
  }

  // Upload file to S3
  async uploadFile(file: File, presignedUrl: string): Promise<void> {
    await axios.put(presignedUrl, file, {
      headers: {
        'Content-Type': file.type,
      },
    });
  }
}

export const api = new ApiClient();
