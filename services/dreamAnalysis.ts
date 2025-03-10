import { Archetype, DreamAnalysis, Symbol } from '../utils/types';

// Common dream symbols and their Jungian interpretations
const DREAM_SYMBOLS: Record<string, { meaning: string }> = {
  water: { meaning: 'Represents the unconscious mind and emotions' },
  fire: { meaning: 'Transformation, passion, or destruction' },
  flying: { meaning: 'Freedom, transcendence, or escape from limitations' },
  falling: { meaning: 'Loss of control, failure, or surrender' },
  teeth: { meaning: 'Anxiety, self-image, or communication issues' },
  house: { meaning: 'Representation of the self, different rooms may represent different aspects of personality' },
  snake: { meaning: 'Transformation, healing, or hidden fears' },
  death: { meaning: 'End of a phase, transformation, or rebirth' },
  birth: { meaning: 'New beginnings, creativity, or potential' },
  naked: { meaning: 'Vulnerability, authenticity, or fear of exposure' },
  chase: { meaning: 'Avoiding an issue or fear in waking life' },
  money: { meaning: 'Self-worth, power, or energy' },
  car: { meaning: 'Direction in life, personal drive, or autonomy' },
  mountain: { meaning: 'Challenge, achievement, or perspective' },
  ocean: { meaning: 'The collective unconscious, depth of emotion' },
  bridge: { meaning: 'Transition, connection between different states of being' },
  mirror: { meaning: 'Self-reflection, identity, or confronting one\'s shadow' },
  door: { meaning: 'Opportunity, transition, or access to the unknown' },
  key: { meaning: 'Access, solution, or unlocking potential' },
  animal: { meaning: 'Instinctual nature, specific traits associated with the animal' },
};

// Jungian archetypes
const ARCHETYPES: Record<string, { description: string, significance: string }> = {
  shadow: { 
    description: 'The unknown or rejected aspects of oneself', 
    significance: 'Represents repressed ideas, weaknesses, desires, and instincts'
  },
  anima: { 
    description: 'The feminine image in a man\'s psyche', 
    significance: 'Represents inner feelings and moods, mediates between ego and unconscious'
  },
  animus: { 
    description: 'The masculine image in a woman\'s psyche', 
    significance: 'Represents logic and rationality, mediates between ego and unconscious'
  },
  self: { 
    description: 'The unified unconsciousness and consciousness of an individual', 
    significance: 'Represents the wholeness, unity, and harmony within the psyche'
  },
  persona: { 
    description: 'The social mask or public image one presents to others', 
    significance: 'Represents how we present ourselves to the world'
  },
  hero: { 
    description: 'The figure who overcomes obstacles to achieve goals', 
    significance: 'Represents courage, strength, and the quest for identity'
  },
  mentor: { 
    description: 'The guide or teacher figure', 
    significance: 'Represents wisdom, knowledge, and guidance'
  },
  trickster: { 
    description: 'The mischievous figure who breaks rules', 
    significance: 'Represents cunning, rule-breaking, and challenging conventions'
  },
  mother: { 
    description: 'The nurturing and protective figure', 
    significance: 'Represents nurturing, protection, and comfort'
  },
  father: { 
    description: 'The authoritative and guiding figure', 
    significance: 'Represents authority, structure, and discipline'
  },
};

/**
 * Analyze a dream text using Jungian psychology principles
 */
export const analyzeDream = (dreamText: string): DreamAnalysis => {
  const symbols = identifySymbols(dreamText);
  const archetypes = identifyArchetypes(dreamText);
  const interpretation = generateInterpretation(dreamText, symbols, archetypes);

  return {
    symbols,
    archetypes,
    interpretation,
    timestamp: new Date(),
  };
};

/**
 * Identify symbols in the dream text
 */
const identifySymbols = (dreamText: string): Symbol[] => {
  const symbols: Symbol[] = [];
  const lowerCaseText = dreamText.toLowerCase();
  
  // Count occurrences of each symbol
  const symbolCounts: Record<string, number> = {};
  
  Object.keys(DREAM_SYMBOLS).forEach(symbol => {
    // Use regex to find whole word matches
    const regex = new RegExp(`\\b${symbol}\\b`, 'gi');
    const matches = dreamText.match(regex);
    
    if (matches && matches.length > 0) {
      symbolCounts[symbol] = matches.length;
    }
  });
  
  // Convert to array of Symbol objects
  Object.entries(symbolCounts).forEach(([name, frequency]) => {
    symbols.push({
      name,
      meaning: DREAM_SYMBOLS[name].meaning,
      frequency,
    });
  });
  
  return symbols;
};

