import db from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// DELETE: Remove cotação por id
export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  db.prepare('DELETE FROM cotacoes WHERE id = ?').run(id);
  return NextResponse.json({ ok: true });
}

// PUT: Atualiza cotação por id
export async function PUT(req: NextRequest) {
  const data = await req.json();
  db.prepare(`UPDATE cotacoes SET
    data=@data, modelo=@modelo, valor_carro=@valor_carro, opcional=@opcional, pintura=@pintura, valor_mercado=@valor_mercado, percentual_desc=@percentual_desc, economia=@economia, valor_final=@valor_final, vendedora=@vendedora, cliente=@cliente, tel=@tel, obs=@obs, status=@status
    WHERE id=@id
  `).run(data);
  return NextResponse.json({ ok: true });
}
