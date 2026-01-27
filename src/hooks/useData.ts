import { useLocalStorage } from './useLocalStorage';
import { Quotation, Vehicle, Client, Seller, QuotationStatus } from '@/types';
import {
  generateUUID,
  calculateMarketValue,
  calculateEconomy,
  calculateFinalValue,
} from '@/lib/calculations';

export function useVehicles() {
  const [vehicles, setVehicles] = useLocalStorage<Vehicle[]>('sgpa_vehicles', []);

  const addVehicle = (name: string, basePrice: number): Vehicle => {
    const newVehicle: Vehicle = {
      id: generateUUID(),
      name,
      basePrice,
      createdAt: new Date().toISOString(),
    };
    setVehicles(prev => [...prev, newVehicle]);
    return newVehicle;
  };

  const updateVehicle = (id: string, updates: Partial<Omit<Vehicle, 'id' | 'createdAt'>>) => {
    setVehicles(prev => prev.map(v => v.id === id ? { ...v, ...updates } : v));
  };

  const deleteVehicle = (id: string) => {
    setVehicles(prev => prev.filter(v => v.id !== id));
  };

  return { vehicles, addVehicle, updateVehicle, deleteVehicle, setVehicles };
}

export function useClients() {
  const [clients, setClients] = useLocalStorage<Client[]>('sgpa_clients', []);

  const addClient = (name: string, phone: string, email?: string): Client => {
    const newClient: Client = {
      id: generateUUID(),
      name,
      phone,
      email,
      createdAt: new Date().toISOString(),
    };
    setClients(prev => [...prev, newClient]);
    return newClient;
  };

  const updateClient = (id: string, updates: Partial<Omit<Client, 'id' | 'createdAt'>>) => {
    setClients(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const deleteClient = (id: string) => {
    setClients(prev => prev.filter(c => c.id !== id));
  };

  return { clients, addClient, updateClient, deleteClient, setClients };
}

export function useSellers() {
  const [sellers, setSellers] = useLocalStorage<Seller[]>('sgpa_sellers', []);

  const addSeller = (name: string, phone?: string): Seller => {
    const newSeller: Seller = {
      id: generateUUID(),
      name,
      phone,
      createdAt: new Date().toISOString(),
    };
    setSellers(prev => [...prev, newSeller]);
    return newSeller;
  };

  const updateSeller = (id: string, updates: Partial<Omit<Seller, 'id' | 'createdAt'>>) => {
    setSellers(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const deleteSeller = (id: string) => {
    setSellers(prev => prev.filter(s => s.id !== id));
  };

  return { sellers, addSeller, updateSeller, deleteSeller, setSellers };
}

export interface QuotationInput {
  vehicleId: string;
  vehicleName: string;
  vehicleBasePrice: number;
  optional: number;
  painting: number;
  discountPercent: number;
  clientId: string;
  clientName: string;
  clientPhone: string;
  sellerId: string;
  sellerName: string;
  status: QuotationStatus;
  observations: string;
  date: string;
}

export function useQuotations() {
  const [quotations, setQuotations] = useLocalStorage<Quotation[]>('sgpa_quotations', []);

  const createQuotation = (input: QuotationInput): Quotation => {
    const marketValue = calculateMarketValue(input.vehicleBasePrice, input.optional, input.painting);
    const economy = calculateEconomy(marketValue, input.discountPercent);
    const finalValue = calculateFinalValue(marketValue, economy);

    const newQuotation: Quotation = {
      id: generateUUID(),
      ...input,
      marketValue,
      economy,
      finalValue,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setQuotations(prev => [...prev, newQuotation]);
    return newQuotation;
  };

  const updateQuotation = (id: string, input: Partial<QuotationInput>): void => {
    setQuotations(prev => prev.map(q => {
      if (q.id !== id) return q;

      const updated = { ...q, ...input };
      const marketValue = calculateMarketValue(
        updated.vehicleBasePrice,
        updated.optional,
        updated.painting
      );
      const economy = calculateEconomy(marketValue, updated.discountPercent);
      const finalValue = calculateFinalValue(marketValue, economy);

      return {
        ...updated,
        marketValue,
        economy,
        finalValue,
        updatedAt: new Date().toISOString(),
      };
    }));
  };

  const deleteQuotation = (id: string): void => {
    setQuotations(prev => prev.filter(q => q.id !== id));
  };

  const updateStatus = (id: string, status: QuotationStatus): void => {
    setQuotations(prev => prev.map(q =>
      q.id === id ? { ...q, status, updatedAt: new Date().toISOString() } : q
    ));
  };

  return { quotations, createQuotation, updateQuotation, deleteQuotation, updateStatus, setQuotations };
}
