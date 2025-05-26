import EcommerceMetrics from "../../components/ecommerce/EcommerceMetrics";
import StatisticsChart from "../../components/ecommerce/StatisticsChart";
import PageMeta from "../../components/common/PageMeta";
import * as React from "react";
import { Calendar } from "@/components/ui/calendar";
import { keuanganApi, type KeuanganItem } from "../../api/api";

const monthOrder = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

export default function Home() {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [data, setData] = React.useState<KeuanganItem[]>([]);
  const [filter] = React.useState<'bulanan' | 'triwulan' | 'tahunan'>('bulanan');

  React.useEffect(() => {
    const loadData = async () => {
      try {
        const res = await keuanganApi.getAll();
        // Data dari API sudah terformat: { id, nama_bulan, tahun, pemasukan, pengeluaran, created_at, updated_at }
        const sorted = res.sort((a, b) => {
          const idxA = monthOrder.indexOf(a.bulan);
          const idxB = monthOrder.indexOf(b.bulan);
          return a.id_tahun - b.id_tahun || idxA - idxB;
        });
        setData(sorted);
      } catch (err) {
        console.error("Gagal memuat data keuangan", err);
      }
    };

    loadData();
  }, []);

  const groupedData = (() => {
    if (filter === 'bulanan') return data;

    const map = new Map();
    
    for (const item of data) {
      const quarter = Math.floor(monthOrder.indexOf(item.id_bulan) / 3) + 1;
      const key = filter === 'triwulan' ? `Q${quarter} ${item.id_tahun}` : item.id_tahun.toString();
      
      if (!map.has(key)) {
        map.set(key, { 
          nama_bulan: filter === 'triwulan' ? `Q${quarter}` : `Tahun ${item.id_tahun}`,
          tahun: item.id_tahun,
          pemasukan: 0, 
          pengeluaran: 0 
        });
      }
      
      const existing = map.get(key);
      existing.pemasukan += item.pemasukan || 0;
      existing.pengeluaran += item.pengeluaran || 0;
    }
    
    return Array.from(map.values());
  })();

  const chartData = (filter === 'bulanan' ? data : groupedData).map(item => {
    if (filter === 'bulanan') {
      return {
        month: item.bulan,
        month_number: monthOrder.indexOf(item.bulan) + 1 || 0,
        year: item.tahun || 0,
        sales: item.pemasukan || 0,
        revenue: item.pengeluaran || 0,
      };
    } else if (filter === 'triwulan') {
      const quarterNumber = item.bulan.includes('Q') ? 
        parseInt(item.bulan.replace("Q", "")) : 1;
      return {
        month: `Triwulan ${quarterNumber}`,
        month_number: quarterNumber,
        year: item.tahun || 0,
        sales: item.pemasukan || 0,
        revenue: item.pengeluaran || 0,
      };
    } else {
      return {
        month: item.bulan,
        month_number: 0,
        year: item.tahun,
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
          />
        </div>
      </div>
    </>
  );
}