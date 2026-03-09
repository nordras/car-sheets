import React from 'react';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DataProvider, useSellers } from '@/contexts/AppContext';

const sellersAddMock = vi.fn();
const sellersUpdateMock = vi.fn();
const sellersDeleteMock = vi.fn();
const sellersToArrayMock = vi.fn();

vi.mock('dexie-react-hooks', () => ({
  useLiveQuery: vi.fn((query: () => unknown) => query()),
}));

vi.mock('@/lib/seed', () => ({
  initializeDatabase: vi.fn(),
}));

vi.mock('@/lib/calculations', async () => {
  const actual = await vi.importActual<typeof import('@/lib/calculations')>('@/lib/calculations');
  return {
    ...actual,
    generateUUID: vi.fn(() => 'seller-uuid'),
  };
});

vi.mock('@/lib/db', () => ({
  db: {
    vehicles: { toArray: vi.fn(() => Promise.resolve([])), add: vi.fn(), update: vi.fn(), delete: vi.fn() },
    clients: { toArray: vi.fn(() => Promise.resolve([])), add: vi.fn(), update: vi.fn(), delete: vi.fn() },
    sellers: {
      toArray: (...args: unknown[]) => sellersToArrayMock(...args),
      add: (...args: unknown[]) => sellersAddMock(...args),
      update: (...args: unknown[]) => sellersUpdateMock(...args),
      delete: (...args: unknown[]) => sellersDeleteMock(...args),
    },
    quotations: {
      reverse: vi.fn(() => ({ toArray: vi.fn(() => Promise.resolve([])) })),
      add: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      get: vi.fn(),
    },
  },
}));

describe('useSellers (DataProvider)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sellersToArrayMock.mockResolvedValue([]);
    sellersAddMock.mockResolvedValue(undefined);
    sellersUpdateMock.mockResolvedValue(undefined);
    sellersDeleteMock.mockResolvedValue(undefined);
  });

  it('lança erro fora do DataProvider', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useSellers())).toThrow('useSellers must be used within DataProvider');
    errorSpy.mockRestore();
  });

  it('adiciona vendedor via contexto', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <DataProvider>{children}</DataProvider>
    );
    const { result } = renderHook(() => useSellers(), { wrapper });

    await act(async () => {
      await result.current.addSeller('Clara', '(11) 91234-0000');
    });

    expect(sellersAddMock).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'seller-uuid',
        name: 'Clara',
        phone: '(11) 91234-0000',
      })
    );
  });

  it('atualiza e remove vendedor via contexto', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <DataProvider>{children}</DataProvider>
    );
    const { result } = renderHook(() => useSellers(), { wrapper });

    await act(async () => {
      await result.current.updateSeller('seller-1', { name: 'Novo Nome' });
      await result.current.deleteSeller('seller-1');
    });

    expect(sellersUpdateMock).toHaveBeenCalledWith('seller-1', { name: 'Novo Nome' });
    expect(sellersDeleteMock).toHaveBeenCalledWith('seller-1');
  });
});
