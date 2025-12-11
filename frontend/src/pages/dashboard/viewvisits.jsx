import React, { useState, useEffect, useMemo } from "react";
import { FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function UserTable() {
  const [allUsers, setAllUsers] = useState([]);
  const [allFullData, setAllFullData] = useState([]);
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
// Generate PDF Report
const generatePDF = async (visitData, fullApiData) => {
  if (!window.jspdf) {
    toast.error("PDF library still loading — try again in a moment.");
    return;
  }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;
  const contentWidth = pageWidth - margin * 2;

  let y = 100; // Starting Y position after header
  const lineHeight = 16;
  const sectionSpacing = 25;

  // Helper: Add new page if needed
  const ensureSpace = (needed = 30) => {
    if (y + needed > pageHeight - 100) {
      doc.addPage();
      y = 60;
    }
  };

  // Helper: Draw section header with colored background
  const drawSectionHeader = (title) => {
    ensureSpace(40);
    
    // Colored background
    doc.setFillColor(59, 130, 246);
    doc.roundedRect(margin, y, contentWidth, 30, 3, 3, 'F');
    
    // White text
    doc.setFontSize(12);
    doc.setFont(undefined, "bold");
    doc.setTextColor(255, 255, 255);
    doc.text(title, margin + 15, y + 19);
    
    y += 40;
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, "normal");
    doc.setFontSize(11);
  };

  // Helper: Draw key-value pairs in two columns
  const drawKeyValuePairs = (data) => {
    const columnWidth = contentWidth / 2;
    const labelWidth = 120;
    const valueWidth = columnWidth - labelWidth - 20;
    
    ensureSpace(lineHeight * Math.ceil(data.length / 2) + 10);
    
    data.forEach((item, index) => {
      const column = index % 2;
      const row = Math.floor(index / 2);
      const x = margin + (column * columnWidth);
      const currentY = y + (row * lineHeight * 1.5);
      
      // Label (bold)
      doc.setFont(undefined, "bold");
      doc.setFontSize(11);
      doc.text(`${item.label}:`, x, currentY);
      
      // Value (normal)
      doc.setFont(undefined, "normal");
      const value = item.value !== undefined && item.value !== null ? String(item.value) : "-";
      const wrappedValue = doc.splitTextToSize(value, valueWidth);
      doc.text(wrappedValue, x + labelWidth, currentY);
    });
    
    y += (Math.ceil(data.length / 2) * lineHeight * 1.5) + 10;
  };

  // Helper: Draw table with borders
  const drawTable = (items = [], columns = [], title = "") => {
    if (title) {
      ensureSpace(30);
      doc.setFontSize(11);
      doc.setFont(undefined, "bold");
      doc.text(title, margin, y);
      y += 20;
    }

    if (!Array.isArray(items) || items.length === 0) {
      ensureSpace(lineHeight);
      doc.setFont(undefined, "normal");
      doc.text("No data available", margin, y);
      y += lineHeight + 10;
      return;
    }

    // Calculate column widths
    const colCount = columns.length;
    const colWidth = contentWidth / colCount;
    
    // Table header with background
    ensureSpace(lineHeight * 3);
    
    // Header background
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, y, contentWidth, lineHeight * 1.8, 'F');
    
    // Header text
    doc.setFont(undefined, "bold");
    doc.setFontSize(11);
    doc.setTextColor(59, 130, 246);
    
    let x = margin;
    columns.forEach((col) => {
      doc.text(col.header || col.key, x + 8, y + lineHeight);
      x += colWidth;
    });
    
    y += lineHeight * 1.8;
    
    // Draw header bottom border
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(margin, y, margin + contentWidth, y);
    
    // Table rows
    doc.setFont(undefined, "normal");
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    
    items.forEach((item, rowIndex) => {
      ensureSpace(lineHeight * 2);
      
      // Alternate row background
      if (rowIndex % 2 === 1) {
        doc.setFillColor(250, 250, 250);
        doc.rect(margin, y, contentWidth, lineHeight * 1.5, 'F');
      }
      
      let rx = margin;
      columns.forEach((col) => {
        const raw = item[col.key];
        const value = col.valueGetter ? 
          col.valueGetter(item) : 
          (raw === undefined || raw === null ? "-" : String(raw));
        
        const wrapped = doc.splitTextToSize(value, colWidth - 12);
        doc.text(wrapped, rx + 8, y + lineHeight);
        rx += colWidth;
      });
      
      // Row bottom border
      doc.setDrawColor(240, 240, 240);
      doc.line(margin, y + lineHeight * 1.5, margin + contentWidth, y + lineHeight * 1.5);
      
      y += lineHeight * 1.5;
    });
    
    y += 15;
  };

  // ========== HEADER ==========
  // Logo - try to fetch
  try {
    const logoPath = `${import.meta.env.BASE_URL || ""}img/growprologo.jpeg`;
    const resp = await fetch(logoPath, { cache: "no-store" });
    if (resp.ok) {
      const blob = await resp.blob();
      const dataUrl = await new Promise((res) => {
        const reader = new FileReader();
        reader.onloadend = () => res(reader.result);
        reader.readAsDataURL(blob);
      });
      try {
        doc.addImage(dataUrl, "JPEG", margin, 20, 60, 60);
      } catch (err) {
        console.warn("Could not add logo:", err);
      }
    }
  } catch (err) {
    console.warn("Logo load failed:", err);
  }

  // Header text
  doc.setFontSize(24);
  doc.setFont(undefined, "bold");
  doc.setTextColor(59, 130, 246);
  doc.text("Site Visit Report", margin + 70, 50);
  
  doc.setFontSize(10);
  doc.setFont(undefined, "normal");
  doc.setTextColor(100, 100, 100);
  doc.text(`Report Generated: ${new Date().toLocaleDateString('en-GB', { 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })}`, margin + 70, 70);

  // Header separator line
  doc.setDrawColor(59, 130, 246);
  doc.setLineWidth(1);
  doc.line(margin, 85, pageWidth - margin, 85);

  // ========== VISIT INFORMATION ==========
  drawSectionHeader("Visit Information");
  drawKeyValuePairs([
    { label: "Visit ID", value: visitData.site_visit_id || visitData.visit_id || "-" },
    { label: "Visit Date", value: visitData.created_date || visitData.created_at || "-" },
  ]);

  // ========== CUSTOMER INFORMATION ==========
  drawSectionHeader("Customer Information");
  drawKeyValuePairs([
    { label: "Customer Name", value: visitData.customer_name || visitData.name || "-" },
    { label: "Customer ID", value: visitData.customer_id || "-" },
    { label: "Phone Number", value: visitData.phone || "-" },
  ]);

  // ========== TECHNICIAN INFORMATION ==========
  drawSectionHeader("Technician Information");
  drawKeyValuePairs([
    { label: "Technician Name", value: visitData.technician_name || visitData.tech_name || "-" },
    { label: "Technician ID", value: visitData.technician_id || "-" },
    { label: "Visited By Code", value: visitData.visited_by || "-" },
  ]);

  // ========== SITE VISIT DETAILS ==========
  drawSectionHeader("Site Visit Details");
  const siteVisitList = Array.isArray(fullApiData.site_visit) ? 
    fullApiData.site_visit.filter(sv => 
      String(sv.id || sv.visit_id || sv.site_visit_id) === 
      String(visitData.site_visit_id || visitData.visit_id || visitData.id)
    ) : [];
  
  if (siteVisitList.length > 0) {
    siteVisitList.forEach(sv => {
      drawKeyValuePairs([
        { label: "Schedule ID", value: sv.schedule_id || "-" },
        { label: "Plants Getting Water", value: sv.are_plants_getting_water || "-" },
        { label: "Water Above Pump", value: sv.water_above_pump || "-" },
        { label: "Timer Working", value: sv.timer_working || "-" },
        { label: "Motor Working", value: sv.motor_working || "-" },
      ]);
    });
  } else {
    ensureSpace(lineHeight);
    doc.text("No site visit details available", margin, y);
    y += lineHeight;
  }

  // ========== PLANT PROBLEMS ==========
  drawSectionHeader("Plant Problems");
  const plantProblems = Array.isArray(fullApiData.plantProblems) ? 
    fullApiData.plantProblems.filter(p => 
      String(p.visit_id || p.site_visit_id) === 
      String(visitData.site_visit_id || visitData.visit_id || visitData.id)
    ) : [];
  
  if (plantProblems.length > 0) {
    drawTable(
      plantProblems.map(p => ({
        problem: p.problem_name === "Others" ? (p.other_problem_name || "Others") : p.problem_name,
        details: p.details || "-"
      })),
      [
        { key: "problem", header: "Problem Name" },
        { key: "details", header: "Details" }
      ]
    );
  } else {
    ensureSpace(lineHeight);
    doc.text("No plant problems recorded", margin, y);
    y += lineHeight;
  }

  // ========== PEST TYPES ==========
  drawSectionHeader("Pest Types");
  const pestTypes = Array.isArray(fullApiData.pestTypes) ? 
    fullApiData.pestTypes.filter(p => 
      String(p.visit_id || p.site_visit_id) === 
      String(visitData.site_visit_id || visitData.visit_id || visitData.id)
    ) : [];
  
  if (pestTypes.length > 0) {
    drawTable(
      pestTypes.map(p => ({
        pest: p.pest_name === "Others" ? (p.other_pest_name || "Others") : p.pest_name,
        treatment: p.treatment || "-"
      })),
      [
        { key: "pest", header: "Pest Name" },
        { key: "treatment", header: "Treatment" }
      ]
    );
  } else {
    ensureSpace(lineHeight);
    doc.text("No pests recorded", margin, y);
    y += lineHeight;
  }

  // ========== SUPPLIED PLANTS ==========
  drawSectionHeader("Plants Supplied");
  const suppliedPlants = Array.isArray(fullApiData.suppliedPlants) ? 
    fullApiData.suppliedPlants.filter(p => 
      String(p.visit_id) === String(visitData.site_visit_id || visitData.visit_id || visitData.id)
    ) : [];
  
  drawTable(suppliedPlants, [
    { 
      key: "plant_name", 
      header: "Plant Name",
      valueGetter: (it) => it.plant_name === "Others" ? (it.other_plant_name || "Others") : (it.plant_name || "-")
    },
    { key: "quantity", header: "Quantity" },
    { key: "notes", header: "Notes" }
  ]);

  // ========== NEEDED PLANTS ==========
  drawSectionHeader("Plants Needed");
  const needPlants = Array.isArray(fullApiData.needPlants) ? 
    fullApiData.needPlants.filter(p => 
      String(p.visit_id) === String(visitData.site_visit_id || visitData.visit_id || visitData.id)
    ) : [];
  
  drawTable(needPlants, [
    { 
      key: "plant_name", 
      header: "Plant Name",
      valueGetter: (it) => it.plant_name === "Others" ? (it.other_plant_name || "Others") : (it.plant_name || "-")
    },
    { key: "quantity", header: "Quantity" },
    { key: "priority", header: "Priority" }
  ]);

  // ========== SUPPLIED NUTRIENTS ==========
  drawSectionHeader("Nutrients Supplied");
  const suppliedNutrients = Array.isArray(fullApiData.suppliedNutrients) ? 
    fullApiData.suppliedNutrients.filter(n => 
      String(n.visit_id) === String(visitData.site_visit_id || visitData.visit_id || visitData.id)
    ) : [];
  
  drawTable(suppliedNutrients, [
    { 
      key: "nutrient_type", 
      header: "Type",
      valueGetter: (it) => it.nutrient_type === "Others" ? (it.other_nutrient_name || "Others") : (it.nutrient_type || "-")
    },
    { key: "tank_capacity", header: "Tank Capacity" },
    { key: "topups", header: "Topups" },
    { key: "amount_used", header: "Amount Used" }
  ]);

  // ========== NEEDED NUTRIENTS ==========
  drawSectionHeader("Nutrients Needed");
  const needNutrients = Array.isArray(fullApiData.needNutrients) ? 
    fullApiData.needNutrients.filter(n => 
      String(n.visit_id) === String(visitData.site_visit_id || visitData.visit_id || visitData.id)
    ) : [];
  
  drawTable(needNutrients, [
    { 
      key: "nutrient_type", 
      header: "Type",
      valueGetter: (it) => it.nutrient_type === "Others" ? (it.other_nutrient_name || "Others") : (it.nutrient_type || "-")
    },
    { key: "tank_capacity", header: "Tank Capacity" },
    { key: "topups", header: "Topups" },
    { key: "urgency", header: "Urgency" }
  ]);

  // ========== CHARGEABLE ITEMS ==========
  drawSectionHeader("Chargeable Items");
  
  const suppliedChargeable = Array.isArray(fullApiData.suppliedChargeableItem) ? 
    fullApiData.suppliedChargeableItem.filter(i => 
      String(i.visit_id) === String(visitData.site_visit_id || visitData.visit_id || visitData.id)
    ) : [];
  
  const needChargeable = Array.isArray(fullApiData.needChargeableItem) ? 
    fullApiData.needChargeableItem.filter(i => 
      String(i.visit_id) === String(visitData.site_visit_id || visitData.visit_id || visitData.id)
    ) : [];
  
  if (suppliedChargeable.length > 0) {
    drawTable(suppliedChargeable, [
      { 
        key: "item_name", 
        header: "Supplied Items",
        valueGetter: (it) => it.item_name === "Others" ? (it.other_item_name || "Others") : (it.item_name || "-")
      },
      { key: "quantity", header: "Qty" },
      { key: "unit_price", header: "Unit Price" },
      { key: "total", header: "Total", valueGetter: (it) => {
        const qty = parseFloat(it.quantity) || 0;
        const price = parseFloat(it.unit_price) || 0;
        return (qty * price).toFixed(2);
      }}
    ], "Supplied Items");
  }
  
  if (needChargeable.length > 0) {
    drawTable(needChargeable, [
      { 
        key: "item_name", 
        header: "Needed Items",
        valueGetter: (it) => it.item_name === "Others" ? (it.other_item_name || "Others") : (it.item_name || "-")
      },
      { key: "quantity", header: "Qty" },
      { key: "estimated_price", header: "Est. Price" }
    ], "Items Needed");
  }
  
  if (suppliedChargeable.length === 0 && needChargeable.length === 0) {
    ensureSpace(lineHeight);
    doc.text("No chargeable items recorded", margin, y);
    y += lineHeight;
  }

  // ========== PHOTOS ==========
  drawSectionHeader("Setup Photos");
  const photos = Array.isArray(fullApiData.suppliedPhotoSetup) ? 
    fullApiData.suppliedPhotoSetup.filter(p => 
      String(p.visit_id) === String(visitData.site_visit_id || visitData.visit_id || visitData.id)
    ) : [];
  
  if (photos.length > 0) {
    drawTable(
      photos.map((p, idx) => ({
        no: idx + 1,
        filename: p.image_url || p.preview || "photo.jpg",
        timestamp: p.created_at || new Date().toLocaleDateString()
      })),
      [
        { key: "no", header: "No." },
        { key: "filename", header: "File Name" },
        { key: "timestamp", header: "Date Taken" }
      ]
    );
  } else {
    ensureSpace(lineHeight);
    doc.text("No setup photos available", margin, y);
    y += lineHeight;
  }

  // ========== FOOTER ==========
  ensureSpace(80);
  
  // Footer separator
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.line(margin, pageHeight - 100, pageWidth - margin, pageHeight - 100);
  
  // Footer text
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.setFont(undefined, "normal");
  
  // Company info
  doc.text("GrowPro Solutions", margin, pageHeight - 80);
  doc.text("sales@growpro.co.in", margin, pageHeight - 65);
  doc.text("+91 93218 87125", margin, pageHeight - 50);
  
  // Page number
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 30, { align: "right" });
  }

  // ========== SAVE PDF ==========
  const safeName = (visitData.customer_name || "site_visit")
    .replace(/\s+/g, "_")
    .replace(/[^\w-_]/g, "");
  
  doc.save(`Site_Visit_Report_${visitData.site_visit_id || visitData.visit_id || "visit"}_${safeName}.pdf`);
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
        console.log("API Response:", data);
        setAllUsers(data.data);
        // FULL DATA FOR PDF, DETAILS PAGE ETC.
        setAllFullData({
          site_visit: data.site_visit || [],
          needPlants: data.needPlants || [],
          suppliedPlants: data.suppliedPlants || [],
          needNutrients: data.needNutrients || [],
          suppliedNutrients: data.suppliedNutrients || [],
          needChargeableItem: data.needChargeableItem || [],
          suppliedChargeableItem: data.suppliedChargeableItem || [],
          pestTypes: data.pestTypes || [],
          plantProblems: data.plantProblems || [],
          suppliedPhotoSetup: data.suppliedPhotoSetup || []
        });
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
                              onClick={() => generatePDF(user, allFullData)}
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
                          onClick={() => generatePDF(user, allFullData)}
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