import { getInvoiceStats } from "@/app/actions/invoices";
import { useInvoiceStore } from "@/stores/invoice-store";
import { useEffect } from "react";

export function useStoreInitializer() {
  const { setInvoiceCount, setProStatus, setInitializing } = useInvoiceStore();

  useEffect(() => {
    const initializeStore = async () => {
      setInitializing(true);

      try {
        const result = await getInvoiceStats();

        if (result.success) {
          setInvoiceCount(result.data!.invoiceCount);
          setProStatus(result.data!.isPro);
        }
      } catch (error) {
        console.error("Failed to initialize invoice store:", error);
      }

      setInitializing(false);
    };

    initializeStore();
  }, []);
}
