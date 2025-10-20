/**
 * SprinkSync - AI Insights Panel
 *
 * Displays AI-generated insights and recommendations
 */

import { useState, useEffect } from 'react';
import { getInsights } from '../api/client';
import LoadingSpinner from './LoadingSpinner';

const InsightsPanel = ({ days = 30 }) => {
  const [insights, setInsights] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchInsights();
  }, [days]);

  const fetchInsights = async () => {
    try {
      const data = await getInsights(days);
      setInsights(data.insights || []);
      setIsLoading(false);
    } catch (err) {
      console.error('Failed to fetch insights:', err);
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="card">
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (insights.length === 0) {
    return (
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">AI Insights</h2>
        <div className="text-center py-4">
          <p className="text-gray-500 text-sm">
            No insights available yet. Start watering to see recommendations!
          </p>
        </div>
      </div>
    );
  }

  const getInsightIcon = (type) => {
    switch (type) {
      case 'success':
        return (
          <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      case 'warning':
        return (
          <div className="flex-shrink-0 w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        );
      case 'info':
      default:
        return (
          <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  const getInsightColor = (type) => {
    switch (type) {
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'info':
      default:
        return 'border-blue-200 bg-blue-50';
    }
  };

  const getCategoryBadge = (category) => {
    const colors = {
      usage: 'bg-blue-100 text-blue-800',
      savings: 'bg-green-100 text-green-800',
      weather: 'bg-purple-100 text-purple-800',
      automation: 'bg-orange-100 text-orange-800',
      activity: 'bg-gray-100 text-gray-800',
    };

    return (
      <span className={`text-xs px-2 py-1 rounded-full font-medium ${colors[category] || colors.activity}`}>
        {category}
      </span>
    );
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">AI Insights</h2>
        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
          {insights.length} {insights.length === 1 ? 'insight' : 'insights'}
        </span>
      </div>

      <div className="space-y-3">
        {insights.map((insight, index) => (
          <div
            key={index}
            className={`border-l-4 ${getInsightColor(insight.type)} p-4 rounded-r-md`}
          >
            <div className="flex items-start gap-3">
              {getInsightIcon(insight.type)}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-semibold text-gray-900">
                    {insight.title}
                  </h3>
                  {getCategoryBadge(insight.category)}
                </div>
                <p className="text-sm text-gray-700">
                  {insight.message}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          Insights powered by SprinkSync AI • Updated daily
        </p>
      </div>
    </div>
  );
};

export default InsightsPanel;
