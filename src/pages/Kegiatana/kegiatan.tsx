import React, { useEffect, useState } from 'react';
import {
  fetchKegiatan,
  addKegiatan,
  updateKegiatan,
  deleteKegiatan,
  fetchPenghuni, 
  Kegiatan,
  Penghuni,
} from '../../api/api';

import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';



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

  const [isAbsensiModalOpen, setIsAbsensiModalOpen] = useState(false);
  const [selectedKegiatan, setSelectedKegiatan] = useState<Kegiatan | null>(null);
  const [absensiData, setAbsensiData] = useState<{ [penghuniId: number]: string }>({});

  const [penghunis, setPenghunis] = useState<Penghuni[]>([]);



  useEffect(() => {
    setIsFormValid(
      judul.trim() !== '' &&
      deskripsi.trim() !== '' &&
      tanggal !== null &&
      waktuAcara !== null
    );
  }, [judul, deskripsi, tanggal, waktuAcara]);
  
  useEffect(() => {
    const loadPenghunis = async () => {
      try {
        const data = await fetchPenghuni();
        setPenghunis(data);
      } catch (err) {
        console.error('Gagal memuat data penghuni:', err);
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

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Daftar Kegiatan</h1>
        <button
          onClick={() => openModal()}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Tambah Kegiatan
        </button>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {loading ? (
        <p>Memuat data...</p>
      ) : (
        <div className="space-y-4">
          {kegiatan.map(item => (
            <div key={item.id} className="border p-4 rounded shadow">
              <h2 className="text-lg font-semibold">{item.judul}</h2>
              <p>{item.deskripsi}</p>
              <p className="text-sm text-gray-500">
                {item.tanggal} - {item.waktu_acara}
              </p>
              <div className="flex justify-between items-center mt-3">
                {/* Kiri: Absensi dan Notulen */}
                <div className="flex gap-2">
                <button
                    onClick={() => {
                      setSelectedKegiatan(item);
                      setIsAbsensiModalOpen(true);
                    }}
                    className="bg-green-500 text-white px-3 py-1 rounded"
                  >
                    Absensi
                  </button>

                  <button
                    onClick={() => alert(`Notulen untuk ${item.judul}`)}
                    className="bg-indigo-500 text-white px-3 py-1 rounded"
                  >
                    Notulen
                  </button>
                </div>

                {/* Kanan: Tombol ikon */}
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

      {isAbsensiModalOpen && selectedKegiatan && (
        <div className="fixed inset-0  flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-xl">
            <h2 className="text-xl font-semibold mb-4">Absensi - {selectedKegiatan.judul}</h2>

            {/* Simulasi data penghuni, ganti dengan API jika perlu */}
            {penghunis
              .filter(p => p.id !== null) // pastikan id tidak null
              .map(p => (
                <div key={p.id!} className="mb-4">
                  <label className="block mb-1">{p.nama}</label>
                  <select
                    value={absensiData[p.id!] || ''}
                    onChange={e =>
                      setAbsensiData(prev => ({
                        ...prev,
                        [p.id!]: e.target.value
                      }))
                    }
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Pilih status</option>
                    <option value="Hadir">Hadir</option>
                    <option value="Sakit">Sakit</option>
                    <option value="Izin">Izin</option>
                    <option value="Alpha">Alpha</option>
                  </select>
                </div>
            ))}




            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsAbsensiModalOpen(false)}
                className="bg-gray-300 px-4 py-2 rounded"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  console.log('Absensi Disimpan:', absensiData);
                  // Simpan absensi ke backend di sini
                  setIsAbsensiModalOpen(false);
                }}
                className="bg-green-600 text-white px-4 py-2 rounded"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};




export default KegiatanCRUD;
