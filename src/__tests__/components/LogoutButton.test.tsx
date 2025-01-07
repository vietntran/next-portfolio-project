// src/__tests__/components/LogoutButton.test.tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LogoutButton from "@/components/LogoutButton";
import { signOut } from "next-auth/react";

// Mock next-auth
jest.mock("next-auth/react", () => ({
  signOut: jest.fn(),
}));

describe("LogoutButton", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders correctly", () => {
    render(<LogoutButton />);
    expect(screen.getByRole("button", { name: /logout/i })).toBeInTheDocument();
  });

  it("calls signOut when clicked", async () => {
    const user = userEvent.setup();
    render(<LogoutButton />);

    await user.click(
      screen.getByRole("button", { name: /logout from dashboard/i }),
    );

    expect(signOut).toHaveBeenCalledWith({ callbackUrl: "/login" });
  });
});
