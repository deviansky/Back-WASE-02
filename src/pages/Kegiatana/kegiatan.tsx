import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { useState, useEffect } from 'react';

export default function Kegiatan() {
  const [items, setItems] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [isFormValid, setIsFormValid] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form validation
  useEffect(() => {
    setIsFormValid(title.trim() !== '' && description.trim() !== '');
  }, [title, description]);

  // Modal functions
  const openModal = (item = null) => {
    if (item) {
      // Edit mode
      setEditingId(item.id);
      setTitle(item.title);
      setDescription(item.description);
    } else {
      // Add new mode
      setEditingId(null);
      setTitle('');
      setDescription('');
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setTitle('');
    setDescription('');
  };

  // CRUD functions
  const handleCreate = (e) => {
    e.preventDefault();
    
    if (!isFormValid) return;
    
    const newItem = {
      id: Date.now(),
      title,
      description,
      hasNotulen: false,
      hasAbsen: false
    };
    
    setItems([...items, newItem]);
    closeModal();
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    
    if (!isFormValid || editingId === null) return;
    
    setItems(items.map(item => 
      item.id === editingId ? { ...item, title, description } : item
    ));
    
    closeModal();
  };

  const handleDelete = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  // Toggle Notulen and Absen status
  const toggleNotulen = (id) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, hasNotulen: !item.hasNotulen } : item
    ));
  };

  const toggleAbsen = (id) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, hasAbsen: !item.hasAbsen } : item
    ));
  };

  // Form modal component
  const FormModal = () => {
    if (!isModalOpen) return null;

    return (
      <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center">
        <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full m-4 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              {editingId ? 'Edit Item' : 'Tambah Item Baru'}
            </h2>
            <button 
              onClick={closeModal}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <form onSubmit={editingId ? handleUpdate : handleCreate}>
            <div className="mb-4">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Judul
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Masukkan judul..."
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Deskripsi
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Masukkan deskripsi..."
                rows="3"
              />
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 bg-gray-300 text-gray-700 dark:bg-gray-600 dark:text-gray-200 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
              >
                Batal
              </button>
              
              <button
                type="submit"
                disabled={!isFormValid}
                className={`px-4 py-2 rounded-md transition-colors ${
                  isFormValid
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : 'bg-blue-300 text-gray-100 cursor-not-allowed'
                }`}
              >
                {editingId ? 'Simpan Perubahan' : 'Tambah Item'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div>
      <PageMeta
        title="Kegiatan | TailAdmin - Next.js Admin Dashboard Template"
        description="This is Kegiatan page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <PageBreadcrumb pageTitle="Kegiatan" />
      
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <div className="container mx-auto p-4 max-w-4xl">
          
          {/* Header with add button */}
          <div className="flex justify-end items-center mb-6">
            <button
              onClick={() => openModal()}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-green-600 flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Tambah Item
            </button>
          </div>
          
          {/* Item List */}
          <div className="bg-white shadow-md rounded-lg p-6">
            {items.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Belum ada item. Silakan tambahkan item baru.</p>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <h3 className="text-lg font-medium">{item.title}</h3>
                    <p className="text-gray-600 mt-1">{item.description}</p>
                    
                    {/* Notulen and Absen buttons */}
                    <div className="flex mt-4 space-x-2">
                      <button
                        onClick={() => toggleNotulen(item.id)}
                        className={`px-3 py-1 rounded text-white ${
                          item.hasNotulen ? 'bg-green-500 hover:bg-green-600' : 'bg-green-400 hover:bg-green-500'
                        }`}
                      >
                        Notulen
                      </button>
                      <button
                        onClick={() => toggleAbsen(item.id)}
                        className={`px-3 py-1 rounded text-white ${
                          item.hasAbsen ? 'bg-blue-500 hover:bg-blue-600' : 'bg-blue-400 hover:bg-blue-500'
                        }`}
                      >
                        Absen
                      </button>
                    </div>
                    
                    {/* Edit and Delete buttons */}
                    <div className="flex justify-end mt-4 gap-2">
                      <button
                        onClick={() => openModal(item)}
                        className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Modal Form */}
          <FormModal />
        </div>
      </div>
    </div>
  );
}