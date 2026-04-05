import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET || "foodrush-secret-key-2024";
export function signToken(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}
export function verifyToken(token) {
    return jwt.verify(token, JWT_SECRET);
}
export function requireAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ error: "Unauthorized" });
        return;
    }
    const token = authHeader.slice(7);
    try {
        const payload = verifyToken(token);
        req.user = payload;
        next();
    }
    catch {
        res.status(401).json({ error: "Invalid token" });
    }
}
export function requireAdmin(req, res, next) {
    const user = req.user;
    if (!user || user.role !== "admin") {
        res.status(403).json({ error: "Forbidden" });
        return;
    }
    next();
}
