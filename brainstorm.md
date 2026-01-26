# SGPA – Brainstorming & Planning

## Objetivo
Desenvolver uma SPA simples para cotação de veículos, com CRUD, exportação/importação Excel, e banco de dados local.

---

## Decisões Tomadas
- SPA com Next.js, DaisyUI para UI.
- Banco de dados local (SQLite).
- CRUD de cotações, veículos, clientes, vendedores em uma única tela.
- Cada cotação tem UUID auto-gerado e campo de data.
- Importação Excel não atualiza cotações existentes (IDs duplicados são ignorados).
- Exportação Excel disponível para todos os módulos.
- Validação de telefone nas telas de cadastro.
- Sem autenticação de usuário.
- Foco principal: cotação de veículos.
- Fase 2: filtro por data nas cotações.

---

## Regras de Negócio
- Cálculo automático de margens, descontos, economia e valor final.
- Trava de desconto: alerta/bloqueio para descontos acima do permitido.
- Status da proposta: Aberta, Em Negociação, Vendida, Perdida.
- Observações podem ser adicionadas à cotação.

---

## Funcionalidades
- CRUD completo em uma tela única.
- Exportação/importação Excel.
- Validação de telefone.
- Visualização e edição de cotações existentes.
- Filtro por data (fase 2).

---

## Tecnologias
- Next.js
- DaisyUI
- Node.js (API)
- SQLite
- xlsx (Excel import/export)

---

## Ideias Futuras
- PDF/print das cotações.
- Dashboard/resumo de vendas.
- Integração com WhatsApp.
- CRM e histórico de contato.

---

## Links Úteis
- [README.md](README.md)

---

## Atualize este arquivo conforme novas decisões e ideias surgirem.