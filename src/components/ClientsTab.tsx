import { useState } from 'react';
import { Plus, Pencil, Trash2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Client } from '@/types';
import { formatPhone, validatePhone } from '@/lib/calculations';
import { exportClientsToExcel } from '@/lib/excel';
import { useClients } from '@/contexts/AppContext';
import { toast } from 'sonner';

export function ClientsTab() {
  const { clients, addClient, updateClient, deleteClient } = useClients();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [phoneError, setPhoneError] = useState('');

  const handleOpenDialog = (client?: Client) => {
    if (client) {
      setEditingClient(client);
      setName(client.name);
      setPhone(client.phone);
      setEmail(client.email || '');
    } else {
      setEditingClient(null);
      setName('');
      setPhone('');
      setEmail('');
    }
    setPhoneError('');
    setIsDialogOpen(true);
  };

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhone(value);
    setPhone(formatted);
    if (formatted && !validatePhone(formatted)) {
      setPhoneError('Telefone inválido');
    } else {
      setPhoneError('');
    }
  };

  const handleSubmit = async () => {
    if (!name.trim() || !phone.trim()) return;
    if (!validatePhone(phone)) {
      setPhoneError('Telefone inválido');
      return;
    }

    try {
      if (editingClient) {
        await updateClient(editingClient.id, { name: name.trim(), phone, email: email.trim() || undefined });
        toast.success('Cliente atualizado!');
      } else {
        await addClient(name.trim(), phone, email.trim() || undefined);
        toast.success('Cliente criado!');
      }
      setIsDialogOpen(false);
    } catch (error) {
      toast.error('Erro ao salvar cliente');
    }
  };

  return (
    <Card className="animate-fade-in shadow-card">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="font-display text-lg md:text-xl">Clientes Cadastrados</CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => exportClientsToExcel(clients)} className="flex-1 sm:flex-none">
            <Download className="mr-2 h-4 w-4" />
            <span className="hidden xs:inline">Exportar</span>
          </Button>
          <Button size="sm" onClick={() => handleOpenDialog()} className="flex-1 sm:flex-none">
            <Plus className="mr-2 h-4 w-4" />
            <span className="hidden xs:inline">Novo</span> Cliente
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {clients.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            Nenhum cliente cadastrado. Clique em "Novo Cliente" para começar.
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="w-[100px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clients.map((client) => (
                    <TableRow key={client.id} className="group">
                      <TableCell className="font-medium">{client.name}</TableCell>
                      <TableCell>{client.phone}</TableCell>
                      <TableCell>{client.email || '-'}</TableCell>
                      <TableCell>
                        <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                          <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(client)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => onDelete(client.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
              {clients.map((client) => (
                <div key={client.id} className="rounded-lg border bg-card p-4 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm truncate">{client.name}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{client.phone}</p>
                      {client.email && <p className="text-xs text-muted-foreground truncate">{client.email}</p>}
                    </div>
                    <div className="flex gap-1 ml-2">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(client)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => onDelete(client.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">
              {editingClient ? 'Editar Cliente' : 'Novo Cliente'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="clientName">Nome</Label>
              <Input
                id="clientName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nome do cliente"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="clientPhone">Telefone</Label>
              <Input
                id="clientPhone"
                value={phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="(00) 00000-0000"
              />
              {phoneError && (
                <span className="text-sm text-destructive">{phoneError}</span>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="clientEmail">Email (opcional)</Label>
              <Input
                id="clientEmail"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@exemplo.com"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit}>
              {editingClient ? 'Salvar' : 'Adicionar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
