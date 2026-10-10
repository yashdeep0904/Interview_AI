const pdfParse = require("pdf-parse");
const { generateInterviewReport, generateResumePdf } = require("../services/ai.service");
const interviewReportModel = require("../models/interviewReport.model");

/**
 * @description Controller to generate interview report based on user self description, resume and job description.
 */
async function generateInterViewReportController(req, res) {
    try {
        const { selfDescription, jobDescription } = req.body;
        
        // Safely extract text based on how the pdf-parse module is exported in your environment
        let resumeText = "";
        if (req.file && req.file.buffer) {
            if (typeof pdfParse === "function") {
                // Standard pdf-parse syntax
                const pdfData = await pdfParse(req.file.buffer);
                resumeText = pdfData.text;
            } else if (pdfParse && typeof pdfParse.PDFParse === "function") {
                // Your original pdf-parse syntax
                const resumeContent = await (new pdfParse.PDFParse(Uint8Array.from(req.file.buffer))).getText();
                resumeText = resumeContent.text;
            } else if (pdfParse && typeof pdfParse.default === "function") {
                // ES6 Default Import syntax
                const pdfData = await pdfParse.default(req.file.buffer);
                resumeText = pdfData.text;
            } else {
                throw new Error("Cannot identify pdf-parse parsing function.");
            }
        }

        const interViewReportByAi = await generateInterviewReport({
            resume: resumeText,
            selfDescription,
            jobDescription
        });

        const interviewReport = await interviewReportModel.create({
            user: req.user.id,
            resume: resumeText,
            selfDescription,
            jobDescription,
            ...interViewReportByAi
        });

        res.status(201).json({
            success: true,
            message: "Interview report generated successfully.",
            interviewReport
        });
    } catch (error) {
        console.error("Generate Report Error:", error);
        res.status(500).json({ success: false, message: `Failed to generate report: ${error.message}` });
    }
}

/**
 * @description Controller to get interview report by interviewId.
 */
async function getInterviewReportByIdController(req, res) {
    try {
        const { interviewId } = req.params;

        const interviewReport = await interviewReportModel.findOne({ 
            _id: interviewId, 
            user: req.user.id 
        });

        if (!interviewReport) {
            return res.status(404).json({ success: false, message: "Interview report not found." });
        }

        res.status(200).json({
            success: true,
            message: "Interview report fetched successfully.",
            interviewReport
        });
    } catch (error) {
        console.error("Get Report Error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch report." });
    }
}

/** 
 * @description Controller to get all interview reports of logged in user.
 */
async function getAllInterviewReportsController(req, res) {
    try {
        const interviewReports = await interviewReportModel
            .find({ user: req.user.id })
            .sort({ createdAt: -1 })
            .select("-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan");

        res.status(200).json({
            success: true,
            message: "Interview reports fetched successfully.",
            interviewReports
        });
    } catch (error) {
        console.error("Get All Reports Error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch reports." });
    }
}

/**
 * @description Controller to generate resume PDF based on user self description, resume and job description.
 */
async function generateResumePdfController(req, res) {
    try {
        const { interviewReportId } = req.params;

        const interviewReport = await interviewReportModel.findById(interviewReportId);

        if (!interviewReport) {
            return res.status(404).json({ success: false, message: "Interview report not found." });
        }

        const { resume, jobDescription, selfDescription } = interviewReport;

        const pdfBuffer = await generateResumePdf({ resume, jobDescription, selfDescription });

        res.set({
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename=resume_${interviewReportId}.pdf`
        });

        res.send(pdfBuffer);
    } catch (error) {
        console.error("PDF Generation Error:", error);
        res.status(500).json({ success: false, message: "Failed to generate PDF." });
    }
}

module.exports = { 
    generateInterViewReportController, 
    getInterviewReportByIdController, 
    getAllInterviewReportsController, 
    generateResumePdfController 
};