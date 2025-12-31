
export interface ReceiptItem {
  name: string;
  quantity: number;
  price: number;
  category?: string;
}

export interface Receipt {
  id: string;
  storeName: string;
  date: string;
  total: number;
  items: ReceiptItem[];
  currency: string;
  rawText?: string;
  imageUrl?: string;
  createdAt: number;
}

export interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  totalSpent: number;
  receiptCount: number;
}

export type View = 'dashboard' | 'scan' | 'history' | 'insights' | 'chat';

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}
