import express from "express";
import cors from "cors";
import { prisma } from "./lib/prisma";
import { env } from "./config/env";
import categoriesRouter from "./routes/categories";
import authRouter from "./routes/auth";
import itemsRouter from "./routes/items";
import requestsRouter from "./routes/requests";
import adminRouter from "./routes/admin";
import { errorHandler, notFound } from "./middlewares/errorHandler";

const app = express();

app.use(cors({ origin: env.clientUrl }));
app.use(express.json());

app.get("/api/health", async (_req, res) => {
  const items = await prisma.item.count();
  res.json({ data: { status: "ok", items } });
});

app.use("/api/categories", categoriesRouter);
app.use("/api/auth", authRouter);
app.use("/api/items", itemsRouter);
app.use("/api/requests", requestsRouter);
app.use("/api/admin", adminRouter);

app.use(notFound);
app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`ShareBox API running on http://localhost:${env.port}`);
});
