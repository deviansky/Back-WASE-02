import { useState, useEffect, useMemo } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import ChartTab from "../common/ChartTab";
import { 
  fetchMonthlyStatistics, 
  fetchQuarterlyStatistics, 
  fetchYearlyStatistics
} from "../../api/api";


type ChartPeriod = "monthly" | "quarterly" | "yearly";

// Definisi tipe data
export type MonthlyStatistic = {
  month: string;
  month_number: number;
  sales: number;
  revenue: number;
};

export type MonthlyStatisticWithYear = MonthlyStatistic & { year: number };

export type QuarterlyStatistic = {
  quarter: string;
  year: number;
  sales: number;
  revenue: number;
};

export type YearlyStatistic = {
  year: number;
  sales: number;
  revenue: number;
};

// Props untuk menerima data dari CRUD
interface StatisticsChartProps {
  externalMonthlyData?: MonthlyStatisticWithYear[];
  externalQuarterlyData?: QuarterlyStatistic[];
  externalYearlyData?: YearlyStatistic[];
  availableYears?: number[];
}

export default function StatisticsChart({
  externalMonthlyData,
  externalQuarterlyData,
  externalYearlyData,
  availableYears = [2022, 2023, 2024, 2025]
}: StatisticsChartProps = {}) {
  const [period, setPeriod] = useState<ChartPeriod>("monthly");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyStatisticWithYear[]>([]);
  const [quarterlyData, setQuarterlyData] = useState<QuarterlyStatistic[]>([]);
  const [yearlyData, setYearlyData] = useState<YearlyStatistic[]>([]);
  const [year, setYear] = useState<number>(new Date().getFullYear());

  // Cek apakah menggunakan data eksternal
  const useExternalData = useMemo(() => {
    return !!(externalMonthlyData || externalQuarterlyData || externalYearlyData);
  }, [externalMonthlyData, externalQuarterlyData, externalYearlyData]);

  // Set data dari props eksternal jika tersedia
  useEffect(() => {
    if (externalMonthlyData?.length) {
      setMonthlyData(externalMonthlyData);
    }
    if (externalQuarterlyData?.length) {
      setQuarterlyData(externalQuarterlyData);
    }
    if (externalYearlyData?.length) {
      setYearlyData(externalYearlyData);
    }
  }, [externalMonthlyData, externalQuarterlyData, externalYearlyData]);

  // Fetch data hanya jika tidak ada data eksternal
  useEffect(() => {
    if (useExternalData) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        if (period === "monthly") {
          const data = await fetchMonthlyStatistics(year);
          setMonthlyData(data.map(item => ({ ...item, year })));
        } else if (period === "quarterly") {
          const data = await fetchQuarterlyStatistics(year);
          setQuarterlyData(data);
        } else if (period === "yearly") {
          const data = await fetchYearlyStatistics();
          setYearlyData(data);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Gagal memuat data. Silakan coba lagi nanti.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [period, year, useExternalData]);

  // Persiapkan data untuk chart berdasarkan periode yang dipilih
  const chartData = useMemo(() => {
    let categories: string[] = [];
    let salesData: number[] = [];
    let revenueData: number[] = [];

    if (period === "monthly") {
      // Filter data berdasarkan tahun yang dipilih
      const filteredData = monthlyData.filter(item => item.year === year);
      
      // Sort data by month_number
      const sortedData = [...filteredData].sort((a, b) => a.month_number - b.month_number);
      
      categories = sortedData.map(item => item.month);
      salesData = sortedData.map(item => item.sales);
      revenueData = sortedData.map(item => item.revenue);
    } else if (period === "quarterly") {
      // Filter quarterly data untuk tahun yang dipilih
      const filteredData = quarterlyData.filter(item => item.year === year);
      
      // Sort by quarter (Q1, Q2, Q3, Q4)
      const sortedData = [...filteredData].sort((a, b) => {
        // Ambil nomor kuartal dan bandingkan
        const getQuarterNumber = (q: string) => parseInt(q.replace('Q', ''));
        return getQuarterNumber(a.quarter) - getQuarterNumber(b.quarter);
      });
      
      categories = sortedData.map(item => item.quarter);
      salesData = sortedData.map(item => item.sales);
      revenueData = sortedData.map(item => item.revenue);
    } else if (period === "yearly") {
      // Sort years in ascending order
      const sortedData = [...yearlyData].sort((a, b) => a.year - b.year);
      
      categories = sortedData.map(item => item.year.toString());
      salesData = sortedData.map(item => item.sales);
      revenueData = sortedData.map(item => item.revenue);
    }

    return {
      categories,
      series: [
        { name: "Pemasukan", data: salesData },
        { name: "Pengeluaran", data: revenueData }
      ]
    };
  }, [period, year, monthlyData, quarterlyData, yearlyData]);

  // Chart options
  const options: ApexOptions = {
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
    },
    colors: ["#465FFF", "#9CB9FF"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      height: 310,
      type: "area",
      toolbar: {
        show: false,
      },
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800,
        animateGradually: {
          enabled: true,
          delay: 150
        },
        dynamicAnimation: {
          enabled: true,
          speed: 350
        }
      }
    },
    stroke: {
      curve: "smooth",
      width: [2, 2],
    },
    fill: {
      type: "gradient",
      gradient: {
        opacityFrom: 0.55,
        opacityTo: 0,
      },
    },
    markers: {
      size: 4,
      strokeColors: "#fff",
      strokeWidth: 2,
      hover: {
        size: 6,
      },
    },
    grid: {
      xaxis: {
        lines: {
          show: false,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    tooltip: {
      enabled: true,
      shared: true,
      intersect: false,
      y: {
        formatter: (value) => {
          return value.toLocaleString('id-ID');
        }
      }
    },
    xaxis: {
      type: "category",
      categories: chartData.categories,
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      tooltip: {
        enabled: false,
      },
    },
    yaxis: {
      labels: {
        style: {
          fontSize: "12px",
          colors: ["#6B7280"],
        },
        formatter: (value) => {
          // Format angka dengan titik sebagai pemisah ribuan
          return value.toLocaleString('id-ID');
        }
      },
    },
  };

  // Handle year change
  const handleYearChange = (selectedYear: number) => {
    setYear(selectedYear);
  };

  const handlePeriodChange = (selectedPeriod: ChartPeriod) => {
    setPeriod(selectedPeriod);
  };

  // Period selector tabs
  const periodTabs = [
    { id: "monthly", label: "Bulanan" },
    { id: "quarterly", label: "Triwulanan" },
    { id: "yearly", label: "Tahunan" }
  ];

  return (
    <div className="bg-white dark:bg-white/[0.03] p-6 rounded-2xl border border-gray-200 dark:border-gray-800">
      <div className="flex flex-col md:flex-row justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Statistik {period === "monthly" ? "Bulanan" : period === "quarterly" ? "Triwulanan" : "Tahunan"}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {period === "yearly" 
              ? "Statistik penjualan dan pendapatan per tahun" 
              : `Statistik penjualan dan pendapatan ${period === "monthly" ? "bulanan" : "triwulanan"} untuk tahun ${year}`}
          </p>
        </div>
        
        <div className="flex items-center space-x-4 mt-4 md:mt-0">
          {/* Period selector */}
          {/* <ChartTab 
            tabs={periodTabs} 
            activeTab={period}
            onChange={(tab) => handlePeriodChange(tab as ChartPeriod)} 
          /> */}
          
          {/* Year selector (not shown for yearly period) */}
          {period !== "yearly" && (
            <select
              value={year}
              onChange={(e) => handleYearChange(parseInt(e.target.value))}
              className="rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300"
            >
              {availableYears.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-80">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="flex justify-center items-center h-80">
          <div className="text-red-500">{error}</div>
        </div>
      ) : chartData.categories.length === 0 ? (
        <div className="flex justify-center items-center h-80">
          <div className="text-gray-500 dark:text-gray-400">
            Tidak ada data untuk ditampilkan
          </div>
        </div>
      ) : (
        <div className="h-80">
          <Chart
            options={options}
            series={chartData.series}
            type="area"
            height="100%"
          />
        </div>
      )}
      
      {/* Legend and summary stats */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-[#465FFF] mr-2"></div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Pemasukan</span>
          </div>
          <div className="mt-2">
            <span className="text-xl font-semibold text-gray-900 dark:text-white">
              {chartData.series[0].data.reduce((sum, val) => sum + val, 0).toLocaleString('id-ID')}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
              Total
            </span>
          </div>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-[#9CB9FF] mr-2"></div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Pengeluaran</span>
          </div>
          <div className="mt-2">
            <span className="text-xl font-semibold text-gray-900 dark:text-white">
              {chartData.series[1].data.reduce((sum, val) => sum + val, 0).toLocaleString('id-ID')}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
              Total
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}