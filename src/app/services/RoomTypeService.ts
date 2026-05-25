import { api } from '../lib/api';

const API_BASE_URL = '/room-types';

export interface RoomType {
  id: string;
  name: string;
  base_price: number;
  capacity: number;
  description?: string;
  status: boolean;
  created_at: string;
  updated_at: string;
  room_count?: number;
}

export interface RoomTypeFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: boolean;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface RoomTypeCreateInput {
  name: string;
  base_price: number;
  capacity: number;
  description?: string;
  status?: boolean;
}

export interface RoomTypeUpdateInput extends RoomTypeCreateInput {}

class RoomTypeService {
  /**
   * Get all room types with pagination
   */
  async getAll(filters?: RoomTypeFilters) {
    const response = await api.get(API_BASE_URL, { params: filters });
    return response;
  }

  /**
   * Get active room types only
   */
  async getActive() {
    const response = await api.get(`${API_BASE_URL}/active`);
    return response;
  }

  /**
   * Get room type statistics
   */
  async getStatistics() {
    const response = await api.get(`${API_BASE_URL}/statistics`);
    return response;
  }

  /**
   * Get single room type
   */
  async getById(id: string) {
    const response = await api.get(`${API_BASE_URL}/${id}`);
    return response;
  }

  /**
   * Create new room type
   */
  async create(data: RoomTypeCreateInput) {
    const response = await api.post(API_BASE_URL, data);
    return response;
  }

  /**
   * Update room type
   */
  async update(id: string, data: RoomTypeUpdateInput) {
    const response = await api.put(`${API_BASE_URL}/${id}`, data);
    return response;
  }

  /**
   * Delete room type
   */
  async delete(id: string) {
    const response = await api.delete(`${API_BASE_URL}/${id}`);
    return response;
  }

  /**
   * Search room types
   */
  async search(query: string, limit: number = 10) {
    const response = await api.get(API_BASE_URL, {
      params: {
        search: query,
        limit: limit,
      },
    });
    return response;
  }
}

export default new RoomTypeService();
