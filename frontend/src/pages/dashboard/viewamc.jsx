import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";

export default function UserTable() {
  const [allAMC, setAllAMC] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  const userRole = user?.role;
  console.log("user",user)

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

  // 🔹 Filter users based on search
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return allAMC;
    const query = searchQuery.toLowerCase();
    return allAMC.filter(
      (user) =>
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.role.toLowerCase().includes(query) ||
        user.phone.includes(query)
    );
  }, [allAMC, searchQuery]);

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
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
              AMC Management
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              View and manage AMC
            </p>
          </div>

          <div className="mt-3 sm:mt-0 w-full sm:w-1/3">
            <input
              type="text"
              placeholder="Search by name, email, role, or mobile..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
            />
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
                      <th className="w-[15%] py-4 px-4 font-medium text-gray-700 text-left">Name</th>
                      <th className="w-[12%] py-4 px-4 font-medium text-gray-700 text-left">Contact</th>
                      <th className="w-[15%] py-4 px-4 font-medium text-gray-700 text-left">Visits per Month</th>
                      {<th className="w-[12%] py-4 px-4 font-medium text-gray-700 text-left">Visit Pending</th>}
                      <th className="w-[16%] py-4 px-4 font-medium text-gray-700 text-left">Days Left</th>
                      <th className="w-[10%] py-4 px-4 font-medium text-gray-700 text-left">Expire On</th>
                      {userRole !== "technician" && (
                        <th className="py-4 px-4 font-medium text-gray-700 text-right">Action</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {currentUsers.map((user) => {
                      const getAMCStatus = (validity_upto) => {
                        const validityDate = new Date(validity_upto);
                        const today = new Date();

                        validityDate.setHours(0, 0, 0, 0);
                        today.setHours(0, 0, 0, 0);

                        const diffTime = validityDate - today;
                        const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        console.log("daysLeft=", daysLeft);

                        if (daysLeft > 10) {
                          
                          return "Active";
                        } else if (daysLeft > 6 && daysLeft < 10) {
                          return "Renew Soon";
                        } else {
                          return "Expired";
                        }
                      };

                      // return row...
                    


                    {/* console.log('getAMCStatus=', getAMCStatus(2025-11-25)); */}

                      return (
                        <tr
                          key={user.id}
                          className="border-b border-gray-200 hover:bg-gray-50 transition"
                        >
                          {/* Name */}
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <span className="font-medium text-gray-800 truncate">
                                {user.name}
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
                          
                          {/* Email — moved up before Status */}
                          <td className="py-4 px-4 text-gray-700 text-left truncate">
                              {user.visits_per_month}
                          </td>

                          {<td className="py-4 px-4 text-gray-700 text-left truncate">
                              {user.pending_visits}
                          </td>}

                          <td className="py-4 px-4 text-gray-700 truncate">
                            <p>
                              {Math.ceil((new Date(user.validity_upto) - new Date()) / (1000 * 60 * 60 * 24))} Days
                            </p>

                            <em
                              className={`small-text py-1 rounded 
                                ${getAMCStatus(user.validity_upto) === "Active" ? " text-green-400" : ""}
                                ${getAMCStatus(user.validity_upto) === "Renew Soon" ? "text-red-300" : ""}
                                ${getAMCStatus(user.validity_upto) === "Expired" ? " text-red-600" : ""}
                              `}
                            >
                              ({formatDate(user.validity_upto)})
                            </em>
                          </td>


                          <td className="py-4 px-4 text-gray-700 truncate">
                            <span
                              className={`px-3 py-1 rounded-lg text-sm font-medium cust-status-label
                                ${getAMCStatus(user.validity_upto) === "Active" ? "bg-green-400 text-white" : ""}
                                ${getAMCStatus(user.validity_upto) === "Renew Soon" ? "bg-red-300 text-white" : ""}
                                ${getAMCStatus(user.validity_upto) === "Expired" ? "bg-red-600 text-white" : ""}
                              `}
                            >
                              {getAMCStatus(user.validity_upto)}
                            </span>
                          </td>


                          {/* Status — moved down after Email */}
                          

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
                  
                  const getAMCStatus = (validity_upto) => {
                    const validityDate = new Date(validity_upto);
                    const today = new Date();

                    validityDate.setHours(0, 0, 0, 0);
                    today.setHours(0, 0, 0, 0);

                    const diffTime = validityDate - today;
                    const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                    if (daysLeft > 10) return "Active";
                    if (daysLeft > 6) return "Renew Soon";
                    return "Expired";
                  };

                  const daysLeft = Math.ceil(
                    (new Date(user.validity_upto) - new Date()) / (1000 * 60 * 60 * 24)
                  );

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

                        {/* Days Left */}
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

                        {/* Status */}
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                            Status
                          </span>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold w-fit
                              ${
                                getAMCStatus(user.validity_upto) === "Active"
                                  ? "bg-green-600 text-white"
                                  : getAMCStatus(user.validity_upto) === "Renew Soon"
                                  ? "bg-orange-500 text-white"
                                  : "bg-red-600 text-white"
                              }
                            `}
                          >
                            {getAMCStatus(user.validity_upto)}
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
