"use client";

import { useState } from "react";

type FormData = {
  name: string;
  email: string;
};

export default function UserForm({ onUserAdded }: { onUserAdded: () => void }) {
  const [formData, setFormData] = useState<FormData>({ name: "", email: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create user");
      }

      setFormData({ name: "", email: "" });
      setSuccess(true);
      onUserAdded();
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to create user. Please try again.";
      console.error("Error creating user:", err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 p-4 bg-white rounded-lg shadow"
      aria-label="Add new user form"
      noValidate
    >
      {error && (
        <div
          className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg"
          role="alert"
        >
          {error}
        </div>
      )}

      {success && (
        <div
          className="p-4 mb-4 text-sm text-green-700 bg-green-100 rounded-lg"
          role="alert"
        >
          User added successfully!
        </div>
      )}

      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-900"
        >
          Name
        </label>
        <div className="mt-1">
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
            }
            className="block w-full rounded-md border-gray-300 shadow-sm 
                     focus:border-indigo-500 focus:ring-indigo-500 
                     text-gray-900 bg-white"
            required
            aria-required="true"
            disabled={loading}
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-900"
        >
          Email
        </label>
        <div className="mt-1">
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, email: e.target.value }))
            }
            className="block w-full rounded-md border-gray-300 shadow-sm 
                     focus:border-indigo-500 focus:ring-indigo-500 
                     text-gray-900 bg-white"
            required
            aria-required="true"
            disabled={loading}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center py-2 px-4 border border-transparent 
                 rounded-md shadow-sm text-sm font-medium text-white 
                 bg-indigo-600 hover:bg-indigo-700 focus:outline-none 
                 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 
                 disabled:opacity-50"
        aria-busy={loading}
      >
        {loading ? "Adding User..." : "Add User"}
      </button>
    </form>
  );
}
