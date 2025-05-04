// Frontend/PenghuniForm

import React, { useState, useEffect } from 'react';
import { Penghuni } from '../../api/api';

interface PenghuniFormProps {
  penghuni?: Penghuni;
  onSubmit: (penghuni: any) => void;
  onCancel: () => void;
}

const PenghuniForm: React.FC<PenghuniFormProps> = ({ penghuni, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    nama: '',
    prodi: '',
    angkatan: '',
    noHp: '',
    asalDaerah: ''
  });

  const [errors, setErrors] = useState({
    nama: '',
    prodi: '',
    angkatan: '',
    noHp: '',
    asalDaerah: ''
  });

  useEffect(() => {
    if (penghuni) {
      setFormData({
        nama: penghuni.nama || '',
        prodi: penghuni.prodi || '',
        angkatan: penghuni.angkatan?.toString() || '',
        noHp: penghuni.noHp || '',
        asalDaerah: penghuni.asalDaerah || ''
      });
    }
  }, [penghuni]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    // Clear error when user starts typing
    setErrors({
      ...errors,
      [name]: ''
    });
  };

  const validateForm = () => {
    const newErrors = {
      nama: '',
      prodi: '',
      angkatan: '',
      noHp: '',
      asalDaerah: ''
    };
    let isValid = true;

    if (!formData.nama.trim()) {
      newErrors.nama = 'Nama tidak boleh kosong';
      isValid = false;
    }

    if (!formData.prodi.trim()) {
      newErrors.prodi = 'Program studi tidak boleh kosong';
      isValid = false;
    }

    if (!formData.angkatan.trim()) {
      newErrors.angkatan = 'Angkatan tidak boleh kosong';
      isValid = false;
    } else if (isNaN(Number(formData.angkatan)) || Number(formData.angkatan) < 1) {
      newErrors.angkatan = 'Angkatan harus berupa angka positif';
      isValid = false;
    }

    if (!formData.noHp.trim()) {
      newErrors.noHp = 'Nomor HP tidak boleh kosong';
      isValid = false;
    }
    
    if (!formData.asalDaerah.trim()) {
      newErrors.asalDaerah = 'Asal daerah tidak boleh kosong';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const submittedData = {
      ...formData,
      angkatan: parseInt(formData.angkatan, 10)
    };

    if (penghuni) {
      onSubmit({ id: penghuni.id, ...submittedData });
    } else {
      onSubmit(submittedData as Omit<Penghuni, 'id'>);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="nama">
          Nama
        </label>
        <input
          type="text"
          id="nama"
          name="nama"
          value={formData.nama}
          onChange={handleChange}
          className={`shadow appearance-none border ${
            errors.nama ? 'border-red-500' : 'border-gray-300'
          } rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
        />
        {errors.nama && <p className="text-red-500 text-xs italic mt-1">{errors.nama}</p>}
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="prodi">
          Program Studi
        </label>
        <input
          type="text"
          id="prodi"
          name="prodi"
          value={formData.prodi}
          onChange={handleChange}
          className={`shadow appearance-none border ${
            errors.prodi ? 'border-red-500' : 'border-gray-300'
          } rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
        />
        {errors.prodi && <p className="text-red-500 text-xs italic mt-1">{errors.prodi}</p>}
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="angkatan">
          Angkatan
        </label>
        <input
          type="number"
          id="angkatan"
          name="angkatan"
          value={formData.angkatan}
          onChange={handleChange}
          className={`shadow appearance-none border ${
            errors.angkatan ? 'border-red-500' : 'border-gray-300'
          } rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
        />
        {errors.angkatan && <p className="text-red-500 text-xs italic mt-1">{errors.angkatan}</p>}
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="noHp">
          Nomor HP
        </label>
        <input
          type="text"
          id="noHp"
          name="noHp"
          value={formData.noHp}
          onChange={handleChange}
          className={`shadow appearance-none border ${
            errors.noHp ? 'border-red-500' : 'border-gray-300'
          } rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
        />
        {errors.noHp && <p className="text-red-500 text-xs italic mt-1">{errors.noHp}</p>}
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="asalDaerah">
          Asal Daerah
        </label>
        <input
          type="text"
          id="asalDaerah"
          name="asalDaerah"
          value={formData.asalDaerah}
          onChange={handleChange}
          className={`shadow appearance-none border ${
            errors.asalDaerah ? 'border-red-500' : 'border-gray-300'
          } rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
        />
        {errors.asalDaerah && <p className="text-red-500 text-xs italic mt-1">{errors.asalDaerah}</p>}
      </div>

      <div className="flex justify-end space-x-2 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
        >
          Batal
        </button>
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Simpan
        </button>
      </div>
    </form>
  );
};

export default PenghuniForm;