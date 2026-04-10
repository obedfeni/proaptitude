'use client';

import React, { useEffect, useState } from 'react';
import { ChevronLeft, TrendingUp, Calendar, Award, Target, BookOpen } from 'lucide-react';
import { getAnalytics, TestResult } from '@/lib/storage';
import { CATEGORIES } from '@/lib/questions';

interface AnalyticsPageProps {
  onBack: () => void;
}

export function AnalyticsPage({ onBack }: AnalyticsPageProps) {
  const [analytics, setAnalytics] = useState<ReturnType<typeof getAnalytics> | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setAnalytics(getAnalytics());
  }, []);

  if (!mounted || !analytics) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
          >
            <ChevronLeft className="w-5 h-5" />
            Back to Home
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-8">Your Analytics</h2>

        {analytics.totalTests === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-slate-200">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No Tests Taken Yet</h3>
            <p className="text-slate-600 mb-6">Complete your first test to see your performance analytics.</p>
            <button 
              onClick={onBack}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Start Your First Test
            </button>
          </div>
        ) : (
          <>
            {/* Overview Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                <div className="flex items-center gap-2 text-slate-500 text-sm mb-2">
                  <Target className="w-4 h-4" />
                  Total Tests
                </div>
                <div className="text-3xl font-bold text-slate-900">{analytics.totalTests}</div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                <div className="flex items-center gap-2 text-slate-500 text-sm mb-2">
                  <TrendingUp className="w-4 h-4" />
                  Average Score
                </div>
                <div className="text-3xl font-bold text-slate-900">{Math.round(analytics.averageScore)}%</div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                <div className="flex items-center gap-2 text-slate-500 text-sm mb-2">
                  <Award className="w-4 h-4" />
                  Best Category
                </div>
                <div className="text-lg font-bold text-slate-900 truncate">
                  {CATEGORIES[analytics.bestCategory]?.name || analytics.bestCategory}
                </div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                <div className="flex items-center gap-2 text-slate-500 text-sm mb-2">
                  <Calendar className="w-4 h-4" />
                  Current Streak
                </div>
                <div className="text-3xl font-bold text-slate-900">{analytics.streakDays} days</div>
              </div>
            </div>

            {/* Category Performance */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8">
              <div className="p-6 border-b border-slate-200">
                <h3 className="text-lg font-bold text-slate-900">Performance by Category</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {Object.entries(analytics.categoryPerformance)
                    .sort((a, b) => b[1].avg - a[1].avg)
                    .map(([cat, stats]) => {
                      const category = CATEGORIES[cat];
                      return (
                        <div key={cat} className="flex items-center gap-4">
                          <div 
                            className="w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
                            style={{ backgroundColor: category?.color + '20' }}
                          >
                            {category?.icon}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-slate-900">{category?.name || cat}</span>
                              <span className="text-sm font-semibold" style={{ color: category?.color }}>
                                {Math.round(stats.avg)}%
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-slate-100 rounded-full h-3">
                                <div 
                                  className="h-3 rounded-full transition-all"
                                  style={{ 
                                    width: `${stats.avg}%`, 
                                    backgroundColor: category?.color 
                                  }}
                                />
                              </div>
                              <span className="text-xs text-slate-500 w-16 text-right">
                                {stats.count} tests
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>

            {/* Recent Tests */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-200">
                <h3 className="text-lg font-bold text-slate-900">Recent Tests</h3>
              </div>
              <div className="divide-y divide-slate-200">
                {analytics.recentResults.map((result) => {
                  const category = CATEGORIES[result.category];
                  return (
                    <div key={result.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
                          style={{ backgroundColor: category?.color + '20' }}
                        >
                          {category?.icon}
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-900">{category?.name || result.category}</h4>
                          <p className="text-sm text-slate-500">{formatDate(result.timestamp)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold" style={{ color: category?.color }}>
                          {result.percentage}%
                        </div>
                        <div className="text-sm text-slate-500">
                          {result.score}/{result.totalQuestions} correct
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
