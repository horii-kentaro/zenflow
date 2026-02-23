import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("next-auth/react", () => ({
  signIn: vi.fn(),
}));

const mockPush = vi.fn();
const mockRefresh = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
}));

import { LoginForm } from "@/components/auth/LoginForm";
import { signIn } from "next-auth/react";

const mockSignIn = signIn as ReturnType<typeof vi.fn>;

describe("LoginForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it("メールアドレスとパスワードのフィールドを表示する", () => {
    render(<LoginForm />);
    expect(screen.getByLabelText("メールアドレス")).toBeInTheDocument();
    expect(screen.getByLabelText("パスワード")).toBeInTheDocument();
  });

  it("ログインボタンを表示する", () => {
    render(<LoginForm />);
    expect(screen.getByRole("button", { name: "ログイン" })).toBeInTheDocument();
  });

  it("入力値が反映される", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    const emailInput = screen.getByLabelText("メールアドレス") as HTMLInputElement;
    const passwordInput = screen.getByLabelText("パスワード") as HTMLInputElement;

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "Password1!");

    expect(emailInput.value).toBe("test@example.com");
    expect(passwordInput.value).toBe("Password1!");
  });

  it("ログイン成功時にダッシュボードへリダイレクトする", async () => {
    const user = userEvent.setup();
    mockSignIn.mockResolvedValue({ ok: true });
    render(<LoginForm />);

    await user.type(screen.getByLabelText("メールアドレス"), "test@example.com");
    await user.type(screen.getByLabelText("パスワード"), "Password1!");
    await user.click(screen.getByRole("button", { name: "ログイン" }));

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith("credentials", {
        email: "test@example.com",
        password: "Password1!",
        redirect: false,
      });
      expect(mockPush).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("ログイン失敗時にエラーメッセージを表示する", async () => {
    const user = userEvent.setup();
    mockSignIn.mockResolvedValue({ error: "Invalid credentials" });
    render(<LoginForm />);

    await user.type(screen.getByLabelText("メールアドレス"), "test@example.com");
    await user.type(screen.getByLabelText("パスワード"), "wrong");
    await user.click(screen.getByRole("button", { name: "ログイン" }));

    await waitFor(() => {
      expect(screen.getByText("メールアドレスまたはパスワードが正しくありません")).toBeInTheDocument();
    });
  });

  it("メール未認証エラー時に専用メッセージと再送信ボタンを表示する", async () => {
    const user = userEvent.setup();
    mockSignIn.mockResolvedValue({ error: "EMAIL_NOT_VERIFIED" });
    render(<LoginForm />);

    await user.type(screen.getByLabelText("メールアドレス"), "test@example.com");
    await user.type(screen.getByLabelText("パスワード"), "Password1!");
    await user.click(screen.getByRole("button", { name: "ログイン" }));

    await waitFor(() => {
      expect(screen.getByText("メールアドレスが未認証です。受信トレイの確認メールをご確認ください。")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "認証メールを再送信" })).toBeInTheDocument();
    });
  });

  it("認証メール再送信ボタンをクリックすると再送信APIを呼ぶ", async () => {
    const user = userEvent.setup();
    mockSignIn.mockResolvedValue({ error: "EMAIL_NOT_VERIFIED" });
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });
    render(<LoginForm />);

    await user.type(screen.getByLabelText("メールアドレス"), "test@example.com");
    await user.type(screen.getByLabelText("パスワード"), "Password1!");
    await user.click(screen.getByRole("button", { name: "ログイン" }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "認証メールを再送信" })).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "認証メールを再送信" }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "test@example.com" }),
      });
      expect(screen.getByText("認証メールを再送信しました。受信トレイをご確認ください。")).toBeInTheDocument();
    });
  });

  it("パスワードリセットリンクを表示する", () => {
    render(<LoginForm />);
    const link = screen.getByRole("link", { name: "パスワードを忘れた方" });
    expect(link).toHaveAttribute("href", "/forgot-password");
  });

  it("新規登録リンクを表示する", () => {
    render(<LoginForm />);
    const link = screen.getByRole("link", { name: "新規登録" });
    expect(link).toHaveAttribute("href", "/signup");
  });
});
