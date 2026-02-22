import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Input } from "@/components/ui/Input";

describe("Input", () => {
  it("ラベルを表示する", () => {
    render(<Input id="test" label="メールアドレス" />);
    expect(screen.getByLabelText("メールアドレス")).toBeInTheDocument();
  });

  it("ラベルなしでもレンダリングする", () => {
    render(<Input id="test" placeholder="入力" />);
    expect(screen.getByPlaceholderText("入力")).toBeInTheDocument();
  });

  it("エラーメッセージを表示する", () => {
    render(<Input id="test" error="必須です" />);
    expect(screen.getByText("必須です")).toBeInTheDocument();
  });

  it("エラー時にボーダー色が変わる", () => {
    render(<Input id="test" error="必須です" />);
    const input = screen.getByRole("textbox");
    expect(input.className).toContain("border-red-400");
  });

  it("エラーなしではデフォルトボーダー色", () => {
    render(<Input id="test" />);
    const input = screen.getByRole("textbox");
    expect(input.className).toContain("border-neutral-200");
  });

  it("入力値が変更できる", async () => {
    const user = userEvent.setup();
    render(<Input id="test" />);
    const input = screen.getByRole("textbox") as HTMLInputElement;

    await user.type(input, "テスト");
    expect(input.value).toBe("テスト");
  });
});
