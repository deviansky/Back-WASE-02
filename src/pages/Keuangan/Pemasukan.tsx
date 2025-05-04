import { useState, useEffect, useCallback } from "react";
import { 
  fetchMonthlyStatistics, 
  fetchQuarterlyStatistics, 
  fetchYearlyStatistics,
  saveMonthlyStatistic,
  saveQuarterlyStatistic,
  saveYearlyStatistic,
  deleteMonthlyStatistic,
  MonthlyStatistic,
  QuarterlyStatistic,
  YearlyStatistic
} from "../../api/api";
import StatisticsChart from "../../components/ecommerce/StatisticsChart";

// Komponen utama untuk CRUD statistik yang terintegrasi dengan chart
export default function StatisticsCRUD() {
  // State untuk menyimpan semua data statistik
  const [monthlyData, setMonthlyData] = useState([]);
  const [quarterlyData, setQuarterlyData] = useState([]);
  const [yearlyData, setYearlyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  
  // Array tahun yang tersedia untuk pilihan
  const availableYears = [2022, 2023, 2024, 2025];

  // Fungsi untuk memuat semua data
  const loadAllData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Memuat data untuk semua tahun yang tersedia
      const monthlyDataPromises = availableYears.map(year => 
        fetchMonthlyStatistics(year)
          .then(data => data.map(item => ({ ...item, year })))
          .catch(() => [])
      );
      const quarterlyDataPromises = availableYears.map(year => 
        fetchQuarterlyStatistics(year)
          .then(data => data)
          .catch(() => [])
      );
      
      // Memuat data tahunan
      const yearlyDataPromise = fetchYearlyStatistics()
        .catch(() => []);

      // Menunggu semua promise selesai
      const monthlyResults = await Promise.all(monthlyDataPromises);
      const quarterlyResults = await Promise.all(quarterlyDataPromises);
      const yearlyResults = await yearlyDataPromise;
      
      // Menggabungkan hasil dari semua tahun
      const allMonthlyData = monthlyResults.flat();
      const allQuarterlyData = quarterlyResults.flat();
      
      setMonthlyData(allMonthlyData);
      setQuarterlyData(allQuarterlyData);
      setYearlyData(yearlyResults);
    } catch (err) {
      console.error("Error saat memuat data:", err);
      setError("Gagal memuat data statistik. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  }, [availableYears]);

  // Memuat data saat komponen dimount
  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // CRUD Operations - Create/Update Monthly Statistic
  const handleSaveMonthlyStatistic = async (data) => {
    try {
      const response = await saveMonthlyStatistic(data);
      
      // Update local state to reflect the change
      setMonthlyData(prevData => {
        // Find if data already exists (for update case)
        const index = prevData.findIndex(
          item => item.month_number === data.month_number && item.year === data.year
        );
        
        if (index >= 0) {
          // Update existing data
          const newData = [...prevData];
          newData[index] = { ...response, year: data.year };
          return newData;
        } else {
          // Add new data
          return [...prevData, { ...response, year: data.year }];
        }
      });
      
      // Jika perlu, perbarui juga data triwulanan dan tahunan
      // Idealnya logika ini sebaiknya di backend, tapi bisa diimplementasikan
      // di frontend jika diperlukan
      
      return { success: true, message: "Data berhasil disimpan" };
    } catch (err) {
      console.error("Error saving monthly statistic:", err);
      return { success: false, message: "Gagal menyimpan data" };
    }
  };

  // Delete Monthly Statistic
  const handleDeleteMonthlyStatistic = async (year, monthNumber) => {
    try {
      await deleteMonthlyStatistic(year, monthNumber);
      
      // Update local state
      setMonthlyData(prevData => 
        prevData.filter(item => 
          !(item.year === year && item.month_number === monthNumber)
        )
      );
      
      // Di sini bisa ditambahkan logika untuk memperbarui data triwulanan
      // dan tahunan setelah penghapusan
      
      return { success: true, message: "Data berhasil dihapus" };
    } catch (err) {
      console.error("Error deleting monthly statistic:", err);
      return { success: false, message: "Gagal menghapus data" };
    }
  };

  // Fungsi untuk menghitung ulang statistik triwulanan dan tahunan
  // berdasarkan data bulanan
  const recalculateStatistics = useCallback(() => {
    // Group monthly data by year
    const dataByYear = {};
    monthlyData.forEach(item => {
      if (!dataByYear[item.year]) {
        dataByYear[item.year] = [];
      }
      dataByYear[item.year].push(item);
    });
    
    // Calculate quarterly data
    const newQuarterlyData = [];
    
    Object.keys(dataByYear).forEach(year => {
      const yearData = dataByYear[year];
      
      // Kelompokkan bulan berdasarkan kuartal
      const quarters = {
        'Q1': yearData.filter(item => item.month_number >= 1 && item.month_number <= 3),
        'Q2': yearData.filter(item => item.month_number >= 4 && item.month_number <= 6),
        'Q3': yearData.filter(item => item.month_number >= 7 && item.month_number <= 9),
        'Q4': yearData.filter(item => item.month_number >= 10 && item.month_number <= 12)
      };
      
      // Hitung total penjualan dan pendapatan per kuartal
      Object.keys(quarters).forEach(quarter => {
        const quarterData = quarters[quarter];
        if (quarterData.length > 0) {
          const totalSales = quarterData.reduce((sum, item) => sum + item.sales, 0);
          const totalRevenue = quarterData.reduce((sum, item) => sum + item.revenue, 0);
          
          newQuarterlyData.push({
            quarter,
            year: parseInt(year),
            sales: totalSales,
            revenue: totalRevenue
          });
        }
      });
    });
    
    // Calculate yearly data
    const newYearlyData = Object.keys(dataByYear).map(year => {
      const yearData = dataByYear[year];
      const totalSales = yearData.reduce((sum, item) => sum + item.sales, 0);
      const totalRevenue = yearData.reduce((sum, item) => sum + item.revenue, 0);
      
      return {
        year: parseInt(year),
        sales: totalSales,
        revenue: totalRevenue
      };
    });
    
    // Update states
    setQuarterlyData(newQuarterlyData);
    setYearlyData(newYearlyData);
    
    // Optional: Simpan perubahan ke backend
    // newQuarterlyData.forEach(async (data) => await saveQuarterlyStatistic(data));
    // newYearlyData.forEach(async (data) => await saveYearlyStatistic(data));
    
  }, [monthlyData]);

  // Recalculate statistics when monthly data changes
  useEffect(() => {
    if (monthlyData.length > 0) {
      recalculateStatistics();
    }
  }, [monthlyData, recalculateStatistics]);

  // Contoh implementasi form tambah/edit data bulanan
  const [formData, setFormData] = useState({
    month: '',
    month_number: 1,
    year: currentYear,
    sales: 0,
    revenue: 0
  });

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'month_number' || name === 'year' || name === 'sales' || name === 'revenue' 
        ? Number(value) 
        : value
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const result = await handleSaveMonthlyStatistic(formData);
    
    if (result.success) {
      // Reset form or show success message
      setFormData({
        month: '',
        month_number: 1,
        year: currentYear,
        sales: 0,
        revenue: 0
      });
      alert(result.message);
    } else {
      alert(result.message);
    }
  };

  // Daftar bulan untuk dropdown
  const months = [
    { name: 'Jan', number: 1 },
    { name: 'Feb', number: 2 },
    { name: 'Mar', number: 3 },
    { name: 'Apr', number: 4 },
    { name: 'May', number: 5 },
    { name: 'Jun', number: 6 },
    { name: 'Jul', number: 7 },
    { name: 'Aug', number: 8 },
    { name: 'Sep', number: 9 },
    { name: 'Oct', number: 10 },
    { name: 'Nov', number: 11 },
    { name: 'Dec', number: 12 }
  ];

  // UI untuk form dan tabel CRUD
  return (
    <div className="space-y-8">
      {/* Chart Component */}
      <StatisticsChart 
        externalMonthlyData={monthlyData}
        externalQuarterlyData={quarterlyData}
        externalYearlyData={yearlyData}
        availableYears={availableYears}
      />
      
      {/* Form untuk tambah/edit data bulanan */}
      <div className="bg-white dark:bg-white/[0.03] p-6 rounded-2xl border border-gray-200 dark:border-gray-800">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
          Tambah/Edit Data Statistik Bulanan
        </h3>
        
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Bulan
              </label>
              <select
                name="month_number"
                value={formData.month_number}
                onChange={(e) => {
                  const monthNumber = Number(e.target.value);
                  const month = months.find(m => m.number === monthNumber)?.name || '';
                  setFormData(prev => ({
                    ...prev,
                    month_number: monthNumber,
                    month
                  }));
                }}
                className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-800 dark:text-white/90"
                required
              >
                {months.map(month => (
                  <option key={month.number} value={month.number}>
                    {month.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tahun
              </label>
              <select
                name="year"
                value={formData.year}
                onChange={handleFormChange}
                className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-800 dark:text-white/90"
                required
              >
                {availableYears.map(year => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Penjualan
              </label>
              <input
                type="number"
                name="sales"
                value={formData.sales}
                onChange={handleFormChange}
                className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-800 dark:text-white/90"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Pendapatan
              </label>
              <input
                type="number"
                name="revenue"
                value={formData.revenue}
                onChange={handleFormChange}
                className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-800 dark:text-white/90"
                required
              />
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
      
      {/* Tabel data bulanan */}
      <div className="bg-white dark:bg-white/[0.03] p-6 rounded-2xl border border-gray-200 dark:border-gray-800">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
          Data Statistik Bulanan
        </h3>
        
        {loading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-red-500 text-center py-4">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr>
                  <th className="px-6 py-3 bg-gray-50 dark:bg-gray-800 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Bulan
                  </th>
                  <th className="px-6 py-3 bg-gray-50 dark:bg-gray-800 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Tahun
                  </th>
                  <th className="px-6 py-3 bg-gray-50 dark:bg-gray-800 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Penjualan
                  </th>
                  <th className="px-6 py-3 bg-gray-50 dark:bg-gray-800 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Pendapatan
                  </th>
                  <th className="px-6 py-3 bg-gray-50 dark:bg-gray-800"></th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-transparent divide-y divide-gray-200 dark:divide-gray-700">
                {monthlyData
                  .sort((a, b) => {
                    // Sort by year first, then by month
                    if (a.year !== b.year) {
                      return b.year - a.year; // Descending by year
                    }
                    return a.month_number - b.month_number; // Ascending by month
                  })
                  .map((item, index) => (
                    <tr key={`${item.year}-${item.month_number}`} 
                        className={index % 2 === 0 ? 'bg-white dark:bg-transparent' : 'bg-gray-50 dark:bg-gray-800/50'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                        {item.month}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                        {item.year}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                        {item.sales.toLocaleString('id-ID')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                        {item.revenue.toLocaleString('id-ID')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => setFormData({
                            month: item.month,
                            month_number: item.month_number,
                            year: item.year,
                            sales: item.sales,
                            revenue: item.revenue
                          })}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mr-4"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('Yakin ingin menghapus data ini?')) {
                              handleDeleteMonthlyStatistic(item.year, item.month_number);
                            }
                          }}
                          className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
            
            {monthlyData.length === 0 && (
              <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                Tidak ada data
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}