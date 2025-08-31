import { create } from "zustand";
import { persist } from "zustand/middleware";

interface InvoiceState {
  invoiceCount: number;
  maxInvoices: number;
  isPro: boolean;
  isInitializing: boolean;
  setInvoiceCount: (count: number) => void;
  incrementInvoiceCount: () => void;
  decrementInvoiceCount: () => void;
  setProStatus: (isPro: boolean) => void;
  setInitializing: (isInitializing: boolean) => void;
}

export const useInvoiceStore = create<InvoiceState>()(
  persist(
    (set, get) => ({
      invoiceCount: 0,
      maxInvoices: 5,
      isPro: false,
      isInitializing: false,
      setInvoiceCount: (count) => set({ invoiceCount: count }),
      incrementInvoiceCount: () =>
        set({ invoiceCount: get().invoiceCount + 1 }),
      decrementInvoiceCount: () =>
        set({ invoiceCount: Math.max(0, get().invoiceCount - 1) }),
      setProStatus: (isPro) => set({ isPro }),
      setInitializing: (isInitializing) => set({ isInitializing }),
    }),
    {
      name: "invoice-storage",
    }
  )
);
