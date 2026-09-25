const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI = null;
if (process.env.AI_API_KEY) {
    genAI = new GoogleGenerativeAI(process.env.AI_API_KEY);
}

async function processDocumentWithAI(text, type, data = {}) {
    if (!genAI) {
        throw new Error("AI API Key is missing. Cannot perform real AI analysis.");
    }

    try {
        const modelName = process.env.AI_MODEL || 'gemini-3.8-flash';
        const model = genAI.getGenerativeModel({ model: modelName });

        if (type === 'analyze') {
            const prompt = `
You are an expert legal AI assistant. Your task is to analyze the following legal document and provide a structured JSON summary.
Only return information actually found in the document. Do not fabricate information.
DO NOT provide legal advice. Use neutral, informative language (e.g., "This provision may deserve closer review." instead of "This is illegal" or "This is bad").
If a specific detail isn't present in the document, use "Not found in the document."

Document Text:
"""
${text.substring(0, 50000)}
"""

Extract the following in JSON format:
{
    "summary": "Concise plain-English executive summary generated from the actual uploaded document.",
    "documentType": "Type of document (e.g. Non-Disclosure Agreement)",
    "parties": ["Party 1", "Party 2"] or ["Not found in the document."],
    "importantDates": ["Date 1", "Date 2"] or ["Not found in the document."],
    "financialTerms": ["Payment Terms", "Penalties"] or ["Not found in the document."],
    "keyClauses": [
        {
            "title": "Clause Title (e.g., Payment, Termination, Renewal, Liability, Confidentiality, Intellectual Property, Dispute Resolution, Penalties, Obligations, Restrictions, Data/Privacy)",
            "explanation": "Simple, plain-English explanation of the actual clause",
            "excerpt": "Exact text from the document",
            "location": "Section or Page reference when available",
            "attentionLevel": "Important"
        }
    ],
    "attentionAreas": [
        {
            "title": "Risk/Attention Area Title (e.g., automatic renewal, significant penalties, broad liability, termination restrictions, unusual notice periods, arbitration provisions)",
            "reason": "Why the user should pay attention to this (using neutral wording like 'This provision may deserve closer review.')",
            "excerpt": "Actual supporting excerpt from the document",
            "location": "Section or Page reference",
            "suggestedQuestion": "A question the user should ask their lawyer"
        }
    ],
    "questionsForLawyer": [
        "Question 1", "Question 2"
    ]
}

Return ONLY valid JSON. Do not include markdown formatting like \`\`\`json.
`;
            const result = await model.generateContent(prompt);
            let responseText = result.response.text().trim();
            // clean markdown if present
            if(responseText.startsWith('\`\`\`json')) {
                responseText = responseText.replace(/^\`\`\`json/, '').replace(/\`\`\`$/, '').trim();
            } else if (responseText.startsWith('\`\`\`')) {
                responseText = responseText.replace(/^\`\`\`/, '').replace(/\`\`\`$/, '').trim();
            }
            return JSON.parse(responseText);

        } else if (type === 'ask') {
            const prompt = `
You are a legal document assistant. Answer the user's question using ONLY the provided document context.
If the information cannot be found in the document, explicitly say: "I couldn't find this information in the uploaded document."
Do NOT invent information. Never hallucinate an answer. Provide the relevant source excerpt and location where you found the answer.

Document Text:
"""
${text.substring(0, 50000)}
"""

User Query: "${data.query}"

Return a JSON object:
{
    "answer": "Your detailed answer",
    "source": "The exact source text and section/page reference if available. Otherwise, leave empty."
}
Return ONLY valid JSON.
`;
            const result = await model.generateContent(prompt);
            let responseText = result.response.text().trim();
            if(responseText.startsWith('\`\`\`json')) {
                responseText = responseText.replace(/^\`\`\`json/, '').replace(/\`\`\`$/, '').trim();
            } else if (responseText.startsWith('\`\`\`')) {
                responseText = responseText.replace(/^\`\`\`/, '').replace(/\`\`\`$/, '').trim();
            }
            return JSON.parse(responseText);

        } else if (type === 'compare') {
            const prompt = `
You are a legal AI. I am providing you with two actual documents separated by "--- DOCUMENT B ---". 
Your task is to compare them and identify added clauses, removed clauses, and modified clauses.

Documents:
"""
${text.substring(0, 50000)}
"""

Return a JSON object:
{
    "summary": "A natural language explanation of the overall changes between Document A and Document B",
    "addedClauses": ["Clause 1", "Clause 2"],
    "removedClauses": ["Clause A", "Clause B"],
    "modifiedClauses": [
        {
            "original": "Original actual text from Document A",
            "new": "New actual text from Document B",
            "explanation": "Natural language explanation of the change"
        }
    ]
}
Return ONLY valid JSON.
`;
            const result = await model.generateContent(prompt);
            let responseText = result.response.text().trim();
            if(responseText.startsWith('\`\`\`json')) {
                responseText = responseText.replace(/^\`\`\`json/, '').replace(/\`\`\`$/, '').trim();
            } else if (responseText.startsWith('\`\`\`')) {
                responseText = responseText.replace(/^\`\`\`/, '').replace(/\`\`\`$/, '').trim();
            }
            return JSON.parse(responseText);
        }

    } catch (error) {
        console.error("AI Service Error:", error);
        throw new Error("AI analysis is temporarily unavailable. Please try again.");
    }
}

module.exports = {
    processDocumentWithAI
};
