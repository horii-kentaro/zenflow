import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "パスワードは8文字以上で入力してください")
  .regex(/[a-z]/, "小文字を1文字以上含めてください")
  .regex(/[A-Z]/, "大文字を1文字以上含めてください")
  .regex(/[0-9]/, "数字を1文字以上含めてください")
  .regex(/[^a-zA-Z0-9]/, "記号を1文字以上含めてください");

export const loginSchema = z.object({
  email: z.string().email("有効なメールアドレスを入力してください"),
  password: z.string().min(1, "パスワードを入力してください"),
});

export const signupSchema = z.object({
  name: z.string().min(1, "名前を入力してください").max(50, "名前は50文字以内で入力してください"),
  email: z.string().email("有効なメールアドレスを入力してください"),
  password: passwordSchema,
});

export const moodSchema = z.object({
  score: z.number().int().min(1).max(5),
  note: z.string().max(500).optional(),
});

export const journalChatSchema = z.object({
  journalId: z.string(),
  message: z.string().min(1).max(2000),
});
