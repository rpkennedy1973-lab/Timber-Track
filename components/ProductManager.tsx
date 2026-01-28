
import React, { useState } from 'react';
import { ProductType } from '../types';

interface ProductManagerProps {
  products: ProductType[];
  setProducts: React.Dispatch<React.SetStateAction<ProductType[]>>;
}

const ProductManager: React.FC<ProductManagerProps> = ({ products, setProducts }) => {
  const [newProdName, setNewProdName] = useState('');

  const addProduct = () => {
    if (!newProdName.trim()) return;
    const newProd: ProductType = {
      id: Date.now().toString(),
      name: newProdName,
      unit: 'tonnes',
    };
    setProducts([...products, newProd]);
    setNewProdName('');
  };

  const removeProduct = (id: string) => {
    if (confirm('Are you sure you want to remove this product type? It will be removed from all future forest pricing options.')) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  const updateProduct = (id: string, updates: Partial<ProductType>) => {
    setProducts(products.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fadeIn font-outfit">
      <header>
        <h2 className="text-3xl font-bold text-slate-800">Global Product Catalog</h2>
        <p className="text-slate-500 font-medium">Define the list of timber products available for all sites.</p>
      </header>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Add New Master Product</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              className="w-full px-4 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-amber-500 font-medium"
              placeholder="Product Name (e.g. Sitka Spruce Sawlog)"
              value={newProdName}
              onChange={e => setNewProdName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addProduct()}
            />
          </div>
          <button
            onClick={addProduct}
            className="bg-amber-600 text-white px-8 py-2.5 rounded-xl font-bold hover:bg-amber-700 transition-all shadow-md shadow-amber-900/10"
          >
            Add to Catalog
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100 font-bold text-slate-500 text-xs uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4">Product Name</th>
              <th className="px-6 py-4">Standard Unit</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map(product => (
              <tr key={product.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <input
                    className="w-full bg-transparent border-none focus:ring-2 focus:ring-amber-500 rounded px-2 py-1 font-bold text-slate-800"
                    value={product.name}
                    onChange={e => updateProduct(product.id, { name: e.target.value })}
                  />
                </td>
                <td className="px-6 py-4">
                   <select 
                     className="bg-transparent text-slate-600 font-medium outline-none"
                     value={product.unit}
                     onChange={e => updateProduct(product.id, { unit: e.target.value })}
                   >
                     <option value="tonnes">Tonnes</option>
                     <option value="m3">m³</option>
                     <option value="units">Units</option>
                   </select>
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => removeProduct(product.id)}
                    className="text-slate-300 hover:text-red-500 p-2 transition-colors"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-12 text-center text-slate-400 italic">No products defined in catalog.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductManager;
