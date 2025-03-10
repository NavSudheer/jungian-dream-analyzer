# Jungian Dream Analyzer

A web application that analyzes dreams based on Jungian psychology principles. This app allows users to input their dreams via text or voice and receive an analysis of the symbols, archetypes, and patterns present in their dreams using OpenAI's advanced language models.

## Features

- **Dream Input**: Enter your dream via text or voice recording
- **AI-Powered Analysis**: Receive a sophisticated interpretation based on Jungian psychology using OpenAI's language models
- **Symbol Recognition**: Identify common dream symbols and their meanings
- **Archetype Detection**: Recognize Jungian archetypes in your dreams
- **Local Storage**: Save your dream analyses for future reference
- **Download Option**: Export your analyses as text files
- **Dark Mode**: Toggle between light and dark themes for comfortable viewing

## Technologies Used

- **Next.js**: React framework for the frontend
- **TypeScript**: For type-safe code
- **Tailwind CSS**: For styling
- **OpenAI API**: For advanced dream analysis
- **Web Speech API**: For voice input functionality
- **Local Storage API**: For client-side data persistence
- **next-themes**: For dark mode implementation

## Getting Started

### Prerequisites

- Node.js 18.0 or later
- npm or yarn
- OpenAI API key

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

3. Create a `.env.local` file in the root directory and add your OpenAI API key:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```

4. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Usage

1. Enter your dream in the text area or use the voice input button to record your dream.
2. Click "Analyze Dream" to receive a Jungian interpretation powered by OpenAI.
3. Review the analysis, which includes identified symbols and archetypes.
4. Save the analysis to your local storage or download it as a text file.
5. Access your saved dreams from the "History" tab.
6. Toggle between light and dark mode using the theme button in the header.

## Privacy

This application sends dream content to OpenAI for analysis. No personal information is included in these requests. Dream analyses are stored only in your browser's local storage.

## Limitations

- The dream analysis quality depends on the OpenAI model's understanding of Jungian psychology.
- Voice recognition may not work in all browsers or may have varying accuracy.
- API rate limits may apply depending on your OpenAI subscription.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- Carl Jung for his pioneering work in dream analysis and analytical psychology
- OpenAI for their powerful language models
- The Next.js team for their excellent framework
- The open-source community for their invaluable tools and libraries
