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

  const [apiData, setApiData] = useState({
    site_visit: [],
    plantProblems: [],
    pestTypes: [],
    needChargeableItem: [],
    needNutrients: [],
    needPlants: [],
    suppliedChargeableItem: [],
    suppliedNutrients: [],
    suppliedPhotoSetup: [],
    suppliedPlants: [],
  });

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

  // Debug: Log the visitData and apiData to see the structure
  console.log("visitData:", visitData);
  console.log("apiData:", apiData);

  // Get all related data for this specific site visit
  // First, let's find the correct identifier
  const siteVisitId = visitData.site_visit_id || visitData.id;
  const scheduleId = visitData.schedule_id;
  
  console.log("Looking for data with:", {
    siteVisitId,
    scheduleId,
    visitDataId: visitData.id
  });

  // Try different ways to find the site visit details
  const siteVisitDetails = apiData.site_visit.find(
    sv => 
      sv.id === siteVisitId || 
      sv.schedule_id === scheduleId ||
      sv.id === visitData.id
  );
  
  console.log("Found siteVisitDetails:", siteVisitDetails);

  // Now let's see what identifiers the other arrays use
  console.log("First plantProblem:", apiData.plantProblems[0]);
  console.log("First pestType:", apiData.pestTypes[0]);
  console.log("First needPlant:", apiData.needPlants[0]);

  // Try different field names for filtering
  const relatedPlantProblems = apiData.plantProblems.filter(
    problem => 
      problem.site_visit_id === siteVisitId ||
      problem.visit_id === siteVisitId ||
      problem.id === siteVisitId ||
      (scheduleId && problem.schedule_id === scheduleId)
  );
  
  const relatedPestTypes = apiData.pestTypes.filter(
    pest => 
      pest.site_visit_id === siteVisitId ||
      pest.visit_id === siteVisitId ||
      pest.id === siteVisitId ||
      (scheduleId && pest.schedule_id === scheduleId)
  );
  
  const relatedNeedPlants = apiData.needPlants.filter(
    plant => 
      plant.site_visit_id === siteVisitId ||
      plant.visit_id === siteVisitId ||
      plant.id === siteVisitId ||
      (scheduleId && plant.schedule_id === scheduleId)
  );
  
  const relatedSuppliedPlants = apiData.suppliedPlants.filter(
    plant => 
      plant.site_visit_id === siteVisitId ||
      plant.visit_id === siteVisitId ||
      plant.id === siteVisitId ||
      (scheduleId && plant.schedule_id === scheduleId)
  );
  
  const relatedNeedNutrients = apiData.needNutrients.filter(
    nutrient => 
      nutrient.site_visit_id === siteVisitId ||
      nutrient.visit_id === siteVisitId ||
      nutrient.id === siteVisitId ||
      (scheduleId && nutrient.schedule_id === scheduleId)
  );
  
  const relatedSuppliedNutrients = apiData.suppliedNutrients.filter(
    nutrient => 
      nutrient.site_visit_id === siteVisitId ||
      nutrient.visit_id === siteVisitId ||
      nutrient.id === siteVisitId ||
      (scheduleId && nutrient.schedule_id === scheduleId)
  );
  
  const relatedNeedChargeableItems = apiData.needChargeableItem.filter(
    item => 
      item.site_visit_id === siteVisitId ||
      item.visit_id === siteVisitId ||
      item.id === siteVisitId ||
      (scheduleId && item.schedule_id === scheduleId)
  );
  
  const relatedSuppliedChargeableItems = apiData.suppliedChargeableItem.filter(
    item => 
      item.site_visit_id === siteVisitId ||
      item.visit_id === siteVisitId ||
      item.id === siteVisitId ||
      (scheduleId && item.schedule_id === scheduleId)
  );
  
  const relatedSuppliedPhotoSetup = apiData.suppliedPhotoSetup.filter(
    photo => 
      photo.site_visit_id === siteVisitId ||
      photo.visit_id === siteVisitId ||
      photo.id === siteVisitId ||
      (scheduleId && photo.schedule_id === scheduleId)
  );

  console.log("Filtered results:", {
    relatedPlantProblems,
    relatedPestTypes,
    relatedNeedPlants,
    relatedSuppliedPlants,
    relatedNeedNutrients,
    relatedSuppliedNutrients,
    relatedNeedChargeableItems,
    relatedSuppliedChargeableItems,
    relatedSuppliedPhotoSetup
  });

  // Alternative approach: If all arrays are empty, let's check if we should use index-based matching
  // This might be the case if the API returns data in the same order for all arrays
  if (relatedPlantProblems.length === 0 && 
      relatedPestTypes.length === 0 && 
      apiData.plantProblems.length > 0) {
    
    // Try to match by index if arrays are in same order
    const visitIndex = apiData.site_visit.findIndex(sv => 
      sv.id === siteVisitId || sv.schedule_id === scheduleId
    );
    
    if (visitIndex !== -1) {
      console.log(`Trying index-based matching at index ${visitIndex}`);
      
      // Get data by index (if arrays are parallel)
      const plantProblem = apiData.plantProblems[visitIndex];
      const pestType = apiData.pestTypes[visitIndex];
      const needPlant = apiData.needPlants[visitIndex];
      const suppliedPlant = apiData.suppliedPlants[visitIndex];
      
      if (plantProblem) relatedPlantProblems.push(plantProblem);
      if (pestType) relatedPestTypes.push(pestType);
      if (needPlant) relatedNeedPlants.push(needPlant);
      if (suppliedPlant) relatedSuppliedPlants.push(suppliedPlant);
      
      console.log("Index-based results:", {
        plantProblem,
        pestType,
        needPlant,
        suppliedPlant
      });
    }
  }

  // Let's also try to display all data without filtering for debugging
  console.log("ALL plantProblems (unfiltered):", apiData.plantProblems);
  console.log("ALL pestTypes (unfiltered):", apiData.pestTypes);
  console.log("ALL needPlants (unfiltered):", apiData.needPlants);
  console.log("ALL suppliedPlants (unfiltered):", apiData.suppliedPlants);

  // Continue with PDF creation...
  // Header
  doc.setFillColor(159, 200, 98);
  doc.rect(0, 0, 210, 40, "F");
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont(undefined, "bold");
  doc.text("Site Visit Report", 105, 20, { align: "center" });
  
  doc.setFontSize(10);
  doc.setFont(undefined, "normal");
  doc.text(`Report Generated: ${formatDate(new Date().toISOString())}`, 105, 30, { align: "center" });

  doc.setTextColor(0, 0, 0);
  
  let yPos = 55;

  // Visit Information Section
  doc.setFontSize(16);
  doc.setFont(undefined, "bold");
  doc.setTextColor(59, 130, 246);
  doc.text("Visit Information", 20, yPos);
  
  yPos += 10;
  doc.setDrawColor(59, 130, 246);
  doc.setLineWidth(0.5);
  doc.line(20, yPos, 190, yPos);
  
  yPos += 10;
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  
  // Visit Details
  const visitDetails = [
    { label: "Site Visit ID:", value: siteVisitId || "N/A" },
    { label: "Schedule ID:", value: scheduleId || siteVisitDetails?.schedule_id || "N/A" },
    { label: "Customer Name:", value: visitData.customer_name },
    { label: "Customer ID:", value: visitData.customer_id },
    { label: "Phone:", value: visitData.phone },
    { label: "Technician:", value: `${visitData.technician_name} (${visitData.visited_by})` },
    { label: "Visit Date:", value: formatDate(visitData.created_date) },
  ];

  if (siteVisitDetails) {
    visitDetails.push(
      { label: "Plants getting water?", value: siteVisitDetails.are_plants_getting_water || "N/A" },
      { label: "Water above pump?", value: siteVisitDetails.water_above_pump || "N/A" },
      { label: "Timer working?", value: siteVisitDetails.timer_working || "N/A" },
      { label: "Motor working?", value: siteVisitDetails.motor_working || "N/A" },
      { label: "Lights Working?", value: siteVisitDetails.light_working || "N/A" },
      { label: "Equipment Damaged?", value: siteVisitDetails.equipment_damaged || "N/A" },
      { label: "Any leaks?", value: siteVisitDetails.any_leaks || "N/A" },
      { label: "Clean Environment?", value: siteVisitDetails.clean_equipment || "N/A" },
      { label: "Electric Connections Secured?", value: siteVisitDetails.electric_connections_secured || "N/A" },
      { label: "Equipment Damaged:", value: siteVisitDetails.equipment_damaged || "N/A" }
    );
  }

  visitDetails.forEach(item => {
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFont(undefined, "bold");
    doc.text(item.label, 25, yPos);
    doc.setFont(undefined, "normal");
    
    // Handle long text by splitting it
    const text = String(item.value || "");
    if (text.length > 50) {
      const lines = doc.splitTextToSize(text, 100);
      doc.text(lines, 90, yPos);
      yPos += (lines.length * 8);
    } else {
      doc.text(text, 70, yPos);
      yPos += 8;
    }
  });

  // Helper function to add section with items
  const addSection = (title, items, getItemText) => {
    if (items.length > 0) {
      yPos += 5;
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setFontSize(16);
      doc.setFont(undefined, "bold");
      doc.setTextColor(59, 130, 246);
      doc.text(title, 20, yPos);
      
      yPos += 10;
      doc.setLineWidth(0.5);
      doc.line(20, yPos, 190, yPos);
      
      yPos += 10;
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);

      items.forEach(item => {
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }
        
        const itemText = getItemText(item);
        const lines = doc.splitTextToSize(itemText, 150);
        doc.text(lines, 25, yPos);
        yPos += (lines.length * 8) + 2;
      });
    }
  };

  // Add all sections
  addSection("Plant Problems", relatedPlantProblems, (item) => {
    return `• ${item.problem_type || item.name || item.type || "Problem"}: ${item.remark || item.description || item.comment || "No details"}`;
  });

  addSection("Pest Types", relatedPestTypes, (item) => {
    return `• ${item.pest_type || item.name || item.type || "Pest"}`;
  });

  addSection("Plants Needed", relatedNeedPlants, (item) => {
    return `• ${item.plant_name || item.name || "Plant"} (Quantity: ${item.quantity || 1}) - ${item.remark || item.description || ""}`;
  });

  addSection("Plants Supplied", relatedSuppliedPlants, (item) => {
    return `• ${item.plant_name || item.name || "Plant"} (Quantity: ${item.quantity || 1})`;
  });

  addSection("Nutrients Needed", relatedNeedNutrients, (item) => {
    return `• ${item.nutrient_name || item.name || "Nutrient"} (Quantity: ${item.quantity || 1}) - ${item.remark || ""}`;
  });

  addSection("Nutrients Supplied", relatedSuppliedNutrients, (item) => {
    return `• ${item.nutrient_name || item.name || "Nutrient"} (Quantity: ${item.quantity || 1})`;
  });

  addSection("Chargeable Items Needed", relatedNeedChargeableItems, (item) => {
    return `• ${item.item_name || item.name || "Item"} (Quantity: ${item.quantity || 1}) - ${item.remark || ""}`;
  });

  addSection("Chargeable Items Supplied", relatedSuppliedChargeableItems, (item) => {
    return `• ${item.item_name || item.name || "Item"} (Quantity: ${item.quantity || 1})`;
  });

  addSection("Photo Setup Supplied", relatedSuppliedPhotoSetup, (item) => {
    return `• ${item.setup_type || item.name || "Setup"}: ${item.description || item.remark || ""}`;
  });

  // If still no data found, show a message
  if (relatedPlantProblems.length === 0 && 
      relatedPestTypes.length === 0 &&
      relatedNeedPlants.length === 0) {
    
    yPos += 10;
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFontSize(12);
    doc.setFont(undefined, "italic");
    doc.setTextColor(128, 128, 128);
    doc.text("No additional details found for this visit.", 105, yPos, { align: "center" });
  }

  // Footer
  yPos = 280;
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text("This is a computer-generated report.", 105, yPos, { align: "center" });
  doc.text("For any queries, please contact support.", 105, yPos + 5, { align: "center" });

  // Save PDF
  const fileName = `Site_Visit_Report_${siteVisitId}_${visitData.customer_name.replace(/\s+/g, '_')}.pdf`;
  doc.save(fileName);
};

  // Fetch data from backend API
  useEffect(() => {
    const fetchUsers = async () => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}api/site-visit.php?view-visit='viewvisit'&user_code=${user_code}`,
      { method: "GET" }
    );
    const data = await response.json();
    
    // Debug: Log the full structure
    console.log("Full API Response:", data);
    
    // Log each array's structure
    if (data.site_visit) {
      console.log("site_visit[0]:", data.site_visit[0]);
      console.log("Keys of site_visit[0]:", Object.keys(data.site_visit[0]));
    }
    
    if (data.plantProblems) {
      console.log("plantProblems[0]:", data.plantProblems[0]);
      console.log("Keys of plantProblems[0]:", Object.keys(data.plantProblems[0]));
    }
    
    if (data.pestTypes) {
      console.log("pestTypes[0]:", data.pestTypes[0]);
      console.log("Keys of pestTypes[0]:", Object.keys(data.pestTypes[0]));
    }
    
    // Store data
    setAllUsers(data.data || []);
    setApiData({
      site_visit: data.site_visit || [],
      plantProblems: data.plantProblems || [],
      pestTypes: data.pestTypes || [],
      needChargeableItem: data.needChargeableItem || [],
      needNutrients: data.needNutrients || [],
      needPlants: data.needPlants || [],
      suppliedChargeableItem: data.suppliedChargeableItem || [],
      suppliedNutrients: data.suppliedNutrients || [],
      suppliedPhotoSetup: data.suppliedPhotoSetup || [],
      suppliedPlants: data.suppliedPlants || [],
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
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
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