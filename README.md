# Jungian Dream Analyzer

A web application that analyzes dreams based on Jungian psychology principles. This app allows users to input their dreams via text or voice and receive an analysis of the symbols, archetypes, and patterns present in their dreams.

## Features

- **Dream Input**: Enter your dream via text or voice recording
- **Jungian Analysis**: Receive an interpretation based on Jungian psychology
- **Symbol Recognition**: Identify common dream symbols and their meanings
- **Archetype Detection**: Recognize Jungian archetypes in your dreams
- **Local Storage**: Save your dream analyses for future reference
- **Download Option**: Export your analyses as text files

## Technologies Used

- **Next.js**: React framework for the frontend
- **TypeScript**: For type-safe code
- **Tailwind CSS**: For styling
- **Web Speech API**: For voice input functionality
- **Local Storage API**: For client-side data persistence

## Getting Started

### Prerequisites

- Node.js 18.0 or later
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/jungian-dream-analyzer.git
   cd jungian-dream-analyzer
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Usage

1. Enter your dream in the text area or use the voice input button to record your dream.
2. Click "Analyze Dream" to receive a Jungian interpretation.
3. Review the analysis, which includes identified symbols and archetypes.
4. Save the analysis to your local storage or download it as a text file.
5. Access your saved dreams from the "History" tab.

## Privacy

This application processes all data client-side. No dream content or analysis is sent to any server or stored outside of your browser's local storage.

## Limitations

- The dream analysis is based on a simplified model of Jungian psychology and should not be considered a substitute for professional interpretation.
- Voice recognition may not work in all browsers or may have varying accuracy.
- The symbol and archetype detection is based on keyword matching and may not capture all nuances of your dream.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- Carl Jung for his pioneering work in dream analysis and analytical psychology
- The Next.js team for their excellent framework
- The open-source community for their invaluable tools and libraries
