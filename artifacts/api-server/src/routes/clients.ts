import { Router, type IRouter, type Request, type Response } from "express";
import { eq } from "drizzle-orm";
import { db, usersTable, clientProfilesTable, clientHoldingsTable } from "@workspace/db";
import { z } from "zod/v4";

const router: IRouter = Router();

function requireAuth(req: Request, res: Response): req is Request & { user: NonNullable<Request["user"]> } {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return false;
  }
  return true;
}

function requireAdmin(req: Request, res: Response): req is Request & { user: NonNullable<Request["user"]> } {
  if (!req.isAuthenticated() || req.user.role !== "admin") {
    res.status(403).json({ error: "Forbidden" });
    return false;
  }
  return true;
}

router.get("/clients", async (req: Request, res: Response) => {
  if (!requireAdmin(req, res)) return;

  try {
    const users = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.role, "client"));

    const profiles = await db.select().from(clientProfilesTable);
    const holdingsList = await db.select().from(clientHoldingsTable);

    const profileMap = new Map(profiles.map((p) => [p.userId, p.data]));
    const holdingsMap = new Map(holdingsList.map((h) => [h.userId, h.holdings]));

    const clients = users.map((u) => ({
      id: u.id,
      email: u.email,
      firstName: u.firstName,
      lastName: u.lastName,
      profileImageUrl: u.profileImageUrl,
      createdAt: u.createdAt,
      profile: profileMap.get(u.id) ?? null,
      holdings: holdingsMap.get(u.id) ?? [],
    }));

    res.json({ clients });
  } catch (err) {
    req.log.error({ err }, "Failed to list clients");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/clients/me/profile", async (req: Request, res: Response) => {
  if (!requireAuth(req, res)) return;

  try {
    const [profileRow] = await db
      .select()
      .from(clientProfilesTable)
      .where(eq(clientProfilesTable.userId, req.user.id))
      .limit(1);

    const [holdingsRow] = await db
      .select()
      .from(clientHoldingsTable)
      .where(eq(clientHoldingsTable.userId, req.user.id))
      .limit(1);

    res.json({
      profile: profileRow?.data ?? null,
      holdings: holdingsRow?.holdings ?? [],
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get client profile");
    res.status(500).json({ error: "Internal server error" });
  }
});

const PutProfileBody = z.object({
  profile: z.record(z.string(), z.unknown()),
  holdings: z.array(z.record(z.string(), z.unknown())).default([]),
});

router.put("/clients/me/profile", async (req: Request, res: Response) => {
  if (!requireAuth(req, res)) return;

  const parsed = PutProfileBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const { profile, holdings } = parsed.data;
  const userId = req.user.id;

  try {
    await db
      .insert(clientProfilesTable)
      .values({ userId, data: profile })
      .onConflictDoUpdate({
        target: clientProfilesTable.userId,
        set: { data: profile, updatedAt: new Date() },
      });

    await db
      .insert(clientHoldingsTable)
      .values({ userId, holdings })
      .onConflictDoUpdate({
        target: clientHoldingsTable.userId,
        set: { holdings, updatedAt: new Date() },
      });

    res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Failed to upsert client profile");
    res.status(500).json({ error: "Internal server error" });
  }
});

const AdminPutProfileBody = z.object({
  profile: z.record(z.string(), z.unknown()),
  holdings: z.array(z.record(z.string(), z.unknown())).default([]),
});

router.put("/clients/:userId/profile", async (req: Request, res: Response) => {
  if (!requireAdmin(req, res)) return;

  const parsed = AdminPutProfileBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const { profile, holdings } = parsed.data;
  const userId = String(req.params.userId);

  try {
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);

    if (!user || user.role !== "client") {
      res.status(404).json({ error: "Client not found" });
      return;
    }

    await db
      .insert(clientProfilesTable)
      .values({ userId, data: profile })
      .onConflictDoUpdate({
        target: clientProfilesTable.userId,
        set: { data: profile, updatedAt: new Date() },
      });

    await db
      .insert(clientHoldingsTable)
      .values({ userId, holdings })
      .onConflictDoUpdate({
        target: clientHoldingsTable.userId,
        set: { holdings, updatedAt: new Date() },
      });

    res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Failed to upsert client profile (admin)");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
