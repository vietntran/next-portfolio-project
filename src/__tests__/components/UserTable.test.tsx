import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import UserTable from "@/components/UserTable";
import { fetchUsers } from "@/services/userService";
import { useRouter, useSearchParams } from "next/navigation";

jest.mock("@/services/userService", () => ({
  fetchUsers: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

describe("UserTable", () => {
  const mockRouter = {
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  };

  const mockSearchParams = new URLSearchParams();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);
  });

  it("renders loading state initially", () => {
    (fetchUsers as jest.Mock).mockImplementation(() => new Promise(() => {}));
    render(<UserTable />);
    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
  });

  it("displays users data when fetched successfully", async () => {
    const mockUsers = [
      { id: 1, name: "John Doe", email: "john@example.com", role: "user" },
      { id: 2, name: "Jane Smith", email: "jane@example.com", role: "admin" },
    ];

    (fetchUsers as jest.Mock).mockResolvedValue(mockUsers);
    render(<UserTable />);

    await waitFor(() => {
      mockUsers.forEach((user) => {
        expect(screen.getByText(user.name)).toBeInTheDocument();
        expect(screen.getByText(user.email)).toBeInTheDocument();
      });
    });
  });

  it("shows error message when fetch fails", async () => {
    (fetchUsers as jest.Mock).mockRejectedValue(
      new Error("Failed to fetch users")
    );
    render(<UserTable />);

    await waitFor(() => {
      expect(screen.getByText("Failed to fetch users")).toBeInTheDocument();
    });
  });

  it("renders empty state when no users found", async () => {
    (fetchUsers as jest.Mock).mockResolvedValue([]);
    render(<UserTable />);

    await waitFor(() => {
      expect(screen.getByText(/no users found/i)).toBeInTheDocument();
    });
  });

  it("persists table state in URL", async () => {
    const user = userEvent.setup();
    const mockUsers = [
      { id: 1, name: "John Doe", email: "john@example.com", role: "user" },
    ];

    (fetchUsers as jest.Mock).mockResolvedValue(mockUsers);
    render(<UserTable />);

    await waitFor(async () => {
      const sortButton = screen.getByText(/name/i);
      await user.click(sortButton);
      expect(mockRouter.push).toHaveBeenCalledWith("?sort=name");
    });
  });
});
