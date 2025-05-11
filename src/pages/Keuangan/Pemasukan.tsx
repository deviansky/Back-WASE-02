import { useState, useEffect } from "react";
import { pemasukanApi, PemasukanItem } from "../../api/api";
import StatisticsChart from "../../components/ecommerce/StatisticsChart";

const monthOrder = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

export default function PemasukanPengeluaranCRUD() {
  const [data, setData] = useState<PemasukanItem[]>([]);
  const [formData, setFormData] = useState<Omit<PemasukanItem, 'id' | 'created_at' | 'updated_at'>>({
    bulan: '',
    jumlah: 0,
    deskripsi: '',
    tipe: 'pemasukan',
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'bulanan' | 'triwulan' | 'tahunan'>('bulanan');

  const loadData = async () => {
    setLoading(true);
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
      setError("Gagal memuat data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'jumlah' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await pemasukanApi.update(editingId, formData);
      } else {
        await pemasukanApi.create(formData);
      }
      await loadData();
      alert('✅ Data berhasil disimpan!');
      setFormData({ bulan: '', jumlah: 0, deskripsi: '', tipe: 'pemasukan' });
      setEditingId(null);
    } catch {
      alert('❌ Gagal menyimpan data');
    }
  };
  

  const handleEdit = (item: PemasukanItem) => {
    setFormData({
      bulan: item.bulan,
      jumlah: item.jumlah,
      deskripsi: item.deskripsi,
      tipe: item.tipe,
    });
    setEditingId(item.id || null);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Yakin ingin menghapus data ini?")) return;
    await pemasukanApi.delete(id);
    await loadData();
  };

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
        month: `Triwulan ${quarterNumber}`, // tampil "Triwulan 1"
        month_number: quarterNumber,
        year: parseInt(tahun) || 0,
        sales: item.pemasukan || 0,
        revenue: item.pengeluaran || 0,
      };
    } else { // tahunan
      return {
        month: `Tahun ${item.bulan}`, // tampil "Tahun 2024"
        month_number: 0,
        year: parseInt(item.bulan),
        sales: item.pemasukan || 0,
        revenue: item.pengeluaran || 0,
      };
    }
  });
  
  

  const sortedData = [...data].sort((a, b) => {
    const [bulanA, tahunA] = a.bulan.split(" ");
    const [bulanB, tahunB] = b.bulan.split(" ");
    const bulanOrder = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];
    const yearDiff = parseInt(tahunA) - parseInt(tahunB);
    if (yearDiff !== 0) return yearDiff;
    return bulanOrder.indexOf(bulanA) - bulanOrder.indexOf(bulanB);
  });

  return (
    <div className="space-y-8">
      <div className="flex justify-end">
        <select value={filter} onChange={(e) => setFilter(e.target.value as any)} className="rounded px-3 py-1 border">
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

      {/* Form dan Tabel tetap sama seperti sebelumnya */}
    

      <div className="bg-white dark:bg-white/[0.03] p-6 rounded-2xl border border-gray-200 dark:border-gray-800">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
          Tambah/Edit Data Pemasukan dan Pengeluaran
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Bulan
              </label>
              <select
                name="bulan"
                value={formData.bulan}
                onChange={handleFormChange}
                className="w-full rounded-md border border-gray-300 dark:border-gray-700 px-3 py-2"
                required
              >
                {[
                  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
                  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
                ].map((bulan, index) => (
                  <option key={index} value={`${bulan} ${formData.bulan.split(" ")[1] || new Date().getFullYear()}`}>
                    {bulan}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tahun
              </label>
              <select
                name="tahun"
                value={formData.bulan.split(" ")[1] || new Date().getFullYear()}
                onChange={(e) => {
                  const tahun = e.target.value;
                  const bulan = formData.bulan.split(" ")[0] || "Januari";
                  setFormData(prev => ({ ...prev, bulan: `${bulan} ${tahun}` }));
                }}
                className="w-full rounded-md border border-gray-300 dark:border-gray-700 px-3 py-2"
                required
              >
                {[2023, 2024, 2025, 2026].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Jumlah
              </label>
              <input
                type="number"
                name="jumlah"
                value={formData.jumlah}
                onChange={handleFormChange}
                className="w-full rounded-md border border-gray-300 dark:border-gray-700 px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tipe
              </label>
              <select
                name="tipe"
                value={formData.tipe}
                onChange={handleFormChange}
                className="w-full rounded-md border border-gray-300 dark:border-gray-700 px-3 py-2"
                required
              >
                <option value="pemasukan">Pemasukan</option>
                <option value="pengeluaran">Pengeluaran</option>
              </select>
            </div>

            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Deskripsi
              </label>
              <textarea
                name="deskripsi"
                value={formData.deskripsi}
                onChange={handleFormChange}
                className="w-full rounded-md border border-gray-300 dark:border-gray-700 px-3 py-2"
              ></textarea>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition"
            >
              {editingId ? 'Update' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>

      {/* Tabel data */}
      <div className="bg-white dark:bg-white/[0.03] p-6 rounded-2xl border border-gray-200 dark:border-gray-800">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
          Data Pemasukan dan Pengeluaran
        </h3>

        {loading ? (
          <p>Memuat...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Bulan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Jumlah</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Tipe</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Deskripsi</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {sortedData.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{item.bulan}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{item.jumlah.toLocaleString('id-ID')}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{item.tipe}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{item.deskripsi}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item.id!)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {data.length === 0 && (
              <div className="text-center py-4 text-gray-500">Tidak ada data</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
