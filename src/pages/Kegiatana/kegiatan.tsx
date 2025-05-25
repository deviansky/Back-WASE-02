import React, { useEffect, useState } from 'react';
import {
  fetchKegiatan,
  addKegiatan,
  updateKegiatan,
  deleteKegiatan,
  fetchPenghuni,
  Kegiatan,
  Penghuni,
  absensiApi,
  notulenApi
} from '../../api/api';

import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FiEdit2, FiTrash2, FiArrowLeft, FiUsers } from 'react-icons/fi';

// Interface NotulenItem sudah ada di notulenApi, tidak perlu didefinisikan ulang

const KegiatanCRUD: React.FC = () => {
  const [kegiatan, setKegiatan] = useState<Kegiatan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [judul, setJudul] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [tanggal, setTanggal] = useState<Date | null>(null);
  const [waktuAcara, setWaktuAcara] = useState<Date | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isFormValid, setIsFormValid] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // State untuk halaman absensi
  const [currentView, setCurrentView] = useState<'list' | 'absensi'>('list');
  const [selectedKegiatan, setSelectedKegiatan] = useState<Kegiatan | null>(null);
  const [absensiData, setAbsensiData] = useState<{ [penghuniId: number]: string }>({});
  const [penghunis, setPenghunis] = useState<Penghuni[]>([]);
  const [absensiLoading, setAbsensiLoading] = useState(false);

  // State untuk notulen - DIPERBAIKI: Tambahkan state yang hilang
  const [notulenFile, setNotulenFile] = useState<File | null>(null);
  const [existingNotulen, setExistingNotulen] = useState<any>(null); // Menggunakan any karena tipe sudah didefinisikan di notulenApi
  const [isNotulenModalOpen, setIsNotulenModalOpen] = useState(false); // MISSING STATE!

  useEffect(() => {
    setIsFormValid(
      judul.trim() !== '' &&
      deskripsi.trim() !== '' &&
      tanggal !== null &&
      waktuAcara !== null
    );
  }, [judul, deskripsi, tanggal, waktuAcara]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = {
      judul,
      deskripsi,
      tanggal: tanggal ? tanggal.toISOString().split('T')[0] : '',
      waktu_acara: waktuAcara ? waktuAcara.toTimeString().slice(0, 5) : '',
    };

    try {
      if (editingId !== null) {
        await updateKegiatan({ ...formData, id: editingId });
      } else {
        await addKegiatan(formData);
      }

      await loadKegiatan();
      closeModal();
    } catch (err) {
      console.error('Error submitting form:', err);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteKegiatan(id);
      await loadKegiatan();
    } catch (err) {
      console.error('Error deleting kegiatan:', err);
    }
  };

  const openModal = (item: Kegiatan | null = null) => {
    if (item) {
      setEditingId(item.id);
      setJudul(item.judul);
      setDeskripsi(item.deskripsi);
      setTanggal(new Date(item.tanggal)); 
      setWaktuAcara(new Date(`1970-01-01T${item.waktu_acara}`)); 
    } else {
      setEditingId(null);
      setJudul('');
      setDeskripsi('');
      setTanggal(null);       
      setWaktuAcara(null);   
    }    
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setJudul('');
    setDeskripsi('');
    setTanggal(null);
    setWaktuAcara(null);
  };  

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

  // Fungsi untuk submit absensi (diperbaiki)
  const handleAbsensiSubmit = async () => {
    if (!selectedKegiatan) {
      alert('Kegiatan tidak dipilih');
      return;
    }

    try {
      setAbsensiLoading(true);
      
      // Konversi absensi data ke format yang dibutuhkan API
      const absensiList = Object.entries(absensiData)
        .filter(([penghuniId, status]) => penghuniId && status) // Filter data yang valid
        .map(([penghuniId, status]) => ({
          id_penghuni: parseInt(penghuniId),
          status_kehadiran: status,
        }));

      console.log('📤 Mengirim data absensi:', {
        kegiatanId: selectedKegiatan.id,
        absensiList
      });

      await absensiApi.create(selectedKegiatan.id, absensiList);
      
      alert('✅ Absensi berhasil disimpan!');
      setCurrentView('list'); // Kembali ke halaman list
      
    } catch (error) {
      console.error('❌ Gagal menyimpan absensi:', error);
      alert('Gagal menyimpan absensi. Silakan coba lagi.');
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

  // DIPERBAIKI: Fungsi upload notulen dengan error handling yang lebih baik
  const handleNotulenUpload = async () => {
    if (!selectedKegiatan || !notulenFile) {
      alert("Pilih file dan kegiatan terlebih dahulu.");
      return;
    }
  
    // Konversi file ke base64 string
    const toBase64 = (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
      });
    };

    try {
      const base64File = await toBase64(notulenFile);

      if (existingNotulen) {
        await notulenApi.update(existingNotulen.id, base64File);
        alert("Notulen berhasil diperbarui!");
      } else {
        await notulenApi.create({
          id_kegiatan: selectedKegiatan.id,
          file: base64File,
        });
        alert("Notulen berhasil diunggah!");
      }

      // Reset state dan tutup modal
      setIsNotulenModalOpen(false);
      setNotulenFile(null);
      setExistingNotulen(null);
      
    } catch (error) {
      console.error("Upload notulen gagal:", error);
      alert("Upload gagal. Silakan coba lagi.");
    }
  };

  // DIPERBAIKI: Fungsi untuk membuka modal notulen dengan error handling
  const openNotulenModal = async (item: Kegiatan) => {
    setSelectedKegiatan(item);
    setNotulenFile(null);
    
    try {
      // Coba gunakan notulenApi jika tersedia, jika tidak gunakan fetch manual
      let notulenData = null;
      
      if (notulenApi && notulenApi.getByKegiatan) {
        notulenData = await notulenApi.getByKegiatan(item.id);
      } else {
        // Fallback ke fetch manual
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
    
    setIsNotulenModalOpen(true);
  };

  // DIPERBAIKI: Fungsi untuk menutup modal notulen
  const closeNotulenModal = () => {
    setIsNotulenModalOpen(false);
    setSelectedKegiatan(null);
    setNotulenFile(null);
    setExistingNotulen(null);
  };

  // Render halaman absensi
  if (currentView === 'absensi') {
    return (
      <div className="container mx-auto p-6">
        <div className="flex mb-6">
          <h1 className="text-2xl font-bold">
            Absensi Kegiatan
          </h1>
        </div>

        {absensiLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
        ) : (
          <>
            {selectedKegiatan && (
              <div className="bg-gray-50 p-3 rounded-lg mb-6">
                <h2 className="font-semibold">Kegiatan: <p className="text-ml text-gray-500">{selectedKegiatan.judul}</p></h2>
                <p className="text-sm text-gray-500">
                  📅 {new Date(selectedKegiatan.tanggal).toLocaleDateString('id-ID')}
                </p>
                <p className="text-sm text-gray-500">
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
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex-1">
                          <h4 className="font-medium">{penghuni.nama}</h4>
                          <p className="text-sm text-gray-500">
                            Angkatan: {penghuni.angkatan}
                          </p>
                        </div>
                        
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2">
                            <input
                              type="radio"
                              name={`absensi-${penghuni.id}`}
                              value="Hadir"
                              checked={absensiData[penghuni.id!] === 'Hadir'}
                              onChange={() => {
                                if (penghuni.id) {
                                  setAbsensiData(prev => ({
                                    ...prev,
                                    [penghuni.id!]: 'Hadir',
                                  }));
                                }
                              }}
                              className="text-green-600"
                            />
                            <span className="text-green-600 font-medium">Hadir</span>
                          </label>
                          
                          <label className="flex items-center gap-2">
                            <input
                              type="radio"
                              name={`absensi-${penghuni.id}`}
                              value="Tidak Hadir"
                              checked={absensiData[penghuni.id!] === 'Tidak Hadir'}
                              onChange={() => {
                                if (penghuni.id) {
                                  setAbsensiData(prev => ({
                                    ...prev,
                                    [penghuni.id!]: 'Tidak Hadir',
                                  }));
                                }
                              }}
                              className="text-red-600"
                            />
                            <span className="text-red-600 font-medium">Tidak Hadir</span>
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={backToList}
                className="bg-gray-300 hover:bg-gray-400 px-6 py-2 rounded"
                disabled={absensiLoading}
              >
                Batal
              </button>
              <button
                onClick={handleAbsensiSubmit}
                disabled={absensiLoading || penghunis.length === 0}
                className={`px-6 py-2 rounded ${
                  absensiLoading || penghunis.length === 0
                    ? 'bg-white cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-600'
                } text-white`}
              >
                {absensiLoading ? 'Menyimpan...' : 'Simpan Absensi'}
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  // Render halaman utama (list kegiatan)
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Daftar Kegiatan</h1>
        <button
          onClick={() => openModal()}
          className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg transition-colors flex items-center space-x-1 sm:space-x-2 w-full sm:w-auto justify-center"
        >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
        </svg>
          Tambah Kegiatan
        </button>
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
          {kegiatan.map(item => (
            <div key={item.id} className="border p-4 rounded shadow bg-white">
              <h2 className="text-lg font-semibold">{item.judul}</h2>
              <p className="text-gray-700 mb-1">{item.deskripsi}</p>
              <p className="text-sm text-gray-500 mb-3">
                📅 {new Date(item.tanggal).toLocaleDateString('id-ID')} - ⏰ {item.waktu_acara.slice(0, 5)}
              </p>
              
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <button
                    onClick={() => openAbsensiPage(item)}
                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded flex items-center gap-1"
                  >
                    <FiUsers size={16} />
                    Absensi
                  </button>

                  <button
                    onClick={() => openNotulenModal(item)}
                    className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded"
                  >
                    Upload Notulen
                  </button>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => openModal(item)}
                    className="text-yellow-500 hover:text-yellow-600"
                    title="Edit"
                  >
                    <FiEdit2 size={20} />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Apakah kamu yakin ingin menghapus kegiatan "${item.judul}"?`)) {
                        handleDelete(item.id);
                      }
                    }}
                    className="text-red-500 hover:text-red-600"
                    title="Hapus"
                  >
                    <FiTrash2 size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Form Kegiatan */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/30 backdrop-blur-sm">
          <form
            onSubmit={handleSubmit}
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full"
          >
            <h2 className="text-xl font-semibold mb-4">{editingId ? 'Edit Kegiatan' : 'Tambah Kegiatan'}</h2>

            <label className="block mb-2">Judul</label>
            <input
              type="text"
              className="w-full mb-4 p-2 border rounded"
              value={judul}
              onChange={e => setJudul(e.target.value)}
            />

            <label className="block mb-2">Deskripsi</label>
            <textarea
              className="w-full mb-4 p-2 border rounded"
              value={deskripsi}
              onChange={e => setDeskripsi(e.target.value)}
            ></textarea>

            <label className="block mb-2">Tanggal</label>
            <DatePicker
              selected={tanggal}
              onChange={(date: Date | null) => setTanggal(date)}
              dateFormat="yyyy-MM-dd"
              className="w-full mb-4 p-2 border rounded"
            />

            <label className="block mb-2">Waktu Acara</label>
            <DatePicker
              selected={waktuAcara}
              onChange={(date: Date | null) => setWaktuAcara(date)}
              showTimeSelect
              showTimeSelectOnly
              timeIntervals={15}
              timeCaption="Waktu"
              dateFormat="HH:mm"
              className="w-full mb-4 p-2 border rounded"
            />

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={closeModal}
                className="bg-gray-300 px-4 py-2 rounded"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={!isFormValid}
                className={`px-4 py-2 rounded ${
                  isFormValid ? 'bg-blue-600 text-white' : 'bg-blue-300 text-white cursor-not-allowed'
                }`}
              >
                {editingId ? 'Simpan Perubahan' : 'Tambah'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal Upload Notulen - DIPERBAIKI */}
      {isNotulenModalOpen && selectedKegiatan && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center">
          <div className="w-full max-w-md bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">
              Upload Notulen - {selectedKegiatan.judul}
            </h2>
            
            {existingNotulen && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
                <p className="text-sm text-blue-800 mb-2">File saat ini:</p>
                <a
                  href={`${import.meta.env.VITE_API_URL}/uploads/notulen/${existingNotulen.file}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline text-sm break-all"
                >
                  {existingNotulen.file}
                </a>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Pilih File (.pdf, .doc, .docx)
              </label>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={e => setNotulenFile(e.target.files?.[0] || null)}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={closeNotulenModal}
                className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleNotulenUpload}
                disabled={!notulenFile}
                className={`px-4 py-2 rounded transition-colors ${
                  notulenFile 
                    ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {existingNotulen ? 'Update' : 'Upload'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KegiatanCRUD;