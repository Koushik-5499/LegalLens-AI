# LegalLens AI

## Problem
Legal documents are often dense, complicated, and filled with jargon that ordinary people struggle to understand. Individuals frequently sign agreements without fully grasping their obligations, deadlines, or the potential risks involved.

## Solution
LegalLens AI is an AI-powered legal document assistance platform that helps users understand complicated legal documents in simple language. It extracts key clauses, highlights attention areas, and prepares users for discussions with legal professionals.

## Features
- **Document Analysis**: Upload PDF, DOCX, or TXT files for AI-powered extraction and analysis.
- **Plain-English Explanations**: Understand complex legal jargon through simple, everyday language.
- **Clause Extraction & Attention Areas**: Automatically identify payment terms, obligations, deadlines, and potential risks (e.g., automatic renewals, broad liability).
- **Document Q&A (Ask Your Document)**: Ask questions about your document and get answers cited directly from the text.
- **Document Comparison**: Compare two versions of a document to see added, removed, and modified clauses.
- **Lawyer Question Generator**: Automatically generate a list of important questions to ask a qualified legal professional based on the document's contents.
- **Export**: Export analysis results and questions for your lawyer.

## Architecture & Tech Stack
- **Frontend**: React, Vite, Tailwind CSS, Framer Motion, Lucide React
- **Backend**: Node.js, Express.js
- **Document Parsing**: pdf-parse, mammoth (for DOCX)
- **AI Integration**: Powered natively by Google's Gemini API via `@google/generative-ai`. Guaranteed to use actual document text to securely ground and fetch real insights without hallucinations.

## How it Works (AI Architecture)
1. **Extraction**: The backend receives the document and parses text based on its format.
2. **AI Processing**: The text is sent to the Gemini AI service with specific, structured prompts forcing JSON responses for summaries, clause extraction, and risk detection.
3. **Q&A**: The document context is provided alongside user queries to ground answers in the actual text.
4. **Comparison**: Two document texts are fed to the AI to identify differences and explain them naturally.

## Installation & Running Locally

### 1. Clone & Setup
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Environment Variables
Copy `.env.example` to `.env` in the `backend` directory and add your AI credentials:
```bash
AI_API_KEY=your_api_key_here
AI_MODEL=gemini-3.8-flash
PORT=3001
```

*(Note: Create a `.env` file in the frontend with `VITE_API_URL=http://localhost:3001` if not running locally).*

### 3. Run Servers
Start backend (from `/backend` directory):
```bash
npm run dev
```

Start frontend (from `/frontend` directory):
```bash
npm run dev
```

## Application Workflow
1. Open the application.
2. Click **Analyze a Document** and upload a legal contract.
3. Wait for the secure processing to conclude.
4. Explore the **Executive Summary**, **Important Clauses**, and **Attention Areas**.
5. Navigate to the **Ask Document** section and ask, "What is the termination notice period?"
6. Navigate to **Compare Documents** on the sidebar and upload two versions to spot diffs.
7. Review the generated **Questions for Lawyer** and prepare for your meeting.

## Limitations & Legal Disclaimer
**LegalLens AI provides informational assistance based on the documents you provide. It does not provide legal representation or replace advice from a qualified legal professional.** 
The application does not claim legal validity or guarantee the absolute accuracy of the AI-generated analysis.

## Future Improvements
- OCR support for scanned documents and images.
- Integration with legal databases for jurisdictional context.
- User authentication and encrypted cloud storage for documents.
- Collaborative annotation features for teams.
