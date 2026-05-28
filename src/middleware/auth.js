require('dotenv').config();

/**
 * Security Gatekeeper Middleware
 * Validates that incoming requests contain a pristine, authorized API Key signature
 */
module.exports = (req, res, next) => {
    // Extract the API key signature from the request headers
    const apiKey = req.header('X-Mirrors-Access-Key');

    // If the key is entirely missing from the header
    if (!apiKey) {
        return res.status(401).json({
            success: false,
            message: "Access Denied. Cryptographic signature missing from headers."
        });
    }

    // Compare it against the secure master token stored in your .env vault
    if (apiKey !== process.env.MIRRORS_INTERNAL_SECRET_KEY) {
        return res.status(403).json({
            success: false,
            message: "Access Forbidden. Invalid or compromised signature provided."
        });
    }

    // If the key matches perfectly, wave the request through to the controller logic
    next();
};