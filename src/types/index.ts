export interface Vehicle {
  id: string;
  name: string;
  basePrice: number;
  createdAt: string;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email?: string;
  createdAt: string;
}

export interface Seller {
  id: string;
  name: string;
  phone?: string;
  createdAt: string;
}

export interface Quotation {
  id: string;
  vehicleId: string;
  vehicleName: string;
  vehicleBasePrice: number;
  optional: number;
  painting: number;
  marketValue: number;
  discountPercent: number;
  economy: number;
  finalValue: number;
  clientId: string;
  clientName: string;
  clientPhone: string;
  sellerId: string;
  sellerName: string;
  observations: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}
