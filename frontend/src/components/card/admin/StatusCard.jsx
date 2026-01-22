import React from 'react';
import { TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';

const StatsCard = ({ title, value, change, trend, color }) => {
  const getCardColor = (color) => {
    switch (color) {
      case 'blue': return 'from-blue-500 to-blue-600';
      case 'green': return 'from-green-500 to-green-600';
      case 'yellow': return 'from-yellow-500 to-yellow-600';
      case 'purple': return 'from-purple-500 to-purple-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
      <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${getCardColor(color)} flex items-center justify-center mb-4`}>
        <BarChart3 className="w-6 h-6 text-white" />
      </div>
      <h3 className="text-sm font-medium text-gray-600 mb-2">{title}</h3>
      <div className="flex items-center justify-between">
        <span className="text-2xl font-bold text-gray-900">{value}</span>
        <div className={`flex items-center text-sm ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
          {trend === 'up' ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
          {change}
        </div>
      </div>
    </div>
  );
};

export default StatsCard;