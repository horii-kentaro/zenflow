import { describe, it, expect } from "vitest";
import {
  loginSchema,
  signupSchema,
  moodSchema,
  journalChatSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from "@/lib/validations";

describe("loginSchema", () => {
  it("有効なデータを受け入れる", () => {
    const result = loginSchema.safeParse({
      email: "test@example.com",
      password: "password123",
    });
    expect(result.success).toBe(true);
  });

  it("無効なメールアドレスを拒否する", () => {
    const result = loginSchema.safeParse({
      email: "invalid-email",
      password: "password123",
    });
    expect(result.success).toBe(false);
  });

  it("空のパスワードを拒否する", () => {
    const result = loginSchema.safeParse({
      email: "test@example.com",
      password: "",
    });
    expect(result.success).toBe(false);
  });
});

describe("signupSchema", () => {
  const validData = {
    name: "テストユーザー",
    email: "test@example.com",
    password: "Password1!",
  };

  it("有効なデータを受け入れる", () => {
    const result = signupSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("空の名前を拒否する", () => {
    const result = signupSchema.safeParse({ ...validData, name: "" });
    expect(result.success).toBe(false);
  });

  it("51文字以上の名前を拒否する", () => {
    const result = signupSchema.safeParse({ ...validData, name: "a".repeat(51) });
    expect(result.success).toBe(false);
  });

  it("50文字の名前を受け入れる", () => {
    const result = signupSchema.safeParse({ ...validData, name: "a".repeat(50) });
    expect(result.success).toBe(true);
  });

  describe("パスワード強度バリデーション", () => {
    it("8文字未満のパスワードを拒否する", () => {
      const result = signupSchema.safeParse({ ...validData, password: "Aa1!" });
      expect(result.success).toBe(false);
    });

    it("小文字なしのパスワードを拒否する", () => {
      const result = signupSchema.safeParse({ ...validData, password: "PASSWORD1!" });
      expect(result.success).toBe(false);
    });

    it("大文字なしのパスワードを拒否する", () => {
      const result = signupSchema.safeParse({ ...validData, password: "password1!" });
      expect(result.success).toBe(false);
    });

    it("数字なしのパスワードを拒否する", () => {
      const result = signupSchema.safeParse({ ...validData, password: "Password!!" });
      expect(result.success).toBe(false);
    });

    it("記号なしのパスワードを拒否する", () => {
      const result = signupSchema.safeParse({ ...validData, password: "Password11" });
      expect(result.success).toBe(false);
    });

    it("全要件を満たすパスワードを受け入れる", () => {
      const result = signupSchema.safeParse({ ...validData, password: "MyP@ss1word" });
      expect(result.success).toBe(true);
    });
  });
});

describe("moodSchema", () => {
  it("有効なスコアを受け入れる（1-5）", () => {
    for (let score = 1; score <= 5; score++) {
      const result = moodSchema.safeParse({ score });
      expect(result.success).toBe(true);
    }
  });

  it("スコア0を拒否する", () => {
    expect(moodSchema.safeParse({ score: 0 }).success).toBe(false);
  });

  it("スコア6を拒否する", () => {
    expect(moodSchema.safeParse({ score: 6 }).success).toBe(false);
  });

  it("小数スコアを拒否する", () => {
    expect(moodSchema.safeParse({ score: 3.5 }).success).toBe(false);
  });

  it("オプショナルのnoteを受け入れる", () => {
    const result = moodSchema.safeParse({ score: 3, note: "今日は良い日" });
    expect(result.success).toBe(true);
  });

  it("noteなしでも受け入れる", () => {
    const result = moodSchema.safeParse({ score: 3 });
    expect(result.success).toBe(true);
  });

  it("500文字超のnoteを拒否する", () => {
    const result = moodSchema.safeParse({ score: 3, note: "a".repeat(501) });
    expect(result.success).toBe(false);
  });
});

describe("journalChatSchema", () => {
  it("有効なデータを受け入れる", () => {
    const result = journalChatSchema.safeParse({
      journalId: "abc123",
      message: "今日の振り返り",
    });
    expect(result.success).toBe(true);
  });

  it("空のメッセージを拒否する", () => {
    const result = journalChatSchema.safeParse({
      journalId: "abc123",
      message: "",
    });
    expect(result.success).toBe(false);
  });

  it("2000文字超のメッセージを拒否する", () => {
    const result = journalChatSchema.safeParse({
      journalId: "abc123",
      message: "a".repeat(2001),
    });
    expect(result.success).toBe(false);
  });
});

describe("forgotPasswordSchema", () => {
  it("有効なメールアドレスを受け入れる", () => {
    const result = forgotPasswordSchema.safeParse({ email: "test@example.com" });
    expect(result.success).toBe(true);
  });

  it("無効なメールアドレスを拒否する", () => {
    const result = forgotPasswordSchema.safeParse({ email: "not-an-email" });
    expect(result.success).toBe(false);
  });
});

describe("resetPasswordSchema", () => {
  it("有効なデータを受け入れる", () => {
    const result = resetPasswordSchema.safeParse({
      token: "abc123token",
      password: "NewPass1!",
    });
    expect(result.success).toBe(true);
  });

  it("空のトークンを拒否する", () => {
    const result = resetPasswordSchema.safeParse({
      token: "",
      password: "NewPass1!",
    });
    expect(result.success).toBe(false);
  });

  it("弱いパスワードを拒否する", () => {
    const result = resetPasswordSchema.safeParse({
      token: "abc123token",
      password: "weak",
    });
    expect(result.success).toBe(false);
  });
});

describe("changePasswordSchema", () => {
  it("有効なデータを受け入れる", () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: "current",
      newPassword: "NewPass1!",
    });
    expect(result.success).toBe(true);
  });

  it("空の現在パスワードを拒否する", () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: "",
      newPassword: "NewPass1!",
    });
    expect(result.success).toBe(false);
  });

  it("弱い新パスワードを拒否する", () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: "current",
      newPassword: "weak",
    });
    expect(result.success).toBe(false);
  });
});
