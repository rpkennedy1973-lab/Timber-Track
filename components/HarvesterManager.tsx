import React, { useState } from 'react';
import { Harvester } from '../types';

interface HarvesterManagerProps {
  harvesters: Harvester[];
  onSave: (harvester: Harvester) => void;
  onDelete: (id: string) => void;
}

const HarvesterManager: React.FC<HarvesterManagerProps> = ({ harvesters, onSave, onDelete }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const emptyForm = {
    name: '',
    address: '',
    vatNumber: '',
  };

  const [formData, setFormData] = useState<Omit<Harvester, 'id'>>(emptyForm);

  const handleEdit = (h: Harvester) => {
    setEditingId(h.id);
    setFormData({
      name: h.name,
      address: h.address,
      vatNumber: h.vatNumber,
    });
    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddOrUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    const harvester: Harvester = {
      ...formData,
      id: editingId || Date.now().toString(),
    };
    onSave(harvester);
    setFormData(emptyForm);
    setIsAdding(false);
    setEditingId(null);
  };

  return (
    <div className="space-y-6 font-outfit">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Harvesters</h2>
          <p className="text-slate-500">Manage harvesting teams and contractor billing details</p>
        </div>
        {!isAdding && (
          <button
            onClick={() => {
              setEditingId(null);
              setFormData(emptyForm);
              setIsAdding(true);
            }}
            className="bg-green-700 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-green-800 transition-all shadow-md"
          >
            + Add New Contractor
          </button>
        )}
      </header>

      {isAdding && (
        <div className="bg-white p-8 rounded-2xl shadow-xl border-2 border-green-100 animate-slideDown">
          <form onSubmit={handleAddOrUpdate} className="space-y-6">
            <h3 className="text-xl font-bold text-slate-800 border-b pb-4">
              {editingId ? 'Edit Contractor Details' : 'Register New Contractor'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Company/Team Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-green-500 outline-none bg-slate-50"
                  placeholder="e.g. Skyline Logging Ltd"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">VAT Number</label>
                <input
                  type="text"
                  value={formData.vatNumber}
                  onChange={e => setFormData({...formData, vatNumber: e.target.value})}
                  className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-green-500 outline-none bg-slate-50"
                  placeholder="e.g. IE9876543B"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1">Billing / Legal Address</label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={e => setFormData({...formData, address: e.target.value})}
                  className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-green-500 outline-none bg-slate-50"
                  placeholder="Full business address for invoicing"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <button 
                type="button" 
                onClick={() => {
                  setIsAdding(false);
                  setEditingId(null);
                  setFormData(emptyForm);
                }} 
                className="px-8 py-2.5 text-slate-600 font-bold hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="bg-green-700 text-white px-10 py-2.5 rounded-xl font-bold shadow-lg"
              >
                {editingId ? 'Save Changes' : 'Add Contractor'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {harvesters.map(h => (
          <div key={h.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between transition-all hover:shadow-md">
            <div>
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-slate-800 leading-tight">{h.name}</h3>
                <span className="text-[10px] bg-blue-50 text-blue-600 px-2.5 py-1 rounded-lg font-black uppercase tracking-tighter">Contractor</span>
              </div>
              {h.vatNumber && (
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">VAT REG: {h.vatNumber}</p>
              )}
              <p className="text-sm text-slate-500 font-medium">{h.address}</p>
            </div>
            <div className="mt-8 flex justify-between items-center pt-6 border-t border-slate-50">
               <button 
                onClick={() => handleEdit(h)}
                className="text-blue-600 text-sm font-bold flex items-center gap-1.5 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors"
              >
                ✏️ Edit Details
              </button>
              
              {deleteConfirmId === h.id ? (
                <div className="flex gap-2 animate-fadeIn">
                   <button 
                     onClick={() => {
                       onDelete(h.id);
                       setDeleteConfirmId(null);
                     }}
                     className="bg-red-600 text-white px-3 py-1.5 rounded-lg font-bold text-xs shadow-lg"
                   >
                     YES, DELETE
                   </button>
                   <button 
                     onClick={() => setDeleteConfirmId(null)}
                     className="bg-slate-200 text-slate-600 px-3 py-1.5 rounded-lg font-bold text-xs"
                   >
                     NO
                   </button>
                </div>
              ) : (
                <button 
                  onClick={() => setDeleteConfirmId(h.id)}
                  className="text-slate-300 hover:text-red-600 p-2 rounded-lg transition-all"
                  title="Remove Contractor"
                >
                  🗑️
                </button>
              )}
            </div>
          </div>
        ))}
        {harvesters.length === 0 && !isAdding && (
          <div className="col-span-full py-24 bg-white rounded-3xl border-4 border-dashed border-slate-100 flex flex-col items-center justify-center text-slate-400">
            <span className="text-7xl mb-4 opacity-40">🚜</span>
            <p className="text-xl font-bold">No harvest contractors registered.</p>
            <p className="text-sm">Add your team details to enable cost tracking.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HarvesterManager;