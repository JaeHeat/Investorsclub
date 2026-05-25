import { sql } from "drizzle-orm";
import { jsonb, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";
import { usersTable } from "./auth";

export const clientProfilesTable = pgTable("client_profiles", {
  userId: varchar("user_id")
    .primaryKey()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  data: jsonb("data").notNull().default(sql`'{}'::jsonb`),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const clientHoldingsTable = pgTable("client_holdings", {
  userId: varchar("user_id")
    .primaryKey()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  holdings: jsonb("holdings").notNull().default(sql`'[]'::jsonb`),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});
