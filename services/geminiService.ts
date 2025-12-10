import { GoogleGenAI, Type } from "@google/genai";
import { AnnotatableElement, OntologyTerm } from '../types';

export class GeminiService {
  private ai: GoogleGenAI | null = null;

  constructor() {
    const apiKey = process.env.API_KEY;
    if (apiKey) {
      this.ai = new GoogleGenAI({ apiKey });
    }
  }

  isConfigured(): boolean {
    return !!this.ai;
  }

  /**
   * Generates recommendations for a batch of elements.
   * Batched to reduce API round trips.
   */
  async getRecommendations(elements: AnnotatableElement[]): Promise<Map<string, OntologyTerm[]>> {
    if (!this.ai) {
      console.warn("Gemini API Key not found.");
      return new Map();
    }

    // Prepare prompt payload
    // Exclude DATASET level elements from AI recommendations per requirements
    // DATATABLE elements are included
    const itemsToAnnotate = elements
      .filter(e => e.type !== 'DATASET') 
      .map(e => ({
        id: e.id,
        name: e.name,
        description: e.description,
        context: e.context,
        type: e.type
      }));

    if (itemsToAnnotate.length === 0) return new Map();

    const prompt = `
      You are an expert Ecological Metadata Language (EML) annotator. 
      Analyze the following metadata elements and recommend semantic annotations from established ontologies 
      like ECSO (Ecosystem Ontology), ENVO (Environment Ontology), CHEBI, or PATO.
      
      For each element, provide the most relevant ontology term.
      
      Input Data:
      ${JSON.stringify(itemsToAnnotate, null, 2)}
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING, description: "The ID of the input element" },
                recommendations: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      label: { type: Type.STRING },
                      uri: { type: Type.STRING },
                      ontology: { type: Type.STRING },
                      confidence: { type: Type.NUMBER },
                      description: { type: Type.STRING }
                    },
                    required: ['label', 'uri', 'ontology', 'confidence']
                  }
                }
              },
              required: ['id', 'recommendations']
            }
          }
        }
      });

      const responseText = response.text;
      if (!responseText) return new Map();

      const result = JSON.parse(responseText) as { id: string, recommendations: OntologyTerm[] }[];
      
      // Create a lookup for element type to apply specific predicates
      const typeMap = new Map<string, string>();
      elements.forEach(e => typeMap.set(e.id, e.type));

      const map = new Map<string, OntologyTerm[]>();
      result.forEach(item => {
        const type = typeMap.get(item.id);
        
        // Determine default predicate based on element type
        let propertyLabel = 'contains';
        let propertyUri = 'http://www.w3.org/ns/oa#hasBody';

        if (type === 'ATTRIBUTE') {
            propertyLabel = 'contains measurements of type';
            propertyUri = 'http://ecoinformatics.org/oboe/oboe.1.2/oboe-core.owl#containsMeasurementsOfType';
        }

        // Enhance with default property predicate
        const enhancedRecs = item.recommendations.map(rec => ({
            ...rec,
            propertyLabel,
            propertyUri
        }));
        map.set(item.id, enhancedRecs);
      });
      
      return map;

    } catch (error) {
      console.error("Error fetching recommendations:", error);
      return new Map();
    }
  }
}

export const geminiService = new GeminiService();