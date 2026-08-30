import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CodeDirectory } from "./code-directory";

const writeText = vi.fn().mockResolvedValue(undefined);

afterEach(() => {
  cleanup();
  writeText.mockClear();
});

describe("CodeDirectory", () => {
  it("reveals the next batch when the visitor chooses to show more", async () => {
    const user = userEvent.setup();
    render(<CodeDirectory writeToClipboard={writeText} />);

    expect(screen.getAllByRole("listitem")).toHaveLength(24);
    await user.click(screen.getByRole("button", { name: /Mostrar mais códigos/i }));
    expect(screen.getAllByRole("listitem")).toHaveLength(48);
  });

  it("searches, filters, copies only the code, and shows an empty state", async () => {
    const user = userEvent.setup();
    render(<CodeDirectory writeToClipboard={writeText} />);

    expect(screen.getByText("281 códigos")).toBeInTheDocument();
    await user.type(screen.getByRole("searchbox"), "hdreal");
    expect(screen.getByText("/HDREAL")).toBeInTheDocument();
    expect(screen.queryByText("/PROSHOT")).not.toBeInTheDocument();

    await user.clear(screen.getByRole("searchbox"));
    await user.click(screen.getByRole("button", { name: "Fundos e cenários" }));
    await user.type(screen.getByRole("searchbox"), "newbg");
    expect(screen.getByText("/NEWBG")).toBeInTheDocument();
    expect(screen.queryByText("/OUTFIT")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Copiar /NEWBG" }));
    expect(writeText).toHaveBeenCalledWith("/NEWBG");
    expect(screen.getByText("Código copiado")).toBeInTheDocument();

    await user.type(screen.getByRole("searchbox"), "zzznada");
    expect(screen.getByText("Nenhum código encontrado")).toBeInTheDocument();
  });
});
