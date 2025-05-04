import { useState, useEffect } from "react";
import { MonthlyStatistic, saveMonthlyStatistic } from "../../api/api";

interface StatisticsFormProps {
  onDataSaved: () => void;
  initialData?: MonthlyStatistic & { year: number };
  isEditing?: boolean;
  onCancelEdit?: () => void;
}

export default function StatisticsForm({ 
  onDataSaved, 
  initialData, 
  isEditing = false,
  onCancelEdit 
}: StatisticsFormProps) {
  const currentYear = new Date().getFullYear();
  const [formData, setFormData] = useState({
    month: initialData?.month || "Januari",
    month_number: initialData?.month_number || 1,
    year: initialData?.year || currentYear,
    sales: initialData?.sales || 0,
    revenue: initialData?.revenue || 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const months = [
    { name: "Januari", value: 1 },
    { name: "Februari", value: 2 },
    { name: "Maret", value: 3 },
    { name: "April", value: 4 },
    { name: "Mei", value: 5 },
    { name: "Juni", value: 6 },
    { name: "Juli", value: 7 },
    { name: "Agustus", value: 8 },
    { name: "September", value: 9 },
    { name: "Oktober", value: 10 },
    { name: "November", value: 11 },
    { name: "Desember", value: 12 }
  ];

  const availableYears = [2022, 2023, 2024, 2025];

  // Reset form when initialData changes (for editing)
  useEffect(() => {
    if (initialData) {
      setFormData({
        month: initialData.month,
        month_number: initialData.month_number,
        year: initialData.year,
        sales: initialData.sales,
        revenue: initialData.revenue
      });
    }
  }, [initialData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === "month") {
      const selectedMonth = months.find(m => m.name === value);
      setFormData({
        ...formData,
        month: value,
        month_number: selectedMonth?.value || 1
      });
    } else if (name === "sales" || name === "revenue") {
      setFormData({
        ...formData,
        [name]: parseFloat(value) || 0
      });
    } else {
      setFormData({
        ...formData,
        [name]: name === "year" ? parseInt(value) : value
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await saveMonthlyStatistic(formData);
      
      // Reset form if not editing
      if (!isEditing) {
        setFormData({
          ...formData,
          sales: 0,
          revenue: 0
        });
      }
      
      // Notify parent component that data was saved
      onDataSaved();
      
      // If editing, close edit mode
      if (isEditing && onCancelEdit) {
        onCancelEdit();
      }
    } catch (err) {
      console.error("Error saving data:", err);
      setError("Gagal menyimpan data. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-white/[0.03] rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
        {isEditing ? "Edit Data Statistik" : "Tambah Data Statistik"}
      </h3>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-md">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="month" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Bulan
            </label>
            <select
              id="month"
              name="month"
              value={formData.month}
              onChange={handleInputChange}
              className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white/90 py-2 px-3"
              required
            >
              {months.map((month) => (
                <option key={month.value} value={month.name}>
                  {month.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="year" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tahun
            </label>
            <select
              id="year"
              name="year"
              value={formData.year}
              onChange={handleInputChange}
              className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white/90 py-2 px-3"
              required
            >
              {availableYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label htmlFor="sales" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Penjualan
            </label>
            <input
              type="number"
              id="sales"
              name="sales"
              value={formData.sales}
              onChange={handleInputChange}
              className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white/90 py-2 px-3"
              required
              min="0"
            />
          </div>
          
          <div>
            <label htmlFor="revenue" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Pendapatan
            </label>
            <input
              type="number"
              id="revenue"
              name="revenue"
              value={formData.revenue}
              onChange={handleInputChange}
              className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white/90 py-2 px-3"
              required
              min="0"
            />
          </div>
        </div>
        
        <div className="flex justify-end gap-3">
          {isEditing && onCancelEdit && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
              disabled={loading}
            >
              Batal
            </button>
          )}
          
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Menyimpan...
              </span>
            ) : isEditing ? "Perbarui" : "Simpan"}
          </button>
        </div>
      </form>
    </div>
  );
}