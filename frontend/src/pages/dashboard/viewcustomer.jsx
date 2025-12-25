import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";

export default function UserTable() {
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  const userRole = user?.role;

  // 🔹 Sorting Config
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
  };

  // 🔹 Fetch data from backend API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}api/customer.php`, {
          method: "GET",
        });
        const data = await response.json();
        setAllUsers(data.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // 🔹 Search + Sorting
  const filteredUsers = useMemo(() => {
    let users = [...allUsers];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      users = users.filter(
        (user) =>
          user.name.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query) ||
          user.role.toLowerCase().includes(query) ||
          user.phone.includes(query)
      );
    }

    // Sorting logic
    if (sortConfig.key) {
      users.sort((a, b) => {
        const valueA = a[sortConfig.key]?.toString().toLowerCase();
        const valueB = b[sortConfig.key]?.toString().toLowerCase();
        if (!valueA || !valueB) return 0;

        if (valueA < valueB) return sortConfig.direction === "asc" ? -1 : 1;
        if (valueA > valueB) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return users;
  }, [allUsers, searchQuery, sortConfig]);

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleEdit = (userId) => {
    navigate(`/dashboard/customers/editcustomer/${userId}`);
  };

  const goToPage = (page) => setCurrentPage(page);
  const goToPrevious = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const goToNext = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  // 🔹 Sort Arrow Component
  const SortArrow = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) {
      return <span className="ml-1 text-gray-400">↕↕</span>;
    }
    return (
      <span className="ml-1">
        {sortConfig.direction === "asc" ? "↑" : "↓"}
      </span>
    );
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

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-5 py-4 border-b">
          <div>
            <h2 className="text-2xl font-bold mb-2 text-gray-800">Customer Management</h2>
            <p className="text-sm sm:text-base text-gray-600">View and manage all customers</p>
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

        <div className="p-6">
          {currentUsers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No users found</p>
              <p className="text-gray-400 text-sm mt-2">Try adjusting your search</p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="overflow-x-auto hidden lg:block">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th
                        className="py-4 px-1 font-medium text-gray-700 cursor-pointer hover:bg-gray-50 transition"
                        onClick={() => handleSort("name")}
                      >
                        <div className="flex items-center">
                          Name
                          <SortArrow columnKey="name" />
                        </div>
                      </th>

                      <th
                        className="py-4 px-4 font-medium text-gray-700 cursor-pointer hover:bg-gray-50 transition"
                        onClick={() => handleSort("phone")}
                      >
                        <div className="flex items-center">
                          Locality
                          <SortArrow columnKey="phone" />
                        </div>
                      </th>

                      <th
                        className="py-4 px-4 font-medium text-gray-700 cursor-pointer hover:bg-gray-50 transition"
                        onClick={() => handleSort("email")}
                      >
                        <div className="flex items-center">
                          Plants
                          <SortArrow columnKey="email" />
                        </div>
                      </th>

                      <th
                        className="py-4 px-4 font-medium text-gray-700 cursor-pointer hover:bg-gray-50 transition"
                        onClick={() => handleSort("status")}
                      >
                        <div className="flex items-center">
                          Status
                          <SortArrow columnKey="status" />
                        </div>
                      </th>

                      {userRole !== "co-ordinator" && (
                        <th className="py-4 px-4 font-medium text-gray-700 text-right">Action</th>
                      )}
                    </tr>
                  </thead>

                  <tbody>
                    {currentUsers.map((user) => (
                      <tr key={user._id} className="border-b hover:bg-gray-50 transition">
                        <td className="w-[25%] py-4 px-1">
                          <div className="flex items-center gap-2">
                            <img
                              src={
                                user.profile_pic
                                  ? `${import.meta.env.VITE_API_URL}uploads/customers/${user.profile_pic}`
                                  : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=3b82f6&color=fff`
                              }
                              alt={user.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                            <span className="font-medium text-gray-800">{user.name}</span>
                          </div>
                        </td>

                        <td className="w-[35%] py-4 px-4 text-gray-700">
                          {/* <a href={`tel:${user.phone}`} className="text-blue-600 hover:underline"> */}
                            {user.locality}, {user.landmark}
                          {/* </a> */}
                        </td>

                        <td className="w-[15%] py-4 px-4 text-gray-700">
                          {/* <a href={`mailto:${user.email}`} className="text-blue-600 hover:underline"> */}
                            {user.total_no_of_plants}
                          {/* </a> */}
                        </td>

                        <td className="w-[10%] py-4 px-4">
                          <span
                            className={`px-3 py-1 rounded-lg text-sm font-medium ${user.status === "active"
                                ? "bg-green-600 text-white"
                                : "bg-red-600 text-white"
                              }`}
                          >
                            {user.status}
                          </span>
                        </td>

                        {userRole !== "co-ordinator" && (
                          <td className="py-4 px-4 text-right">
                            <button
                              onClick={() => handleEdit(user.user_id)}
                              className="px-4 py-2 btn-primary"
                            >
                              Edit
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="block lg:hidden space-y-5">
                {currentUsers.map((user) => (
                  <div key={user._id} className="border rounded-xl p-5 bg-white shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                      <img
                        src={
                          user.profile_pic
                            ? `${import.meta.env.VITE_API_URL}uploads/customers/${user.profile_pic}`
                            : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=3b82f6&color=fff`
                        }
                        alt={user.name}
                        className="w-14 h-14 rounded-full object-cover"
                      />
                      <div>
                        <h3 className="font-semibold text-gray-800 text-lg">{user.name}</h3>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">Locality</p>
                      <a href={`tel:${user.phone}`} className="text-sm text-blue-600 hover:underline">
                        {user.locality}, {user.landmark}
                      </a>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div>
                        <p className="text-xs text-gray-500">Plants</p>
                        {/* <a href={`mailto:${user.email}`} className="text-sm text-blue-600 hover:underline"> */}
                          {user.total_no_of_plants}
                        {/* </a> */}
                      </div>

                      <div>
                        <p className="text-xs text-gray-500">Status</p>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${user.status === "active"
                              ? "bg-green-600 text-white"
                              : "bg-red-600 text-white"
                            }`}
                        >
                          {user.status}
                        </span>
                      </div>
                    </div>

                    {userRole !== "co-ordinator" && (
                      <button
                        onClick={() => handleEdit(user.user_id)}
                        className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition"
                      >
                        Edit
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Pagination */}
        {filteredUsers.length > 0 && (
          <div className="px-6 py-4 border-t bg-gray-50">
            <div className="flex flex-col sm:flex-row items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing {indexOfFirstUser + 1} to{" "}
                {Math.min(indexOfLastUser, filteredUsers.length)} of{" "}
                {filteredUsers.length} users
              </p>

              <div className="flex items-center gap-2 mt-3 sm:mt-0">
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