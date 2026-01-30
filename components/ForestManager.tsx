
import React, { useState } from 'react';
import { Forest, ProductType, ForestProductCost } from '../types';

interface ForestManagerProps {
  forests: Forest[];
  onSave: (forest: Forest) => void;
  onDelete: (id: string) => void;
  costs: ForestProductCost[];
  setCosts: React.Dispatch<React.SetStateAction<ForestProductCost[]>>;
  products: ProductType[];
}

const ForestManager: React.FC<ForestManagerProps> = ({ forests, onSave, onDelete, costs, setCosts, products }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const emptyForm = {
    name: '',
    location: '',
    area: 0,
    description: '',
    ownerName: '',
    ownerAddress: '',
    ownerEmail: '',
    ownerIban: '',
    fellingLicenseNumber: '',
  };

  const [formData, setFormData] = useState<Omit<Forest, 'id'>>(emptyForm);

  const handleEdit = (forest: Forest) => {
    setEditingId(forest.id);
    setFormData({
      name: forest.name,
      location: forest.location,
      area: forest.area,
      description: forest.description,
      ownerName: forest.ownerName,
      ownerAddress: forest.ownerAddress,
      ownerEmail: forest.ownerEmail || '',
      ownerIban: forest.ownerIban || '',
      fellingLicenseNumber: forest.fellingLicenseNumber || '',
    });
    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddOrUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    const forest: Forest = {
      ...formData,
      id: editingId || Date.now().toString(),
    };
    onSave(forest);
    setFormData(emptyForm);
    setIsAdding(false);
    setEditingId(null);
  };

  const updateCost = (forestId: string, productTypeId: string, updates: Partial<ForestProductCost>) => {
    const existingIndex = costs.findIndex(c => c.forestId === forestId && c.productTypeId === productTypeId);
    if (existingIndex > -1) {
      const newCosts = [...costs];
      newCosts[existingIndex] = { ...newCosts[existingIndex], ...updates };
      setCosts(newCosts);
    } else {
      setCosts([...costs, { 
        forestId, 
        productTypeId, 
        baseRate: 0, 
        harvestingRate: 0, 
        transportRate: 0, 
        ...updates 
      }]);
    }
  };

  const getCost = (forestId: string, productTypeId: string) => {
    return costs.find(c => c.forestId === forestId && c.productTypeId === productTypeId) || {
      baseRate: 0,
      harvestingRate: 0,
      transportRate: 0
    };
  };

  return (
    <div className="space-y-6 font-outfit">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Forest Sites</h2>
          <p className="text-slate-500">Manage site locations and specific operational costs</p>
        </div>
        {!isAdding && (
          <button
            onClick={() => {
              setEditingId(null);
              setFormData(emptyForm);
              setIsAdding(true);
            }}
            className="bg-green-700 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-green-800 transition-all shadow-md shadow-green-900/10"
          >
            + Add New Forest
          </button>
        )}
      </header>

      {isAdding && (
        <div className="bg-white p-8 rounded-2xl shadow-xl border-2 border-green-100 animate-slideDown">
          <form onSubmit={handleAddOrUpdate} className="space-y-6">
            <h3 className="text-xl font-bold text-slate-800 border-b pb-4">
              {editingId ? 'Edit Forest Site' : 'Create New Forest Site'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Site Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-green-500 outline-none bg-slate-50"
                  placeholder="e.g. Blackwood Estate"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Location</label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={e => setFormData({...formData, location: e.target.value})}
                  className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-green-500 outline-none bg-slate-50"
                  placeholder="e.g. Highland Valley"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Area (Hectares)</label>
                <input
                  type="number"
                  required
                  value={formData.area}
                  onChange={e => setFormData({...formData, area: parseFloat(e.target.value) || 0})}
                  className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-green-500 outline-none bg-slate-50"
                />
              </div>
            </div>
            
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
               <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 border-b pb-2">Owner Identity & Regulatory Details</h4>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Owner / Entity Name</label>
                  <input
                    type="text"
                    required
                    value={formData.ownerName}
                    onChange={e => setFormData({...formData, ownerName: e.target.value})}
                    className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-green-500 outline-none bg-white shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Felling License No.</label>
                  <input
                    type="text"
                    value={formData.fellingLicenseNumber}
                    onChange={e => setFormData({...formData, fellingLicenseNumber: e.target.value})}
                    className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-green-500 outline-none bg-white shadow-sm"
                    placeholder="e.g. TFL-123456"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Owner Email</label>
                  <input
                    type="email"
                    value={formData.ownerEmail}
                    onChange={e => setFormData({...formData, ownerEmail: e.target.value})}
                    className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-green-500 outline-none bg-white shadow-sm"
                    placeholder="owner@example.com"
                  />
                </div>
                <div className="md:col-span-1">
                   <label className="block text-sm font-semibold text-slate-700 mb-1">Owner IBAN (Bank Details)</label>
                   <input
                     type="text"
                     value={formData.ownerIban}
                     onChange={e => setFormData({...formData, ownerIban: e.target.value})}
                     className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-green-500 outline-none bg-white shadow-sm"
                     placeholder="IE00 XXXX ..."
                   />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Owner Address</label>
                  <input
                    type="text"
                    required
                    value={formData.ownerAddress}
                    onChange={e => setFormData({...formData, ownerAddress: e.target.value})}
                    className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-green-500 outline-none bg-white shadow-sm"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">General Notes</label>
              <textarea
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-green-500 outline-none bg-slate-50"
                rows={2}
                placeholder="Access codes, entrance locations, etc."
              ></textarea>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <button 
                type="button" 
                onClick={() => {
                  setIsAdding(false);
                  setEditingId(null);
                  setFormData(emptyForm);
                }} 
                className="px-8 py-2.5 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="bg-green-700 text-white px-10 py-2.5 rounded-xl font-bold shadow-lg shadow-green-900/10 hover:bg-green-800"
              >
                {editingId ? 'Save Forest Updates' : 'Add Forest Site'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-8">
        {forests.map(forest => (
          <div key={forest.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col transition-all hover:shadow-md">
            <div className="p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                    {forest.name}
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full uppercase tracking-tighter">Active Site</span>
                  </h3>
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{forest.location} • {forest.area} ha</p>
                  <div className="mt-2 flex flex-wrap gap-4">
                     {forest.fellingLicenseNumber && <span className="text-xs text-blue-600 font-bold">📜 Lic: {forest.fellingLicenseNumber}</span>}
                     {forest.ownerEmail && <span className="text-xs text-slate-500 font-medium">📧 {forest.ownerEmail}</span>}
                     {forest.ownerIban && <span className="text-xs text-slate-500 font-medium">🏦 IBAN: {forest.ownerIban.slice(0, 4)}...</span>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleEdit(forest)}
                    className="bg-white text-blue-600 p-3 rounded-xl shadow-sm border border-slate-200 hover:bg-blue-50 transition-all font-bold"
                    title="Edit Site"
                  >
                    ✏️ Edit
                  </button>
                  {deleteConfirmId === forest.id ? (
                    <div className="flex gap-2 animate-fadeIn">
                       <button 
                         onClick={() => {
                           onDelete(forest.id);
                           setDeleteConfirmId(null);
                         }}
                         className="bg-red-600 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-lg"
                       >
                         CONFIRM DELETE?
                       </button>
                       <button 
                         onClick={() => setDeleteConfirmId(null)}
                         className="bg-slate-200 text-slate-600 px-4 py-2 rounded-xl font-bold text-sm"
                       >
                         CANCEL
                       </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setDeleteConfirmId(forest.id)}
                      className="bg-white text-red-300 p-3 rounded-xl shadow-sm border border-slate-200 hover:text-red-600 hover:bg-red-50 transition-all"
                      title="Delete Site"
                    >
                      🗑️
                    </button>
                  )}
                </div>
            </div>
            
            <div className="p-6 overflow-x-auto">
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-2">
                <span className="w-8 h-px bg-slate-200"></span> Product-Specific Operational Costs (€/t)
              </h4>
              <table className="w-full min-w-[600px] text-left">
                <thead>
                  <tr className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b">
                    <th className="pb-3 px-2">Master Product Name</th>
                    <th className="pb-3 px-2 text-center">Base Cost (€/t)</th>
                    <th className="pb-3 px-2 text-center">Harvest Rate (€/t)</th>
                    <th className="pb-3 px-2 text-center">Transport Rate (€/t)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {products.map(prod => {
                    const cost = getCost(forest.id, prod.id);
                    return (
                      <tr key={prod.id} className="group hover:bg-slate-50/50">
                        <td className="py-4 px-2">
                          <span className="text-sm font-bold text-slate-700">{prod.name}</span>
                        </td>
                        <td className="py-4 px-2">
                          <div className="relative mx-auto max-w-[110px]">
                            <span className="absolute left-2.5 top-2.5 text-slate-300 text-xs">€</span>
                            <input
                              type="number"
                              className="w-full pl-7 pr-3 py-2 border rounded-xl focus:ring-2 focus:ring-green-500 text-right font-bold text-sm bg-slate-50 border-transparent hover:border-slate-200 transition-all"
                              value={cost.baseRate}
                              onChange={e => updateCost(forest.id, prod.id, { baseRate: parseFloat(e.target.value) || 0 })}
                            />
                          </div>
                        </td>
                        <td className="py-4 px-2">
                          <div className="relative mx-auto max-w-[110px]">
                            <span className="absolute left-2.5 top-2.5 text-slate-300 text-xs">€</span>
                            <input
                              type="number"
                              className="w-full pl-7 pr-3 py-2 border rounded-xl focus:ring-2 focus:ring-green-500 text-right font-bold text-sm bg-slate-50 border-transparent hover:border-slate-200 transition-all"
                              value={cost.harvestingRate}
                              onChange={e => updateCost(forest.id, prod.id, { harvestingRate: parseFloat(e.target.value) || 0 })}
                            />
                          </div>
                        </td>
                        <td className="py-4 px-2">
                          <div className="relative mx-auto max-w-[110px]">
                            <span className="absolute left-2.5 top-2.5 text-slate-300 text-xs">€</span>
                            <input
                              type="number"
                              className="w-full pl-7 pr-3 py-2 border rounded-xl focus:ring-2 focus:ring-green-500 text-right font-bold text-sm bg-slate-50 border-transparent hover:border-slate-200 transition-all"
                              value={cost.transportRate}
                              onChange={e => updateCost(forest.id, prod.id, { transportRate: parseFloat(e.target.value) || 0 })}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {products.length === 0 && (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <p className="text-slate-400 font-bold italic">No products in catalog. Add products in "Inventory Items" first.</p>
                </div>
              )}
            </div>
          </div>
        ))}
        {forests.length === 0 && !isAdding && (
          <div className="py-24 bg-white rounded-3xl border-4 border-dashed border-slate-100 flex flex-col items-center justify-center text-slate-400">
             <span className="text-7xl mb-4">🌲</span>
             <p className="text-xl font-bold">No forest sites registered yet.</p>
             <p className="text-sm">Click the button above to start your first estate profile.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForestManager;
