
import React from 'react';
import { Forest, Extraction, ProductType } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

interface DashboardProps {
  forests: Forest[];
  extractions: Extraction[];
  products: ProductType[];
}

const Dashboard: React.FC<DashboardProps> = ({ forests, extractions, products }) => {
  // Use aggregated fields from the Extraction interface
  const totalRevenue = extractions.reduce((sum, e) => sum + e.salePrice, 0);
  const totalBaseCost = extractions.reduce((sum, e) => sum + e.baseCostTotal, 0);
  const totalHarvestCost = extractions.reduce((sum, e) => sum + e.harvestingCost, 0);
  const totalTransportCost = extractions.reduce((sum, e) => sum + e.transportCost, 0);
  const totalCost = totalBaseCost + totalHarvestCost + totalTransportCost;

  const resaleProfit = extractions
    .filter(e => e.destination === 'Resold')
    .reduce((sum, e) => sum + (e.salePrice - (e.baseCostTotal + e.harvestingCost + e.transportCost)), 0);

  const totalVolume = extractions.reduce((sum, e) => sum + e.totalQuantity, 0);

  // Revenue by Forest
  const revenueByForest = forests.map(f => ({
    name: f.name,
    revenue: extractions.filter(e => e.forestId === f.id).reduce((sum, e) => sum + e.salePrice, 0)
  })).sort((a, b) => b.revenue - a.revenue);

  // Product breakdown (requires iterating through extraction.items)
  const productStats = products.map(p => {
    let volume = 0;
    let revenue = 0;
    
    extractions.forEach(ex => {
      ex.items.forEach(item => {
        if (item.productTypeId === p.id) {
          volume += item.quantity;
          if (ex.destination === 'Resold') {
            revenue += item.quantity * item.salePricePerTonne;
          }
        }
      });
    });

    return { name: p.name, volume, revenue };
  }).filter(p => p.volume > 0).sort((a, b) => b.volume - a.volume);

  const usageData = [
    { name: 'Resold', value: extractions.filter(e => e.destination === 'Resold').reduce((sum, e) => sum + e.totalQuantity, 0) },
    { name: 'Own Use', value: extractions.filter(e => e.destination === 'Own Use').reduce((sum, e) => sum + e.totalQuantity, 0) },
  ];

  const recentExtractions = [...extractions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);
  const COLORS = ['#166534', '#15803d', '#16a34a', '#22c55e', '#4ade80'];
  const PIE_COLORS = ['#166534', '#3b82f6'];

  return (
    <div className="space-y-8 animate-fadeIn font-outfit">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Operational Overview</h2>
          <p className="text-slate-500">Estate-wide removal performance</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Sales Revenue', value: `€${totalRevenue.toLocaleString()}`, icon: '💰', color: 'bg-emerald-50 text-emerald-700' },
          { 
            label: 'Net Surplus (Resale)', 
            value: `€${resaleProfit.toLocaleString()}`, 
            icon: '📈', 
            color: resaleProfit >= 0 ? 'bg-blue-50 text-blue-700' : 'bg-red-50 text-red-700' 
          },
          { label: 'Total Extraction', value: `${totalVolume.toLocaleString()}t`, icon: '🪵', color: 'bg-amber-50 text-amber-700' },
          { label: 'Total Op. Costs', value: `€${totalCost.toLocaleString()}`, icon: '🧾', color: 'bg-slate-100 text-slate-700' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between transition-transform hover:scale-[1.02]">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{stat.label}</p>
              <h3 className="text-2xl font-black text-slate-900">{stat.value}</h3>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${stat.color}`}>
              {stat.icon}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-xl font-bold text-slate-800 mb-6">Revenue by Site (€)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueByForest}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '12px', border: 'none'}} />
                <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
                  {revenueByForest.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-xl font-bold text-slate-800 mb-6">Utilization (t)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={usageData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {usageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-xl font-bold text-slate-800 mb-6">Product Breakdown</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b">
                  <th className="pb-3 px-2">Product</th>
                  <th className="pb-3 px-2 text-right">Volume (t)</th>
                  <th className="pb-3 px-2 text-right">Sales (€)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {productStats.map((prod, idx) => (
                  <tr key={idx}>
                    <td className="py-4 px-2 font-bold text-slate-800">{prod.name}</td>
                    <td className="py-4 px-2 text-right text-slate-600 font-medium">{prod.volume.toLocaleString()}t</td>
                    <td className="py-4 px-2 text-right text-emerald-600 font-black">€{prod.revenue.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-xl font-bold text-slate-800 mb-6">Recent Records</h3>
          <div className="space-y-4">
            {recentExtractions.map((ex) => (
              <div key={ex.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border text-lg ${ex.destination === 'Resold' ? 'bg-green-50' : 'bg-blue-50'}`}>
                    {ex.destination === 'Resold' ? '🛒' : '🛠️'}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{ex.buyer || 'Internal'}</p>
                    <p className="text-xs text-slate-500">{new Date(ex.date).toLocaleDateString()} • {forests.find(f => f.id === ex.forestId)?.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${ex.destination === 'Resold' ? 'text-green-700' : 'text-blue-700'}`}>
                    {ex.destination === 'Resold' ? `€${ex.salePrice.toLocaleString()}` : 'Own Use'}
                  </p>
                  <p className="text-xs text-slate-400">{ex.totalQuantity} t</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
