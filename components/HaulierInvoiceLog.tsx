import React, { useState } from 'react';
import { HaulierInvoice, PrivateHaulier, CompanyDetails, ProductType, HaulierLoad } from '../types';
import HaulierInvoiceModal from './HaulierInvoiceModal';

interface HaulierInvoiceLogProps {
  invoices: HaulierInvoice[];
  hauliers: PrivateHaulier[];
  onSave: (invoice: HaulierInvoice) => void;
  onDelete: (id: string) => void;
  companyDetails: CompanyDetails;
  products: ProductType[];
}

const HaulierInvoiceLog: React.FC<HaulierInvoiceLogProps> = ({ invoices, hauliers, onSave, onDelete, companyDetails, products }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingInvoice, setViewingInvoice] = useState<HaulierInvoice | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const getNextInvoiceId = () => {
    if (invoices.length === 0) return "1000";
    const ids = invoices.map(inv => parseInt(inv.id)).filter(id => !isNaN(id));
    if (ids.length === 0) return "1000";
    return (Math.max(...ids) + 1).toString();
  };

  const getTodayStr = () => new Date().toISOString().split('T')[0];

  const createEmptyLoad = (): HaulierLoad => ({
    id: (Date.now() + Math.random()).toString(),
    productTypeId: products.length > 0 ? products[0].id : '',
    transactionNumber: '',
    date: getTodayStr(),
    quantity: 0,
    rate: 0,
  });

  const emptyForm: Omit<HaulierInvoice, 'id'> = {
    haulierId: hauliers.length > 0 ? hauliers[0].id : '',
    date: getTodayStr(),
    vatRate: 23,
    notes: '',
    loads: [createEmptyLoad()],
  };

  const [formData, setFormData] = useState<Omit<HaulierInvoice, 'id'>>(emptyForm);

  const formatCurrency = (val: number) => 
    val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleEdit = (inv: HaulierInvoice) => {
    setEditingId(inv.id);
    setFormData({
      haulierId: inv.haulierId,
      date: inv.date,
      vatRate: inv.vatRate,
      notes: inv.notes,
      loads: inv.loads,
    });
    setIsAdding(true);
  };

  const addLoad = () => {
    setFormData({
      ...formData,
      loads: [...formData.loads, createEmptyLoad()]
    });
  };

  const removeLoad = (id: string) => {
    if (formData.loads.length <= 1) return;
    setFormData({
      ...formData,
      loads: formData.loads.filter(l => l.id !== id)
    });
  };

  const updateLoad = (id: string, updates: Partial<HaulierLoad>) => {
    setFormData({
      ...formData,
      loads: formData.loads.map(l => l.id === id ? { ...l, ...updates } : l)
    });
  };

  const calculateInvoiceTotal = (loads: HaulierLoad[]) => {
    return loads.reduce((sum, load) => sum + (load.quantity * load.rate), 0);
  };

  const handleAddOrUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.haulierId) {
      alert("Please select a registered haulier.");
      return;
    }
    const invoice: HaulierInvoice = {
      ...formData,
      id: editingId || getNextInvoiceId(),
    };
    onSave(invoice);
    setFormData(emptyForm);
    setIsAdding(false);
    setEditingId(null);
  };

  return (
    <div className="space-y-6 animate-fadeIn font-outfit">
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
            + Create New Invoice
          </button>
        )}
      </div>

      {isAdding && (
        <div className="bg-white p-8 rounded-2xl shadow-xl border-2 border-green-100 animate-slideDown max-w-full mx-auto">
          <form onSubmit={handleAddOrUpdate} className="space-y-6">
            <div className="flex justify-between items-center border-b pb-4">
              <h3 className="text-xl font-bold text-slate-800">
                {editingId ? `Edit Invoice #${editingId}` : `New Self-Bill Invoice #${getNextInvoiceId()}`}
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Haulier (Contractor)</label>
                <select
                  required
                  className="w-full px-4 py-2.5 border rounded-xl outline-none bg-slate-50 font-bold"
                  value={formData.haulierId}
                  onChange={e => setFormData({...formData, haulierId: e.target.value})}
                >
                  <option value="">Select Haulier</option>
                  {hauliers.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Invoice Issued Date</label>
                <input
                  type="date"
                  required
                  className="w-full px-4 py-2.5 border rounded-xl outline-none"
                  value={formData.date}
                  onChange={e => setFormData({...formData, date: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">VAT Rate (%)</label>
                <input
                  type="number"
                  required
                  className="w-full px-4 py-2.5 border rounded-xl outline-none"
                  value={formData.vatRate}
                  onChange={e => setFormData({...formData, vatRate: parseFloat(e.target.value) || 0})}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest">Loads / Consignments</h4>
                <button 
                  type="button" 
                  onClick={addLoad}
                  className="text-green-700 text-xs font-bold hover:bg-green-50 px-3 py-1.5 rounded-lg border border-green-100"
                >
                  + Add Load Row
                </button>
              </div>

              <div className="space-y-3">
                {formData.loads.map((load) => (
                  <div key={load.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="md:col-span-3">
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Product</label>
                      <select
                        required
                        className="w-full px-2 py-2 border rounded-xl outline-none bg-white text-xs font-bold"
                        value={load.productTypeId}
                        onChange={e => updateLoad(load.id, { productTypeId: e.target.value })}
                      >
                        {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Docket No.</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border rounded-xl outline-none bg-white text-xs font-bold"
                        value={load.transactionNumber}
                        onChange={e => updateLoad(load.id, { transactionNumber: e.target.value })}
                        placeholder="e.g. 55678"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Docket Date</label>
                      <input
                        type="date"
                        required
                        className="w-full px-2 py-2 border rounded-xl outline-none bg-white text-xs font-bold"
                        value={load.date}
                        onChange={e => updateLoad(load.id, { date: e.target.value })}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Qty (t)</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        className="w-full px-3 py-2 border rounded-xl outline-none bg-white text-xs font-bold text-right"
                        value={load.quantity}
                        onChange={e => updateLoad(load.id, { quantity: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Rate (€)</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        className="w-full px-3 py-2 border rounded-xl outline-none bg-white text-xs font-bold text-right"
                        value={load.rate}
                        onChange={e => updateLoad(load.id, { rate: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="md:col-span-1 text-right">
                       <button 
                         type="button" 
                         onClick={() => removeLoad(load.id)}
                         className="text-red-300 hover:text-red-600 p-2"
                         disabled={formData.loads.length === 1}
                       >
                         ✕
                       </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center p-6 bg-slate-900 rounded-3xl text-white">
               <div>
                 <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Total Net Amount</p>
                 <h4 className="text-3xl font-black">€{formatCurrency(calculateInvoiceTotal(formData.loads))}</h4>
               </div>
               <div className="flex gap-3">
                <button type="button" onClick={() => {setIsAdding(false); setEditingId(null);}} className="px-8 py-2.5 text-slate-300 font-bold hover:text-white">Cancel</button>
                <button type="submit" className="bg-green-600 text-white px-10 py-2.5 rounded-2xl font-bold shadow-lg shadow-green-900/40 hover:bg-green-500">Save Invoice</button>
              </div>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Inv #</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Haulier</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Loads</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount (Net)</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {invoices.map(inv => {
              const haulier = hauliers.find(h => h.id === inv.haulierId);
              const total = calculateInvoiceTotal(inv.loads);
              const isConfirming = deleteConfirmId === inv.id;
              return (
                <tr key={inv.id} className={`${isConfirming ? 'bg-red-50' : 'hover:bg-slate-50'} transition-colors`}>
                  <td className="px-6 py-4 text-sm font-black text-slate-800">#{inv.id}</td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-500 whitespace-nowrap">{formatDate(inv.date)}</td>
                  <td className="px-6 py-4 font-bold text-slate-800">{haulier?.name || 'Unknown'}</td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-400">{inv.loads.length} item(s)</td>
                  <td className="px-6 py-4 font-black text-slate-900 text-lg">€{formatCurrency(total)}</td>
                  <td className="px-6 py-4 text-right">
                    {isConfirming ? (
                      <div className="flex justify-end items-center gap-2">
                        <button onClick={() => {onDelete(inv.id); setDeleteConfirmId(null);}} className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg">DELETE</button>
                        <button onClick={() => setDeleteConfirmId(null)} className="bg-slate-200 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-bold">CANCEL</button>
                      </div>
                    ) : (
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setViewingInvoice(inv)} className="p-2.5 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all" title="View PDF">📄</button>
                        <button onClick={() => handleEdit(inv)} className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all" title="Edit">✏️</button>
                        <button onClick={() => setDeleteConfirmId(inv.id)} className="p-2.5 text-slate-300 hover:text-red-600">🗑️</button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
            {invoices.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-20 text-center text-slate-400 italic font-bold">No haulage invoices recorded.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {viewingInvoice && (
        <HaulierInvoiceModal 
          invoice={viewingInvoice}
          haulier={hauliers.find(h => h.id === viewingInvoice.haulierId)}
          companyDetails={companyDetails}
          products={products}
          onClose={() => setViewingInvoice(null)}
        />
      )}
    </div>
  );
};

export default HaulierInvoiceLog;