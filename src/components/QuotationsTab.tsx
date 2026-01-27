import { useState, useMemo } from 'react';
import { Plus, Pencil, Trash2, Download, Eye, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Quotation, Vehicle, Client, Seller, QuotationStatus, STATUS_LABELS, STATUS_COLORS } from '@/types';
import {
  formatCurrency,
  calculateMarketValue,
  calculateEconomy,
  calculateFinalValue,
  validateDiscount,
} from '@/lib/calculations';
import { exportQuotationsToExcel } from '@/lib/excel';
import type { QuotationInput } from '@/hooks/useData';

interface QuotationsTabProps {
  quotations: Quotation[];
  vehicles: Vehicle[];
  clients: Client[];
  sellers: Seller[];
  onAdd: (input: QuotationInput) => void;
  onUpdate: (id: string, updates: Partial<QuotationInput>) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: QuotationStatus) => void;
}

export function QuotationsTab({
  quotations,
  vehicles,
  clients,
  sellers,
  onAdd,
  onUpdate,
  onDelete,
  onStatusChange,
}: QuotationsTabProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingQuotation, setEditingQuotation] = useState<Quotation | null>(null);
  const [viewingQuotation, setViewingQuotation] = useState<Quotation | null>(null);

  // Form state
  const [vehicleId, setVehicleId] = useState('');
  const [clientId, setClientId] = useState('');
  const [sellerId, setSellerId] = useState('');
  const [optional, setOptional] = useState('0');
  const [painting, setPainting] = useState('0');
  const [discountPercent, setDiscountPercent] = useState('0');
  const [status, setStatus] = useState<QuotationStatus>('open');
  const [observations, setObservations] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  // Computed values
  const selectedVehicle = useMemo(() => vehicles.find((v) => v.id === vehicleId), [vehicles, vehicleId]);
  const selectedClient = useMemo(() => clients.find((c) => c.id === clientId), [clients, clientId]);
  const selectedSeller = useMemo(() => sellers.find((s) => s.id === sellerId), [sellers, sellerId]);

  const calculations = useMemo(() => {
    if (!selectedVehicle) return { marketValue: 0, economy: 0, finalValue: 0 };
    const marketValue = calculateMarketValue(
      selectedVehicle.basePrice,
      parseFloat(optional) || 0,
      parseFloat(painting) || 0
    );
    const economy = calculateEconomy(marketValue, parseFloat(discountPercent) || 0);
    const finalValue = calculateFinalValue(marketValue, economy);
    return { marketValue, economy, finalValue };
  }, [selectedVehicle, optional, painting, discountPercent]);

  const discountValidation = useMemo(() => validateDiscount(parseFloat(discountPercent) || 0), [discountPercent]);

  const handleOpenDialog = (quotation?: Quotation) => {
    if (quotation) {
      setEditingQuotation(quotation);
      setVehicleId(quotation.vehicleId);
      setClientId(quotation.clientId);
      setSellerId(quotation.sellerId);
      setOptional(quotation.optional.toString());
      setPainting(quotation.painting.toString());
      setDiscountPercent(quotation.discountPercent.toString());
      setStatus(quotation.status);
      setObservations(quotation.observations);
      setDate(quotation.date);
    } else {
      setEditingQuotation(null);
      setVehicleId('');
      setClientId('');
      setSellerId('');
      setOptional('0');
      setPainting('0');
      setDiscountPercent('0');
      setStatus('open');
      setObservations('');
      setDate(new Date().toISOString().split('T')[0]);
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!vehicleId || !clientId || !sellerId || !selectedVehicle || !selectedClient || !selectedSeller) return;
    if (!discountValidation.isValid) return;

    const input: QuotationInput = {
      vehicleId,
      vehicleName: selectedVehicle.name,
      vehicleBasePrice: selectedVehicle.basePrice,
      optional: parseFloat(optional) || 0,
      painting: parseFloat(painting) || 0,
      discountPercent: parseFloat(discountPercent) || 0,
      clientId,
      clientName: selectedClient.name,
      clientPhone: selectedClient.phone,
      sellerId,
      sellerName: selectedSeller.name,
      status,
      observations,
      date,
    };

    if (editingQuotation) {
      onUpdate(editingQuotation.id, input);
    } else {
      onAdd(input);
    }
    setIsDialogOpen(false);
  };

  const handleView = (quotation: Quotation) => {
    setViewingQuotation(quotation);
    setIsViewDialogOpen(true);
  };

  return (
    <Card className="animate-fade-in shadow-card">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="font-display text-lg md:text-xl">Cotações</CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => exportQuotationsToExcel(quotations)} className="flex-1 sm:flex-none">
            <Download className="mr-2 h-4 w-4" />
            <span className="hidden xs:inline">Exportar</span>
          </Button>
          <Button size="sm" onClick={() => handleOpenDialog()} className="flex-1 sm:flex-none">
            <Plus className="mr-2 h-4 w-4" />
            <span className="hidden xs:inline">Nova</span> Cotação
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {quotations.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            Nenhuma cotação cadastrada. Clique em "Nova Cotação" para começar.
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Veículo</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Vendedor</TableHead>
                    <TableHead>Valor Final</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="w-[120px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quotations.map((quotation) => (
                    <TableRow key={quotation.id} className="group">
                      <TableCell className="font-medium">{quotation.vehicleName}</TableCell>
                      <TableCell>{quotation.clientName}</TableCell>
                      <TableCell>{quotation.sellerName}</TableCell>
                      <TableCell className="font-semibold text-success">
                        {formatCurrency(quotation.finalValue)}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={quotation.status}
                          onValueChange={(value) => onStatusChange(quotation.id, value as QuotationStatus)}
                        >
                          <SelectTrigger className="w-[140px]">
                            <Badge className={STATUS_COLORS[quotation.status]}>
                              {STATUS_LABELS[quotation.status]}
                            </Badge>
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(STATUS_LABELS).map(([key, label]) => (
                              <SelectItem key={key} value={key}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>{new Date(quotation.date).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell>
                        <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                          <Button variant="ghost" size="icon" onClick={() => handleView(quotation)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(quotation)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => onDelete(quotation.id)}>
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
            <div className="lg:hidden space-y-3">
              {quotations.map((quotation) => (
                <div key={quotation.id} className="rounded-lg border bg-card p-4 shadow-sm">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm truncate">{quotation.vehicleName}</h3>
                      <p className="text-lg font-bold text-primary mt-1">{formatCurrency(quotation.finalValue)}</p>
                    </div>
                    <Badge className={STATUS_COLORS[quotation.status] + ' text-xs'}>
                      {STATUS_LABELS[quotation.status]}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mb-3">
                    <div>
                      <span className="block">Cliente</span>
                      <span className="text-foreground font-medium">{quotation.clientName}</span>
                    </div>
                    <div>
                      <span className="block">Vendedor</span>
                      <span className="text-foreground font-medium">{quotation.sellerName}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="block">Data</span>
                      <span className="text-foreground font-medium">{new Date(quotation.date).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>

                  <div className="flex gap-1 justify-end border-t pt-3">
                    <Button variant="ghost" size="sm" onClick={() => handleView(quotation)}>
                      <Eye className="h-4 w-4 mr-1" />
                      Ver
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(quotation)}>
                      <Pencil className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => onDelete(quotation.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">
              {editingQuotation ? 'Editar Cotação' : 'Nova Cotação'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label>Veículo</Label>
                <Select value={vehicleId} onValueChange={setVehicleId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um veículo" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicles.map((v) => (
                      <SelectItem key={v.id} value={v.id}>
                        {v.name} - {formatCurrency(v.basePrice)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Data</Label>
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label>Cliente</Label>
                <Select value={clientId} onValueChange={setClientId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Vendedor</Label>
                <Select value={sellerId} onValueChange={setSellerId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um vendedor" />
                  </SelectTrigger>
                  <SelectContent>
                    {sellers.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="grid gap-2">
                <Label>Opcional (R$)</Label>
                <Input
                  type="number"
                  value={optional}
                  onChange={(e) => setOptional(e.target.value)}
                  placeholder="0"
                />
              </div>
              <div className="grid gap-2">
                <Label>Pintura (R$)</Label>
                <Input
                  type="number"
                  value={painting}
                  onChange={(e) => setPainting(e.target.value)}
                  placeholder="0"
                />
              </div>
              <div className="grid gap-2">
                <Label>Desconto (%)</Label>
                <Input
                  type="number"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(e.target.value)}
                  placeholder="0"
                  max="100"
                  min="0"
                />
              </div>
            </div>

            {(discountValidation.isWarning || !discountValidation.isValid) && (
              <Alert variant={discountValidation.isValid ? 'default' : 'destructive'}>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{discountValidation.message}</AlertDescription>
              </Alert>
            )}

            {selectedVehicle && (
              <div className="rounded-lg border bg-muted/50 p-4">
                <div className="grid gap-2 text-sm sm:grid-cols-3">
                  <div>
                    <span className="text-muted-foreground">Valor de Mercado:</span>
                    <p className="font-semibold">{formatCurrency(calculations.marketValue)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Economia:</span>
                    <p className="font-semibold text-success">{formatCurrency(calculations.economy)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Valor Final:</span>
                    <p className="text-lg font-bold text-primary">{formatCurrency(calculations.finalValue)}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid gap-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as QuotationStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(STATUS_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Observações</Label>
              <Textarea
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                placeholder="Observações sobre a cotação..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={!discountValidation.isValid}>
              {editingQuotation ? 'Salvar' : 'Criar Cotação'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">Detalhes da Cotação</DialogTitle>
          </DialogHeader>
          {viewingQuotation && (
            <div className="grid gap-4 py-4">
              <div className="rounded-lg border bg-muted/30 p-4">
                <h3 className="mb-3 font-display text-lg font-semibold">{viewingQuotation.vehicleName}</h3>
                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Valor Base:</span>
                    <span>{formatCurrency(viewingQuotation.vehicleBasePrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Opcional:</span>
                    <span>{formatCurrency(viewingQuotation.optional)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pintura:</span>
                    <span>{formatCurrency(viewingQuotation.painting)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-medium">Valor de Mercado:</span>
                    <span className="font-semibold">{formatCurrency(viewingQuotation.marketValue)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Desconto:</span>
                    <span>{viewingQuotation.discountPercent}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Economia:</span>
                    <span className="text-success">{formatCurrency(viewingQuotation.economy)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-medium">Valor Final:</span>
                    <span className="text-lg font-bold text-primary">{formatCurrency(viewingQuotation.finalValue)}</span>
                  </div>
                </div>
              </div>

              <div className="grid gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Vendedor:</span>
                  <span>{viewingQuotation.sellerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cliente:</span>
                  <span>{viewingQuotation.clientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Telefone:</span>
                  <span>{viewingQuotation.clientPhone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Data:</span>
                  <span>{new Date(viewingQuotation.date).toLocaleDateString('pt-BR')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge className={STATUS_COLORS[viewingQuotation.status]}>
                    {STATUS_LABELS[viewingQuotation.status]}
                  </Badge>
                </div>
              </div>

              {viewingQuotation.observations && (
                <div className="rounded-lg border bg-muted/30 p-3">
                  <span className="text-sm font-medium">Observações:</span>
                  <p className="mt-1 text-sm text-muted-foreground">{viewingQuotation.observations}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Fechar
            </Button>
            <Button
              onClick={() => {
                setIsViewDialogOpen(false);
                if (viewingQuotation) handleOpenDialog(viewingQuotation);
              }}
            >
              Editar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
