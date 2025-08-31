"use client";

import { useStoreInitializer } from "@/hooks/useStoreInitializer";

const StoreInitializer = () => {
  useStoreInitializer();

  // This component renders nothing but initializes the store
  return null;
};

export default StoreInitializer;
