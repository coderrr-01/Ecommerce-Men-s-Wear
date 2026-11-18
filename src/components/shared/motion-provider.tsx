"use client";

import { createContext, useContext } from "react";
import { MotionConfig } from "motion/react";

const CspNonceContext = createContext<string | undefined>(undefined);

export function useCspNonce() {
  return useContext(CspNonceContext);
}

export function MotionProvider({ children, nonce }: { children: React.ReactNode; nonce?: string }) {
  return (
    <CspNonceContext.Provider value={nonce}>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </CspNonceContext.Provider>
  );
}
