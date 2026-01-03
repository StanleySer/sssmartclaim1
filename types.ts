export enum PaymentMethod {
  CASH = 'Cash',
  CREDIT_CARD = 'Credit Card'
}

export interface ClaimItem {
  id: string;
  date: string; // stored as DD.MM.YYYY or YYYY-MM-DD
  description: string; // Company Name / Description
  amount: number;
  paymentMethod: PaymentMethod;
  remarks: string;
  claimantName: string; // The person making the claim (e.g., Datin Pang)
  refNo?: string;
}

export interface ExtractedReceiptData {
  date?: string;
  merchant?: string;
  total?: number;
}
