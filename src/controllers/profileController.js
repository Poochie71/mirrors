const supabase = require('../config/supabase');

// --- PLATFORM ENDPOINTS ---

// ROUTE 1: Live Dynamic Profile Lookup from Database (Public)
exports.getPublicProfile = async (req, res) => {
    try {
        const { username } = req.params;

        const { data: profile, error } = await supabase
            .from('profiles')
            .select('username, ranking_score, trust_score, is_verified')
            .eq('username', username)
            .single();

        if (error || !profile) {
            return res.status(404).json({
                success: false,
                message: `No profile record discovered for username: ${username}`
            });
        }

        return res.status(200).json({
            success: true,
            message: `Successfully located profile deck for user: ${username}`,
            data: profile
        });

    } catch (error) {
        console.error('Database Operation Error:', error);
        return res.status(500).json({ error: 'Internal server error during database transmission.' });
    }
};

// ROUTE 2: Automated Data Synchronization (Protected by API Key)
exports.syncMetrics = async (req, res) => {
    try {
        // Pull the target user and incoming structural metrics from the request body
        const { username, ranking_score, trust_score, is_verified } = req.body;

        if (!username) {
            return res.status(400).json({
                success: false,
                message: "Missing parameter: 'username' is strictly required for data synchronization."
            });
        }

        // Prepare the payload dataset of variables passed in
        const updates = {};
        if (ranking_score !== undefined) updates.ranking_score = ranking_score;
        if (trust_score !== undefined) updates.trust_score = trust_score;
        if (is_verified !== undefined) updates.is_verified = is_verified;

        // Execute the update inside your Supabase profiles table
        const { data: updatedProfile, error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('username', username)
            .select()
            .single();

        if (error || !updatedProfile) {
            return res.status(404).json({
                success: false,
                message: `Failed to synchronize metrics. Target profile not found for user: ${username}`,
                details: error ? error.message : 'Unknown database error'
            });
        }

        // Return the fresh, synchronized database record payload
        return res.status(200).json({
            success: true,
            message: `Metrics synchronization pipeline successfully executed for user: ${username}`,
            data: updatedProfile
        });

    } catch (error) {
        console.error('Ingestion Processing Error:', error);
        return res.status(500).json({ error: 'Internal server error during metrics transmission handshake.' });
    }
};