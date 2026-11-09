import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

vi.mock("../services/api.js", () => ({
  api: { post: vi.fn() },
  routes: { forgotPassword: "/auth/forgot-password" },
}));

import { api } from "../services/api.js";
import ForgotPassword from "../pages/ForgotPassword.jsx";

describe("ForgotPassword page", () => {
  beforeEach(() => vi.clearAllMocks());

  it("sends the email and shows the confirmation", async () => {
    api.post.mockResolvedValue({
      message:
        "If an account exists for that email, a reset link has been sent.",
    });

    render(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>,
    );

    await userEvent.type(screen.getByLabelText(/email/i), "Client@Test.com");
    await userEvent.click(
      screen.getByRole("button", { name: /send reset link/i }),
    );

    expect(api.post).toHaveBeenCalledWith("/auth/forgot-password", {
      email: "client@test.com",
    });
    expect(
      await screen.findByText(/reset link has been sent/i),
    ).toBeInTheDocument();
  });
});
