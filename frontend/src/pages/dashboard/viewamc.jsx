import React, { useState, useEffect, useMemo } from "react";
import { FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function UserTable() {
  const [allAMC, setAllAMC] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const usersPerPage = 10;
  const navigate = useNavigate();
  const [pdfLoaded, setPdfLoaded] = useState(false);

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

  /* -------------------------------------------------------
     🔹 HEADER + LOGO
  --------------------------------------------------------*/
  const logoPath = `${import.meta.env.BASE_URL}img/growprologo.jpeg`; 
  doc.addImage(logoPath, 'JPEG', 15, 10, 30, 30);

  const titleX = 50 + (160 / 2);
  doc.setTextColor(244, 166, 76);
  doc.setFontSize(24);
  doc.setFont(undefined,"bold");
  doc.text("AMC Report", titleX, 20, { align: "right" });

  doc.setFontSize(10);
  doc.setFont(undefined,"normal");
  doc.text(`Report Generated: ${formatDate(new Date().toISOString())}`, titleX, 30, { align: "right" });

  // Separator line below header
  doc.setDrawColor(102,187,106);
  doc.setLineWidth(2);
  doc.line(0, 45, 210, 45);

  doc.setTextColor(0,0,0);
  let yPos = 65;


  /* -------------------------------------------------------
     🔹 CUSTOMER INFORMATION (Keep Data, Change Styling)
  --------------------------------------------------------*/
  doc.setFontSize(16);
  doc.setFont(undefined,"bold");
  doc.setTextColor(59,130,246);
  doc.text("Customer Information", 20, yPos);

  yPos += 6;
  doc.setLineWidth(0.3);
  doc.line(20, yPos, 190, yPos);

  yPos += 10;
  doc.setFontSize(11);

  const customerDetails = [
    { label:"Customer Name:", value: visitData.name },
    { label:"Customer ID:", value: visitData.customer_id },
    { label:"Phone Number:", value: visitData.phone },
  ];

  customerDetails.forEach(item=>{
    doc.setFont(undefined,"bold");
    doc.setTextColor(244,166,76);
    doc.text(item.label, 25, yPos);

    doc.setFont(undefined,"normal");
    doc.setTextColor(0,0,0);
    doc.text(item.value || "-", 70, yPos);

    yPos += 8;
  });


  /* -------------------------------------------------------
     🔹 AMC INFORMATION (New UI Applied)
  --------------------------------------------------------*/
  yPos += 5;
  doc.setFontSize(16);
  doc.setFont(undefined,"bold");
  doc.setTextColor(59,130,246);
  doc.text("AMC Information", 20, yPos);

  yPos += 6;
  doc.setLineWidth(0.3);
  doc.line(20, yPos, 190, yPos);

  yPos += 10;
  doc.setFontSize(11);

  const amcDetails = [
    { label:"Validity From:", value: formatDate(visitData.validity_from) },
    { label:"Validity Upto:", value: formatDate(visitData.validity_upto) },
    { label:"Visits per Month:", value: visitData.visits_per_month },
    { label:"This Month Visit Completed:", value: visitData.current_month_visits_done },
    { label:"This Month Remaining Visits Pending:", value: visitData.remaining_visits_current_month },
    { label:"Total Visits Completed:", value: visitData.total_visits_done },
    { label:"Total Allowed Visit:", value: visitData.total_allowed_visits }
  ];

  amcDetails.forEach(item=>{
    doc.setFont(undefined,"bold");
    doc.setTextColor(244,166,76);
    doc.text(item.label, 25, yPos);

    doc.setFont(undefined,"normal");
    doc.setTextColor(0,0,0);
    doc.text(item.value?.toString(), 100, yPos);

    yPos += 8;
  });

  /* -------------------------------------------------------
     🔹 CLOSING REMARKS
  --------------------------------------------------------*/
  // Add closing remarks from your screenshot
  doc.setFontSize(12);
  doc.setFont(undefined, "bold");
  doc.setTextColor(0, 0, 0);
  
  yPos += 10;
  doc.text("Do let us know if you'd like clarity on any of our observations/suggestions.", 20, yPos);

  yPos += 15;
  doc.text("Happy Growing!", 20, yPos);
  
  yPos += 10;
  doc.setFontSize(10);
  doc.setFont(undefined, "normal");
  doc.setTextColor(66, 66, 66);
  
  // Email with clickable link
  if (typeof doc.textWithLink === 'function') {
    doc.textWithLink("Email: sales@growpro.co.in", 20, yPos, {
      url: "mailto:sales@growpro.co.in"
    });
  } else {
    doc.text("Email: sales@growpro.co.in", 20, yPos);
  }
  
  yPos += 6;
  
  // Phone with clickable link
  if (typeof doc.textWithLink === 'function') {
    doc.textWithLink("Phone: 859 175 3001", 20, yPos, {
      url: "tel:+918591753001"
    });
  } else {
    doc.text("Phone: 859 175 3001", 20, yPos);
  }
  
  yPos += 6;
  
  // Company name with website link
  if (typeof doc.textWithLink === 'function') {
    doc.textWithLink("GrowPro Technology", 20, yPos, {
      url: "https://growpro.co.in/"
    });
  } else {
    doc.text("GrowPro Technology", 20, yPos);
  }

  /* -------------------------------------------------------
     🔹 FOOTER
  --------------------------------------------------------*/
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // FOOTER HEIGHT
    const footerHeight = 22;
    const footerY = pageHeight - footerHeight;

    // White background
    doc.setFillColor(255, 255, 255);
    doc.rect(0, footerY, pageWidth, footerHeight, "F");

    // Orange line (slightly lower)
    doc.setDrawColor(225, 122, 0);
    doc.setLineWidth(1.2);
    doc.line(0, footerY + 2, pageWidth, footerY + 2);

    // TEXT Y POSITION (centered)
    const row1Y = footerY + 10;  // Email row
    const row2Y = footerY + 17;  // Phone + Pagination row

    // ------------------------------
    // LEFT SIDE (Email + Phone as clickable links)
    // ------------------------------
    doc.setFontSize(10);

    // Email label
    doc.setTextColor(225, 122, 0);
    doc.setFont(undefined, "bold");
    doc.text("Email:", 20, row1Y);

    // Email as clickable link with mailto
    const emailText = "sales@growpro.co.in";
    const emailX = 40;
    doc.setTextColor(0, 102, 204); // Blue color for link
    
    if (typeof doc.textWithLink === 'function') {
      doc.textWithLink(emailText, emailX, row1Y, {
        url: "mailto:sales@growpro.co.in",
        underline: true
      });
    } else {
      doc.setFont(undefined, "normal");
      doc.text(emailText, emailX, row1Y);
      // Add underline manually
      const emailWidth = doc.getTextWidth(emailText);
      doc.setDrawColor(0, 102, 204);
      doc.setLineWidth(0.2);
      doc.line(emailX, row1Y + 0.5, emailX + emailWidth, row1Y + 0.5);
    }

    // Phone label
    doc.setTextColor(225, 122, 0);
    doc.setFont(undefined, "bold");
    doc.text("Phone:", 20, row2Y);

    // Phone as clickable link with tel:
    const phoneText = "+91 859 175 3001";
    const phoneX = 40;
    const cleanPhoneNumber = "+918591753001"; // Remove spaces for tel: link
    
    doc.setTextColor(0, 102, 204); // Blue color for link
    
    if (typeof doc.textWithLink === 'function') {
      doc.textWithLink(phoneText, phoneX, row2Y, {
        url: `tel:${cleanPhoneNumber}`,
        underline: true
      });
    } else {
      doc.setFont(undefined, "normal");
      doc.text(phoneText, phoneX, row2Y);
      // Add underline manually
      const phoneWidth = doc.getTextWidth(phoneText);
      doc.setDrawColor(0, 102, 204);
      doc.setLineWidth(0.2);
      doc.line(phoneX, row2Y + 0.5, phoneX + phoneWidth, row2Y + 0.5);
    }

    // ------------------------------
    // RIGHT SIDE (Company + Page)
    // ------------------------------
    const rightX = pageWidth - 20;

    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);

    doc.setFont(undefined, "bold");
    doc.text("GrowPro Solutions", rightX, row1Y, { align: "right" });

    doc.setFont(undefined, "normal");
    doc.text(`Page ${i} of ${pageCount}`, rightX, row2Y, { align: "right" });
  }

  /* -------------------------------------------------------
     🔥 FINAL PDF DOWNLOAD
  --------------------------------------------------------*/
  doc.save(`AMC_Report_${visitData.amc_id}_${visitData.name.replace(/\s+/g,'_')}.pdf`);
};


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

  // 🔹 Get AMC Status function
  const getAMCStatus = (validity_upto) => {
    const validityDate = new Date(validity_upto);
    const today = new Date();

    validityDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const diffTime = validityDate - today;
    const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (daysLeft > 10) {
      return "On-going";
    } else if (daysLeft > 0 && daysLeft <= 10) {
      return "Renew Soon";
    } else {
      return "Expired";
    }
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
                        className="w-[12%] py-4 px-4 font-medium text-gray-700 text-left cursor-pointer hover:bg-gray-50 transition"
                        onClick={() => handleSort('visits_per_month')}
                      >
                        <div className="flex items-center">
                          Visits per Month
                          <SortArrow columnKey="visits_per_month" />
                        </div>
                      </th>
                      <th
                        className="w-[16%] py-4 px-4 font-medium text-gray-700 text-left cursor-pointer hover:bg-gray-50 transition"
                        onClick={() => handleSort('remaining_visits_current_month')}
                      >
                        <div className="flex items-center">
                          Visit Pending For This Month
                          <SortArrow columnKey="remaining_visits_current_month" />
                        </div>
                      </th>
                      {/* Show Days Left column only for admin */}
                      {isAdmin && (
                        <th
                          className="w-[11%] py-4 px-4 font-medium text-gray-700 text-left cursor-pointer hover:bg-gray-50 transition"
                          onClick={() => handleSort('validity_upto')}
                        >
                          <div className="flex items-center">
                            Days Left
                            <SortArrow columnKey="validity_upto" />
                          </div>
                        </th>
                      )}
                      <th className="w-[10%] py-4 px-4 font-medium text-gray-700 text-left">
                        AMC Status
                      </th>
                      <th className="w-[9%] py-4 px-4 font-medium text-gray-700 text-left">
                        Report
                      </th>
                      <th className="w-[5%] py-4 px-4 font-medium text-gray-700 text-left">
                        Status
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
                            {user.remaining_visits_current_month}
                          </td>

                          {/* Days Left - Only show for admin */}
                          {isAdmin && (
                            <td className="py-4 px-4 text-gray-700 truncate">
                              <p>
                                {daysLeft} Days
                              </p>
                              <em
                                className={`small-text py-1 rounded 
                                  ${status === "On-going" ? " text-green-400" : ""}
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
                                ${status === "On-going" ? "bg-green-400 text-white" : ""}
                                ${status === "Renew Soon" ? "bg-red-300 text-white" : ""}
                                ${status === "Expired" ? "bg-red-600 text-white" : ""}
                              `}
                            >
                              {status}
                            </span>
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

                          <td className="py-4 px-4">
                            <span
                              className={`px-3 py-1 rounded-2xl text-sm font-medium ${user.status === "active"
                                  ? "bg-green-600 text-white"
                                  : "bg-red-600 text-white"
                                }`}
                            >
                              {user.status || "Active"}
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
                  const amcType = user.amc_free_paid || "Paid";

                  return (
                    <div
                      key={user.id}
                      className="border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition bg-white"
                    >
                      {/* Name with AMC Type */}
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="font-semibold text-gray-800 text-lg">
                          {user.name}
                        </h3>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          amcType.toLowerCase() === 'free' 
                            ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                            : 'bg-green-100 text-green-800 border border-green-200'
                        }`}>
                          {amcType}
                        </span>
                      </div>

                      <div className="space-y-4 mb-5">
                        {/* Phone */}
                        <div className="flex justify-between items-center border-b pb-3">
                          <span className="text-sm font-medium text-gray-600">
                            Contact
                          </span>
                          <a
                            href={`tel:${user.phone}`}
                            className="text-sm text-blue-600 hover:underline font-medium"
                          >
                            {user.phone}
                          </a>
                        </div>

                        {/* Visits per Month */}
                        <div className="flex justify-between items-center border-b pb-3">
                          <span className="text-sm font-medium text-gray-600">
                            Visits per Month
                          </span>
                          <span className="text-sm text-gray-800 font-medium">
                            {user.visits_per_month}
                          </span>
                        </div>

                        {/* Pending Visits */}
                        <div className="flex justify-between items-center border-b pb-3">
                          <span className="text-sm font-medium text-gray-600">
                            Visit Pending This Month
                          </span>
                          <span className="text-sm text-gray-800 font-medium">
                            {user.remaining_visits_current_month}
                          </span>
                        </div>

                        {/* Days Left - Only show for admin */}
                        {isAdmin && (
                          <div className="flex justify-between items-center border-b pb-3">
                            <span className="text-sm font-medium text-gray-600">
                              Days Left
                            </span>
                            <div className="flex flex-col items-end">
                              <span className="text-sm text-gray-800 font-medium">
                                {daysLeft} Days
                              </span>
                              <span className="text-xs text-gray-500 mt-1">
                                ({formatDate(user.validity_upto)})
                              </span>
                            </div>
                          </div>
                        )}

                        {/* AMC Status */}
                        <div className="flex justify-between items-center border-b pb-3">
                          <span className="text-sm font-medium text-gray-600">
                            AMC Status
                          </span>
                          <span
                            className={`px-3 py-1 rounded-lg text-xs font-bold w-fit min-w-[100px] text-center
                              ${status === "On-going" ? "bg-green-100 text-green-800 border border-green-200" : ""}
                              ${status === "Renew Soon" ? "bg-yellow-100 text-yellow-800 border border-yellow-200" : ""}
                              ${status === "Expired" ? "bg-red-100 text-red-800 border border-red-200" : ""}
                            `}
                          >
                            {status}
                          </span>
                        </div>

                        {/* Report Button */}
                        <div className="flex justify-between items-center border-b pb-3">
                          <span className="text-sm font-medium text-gray-600">
                            Report
                          </span>
                          <button
                            onClick={() => generatePDF(user)}
                            disabled={!pdfLoaded}
                            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs transition ${
                              pdfLoaded 
                                ? 'bg-red-600 text-white hover:bg-red-700' 
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                            title={pdfLoaded ? "Download PDF Report" : "Loading PDF library..."}
                          >
                            <FileText size={12} />
                            PDF
                          </button>
                        </div>

                        {/* User Status */}
                        <div className="flex justify-between items-center border-b pb-3">
                          <span className="text-sm font-medium text-gray-600">
                            Status
                          </span>
                          <span
                            className={`px-3 py-1 rounded-2xl text-xs font-medium ${
                              user.status === "active"
                                ? "bg-green-100 text-green-800 border border-green-200"
                                : "bg-red-100 text-red-800 border border-red-200"
                            }`}
                          >
                            {user.status || "Active"}     
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons - Only show if not technician */}
                      {userRole !== "technician" && (
                        <div className="flex gap-3 mt-6">
                          <button
                            onClick={() => handleEdit(user.amc_id)}
                            className="flex-1 px-4 py-2.5 btn-primary"
                          >
                            Edit
                          </button>
                        </div>
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