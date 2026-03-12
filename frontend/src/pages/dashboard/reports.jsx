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
    if (!data || data.status !== "success") {
      alert("Report data not ready");
      return;
    }

    try {
      const doc = new jsPDF("p", "mm", "a4");
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

      // FIXED: Group offsite data by customer_id instead of offsite_id
      const groupOffsiteDataByCustomer = () => {
        // Create a map of customer_id to customer name from offsiteData
        const customerInfoMap = {};
        if (Array.isArray(data.offsiteData)) {
          data.offsiteData.forEach(offsite => {
            if (offsite && offsite.customer_id) {
              customerInfoMap[offsite.customer_id] = {
                customer_name: offsite.name || offsite.customer_name || "Unknown Customer",
                offsite_ids: customerInfoMap[offsite.customer_id]?.offsite_ids || []
              };
              if (offsite.id) {
                customerInfoMap[offsite.customer_id].offsite_ids.push(offsite.id);
              }
            }
          });
        }
        
        // Group all offsite data by customer_id
        const groupedByCustomer = {};
        
        // Process offsite nutrients
        if (Array.isArray(data.offsiteNutrients)) {
          data.offsiteNutrients.forEach(item => {
            if (item && item.customer_id) {
              const customerId = item.customer_id;
              const customerName = item.name || customerInfoMap[customerId]?.customer_name || "Unknown Customer";
              
              if (!groupedByCustomer[customerId]) {
                groupedByCustomer[customerId] = {
                  customer_id: customerId,
                  customer_name: customerName,
                  nutrients: [],
                  plants: [],
                  chargeable_items: []
                };
              }
              
              groupedByCustomer[customerId].nutrients.push(item);
            }
          });
        }
        
        // Process offsite plant data
        if (Array.isArray(data.offsiteSupplientPlantData)) {
          data.offsiteSupplientPlantData.forEach(item => {
            if (item && item.customer_id) {
              const customerId = item.customer_id;
              const customerName = item.name || customerInfoMap[customerId]?.customer_name || "Unknown Customer";
              
              if (!groupedByCustomer[customerId]) {
                groupedByCustomer[customerId] = {
                  customer_id: customerId,
                  customer_name: customerName,
                  nutrients: [],
                  plants: [],
                  chargeable_items: []
                };
              }
              
              groupedByCustomer[customerId].plants.push(item);
            }
          });
        }
        
        // Process offsite chargeable items
        if (Array.isArray(data.offsiteChargeableItems)) {
          data.offsiteChargeableItems.forEach(item => {
            if (item && item.customer_id) {
              const customerId = item.customer_id;
              const customerName = item.name || customerInfoMap[customerId]?.customer_name || "Unknown Customer";
              
              if (!groupedByCustomer[customerId]) {
                groupedByCustomer[customerId] = {
                  customer_id: customerId,
                  customer_name: customerName,
                  nutrients: [],
                  plants: [],
                  chargeable_items: []
                };
              }
              
              groupedByCustomer[customerId].chargeable_items.push(item);
            }
          });
        }
        
        return Object.values(groupedByCustomer);
      };

      // Page break check
      const checkPageBreak = (requiredSpace = 20) => {
        const spaceNeeded = requiredSpace + 10;
        if (yPos > pageHeight - footerHeight - spaceNeeded) {
          doc.addPage();
          currentPage++;
          yPos = contentStartY;
          addLogoToPage(currentPage);
          return true;
        }
        return false;
      };

      // Function to add footer at the bottom of the last page
      const addFooterAtBottom = () => {
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
      await addLogoToPage(1);

      // Title
      doc.setFontSize(14);
      doc.setFont(undefined, "bold");
      doc.setTextColor(255, 102, 0);
      doc.text(`${selectedReport} Report`, pageWidth / 2 + 10, yPos, { align: "center" });
      doc.setTextColor(0, 0, 0);
      yPos += 10;

      // Date range
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
          const groupedByCustomer = {};
          clientData.forEach(item => {
            if (item && item.name) {
              if (!groupedByCustomer[item.name]) {
                groupedByCustomer[item.name] = [];
              }
              groupedByCustomer[item.name].push(item);
            }
          });

          Object.entries(groupedByCustomer).forEach(([customerName, records], customerIndex) => {
            if (checkPageBreak(50)) return;

            doc.setFontSize(13);
            doc.setFont(undefined, "bold");
            doc.setTextColor(255, 102, 0);
            doc.text(`Customer: ${customerName}`, margin, yPos);
            doc.setTextColor(0, 0, 0);
            yPos += 10;

            doc.setFontSize(11);
            doc.setFont(undefined, "bold");
            doc.setTextColor(255, 102, 0);
            doc.text("Performance Ratings", margin, yPos);
            doc.setTextColor(0, 0, 0);
            yPos += 6;

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
              margin: { left: margin, right: margin }
            });

            yPos = doc.lastAutoTable.finalY + 15;

            const totalRating = records.reduce((sum, record) => sum + (parseFloat(record.site_rating) || 0), 0);
            const avgRating = records.length > 0 ? totalRating / records.length : 0;

            if (checkPageBreak(15)) return;

            doc.setFontSize(10);
            doc.setFont(undefined, "bold");
            doc.text(`Average Rating: ${avgRating.toFixed(1)}/5`, margin, yPos);
            yPos += 15;

            if (customerIndex < Object.keys(groupedByCustomer).length - 1) {
              if (checkPageBreak(15)) return;

              doc.setDrawColor(0, 0, 0);
              doc.setLineWidth(0.2);
              doc.line(margin, yPos, pageWidth - margin, yPos);
              yPos += 10;
            }
          });

          if (checkPageBreak(60)) return;

          doc.setFontSize(13);
          doc.setFont(undefined, "bold");
          doc.setTextColor(255, 102, 0);
          doc.text("Summary Statistics", margin, yPos);
          doc.setTextColor(0, 0, 0);
          yPos += 10;

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
            margin: { left: margin, right: margin }
          });

          yPos = doc.lastAutoTable.finalY + 10;
        }
      }

      /* =====================
         RAW MATERIAL REPORT
         ===================== */
      else if (selectedReport === "RAW Material") {
        // Initialize with empty arrays if data is missing
        const needNutrients = Array.isArray(data.need_nutrients) ? data.need_nutrients : [];
        const suppliedNutrients = Array.isArray(data.supplied_nutrients) ? data.supplied_nutrients : [];
        const suppliedPlants = Array.isArray(data.supplied_plants) ? data.supplied_plants : [];
        const suppliedChargeableItem = Array.isArray(data.supplied_chargeable_item) ? data.supplied_chargeable_item : [];
        const needChargeableItem = Array.isArray(data.need_chargeable_item) ? data.need_chargeable_item : [];
        
        const groupedNeed = groupByCustomer(needNutrients);
        const groupedSupplied = groupByCustomer(suppliedNutrients);
        const groupedPlants = groupByCustomer(suppliedPlants);
        const groupedChargeableItem = groupByCustomer(suppliedChargeableItem);
        const groupedNeedChargeableItem = groupByCustomer(needChargeableItem);
        
        // Use the new grouping function
        const offsiteGroups = groupOffsiteDataByCustomer();

        // Initialize grand totals
        let grandTotalSuppliedNutrients = {
          leafy: 0,
          fruiting: 0,
          other: 0,
          total: 0
        };
        
        let grandTotalNeedNutrients = {
          leafy: 0,
          fruiting: 0,
          other: 0,
          total: 0
        };
        
        let grandTotalSuppliedPlants = 0;
        let grandTotalNeedPlants = 0;
        let grandTotalSuppliedChargeableItems = 0;
        let grandTotalNeedChargeableItems = 0;
        
        let grandTotalOffsiteNutrients = {
          leafy: 0,
          fruiting: 0,
          other: 0,
          total: 0
        };
        
        let grandTotalOffsiteChargeableItems = 0;
        let grandTotalOffsitePlants = 0;

        // ========== OFFSITE DATA ==========
        if (offsiteGroups.length > 0) {
          if (checkPageBreak(60)) return;

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

          offsiteGroups.forEach((offsiteGroup, groupIndex) => {
            if (checkPageBreak(60)) return;

            doc.setFontSize(13);
            doc.setFont(undefined, "bold");
            doc.setTextColor(255, 102, 0);
            doc.text(`Customer: ${offsiteGroup.customer_name}`, margin, yPos);
            doc.setTextColor(0, 0, 0);
            yPos += 10;

            // Offsite Nutrients
            if (offsiteGroup.nutrients.length > 0) {
              doc.setFontSize(11);
              doc.setFont(undefined, "bold");
              doc.setTextColor(0, 100, 0);
              doc.text("Offsite Nutrients", margin, yPos);
              doc.setTextColor(0, 0, 0);
              yPos += 6;

              let offsiteNutrientGroupTotal = 0;
              const offsiteNutrientTableBody = offsiteGroup.nutrients.map((i) => {
                const tankCap = parseFloat(i.tank_capacity) || 0;
                const topups = parseFloat(i.topups) || 0;
                const total = tankCap * topups;
                const nutrientType = (i.nutrient_type || "").toLowerCase();

                offsiteNutrientGroupTotal += total;

                if (nutrientType === "leafy") {
                  grandTotalOffsiteNutrients.leafy += total;
                } else if (nutrientType === "fruiting") {
                  grandTotalOffsiteNutrients.fruiting += total;
                } else {
                  grandTotalOffsiteNutrients.other += total;
                }
                grandTotalOffsiteNutrients.total += total;

                return [
                  i.nutrient_type || "-",
                  tankCap ? `${tankCap} Ltr` : "-",
                  topups || "-",
                  total ? `${total.toFixed(2)} Ltr` : "-"
                ];
              });

              offsiteNutrientTableBody.push([
                { content: "Customer Total:", colSpan: 3, styles: { fontStyle: 'bold', halign: 'right' } },
                { content: `${offsiteNutrientGroupTotal.toFixed(2)} Ltr`, styles: { fontStyle: 'bold' } }
              ]);

              autoTable(doc, {
                startY: yPos,
                head: [["Nutrient Type", "Tank Capacity", "Topups", "Total (Ltr)"]],
                body: offsiteNutrientTableBody,
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

              yPos = doc.lastAutoTable.finalY + 15;
            }

            // Offsite Plants
            if (offsiteGroup.plants.length > 0) {
              if (checkPageBreak(40)) return;

              doc.setFontSize(11);
              doc.setFont(undefined, "bold");
              doc.setTextColor(0, 100, 0);
              doc.text("Offsite Plants", margin, yPos);
              doc.setTextColor(0, 0, 0);
              yPos += 6;

              let offsitePlantGroupTotal = 0;
              const offsitePlantTableBody = offsiteGroup.plants.map((i) => {
                const plant_name = i.plant_name;
                const other_plant_name = i.other_plant_name || "";
                const quantity = parseFloat(i.quantity) || 0;

                offsitePlantGroupTotal += quantity;

                const displayName = plant_name === 'Others' && other_plant_name
                  ? other_plant_name
                  : plant_name || "Unknown Plant";

                return [
                  displayName,
                  quantity ? `${quantity}` : "-",
                ];
              });

              offsitePlantTableBody.push([
                { content: "Customer Total:", styles: { fontStyle: 'bold' } },
                { content: `${offsitePlantGroupTotal.toFixed(2)}`, styles: { fontStyle: 'bold' } }
              ]);

              grandTotalOffsitePlants += offsitePlantGroupTotal;

              autoTable(doc, {
                startY: yPos,
                head: [["Plant Name", "Quantity"]],
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

              yPos = doc.lastAutoTable.finalY + 15;
            }

            // Offsite Chargeable Items
            if (offsiteGroup.chargeable_items.length > 0) {
              if (checkPageBreak(40)) return;

              doc.setFontSize(11);
              doc.setFont(undefined, "bold");
              doc.setTextColor(0, 100, 0);
              doc.text("Offsite Chargeable Items", margin, yPos);
              doc.setTextColor(0, 0, 0);
              yPos += 6;

              let offsiteChargeableGroupTotal = 0;
              const offsiteChargeableTableBody = offsiteGroup.chargeable_items.map((i) => {
                const item_name = i.item_name;
                const other_item_name = i.other_item_name || "";
                const quantity = parseFloat(i.quantity) || 0;

                offsiteChargeableGroupTotal += quantity;

                const displayName = item_name === 'Others' && other_item_name
                  ? other_item_name
                  : item_name || "Unknown Item";

                return [
                  displayName,
                  quantity ? `${quantity}` : "-",
                ];
              });

              offsiteChargeableTableBody.push([
                { content: "Customer Total:", styles: { fontStyle: 'bold' } },
                { content: `${offsiteChargeableGroupTotal.toFixed(2)}`, styles: { fontStyle: 'bold' } }
              ]);

              grandTotalOffsiteChargeableItems += offsiteChargeableGroupTotal;

              autoTable(doc, {
                startY: yPos,
                head: [["Item Name", "Quantity"]],
                body: offsiteChargeableTableBody,
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

              yPos = doc.lastAutoTable.finalY + 15;
            }

            if (groupIndex < offsiteGroups.length - 1) {
              if (checkPageBreak(15)) return;
              
              doc.setFontSize(10);
              doc.setFont(undefined, "bold");
              doc.setTextColor(0, 100, 0);
              doc.text("--- Next Customer ---", pageWidth / 2 + 10, yPos, { align: "center" });
              doc.setTextColor(0, 0, 0);
              yPos += 15;
            }
          });
          
          if (checkPageBreak(20)) return;
          doc.setDrawColor(0, 0, 0);
          doc.setLineWidth(0.5);
          doc.line(margin, yPos, pageWidth - margin, yPos);
          yPos += 15;
        }

        // ========== REGULAR HYDROPONIC DATA ==========
        if (groupedNeed.length > 0 || groupedSupplied.length > 0 || groupedPlants.length > 0 || 
            groupedChargeableItem.length > 0 || groupedNeedChargeableItem.length > 0) {
          
          if (checkPageBreak(60)) return;

          doc.setFontSize(14);
          doc.setFont(undefined, "bold");
          doc.setTextColor(255, 102, 0);
          doc.text("REGULAR ONSITE DATA SECTION", pageWidth / 2 + 10, yPos, { align: "center" });
          doc.setTextColor(0, 0, 0);
          yPos += 15;

          const allRegularCustomers = new Set();
          
          groupedNeed.forEach(c => c && c.id && allRegularCustomers.add(c.id));
          groupedSupplied.forEach(c => c && c.id && allRegularCustomers.add(c.id));
          groupedPlants.forEach(c => c && c.id && allRegularCustomers.add(c.id));
          groupedChargeableItem.forEach(c => c && c.id && allRegularCustomers.add(c.id));
          groupedNeedChargeableItem.forEach(c => c && c.id && allRegularCustomers.add(c.id));

          const allRegularCustomersArray = Array.from(allRegularCustomers);

          allRegularCustomersArray.forEach((customerId, customerIndex) => {
            const customerNeed = groupedNeed.find((s) => s && s.id === customerId);
            const customerSupplied = groupedSupplied.find((s) => s && s.id === customerId);
            const customerPlants = groupedPlants.find((s) => s && s.id === customerId);
            const customerChargeableItem = groupedChargeableItem.find((s) => s && s.id === customerId);
            const customerNeedChargeableItem = groupedNeedChargeableItem.find((s) => s && s.id === customerId);

            let customerName = "Unknown Customer";
            if (customerNeed) customerName = customerNeed.name;
            else if (customerSupplied) customerName = customerSupplied.name;
            else if (customerPlants) customerName = customerPlants.name;
            else if (customerChargeableItem) customerName = customerChargeableItem.name;
            else if (customerNeedChargeableItem) customerName = customerNeedChargeableItem.name;

            if (checkPageBreak(60)) return;

            doc.setFontSize(13);
            doc.setFont(undefined, "bold");
            doc.setTextColor(255, 102, 0);
            doc.text(`Customer: ${customerName}`, margin, yPos);
            doc.setTextColor(0, 0, 0);
            yPos += 10;

            // Need Chargeable Items
            if (customerNeedChargeableItem && customerNeedChargeableItem.items && customerNeedChargeableItem.items.length > 0) {
              if (checkPageBreak(40)) return;

              doc.setFontSize(11);
              doc.setFont(undefined, "bold");
              doc.setTextColor(255, 102, 0);
              doc.text("Need Chargeable Items", margin, yPos);
              doc.setTextColor(0, 0, 0);
              yPos += 6;

              let customerNeedChargeableTotal = 0;
              const needChargeableItemTableBody = customerNeedChargeableItem.items.map((i) => {
                const item_name = i.item_name || "";
                const other_item_name = i.other_item_name || "";
                const quantity = parseFloat(i.quantity) || 0;

                customerNeedChargeableTotal += quantity;

                const displayName = item_name === 'Others' && other_item_name
                  ? other_item_name
                  : item_name || "Unknown Item";

                return [
                  displayName,
                  quantity ? `${quantity}` : "-",
                ];
              });

              needChargeableItemTableBody.push([
                { content: "Customer Total:", styles: { fontStyle: 'bold' } },
                { content: `${customerNeedChargeableTotal.toFixed(2)}`, styles: { fontStyle: 'bold' } }
              ]);

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
                margin: { left: margin, right: margin }
              });

              yPos = doc.lastAutoTable.finalY + 15;
            }

            // Supplied Plants
            if (customerPlants && customerPlants.items && customerPlants.items.length > 0) {
              if (checkPageBreak(40)) return;

              doc.setFontSize(11);
              doc.setFont(undefined, "bold");
              doc.setTextColor(255, 102, 0);
              doc.text("Supplied Plants", margin, yPos);
              doc.setTextColor(0, 0, 0);
              yPos += 6;

              let customerSuppliedPlantTotal = 0;
              const suppliedPlantTableBody = customerPlants.items.map((i) => {
                const plant_name = i.plant_name;
                const quantity = parseFloat(i.quantity) || 0;

                customerSuppliedPlantTotal += quantity;

                return [
                  plant_name ? `${plant_name}` : "-",
                  quantity ? `${quantity}` : "-",
                ];
              });

              suppliedPlantTableBody.push([
                { content: "Customer Total:", styles: { fontStyle: 'bold' } },
                { content: `${customerSuppliedPlantTotal.toFixed(2)}`, styles: { fontStyle: 'bold' } }
              ]);

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
                margin: { left: margin, right: margin }
              });

              yPos = doc.lastAutoTable.finalY + 15;
            }

            // Supplied Nutrients
            if (customerSupplied && customerSupplied.items && customerSupplied.items.length > 0) {
              if (checkPageBreak(40)) return;

              doc.setFontSize(11);
              doc.setFont(undefined, "bold");
              doc.setTextColor(255, 102, 0);
              doc.text("Supplied Nutrients", margin, yPos);
              doc.setTextColor(0, 0, 0);
              yPos += 6;

              let customerSuppliedNutrientTotal = 0;
              const suppliedTableBody = customerSupplied.items.map((i) => {
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

              yPos = doc.lastAutoTable.finalY + 15;
            }

            // Supplied Chargeable Items
            if (customerChargeableItem && customerChargeableItem.items && customerChargeableItem.items.length > 0) {
              if (checkPageBreak(40)) return;

              doc.setFontSize(11);
              doc.setFont(undefined, "bold");
              doc.setTextColor(255, 102, 0);
              doc.text("Supplied Chargeable Items", margin, yPos);
              doc.setTextColor(0, 0, 0);
              yPos += 6;

              let customerSuppliedChargeableTotal = 0;
              const suppliedChargeableItemTableBody = customerChargeableItem.items.map((i) => {
                const item_name = i.item_name;
                const other_item_name = i.other_item_name;
                const quantity = parseFloat(i.quantity) || 0;

                customerSuppliedChargeableTotal += quantity;

                const displayName = item_name === 'Others' && other_item_name
                  ? other_item_name
                  : item_name || "Unknown Item";

                return [
                  displayName,
                  quantity ? `${quantity}` : "-",
                ];
              });

              suppliedChargeableItemTableBody.push([
                { content: "Customer Total:", styles: { fontStyle: 'bold' } },
                { content: `${customerSuppliedChargeableTotal.toFixed(2)}`, styles: { fontStyle: 'bold' } }
              ]);

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
                margin: { left: margin, right: margin }
              });

              yPos = doc.lastAutoTable.finalY + 15;
            }

            // Need Nutrients
            if (customerNeed && customerNeed.items && customerNeed.items.length > 0) {
              if (checkPageBreak(40)) return;

              doc.setFontSize(11);
              doc.setFont(undefined, "bold");
              doc.setTextColor(255, 102, 0);
              doc.text("Need Nutrients", margin, yPos);
              doc.setTextColor(0, 0, 0);
              yPos += 6;

              const needTableBody = customerNeed.items.map((i) => {
                const tankCap = parseFloat(i.tank_capacity) || 0;
                const topups = parseFloat(i.topups) || 0;
                const total = tankCap * topups;
                const nutrientType = (i.nutrient_type || "").toLowerCase();

                if (nutrientType === "leafy") {
                  grandTotalNeedNutrients.leafy += total;
                } else if (nutrientType === "fruiting") {
                  grandTotalNeedNutrients.fruiting += total;
                } else {
                  grandTotalNeedNutrients.other += total;
                }
                grandTotalNeedNutrients.total += total;

                return [
                  i.nutrient_type || "-",
                  tankCap ? `${tankCap} Ltr` : "-",
                  topups || "-",
                  total ? `${total.toFixed(2)} Ltr` : "-"
                ];
              });

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
                margin: { left: margin, right: margin }
              });

              yPos = doc.lastAutoTable.finalY + 15;
            }

            if (customerIndex < allRegularCustomersArray.length - 1) {
              if (checkPageBreak(15)) return;

              doc.setDrawColor(0, 0, 0);
              doc.setLineWidth(0.2);
              doc.line(margin, yPos, pageWidth - margin, yPos);
              yPos += 10;
            }
          });
        }
        
        // ========== GRAND TOTALS ==========
        if (checkPageBreak(120)) {
          totalPages = currentPage;
        }

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

        const grandTotalsData = [
          [{ content: "REGULAR ONSITE DATA:", colSpan: 2, styles: { fontStyle: 'bold', fontSize: 11, textColor: [255, 102, 0] } }],
          ["Supplied Nutrients - Leafy:", `${grandTotalSuppliedNutrients.leafy.toFixed(2)} Ltr`],
          ["Supplied Nutrients - Fruiting:", `${grandTotalSuppliedNutrients.fruiting.toFixed(2)} Ltr`],
          ["Supplied Nutrients - Other:", `${grandTotalSuppliedNutrients.other.toFixed(2)} Ltr`],
          ["Supplied Nutrients - TOTAL:", `${grandTotalSuppliedNutrients.total.toFixed(2)} Ltr`],
          ["", ""],
          ["Need Nutrients - Leafy:", `${grandTotalNeedNutrients.leafy.toFixed(2)} Ltr`],
          ["Need Nutrients - Fruiting:", `${grandTotalNeedNutrients.fruiting.toFixed(2)} Ltr`],
          ["Need Nutrients - Other:", `${grandTotalNeedNutrients.other.toFixed(2)} Ltr`],
          ["Need Nutrients - TOTAL:", `${grandTotalNeedNutrients.total.toFixed(2)} Ltr`],
          ["", ""],
          ["Supplied Plants Total:", `${grandTotalSuppliedPlants.toFixed(2)} units`],
          ["Need Plants Total:", `${grandTotalNeedPlants.toFixed(2)} units`],
          ["", ""],
          ["Supplied Chargeable Items Total:", `${grandTotalSuppliedChargeableItems.toFixed(2)} units`],
          ["Need Chargeable Items Total:", `${grandTotalNeedChargeableItems.toFixed(2)} units`]
        ];

        // Add offsite totals if there is any offsite data
        if (grandTotalOffsiteNutrients.total > 0 || grandTotalOffsitePlants > 0 || grandTotalOffsiteChargeableItems > 0) {
          grandTotalsData.push(
            ["", ""],
            [{ content: "OFFSITE DATA:", colSpan: 2, styles: { fontStyle: 'bold', fontSize: 11, textColor: [0, 100, 0] } }]
          );
          
          if (grandTotalOffsiteNutrients.total > 0) {
            grandTotalsData.push(
              ["Offsite Nutrients - Leafy:", `${grandTotalOffsiteNutrients.leafy.toFixed(2)} Ltr`],
              ["Offsite Nutrients - Fruiting:", `${grandTotalOffsiteNutrients.fruiting.toFixed(2)} Ltr`],
              ["Offsite Nutrients - Other:", `${grandTotalOffsiteNutrients.other.toFixed(2)} Ltr`],
              ["Offsite Nutrients - TOTAL:", `${grandTotalOffsiteNutrients.total.toFixed(2)} Ltr`]
            );
          }
          
          if (grandTotalOffsitePlants > 0) {
            grandTotalsData.push(["Offsite Plants Total:", `${grandTotalOffsitePlants.toFixed(2)} units`]);
          }
          
          if (grandTotalOffsiteChargeableItems > 0) {
            grandTotalsData.push(["Offsite Chargeable Items Total:", `${grandTotalOffsiteChargeableItems.toFixed(2)} units`]);
          }
        }

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
            if (data.pageNumber > totalPages) {
              totalPages = data.pageNumber;
            }
          }
        });

        yPos = doc.lastAutoTable.finalY + 15;

        // Add notes after Grand Totals
        doc.setFontSize(9);
        doc.setFont(undefined, "italic");
        doc.text("Note: Offsite data represents items supplied for non-hydroponic/offsite use.", margin, yPos);
        yPos += 5;
        doc.text("Regular data represents items for standard hydroponic systems.", margin, yPos);
        yPos += 10;
      }

      // Update totalPages to the actual last page
      totalPages = doc.getNumberOfPages();
      
      // Add footer at the bottom of the last page
      addFooterAtBottom();

      // Add logo to all pages
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        if (i > 1) {
          await addLogoToPage(i);
        }
      }

      const safeReportName = selectedReport.replace(/\s+/g, "_").replace(/[^\w-_]/g, "");
      doc.save(`${safeReportName}_Report_${startDate}_to_${endDate}.pdf`);
      
    } catch (error) {
      console.error("PDF Generation Error:", error);
      console.error("Error stack:", error.stack);
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