import { create } from "zustand";
import {
  getPricing,
  getWallet,
  type Pricing,
  type Wallet,
} from "@/lib/api/services/services.api";

/**
 * Wallet balance and pricing rules, shared by every services screen.
 *
 * Both are cached in the store rather than fetched per page, because the
 * balance appears in the navbar chip, on the pricing card of all four service
 * forms, and on the credits page — refetching it in each of those would mean
 * four requests on a single navigation and four chances for them to disagree.
 *
 * Nothing here is persisted. A stale balance read from localStorage would show
 * someone credits they no longer have and let them start a generation that
 * then fails at the server, which is a worse experience than a brief skeleton.
 */
interface ServicesState {
  wallet: Wallet | null;
  pricing: Pricing | null;
  walletLoading: boolean;
  pricingLoading: boolean;

  fetchWallet: () => Promise<void>;
  fetchPricing: () => Promise<void>;
  /** Applied straight after a successful purchase or generation. */
  setBalance: (balance: number) => void;
}

const useServicesStore = create<ServicesState>((set, get) => ({
  wallet: null,
  pricing: null,
  walletLoading: false,
  pricingLoading: false,

  fetchWallet: async () => {
    set({ walletLoading: true });
    try {
      const wallet = await getWallet();
      set({ wallet, walletLoading: false });
    } catch {
      // Left null so the UI shows its loading/empty treatment rather than a
      // wrong number. The axios interceptor already surfaces auth failures.
      set({ walletLoading: false });
    }
  },

  fetchPricing: async () => {
    // Pricing rules don't change during a session, so one fetch is enough —
    // this guard is what lets every form call it on mount without thinking.
    if (get().pricing || get().pricingLoading) return;

    set({ pricingLoading: true });
    try {
      const pricing = await getPricing();
      set({ pricing, pricingLoading: false });
    } catch {
      set({ pricingLoading: false });
    }
  },

  setBalance: (balance) => {
    const wallet = get().wallet;
    set({ wallet: wallet ? { ...wallet, balance } : null });
  },
}));

export default useServicesStore;
