// src/__tests__/components/UserTable.test.tsx
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
        expect(screen.getByText(user.role)).toBeInTheDocument();
      });
    });
  });

  it("shows error message when fetch fails", async () => {
    (fetchUsers as jest.Mock).mockRejectedValue(
      new Error("Failed to fetch users"),
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

  it("handles sorting when name header is clicked", async () => {
    const user = userEvent.setup();
    const mockUsers = [
      { id: 1, name: "John Doe", email: "john@example.com", role: "user" },
    ];

    (fetchUsers as jest.Mock).mockResolvedValue(mockUsers);
    render(<UserTable />);

    // Wait for initial render
    await waitFor(() => {
      expect(fetchUsers).toHaveBeenCalledWith(1, 10, undefined);
    });

    // Trigger sort
    const sortButton = screen.getByRole("columnheader", { name: /name/i });
    await user.click(sortButton);

    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith("?sort=name");
      expect(fetchUsers).toHaveBeenCalledTimes(1);
    });
  });

  it("calls fetchUsers with correct default parameters", async () => {
    const mockUsers = [
      { id: 1, name: "John Doe", email: "john@example.com", role: "user" },
    ];

    (fetchUsers as jest.Mock).mockResolvedValue(mockUsers);
    render(<UserTable />);

    await waitFor(() => {
      expect(fetchUsers).toHaveBeenCalledWith(1, 10, undefined);
    });
  });

  it("calls fetchUsers with sort parameter when provided in URL", async () => {
    const paramsWithSort = new URLSearchParams();
    paramsWithSort.set("sort", "name");
    (useSearchParams as jest.Mock).mockReturnValue(paramsWithSort);

    const mockUsers = [
      { id: 1, name: "John Doe", email: "john@example.com", role: "user" },
    ];

    (fetchUsers as jest.Mock).mockResolvedValue(mockUsers);
    render(<UserTable />);

    await waitFor(() => {
      expect(fetchUsers).toHaveBeenCalledWith(1, 10, "name");
    });
  });

  it("handles pagination correctly", async () => {
    const user = userEvent.setup();
    // Create enough mock users to trigger pagination
    const mockUsers = Array.from({ length: 15 }, (_, index) => ({
      id: index + 1,
      name: `User ${index + 1}`,
      email: `user${index + 1}@example.com`,
      role: "user",
    }));

    (fetchUsers as jest.Mock).mockResolvedValue(mockUsers);
    render(<UserTable />);

    // Check initial render
    await waitFor(() => {
      expect(screen.getByText("User 1")).toBeInTheDocument();
      expect(screen.getByLabelText(/next page/i)).toBeInTheDocument();
    });

    // Trigger page change
    await user.click(screen.getByLabelText(/next page/i));

    await waitFor(() => {
      expect(fetchUsers).toHaveBeenCalledTimes(2);
      expect(fetchUsers).toHaveBeenLastCalledWith(2, 10, undefined);
    });
  });
});
