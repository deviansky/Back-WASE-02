import React from 'react';
import { Penghuni } from '../../api/api';

interface DeleteConfirmationProps {
  penghuni: Penghuni;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteConfirmation: React.FC<DeleteConfirmationProps> = ({
  penghuni,
  onConfirm,
  onCancel
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Konfirmasi Hapus</h2>
      <p className="mb-6 text-gray-600">
        Apakah Anda yakin ingin menghapus penghuni <strong>{penghuni.nama}</strong>? 
        Tindakan ini tidak dapat dibatalkan.
      </p>
      <div className="flex justify-end space-x-2">
        <button
          onClick={onCancel}
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
        >
          Batal
        </button>
        <button
          onClick={onConfirm}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
        >
          Hapus
        </button>
      </div>
    </div>
  );
};

export default DeleteConfirmation;