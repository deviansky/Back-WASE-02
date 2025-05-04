import { useState } from "react";
import { MonthlyStatistic } from "../../api/api";

interface StatisticsTableProps {
  data: (MonthlyStatistic & { year: number })[];
  onEdit: (statistic: MonthlyStatistic & { year: number }) => void;
  onDelete: (statistic: MonthlyStatistic & { year: number }) => void;
  loading: boolean;
}

export default function StatisticsTable({ data, onEdit, onDelete, loading }: StatisticsTableProps) {
  const [sortField, setSortField] = useState<"year" | "month_number">("year");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  
  // Sort data
  const sortedData = [...data].sort((a, b) => {
    if (sortField === "year") {
      const yearComparison = sortDirection === "asc" 
        ? a.year - b.year
        : b.year - a.year;
        
      // If years are equal, sort by month
      if (yearComparison === 0) {
        return sortDirection === "asc"
          ? a.month_number - b.month_number
          : b.month_number - a.month_number;
      }
      
      return yearComparison;
    } else {
      // Sort by month
      const monthComparison = sortDirection === "asc" 
        ? a.month_number - b.month_number
        : b.month_number - a.month_number;
        
      // If months are equal, sort by year
      if (monthComparison === 0) {
        return sortDirection === "asc"
          ? a.year - b.year
          : b.year - a.year;
      }
      
      return monthComparison;
    }
  });

  // Toggle sort
  const handleSort = (field: "year" | "month_number") => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Format numbers with thousand separator
  const formatNumber = (num: number) => {
    return num.toLocaleString('id-ID');
  };

  return (
    <div className="bg-white dark:bg-white/[0.03] rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("year")}
              >
                <div className="flex items-center">
                  Tahun
                  {sortField === "year" && (
                    <span className="ml-1">
                      {sortDirection === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("month_number")}
              >
                <div className="flex items-center">
                  Bulan
                  {sortField === "month_number" && (
                    <span className="ml-1">
                      {sortDirection === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Penjualan
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Pendapatan
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-transparent divide-y divide-gray-200 dark:divide-gray-700">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                  </div>
                </td>
              </tr>
            ) : sortedData.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                  Tidak ada data statistik
                </td>
              </tr>
            ) : (
              sortedData.map((item, index) => (
                <tr key={`${item.year}-${item.month_number}`} className={index % 2 === 0 ? "bg-white dark:bg-transparent" : "bg-gray-50 dark:bg-gray-800/30"}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {item.year}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {item.month}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {formatNumber(item.sales)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {formatNumber(item.revenue)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => onEdit(item)}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(item)}
                      className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}