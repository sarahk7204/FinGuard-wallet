// Simple in-memory rate limiter — limits each IP to 100 requests per 15 minutes
const rateMap = new Map();

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 100;

const rateLimit = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  const record = rateMap.get(ip);

  if (!record || now - record.startTime > WINDOW_MS) {
    rateMap.set(ip, { count: 1, startTime: now });
    return next();
  }

  record.count += 1;
  if (record.count > MAX_REQUESTS) {
    return res.status(429).json({
      success: false,
      message: "Too many requests. Please try again later.",
    });
  }

  next();
};

module.exports = rateLimit;
