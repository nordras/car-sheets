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
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Seller } from '@/types';
import { formatPhone, validatePhone } from '@/lib/calculations';
import { exportSellersToExcel } from '@/lib/excel';
import { useSellers } from '@/contexts/AppContext';
import { toast } from 'sonner';

export function SellersTab() {
  const { sellers, addSeller, updateSeller, deleteSeller } = useSellers();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSeller, setEditingSeller] = useState<Seller | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [nameError, setNameError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setEditingSeller(null);
    setName('');
    setPhone('');
    setNameError('');
    setPhoneError('');
    setIsSubmitting(false);
  };

  const handleDialogChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      resetForm();
    }
  };

  const handleOpenDialog = (seller?: Seller) => {
    if (seller) {
      setEditingSeller(seller);
      setName(seller.name);
      setPhone(seller.phone || '');
    } else {
      resetForm();
    }
    setNameError('');
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
    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedName) {
      setNameError('Nome é obrigatório');
      return;
    }

    if (trimmedPhone && !validatePhone(trimmedPhone)) {
      setPhoneError('Telefone inválido');
      return;
    }

    try {
      setIsSubmitting(true);
      if (editingSeller) {
        await updateSeller(editingSeller.id, {
          name: trimmedName,
          phone: trimmedPhone || undefined,
        });
        toast.success('Vendedor atualizado!');
      } else {
        await addSeller(trimmedName, trimmedPhone || undefined);
        toast.success('Vendedor criado!');
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error('Erro ao salvar vendedor');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSeller = async (seller: Seller) => {
    const confirmed = window.confirm(`Deseja excluir o vendedor "${seller.name}"?`);
    if (!confirmed) return;

    try {
      await deleteSeller(seller.id);
      toast.success('Vendedor removido!');
    } catch (error) {
      toast.error('Erro ao remover vendedor');
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
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Editar vendedor ${seller.name}`}
                            onClick={() => handleOpenDialog(seller)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Excluir vendedor ${seller.name}`}
                            onClick={() => handleDeleteSeller(seller)}
                          >
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
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Editar vendedor ${seller.name}`}
                        onClick={() => handleOpenDialog(seller)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Excluir vendedor ${seller.name}`}
                        onClick={() => handleDeleteSeller(seller)}
                      >
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

      <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">
              {editingSeller ? 'Editar Vendedor' : 'Novo Vendedor'}
            </DialogTitle>
            <DialogDescription>
              Preencha os dados do vendedor para salvar o cadastro.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="sellerName">Nome</Label>
              <Input
                id="sellerName"
                value={name}
                maxLength={100}
                onChange={(e) => {
                  setName(e.target.value);
                  if (nameError) {
                    setNameError('');
                  }
                }}
                placeholder="Nome do vendedor"
              />
              {nameError && <span className="text-sm text-destructive">{nameError}</span>}
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
            <Button variant="outline" onClick={() => handleDialogChange(false)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : editingSeller ? 'Salvar' : 'Adicionar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
