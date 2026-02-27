import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MoodSelector } from "@/components/mood/MoodSelector";

describe("MoodSelector", () => {
  it("5つの気分ボタンをレンダリングする", () => {
    render(<MoodSelector onSubmit={vi.fn()} />);
    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(5);
  });

  it("各気分の絵文字とラベルを表示する", () => {
    render(<MoodSelector onSubmit={vi.fn()} />);
    expect(screen.getByText("😫")).toBeInTheDocument();
    expect(screen.getByText("つらい")).toBeInTheDocument();
    expect(screen.getByText("😄")).toBeInTheDocument();
    expect(screen.getByText("最高")).toBeInTheDocument();
  });

  it("ボタンクリックで選択状態になる", async () => {
    const user = userEvent.setup();
    render(<MoodSelector onSubmit={vi.fn()} />);

    const buttons = screen.getAllByRole("button");
    await user.click(buttons[0]); // つらい

    expect(buttons[0].className).toContain("border-primary-400");
  });

  it("選択後にtextareaと送信ボタンが表示される", async () => {
    const user = userEvent.setup();
    render(<MoodSelector onSubmit={vi.fn()} />);

    const buttons = screen.getAllByRole("button");
    await user.click(buttons[2]); // ふつう

    expect(screen.getByPlaceholderText("今日の気分について一言メモ（任意）")).toBeInTheDocument();
    expect(screen.getByText("気分を記録する")).toBeInTheDocument();
  });

  it("選択前にtextareaは表示されない", () => {
    render(<MoodSelector onSubmit={vi.fn()} />);
    expect(screen.queryByPlaceholderText("今日の気分について一言メモ（任意）")).not.toBeInTheDocument();
  });

  it("送信ボタンでonSubmitが呼ばれる", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<MoodSelector onSubmit={onSubmit} />);

    await user.click(screen.getAllByRole("button")[3]); // 良い (score: 4)
    await user.click(screen.getByText("気分を記録する"));

    expect(onSubmit).toHaveBeenCalledWith(4, undefined, undefined);
  });

  it("ノート付きで送信できる", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<MoodSelector onSubmit={onSubmit} />);

    await user.click(screen.getAllByRole("button")[2]); // ふつう (score: 3)

    const textarea = screen.getByPlaceholderText("今日の気分について一言メモ（任意）");
    await user.type(textarea, "良い日でした");

    await user.click(screen.getByText("気分を記録する"));

    expect(onSubmit).toHaveBeenCalledWith(3, "良い日でした", undefined);
  });

  it("initialScoreで初期選択される", () => {
    render(<MoodSelector onSubmit={vi.fn()} initialScore={4} />);
    // 選択後のUIが表示される（textareaと送信ボタン）
    expect(screen.getByPlaceholderText("今日の気分について一言メモ（任意）")).toBeInTheDocument();
    expect(screen.getByText("気分を記録する")).toBeInTheDocument();
  });
});
