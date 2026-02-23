import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CookieBanner } from "@/components/ui/CookieBanner";

describe("CookieBanner", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("同意履歴がない場合にバナーを表示する", () => {
    render(<CookieBanner />);
    expect(screen.getByText(/当サイトでは/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "同意する" })).toBeInTheDocument();
  });

  it("同意済みの場合はバナーを表示しない", () => {
    localStorage.setItem("cookie-consent", "accepted");
    const { container } = render(<CookieBanner />);
    expect(container.firstChild).toBeNull();
  });

  it("同意ボタンクリックでlocalStorageに保存する", async () => {
    const user = userEvent.setup();
    render(<CookieBanner />);

    await user.click(screen.getByRole("button", { name: "同意する" }));
    expect(localStorage.getItem("cookie-consent")).toBe("accepted");
  });

  it("同意後にバナーが非表示になる", async () => {
    const user = userEvent.setup();
    const { container } = render(<CookieBanner />);

    await act(async () => {
      await user.click(screen.getByRole("button", { name: "同意する" }));
    });
    expect(container.firstChild).toBeNull();
  });

  it("プライバシーポリシーリンクが表示される", () => {
    render(<CookieBanner />);
    const link = screen.getByRole("link", { name: "プライバシーポリシー" });
    expect(link).toHaveAttribute("href", "/privacy");
  });
});
