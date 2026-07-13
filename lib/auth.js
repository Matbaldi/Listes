export function isAuthorized(req) {
    const auth = req.headers.authorization || req.headers.Authorization;
    if (!auth || !auth.startsWith('Basic ')) return false;

    const base64Credentials = auth.slice('Basic '.length).trim();
    let decoded;
    try {
        decoded = Buffer.from(base64Credentials, 'base64').toString('utf-8');
    } catch {
        return false;
    }

    const separatorIndex = decoded.indexOf(':');
    if (separatorIndex === -1) return false;

    const user = decoded.slice(0, separatorIndex);
    const pass = decoded.slice(separatorIndex + 1);

    return (
        user === process.env.ADMIN_USER &&
        pass === process.env.ADMIN_PASSWORD &&
        !!process.env.ADMIN_USER &&
        !!process.env.ADMIN_PASSWORD
    );
}

export function requireAuth(req, res) {
    if (!isAuthorized(req)) {
        res.setHeader('WWW-Authenticate', 'Basic realm="Admin"');
        res.status(401).json({ error: 'Non autorisé' });
        return false;
    }
    return true;
}