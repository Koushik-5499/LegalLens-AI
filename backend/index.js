const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const dotenv = require('dotenv');

dotenv.config();

const { processDocumentWithAI } = require('./services/aiService');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Setup multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Ensure uploads directory exists
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        service: "LegalLens AI",
        status: "online"
    });
});

// Render health check endpoint
app.get("/healthz", (req, res) => {
  res.status(200).json({
    service: "LegalLens AI",
    status: "online"
  });
});

// Health endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: "ok",
        service: "LegalLens AI"
    });
});

// Upload and analyze endpoint
app.post('/api/analyze', upload.single('document'), async (req, res) => {
    let filePath;
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        filePath = req.file.path;
        let extractedText = '';

        try {
            if (req.file.mimetype === 'application/pdf') {
                const dataBuffer = fs.readFileSync(filePath);
                const data = await pdfParse(dataBuffer);
                extractedText = data.text;
            } else if (req.file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
                const result = await mammoth.extractRawText({ path: filePath });
                extractedText = result.value;
            } else if (req.file.mimetype === 'text/plain') {
                extractedText = fs.readFileSync(filePath, 'utf8');
            } else {
                fs.unlinkSync(filePath);
                return res.status(400).json({ error: "Unsupported file format" });
            }
        } catch (extErr) {
            console.error("Extraction error:", extErr);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            return res.status(400).json({ error: "Unable to extract text from this document." });
        }

        // Clean up file after extraction
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

        // Call AI Service
        const analysis = await processDocumentWithAI(extractedText, 'analyze');

        res.json({
            success: true,
            extractedText: extractedText.substring(0, 1000) + '...', // send preview
            analysis: analysis
        });
    } catch (error) {
        console.error("Analysis error:", error);
        res.status(500).json({ error: error.message || "Failed to analyze document" });
    }
});

// Q&A endpoint
app.post('/api/ask', async (req, res) => {
    try {
        const { query, documentText } = req.body;
        if (!query) {
            return res.status(400).json({ error: "Query is required" });
        }

        const response = await processDocumentWithAI(documentText, 'ask', { query });
        res.json({ success: true, answer: response });
    } catch (error) {
        console.error("Q&A error:", error);
        res.status(500).json({ error: error.message || "Failed to process question" });
    }
});

// Compare endpoint
app.post('/api/compare', upload.array('documents', 2), async (req, res) => {
    try {
        if (!req.files || req.files.length !== 2) {
            return res.status(400).json({ error: "Exactly two files are required for comparison" });
        }

        // Extracting text for both files
        const extractedTexts = [];
        for (const file of req.files) {
            let text = '';
            const filePath = file.path;
            
            try {
                if (file.mimetype === 'application/pdf') {
                    const dataBuffer = fs.readFileSync(filePath);
                    const data = await pdfParse(dataBuffer);
                    text = data.text;
                } else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
                    const result = await mammoth.extractRawText({ path: filePath });
                    text = result.value;
                } else if (file.mimetype === 'text/plain') {
                    text = fs.readFileSync(filePath, 'utf8');
                } else {
                    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
                    return res.status(400).json({ error: "Unsupported file format for " + file.originalname });
                }
            } catch (extErr) {
                console.error("Extraction error:", extErr);
                if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
                return res.status(400).json({ error: "Unable to extract text from this document." });
            }
            
            extractedTexts.push(text);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }

        const combinedText = `--- DOCUMENT A ---\n${extractedTexts[0]}\n\n--- DOCUMENT B ---\n${extractedTexts[1]}`;
        const response = await processDocumentWithAI(combinedText, 'compare');
        res.json({ success: true, comparison: response });
    } catch (error) {
        console.error("Compare error:", error);
        res.status(500).json({ error: error.message || "Failed to compare documents" });
    }
});

app.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
});
