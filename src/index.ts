import "dotenv/config";
import express from "express";
import cors from "cors";
import { prisma } from "./lib/prisma";
import categoriesRouter from "./routes/categories";
import { errorHandler, notFound } from "./middlewares/errorHandler";

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL ?? "http://localhost:5173" }));
app.use(express.json());

app.get("/api/health", async (_req, res) => {
  const items = await prisma.item.count();
  res.json({ data: { status: "ok", items } });
});

app.use("/api/categories", categoriesRouter);
// TODO: เพิ่ม router อื่นตรงนี้ เช่น
// app.use("/api/auth", authRouter);
// app.use("/api/items", itemsRouter);
// app.use("/api/requests", requestsRouter);
// app.use("/api/admin", adminRouter);

app.use(notFound);
app.use(errorHandler);

const PORT = Number(process.env.PORT ?? 3000);
app.listen(PORT, () => {
  console.log(`ShareBox API running on http://localhost:${PORT}`);
});
