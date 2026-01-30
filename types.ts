
export interface Forest {
  id: string;
  name: string;
  location: string;
  area: number; // in hectares
  description: string;
  ownerName: string;
  ownerAddress: string;
  ownerEmail?: string; // Added owner email
  ownerIban?: string;  // Added owner IBAN
  fellingLicenseNumber?: string; // Added felling license number
}

export interface Harvester {
  id: string;
  name: string;
  address: string;
  vatNumber: string;
  email?: string; // Added harvester email
  iban?: string;  // Added harvester IBAN
}

export interface PrivateHaulier {
  id: string;
  name: string;
  address: string;
  vatNumber: string;
  email?: string;
  sortCode?: string;
  accountNumber?: string;
  iban?: string;
}

export interface CompanyDetails {
  name: string;
  address: string;
  vatNumber: string;
  phone?: string;  // Added phone field
  email?: string;  // Added email field
  iban?: string;   // Added company bank IBAN
  forestVatRate: number;    // e.g., 5 for 5%
  harvesterVatRate: number; // e.g., 23 for 23%
  resaleVatRate: number;    // New field for customer resale
}

export interface ProductType {
  id: string;
  name: string;
  unit: string;
}

export interface ForestProductCost {
  forestId: string;
  productTypeId: string;
  baseRate: number;
  harvestingRate: number;
  transportRate: number;
}

export type ExtractionDestination = 'Own Use' | 'Resold';

export interface ExtractionItem {
  id: string;
  productTypeId: string;
  docketRef: string;
  quantity: number;
  baseCostPerTonne: number;
  harvestingRatePerTonne: number;
  transportRatePerTonne: number;
  salePricePerTonne: number;
}

export interface Extraction {
  id: string;
  forestId: string;
  date: string;
  destination: ExtractionDestination;
  buyer: string; 
  harvesterId: string; 
  items: ExtractionItem[];

  // Aggregated Totals (Calculated on Save)
  harvestingCost: number; 
  transportCost: number;  
  salePrice: number;      
  baseCostTotal: number;  
  totalQuantity: number;
}

export interface HaulierLoad {
  id: string;
  productTypeId: string;
  transactionNumber: string;
  date: string;
  quantity: number;
  rate: number;
}

export interface HaulierInvoice {
  id: string; // Sequential starting from 1000
  haulierId: string;
  date: string;
  vatRate: number;
  notes: string;
  loads: HaulierLoad[];
}

export interface DashboardStats {
  totalRevenue: number;
  totalVolume: number;
  activeForests: number;
  totalExtractions: number;
}
