import React, { useState, useEffect, useMemo } from "react";
import { FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function UserTable() {
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pdfLoaded, setPdfLoaded] = useState(false);
  const usersPerPage = 10;
  const navigate = useNavigate();

  // Mock user data - replace with actual localStorage
  const user = { role: "admin", user_code: "AD0001" };
  const userRole = user?.role;
  const user_code = user?.user_code;

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Load jsPDF library
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    script.async = true;
    script.onload = () => {
      console.log('jsPDF loaded successfully');
      setPdfLoaded(true);
    };
    script.onerror = () => {
      console.error('Failed to load jsPDF');
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Generate PDF Report
const generatePDF = (visitData) => {
  if (!window.jspdf) {
    alert('PDF library is still loading. Please try again in a moment.');
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  // First, add the logo to the top left corner
  // Using relative path from public folder
  const logoPath = '/img/growprologo.jpeg';
  
  // Add logo image (coordinates: x, y, width, height)
  // Using 30x30 size, adjust as needed
  doc.addImage(logoPath, 'JPEG', 15, 10, 30, 30);
  
  // Adjust text position to be centered in the remaining space
  doc.setTextColor(244, 166, 76);
  doc.setFontSize(24);
  doc.setFont(undefined, "bold");
  
  // Calculate center position: logo width + (remaining space / 2)
  // Logo takes 50px (15 offset + 30 width + 5 padding), so center in remaining 160px
  const titleX = 50 + (160 / 2); // Center in the rectangle area
  
  doc.text("Site Visit Report", titleX, 20, { align: "right" });
  
  doc.setFontSize(10);
  doc.setFont(undefined, "normal");
  doc.text(`Report Generated: ${formatDate(new Date().toISOString())}`, titleX, 30, { align: "right" });

  // Add full-width margin/separator line below header
  doc.setDrawColor(102, 187, 106); // Light gray color for separator
  doc.setLineWidth(2);
  doc.line(0, 45, 210, 45); // Full width from x=0 to x=210 (A4 width)

  // Reset text color for body
  doc.setTextColor(0, 0, 0);
  
  let yPos = 65; // Start content 10px below the separator line

  // Visit Information Section
  doc.setFontSize(16);
  doc.setFont(undefined, "bold");
  doc.setTextColor(59, 130, 246); // Blue color for section header
  doc.text("Visit Information", 20, yPos);
  
  yPos += 5;
  doc.setDrawColor(102, 187, 106);
  doc.setLineWidth(0.3);
  doc.line(20, yPos, 190, yPos);
  
  yPos += 10;
  doc.setFontSize(11);

  // Visit Details - Orange color for labels
  const visitDetails = [
    { label: "Visit ID:", value: visitData.site_visit_id },
    { label: "Visit Date:", value: formatDate(visitData.created_date) },
  ];

  visitDetails.forEach(item => {
    doc.setFont(undefined, "bold");
    doc.setTextColor(244, 166, 76); // Orange color for labels
    doc.text(item.label, 25, yPos);
    doc.setFont(undefined, "normal");
    doc.setTextColor(0, 0, 0); // Black color for values
    doc.text(item.value, 70, yPos);
    yPos += 8;
  });

  // Customer Information Section
  yPos += 5;
  doc.setFontSize(16);
  doc.setFont(undefined, "bold");
  doc.setTextColor(59, 130, 246); // Blue color for section header
  doc.text("Customer Information", 20, yPos);
  
  yPos += 5;
  doc.setLineWidth(0.3);
  doc.line(20, yPos, 190, yPos);
  
  yPos += 10;
  doc.setFontSize(11);

  const customerDetails = [
    { label: "Customer Name:", value: visitData.customer_name },
    { label: "Customer ID:", value: visitData.customer_id },
    { label: "Phone Number:", value: visitData.phone },
  ];

  customerDetails.forEach(item => {
    doc.setFont(undefined, "bold");
    doc.setTextColor(244, 166, 76); // Orange color for labels
    doc.text(item.label, 25, yPos);
    doc.setFont(undefined, "normal");
    doc.setTextColor(0, 0, 0); // Black color for values
    doc.text(item.value, 70, yPos);
    yPos += 8;
  });

  // Technician Information Section
  yPos += 5;
  doc.setFontSize(16);
  doc.setFont(undefined, "bold");
  doc.setTextColor(59, 130, 246); // Blue color for section header
  doc.text("Technician Information", 20, yPos);
  
  yPos += 5;
  doc.setLineWidth(0.3);
  doc.line(20, yPos, 190, yPos);
  
  yPos += 10;
  doc.setFontSize(11);

  const technicianDetails = [
    { label: "Technician Name:", value: visitData.technician_name },
    { label: "Technician ID:", value: visitData.technician_id },
    { label: "Visited By Code:", value: visitData.visited_by },
  ];

  technicianDetails.forEach(item => {
    doc.setFont(undefined, "bold");
    doc.setTextColor(244, 166, 76); // Orange color for labels
    doc.text(item.label, 25, yPos);
    doc.setFont(undefined, "normal");
    doc.setTextColor(0, 0, 0); // Black color for values
    doc.text(item.value, 70, yPos);
    yPos += 8;
  });

  // Footer
const pageCount = doc.getNumberOfPages();
for (let i = 1; i <= pageCount; i++) {
  doc.setPage(i);
  
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Footer background with your specified color (160, 199, 99)
 doc.setFillColor(255,255,255); 
  doc.rect(0, pageHeight - 40, pageWidth, 40, 'F');
  
  // Top border line with full width in your specified color (225, 122, 0)
  doc.setDrawColor(225, 122, 0);
  doc.setLineWidth(1.5);
  doc.line(0, pageHeight - 40, pageWidth, pageHeight - 40);
  
  // Contact info
  doc.setFontSize(9);
  
  // Email label in your specified color (225, 122, 0)
  doc.setTextColor(225, 122, 0);
  doc.setFont(undefined, "bold");
  doc.text("Email:", 25, pageHeight - 30);
  
  // Email value in black
  doc.setFontSize(15)
  doc.setTextColor(0, 0, 0);
  doc.setFont(undefined, "normal");
  doc.text("sales@growpro.co.in", 45, pageHeight - 30);
  
  // Phone label in your specified color (225, 122, 0)
  doc.setTextColor(225, 122, 0);
  doc.setFont(undefined, "bold");
  doc.text("Phone:", 25, pageHeight - 20);
  
  // Phone value in black
  doc.setTextColor(0, 0, 0);
  doc.setFont(undefined, "normal");
  doc.text("+91 93218 87125", 45, pageHeight - 20);
  
  // Right aligned copyright and page info
  doc.setFontSize(8);
  doc.setTextColor(80, 80, 80); // Dark gray for better contrast on light green
  
  // Company info
  doc.setFont(undefined, "bold");
  doc.text("GrowPro Solutions", pageWidth - 25, pageHeight - 30, { align: "right" });
  
  doc.setFont(undefined, "normal");
  doc.text("Material Delivery Report", pageWidth - 25, pageHeight - 23, { align: "right" });
  doc.text("Page " + i + " of " + pageCount, pageWidth - 25, pageHeight - 16, { align: "right" });
}

  // Save PDF
  doc.save(`Site_Visit_Report_${visitData.site_visit_id}_${visitData.customer_name.replace(/\s+/g, '_')}.pdf`);
};

  // Fetch data from backend API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Mock data for demonstration - replace with actual API call
        // const mockData = [
        //   {
        //     site_visit_id: "1",
        //     created_date: "2025-12-04",
        //     customer_id: "14",
        //     customer_name: "Mayuresh Warke",
        //     phone: "0976543667",
        //     profile_pic: "",
        //     technician_id: "1",
        //     technician_name: "Dilip Gupta",
        //     visited_by: "AD0001"
        //   },
        //   {
        //     site_visit_id: "2",
        //     created_date: "2025-12-03",
        //     customer_id: "15",
        //     customer_name: "Priya Sharma",
        //     phone: "0987654321",
        //     profile_pic: "",
        //     technician_id: "2",
        //     technician_name: "Rahul Kumar",
        //     visited_by: "AD0002"
        //   },
        //   {
        //     site_visit_id: "3",
        //     created_date: "2025-12-02",
        //     customer_id: "16",
        //     customer_name: "Amit Patel",
        //     phone: "0912345678",
        //     profile_pic: "",
        //     technician_id: "1",
        //     technician_name: "Dilip Gupta",
        //     visited_by: "AD0001"
        //   }
        // ];

        // setAllUsers(mockData);
        
        /* Uncomment for actual API call*/
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}api/site-visit.php?view-visit='viewvisit'&user_code=${user_code}`,
          { method: "GET" }
        );
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

  // Filter users based on search
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return allUsers;
    const query = searchQuery.toLowerCase();
    return allUsers.filter(
      (user) =>
        user.customer_name.toLowerCase().includes(query) ||
        user.phone.includes(query) ||
        user.technician_name.toLowerCase().includes(query) ||
        user.visited_by.toLowerCase().includes(query) ||
        formatDate(user.created_date).toLowerCase().includes(query)
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
    console.log("Edit user:", userId);
    navigate(`/dashboard/sitevisits/editvisit/${userId}`);
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
    <div className="w-full min-h-screen bg-gray-100 p-4">
      <div className="mx-auto bg-white rounded-2xl shadow-xl">
        {/* Header with Search */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-5 sm:px-6 py-5 sm:py-4 border-b">
          <div>
            <h2 className="text-2xl font-bold mb-2 text-gray-800">
              Manage Observation
            </h2>
            <p className="text-sm sm:text-base text-gray-600">
              View and manage Observation
            </p>
          </div>

          <div className="mt-3 sm:mt-0 w-full sm:w-1/3">
            <input
              type="text"
              placeholder="Search by name, visited by..."
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
                      <th className="w-[18%] py-4 px-4 font-medium text-gray-700 text-left">Customer Name</th>
                      <th className="w-[12%] py-4 px-4 font-medium text-gray-700 text-left">Phone</th>
                      <th className="w-[18%] py-4 px-4 font-medium text-gray-700 text-left">Visited By</th>
                      <th className="w-[12%] py-4 px-4 font-medium text-gray-700 text-left">Visit Date</th>
                      <th className="w-[12%] py-4 px-4 font-medium text-gray-700 text-center">PDF Report</th>
                      {userRole !== "technician" && (
                        <th className="w-[10%] py-4 px-4 font-medium text-gray-700 text-right">Action</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {currentUsers.map((user) => {
                      return (
                        <tr
                          key={user.site_visit_id}
                          className="border-b border-gray-200 hover:bg-gray-50 transition"
                        >
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

                          <td className="py-4 px-4 text-gray-700 truncate">
                            <a
                              href={`tel:${user.phone}`}
                              className="text-blue-600 hover:underline"
                            >
                              {user.phone}
                            </a>
                          </td>

                          <td className="py-4 px-4 text-gray-700 truncate">
                            {user.technician_name} ({user.visited_by})
                          </td>

                          <td className="py-4 px-4 text-gray-700 truncate">
                            {formatDate(user.created_date)}
                          </td>

                          <td className="py-4 px-4 text-center">
                            <button
                              onClick={() => generatePDF(user)}
                              disabled={!pdfLoaded}
                              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                                pdfLoaded 
                                  ? 'bg-red-600 text-white hover:bg-red-700' 
                                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              }`}
                              title={pdfLoaded ? "Download PDF Report" : "Loading PDF library..."}
                            >
                              <FileText size={16} />
                              PDF
                            </button>
                          </td>

                          {userRole !== "technician" && (
                            <td className="py-4 px-4 text-right">
                              <button
                                onClick={() => handleEdit(user.site_visit_id)}
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
                  return (
                    <div
                      key={user.site_visit_id}
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
                            {user.customer_name} <br/><small>({user.phone})</small>
                          </h3>
                        </div>
                      </div>

                      <div className="space-y-3 mb-5">
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                            Visited By
                          </span>
                          <span className="text-sm text-gray-700">
                            {user.technician_name} ({user.visited_by})
                          </span>
                        </div>

                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                            Visit Date
                          </span>
                          <span className="text-sm text-gray-700">
                            {formatDate(user.created_date)}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => generatePDF(user)}
                          disabled={!pdfLoaded}
                          className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg transition ${
                            pdfLoaded 
                              ? 'bg-red-600 text-white hover:bg-red-700' 
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          <FileText size={18} />
                          PDF Report
                        </button>
                        
                        {userRole !== "technician" && (
                          <button
                            onClick={() => handleEdit(user.site_visit_id)}
                            className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                          >
                            Edit
                          </button>
                        )}
                      </div>
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