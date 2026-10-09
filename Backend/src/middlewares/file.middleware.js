const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Export the single file middleware function
module.exports = upload.single("resume");