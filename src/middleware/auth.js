module.exports = (req, res, next) => {
    const apiKey = req.header('X-Mirrors-Access-Key');

    if (!apiKey) {
        return res.status(401).json({
            success: false,
            message: "Access Denied. Cryptographic signature missing from headers."
        });
    }

    if (apiKey !== process.env.MIRRORS_INTERNAL_SECRET_KEY) {
        return res.status(403).json({
            success: false,
            message: "Access Forbidden. Invalid or compromised signature provided."
        });
    }

    next();
};