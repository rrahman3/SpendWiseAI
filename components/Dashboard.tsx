
import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line 
} from 'recharts';
import { Receipt } from '../types';

interface DashboardProps {
  receipts: Receipt[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const Dashboard: React.FC<DashboardProps> = ({ receipts }) => {
  const stats = useMemo(() => {
    const total = receipts.reduce((sum, r) => sum + r.total, 0);
    const lastMonth = receipts.filter(r => {
      const date = new Date(r.date);
      const now = new Date();
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }).reduce((sum, r) => sum + r.total, 0);

    const categoryDataMap: Record<string, number> = {};
    receipts.forEach(r => {
      r.items.forEach(item => {
        const cat = item.category || 'Other';
        categoryDataMap[cat] = (categoryDataMap[cat] || 0) + (item.price * item.quantity);
      });
    });

    const categoryData = Object.entries(categoryDataMap).map(([name, value]) => ({ name, value }));

    const historyData = receipts
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-10)
      .map(r => ({
        date: r.date,
        total: r.total
      }));

    return { total, lastMonth, categoryData, historyData };
  }, [receipts]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 font-medium">Total Lifetime Spend</p>
          <h3 className="text-3xl font-bold text-gray-900 mt-1">${stats.total.toFixed(2)}</h3>
          <div className="mt-2 text-xs text-green-600 bg-green-50 inline-block px-2 py-1 rounded">
            Across {receipts.length} receipts
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 font-medium">Spending This Month</p>
          <h3 className="text-3xl font-bold text-gray-900 mt-1">${stats.lastMonth.toFixed(2)}</h3>
          <p className="mt-2 text-xs text-gray-400">Updates in real-time</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 font-medium">Average per Receipt</p>
          <h3 className="text-3xl font-bold text-gray-900 mt-1">
            ${receipts.length ? (stats.total / receipts.length).toFixed(2) : '0.00'}
          </h3>
          <p className="mt-2 text-xs text-gray-400">Based on all scans</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-[400px]">
          <h4 className="text-lg font-semibold mb-6">Spending by Category</h4>
          <ResponsiveContainer width="100%" height="80%">
            <PieChart>
              <Pie
                data={stats.categoryData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {stats.categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap justify-center gap-4 mt-4 text-xs font-medium">
            {stats.categoryData.map((d, i) => (
              <div key={d.name} className="flex items-center">
                <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                <span>{d.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-[400px]">
          <h4 className="text-lg font-semibold mb-6">Recent Spending Trend</h4>
          <ResponsiveContainer width="100%" height="80%">
            <BarChart data={stats.historyData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis dataKey="date" fontSize={12} stroke="#9ca3af" />
              <YAxis fontSize={12} stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
