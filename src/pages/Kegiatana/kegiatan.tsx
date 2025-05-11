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
  NotulenItem
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

  const [isNotulenModalOpen, setIsNotulenModalOpen] = useState(false);
  const [notulenFile, setNotulenFile] = useState<File | null>(null);
  const [existingNotulen, setExistingNotulen] = useState<NotulenItem | null>(null);



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

  const openAbsensiModal = async (item: Kegiatan) => {
    try {
      setSelectedKegiatan(item);
      const data = await absensiApi.getByKegiatan(item.id);
      const initialAbsensi = Object.fromEntries(
        data.map(d => [d.id_penghuni, d.status_kehadiran])
      );
      setAbsensiData(initialAbsensi);
      setIsAbsensiModalOpen(true);
    } catch (error) {
      console.error('❌ Gagal memuat absensi:', error);
      alert('Gagal memuat absensi');
    }
  };
  
  // Fungsi untuk submit absensi
  const handleAbsensiSubmit = async () => {
    if (!selectedKegiatan) return;
  
    const absensiList = Object.entries(absensiData).map(
      ([id_penghuni, status_kehadiran]) => ({
        id_penghuni: parseInt(id_penghuni),
        status_kehadiran,
      })
    );
  
    try {
      await absensiApi.create(selectedKegiatan.id, absensiList);
      alert('✅ Absensi berhasil disimpan!');
      setIsAbsensiModalOpen(false);
    } catch (error) {
      console.error('❌ Gagal menyimpan absensi:', error);
      alert('Gagal menyimpan absensi');
    }
  };
  
  const handleNotulenUpload = async () => {
    if (!selectedKegiatan || !notulenFile) {
      alert("Pilih file dan kegiatan terlebih dahulu.");
      return;
    }
  
    const formData = new FormData();
    formData.append('id_kegiatan', selectedKegiatan.id.toString());
    formData.append('file', notulenFile);
  
    try {
      const url = existingNotulen
        ? `http://localhost:5000/notulen/${existingNotulen.id}`
        : `http://localhost:5000/notulen/upload`;
  
      const method = existingNotulen ? 'PUT' : 'POST';
  
      const response = await fetch(url, {
        method,
        body: formData,
      });
  
      if (!response.ok) throw new Error('Upload gagal');
  
      alert("✅ Notulen berhasil diupload");
      setIsNotulenModalOpen(false);
      setNotulenFile(null);
      setExistingNotulen(null);
    } catch (error) {
      console.error("❌ Upload gagal:", error);
      alert("Gagal upload notulen.");
    }
  };
  

  const openNotulenModal = async (item: Kegiatan) => {
    setSelectedKegiatan(item);
    setNotulenFile(null);
    try {
      const res = await fetch(`http://localhost:5000/notulen/kegiatan/${item.id}`);
      if (res.ok) {
        const data = await res.json();
        setExistingNotulen(data);
      } else {
        setExistingNotulen(null);
      }
    } catch (error) {
      console.error("Gagal memuat notulen:", error);
      setExistingNotulen(null);
    }
    setIsNotulenModalOpen(true);
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
                  onClick={() => openAbsensiModal(item)}
                  className="bg-green-500 text-white px-3 py-1 rounded"
                >
                  Absensi
                </button>

                <button
                    onClick={() => openNotulenModal(item)}
                    className="bg-purple-500 text-white px-3 py-1 rounded"
                  >
                    Upload Notulen
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
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center">
          <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">
              Absensi - {selectedKegiatan.judul}
            </h2>

            {penghunis.map(p => (
              <div key={p.id} className="mb-4">
                <label className="block mb-1">{p.nama}</label>
                <div className="flex flex-row gap-4">
                  {["Hadir", "Sakit", "Izin", "Alpha"].map(status => (
                    <label key={status} className="inline-flex items-center">
                      <input
                        type="radio"
                        name={`status-${p.id}`}
                        value={status}
                        checked={absensiData[p.id!] === status}
                        onChange={() =>
                          setAbsensiData(prev => ({
                            ...prev,
                            [p.id!]: status,
                          }))
                        }
                        className="mr-1"
                      />
                      {status}
                    </label>
                  ))}
                </div>

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
                onClick={handleAbsensiSubmit}
                className="bg-green-600 text-white px-4 py-2 rounded"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {isNotulenModalOpen && selectedKegiatan && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center">
          <div className="w-full max-w-md bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">
              Upload Notulen - {selectedKegiatan.judul}
            </h2>
            {existingNotulen && (
              <div className="mb-4 text-sm text-gray-600">
                File saat ini:{" "}
                <a
                  href={`http://localhost:5000/uploads/notulen/${existingNotulen.file}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  {existingNotulen.file}
                </a>
              </div>
            )}


            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={e => setNotulenFile(e.target.files?.[0] || null)}
              className="w-full mb-4 p-2 border rounded"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsNotulenModalOpen(false)}
                className="bg-gray-300 px-4 py-2 rounded"
              >
                Batal
              </button>
              <button
                onClick={handleNotulenUpload}
                className="bg-purple-600 text-white px-4 py-2 rounded"
              >
                Upload
              </button>
            </div>
          </div>
        </div>
      )}




    </div>
  );
};




export default KegiatanCRUD;
