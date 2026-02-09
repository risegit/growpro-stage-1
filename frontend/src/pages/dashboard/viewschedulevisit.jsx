import React, { useState, useEffect, useMemo } from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function UserTable() {
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage, setUsersPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  const userRole = user?.role;
  const user_code = user?.user_code;
  console.log("userCode=", user_code);

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // 🔹 Sorting functionality
  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
  };

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

  // 🔹 Fetch data from backend API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}api/schedule-site-visit.php?view-schedule-visit='viewScheduleVisit'&user_code=${user_code}&techId=${user?.id}`, {
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

  // 🔹 Sorting + Search functionality
  const filteredUsers = useMemo(() => {
    let users = [...allUsers];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      users = users.filter(
        (user) =>
          user.customer_name.toLowerCase().includes(query) ||
          user.customer_phone.includes(query) ||
          user.technician_name.toLowerCase().includes(query) ||
          formatDate(user.visit_date).toLowerCase().includes(query) ||
          user.visit_time.toLowerCase().includes(query)
      );
    }

    // Sorting logic
    if (sortConfig.key) {
      users.sort((a, b) => {
        let valueA = a[sortConfig.key];
        let valueB = b[sortConfig.key];

        // Handle date sorting
        if (sortConfig.key === 'visit_date') {
          valueA = new Date(valueA).getTime();
          valueB = new Date(valueB).getTime();
        }
        
        // Handle string comparison
        if (typeof valueA === 'string' && typeof valueB === 'string') {
          valueA = valueA.toLowerCase();
          valueB = valueB.toLowerCase();
        }

        if (valueA < valueB) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (valueA > valueB) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }

    return users;
  }, [allUsers, searchQuery, sortConfig]);

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
    navigate(`/dashboard/sitevisits/editschedulevisit/${userId}`);
  };

  const handleCreateSiteVisit = (scheduleId) => {
    navigate("/dashboard/sitevisits/createvisits", {
      state: { scheduleId },
    });
  };

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const goToPrevious = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const goToNext = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const goToFirst = () => setCurrentPage(1);
  const goToLast = () => setCurrentPage(totalPages);

  // Get visible page numbers with ellipsis
  const getVisiblePages = () => {
    const delta = 2; // Number of pages to show on each side
    const range = [];
    
    if (totalPages <= 7) {
      // Show all pages if total pages is 7 or less
      for (let i = 1; i <= totalPages; i++) {
        range.push(i);
      }
      return range;
    }
    
    // Always include first page
    range.push(1);
    
    // Calculate range around current page
    const start = Math.max(2, currentPage - delta);
    const end = Math.min(totalPages - 1, currentPage + delta);
    
    // Add ellipsis if needed before middle range
    if (start > 2) {
      range.push("...");
    }
    
    // Add middle range
    for (let i = start; i <= end; i++) {
      range.push(i);
    }
    
    // Add ellipsis if needed after middle range
    if (end < totalPages - 1) {
      range.push("...");
    }
    
    // Always include last page
    if (totalPages > 1) {
      range.push(totalPages);
    }
    
    return range;
  };

  // Handle page size change
  const handlePageSizeChange = (e) => {
    setUsersPerPage(Number(e.target.value));
    setCurrentPage(1);
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
              Manage Schedule Visits
            </h2>
            <p className="text-sm sm:text-base text-gray-600">
              View and manage Schedule Visits
            </p>
          </div>

          <div className="mt-3 sm:mt-0 w-full sm:w-1/3 relative">
            <input
              type="text"
              placeholder="Search by name, visited by..."
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
                        className="w-[18%] py-4 px-4 font-medium text-gray-700 text-left cursor-pointer hover:bg-gray-50 transition"
                        onClick={() => handleSort("customer_name")}
                      >
                        <div className="flex items-center">
                          Customer Name
                          <SortArrow columnKey="customer_name" />
                        </div>
                      </th>
                      <th 
                        className="w-[15%] py-4 px-4 font-medium text-gray-700 text-left cursor-pointer hover:bg-gray-50 transition"
                        onClick={() => handleSort("customer_phone")}
                      >
                        <div className="flex items-center">
                          Customer Contact No.
                          <SortArrow columnKey="customer_phone" />
                        </div>
                      </th>
                      <th 
                        className="w-[15%] py-4 px-4 font-medium text-gray-700 text-left cursor-pointer hover:bg-gray-50 transition"
                        onClick={() => handleSort("technician_name")}
                      >
                        <div className="flex items-center">
                          Assign To
                          <SortArrow columnKey="technician_name" />
                        </div>
                      </th>
                      <th 
                        className="w-[10%] py-4 px-4 font-medium text-gray-700 text-left cursor-pointer hover:bg-gray-50 transition"
                        onClick={() => handleSort("visit_date")}
                      >
                        <div className="flex items-center">
                          Visit Date
                          <SortArrow columnKey="visit_date" />
                        </div>
                      </th>
                      <th 
                        className="w-[20%] py-4 px-4 font-medium text-gray-700 text-left cursor-pointer hover:bg-gray-50 transition"
                        onClick={() => handleSort("visit_time")}
                      >
                        <div className="flex items-center">
                          Visit Time
                          <SortArrow columnKey="visit_time" />
                        </div>
                      </th>
                      <th className="w-[10%] py-4 px-4 font-medium text-gray-700 text-right">Action</th>
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
                                    ? `${import.meta.env.VITE_API_URL}uploads/customers/${user.profile_pic}`
                                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                      user.customer_name
                                    )}&background=3b82f6&color=fff`
                                }
                                alt={user.customer_name}
                                className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                              />
                              <span className="font-medium text-gray-800 truncate">
                                {user.customer_name}
                              </span>
                            </div>
                          </td>

                          {/* Phone */}
                          <td className="py-4 px-4 text-gray-700 truncate">
                            <a
                              href={`tel:${user.customer_phone}`}
                              className="text-blue-600 hover:underline"
                            >
                              {user.customer_phone}
                            </a>
                          </td>

                          <td className="py-4 px-4 text-gray-700 truncate">
                            {user.technician_name}
                          </td>

                          <td className="py-4 px-4 text-gray-700 truncate">
                            {formatDate(user.visit_date)}
                          </td>

                          <td className="py-4 px-4 text-gray-700 truncate">
                            {user.visit_time}
                          </td>

                          {/* Action */}
                          <td className="py-2 px-0 text-right">
                            {userRole !== "technician" ? (
                              <>
                              {user.status === "scheduled" && (
                              <button
                                onClick={() => handleEdit(user.id)}
                                className="px-2 py-0 btn-primary"
                              >
                                Edit
                              </button>
                              )}
                              {user.status === "completed" && (
                                  <button
                                    disabled
                                    className="px-2 py-2 btn-success cursor-not-allowed"
                                  >
                                    Completed
                                  </button>
                                )}
                                {user.status === "cancelled" && (
                                  <button
                                    disabled
                                    className="px-2 py-2 btn-danger text-white cursor-not-allowed"
                                  >
                                    Cancelled
                                  </button>
                                )}
                              </>
                            ) : (
                              <>
                                {user.status === "scheduled" && (
                                  <button
                                    onClick={() => handleCreateSiteVisit(user.id)}
                                    className="px-2 py-2 btn-primary"
                                  >
                                    Start Visit
                                  </button>
                                )}
                                {user.status === "completed" && (
                                  <button
                                    disabled
                                    className="px-2 py-2 btn-success cursor-not-allowed"
                                  >
                                    Completed
                                  </button>
                                )}
                                {user.status === "cancelled" && (
                                  <button
                                    disabled
                                    className="px-2 py-2 btn-danger text-white cursor-not-allowed"
                                  >
                                    Cancelled
                                  </button>
                                )}
                              </>
                            )}
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
                              ? `${import.meta.env.VITE_API_URL}uploads/customers/${user.profile_pic}`
                              : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                user.customer_name
                              )}&background=3b82f6&color=fff`
                          }
                          alt={user.customer_name}
                          className="w-14 h-14 rounded-full object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-800 text-lg mb-2">
                            {user.customer_name}
                          </h3>
                          <p className="text-gray-600 text-sm">
                            Contact:{" "}
                            <a
                              href={`tel:${user.customer_phone}`}
                              className="text-blue-600 hover:underline"
                            >
                              {user.customer_phone}
                            </a>
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3 mb-5">
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                            Assigned To
                          </span>
                          <span className="text-sm text-gray-700 break-all">
                            {user.technician_name}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex flex-col">
                            <span className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                              Visit Date
                            </span>
                            <span className="text-sm text-gray-700">
                              {formatDate(user.visit_date)}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                              Visit Time
                            </span>
                            <span className="text-sm text-gray-700">
                              {user.visit_time}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                            Status
                          </span>
                          <span className="text-sm">
                            {user.status === "scheduled" && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                                Scheduled
                              </span>
                            )}
                            {user.status === "completed" && (
                              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                                Completed
                              </span>
                            )}
                            {user.status === "cancelled" && (
                              <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                                Cancelled
                              </span>
                            )}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4">
                        {userRole !== "technician" ? (
                          <>
                            {user.status === "scheduled" && (
                              <button
                                onClick={() => handleEdit(user.id)}
                                className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
                              >
                                Edit Schedule
                              </button>
                            )}
                            {user.status === "completed" && (
                              <button
                                disabled
                                className="w-full px-4 py-2.5 bg-green-500 text-white rounded-lg font-medium cursor-not-allowed"
                              >
                                Completed
                              </button>
                            )}
                            {user.status === "cancelled" && (
                              <button
                                disabled
                                className="w-full px-4 py-2.5 bg-red-500 text-white rounded-lg font-medium cursor-not-allowed"
                              >
                                Cancelled
                              </button>
                            )}
                          </>
                        ) : (
                          <>
                            {user.status === "scheduled" && (
                              <button
                                onClick={() => handleCreateSiteVisit(user.id)}
                                className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
                              >
                                Start Visit
                              </button>
                            )}
                            {user.status === "completed" && (
                              <button
                                disabled
                                className="w-full px-4 py-2.5 bg-green-500 text-white rounded-lg font-medium cursor-not-allowed"
                              >
                                Completed
                              </button>
                            )}
                            {user.status === "cancelled" && (
                              <button
                                disabled
                                className="w-full px-4 py-2.5 bg-red-500 text-white rounded-lg font-medium cursor-not-allowed"
                              >
                                Cancelled
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Enhanced Pagination */}
        {filteredUsers.length > 0 && (
          <div className="px-5 sm:px-6 py-4 border-t bg-gray-50">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Entries per page selector */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Show</span>
                <select
                  value={usersPerPage}
                  onChange={handlePageSizeChange}
                  className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={30}>30</option>
                  <option value={50}>50</option>
                </select>
                <span className="text-sm text-gray-600">entries per page</span>
              </div>

              {/* Page information */}
              <p className="text-sm text-gray-600">
                Showing <span className="font-medium">{indexOfFirstUser + 1}</span> to{" "}
                <span className="font-medium">{Math.min(indexOfLastUser, filteredUsers.length)}</span> of{" "}
                <span className="font-medium">{filteredUsers.length}</span> schedule visits
              </p>

              {/* Compact pagination controls */}
              <div className="flex items-center gap-1">
                {/* First page button */}
                <button
                  onClick={goToFirst}
                  disabled={currentPage === 1}
                  className={`p-2 rounded-lg transition ${currentPage === 1
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-gray-600 hover:bg-gray-200"
                    }`}
                  title="First page"
                >
                  <ChevronsLeft size={18} />
                </button>

                {/* Previous button */}
                <button
                  onClick={goToPrevious}
                  disabled={currentPage === 1}
                  className={`p-2 rounded-lg transition ${currentPage === 1
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-gray-600 hover:bg-gray-200"
                    }`}
                  title="Previous page"
                >
                  <ChevronLeft size={18} />
                </button>

                {/* Page numbers with ellipsis */}
                {getVisiblePages().map((page, index) => (
                  page === "..." ? (
                    <span
                      key={`ellipsis-${index}`}
                      className="px-2 py-1 text-gray-500"
                    >
                      ...
                    </span>
                  ) : (
                    <button
                      key={page}
                      onClick={() => goToPage(page)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition ${currentPage === page
                          ? "bg-blue-600 text-white"
                          : "text-gray-700 hover:bg-gray-200"
                        }`}
                    >
                      {page}
                    </button>
                  )
                ))}

                {/* Next button */}
                <button
                  onClick={goToNext}
                  disabled={currentPage === totalPages}
                  className={`p-2 rounded-lg transition ${currentPage === totalPages
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-gray-600 hover:bg-gray-200"
                    }`}
                  title="Next page"
                >
                  <ChevronRight size={18} />
                </button>

                {/* Last page button */}
                <button
                  onClick={goToLast}
                  disabled={currentPage === totalPages}
                  className={`p-2 rounded-lg transition ${currentPage === totalPages
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-gray-600 hover:bg-gray-200"
                    }`}
                  title="Last page"
                >
                  <ChevronsRight size={18} />
                </button>
              </div>
            </div>

            {/* Quick page jump */}
      
          </div>
        )}
      </div>
    </div>
  );
}