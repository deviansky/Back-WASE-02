import React, { useEffect, useState } from 'react';
import { fetchProducts, Product } from '../api/api';

const ProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getProducts = async () => {
      try {
        setLoading(true);
        const data = await fetchProducts();
        setProducts(data);
        setError(null);
      } catch (err) {
        setError('Gagal mengambil data produk');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    getProducts();
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
  
  if (error) return (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
      <strong className="font-bold">Error!</strong>
      <span className="block sm:inline"> {error}</span>
    </div>
  );

  return (
    <div className="text-left">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Daftar Produk</h2>
      {products.length === 0 ? (
        <p className="text-gray-500 text-center py-8">Tidak ada produk yang ditemukan</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <div className="p-5">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{product.name}</h3>
                <p className="text-red-600 font-bold text-lg mb-3">
                  Rp {product.price.toLocaleString('id-ID')}
                </p>
                <p className="text-gray-600 mb-4">{product.description}</p>
                <div className="pt-3 border-t border-gray-200">
                  <span className="font-medium text-gray-700">Kategori:</span>{' '}
                  <span className="text-gray-600">{product.categories}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductList;