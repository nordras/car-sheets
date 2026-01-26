import Database from 'better-sqlite3';
import { join } from 'path';

// Caminho do banco local na raiz do projeto web
const dbPath = join(process.cwd(), 'cotacoes.db');
const db = new Database(dbPath);

// Criação da tabela de cotações se não existir
// id: UUID, data: string, modelo, valor_carro, opcional, pintura, valor_mercado, percentual_desc, economia, valor_final, vendedora, cliente, tel, obs, status
const createTable = `CREATE TABLE IF NOT EXISTS cotacoes (
  id TEXT PRIMARY KEY,
  data TEXT NOT NULL,
  modelo TEXT NOT NULL,
  valor_carro REAL NOT NULL,
  opcional REAL,
  pintura REAL,
  valor_mercado REAL NOT NULL,
  percentual_desc REAL,
  economia REAL,
  valor_final REAL NOT NULL,
  vendedora TEXT,
  cliente TEXT,
  tel TEXT,
  obs TEXT,
  status TEXT
);`;
db.exec(createTable);

export default db;
