import React, { useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function ReportTable() {
  const user = JSON.parse(localStorage.getItem("user"));
  const user_id = user?.id;

  const [selectedReport, setSelectedReport] = useState("Client Performance");
  const [searchQuery, setSearchQuery] = useState("");
  const [reportData, setReportData] = useState(null);
  const [showReportRow, setShowReportRow] = useState(false);

  const getTodayDate = () => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, "0");
    const d = String(today.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const [startDate, setStartDate] = useState(getTodayDate());
  const [endDate, setEndDate] = useState(getTodayDate());

  /* ---------------- GROUP BY CUSTOMER ---------------- */
  const groupByCustomer = (arr = []) => {
    return Object.values(
      arr.reduce((acc, item) => {
        if (!item || !item.id) return acc;

        if (!acc[item.id]) {
          acc[item.id] = {
            id: item.id,
            name: item.name || "Unknown",
            items: [],
          };
        }
        acc[item.id].items.push(item);
        return acc;
      }, {})
    );
  };

  /* ---------------- API CALL ---------------- */
  const handleSubmit = async () => {
    try {
      const params = new URLSearchParams({
        user_id,
        report_type: selectedReport,
        start_date: startDate,
        end_date: endDate,
      });

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}api/reports.php?${params.toString()}`
      );

      const result = await response.json();
      console.log("API Response:", result);

      if (result?.status === "success") {
        setReportData(result);
        setShowReportRow(true);
      }
    } catch (err) {
      console.error("Error fetching report:", err);
    }
  };

  /* ---------------- PDF GENERATION ---------------- */
  const generatePDF = async (data) => {
    if (!data || data.status !== "success") {
      alert("Report data not ready");
      return;
    }

    const doc = new jsPDF("p", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const footerHeight = 35; // Height reserved for footer section
    let yPos = 20;
    let currentPage = 1;
    let totalPages = 1;

    // Helper to load logo
    const loadImageToDataURL = async (imageUrl) => {
      try {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      } catch (error) {
        console.error("Error loading logo:", error);
        return null;
      }
    };

    // Add logo to page
    const addLogoToPage = async (pageNum) => {
      try {
        const logoUrl = `${import.meta.env.BASE_URL || ""}img/growprologo.jpeg`;
        const logoDataUrl = await loadImageToDataURL(logoUrl);
        if (logoDataUrl) {
          const logoWidth = 25;
          const logoHeight = 18;
          const logoX = margin;
          const logoY = 10;

          if (pageNum > 1) {
            doc.setPage(pageNum);
          }

          doc.addImage(logoDataUrl, 'JPEG', logoX, logoY, logoWidth, logoHeight);
        }
      } catch (error) {
        console.error('Failed to add logo:', error);
      }
    };

    // Helper function to group data by customer
    const groupByCustomer = (dataArray) => {
      const grouped = {};

      if (Array.isArray(dataArray)) {
        dataArray.forEach(item => {
          // Use customer_id for grouping instead of id for offsite data
          const customerId = item.customer_id || item.id || "unknown";
          const customerName = item.name || "Unknown Customer";

          if (!grouped[customerId]) {
            grouped[customerId] = {
              id: customerId,
              name: customerName,
              items: []
            };
          }

          grouped[customerId].items.push(item);
        });
      }

      return Object.values(grouped);
    };

    // NEW: Helper function to group ALL offsite data by offsite_id
    const groupAllOffsiteDataByOffsiteId = () => {
      const allOffsiteData = [];
      
      // Combine all offsite data from different sources
      if (Array.isArray(data.offsiteNutrients)) {
        data.offsiteNutrients.forEach(item => {
          allOffsiteData.push({
            ...item,
            type: 'nutrient',
            key: `nutrient_${item.offsite_id}_${item.id}`
          });
        });
      }
      
      if (Array.isArray(data.offsiteSupplientPlantData)) {
        data.offsiteSupplientPlantData.forEach(item => {
          allOffsiteData.push({
            ...item,
            type: 'plant',
            key: `plant_${item.offsite_id}_${item.id}`
          });
        });
      }
      
      if (Array.isArray(data.offsiteChargeableItems)) {
        data.offsiteChargeableItems.forEach(item => {
          allOffsiteData.push({
            ...item,
            type: 'chargeable',
            key: `chargeable_${item.offsite_id}_${item.id}`
          });
        });
      }
      
      // Group by offsite_id
      const groupedByOffsiteId = {};
      
      allOffsiteData.forEach(item => {
        const offsiteId = item.offsite_id || "unknown";
        const customerId = item.customer_id || "unknown";
        const customerName = item.name || "Unknown Customer";
        
        if (!groupedByOffsiteId[offsiteId]) {
          groupedByOffsiteId[offsiteId] = {
            offsite_id: offsiteId,
            customer_id: customerId,
            customer_name: customerName,
            nutrients: [],
            plants: [],
            chargeable_items: []
          };
        }
        
        // Add to appropriate array
        if (item.type === 'nutrient') {
          groupedByOffsiteId[offsiteId].nutrients.push(item);
        } else if (item.type === 'plant') {
          groupedByOffsiteId[offsiteId].plants.push(item);
        } else if (item.type === 'chargeable') {
          groupedByOffsiteId[offsiteId].chargeable_items.push(item);
        }
      });
      
      return Object.values(groupedByOffsiteId);
    };

    // Helper function to check if we need a new page
    const checkPageBreak = (requiredSpace = 20) => {
      if (yPos > pageHeight - footerHeight - requiredSpace) {
        doc.addPage();
        currentPage++;
        totalPages = currentPage;
        yPos = 20 + 25; // Reset Y position for new page
        addLogoToPage(currentPage);
        return true;
      }
      return false;
    };

    // Add logo to first page
    await addLogoToPage(1);

    // Title with orange color
    doc.setFontSize(14);
    doc.setFont(undefined, "bold");
    doc.setTextColor(255, 102, 0); // Orange color for heading
    doc.text(`${selectedReport} Report`, pageWidth / 2 + 10, yPos, { align: "center" });
    doc.setTextColor(0, 0, 0); // Reset to black

    // Date range
    yPos += 10;
    doc.setFontSize(11);
    doc.setFont(undefined, "normal");
    doc.text(`From: ${startDate}  To: ${endDate}`, margin + 30, yPos);

    yPos += 15;

    /* =====================
       CLIENT PERFORMANCE REPORT
       ===================== */
    if (selectedReport === "Client Performance") {
      const clientData = data.client_performance || [];

      if (clientData.length === 0) {
        doc.setFontSize(12);
        doc.setFont(undefined, "normal");
        doc.text("No client performance data available.", margin, yPos);
        yPos += 20;
      } else {
        // Group by customer name for performance report
        const groupedByCustomer = {};
        clientData.forEach(item => {
          if (!groupedByCustomer[item.name]) {
            groupedByCustomer[item.name] = [];
          }
          groupedByCustomer[item.name].push(item);
        });

        // Process each customer
        Object.entries(groupedByCustomer).forEach(([customerName, records], customerIndex) => {
          // Check if we need a new page before adding customer section
          checkPageBreak(50);

          // Customer name
          doc.setFontSize(13);
          doc.setFont(undefined, "bold");
          doc.setTextColor(255, 102, 0); // Orange
          doc.text(`Customer: ${customerName}`, margin, yPos);
          doc.setTextColor(0, 0, 0); // Reset to black
          yPos += 10;

          /* CLIENT PERFORMANCE TABLE */
          doc.setFontSize(11);
          doc.setFont(undefined, "bold");
          doc.setTextColor(255, 102, 0); // Orange
          doc.text("Performance Ratings", margin, yPos);
          doc.setTextColor(0, 0, 0); // Reset to black
          yPos += 6;

          // Prepare table data
          const performanceTableBody = records.map((record, index) => {
            const siteRating = parseFloat(record.site_rating) || 0;
            const ratingText = siteRating > 0 ? `${siteRating}/5` : "No rating";
            const recordDate = record.created_date || "N/A";
            const recordTime = record.created_time || "N/A";
            const dateTime = `${recordDate} ${recordTime}`;
            const technicianName = record.technician_name || "N/A";

            return [
              index + 1,
              record.id || "N/A",
              dateTime,
              ratingText,
              getRatingDescription(siteRating),
              technicianName
            ];
          });

          autoTable(doc, {
            startY: yPos,
            head: [["#", "ID", "Date & Time", "Site Rating", "Description", "Technician Name"]],
            body: performanceTableBody,
            theme: "grid",
            styles: {
              fontSize: 9,
              cellPadding: 3,
              lineColor: [100, 100, 100],
              lineWidth: 0.2
            },
            headStyles: {
              fillColor: [255, 255, 255],
              textColor: [0, 0, 0],
              fontStyle: 'bold',
              lineWidth: 0.2,
              lineColor: [100, 100, 100]
            },
            margin: { left: margin, right: margin },
            didDrawPage: function (data) {
              // Update yPos after table is drawn
              yPos = data.cursor.y + 10;
            }
          });

          // Calculate average rating for this customer
          const totalRating = records.reduce((sum, record) => sum + (parseFloat(record.site_rating) || 0), 0);
          const avgRating = records.length > 0 ? totalRating / records.length : 0;

          // Check if we have space for average rating
          checkPageBreak(15);

          doc.setFontSize(10);
          doc.setFont(undefined, "bold");
          doc.text(`Average Rating: ${avgRating.toFixed(1)}/5`, margin, yPos);
          yPos += 15;

          // Add separator line between customers (if not last customer)
          if (customerIndex < Object.keys(groupedByCustomer).length - 1) {
            checkPageBreak(15);

            doc.setDrawColor(0, 0, 0);
            doc.setLineWidth(0.2);
            doc.line(margin, yPos, pageWidth - margin, yPos);
            yPos += 10;
          }
        });

        // Check if we need a new page for summary statistics
        checkPageBreak(60);

        // Add summary statistics
        doc.setFontSize(13);
        doc.setFont(undefined, "bold");
        doc.setTextColor(255, 102, 0); // Orange
        doc.text("Summary Statistics", margin, yPos);
        doc.setTextColor(0, 0, 0); // Reset to black
        yPos += 10;

        // Calculate overall statistics
        const allRatings = clientData.map(item => parseFloat(item.site_rating) || 0);
        const validRatings = allRatings.filter(rating => rating > 0);
        const overallAvg = validRatings.length > 0
          ? (validRatings.reduce((a, b) => a + b, 0) / validRatings.length).toFixed(1)
          : "N/A";

        const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        validRatings.forEach(rating => {
          if (rating >= 1 && rating <= 5) {
            ratingCounts[Math.round(rating)]++;
          }
        });

        const summaryData = [
          ["Total Records", clientData.length.toString()],
          ["Records with Ratings", validRatings.length.toString()],
          ["Overall Average Rating", `${overallAvg}/5`],
          ["5-Star Ratings", ratingCounts[5].toString()],
          ["4-Star Ratings", ratingCounts[4].toString()],
          ["3-Star Ratings", ratingCounts[3].toString()],
          ["2-Star Ratings", ratingCounts[2].toString()],
          ["1-Star Ratings", ratingCounts[1].toString()]
        ];

        autoTable(doc, {
          startY: yPos,
          body: summaryData,
          theme: "grid",
          styles: {
            fontSize: 9,
            cellPadding: 3,
            lineColor: [100, 100, 100],
            lineWidth: 0.2
          },
          headStyles: {
            fillColor: [255, 255, 255],
            textColor: [0, 0, 0],
            fontStyle: 'bold',
            lineWidth: 0.2,
            lineColor: [100, 100, 100]
          },
          margin: { left: margin, right: margin },
          didDrawPage: function (data) {
            yPos = data.cursor.y + 10;
          }
        });

        yPos = doc.lastAutoTable.finalY + 10;
      }
    }

    /* =====================
       NUTRIENT REPORTS (RAW Material)
       ===================== */
    else if (selectedReport === "RAW Material") {
      if (
        !Array.isArray(data.need_nutrients) ||
        !Array.isArray(data.supplied_nutrients)
      ) {
        doc.setFontSize(12);
        doc.setFont(undefined, "normal");
        doc.text("No nutrient data available.", margin, yPos);
        yPos += 20;
      } else {
        // Group all data by customer
        const groupedNeed = groupByCustomer(data.need_nutrients);
        const groupedSupplied = groupByCustomer(data.supplied_nutrients);
        const groupedPlants = groupByCustomer(data.supplied_plants);
        const groupedChargeableItem = groupByCustomer(data.supplied_chargeable_item);
        const groupedNeedChargeableItem = groupByCustomer(data.need_chargeable_item);
        
        // Get all offsite data grouped by offsite_id
        const allOffsiteGroups = groupAllOffsiteDataByOffsiteId();

        // Initialize grand totals
        let grandTotalSuppliedNutrients = 0;
        let grandTotalNeedNutrients = 0;
        let grandTotalSuppliedPlants = 0;
        let grandTotalNeedPlants = 0;
        let grandTotalSuppliedChargeableItems = 0;
        let grandTotalNeedChargeableItems = 0;
        let grandTotalOffsiteNutrients = 0;
        let grandTotalOffsiteChargeableItems = 0;
        let grandTotalOffsitePlants = 0;

        // ===========================================
        // FIRST: PROCESS ALL OFFSITE DATA
        // ===========================================
        if (allOffsiteGroups.length > 0) {
          // Offsite section header
          doc.setFontSize(14);
          doc.setFont(undefined, "bold");
          doc.setTextColor(0, 100, 0); // Dark green for offsite
          doc.text("OFFSITE DATA SECTION", pageWidth / 2 + 10, yPos, { align: "center" });
          doc.setTextColor(0, 0, 0); // Reset to black
          yPos += 15;
          
          // Add note about offsite data
          doc.setFontSize(9);
          doc.setFont(undefined, "italic");
          doc.text("(Items supplied for offsite/non-hydroponic use)", pageWidth / 2 + 10, yPos, { align: "center" });
          yPos += 10;

          // Process each offsite group
          allOffsiteGroups.forEach((offsiteGroup, offsiteIndex) => {
            // Check if we need a new page
            checkPageBreak(60);

            // Customer name for this offsite group (show for each group)
            doc.setFontSize(13);
            doc.setFont(undefined, "bold");
            doc.setTextColor(255, 102, 0); // Orange
            doc.text(`Customer: ${offsiteGroup.customer_name}`, margin, yPos);
            doc.setTextColor(0, 0, 0); // Reset to black
            
            // Add offsite ID reference
            doc.setFontSize(10);
            doc.setFont(undefined, "italic");
            doc.text(`(Offsite Request ID: ${offsiteGroup.offsite_id})`, margin + 100, yPos);
            yPos += 10;

            /* OFFSITE NUTRIENTS for this group */
            if (offsiteGroup.nutrients.length > 0) {
              doc.setFontSize(11);
              doc.setFont(undefined, "bold");
              doc.setTextColor(0, 100, 0); // Dark green for offsite
              doc.text("Offsite Nutrients", margin, yPos);
              doc.setTextColor(0, 0, 0); // Reset to black
              yPos += 6;

              // Calculate total for this offsite group's nutrients
              let offsiteNutrientGroupTotal = 0;

              // Prepare table data for offsite nutrients
              const offsiteNutrientTableBody = offsiteGroup.nutrients.map((i) => {
                const tankCap = parseFloat(i.tank_capacity) || 0;
                const topups = parseFloat(i.topups) || 0;
                const total = tankCap * topups;

                // Add to group total
                offsiteNutrientGroupTotal += total;

                return [
                  i.nutrient_type || "-",
                  tankCap ? `${tankCap} Ltr` : "-",
                  topups || "-",
                  total ? `${total.toFixed(2)} Ltr` : "-"
                ];
              });

              // Add group total row
              offsiteNutrientTableBody.push([
                { content: "Offsite Total:", colSpan: 3, styles: { fontStyle: 'bold', halign: 'right' } },
                { content: `${offsiteNutrientGroupTotal.toFixed(2)} Ltr`, styles: { fontStyle: 'bold' } }
              ]);

              // Add to grand total
              grandTotalOffsiteNutrients += offsiteNutrientGroupTotal;

              autoTable(doc, {
                startY: yPos,
                head: [["Nutrient Type", "Tank Capacity", "Topups", "Total (Ltr)"]],
                body: offsiteNutrientTableBody,
                theme: "grid",
                styles: {
                  fontSize: 9,
                  cellPadding: 3,
                  lineColor: [0, 100, 0], // Green border for offsite
                  lineWidth: 0.2
                },
                headStyles: {
                  fillColor: [240, 255, 240], // Light green background
                  textColor: [0, 100, 0], // Dark green text
                  fontStyle: 'bold',
                  lineWidth: 0.2,
                  lineColor: [0, 100, 0]
                },
                margin: { left: margin, right: margin },
                didDrawPage: function (data) {
                  yPos = data.cursor.y + 15;
                }
              });

              yPos = doc.lastAutoTable.finalY + 15;
            }

            /* OFFSITE PLANTS for this group */
            if (offsiteGroup.plants.length > 0) {
              doc.setFontSize(11);
              doc.setFont(undefined, "bold");
              doc.setTextColor(0, 100, 0); // Dark green for offsite
              doc.text("Offsite Plants", margin, yPos);
              doc.setTextColor(0, 0, 0); // Reset to black
              yPos += 6;

              // Calculate total for this offsite group's plants
              let offsitePlantGroupTotal = 0;

              // Prepare table data for offsite plants
              const offsitePlantTableBody = offsiteGroup.plants.map((i) => {
                const plant_name = i.plant_name;
                const other_plant_name = i.other_plant_name || "";
                const quantity = parseFloat(i.quantity) || 0;

                // Add to group total
                offsitePlantGroupTotal += quantity;

                // Use other_plant_name if plant_name is "Others", otherwise use plant_name
                const displayName = plant_name === 'Others' && other_plant_name
                  ? other_plant_name
                  : plant_name || "Unknown Plant";

                return [
                  displayName,
                  quantity ? `${quantity}` : "-",
                ];
              });

              // Add group total row
              offsitePlantTableBody.push([
                { content: "Offsite Total:", styles: { fontStyle: 'bold' } },
                { content: `${offsitePlantGroupTotal.toFixed(2)}`, styles: { fontStyle: 'bold' } }
              ]);

              // Add to grand total
              grandTotalOffsitePlants += offsitePlantGroupTotal;

              autoTable(doc, {
                startY: yPos,
                head: [["Plant Name", "Quantity"]],
                body: offsitePlantTableBody,
                theme: "grid",
                styles: {
                  fontSize: 9,
                  cellPadding: 3,
                  lineColor: [0, 100, 0], // Green border for offsite
                  lineWidth: 0.2
                },
                headStyles: {
                  fillColor: [240, 255, 240], // Light green background
                  textColor: [0, 100, 0], // Dark green text
                  fontStyle: 'bold',
                  lineWidth: 0.2,
                  lineColor: [0, 100, 0]
                },
                margin: { left: margin, right: margin },
                didDrawPage: function (data) {
                  yPos = data.cursor.y + 15;
                }
              });

              yPos = doc.lastAutoTable.finalY + 15;
            }

            /* OFFSITE CHARGEABLE ITEMS for this group */
            if (offsiteGroup.chargeable_items.length > 0) {
              doc.setFontSize(11);
              doc.setFont(undefined, "bold");
              doc.setTextColor(0, 100, 0); // Dark green for offsite
              doc.text("Offsite Chargeable Items", margin, yPos);
              doc.setTextColor(0, 0, 0); // Reset to black
              yPos += 6;

              // Calculate total for this offsite group's chargeable items
              let offsiteChargeableGroupTotal = 0;

              // Prepare table data for offsite chargeable items
              const offsiteChargeableTableBody = offsiteGroup.chargeable_items.map((i) => {
                const item_name = i.item_name;
                const other_item_name = i.other_item_name || "";
                const quantity = parseFloat(i.quantity) || 0;

                // Add to group total
                offsiteChargeableGroupTotal += quantity;

                // Use other_item_name if item_name is "Others", otherwise use item_name
                const displayName = item_name === 'Others' && other_item_name
                  ? other_item_name
                  : item_name || "Unknown Item";

                return [
                  displayName,
                  quantity ? `${quantity}` : "-",
                ];
              });

              // Add group total row
              offsiteChargeableTableBody.push([
                { content: "Offsite Total:", styles: { fontStyle: 'bold' } },
                { content: `${offsiteChargeableGroupTotal.toFixed(2)}`, styles: { fontStyle: 'bold' } }
              ]);

              // Add to grand total
              grandTotalOffsiteChargeableItems += offsiteChargeableGroupTotal;

              autoTable(doc, {
                startY: yPos,
                head: [["Item Name", "Quantity"]],
                body: offsiteChargeableTableBody,
                theme: "grid",
                styles: {
                  fontSize: 9,
                  cellPadding: 3,
                  lineColor: [0, 100, 0], // Green border for offsite
                  lineWidth: 0.2
                },
                headStyles: {
                  fillColor: [240, 255, 240], // Light green background
                  textColor: [0, 100, 0], // Dark green text
                  fontStyle: 'bold',
                  lineWidth: 0.2,
                  lineColor: [0, 100, 0]
                },
                margin: { left: margin, right: margin },
                didDrawPage: function (data) {
                  yPos = data.cursor.y + 15;
                }
              });

              yPos = doc.lastAutoTable.finalY + 15;
            }

            // Add separator between offsite groups (if not the last one)
            if (offsiteIndex < allOffsiteGroups.length - 1) {
              checkPageBreak(15);
              
              doc.setFontSize(10);
              doc.setFont(undefined, "bold");
              doc.setTextColor(0, 100, 0); // Green color
              doc.text("--- Next Offsite Request ---", pageWidth / 2 + 10, yPos, { align: "center" });
              doc.setTextColor(0, 0, 0); // Reset to black
              yPos += 15;
            }
          });
          
          // Add separator after all offsite data
          checkPageBreak(20);
          doc.setDrawColor(0, 0, 0);
          doc.setLineWidth(0.5);
          doc.line(margin, yPos, pageWidth - margin, yPos);
          yPos += 15;
        }

        // ===========================================
        // SECOND: PROCESS REGULAR HYDROPONIC DATA
        // ===========================================
        if (groupedNeed.length > 0 || groupedSupplied.length > 0 || groupedPlants.length > 0 || 
            groupedChargeableItem.length > 0 || groupedNeedChargeableItem.length > 0) {
          
          // Regular data section header
          doc.setFontSize(14);
          doc.setFont(undefined, "bold");
          doc.setTextColor(255, 102, 0); // Orange
          doc.text("REGULAR ONSITE DATA SECTION", pageWidth / 2 + 10, yPos, { align: "center" });
          doc.setTextColor(0, 0, 0); // Reset to black
          yPos += 15;

          // Get all unique customer IDs from regular data sources
          const allRegularCustomers = new Set();
          
          groupedNeed.forEach(c => allRegularCustomers.add(c.id));
          groupedSupplied.forEach(c => allRegularCustomers.add(c.id));
          groupedPlants.forEach(c => allRegularCustomers.add(c.id));
          groupedChargeableItem.forEach(c => allRegularCustomers.add(c.id));
          groupedNeedChargeableItem.forEach(c => allRegularCustomers.add(c.id));

          // Convert to array and process
          const allRegularCustomersArray = Array.from(allRegularCustomers);

          // Process each customer for regular data
          allRegularCustomersArray.forEach((customerId, customerIndex) => {
            // Find customer in each data source
            const customerNeed = groupedNeed.find((s) => s.id === customerId);
            const customerSupplied = groupedSupplied.find((s) => s.id === customerId);
            const customerPlants = groupedPlants.find((s) => s.id === customerId);
            const customerChargeableItem = groupedChargeableItem.find((s) => s.id === customerId);
            const customerNeedChargeableItem = groupedNeedChargeableItem.find((s) => s.id === customerId);

            // Get customer name (from any source that has it)
            let customerName = "Unknown Customer";
            if (customerNeed) customerName = customerNeed.name;
            else if (customerSupplied) customerName = customerSupplied.name;
            else if (customerPlants) customerName = customerPlants.name;
            else if (customerChargeableItem) customerName = customerChargeableItem.name;
            else if (customerNeedChargeableItem) customerName = customerNeedChargeableItem.name;

            // Check if we need a new page
            checkPageBreak(60);

            // Customer name with orange section heading
            doc.setFontSize(13);
            doc.setFont(undefined, "bold");
            doc.setTextColor(255, 102, 0); // Orange
            doc.text(`Customer: ${customerName}`, margin, yPos);
            doc.setTextColor(0, 0, 0); // Reset to black
            yPos += 10;

            /* NEED CHARGEABLE ITEMS TABLE */
            if (customerNeedChargeableItem && customerNeedChargeableItem.items.length > 0) {
              doc.setFontSize(11);
              doc.setFont(undefined, "bold");
              doc.setTextColor(255, 102, 0); // Orange
              doc.text("Need Chargeable Items", margin, yPos);
              doc.setTextColor(0, 0, 0); // Reset to black
              yPos += 6;

              // Calculate totals for this customer
              let customerNeedChargeableTotal = 0;

              // Prepare table data for need chargeable items
              const needChargeableItemTableBody = customerNeedChargeableItem.items.map((i) => {
                const item_name = i.item_name || "";
                const other_item_name = i.other_item_name || "";
                const quantity = parseFloat(i.quantity) || 0;

                // Add to customer total
                customerNeedChargeableTotal += quantity;

                // Use other_item_name if item_name is "Others", otherwise use item_name
                const displayName = item_name === 'Others' && other_item_name
                  ? other_item_name
                  : item_name || "Unknown Item";

                return [
                  displayName,
                  quantity ? `${quantity}` : "-",
                ];
              });

              // Add customer total row
              needChargeableItemTableBody.push([
                { content: "Customer Total:", styles: { fontStyle: 'bold' } },
                { content: `${customerNeedChargeableTotal.toFixed(2)}`, styles: { fontStyle: 'bold' } }
              ]);

              // Add to grand total
              grandTotalNeedChargeableItems += customerNeedChargeableTotal;

              autoTable(doc, {
                startY: yPos,
                head: [["Item Name", "Quantity"]],
                body: needChargeableItemTableBody,
                theme: "grid",
                styles: {
                  fontSize: 9,
                  cellPadding: 3,
                  lineColor: [100, 100, 100],
                  lineWidth: 0.2
                },
                headStyles: {
                  fillColor: [255, 255, 255],
                  textColor: [0, 0, 0],
                  fontStyle: 'bold',
                  lineWidth: 0.2,
                  lineColor: [100, 100, 100]
                },
                margin: { left: margin, right: margin },
                didDrawPage: function (data) {
                  yPos = data.cursor.y + 15;
                }
              });

              yPos = doc.lastAutoTable.finalY + 15;
            }

            /* SUPPLIED PLANTS */
            if (customerPlants && customerPlants.items.length > 0) {
              doc.setFontSize(11);
              doc.setFont(undefined, "bold");
              doc.setTextColor(255, 102, 0); // Orange
              doc.text("Supplied Plants", margin, yPos);
              doc.setTextColor(0, 0, 0); // Reset to black
              yPos += 6;

              // Calculate total for this customer
              let customerSuppliedPlantTotal = 0;

              // Prepare table data for supplied plants
              const suppliedPlantTableBody = customerPlants.items.map((i) => {
                const plant_name = i.plant_name;
                const quantity = parseFloat(i.quantity) || 0;

                // Add to customer total
                customerSuppliedPlantTotal += quantity;

                return [
                  plant_name ? `${plant_name}` : "-",
                  quantity ? `${quantity}` : "-",
                ];
              });

              // Add customer total row
              suppliedPlantTableBody.push([
                { content: "Customer Total:", styles: { fontStyle: 'bold' } },
                { content: `${customerSuppliedPlantTotal.toFixed(2)}`, styles: { fontStyle: 'bold' } }
              ]);

              // Add to grand total
              grandTotalSuppliedPlants += customerSuppliedPlantTotal;

              autoTable(doc, {
                startY: yPos,
                head: [["Plant Name", "Quantity"]],
                body: suppliedPlantTableBody,
                theme: "grid",
                styles: {
                  fontSize: 9,
                  cellPadding: 3,
                  lineColor: [100, 100, 100],
                  lineWidth: 0.2
                },
                headStyles: {
                  fillColor: [255, 255, 255],
                  textColor: [0, 0, 0],
                  fontStyle: 'bold',
                  lineWidth: 0.2,
                  lineColor: [100, 100, 100]
                },
                margin: { left: margin, right: margin },
                didDrawPage: function (data) {
                  yPos = data.cursor.y + 15;
                }
              });

              yPos = doc.lastAutoTable.finalY + 15;
            }

            /* SUPPLIED NUTRIENTS */
            if (customerSupplied && customerSupplied.items.length > 0) {
              doc.setFontSize(11);
              doc.setFont(undefined, "bold");
              doc.setTextColor(255, 102, 0); // Orange
              doc.text("Supplied Nutrients", margin, yPos);
              doc.setTextColor(0, 0, 0); // Reset to black
              yPos += 6;

              // Calculate total for this customer
              let customerSuppliedNutrientTotal = 0;

              // Prepare table data for supplied nutrients
              const suppliedTableBody = customerSupplied.items.map((i) => {
                const tankCap = parseFloat(i.tank_capacity) || 0;
                const topups = parseFloat(i.topups) || 0;
                const total = tankCap * topups;

                // Add to customer total
                customerSuppliedNutrientTotal += total;

                return [
                  i.nutrient_type || "-",
                  tankCap ? `${tankCap} Ltr` : "-",
                  topups || "-",
                  total ? `${total.toFixed(2)} Ltr` : "-"
                ];
              });

              // Add customer total row
              suppliedTableBody.push([
                { content: "Customer Total:", colSpan: 3, styles: { fontStyle: 'bold', halign: 'right' } },
                { content: `${customerSuppliedNutrientTotal.toFixed(2)} Ltr`, styles: { fontStyle: 'bold' } }
              ]);

              // Add to grand total
              grandTotalSuppliedNutrients += customerSuppliedNutrientTotal;

              autoTable(doc, {
                startY: yPos,
                head: [["Nutrient Type", "Tank Capacity", "Topups", "Total (Ltr)"]],
                body: suppliedTableBody,
                theme: "grid",
                styles: {
                  fontSize: 9,
                  cellPadding: 3,
                  lineColor: [100, 100, 100],
                  lineWidth: 0.2
                },
                headStyles: {
                  fillColor: [255, 255, 255],
                  textColor: [0, 0, 0],
                  fontStyle: 'bold',
                  lineWidth: 0.2,
                  lineColor: [100, 100, 100]
                },
                margin: { left: margin, right: margin },
                didDrawPage: function (data) {
                  yPos = data.cursor.y + 15;
                }
              });

              yPos = doc.lastAutoTable.finalY + 15;
            }

            /* SUPPLIED CHARGEABLE ITEMS */
            if (customerChargeableItem && customerChargeableItem.items.length > 0) {
              doc.setFontSize(11);
              doc.setFont(undefined, "bold");
              doc.setTextColor(255, 102, 0); // Orange
              doc.text("Supplied Chargeable Items", margin, yPos);
              doc.setTextColor(0, 0, 0); // Reset to black
              yPos += 6;

              // Calculate total for this customer
              let customerSuppliedChargeableTotal = 0;

              // Prepare table data for supplied chargeable items
              const suppliedChargeableItemTableBody = customerChargeableItem.items.map((i) => {
                const item_name = i.item_name;
                const other_item_name = i.other_item_name;
                const quantity = parseFloat(i.quantity) || 0;

                // Add to customer total
                customerSuppliedChargeableTotal += quantity;

                // Use other_item_name if item_name is "Others", otherwise use item_name
                const displayName = item_name === 'Others' && other_item_name
                  ? other_item_name
                  : item_name || "Unknown Item";

                return [
                  displayName,
                  quantity ? `${quantity}` : "-",
                ];
              });

              // Add customer total row
              suppliedChargeableItemTableBody.push([
                { content: "Customer Total:", styles: { fontStyle: 'bold' } },
                { content: `${customerSuppliedChargeableTotal.toFixed(2)}`, styles: { fontStyle: 'bold' } }
              ]);

              // Add to grand total
              grandTotalSuppliedChargeableItems += customerSuppliedChargeableTotal;

              autoTable(doc, {
                startY: yPos,
                head: [["Item Name", "Quantity"]],
                body: suppliedChargeableItemTableBody,
                theme: "grid",
                styles: {
                  fontSize: 9,
                  cellPadding: 3,
                  lineColor: [100, 100, 100],
                  lineWidth: 0.2
                },
                headStyles: {
                  fillColor: [255, 255, 255],
                  textColor: [0, 0, 0],
                  fontStyle: 'bold',
                  lineWidth: 0.2,
                  lineColor: [100, 100, 100]
                },
                margin: { left: margin, right: margin },
                didDrawPage: function (data) {
                  yPos = data.cursor.y + 15;
                }
              });

              yPos = doc.lastAutoTable.finalY + 15;
            }

            /* NEED NUTRIENTS TABLE */
            if (customerNeed && customerNeed.items.length > 0) {
              doc.setFontSize(11);
              doc.setFont(undefined, "bold");
              doc.setTextColor(255, 102, 0); // Orange
              doc.text("Need Nutrients", margin, yPos);
              doc.setTextColor(0, 0, 0); // Reset to black
              yPos += 6;

              // Calculate total for this customer
              let customerNeedNutrientTotal = 0;

              // Prepare table data for need nutrients
              const needTableBody = customerNeed.items.map((i) => {
                const tankCap = parseFloat(i.tank_capacity) || 0;
                const topups = parseFloat(i.topups) || 0;
                const total = tankCap * topups;

                // Add to customer total
                customerNeedNutrientTotal += total;

                return [
                  i.nutrient_type || "-",
                  tankCap ? `${tankCap} Ltr` : "-",
                  topups || "-",
                  total ? `${total.toFixed(2)} Ltr` : "-"
                ];
              });

              // Add customer total row
              needTableBody.push([
                { content: "Customer Total:", colSpan: 3, styles: { fontStyle: 'bold', halign: 'right' } },
                { content: `${customerNeedNutrientTotal.toFixed(2)} Ltr`, styles: { fontStyle: 'bold' } }
              ]);

              // Add to grand total
              grandTotalNeedNutrients += customerNeedNutrientTotal;

              autoTable(doc, {
                startY: yPos,
                head: [["Nutrient Type", "Tank Capacity", "Topups", "Total (Ltr)"]],
                body: needTableBody,
                theme: "grid",
                styles: {
                  fontSize: 9,
                  cellPadding: 3,
                  lineColor: [100, 100, 100],
                  lineWidth: 0.2
                },
                headStyles: {
                  fillColor: [255, 255, 255],
                  textColor: [0, 0, 0],
                  fontStyle: 'bold',
                  lineWidth: 0.2,
                  lineColor: [100, 100, 100]
                },
                margin: { left: margin, right: margin },
                didDrawPage: function (data) {
                  yPos = data.cursor.y + 10;
                }
              });

              yPos = doc.lastAutoTable.finalY + 10;
            }

            // Add separator line between customers (if not last customer)
            if (customerIndex < allRegularCustomersArray.length - 1) {
              checkPageBreak(15);

              doc.setDrawColor(0, 0, 0);
              doc.setLineWidth(0.2);
              doc.line(margin, yPos, pageWidth - margin, yPos);
              yPos += 10;
            }
          });
        }
        
        /* ----------------------------------
           GRAND TOTALS SUMMARY SECTION
           (Add this after all customers are processed)
        ---------------------------------- */

        // Check if we need a new page for grand totals
        checkPageBreak(100);

        // Add a separator line before grand totals
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.5);
        doc.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 10;

        // Grand Totals Heading
        doc.setFontSize(14);
        doc.setFont(undefined, "bold");
        doc.setTextColor(255, 102, 0); // Orange
        doc.text("GRAND TOTALS (All Customers)", margin, yPos);
        doc.setTextColor(0, 0, 0); // Reset to black
        yPos += 10;

        // Prepare grand totals table with offsite data
        const grandTotalsData = [
          // Regular Data Section
          [{ content: "REGULAR ONSITE DATA:", colSpan: 2, styles: { fontStyle: 'bold', fontSize: 11, textColor: [255, 102, 0] } }],
          ["Supplied Nutrients Total:", `${grandTotalSuppliedNutrients.toFixed(2)} Ltr`],
          ["Need Nutrients Total:", `${grandTotalNeedNutrients.toFixed(2)} Ltr`],
          ["", ""], // Empty row for spacing
          ["Supplied Plants Total:", `${grandTotalSuppliedPlants.toFixed(2)} units`],
          ["Need Plants Total:", `${grandTotalNeedPlants.toFixed(2)} units`],
          ["", ""], // Empty row for spacing
          ["Supplied Chargeable Items Total:", `${grandTotalSuppliedChargeableItems.toFixed(2)} units`],
          ["Need Chargeable Items Total:", `${grandTotalNeedChargeableItems.toFixed(2)} units`],
          
          // Spacer row
          ["", ""],
          ["", ""],
          
          // Offsite Data Section
          [{ content: "OFFSITE DATA:", colSpan: 2, styles: { fontStyle: 'bold', fontSize: 11, textColor: [0, 100, 0] } }],
          ["Offsite Nutrients Total:", `${grandTotalOffsiteNutrients.toFixed(2)} Ltr`],
          ["Offsite Plants Total:", `${grandTotalOffsitePlants.toFixed(2)} units`],
          ["Offsite Chargeable Items Total:", `${grandTotalOffsiteChargeableItems.toFixed(2)} units`]
        ];

        autoTable(doc, {
          startY: yPos,
          body: grandTotalsData,
          theme: "grid",
          styles: {
            fontSize: 10,
            cellPadding: 5,
            lineColor: [100, 100, 100],
            lineWidth: 0.2
          },
          columnStyles: {
            0: { fontStyle: 'bold', halign: 'right' },
            1: { fontStyle: 'bold', halign: 'left' }
          },
          margin: { left: margin, right: margin },
          didDrawPage: function (data) {
            yPos = data.cursor.y + 15;
          }
        });

        yPos = doc.lastAutoTable.finalY + 15;

        // Add a summary note
        doc.setFontSize(9);
        doc.setFont(undefined, "italic");
        doc.text("Note: Offsite data represents items supplied for non-hydroponic/offsite use.", margin, yPos);
        yPos += 5;
        doc.text("Regular data represents items for standard hydroponic systems.", margin, yPos);
        yPos += 10;
      }
    }

    /* ----------------------------------
       FOOTER SECTION - Add only if we have enough space
    ---------------------------------- */

    // Check if we need a new page for the footer
    if (yPos > pageHeight - footerHeight - 20) {
      doc.addPage();
      currentPage++;
      totalPages = currentPage;
      yPos = 20 + 25;
      await addLogoToPage(currentPage);
    }

    // Make sure we're on the last page
    doc.setPage(totalPages);

    // Add Happy Growing section
    yPos += 10; // Reduced space
    doc.setFontSize(16);
    doc.setFont(undefined, "bold");
    doc.text("Happy Growing!", margin, yPos);
    yPos += 10;

    // Contact information - LEFT SIDE
    doc.setFontSize(11);
    doc.setFont(undefined, "normal");

    // Email
    doc.text("Email:", margin, yPos);
    doc.textWithLink("sales@growpro.co.in", margin + 20, yPos, {
      url: "mailto:sales@growpro.co.in"
    });
    yPos += 8;

    // Phone
    doc.text("Phone:", margin, yPos);
    doc.textWithLink("859 175 3001", margin + 25, yPos, {
      url: "tel:+918591753001"
    });

    /* ----------------------------------
       BOTTOM FOOTER (Separator line + company info)
       Positioned at fixed bottom position
    ---------------------------------- */

    // Calculate fixed footer position
    const footerY = pageHeight - 20;
    const separatorY = pageHeight - 25;

    // Draw separator line at fixed position
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.3);
    doc.line(margin, separatorY, pageWidth - margin, separatorY);

    // RIGHT: Company info
    const footerRightX = pageWidth - margin;

    // Company name
    doc.setFont(undefined, "bold");
    doc.text("GrowPro Technology", footerRightX, footerY, { align: "right" });

    // Add link to company name
    const companyText = "GrowPro Technology";
    const textWidth = doc.getTextWidth(companyText);
    doc.link(footerRightX - textWidth, footerY - 4, textWidth, 5, {
      url: "https://growpro.co.in/"
    });

    // Website
    doc.setFont(undefined, "normal");
    doc.setFontSize(9);
    doc.textWithLink("www.growpro.co.in", footerRightX, footerY + 5, {
      align: "right",
      url: "https://growpro.co.in/"
    });

    /* ----------------------------------
       ADD LOGO TO ALL PAGES
    ---------------------------------- */

    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      if (i > 1) {
        await addLogoToPage(i);
      }
    }

    // Save the PDF
    const safeReportName = selectedReport.replace(/\s+/g, "_").replace(/[^\w-_]/g, "");
    doc.save(`${safeReportName}_Report_${startDate}_to_${endDate}.pdf`);
  };

  /* ---------------- HELPER FUNCTION ---------------- */
  const getRatingDescription = (rating) => {
    if (rating >= 4.5) return "Excellent";
    if (rating >= 3.5) return "Good";
    if (rating >= 2.5) return "Average";
    if (rating >= 1.5) return "Below Average";
    if (rating > 0) return "Poor";
    return "No Rating";
  };

  /* ---------------- JSX ---------------- */
  return (
    <div className="w-full min-h-screen bg-gray-100 mt-10">
      <div className="mx-auto bg-white rounded-2xl shadow-xl p-6">

        <div className="border-b pb-5 mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">
            Manage Reports
          </h2>
          <p className="text-sm text-gray-600">
            Select & view report data
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

          <select
            value={selectedReport}
            onChange={(e) => setSelectedReport(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="Client Performance">Client Performance</option>
            {user?.role === "admin" && (
              <option value="RAW Material">RAW Material</option>
            )}
          </select>

          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          />

          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          />

          <button
            onClick={handleSubmit}
            className="btn-primary"
          >
            Submit
          </button>
        </div>

        {showReportRow && (
          <div className="mt-6 bg-gray-50 border rounded-lg p-4 flex justify-between items-center">
            <span className="font-semibold text-gray-700">
              {selectedReport} Report
            </span>

            <button
              disabled={!reportData}
              onClick={() => generatePDF(reportData)}
              className={`px-4 py-2 rounded-lg text-white ${reportData
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-gray-400 cursor-not-allowed"
                }`}
            >
              Download PDF
            </button>
          </div>
        )}
      </div>
    </div>
  );
}