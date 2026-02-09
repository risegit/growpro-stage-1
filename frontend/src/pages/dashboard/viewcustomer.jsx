import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";

export default function UserTable() {
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage, setUsersPerPage] = useState(10);
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

  // 🔹 Search + Sorting - FIXED SEARCH LOGIC
  const filteredUsers = useMemo(() => {
    let users = [...allUsers];

    // Search filter - FIXED to search all relevant fields
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      users = users.filter((user) => {
        // Check all possible fields for search
        const nameMatch = user.name?.toLowerCase().includes(query) || false;
        const emailMatch = user.email?.toLowerCase().includes(query) || false;
        const phoneMatch = user.phone?.includes(query) || false;
        const localityMatch = user.locality?.toLowerCase().includes(query) || false;
        const landmarkMatch = user.landmark?.toLowerCase().includes(query) || false;
        const plantsMatch = user.total_no_of_plants?.toString().includes(query) || false;
        const statusMatch = user.status?.toLowerCase().includes(query) || false;

        // Return true if any field matches
        return nameMatch || emailMatch || phoneMatch || localityMatch || 
               landmarkMatch || plantsMatch || statusMatch;
      });
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

  // 🔹 Improved Pagination Logic with Ellipsis
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5; // Number of page buttons to show
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total pages is less than or equal to maxVisiblePages
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always show first page
      pageNumbers.push(1);
      
      // Calculate start and end of visible pages
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);
      
      // Adjust if we're near the start
      if (currentPage <= 3) {
        startPage = 2;
        endPage = 4;
      }
      
      // Adjust if we're near the end
      if (currentPage >= totalPages - 2) {
        startPage = totalPages - 3;
        endPage = totalPages - 1;
      }
      
      // Add ellipsis after first page if needed
      if (startPage > 2) {
        pageNumbers.push('...');
      }
      
      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
      
      // Add ellipsis before last page if needed
      if (endPage < totalPages - 1) {
        pageNumbers.push('...');
      }
      
      // Always show last page
      pageNumbers.push(totalPages);
    }
    
    return pageNumbers;
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleEdit = (userId) => {
    navigate(`/dashboard/customers/editcustomer/${userId}`);
  };

  const handleUsersPerPageChange = (e) => {
    setUsersPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages && page !== '...') {
      setCurrentPage(page);
    }
  };
  
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
                        onClick={() => handleSort("locality")}
                      >
                        <div className="flex items-center">
                          Locality
                          <SortArrow columnKey="locality" />
                        </div>
                      </th>

                      <th
                        className="py-4 px-4 font-medium text-gray-700 cursor-pointer hover:bg-gray-50 transition"
                        onClick={() => handleSort("total_no_of_plants")}
                      >
                        <div className="flex items-center">
                          Plants
                          <SortArrow columnKey="total_no_of_plants" />
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

                      {userRole !== "manager" && (
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
                          {user.locality}, {user.landmark}
                        </td>

                        <td className="w-[15%] py-4 px-4 text-gray-700">
                          {user.total_no_of_plants}
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

                        {userRole !== "manager" && (
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
                        {user.total_no_of_plants}
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

                    {userRole !== "manager" && (
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

        {/* Improved Pagination with Entries Selector */}
        {filteredUsers.length > 0 && (
          <div className="px-6 py-4 border-t bg-gray-50">
            <div className="flex flex-col sm:flex-row items-center justify-between">
              {/* Left side: Show entries selector */}
              <div className="flex items-center gap-3 mb-4 sm:mb-0">
                <span className="text-sm text-gray-600">Show</span>
                <select
                  value={usersPerPage}
                  onChange={handleUsersPerPageChange}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
                >
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="30">30</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
                <span className="text-sm text-gray-600">entries</span>
              </div>

              {/* Center: Page info */}
              <p className="text-sm text-gray-600 mb-4 sm:mb-0">
                Showing {indexOfFirstUser + 1} to{" "}
                {Math.min(indexOfLastUser, filteredUsers.length)} of{" "}
                {filteredUsers.length} users
              </p>

              {/* Right side: Pagination controls */}
              <div className="flex items-center space-x-1">
                {/* Previous Button */}
                <button
                  onClick={goToPrevious}
                  disabled={currentPage === 1}
                  className={`px-3 py-2 rounded-md font-medium text-sm transition ${
                    currentPage === 1
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                  aria-label="Previous page"
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
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>

                {/* Page Numbers */}
                {totalPages > 1 && getPageNumbers().map((pageNumber, index) => (
                  <button
                    key={index}
                    onClick={() => goToPage(pageNumber)}
                    className={`px-3 py-2 min-w-[40px] rounded-md font-medium text-sm transition ${
                      pageNumber === currentPage
                        ? "bg-blue-600 text-white"
                        : pageNumber === '...'
                        ? "text-gray-500 cursor-default"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                    disabled={pageNumber === '...'}
                    aria-label={
                      pageNumber === '...'
                        ? "More pages"
                        : `Go to page ${pageNumber}`
                    }
                  >
                    {pageNumber}
                  </button>
                ))}

                {/* Next Button */}
                <button
                  onClick={goToNext}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className={`px-3 py-2 rounded-md font-medium text-sm transition ${
                    currentPage === totalPages || totalPages === 0
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                  aria-label="Next page"
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
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}