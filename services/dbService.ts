
import { Receipt } from "../types";

export const dbService = {
  getReceipts: async (userId: string): Promise<Receipt[]> => {
    const saved = localStorage.getItem(`receipts_${userId}`);
    return saved ? JSON.parse(saved) : [];
  },

  saveReceipt: async (userId: string, receipt: Receipt): Promise<void> => {
    const receipts = await dbService.getReceipts(userId);
    const updated = [receipt, ...receipts];
    localStorage.setItem(`receipts_${userId}`, JSON.stringify(updated));
  },

  updateReceipt: async (userId: string, updatedReceipt: Receipt): Promise<void> => {
    const receipts = await dbService.getReceipts(userId);
    const updated = receipts.map(r => r.id === updatedReceipt.id ? updatedReceipt : r);
    localStorage.setItem(`receipts_${userId}`, JSON.stringify(updated));
  },

  uploadReceiptImage: async (file: string): Promise<string> => {
    return file;
  },

  /**
   * Generates a JSON backup of the user's data
   */
  exportData: (userId: string, profile: any) => {
    const receipts = localStorage.getItem(`receipts_${userId}`);
    const data = {
      version: '1.0',
      profile: profile,
      receipts: receipts ? JSON.parse(receipts) : [],
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `spendwise_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  /**
   * Imports data from a JSON backup
   */
  importData: async (file: File): Promise<{ profile: any, receipts: Receipt[] } | null> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const data = JSON.parse(content);
          
          if (data.profile && data.receipts) {
            localStorage.setItem('spendwise_profile', JSON.stringify(data.profile));
            localStorage.setItem(`receipts_${data.profile.id}`, JSON.stringify(data.receipts));
            resolve({ profile: data.profile, receipts: data.receipts });
          } else {
            alert('Invalid backup file format.');
            resolve(null);
          }
        } catch (err) {
          console.error('Import error:', err);
          alert('Failed to parse backup file.');
          resolve(null);
        }
      };
      reader.readAsText(file);
    });
  }
};
