import { AnnotatableElement, OntologyTerm } from '../types';

export class GeminiService {
  
  isConfigured(): boolean {
    return true; // We assume the local backend is available
  }

  /**
   * Generates recommendations for a batch of elements by calling the backend service.
   */
  async getRecommendations(elements: AnnotatableElement[]): Promise<Map<string, OntologyTerm[]>> {
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

    try {
      const response = await fetch('http://0.0.0.0:8000', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          elements: itemsToAnnotate
        })
      });

      if (!response.ok) {
        console.warn(`Backend returned status ${response.status}`);
        return new Map();
      }

      const result = await response.json() as { id: string, recommendations: OntologyTerm[] }[];
      
      const map = new Map<string, OntologyTerm[]>();
      
      if (Array.isArray(result)) {
        result.forEach(item => {
           if (item.id && Array.isArray(item.recommendations)) {
               map.set(item.id, item.recommendations);
           }
        });
      }
      
      return map;

    } catch (error) {
      console.error("Error fetching recommendations from backend:", error);
      return new Map();
    }
  }
}

export const geminiService = new GeminiService();