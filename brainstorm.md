# SGPA – Brainstorming & Planning

## Objetivo
Desenvolver uma SPA simples para cotação de veículos, com CRUD, exportação/importação Excel, e banco de dados local.

---

## Decisões Tomadas
- SPA com React, TypeScript, Vite
- **Dexie.js (IndexedDB) para banco de dados local** com reatividade via useLiveQuery
- **Context API** para gerenciamento de estado global (sem prop drilling)
- **ComboboxCreate** inteligente que cria registros automaticamente
- CRUD de cotações, veículos, clientes, vendedores
- Cada cotação tem UUID auto-gerado e campo de data
- Importação Excel não atualiza cotações existentes (IDs duplicados são ignorados)
- Exportação Excel disponível para todos os módulos
- Validação de telefone nas telas de cadastro
- **Sem autenticação de usuário**
- Foco principal: cotação de veículos
- **Layout single-screen tipo planilha** com edição inline
- **Sistema de telefone override** com checkbox (não atualiza cadastro do cliente)
- **Print stylesheet otimizado para A4**
- **Validação visual no submit** com animação shake (Tailwind)
- **Toast para desconto >15%** (não bloqueia salvamento)
- **Seed automático** com Tania Maira, barcelos ind flavio, Toro diesel ranch
- **Sem campo status** nas cotações (removido)
- Fase 2: filtro por data nas cotações

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
- **React 18** + TypeScript
- **Vite** (build tool)
- **Dexie.js** (IndexedDB wrapper com reatividade)
- **shadcn/ui** (componentes Radix UI) + Tailwind CSS
- **Context API** (gerenciamento de estado)
- **Sonner** (toast notifications)
- **xlsx** (Excel import/export)

---

## Ideias Futuras
- PDF/print das cotações ✅ **Implementado com print stylesheet**
- Dashboard/resumo de vendas
- Integração com WhatsApp para compartilhar cotações
- CRM e histórico de contato
- **Filtro por data nas cotações (Fase 2)**
- **Multi-usuário com autenticação**
- **Backup/restore para nuvem (Dropbox, Google Drive)**
- **Modo offline com service worker**

---

## Fase 3 - Melhorias Avançadas
- **Histórico de alterações (Audit Trail)**
  - Adicionar campos `updatedBy` e `updatedAt` em quotations
  - Tabela `quotation_history` com snapshot de mudanças
  - Log de quem criou/editou cada cotação
  - Timeline visual de modificações
- **Versionamento de cotações**
  - Salvar versões antigas ao editar
  - Comparação side-by-side de versões
  - Restaurar versão anterior

---

## Links Úteis
- [README.md](README.md)

---

## Atualize este arquivo conforme novas decisões e ideias surgirem.