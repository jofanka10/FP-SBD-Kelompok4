// frontend/src/services/api.ts

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const API = axios.create({
  baseURL: `${API_BASE_URL || 'http://localhost:5000'}/api`, // Tambahkan default fallback jika tidak terdefinisi
  headers: {
    'Content-Type': 'application/json',
  },
});

export const userAPI = {
  getAll: () => API.get('/users'),
  getById: (id: string) => API.get(`/users/${id}`),
  create: (userData: any) => API.post('/users', userData),
  update: (id: string, userData: any) => API.put(`/users/${id}`, userData),
  delete: (id: string) => API.delete(`/users/${id}`),
};

export const donationAPI = {
  getAll: () => API.get('/donations'),
  getById: (id: string) => API.get(`/donations/${id}`),
  create: (donationData: any) => API.post('/donations', donationData),
  update: (id: string, donationData: any) => API.put(`/donations/${id}`, donationData),
  delete: (id: string) => API.delete(`/donations/${id}`),
};

export const transactionAPI = {
  getAll: () => API.get('/transactions'),
  getById: (id: string) => API.get(`/transactions/${id}`),
  create: (transactionData: any) => API.post('/transactions', transactionData),
  update: (id: string, transactionData: any) => API.put(`/transactions/${id}`, transactionData),
  delete: (id: string) => API.delete(`/transactions/${id}`),
};

export const aidRecipientAPI = {
  getAll: () => API.get('/aid-recipients'),
  getById: (id: string) => API.get(`/aid-recipients/${id}`),
  create: (data: any) => API.post('/aid-recipients', data),
  update: (id: string, data: any) => API.put(`/aid-recipients/${id}`, data),
  delete: (id: string) => API.delete(`/aid-recipients/${id}`),
};

export const aidCategoryAPI = {
  getAll: () => API.get('/aid-categories'),
  getById: (id: string) => API.get(`/aid-categories/${id}`),
  create: (data: any) => API.post('/aid-categories', data),
  update: (id: string, data: any) => API.put(`/aid-categories/${id}`, data),
  delete: (id: string) => API.delete(`/aid-categories/${id}`),
};

export const aidAPI = {
  getAll: () => API.get('/aids'),
  getById: (id: string) => API.get(`/aids/${id}`),
  create: (data: any) => API.post('/aids', data),
  update: (id: string, data: any) => API.put(`/aids/${id}`, data),
  delete: (id: string) => API.delete('/aids', data),
};

export const trashAPI = {
  getAll: () => API.get('/trash'),
  restore: (collection: string, documentId: string) => API.put(`/trash/restore/${collection}/${documentId}`),
  permanentDelete: (collection: string, documentId: string) => API.delete(`/trash/permanent-delete/${collection}/${documentId}`),
};