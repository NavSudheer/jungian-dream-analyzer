'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { DreamAnalysis } from '../utils/types';
import { formatDate, downloadTextFile } from '../utils/helpers';
import { motion } from 'framer-motion';

interface DreamAnalysisDisplayProps {
  analysis: DreamAnalysis;
  dreamContent: string;
  onSave: () => void;
  onNewDream: () => void;
  isLoading?: boolean;
}

// Loading animation component
const LoadingAnimation = () => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="flex flex-col items-center justify-center py-8 space-y-6"
  >
    <div className="relative w-20 h-20">
      {/* Main spinner */}
      <motion.div 
        className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-indigo-200 dark:border-indigo-900"
      />
      <motion.div 
        className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-t-indigo-500 border-r-transparent border-b-transparent border-l-transparent"
        animate={{ rotate: 360 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
      />
      
      {/* Inner spinner (counter-rotating) */}
      <motion.div 
        className="absolute top-2 left-2 right-2 bottom-2 rounded-full border-4 border-purple-200 dark:border-purple-900"
      />
      <motion.div 
        className="absolute top-2 left-2 right-2 bottom-2 rounded-full border-4 border-t-transparent border-r-purple-500 border-b-transparent border-l-transparent"
        animate={{ rotate: -360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      />
      
      {/* Center moon icon */}
      <motion.div 
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xl"
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.7, 1, 0.7]
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        🌙
      </motion.div>
    </div>
    
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
      className="text-center space-y-3"
    >
      <p className="text-lg font-medium text-indigo-600 dark:text-indigo-400">Interpreting your dream...</p>
      <div className="flex justify-center space-x-1">
        {["Analyzing symbols", "Identifying archetypes", "Exploring unconscious"].map((text, i) => (
          <motion.span 
            key={i}
            className="text-sm text-gray-500 dark:text-gray-400 px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + (i * 0.2) }}
          >
            {text}
          </motion.span>
        ))}
      </div>
    </motion.div>
  </motion.div>
);

export default function DreamAnalysisDisplay({
  analysis,
  dreamContent,
  onSave,
  onNewDream,
  isLoading = false,
}: DreamAnalysisDisplayProps) {
  const [saved, setSaved] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [lastInterpretation, setLastInterpretation] = useState('');
  const [activeTab, setActiveTab] = useState<'interpretation' | 'symbols' | 'archetypes'>('interpretation');
  const interpretationRef = useRef<HTMLDivElement>(null);

  // Add debugging logs
  useEffect(() => {
    console.log("DreamAnalysisDisplay render state:", {
      hasInterpretation: !!analysis.interpretation,
      interpretationLength: analysis.interpretation?.length || 0,
      isTyping,
      isLoading,
      activeTab
    });
  }, [analysis.interpretation, isTyping, isLoading, activeTab]);

  // Track when the interpretation changes to show typing animation
  useEffect(() => {
    if (analysis.interpretation && analysis.interpretation !== lastInterpretation) {
      console.log("Interpretation changed, setting isTyping to true");
      setIsTyping(true);
      setLastInterpretation(analysis.interpretation);
      
      // Set a small timeout to simulate typing completion
      const typingTimeout = setTimeout(() => {
        console.log("Typing timeout completed, setting isTyping to false");
        setIsTyping(false);
      }, 300);
      
      // Scroll to the bottom of the interpretation as new text appears
      if (interpretationRef.current) {
        interpretationRef.current.scrollTop = interpretationRef.current.scrollHeight;
      }
      
      return () => clearTimeout(typingTimeout);
    }
  }, [analysis.interpretation, lastInterpretation]);

  // Add a safety timeout to ensure typing animation doesn't get stuck
  useEffect(() => {
    if (isTyping) {
      const safetyTimeout = setTimeout(() => {
        console.log("Safety timeout triggered - forcing isTyping to false");
        setIsTyping(false);
      }, 3000); // Force typing to end after 3 seconds max
      
      return () => clearTimeout(safetyTimeout);
    }
  }, [isTyping]);

  // Force display of content if isLoading is false but we're still in typing state for too long
  useEffect(() => {
    if (!isLoading && analysis.interpretation && isTyping) {
      const forceDisplayTimeout = setTimeout(() => {
        console.log("Force display timeout triggered");
        setIsTyping(false);
      }, 1500);
      
      return () => clearTimeout(forceDisplayTimeout);
    }
  }, [isLoading, analysis.interpretation, isTyping]);

  const handleSave = () => {
    onSave();
    setSaved(true);
  };

  const handleDownload = () => {
    const content = `
JUNGIAN DREAM ANALYSIS
----------------------
Date: ${formatDate(analysis.timestamp)}

DREAM CONTENT:
${dreamContent}

ANALYSIS:
${analysis.interpretation}

SYMBOLS IDENTIFIED:
${analysis.symbols.map(s => `- ${s.name}: ${s.meaning}`).join('\n')}

ARCHETYPES IDENTIFIED:
${analysis.archetypes.map(a => `- ${a.type}: ${a.description}`).join('\n')}
    `.trim();

    downloadTextFile(content, `dream-analysis-${Date.now()}.txt`);
  };

  // Function to convert markdown-style formatting to JSX
  const formatText = (text: string) => {
    if (!text) return [];
    
    // Split by newlines
    return text.split('\n').map((line, index) => {
      // Bold text (surrounded by **)
      line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      
      // Check if line is a heading (starts with **)
      if (line.startsWith('**') && line.endsWith(':**')) {
        return (
          <h3 key={index} className="text-lg font-bold mt-4 mb-2 text-indigo-600 dark:text-indigo-400">
            {line.replace(/\*\*/g, '')}
          </h3>
        );
      }
      
      // Check if line is a list item (starts with -)
      if (line.trim().startsWith('- ')) {
        return (
          <li key={index} className="ml-4 mb-1" dangerouslySetInnerHTML={{ __html: line.substring(2) }} />
        );
      }
      
      // Regular paragraph
      return line ? (
        <p key={index} className="mb-2" dangerouslySetInnerHTML={{ __html: line }} />
      ) : (
        <br key={index} />
      );
    });
  };

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

  return (
    <div className="w-full max-w-4xl mx-auto">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="dream-card rounded-xl overflow-hidden"
      >
        <div className="p-6">
          <motion.div variants={itemVariants} className="mb-6">
            <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-transparent bg-clip-text">
              Dream Analysis
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Analyzed on {formatDate(analysis.timestamp)}
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="mb-6">
            <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">Your Dream</h3>
            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border border-gray-100 dark:border-gray-700">
              <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">{dreamContent}</p>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="mb-6">
            <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
              <button
                onClick={() => setActiveTab('interpretation')}
                className={`px-4 py-2 font-medium text-sm transition-all ${
                  activeTab === 'interpretation'
                    ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-500'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                Interpretation
              </button>
              <button
                onClick={() => setActiveTab('symbols')}
                className={`px-4 py-2 font-medium text-sm transition-all ${
                  activeTab === 'symbols'
                    ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-500'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                Symbols {analysis.symbols.length > 0 && `(${analysis.symbols.length})`}
              </button>
              <button
                onClick={() => setActiveTab('archetypes')}
                className={`px-4 py-2 font-medium text-sm transition-all ${
                  activeTab === 'archetypes'
                    ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-500'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                Archetypes {analysis.archetypes.length > 0 && `(${analysis.archetypes.length})`}
              </button>
            </div>

            {activeTab === 'interpretation' && (
              <div 
                ref={interpretationRef}
                className={`prose max-w-none dark:prose-invert max-h-[400px] overflow-y-auto pr-2 ${isTyping ? 'typing-animation' : ''}`}
              >
                {(isLoading && !analysis.interpretation) ? (
                  <LoadingAnimation />
                ) : (
                  <>
                    {analysis.interpretation ? (
                      formatText(analysis.interpretation)
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-gray-500 dark:text-gray-400">No interpretation available yet.</p>
                        {isLoading && <LoadingAnimation />}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {activeTab === 'symbols' && (
              <div className="max-h-[400px] overflow-y-auto pr-2">
                {isLoading || analysis.symbols.length === 0 ? (
                  <LoadingAnimation />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {analysis.symbols.map((symbol, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="dream-symbol rounded-lg p-3 bg-gray-50 dark:bg-gray-800/50"
                      >
                        <div className="flex items-start justify-between">
                          <h4 className="font-medium text-indigo-600 dark:text-indigo-400">{symbol.name}</h4>
                          {symbol.frequency > 1 && (
                            <span className="text-xs px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full">
                              {symbol.frequency}×
                            </span>
                          )}
                        </div>
                        <p className="text-sm mt-1 text-gray-600 dark:text-gray-300">{symbol.meaning}</p>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'archetypes' && (
              <div className="max-h-[400px] overflow-y-auto pr-2">
                {isLoading || analysis.archetypes.length === 0 ? (
                  <LoadingAnimation />
                ) : (
                  analysis.archetypes.map((archetype, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="dream-archetype rounded-lg p-4 mb-4 bg-gray-50 dark:bg-gray-800/50"
                    >
                      <h4 className="font-medium text-lg text-purple-600 dark:text-purple-400 capitalize">{archetype.type}</h4>
                      <p className="text-sm mt-2 text-gray-700 dark:text-gray-300">{archetype.description}</p>
                      <p className="text-sm mt-2 text-gray-600 dark:text-gray-400 italic">{archetype.significance}</p>
                    </motion.div>
                  ))
                )}
              </div>
            )}
          </motion.div>

          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-3 mt-8"
          >
            <Button 
              onClick={handleSave} 
              disabled={saved}
              className="dream-button"
            >
              {saved ? 'Saved' : 'Save Analysis'}
            </Button>
            <Button 
              onClick={handleDownload} 
              variant="outline" 
              className="dream-button-secondary"
            >
              Download as Text
            </Button>
            <Button 
              onClick={onNewDream} 
              variant="outline" 
              className="ml-auto dream-button-secondary"
            >
              Analyze Another Dream
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
} 