import Dexie, { Table } from 'dexie';
import type { Vehicle, Client, Seller, Quotation } from '@/types';

export class CarSheetsDB extends Dexie {
  vehicles!: Table<Vehicle, string>;
  clients!: Table<Client, string>;
  sellers!: Table<Seller, string>;
  quotations!: Table<Quotation, string>;

  constructor() {
    super('CarSheetsDB');
    
    this.version(1).stores({
      vehicles: 'id, name, basePrice, createdAt',
      clients: 'id, name, phone, email, createdAt',
      sellers: 'id, name, phone, createdAt',
      quotations: 'id, vehicleId, clientId, sellerId, date, createdAt, updatedAt',
    });
  }
}

export const db = new CarSheetsDB();
