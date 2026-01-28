
import React, { useState, useMemo } from 'react';
import { Extraction, Forest, ProductType, ForestProductCost, Harvester, CompanyDetails, ExtractionItem } from '../types';
import InvoiceModal from './InvoiceModal';

interface ExtractionLogProps {
  extractions: Extraction[];
  onDelete: (id: string) => void;
  onSave: (extraction: Extraction) => void;
  forests: Forest[];
  products: ProductType[];
  costs: ForestProductCost[];
  harvesters: Harvester[];
  companyDetails: CompanyDetails;
}

const ExtractionLog: React.FC<ExtractionLogProps> = ({ 
  extractions, 
  onDelete, 
  onSave, 
  forests, 
  products, 
  costs, 
  harvesters, 
  companyDetails 
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingInvoice, setViewingInvoice] = useState<Extraction | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  
  const createEmptyItem = (fId?: string): ExtractionItem => {
    const defaultProdId = products.length > 0 ? products[0].id : '';
    let rates = { base: 0, harvest: 0, transport: 0 };
    
    if (fId && defaultProdId) {
      const config = costs.find(c => c.forestId === fId && c.productTypeId === defaultProdId);
      if (config) {
        rates = { base: config.baseRate, harvest: config.harvestingRate, transport: config.transportRate };
      }
    }

    return {
      id: (Date.now() + Math.random()).toString(),
      productTypeId: defaultProdId,
      docketRef: '',
      quantity: 0,
      baseCostPerTonne: rates.base,
      harvestingRatePerTonne: rates.harvest,
      transportRatePerTonne: rates.transport,
      salePricePerTonne: 0,
    };
  };

  const initialForm: Omit<Extraction, 'id' | 'harvestingCost' | 'transportCost' | 'salePrice' | 'baseCostTotal' | 'totalQuantity'> = {
    forestId: forests.length > 0 ? forests[0].id : '',
    date: new Date().toISOString().split('T')[0],
    destination: 'Resold',
    buyer: '',
    harvesterId: harvesters.length > 0 ? harvesters[0].id : '',
    items: [createEmptyItem(forests.length > 0 ? forests[0].id : undefined)],
  };

  const [formData, setFormData] = useState(initialForm);

  const formatCurrency = (val: number) => 
    val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const totals = useMemo(() => {
    return formData.items.reduce((acc, item) => {
      acc.qty += item.quantity;
      acc.base += item.quantity * item.baseCostPerTonne;
      acc.harvest += item.quantity * item.harvestingRatePerTonne;
      acc.transport += item.quantity * item.transportRatePerTonne;
      acc.sale += item.quantity * item.salePricePerTonne;
      return acc;
    }, { qty: 0, base: 0, harvest: 0, transport: 0, sale: 0 });
  }, [formData.items]);

  const handleAddItem = () => {
    setFormData(prev => ({ 
      ...prev, 
      items: [...prev.items, createEmptyItem(prev.forestId)] 
    }));
  };

  const handleRemoveItem = (id: string) => {
    if (formData.items.length <= 1) return;
    setFormData(prev => ({ ...prev, items: prev.items.filter(i => i.id !== id) }));
  };

  const updateItem = (id: string, updates: Partial<ExtractionItem>) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id !== id) return item;
        
        let newValues = { ...item, ...updates };
        
        // If product changed, update the rates automatically from the forest cost config
        if (updates.productTypeId) {
          const costConfig = costs.find(c => c.forestId === prev.forestId && c.productTypeId === updates.productTypeId);
          if (costConfig) {
            newValues.baseCostPerTonne = costConfig.baseRate;
            newValues.harvestingRatePerTonne = costConfig.harvestingRate;
            newValues.transportRatePerTonne = costConfig.transportRate;
          }
        }
        
        return newValues;
      })
    }));
  };

  const handleForestChange = (fId: string) => {
    setFormData(prev => ({
      ...prev,
      forestId: fId,
      items: prev.items.map(item => {
        const config = costs.find(c => c.forestId === fId && c.productTypeId === item.productTypeId);
        if (config) {
          return {
            ...item,
            baseCostPerTonne: config.baseRate,
            harvestingRatePerTonne: config.harvestingRate,
            transportRatePerTonne: config.transportRate
          };
        }
        return item;
      })
    }));
  };

  const handleEdit = (ex: Extraction) => {
    setEditingId(ex.id);
    setFormData({
      forestId: ex.forestId,
      date: ex.date,
      destination: ex.destination,
      buyer: ex.buyer,
      harvesterId: ex.harvesterId,
      items: ex.items,
    });
    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const executeDelete = (id: string) => {
    onDelete(id);
    setDeleteConfirmId(null);
    if (editingId === id) {
      setIsAdding(false);
      setEditingId(null);
    }
  };

  const handleAddOrUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.forestId || !formData.harvesterId || formData.items.length === 0) {
      alert("Please ensure Site, Harvester and at least one Load is added.");
      return;
    }

    const processedData: Extraction = {
      ...formData,
      id: editingId || Date.now().toString(),
      totalQuantity: totals.qty,
      baseCostTotal: totals.base,
      harvestingCost: totals.harvest,
      transportCost: totals.transport,
      salePrice: formData.destination === 'Resold' ? totals.sale : 0,
    };

    onSave(processedData);
    setIsAdding(false);
    setEditingId(null);
    setFormData(initialForm);
  };

  const downloadCSV = () => {
    if (extractions.length === 0) return;
    const headers = ['ID', 'Date', 'Forest', 'Destination', 'Total Qty(t)', 'Total Revenue', 'Total Net Result'];
    const rows = extractions.map(ex => {
      const net = ex.destination === 'Resold' 
        ? ex.salePrice - (ex.baseCostTotal + ex.harvestingCost + ex.transportCost)
        : -(ex.baseCostTotal + ex.harvestingCost + ex.transportCost);
      return [
        ex.id, ex.date, 
        forests.find(f => f.id === ex.forestId)?.name || 'Unknown',
        ex.destination, ex.totalQuantity, ex.salePrice, net
      ].join(',');
    });
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `harvest_summary_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Extraction Log</h2>
          <p className="text-slate-500 font-medium">Record and manage timber removal returns</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={downloadCSV}
            className="bg-white text-slate-700 px-6 py-2.5 rounded-xl font-bold border border-slate-200 hover:bg-slate-50 transition-all shadow-sm font-outfit"
          >
            Export CSV Summary
          </button>
          <button
            onClick={() => {
              setEditingId(null);
              const defaultForestId = forests.length > 0 ? forests[0].id : '';
              setFormData({
                ...initialForm,
                forestId: defaultForestId,
                items: [createEmptyItem(defaultForestId)]
              });
              setIsAdding(true);
            }}
            className="bg-green-700 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-green-800 transition-all shadow-md font-outfit"
          >
            + New Return
          </button>
        </div>
      </header>

      {isAdding && (
        <div className="bg-white p-8 rounded-2xl shadow-2xl border-2 border-green-100 animate-slideDown max-w-6xl mx-auto font-outfit">
          <form onSubmit={handleAddOrUpdate} className="space-y-6">
            <div className="flex justify-between items-center border-b pb-4">
              <h3 className="text-xl font-bold text-slate-800">
                {editingId ? 'Edit Return' : 'New Return'}
              </h3>
              <div className="flex bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setFormData(p => ({ ...p, destination: 'Resold' }))}
                  className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${formData.destination === 'Resold' ? 'bg-white text-green-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Resale
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(p => ({ ...p, destination: 'Own Use' }))}
                  className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${formData.destination === 'Own Use' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Own Use
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Forest Site</label>
                <select
                  required
                  className="w-full px-4 py-2.5 border rounded-xl outline-none bg-slate-50"
                  value={formData.forestId}
                  onChange={e => handleForestChange(e.target.value)}
                >
                  <option value="">Select Site</option>
                  {forests.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Return Date</label>
                <input
                  type="date"
                  required
                  className="w-full px-4 py-2.5 border rounded-xl outline-none"
                  value={formData.date}
                  onChange={e => setFormData({...formData, date: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Harvester</label>
                <select
                  required
                  className="w-full px-4 py-2.5 border rounded-xl outline-none bg-slate-50"
                  value={formData.harvesterId}
                  onChange={e => setFormData({...formData, harvesterId: e.target.value})}
                >
                  <option value="">Select Harvester</option>
                  {harvesters.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Buyer / Recipient</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2.5 border rounded-xl outline-none"
                  value={formData.buyer}
                  onChange={e => setFormData({...formData, buyer: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-4">
               <div className="flex justify-between items-center">
                  <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest">Loads & Dockets</h4>
                  <button 
                    type="button" 
                    onClick={handleAddItem}
                    className="text-green-700 text-xs font-bold hover:bg-green-50 px-3 py-1.5 rounded-lg border border-green-100"
                  >
                    + Add Load
                  </button>
               </div>

               <div className="space-y-3">
                  {formData.items.map((item) => (
                    <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end p-4 bg-slate-50 rounded-2xl border border-slate-100 relative group animate-fadeIn">
                       <div className="md:col-span-3">
                          <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Product</label>
                          <select
                            required
                            className="w-full px-2 py-2 border rounded-xl outline-none bg-white text-xs font-bold"
                            value={item.productTypeId}
                            onChange={e => updateItem(item.id, { productTypeId: e.target.value })}
                          >
                            <option value="">Select Product</option>
                            {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                          </select>
                       </div>
                       <div className="md:col-span-2">
                          <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Docket Ref</label>
                          <input
                            type="text"
                            required
                            className="w-full px-3 py-2 border rounded-xl outline-none bg-white text-xs font-bold"
                            value={item.docketRef}
                            onChange={e => updateItem(item.id, { docketRef: e.target.value })}
                            placeholder="e.g. D-1002"
                          />
                       </div>
                       <div className="md:col-span-2">
                          <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Qty (t)</label>
                          <input
                            type="number"
                            step="0.01"
                            required
                            className="w-full px-3 py-2 border rounded-xl outline-none bg-white text-xs font-bold"
                            value={item.quantity}
                            onChange={e => updateItem(item.id, { quantity: parseFloat(e.target.value) || 0 })}
                          />
                       </div>
                       {formData.destination === 'Resold' && (
                         <div className="md:col-span-2">
                            <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Sale Rate (€/t)</label>
                            <input
                              type="number"
                              step="0.01"
                              required
                              className="w-full px-3 py-2 border rounded-xl outline-none bg-emerald-50 text-emerald-700 text-xs font-black"
                              value={item.salePricePerTonne}
                              onChange={e => updateItem(item.id, { salePricePerTonne: parseFloat(e.target.value) || 0 })}
                            />
                         </div>
                       )}
                       <div className="md:col-span-2 flex flex-col justify-end">
                          <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Line Net Cost</p>
                          <p className="text-xs font-bold text-slate-900 bg-white border px-3 py-2 rounded-xl">
                             €{formatCurrency(item.quantity * (item.baseCostPerTonne + item.harvestingRatePerTonne + item.transportRatePerTonne))}
                          </p>
                       </div>
                       <div className="md:col-span-1 text-right">
                          <button 
                            type="button" 
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-red-300 hover:text-red-600 p-2 transition-colors"
                            disabled={formData.items.length === 1}
                          >
                            ✕
                          </button>
                       </div>
                    </div>
                  ))}
               </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-4 bg-slate-900 rounded-2xl text-white">
                <div>
                   <p className="text-[10px] font-black uppercase text-slate-400">Total Weight</p>
                   <p className="text-xl font-bold">{totals.qty.toLocaleString()} t</p>
                </div>
                <div>
                   <p className="text-[10px] font-black uppercase text-slate-400">Forest Payout</p>
                   <p className="text-xl font-bold">€{formatCurrency(totals.base)}</p>
                </div>
                <div>
                   <p className="text-[10px] font-black uppercase text-slate-400">Harvest Cost</p>
                   <p className="text-xl font-bold">€{formatCurrency(totals.harvest)}</p>
                </div>
                <div>
                   <p className="text-[10px] font-black uppercase text-slate-400">Transport Est.</p>
                   <p className="text-xl font-bold">€{formatCurrency(totals.transport)}</p>
                </div>
                <div className="bg-slate-800 p-2 rounded-xl border border-slate-700">
                   <p className="text-[10px] font-black uppercase text-slate-400">{formData.destination === 'Resold' ? 'Total Return Value' : 'Total Net Cost'}</p>
                   <p className={`text-xl font-black ${formData.destination === 'Resold' ? 'text-emerald-400' : 'text-amber-400'}`}>
                      €{formData.destination === 'Resold' ? formatCurrency(totals.sale) : formatCurrency(totals.base + totals.harvest + totals.transport)}
                   </p>
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <button type="button" onClick={() => {setIsAdding(false); setEditingId(null); setDeleteConfirmId(null);}} className="px-6 py-2.5 text-slate-600 font-bold">Cancel</button>
              <button type="submit" className="bg-green-700 text-white px-8 py-2.5 rounded-xl font-bold shadow-lg">Save Return</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100 font-outfit">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Details</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Qty</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Revenue</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Net Result</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-outfit">
              {extractions.map(ex => {
                const forest = forests.find(f => f.id === ex.forestId);
                const totalCosts = ex.baseCostTotal + ex.harvestingCost + ex.transportCost;
                const net = ex.destination === 'Resold' ? ex.salePrice - totalCosts : -totalCosts;
                const isConfirming = deleteConfirmId === ex.id;
                
                return (
                  <tr key={ex.id} className={`${isConfirming ? 'bg-red-50' : 'hover:bg-slate-50'} transition-colors`}>
                    <td className="px-6 py-4 text-sm font-bold text-slate-500 whitespace-nowrap">{formatDate(ex.date)}</td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-800">{forest?.name || 'Unknown Site'}</p>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{ex.items.length} Load(s) • {ex.destination}</p>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-700 text-right">{ex.totalQuantity.toLocaleString()} t</td>
                    <td className="px-6 py-4 text-emerald-600 font-black text-right">
                      {ex.destination === 'Resold' ? `€${formatCurrency(ex.salePrice)}` : '—'}
                    </td>
                    <td className={`px-6 py-4 font-black text-right ${net >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                      €{formatCurrency(Math.abs(net))}
                      <span className="text-[10px] block font-bold text-slate-300 uppercase tracking-widest">
                        {net >= 0 ? 'Surplus' : 'Expensed'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                         <button onClick={() => setViewingInvoice(ex)} className="p-2.5 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all">📄</button>
                         <button onClick={() => handleEdit(ex)} className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">✏️</button>
                         <button onClick={() => setDeleteConfirmId(ex.id)} className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">🗑️</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {extractions.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-24 text-center text-slate-400 font-bold italic">No extraction returns recorded yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {viewingInvoice && (
        <InvoiceModal 
          extraction={viewingInvoice}
          forest={forests.find(f => f.id === viewingInvoice.forestId)}
          harvester={harvesters.find(h => h.id === viewingInvoice.harvesterId)}
          products={products}
          companyDetails={companyDetails}
          onClose={() => setViewingInvoice(null)}
        />
      )}
    </div>
  );
};

export default ExtractionLog;
