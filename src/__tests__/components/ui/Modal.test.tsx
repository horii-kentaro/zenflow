import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Modal } from "@/components/ui/Modal";

describe("Modal", () => {
  it("open=falseの場合はレンダリングしない", () => {
    const { container } = render(
      <Modal open={false} onClose={() => {}}>
        <p>コンテンツ</p>
      </Modal>
    );
    expect(container.firstChild).toBeNull();
  });

  it("open=trueの場合にコンテンツを表示する", () => {
    render(
      <Modal open={true} onClose={() => {}}>
        <p>モーダルコンテンツ</p>
      </Modal>
    );
    expect(screen.getByText("モーダルコンテンツ")).toBeInTheDocument();
  });

  it("role='dialog'を持つ", () => {
    render(
      <Modal open={true} onClose={() => {}}>
        <p>Dialog</p>
      </Modal>
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("Escapeキーでoncloseが呼ばれる", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <Modal open={true} onClose={onClose}>
        <p>Test</p>
      </Modal>
    );

    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("オーバーレイクリックでonCloseが呼ばれる", async () => {
    const onClose = vi.fn();
    const { container } = render(
      <Modal open={true} onClose={onClose}>
        <p>Test</p>
      </Modal>
    );

    // overlayは最初のdiv要素（fixed inset-0）
    const overlay = container.firstChild as HTMLElement;
    // overlayのクリックイベントを発火（e.target === overlayRef.currentの条件を満たす）
    overlay.click();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("モーダル内部のクリックではonCloseが呼ばれない", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <Modal open={true} onClose={onClose}>
        <button>内部ボタン</button>
      </Modal>
    );

    await user.click(screen.getByRole("button", { name: "内部ボタン" }));
    expect(onClose).not.toHaveBeenCalled();
  });

  it("open=trueの場合にbody overflowをhiddenにする", () => {
    render(
      <Modal open={true} onClose={() => {}}>
        <p>Test</p>
      </Modal>
    );
    expect(document.body.style.overflow).toBe("hidden");
  });

  it("open=falseの場合にbody overflowを元に戻す", () => {
    const { rerender } = render(
      <Modal open={true} onClose={() => {}}>
        <p>Test</p>
      </Modal>
    );
    expect(document.body.style.overflow).toBe("hidden");

    rerender(
      <Modal open={false} onClose={() => {}}>
        <p>Test</p>
      </Modal>
    );
    expect(document.body.style.overflow).toBe("");
  });
});
