import { JSX, useEffect, useState } from "react";
import {
  GroupIcon,
  PageIcon,
  DollarLineIcon,
} from "../../icons";
import {
  fetchPenghuni,
  fetchKegiatan,
  fetchKeuangan,
} from "@/api/api";

// Interface untuk data keuangan dari backend
interface KeuanganResponse {
  id: number
  nama_bulan: string
  tahun: number
  pemasukan: number
  pengeluaran: number
  created_at: string
  updated_at: string
}

export default function EcommerceMetrics() {
  const [totalPenghuni, setTotalPenghuni] = useState(0);
  const [totalKegiatan, setTotalKegiatan] = useState(0);
  const [totalUang, setTotalUang] = useState(0);
  const [tahun, setTahun] = useState<number>(new Date().getFullYear());
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch data penghuni
        const penghuni = await fetchPenghuni();
        setTotalPenghuni(penghuni.length);

        // Fetch data kegiatan
        const kegiatan = await fetchKegiatan();
        setTotalKegiatan(kegiatan.length);

        // Fetch data keuangan
        const keuangan = await fetchKeuangan();
        const keuanganData = keuangan as unknown as KeuanganResponse[];

        // Ambil tahun unik dari data keuangan
        const years = Array.from(
          new Set(
            keuanganData
              .map(item => item.tahun)
              .filter(y => y && !isNaN(y))
          )
        ).sort((a, b) => b - a); // Sort descending (tahun terbaru dulu)
        
        setAvailableYears(years);

        // Filter data keuangan berdasarkan tahun yang dipilih
        const filteredKeuangan = keuanganData.filter(item => item.tahun === tahun);

        // Hitung total saldo (pemasukan - pengeluaran) untuk tahun yang dipilih
        const totalSaldo = filteredKeuangan.reduce((acc, item) => {
          return acc + (item.pemasukan - item.pengeluaran);
        }, 0);

        setTotalUang(totalSaldo);

      } catch (error) {
        console.error("Gagal mengambil data metrics:", error);
        setError("Gagal memuat data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tahun]);

  // Auto-select tahun pertama jika tahun saat ini tidak tersedia
  useEffect(() => {
    if (availableYears.length > 0 && !availableYears.includes(tahun)) {
      setTahun(availableYears[0]);
    }
  }, [availableYears, tahun]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:gap-6">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="rounded-lg border bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03] md:rounded-2xl md:p-6">
            <div className="flex items-end justify-between">
              <div className="flex items-center justify-center w-15 h-15 bg-gray-100 rounded-lg dark:bg-gray-800 md:w-12 md:h-12 md:rounded-xl animate-pulse">
                <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded"></div>
              </div>
              <div className="text-right">
                <div className="w-16 h-4 bg-gray-300 dark:bg-gray-600 rounded animate-pulse mb-2"></div>
                <div className="w-20 h-6 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20 md:rounded-2xl md:p-6">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:gap-6">
        {/* Total Penghuni */}
        <MetricBox 
          icon={<GroupIcon />} 
          label="Total Penghuni" 
          value={totalPenghuni}
          color="blue"
        />

        {/* Total Kegiatan */}
        <MetricBox 
          icon={<PageIcon />} 
          label="Total Kegiatan" 
          value={totalKegiatan}
          color="green"
        />

        {/* Total Keuangan dengan dropdown tahun */}
        <div className="rounded-lg border bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03] md:rounded-2xl md:p-6">
          <div className="flex items-end justify-between">
            <div className="flex items-center justify-center w-15 h-15 bg-orange-100 rounded-lg dark:bg-orange-800/20 md:w-12 md:h-12 md:rounded-xl">
              <DollarLineIcon />
            </div>
            <div className="text-right flex-1 ml-4">
              <div className="flex items-center justify-end gap-2 mb-1">
                <span className="text-sm text-gray-500 dark:text-gray-400">Saldo Keuangan</span>
                {availableYears.length > 1 && (
                  <select
                    value={tahun}
                    onChange={(e) => setTahun(Number(e.target.value))}
                    className="text-xs bg-transparent border border-gray-300 dark:border-gray-600 rounded px-1 py-0.5 text-gray-500 dark:text-gray-400"
                  >
                    {availableYears.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                )}
              </div>
              <h4 className={`mt-1 font-bold text-title-sm ${
                totalUang >= 0 
                  ? "text-green-600 dark:text-green-400" 
                  : "text-red-600 dark:text-red-400"
              }`}>
                Rp {totalUang.toLocaleString("id-ID")}
              </h4>
              {availableYears.length === 0 && (
                <p className="text-xs text-gray-400 mt-1">Belum ada data</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function MetricBox({ 
  icon, 
  label, 
  value, 
  color = "gray" 
}: { 
  icon: JSX.Element; 
  label: string; 
  value: number | string;
  color?: "blue" | "green" | "orange" | "gray";
}) {
  const colorClasses = {
    blue: "bg-blue-100 dark:bg-blue-800/20",
    green: "bg-green-100 dark:bg-green-800/20", 
    orange: "bg-orange-100 dark:bg-orange-800/20",
    gray: "bg-gray-100 dark:bg-gray-800"
  };

  return (
    <div className="rounded-lg border bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03] md:rounded-2xl md:p-6">
      <div className="flex items-end justify-between">
        <div className={`flex items-center justify-center w-15 h-15 rounded-lg md:w-12 md:h-12 md:rounded-xl ${colorClasses[color]}`}>
          {icon}
        </div>
        <div className="text-right">
          <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
          <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">{value}</h4>
        </div>
      </div>
    </div>
  );
}