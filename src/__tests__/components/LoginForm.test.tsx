import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { signIn } from "next-auth/react";
import LoginForm from "@/components/LoginForm";

jest.mock("next-auth/react", () => ({
  signIn: jest.fn(),
}));

describe("LoginForm", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("form validation", () => {
    it("should have required attributes", () => {
      render(<LoginForm />);

      expect(screen.getByRole("textbox", { name: /email/i })).toHaveAttribute(
        "required"
      );
      expect(screen.getByLabelText(/password/i)).toHaveAttribute("required");
    });

    it("should have minimum length on password", () => {
      render(<LoginForm />);
      const passwordInput = screen.getByLabelText(/password/i);

      expect(passwordInput).toHaveAttribute("minLength", "8");
    });
  });

  describe("state management", () => {
    it("should update form data on input change", async () => {
      render(<LoginForm />);
      const emailInput = screen.getByRole("textbox", { name: /email/i });
      const passwordInput = screen.getByLabelText(/password/i);

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "password123");

      expect(emailInput).toHaveValue("test@example.com");
      expect(passwordInput).toHaveValue("password123");
    });

    it("should toggle between login and signup modes", async () => {
      render(<LoginForm />);

      expect(screen.queryByLabelText(/name/i)).not.toBeInTheDocument();

      await user.click(
        screen.getByRole("button", { name: /don't have an account/i })
      );
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: /back to login/i }));
      expect(screen.queryByLabelText(/name/i)).not.toBeInTheDocument();
    });
  });

  describe("authentication flow", () => {
    it("should call signIn with correct credentials in login mode", async () => {
      render(<LoginForm />);

      await user.type(
        screen.getByRole("textbox", { name: /email/i }),
        "test@example.com"
      );
      await user.type(screen.getByLabelText(/password/i), "password123");
      await user.click(screen.getByRole("button", { name: /log in/i }));

      expect(signIn).toHaveBeenCalledWith("credentials", {
        email: "test@example.com",
        password: "password123",
        redirect: true,
        callbackUrl: "/dashboard",
      });
    });

    it("should show loading state during submission", async () => {
      render(<LoginForm />);

      await user.type(
        screen.getByRole("textbox", { name: /email/i }),
        "test@example.com"
      );
      await user.type(screen.getByLabelText(/password/i), "password123");

      const submitButton = screen.getByRole("button", { name: /log in/i });

      // Mock a delay in signIn
      (signIn as jest.Mock).mockImplementationOnce(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      await user.click(submitButton);
      expect(submitButton).toHaveTextContent("Logging in...");
    });
  });

  describe("error handling", () => {
    it("should display error message on authentication failure", async () => {
      (signIn as jest.Mock).mockRejectedValueOnce(
        new Error("Invalid credentials")
      );
      render(<LoginForm />);

      await user.type(
        screen.getByRole("textbox", { name: /email/i }),
        "test@example.com"
      );
      await user.type(screen.getByLabelText(/password/i), "password123");
      await user.click(screen.getByRole("button", { name: /log in/i }));

      await waitFor(() => {
        expect(screen.getByRole("alert")).toHaveTextContent(
          "Invalid credentials"
        );
      });
    });

    it("should clear error message when switching modes", async () => {
      (signIn as jest.Mock).mockRejectedValueOnce(
        new Error("Invalid credentials")
      );
      render(<LoginForm />);

      await user.type(
        screen.getByRole("textbox", { name: /email/i }),
        "test@example.com"
      );
      await user.type(screen.getByLabelText(/password/i), "password123");
      await user.click(screen.getByRole("button", { name: /log in/i }));

      await waitFor(() => {
        expect(screen.getByRole("alert")).toBeInTheDocument();
      });

      await user.click(
        screen.getByRole("button", { name: /don't have an account/i })
      );
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });
  });
});
