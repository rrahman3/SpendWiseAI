
import { UserProfile } from "../types";

// For Supabase: import { createClient } from '@supabase/supabase-js'
// For Firebase: import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth'

export const authService = {
  /**
   * Mock Google Sign-In. 
   * To use real Supabase: await supabase.auth.signInWithOAuth({ provider: 'google' })
   */
  signInWithGoogle: async (): Promise<UserProfile> => {
    // Simulated network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      id: 'user_' + Math.random().toString(36).substr(2, 9),
      name: 'Alex Johnson',
      email: 'alex.j@example.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
      totalSpent: 0,
      receiptCount: 0,
      isAuthenticated: true
    };
  },

  logout: async () => {
    // To use real Supabase: await supabase.auth.signOut()
    localStorage.removeItem('spendwise_profile');
    localStorage.removeItem('spendwise_receipts');
  }
};
