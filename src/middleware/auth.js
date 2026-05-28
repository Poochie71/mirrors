require('dotenv').config();

module.exports = (req, res, next) => {
    const apiKey = req.header('X-Mirrors-Access-Key');

    // DEBUG ENGINE: Let's see exactly what the server is processing
    console.log("--- MIDDLEWARE SECURITY AUTH DIAGNOSTIC ---");
    console.log("Inbound Key from cURL Header:", apiKey);
    console.log("Stored Key inside Vercel Environment:", process.env.MIRRORS_INTERNAL_SECRET_KEY);
    console.log("-------------------------------------------");

    if (!apiKey) {
        return res.status(401).json({
            success: false,
            message: "Access Denied. Cryptographic signature missing."
        });
    }

    // Temporary bypass for testing: If it matches OR if we just want to bypass it to test the database
    if (apiKey !== process.env.MIRRORS_INTERNAL_SECRET_KEY) {
        return res.status(403).json({
            success: false,
            message: "Access Forbidden. Invalid signature.",
            debugInfo: {
                received: apiKey,
                expected: process.env.MIRRORS_INTERNAL_SECRET_KEY ? "Loaded (Hidden)" : "UNDEFINED / EMPTY"
            }
        });
    }

    next();
};