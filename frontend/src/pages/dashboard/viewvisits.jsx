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
  const doc = new jsPDF();

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;

  let yPos = 40;

  // Helper: Add new page if needed
  const ensureSpace = (needed = 30) => {
    if (yPos + needed > pageHeight - 40) {
      doc.addPage();
      yPos = 20;
      return true; // Return true if new page was added
    }
    return false;
  };

  // Helper: Draw section header with style from second code
  const drawSectionHeader = (title) => {
    ensureSpace(30);

    doc.setFontSize(16);
    doc.setFont(undefined, "bold");
    doc.setTextColor(59, 130, 246);
    doc.text(title, margin, yPos);

    yPos += 6;
    doc.setLineWidth(0.3);
    doc.line(margin, yPos, pageWidth - margin, yPos);

    yPos += 10;
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, "normal");
  };

  // Helper: Draw key-value pairs with style from second code
  const drawKeyValuePairs = (data) => {
    ensureSpace(data.length * 10 + 10);

    data.forEach(item => {
      // Label (orange/bold)
      doc.setFont(undefined, "bold");
      doc.setTextColor(244, 166, 76);
      doc.text(`${item.label}:`, margin + 5, yPos);

      // Value (normal/black)
      doc.setFont(undefined, "normal");
      doc.setTextColor(0, 0, 0);
      const value = item.value !== undefined && item.value !== null ? String(item.value) : "-";
      doc.text(value, margin + 60, yPos);

      yPos += 8;
    });

    yPos += 5;
  };

  // Helper: Draw table with style from second code
  const drawTable = (items = [], columns = [], title = "") => {
    if (title) {
      ensureSpace(30);
      doc.setFontSize(14);
      doc.setFont(undefined, "bold");
      doc.setTextColor(59, 130, 246);
      doc.text(title, margin, yPos);
      yPos += 6;
      doc.setLineWidth(0.3);
      doc.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 10;
    }

    if (!Array.isArray(items) || items.length === 0) {
      ensureSpace(20);
      doc.setFontSize(10);
      doc.setFont(undefined, "normal");
      doc.text("No data available", margin, yPos);
      yPos += 15;
      return;
    }

    // Table headers with orange color
    ensureSpace(30);
    doc.setFontSize(10);
    doc.setFont(undefined, "bold");
    doc.setTextColor(244, 166, 76);

    let xPos = margin + 5;
    columns.forEach(col => {
      doc.text(col.header || col.key, xPos, yPos);
      xPos += col.width || 40;
    });

    yPos += 8;
    doc.setLineWidth(0.2);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 5;

    // Table rows
    doc.setFontSize(9);
    doc.setFont(undefined, "normal");
    doc.setTextColor(0, 0, 0);

    items.forEach((item, index) => {
      ensureSpace(15);

      xPos = margin + 5;
      columns.forEach(col => {
        const raw = item[col.key];
        const value = col.valueGetter ?
          col.valueGetter(item) :
          (raw === undefined || raw === null ? "-" : String(raw));

        doc.text(value, xPos, yPos);
        xPos += col.width || 40;
      });

      yPos += 8;

      // Add separator line between rows
      if (index < items.length - 1) {
        doc.setLineWidth(0.1);
        doc.line(margin + 10, yPos, pageWidth - margin - 10, yPos);
        yPos += 5;
      }
    });

    yPos += 10;
  };

  // Helper function to load image
  const loadImageToDataURL = async (imageUrl) => {
    try {
      console.log('Attempting to load image from:', imageUrl);
      
      const response = await fetch(imageUrl, {
        method: 'GET',
        cache: 'no-cache',
        headers: {
          'Accept': 'image/*'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const blob = await response.blob();
      
      if (blob.size === 0) {
        throw new Error('Empty image blob');
      }
      
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('Failed to read blob as DataURL'));
        reader.readAsDataURL(blob);
      });
      
      console.log('Successfully loaded image');
      return dataUrl;
    } catch (error) {
      console.error('Error loading image:', error);
      throw error;
    }
  };

  // Helper to get correct image URL
  const getImageUrl = (imageFileName) => {
    if (!imageFileName) return null;
    
    // If it's already a full URL
    if (imageFileName.startsWith('http://') || imageFileName.startsWith('https://')) {
      return imageFileName;
    }
    
    // If it's a data URL
    if (imageFileName.startsWith('data:')) {
      return imageFileName;
    }
    
    const cleanFileName = encodeURIComponent(imageFileName.split('?')[0]);
    
    // IMPORTANT: Use relative path that will be proxied by Vite
    if (import.meta.env.DEV) {
      // In development: Use /uploads/site-visit/ which will proxy to backend
      const imageUrl = `/uploads/site-visit/${cleanFileName}`;
      console.log('DEV - Image URL:', imageUrl);
      return imageUrl;
    } else {
      // In production: Use full URL
      const imageUrl = `http://localhost/growpro-stage-1/backend/uploads/site-visit/${cleanFileName}`;
      console.log('PROD - Image URL:', imageUrl);
      return imageUrl;
    }
  };

  // ========== HEADER ==========
  // Logo
  try {
    // Use the same logic for logo
    const logoUrl = `${import.meta.env.BASE_URL || ""}img/growprologo.jpeg`;
    console.log('Loading logo from:', logoUrl);
    
    const resp = await fetch(logoUrl, { cache: "no-store" });
    if (resp.ok) {
      const blob = await resp.blob();
      const dataUrl = await new Promise((res) => {
        const reader = new FileReader();
        reader.onloadend = () => res(reader.result);
        reader.readAsDataURL(blob);
      });
      
      try {
        doc.addImage(dataUrl, "JPEG", 15, 10, 30, 30);
        console.log('✓ Logo added successfully');
      } catch (err) {
        console.warn("Could not add logo:", err);
      }
    } else {
      console.warn("Logo load failed with status:", resp.status);
    }
  } catch (err) {
    console.warn("Logo load failed:", err);
  }

  // Header text - ONLY contains report title and generation date
  const titleX = 50 + (110 / 2);
  doc.setFontSize(24);
  doc.setFont(undefined, "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("Site Inspection Report", titleX, 20, { align: "center" });

  doc.setFontSize(10);
  doc.setFont(undefined, "normal");
  doc.text(`Report Generated: ${new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })}`, titleX, 30, { align: "center" });

  // Header separator line with green color from second code
  doc.setDrawColor(102, 187, 106);
  doc.setLineWidth(2);
  doc.line(0, 45, pageWidth, 45);
  yPos = 60

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
    { label: "Phone Number", value: visitData.phone || "-" },
  ]);

  // ========== TECHNICIAN INFORMATION ==========
  drawSectionHeader("Technician Information");
  drawKeyValuePairs([
    { label: "Technician Name", value: visitData.technician_name || visitData.tech_name || "-" },
    { label: "Visited By Code", value: visitData.visited_by || "-" },
  ]);

  yPos += 5;
  doc.setFontSize(12);
  doc.setFont(undefined, "bold");
  doc.setTextColor(59, 130, 246);
  doc.text("Dear Customer, the following are our observations from our visit:", 20, yPos);
  
  // ========== SITE VISIT DETAILS ==========
  yPos += 15;
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
    ensureSpace(20);
    doc.text("No site visit details available", margin, yPos);
    yPos += 15;
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
      plantProblems.map((p, index) => ({
        no: index + 1,
        problem: p.problem_name === "Others" ? (p.other_problem_name || "Others") : p.problem_name,
        details: p.details || "-"
      })),
      [
        { key: "no", header: "#", width: 10 },
        { key: "problem", header: "Problem Name", width: 80 },
      ]
    );
  } else {
    ensureSpace(20);
    doc.text("No plant problems recorded", margin, yPos);
    yPos += 15;
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
      pestTypes.map((p, index) => ({
        no: index + 1,
        pest: p.pest_name === "Others" ? (p.other_pest_name || "Others") : p.pest_name,
        treatment: p.treatment || "-"
      })),
      [
        { key: "no", header: "#", width: 10 },
        { key: "pest", header: "Pest Name", width: 80 },
      ]
    );
  } else {
    ensureSpace(20);
    doc.text("No pests recorded", margin, yPos);
    yPos += 15;
  }

  // ========== SUPPLIED PLANTS ==========
  drawSectionHeader("Plants Supplied");
  const suppliedPlants = Array.isArray(fullApiData.suppliedPlants) ?
    fullApiData.suppliedPlants.filter(p =>
      String(p.visit_id) === String(visitData.site_visit_id || visitData.visit_id || visitData.id)
    ) : [];

  if (suppliedPlants.length > 0) {
    drawTable(
      suppliedPlants.map((p, index) => ({
        no: index + 1,
        plant_name: p.plant_name === "Others" ? (p.other_plant_name || "Others") : (p.plant_name || "-"),
        quantity: p.quantity || "-",
        notes: p.notes || "-"
      })),
      [
        { key: "no", header: "#", width: 10 },
        { key: "plant_name", header: "Plant Name", width: 70 },
        { key: "quantity", header: "Quantity", width: 40 },
      ]
    );

    // Add summary
    const totalSuppliedPlants = suppliedPlants.reduce((sum, plant) => {
      return sum + (parseInt(plant.quantity) || 0);
    }, 0);

    ensureSpace(15);
    doc.setFontSize(10);
    doc.setFont(undefined, "bold");
    doc.setTextColor(244, 166, 76);
    doc.text("Total Plants Supplied:", margin, yPos);

    doc.setFont(undefined, "bold");
    doc.setTextColor(0, 0, 0);
    doc.text(`${totalSuppliedPlants} units`, margin + 60, yPos);

    yPos += 15;
  } else {
    ensureSpace(20);
    doc.text("No plants supplied", margin, yPos);
    yPos += 15;
  }

  // ========== NEEDED PLANTS ==========
  drawSectionHeader("Plants Needed");
  const needPlants = Array.isArray(fullApiData.needPlants) ?
    fullApiData.needPlants.filter(p =>
      String(p.visit_id) === String(visitData.site_visit_id || visitData.visit_id || visitData.id)
    ) : [];

  if (needPlants.length > 0) {
    drawTable(
      needPlants.map((p, index) => ({
        no: index + 1,
        plant_name: p.plant_name === "Others" ? (p.other_plant_name || "Others") : (p.plant_name || "-"),
        quantity: p.quantity || "-",
        priority: p.priority || "-"
      })),
      [
        { key: "no", header: "#", width: 10 },
        { key: "plant_name", header: "Plant Name", width: 70 },
        { key: "quantity", header: "Quantity", width: 40 },
      ]
    );
  } else {
    ensureSpace(20);
    doc.text("No plants needed", margin, yPos);
    yPos += 15;
  }

  // ========== SUPPLIED NUTRIENTS ==========
  drawSectionHeader("Nutrients Supplied");
  const suppliedNutrients = Array.isArray(fullApiData.suppliedNutrients) ?
    fullApiData.suppliedNutrients.filter(n =>
      String(n.visit_id) === String(visitData.site_visit_id || visitData.visit_id || visitData.id)
    ) : [];

  if (suppliedNutrients.length > 0) {
    drawTable(
      suppliedNutrients.map((n, index) => ({
        no: index + 1,
        nutrient_type: n.nutrient_type === "Others" ? (n.other_nutrient_name || "Others") : (n.nutrient_type || "-"),
        tank_capacity: n.tank_capacity || "-",
        topups: n.topups || "-",
        amount_used: n.amount_used || "-"
      })),
      [
        { key: "no", header: "#", width: 10 },
        { key: "nutrient_type", header: "Type", width: 50 },
        { key: "tank_capacity", header: "Tank Capacity", width: 40 },
        { key: "topups", header: "Topups", width: 40 },
      ]
    );
  } else {
    ensureSpace(20);
    doc.text("No nutrients supplied", margin, yPos);
    yPos += 15;
  }

  // ========== NEEDED NUTRIENTS ==========
  drawSectionHeader("Nutrients Needed");
  const needNutrients = Array.isArray(fullApiData.needNutrients) ?
    fullApiData.needNutrients.filter(n =>
      String(n.visit_id) === String(visitData.site_visit_id || visitData.visit_id || visitData.id)
    ) : [];

  if (needNutrients.length > 0) {
    drawTable(
      needNutrients.map((n, index) => ({
        no: index + 1,
        nutrient_type: n.nutrient_type === "Others" ? (n.other_nutrient_name || "Others") : (n.nutrient_type || "-"),
        tank_capacity: n.tank_capacity || "-",
        topups: n.topups || "-",
        urgency: n.urgency || "-"
      })),
      [
        { key: "no", header: "#", width: 10 },
        { key: "nutrient_type", header: "Type", width: 50 },
        { key: "tank_capacity", header: "Tank Capacity", width: 40 },
        { key: "topups", header: "Topups", width: 40 },
      ]
    );
  } else {
    ensureSpace(20);
    doc.text("No nutrients needed", margin, yPos);
    yPos += 15;
  }

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
    drawTable(
      suppliedChargeable.map((i, index) => ({
        no: index + 1,
        item_name: i.item_name === "Others" ? (i.other_item_name || "Others") : (i.item_name || "-"),
        quantity: i.quantity || "-",
        unit_price: i.unit_price || "-",
        total: (parseFloat(i.quantity) || 0) * (parseFloat(i.unit_price) || 0)
      })),
      [
        { key: "no", header: "#", width: 10 },
        { key: "item_name", header: "Item Name", width: 70 },
        { key: "quantity", header: "Qty", width: 25 },
        { key: "total", header: "Total", width: 35 }
      ],
      "Supplied Items"
    );
  }

  if (needChargeable.length > 0) {
    drawTable(
      needChargeable.map((i, index) => ({
        no: index + 1,
        item_name: i.item_name === "Others" ? (i.other_item_name || "Others") : (i.item_name || "-"),
        quantity: i.quantity || "-",
        estimated_price: i.estimated_price || "-"
      })),
      [
        { key: "no", header: "#", width: 10 },
        { key: "item_name", header: "Item Name", width: 70 },
        { key: "quantity", header: "Qty", width: 25 },
      ],
      "Items Needed"
    );
  }

  if (suppliedChargeable.length === 0 && needChargeable.length === 0) {
    ensureSpace(20);
    doc.text("No chargeable items recorded", margin, yPos);
    yPos += 15;
  }

  // ========== PHOTOS ==========
  drawSectionHeader("Setup Photos");
  const photos = Array.isArray(fullApiData.suppliedPhotoSetup) ? 
    fullApiData.suppliedPhotoSetup.filter(p => 
      String(p.visit_id) === String(visitData.site_visit_id || visitData.visit_id || visitData.id)
    ) : [];

  if (photos.length > 0) {
    // Calculate space needed
    const estimatedSpace = photos.length * 50 + 30;
    ensureSpace(estimatedSpace);
    
    // Header
    doc.setFontSize(12);
    doc.setFont(undefined, "bold");
    doc.setTextColor(59, 130, 246);
    doc.text(`Photos (${photos.length}):`, margin, yPos);
    yPos += 15;
    
    // Process photos in batches
    const photosPerRow = 2;
    let currentRow = [];
    
    for (let i = 0; i < photos.length; i++) {
      const photo = photos[i];
      const imageFileName = photo.image_url || photo.filename || photo.preview;
      
      if (!imageFileName) continue;
      
      // Check if we need a new page BEFORE processing the image
      ensureSpace(70);
      
      const imageUrl = getImageUrl(imageFileName);
      
      try {
        const dataUrl = await loadImageToDataURL(imageUrl);
        const img = new Image();
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = dataUrl;
        });
        
        const colIndex = currentRow.length;
        const availableWidth = pageWidth - (2 * margin);
        const imgWidth = (availableWidth / photosPerRow) - 15; // 15px gap
        const imgHeight = 40; // Fixed height
        
        const xPos = margin + (colIndex * (imgWidth + 15));
        
        // Calculate aspect ratio
        const aspectRatio = img.width / img.height;
        let displayWidth = imgWidth;
        let displayHeight = imgHeight;
        
        if (aspectRatio > 1) {
          // Landscape
          displayHeight = imgWidth / aspectRatio;
        } else {
          // Portrait
          displayWidth = imgHeight * aspectRatio;
        }
        
        // Center image
        const xOffset = (imgWidth - displayWidth) / 2;
        const yOffset = (imgHeight - displayHeight) / 2;
        
        let format = dataUrl.startsWith('data:image/png') ? 'PNG' : 'JPEG';
        doc.addImage(
          dataUrl, 
          format, 
          xPos + xOffset, 
          yPos + yOffset, 
          displayWidth, 
          displayHeight
        );
        
        // Add border around image (optional)
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.5);
        doc.rect(xPos, yPos, imgWidth, imgHeight);
        
        currentRow.push(photo);
        
        // Start new row if needed
        if (currentRow.length >= photosPerRow || i === photos.length - 1) {
          yPos += imgHeight + 20; // Image height + spacing
          currentRow = [];
        }
        
      } catch (error) {
        console.error(`Failed to load image ${imageFileName}:`, error);
        
        // Fallback: show filename in text
        ensureSpace(20);
        doc.setFontSize(9);
        doc.setFont(undefined, "normal");
        doc.setTextColor(150, 150, 150);
        doc.text(`[Image: ${imageFileName}]`, margin, yPos);
        yPos += 15;
      }
    }
    
    yPos += 10;
  } else {
    ensureSpace(20);
    doc.text("No setup photos available", margin, yPos);
    yPos += 15;
  }

  // ========== OVERALL SUMMARY ==========
  // Ensure we have enough space for the summary section
  ensureSpace(60);
  
  doc.setFontSize(14);
  doc.setFont(undefined, "bold");
  doc.setTextColor(59, 130, 246);
  doc.text("Visit Summary", margin, yPos);

  yPos += 6;
  doc.setLineWidth(0.3);
  doc.line(margin, yPos, pageWidth - margin, yPos);

  yPos += 10;
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.setFont(undefined, "normal");

  // Calculate summary statistics
  const totalProblems = plantProblems.length;
  const totalPests = pestTypes.length;
  const totalSuppliedItems = suppliedPlants.length + suppliedNutrients.length + suppliedChargeable.length;
  const totalNeededItems = needPlants.length + needNutrients.length + needChargeable.length;

  // These should match exactly what's in your screenshot
  const summaryItems = [
    `Total Issues Identified: ${totalProblems + totalPests}`,
    `Total Items Supplied: ${totalSuppliedItems}`,
    `Total Items Needed: ${totalNeededItems}`,
    `Setup Photos Taken: ${photos.length}`
  ];

  summaryItems.forEach(item => {
    doc.text(item, margin, yPos);
    yPos += 8;
  });

  // Ensure we're not too close to the footer
  ensureSpace(40);

  // ========== CLOSING REMARKS ==========
  // Add closing remarks from your screenshot
  doc.setFontSize(12);
  doc.setFont(undefined, "bold");
  doc.setTextColor(0, 0, 0);
  
  yPos += 10;
  doc.text("Do let us know if you'd like clarity on any of our observations/suggestions.", margin, yPos);

  yPos += 15;
  doc.text("Happy Growing!", margin, yPos);
  
  yPos += 10;
  doc.setFontSize(10);
  doc.setFont(undefined, "normal");
  doc.setTextColor(66, 66, 66);
  doc.text("Email: sales@growpro.co.in", margin, yPos);
  
  yPos += 6;
  doc.text("Phone: 8591753001", margin, yPos);
  
  yPos += 6;
  doc.text("GrowPro Technology", margin, yPos);

  // ========== FIXED FOOTER ==========
  const pageCount = doc.getNumberOfPages();
  
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    
    // FOOTER POSITIONING
    const footerY = pageHeight - 22; // Fixed footer height
    const footerHeight = 22;
    
    // Clear footer area with white background
    doc.setFillColor(255, 255, 255);
    doc.rect(0, footerY, pageWidth, footerHeight, "F");
    
    // Orange separator line at top of footer
    doc.setDrawColor(225, 122, 0);
    doc.setLineWidth(1.2);
    doc.line(0, footerY + 1, pageWidth, footerY + 1);
    
    // Text positioning within footer
    const row1Y = footerY + 8;   // First row
    const row2Y = footerY + 15;  // Second row
    
    // LEFT SECTION: Email and Phone
    doc.setFontSize(9);
    
    // Email
    doc.setTextColor(225, 122, 0); // Orange for labels
    doc.setFont(undefined, "bold");
    doc.text("Email:", 15, row1Y);
    
    doc.setTextColor(0, 0, 0); // Black for values
    doc.setFont(undefined, "normal");
    doc.text("sales@growpro.co.in", 40, row1Y);
    
    // Phone
    doc.setTextColor(225, 122, 0);
    doc.setFont(undefined, "bold");
    doc.text("Phone:", 15, row2Y);
    
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, "normal");
    doc.text("+91 859 175 3001", 40, row2Y);
    
    // RIGHT SECTION: Company name and page number
    const rightMargin = pageWidth - 15;
    
    // Company name
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    doc.setFont(undefined, "bold");
    doc.text("GrowPro Solutions", rightMargin, row1Y, { align: "right" });
    
    // Page number
    doc.setFont(undefined, "normal");
    doc.text(`Page ${i} of ${pageCount}`, rightMargin, row2Y, { align: "right" });
  }

  // ========== SAVE PDF ==========
  const safeName = (visitData.customer_name || "site_visit")
    .replace(/\s+/g, "_")
    .replace(/[^\w-_]/g, "");

  doc.save(`${safeName}_Site_Visit_Report_${formatDate(visitData.created_date)}.pdf`);
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
                              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition ${pdfLoaded
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
                            {user.customer_name} <br /><small>({user.phone})</small>
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
                          className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg transition ${pdfLoaded
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