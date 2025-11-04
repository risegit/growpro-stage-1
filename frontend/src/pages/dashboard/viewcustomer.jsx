import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";

export default function UserTable() {
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;
  const navigate = useNavigate();

  // 🔹 Fetch data from backend API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}api/customer.php`, {
                method: 'GET',
        });
        const data = await response.json();
        // console.log('user data='+data);
        setAllUsers(data.data);
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
    if (!searchQuery.trim()) return allUsers;
    const query = searchQuery.toLowerCase();
    return allUsers.filter(
      (user) =>
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.role.toLowerCase().includes(query) ||
        user.phone.includes(query)
    );
  }, [allUsers, searchQuery]);

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
    navigate(`/dashboard/customers/editcustomer/${userId}`);
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
              Customer Management
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              View and manage all customer
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
              <p className="text-gray-400 text-sm mt-2">
                Try adjusting your search
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="overflow-x-auto hidden lg:block">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="py-4 px-4 font-medium text-gray-700">Name</th>
                      <th className="py-4 px-4 font-medium text-gray-700">Email</th>
                      <th className="py-4 px-4 font-medium text-gray-700">Role</th>
                      <th className="py-4 px-4 font-medium text-gray-700">Phone</th>
                      <th className="py-4 px-4 font-medium text-gray-700 text-right">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentUsers.map((user) => (
                      <tr
                        key={user._id}
                        className="border-b border-gray-200 hover:bg-gray-50 transition"
                      >
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={
                                user.profile_pic
                                  ? `${import.meta.env.VITE_API_URL}uploads/customers/${user.profile_pic}`
                                  : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                      user.name
                                    )}&background=3b82f6&color=fff`
                              }
                              alt={user.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                            <span className="font-medium text-gray-800">
                              {user.name}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-gray-700"> <a href={`mailto:${user.email}`}>{user.email}</a></td>
                        <td className="py-4 px-4">
                          <span
                            className={`px-3 py-1 rounded-lg text-sm font-medium ${
                              user.role === "Admin"
                                ? "bg-blue-100 text-blue-700"
                                : user.role === "Manager"
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-gray-700"> <a href={`tel:${user.phone}`}>{user.phone}</a></td>
                        <td className="py-4 px-4 text-right">
                          <button
                            onClick={() => handleEdit(user.id)}
                            className="px-4 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors"
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
                    key={user._id}
                    className="border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition bg-white"
                  >
                    <div className="flex items-start gap-4 mb-5">
                      <img
                        src={
                          user.profilePic ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            user.name
                          )}&background=3b82f6&color=fff`
                        }
                        alt={user.name}
                        className="w-14 h-14 rounded-full object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-800 text-lg mb-2">
                          {user.name}
                        </h3>
                        <span
                          className={`inline-block px-3 py-1 rounded-lg text-xs font-medium ${
                            user.role === "Admin"
                              ? "bg-blue-100 text-blue-700"
                              : user.role === "Manager"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {user.role}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-3 mb-5">
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                          Email
                        </span>
                        <span className="text-sm text-gray-700 break-all">
                          {user.email}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                          Mobile
                        </span>
                        <span className="text-sm text-gray-700">{user.mobile}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleEdit(user._id)}
                      className="w-full px-4 py-2.5 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors"
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
                  className={`px-3 py-2 rounded-lg font-medium transition ${
                    currentPage === 1
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
                    className={`px-3 py-2 rounded-lg font-medium transition ${
                      currentPage === index + 1
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
                  className={`px-3 py-2 rounded-lg font-medium transition ${
                    currentPage === totalPages
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


// import React, { useState, useMemo } from 'react';
// import { useNavigate } from "react-router-dom";


// export default function UserTable() {
//   // Sample user data
//   const [allUsers] = useState([
//     { id: 1, name: "John Doe", email: "john.doe@example.com", role: "Admin", mobile: "+91 9876543210", profilePic: "https://ui-avatars.com/api/?name=John+Doe&background=3b82f6&color=fff" },
//     { id: 2, name: "Sarah Smith", email: "sarah.smith@example.com", role: "Manager", mobile: "+91 9876543211", profilePic: "https://ui-avatars.com/api/?name=Sarah+Smith&background=3b82f6&color=fff" },
//     { id: 3, name: "Mike Johnson", email: "mike.johnson@example.com", role: "Technician", mobile: "+91 9876543212", profilePic: "https://ui-avatars.com/api/?name=Mike+Johnson&background=3b82f6&color=fff" },
//     { id: 4, name: "Emily Davis", email: "emily.davis@example.com", role: "Admin", mobile: "+91 9876543213", profilePic: "https://ui-avatars.com/api/?name=Emily+Davis&background=3b82f6&color=fff" },
//     { id: 5, name: "Robert Wilson", email: "robert.wilson@example.com", role: "Technician", mobile: "+91 9876543214", profilePic: "https://ui-avatars.com/api/?name=Robert+Wilson&background=3b82f6&color=fff" },
//     { id: 6, name: "Lisa Anderson", email: "lisa.anderson@example.com", role: "Manager", mobile: "+91 9876543215", profilePic: "https://ui-avatars.com/api/?name=Lisa+Anderson&background=3b82f6&color=fff" },
//     { id: 7, name: "David Brown", email: "david.brown@example.com", role: "Technician", mobile: "+91 9876543216", profilePic: "https://ui-avatars.com/api/?name=David+Brown&background=3b82f6&color=fff" },
//     { id: 8, name: "Jennifer Taylor", email: "jennifer.taylor@example.com", role: "Admin", mobile: "+91 9876543217", profilePic: "https://ui-avatars.com/api/?name=Jennifer+Taylor&background=3b82f6&color=fff" }
//   ]);

//   const [searchQuery, setSearchQuery] = useState('');
//   const [currentPage, setCurrentPage] = useState(1);
//   const usersPerPage = 5;

//   // Filter users based on search query
//   const filteredUsers = useMemo(() => {
//     if (!searchQuery.trim()) return allUsers;
//     const query = searchQuery.toLowerCase();
//     return allUsers.filter(user =>
//       user.name.toLowerCase().includes(query) ||
//       user.email.toLowerCase().includes(query) ||
//       user.role.toLowerCase().includes(query) ||
//       user.mobile.includes(query)
//     );
//   }, [allUsers, searchQuery]);

//   const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
//   const indexOfLastUser = currentPage * usersPerPage;
//   const indexOfFirstUser = indexOfLastUser - usersPerPage;
//   const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

//   const handleSearchChange = (e) => {
//     setSearchQuery(e.target.value);
//     setCurrentPage(1);
//   };

//   const navigate = useNavigate();

//   const handleEdit = () => {
//     navigate("/dashboard/users/edituser");
//   };
//   const goToPage = (page) => setCurrentPage(page);
//   const goToPrevious = () => setCurrentPage(prev => Math.max(prev - 1, 1));
//   const goToNext = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));

//   return (
//     <div className="w-full min-h-screen bg-gray-100 mt-10">
//       <div className="mx-auto bg-white rounded-2xl shadow-xl p-6">

//         {/* Header with Search */}
//         <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-5 sm:px-6 py-5 sm:py-4 border-b">
//           <div>
//             <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Employee Management</h1>
//             <p className="text-sm sm:text-base text-gray-600">View and manage all employees</p>
//           </div>

//           <div className="mt-3 sm:mt-0 w-full sm:w-1/3">
//             <input
//               type="text"
//               placeholder="Search by name, email, role, or mobile..."
//               value={searchQuery}
//               onChange={handleSearchChange}
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
//             />
//           </div>
//         </div>

//         <div className="p-4 sm:p-6">
//           {currentUsers.length === 0 ? (
//             <div className="text-center py-12">
//               <p className="text-gray-500 text-lg">No users found</p>
//               <p className="text-gray-400 text-sm mt-2">Try adjusting your search</p>
//             </div>
//           ) : (
//             <>
//               {/* Desktop Table */}
//               <div className="overflow-x-auto hidden lg:block">
//                 <table className="w-full text-left">
//                   <thead>
//                     <tr className="border-b border-gray-200">
//                       <th className="py-4 px-4 font-medium text-gray-700">Name</th>
//                       <th className="py-4 px-4 font-medium text-gray-700">Email</th>
//                       <th className="py-4 px-4 font-medium text-gray-700">Role</th>
//                       <th className="py-4 px-4 font-medium text-gray-700">Mobile</th>
//                       <th className="py-4 px-4 font-medium text-gray-700 text-right">Action</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {currentUsers.map(user => (
//                       <tr key={user.id} className="border-b border-gray-200 hover:bg-gray-50 transition">
//                         <td className="py-4 px-4">
//                           <div className="flex items-center gap-3">
//                             <img src={user.profilePic} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
//                             <span className="font-medium text-gray-800">{user.name}</span>
//                           </div>
//                         </td>
//                         <td className="py-4 px-4 text-gray-700">{user.email}</td>
//                         <td className="py-4 px-4">
//                           <span className={`px-3 py-1 rounded-lg text-sm font-medium ${user.role === 'Admin' ? 'bg-blue-100 text-blue-700' :
//                               user.role === 'Manager' ? 'bg-green-100 text-green-700' :
//                                 'bg-gray-100 text-gray-700'
//                             }`}>{user.role}</span>
//                         </td>
//                         <td className="py-4 px-4 text-gray-700">{user.mobile}</td>
//                         <td className="py-4 px-4 text-right">
//                           <button
//                             onClick={handleEdit}
//                             className="px-4 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors"
//                           >
//                             Edit
//                           </button>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>

//               {/* Mobile Card View */}
//               <div className="block lg:hidden space-y-5">
//                 {currentUsers.map(user => (
//                   <div key={user.id} className="border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition bg-white">
//                     <div className="flex items-start gap-4 mb-5">
//                       <img src={user.profilePic} alt={user.name} className="w-14 h-14 rounded-full object-cover" />
//                       <div className="flex-1 min-w-0">
//                         <h3 className="font-semibold text-gray-800 text-lg mb-2">{user.name}</h3>
//                         <span className={`inline-block px-3 py-1 rounded-lg text-xs font-medium ${user.role === 'Admin' ? 'bg-blue-100 text-blue-700' :
//                             user.role === 'Manager' ? 'bg-green-100 text-green-700' :
//                               'bg-gray-100 text-gray-700'
//                           }`}>{user.role}</span>
//                       </div>
//                     </div>
//                     <div className="space-y-3 mb-5">
//                       <div className="flex flex-col">
//                         <span className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Email</span>
//                         <span className="text-sm text-gray-700 break-all">{user.email}</span>
//                       </div>
//                       <div className="flex flex-col">
//                         <span className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Mobile</span>
//                         <span className="text-sm text-gray-700">{user.mobile}</span>
//                       </div>
//                     </div>
//                     <button onClick={() => handleEdit(user.id)}
//                       className="w-full px-4 py-2.5 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors">
//                       Edit
//                     </button>
//                   </div>
//                 ))}
//               </div>
//             </>
//           )}
//         </div>

//         {/* Pagination */}
//         {filteredUsers.length > 0 && (
//           <div className="px-5 sm:px-6 py-4 border-t bg-gray-50">
//             <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
//               <p className="text-sm text-gray-600">
//                 Showing {indexOfFirstUser + 1} to {Math.min(indexOfLastUser, filteredUsers.length)} of {filteredUsers.length} users
//               </p>
//               <div className="flex items-center gap-2">
//                 <button onClick={goToPrevious} disabled={currentPage === 1} className={`px-3 py-2 rounded-lg font-medium transition ${currentPage === 1 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
//                   Previous
//                 </button>
//                 {[...Array(totalPages)].map((_, index) => (
//                   <button key={index + 1} onClick={() => goToPage(index + 1)} className={`px-3 py-2 rounded-lg font-medium transition ${currentPage === index + 1 ? 'bg-blue-500 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
//                     {index + 1}
//                   </button>
//                 ))}
//                 <button onClick={goToNext} disabled={currentPage === totalPages} className={`px-3 py-2 rounded-lg font-medium transition ${currentPage === totalPages ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
//                   Next
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
