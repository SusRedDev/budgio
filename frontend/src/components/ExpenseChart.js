import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const ExpenseChart = ({ categoryTotals }) => {
  const expenseData = Object.entries(categoryTotals)
    .filter(([_, totals]) => totals.expense > 0)
    .map(([category, totals]) => ({
      name: category,
      value: totals.expense,
      percentage: 0
    }));

  const totalExpenses = expenseData.reduce((sum, item) => sum + item.value, 0);
  
  const dataWithPercentages = expenseData.map(item => ({
    ...item,
    percentage: Math.round((item.value / totalExpenses) * 100)
  }));

  const COLORS = [
    '#8B5CF6', '#F59E0B', '#EF4444', '#10B981', '#3B82F6', 
    '#F97316', '#06B6D4', '#84CC16', '#EC4899', '#6366F1'
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white/90 backdrop-blur-xl p-3 rounded-lg shadow-lg border border-purple-200">
          <p className="font-semibold text-gray-800">{data.name}</p>
          <p className="text-sm text-gray-600">
            ${data.value.toLocaleString()} ({data.percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-purple-100">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Expense Breakdown</h3>
      
      {dataWithPercentages.length > 0 ? (
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={dataWithPercentages}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                paddingAngle={2}
                dataKey="value"
              >
                {dataWithPercentages.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]}
                    className="hover:opacity-80 transition-opacity cursor-pointer"
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                formatter={(value) => <span className="text-sm text-gray-600">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-80 flex items-center justify-center text-gray-500">
          <p>No expense data available</p>
        </div>
      )}
    </div>
  );
};

export default ExpenseChart;