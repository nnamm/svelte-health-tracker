import axios from 'axios';
import type { HealthRecord } from '$lib/types/HealthRecord';

const API_BASE_URL = 'http://localhost:8080';

export const api = {
  async getHealthRecord(date: string): Promise<HealthRecord> {
    const response = await axios.get(`${API_BASE_URL}/health?date=${date}`);
    return response.data;
  },

  async createHealthRecord(healthRecord: Partial<HealthRecord>): Promise<HealthRecord> {
    const response = await axios.post(`${API_BASE_URL}/health`, healthRecord);
    return response.data;
  },

  async updateHealthRecord(healthRecord: Partial<HealthRecord>): Promise<HealthRecord> {
    const response = await axios.post(`${API_BASE_URL}/health`, healthRecord);
    return response.data;
  },

  async deleteHealthRecord(date: string): Promise<void> {
    await axios.delete(`${API_BASE_URL}/health?date=${date}`);
  }
};
