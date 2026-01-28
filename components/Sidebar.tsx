
import React from 'react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'forests', label: 'Forest Sites', icon: '🌲' },
    { id: 'products', label: 'Inventory Items', icon: '🪵' },
    { id: 'harvesters', label: 'Harvesters', icon: '🚜' },
    { id: 'extractions', label: 'Extraction Log', icon: '🚚' },
    { id: 'hauliers', label: 'Private Hauliers', icon: '🚛' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <aside className="w-64 bg-green-900 text-white flex flex-col shadow-xl font-outfit h-full">
      <div className="p-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <span className="text-green-400">Timber</span>Track
        </h1>
        <p className="text-xs text-green-300 opacity-70 mt-1 uppercase tracking-widest font-semibold">Pro Management</p>
      </div>
      
      <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              activeTab === item.id 
                ? 'bg-green-700 text-white shadow-inner' 
                : 'text-green-100 hover:bg-green-800'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 bg-green-950/50 border-t border-green-800/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-700 flex items-center justify-center text-lg font-bold">
            JD
          </div>
          <div>
            <p className="text-sm font-semibold">Admin Panel</p>
            <p className="text-xs text-green-400">System Controller</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
