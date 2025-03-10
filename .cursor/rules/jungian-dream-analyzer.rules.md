# Jungian Dream Analyzer App Rules

These rules guide the AI in generating code for the Jungian Dream Analyzer web application.

## Project Overview
This web application, built with Next.js and TypeScript, allows users to input their dreams via text or voice and receive an analysis based on Jungian psychology principles. Key features include:
- Dream input via text or voice (using Web Speech API)
- Dream analysis performed via Next.js API routes
- Local storage for saving and reviewing past analyses
- No user sign-up required; all data is handled client-side
The analysis incorporates Jungian concepts such as archetypes, symbols, and the collective unconscious.

## Code Style and Conventions
- Use **TypeScript** for all code.
- Implement **functional components** with React hooks.
- Use **Chakra UI** for styling to ensure a consistent and responsive design.
- Follow standard Next.js conventions for file organization:
  - Components in `components/`
  - Pages in `pages/`
  - API routes in `pages/api/`
  - Utilities in `utils/`
  - Services in `services/`
- Use descriptive variable and function names.
- Include type definitions for all interfaces and props.

## Specific Instructions

### Dream Input Component
- Create a `DreamInput.tsx` component in `components/` that includes:
  - A text area for manual dream input
  - A button to start voice recording using the Web Speech API
  - Error handling for voice input (e.g., browser not supported, transcription errors)
- Example voice input code:
  ```typescript
  const startVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Voice input is not supported in this browser.');
      return;
    }
    const recognition = new webkitSpeechRecognition();
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setDreamText(transcript);
    };
    recognition.onerror = (event) => {
      console.error('Voice recognition error', event);
      alert('Unable to transcribe voice input.');
    };
    recognition.start();
  };