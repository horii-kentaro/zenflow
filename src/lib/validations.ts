import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("有効なメールアドレスを入力してください"),
  password: z.string().min(8, "パスワードは8文字以上で入力してください"),
});

export const signupSchema = z.object({
  name: z.string().min(1, "名前を入力してください"),
  email: z.string().email("有効なメールアドレスを入力してください"),
  password: z.string().min(8, "パスワードは8文字以上で入力してください"),
});

export const moodSchema = z.object({
  score: z.number().int().min(1).max(5),
  note: z.string().max(500).optional(),
});

export const journalChatSchema = z.object({
  journalId: z.string(),
  message: z.string().min(1).max(2000),
});
