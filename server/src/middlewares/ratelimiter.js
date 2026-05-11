import ratelimit from "express-rate-limit";
export const limiter = ratelimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // limit each IP to 20 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers

  legacyHeaders: false, // Disable the `X-RateLimit-*` headers

  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});
