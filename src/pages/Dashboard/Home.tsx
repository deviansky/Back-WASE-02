import EcommerceMetrics from "../../components/ecommerce/EcommerceMetrics";
import MonthlySalesChart from "../../components/ecommerce/MonthlySalesChart";
import StatisticsChart from "../../components/ecommerce/StatisticsChart";
import MonthlyTarget from "../../components/ecommerce/MonthlyTarget";
import RecentOrders from "../../components/ecommerce/RecentOrders";
import DemographicCard from "../../components/ecommerce/DemographicCard";
import PageMeta from "../../components/common/PageMeta";
import * as React from "react";
import { Calendar } from "@/components/ui/calendar";
import { pemasukanApi, PemasukanItem } from "../../api/api";
import kegiatan from "../Kegiatana/kegiatan"

const monthOrder = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

export default function Home() {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [data, setData] = React.useState<PemasukanItem[]>([]);
  const [filter, setFilter] = React.useState<'bulanan' | 'triwulan' | 'tahunan'>('bulanan');

  React.useEffect(() => {
    const loadData = async () => {
      try {
        const res = await pemasukanApi.getAll();
        const sorted = res.sort((a, b) => {
          const [bulanA, tahunA] = a.bulan.split(" ");
          const [bulanB, tahunB] = b.bulan.split(" ");
          const idxA = monthOrder.indexOf(bulanA);
          const idxB = monthOrder.indexOf(bulanB);
          return parseInt(tahunA) - parseInt(tahunB) || idxA - idxB;
        });
        setData(sorted);
      } catch (err) {
        console.error("Gagal memuat data", err);
      }
    };

    loadData();
  }, []);

  const groupedData = (() => {
    const map = new Map();
    if (filter === 'bulanan') return data;

    for (const item of data) {
      const [bulan, tahun] = item.bulan.split(" ");
      const quarter = Math.floor(monthOrder.indexOf(bulan) / 3) + 1;
      const key = filter === 'triwulan' ? `Q${quarter} ${tahun}` : tahun;
      if (!map.has(key)) map.set(key, { bulan: key, pemasukan: 0, pengeluaran: 0 });
      map.get(key)[item.tipe] += item.jumlah;
    }
    return Array.from(map.values());
  })();

  const chartData = (filter === 'bulanan' ? data : groupedData).map(item => {
    if (filter === 'bulanan') {
      const [bulan, tahun] = item.bulan.split(" ");
      return {
        month: bulan,
        month_number: monthOrder.indexOf(bulan) + 1 || 0,
        year: parseInt(tahun) || 0,
        sales: item.tipe === 'pemasukan' ? item.jumlah : item.pemasukan || 0,
        revenue: item.tipe === 'pengeluaran' ? item.jumlah : item.pengeluaran || 0,
      };
    } else if (filter === 'triwulan') {
      const [quarter, tahun] = item.bulan.split(" ");
      const quarterNumber = parseInt(quarter.replace("Q", ""));
      return {
        month: `Triwulan ${quarterNumber}`,
        month_number: quarterNumber,
        year: parseInt(tahun) || 0,
        sales: item.pemasukan || 0,
        revenue: item.pengeluaran || 0,
      };
    } else {
      return {
        month: `Tahun ${item.bulan}`,
        month_number: 0,
        year: parseInt(item.bulan),
        sales: item.pemasukan || 0,
        revenue: item.pengeluaran || 0,
      };
    }
  });

  return (
    <>
      <PageMeta title="Dashboard" description="Dashboard pemasukan dan pengeluaran" />
      <div className="grid grid-cols-12 gap-2 md:gap-6">
        <div className="col-span-12">
          <EcommerceMetrics />
        </div>

        <div className="col-span-12 xl:col-span-8 space-y-6">
          <div className="flex justify-end">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300"
            >
              <option value="bulanan">Bulanan</option>
              <option value="triwulan">Triwulan</option>
              {/* <option value="tahunan">Tahunan</option> */}
            </select>
          </div>
          <StatisticsChart
            externalMonthlyData={chartData}
            externalQuarterlyData={[]}
            externalYearlyData={[]}
            availableYears={[2023, 2024, 2025, 2026]}
          />
        </div>

        <div className="col-span-12 xl:col-span-4 flex justify-center">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6"
          />,
        </div>
        <kegiatan/>
      </div>
    </>
  );
}
