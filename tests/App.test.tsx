import { render, screen } from "@testing-library/react";
import { HashRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { App } from "../src/App";
import { GameProvider } from "../src/state/GameContext";

describe("Era XI app", () => {
  it("renders the main game promise and navigation", () => {
    render(<HashRouter><GameProvider><App /></GameProvider></HashRouter>);
    expect(screen.getByText(/Собери свою/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Лидеры/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Твой ник/i)).toBeInTheDocument();
  });
});
