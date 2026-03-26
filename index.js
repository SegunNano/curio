import "dotenv/config";
import express from "express";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import path from "path";
import session from "express-session";
import flash from "connect-flash";
import ejsMate from "ejs-mate";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import hpp from "hpp";

// Configs
import connectDB from "./src/config/db.js";
import sessionConfig from "./src/config/session.js";
import { addToNewsFetchQueue } from "./src/queues/queue.js";

// Routes
import authRoutes from "./src/routes/auth.routes.js";
import userRoutes from "./src/routes/user.routes.js";
import newsRoutes from "./src/routes/news.routes.js";
import homeRoutes from "./src/routes/home.routes.js";

// Middleware
import { authLimiter, isAuthenticated, isLoggedIn, limiter } from "./src/middleware/middleware.js";
import startCron from "./src/utils/cron.js";

// Workers
import "./src/workers/welcomeEmail.worker.js";
import "./src/workers/newsFetch.worker.js";
import "./src/workers/digest.worker.js";
import "./src/workers/inactivity.worker.js";
import { helmetObj } from "./src/utils/utils.js";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Security first
app.set("trust proxy", 1);
app.use(helmet(helmetObj));
// app.use(mongoSanitize())
app.use(hpp());

// 2. Rate limiting
app.use(limiter);

// 3. View engine
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "./src/views"));
app.use(express.static(path.join(__dirname, "./src/public")));

// 4. Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 5. Session + cookies
app.use(session(sessionConfig));
app.use(cookieParser());

// 6. Flash
app.use(flash());

// 7. Auth
app.use(isAuthenticated);

// 8. Locals
app.use((req, res, next) => {
  res.locals.currentUser = req.user || null;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.info = req.flash("info");
  res.locals.warning = req.flash("warning");
  next();
});

// 9. Routes
app.use("/auth", authLimiter, authRoutes);
app.use("/user", isLoggedIn, userRoutes);
app.use("/news", isLoggedIn, newsRoutes);
app.use("/", homeRoutes);

// 10. Dev routes
if (process.env.NODE_ENV !== "production") {
  app.get("/dev/fetch-news", (req, res) => {
    addToNewsFetchQueue();
    res.send("News fetch job queued ✅");
  });
}

// 11. Start server
const startServer = async () => {
  await connectDB();
  startCron();

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} 🚀`);
  });
};

startServer();
