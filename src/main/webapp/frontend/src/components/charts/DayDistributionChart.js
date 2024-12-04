import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function DayDistributionChart({ entries }) {
  const getDayDistribution = () => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    return days.map(day => ({
      day,
      count: entries.filter(entry => entry.eventDay === day).length
    }));
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <h4 className="text-sm font-medium text-gray-700 mb-4">Events by Day</h4>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={getDayDistribution()}>
          <XAxis dataKey="day" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="count" fill="#60a5fa" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};