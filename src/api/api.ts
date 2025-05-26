// src/api/api.ts
const API_URL = import.meta.env.VITE_API_URL

// Tipe data dasar
export interface Product {
  id: number
  name: string
  price: number
  description: string
  categories: string
}

export interface Penghuni {
  id?: number
  nama: string
  prodi: string
  angkatan: number
  asalDaerah: string
  noHp: string
  created_at?: string
  updated_at?: string
}

export interface MonthlyStatistic {
  month: string
  month_number: number
  year?: number
  sales: number
  revenue: number
}

export interface QuarterlyStatistic {
  quarter: string
  year?: number
  sales: number
  revenue: number
}

export interface YearlyStatistic {
  year: number
  sales: number
  revenue: number
}

export interface Kegiatan {
  id: number
  judul: string
  deskripsi: string
  tanggal: string
  waktu_acara: string
  created_at?: string
  updated_at?: string
}

// Interface untuk Absensi
export interface AbsensiItem {
  id?: number;
  id_kegiatan: number;
  id_penghuni: number;
  status_kehadiran: string;
  nama_penghuni?: string;
  created_at?: string;
  updated_at?: string;
}

export interface NotulenItem {
  id?: number
  id_kegiatan: number
  file: string
  created_at?: string
  updated_at?: string
}

// Interface Keuangan gabungan pemasukan & pengeluaran
export interface KeuanganItem {
  id?: number;
  id_bulan: number;
  id_tahun: number;
  pemasukan: number;
  pengeluaran: number;
  created_at?: string;
  updated_at?: string;
}

// Utility function untuk HTTP requests
const apiRequest = async <T>(endpoint: string, options?: RequestInit): Promise<T> => {
  try {
    const url = `${API_URL}${endpoint}`
    console.log(`Making request to: ${url}`, options)

    const response = await fetch(url, options)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Server response:", errorText)
      throw new Error(`API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return options?.method === 'DELETE' ? (null as T) : (data.data || data);
  } catch (error) {
    console.error(`API request failed: ${endpoint}`, error)
    throw error
  }
}

// API untuk Products
export const productApi = {
  getAll: (): Promise<Product[]> => apiRequest<Product[]>("/products"),
}

// API untuk Penghuni
export const penghuniApi = {
  getAll: (): Promise<Penghuni[]> => apiRequest<Penghuni[]>("/penghunis"),

  create: (penghuni: Omit<Penghuni, "id">): Promise<Penghuni> =>
    apiRequest<Penghuni>("/penghunis", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(penghuni),
    }),

  update: (penghuni: Penghuni): Promise<Penghuni> =>
    apiRequest<Penghuni>(`/penghunis/${penghuni.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(penghuni),
    }),

  delete: (id: number): Promise<void> => apiRequest<void>(`/penghunis/${id}`, { method: "DELETE" }),
}

// API untuk Statistik
export const statisticsApi = {
  monthly: {
    getByYear: (year: number): Promise<MonthlyStatistic[]> =>
      apiRequest<MonthlyStatistic[]>(`/statistics/monthly?year=${year}`),

    save: (data: MonthlyStatistic & { year: number }): Promise<MonthlyStatistic> =>
      apiRequest<MonthlyStatistic>("/statistics/monthly", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),

    delete: (year: number, monthNumber: number): Promise<void> =>
      apiRequest<void>(`/statistics/monthly/${year}/${monthNumber}`, { method: "DELETE" }),
  },

  quarterly: {
    getByYear: (year: number): Promise<QuarterlyStatistic[]> =>
      apiRequest<QuarterlyStatistic[]>(`/statistics/quarterly?year=${year}`),

    save: (data: QuarterlyStatistic & { year: number }): Promise<QuarterlyStatistic> =>
      apiRequest<QuarterlyStatistic>("/statistics/quarterly", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
  },

  yearly: {
    getAll: (): Promise<YearlyStatistic[]> => apiRequest<YearlyStatistic[]>("/statistics/yearly"),

    save: (data: YearlyStatistic): Promise<YearlyStatistic> =>
      apiRequest<YearlyStatistic>("/statistics/yearly", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
  },
}

// API untuk Kegiatan
export const kegiatanApi = {
  getAll: (): Promise<Kegiatan[]> => apiRequest<Kegiatan[]>("/kegiatan"),

  create: (kegiatan: Omit<Kegiatan, "id">): Promise<Kegiatan> =>
    apiRequest<Kegiatan>("/kegiatan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(kegiatan),
    }),

  update: (kegiatan: Kegiatan): Promise<Kegiatan> =>
    apiRequest<Kegiatan>(`/kegiatan/${kegiatan.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(kegiatan),
    }),

  delete: (id: number): Promise<void> => apiRequest<void>(`/kegiatan/${id}`, { method: "DELETE" }),
}

// Absensi API
export const absensiApi = {
  getByKegiatan: async (id_kegiatan: number): Promise<AbsensiItem[]> =>
    apiRequest(`/api/absensi/kegiatan/${id_kegiatan}`, { method: 'GET' }),

  create: async (id_kegiatan: number, absensi_list: Array<{id_penghuni: number, status_kehadiran: string}>): Promise<any> =>
    apiRequest(`/api/absensi/${id_kegiatan}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ absensi_list }),
    }),
}

