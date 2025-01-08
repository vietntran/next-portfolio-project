// src/__tests__/components/UserForm.test.tsx
import { act } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import UserForm from "@/components/UserForm";

describe("UserForm", () => {
  const mockOnUserAdded = jest.fn();
  let user: ReturnType<typeof userEvent.setup>;
  const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

  beforeEach(() => {
    user = userEvent.setup();
    mockOnUserAdded.mockClear();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    consoleSpy.mockClear();
  });

  afterAll(() => {
    consoleSpy.mockRestore();
  });

  it("renders form correctly", () => {
    render(<UserForm onUserAdded={mockOnUserAdded} />);
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /add user/i }),
    ).toBeInTheDocument();
  });

  it("handles successful form submission", async () => {
    const mockResponse = { ok: true, json: () => Promise.resolve({ id: 1 }) };
    (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

    render(<UserForm onUserAdded={mockOnUserAdded} />);

    await act(async () => {
      await user.type(screen.getByLabelText(/name/i), "Jane Smith");
      await user.type(screen.getByLabelText(/email/i), "jane@example.com");
      await user.click(screen.getByRole("button", { name: /add user/i }));
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Jane Smith",
          email: "jane@example.com",
        }),
      });
    });

    expect(mockOnUserAdded).toHaveBeenCalled();
    expect(screen.getByText(/user added successfully/i)).toBeInTheDocument();
  });

  it("handles API error", async () => {
    const errorMessage = "Failed to create user";
    const mockResponse = {
      ok: false,
      json: () => Promise.resolve({ error: errorMessage }),
    };
    (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

    render(<UserForm onUserAdded={mockOnUserAdded} />);

    await act(async () => {
      await user.type(screen.getByLabelText(/name/i), "Jane Smith");
      await user.type(screen.getByLabelText(/email/i), "jane@example.com");
      await user.click(screen.getByRole("button", { name: /add user/i }));
    });

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    expect(mockOnUserAdded).not.toHaveBeenCalled();
  });

  it("disables form during submission", async () => {
    const mockResponse = new Promise(() => {}); // Never resolves to test loading state
    (global.fetch as jest.Mock).mockImplementationOnce(() => mockResponse);

    render(<UserForm onUserAdded={mockOnUserAdded} />);

    await act(async () => {
      await user.type(screen.getByLabelText(/name/i), "Jane Smith");
      await user.type(screen.getByLabelText(/email/i), "jane@example.com");
      await user.click(screen.getByRole("button", { name: /add user/i }));
    });

    expect(screen.getByLabelText(/name/i)).toBeDisabled();
    expect(screen.getByLabelText(/email/i)).toBeDisabled();
    expect(screen.getByRole("button")).toBeDisabled();
    expect(screen.getByText(/adding user/i)).toBeInTheDocument();
  });

  it("resets form after successful submission", async () => {
    const mockResponse = { ok: true, json: () => Promise.resolve({ id: 1 }) };
    (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

    render(<UserForm onUserAdded={mockOnUserAdded} />);

    await act(async () => {
      await user.type(screen.getByLabelText(/name/i), "Jane Smith");
      await user.type(screen.getByLabelText(/email/i), "jane@example.com");
      await user.click(screen.getByRole("button", { name: /add user/i }));
    });

    await waitFor(() => {
      expect(screen.getByLabelText(/name/i)).toHaveValue("");
      expect(screen.getByLabelText(/email/i)).toHaveValue("");
    });
  });
});
