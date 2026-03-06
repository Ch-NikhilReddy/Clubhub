import express from "express";
import cors from "cors";
import "dotenv/config.js";
import connectDB from "./config/mongodb.js";
import userRouter from "./routes/userRouter.js";
import eventRouter from "./routes/eventRouter.js"; // Import event router
import teamRouter from "./routes/teamRouter.js"; // Import team router
import analyticsRouter from "./routes/analyticsRouter.js"; // Import analytics router

const app = express();
const PORT = process.env.PORT || 4000;

const startServer = async () => {
  try {
    // Connect to Database first
    await connectDB();

    // Middleware
    app.use(express.json()); // To parse JSON bodies
    app.use(cors({
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      optionsSuccessStatus: 200
    }));

    // API Routes
    app.use("/api/users", userRouter);
    app.use("/api/events", eventRouter);
    app.use("/api/teams", teamRouter);
    app.use("/api/analytics", analyticsRouter);

    // Health check endpoint
    app.get('/health', (req, res) => {
      res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      });
    });


    // Centralized Error Handler
    app.use((err, req, res, next) => {
      console.error(err.stack);
      res.status(500).send('Something broke!');
    });

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();