import api from "../axios";
import type { ApiResponse, PaginationInfo } from "../types";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SERVICES API
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * The paid side of the app: the resume builder, the report and presentation
 * generators, the project-build enquiry form, and the credit wallet behind
 * them all.
 *
 * Note that no price is ever computed here. Quotes come from `getQuote` and
 * the pricing rules come from `getPricing`, both served by the backend from
 * the same constants that do the actual charging — a number shown in the UI
 * that disagrees with the number charged would be the worst possible bug on a
 * payments screen, and duplicating the formula client-side is exactly how that
 * happens.
 */

export type ServiceKind = "report" | "ppt" | "resume";

export type JobStatus =
  | "queued"
  | "generating"
  | "completed"
  | "failed"
  | "refunded";

export interface Wallet {
  balance: number;
  lifetimePurchased: number;
  lifetimeSpent: number;
}

export interface CreditTransaction {
  _id: string;
  direction: "credit" | "debit";
  amount: number;
  balanceAfter: number;
  reason: "purchase" | "generation" | "refund" | "promo" | "admin_adjustment";
  description: string;
  createdAt: string;
}

export interface CreditPack {
  id: string;
  credits: number;
  label: string;
  popular?: boolean;
}

export interface Pricing {
  paisePerCredit: number;
  includedUnits: number;
  baseCredits: number;
  creditsPerExtraUnit: number;
  resumeCredits: number;
  limits: {
    minUnits: number;
    maxReportPages: number;
    maxPptSlides: number;
    minPurchaseCredits: number;
    maxPurchaseCredits: number;
  };
  packs: CreditPack[];
  paymentsEnabled: boolean;
}

export interface QuoteLine {
  label: string;
  credits: number;
}

export interface Quote {
  service: ServiceKind;
  units: number;
  total: number;
  lines: QuoteLine[];
}

export interface GenerationJob {
  _id: string;
  service: ServiceKind;
  status: JobStatus;
  units: number;
  creditsCharged: number;
  title: string;
  errorMessage: string | null;
  output?: {
    fileName: string | null;
    extension: string | null;
    bytes: number | null;
  };
  createdAt: string;
  completedAt: string | null;
}

export interface ProjectEnquiry {
  _id: string;
  projectTitle: string;
  requirement: string;
  status: "new" | "contacted" | "quoted" | "accepted" | "declined" | "completed";
  minimumQuoteInr: number;
  quotedAmountInr: number | null;
  createdAt: string;
}

/* ── Pricing & wallet ───────────────────────────────────────────────────── */

export const getPricing = async () => {
  const response = await api.get<ApiResponse<Pricing>>("/services/pricing");
  return response.data.data!;
};

export const getWallet = async () => {
  const response =
    await api.get<ApiResponse<{ wallet: Wallet }>>("/services/wallet");
  return response.data.data!.wallet;
};

export const getTransactions = async (page = 1, limit = 20) => {
  const response = await api.get<
    ApiResponse<{
      transactions: CreditTransaction[];
      pagination: PaginationInfo;
    }>
  >("/services/wallet/transactions", { params: { page, limit } });
  return response.data.data!;
};

/* ── Payments ───────────────────────────────────────────────────────────── */

export interface CreatedOrder {
  order: {
    id: string;
    razorpayOrderId: string;
    credits: number;
    amountPaise: number;
    currency: string;
  };
  razorpayKeyId: string;
}

export const createOrder = async (credits: number) => {
  const response = await api.post<ApiResponse<CreatedOrder>>(
    "/services/orders",
    { credits },
  );
  return response.data.data!;
};

export const verifyPayment = async (payload: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}) => {
  const response = await api.post<
    ApiResponse<{ credits: number; balance?: number }>
  >("/services/orders/verify", payload);
  return response.data;
};

/* ── Quoting ────────────────────────────────────────────────────────────── */

export const getQuote = async (service: ServiceKind, units?: number) => {
  const response = await api.post<ApiResponse<Quote>>("/services/quote", {
    service,
    units,
  });
  return response.data.data!;
};

/** The department-shaped default that pre-fills the format box. */
export const getDefaultFormat = async (service: ServiceKind) => {
  const response = await api.get<ApiResponse<{ format: string }>>(
    `/services/formats/${service}`,
  );
  return response.data.data!.format;
};

/* ── Generation ─────────────────────────────────────────────────────────── */

type JobAccepted = ApiResponse<{ job: { id: string; status: JobStatus } }>;

export const generateReport = async (payload: Record<string, unknown>) => {
  const response = await api.post<JobAccepted>(
    "/services/generate/report",
    payload,
  );
  return response.data.data!.job;
};

export const generatePpt = async (payload: Record<string, unknown>) => {
  const response = await api.post<JobAccepted>(
    "/services/generate/ppt",
    payload,
  );
  return response.data.data!.job;
};

export const generateResume = async (payload: Record<string, unknown>) => {
  const response = await api.post<JobAccepted>(
    "/services/generate/resume",
    payload,
  );
  return response.data.data!.job;
};

export const getJob = async (jobId: string) => {
  const response = await api.get<ApiResponse<{ job: GenerationJob }>>(
    `/services/jobs/${jobId}`,
  );
  return response.data.data!.job;
};

export const listJobs = async (params: {
  page?: number;
  limit?: number;
  service?: ServiceKind;
} = {}) => {
  const response = await api.get<
    ApiResponse<{ jobs: GenerationJob[]; pagination: PaginationInfo }>
  >("/services/jobs", { params });
  return response.data.data!;
};

/**
 * Returns a short-lived signed URL for the finished file. The link expires in
 * five minutes, so it's fetched at the moment the user clicks rather than
 * stored alongside the job.
 */
export const getDownloadUrl = async (jobId: string) => {
  const response = await api.get<
    ApiResponse<{ url: string; fileName: string; expiresInSeconds: number }>
  >(`/services/jobs/${jobId}/download`);
  return response.data.data!;
};

/* ── Project enquiries ──────────────────────────────────────────────────── */

export const submitProjectEnquiry = async (payload: {
  fullName: string;
  email: string;
  phone: string;
  projectTitle?: string;
  requirement: string;
  deadline?: string;
  techPreference?: string;
  budgetNote?: string;
}) => {
  const response = await api.post<ApiResponse<{ enquiry: ProjectEnquiry }>>(
    "/services/project-enquiries",
    payload,
  );
  return response.data;
};

export const listProjectEnquiries = async () => {
  const response = await api.get<ApiResponse<{ enquiries: ProjectEnquiry[] }>>(
    "/services/project-enquiries",
  );
  return response.data.data!.enquiries;
};
