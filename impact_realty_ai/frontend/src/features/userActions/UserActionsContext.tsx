"use client";
import { createContext, useContext, ReactNode } from "react";
import { useUserActions } from "./useUserActions";
import type { ContentItem } from "@/types/content";

// Define the context type
interface UserActionsContextType {
  selectedIds: Set<string>;
  loading: boolean;
  error: string | null;
  selectItem: (item: ContentItem) => Promise<void>;
  deselectItem: (item: ContentItem) => Promise<void>;
  isSelected: (item: ContentItem) => boolean;
}

// Create the context with a default value
const UserActionsContext = createContext<UserActionsContextType | undefined>(undefined);

// Create a provider component
export function UserActionsProvider({ children }: { children: ReactNode }) {
  const userActionsData = useUserActions();
  
  return (
    <UserActionsContext.Provider value={userActionsData}>
      {children}
    </UserActionsContext.Provider>
  );
}

// Create a hook to use the user actions context
export function useUserActionsContext() {
  const context = useContext(UserActionsContext);
  if (context === undefined) {
    throw new Error("useUserActionsContext must be used within a UserActionsProvider");
  }
  return context;
} 