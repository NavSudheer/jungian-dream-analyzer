'use client';

import { useState, useEffect } from 'react';
import DreamInput from '../components/dream-input';
import DreamAnalysisDisplay from '../components/dream-analysis';
import DreamHistory from '../components/dream-history';
import { analyzeDream } from '../services/dreamAnalysis';
import { saveDream, getDreams, deleteDream, clearDreams } from '../utils/localStorage';
import { generateId } from '../utils/helpers';
import { Dream, DreamAnalysis } from '../utils/types';
import { Card } from '../components/ui/card';
import { useTheme } from 'next-themes';

export default function Home() {
  const [dreamText, setDreamText] = useState('');
  const [analysis, setAnalysis] = useState<DreamAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [activeView, setActiveView] = useState<'input' | 'analysis' | 'history'>('input');
  const [selectedDream, setSelectedDream] = useState<Dream | null>(null);
  const { theme, setTheme } = useTheme();

  // Load saved dreams from localStorage on component mount
  useEffect(() => {
    // Only run on client-side
    if (typeof window !== 'undefined') {
      setDreams(getDreams());
    }
  }, []);

  const handleDreamSubmit = async (text: string) => {
    setDreamText(text);
    setIsAnalyzing(true);
    
    try {
      const dreamAnalysis = await analyzeDream(text);
      setAnalysis(dreamAnalysis);
    } catch (error) {
      console.error('Error analyzing dream:', error);
    } finally {
      setIsAnalyzing(false);
      setActiveView('analysis');
    }
  };

  const handleSaveAnalysis = () => {
    if (dreamText && analysis) {
      const dream: Dream = {
        id: generateId(),
        content: dreamText,
        timestamp: new Date(),
        analysis: analysis,
      };
      
      saveDream(dream);
      setDreams(getDreams());
    }
  };

  const handleNewDream = () => {
    setDreamText('');
    setAnalysis(null);
    setSelectedDream(null);
    setActiveView('input');
  };

  const handleSelectDream = (dream: Dream) => {
    setSelectedDream(dream);
    setActiveView('analysis');
  };

  const handleDeleteDream = (dreamId: string) => {
    deleteDream(dreamId);
    setDreams(getDreams());
    
    // If the deleted dream is currently selected, go back to input view
    if (selectedDream && selectedDream.id === dreamId) {
      handleNewDream();
    }
  };

  const handleClearAllDreams = () => {
    clearDreams();
    setDreams([]);
    handleNewDream();
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Jungian Dream Analyzer</h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label="Toggle dark mode"
              >
                {theme === 'dark' ? '🌞' : '🌙'}
              </button>
              <nav className="flex space-x-4">
                <button
                  onClick={() => setActiveView('input')}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    activeView === 'input'
                      ? 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  New Dream
                </button>
                <button
                  onClick={() => setActiveView('history')}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    activeView === 'history'
                      ? 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  History
                </button>
              </nav>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {activeView === 'input' && (
            <>
              <div className="mb-8 text-center">
                <h2 className="text-xl font-semibold mb-2 dark:text-white">Enter Your Dream</h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Describe your dream in detail or use voice input. Our analyzer will interpret it using Jungian psychology.
                </p>
              </div>
              <DreamInput onSubmit={handleDreamSubmit} isLoading={isAnalyzing} />
            </>
          )}

          {activeView === 'analysis' && analysis && (
            <DreamAnalysisDisplay
              analysis={selectedDream?.analysis || analysis}
              dreamContent={selectedDream?.content || dreamText}
              onSave={handleSaveAnalysis}
              onNewDream={handleNewDream}
            />
          )}

          {activeView === 'history' && (
            <DreamHistory
              dreams={dreams}
              onSelect={handleSelectDream}
              onDelete={handleDeleteDream}
              onClearAll={handleClearAllDreams}
            />
          )}
        </div>
      </main>

      <footer className="bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 dark:text-gray-400 text-sm">
            Jungian Dream Analyzer &copy; {new Date().getFullYear()} - All dream analyses are based on Jungian psychology principles
          </p>
        </div>
      </footer>
    </div>
  );
}