// API untuk Notulen
export const notulenApi = {
  getAll: (): Promise<NotulenItem[]> => apiRequest<NotulenItem[]>("/notulen"),

  getByKegiatan: (id_kegiatan: number): Promise<NotulenItem> =>
    apiRequest<NotulenItem>(`/notulen/kegiatan/${id_kegiatan}`),

  create: (data: { id_kegiatan: number; file: string }): Promise<NotulenItem> =>
    apiRequest("/notulen/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),

  update: (id: number, file: string): Promise<NotulenItem> =>
    apiRequest<NotulenItem>(`/notulen/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ file }),
    }),

  delete: (id: number): Promise<void> => apiRequest<void>(`/notulen/${id}`, { method: "DELETE" }),
}

// API untuk Keuangan (gabungan pemasukan & pengeluaran)
export const keuanganApi = {
  getAll: (): Promise<KeuanganItem[]> => apiRequest<KeuanganItem[]>("/keuangan"),

  create: (data: Omit<KeuanganItem, "id" | "created_at" | "updated_at">): Promise<KeuanganItem> => {
    if (
      data.id_bulan == null ||
      data.id_tahun == null ||
      data.pemasukan == null ||
      data.pengeluaran == null
    ) {
      throw new Error("Semua field wajib diisi: id_bulan, id_tahun, pemasukan, pengeluaran")
    }
    return apiRequest("/keuangan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
  },

  update: (id: number, data: Omit<KeuanganItem, "id" | "created_at" | "updated_at">): Promise<KeuanganItem> => {
    if (
      data.id_bulan == null ||
      data.id_tahun == null ||
      data.pemasukan == null ||
      data.pengeluaran == null
    ) {
      throw new Error("Semua field wajib diisi: id_bulan, id_tahun, pemasukan, pengeluaran")
    }
    return apiRequest(`/keuangan/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
  },

  delete: (id: number): Promise<void> => apiRequest<void>(`/keuangan/${id}`, { method: "DELETE" }),
}

// Alias functions untuk kompatibilitas
export const fetchProducts = productApi.getAll
export const fetchPenghuni = penghuniApi.getAll
export const addPenghuni = penghuniApi.create
export const updatePenghuni = penghuniApi.update
export const deletePenghuni = penghuniApi.delete

export const fetchKegiatan = kegiatanApi.getAll
export const addKegiatan = kegiatanApi.create
export const updateKegiatan = kegiatanApi.update
export const deleteKegiatan = kegiatanApi.delete

export const fetchMonthlyStatistics = statisticsApi.monthly.getByYear
export const fetchQuarterlyStatistics = statisticsApi.quarterly.getByYear
export const fetchYearlyStatistics = statisticsApi.yearly.getAll
export const saveMonthlyStatistic = statisticsApi.monthly.save
export const saveQuarterlyStatistic = statisticsApi.quarterly.save
export const saveYearlyStatistic = statisticsApi.yearly.save
export const deleteMonthlyStatistic = statisticsApi.monthly.delete

export const fetchAbsensiByKegiatan = absensiApi.getByKegiatan
export const createAbsensi = absensiApi.create

export const fetchNotulen = notulenApi.getAll
export const fetchNotulenByKegiatan = notulenApi.getByKegiatan
export const createNotulen = notulenApi.create
export const updateNotulen = notulenApi.update
export const deleteNotulen = notulenApi.delete

export const fetchKeuangan = keuanganApi.getAll
export const createKeuangan = keuanganApi.create
export const updateKeuangan = keuanganApi.update
export const deleteKeuangan = keuanganApi.delete
