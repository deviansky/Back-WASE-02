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

  // State untuk halaman - ditambahkan 'form' dan 'notulen' sebagai opsi baru
  const [currentView, setCurrentView] = useState<'list' | 'absensi' | 'form' | 'notulen'>('list');
  const [selectedKegiatan, setSelectedKegiatan] = useState<Kegiatan | null>(null);
  const [absensiData, setAbsensiData] = useState<{ [penghuniId: number]: string }>({});
  const [penghunis, setPenghunis] = useState<Penghuni[]>([]);
  const [absensiLoading, setAbsensiLoading] = useState(false);

  // State untuk notulen
  const [notulenFile, setNotulenFile] = useState<File | null>(null);
  const [existingNotulen, setExistingNotulen] = useState<any>(null);

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
      closeForm();
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

  // Fungsi untuk membuka halaman form
  const openForm = (item: Kegiatan | null = null) => {
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
    setCurrentView('form');
  };

  // Fungsi untuk menutup halaman form dan kembali ke list
  const closeForm = () => {
    setCurrentView('list');
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

  // Fungsi untuk submit absensi
  const handleAbsensiSubmit = async () => {
    if (!selectedKegiatan) {
      alert('Kegiatan tidak dipilih');
      return;
    }

    try {
      setAbsensiLoading(true);
      
      const absensiList = Object.entries(absensiData)
        .filter(([penghuniId, status]) => penghuniId && status)
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
      setCurrentView('list');
      
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

  // Fungsi upload notulen
  const handleNotulenUpload = async () => {
    if (!selectedKegiatan || !notulenFile) {
      alert("Pilih file dan kegiatan terlebih dahulu.");
      return;
    }
  
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

      setCurrentView('list');
      setNotulenFile(null);
      setExistingNotulen(null);
      setSelectedKegiatan(null);
      
    } catch (error) {
      console.error("Upload notulen gagal:", error);
      alert("Upload gagal. Silakan coba lagi.");
    }
  };

  // Fungsi untuk membuka halaman notulen
  const openNotulenPage = async (item: Kegiatan) => {
    setSelectedKegiatan(item);
    setNotulenFile(null);
    
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
    setNotulenFile(null);
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
            Upload Notulen
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
            {existingNotulen && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">File Notulen Saat Ini</h3>
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
            )}

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {existingNotulen ? 'Upload Notulen Baru (Ganti File)' : 'Upload File Notulen'}
                </label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={e => setNotulenFile(e.target.files?.[0] || null)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Format yang didukung: PDF, DOC, DOCX
                </p>
              </div>

              <div className="flex justify-end gap-4 pt-6">
                <button
                  onClick={closeNotulenPage}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-3 rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleNotulenUpload}
                  disabled={!notulenFile}
                  className={`px-6 py-3 rounded-lg transition-colors ${
                    notulenFile 
                      ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {existingNotulen ? 'Update Notulen' : 'Upload Notulen'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // RENDER HALAMAN FORM KEGIATAN
  if (currentView === 'form') {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center mb-6">
          <button
            onClick={closeForm}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mr-4"
          >
            <FiArrowLeft size={20} />
            Kembali
          </button>
          <h1 className="text-2xl font-bold">
            {editingId ? 'Edit Kegiatan' : 'Tambah Kegiatan Baru'}
          </h1>
        </div>

        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Judul Kegiatan
                </label>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={judul}
                  onChange={e => setJudul(e.target.value)}
                  placeholder="Masukkan judul kegiatan"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deskripsi
                </label>
                <textarea
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={deskripsi}
                  onChange={e => setDeskripsi(e.target.value)}
                  placeholder="Masukkan deskripsi kegiatan"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tanggal
                  </label>
                  <DatePicker
                    selected={tanggal}
                    onChange={(date: Date | null) => setTanggal(date)}
                    dateFormat="yyyy-MM-dd"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholderText="Pilih tanggal"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Waktu Acara
                  </label>
                  <DatePicker
                    selected={waktuAcara}
                    onChange={(date: Date | null) => setWaktuAcara(date)}
                    showTimeSelect
                    showTimeSelectOnly
                    timeIntervals={15}
                    timeCaption="Waktu"
                    dateFormat="HH:mm"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholderText="Pilih waktu"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-6">
                <button
                  type="button"
                  onClick={closeForm}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-3 rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!isFormValid}
                  className={`px-6 py-3 rounded-lg transition-colors ${
                    isFormValid 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                      : 'bg-blue-300 text-white cursor-not-allowed'
                  }`}
                >
                  {editingId ? 'Simpan Perubahan' : 'Tambah Kegiatan'}
                </button>
              </div>
            </div>
          </form>
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
                    ? 'bg-gray-300 cursor-not-allowed'
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

  // RENDER HALAMAN UTAMA (LIST KEGIATAN)
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Daftar Kegiatan</h1>
        <button
          onClick={() => openForm()}
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
                    onClick={() => openNotulenPage(item)}
                    className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded"
                  >
                    Notulen
                  </button>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => openForm(item)}
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


    </div>
  );
};

export default KegiatanCRUD;