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
import { Seller } from '@/types';
import { formatPhone, validatePhone } from '@/lib/calculations';
import { exportSellersToExcel } from '@/lib/excel';

interface SellersTabProps {
  sellers: Seller[];
  onAdd: (name: string, phone?: string) => void;
  onUpdate: (id: string, updates: Partial<Seller>) => void;
  onDelete: (id: string) => void;
}

export function SellersTab({ sellers, onAdd, onUpdate, onDelete }: SellersTabProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSeller, setEditingSeller] = useState<Seller | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');

  const handleOpenDialog = (seller?: Seller) => {
    if (seller) {
      setEditingSeller(seller);
      setName(seller.name);
      setPhone(seller.phone || '');
    } else {
      setEditingSeller(null);
      setName('');
      setPhone('');
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
    if (!name.trim()) return;
    if (phone && !validatePhone(phone)) {
      setPhoneError('Telefone inválido');
      return;
    }

    try {
      if (editingSeller) {
        await updateSeller(editingSeller.id, { name: name.trim(), phone: phone || undefined });
        toast.success('Vendedor atualizado!');
      } else {
        await addSeller(name.trim(), phone || undefined);
        toast.success('Vendedor criado!');
      }
      setIsDialogOpen(false);
    } catch (error) {
      toast.error('Erro ao salvar vendedor');
    }
  };

  return (
    <Card className="animate-fade-in shadow-card">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="font-display text-lg md:text-xl">Vendedores Cadastrados</CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => exportSellersToExcel(sellers)} className="flex-1 sm:flex-none">
            <Download className="mr-2 h-4 w-4" />
            <span className="hidden xs:inline">Exportar</span>
          </Button>
          <Button size="sm" onClick={() => handleOpenDialog()} className="flex-1 sm:flex-none">
            <Plus className="mr-2 h-4 w-4" />
            <span className="hidden xs:inline">Novo</span> Vendedor
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {sellers.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            Nenhum vendedor cadastrado. Clique em "Novo Vendedor" para começar.
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
                    <TableHead className="w-[100px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sellers.map((seller) => (
                    <TableRow key={seller.id} className="group">
                      <TableCell className="font-medium">{seller.name}</TableCell>
                      <TableCell>{seller.phone || '-'}</TableCell>
                      <TableCell>
                        <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                          <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(seller)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => onDelete(seller.id)}>
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
              {sellers.map((seller) => (
                <div key={seller.id} className="rounded-lg border bg-card p-4 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm truncate">{seller.name}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{seller.phone || 'Sem telefone'}</p>
                    </div>
                    <div className="flex gap-1 ml-2">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(seller)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => onDelete(seller.id)}>
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
              {editingSeller ? 'Editar Vendedor' : 'Novo Vendedor'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="sellerName">Nome</Label>
              <Input
                id="sellerName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nome do vendedor"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="sellerPhone">Telefone (opcional)</Label>
              <Input
                id="sellerPhone"
                value={phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="(00) 00000-0000"
              />
              {phoneError && (
                <span className="text-sm text-destructive">{phoneError}</span>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit}>
              {editingSeller ? 'Salvar' : 'Adicionar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
