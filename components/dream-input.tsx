'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { SpeechRecognitionService } from '../services/speechRecognition';
import { isSpeechRecognitionSupported } from '../utils/helpers';

interface DreamInputProps {
  onSubmit: (dreamText: string) => void;
  isLoading?: boolean;
}

export default function DreamInput({ onSubmit, isLoading = false }: DreamInputProps) {
  const [dreamText, setDreamText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const speechRecognitionRef = useRef<SpeechRecognitionService | null>(null);

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

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="dreamText" className="block text-sm font-medium">
            Describe your dream
          </label>
          <textarea
            id="dreamText"
            value={dreamText}
            onChange={handleTextChange}
            placeholder="Enter your dream here or use voice input..."
            className="w-full h-40 p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            type="button"
            onClick={toggleVoiceInput}
            disabled={isLoading}
            className={`flex items-center gap-2 ${isRecording ? 'bg-red-500 hover:bg-red-600' : ''}`}
          >
            {isRecording ? (
              <>
                <span className="animate-pulse">●</span> Recording... (Click to Stop)
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
          
          <Button
            type="submit"
            disabled={isLoading || !dreamText.trim()}
            className="flex-1"
          >
            {isLoading ? 'Analyzing...' : 'Analyze Dream'}
          </Button>
        </div>
      </form>
    </div>
  );
} 