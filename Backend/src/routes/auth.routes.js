const express = require("express");
const router = express.Router();

const {
    registerUserController,
    loginUserController,
    logoutUserController,
    getMeController
} = require("../controllers/auth.controller");

const rawAuthMiddleware = require("../middlewares/auth.middleware");
const authMiddleware = typeof rawAuthMiddleware === "function" 
    ? rawAuthMiddleware 
    : (rawAuthMiddleware.authMiddleware || rawAuthMiddleware.protect);

router.post("/register", registerUserController);
router.post("/login", loginUserController);
router.post("/logout", logoutUserController);

router.get("/get-me", authMiddleware, getMeController);

module.exports = router;