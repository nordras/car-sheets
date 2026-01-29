import { useState, useMemo } from 'react';
import { Plus, Trash2, Printer, X, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ComboboxCreate } from '@/components/ui/combobox-create';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useVehicles, useClients, useSellers, useQuotations } from '@/contexts/AppContext';
import type { Quotation } from '@/types';
import { formatCurrency, calculateMarketValue, calculateEconomy, calculateFinalValue } from '@/lib/calculations';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export function QuotationsTab() {
  const { vehicles, addVehicle } = useVehicles();
  const { clients, addClient } = useClients();
  const { sellers, addSeller } = useSellers();
  const { quotations, addQuotation, updateQuotation, deleteQuotation } = useQuotations();

  // Form state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [vehicleId, setVehicleId] = useState('');
  const [clientId, setClientId] = useState('');
  const [sellerId, setSellerId] = useState('');
  const [optional, setOptional] = useState('0');
  const [painting, setPainting] = useState('0');
  const [discountPercent, setDiscountPercent] = useState('0');
  const [observations, setObservations] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [useCustomPhone, setUseCustomPhone] = useState(false);
  const [customPhone, setCustomPhone] = useState('');

  // Drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<'vehicle' | 'client' | 'pricing' | 'final'>('vehicle');

  // Validation errors
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  const selectedVehicle = useMemo(() => vehicles.find((v) => v.id === vehicleId), [vehicles, vehicleId]);
  const selectedClient = useMemo(() => clients.find((c) => c.id === clientId), [clients, clientId]);
  const selectedSeller = useMemo(() => sellers.find((s) => s.id === sellerId), [sellers, sellerId]);

  // Calculations
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

  // Clear form
  const clearForm = () => {
    setEditingId(null);
    setVehicleId('');
    setClientId('');
    setSellerId('');
    setOptional('0');
    setPainting('0');
    setDiscountPercent('0');
    setObservations('');
    setDate(new Date().toISOString().split('T')[0]);
    setUseCustomPhone(false);
    setCustomPhone('');
    setCurrentStep('vehicle');
    setErrors({});
  };

  // Load quotation for editing
  const loadQuotation = (quotation: Quotation) => {
    setEditingId(quotation.id);
    setVehicleId(quotation.vehicleId);
    setClientId(quotation.clientId);
    setSellerId(quotation.sellerId);
    setOptional(quotation.optional.toString());
    setPainting(quotation.painting.toString());
    setDiscountPercent(quotation.discountPercent.toString());
    setObservations(quotation.observations);
    setDate(quotation.date);
    
    // Check if phone is custom
    const client = clients.find(c => c.id === quotation.clientId);
    if (client && client.phone !== quotation.clientPhone) {
      setUseCustomPhone(true);
      setCustomPhone(quotation.clientPhone);
    } else {
      setUseCustomPhone(false);
      setCustomPhone('');
    }
    setCurrentStep('vehicle');
    setErrors({});
    setIsDrawerOpen(true);
  };

  // Step validation
  const validateStep = (step: string): boolean => {
    switch (step) {
      case 'vehicle':
        return !!vehicleId && !!date;
      case 'client':
        return !!clientId && !!sellerId;
      case 'pricing':
        return true; // Optional fields
      case 'final':
        return true;
      default:
        return false;
    }
  };

  // Navigation handlers
  const handleNext = () => {
    if (!validateStep(currentStep)) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    const steps: Array<'vehicle' | 'client' | 'pricing' | 'final'> = ['vehicle', 'client', 'pricing', 'final'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const handlePrevious = () => {
    const steps: Array<'vehicle' | 'client' | 'pricing' | 'final'> = ['vehicle', 'client', 'pricing', 'final'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  // Validate and save
  const handleSave = async () => {
    const newErrors: Record<string, boolean> = {};

    if (!vehicleId) newErrors.vehicleId = true;
    if (!clientId) newErrors.clientId = true;
    if (!sellerId) newErrors.sellerId = true;
    if (!date) newErrors.date = true;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Preencha todos os campos obrigatórios');
      // Jump to first step with errors
      if (newErrors.vehicleId || newErrors.date) setCurrentStep('vehicle');
      else if (newErrors.clientId || newErrors.sellerId) setCurrentStep('client');
      return;
    }

    // Check discount
    const discount = parseFloat(discountPercent) || 0;
    if (discount > 15) {
      toast.warning('Atenção: desconto acima de 15%');
    }

    const phoneToUse = useCustomPhone ? customPhone : (selectedClient?.phone || '');

    const quotationData = {
      vehicleId,
      vehicleName: selectedVehicle!.name,
      vehicleBasePrice: selectedVehicle!.basePrice,
      optional: parseFloat(optional) || 0,
      painting: parseFloat(painting) || 0,
      discountPercent: discount,
      clientId,
      clientName: selectedClient!.name,
      clientPhone: phoneToUse,
      sellerId,
      sellerName: selectedSeller!.name,
      observations,
      date,
    };

    try {
      if (editingId) {
        await updateQuotation(editingId, quotationData);
        toast.success('Cotação atualizada com sucesso!');
      } else {
        await addQuotation(quotationData);
        toast.success('Cotação criada com sucesso!');
      }
      setIsDrawerOpen(false);
      clearForm();
    } catch (error) {
      toast.error('Erro ao salvar cotação');
      console.error(error);
    }
  };

  // Delete quotation
  const handleDelete = async (id: string) => {
    if (confirm('Deseja realmente excluir esta cotação?')) {
      try {
        await deleteQuotation(id);
        toast.success('Cotação excluída');
        if (editingId === id) {
          clearForm();
        }
      } catch (error) {
        toast.error('Erro ao excluir cotação');
      }
    }
  };

  // Print quotation
  const handlePrint = () => {
    if (!editingId && !vehicleId) {
      toast.error('Selecione ou preencha uma cotação para imprimir');
      return;
    }
    window.print();
  };

  // Create handlers for comboboxes
  const handleCreateVehicle = async (name: string) => {
    const basePrice = prompt(`Digite o preço base do veículo "${name}":`, '0');
    if (basePrice) {
      const vehicle = await addVehicle(name, parseFloat(basePrice) || 0);
      setVehicleId(vehicle.id);
      toast.success(`Veículo "${name}" criado!`);
    }
  };

  const handleCreateClient = async (name: string) => {
    const phone = prompt(`Digite o telefone do cliente "${name}":`, '');
    if (phone !== null) {
      const client = await addClient(name, phone || '');
      setClientId(client.id);
      toast.success(`Cliente "${name}" criado!`);
    }
  };

  const handleCreateSeller = async (name: string) => {
    const seller = await addSeller(name);
    setSellerId(seller.id);
    toast.success(`Vendedor "${name}" criado!`);
  };

  return (
    <div className="space-y-6">
      {/* Print Area */}
      <div id="print-area" className="hidden print:block">
        <div className="print-header">
          <img src="/logo.png" alt="QA Logo" />
          <h1>Cotação de Veículo</h1>
          <p>Data: {new Date(date).toLocaleDateString('pt-BR')}</p>
        </div>

        <div className="print-info-grid">
          <div className="print-info-item">
            <div className="print-info-label">Veículo</div>
            <div className="print-info-value">{selectedVehicle?.name || '-'}</div>
          </div>
          <div className="print-info-item">
            <div className="print-info-label">Cliente</div>
            <div className="print-info-value">{selectedClient?.name || '-'}</div>
          </div>
          <div className="print-info-item">
            <div className="print-info-label">Telefone</div>
            <div className="print-info-value">
              {useCustomPhone ? customPhone : selectedClient?.phone || '-'}
            </div>
          </div>
          <div className="print-info-item">
            <div className="print-info-label">Vendedor</div>
            <div className="print-info-value">{selectedSeller?.name || '-'}</div>
          </div>
        </div>

        <table className="print-calculations">
          <tbody>
            <tr>
              <th>Valor Base do Veículo</th>
              <td className="value">{formatCurrency(selectedVehicle?.basePrice || 0)}</td>
            </tr>
            <tr>
              <th>Opcional</th>
              <td className="value">{formatCurrency(parseFloat(optional) || 0)}</td>
            </tr>
            <tr>
              <th>Pintura</th>
              <td className="value">{formatCurrency(parseFloat(painting) || 0)}</td>
            </tr>
            <tr className="total-row">
              <th>Valor de Mercado</th>
              <td className="value">{formatCurrency(calculations.marketValue)}</td>
            </tr>
            <tr>
              <th>Desconto ({discountPercent}%)</th>
              <td className="value">- {formatCurrency(calculations.economy)}</td>
            </tr>
            <tr className="total-row">
              <th>Valor Final</th>
              <td className="value">{formatCurrency(calculations.finalValue)}</td>
            </tr>
          </tbody>
        </table>

        {observations && (
          <div className="print-observations">
            <div className="print-observations-title">Observações:</div>
            <div>{observations}</div>
          </div>
        )}

        <div className="print-footer">
          <p>Cotação gerada em {new Date().toLocaleString('pt-BR')}</p>
        </div>
      </div>

      {/* Drawer Form */}
      <div className="flex justify-between items-center no-print">
        <h2 className="text-2xl font-bold">Cotações</h2>
        <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <DrawerTrigger asChild>
            <Button size="lg" onClick={() => {
              clearForm();
              setIsDrawerOpen(true);
            }}>
              <Plus className="mr-2 h-5 w-5" />
              Nova Cotação
            </Button>
          </DrawerTrigger>
          <DrawerContent className="max-h-[90vh]">
            <DrawerHeader>
              <DrawerTitle>
                {editingId ? 'Editar Cotação' : 'Nova Cotação'}
              </DrawerTitle>
              <DrawerDescription>
                Preencha os dados da cotação em {currentStep === 'vehicle' ? '4' : currentStep === 'client' ? '3' : currentStep === 'pricing' ? '2' : '1'} etapas
              </DrawerDescription>
            </DrawerHeader>

            <div className="flex-1 overflow-y-auto px-4">
              <Tabs value={currentStep} onValueChange={(value) => setCurrentStep(value as any)} className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="vehicle" className="text-xs sm:text-sm">1. Veículo</TabsTrigger>
                  <TabsTrigger value="client" className="text-xs sm:text-sm" disabled={!vehicleId || !date}>2. Cliente</TabsTrigger>
                  <TabsTrigger value="pricing" className="text-xs sm:text-sm" disabled={!clientId || !sellerId}>3. Valores</TabsTrigger>
                  <TabsTrigger value="final" className="text-xs sm:text-sm" disabled={!clientId || !sellerId}>4. Finalizar</TabsTrigger>
                </TabsList>

                {/* Step 1: Vehicle Selection */}
                <TabsContent value="vehicle" className="space-y-4 mt-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <Label htmlFor="vehicle">Veículo *</Label>
                      <ComboboxCreate
                        options={vehicles.map((v) => ({
                          value: v.id,
                          label: `${v.name} - ${formatCurrency(v.basePrice)}`,
                          searchText: v.name,
                        }))}
                        value={vehicleId}
                        onValueChange={setVehicleId}
                        onCreate={handleCreateVehicle}
                        placeholder="Selecione ou crie um veículo"
                        searchPlaceholder="Buscar veículo..."
                        emptyText="Nenhum veículo encontrado"
                        className={cn(errors.vehicleId && 'border-red-500 animate-shake')}
                      />
                    </div>
                    <div>
                      <Label htmlFor="basePrice">Valor Base</Label>
                      <Input
                        id="basePrice"
                        type="text"
                        value={selectedVehicle ? formatCurrency(selectedVehicle.basePrice) : ''}
                        disabled
                        className="bg-muted"
                      />
                    </div>
                    <div>
                      <Label htmlFor="date">Data *</Label>
                      <Input
                        id="date"
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className={cn(errors.date && 'border-red-500 animate-shake')}
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* Step 2: Client & Seller */}
                <TabsContent value="client" className="space-y-4 mt-4">

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="seller">Vendedor *</Label>
                      <ComboboxCreate
                        options={sellers.map((s) => ({
                          value: s.id,
                          label: s.name,
                        }))}
                        value={sellerId}
                        onValueChange={setSellerId}
                        onCreate={handleCreateSeller}
                        placeholder="Selecione ou crie um vendedor"
                        searchPlaceholder="Buscar vendedor..."
                        emptyText="Nenhum vendedor encontrado"
                        className={cn(errors.sellerId && 'border-red-500 animate-shake')}
                      />
                    </div>
                    <div>
                      <Label htmlFor="client">Cliente *</Label>
                      <ComboboxCreate
                        options={clients.map((c) => ({
                          value: c.id,
                          label: `${c.name} - ${c.phone}`,
                          searchText: c.name,
                        }))}
                        value={clientId}
                        onValueChange={(value) => {
                          setClientId(value);
                          setUseCustomPhone(false);
                          setCustomPhone('');
                        }}
                        onCreate={handleCreateClient}
                        placeholder="Selecione ou crie um cliente"
                        searchPlaceholder="Buscar cliente..."
                        emptyText="Nenhum cliente encontrado"
                        className={cn(errors.clientId && 'border-red-500 animate-shake')}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="clientPhone">Telefone do Cliente</Label>
                    <Input
                      id="clientPhone"
                      type="tel"
                      value={useCustomPhone ? customPhone : selectedClient?.phone || ''}
                      onChange={(e) => setCustomPhone(e.target.value)}
                      disabled={!useCustomPhone}
                      className={cn(!useCustomPhone && 'bg-muted')}
                    />
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="useCustomPhone"
                        checked={useCustomPhone}
                        onCheckedChange={(checked) => {
                          setUseCustomPhone(checked as boolean);
                          if (!checked) setCustomPhone('');
                        }}
                        disabled={!clientId}
                      />
                      <label
                        htmlFor="useCustomPhone"
                        className="text-sm text-muted-foreground cursor-pointer"
                      >
                        Usar outro número para esta cotação
                      </label>
                    </div>
                  </div>
                </TabsContent>

                {/* Step 3: Pricing */}
                <TabsContent value="pricing" className="space-y-4 mt-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <Label htmlFor="optional">Opcional</Label>
                      <Input
                        id="optional"
                        type="number"
                        value={optional}
                        onChange={(e) => setOptional(e.target.value)}
                        placeholder="0"
                        min="0"
                        step="0.01"
                        inputMode="decimal"
                      />
                    </div>
                    <div>
                      <Label htmlFor="painting">Pintura</Label>
                      <Input
                        id="painting"
                        type="number"
                        value={painting}
                        onChange={(e) => setPainting(e.target.value)}
                        placeholder="0"
                        min="0"
                        step="0.01"
                        inputMode="decimal"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Label htmlFor="marketValue">Valor de Mercado</Label>
                      <Input
                        id="marketValue"
                        type="text"
                        value={formatCurrency(calculations.marketValue)}
                        disabled
                        className="bg-muted font-semibold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <Label htmlFor="discount">Desconto (%)</Label>
                      <Input
                        id="discount"
                        type="number"
                        value={discountPercent}
                        onChange={(e) => setDiscountPercent(e.target.value)}
                        placeholder="0"
                        min="0"
                        max="100"
                        step="0.1"
                        inputMode="decimal"
                      />
                    </div>
                    <div>
                      <Label htmlFor="economy">Economia</Label>
                      <Input
                        id="economy"
                        type="text"
                        value={formatCurrency(calculations.economy)}
                        disabled
                        className="bg-muted text-red-600 font-semibold"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Label htmlFor="finalValue">Valor Final</Label>
                      <Input
                        id="finalValue"
                        type="text"
                        value={formatCurrency(calculations.finalValue)}
                        disabled
                        className="bg-primary/10 font-bold text-lg text-primary"
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* Step 4: Final (Observations & Summary) */}
                <TabsContent value="final" className="space-y-4 mt-4">

                  <div>
                    <Label htmlFor="observations">Observações</Label>
                    <Textarea
                      id="observations"
                      value={observations}
                      onChange={(e) => setObservations(e.target.value)}
                      placeholder="Informações adicionais sobre a cotação..."
                      rows={4}
                    />
                  </div>

                  {/* Summary Card */}
                  <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
                    <h4 className="font-semibold text-sm">Resumo da Cotação</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Veículo:</span>
                        <span className="font-medium">{selectedVehicle?.name || '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Cliente:</span>
                        <span className="font-medium">{selectedClient?.name || '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Vendedor:</span>
                        <span className="font-medium">{selectedSeller?.name || '-'}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t">
                        <span className="text-muted-foreground">Valor Final:</span>
                        <span className="font-bold text-primary text-lg">
                          {formatCurrency(calculations.finalValue)}
                        </span>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            <DrawerFooter>
              <div className="flex gap-2 w-full">
                {currentStep !== 'vehicle' && (
                  <Button variant="outline" onClick={handlePrevious} className="flex-1">
                    Voltar
                  </Button>
                )}
                {currentStep !== 'final' ? (
                  <Button onClick={handleNext} className="flex-1">
                    Próximo
                  </Button>
                ) : (
                  <Button onClick={handleSave} className="flex-1">
                    {editingId ? 'Atualizar Cotação' : 'Salvar Cotação'}
                  </Button>
                )}
              </div>
              {editingId && currentStep === 'final' && (
                <Button
                  variant="destructive"
                  onClick={() => {
                    handleDelete(editingId);
                    setIsDrawerOpen(false);
                  }}
                >
                  Excluir Cotação
                </Button>
              )}
              <DrawerClose asChild>
                <Button variant="outline">Cancelar</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>

        {editingId && (
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Imprimir
          </Button>
        )}
      </div>

      {/* Quotations List */}
      <Card className="no-print">
        <CardHeader>
          <CardTitle>Cotações Cadastradas ({quotations.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {quotations.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              Nenhuma cotação cadastrada. Clique em "Nova Cotação" para começar.
            </div>
          ) : (
            <>
              {/* Mobile Cards */}
              <div className="md:hidden space-y-3">
                {quotations.map((quotation) => {
                  const quotationVehicle = vehicles.find(v => v.id === quotation.vehicleId);
                  const quotationClient = clients.find(c => c.id === quotation.clientId);
                  const quotationSeller = sellers.find(s => s.id === quotation.sellerId);
                  
                  return (
                    <div
                      key={quotation.id}
                      className="rounded-lg border bg-card shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => loadQuotation(quotation)}
                    >
                      {/* Header */}
                      <div className="p-4 pb-3 border-b bg-muted/30">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-base truncate">{quotation.vehicleName}</h3>
                            <p className="text-sm text-muted-foreground truncate">{quotation.clientName}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="text-lg font-bold text-primary">
                              {formatCurrency(quotation.finalValue)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(quotation.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Body */}
                      <div className="p-4 pt-3 space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Vendedor</span>
                          <span className="font-medium">{quotation.sellerName}</span>
                        </div>

                        {quotation.discountPercent > 0 && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Desconto</span>
                            <span className="font-medium text-destructive">
                              {quotation.discountPercent}% ({formatCurrency(quotation.economy)})
                            </span>
                          </div>
                        )}

                        {/* Action buttons */}
                        <div className="flex gap-2 pt-2" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => {
                              loadQuotation(quotation);
                              handlePrint();
                            }}
                          >
                            <Printer className="mr-2 h-4 w-4" />
                            Imprimir
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(quotation.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Veículo</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Vendedor</TableHead>
                    <TableHead className="text-right">Valor Final</TableHead>
                    <TableHead className="w-[100px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quotations.map((quotation) => (
                    <TableRow
                      key={quotation.id}
                      className={cn(
                        'cursor-pointer hover:bg-muted/50',
                        editingId === quotation.id && 'bg-primary/5'
                      )}
                      onClick={() => loadQuotation(quotation)}
                    >
                      <TableCell>{new Date(quotation.date).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell className="font-medium">{quotation.vehicleName}</TableCell>
                      <TableCell>{quotation.clientName}</TableCell>
                      <TableCell>{quotation.sellerName}</TableCell>
                      <TableCell className="text-right font-semibold text-primary">
                        {formatCurrency(quotation.finalValue)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(quotation.id);
                          }}
                          aria-label="Excluir cotação"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
