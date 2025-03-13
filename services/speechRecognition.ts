/**
 * Speech recognition service using the Web Speech API
 */

// Define the SpeechRecognition type
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export interface SpeechRecognitionOptions {
  onResult: (transcript: string) => void;
  onError: (error: string) => void;
  onStart?: () => void;
  onEnd?: () => void;
  continuous?: boolean;
  language?: string;
}

export class SpeechRecognitionService {
  private recognition: any;
  private isListening: boolean = false;

  constructor(options: SpeechRecognitionOptions) {
    // Check if the browser supports the Web Speech API
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      options.onError('Speech recognition is not supported in this browser.');
      return;
    }

    // Initialize the SpeechRecognition object
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    
    // Configure the recognition
    this.recognition.continuous = options.continuous || false;
    this.recognition.interimResults = false;
    this.recognition.lang = options.language || 'en-US';

    // Set up event handlers
    this.recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      options.onResult(transcript);
    };

    this.recognition.onerror = (event: any) => {
      options.onError(`Error: ${event.error}`);
    };

    this.recognition.onstart = () => {
      this.isListening = true;
      if (options.onStart) options.onStart();
    };

    this.recognition.onend = () => {
      this.isListening = false;
      if (options.onEnd) options.onEnd();
    };
  }

  /**
   * Start listening for speech
   */
  start(): void {
    if (!this.recognition) {
      return;
    }
    
    try {
      this.recognition.start();
    } catch (error) {
      console.error('Error starting speech recognition:', error);
    }
  }

  /**
   * Stop listening for speech
   */
  stop(): void {
    if (!this.recognition || !this.isListening) {
      return;
    }
    
    try {
      this.recognition.stop();
    } catch (error) {
      console.error('Error stopping speech recognition:', error);
    }
  }

  /**
   * Check if the service is currently listening
   */
  isActive(): boolean {
    return this.isListening;
  }
} 