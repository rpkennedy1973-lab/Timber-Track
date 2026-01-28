
import React, { useState } from 'react';
import { PrivateHaulier, HaulierInvoice, CompanyDetails, ProductType } from '../types';
import HaulierInvoiceLog from './HaulierInvoiceLog';

interface HaulierManagerProps {
  hauliers: PrivateHaulier[];
  onSave: (haulier: PrivateHaulier) => void;
  onDelete: (id: string) => void;
  invoices: HaulierInvoice[];
  onSaveInvoice: (invoice: HaulierInvoice) => void;
  onDeleteInvoice: (id: string) => void;
  companyDetails: CompanyDetails;
  products: ProductType[];
}

const HaulierManager: React.FC<HaulierManagerProps> = ({ 
  hauliers, 
  onSave, 
  onDelete, 
  invoices, 
  onSaveInvoice, 
  onDeleteInvoice,
  companyDetails,
  products
}) => {
  const [activeView, setActiveView] = useState<'hauliers' | 'invoices'>('invoices');
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const emptyForm = {
    name: '',
    address: '',
    vatNumber: '',
    email: '',
    sortCode: '',
    accountNumber: '',
    iban: '',
  };

  const [formData, setFormData] = useState<Omit<PrivateHaulier, 'id'>>(emptyForm);

  const handleEdit = (h: PrivateHaulier) => {
    setEditingId(h.id);
    setFormData({
      name: h.name,
      address: h.address,
      vatNumber: h.vatNumber,
      email: h.email || '',
      sortCode: h.sortCode || '',
      accountNumber: h.accountNumber || '',
      iban: h.iban || '',
    });
    setIsAdding(true);
  };

  const handleAddOrUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    const haulier: PrivateHaulier = {
      ...formData,
      id: editingId || Date.now().toString(),
    };
    onSave(haulier);
    setFormData(emptyForm);
    setIsAdding(false);
    setEditingId(null);
  };

  return (
    <div className="space-y-6 font-outfit">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Private Hauliers</h2>
          <p className="text-slate-500 font-medium">Manage transport contractors and custom self-bill payments</p>
        </div>
        <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-200">
           <button 
             onClick={() => setActiveView('invoices')}
             className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeView === 'invoices' ? 'bg-green-700 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
           >
             Haulage Invoices
           </button>
           <button 
             onClick={() => setActiveView('hauliers')}
             className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeView === 'hauliers' ? 'bg-green-700 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
           >
             Registered Contractors
           </button>
        </div>
      </header>

      {activeView === 'hauliers' ? (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex justify-end">
            {!isAdding && (
              <button
                onClick={() => {
                  setEditingId(null);
                  setFormData(emptyForm);
                  setIsAdding(true);
                }}
                className="bg-green-700 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-green-800 transition-all shadow-md"
              >
                + Register Haulier
              </button>
            )}
          </div>

          {isAdding && (
            <div className="bg-white p-8 rounded-2xl shadow-xl border-2 border-green-100 animate-slideDown max-w-4xl mx-auto">
              <form onSubmit={handleAddOrUpdate} className="space-y-6">
                <h3 className="text-xl font-bold text-slate-800 border-b pb-4">
                  {editingId ? 'Edit Haulier Details' : 'Register New Haulier'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Haulier Business Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-green-500 outline-none bg-slate-50"
                      placeholder="e.g. O'Connor Transport"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-green-500 outline-none bg-slate-50"
                      placeholder="e.g. transport@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">VAT Number</label>
                    <input
                      type="text"
                      value={formData.vatNumber}
                      onChange={e => setFormData({...formData, vatNumber: e.target.value})}
                      className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-green-500 outline-none bg-slate-50"
                      placeholder="e.g. IE1234567A"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Billing / Registered Address</label>
                    <input
                      type="text"
                      required
                      value={formData.address}
                      onChange={e => setFormData({...formData, address: e.target.value})}
                      className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-green-500 outline-none bg-slate-50"
                      placeholder="Full street address"
                    />
                  </div>
                </div>

                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                  <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest border-b pb-2">Bank Details (For Payments)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase">Sort Code</label>
                      <input
                        type="text"
                        value={formData.sortCode}
                        onChange={e => setFormData({...formData, sortCode: e.target.value})}
                        className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-green-500 bg-white"
                        placeholder="00-00-00"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase">Account Number</label>
                      <input
                        type="text"
                        value={formData.accountNumber}
                        onChange={e => setFormData({...formData, accountNumber: e.target.value})}
                        className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-green-500 bg-white"
                        placeholder="12345678"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase">IBAN</label>
                      <input
                        type="text"
                        value={formData.iban}
                        onChange={e => setFormData({...formData, iban: e.target.value})}
                        className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-green-500 bg-white"
                        placeholder="IE00 XXXX ..."
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button type="button" onClick={() => {setIsAdding(false); setEditingId(null);}} className="px-8 py-2.5 text-slate-600 font-bold">Cancel</button>
                  <button type="submit" className="bg-green-700 text-white px-10 py-2.5 rounded-xl font-bold">Save Haulier</button>
                </div>
              </form>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hauliers.map(h => (
              <div key={h.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between transition-all hover:shadow-md">
                <div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">{h.name}</h3>
                  <p className="text-sm text-slate-500 font-medium">{h.address}</p>
                  <div className="mt-4 space-y-1">
                    {h.email && <p className="text-xs text-green-700 font-bold mb-1">📧 {h.email}</p>}
                    {h.vatNumber && <p className="text-[10px] text-slate-400 font-black uppercase">VAT: {h.vatNumber}</p>}
                    {h.iban && <p className="text-[10px] text-slate-400 font-black uppercase">IBAN: {h.iban.slice(0, 4)}...{h.iban.slice(-4)}</p>}
                  </div>
                </div>
                <div className="mt-8 flex justify-between items-center pt-6 border-t border-slate-50">
                   <button onClick={() => handleEdit(h)} className="text-blue-600 text-sm font-bold hover:bg-blue-50 px-3 py-1.5 rounded-lg">✏️ Edit</button>
                   {deleteConfirmId === h.id ? (
                      <div className="flex gap-1">
                        <button onClick={() => {onDelete(h.id); setDeleteConfirmId(null);}} className="bg-red-600 text-white px-2 py-1 rounded text-[10px] font-bold">YES</button>
                        <button onClick={() => setDeleteConfirmId(null)} className="bg-slate-200 text-slate-600 px-2 py-1 rounded text-[10px] font-bold">NO</button>
                      </div>
                   ) : (
                      <button onClick={() => setDeleteConfirmId(h.id)} className="text-slate-300 hover:text-red-600 p-2 rounded-lg">🗑️</button>
                   )}
                </div>
              </div>
            ))}
            {hauliers.length === 0 && !isAdding && (
              <div className="col-span-full py-20 bg-white rounded-3xl border border-dashed border-slate-200 text-center text-slate-400">
                <p className="text-4xl mb-2">🚛</p>
                <p className="font-bold">No hauliers registered.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <HaulierInvoiceLog 
          invoices={invoices} 
          hauliers={hauliers} 
          onSave={onSaveInvoice} 
          onDelete={onDeleteInvoice}
          companyDetails={companyDetails}
          products={products}
        />
      )}
    </div>
  );
};

export default HaulierManager;
