
import React from 'react';
import { CompanyDetails } from '../types';

interface SettingsProps {
  companyDetails: CompanyDetails;
  setCompanyDetails: React.Dispatch<React.SetStateAction<CompanyDetails>>;
}

const Settings: React.FC<SettingsProps> = ({ companyDetails, setCompanyDetails }) => {
  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fadeIn font-outfit">
      <header>
        <h2 className="text-3xl font-bold text-slate-800">System Settings</h2>
        <p className="text-slate-500">Configure your company identity and tax rates for invoicing.</p>
      </header>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-6">
        <h3 className="text-xl font-bold text-slate-800 border-b pb-4">Our Company Details</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Company Name</label>
            <input
              type="text"
              className="w-full px-4 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-green-500 font-medium"
              value={companyDetails.name}
              onChange={e => setCompanyDetails({...companyDetails, name: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Company Address</label>
            <textarea
              className="w-full px-4 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-green-500 font-medium"
              rows={3}
              value={companyDetails.address}
              onChange={e => setCompanyDetails({...companyDetails, address: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Phone Number</label>
              <input
                type="tel"
                className="w-full px-4 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-green-500 font-medium"
                value={companyDetails.phone || ''}
                onChange={e => setCompanyDetails({...companyDetails, phone: e.target.value})}
                placeholder="+353 (0) 12 345 6789"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Contact Email</label>
              <input
                type="email"
                className="w-full px-4 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-green-500 font-medium"
                value={companyDetails.email || ''}
                onChange={e => setCompanyDetails({...companyDetails, email: e.target.value})}
                placeholder="office@timbertrack.com"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">VAT Number (Optional)</label>
              <input
                type="text"
                className="w-full px-4 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-green-500 font-medium"
                value={companyDetails.vatNumber}
                onChange={e => setCompanyDetails({...companyDetails, vatNumber: e.target.value})}
                placeholder="e.g. IE1234567A"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Company Bank IBAN</label>
              <input
                type="text"
                className="w-full px-4 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-green-500 font-medium"
                value={companyDetails.iban || ''}
                onChange={e => setCompanyDetails({...companyDetails, iban: e.target.value})}
                placeholder="IE00 XXXX ..."
              />
            </div>
          </div>
        </div>

        <h3 className="text-xl font-bold text-slate-800 border-b pb-4 pt-4">Tax Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Forest Owner VAT (%)</label>
            <div className="relative">
               <input
                type="number"
                step="0.1"
                className="w-full px-4 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-green-500 font-bold"
                value={companyDetails.forestVatRate}
                onChange={e => setCompanyDetails({...companyDetails, forestVatRate: parseFloat(e.target.value) || 0})}
              />
              <span className="absolute right-4 top-2.5 text-slate-400">%</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-widest">Typically 5%</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Harvester VAT (%)</label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                className="w-full px-4 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-green-500 font-bold"
                value={companyDetails.harvesterVatRate}
                onChange={e => setCompanyDetails({...companyDetails, harvesterVatRate: parseFloat(e.target.value) || 0})}
              />
              <span className="absolute right-4 top-2.5 text-slate-400">%</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-widest">Typically 23%</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Resale VAT (%)</label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                className="w-full px-4 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-green-500 font-bold"
                value={companyDetails.resaleVatRate}
                onChange={e => setCompanyDetails({...companyDetails, resaleVatRate: parseFloat(e.target.value) || 0})}
              />
              <span className="absolute right-4 top-2.5 text-slate-400">%</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-widest">Standard rate</p>
          </div>
        </div>

        <div className="pt-4">
           <div className="bg-blue-50 p-4 rounded-2xl flex gap-3 items-start">
             <span className="text-blue-500 text-xl">ℹ️</span>
             <p className="text-sm text-blue-700 leading-relaxed">
               VAT changes affect future invoices. Ensure these rates comply with your local tax jurisdiction for timber sales and extraction services.
             </p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
