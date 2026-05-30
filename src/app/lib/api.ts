const API_BASE_URL = import.meta.env.VITE_API_URL ||
  (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? '/api'
    : 'https://room-rent-backend-production-7530.up.railway.app/api');

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class ApiClient {
  private token: string | null = null;
  private cache: Map<string, CacheEntry<any>> = new Map();
  private pendingRequests: Map<string, Promise<any>> = new Map();
  
  // Cache TTL in milliseconds (default: 30 seconds)
  private defaultTTL = 30000;
  
  // Endpoints with custom TTL settings
  private cacheTTLConfig: Record<string, number> = {
    '/dashboard/overview': 30000,      // 30 seconds
    '/dashboard/alerts': 30000,        // 30 seconds
    '/payments': 60000,                // 60 seconds
    '/tenants': 60000,                 // 60 seconds
    '/rooms': 60000,                   // 60 seconds
    '/contracts': 60000,               // 60 seconds
    '/maintenance': 60000,             // 60 seconds
    '/expenses': 60000,                // 60 seconds
    '/utilities': 60000,               // 60 seconds
    '/reports': 120000,                // 120 seconds
  };

  constructor() {
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private getCacheTTL(endpoint: string): number {
    for (const [pattern, ttl] of Object.entries(this.cacheTTLConfig)) {
      if (endpoint.startsWith(pattern)) {
        return ttl;
      }
    }
    return this.defaultTTL;
  }

  private getCacheKey(endpoint: string): string {
    return `cache_${endpoint}`;
  }

  private isCacheValid<T>(entry: CacheEntry<T>): boolean {
    return Date.now() - entry.timestamp < entry.ttl;
  }

  private getCachedData<T>(endpoint: string): T | null {
    const key = this.getCacheKey(endpoint);
    const entry = this.cache.get(key);
    
    if (entry && this.isCacheValid(entry)) {
      return entry.data as T;
    }
    
    // Clear expired cache
    if (entry) {
      this.cache.delete(key);
    }
    
    return null;
  }

  private setCachedData<T>(endpoint: string, data: T): void {
    const key = this.getCacheKey(endpoint);
    const ttl = this.getCacheTTL(endpoint);
    
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  clearCache(pattern?: string): void {
    if (!pattern) {
      this.cache.clear();
      return;
    }

    // Clear cache entries matching the pattern
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    // For GET requests, check cache first
    if (!options.method || options.method === 'GET') {
      // Check in-flight requests to avoid duplicate requests
      const pendingKey = `pending_${endpoint}`;
      if (this.pendingRequests.has(pendingKey)) {
        return this.pendingRequests.get(pendingKey)!;
      }

      // Check cache
      const cached = this.getCachedData<T>(endpoint);
      if (cached) {
        return cached;
      }
    }

    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Bypass-Tunnel-Reminder': 'true',
      ...(options.headers as Record<string, string> || {}),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    // Remove Content-Type for FormData (file uploads)
    if (options.body instanceof FormData) {
      delete headers['Content-Type'];
    }

    const url = `${API_BASE_URL}${endpoint}`;
    const requestPromise = (async () => {
      let response;
      try {
        response = await fetch(url, {
          ...options,
          headers,
        });
      } catch (e: any) {
        throw new Error(`Network Error: Failed to connect to ${url}. Make sure your local backend server is running and CORS is configured.`);
      }

      if (response.status === 401) {
        this.setToken(null);
        window.location.href = '/login';
        throw new Error('Unauthenticated');
      }

      let data;
      let responseText = '';
      try {
        responseText = await response.text();
        data = JSON.parse(responseText);
      } catch (e) {
        const sample = responseText ? responseText.substring(0, 120) : '(empty)';
        throw new Error(`API Error: Response from ${url} (Status ${response.status}) is not JSON. Response: "${sample}"`);
      }

      if (!response.ok) {
        throw {
          status: response.status,
          message: data.message || 'An error occurred',
          errors: data.details || {},
        };
      }

      // Cache successful GET responses
      if (!options.method || options.method === 'GET') {
        this.setCachedData(endpoint, data);
      }

      return data;
    })();

    // Track in-flight request for GET requests
    if (!options.method || options.method === 'GET') {
      const pendingKey = `pending_${endpoint}`;
      this.pendingRequests.set(pendingKey, requestPromise);
      requestPromise.finally(() => {
        this.pendingRequests.delete(pendingKey);
      });
    }

    return requestPromise;
  }

  // Auth
  async login(email: string, password: string) {
    const data = await this.request<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(data.data.token);
    return data;
  }

  async register(name: string, email: string, password: string, password_confirmation: string) {
    const data = await this.request<any>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, password_confirmation }),
    });
    this.setToken(data.data.token);
    return data;
  }

  async logout() {
    await this.request('/auth/logout', { method: 'POST' });
    this.setToken(null);
  }

  async getMe() {
    return this.request<any>('/auth/me');
  }

  async changePassword(current_password: string, password: string, password_confirmation: string) {
    return this.request<any>('/auth/password', {
      method: 'PUT',
      body: JSON.stringify({ current_password, password, password_confirmation }),
    });
  }

  // Dashboard
  async getDashboardOverview() {
    return this.request<any>('/dashboard/overview');
  }

  async getDashboardAlerts() {
    return this.request<any>('/dashboard/alerts');
  }

  async getRecentActivity() {
    return this.request<any>('/dashboard/recent-activity');
  }

  // Tenants
  async getTenants(params?: Record<string, string>) {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request<any>(`/tenants${query}`);
  }

  async getTenant(id: string) {
    return this.request<any>(`/tenants/${id}`);
  }

  async createTenant(data: any) {
    const result = await this.request<any>('/tenants', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    this.clearCache('tenant');
    this.clearCache('dashboard');
    return result;
  }

  async updateTenant(id: string, data: any) {
    const result = await this.request<any>(`/tenants/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    this.clearCache('tenant');
    this.clearCache('dashboard');
    return result;
  }

  async deleteTenant(id: string) {
    const result = await this.request<any>(`/tenants/${id}`, { method: 'DELETE' });
    this.clearCache('tenant');
    this.clearCache('dashboard');
    return result;
  }

  // Rooms
  async getRooms(params?: Record<string, string>) {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request<any>(`/rooms${query}`);
  }

  async getRoom(id: string) {
    return this.request<any>(`/rooms/${id}`);
  }

  async createRoom(data: any) {
    const result = await this.request<any>('/rooms', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    this.clearCache('room');
    this.clearCache('dashboard');
    return result;
  }

  async updateRoom(id: string, data: any) {
    const result = await this.request<any>(`/rooms/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    this.clearCache('room');
    this.clearCache('dashboard');
    return result;
  }

  async deleteRoom(id: string) {
    const result = await this.request<any>(`/rooms/${id}`, { method: 'DELETE' });
    this.clearCache('room');
    this.clearCache('dashboard');
    return result;
  }

  // Payments
  async getPayments(params?: Record<string, string>) {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request<any>(`/payments${query}`);
  }



  async createPayment(data: any) {
    const result = await this.request<any>('/payments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    this.clearCache('payment');
    this.clearCache('dashboard');
    return result;
  }

  async updatePayment(id: string, data: any) {
    const result = await this.request<any>(`/payments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    this.clearCache('payment');
    this.clearCache('dashboard');
    return result;
  }

  async deletePayment(id: string) {
    const result = await this.request<any>(`/payments/${id}`, {
      method: 'DELETE',
    });
    this.clearCache('payment');
    this.clearCache('dashboard');
    return result;
  }

  async getPaymentSchedule(month: string) {
    return this.request<any>(`/payments/schedule/${encodeURIComponent(month)}`);
  }

  async getLatePayments() {
    return this.request<any>('/payments/late');
  }

  async getPaymentReceipt(id: string) {
    return this.request<any>(`/payments/${id}/receipt`);
  }

  async generateInvoices() {
    return this.request<any>('/payments/generate-invoices', { method: 'POST' });
  }

  // Maintenance
  async getMaintenance(params?: Record<string, string>) {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request<any>(`/maintenance${query}`);
  }

  async getMaintenanceItem(id: string) {
    return this.request<any>(`/maintenance/${id}`);
  }

  async createMaintenance(data: any) {
    const result = await this.request<any>('/maintenance', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    this.clearCache('maintenance');
    this.clearCache('dashboard');
    return result;
  }

  async updateMaintenance(id: string, data: any) {
    const result = await this.request<any>(`/maintenance/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    this.clearCache('maintenance');
    this.clearCache('dashboard');
    return result;
  }

  async getMaintenanceStats() {
    return this.request<any>('/maintenance/stats');
  }

  // Expenses
  async getExpenses(params?: Record<string, string>) {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request<any>(`/expenses${query}`);
  }

  async createExpense(data: any) {
    const result = await this.request<any>('/expenses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    this.clearCache('expense');
    this.clearCache('dashboard');
    return result;
  }

  async deleteExpense(id: string) {
    const result = await this.request<any>(`/expenses/${id}`, { method: 'DELETE' });
    this.clearCache('expense');
    this.clearCache('dashboard');
    return result;
  }

  async getExpensesByCategory(category: string) {
    return this.request<any>(`/expenses/category/${encodeURIComponent(category)}`);
  }

  async getMonthlyExpenses(month: string) {
    return this.request<any>(`/expenses/monthly/${encodeURIComponent(month)}`);
  }

  // Utilities
  async getUtilities(params?: Record<string, string>) {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request<any>(`/utilities${query}`);
  }

  async createUtility(data: any) {
    const result = await this.request<any>('/utilities', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    this.clearCache('utility');
    this.clearCache('dashboard');
    return result;
  }

  async linkUtility(id: string) {
    const result = await this.request<any>(`/utilities/${id}/link`, {
      method: 'POST',
    });
    this.clearCache('utility');
    return result;
  }

  async getUtilityRates() {
    return this.request<any>('/utilities/rates');
  }

  async updateUtilityRates(data: any) {
    return this.request<any>('/utilities/rates', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getMonthlyUtilities(month: string) {
    return this.request<any>(`/utilities/monthly/${encodeURIComponent(month)}`);
  }

  // Contracts
  async getContracts(params?: Record<string, string>) {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request<any>(`/contracts${query}`);
  }

  async getContract(id: string) {
    return this.request<any>(`/contracts/${id}`);
  }

  async createContract(data: any) {
    const result = await this.request<any>('/contracts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    this.clearCache('contract');
    this.clearCache('dashboard');
    return result;
  }

  async updateContract(id: string, data: any) {
    const result = await this.request<any>(`/contracts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    this.clearCache('contract');
    this.clearCache('dashboard');
    return result;
  }

  async deleteContract(id: string) {
    const result = await this.request<any>(`/contracts/${id}`, { method: 'DELETE' });
    this.clearCache('contract');
    this.clearCache('dashboard');
    return result;
  }

  async getExpiringContracts() {
    return this.request<any>('/contracts/expiring-soon');
  }

  async renewContract(id: string, data: { rentIncrease?: number; durationMonths?: number; terms?: string }) {
    return this.request<any>(`/contracts/${id}/renew`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Settings
  async getSettings() {
    return this.request<any>('/settings');
  }

  async updateSettings(data: any) {
    return this.request<any>('/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getProfile() {
    return this.request<any>('/settings/profile');
  }

  async updateProfile(data: any) {
    return this.request<any>('/settings/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Payment Options
  async getPaymentOptions() {
    return this.request<any>('/payment-options');
  }

  async createPaymentOption(data: any) {
    return this.request<any>('/payment-options', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePaymentOption(id: string, data: any) {
    return this.request<any>(`/payment-options/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deletePaymentOption(id: string) {
    return this.request<any>(`/payment-options/${id}`, {
      method: 'DELETE',
    });
  }

  // Reports
  async getIncomeReport(params?: Record<string, string>) {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request<any>(`/reports/income${query}`);
  }

  async getExpenseReport(params?: Record<string, string>) {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request<any>(`/reports/expenses${query}`);
  }

  async getOccupancyReport() {
    return this.request<any>('/reports/occupancy');
  }

  async getProfitLossReport(params?: Record<string, string>) {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request<any>(`/reports/profit-loss${query}`);
  }

  async getTenantSummary() {
    return this.request<any>('/reports/tenant-summary');
  }

  async getFinancialSummary() {
    return this.request<any>('/reports/financial-summary');
  }

  // Notifications
  async getNotifications(params?: Record<string, string>) {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request<any>(`/notifications${query}`);
  }

  async createAnnouncement(data: any) {
    return this.request<any>('/notifications', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async markNotificationRead(id: string) {
    return this.request<any>(`/notifications/mark-read/${id}`, { method: 'POST' });
  }

  async deleteNotification(id: string) {
    return this.request<any>(`/notifications/${id}`, { method: 'DELETE' });
  }

  async sendSms(data: any) {
    return this.request<any>('/notifications/send-sms', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // File Upload
  async uploadFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.request<any>('/files/upload', {
      method: 'POST',
      body: formData,
    });
  }


  // Generic REST methods for flexibility
  async get<T = any>(endpoint: string, options?: { params?: Record<string, any> }) {
    const query = options?.params ? '?' + new URLSearchParams(Object.entries(options.params).map(([k, v]) => [k, String(v)])).toString() : '';
    return this.request<T>(`${endpoint}${query}`);
  }

  async post<T = any>(endpoint: string, data?: any) {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T = any>(endpoint: string, data?: any) {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete<T = any>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // Super Admin Methods
  async getSuperAdminDashboard() {
    return this.request<any>('/super-admin/dashboard');
  }

  async getOwners(params?: Record<string, string>) {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request<any>(`/super-admin/owners${query}`);
  }

  async createOwner(data: any) {
    return this.request<any>('/super-admin/owners', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateOwner(id: string, data: any) {
    return this.request<any>(`/super-admin/owners/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteOwner(id: string) {
    return this.request<any>(`/super-admin/owners/${id}`, {
      method: 'DELETE',
    });
  }

  async toggleOwnerStatus(id: string) {
    return this.request<any>(`/super-admin/owners/${id}/toggle-status`, {
      method: 'PUT',
    });
  }

  async getSuperAdminProperties(params?: Record<string, string>) {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request<any>(`/super-admin/properties${query}`);
  }

  async deleteSuperAdminProperty(id: string) {
    return this.request<any>(`/super-admin/properties/${id}`, {
      method: 'DELETE',
    });
  }

  async getSuperAdminStatistics() {
    return this.request<any>('/super-admin/statistics');
  }

  async getSuperAdminInvoices(params?: Record<string, string>) {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request<any>(`/super-admin/invoices${query}`);
  }

  async getSuperAdminActivityLogs(params?: Record<string, string>) {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request<any>(`/super-admin/activity-logs${query}`);
  }

  async getSuperAdminSettings() {
    return this.request<any>('/super-admin/settings');
  }

  async updateSuperAdminSettings(data: any) {
    return this.request<any>('/super-admin/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

}

export const api = new ApiClient();
