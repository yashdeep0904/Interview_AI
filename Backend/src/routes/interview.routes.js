const express = require("express");
const router = express.Router();

// 1. Import Controllers (Exact names from interview.controller.js)
const {
    generateInterViewReportController,
    getInterviewReportByIdController,
    getAllInterviewReportsController,
    generateResumePdfController
} = require("../controllers/interview.controller");

// 2. Import Middlewares
const authMiddleware = require("../middlewares/auth.middleware");
const uploadResume = require("../middlewares/file.middleware");

// 3. Define Routes
// POST: Generate new interview report
router.post("/generate", authMiddleware, uploadResume, generateInterViewReportController);

// GET: Fetch all interview reports for the logged-in user
router.get("/reports", authMiddleware, getAllInterviewReportsController);

// GET: Fetch a single interview report by ID
router.get("/report/:interviewId", authMiddleware, getInterviewReportByIdController);

// GET: Download Resume PDF
router.get("/resume/:interviewReportId/download", authMiddleware, generateResumePdfController);

module.exports = router;