import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { initializeDatabase } from '@/lib/seed';
import type { Vehicle, Client, Seller, Quotation } from '@/types';
import {
  generateUUID,
  calculateMarketValue,
  calculateEconomy,
  calculateFinalValue,
} from '@/lib/calculations';

interface VehiclesContext {
  vehicles: Vehicle[];
  addVehicle: (name: string, basePrice: number) => Promise<Vehicle>;
  updateVehicle: (id: string, updates: Partial<Omit<Vehicle, 'id' | 'createdAt'>>) => Promise<void>;
  deleteVehicle: (id: string) => Promise<void>;
}

interface ClientsContext {
  clients: Client[];
  addClient: (name: string, phone: string, email?: string) => Promise<Client>;
  updateClient: (id: string, updates: Partial<Omit<Client, 'id' | 'createdAt'>>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
}

interface SellersContext {
  sellers: Seller[];
  addSeller: (name: string, phone?: string) => Promise<Seller>;
  updateSeller: (id: string, updates: Partial<Omit<Seller, 'id' | 'createdAt'>>) => Promise<void>;
  deleteSeller: (id: string) => Promise<void>;
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
  observations: string;
  date: string;
}

interface QuotationsContext {
  quotations: Quotation[];
  addQuotation: (input: QuotationInput) => Promise<Quotation>;
  updateQuotation: (id: string, updates: Partial<QuotationInput>) => Promise<void>;
  deleteQuotation: (id: string) => Promise<void>;
}

const VehiclesCtx = createContext<VehiclesContext | undefined>(undefined);
const ClientsCtx = createContext<ClientsContext | undefined>(undefined);
const SellersCtx = createContext<SellersContext | undefined>(undefined);
const QuotationsCtx = createContext<QuotationsContext | undefined>(undefined);

interface DataProviderProps {
  children: ReactNode;
}

export function DataProvider({ children }: DataProviderProps) {
  // Initialize database on mount
  useEffect(() => {
    initializeDatabase();
  }, []);

  // Live queries
  const vehicles = useLiveQuery(() => db.vehicles.toArray(), []) || [];
  const clients = useLiveQuery(() => db.clients.toArray(), []) || [];
  const sellers = useLiveQuery(() => db.sellers.toArray(), []) || [];
  const quotations = useLiveQuery(() => db.quotations.reverse().toArray(), []) || [];

  // Vehicles operations
  const addVehicle = async (name: string, basePrice: number): Promise<Vehicle> => {
    const newVehicle: Vehicle = {
      id: generateUUID(),
      name,
      basePrice,
      createdAt: new Date().toISOString(),
    };
    await db.vehicles.add(newVehicle);
    return newVehicle;
  };

  const updateVehicle = async (id: string, updates: Partial<Omit<Vehicle, 'id' | 'createdAt'>>) => {
    await db.vehicles.update(id, updates);
  };

  const deleteVehicle = async (id: string) => {
    await db.vehicles.delete(id);
  };

  // Clients operations
  const addClient = async (name: string, phone: string, email?: string): Promise<Client> => {
    const newClient: Client = {
      id: generateUUID(),
      name,
      phone,
      email,
      createdAt: new Date().toISOString(),
    };
    await db.clients.add(newClient);
    return newClient;
  };

  const updateClient = async (id: string, updates: Partial<Omit<Client, 'id' | 'createdAt'>>) => {
    await db.clients.update(id, updates);
  };

  const deleteClient = async (id: string) => {
    await db.clients.delete(id);
  };

  // Sellers operations
  const addSeller = async (name: string, phone?: string): Promise<Seller> => {
    const newSeller: Seller = {
      id: generateUUID(),
      name,
      phone,
      createdAt: new Date().toISOString(),
    };
    await db.sellers.add(newSeller);
    return newSeller;
  };

  const updateSeller = async (id: string, updates: Partial<Omit<Seller, 'id' | 'createdAt'>>) => {
    await db.sellers.update(id, updates);
  };

  const deleteSeller = async (id: string) => {
    await db.sellers.delete(id);
  };

  // Quotations operations
  const addQuotation = async (input: QuotationInput): Promise<Quotation> => {
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
    
    await db.quotations.add(newQuotation);
    return newQuotation;
  };

  const updateQuotation = async (id: string, updates: Partial<QuotationInput>) => {
    const quotation = await db.quotations.get(id);
    if (!quotation) return;

    const updatedData = { ...quotation, ...updates };
    const marketValue = calculateMarketValue(
      updatedData.vehicleBasePrice,
      updatedData.optional,
      updatedData.painting
    );
    const economy = calculateEconomy(marketValue, updatedData.discountPercent);
    const finalValue = calculateFinalValue(marketValue, economy);

    await db.quotations.update(id, {
      ...updates,
      marketValue,
      economy,
      finalValue,
      updatedAt: new Date().toISOString(),
    });
  };

  const deleteQuotation = async (id: string) => {
    await db.quotations.delete(id);
  };

  return (
    <VehiclesCtx.Provider value={{ vehicles, addVehicle, updateVehicle, deleteVehicle }}>
      <ClientsCtx.Provider value={{ clients, addClient, updateClient, deleteClient }}>
        <SellersCtx.Provider value={{ sellers, addSeller, updateSeller, deleteSeller }}>
          <QuotationsCtx.Provider value={{ quotations, addQuotation, updateQuotation, deleteQuotation }}>
            {children}
          </QuotationsCtx.Provider>
        </SellersCtx.Provider>
      </ClientsCtx.Provider>
    </VehiclesCtx.Provider>
  );
}

// Custom hooks
export function useVehicles() {
  const context = useContext(VehiclesCtx);
  if (!context) {
    throw new Error('useVehicles must be used within DataProvider');
  }
  return context;
}

export function useClients() {
  const context = useContext(ClientsCtx);
  if (!context) {
    throw new Error('useClients must be used within DataProvider');
  }
  return context;
}

export function useSellers() {
  const context = useContext(SellersCtx);
  if (!context) {
    throw new Error('useSellers must be used within DataProvider');
  }
  return context;
}

export function useQuotations() {
  const context = useContext(QuotationsCtx);
  if (!context) {
    throw new Error('useQuotations must be used within DataProvider');
  }
  return context;
}
