import { Server } from "http";
import app from "./app.js";
import connectDB from "./src/db/connectDB.js";
import chalk from "chalk";
import mongoose from "mongoose";
const PORT = parseInt(process.env.PORT || "5000", 10);
(async () => {
    try {
        await connectDB();
        const server = app.listen(PORT, () => {
            console.log(chalk.blue.bold(`🚀 Server started on port ${PORT}`));
        });
        // Graceful shutdown
        const shutdown = async (signal) => {
            console.log(chalk.yellow.bold(`🛑 ${signal} received. Shutting down...`));
            server.close(async () => {
                console.log(chalk.green.bold("✅ Express server closed."));
                await mongoose.connection.close();
                console.log(chalk.green.bold("✅ MongoDB disconnected."));
                process.exit(0);
            });
            setTimeout(() => {
                console.error(chalk.red.bold("💥 Could not close connections. Forcing exit."));
                process.exit(1);
            }, 10000).unref();
        };
        process.on("SIGINT", () => shutdown("SIGINT"));
        process.on("SIGTERM", () => shutdown("SIGTERM"));
        // Handle unhandled promise rejections
        process.on("unhandledRejection", async (err) => {
            console.error(chalk.red.bold(`💥 Unhandled Rejection: ${err.message}`));
            console.error(err.stack);
            await shutdown("Unhandled Rejection");
        });
        // Handle uncaught exceptions
        process.on("uncaughtException", async (err) => {
            console.error(chalk.red.bold(`🔥 Uncaught Exception: ${err.message}`));
            console.error(err.stack);
            await shutdown("Uncaught Exception");
        });
    }
    catch (err) {
        console.error(chalk.red.bold("❌ Server failed to start:"), err);
        process.exit(1);
    }
})();
//# sourceMappingURL=index.js.map