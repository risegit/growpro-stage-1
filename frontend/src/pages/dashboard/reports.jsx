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
    if (!Array.isArray(arr)) return [];
    
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
      if (!user_id) {
        alert("User not found. Please login again.");
        return;
      }

      const params = new URLSearchParams({
        user_id,
        report_type: selectedReport,
        start_date: startDate,
        end_date: endDate,
      });

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}api/reports.php?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("API Response:", result);

      if (result?.status === "success") {
        setReportData(result);
        setShowReportRow(true);
      } else {
        alert(result?.message || "Failed to fetch report data");
      }
    } catch (err) {
      console.error("Error fetching report:", err);
      alert("Error fetching report. Please try again.");
    }
  };

  /* ---------------- PDF GENERATION ---------------- */
  const generatePDF = async (data) => {
  console.log("=== PDF GENERATION STARTED ===");
  console.log("Selected Report:", selectedReport);
  console.log("Date Range:", startDate, "to", endDate);
  console.log("API Data received:", data);
  
  if (!data || data.status !== "success") {
    console.error("Invalid data or status not success:", data);
    alert("Report data not ready");
    return;
  }

  try {
    console.log("Initializing jsPDF...");
    const doc = new jsPDF("p", "mm", "a4");
    console.log("jsPDF initialized successfully");
    
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const footerHeight = 30;
    const logoHeight = 18;
    const logoSpacing = 10;
    const contentStartY = 10 + logoHeight + logoSpacing;
    
    let yPos = contentStartY;
    let currentPage = 1;
    let totalPages = 1;

    console.log("PDF dimensions:", { pageWidth, pageHeight, margin, contentStartY });

    // Helper to load logo
    const loadImageToDataURL = async (imageUrl) => {
      console.log("Loading logo from:", imageUrl);
      try {
        const response = await fetch(imageUrl);
        if (!response.ok) {
          console.warn("Logo fetch failed with status:", response.status);
          return null;
        }
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            console.log("Logo loaded successfully");
            resolve(reader.result);
          };
          reader.onerror = (error) => {
            console.error("Error reading logo:", error);
            reject(error);
          };
          reader.readAsDataURL(blob);
        });
      } catch (error) {
        console.error("Error loading logo:", error);
        return null;
      }
    };

    // Add logo to page
    const addLogoToPage = async (pageNum) => {
      console.log("Adding logo to page:", pageNum);
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
          console.log("Logo added successfully to page:", pageNum);
        } else {
          console.warn("Logo data URL is null, skipping logo addition");
        }
      } catch (error) {
        console.error('Failed to add logo:', error);
      }
    };

    // Group onsite data by customer ID
    const groupOnsiteDataByCustomer = (arr = []) => {
      console.log("Grouping onsite data by customer, input array length:", arr.length);
      if (!Array.isArray(arr)) {
        console.warn("groupOnsiteDataByCustomer received non-array:", arr);
        return [];
      }
      
      const grouped = arr.reduce((acc, item) => {
        if (!item || !item.id) {
          console.warn("Item missing id in groupOnsiteDataByCustomer:", item);
          return acc;
        }

        if (!acc[item.id]) {
          acc[item.id] = {
            id: item.id,
            name: item.name || "Unknown",
            items: [],
          };
        }
        acc[item.id].items.push(item);
        return acc;
      }, {});
      
      const result = Object.values(grouped);
      console.log("Grouped onsite result:", result.length, "groups");
      return result;
    };

    // Page break check - FIXED: Always return and continue
    const checkPageBreak = (requiredSpace = 20) => {
      const spaceNeeded = requiredSpace + 10;
      if (yPos > pageHeight - footerHeight - spaceNeeded) {
        console.log("Adding new page, current yPos:", yPos);
        doc.addPage();
        currentPage++;
        yPos = contentStartY;
        // Don't await here to avoid blocking
        addLogoToPage(currentPage).catch(err => console.error("Error adding logo:", err));
        console.log("New page added, yPos reset to:", yPos);
      }
      return false; // Always return false so the function continues
    };

    // Function to add footer at the bottom of the last page
    const addFooterAtBottom = () => {
      console.log("Adding footer to page:", totalPages);
      doc.setPage(totalPages);
      
      const footerY = pageHeight - 15;
      
      doc.setDrawColor(225, 122, 0);
      doc.setLineWidth(0.6);
      doc.line(0, footerY - 12, pageWidth, footerY - 12);
      
      doc.setFontSize(9);
      doc.setFont(undefined, "normal");
      doc.setTextColor(100, 100, 100);
      
      doc.text("Email:", margin, footerY - 6);
      doc.setTextColor(0, 0, 255);
      doc.textWithLink("sales@growpro.co.in", margin + 20, footerY - 6, {
        url: "mailto:sales@growpro.co.in"
      });
      
      doc.setTextColor(100, 100, 100);
      doc.text("Phone:", margin, footerY);
      doc.setTextColor(0, 0, 255);
      doc.textWithLink("+91 859 175 3001", margin + 22, footerY, {
        url: "tel:+918591753001"
      });
      
      const rightX = pageWidth - margin;
      
      doc.setTextColor(100, 100, 100);
      doc.setFont(undefined, "bold");
      doc.text("GrowPro Solutions", rightX, footerY - 6, { align: "right" });
      
      doc.setFont(undefined, "normal");
      doc.text(`Page ${totalPages} of ${totalPages}`, rightX, footerY, { align: "right" });
    };

    // Add logo to first page
    console.log("Adding logo to first page");
    await addLogoToPage(1);

    // Title
    console.log("Adding title at yPos:", yPos);
    doc.setFontSize(14);
    doc.setFont(undefined, "bold");
    doc.setTextColor(255, 102, 0);
    doc.text(`${selectedReport} Report`, pageWidth / 2 + 10, yPos, { align: "center" });
    doc.setTextColor(0, 0, 0);
    yPos += 10;
    console.log("After title, yPos:", yPos);

    // Date range
    doc.setFontSize(11);
    doc.setFont(undefined, "normal");
    doc.text(`From: ${startDate}  To: ${endDate}`, margin + 30, yPos);
    yPos += 15;
    console.log("After date range, yPos:", yPos);

    /* =====================
       CLIENT PERFORMANCE REPORT
       ===================== */
    if (selectedReport === "Client Performance") {
      console.log("Processing Client Performance Report");
      // ... client performance code (keep as is)
    }

    /* =====================
       RAW MATERIAL REPORT
       ===================== */
    else if (selectedReport === "RAW Material") {
      console.log("Processing RAW Material Report");
      
      try {
        // ===== ONSITE DATA =====
        const needNutrients = Array.isArray(data.need_nutrients) ? data.need_nutrients : [];
        const suppliedNutrients = Array.isArray(data.supplied_nutrients) ? data.supplied_nutrients : [];
        const suppliedPlants = Array.isArray(data.supplied_plants) ? data.supplied_plants : [];
        const suppliedChargeableItem = Array.isArray(data.supplied_chargeable_item) ? data.supplied_chargeable_item : [];
        const needChargeableItem = Array.isArray(data.need_chargeable_item) ? data.need_chargeable_item : [];
        
        console.log("Onsite data counts:", {
          needNutrients: needNutrients.length,
          suppliedNutrients: suppliedNutrients.length,
          suppliedPlants: suppliedPlants.length,
          suppliedChargeable: suppliedChargeableItem.length,
          needChargeable: needChargeableItem.length
        });
        
        // Group onsite data by customer ID
        const groupedNeedNutrients = groupOnsiteDataByCustomer(needNutrients);
        const groupedSuppliedNutrients = groupOnsiteDataByCustomer(suppliedNutrients);
        const groupedSuppliedPlants = groupOnsiteDataByCustomer(suppliedPlants);
        const groupedSuppliedChargeable = groupOnsiteDataByCustomer(suppliedChargeableItem);
        const groupedNeedChargeable = groupOnsiteDataByCustomer(needChargeableItem);

        // ===== OFFSITE DATA =====
        const offsiteData = Array.isArray(data.offsiteData) ? data.offsiteData : [];
        const offsitePlants = Array.isArray(data.offsiteSupplientPlantData) ? data.offsiteSupplientPlantData : [];
        
        console.log("Offsite data counts:", {
          offsiteData: offsiteData.length,
          offsitePlants: offsitePlants.length
        });

        // Create a map of offsite orders by ID
        const offsiteOrderMap = {};
        offsiteData.forEach(order => {
          if (order && order.id) {
            offsiteOrderMap[order.id] = {
              customer_id: order.customer_id,
              customer_name: order.name || "Unknown Customer"
            };
            console.log(`Mapped offsite order ${order.id} to customer ${order.customer_id}`);
          }
        });

        // Group offsite plants by customer_id AND order_id
        const offsitePlantsByCustomer = {};
        offsitePlants.forEach(item => {
          if (item && item.id && offsiteOrderMap[item.id]) {
            const orderInfo = offsiteOrderMap[item.id];
            const customerId = orderInfo.customer_id;
            
            if (!offsitePlantsByCustomer[customerId]) {
              offsitePlantsByCustomer[customerId] = {
                customer_id: customerId,
                customer_name: orderInfo.customer_name,
                plants: []
              };
            }
            
            offsitePlantsByCustomer[customerId].plants.push(item);
            console.log(`Added offsite plant to customer ${customerId} from order ${item.id}`);
          }
        });

        // Get all unique offsite customer IDs
        const offsiteCustomerIds = Object.keys(offsitePlantsByCustomer);
        console.log("Offsite customer IDs:", offsiteCustomerIds);

        // Get all unique onsite customer IDs
        const onsiteCustomerIds = new Set([
          ...groupedNeedNutrients.map(g => g.id),
          ...groupedSuppliedNutrients.map(g => g.id),
          ...groupedSuppliedPlants.map(g => g.id),
          ...groupedSuppliedChargeable.map(g => g.id),
          ...groupedNeedChargeable.map(g => g.id)
        ]);
        console.log("Onsite customer IDs:", Array.from(onsiteCustomerIds));

        // Initialize grand totals
        let grandTotalSuppliedNutrients = { leafy: 0, fruiting: 0, other: 0, total: 0 };
        let grandTotalSuppliedPlants = 0;
        let grandTotalSuppliedChargeableItems = 0;
        let grandTotalOffsitePlants = 0;

        // ========== OFFSITE DATA SECTION ==========
        if (offsiteCustomerIds.length > 0) {
          console.log("Rendering offsite data section");
          
          checkPageBreak(60);

          doc.setFontSize(14);
          doc.setFont(undefined, "bold");
          doc.setTextColor(0, 100, 0);
          doc.text("OFFSITE DATA SECTION", pageWidth / 2 + 10, yPos, { align: "center" });
          doc.setTextColor(0, 0, 0);
          yPos += 15;
          
          doc.setFontSize(9);
          doc.setFont(undefined, "italic");
          doc.text("(Items supplied for offsite/non-hydroponic use)", pageWidth / 2 + 10, yPos, { align: "center" });
          yPos += 10;

          for (let groupIndex = 0; groupIndex < offsiteCustomerIds.length; groupIndex++) {
            const customerId = offsiteCustomerIds[groupIndex];
            const customerData = offsitePlantsByCustomer[customerId];
            
            console.log(`Rendering offsite customer ${groupIndex + 1}/${offsiteCustomerIds.length}:`, customerData.customer_name);
            
            checkPageBreak(60);

            doc.setFontSize(13);
            doc.setFont(undefined, "bold");
            doc.setTextColor(255, 102, 0);
            doc.text(`Customer: ${customerData.customer_name}`, margin, yPos);
            doc.setTextColor(0, 0, 0);
            yPos += 10;

            // Offsite Plants - UPDATED SEQUENCE: Order ID first, then Plant Name, then Quantity
            if (customerData.plants && customerData.plants.length > 0) {
              console.log(`Rendering ${customerData.plants.length} offsite plants`);
              
              checkPageBreak(40);

              doc.setFontSize(11);
              doc.setFont(undefined, "bold");
              doc.setTextColor(0, 100, 0);
              doc.text("Offsite Plants", margin, yPos);
              doc.setTextColor(0, 0, 0);
              yPos += 6;

              let offsitePlantTotal = 0;
              const offsitePlantTableBody = customerData.plants.map((i) => {
                const plant_name = i.plant_name;
                const other_plant_name = i.other_plant_name || "";
                const quantity = parseFloat(i.quantity) || 0;

                offsitePlantTotal += quantity;

                const displayName = plant_name === 'Others' && other_plant_name
                  ? other_plant_name
                  : plant_name || "Unknown Plant";

                // SEQUENCE: Order ID, Plant Name, Quantity
                return [
                  `#${i.id}`,  // Order ID first
                  displayName,   // Plant Name second
                  quantity ? `${quantity}` : "-"  // Quantity third
                ];
              });

              offsitePlantTableBody.push([
                { content: "Customer Total:", colSpan: 2, styles: { fontStyle: 'bold', halign: 'right' } },
                { content: `${offsitePlantTotal.toFixed(2)}`, styles: { fontStyle: 'bold' } }
              ]);

              grandTotalOffsitePlants += offsitePlantTotal;

              console.log("Rendering offsite plants table...");
              autoTable(doc, {
                startY: yPos,
                head: [["Order ID", "Plant Name", "Quantity"]],  // Updated headers
                body: offsitePlantTableBody,
                theme: "grid",
                styles: {
                  fontSize: 9,
                  cellPadding: 3,
                  lineColor: [0, 100, 0],
                  lineWidth: 0.2
                },
                headStyles: {
                  fillColor: [240, 255, 240],
                  textColor: [0, 100, 0],
                  fontStyle: 'bold',
                  lineWidth: 0.2,
                  lineColor: [0, 100, 0]
                },
                margin: { left: margin, right: margin }
              });

              if (doc.lastAutoTable) {
                yPos = doc.lastAutoTable.finalY + 15;
                console.log("After offsite plants table, yPos:", yPos);
              }
            }

            if (groupIndex < offsiteCustomerIds.length - 1) {
              checkPageBreak(15);
              
              doc.setDrawColor(0, 0, 0);
              doc.setLineWidth(0.2);
              doc.line(margin, yPos, pageWidth - margin, yPos);
              yPos += 10;
            }
          }
          
          checkPageBreak(20);
          doc.setDrawColor(0, 0, 0);
          doc.setLineWidth(0.5);
          doc.line(margin, yPos, pageWidth - margin, yPos);
          yPos += 15;
        } else {
          console.log("No offsite data to render");
        }

        // ========== REGULAR ONSITE DATA ==========
        console.log("Starting onsite data section, current yPos:", yPos);
        
        const onsiteCustomerArray = Array.from(onsiteCustomerIds);
        console.log("Onsite customers to render:", onsiteCustomerArray);
        
        if (onsiteCustomerArray.length > 0) {
          console.log("Rendering onsite data section");
          
          checkPageBreak(60);

          doc.setFontSize(14);
          doc.setFont(undefined, "bold");
          doc.setTextColor(255, 102, 0);
          doc.text("REGULAR ONSITE DATA SECTION", pageWidth / 2 + 10, yPos, { align: "center" });
          doc.setTextColor(0, 0, 0);
          yPos += 15;

          for (let customerIndex = 0; customerIndex < onsiteCustomerArray.length; customerIndex++) {
            const customerId = onsiteCustomerArray[customerIndex];
            const customerSuppliedNutrients = groupedSuppliedNutrients.find(g => g.id === customerId);
            const customerSuppliedPlants = groupedSuppliedPlants.find(g => g.id === customerId);
            const customerSuppliedChargeable = groupedSuppliedChargeable.find(g => g.id === customerId);

            let customerName = "Unknown Customer";
            if (customerSuppliedNutrients) customerName = customerSuppliedNutrients.name;
            else if (customerSuppliedPlants) customerName = customerSuppliedPlants.name;
            else if (customerSuppliedChargeable) customerName = customerSuppliedChargeable.name;

            console.log(`Rendering onsite customer ${customerIndex + 1}/${onsiteCustomerArray.length}:`, customerName);
            
            checkPageBreak(60);

            doc.setFontSize(13);
            doc.setFont(undefined, "bold");
            doc.setTextColor(255, 102, 0);
            doc.text(`Customer: ${customerName}`, margin, yPos);
            doc.setTextColor(0, 0, 0);
            yPos += 10;

            // Supplied Plants - Keep original sequence for onsite
            if (customerSuppliedPlants && customerSuppliedPlants.items && customerSuppliedPlants.items.length > 0) {
              console.log(`Rendering ${customerSuppliedPlants.items.length} supplied plants`);
              
              checkPageBreak(40);

              doc.setFontSize(11);
              doc.setFont(undefined, "bold");
              doc.setTextColor(255, 102, 0);
              doc.text("Supplied Plants", margin, yPos);
              doc.setTextColor(0, 0, 0);
              yPos += 6;

              let customerSuppliedPlantTotal = 0;
              const suppliedPlantTableBody = customerSuppliedPlants.items.map((i) => {
                const plant_name = i.plant_name;
                const other_plant_name = i.other_plant_name || "";
                const quantity = parseFloat(i.quantity) || 0;

                customerSuppliedPlantTotal += quantity;

                const displayName = plant_name === 'Others' && other_plant_name
                  ? other_plant_name
                  : plant_name || "Unknown Plant";

                return [
                  displayName,
                  quantity ? `${quantity}` : "-"
                ];
              });

              suppliedPlantTableBody.push([
                { content: "Customer Total:", styles: { fontStyle: 'bold' } },
                { content: `${customerSuppliedPlantTotal.toFixed(2)}`, styles: { fontStyle: 'bold' } }
              ]);

              grandTotalSuppliedPlants += customerSuppliedPlantTotal;

              console.log("Rendering supplied plants table...");
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
                margin: { left: margin, right: margin }
              });

              if (doc.lastAutoTable) {
                yPos = doc.lastAutoTable.finalY + 15;
                console.log("After supplied plants table, yPos:", yPos);
              }
            }

            // Supplied Nutrients
            if (customerSuppliedNutrients && customerSuppliedNutrients.items && customerSuppliedNutrients.items.length > 0) {
              console.log(`Rendering ${customerSuppliedNutrients.items.length} supplied nutrients`);
              
              checkPageBreak(40);

              doc.setFontSize(11);
              doc.setFont(undefined, "bold");
              doc.setTextColor(255, 102, 0);
              doc.text("Supplied Nutrients", margin, yPos);
              doc.setTextColor(0, 0, 0);
              yPos += 6;

              let customerSuppliedNutrientTotal = 0;
              const suppliedTableBody = customerSuppliedNutrients.items.map((i) => {
                const tankCap = parseFloat(i.tank_capacity) || 0;
                const topups = parseFloat(i.topups) || 0;
                const total = tankCap * topups;
                const nutrientType = (i.nutrient_type || "").toLowerCase();

                customerSuppliedNutrientTotal += total;

                if (nutrientType === "leafy") {
                  grandTotalSuppliedNutrients.leafy += total;
                } else if (nutrientType === "fruiting") {
                  grandTotalSuppliedNutrients.fruiting += total;
                } else {
                  grandTotalSuppliedNutrients.other += total;
                }
                grandTotalSuppliedNutrients.total += total;

                return [
                  i.nutrient_type || "-",
                  tankCap ? `${tankCap} Ltr` : "-",
                  topups || "-",
                  total ? `${total.toFixed(2)} Ltr` : "-"
                ];
              });

              suppliedTableBody.push([
                { content: "Customer Total:", colSpan: 3, styles: { fontStyle: 'bold', halign: 'right' } },
                { content: `${customerSuppliedNutrientTotal.toFixed(2)} Ltr`, styles: { fontStyle: 'bold' } }
              ]);

              console.log("Rendering supplied nutrients table...");
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
                margin: { left: margin, right: margin }
              });

              if (doc.lastAutoTable) {
                yPos = doc.lastAutoTable.finalY + 15;
                console.log("After supplied nutrients table, yPos:", yPos);
              }
            }

            if (customerIndex < onsiteCustomerArray.length - 1) {
              checkPageBreak(15);

              doc.setDrawColor(0, 0, 0);
              doc.setLineWidth(0.2);
              doc.line(margin, yPos, pageWidth - margin, yPos);
              yPos += 10;
            }
          }
        } else {
          console.log("No onsite data to render");
          checkPageBreak(20);
          
          doc.setFontSize(12);
          doc.setFont(undefined, "italic");
          doc.setTextColor(100, 100, 100);
          doc.text("No regular onsite data found for the selected date range.", margin, yPos);
          doc.setTextColor(0, 0, 0);
          yPos += 15;
        }
        
        // ========== GRAND TOTALS ==========
        console.log("Rendering grand totals, current yPos:", yPos);
        
        checkPageBreak(120);

        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.5);
        doc.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 10;

        doc.setFontSize(14);
        doc.setFont(undefined, "bold");
        doc.setTextColor(255, 102, 0);
        doc.text("GRAND TOTALS (All Customers)", margin, yPos);
        doc.setTextColor(0, 0, 0);
        yPos += 10;

        // Build grand totals dynamically
        const grandTotalsData = [];

        // Add onsite totals if they exist
        const hasOnsiteNutrients = grandTotalSuppliedNutrients.total > 0;
        const hasOnsitePlants = grandTotalSuppliedPlants > 0;

        if (hasOnsiteNutrients || hasOnsitePlants) {
          grandTotalsData.push(
            [{ content: "REGULAR ONSITE DATA:", colSpan: 2, styles: { fontStyle: 'bold', fontSize: 11, textColor: [255, 102, 0] } }]
          );

          if (grandTotalSuppliedNutrients.total > 0) {
            grandTotalsData.push(
              ["Supplied Nutrients - Leafy:", `${grandTotalSuppliedNutrients.leafy.toFixed(2)} Ltr`],
              ["Supplied Nutrients - TOTAL:", `${grandTotalSuppliedNutrients.total.toFixed(2)} Ltr`]
            );
          }

          if (grandTotalSuppliedPlants > 0) {
            grandTotalsData.push(["Supplied Plants Total:", `${grandTotalSuppliedPlants.toFixed(2)} units`]);
          }
        }

        // Add offsite totals if they exist
        if (grandTotalOffsitePlants > 0) {
          if (grandTotalsData.length > 0) {
            grandTotalsData.push(["", ""]);
          }

          grandTotalsData.push(
            [{ content: "OFFSITE DATA:", colSpan: 2, styles: { fontStyle: 'bold', fontSize: 11, textColor: [0, 100, 0] } }]
          );

          grandTotalsData.push(["Offsite Plants Total:", `${grandTotalOffsitePlants.toFixed(2)} units`]);
        }

        // If no data at all, show a message
        if (grandTotalsData.length === 0) {
          grandTotalsData.push(["No data found for the selected date range", ""]);
        }

        console.log("Grand totals data:", grandTotalsData);

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
          margin: { left: margin, right: margin }
        });

        if (doc.lastAutoTable) {
          yPos = doc.lastAutoTable.finalY + 15;
          console.log("After grand totals, yPos:", yPos);
        }

        // Add notes after Grand Totals
        doc.setFontSize(9);
        doc.setFont(undefined, "italic");
        doc.text("Note: Offsite data represents items supplied for non-hydroponic/offsite use.", margin, yPos);
        yPos += 5;
        doc.text("Regular data represents items for standard hydroponic systems.", margin, yPos);
        yPos += 10;
        
        console.log("Finished rendering all sections, yPos:", yPos);
        
      } catch (innerError) {
        console.error("Error in RAW Material report rendering:", innerError);
        console.error("Error stack:", innerError.stack);
        throw innerError;
      }
    }

    // Update totalPages to the actual last page
    totalPages = doc.getNumberOfPages();
    console.log("Total pages generated:", totalPages);
    
    // Add footer at the bottom of the last page
    console.log("Adding footer");
    addFooterAtBottom();

    // Add logo to all pages
    console.log("Adding logos to all pages");
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      if (i > 1) {
        await addLogoToPage(i);
      }
    }

    const safeReportName = selectedReport.replace(/\s+/g, "_").replace(/[^\w-_]/g, "");
    const fileName = `${safeReportName}_Report_${startDate}_to_${endDate}.pdf`;
    console.log("Saving PDF as:", fileName);
    
    // Save the PDF
    doc.save(fileName);
    console.log("=== PDF GENERATION COMPLETE ===");
    
  } catch (error) {
    console.error("=== PDF GENERATION ERROR ===");
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    console.error("Error details:", error);
    alert(`Error generating PDF: ${error.message}. Please check the console for details.`);
  }
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
            className="px-4 py-2 btn-primary "
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