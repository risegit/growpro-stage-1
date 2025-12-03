import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";

export default function UserTable() {
  const [allAMC, setAllAMC] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const usersPerPage = 10;
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  const userRole = user?.role;
  const isAdmin = userRole === "admin"; // Check if user is admin

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // 🔹 Fetch data from backend API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}api/amc.php?view-amc='viewamc'`, {
          method: "GET",
        });
        const data = await response.json();
        console.log("user data=", data);
        setAllAMC(data.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // 🔹 Sorting functionality
  const sortedUsers = useMemo(() => {
    if (!sortConfig.key) return allAMC;

    return [...allAMC].sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      // Handle numeric values
      if (sortConfig.key === 'visits_per_month' || sortConfig.key === 'pending_visits') {
        aValue = parseInt(aValue) || 0;
        bValue = parseInt(bValue) || 0;
      }

      // Handle date values
      if (sortConfig.key === 'validity_upto') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      // Handle string comparison
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
  }, [allAMC, sortConfig]);

  // 🔹 Filter users based on search
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return sortedUsers;
    const query = searchQuery.toLowerCase();
    return sortedUsers.filter(
      (user) =>
        user.name.toLowerCase().includes(query) ||
        user.visits_per_month.toLowerCase().includes(query) ||
        user.pending_visits.toLowerCase().includes(query) ||
        user.phone.includes(query)
    );
  }, [sortedUsers, searchQuery]);

  // 🔹 Handle sort request
  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // 🔹 Sort arrow component
  const SortArrow = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) {
      return <span className="ml-1 text-gray-400">↕↕</span>;
    }
    return (
      <span className="ml-1">
        {sortConfig.direction === 'ascending' ? '↑' : '↓'}
      </span>
    );
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleEdit = (userId) => {
    navigate(`/dashboard/amc/editamc/${userId}`);
  };

  const goToPage = (page) => setCurrentPage(page);
  const goToPrevious = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const goToNext = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  // 🔹 Get AMC Status function
  const getAMCStatus = (validity_upto) => {
    const validityDate = new Date(validity_upto);
    const today = new Date();

    validityDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const diffTime = validityDate - today;
    const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (daysLeft > 10) {
      return "Active";
    } else if (daysLeft > 0 && daysLeft <= 10) {
      return "Renew Soon";
    } else {
      return "Expired";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500 text-lg">Loading users...</p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gray-100 mt-10">
      <div className="mx-auto bg-white rounded-2xl shadow-xl p-6">
        {/* Header with Search */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-5 sm:px-6 py-5 sm:py-4 border-b">
          <div>
            <h2 className="text-2xl font-bold mb-2 text-gray-800">
              AMC Management
            </h2>
            <p className="text-sm sm:text-base text-gray-600">
              View and manage AMC
            </p>
          </div>

          <div className="mt-3 sm:mt-0 w-full sm:w-1/3 relative">
            <input
              type="text"
              placeholder="Search by name, contact, visit per month, or visit pending..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Clear search"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>

        <div className="p-4 sm:p-6">
          {currentUsers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No users found</p>
              <p className="text-gray-400 text-sm mt-2">Try adjusting your search</p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="overflow-x-auto hidden lg:block">
                <table className="w-full table-fixed text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th
                        className="w-[15%] py-4 px-4 font-medium text-gray-700 text-left cursor-pointer hover:bg-gray-50 transition"
                        onClick={() => handleSort('name')}
                      >
                        <div className="flex items-center">
                          Name
                          <SortArrow columnKey="name" />
                        </div>
                      </th>
                      <th
                        className="w-[12%] py-4 px-4 font-medium text-gray-700 text-left cursor-pointer hover:bg-gray-50 transition"
                        onClick={() => handleSort('phone')}
                      >
                        <div className="flex items-center">
                          Contact
                          <SortArrow columnKey="phone" />
                        </div>
                      </th>
                      <th
                        className="w-[15%] py-4 px-4 font-medium text-gray-700 text-left cursor-pointer hover:bg-gray-50 transition"
                        onClick={() => handleSort('visits_per_month')}
                      >
                        <div className="flex items-center">
                          Visits per Month
                          <SortArrow columnKey="visits_per_month" />
                        </div>
                      </th>
                      <th
                        className="w-[12%] py-4 px-4 font-medium text-gray-700 text-left cursor-pointer hover:bg-gray-50 transition"
                        onClick={() => handleSort('pending_visits')}
                      >
                        <div className="flex items-center">
                          Visit Pending This Month
                          <SortArrow columnKey="pending_visits" />
                        </div>
                      </th>
                      {/* Show Days Left column only for admin */}
                      {isAdmin && (
                        <th
                          className="w-[16%] py-4 px-4 font-medium text-gray-700 text-left cursor-pointer hover:bg-gray-50 transition"
                          onClick={() => handleSort('validity_upto')}
                        >
                          <div className="flex items-center">
                            Days Left
                            <SortArrow columnKey="validity_upto" />
                          </div>
                        </th>
                      )}
                      <th className="w-[12%] py-4 px-4 font-medium text-gray-700 text-left">
                        AMC Status
                      </th>
                      {userRole !== "technician" && (
                        <th className="py-4 px-4 font-medium text-gray-700 text-right">Action</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {currentUsers.map((user) => {
                      const daysLeft = Math.ceil((new Date(user.validity_upto) - new Date()) / (1000 * 60 * 60 * 24));
                      const status = getAMCStatus(user.validity_upto);

                      return (
                        <tr
                          key={user.id}
                          className="border-b border-gray-200 hover:bg-gray-50 transition"
                        >
                          {/* Name */}
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <span className="font-medium text-gray-800 truncate">
                                {user.name}<br/>({user.amc_free_paid})
                              </span>
                            </div>
                          </td>

                          {/* Phone */}
                          <td className="py-4 px-4 text-gray-700 truncate">
                            <a
                              href={`tel:${user.phone}`}
                              className="text-blue-600 hover:underline"
                            >
                              {user.phone}
                            </a>
                          </td>

                          {/* Visits per Month */}
                          <td className="py-4 px-4 text-gray-700 text-left truncate">
                            {user.visits_per_month}
                          </td>

                          {/* Pending Visits */}
                          <td className="py-4 px-4 text-gray-700 text-left truncate">
                            {user.pending_visits}
                          </td>

                          {/* Days Left - Only show for admin */}
                          {isAdmin && (
                            <td className="py-4 px-4 text-gray-700 truncate">
                              <p>
                                {daysLeft} Days
                              </p>
                              <em
                                className={`small-text py-1 rounded 
                                  ${status === "Active" ? " text-green-400" : ""}
                                  ${status === "Renew Soon" ? "text-red-300" : ""}
                                  ${status === "Expired" ? " text-red-600" : ""}
                                `}
                              >
                                ({formatDate(user.validity_upto)})
                              </em>
                            </td>
                          )}

                          {/* Status */}
                          <td className="py-4 px-4 text-gray-700 truncate">
                            <span
                              className={`px-3 py-1 rounded-lg text-sm font-medium cust-status-label
                                ${status === "Active" ? "bg-green-400 text-white" : ""}
                                ${status === "Renew Soon" ? "bg-red-300 text-white" : ""}
                                ${status === "Expired" ? "bg-red-600 text-white" : ""}
                              `}
                            >
                              {status}
                            </span>
                          </td>

                          {/* Action */}
                          {userRole !== "technician" && (
                            <td className="py-4 px-4 text-right">
                              <button
                                onClick={() => handleEdit(user.amc_id)}
                                className="px-4 py-2 btn-primary"
                              >
                                Edit
                              </button>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile View */}
              <div className="block lg:hidden space-y-5">
                {currentUsers.map((user) => {
                  const daysLeft = Math.ceil(
                    (new Date(user.validity_upto) - new Date()) / (1000 * 60 * 60 * 24)
                  );
                  const status = getAMCStatus(user.validity_upto);

                  return (
                    <div
                      key={user.id}
                      className="border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition bg-white"
                    >
                      <h3 className="font-semibold text-gray-800 text-lg mb-3">
                        {user.name}
                      </h3>

                      <div className="space-y-3 mb-5">
                        {/* Phone */}
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                            Contact
                          </span>
                          <a
                            href={`tel:${user.phone}`}
                            className="text-sm text-blue-600 hover:underline"
                          >
                            {user.phone}
                          </a>
                        </div>

                        {/* Visits per Month */}
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                            Visits / Month
                          </span>
                          <span className="text-sm text-gray-700">
                            {user.visits_per_month}
                          </span>
                        </div>

                        {/* Pending Visits */}
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                            Pending Visits
                          </span>
                          <span className="text-sm text-gray-700">
                            {user.pending_visits}
                          </span>
                        </div>

                        {/* Days Left - Only show for admin */}
                        {isAdmin && (
                          <>
                            <div className="flex flex-col">
                              <span className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                                Days Left
                              </span>
                              <span className="text-sm text-gray-700">
                                {daysLeft} days
                              </span>
                            </div>

                            {/* Expiry date */}
                            <div className="flex flex-col">
                              <span className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                                Expiry Date
                              </span>
                              <span className="text-sm text-gray-700">
                                {formatDate(user.validity_upto)}
                              </span>
                            </div>
                          </>
                        )}

                        {/* Status */}
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                            Status
                          </span>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold w-fit
                              ${status === "Active"
                                ? "bg-green-600 text-white"
                                : status === "Renew Soon"
                                  ? "bg-orange-500 text-white"
                                  : "bg-red-600 text-white"
                              }
                            `}
                          >
                            {status}
                          </span>
                        </div>
                      </div>

                      {userRole !== "technician" && (
                        <button
                          onClick={() => handleEdit(user.amc_id)}
                          className="w-full px-4 py-2.5 btn-primary"
                        >
                          Edit
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Pagination */}
        {filteredUsers.length > 0 && (
          <div className="px-5 sm:px-6 py-4 border-t bg-gray-50">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-gray-600">
                Showing {indexOfFirstUser + 1} to{" "}
                {Math.min(indexOfLastUser, filteredUsers.length)} of{" "}
                {filteredUsers.length} users
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={goToPrevious}
                  disabled={currentPage === 1}
                  className={`px-3 py-2 rounded-lg font-medium transition ${currentPage === 1
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                >
                  Previous
                </button>
                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index + 1}
                    onClick={() => goToPage(index + 1)}
                    className={`px-3 py-2 rounded-lg font-medium transition ${currentPage === index + 1
                      ? "bg-blue-500 text-white"
                      : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                  >
                    {index + 1}
                  </button>
                ))}
                <button
                  onClick={goToNext}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-2 rounded-lg font-medium transition ${currentPage === totalPages
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}