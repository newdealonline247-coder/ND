export type PlanDto = {
  id: number;
  slug: string;
  name: string;
  accountSize: number;
  price: number;
  profitTargetPct: number;
  dailyLossPct: number;
  maxLossPct: number;
  minTradingDays: number;
  profitSplit: number;
  popular: boolean;
  features: string[];
};

export type PayoutDto = {
  id: number;
  trader: string;
  country: string;
  amount: number;
  method: string;
  paidAt: string;
};

export type BoardEntryDto = {
  trader: string;
  country: string;
  total: number;
};

export type StatsDto = {
  traders: number;
  paidOut: number;
  countries: number;
  avgPayoutHours: number;
};

export type OrderResult = {
  ref: string;
  planName: string;
  accountSize: number;
  price: number;
  platformLogin: string;
  platformPassword: string;
  email: string;
};
