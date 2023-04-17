import express, { NextFunction, Request, Response, urlencoded, json } from "express";
import dotenv from "dotenv";
import { logger, morganMiddleware } from "./logger";

import userRoutes from "./routes/user";
import companyRoutes from "./routes/company";
import fleetRoutes from "./routes/fleet";
import tripRoutes from "./routes/trip";
import forumRoutes from "./routes/forum";

dotenv.config();

const app = express();
app.use(morganMiddleware);

app.use(json());
app.use(urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.send("nice");
});

app.use("/user", userRoutes);
app.use("/company", companyRoutes);
app.use("/fleet", fleetRoutes);
app.use("/trip", tripRoutes);
app.use("/forum", forumRoutes);

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    logger.error("Unhandled Exception");
    logger.error(err.name);
    logger.error(err.message);
    res.status(500).send('Something broke!');
});

app.listen(process.env.PORT, "0.0.0.0", () => {
    logger.info(`Server started on 0.0.0.0:${process.env.PORT}`);
});