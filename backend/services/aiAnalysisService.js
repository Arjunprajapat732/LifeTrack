const Report = require('../models/Report');
const ReportUpload = require('../models/ReportUpload');
const path = require('path');

/**
 * Background service for AI analysis of medical reports
 */
class AIAnalysisService {
  /**
   * Process AI analysis for a report in the background
   * @param {string} reportId - The report ID to analyze
   * @param {string} filePath - Path to the report file
   */
  static async processReportAnalysis(reportId, filePath) {
    try {
      console.log(`🤖 Starting AI analysis for report: ${reportId}`);
      console.log(`📁 File path: ${filePath}`);
      console.log(`📁 File exists: ${require('fs').existsSync(filePath)}`);
      
      // Update report status to processing
      await Report.findByIdAndUpdate(reportId, {
        ai_analysis_status: 'processing',
        ai_analysis_date: new Date()
      });

      // Import AI controller dynamically to avoid circular dependency
      const { analyzeMedicalReport } = require('../controllers/aiController');
      
      // Perform AI analysis
      const analysisResult = await analyzeMedicalReport(filePath);
      
      if (analysisResult.success) {
        // Update report with AI analysis results
        await Report.findByIdAndUpdate(reportId, {
          ai_describe: analysisResult.explanation,
          ai_analysis_status: 'completed',
          ai_analysis_date: new Date()
        });

        console.log(`✅ AI analysis completed for report: ${reportId}`);
        console.log(`📊 Tokens used: ${analysisResult.usage?.total_tokens || 'N/A'}`);
      } else {
        throw new Error('AI analysis failed');
      }

    } catch (error) {
      console.error(`❌ AI analysis failed for report ${reportId}:`, error);
      
      // Update report status to failed
      await Report.findByIdAndUpdate(reportId, {
        ai_analysis_status: 'failed',
        ai_analysis_date: new Date()
      });

      // Log error for monitoring
      console.error(`AI Analysis Error Details:`, {
        reportId,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Process AI analysis with patient context
   * @param {string} reportId - The report ID to analyze
   * @param {string} filePath - Path to the report file
   * @param {Object} patientContext - Patient context information
   */
  static async processReportAnalysisWithContext(reportId, filePath, patientContext) {
    try {
      console.log(`🤖 Starting AI analysis with context for report: ${reportId}`);
      
      // Update report status to processing
      await Report.findByIdAndUpdate(reportId, {
        ai_analysis_status: 'processing',
        ai_analysis_date: new Date()
      });

      // Import the context-aware analysis function
      const { analyzeMedicalReportWithContext } = require('../controllers/aiController');
      
      // Perform AI analysis with context
      const analysisResult = await analyzeMedicalReportWithContext(filePath, patientContext);
      
      if (analysisResult.success) {
        // Update report with AI analysis results
        await Report.findByIdAndUpdate(reportId, {
          ai_describe: analysisResult.explanation,
          ai_analysis_status: 'completed',
          ai_analysis_date: new Date()
        });

        console.log(`✅ AI analysis with context completed for report: ${reportId}`);
        console.log(`📊 Tokens used: ${analysisResult.usage?.total_tokens || 'N/A'}`);
      } else {
        throw new Error('AI analysis with context failed');
      }

    } catch (error) {
      console.error(`❌ AI analysis with context failed for report ${reportId}:`, error);
      
      // Update report status to failed
      await Report.findByIdAndUpdate(reportId, {
        ai_analysis_status: 'failed',
        ai_analysis_date: new Date()
      });

      // Log error for monitoring
      console.error(`AI Analysis with Context Error Details:`, {
        reportId,
        patientContext,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Retry failed AI analysis
   * @param {string} reportId - The report ID to retry
   * @param {string} filePath - Path to the report file
   * @param {Object} patientContext - Patient context information (optional)
   */
  static async retryAnalysis(reportId, filePath, patientContext = null) {
    try {
      console.log(`🔄 Retrying AI analysis for report: ${reportId}`);
      
      if (patientContext) {
        await this.processReportAnalysisWithContext(reportId, filePath, patientContext);
      } else {
        await this.processReportAnalysis(reportId, filePath);
      }
      
    } catch (error) {
      console.error(`❌ Retry failed for report ${reportId}:`, error);
      throw error;
    }
  }

  /**
   * Get AI analysis status for a report
   * @param {string} reportId - The report ID
   * @returns {Object} Analysis status information
   */
  static async getAnalysisStatus(reportId) {
    try {
      const report = await Report.findById(reportId).select('ai_analysis_status ai_analysis_date ai_describe');
      
      if (!report) {
        throw new Error('Report not found');
      }

      return {
        status: report.ai_analysis_status,
        date: report.ai_analysis_date,
        hasDescription: !!report.ai_describe
      };
    } catch (error) {
      console.error(`Error getting analysis status for report ${reportId}:`, error);
      throw error;
    }
  }

  /**
   * Batch process multiple reports for AI analysis
   * @param {Array} reports - Array of report objects with id and filePath
   */
  static async batchProcessAnalysis(reports) {
    console.log(`🔄 Starting batch AI analysis for ${reports.length} reports`);
    
    const promises = reports.map(report => 
      this.processReportAnalysis(report.id, report.filePath)
    );

    try {
      await Promise.allSettled(promises);
      console.log(`✅ Batch AI analysis completed`);
    } catch (error) {
      console.error(`❌ Batch AI analysis failed:`, error);
      throw error;
    }
  }

  /**
   * Process AI analysis for a ReportUpload in the background
   * @param {string} uploadId - The upload ID to analyze
   * @param {string} filePath - Path to the report file
   */
  static async processUploadAnalysis(uploadId, filePath) {
    try {
      console.log(`🤖 Starting AI analysis for upload: ${uploadId}`);
      console.log(`📁 File path: ${filePath}`);
      console.log(`📁 File exists: ${require('fs').existsSync(filePath)}`);
      
      // Update upload status to processing
      await ReportUpload.findByIdAndUpdate(uploadId, {
        ai_analysis_status: 'processing',
        ai_analysis_date: new Date()
      });

      // Import AI controller dynamically to avoid circular dependency
      const { analyzeMedicalReport } = require('../controllers/aiController');
      
      // Perform AI analysis
      const analysisResult = await analyzeMedicalReport(filePath);
      
      if (analysisResult.success) {
        // Update upload with AI analysis results
        await ReportUpload.findByIdAndUpdate(uploadId, {
          ai_describe: analysisResult.explanation,
          ai_analysis_status: 'completed',
          ai_analysis_date: new Date()
        });

        console.log(`✅ AI analysis completed for upload: ${uploadId}`);
        console.log(`📊 Tokens used: ${analysisResult.usage?.total_tokens || 'N/A'}`);
      } else {
        throw new Error('AI analysis failed');
      }

    } catch (error) {
      console.error(`❌ AI analysis failed for upload ${uploadId}:`, error);
      
      // Update upload status to failed
      await ReportUpload.findByIdAndUpdate(uploadId, {
        ai_analysis_status: 'failed',
        ai_analysis_date: new Date()
      });

      // Log error for monitoring
      console.error(`AI Analysis Error Details:`, {
        uploadId,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Clean up old AI analysis data (for maintenance)
   * @param {number} daysOld - Number of days old to consider for cleanup
   */
  static async cleanupOldAnalysis(daysOld = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const result = await Report.updateMany(
        {
          ai_analysis_date: { $lt: cutoffDate },
          ai_analysis_status: { $in: ['completed', 'failed'] }
        },
        {
          $unset: { ai_describe: 1 },
          $set: { ai_analysis_status: 'pending' }
        }
      );

      console.log(`🧹 Cleaned up AI analysis data for ${result.modifiedCount} reports older than ${daysOld} days`);
      return result.modifiedCount;
    } catch (error) {
      console.error('Error cleaning up old AI analysis:', error);
      throw error;
    }
  }
}

module.exports = AIAnalysisService;
