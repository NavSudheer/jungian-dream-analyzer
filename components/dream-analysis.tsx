'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { DreamAnalysis } from '../utils/types';
import { formatDate, downloadTextFile } from '../utils/helpers';

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
    // Split by newlines
    return text.split('\n').map((line, index) => {
      // Bold text (surrounded by **)
      line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      
      // Check if line is a heading (starts with **)
      if (line.startsWith('**') && line.endsWith(':**')) {
        return (
          <h3 key={index} className="text-lg font-bold mt-4 mb-2">
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

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card className="p-6">
        <div className="mb-4">
          <h2 className="text-xl font-bold mb-2">Dream Analysis</h2>
          <p className="text-sm text-gray-500">
            Analyzed on {formatDate(analysis.timestamp)}
          </p>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Your Dream</h3>
          <div className="bg-gray-50 p-3 rounded-md">
            <p className="whitespace-pre-wrap">{dreamContent}</p>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Jungian Interpretation</h3>
          <div className="prose max-w-none">
            {formatText(analysis.interpretation)}
          </div>
        </div>

        {analysis.symbols.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Symbols Identified</h3>
            <ul className="list-disc pl-5 space-y-1">
              {analysis.symbols.map((symbol, index) => (
                <li key={index}>
                  <span className="font-medium">{symbol.name}</span>
                  {symbol.frequency > 1 && (
                    <span className="text-sm text-gray-500"> (appears {symbol.frequency} times)</span>
                  )}
                  <p className="text-sm">{symbol.meaning}</p>
                </li>
              ))}
            </ul>
          </div>
        )}

        {analysis.archetypes.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Archetypes Identified</h3>
            <ul className="list-disc pl-5 space-y-2">
              {analysis.archetypes.map((archetype, index) => (
                <li key={index}>
                  <span className="font-medium capitalize">{archetype.type}</span>
                  <p className="text-sm">{archetype.description}</p>
                  <p className="text-sm text-gray-600">{archetype.significance}</p>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <Button onClick={handleSave} disabled={saved}>
            {saved ? 'Saved' : 'Save Analysis'}
          </Button>
          <Button onClick={handleDownload} variant="outline">
            Download as Text
          </Button>
          <Button onClick={onNewDream} variant="outline" className="ml-auto">
            Analyze Another Dream
          </Button>
        </div>
      </Card>
    </div>
  );
} 