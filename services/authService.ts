
import { UserProfile } from "../types";

// Simulated internal DB for the session
const USERS_KEY = 'spendwise_mock_users';

interface StoredUser extends UserProfile {
  password?: string;
  verificationCode?: string;
}

export const authService = {
  getUsers: (): StoredUser[] => {
    const data = localStorage.getItem(USERS_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveUser: (user: StoredUser) => {
    const users = authService.getUsers();
    const existing = users.findIndex(u => u.email === user.email);
    if (existing > -1) {
      users[existing] = user;
    } else {
      users.push(user);
    }
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  },

  /**
   * Mock Google Sign-In. 
   */
  signInWithGoogle: async (): Promise<UserProfile> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const user = {
      id: 'goog_' + Math.random().toString(36).substr(2, 9),
      name: 'Alex Johnson',
      email: 'alex.j@example.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
      totalSpent: 0,
      receiptCount: 0,
      isAuthenticated: true,
      isVerified: true
    };
    authService.saveUser(user);
    return user;
  },

  signUpWithEmail: async (name: string, email: string, password: string): Promise<{ success: boolean; message: string; user?: UserProfile }> => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    const users = authService.getUsers();
    if (users.some(u => u.email === email)) {
      return { success: false, message: 'Email already registered.' };
    }

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const newUser: StoredUser = {
      id: 'email_' + Math.random().toString(36).substr(2, 9),
      name,
      email,
      password,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
      totalSpent: 0,
      receiptCount: 0,
      isAuthenticated: false,
      isVerified: false,
      verificationCode
    };

    authService.saveUser(newUser);
    // Simulate sending email
    console.log(`[SpendWise Auth] Verification code for ${email}: ${verificationCode}`);
    return { success: true, message: 'Verification code sent to your email.', user: newUser };
  },

  signInWithEmail: async (email: string, password: string): Promise<{ success: boolean; message: string; user?: UserProfile }> => {
    await new Promise(resolve => setTimeout(resolve, 1200));
    const users = authService.getUsers();
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
      return { success: false, message: 'Invalid email or password.' };
    }

    if (!user.isVerified) {
      return { success: false, message: 'Please verify your email first.', user };
    }

    user.isAuthenticated = true;
    authService.saveUser(user);
    return { success: true, message: 'Welcome back!', user };
  },

  verifyEmail: async (email: string, code: string): Promise<{ success: boolean; message: string; user?: UserProfile }> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const users = authService.getUsers();
    const user = users.find(u => u.email === email);

    if (!user || user.verificationCode !== code) {
      return { success: false, message: 'Invalid verification code.' };
    }

    user.isVerified = true;
    user.isAuthenticated = true;
    user.verificationCode = undefined;
    authService.saveUser(user);
    return { success: true, message: 'Email verified successfully!', user };
  },

  forgotPassword: async (email: string): Promise<{ success: boolean; message: string }> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const users = authService.getUsers();
    const user = users.find(u => u.email === email);
    
    if (!user) {
      return { success: false, message: 'If this email exists, a reset link has been sent.' };
    }
    
    console.log(`[SpendWise Auth] Password reset requested for ${email}. Link: https://spendwise.ai/reset?id=${user.id}`);
    return { success: true, message: 'Reset instructions sent to your email.' };
  },

  logout: async (userId?: string) => {
    localStorage.removeItem('spendwise_profile');
    if (userId) {
      localStorage.removeItem(`receipts_${userId}`);
    }
    
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('receipts_')) {
        localStorage.removeItem(key);
      }
    });
  }
};
