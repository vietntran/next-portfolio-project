"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchUsers } from "@/services/userService";
import type { User } from "@/services/userService";

export default function UserTable() {
  const [usersData, setUsersData] = useState<{
    users: User[];
    totalPages: number;
  }>({
    users: [],
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        const sort = searchParams.get("sort");
        const result = await fetchUsers(currentPage, 10, sort || undefined);
        console.log("Fetched result:", result);
        setUsersData({
          users: result,
          totalPages: Math.ceil(result.length / 10),
        });
      } catch (err) {
        setError("Failed to fetch users");
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, [currentPage, searchParams]);

  const handleSort = (column: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("sort", column);
    router.push(`?${params.toString()}`);
  };

  if (loading) return <div data-testid="loading-spinner">Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!usersData?.users?.length) return <div>No users found</div>;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th
              className="px-6 py-3 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort("name")}
            >
              Name
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">
              Email
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">
              Role
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {usersData.users.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {user.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {user.email}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {user.role}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {usersData.totalPages > 1 && (
        <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            aria-label="previous page"
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, usersData.totalPages))
            }
            disabled={currentPage === usersData.totalPages}
            aria-label="next page"
            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
