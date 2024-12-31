"use client";

import UserForm from "./UserForm";
import UserTable from "./UserTable";
import { useState } from "react";

export default function UsersContainer() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleUserAdded = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <UserForm onUserAdded={handleUserAdded} />
        </div>
        <div className="md:col-span-2">
          <UserTable key={refreshKey} />
        </div>
      </div>
    </div>
  );
}
