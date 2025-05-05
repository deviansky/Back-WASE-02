// src/api/api.ts
const API_URL = 'http://localhost:5000';

// Tipe data dasar
export interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  categories: string;
}

export interface Penghuni {
  id?: number;
  nama: string;
  prodi: string;
  angkatan: number;
  asalDaerah: string;
  noHp: string;
  created_at?: string;
  updated_at?: string;
}

export interface MonthlyStatistic {
  month: string;
  month_number: number;
  year?: number;
  sales: number;
  revenue: number;
}

export interface QuarterlyStatistic {
  quarter: string;
  year?: number;
  sales: number;
  revenue: number;
}

export interface YearlyStatistic {
  year: number;
  sales: number;
  revenue: number;
}

export interface Kegiatan {
  id: number;
  judul: string;
  deskripsi: string;
  tanggal: string;
  waktu_acara: string;
  created_at?: string;
  updated_at?: string;
}


// Utility function untuk HTTP requests
const apiRequest = async <T>(endpoint: string, options?: RequestInit): Promise<T> => {
  try {
    const url = `${API_URL}${endpoint}`;
    const response = await fetch(url, options);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Server response:', errorText);
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return options?.method === 'DELETE' ? (null as T) : (data.data || data);
  } catch (error) {
    console.error(`API request failed: ${endpoint}`, error);
    throw error;
  }
};

// API untuk Products
export const productApi = {
  getAll: (): Promise<Product[]> => 
    apiRequest<Product[]>('/products'),
};

// API untuk Penghuni
export const penghuniApi = {
  getAll: (): Promise<Penghuni[]> => 
    apiRequest<Penghuni[]>('/penghunis'),
  
  create: (penghuni: Omit<Penghuni, 'id'>): Promise<Penghuni> => 
    apiRequest<Penghuni>('/penghunis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(penghuni),
    }),
  
  update: (penghuni: Penghuni): Promise<Penghuni> => 
    apiRequest<Penghuni>(`/penghunis/${penghuni.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(penghuni),
    }),
  
  delete: (id: number): Promise<void> => 
    apiRequest<void>(`/penghunis/${id}`, { method: 'DELETE' }),
};

// API untuk Statistik
export const statisticsApi = {
  // Monthly statistics
  monthly: {
    getByYear: (year: number): Promise<MonthlyStatistic[]> => 
      apiRequest<MonthlyStatistic[]>(`/statistics/monthly?year=${year}`),
    
    save: (data: MonthlyStatistic & { year: number }): Promise<MonthlyStatistic> => 
      apiRequest<MonthlyStatistic>('/statistics/monthly', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    
    delete: (year: number, monthNumber: number): Promise<void> => 
      apiRequest<void>(`/statistics/monthly/${year}/${monthNumber}`, { method: 'DELETE' }),
  },
  
  // Quarterly statistics
  quarterly: {
    getByYear: (year: number): Promise<QuarterlyStatistic[]> => 
      apiRequest<QuarterlyStatistic[]>(`/statistics/quarterly?year=${year}`),
    
    save: (data: QuarterlyStatistic & { year: number }): Promise<QuarterlyStatistic> => 
      apiRequest<QuarterlyStatistic>('/statistics/quarterly', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
  },
  
  // Yearly statistics
  yearly: {
    getAll: (): Promise<YearlyStatistic[]> => 
      apiRequest<YearlyStatistic[]>('/statistics/yearly'),
    
    save: (data: YearlyStatistic): Promise<YearlyStatistic> => 
      apiRequest<YearlyStatistic>('/statistics/yearly', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
  },
};

// API untuk Kegiatan
export const kegiatanApi = {
  getAll: (): Promise<Kegiatan[]> =>
    apiRequest<Kegiatan[]>('/kegiatan'),

  create: (kegiatan: Omit<Kegiatan, 'id'>): Promise<Kegiatan> =>
    apiRequest<Kegiatan>('/kegiatan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(kegiatan),
    }),

  update: (kegiatan: Kegiatan): Promise<Kegiatan> =>
    apiRequest<Kegiatan>(`/kegiatan/${kegiatan.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(kegiatan),
    }),

  delete: (id: number): Promise<void> =>
    apiRequest<void>(`/kegiatan/${id}`, { method: 'DELETE' }),
};



// Untuk mendukung kompatibilitas dengan kode yang sudah ada
export const fetchProducts = productApi.getAll;
export const fetchPenghuni = penghuniApi.getAll;
export const addPenghuni = penghuniApi.create;
export const updatePenghuni = penghuniApi.update;
export const deletePenghuni = penghuniApi.delete;

export const fetchKegiatan = kegiatanApi.getAll;
export const addKegiatan = kegiatanApi.create;
export const updateKegiatan = kegiatanApi.update;
export const deleteKegiatan = kegiatanApi.delete;

export const fetchMonthlyStatistics = statisticsApi.monthly.getByYear;
export const fetchQuarterlyStatistics = statisticsApi.quarterly.getByYear;
export const fetchYearlyStatistics = statisticsApi.yearly.getAll;
export const saveMonthlyStatistic = statisticsApi.monthly.save;
export const saveQuarterlyStatistic = statisticsApi.quarterly.save;
export const saveYearlyStatistic = statisticsApi.yearly.save;
export const deleteMonthlyStatistic = statisticsApi.monthly.delete;