import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";

vi.mock("../services/api.js", () => ({
  api: { post: vi.fn() },
  routes: { resetPassword: "/auth/reset-password" },
}));

import { api } from "../services/api.js";
import ResetPassword from "../pages/ResetPassword.jsx";

const TOKEN = "a".repeat(64);

function renderAt(url) {
  return render(
    <MemoryRouter initialEntries={[url]}>
      <Routes>
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/login" element={<p>Login page</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("ResetPassword page", () => {
  beforeEach(() => vi.clearAllMocks());

  it("explains when the link has no token", () => {
    renderAt("/reset-password");

    expect(screen.getByText(/invalid or incomplete/i)).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /reset password/i }),
    ).not.toBeInTheDocument();
  });

  it("stops when the passwords do not match", async () => {
    renderAt(`/reset-password#token=${TOKEN}`);

    await userEvent.type(
      screen.getByLabelText("New password"),
      "NewPassword123!",
    );
    await userEvent.type(
      screen.getByLabelText("Confirm new password"),
      "Different123!",
    );
    await userEvent.click(
      screen.getByRole("button", { name: /reset password/i }),
    );

    expect(await screen.findByText(/do not match/i)).toBeInTheDocument();
    expect(api.post).not.toHaveBeenCalled();
  });

  it("sends the token and new password, then returns to login", async () => {
    api.post.mockResolvedValue({ message: "ok" });
    renderAt(`/reset-password#token=${TOKEN}`);

    await userEvent.type(
      screen.getByLabelText("New password"),
      "NewPassword123!",
    );
    await userEvent.type(
      screen.getByLabelText("Confirm new password"),
      "NewPassword123!",
    );
    await userEvent.click(
      screen.getByRole("button", { name: /reset password/i }),
    );

    expect(api.post).toHaveBeenCalledWith("/auth/reset-password", {
      token: TOKEN,
      password: "NewPassword123!",
    });
    expect(await screen.findByText("Login page")).toBeInTheDocument();
  });
});
