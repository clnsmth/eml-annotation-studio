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

    if (itemsToAnnotate.length === 0) {
      console.log('No eligible elements for annotation found (Dataset level filtered out).');
      return new Map();
    }

    const payload = { elements: itemsToAnnotate };
    // UPDATED: Point to /api/recommend endpoint instead of root to avoid 405 Method Not Allowed
    const url = 'http://localhost:8000/api/recommendations';

    console.log(`[GeminiService] Preparing to POST ${itemsToAnnotate.length} items to ${url}`);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        console.warn(`[GeminiService] Backend returned status ${response.status}: ${response.statusText}`);
        return new Map();
      }

      const result = await response.json() as { id: string, recommendations: OntologyTerm[] }[];
      console.log('[GeminiService] Response received:', result);
      
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
      console.error(`[GeminiService] Failed to fetch recommendations from ${url}. Is the server running?`, error);
      return new Map();
    }
  }
}

export const geminiService = new GeminiService();