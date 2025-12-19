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
            
            return [
              index + 1,
              record.id || "N/A",
              dateTime,
              ratingText,
              getRatingDescription(siteRating)
            ];
          });

          autoTable(doc, {
            startY: yPos,
            head: [["#", "ID", "Date & Time", "Site Rating", "Description"]],
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
            didDrawPage: function(data) {
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
        
        const ratingCounts = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0};
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
          didDrawPage: function(data) {
            yPos = data.cursor.y + 10;
          }
        });

        yPos = doc.lastAutoTable.finalY + 10;
      }
    }
    
    /* =====================
       NUTRIENT REPORTS (Existing code)
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
        const groupedNeed = groupByCustomer(data.need_nutrients);
        const groupedSupplied = groupByCustomer(data.supplied_nutrients);

        // Process each customer
        groupedNeed.forEach((customer, customerIndex) => {
          // Check if we need a new page
          checkPageBreak(60);

          // Customer name with orange section heading
          doc.setFontSize(13);
          doc.setFont(undefined, "bold");
          doc.setTextColor(255, 102, 0); // Orange
          doc.text(`Customer: ${customer.name}`, margin, yPos);
          doc.setTextColor(0, 0, 0); // Reset to black
          yPos += 10;

          /* NEED NUTRIENTS TABLE */
          doc.setFontSize(11);
          doc.setFont(undefined, "bold");
          doc.setTextColor(255, 102, 0); // Orange
          doc.text("Need Nutrients", margin, yPos);
          doc.setTextColor(0, 0, 0); // Reset to black
          yPos += 6;

          // Calculate total for each need nutrient
          const needTableBody = customer.items.map((i) => {
            const tankCap = parseFloat(i.tank_capacity) || 0;
            const topups = parseFloat(i.topups) || 0;
            const total = tankCap * topups;
            
            return [
              i.nutrient_type || "-",
              tankCap ? `${tankCap} Ltr` : "-",
              topups || "-",
              total ? `${total} Ltr` : "-"
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
            margin: { left: margin, right: margin },
            didDrawPage: function(data) {
              yPos = data.cursor.y + 10;
            }
          });

          yPos = doc.lastAutoTable.finalY + 10;

          /* SUPPLIED NUTRIENTS */
          const supplied = groupedSupplied.find((s) => s.id === customer.id);

          doc.setFontSize(11);
          doc.setFont(undefined, "bold");
          doc.setTextColor(255, 102, 0); // Orange
          doc.text("Supplied Nutrients", margin, yPos);
          doc.setTextColor(0, 0, 0); // Reset to black
          yPos += 6;

          if (supplied) {
            // Calculate total for each supplied nutrient
            const suppliedTableBody = supplied.items.map((i) => {
              const tankCap = parseFloat(i.tank_capacity) || 0;
              const topups = parseFloat(i.topups) || 0;
              const total = tankCap * topups;
              
              return [
                i.nutrient_type || "-",
                tankCap ? `${tankCap} Ltr` : "-",
                topups || "-",
                total ? `${total} Ltr` : "-"
              ];
            });

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
              didDrawPage: function(data) {
                yPos = data.cursor.y + 15;
              }
            });

            yPos = doc.lastAutoTable.finalY + 15;
          } else {
            doc.setFontSize(10);
            doc.setFont(undefined, "normal");
            doc.text("No supplied nutrients found.", margin, yPos);
            yPos += 15;
          }

          // Add separator line between customers
          if (customerIndex < groupedNeed.length - 1) {
            checkPageBreak(15);
            
            doc.setDrawColor(0, 0, 0);
            doc.setLineWidth(0.2);
            doc.line(margin, yPos, pageWidth - margin, yPos);
            yPos += 10;
          }
        });
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
    doc.textWithLink("8591753001", margin + 25, yPos, {
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
            <option value="RAW Material">RAW Material</option>
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
              className={`px-4 py-2 rounded-lg text-white ${
                reportData
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