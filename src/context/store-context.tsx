"use client";

import * as React from "react";

interface StoreContextType {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

const StoreContext = React.createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [searchQuery, setSearchQuery] = React.useState("");

  return (
    <StoreContext.Provider value={{ searchQuery, setSearchQuery }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = React.useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
}
