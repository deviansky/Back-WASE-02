import React, { JSX, useEffect, useState } from "react";
import {
  GroupIcon,
  PageIcon,
  BoxIconLine,
} from "../../icons";
import {
  fetchPenghuni,
  fetchKegiatan,
  fetchPemasukan,
} from "@/api/api";

export default function EcommerceMetrics() {
  const [totalPenghuni, setTotalPenghuni] = useState(0);
  const [totalKegiatan, setTotalKegiatan] = useState(0);
  const [totalUang, setTotalUang] = useState(0);
  const [tahun, setTahun] = useState<number>(new Date().getFullYear());
  const [availableYears, setAvailableYears] = useState<number[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const penghuni = await fetchPenghuni();
        setTotalPenghuni(penghuni.length);

        const kegiatan = await fetchKegiatan();
        setTotalKegiatan(kegiatan.length);

        const pemasukan = await fetchPemasukan();

        // Ambil tahun unik dari pemasukan
        const years = Array.from(
          new Set(
            pemasukan
              .map(item => new Date(item.created_at || "").getFullYear())
              .filter(y => !isNaN(y))
          )
        ).sort();
        setAvailableYears(years);

        // Filter pemasukan berdasarkan tahun yang dipilih
        const tahunDariBulan = (bulanStr: string): number => {
          const parts = bulanStr.trim().split(" ");
          const tahun = parseInt(parts[1]);
          return isNaN(tahun) ? 0 : tahun;
        };
        
        const filtered = pemasukan.filter(item => {
          return tahunDariBulan(item.bulan) === tahun;
        });
        

        const total = filtered.reduce((acc, item) => {
          return item.tipe === "pemasukan"
            ? acc + item.jumlah
            : acc - item.jumlah;
        }, 0);

        setTotalUang(total);
      } catch (error) {
        console.error("Gagal mengambil data metrics:", error);
      }
    };

    fetchData();
  }, [tahun]);

  return (
    <>
      <div className="mb-4 flex justify-end">
        <label className="mr-2 text-sm text-gray-700 dark:text-gray-300">Tahun:</label>
        <select
          value={tahun}
          onChange={(e) => setTahun(parseInt(e.target.value))}
          className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300"
        >
          {availableYears.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:gap-6">
        {/* Total Penghuni */}
        <MetricBox icon={<GroupIcon />} label="Penghuni" value={totalPenghuni} />

        {/* Total Kegiatan */}
        <MetricBox icon={<PageIcon />} label="Kegiatan" value={totalKegiatan} />

        {/* Total Keuangan */}
        <MetricBox icon={<BoxIconLine />} label={`Keuangan (${tahun})`} value={`Rp ${totalUang.toLocaleString("id-ID")}`} />
      </div>
    </>
  );
}

function MetricBox({ icon, label, value }: { icon: JSX.Element; label: string; value: number | string }) {
  return (
    <div className="rounded-lg border bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03] md:rounded-2xl md:p-6">
      <div className="flex items-end justify-between">
        <div className="flex items-center justify-center w-15 h-15 bg-gray-100 rounded-lg dark:bg-gray-800 md:w-12 md:h-12 md:rounded-xl">
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
