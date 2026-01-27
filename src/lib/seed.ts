import { db } from './db';
import type { Vehicle, Client, Seller, Quotation } from '@/types';
import { generateUUID, calculateMarketValue, calculateEconomy, calculateFinalValue } from './calculations';

const SEED_DATA = {
  sellers: [
    {
      id: generateUUID(),
      name: 'Tania Maira',
      phone: '(11) 98765-4321',
      createdAt: new Date().toISOString(),
    },
  ],
  clients: [
    {
      id: generateUUID(),
      name: 'barcelos ind flavio',
      phone: '(11) 91234-5678',
      email: '',
      createdAt: new Date().toISOString(),
    },
  ],
  vehicles: [
    {
      id: generateUUID(),
      name: 'Toro diesel ranch',
      basePrice: 233990.0,
      createdAt: new Date().toISOString(),
    },
  ],
};

export async function initializeDatabase() {
  try {
    // Check if database is empty
    const vehicleCount = await db.vehicles.count();
    
    if (vehicleCount === 0) {
      console.log('Database is empty, running seed...');
      
      // Add sellers
      await db.sellers.bulkAdd(SEED_DATA.sellers);
      
      // Add clients
      await db.clients.bulkAdd(SEED_DATA.clients);
      
      // Add vehicles
      await db.vehicles.bulkAdd(SEED_DATA.vehicles);
      
      // Create example quotation based on the image
      const seller = SEED_DATA.sellers[0];
      const client = SEED_DATA.clients[0];
      const vehicle = SEED_DATA.vehicles[0];
      
      const optional = 0;
      const painting = 2490.0;
      const discountPercent = 17;
      
      const marketValue = calculateMarketValue(vehicle.basePrice, optional, painting);
      const economy = calculateEconomy(marketValue, discountPercent);
      const finalValue = calculateFinalValue(marketValue, economy);
      
      const exampleQuotation: Quotation = {
        id: generateUUID(),
        vehicleId: vehicle.id,
        vehicleName: vehicle.name,
        vehicleBasePrice: vehicle.basePrice,
        optional,
        painting,
        marketValue,
        discountPercent,
        economy,
        finalValue,
        clientId: client.id,
        clientName: client.name,
        clientPhone: client.phone,
        sellerId: seller.id,
        sellerName: seller.name,
        observations: 'este carro nao tem desconto de fábrica',
        date: '2025-01-25',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      await db.quotations.add(exampleQuotation);
      
      console.log('Seed completed successfully!');
    } else {
      console.log('Database already has data, skipping seed.');
    }
    
    // Migrate from localStorage if exists
    await migrateFromLocalStorage();
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

async function migrateFromLocalStorage() {
  try {
    const localVehicles = localStorage.getItem('sgpa_vehicles');
    const localClients = localStorage.getItem('sgpa_clients');
    const localSellers = localStorage.getItem('sgpa_sellers');
    const localQuotations = localStorage.getItem('sgpa_quotations');
    
    if (localVehicles) {
      const vehicles = JSON.parse(localVehicles) as Vehicle[];
      const existingIds = await db.vehicles.toCollection().primaryKeys();
      const newVehicles = vehicles.filter(v => !existingIds.includes(v.id));
      if (newVehicles.length > 0) {
        await db.vehicles.bulkAdd(newVehicles);
        console.log(`Migrated ${newVehicles.length} vehicles from localStorage`);
      }
    }
    
    if (localClients) {
      const clients = JSON.parse(localClients) as Client[];
      const existingIds = await db.clients.toCollection().primaryKeys();
      const newClients = clients.filter(c => !existingIds.includes(c.id));
      if (newClients.length > 0) {
        await db.clients.bulkAdd(newClients);
        console.log(`Migrated ${newClients.length} clients from localStorage`);
      }
    }
    
    if (localSellers) {
      const sellers = JSON.parse(localSellers) as Seller[];
      const existingIds = await db.sellers.toCollection().primaryKeys();
      const newSellers = sellers.filter(s => !existingIds.includes(s.id));
      if (newSellers.length > 0) {
        await db.sellers.bulkAdd(newSellers);
        console.log(`Migrated ${newSellers.length} sellers from localStorage`);
      }
    }
    
    if (localQuotations) {
      const quotations = JSON.parse(localQuotations) as Quotation[];
      const existingIds = await db.quotations.toCollection().primaryKeys();
      const newQuotations = quotations.filter(q => !existingIds.includes(q.id));
      if (newQuotations.length > 0) {
        await db.quotations.bulkAdd(newQuotations);
        console.log(`Migrated ${newQuotations.length} quotations from localStorage`);
      }
    }
    
    // Clean up localStorage after migration (optional)
    // localStorage.removeItem('sgpa_vehicles');
    // localStorage.removeItem('sgpa_clients');
    // localStorage.removeItem('sgpa_sellers');
    // localStorage.removeItem('sgpa_quotations');
  } catch (error) {
    console.error('Error migrating from localStorage:', error);
  }
}
