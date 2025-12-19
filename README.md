![Experimental](https://img.shields.io/badge/status-experimental-orange) ![WIP](https://img.shields.io/badge/status-WIP-yellow)

# eml-annotation-studio

EML Annotation Studio is the front-end application for the EML Annotation Engine. It provides a user-friendly interface for uploading, parsing, and annotating EML (Ecological Metadata Language) files. The tool is designed to streamline the process of reviewing and suggesting terms for metadata annotation, making it easier for users to work with ecological data standards.

## Features
- Upload and parse EML files
- Interactive annotation editor
- Suggest and review terms for metadata fields
- Integration with the EML Annotation Engine for enhanced suggestions

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Run the app:
   `npm run dev`

## Project Structure
- `components/` – React components for UI and annotation workflows
- `services/` – Logic for EML parsing and Annotation Engine API integration
- `constants/` – Mock data and static resources
- `types.ts` – TypeScript type definitions

## License
See `LICENSE` file for details.
