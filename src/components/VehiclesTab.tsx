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
import { Vehicle } from '@/types';
import { formatCurrency } from '@/lib/calculations';
import { exportVehiclesToExcel } from '@/lib/excel';
import { useVehicles } from '@/contexts/AppContext';
import { toast } from 'sonner';

export function VehiclesTab() {
  const { vehicles, addVehicle, updateVehicle, deleteVehicle } = useVehicles();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [name, setName] = useState('');
  const [basePrice, setBasePrice] = useState('');

  const handleOpenDialog = (vehicle?: Vehicle) => {
    if (vehicle) {
      setEditingVehicle(vehicle);
      setName(vehicle.name);
      setBasePrice(vehicle.basePrice.toString());
    } else {
      setEditingVehicle(null);
      setName('');
      setBasePrice('');
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    const price = parseFloat(basePrice);
    if (!name.trim() || price <= 0) return;

    try {
      if (editingVehicle) {
        await updateVehicle(editingVehicle.id, { name: name.trim(), basePrice: price });
        toast.success('Veículo atualizado!');
      } else {
        await addVehicle(name.trim(), price);
        toast.success('Veículo criado!');
      }
      setIsDialogOpen(false);
    } catch (error) {
      toast.error('Erro ao salvar veículo');
    }
  };

  return (
    <Card className="animate-fade-in shadow-card">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="font-display text-lg md:text-xl">Veículos Cadastrados</CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => exportVehiclesToExcel(vehicles)} className="flex-1 sm:flex-none">
            <Download className="mr-2 h-4 w-4" />
            <span className="hidden xs:inline">Exportar</span>
          </Button>
          <Button size="sm" onClick={() => handleOpenDialog()} className="flex-1 sm:flex-none">
            <Plus className="mr-2 h-4 w-4" />
            <span className="hidden xs:inline">Novo</span> Veículo
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {vehicles.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            Nenhum veículo cadastrado. Clique em "Novo Veículo" para começar.
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Preço Base</TableHead>
                    <TableHead className="w-[100px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vehicles.map((vehicle) => (
                    <TableRow key={vehicle.id} className="group">
                      <TableCell className="font-medium">{vehicle.name}</TableCell>
                      <TableCell>{formatCurrency(vehicle.basePrice)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                          <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(vehicle)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => onDelete(vehicle.id)}>
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
              {vehicles.map((vehicle) => (
                <div key={vehicle.id} className="rounded-lg border bg-card p-4 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm truncate">{vehicle.name}</h3>
                      <p className="text-lg font-semibold text-primary mt-1">{formatCurrency(vehicle.basePrice)}</p>
                    </div>
                    <div className="flex gap-1 ml-2">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(vehicle)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => onDelete(vehicle.id)}>
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
              {editingVehicle ? 'Editar Veículo' : 'Novo Veículo'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome do Veículo</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Fastback Impetus Hybrid"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="basePrice">Preço Base (R$)</Label>
              <Input
                id="basePrice"
                type="number"
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
                placeholder="171990"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit}>
              {editingVehicle ? 'Salvar' : 'Adicionar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
