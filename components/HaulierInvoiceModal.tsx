
import React from 'react';
import { HaulierInvoice, PrivateHaulier, CompanyDetails, ProductType } from '../types';

interface HaulierInvoiceModalProps {
  invoice: HaulierInvoice;
  haulier: PrivateHaulier | undefined;
  companyDetails: CompanyDetails;
  products: ProductType[];
  onClose: () => void;
}

const HaulierInvoiceModal: React.FC<HaulierInvoiceModalProps> = ({ invoice, haulier, companyDetails, products, onClose }) => {
  const subtotal = invoice.loads.reduce((sum, load) => sum + (load.quantity * load.rate), 0);
  const vatAmount = subtotal * (invoice.vatRate / 100);
  const total = subtotal + vatAmount;

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

  const handlePrint = () => {
    const content = document.getElementById('haulier-invoice-printable')?.innerHTML;
    if (!content) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Haulage Invoice - ${haulier?.name} - #${invoice.id}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Outfit:wght@700;900&display=swap" rel="stylesheet">
          <style>
            body { font-family: 'Inter', sans-serif; padding: 20px; }
            .font-outfit { font-family: 'Outfit', sans-serif; }
            * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
            @page { size: auto; margin: 10mm; }
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[95vh] flex flex-col overflow-hidden animate-fadeIn">
        <div className="p-6 border-b flex justify-between items-center bg-slate-50">
          <h3 className="text-xl font-bold text-slate-800 font-outfit">Haulage Self-Bill Preview</h3>
          <div className="flex gap-2">
            <button onClick={handlePrint} className="bg-green-700 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-green-800 transition-all flex items-center gap-2">
              <span>🖨️</span> PRINT / PDF
            </button>
            <button onClick={onClose} className="p-2.5 hover:bg-slate-200 rounded-full text-slate-400">✕</button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-100">
          <div id="haulier-invoice-printable" className="max-w-[800px] mx-auto bg-white p-8 shadow-sm font-outfit border border-slate-100">
            {/* Header */}
            <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6 mb-8">
              <div>
                <h1 className="text-3xl font-black text-green-800 tracking-tighter">TimberTrack</h1>
              </div>
              <div className="text-right">
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Self-Bill Invoice</h2>
                <div className="mt-1 text-xs">
                  <p className="font-bold text-slate-900">INV NO: #{invoice.id}</p>
                  <p className="text-slate-400 font-medium">Issued: {formatDate(invoice.date)}</p>
                </div>
              </div>
            </div>

            {/* Entities */}
            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest border-b pb-1 mb-2">Transport Provider</p>
                <p className="text-lg font-bold text-slate-900 leading-tight">{haulier?.name}</p>
                <p className="text-slate-600 text-xs mt-1 whitespace-pre-line">{haulier?.address}</p>
                {haulier?.vatNumber && <p className="text-[10px] font-black mt-2 uppercase border border-slate-200 inline-block px-2 py-0.5 rounded">VAT: {haulier.vatNumber}</p>}
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest border-b pb-1 mb-2">Service Requester</p>
                <p className="text-lg font-bold text-slate-900 leading-tight">{companyDetails.name}</p>
                <p className="text-slate-600 text-xs mt-1 whitespace-pre-line">{companyDetails.address}</p>
                {companyDetails.vatNumber && <p className="text-[10px] font-black mt-2 uppercase border border-slate-200 inline-block px-2 py-0.5 rounded">VAT: {companyDetails.vatNumber}</p>}
              </div>
            </div>

            {/* Table */}
            <table className="w-full mb-8">
              <thead>
                <tr className="border-b border-slate-900 text-[9px] uppercase font-black text-slate-400 text-left">
                  <th className="py-3">Description of Transport Services</th>
                  <th className="py-3 text-center">Qty (t)</th>
                  <th className="py-3 text-right">Rate (€)</th>
                  <th className="py-3 text-right">Net Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoice.loads.map(load => {
                  const product = products.find(p => p.id === load.productTypeId);
                  return (
                    <tr key={load.id}>
                      <td className="py-3 pr-4">
                        <p className="text-sm font-bold text-slate-900">{product?.name || "Timber Transport"}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                          {load.transactionNumber && `DOCKET: ${load.transactionNumber}`}
                          {load.transactionNumber && load.date && ` • `}
                          {load.date && `DATE: ${formatDate(load.date)}`}
                        </p>
                      </td>
                      <td className="py-3 text-center font-bold text-slate-700 text-sm">{load.quantity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className="py-3 text-right font-medium text-slate-600 text-sm">€{formatCurrency(load.rate)}</td>
                      <td className="py-3 text-right font-black text-slate-900 text-sm">€{formatCurrency(load.quantity * load.rate)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Totals and Bank Info */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-8">
              <div className="flex-1 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest border-b pb-1 mb-3">Payee Bank Details</p>
                <div className="grid grid-cols-2 gap-y-2 gap-x-6">
                  <div>
                    <p className="text-[8px] font-black text-slate-400 uppercase">Sort Code</p>
                    <p className="text-xs font-bold text-slate-800">{haulier?.sortCode || '—'}</p>
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-slate-400 uppercase">Account Number</p>
                    <p className="text-xs font-bold text-slate-800">{haulier?.accountNumber || '—'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[8px] font-black text-slate-400 uppercase">IBAN</p>
                    <p className="text-xs font-bold text-slate-800">{haulier?.iban || '—'}</p>
                  </div>
                </div>
              </div>
              <div className="w-56 space-y-2">
                <div className="flex justify-between font-bold text-slate-400 text-[10px] uppercase">
                   <span>Net Subtotal</span>
                   <span>€{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between font-bold text-slate-400 text-[10px] uppercase">
                   <span>VAT ({invoice.vatRate}%)</span>
                   <span>€{formatCurrency(vatAmount)}</span>
                </div>
                <div className="flex justify-between text-xl font-black text-slate-900 pt-3 border-t border-slate-900">
                   <span className="text-xs">TOTAL DUE</span>
                   <span className="text-green-800">€{formatCurrency(total)}</span>
                </div>
              </div>
            </div>

             {/* Footer */}
             <div className="text-[8px] text-center text-slate-400 leading-relaxed pt-8 border-t border-slate-50">
                <p className="mb-2">
                  This is a self-billing invoice issued under a self-billing agreement. Both parties have agreed that the customer (the buyer) may raise self-billed invoices on behalf of the supplier. If there are any discrepancies, please contact us immediately.
                </p>
                <p className="font-black text-slate-300 uppercase tracking-widest">
                  TimberTrack - Secure Document System
                </p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HaulierInvoiceModal;
