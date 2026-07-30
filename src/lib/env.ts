import "server-only";
import { z } from "zod";

const optionalUrl = z.string().url().optional().or(z.literal(""));

const schema = z.object({
  DEMO_MODE: z.enum(["true", "false"]).default("false"),
  APP_ORIGIN: z.string().url().default("http://localhost:3000"),
  OWNER_EMAIL: z.string().email().default("demo@instachat.local"),
  NEXT_PUBLIC_SUPABASE_URL: optionalUrl,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().optional(),
  SUPABASE_SECRET_KEY: z.string().optional(),
  META_APP_ID: z.string().optional(),
  META_APP_SECRET: z.string().optional(),
  META_WEBHOOK_APP_SECRET: z.string().optional(),
  META_GRAPH_API_VERSION: z.string().regex(/^v\d+\.\d+$/).default("v25.0"),
  META_WEBHOOK_VERIFY_TOKEN: z.string().optional(),
  TOKEN_ENCRYPTION_KEY: z.string().optional(),
  WORKER_SECRET: z.string().optional(),
  CRON_SECRET: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_AUDIENCE_MODEL: z.string().min(1).max(100).default("gpt-5.6-terra"),
  AI_MAX_COMMENTS_PER_RUN: z.coerce.number().int().min(1).max(2000).default(2000),
  AI_MAX_DAILY_RUNS: z.coerce.number().int().min(1).max(20).default(2),
});

export const env = schema.parse(process.env);
export const isDemoMode = env.DEMO_MODE === "true";
