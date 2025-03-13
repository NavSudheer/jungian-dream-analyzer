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
}

export default function DreamAnalysisDisplay({
  analysis,
  dreamContent,
  onSave,
  onNewDream,
}: DreamAnalysisDisplayProps) {
  const [saved, setSaved] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [lastInterpretation, setLastInterpretation] = useState('');
  const [activeTab, setActiveTab] = useState<'interpretation' | 'symbols' | 'archetypes'>('interpretation');
  const interpretationRef = useRef<HTMLDivElement>(null);

  // Track when the interpretation changes to show typing animation
  useEffect(() => {
    if (analysis.interpretation && analysis.interpretation !== lastInterpretation) {
      setIsTyping(true);
      setLastInterpretation(analysis.interpretation);
      
      // Set a small timeout to simulate typing completion
      const typingTimeout = setTimeout(() => {
        setIsTyping(false);
      }, 300);
      
      // Scroll to the bottom of the interpretation as new text appears
      if (interpretationRef.current) {
        interpretationRef.current.scrollTop = interpretationRef.current.scrollHeight;
      }
      
      return () => clearTimeout(typingTimeout);
    }
  }, [analysis.interpretation, lastInterpretation]);

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
                {formatText(analysis.interpretation)}
                {isTyping && (
                  <span className="typing-cursor">|</span>
                )}
              </div>
            )}

            {activeTab === 'symbols' && analysis.symbols.length > 0 && (
              <div className="max-h-[400px] overflow-y-auto pr-2">
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
              </div>
            )}

            {activeTab === 'archetypes' && analysis.archetypes.length > 0 && (
              <div className="max-h-[400px] overflow-y-auto pr-2">
                {analysis.archetypes.map((archetype, index) => (
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
                ))}
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