
import React, { useState, useEffect } from 'react';
import { Forest, ProductType, Extraction, ForestProductCost, Harvester, CompanyDetails, PrivateHaulier, HaulierInvoice } from './types';
import { INITIAL_PRODUCT_TYPES } from './constants';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ForestManager from './components/ForestManager';
import ProductManager from './components/ProductManager';
import ExtractionLog from './components/ExtractionLog';
import HarvesterManager from './components/HarvesterManager';
import HaulierManager from './components/HaulierManager';
import Settings from './components/Settings';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'forests' | 'products' | 'extractions' | 'harvesters' | 'hauliers' | 'settings'>('dashboard');
  
  // State management
  const [forests, setForests] = useState<Forest[]>(() => {
    const saved = localStorage.getItem('timber_forests');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [harvesters, setHarvesters] = useState<Harvester[]>(() => {
    const saved = localStorage.getItem('timber_harvesters');
    return saved ? JSON.parse(saved) : [];
  });

  const [hauliers, setHauliers] = useState<PrivateHaulier[]>(() => {
    const saved = localStorage.getItem('timber_hauliers');
    return saved ? JSON.parse(saved) : [];
  });

  const [haulierInvoices, setHaulierInvoices] = useState<HaulierInvoice[]>(() => {
    const saved = localStorage.getItem('timber_haulier_invoices');
    return saved ? JSON.parse(saved) : [];
  });

  const [companyDetails, setCompanyDetails] = useState<CompanyDetails>(() => {
    const saved = localStorage.getItem('timber_company');
    const defaultDetails = { 
      name: 'Your Timber Co. Ltd.', 
      address: '123 Forest View, Timberland Way', 
      vatNumber: '',
      phone: '',
      email: '',
      forestVatRate: 5,
      harvesterVatRate: 23,
      resaleVatRate: 23
    };
    return saved ? { ...defaultDetails, ...JSON.parse(saved) } : defaultDetails;
  });

  const [products, setProducts] = useState<ProductType[]>(() => {
    const saved = localStorage.getItem('timber_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCT_TYPES;
  });
  
  const [extractions, setExtractions] = useState<Extraction[]>(() => {
    const saved = localStorage.getItem('timber_extractions');
    return saved ? JSON.parse(saved) : [];
  });

  const [costs, setCosts] = useState<ForestProductCost[]>(() => {
    const saved = localStorage.getItem('timber_forest_costs');
    return saved ? JSON.parse(saved) : [];
  });

  // Persistence
  useEffect(() => {
    localStorage.setItem('timber_forests', JSON.stringify(forests));
    localStorage.setItem('timber_harvesters', JSON.stringify(harvesters));
    localStorage.setItem('timber_hauliers', JSON.stringify(hauliers));
    localStorage.setItem('timber_haulier_invoices', JSON.stringify(haulierInvoices));
    localStorage.setItem('timber_company', JSON.stringify(companyDetails));
    localStorage.setItem('timber_products', JSON.stringify(products));
    localStorage.setItem('timber_extractions', JSON.stringify(extractions));
    localStorage.setItem('timber_forest_costs', JSON.stringify(costs));
  }, [forests, harvesters, hauliers, haulierInvoices, companyDetails, products, extractions, costs]);

  // Data Action Handlers - Extractions
  const deleteExtraction = (id: string) => {
    setExtractions(prev => prev.filter(ex => ex.id !== id));
  };

  const saveExtraction = (extraction: Extraction) => {
    setExtractions(prev => {
      const exists = prev.find(e => e.id === extraction.id);
      if (exists) {
        return prev.map(e => e.id === extraction.id ? extraction : e);
      }
      return [extraction, ...prev];
    });
  };

  // Data Action Handlers - Forests
  const saveForest = (forest: Forest) => {
    setForests(prev => {
      const exists = prev.find(f => f.id === forest.id);
      if (exists) return prev.map(f => f.id === forest.id ? forest : f);
      return [...prev, forest];
    });
  };

  const deleteForest = (id: string) => {
    setForests(prev => prev.filter(f => f.id !== id));
    setCosts(prev => prev.filter(c => c.forestId !== id));
  };

  // Data Action Handlers - Harvesters
  const saveHarvester = (harvester: Harvester) => {
    setHarvesters(prev => {
      const exists = prev.find(h => h.id === harvester.id);
      if (exists) return prev.map(h => h.id === harvester.id ? harvester : h);
      return [...prev, harvester];
    });
  };

  const deleteHarvester = (id: string) => {
    setHarvesters(prev => prev.filter(h => h.id !== id));
  };

  // Data Action Handlers - Hauliers
  const saveHaulier = (haulier: PrivateHaulier) => {
    setHauliers(prev => {
      const exists = prev.find(h => h.id === haulier.id);
      if (exists) return prev.map(h => h.id === haulier.id ? haulier : h);
      return [...prev, haulier];
    });
  };

  const deleteHaulier = (id: string) => {
    setHauliers(prev => prev.filter(h => h.id !== id));
  };

  const saveHaulierInvoice = (invoice: HaulierInvoice) => {
    setHaulierInvoices(prev => {
      const exists = prev.find(i => i.id === invoice.id);
      if (exists) return prev.map(i => i.id === invoice.id ? invoice : i);
      return [invoice, ...prev];
    });
  };

  const deleteHaulierInvoice = (id: string) => {
    setHaulierInvoices(prev => prev.filter(i => i.id !== id));
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard forests={forests} extractions={extractions} products={products} />;
      case 'forests':
        return <ForestManager 
          forests={forests} 
          onSave={saveForest} 
          onDelete={deleteForest} 
          costs={costs} 
          setCosts={setCosts} 
          products={products} 
        />;
      case 'products':
        return <ProductManager products={products} setProducts={setProducts} />;
      case 'harvesters':
        return <HarvesterManager 
          harvesters={harvesters} 
          onSave={saveHarvester} 
          onDelete={deleteHarvester} 
        />;
      case 'hauliers':
        return <HaulierManager 
          hauliers={hauliers} 
          onSave={saveHaulier} 
          onDelete={deleteHaulier}
          invoices={haulierInvoices}
          onSaveInvoice={saveHaulierInvoice}
          onDeleteInvoice={deleteHaulierInvoice}
          companyDetails={companyDetails}
          products={products}
        />;
      case 'settings':
        return <Settings companyDetails={companyDetails} setCompanyDetails={setCompanyDetails} />;
      case 'extractions':
        return <ExtractionLog 
          extractions={extractions} 
          onDelete={deleteExtraction}
          onSave={saveExtraction}
          forests={forests} 
          products={products}
          costs={costs}
          harvesters={harvesters}
          companyDetails={companyDetails}
        />;
      default:
        return <Dashboard forests={forests} extractions={extractions} products={products} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <div className="print-hide">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
