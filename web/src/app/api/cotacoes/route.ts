import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { randomUUID } from 'crypto';

// GET: Listar todas as cotações
export async function GET() {
  const cotacoes = db.prepare('SELECT * FROM cotacoes ORDER BY data DESC').all();
  return NextResponse.json(cotacoes);
}

// POST: Criar nova cotação
export async function POST(req: NextRequest) {
  const data = await req.json();
  const id = randomUUID();
  db.prepare(`INSERT INTO cotacoes (
    id, data, modelo, valor_carro, opcional, pintura, valor_mercado, percentual_desc, economia, valor_final, vendedora, cliente, tel, obs, status
  ) VALUES (
    @id, @data, @modelo, @valor_carro, @opcional, @pintura, @valor_mercado, @percentual_desc, @economia, @valor_final, @vendedora, @cliente, @tel, @obs, @status
  )`).run({ ...data, id });
  return NextResponse.json({ ok: true, id });
}
