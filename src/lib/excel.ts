import * as XLSX from 'xlsx';
import type { Quotation, Vehicle, Client, Seller } from '@/types';
import { formatCurrency } from '@/lib/calculations';

export function exportQuotationsToExcel(quotations: Quotation[]): void {
  const data = quotations.map(q => ({
    'ID': q.id,
    'Veículo': q.vehicleName,
    'Valor Base': formatCurrency(q.vehicleBasePrice),
    'Opcional': formatCurrency(q.optional),
    'Pintura': formatCurrency(q.painting),
    'Valor de Mercado': formatCurrency(q.marketValue),
    '% Desconto': `${q.discountPercent}%`,
    'Economia': formatCurrency(q.economy),
    'Valor Final': formatCurrency(q.finalValue),
    'Cliente': q.clientName,
    'Telefone': q.clientPhone,
    'Vendedor': q.sellerName,
    'Observações': q.observations,
    'Data': new Date(q.date).toLocaleDateString('pt-BR'),
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Cotações');
  
  const colWidths = [
    { wch: 36 }, { wch: 30 }, { wch: 15 }, { wch: 15 }, { wch: 15 },
    { wch: 18 }, { wch: 12 }, { wch: 15 }, { wch: 15 }, { wch: 20 },
    { wch: 18 }, { wch: 20 }, { wch: 15 }, { wch: 40 }, { wch: 12 },
  ];
  ws['!cols'] = colWidths;

  XLSX.writeFile(wb, `cotacoes_${new Date().toISOString().split('T')[0]}.xlsx`);
}

export function exportVehiclesToExcel(vehicles: Vehicle[]): void {
  const data = vehicles.map(v => ({
    'ID': v.id,
    'Nome': v.name,
    'Preço Base': formatCurrency(v.basePrice),
    'Criado em': new Date(v.createdAt).toLocaleDateString('pt-BR'),
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Veículos');
  XLSX.writeFile(wb, `veiculos_${new Date().toISOString().split('T')[0]}.xlsx`);
}

export function exportClientsToExcel(clients: Client[]): void {
  const data = clients.map(c => ({
    'ID': c.id,
    'Nome': c.name,
    'Telefone': c.phone,
    'Email': c.email || '',
    'Criado em': new Date(c.createdAt).toLocaleDateString('pt-BR'),
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Clientes');
  XLSX.writeFile(wb, `clientes_${new Date().toISOString().split('T')[0]}.xlsx`);
}

export function exportSellersToExcel(sellers: Seller[]): void {
  const data = sellers.map(s => ({
    'ID': s.id,
    'Nome': s.name,
    'Telefone': s.phone || '',
    'Criado em': new Date(s.createdAt).toLocaleDateString('pt-BR'),
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Vendedores');
  XLSX.writeFile(wb, `vendedores_${new Date().toISOString().split('T')[0]}.xlsx`);
}

export function importFromExcel<T>(file: File, existingIds: string[]): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as T[];
        
        // Filter out existing IDs
        const filtered = jsonData.filter((item: any) => !existingIds.includes(item.ID || item.id));
        resolve(filtered);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}
