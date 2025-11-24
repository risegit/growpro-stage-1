import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";

const ManageVisits = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);

  const navigate = useNavigate();
  // Sample data - replace with your actual data
  const sampleUsers = [
    {
      id: 1,
      name: 'John Doe',
      phone: '+1 (555) 123-4567',
      visits_per_month: 12,
      validity_upto: '2024-12-31'
    },
    {
      id: 2,
      name: 'Jane Smith',
      phone: '+1 (555) 987-6543',
      visits_per_month: 8,
      validity_upto: '2024-11-15'
    },
    {
      id: 3,
      name: 'Mike Johnson',
      phone: '+1 (555) 456-7890',
      visits_per_month: 15,
      validity_upto: '2024-10-20'
    },
    // Add more sample data as needed
  ];

  useEffect(() => {
    // Initialize with sample data
    setUsers(sampleUsers);
    setFilteredUsers(sampleUsers);
  }, []);


  useEffect(() => {
    // Filter users based on search query
    if (searchQuery.trim() === '') {
      setFilteredUsers(users);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = users.filter(user =>
        user.name.toLowerCase().includes(query) ||
        user.phone.toLowerCase().includes(query) ||
        user.visits_per_month.toString().includes(query)
      );
      setFilteredUsers(filtered);
    }
    setCurrentPage(1); // Reset to first page when searching
  }, [searchQuery, users]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };


  const handleEdit = () => {
    navigate("/dashboard/sitevisits/editmanagevisit");
  };


  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Pagination logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const goToPrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="w-full min-h-screen bg-gray-100 mt-10">
      <div className="mx-auto bg-white rounded-2xl shadow-xl p-6">
        {/* Header with Search */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-5 sm:px-6 py-5 sm:py-4 border-b">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
              Manage Visits
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              View and            
            </p>
          </div>

          <div className="mt-3 sm:mt-0 w-full sm:w-1/3">
            <input
              type="text"
              placeholder="Search by name, phone, or visits..."
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
                      <th className="w-[20%] py-4 px-4 font-medium text-gray-700 text-left">Client Name</th>
                      <th className="w-[20%] py-4 px-4 font-medium text-gray-700 text-left">Technician Name</th>
                      <th className="w-[20%] py-4 px-4 font-medium text-gray-700 text-left">Visit Date</th>
                      <th className="w-[20%] py-4 px-4 font-medium text-gray-700 text-left">Visits per Month</th>
                      <th className="w-[20%] py-4 px-4 font-medium text-gray-700 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentUsers.map((user) => (
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

                        {/* Visits per Month */}
                        <td className="py-4 px-4 text-gray-700 text-left truncate">
                          {user.visits_per_month}
                        </td>

                        {/* Expire On */}
                        <td className="py-4 px-4 text-gray-700 truncate">
                          {formatDate(user.validity_upto)}
                        </td>

                        {/* Action */}
                        <td className="py-4 px-4 text-right">
                          <button
                            onClick={handleEdit}
                            className="px-4 py-2 btn-primary"
                          >
                            Edit
                          </button>

                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile View */}
              <div className="block lg:hidden space-y-5">
                {currentUsers.map((user) => (
                  <div
                    key={user.id}
                    className="border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition bg-white"
                  >
                    <div className="flex items-start gap-4 mb-5">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-800 text-lg mb-2">
                          {user.name}
                        </h3>
                      </div>
                    </div>

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
                          Visits per Month
                        </span>
                        <span className="text-sm text-gray-700">
                          {user.visits_per_month}
                        </span>
                      </div>

                      {/* Expire On */}
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                          Expire On
                        </span>
                        <span className="text-sm text-gray-700">
                          {formatDate(user.validity_upto)}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleEdit(user.id)}
                      className="w-full px-4 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
                    >
                      Edit
                    </button>
                  </div>
                ))}
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
};

export default ManageVisits;