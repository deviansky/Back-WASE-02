import { useState, useEffect, useMemo } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { 
  fetchMonthlyStatistics, 
  fetchQuarterlyStatistics, 
  fetchYearlyStatistics
} from "../../api/api";

type ChartPeriod = "monthly" | "quarterly" | "yearly";

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
  availableYears = [2022, 2023, 2024, 2025],
}: StatisticsChartProps = {}) {
  const [period, setPeriod] = useState<ChartPeriod>("monthly");
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [monthlyData, setMonthlyData] = useState<MonthlyStatisticWithYear[]>([]);
  const [quarterlyData, setQuarterlyData] = useState<QuarterlyStatistic[]>([]);
  const [yearlyData, setYearlyData] = useState<YearlyStatistic[]>([]);

  // Cek apakah pakai data eksternal (external data)
  const useExternalData = useMemo(() => {
    return !!(externalMonthlyData || externalQuarterlyData || externalYearlyData);
  }, [externalMonthlyData, externalQuarterlyData, externalYearlyData]);

  // Load external data jika ada
  useEffect(() => {
    if (externalMonthlyData) setMonthlyData(externalMonthlyData);
    if (externalQuarterlyData) setQuarterlyData(externalQuarterlyData);
    if (externalYearlyData) setYearlyData(externalYearlyData);
  }, [externalMonthlyData, externalQuarterlyData, externalYearlyData]);

  // Fetch data jika tidak pakai external data
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
          setQuarterlyData(data.map(item => ({ ...item, year: item.year ?? year })));
        } else {
          // yearly
          const data = await fetchYearlyStatistics();
          setYearlyData(data);
        }
      } catch (err) {
        setError("Gagal memuat data. Silakan coba lagi nanti.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [period, year, useExternalData]);

  // Siapkan data chart sesuai period dan year yang dipilih
  const chartData = useMemo(() => {
    let categories: string[] = [];
    let salesData: number[] = [];
    let revenueData: number[] = [];

    if (period === "monthly") {
      const filtered = monthlyData.filter(item => item.year === year);
      const sorted = filtered.sort((a, b) => a.month_number - b.month_number);
      categories = sorted.map(item => item.month);
      salesData = sorted.map(item => item.sales);
      revenueData = sorted.map(item => item.revenue);
    } else if (period === "quarterly") {
      const filtered = quarterlyData.filter(item => item.year === year);
      const sorted = filtered.sort((a, b) => parseInt(a.quarter.replace("Q", "")) - parseInt(b.quarter.replace("Q", "")));
      categories = sorted.map(item => item.quarter);
      salesData = sorted.map(item => item.sales);
      revenueData = sorted.map(item => item.revenue);
    } else {
      // yearly
      const sorted = yearlyData.sort((a, b) => a.year - b.year);
      categories = sorted.map(item => item.year.toString());
      salesData = sorted.map(item => item.sales);
      revenueData = sorted.map(item => item.revenue);
    }

    return {
      categories,
      series: [
        { name: "Pemasukan", data: salesData },
        { name: "Pengeluaran", data: revenueData },
      ],
    };
  }, [period, year, monthlyData, quarterlyData, yearlyData]);

  // ApexCharts options
  const options: ApexOptions = {
    legend: { show: true, position: "top", horizontalAlign: "left" },
    colors: ["#465FFF", "#9CB9FF"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      height: 310,
      type: "area",
      toolbar: { show: false },
      animations: {
        enabled: true,
        speed: 800,
        animateGradually: { enabled: true, delay: 150 },
        dynamicAnimation: { enabled: true, speed: 350 },
      },
    },
    stroke: { curve: "smooth", width: [2, 2] },
    fill: { type: "gradient", gradient: { opacityFrom: 0.55, opacityTo: 0 } },
    markers: { size: 4, strokeColors: "#fff", strokeWidth: 2, hover: { size: 6 } },
    grid: { xaxis: { lines: { show: false } }, yaxis: { lines: { show: true } } },
    dataLabels: { enabled: false },
    tooltip: {
      enabled: true,
      shared: true,
      intersect: false,
      y: { formatter: (value) => value.toLocaleString("id-ID") },
    },
    xaxis: {
      type: "category",
      categories: chartData.categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
      tooltip: { enabled: false },
    },
    yaxis: {
      labels: {
        style: { fontSize: "12px", colors: ["#6B7280"] },
        formatter: (value) => value.toLocaleString("id-ID"),
      },
    },
  };

  // Handlers
  const handleYearChange = (selectedYear: number) => setYear(selectedYear);

  // UI untuk pilih period

  return (
    <div className="bg-white dark:bg-white/[0.03] p-6 rounded-2xl border border-gray-200 dark:border-gray-800">
      <div className="flex flex-col md:flex-row justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Statistik{" "}
            {period === "monthly"
              ? "Bulanan"
              : period === "quarterly"
              ? "Triwulanan"
              : "Tahunan"}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {period === "yearly"
              ? "Statistik penjualan dan pendapatan per tahun"
              : `Statistik penjualan dan pendapatan ${
                  period === "monthly" ? "bulanan" : "triwulanan"
                } untuk tahun ${year}`}
          </p>
        </div>

        <div className="flex items-center space-x-4 mt-4 md:mt-0">
          {/* Tabs untuk pilih period */}
          {/* <div className="flex space-x-4 bg-gray-100 dark:bg-gray-900 rounded-full p-1">
            {periodTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handlePeriodChange(tab.id as ChartPeriod)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition
                  ${
                    period === tab.id
                      ? "bg-blue-600 text-white"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div> */}

          {/* Pilih tahun (hanya kalau period bukan yearly) */}
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

      {/* Loading/Error/Empty States */}
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
          <div className="text-gray-500 dark:text-gray-400">Tidak ada data untuk ditampilkan</div>
        </div>
      ) : (
        <div className="h-80">
          <Chart options={options} series={chartData.series} type="area" height="100%" />
        </div>
      )}

      {/* Summary total sales & revenue */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-[#465FFF] mr-2"></div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Pemasukan
            </span>
          </div>
          <div className="mt-2">
            <span className="text-xl font-semibold text-gray-900 dark:text-white">
              {chartData.series[0].data
                .reduce((sum, val) => sum + Number(val), 0)
                .toLocaleString("id-ID")}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">Total</span>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-[#9CB9FF] mr-2"></div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Pengeluaran
            </span>
          </div>
          <div className="mt-2">
            <span className="text-xl font-semibold text-gray-900 dark:text-white">
              {chartData.series[1].data
                .reduce((sum, val) => sum + Number(val), 0)
                .toLocaleString("id-ID")}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">Total</span>
          </div>
        </div>
      </div>
    </div>
  );
}