/**
 * Identify archetypes in the dream text
 */
const identifyArchetypes = (dreamText: string): Archetype[] => {
  const archetypes: Archetype[] = [];
  const lowerCaseText = dreamText.toLowerCase();
  
  // Simple keyword matching for archetypes
  // In a real application, this would use more sophisticated NLP
  Object.entries(ARCHETYPES).forEach(([type, { description, significance }]) => {
    if (lowerCaseText.includes(type)) {
      archetypes.push({ type, description, significance });
    }
  });
  
  // Add some common archetype detection logic
  if (
    lowerCaseText.includes('mother') || 
    lowerCaseText.includes('nurturing') || 
    lowerCaseText.includes('caring')
  ) {
    archetypes.push({ 
      type: 'mother',
      description: ARCHETYPES.mother.description,
      significance: ARCHETYPES.mother.significance
    });
  }
  
  if (
    lowerCaseText.includes('father') || 
    lowerCaseText.includes('authority') || 
    lowerCaseText.includes('discipline')
  ) {
    archetypes.push({ 
      type: 'father',
      description: ARCHETYPES.father.description,
      significance: ARCHETYPES.father.significance
    });
  }
  
  if (
    lowerCaseText.includes('journey') || 
    lowerCaseText.includes('quest') || 
    lowerCaseText.includes('challenge') ||
    lowerCaseText.includes('overcome')
  ) {
    archetypes.push({ 
      type: 'hero',
      description: ARCHETYPES.hero.description,
      significance: ARCHETYPES.hero.significance
    });
  }
  
  // Ensure no duplicate archetypes
  return archetypes.filter((archetype, index, self) => 
    index === self.findIndex(a => a.type === archetype.type)
  );
};

/**
 * Generate an interpretation based on the identified symbols and archetypes
 */
const generateInterpretation = (dreamText: string, symbols: Symbol[], archetypes: Archetype[]): string => {
  if (symbols.length === 0 && archetypes.length === 0) {
    return "Your dream doesn't contain any common Jungian symbols or archetypes that I could identify. This might be a personal dream with meanings unique to your own experiences. Consider reflecting on the emotions and sensations you felt during the dream, as these can provide valuable insights into its meaning.";
  }

  let interpretation = "From a Jungian perspective, your dream reveals several interesting elements:\n\n";

  // Add symbol interpretations
  if (symbols.length > 0) {
    interpretation += "**Symbols:**\n";
    symbols.forEach(symbol => {
      interpretation += `- The presence of **${symbol.name}** (appearing ${symbol.frequency} time${symbol.frequency > 1 ? 's' : ''}) suggests ${symbol.meaning}.\n`;
    });
    interpretation += "\n";
  }

  // Add archetype interpretations
  if (archetypes.length > 0) {
    interpretation += "**Archetypes:**\n";
    archetypes.forEach(archetype => {
      interpretation += `- The **${archetype.type}** archetype appears in your dream. This represents ${archetype.description.toLowerCase()} and suggests ${archetype.significance.toLowerCase()}.\n`;
    });
    interpretation += "\n";
  }

  // Add a general conclusion
  interpretation += "**Overall Interpretation:**\n";
  interpretation += "This dream appears to be exploring ";
  
  if (symbols.length > 0 && archetypes.length > 0) {
    interpretation += `both symbolic elements (${symbols.map(s => s.name).join(', ')}) and archetypal patterns (${archetypes.map(a => a.type).join(', ')}). `;
    interpretation += "The combination suggests a deep exploration of your unconscious mind, possibly revealing aspects of yourself that you may not be fully aware of in your waking life.";
  } else if (symbols.length > 0) {
    interpretation += `symbolic elements (${symbols.map(s => s.name).join(', ')}). `;
    interpretation += "These symbols may represent aspects of your unconscious mind trying to communicate important insights or emotions.";
  } else {
    interpretation += `archetypal patterns (${archetypes.map(a => a.type).join(', ')}). `;
    interpretation += "These universal patterns suggest that your dream is connecting to deeper, collective human experiences and may reveal important aspects of your psychological development.";
  }

  interpretation += "\n\nRemember that dream interpretation is highly personal, and the most meaningful insights often come from your own reflections on these symbols and patterns.";

  return interpretation;
}; 