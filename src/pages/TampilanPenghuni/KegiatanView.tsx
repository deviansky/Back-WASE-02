import React, { useEffect, useState } from 'react';
import {
  fetchKegiatan,
  fetchPenghuni,
  Kegiatan,
  Penghuni,
  absensiApi,
  notulenApi
} from '../../api/api';

import { FiArrowLeft, FiUsers, FiEye } from 'react-icons/fi';

const KegiatanView: React.FC = () => {
  const [kegiatan, setKegiatan] = useState<Kegiatan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // State untuk halaman - hanya 'list', 'absensi', dan 'notulen'
  const [currentView, setCurrentView] = useState<'list' | 'absensi' | 'notulen'>('list');
  const [selectedKegiatan, setSelectedKegiatan] = useState<Kegiatan | null>(null);
  const [absensiData, setAbsensiData] = useState<{ [penghuniId: number]: string }>({});
  const [penghunis, setPenghunis] = useState<Penghuni[]>([]);
  const [absensiLoading, setAbsensiLoading] = useState(false);

  // State untuk notulen
  const [existingNotulen, setExistingNotulen] = useState<any>(null);

  // Load penghuni saat komponen dimount
  useEffect(() => {
    const loadPenghunis = async () => {
      try {
        console.log('🔄 Memuat data penghuni...');
        const data = await fetchPenghuni();
        console.log('✅ Data penghuni berhasil dimuat:', data);
        setPenghunis(data);
      } catch (err) {
        console.error('❌ Gagal memuat data penghuni:', err);
        setError('Gagal memuat data penghuni');
      }
    };
    loadPenghunis();
  }, []);

  const loadKegiatan = async () => {
    try {
      setLoading(true);
      const data = await fetchKegiatan();
      setKegiatan(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Gagal memuat data kegiatan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadKegiatan();
  }, []);

  const openAbsensiPage = async (item: Kegiatan) => {
    try {
      setAbsensiLoading(true);
      setSelectedKegiatan(item);

      let penghuniData = penghunis;
      if (penghunis.length === 0) {
        penghuniData = await fetchPenghuni();
        setPenghunis(penghuniData);
      }

      const data = await absensiApi.getByKegiatan(item.id);

      const initialAbsensi: { [penghuniId: number]: string } = {};
      penghuniData.forEach(penghuni => {
        if (penghuni.id) initialAbsensi[penghuni.id] = 'Tidak Hadir';
      });

      data.forEach(d => {
        if (d.id_penghuni) {
          initialAbsensi[d.id_penghuni] = d.status_kehadiran === 'Hadir' ? 'Hadir' : 'Tidak Hadir';
        }
      });

      setAbsensiData(initialAbsensi);
      setCurrentView('absensi');
    } catch (error) {
      console.error('❌ Gagal memuat absensi:', error);
      alert('Gagal memuat data absensi. Silakan coba lagi.');
    } finally {
      setAbsensiLoading(false);
    }
  };  

  // Fungsi untuk kembali ke halaman list
  const backToList = () => {
    setCurrentView('list');
    setSelectedKegiatan(null);
    setAbsensiData({});
  };

  // Fungsi untuk membuka halaman notulen
  const openNotulenPage = async (item: Kegiatan) => {
    setSelectedKegiatan(item);
    
    try {
      let notulenData = null;
      
      if (notulenApi && notulenApi.getByKegiatan) {
        notulenData = await notulenApi.getByKegiatan(item.id);
      } else {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/notulen/kegiatan/${item.id}`);
        if (res.ok) {
          notulenData = await res.json();
        }
      }
      
      setExistingNotulen(notulenData);
    } catch (error) {
      console.error("Gagal memuat notulen:", error);
      setExistingNotulen(null);
    }
    
    setCurrentView('notulen');
  };

  // Fungsi untuk menutup halaman notulen
  const closeNotulenPage = () => {
    setCurrentView('list');
    setSelectedKegiatan(null);
    setExistingNotulen(null);
  };

  // RENDER HALAMAN NOTULEN
  if (currentView === 'notulen') {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center mb-6">
          <button
            onClick={closeNotulenPage}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mr-4"
          >
            <FiArrowLeft size={20} />
            Kembali
          </button>
          <h1 className="text-2xl font-bold">
            Lihat Notulen
          </h1>
        </div>

        {selectedKegiatan && (
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h2 className="font-semibold text-lg">Kegiatan: {selectedKegiatan.judul}</h2>
            <p className="text-sm text-gray-500 mt-1">
              📅 {new Date(selectedKegiatan.tanggal).toLocaleDateString('id-ID')} - 
              ⏰ {selectedKegiatan.waktu_acara.slice(0, 5)}
            </p>
          </div>
        )}

        <div className="max-w-4xl mx-auto">
          <div className="bg-white p-8 rounded-lg shadow-lg">
            {existingNotulen ? (
              <div>
                <h3 className="text-lg font-semibold mb-4">File Notulen</h3>
                <div className="border rounded-lg p-4 bg-blue-50">
                  <div className="mb-4">
                    <iframe
                      src={`${import.meta.env.VITE_API_URL}/uploads/notulen/${existingNotulen.file}`}
                      width="100%"
                      height="600px"
                      className="border rounded-lg"
                      title="Notulen PDF Viewer"
                    />
                  </div>
                  <div className="flex justify-center">
                    <a
                      href={`${import.meta.env.VITE_API_URL}/uploads/notulen/${existingNotulen.file}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Buka di Tab Baru
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada notulen</h3>
                <p className="text-gray-500">Notulen untuk kegiatan ini belum tersedia.</p>
              </div>
            )}

            <div className="flex justify-end gap-4 pt-6">
              <button
                onClick={closeNotulenPage}
                className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-3 rounded-lg transition-colors"
              >
                Kembali
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // RENDER HALAMAN ABSENSI
  if (currentView === 'absensi') {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center mb-6">
          <button
            onClick={backToList}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mr-4"
          >
            <FiArrowLeft size={20} />
            Kembali
          </button>
          <h1 className="text-2xl font-bold">
            Data Absensi Kegiatan
          </h1>
        </div>

        {absensiLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
        ) : (
          <>
            {selectedKegiatan && (
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h2 className="font-semibold text-lg">Kegiatan: {selectedKegiatan.judul}</h2>
                <p className="text-sm text-gray-500 mt-1">
                  📅 {new Date(selectedKegiatan.tanggal).toLocaleDateString('id-ID')} - 
                  ⏰ {selectedKegiatan.waktu_acara.slice(0, 5)}
                </p>
              </div>
            )}
            
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <FiUsers />
                  Daftar Kehadiran ({penghunis.length} orang)
                </h3>
              </div>
              
              <div className="p-4">
                {penghunis.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">
                    Tidak ada data penghuni ditemukan
                  </p>
                ) : (
                  <div className="space-y-4">
                    {penghunis.map((penghuni, index) => (
                      <div 
                        key={penghuni.id || index} 
                        className="flex items-center justify-between p-3 border rounded-lg bg-gray-50"
                      >
                        <div className="flex-1">
                          <h4 className="font-medium">{penghuni.nama}</h4>
                          <p className="text-sm text-gray-500">
                            Angkatan: {penghuni.angkatan}
                          </p>
                        </div>
                        
                        <div className="flex items-center">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            absensiData[penghuni.id!] === 'Hadir' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {absensiData[penghuni.id!] || 'Tidak Hadir'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={backToList}
                className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded transition-colors"
              >
                Kembali
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  // RENDER HALAMAN UTAMA (LIST KEGIATAN)
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Daftar Kegiatan</h1>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {kegiatan.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0h6m-6 0H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V9a2 2 0 00-2-2h-2" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada kegiatan</h3>
              <p className="text-gray-500">Belum ada kegiatan yang tersedia untuk ditampilkan.</p>
            </div>
          ) : (
            kegiatan.map(item => (
              <div key={item.id} className="border p-4 rounded shadow bg-white">
                <h2 className="text-lg font-semibold">{item.judul}</h2>
                <p className="text-gray-700 mb-1">{item.deskripsi}</p>
                <p className="text-sm text-gray-500 mb-3">
                  📅 {new Date(item.tanggal).toLocaleDateString('id-ID')} - ⏰ {item.waktu_acara.slice(0, 5)}
                </p>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => openAbsensiPage(item)}
                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded flex items-center gap-1 transition-colors"
                  >
                    Absensi
                  </button>

                  <button
                    onClick={() => openNotulenPage(item)}
                    className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded flex items-center gap-1 transition-colors"
                  >
                    Notulen
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default KegiatanView;