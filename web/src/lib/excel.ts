import * as XLSX from 'xlsx';

export function exportCotacoesToExcel(cotacoes: any[], fileName = 'cotacoes.xlsx') {
  const ws = XLSX.utils.json_to_sheet(cotacoes);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Cotações');
  XLSX.writeFile(wb, fileName);
}

export function importCotacoesFromExcel(file: File): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const ws = workbook.Sheets[workbook.SheetNames[0]];
      const cotacoes = XLSX.utils.sheet_to_json(ws);
      resolve(cotacoes);
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}
