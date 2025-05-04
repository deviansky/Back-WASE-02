// Frontend/PenghuniCRUD.tsx
import React, { useState, useEffect } from 'react';
import { 
  fetchPenghuni, 
  addPenghuni, 
  updatePenghuni, 
  deletePenghuni, 
  Penghuni 
} from '../api/api';
import PenghuniTable from '../components/Penghunis/PenghuniTable';
import PenghuniForm from '../components/Penghunis/PenghuniForm';
import DeleteConfirmation from '../components/Penghunis/DeleteConfirmation';

const PenghuniCRUD: React.FC = () => {
  const [penghunis, setPenghunis] = useState<Penghuni[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [currentPenghuni, setCurrentPenghuni] = useState<Penghuni | null>(null);

  // Fetch data
  const loadPenghunis = async () => {
    try {
      setLoading(true);
      const data = await fetchPenghuni();
      setPenghunis(data);
      setError(null);
    } catch (err) {
      setError('Gagal memuat data penghuni');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPenghunis();
  }, []);

  // CRUD operations
  // Handle tambah penghuni
  const handleAddPenghuni = async (data: Omit<Penghuni, 'id'>) => {
    try {
      await addPenghuni(data);
      await loadPenghunis(); // Refresh data setelah menambah
      setIsAddModalOpen(false);
      // Tambahkan notifikasi sukses jika diperlukan
    } catch (error: any) {
      setError(error.message || 'Terjadi kesalahan saat menambahkan penghuni');
      console.error('Error adding penghuni:', error);
    }
  };

  const handleUpdatePenghuni = async (updatedPenghuni: Penghuni) => {
    try {
      await updatePenghuni(updatedPenghuni);
      await loadPenghunis(); // Reload data after successful update
      setIsEditModalOpen(false);
    } catch (err: any) {
      console.error('Error updating penghuni:', err);
      setError(err.message || 'Gagal mengupdate penghuni');
    }
  };

  const handleDeletePenghuni = async (id: number) => {
    try {
      await deletePenghuni(id);
      await loadPenghunis(); // Reload data after successful deletion
      setIsDeleteModalOpen(false);
    } catch (err: any) {
      console.error('Error deleting penghuni:', err);
      setError(err.message || 'Gagal menghapus penghuni');
    }
  };

  // Modal handlers
  const openAddModal = () => {
    setCurrentPenghuni(null);
    setIsAddModalOpen(true);
  };

  const openEditModal = (penghuni: Penghuni) => {
    setCurrentPenghuni(penghuni);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (penghuni: Penghuni) => {
    setCurrentPenghuni(penghuni);
    setIsDeleteModalOpen(true);
  };

  return (
    <div className="container mx-auto px-4 py-8">
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 w-full">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white/90">Data Penghuni</h1>
        <p className="text-gray-500 text-xs sm:text-sm dark:text-gray-400">
          Mengelola informasi mahasiswa penghuni
        </p>
      </div>
      <button
        onClick={openAddModal}
        className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg transition-colors flex items-center space-x-1 sm:space-x-2 w-full sm:w-auto justify-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
        </svg>
        <span>Tambah Penghuni</span>
      </button>
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
        <PenghuniTable
          penghunis={penghunis}
          onEdit={openEditModal}
          onDelete={openDeleteModal}
        />
      )}

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
                Tambah Penghuni Baru
              </h2>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <PenghuniForm
              onSubmit={handleAddPenghuni}
              onCancel={() => setIsAddModalOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && currentPenghuni && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
                Edit Penghuni
              </h2>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <PenghuniForm
              penghuni={currentPenghuni}
              onSubmit={handleUpdatePenghuni}
              onCancel={() => setIsEditModalOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && currentPenghuni && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <DeleteConfirmation
            penghuni={currentPenghuni}
            onConfirm={() => handleDeletePenghuni(currentPenghuni.id!)}
            onCancel={() => setIsDeleteModalOpen(false)}
          />
        </div>
      )}
    </div>
  );
};

export default PenghuniCRUD;