import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "@/components/ui/Button";

describe("Button", () => {
  it("子要素をレンダリングする", () => {
    render(<Button>テスト</Button>);
    expect(screen.getByRole("button", { name: "テスト" })).toBeInTheDocument();
  });

  it("primaryバリアントのクラスを適用する", () => {
    render(<Button variant="primary">Primary</Button>);
    const button = screen.getByRole("button");
    expect(button.className).toContain("bg-primary-600");
  });

  it("secondaryバリアントのクラスを適用する", () => {
    render(<Button variant="secondary">Secondary</Button>);
    const button = screen.getByRole("button");
    expect(button.className).toContain("bg-neutral-100");
  });

  it("ghostバリアントのクラスを適用する", () => {
    render(<Button variant="ghost">Ghost</Button>);
    const button = screen.getByRole("button");
    expect(button.className).toContain("text-neutral-600");
  });

  it("dangerバリアントのクラスを適用する", () => {
    render(<Button variant="danger">Danger</Button>);
    const button = screen.getByRole("button");
    expect(button.className).toContain("bg-red-500");
  });

  it("サイズクラスを適用する", () => {
    const { rerender } = render(<Button size="sm">Small</Button>);
    expect(screen.getByRole("button").className).toContain("h-8");

    rerender(<Button size="lg">Large</Button>);
    expect(screen.getByRole("button").className).toContain("h-12");
  });

  it("loading時にdisabledになる", () => {
    render(<Button loading>Loading</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("loading時にスピナーSVGを表示する", () => {
    const { container } = render(<Button loading>Loading</Button>);
    expect(container.querySelector("svg.animate-spin")).toBeInTheDocument();
  });

  it("loading=false時にスピナーを表示しない", () => {
    const { container } = render(<Button>Normal</Button>);
    expect(container.querySelector("svg.animate-spin")).not.toBeInTheDocument();
  });

  it("disabled時にクリックイベントが発火しない", async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<Button disabled onClick={handleClick}>Disabled</Button>);

    await user.click(screen.getByRole("button"));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it("クリックイベントが発火する", async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    await user.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
