const express = require("express");
const router = express.Router();

// 1. Import Controllers
const {
    registerUserController,
    verifyEmailController,
    loginUserController,
    logoutUserController,
    getMeController
} = require("../controllers/auth.controller");

// 2. Import Middleware safely (handles both default & named exports)
const rawAuthMiddleware = require("../middlewares/auth.middleware");
const authMiddleware = typeof rawAuthMiddleware === "function" 
    ? rawAuthMiddleware 
    : (rawAuthMiddleware.authMiddleware || rawAuthMiddleware.protect);

// 3. Define Auth Routes
router.post("/register", registerUserController);
router.post("/verify-otp", verifyEmailController);
router.post("/login", loginUserController);
router.post("/logout", logoutUserController);

// 4. Protected Route
router.get("/get-me", authMiddleware, getMeController);

module.exports = router;