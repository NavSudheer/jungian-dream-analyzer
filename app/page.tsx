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
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const [dreamText, setDreamText] = useState('');
  const [analysis, setAnalysis] = useState<DreamAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [activeView, setActiveView] = useState<'input' | 'analysis' | 'history'>('input');
  const [selectedDream, setSelectedDream] = useState<Dream | null>(null);
  const { theme, setTheme } = useTheme();
  const [isClient, setIsClient] = useState(false);

  // Set isClient to true once the component mounts
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load saved dreams from localStorage on component mount
  useEffect(() => {
    // Only run when we're sure we're on the client
    if (isClient) {
      setDreams(getDreams());
    }
  }, [isClient]);

  const handleDreamSubmit = async (text: string) => {
    setDreamText(text);
    setIsAnalyzing(true);
    setActiveView('analysis');
    
    try {
      // Create a partial analysis object to display while streaming
      const initialAnalysis: DreamAnalysis = {
        symbols: [],
        archetypes: [],
        interpretation: '',
        timestamp: new Date(),
      };
      
      setAnalysis(initialAnalysis);
      
      // Call analyzeDream with a callback for streaming updates
      const dreamAnalysis = await analyzeDream(text, (updatedAnalysis) => {
        // Update the analysis state with each streaming update
        setAnalysis(prevAnalysis => {
          if (!prevAnalysis) return updatedAnalysis;
          
          return {
            ...prevAnalysis,
            interpretation: updatedAnalysis.interpretation || prevAnalysis.interpretation,
            symbols: updatedAnalysis.symbols?.length ? updatedAnalysis.symbols : prevAnalysis.symbols,
            archetypes: updatedAnalysis.archetypes?.length ? updatedAnalysis.archetypes : prevAnalysis.archetypes,
            timestamp: prevAnalysis.timestamp,
          };
        });
      });
      
      // Update with the complete analysis
      setAnalysis(dreamAnalysis);
    } catch (error) {
      console.error('Error analyzing dream:', error);
    } finally {
      setIsAnalyzing(false);
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

  // Animation variants
  const pageVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.3 } }
  };

  // If not on client yet, show a simple loading state
  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-3xl mb-4">🌙</div>
          <h1 className="text-2xl font-bold">Jungian Dream Analyzer</h1>
          <p className="mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen transition-colors duration-500">
      {/* Animated background */}
      <div className="animated-bg"></div>
      
      <header className="backdrop-blur-md bg-white/70 dark:bg-gray-800/70 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center space-x-3"
            >
              <span className="text-3xl">🌙</span>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-transparent bg-clip-text">
                Jungian Dream Analyzer
              </h1>
            </motion.div>
            
            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.1, rotate: theme === 'dark' ? 180 : 0 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleTheme}
                className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                aria-label="Toggle dark mode"
              >
                {theme === 'dark' ? '🌞' : '🌙'}
              </motion.button>
              
              <nav className="flex space-x-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveView('input')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    activeView === 'input'
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  New Dream
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveView('history')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    activeView === 'history'
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  History
                </motion.button>
              </nav>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <AnimatePresence mode="wait">
          {activeView === 'input' && (
            <motion.div
              key="input-view"
              initial="initial"
              animate="animate"
              exit="exit"
              variants={pageVariants}
              className="px-4 py-6 sm:px-0"
            >
              <div className="mb-8 text-center">
                <h2 className="text-2xl font-semibold mb-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-transparent bg-clip-text">
                  Enter Your Dream
                </h2>
                <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                  Describe your dream in detail or use voice input. Our analyzer will interpret it using Jungian psychology, 
                  revealing the symbols and archetypes from your unconscious mind.
                </p>
              </div>
              <DreamInput onSubmit={handleDreamSubmit} isLoading={isAnalyzing} />
            </motion.div>
          )}

          {activeView === 'analysis' && (
            <motion.div
              key="analysis-view"
              initial="initial"
              animate="animate"
              exit="exit"
              variants={pageVariants}
              className="px-4 py-6 sm:px-0"
            >
              {analysis && (
                <DreamAnalysisDisplay
                  analysis={analysis}
                  dreamContent={selectedDream?.content || dreamText}
                  onSave={handleSaveAnalysis}
                  onNewDream={handleNewDream}
                />
              )}
            </motion.div>
          )}

          {activeView === 'history' && (
            <motion.div
              key="history-view"
              initial="initial"
              animate="animate"
              exit="exit"
              variants={pageVariants}
              className="px-4 py-6 sm:px-0"
            >
              <DreamHistory
                dreams={dreams}
                onSelect={handleSelectDream}
                onDelete={handleDeleteDream}
                onClearAll={handleClearAllDreams}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="backdrop-blur-md bg-white/70 dark:bg-gray-800/70 mt-auto">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 dark:text-gray-400 text-sm">
            Jungian Dream Analyzer &copy; {new Date().getFullYear()} - All dream analyses are based on Jungian psychology principles
          </p>
        </div>
      </footer>
    </div>
  );
}
