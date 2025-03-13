'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { SpeechRecognitionService } from '../services/speechRecognition';
import { isSpeechRecognitionSupported } from '../utils/helpers';
import { motion } from 'framer-motion';

interface DreamInputProps {
  onSubmit: (dreamText: string) => void;
  isLoading?: boolean;
}

export default function DreamInput({ onSubmit, isLoading = false }: DreamInputProps) {
  const [dreamText, setDreamText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [charCount, setCharCount] = useState(0);
  const speechRecognitionRef = useRef<SpeechRecognitionService | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Initialize speech recognition service
  useEffect(() => {
    // Only run on client-side
    if (typeof window !== 'undefined') {
      // Clean up the speech recognition service when component unmounts
      return () => {
        if (speechRecognitionRef.current) {
          speechRecognitionRef.current.stop();
        }
      };
    }
  }, []);
  
  // Update character count
  useEffect(() => {
    setCharCount(dreamText.length);
  }, [dreamText]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDreamText(e.target.value);
    if (error) setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!dreamText.trim()) {
      setError('Please enter your dream before submitting.');
      return;
    }
    
    onSubmit(dreamText);
  };

  const toggleVoiceInput = () => {
    if (isRecording) {
      stopVoiceInput();
    } else {
      startVoiceInput();
    }
  };

  const startVoiceInput = () => {
    if (!isSpeechRecognitionSupported()) {
      setError('Voice input is not supported in this browser.');
      return;
    }

    setError(null);
    setIsRecording(true);

    speechRecognitionRef.current = new SpeechRecognitionService({
      onResult: (transcript) => {
        setDreamText((prev) => prev + ' ' + transcript);
        stopVoiceInput();
      },
      onError: (errorMessage) => {
        setError(errorMessage);
        stopVoiceInput();
      },
      onStart: () => {
        setIsRecording(true);
      },
      onEnd: () => {
        setIsRecording(false);
      }
    });

    speechRecognitionRef.current.start();
  };

  const stopVoiceInput = () => {
    if (speechRecognitionRef.current) {
      speechRecognitionRef.current.stop();
    }
    setIsRecording(false);
  };
  
  const focusTextarea = () => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
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
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="w-full max-w-2xl mx-auto"
    >
      <motion.div 
        variants={itemVariants}
        className="dream-card rounded-xl overflow-hidden p-6"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <motion.div variants={itemVariants} className="space-y-3">
            <div className="flex justify-between items-center">
              <label 
                htmlFor="dreamText" 
                className="block text-base font-medium text-gray-700 dark:text-gray-300"
                onClick={focusTextarea}
              >
                Describe your dream in detail
              </label>
              <span className={`text-xs ${charCount > 0 ? 'text-indigo-500 dark:text-indigo-400' : 'text-gray-400'}`}>
                {charCount} characters
              </span>
            </div>
            
            <div className="relative">
              <textarea
                ref={textareaRef}
                id="dreamText"
                value={dreamText}
                onChange={handleTextChange}
                placeholder="I found myself walking through a forest at night. The moon was full and cast a silver light through the trees..."
                className="w-full h-48 p-4 dream-input rounded-lg focus:outline-none dark:bg-gray-800/70 dark:text-white dark:placeholder-gray-400 text-base"
                disabled={isLoading}
              />
              
              {isRecording && (
                <div className="absolute top-2 right-2 flex items-center justify-center w-8 h-8 rounded-full bg-red-500/20 animate-pulse">
                  <div className="w-4 h-4 rounded-full bg-red-500 animate-ping"></div>
                </div>
              )}
            </div>
            
            {error && (
              <motion.p 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-500 text-sm flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </motion.p>
            )}
          </motion.div>

          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-3"
          >
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <Button
                type="button"
                onClick={toggleVoiceInput}
                disabled={isLoading}
                className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                  isRecording 
                    ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/30' 
                    : 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 shadow-lg shadow-indigo-500/30'
                }`}
              >
                {isRecording ? (
                  <>
                    <span className="flex h-3 w-3 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                    </span>
                    Recording... (Click to Stop)
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                      <line x1="12" x2="12" y1="19" y2="22" />
                    </svg>
                    Voice Input
                  </>
                )}
              </Button>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex-1"
            >
              <Button
                type="submit"
                disabled={isLoading || !dreamText.trim()}
                className="w-full dream-button rounded-full px-4 py-2 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Analyzing Dream...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                    </svg>
                    Analyze Dream
                  </>
                )}
              </Button>
            </motion.div>
          </motion.div>
        </form>
      </motion.div>
      
      <motion.div 
        variants={itemVariants}
        className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400"
      >
        <p>Your dreams will be analyzed using Jungian psychology principles to reveal unconscious patterns and symbols.</p>
      </motion.div>
    </motion.div>
  );
} 