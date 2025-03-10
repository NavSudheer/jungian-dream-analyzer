'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Dream } from '../utils/types';
import { formatDate } from '../utils/helpers';

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

  if (dreams.length === 0) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <Card className="p-6 text-center">
          <p className="text-gray-500 mb-4">No saved dream analyses yet.</p>
          <p className="text-sm">Your saved analyses will appear here.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Your Dream History</h2>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleClearAll}
          className={showConfirmClear ? 'bg-red-100' : ''}
        >
          {showConfirmClear ? 'Confirm Clear All' : 'Clear All'}
        </Button>
      </div>

      <div className="space-y-4">
        {sortedDreams.map((dream) => (
          <Card 
            key={dream.id} 
            className="p-4 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => toggleExpand(dream.id)}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium">
                  {dream.content.substring(0, 60)}
                  {dream.content.length > 60 ? '...' : ''}
                </p>
                <p className="text-sm text-gray-500">
                  {formatDate(dream.timestamp)}
                </p>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onSelect(dream)}
                >
                  View
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-red-500 hover:bg-red-50"
                  onClick={(e) => handleDelete(e, dream.id)}
                >
                  Delete
                </Button>
              </div>
            </div>

            {expandedDreamId === dream.id && dream.analysis && (
              <div className="mt-4 pt-4 border-t">
                <h4 className="font-medium mb-2">Analysis Summary</h4>
                <p className="text-sm">
                  {dream.analysis.interpretation.substring(0, 200)}...
                </p>
                <div className="mt-2">
                  <Button 
                    variant="link" 
                    size="sm" 
                    className="p-0"
                    onClick={() => onSelect(dream)}
                  >
                    View Full Analysis
                  </Button>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
} 