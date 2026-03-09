import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SellersTab } from '@/components/SellersTab';
import { useSellers } from '@/contexts/AppContext';

const addSellerMock = vi.fn();
const updateSellerMock = vi.fn();
const deleteSellerMock = vi.fn();
const exportSellersToExcelMock = vi.fn();
const toastSuccessMock = vi.fn();
const toastErrorMock = vi.fn();

vi.mock('@/contexts/AppContext', () => ({
  useSellers: vi.fn(),
}));

vi.mock('@/lib/excel', () => ({
  exportSellersToExcel: (...args: unknown[]) => exportSellersToExcelMock(...args),
}));

vi.mock('sonner', () => ({
  toast: {
    success: (...args: unknown[]) => toastSuccessMock(...args),
    error: (...args: unknown[]) => toastErrorMock(...args),
  },
}));

describe('SellersTab', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useSellers).mockReturnValue({
      sellers: [
        {
          id: 'seller-1',
          name: 'Maria',
          phone: '(11) 98765-4321',
          createdAt: new Date().toISOString(),
        },
      ],
      addSeller: addSellerMock,
      updateSeller: updateSellerMock,
      deleteSeller: deleteSellerMock,
    });
  });

  it('cria um vendedor com nome válido', async () => {
    addSellerMock.mockResolvedValue(undefined);
    render(<SellersTab />);

    fireEvent.click(screen.getByRole('button', { name: /novo vendedor/i }));
    fireEvent.change(screen.getByLabelText('Nome'), {
      target: { value: '  Joao Silva  ' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar' }));

    await waitFor(() => {
      expect(addSellerMock).toHaveBeenCalledWith('Joao Silva', undefined);
      expect(toastSuccessMock).toHaveBeenCalledWith('Vendedor criado!');
    });
  });

  it('valida nome obrigatório e telefone inválido', async () => {
    render(<SellersTab />);

    fireEvent.click(screen.getByRole('button', { name: /novo vendedor/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar' }));
    expect(screen.getByText('Nome é obrigatório')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Nome'), { target: { value: 'Pedro' } });
    fireEvent.change(screen.getByLabelText('Telefone (opcional)'), {
      target: { value: '123' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar' }));

    expect(screen.getByText('Telefone inválido')).toBeInTheDocument();
    expect(addSellerMock).not.toHaveBeenCalled();
  });

  it('reseta formulário ao cancelar', () => {
    render(<SellersTab />);

    fireEvent.click(screen.getByRole('button', { name: /novo vendedor/i }));
    fireEvent.change(screen.getByLabelText('Nome'), { target: { value: 'Temp' } });

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    fireEvent.click(screen.getByRole('button', { name: /novo vendedor/i }));

    expect(screen.getByLabelText('Nome')).toHaveValue('');
  });

  it('confirma antes de excluir vendedor', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    deleteSellerMock.mockResolvedValue(undefined);

    render(<SellersTab />);
    fireEvent.click(screen.getAllByRole('button', { name: /excluir vendedor maria/i })[0]);

    await waitFor(() => {
      expect(confirmSpy).toHaveBeenCalled();
      expect(deleteSellerMock).toHaveBeenCalledWith('seller-1');
      expect(toastSuccessMock).toHaveBeenCalledWith('Vendedor removido!');
    });
  });

  it('exporta vendedores para excel', () => {
    render(<SellersTab />);

    fireEvent.click(screen.getByRole('button', { name: /exportar/i }));

    expect(exportSellersToExcelMock).toHaveBeenCalledTimes(1);
    expect(exportSellersToExcelMock).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ id: 'seller-1', name: 'Maria' }),
      ])
    );
  });
});
