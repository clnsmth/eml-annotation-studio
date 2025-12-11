export enum AnnotationStatus {
  PENDING = 'PENDING',
  REVIEW_REQUIRED = 'REVIEW_REQUIRED',
  APPROVED = 'APPROVED',
  IGNORED = 'IGNORED'
}

export interface OntologyTerm {
  label: string;
  uri: string;
  ontology: string; // e.g., 'ECSO', 'ENVO'
  description?: string;
  confidence?: number;
  propertyLabel?: string;
  propertyUri?: string;
  attributeName?: string;
  objectName?: string;
}

export interface AnnotatableElement {
  id: string; // Internal UUID or EML ID
  path: string; // XML Path or logical path
  context: string; // Parent entity name (e.g., 'Tree Survey Table')
  contextDescription?: string; // Description of the parent entity
  name: string; // Element name (e.g., 'dbh')
  description: string; // Element description (e.g., 'Diameter at breast height')
  type: 'ATTRIBUTE' | 'COVERAGE' | 'KEYWORD' | 'DATASET' | 'DATATABLE' | 'OTHERENTITY' | 'SPATIALRASTER' | 'SPATIALVECTOR' | 'OTHER';
  currentAnnotations: OntologyTerm[];
  recommendedAnnotations: OntologyTerm[];
  status: AnnotationStatus;
  originalXmlNode?: Node; // Reference to DOM node for export
}

export interface EmlData {
  fileName: string;
  rawXml: string;
  elements: AnnotatableElement[];
}

export interface AppState {
  emlData: EmlData | null;
  isLoading: boolean;
  loadingMessage: string;
  apiKey: string | null;
  emailNotification: string | null;
  showNotification: boolean;
}

export interface RecommenderRequest {
  elements: {
    id: string;
    name: string;
    description: string;
    context: string;
  }[];
}