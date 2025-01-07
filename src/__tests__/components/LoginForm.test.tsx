// src/__tests__/components/LoginForm.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { signIn } from "next-auth/react";
import LoginForm from "@/components/LoginForm";

// Mock next-auth
jest.mock("next-auth/react", () => ({
  signIn: jest.fn(),
}));

describe("LoginForm", () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it("renders login form with email and password fields", () => {
    render(<LoginForm />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /log in/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign in with google/i })
    ).toBeInTheDocument();
  });

  it("shows name field when switching to signup mode", async () => {
    render(<LoginForm />);

    const signupButton = screen.getByText(/don't have an account\?/i);
    await userEvent.click(signupButton);

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
  });

  it("handles credentials login submission", async () => {
    render(<LoginForm />);

    await userEvent.type(screen.getByLabelText(/email/i), "test@example.com");
    await userEvent.type(screen.getByLabelText(/password/i), "password123");

    const loginButton = screen.getByRole("button", { name: /log in/i });
    await userEvent.click(loginButton);

    expect(signIn).toHaveBeenCalledWith("credentials", {
      email: "test@example.com",
      password: "password123",
      redirect: true,
      callbackUrl: "/dashboard",
    });
  });

  it("handles Google sign-in button click", async () => {
    render(<LoginForm />);

    const googleButton = screen.getByRole("button", {
      name: /sign in with google/i,
    });
    await userEvent.click(googleButton);

    expect(signIn).toHaveBeenCalledWith("google", {
      callbackUrl: "/dashboard",
    });
  });

  it("shows loading state during form submission", async () => {
    render(<LoginForm />);

    await userEvent.type(screen.getByLabelText(/email/i), "test@example.com");
    await userEvent.type(screen.getByLabelText(/password/i), "password123");

    const loginButton = screen.getByRole("button", { name: /log in/i });
    fireEvent.click(loginButton);

    expect(screen.getByText(/logging in/i)).toBeInTheDocument();
  });

  it("handles mode toggle between login and signup", async () => {
    render(<LoginForm />);

    // Switch to signup
    const signupButton = screen.getByText(/don't have an account\?/i);
    await userEvent.click(signupButton);
    expect(screen.getByText(/create account/i)).toBeInTheDocument();

    // Switch back to login
    const backToLoginButton = screen.getByText(/back to login/i);
    await userEvent.click(backToLoginButton);
    expect(screen.getByText(/log in/i)).toBeInTheDocument();
  });
});
