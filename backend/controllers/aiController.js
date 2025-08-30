const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
require('dotenv').config();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Convert file to base64 for transmission
 * @param {string} filePath - Path to the file
 * @returns {string} Base64 encoded string
 */
const convertFileToBase64 = (filePath) => {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    const base64String = fileBuffer.toString('base64');
    return base64String;
  } catch (error) {
    console.error('Error converting file to base64:', error);
    throw new Error('Failed to convert file to base64');
  }
};

/**
 * Get file MIME type based on extension
 * @param {string} filePath - Path to the file
 * @returns {string} MIME type
 */
const getMimeType = (filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes = {
    '.pdf': 'application/pdf',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.bmp': 'image/bmp',
    '.tiff': 'image/tiff',
    '.webp': 'image/webp'
  };
  return mimeTypes[ext] || 'application/octet-stream';
};

/**
 * Analyze medical report using OpenAI Vision API
 * @param {string} filePath - Path to the medical report file (image or PDF)
 * @returns {Promise<Object>} Analysis result from OpenAI
 */
const analyzeMedicalReport = async (filePath) => {
  try {
    // Validate file exists
    if (!fs.existsSync(filePath)) {
      throw new Error('File not found');
    }

    // Convert file to base64
    const base64Data = convertFileToBase64(filePath);
    const mimeType = getMimeType(filePath);

    // Prepare the prompt for medical report analysis
    const prompt = `Read this medical report carefully and provide a clear, patient-friendly explanation. 
        Please include:
        1. A summary of the main findings
        2. What each result means in simple terms
        3. Any important values that are outside normal ranges
        4. Recommendations or next steps if mentioned
        5. Any medical terms explained in plain language

        Make the explanation easy to understand for a patient who may not have medical training.`;

    // Call OpenAI Vision API
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${base64Data}`,
                detail: "high"
              }
            }
          ]
        }
      ],
      max_tokens: 1000,
      temperature: 0.3
    });

    return {
      success: true,
      explanation: response.choices[0].message.content,
      model: response.model,
      usage: response.usage
    };

  } catch (error) {
    console.error('Error analyzing medical report:', error);
    
    // Handle specific OpenAI errors
    if (error.code === 'insufficient_quota') {
      throw new Error('OpenAI API quota exceeded. Please try again later.');
    } else if (error.code === 'invalid_api_key') {
      throw new Error('Invalid OpenAI API key. Please check configuration.');
    } else if (error.message.includes('File not found')) {
      throw new Error('Medical report file not found.');
    } else if (error.message.includes('Failed to convert file')) {
      throw new Error('Failed to process the medical report file.');
    } else {
      throw new Error('Failed to analyze medical report. Please try again.');
    }
  }
};

/**
 * Enhanced medical report analysis with additional context
 * @param {string} filePath - Path to the medical report file
 * @param {Object} patientContext - Additional patient context (optional)
 * @returns {Promise<Object>} Enhanced analysis result
 */
const analyzeMedicalReportWithContext = async (filePath, patientContext = {}) => {
  try {
    // Validate file exists
    if (!fs.existsSync(filePath)) {
      throw new Error('File not found');
    }

    // Convert file to base64
    const base64Data = convertFileToBase64(filePath);
    const mimeType = getMimeType(filePath);

    // Build context-aware prompt
    let contextPrompt = `Read this medical report carefully and provide a clear, patient-friendly explanation.`;

    if (patientContext.age) {
      contextPrompt += `\n\nPatient Age: ${patientContext.age}`;
    }
    if (patientContext.gender) {
      contextPrompt += `\nPatient Gender: ${patientContext.gender}`;
    }
    if (patientContext.medicalHistory) {
      contextPrompt += `\nRelevant Medical History: ${patientContext.medicalHistory}`;
    }

    contextPrompt += `

Please provide:
1. **Summary**: Key findings and overall assessment
2. **Detailed Explanation**: What each result means in simple terms
3. **Normal vs Abnormal**: Highlight any values outside normal ranges
4. **Medical Terms**: Explain any complex medical terminology
5. **Recommendations**: Next steps or follow-up actions mentioned
6. **Questions to Ask**: Suggest questions the patient might want to ask their doctor

Make the explanation compassionate and easy to understand.`;

    // Call OpenAI Vision API with enhanced prompt
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: contextPrompt
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${base64Data}`,
                detail: "high"
              }
            }
          ]
        }
      ],
      max_tokens: 1500,
      temperature: 0.2
    });

    return {
      success: true,
      explanation: response.choices[0].message.content,
      model: response.model,
      usage: response.usage,
      context: patientContext
    };

  } catch (error) {
    console.error('Error analyzing medical report with context:', error);
    throw error;
  }
};

/**
 * Extract specific information from medical report
 * @param {string} filePath - Path to the medical report file
 * @param {Array} informationTypes - Types of information to extract
 * @returns {Promise<Object>} Structured extraction result
 */
const extractMedicalInformation = async (filePath, informationTypes = ['vitals', 'medications', 'diagnoses', 'recommendations']) => {
  try {
    // Validate file exists
    if (!fs.existsSync(filePath)) {
      throw new Error('File not found');
    }

    // Convert file to base64
    console.log('filePath', filePath);
    const base64Data = convertFileToBase64(filePath);
    const mimeType = getMimeType(filePath);

    // Build extraction prompt
    const extractionPrompt = `Analyze this medical report and extract the following information in a structured format:

    ${informationTypes.map(type => `- ${type.charAt(0).toUpperCase() + type.slice(1)}`).join('\n')}

    Please provide the information in this exact JSON format:
    {
    "vitals": {"blood_pressure": "", "heart_rate": "", "temperature": "", "weight": ""},
    "medications": ["list", "of", "medications"],
    "diagnoses": ["list", "of", "diagnoses"],
    "recommendations": ["list", "of", "recommendations"],
    "abnormal_values": ["list", "of", "abnormal", "results"],
    "summary": "brief summary"
    }

    Only include the JSON response, no additional text.`;

    // Call OpenAI Vision API
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: extractionPrompt
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${base64Data}`,
                detail: "high"
              }
            }
          ]
        }
      ],
      max_tokens: 1000,
      temperature: 0.1
    });

    // Parse JSON response
    let extractedData;
    try {
      extractedData = JSON.parse(response.choices[0].message.content);
    } catch (parseError) {
      throw new Error('Failed to parse extracted information');
    }

    return {
      success: true,
      extractedData,
      model: response.model,
      usage: response.usage
    };

  } catch (error) {
    console.error('Error extracting medical information:', error);
    throw error;
  }
};

module.exports = {
  analyzeMedicalReport,
  analyzeMedicalReportWithContext,
  extractMedicalInformation,
  convertFileToBase64,
  getMimeType
};
