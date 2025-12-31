export * from './formatters';
export * from './validation';
export * from './helpers';
export * from './security';
export * from './api-client';

// File: packages/utils/formatters.ts
export function formatPrice(cents: number, currency: string = 'USD'): string {
  const amount = cents / 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: Date | string, format: 'short' | 'long' | 'relative' = 'short'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  switch (format) {
    case 'short':
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    case 'long':
      return d.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    case 'relative':
      return formatRelativeTime(d);
    default:
      return d.toISOString();
  }
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return formatDate(date, 'short');
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function generateOrderNumber(): string {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${timestamp}-${random}`;
}

// File: packages/utils/validation.ts
import { z } from 'zod';

export const productSchema = z.object({
  title: z.string().min(3).max(200),
  slug: z.string().min(3).max(200),
  description: z.string().max(1000).optional(),
  type: z.enum(['DIGITAL', 'PHYSICAL', 'SERVICE', 'SUBSCRIPTION']),
  priceCents: z.number().int().min(0),
  currency: z.string().length(3),
  stock: z.number().int().min(0).optional(),
  images: z.array(z.string().url()).min(1),
  published: z.boolean().default(true),
});

export const orderSchema = z.object({
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().int().min(1),
    options: z.record(z.any()).optional(),
  })).min(1),
  customerEmail: z.string().email(),
  customerName: z.string().min(2).optional(),
  shippingAddress: z.object({
    line1: z.string(),
    line2: z.string().optional(),
    city: z.string(),
    state: z.string(),
    postalCode: z.string(),
    country: z.string(),
  }).optional(),
});

export const userSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).optional(),
  role: z.enum(['ADMIN', 'CLIENT', 'VENDOR', 'MODERATOR']).optional(),
});

export function validateEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

export function validatePhone(phone: string): boolean {
  const re = /^[\+]?[1-9][\d]{0,15}$/;
  return re.test(phone.replace(/[\s\-\(\)]/g, ''));
}

// File: packages/utils/helpers.ts
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

export function generateId(length: number = 12): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
}

export function isEmpty(obj: any): boolean {
  if (obj === null || obj === undefined) return true;
  if (Array.isArray(obj)) return obj.length === 0;
  if (typeof obj === 'object') return Object.keys(obj).length === 0;
  return !obj;
}

export function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  
  return null;
}

export function setCookie(name: string, value: string, days: number = 7): void {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Strict`;
}

// File: packages/utils/security.ts
import crypto from 'crypto';

export function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString('hex');
    
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) reject(err);
      resolve(`${salt}:${derivedKey.toString('hex')}`);
    });
  });
}

export function verifyPassword(password: string, hash: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const [salt, key] = hash.split(':');
    
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) reject(err);
      resolve(key === derivedKey.toString('hex'));
    });
  });
}

export function generateToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

export function encrypt(text: string, secret: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(secret, 'hex'), iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag().toString('hex');
  
  return `${iv.toString('hex')}:${encrypted}:${authTag}`;
}

export function decrypt(encryptedText: string, secret: string): string {
  const [ivHex, encrypted, authTagHex] = encryptedText.split(':');
  
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  
  const decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(secret, 'hex'), iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

export function sanitizeHtml(html: string): string {
  // Basic HTML sanitization
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/on\w+='[^']*'/gi, '');
}

// File: packages/utils/api-client.ts
export class ApiClient {
  private baseUrl: string;
  private token?: string;

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
  }

  setToken(token: string) {
    this.token = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers = new Headers(options.headers);
    headers.set('Content-Type', 'application/json');
    
    if (this.token) {
      headers.set('Authorization', `Bearer ${this.token}`);
    }

    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: response.statusText,
      }));
      
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Products
  async getProducts(params?: {
    page?: number;
    limit?: number;
    type?: string;
    category?: string;
    search?: string;
  }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/products${query ? `?${query}` : ''}`);
  }

  async getProduct(slug: string) {
    return this.request(`/products/${slug}`);
  }

  // Cart
  async getCart() {
    return this.request('/cart');
  }

  async addToCart(item: { productId: string; quantity: number; options?: any }) {
    return this.request('/cart', {
      method: 'POST',
      body: JSON.stringify(item),
    });
  }

  async updateCart(itemId: string, quantity: number) {
    return this.request(`/cart/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
  }

  async removeFromCart(itemId: string) {
    return this.request(`/cart/${itemId}`, {
      method: 'DELETE',
    });
  }

  // Checkout
  async createCheckoutSession(items: Array<{
    productId: string;
    quantity: number;
  }>) {
    return this.request('/checkout/session', {
      method: 'POST',
      body: JSON.stringify({ items }),
    });
  }

  // Orders
  async getOrders(params?: { page?: number; limit?: number }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/orders${query ? `?${query}` : ''}`);
  }

  async getOrder(orderId: string) {
    return this.request(`/orders/${orderId}`);
  }

  // User
  async getProfile() {
    return this.request('/user/profile');
  }

  async updateProfile(data: any) {
    return this.request('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Admin endpoints
  async adminGetOrders(params?: any) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/admin/orders${query ? `?${query}` : ''}`);
  }

  async adminUpdateOrder(orderId: string, data: any) {
    return this.request(`/admin/orders/${orderId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async adminGetProducts(params?: any) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/admin/products${query ? `?${query}` : ''}`);
  }

  async adminCreateProduct(data: any) {
    return this.request('/admin/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async adminUpdateProduct(productId: string, data: any) {
    return this.request(`/admin/products/${productId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async adminDeleteProduct(productId: string) {
    return this.request(`/admin/products/${productId}`, {
      method: 'DELETE',
    });
  }
}

// Singleton instance
export const api = new ApiClient(process.env.NEXT_PUBLIC_API_URL);