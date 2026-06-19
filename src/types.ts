export interface RepairTicket {
  id: string;
  customerName: string;
  companyName?: string;
  device: string;
  issueType: "screen" | "battery" | "button" | "other" | string;
  status: "open" | "parts_assigned" | "technician_working" | "quality_check" | "completed";
  quotedPrice: number;
  tax: number;
  discount: number;
  total: number;
  createdAt: string;
  userId?: string;
  internalNotes?: string;
  completedAt?: string;
}

export interface POSLog {
  timestamp: string;
  level: string;
  message: string;
  source: "Square" | "CellSmart" | "WebHook-Receiver";
}

export interface QuoteBreakdown {
  partsCost: number;
  laborCost: number;
  overhead: number;
  subtotal: number;
  partInventoryId?: string;
  partName?: string;
  stockStatus?: string;
  stockLocation?: string;
  itemInStock?: boolean;
  supplyChainPremium?: number;
  laborHours?: number;
  hourlyLaborRate?: number;
}

export interface TaxResponse {
  valid: boolean;
  zipCode: string;
  city: string;
  rate: number;
  message: string;
}

export interface QuoteResponse {
  baseQuote: QuoteBreakdown;
  taxInfo: {
    zipCode: string;
    city: string;
    rate: number;
    calculatedTax: number;
  };
  discountInfo: {
    applied: boolean;
    percentage: number;
    amount: number;
    company: string;
  };
  subtotal: number;
  grandTotal: number;
}

export interface HighPriorityLead {
  id: string;
  customerName: string;
  phone: string;
  deviceModel: string;
  status: "pending" | "in_progress" | "contacted" | "completed" | "cancelled";
  createdAt: string;
  userId: string;
}

export interface S2CFeedback {
  id: string;
  userId: string;
  pathway: "backlight" | "charging" | "short_rail" | string;
  rating: "up" | "down";
  deviceModel: string;
  notes?: string;
  ammeterReading: number;
  batteryTemp: number;
  createdAt: string;
}

