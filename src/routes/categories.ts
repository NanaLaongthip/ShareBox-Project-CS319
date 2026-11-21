import { Router } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

// GET /api/categories
router.get("/", async (_req, res) => {
  const data = await prisma.category.findMany({ orderBy: { id: "asc" } });
  res.json({ data });
});

export default router;
