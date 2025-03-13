'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Dream } from '../utils/types';
import { formatDate } from '../utils/helpers';
import { motion, AnimatePresence } from 'framer-motion';

interface DreamHistoryProps {
  dreams: Dream[];
  onSelect: (dream: Dream) => void;
  onDelete: (dreamId: string) => void;
  onClearAll: () => void;
}

export default function DreamHistory({
  dreams,
  onSelect,
  onDelete,
  onClearAll,
}: DreamHistoryProps) {
  const [expandedDreamId, setExpandedDreamId] = useState<string | null>(null);
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  const toggleExpand = (dreamId: string) => {
    setExpandedDreamId(expandedDreamId === dreamId ? null : dreamId);
  };

  const handleDelete = (e: React.MouseEvent, dreamId: string) => {
    e.stopPropagation();
    onDelete(dreamId);
  };

  const handleClearAll = () => {
    if (showConfirmClear) {
      onClearAll();
      setShowConfirmClear(false);
    } else {
      setShowConfirmClear(true);
    }
  };

  // Sort dreams by timestamp (newest first)
  const sortedDreams = [...dreams].sort((a, b) => 
    b.timestamp.getTime() - a.timestamp.getTime()
  );

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  if (dreams.length === 0) {
    return (
      <div className="w-full max-w-3xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="dream-card p-8 text-center rounded-xl"
        >
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-20 h-20 mb-6 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-indigo-500 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200">No Dream History Yet</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md">
              Your analyzed dreams will appear here once you save them. Start by analyzing a new dream.
            </p>
            <Button 
              onClick={() => window.location.href = '/'}
              className="dream-button rounded-full px-6 py-2"
            >
              Analyze Your First Dream
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="space-y-6"
      >
        <motion.div 
          variants={itemVariants}
          className="flex justify-between items-center mb-6"
        >
          <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 text-transparent bg-clip-text">
            Your Dream History
          </h2>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleClearAll}
            className={`
              px-4 py-2 rounded-full transition-all
              ${showConfirmClear 
                ? 'bg-red-500 text-white hover:bg-red-600 border-red-500' 
                : 'dream-button-secondary'
              }
            `}
          >
            {showConfirmClear ? 'Confirm Clear All' : 'Clear All'}
          </Button>
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-4">
          {sortedDreams.map((dream, index) => (
            <motion.div
              key={dream.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="dream-card rounded-xl overflow-hidden"
            >
              <div 
                className="p-5 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all"
                onClick={() => toggleExpand(dream.id)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(dream.timestamp)}
                      </p>
                    </div>
                    <p className="font-medium text-gray-800 dark:text-gray-200 line-clamp-2">
                      {dream.content}
                    </p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelect(dream);
                        }}
                        className="rounded-full px-4 border-indigo-200 text-indigo-600 hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-400 dark:hover:bg-indigo-900/20"
                      >
                        View
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="rounded-full px-4 border-red-200 text-red-500 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                        onClick={(e) => handleDelete(e, dream.id)}
                      >
                        Delete
                      </Button>
                    </motion.div>
                  </div>
                </div>

                <AnimatePresence>
                  {expandedDreamId === dream.id && dream.analysis && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 overflow-hidden"
                    >
                      <div className="space-y-3">
                        <h4 className="font-medium text-indigo-600 dark:text-indigo-400">Analysis Summary</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
                          {dream.analysis.interpretation}
                        </p>
                        
                        {dream.analysis.symbols.length > 0 && (
                          <div className="mt-3">
                            <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Key Symbols:</h5>
                            <div className="flex flex-wrap gap-2">
                              {dream.analysis.symbols.slice(0, 3).map((symbol, idx) => (
                                <span 
                                  key={idx} 
                                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300"
                                >
                                  {symbol.name}
                                </span>
                              ))}
                              {dream.analysis.symbols.length > 3 && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
                                  +{dream.analysis.symbols.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                        
                        <div className="pt-2">
                          <Button 
                            variant="link" 
                            size="sm" 
                            className="p-0 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelect(dream);
                            }}
                          >
                            View Full Analysis →
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
} 