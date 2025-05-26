"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { keuanganApi, type KeuanganItem } from "../../api/api"
import StatisticsChart from "../../components/ecommerce/StatisticsChart"

// Data untuk dropdown bulan dan tahun
const monthData = [
  { id: 1, nama: "Januari" },
  { id: 2, nama: "Februari" },
  { id: 3, nama: "Maret" },
  { id: 4, nama: "April" },
  { id: 5, nama: "Mei" },
  { id: 6, nama: "Juni" },
  { id: 7, nama: "Juli" },
  { id: 8, nama: "Agustus" },
  { id: 9, nama: "September" },
  { id: 10, nama: "Oktober" },
  { id: 11, nama: "November" },
  { id: 12, nama: "Desember" },
]

const yearOptions = [2023, 2024, 2025, 2026]

// Interface untuk data yang diterima dari backend
interface KeuanganResponse {
  id: number
  nama_bulan: string
  tahun: number
  pemasukan: number
  pengeluaran: number
  created_at: string
  updated_at: string
}

export default function KeuanganCRUD() {
  const [data, setData] = useState<KeuanganResponse[]>([])
  const [formData, setFormData] = useState<Omit<KeuanganItem, "id" | "created_at" | "updated_at">>({
    id_bulan: 1,
    id_tahun: 1,
    pemasukan: 0,
    pengeluaran: 0,
  })
  const [editingId, setEditingId] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filter] = useState<"bulanan" | "triwulan" | "tahunan">("bulanan")

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await keuanganApi.getAll()
      // Cast response sesuai dengan struktur yang diterima dari backend
      setData(res as unknown as KeuanganResponse[])
    } catch (err) {
      console.error("Error loading data:", err)
      setError("Gagal memuat data keuangan")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "pemasukan" || name === "pengeluaran" || name === "id_bulan" || name === "id_tahun" 
        ? Number(value) 
        : value,
    }))
  }

  const handleSubmit = async () => {
    // Validasi form
    if (!formData.id_bulan || !formData.id_tahun || formData.pemasukan == null || formData.pengeluaran == null) {
      alert("❌ Semua field wajib diisi")
      return
    }

    // Konversi id_tahun dari tahun ke id (asumsi id_tahun 1=2023, 2=2024, dst)
    const tahunToId = (tahun: number) => {
      const mapping: { [key: number]: number } = { 2023: 1, 2024: 2, 2025: 3, 2026: 4 }
      return mapping[tahun] || 1
    }

    const submitData = {
      ...formData,
      id_tahun: typeof formData.id_tahun === 'number' && formData.id_tahun > 100 
        ? tahunToId(formData.id_tahun) 
        : formData.id_tahun
    }

    try {
      if (editingId) {
        await keuanganApi.update(editingId, submitData)
        alert("✅ Data berhasil diperbarui!")
      } else {
        await keuanganApi.create(submitData)
        alert("✅ Data berhasil ditambahkan!")
      }
      
      await loadData()
      setFormData({ id_bulan: 1, id_tahun: 1, pemasukan: 0, pengeluaran: 0 })
      setEditingId(null)
    } catch (error) {
      console.error("Error saving data:", error)
      alert(`❌ Gagal menyimpan data: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  const handleEdit = (item: KeuanganResponse) => {
    // Konversi tahun ke id untuk form
    const tahunToId = (tahun: number) => {
      const mapping: { [key: number]: number } = { 2023: 1, 2024: 2, 2025: 3, 2026: 4 }
      return mapping[tahun] || 1
    }

    setFormData({
      id_bulan: monthData.find(m => m.nama === item.nama_bulan)?.id || 1,
      id_tahun: tahunToId(item.tahun),
      pemasukan: item.pemasukan,
      pengeluaran: item.pengeluaran,
    })
    setEditingId(item.id)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Yakin ingin menghapus data ini?")) return
    
    try {
      await keuanganApi.delete(id)
      alert("✅ Data berhasil dihapus!")
      await loadData()
    } catch (error) {
      console.error("Error deleting data:", error)
      alert("❌ Gagal menghapus data")
    }
  }

  // Proses data untuk chart
  const processChartData = () => {
    if (filter === "bulanan") {
      return data.map((item) => ({
        month: item.nama_bulan,
        month_number: monthData.find(m => m.nama === item.nama_bulan)?.id || 0,
        year: item.tahun,
        sales: item.pemasukan,
        revenue: item.pengeluaran,
      }))
    }

    // Untuk triwulan dan tahunan, kita perlu mengelompokkan data
    const grouped = new Map()
    
    for (const item of data) {
      const monthNum = monthData.find(m => m.nama === item.nama_bulan)?.id || 1
      const quarter = Math.floor((monthNum - 1) / 3) + 1
      const key = filter === "triwulan" ? `Q${quarter} ${item.tahun}` : item.tahun.toString()
      
      if (!grouped.has(key)) {
        grouped.set(key, { pemasukan: 0, pengeluaran: 0 })
      }
      
      const existing = grouped.get(key)
      existing.pemasukan += item.pemasukan
      existing.pengeluaran += item.pengeluaran
    }

    return Array.from(grouped.entries()).map(([key, values]) => {
      if (filter === "triwulan") {
        const [quarter, tahun] = key.split(" ")
        const quarterNumber = Number.parseInt(quarter.replace("Q", ""))
        return {
          month: `Triwulan ${quarterNumber}`,
          month_number: quarterNumber,
          year: Number.parseInt(tahun),
          sales: values.pemasukan,
          revenue: values.pengeluaran,
        }
      } else {
        return {
          month: `Tahun ${key}`,
          month_number: 0,
          year: Number.parseInt(key),
          sales: values.pemasukan,
          revenue: values.pengeluaran,
        }
      }
    })
  }

  const chartData = processChartData()

  return (
    <div className="space-y-8">
      {/* Chart Component */}
      <StatisticsChart
        externalMonthlyData={chartData}
        externalQuarterlyData={[]}
        externalYearlyData={[]}
        availableYears={yearOptions}
      />

      {/* Filter untuk Chart */}
      {/* <div className="bg-white dark:bg-white/[0.03] p-4 rounded-2xl border border-gray-200 dark:border-gray-800">
        <div className="flex gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              value="bulanan"
              checked={filter === "bulanan"}
              onChange={(e) => setFilter(e.target.value as "bulanan")}
              className="mr-2"
            />
            Bulanan
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="triwulan"
              checked={filter === "triwulan"}
              onChange={(e) => setFilter(e.target.value as "triwulan")}
              className="mr-2"
            />
            Triwulan
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="tahunan"
              checked={filter === "tahunan"}
              onChange={(e) => setFilter(e.target.value as "tahunan")}
              className="mr-2"
            />
            Tahunan
          </label>
        </div>
      </div> */}

      {/* Form Input */}
      <div className="bg-white dark:bg-white/[0.03] p-6 rounded-2xl border border-gray-200 dark:border-gray-800">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
          {editingId ? "Edit Data Keuangan" : "Tambah Data Keuangan"}
        </h3>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Bulan
              </label>
              <select
                name="id_bulan"
                value={formData.id_bulan}
                onChange={handleFormChange}
                className="w-full rounded-md border border-gray-300 dark:border-gray-700 px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                required
              >
                {monthData.map((month) => (
                  <option key={month.id} value={month.id}>
                    {month.nama}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tahun
              </label>
              <select
                name="id_tahun"
                value={formData.id_tahun}
                onChange={handleFormChange}
                className="w-full rounded-md border border-gray-300 dark:border-gray-700 px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                required
              >
                {yearOptions.map((year, index) => (
                  <option key={year} value={index + 2}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Pemasukan
              </label>
              <input
                type="number"
                name="pemasukan"
                value={formData.pemasukan}
                onChange={handleFormChange}
                className="w-full rounded-md border border-gray-300 dark:border-gray-700 px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                min="0"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Pengeluaran
              </label>
              <input
                type="number"
                name="pengeluaran"
                value={formData.pengeluaran}
                onChange={handleFormChange}
                className="w-full rounded-md border border-gray-300 dark:border-gray-700 px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                min="0"
                required
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null)
                  setFormData({ id_bulan: 1, id_tahun: 1, pemasukan: 0, pengeluaran: 0 })
                }}
                className="rounded-md bg-gray-500 px-4 py-2 text-white hover:bg-gray-600 transition"
              >
                Batal
              </button>
            )}
            <button
              type="submit"
              onClick={handleSubmit}
              className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition"
            >
              {editingId ? "Update" : "Simpan"}
            </button>
          </div>
        </div>
      </div>

      {/* Tabel Data */}
      <div className="bg-white dark:bg-white/[0.03] p-6 rounded-2xl border border-gray-200 dark:border-gray-800">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
          Data Keuangan
        </h3>

        {loading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Memuat data...</p>
          </div>
        ) : error ? (
          <div className="text-center py-4">
            <p className="text-red-500">{error}</p>
            <button
              onClick={loadData}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Coba Lagi
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Periode
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Pemasukan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Pengeluaran
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Saldo
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {data.map((item) => {
                  const saldo = item.pemasukan - item.pengeluaran
                  return (
                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {item.nama_bulan}, {item.tahun}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 dark:text-green-400">
                        Rp {Number(item.pemasukan).toLocaleString("id-ID")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 dark:text-red-400">
                        Rp {Number(item.pengeluaran).toLocaleString("id-ID")}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                        saldo >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                      }`}>
                        Rp {saldo.toLocaleString("id-ID")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            
            {data.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                Belum ada data keuangan
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}