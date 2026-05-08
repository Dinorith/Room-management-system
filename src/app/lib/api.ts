const API_BASE_URL = '/api';

class ApiClient {
  private token: string | null = null;

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

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    // Remove Content-Type for FormData (file uploads)
    if (options.body instanceof FormData) {
      delete headers['Content-Type'];
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      this.setToken(null);
      window.location.href = '/login';
      throw new Error('Unauthenticated');
    }

    const data = await response.json();

    if (!response.ok) {
      throw {
        status: response.status,
        message: data.message || 'An error occurred',
        errors: data.details || {},
      };
    }

    return data;
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
    return this.request<any>('/tenants', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTenant(id: string, data: any) {
    return this.request<any>(`/tenants/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteTenant(id: string) {
    return this.request<any>(`/tenants/${id}`, { method: 'DELETE' });
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
    return this.request<any>('/rooms', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateRoom(id: string, data: any) {
    return this.request<any>(`/rooms/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteRoom(id: string) {
    return this.request<any>(`/rooms/${id}`, { method: 'DELETE' });
  }

  // Payments
  async getPayments(params?: Record<string, string>) {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request<any>(`/payments${query}`);
  }



  async createPayment(data: any) {
    return this.request<any>('/payments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePayment(id: string, data: any) {
    return this.request<any>(`/payments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
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
    return this.request<any>('/maintenance', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateMaintenance(id: string, data: any) {
    return this.request<any>(`/maintenance/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
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
    return this.request<any>('/expenses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteExpense(id: string) {
    return this.request<any>(`/expenses/${id}`, { method: 'DELETE' });
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
    return this.request<any>('/utilities', {
      method: 'POST',
      body: JSON.stringify(data),
    });
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
    return this.request<any>('/contracts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateContract(id: string, data: any) {
    return this.request<any>(`/contracts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteContract(id: string) {
    return this.request<any>(`/contracts/${id}`, { method: 'DELETE' });
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

  // Telegram
  async telegramBroadcast(message: string, chatId?: string) {
    return this.request<any>('/telegram/broadcast', {
      method: 'POST',
      body: JSON.stringify({ message, chat_id: chatId }),
    });
  }

  async telegramRegisterWebhook(webhookUrl: string) {
    return this.request<any>('/telegram/register-webhook', {
      method: 'POST',
      body: JSON.stringify({ webhook_url: webhookUrl }),
    });
  }

  async telegramTest() {
    return this.request<any>('/telegram/test');
  }

}

export const api = new ApiClient();
