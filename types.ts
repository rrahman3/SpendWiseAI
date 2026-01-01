
export interface ReceiptItem {
  name: string;
  quantity: number;
  price: number;
  category?: string;
  subcategory?: string;
}

export interface Receipt {
  id: string;
  type: 'purchase' | 'refund';
  storeName: string;
  date: string;
  /** Fix: Added time for perfectly unique transaction identification */
  time?: string; 
  total: number;
  items: ReceiptItem[];
  currency: string;
  rawText?: string;
  imageUrl?: string;
  createdAt: number;
  /** Added source property to distinguish between scan, email, or csv sources */
  source?: 'scan' | 'email' | 'csv';
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  totalSpent: number;
  receiptCount: number;
  isAuthenticated: boolean;
  isVerified?: boolean;
}

export type View = 'dashboard' | 'scan' | 'history' | 'items' | 'chat' | 'profile' | 'csv-import' | 'duplicate-review';
export type PublicView = 'home' | 'pricing' | 'blog' | 'contact' | 'login';
export type AuthView = 'sign-in' | 'sign-up' | 'forgot-password' | 'verify-email';

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}
