import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  AUTH_SECRET: z
    .string()
    .min(1, "AUTH_SECRET is required")
    .refine(
      (val) => !val.startsWith("development-"),
      "AUTH_SECRET must not use the default development value in production"
    ),
  AUTH_URL: z.string().url("AUTH_URL must be a valid URL"),
  ANTHROPIC_API_KEY: z
    .string()
    .min(1, "ANTHROPIC_API_KEY is required")
    .refine(
      (val) => val.startsWith("sk-ant-"),
      "ANTHROPIC_API_KEY must be a valid Anthropic API key (starts with sk-ant-)"
    ),
});

type Env = z.infer<typeof envSchema>;

let _env: Env | undefined;

export function validateEnv(): Env {
  if (_env) return _env;

  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const errors = result.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    console.error(
      `\n❌ 環境変数の設定エラー:\n${errors}\n\n.env.local ファイルを確認してください。\n`
    );
    throw new Error("環境変数のバリデーションに失敗しました");
  }

  _env = result.data;
  return _env;
}
