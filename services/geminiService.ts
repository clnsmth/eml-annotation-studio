import { AnnotatableElement, OntologyTerm } from '../types';

export class GeminiService {
  
  isConfigured(): boolean {
    return true; // We assume the local backend is available
  }

  /**
   * Generates recommendations for a batch of elements by calling the backend service.
   */
  async getRecommendations(elements: AnnotatableElement[]): Promise<Map<string, OntologyTerm[]>> {
    // Group elements by type for the backend coordinator
    const groupedPayload: Record<string, any[]> = {};
    let totalCount = 0;

    elements.forEach(e => {
      // Exclude DATASET level elements from AI recommendations per requirements
      if (e.type === 'DATASET') return; 

      if (!groupedPayload[e.type]) {
        groupedPayload[e.type] = [];
      }

      groupedPayload[e.type].push({
        id: e.id,
        name: e.name,
        description: e.description,
        context: e.context
        // Type is implicit in the grouping key
      });
      totalCount++;
    });

    if (totalCount === 0) {
      console.log('No eligible elements for annotation found (Dataset level filtered out).');
      return new Map();
    }

    // Payload is now the grouped object directly
    const url = 'http://localhost:8000/api/recommendations';

    console.log(`[GeminiService] Preparing to POST ${totalCount} items (grouped by type) to ${url}`);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(groupedPayload)
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