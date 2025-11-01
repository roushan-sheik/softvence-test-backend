import express, {} from "express";
import dotenv from "dotenv";
import cors from "cors";
import hpp from "hpp";
import helmet, {} from "helmet";
import { xss } from "express-xss-sanitizer";
import cookieParser from "cookie-parser";
import { rateLimit } from "express-rate-limit"; // Corrected import
import { setupSwagger } from "./src/docs/swagger.js";
import { globalErrorHandler, notFoundMiddleware } from "./src/middlewares/error.middleware.js";
import { mountRoutes } from "./src/routes/index.js";
dotenv.config({ quiet: true });
const app = express();
// Swagger setup
setupSwagger(app);
// Environment
const isProduction = process.env.NODE_ENV === "production";
// CORS setup
const allowedOrigins = [
    "http://localhost:5174",
    "http://localhost:5173",
    "http://localhost:3000",
    "https://hi-testuser.netlify.app",
];
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
    optionsSuccessStatus: 204,
}));
// Security middleware
app.use(hpp());
const helmetOptions = {
    frameguard: { action: "sameorigin" },
    hidePoweredBy: true,
};
if (!isProduction) {
    helmetOptions.contentSecurityPolicy = false;
    helmetOptions.crossOriginEmbedderPolicy = false;
}
if (isProduction) {
    helmetOptions.hsts = { maxAge: 31536000, includeSubDomains: true, preload: true };
}
else {
    helmetOptions.hsts = false;
}
app.use(helmet(helmetOptions));
app.use(xss());
// Create and apply the rate limiter
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
app.use(globalLimiter);
// Parsers
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
// Routes
app.get("/health", (req, res) => {
    res.status(200).json({ code: 200, success: true, message: "Server is running" });
});
app.get("/", (req, res) => {
    res.status(200).json({ code: 200, success: true, message: "Welcome to Dasvilson Server" });
});
mountRoutes(app);
// Error handlers
app.use(notFoundMiddleware);
app.use(globalErrorHandler);
export default app;
//# sourceMappingURL=app.js.map