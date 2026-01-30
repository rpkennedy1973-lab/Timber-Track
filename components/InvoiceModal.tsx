
import React, { useState } from 'react';
import { Extraction, Forest, ProductType, Harvester, CompanyDetails } from '../types';

interface InvoiceModalProps {
  extraction: Extraction;
  forest: Forest | undefined;
  harvester: Harvester | undefined;
  products: ProductType[];
  companyDetails: CompanyDetails;
  onClose: () => void;
}

const InvoiceModal: React.FC<InvoiceModalProps> = ({ extraction, forest, harvester, products, companyDetails, onClose }) => {
  const [tab, setTab] = useState<'forest' | 'harvester' | 'customer'>('forest');

  // Logic to determine subtotal and vat rate based on active tab
  let vatPercent = 23; 
  let title = "Self-Bill Invoice";
  let vendorLabel = "Vendor / Payee";
  let issuerLabel = "Issuer / Payer";
  let descriptionHeader = "Product Description";

  if (tab === 'forest') {
    vatPercent = companyDetails.forestVatRate || 5;
    title = "Forest Owner Self-Bill Invoice";
    descriptionHeader = "Timber Purchase (Standing)";
  } else if (tab === 'harvester') {
    vatPercent = companyDetails.harvesterVatRate || 23;
    title = "Harvester Self-Bill Invoice";
    descriptionHeader = "Harvesting Services";
  } else if (tab === 'customer') {
    vatPercent = companyDetails.resaleVatRate || 23;
    title = "Customer Sales Invoice";
    vendorLabel = "Customer / Buyer";
    issuerLabel = "Vendor / Seller";
    descriptionHeader = "Timber Products Sold";
  }

  // Calculate row-by-row data for the table
  const tableRows = extraction.items.map(item => {
    const product = products.find(p => p.id === item.productTypeId);
    let net = 0;
    let rate = 0;

    if (tab === 'forest') {
      net = item.quantity * item.baseCostPerTonne;
      rate = item.baseCostPerTonne;
    } else if (tab === 'harvester') {
      net = item.quantity * item.harvestingRatePerTonne;
      rate = item.harvestingRatePerTonne;
    } else if (tab === 'customer') {
      net = item.quantity * item.salePricePerTonne;
      rate = item.salePricePerTonne;
    }

    return {
      productName: product?.name || 'Unknown',
      docket: item.docketRef,
      qty: item.quantity,
      rate,
      net
    };
  });

  const subtotal = tableRows.reduce((sum, row) => sum + row.net, 0);
  const vatAmount = subtotal * (vatPercent / 100);
  const total = subtotal + vatAmount;

  const formatCurrency = (val: number) => 
    val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handlePrint = () => {
    const content = document.getElementById('printable-invoice-content')?.innerHTML;
    if (!content) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title} - ${extraction.id.slice(-6)}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Outfit:wght@700;900&swap" rel="stylesheet">
          <style>
            body { font-family: 'Inter', sans-serif; padding: 20px; background: white; }
            .font-outfit { font-family: 'Outfit', sans-serif; }
            @media print { body { padding: 0; } @page { margin: 10mm; } }
            * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          </style>
        </head>
        <body onload="window.print()">
          <div class="max-w-4xl mx-auto">${content}</div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 md:p-8 overflow-y-auto backdrop-blur-md">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[95vh] flex flex-col overflow-hidden animate-fadeIn">
        
        <div className="p-6 border-b flex flex-wrap justify-between items-center bg-slate-50 gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
             <h3 className="text-xl font-bold text-slate-800 font-outfit">Document Preview</h3>
             <div className="flex bg-slate-200 p-1 rounded-xl">
               <button onClick={() => setTab('forest')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${tab === 'forest' ? 'bg-white text-green-700 shadow' : 'text-slate-500 hover:text-slate-700'}`}>Forest Owner</button>
               <button onClick={() => setTab('harvester')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${tab === 'harvester' ? 'bg-white text-green-700 shadow' : 'text-slate-500 hover:text-slate-700'}`}>Harvester</button>
               {extraction.destination === 'Resold' && (
                  <button onClick={() => setTab('customer')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${tab === 'customer' ? 'bg-white text-blue-700 shadow' : 'text-slate-500 hover:text-slate-700'}`}>Customer Sales</button>
               )}
             </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handlePrint} className="px-6 py-2.5 bg-green-700 text-white rounded-xl font-bold hover:bg-green-800 shadow-lg flex items-center gap-2">🖨️ PRINT PDF</button>
            <button onClick={onClose} className="p-2.5 hover:bg-slate-200 rounded-full text-slate-400">✕</button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-100">
          <div id="printable-invoice-content" className="max-w-[800px] mx-auto bg-white p-12 shadow-sm font-outfit">
            <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6 mb-8">
              <h1 className="text-3xl font-black text-green-800 tracking-tighter">TimberTrack</h1>
              <div className="text-right">
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter">{title}</h2>
                <div className="mt-1 text-xs">
                  <p className="font-bold">RETURN NO: {extraction.id.slice(-6).toUpperCase()}</p>
                  <p className="text-slate-400">Date: {formatDate(extraction.date)}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-12 mb-10">
              <div className="space-y-4">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest border-b pb-1">{vendorLabel}</p>
                {tab === 'forest' ? (
                  <div>
                    <p className="text-lg font-bold text-slate-900 leading-tight">{forest?.ownerName}</p>
                    <p className="text-slate-600 text-xs mt-1 whitespace-pre-line">{forest?.ownerAddress}</p>
                    {forest?.ownerEmail && <p className="text-[10px] text-slate-500 font-medium mt-1">E: {forest.ownerEmail}</p>}
                  </div>
                ) : tab === 'harvester' ? (
                  <div>
                    <p className="text-lg font-bold text-slate-900 leading-tight">{harvester?.name}</p>
                    <p className="text-slate-600 text-xs mt-1 whitespace-pre-line">{harvester?.address}</p>
                    {harvester?.email && <p className="text-[10px] text-slate-500 font-medium mt-1">E: {harvester.email}</p>}
                    {harvester?.vatNumber && <p className="text-[10px] font-black mt-2 uppercase border border-slate-200 inline-block px-2 py-0.5 rounded">VAT: {harvester.vatNumber}</p>}
                  </div>
                ) : (
                  <div>
                    <p className="text-lg font-bold text-slate-900 leading-tight">{extraction.buyer}</p>
                    <p className="text-slate-600 text-xs mt-1 italic">Authorized recipient.</p>
                  </div>
                )}
                <div className="mt-4 pt-4 border-t border-slate-50">
                   <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Estate / Site</p>
                   <p className="text-xs font-bold text-slate-800">{forest?.name}</p>
                   {forest?.fellingLicenseNumber && (
                     <p className="text-[10px] font-black text-blue-700 mt-1">FELLING LICENCE: {forest.fellingLicenseNumber}</p>
                   )}
                </div>
              </div>
              <div className="space-y-4">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest border-b pb-1">{issuerLabel}</p>
                <div>
                  <p className="text-lg font-bold text-slate-900 leading-tight">{companyDetails.name}</p>
                  <p className="text-slate-600 text-xs mt-1 whitespace-pre-line">{companyDetails.address}</p>
                  <div className="mt-3 space-y-0.5">
                    {companyDetails.phone && <p className="text-[10px] text-slate-500 font-medium">T: {companyDetails.phone}</p>}
                    {companyDetails.email && <p className="text-[10px] text-slate-500 font-medium">E: {companyDetails.email}</p>}
                    {companyDetails.vatNumber && <p className="text-[10px] font-black mt-2 uppercase border border-slate-200 inline-block px-2 py-0.5 rounded">VAT: {companyDetails.vatNumber}</p>}
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-10">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-900 text-left text-[9px] uppercase tracking-widest font-black text-slate-400">
                    <th className="py-3">{descriptionHeader}</th>
                    <th className="py-3 text-center">Docket Ref</th>
                    <th className="py-3 text-center">Qty (t)</th>
                    <th className="py-3 text-right">Rate (€)</th>
                    <th className="py-3 text-right">Net</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tableRows.map((row, idx) => (
                    <tr key={idx}>
                      <td className="py-4 text-sm font-bold text-slate-900">{row.productName}</td>
                      <td className="py-4 text-center text-xs font-bold text-slate-400 tracking-wider">{row.docket}</td>
                      <td className="py-4 text-center text-sm font-bold text-slate-600">{row.qty.toLocaleString()}</td>
                      <td className="py-4 text-right text-sm font-medium text-slate-600">€{formatCurrency(row.rate)}</td>
                      <td className="py-4 text-right text-sm font-black text-slate-900">€{formatCurrency(row.net)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12">
               <div className="flex-1">
                 {(tab === 'forest' && forest?.ownerIban) || (tab === 'harvester' && harvester?.iban) || (tab === 'customer' && companyDetails.iban) ? (
                   <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 max-w-sm">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest border-b pb-1 mb-2">
                        {tab === 'customer' ? 'Remittance Bank Details' : 'Payee Bank Details'}
                      </p>
                      <p className="text-[8px] font-black text-slate-400 uppercase">IBAN</p>
                      <p className="text-xs font-bold text-slate-800 tracking-wider">
                        {tab === 'forest' ? forest?.ownerIban : tab === 'harvester' ? harvester?.iban : companyDetails.iban}
                      </p>
                   </div>
                 ) : null}
               </div>
              <div className="w-64 space-y-3">
                <div className="flex justify-between items-center text-slate-500 text-[10px] font-bold uppercase">
                  <span>Net Subtotal</span>
                  <span>€{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between items-center text-slate-500 text-[10px] font-bold uppercase">
                  <span>VAT ({vatPercent}%)</span>
                  <span>€{formatCurrency(vatAmount)}</span>
                </div>
                <div className="flex justify-between items-center text-2xl font-black text-slate-900 pt-4 border-t-2 border-slate-900">
                  <span className="text-xs">GRAND TOTAL</span>
                  <span className="text-green-800">€{formatCurrency(total)}</span>
                </div>
              </div>
            </div>

            <div className="text-[8px] text-center text-slate-400 pt-8 border-t border-slate-50">
              <p className="mb-2 italic">
                {tab !== 'customer' 
                  ? "Self-billing agreement: The customer (issuer) raises this invoice on behalf of the supplier." 
                  : "Sales invoice issued for goods supplied. Terms: 30 days."}
              </p>
              <p className="font-black text-slate-200 uppercase tracking-[0.3em]">TimberTrack Document Security</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceModal;
