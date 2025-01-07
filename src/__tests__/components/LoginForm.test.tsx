// src/__tests__/components/LoginForm.test.tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { signIn } from "next-auth/react";
import { act } from "react";
import LoginForm from "@/components/LoginForm";

// Mock next-auth
jest.mock("next-auth/react", () => ({
  signIn: jest.fn(),
}));

describe("LoginForm", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders login form with email and password fields", () => {
    render(<LoginForm />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /log in/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign in with google/i }),
    ).toBeInTheDocument();
  });

  it("shows name field when switching to signup mode", async () => {
    render(<LoginForm />);

    await act(async () => {
      await user.click(screen.getByText(/don't have an account\?/i));
    });

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
  });

  it("handles credentials login submission", async () => {
    render(<LoginForm />);

    await act(async () => {
      await user.type(screen.getByLabelText(/email/i), "test@example.com");
      await user.type(screen.getByLabelText(/password/i), "password123");
      await user.click(screen.getByRole("button", { name: /log in/i }));
    });

    expect(signIn).toHaveBeenCalledWith("credentials", {
      email: "test@example.com",
      password: "password123",
      redirect: true,
      callbackUrl: "/dashboard",
    });
  });

  it("handles Google sign-in button click", async () => {
    render(<LoginForm />);

    await act(async () => {
      await user.click(
        screen.getByRole("button", { name: /sign in with google/i }),
      );
    });

    expect(signIn).toHaveBeenCalledWith("google", {
      callbackUrl: "/dashboard",
    });
  });

  it("shows loading state during form submission", async () => {
    (signIn as jest.Mock).mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100)),
    );

    render(<LoginForm />);

    await act(async () => {
      await user.type(screen.getByLabelText(/email/i), "test@example.com");
      await user.type(screen.getByLabelText(/password/i), "password123");
      await user.click(screen.getByRole("button", { name: /log in/i }));
    });

    expect(screen.getByText(/logging in/i)).toBeInTheDocument();
  });

  it("handles mode toggle between login and signup", async () => {
    render(<LoginForm />);

    // Switch to signup
    await act(async () => {
      await user.click(screen.getByText(/don't have an account\?/i));
    });
    expect(screen.getByText(/create account/i)).toBeInTheDocument();

    // Switch back to login
    await act(async () => {
      await user.click(screen.getByText(/back to login/i));
    });
    expect(screen.getByText(/log in/i)).toBeInTheDocument();
  });
});
