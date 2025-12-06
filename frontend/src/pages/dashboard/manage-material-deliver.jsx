import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";

export default function UserTable() {
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'ascending' // 'ascending' or 'descending'
  });

  const usersPerPage = 10;
  const navigate = useNavigate();

  // 🔹 Fetch data from backend API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}api/material-deliver.php`, {
          method: "GET",
        });
        const data = await response.json();
        console.log("user data=", data);
        setAllUsers(data.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // 🔹 Handle sorting
  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // 🔹 Sort users based on sortConfig
  const sortedUsers = useMemo(() => {
    const users = [...allUsers];
    if (sortConfig.key) {
      users.sort((a, b) => {
        // Handle different data types for proper sorting
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        // Convert to lowercase for string comparison
        if (typeof aValue === 'string') {
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
    }
    return users;
  }, [allUsers, sortConfig]);

  // 🔹 Filter users based on search
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return sortedUsers;
    const query = searchQuery.toLowerCase();
    return sortedUsers.filter(
      (user) =>
        user.name.toLowerCase().includes(query) ||
        user.phone.toLowerCase().includes(query) ||
        user.delivery_status.toLowerCase().includes(query) ||
        user.plant.toLowerCase().includes(query) ||
        user.tech_name.toLowerCase().includes(query)
    );
  }, [sortedUsers, searchQuery]);

  // Pagination logic
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  // 🔹 Sort indicator component
  const SortIndicator = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) {
      return <span className="ml-1 opacity-50">↕↕</span>;
    }
    return (
      <span className="ml-1">
        {sortConfig.direction === 'ascending' ? '↑' : '↓'}
      </span>
    );
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleEdit = (userId) => {
    navigate(`/dashboard/editmaterialdeliver/${userId}`);
  };

  const goToPage = (page) => setCurrentPage(page);
  const goToPrevious = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const goToNext = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));

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
              Manage Material Deliver
            </h2>
            <p className="text-sm sm:text-base text-gray-600">
              View and manage deliver material
            </p>
          </div>

          <div className="mt-3 sm:mt-0 w-full sm:w-1/3 relative">
            <input
              type="text"
              placeholder="Search by name, email, role, or mobile..."
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
                        className="w-[20%] py-4 px-4 font-medium text-gray-700 text-left cursor-pointer hover:bg-gray-50 transition"
                        onClick={() => handleSort('name')}
                      >
                        <div className="flex items-center">
                          Customer Name
                          <SortIndicator columnKey="name" />
                        </div>
                      </th>
                      <th
                        className="w-[12%] py-4 px-4 font-medium text-gray-700 text-left cursor-pointer hover:bg-gray-50 transition"
                        onClick={() => handleSort('tech_name')}
                      >
                        <div className="flex items-center">
                          Tech Name
                          <SortIndicator columnKey="tech_name" />
                        </div>
                      </th>
                      <th
                        className="w-[14%] py-4 px-4 font-medium text-gray-700 text-left cursor-pointer hover:bg-gray-50 transition"
                        onClick={() => handleSort('phone')}
                      >
                        <div className="flex items-center">
                          Customer No.
                          <SortIndicator columnKey="phone" />
                        </div>
                      </th>
                      <th
                        className="w-[25%] py-4 px-4 font-medium text-gray-700 text-left cursor-pointer hover:bg-gray-50 transition"
                        onClick={() => handleSort('plant')}
                      >
                        <div className="flex items-center">
                          Material Need To Deliver
                          <SortIndicator columnKey="plant" />
                        </div>
                      </th>
                      <th
                        className="w-[15%] py-4 px-4 font-medium text-gray-700 text-left cursor-pointer hover:bg-gray-50 transition"
                        onClick={() => handleSort('delivery_status')}
                      >
                        <div className="flex items-center">
                          Deliver Status
                          <SortIndicator columnKey="delivery_status" />
                        </div>
                      </th>
                      <th className="w-[10%] py-4 px-4 font-medium text-gray-700 text-right">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentUsers.map((user) => {

                      return (
                        <tr
                          key={user._id}
                          className="border-b border-gray-200 hover:bg-gray-50 transition"
                        >
                          {/* Name */}
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={
                                  user.profile_pic
                                    ? `${import.meta.env.VITE_API_URL}uploads/users/${user.profile_pic}`
                                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                      user.name
                                    )}&background=3b82f6&color=fff`
                                }
                                alt={user.name}
                                className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                              />
                              <span className="font-medium text-gray-800 truncate">
                                {user.name}
                              </span>
                            </div>
                          </td>

                          <td className="py-4 px-4 text-gray-700 truncate">
                            {user.tech_name}
                          </td>

                          {/* Phone */}
                          <td className="py-4 px-4 text-gray-700 truncate">
                            <a
                              href={`tel:${user.phone || user.mobile}`}
                              className="text-blue-600 hover:underline"
                            >
                              {user.phone || user.mobile}
                            </a>
                          </td>

                          <td className="py-4 px-4 text-gray-700 truncate">
                            {user.plant}{user.nutrients}{user.chargeableItem}
                          </td>

                          <td className="py-4 px-4 text-gray-700 truncate">
                            {user.delivery_status?.toUpperCase()}
                          </td>

                          {/* Action */}
                          <td className="py-4 px-4 text-right">
                            <button
                              onClick={() => handleEdit(user.id)}
                              className="px-4 py-2 btn-primary"
                            >
                              Edit
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile View */}
              <div className="block lg:hidden space-y-5">
                {currentUsers.map((user) => {

                  return (
                    <div
                      key={user._id}
                      className="border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition bg-white"
                    >
                      <div className="flex items-start gap-4 mb-5">
                        <img
                          src={
                            user.profile_pic
                              ? `${import.meta.env.VITE_API_URL}uploads/users/${user.profile_pic}`
                              : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                user.name
                              )}&background=3b82f6&color=fff`
                          }
                          alt={user.name}
                          className="w-14 h-14 rounded-full object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-800 text-lg mb-2">
                            {user.name} <br /><small>({user.user_code})</small>
                          </h3>
                        </div>
                      </div>

                      <div className="space-y-3 mb-5">
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                            Contact No.
                          </span>
                          <span className="text-sm text-gray-700 break-all">
                            <a
                              href={`tel:${user.phone}`}
                              className="text-blue-600 hover:underline"
                            >
                              {user.phone}
                            </a>
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleEdit(user.id)}
                        className="w-full px-4 py-2.5 btn-primary"
                      >
                        Edit
                      </button>
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


