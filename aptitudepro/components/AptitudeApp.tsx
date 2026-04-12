'use client';
import { createSelfGeneratingBank } from '@/lib/selfGeneratingBank';
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Play, 
  BarChart3, 
  BookOpen, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Trophy,
  Brain,
  ChevronRight,
  Home,
  RotateCcw,
  TrendingUp,
  Award,
  Target,
  Zap,
  ChevronLeft,
  Info,
  X
} from 'lucide-react';
import { 
  QUESTION_BANK, 
  CATEGORIES, 
  Question, 
  buildBlendedTest, 
  updateWeights,
  getTotalQuestionCount 
} from '@/lib/questions';
import { 
  loadData, 
  saveData, 
  addTestResult, 
  updateQuestionStats,
  getAnalytics,
  getRecentlyAskedQuestions,
  getCategoryStatsMap,
  TestResult 
} from '@/lib/storage';
import { AnalyticsPage } from './AnalyticsPage';

type View = 'home' | 'test' | 'result' | 'analytics' | 'guide';

export function AptitudeApp() {
  const bank = createSelfGeneratingBank();
  const [view, setView] = useState<View>('home');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answers, setAnswers] = useState<{ questionId: string; correct: boolean; selectedOption: number }[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [testStarted, setTestStarted] = useState(false);
  const [results, setResults] = useState<TestResult | null>(null);
  const [analytics, setAnalytics] = useState<ReturnType<typeof getAnalytics> | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  useEffect(() => {
    setAnalytics(getAnalytics());
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (testStarted && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            finishTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [testStarted, timeLeft]);

  const startTest = (category: string) => {
    const recentIds = getRecentlyAskedQuestions(category, 40);
    const statsMap = getCategoryStatsMap(category);
    const testQuestions = bank.getQuestions(category, 10, recentIds);
    if (testQuestions.length === 0) return;

    setSelectedCategory(category);
    setQuestions(testQuestions);
    setCurrentIndex(0);
    setAnswers([]);
    setTimeLeft(testQuestions.length * 40);
    setTestStarted(true);
    setView('test');
    setSelectedOption(null);
    setShowExplanation(false);
    setIsCorrect(null);
  };

  const handleAnswer = (optionIndex: number) => {
    if (selectedOption !== null) return;

    const currentQ = questions[currentIndex];
    const correct = optionIndex === currentQ.correct;

    setSelectedOption(optionIndex);
    setIsCorrect(correct);
    setShowExplanation(true);

    updateQuestionStats(currentQ.id, correct, currentQ.category);
    bank.recordAnswer(currentQ.id, correct, currentQ.category);

    setAnswers(prev => [...prev, {
      questionId: currentQ.id,
      correct,
      selectedOption: optionIndex
    }]);
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setShowExplanation(false);
      setIsCorrect(null);
    } else {
      finishTest();
    }
  };

  const finishTest = () => {
    const correctCount = answers.filter(a => a.correct).length;
    const totalTime = (questions.length * 40) - timeLeft;

    const result: TestResult = {
      id: Date.now().toString(),
      category: selectedCategory,
      score: correctCount,
      totalQuestions: questions.length,
      percentage: Math.round((correctCount / questions.length) * 100),
      timeSpent: totalTime,
      timestamp: new Date().toISOString(),
      answers
    };

    addTestResult(result);
    setResults(result);
    setTestStarted(false);
    setView('result');
    setAnalytics(getAnalytics());
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
const evolved = bank.evolveAndImprove();
console.log('Evolved questions:', evolved.length);
  const renderHome = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">AptitudePro</h1>
              <p className="text-xs text-slate-500">Graduate Psychometric Suite</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {analytics && analytics.streakDays > 0 && (
              <div className="flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                <Zap className="w-4 h-4" />
                {analytics.streakDays} day streak
              </div>
            )}
            <button 
              onClick={() => setView('analytics')}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <BarChart3 className="w-5 h-5 text-slate-600" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero Stats */}
        {analytics && analytics.totalTests > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
              <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                <Trophy className="w-4 h-4" />
                Tests Completed
              </div>
              <div className="text-2xl font-bold text-slate-900">{analytics.totalTests}</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
              <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                <Target className="w-4 h-4" />
                Average Score
              </div>
              <div className="text-2xl font-bold text-slate-900">{Math.round(analytics.averageScore)}%</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
              <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                <Award className="w-4 h-4" />
                Best Category
              </div>
              <div className="text-lg font-bold text-slate-900 truncate">
                {CATEGORIES[analytics.bestCategory]?.name || analytics.bestCategory}
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
              <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                <TrendingUp className="w-4 h-4" />
                Questions
              </div>
              <div className="text-2xl font-bold text-slate-900">{getTotalQuestionCount()}</div>
            </div>
          </div>
        )}

        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white mb-8 shadow-xl">
          <h2 className="text-3xl font-bold mb-3">Master Your Aptitude Tests</h2>
          <p className="text-blue-100 text-lg mb-6 max-w-2xl">
            Practice with 200+ questions across 12 categories including Numerical, Verbal, Logical, 
            Mechanical, Electrical Engineering, and Situational Judgment. Adaptive learning ensures 
            you focus on areas that need improvement.
          </p>
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={() => document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center gap-2"
            >
              <Play className="w-5 h-5" />
              Start Practice
            </button>
            <button 
              onClick={() => setView('guide')}
              className="px-6 py-3 bg-blue-700 text-white rounded-lg font-semibold hover:bg-blue-800 transition-colors flex items-center gap-2"
            >
              <BookOpen className="w-5 h-5" />
              Study Guide
            </button>
          </div>
        </div>

        {/* Categories Grid */}
        <h3 id="categories" className="text-xl font-bold text-slate-900 mb-4">Select a Category</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(CATEGORIES).map(([key, cat]) => {
            const count = QUESTION_BANK[key]?.length || 0;
            const performance = analytics?.categoryPerformance[key];
            return (
              <button
                key={key}
                onClick={() => startTest(key)}
                className="group bg-white rounded-xl p-5 border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all text-left"
              >
                <div className="flex items-start justify-between mb-3">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                    style={{ backgroundColor: cat.color + '20' }}
                  >
                    {cat.icon}
                  </div>
                  <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                    {count} questions
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">
                  {cat.name}
                </h4>
                <p className="text-sm text-slate-500 mb-3">{cat.description}</p>
                {performance && (
                  <div className="flex items-center gap-2 text-sm">
                    <div className="flex-1 bg-slate-100 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all"
                        style={{ 
                          width: `${performance.avg}%`, 
                          backgroundColor: cat.color 
                        }}
                      />
                    </div>
                    <span className="font-medium" style={{ color: cat.color }}>
                      {Math.round(performance.avg)}%
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </main>
    </div>
  );

  const renderTest = () => {
    const currentQ = questions[currentIndex];
    if (!currentQ) return null;

    return (
      <div className="min-h-screen bg-slate-50">
        {/* Test Header */}
        <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between mb-4">
              <button 
                onClick={() => setView('home')}
                className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
              >
                <ChevronLeft className="w-5 h-5" />
                Exit Test
              </button>
              <div className="flex items-center gap-2 text-slate-600">
                <Clock className="w-5 h-5" />
                <span className={`font-mono font-bold ${timeLeft < 60 ? 'text-red-600' : ''}`}>
                  {formatTime(timeLeft)}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-500 font-medium">
                {currentIndex + 1} / {questions.length}
              </span>
              <div className="flex-1 bg-slate-100 rounded-full h-2">
                <div 
                  className="h-2 bg-blue-600 rounded-full transition-all"
                  style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </header>

        {/* Question */}
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Question Header */}
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <span 
                  className="px-3 py-1 rounded-full text-xs font-medium"
                  style={{ 
                    backgroundColor: CATEGORIES[currentQ.category]?.color + '20',
                    color: CATEGORIES[currentQ.category]?.color 
                  }}
                >
                  {CATEGORIES[currentQ.category]?.name}
                </span>
                <span className="text-xs text-slate-500">
                  Difficulty: {'⭐'.repeat(currentQ.difficulty)}
                </span>
              </div>
            </div>

            <div className="p-6">
              {/* Passage if exists */}
              {currentQ.passage && (
                <div className="mb-6 p-4 bg-slate-50 rounded-lg border-l-4 border-blue-500">
                  <p className="text-slate-700 text-sm leading-relaxed">{currentQ.passage}</p>
                </div>
              )}

              {/* Table if exists */}
              {currentQ.table && (
                <div 
                  className="mb-6 overflow-x-auto bg-white rounded-lg border border-slate-200 p-4"
                  dangerouslySetInnerHTML={{ __html: currentQ.table }}
                />
              )}

              {/* Diagram if exists */}
              {currentQ.diagram && (
                <div 
                  className="mb-6 flex justify-center"
                  dangerouslySetInnerHTML={{ __html: currentQ.diagram }}
                  style={{ minHeight: '200px' }}
                />
              )}

              {/* Question Text */}
              <h3 className="text-lg font-semibold text-slate-900 mb-6">
                {currentQ.question}
              </h3>

              {/* Options */}
              <div className="space-y-3">
                {currentQ.options.map((option, idx) => {
                  let buttonClass = "w-full p-4 rounded-xl border-2 text-left transition-all ";

                  if (selectedOption === null) {
                    buttonClass += "border-slate-200 hover:border-blue-400 hover:bg-blue-50";
                  } else if (idx === currentQ.correct) {
                    buttonClass += "border-green-500 bg-green-50";
                  } else if (idx === selectedOption) {
                    buttonClass += "border-red-500 bg-red-50";
                  } else {
                    buttonClass += "border-slate-200 opacity-50";
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleAnswer(idx)}
                      disabled={selectedOption !== null}
                      className={buttonClass}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-sm font-medium text-slate-600">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span className="flex-1">{option}</span>
                        {selectedOption !== null && idx === currentQ.correct && (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        )}
                        {selectedOption === idx && idx !== currentQ.correct && (
                          <XCircle className="w-5 h-5 text-red-600" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Explanation */}
              {showExplanation && (
                <div className={`mt-6 p-4 rounded-xl ${isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  <div className="flex items-start gap-3">
                    {isCorrect ? (
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                    )}
                    <div>
                      <p className={`font-semibold ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                        {isCorrect ? 'Correct!' : 'Incorrect'}
                      </p>
                      <p className="text-slate-700 mt-1">{currentQ.explanation}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Next Button */}
              {selectedOption !== null && (
                <button
                  onClick={nextQuestion}
                  className="mt-6 w-full py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  {currentIndex < questions.length - 1 ? 'Next Question' : 'Finish Test'}
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </main>
      </div>
    );
  };

  const renderResult = () => {
    if (!results) return null;
    const category = CATEGORIES[results.category];

    return (
      <div className="min-h-screen bg-slate-50">
        <header className="bg-white shadow-sm border-b border-slate-200">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <button 
              onClick={() => setView('home')}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
            >
              <Home className="w-5 h-5" />
              Back to Home
            </button>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
            {/* Result Header */}
            <div 
              className="p-8 text-center text-white"
              style={{ 
                background: `linear-gradient(135deg, ${category?.color || '#3b82f6'}, ${category?.color ? category.color + 'dd' : '#2563eb'})` 
              }}
            >
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-10 h-10" />
              </div>
              <h2 className="text-3xl font-bold mb-2">Test Complete!</h2>
              <p className="text-white/90">{category?.name}</p>
            </div>

            <div className="p-8">
              {/* Score Circle */}
              <div className="flex justify-center mb-8">
                <div className="relative w-40 h-40">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="80" cy="80" r="70" stroke="#e2e8f0" strokeWidth="12" fill="none" />
                    <circle 
                      cx="80" cy="80" r="70" 
                      stroke={category?.color || '#3b82f6'} 
                      strokeWidth="12" 
                      fill="none"
                      strokeDasharray={`${(results.percentage / 100) * 440} 440`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-bold text-slate-900">{results.percentage}%</span>
                    <span className="text-sm text-slate-500">{results.score}/{results.totalQuestions}</span>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="text-center p-4 bg-slate-50 rounded-xl">
                  <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-slate-900">{results.score}</div>
                  <div className="text-xs text-slate-500">Correct</div>
                </div>
                <div className="text-center p-4 bg-slate-50 rounded-xl">
                  <XCircle className="w-6 h-6 text-red-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-slate-900">{results.totalQuestions - results.score}</div>
                  <div className="text-xs text-slate-500">Incorrect</div>
                </div>
                <div className="text-center p-4 bg-slate-50 rounded-xl">
                  <Clock className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-slate-900">{formatTime(results.timeSpent)}</div>
                  <div className="text-xs text-slate-500">Time Used</div>
                </div>
              </div>

              {/* Answer Review */}
              <h3 className="font-bold text-slate-900 mb-4">Answer Review</h3>
              <div className="space-y-3">
                {results.answers.map((answer, idx) => (
                  <div 
                    key={idx}
                    className={`p-4 rounded-xl border ${answer.correct ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${answer.correct ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                        {idx + 1}
                      </span>
                      <div className="flex-1">
                        <p className="text-sm text-slate-700">
                          You selected: {String.fromCharCode(65 + answer.selectedOption)}
                        </p>
                      </div>
                      {answer.correct ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-4 mt-8">
                <button
                  onClick={() => startTest(results.category)}
                  className="flex-1 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-5 h-5" />
                  Retake Test
                </button>
                <button
                  onClick={() => setView('analytics')}
                  className="flex-1 py-4 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
                >
                  <BarChart3 className="w-5 h-5" />
                  View Analytics
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  };

  const renderGuide = () => (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button 
            onClick={() => setView('home')}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
          >
            <ChevronLeft className="w-5 h-5" />
            Back to Home
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-6">Study Guide</h2>

        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <h3 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Target className="w-6 h-6 text-blue-600" />
              Test Strategy
            </h3>
            <ul className="space-y-2 text-slate-700">
              <li>• Read questions carefully before looking at options</li>
              <li>• Eliminate obviously wrong answers first</li>
              <li>• Manage your time - don't spend too long on one question</li>
              <li>• For numerical questions, check units and scales</li>
              <li>• Review explanations to understand your mistakes</li>
            </ul>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <h3 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Brain className="w-6 h-6 text-purple-600" />
              Category Tips
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Numerical Reasoning</h4>
                <p className="text-sm text-blue-800">Practice mental math, percentages, ratios, and data interpretation from tables and charts.</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <h4 className="font-semibold text-purple-900 mb-2">Verbal Reasoning</h4>
                <p className="text-sm text-purple-800">Read passages carefully, look for specific details, and watch for inference questions.</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-2">Logical Reasoning</h4>
                <p className="text-sm text-green-800">Practice pattern recognition, syllogisms, and spatial visualization.</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <h4 className="font-semibold text-orange-900 mb-2">Situational Judgment</h4>
                <p className="text-sm text-orange-800">Choose responses showing professionalism, teamwork, and appropriate escalation.</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <h3 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Info className="w-6 h-6 text-slate-600" />
              About This App
            </h3>
            <p className="text-slate-700 leading-relaxed">
              AptitudePro features 200+ questions across 12 categories including specialized sections 
              for Electrical Engineering graduates. The adaptive learning system tracks your performance 
              and prioritizes questions you find challenging. Your progress is automatically saved 
              to your browser's local storage.
            </p>
          </div>
        </div>
      </main>
    </div>
  );

  return (
    <>
      {view === 'home' && renderHome()}
      {view === 'test' && renderTest()}
      {view === 'result' && renderResult()}
      {view === 'analytics' && <AnalyticsPage onBack={() => setView('home')} />}
      {view === 'guide' && renderGuide()}
    </>
  );
}
