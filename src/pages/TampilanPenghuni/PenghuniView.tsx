// Frontend/PenghuniView.tsx
import React, { useState, useEffect } from 'react';
import { 
  fetchPenghuni, 
  Penghuni 
} from '../../api/api';

const PenghuniView: React.FC = () => {
  const [penghunis, setPenghunis] = useState<Penghuni[]>([]);
  const [filteredPenghunis, setFilteredPenghunis] = useState<Penghuni[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Fetch data
  const loadPenghunis = async () => {
    try {
      setLoading(true);
      const data = await fetchPenghuni();
      setPenghunis(data);
      setFilteredPenghunis(data);
      setError(null);
    } catch (err) {
      setError('Gagal memuat data penghuni');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Filter function
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    if (value.trim() === '') {
      setFilteredPenghunis(penghunis);
    } else {
      const filtered = penghunis.filter(penghuni =>
        penghuni.nama.toLowerCase().includes(value.toLowerCase()) ||
        penghuni.prodi.toLowerCase().includes(value.toLowerCase()) ||
        penghuni.angkatan.toString().includes(value) ||
        penghuni.noHp.includes(value)
      );
      setFilteredPenghunis(filtered);
    }
  };

  useEffect(() => {
    loadPenghunis();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 w-full">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white/90">Data Penghuni</h1>
          <p className="text-gray-500 text-xs sm:text-sm dark:text-gray-400">
            Informasi mahasiswa penghuni asrama
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 dark:bg-red-900/30 dark:border-red-500/50 dark:text-red-500">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          {filteredPenghunis.length === 0 && searchTerm ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Tidak ada hasil ditemukan</h3>
              <p className="text-gray-500 dark:text-gray-400">Coba ubah kata kunci pencarian Anda.</p>
            </div>
          ) : filteredPenghunis.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Belum ada data penghuni</h3>
              <p className="text-gray-500 dark:text-gray-400">Belum ada penghuni yang terdaftar di sistem.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      No
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Nama
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Angkatan
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Prodi
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      No HP
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredPenghunis.map((penghuni, index) => (
                    <tr key={penghuni.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {index + 1}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {penghuni.nama}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                          {penghuni.angkatan}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {penghuni.prodi}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {penghuni.noHp}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {filteredPenghunis.length > 0 && (
            <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 border-t border-gray-200 dark:border-gray-600">
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {searchTerm ? (
                    <>Menampilkan: <span className="font-medium ml-1">{filteredPenghunis.length}</span> dari <span className="font-medium">{penghunis.length}</span> penghuni</>
                  ) : (
                    <>Total: <span className="font-medium ml-1">{penghunis.length}</span> penghuni terdaftar</>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PenghuniView;