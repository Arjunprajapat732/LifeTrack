# AI Medical Report Analysis

This module provides AI-powered analysis of medical reports using OpenAI's Vision API. It can process images and PDFs to provide patient-friendly explanations of medical reports.

## Features

- **Medical Report Analysis**: Convert medical reports (images/PDFs) to patient-friendly explanations
- **Context-Aware Analysis**: Include patient context (age, gender, medical history) for better analysis
- **Information Extraction**: Extract specific medical information in structured format
- **Multiple File Formats**: Support for images (JPG, PNG, GIF, BMP, TIFF, WebP) and PDFs
- **Error Handling**: Comprehensive error handling with cleanup

## Setup

1. **Install Dependencies**:
   ```bash
   npm install openai
   ```

2. **Environment Variables**:
   Add your OpenAI API key to `.env`:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```

3. **Create Uploads Directory**:
   The system will automatically create an `uploads/` directory for temporary file storage.

## API Endpoints

### 1. Analyze Medical Report
**POST** `/api/ai/analyze-report`

Upload and analyze a medical report file.

**Request**:
- Content-Type: `multipart/form-data`
- Body:
  - `report`: File (image or PDF, max 10MB)

**Response**:
```json
{
  "success": true,
  "data": {
    "explanation": "Your medical report shows...",
    "model": "gpt-4-vision-preview",
    "usage": {
      "prompt_tokens": 100,
      "completion_tokens": 500,
      "total_tokens": 600
    }
  },
  "message": "Medical report analyzed successfully"
}
```

### 2. Analyze with Patient Context
**POST** `/api/ai/analyze-report-with-context`

Analyze a medical report with additional patient context.

**Request**:
- Content-Type: `multipart/form-data`
- Body:
  - `report`: File (image or PDF, max 10MB)
  - `age`: Patient age (optional)
  - `gender`: Patient gender (optional)
  - `medicalHistory`: Relevant medical history (optional)

**Response**:
```json
{
  "success": true,
  "data": {
    "explanation": "Based on your age and medical history...",
    "model": "gpt-4-vision-preview",
    "usage": {...},
    "context": {
      "age": "45",
      "gender": "female",
      "medicalHistory": "diabetes"
    }
  },
  "message": "Medical report analyzed with context successfully"
}
```

### 3. Extract Medical Information
**POST** `/api/ai/extract-information`

Extract specific information from medical reports in structured format.

**Request**:
- Content-Type: `multipart/form-data`
- Body:
  - `report`: File (image or PDF, max 10MB)
  - `informationTypes`: JSON array of information types to extract (optional)

**Response**:
```json
{
  "success": true,
  "data": {
    "extractedData": {
      "vitals": {
        "blood_pressure": "120/80",
        "heart_rate": "72",
        "temperature": "98.6",
        "weight": "165"
      },
      "medications": ["Metformin", "Lisinopril"],
      "diagnoses": ["Type 2 Diabetes", "Hypertension"],
      "recommendations": ["Continue current medications", "Follow up in 3 months"],
      "abnormal_values": ["Blood glucose: 180 mg/dL"],
      "summary": "Patient shows controlled diabetes with mild hypertension"
    },
    "model": "gpt-4-vision-preview",
    "usage": {...}
  },
  "message": "Medical information extracted successfully"
}
```

### 4. Analyze Existing Report
**POST** `/api/ai/analyze-existing-report`

Analyze a report file that already exists on the server.

**Request**:
- Content-Type: `application/json`
- Body:
  ```json
  {
    "filePath": "/path/to/existing/report.pdf",
    "includeContext": true,
    "age": "45",
    "gender": "female",
    "medicalHistory": "diabetes"
  }
  ```

## Usage Examples

### Frontend Integration

```javascript
// Upload and analyze a medical report
const analyzeReport = async (file) => {
  const formData = new FormData();
  formData.append('report', file);

  try {
    const response = await fetch('/api/ai/analyze-report', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    const result = await response.json();
    if (result.success) {
      console.log('Analysis:', result.data.explanation);
    }
  } catch (error) {
    console.error('Error:', error);
  }
};

// Analyze with patient context
const analyzeWithContext = async (file, patientData) => {
  const formData = new FormData();
  formData.append('report', file);
  formData.append('age', patientData.age);
  formData.append('gender', patientData.gender);
  formData.append('medicalHistory', patientData.medicalHistory);

  try {
    const response = await fetch('/api/ai/analyze-report-with-context', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    const result = await response.json();
    return result.data.explanation;
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### Backend Usage

```javascript
const { analyzeMedicalReport, analyzeMedicalReportWithContext } = require('./controllers/aiController');

// Analyze a file
const result = await analyzeMedicalReport('/path/to/report.pdf');
console.log(result.explanation);

// Analyze with context
const context = {
  age: '45',
  gender: 'female',
  medicalHistory: 'diabetes, hypertension'
};

const resultWithContext = await analyzeMedicalReportWithContext('/path/to/report.pdf', context);
console.log(resultWithContext.explanation);
```

## Error Handling

The system handles various error scenarios:

- **File not found**: Returns appropriate error message
- **Invalid file type**: Only allows images and PDFs
- **File size exceeded**: 10MB limit enforced
- **OpenAI API errors**: Handles quota exceeded, invalid API key, etc.
- **Network errors**: Graceful error handling with cleanup

## Security Features

- **Authentication Required**: All endpoints require valid JWT token
- **File Type Validation**: Only allows medical report file types
- **File Size Limits**: Prevents large file uploads
- **Automatic Cleanup**: Temporary files are cleaned up after processing
- **Rate Limiting**: Integrated with existing rate limiting system

## Cost Considerations

- Uses OpenAI GPT-4 Vision API (costs apply)
- High-detail image analysis uses more tokens
- Consider implementing usage limits for production
- Monitor API usage and costs regularly

## Integration with Report Upload

The AI analysis is automatically triggered when a new report is uploaded. The process works as follows:

### Automatic Background Processing

1. **Report Upload**: When a report is uploaded via `/api/reports/upload`
2. **Background Analysis**: AI analysis starts automatically in the background
3. **Status Updates**: The report's `ai_analysis_status` field is updated throughout the process
4. **Result Storage**: The AI explanation is stored in the `ai_describe` field

### Report Model Updates

The Report model now includes these AI-related fields:

```javascript
{
  ai_describe: String,           // AI-generated explanation
  ai_analysis_status: String,    // 'pending', 'processing', 'completed', 'failed'
  ai_analysis_date: Date         // When analysis was performed
}
```

### API Endpoints for AI Integration

#### Check AI Analysis Status
**GET** `/api/reports/:reportId/ai-status`

Returns the current status of AI analysis for a report.

**Response**:
```json
{
  "success": true,
  "data": {
    "analysisStatus": {
      "status": "completed",
      "date": "2024-01-15T10:30:00.000Z",
      "hasDescription": true
    },
    "reportId": "report_id_here"
  }
}
```

#### Retry Failed AI Analysis
**POST** `/api/reports/:reportId/ai-retry`

Retries AI analysis for reports that previously failed.

**Response**:
```json
{
  "success": true,
  "message": "AI analysis retry initiated. Check status for updates.",
  "data": {
    "reportId": "report_id_here",
    "status": "retrying"
  }
}
```

### Frontend Integration Example

```javascript
// Upload report with automatic AI analysis
const uploadReport = async (file, reportData) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('title', reportData.title);
  formData.append('description', reportData.description);
  formData.append('reportType', reportData.reportType);

  const response = await fetch('/api/reports/upload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });

  const result = await response.json();
  console.log('Report uploaded:', result.message);
  // AI analysis starts automatically in the background
};

// Check AI analysis status
const checkAIStatus = async (reportId) => {
  const response = await fetch(`/api/reports/${reportId}/ai-status`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  const result = await response.json();
  return result.data.analysisStatus;
};

// Retry failed AI analysis
const retryAIAnalysis = async (reportId) => {
  const response = await fetch(`/api/reports/${reportId}/ai-retry`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  const result = await response.json();
  console.log('Retry initiated:', result.message);
};

// Poll for AI analysis completion
const pollAIStatus = async (reportId, onComplete) => {
  const checkStatus = async () => {
    const status = await checkAIStatus(reportId);
    
    if (status.status === 'completed') {
      onComplete(status);
    } else if (status.status === 'failed') {
      console.error('AI analysis failed');
    } else {
      // Continue polling
      setTimeout(checkStatus, 5000); // Check every 5 seconds
    }
  };

  checkStatus();
};
```

## Background Service

The `AIAnalysisService` handles all background processing:

- **Automatic Processing**: Triggered on report upload
- **Error Handling**: Graceful failure handling with status updates
- **Retry Logic**: Failed analyses can be retried
- **Status Tracking**: Real-time status updates
- **Batch Processing**: Support for processing multiple reports
- **Cleanup**: Automatic cleanup of old analysis data

## Limitations

- Maximum file size: 10MB
- Supported formats: JPG, PNG, GIF, BMP, TIFF, WebP, PDF
- Requires OpenAI API key and credits
- Processing time depends on file size and complexity
- Results are AI-generated and should be reviewed by healthcare professionals
- Background processing may take 10-30 seconds depending on file complexity
