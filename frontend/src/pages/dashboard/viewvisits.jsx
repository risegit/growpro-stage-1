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

  const user = JSON.parse(localStorage.getItem("user"));
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
  try {
    console.log("Starting PDF generation...");
    console.log("Visit Data:", visitData);
    console.log("Full API Data:", fullApiData);
    
    if (!window.jspdf) {
      console.error("PDF library not loaded");
      alert("PDF library is still loading. Please try again.");
      return;
    }
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF("p", "mm", "a4");

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    let yPos = 20;
    let currentPage = 1;
    let totalPages = 1;

    /* ----------------------------------
       LOGO HELPER
    ---------------------------------- */

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
        console.error('Failed to add logo to page:', error);
      }
    };

    /* ----------------------------------
       HELPERS
    ---------------------------------- */

    const ensureSpace = (h = 8) => {
      const logoSpace = 25;
      
      if (yPos + h > pageHeight - 25) {
        doc.addPage();
        currentPage++;
        totalPages = currentPage;
        yPos = 20 + logoSpace;
        
        setTimeout(() => addLogoToPage(currentPage), 0);
      }
    };

    const drawLineField = (label, value = "", width = 60) => {
      ensureSpace();
      doc.setFontSize(10);
      doc.setFont(undefined, "normal");
      doc.text(label, margin, yPos);
      doc.line(margin + 55, yPos + 1, margin + 55 + width, yPos + 1);
      if (value) doc.text(String(value), margin + 56, yPos);
      yPos += 7;
    };

    const drawYesNo = (label, value) => {
      ensureSpace();
      doc.setFontSize(10);
      doc.setFont(undefined, "normal");
      doc.text(label, margin, yPos);

      const answerX = pageWidth - 30;
      let answer = "";
      
      if (value !== undefined && value !== null) {
        const strValue = String(value).toLowerCase().trim();
        if (strValue === "yes" || strValue === "y" || strValue === "true" || strValue === "1") {
          answer = "Yes";
        } else if (strValue === "no" || strValue === "n" || strValue === "false" || strValue === "0") {
          answer = "No";
        }
      }
      
      if (answer) {
        doc.setFont(undefined, "bold");
        doc.text(answer, answerX, yPos, { align: "right" });
        doc.setFont(undefined, "normal");
      } else {
        doc.setFont(undefined, "bold");
        doc.text("", answerX, yPos, { align: "right" });
        doc.setFont(undefined, "normal");
      }

      yPos += 7;
    };

    const drawSection = (title) => {
      ensureSpace(12);
      doc.setFont(undefined, "bold");
      doc.setFontSize(11);
      doc.text(title, margin, yPos);
      yPos += 8;
      doc.setFont(undefined, "normal");
    };

    const drawTable = (items = [], columns = [], showHeader = true) => {
      if (!Array.isArray(items) || items.length === 0) {
        return;
      }

      if (showHeader) {
        ensureSpace(10);
        doc.setFontSize(9);
        doc.setFont(undefined, "bold");

        let xPos = margin + 5;
        columns.forEach(col => {
          doc.text(col.header || col.key, xPos, yPos);
          xPos += col.width || 40;
        });

        yPos += 5;
        doc.setLineWidth(0.2);
        doc.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 5;
      }

      doc.setFontSize(9);
      doc.setFont(undefined, "normal");

      items.forEach((item) => {
        ensureSpace(10);

        let xPos = margin + 5;
        columns.forEach(col => {
          const raw = item[col.key];
          const value = col.valueGetter ?
            col.valueGetter(item) :
            (raw === undefined || raw === null ? "-" : String(raw));

          doc.text(value, xPos, yPos);
          xPos += col.width || 40;
        });

        yPos += 7;
      });

      yPos += 3;
    };

    const loadImageToDataURL = async (imageUrl) => {
      try {
        if (imageUrl.startsWith('data:')) {
          return imageUrl;
        }
        
        const response = await fetch(imageUrl, {
          method: 'GET',
          cache: 'no-cache',
          mode: 'cors',
          credentials: 'same-origin',
          headers: {
            'Accept': 'image/*',
            'Cache-Control': 'no-cache'
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        const blob = await response.blob();
        if (blob.size === 0) {
          throw new Error('Empty image');
        }
        
        const dataUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = () => reject(new Error('Failed to read'));
          reader.readAsDataURL(blob);
        });
        
        return dataUrl;
        
      } catch (error) {
        console.error(`Error loading image:`, error);
        throw error;
      }
    };

    const getImageUrl = (imageFileName) => {
      if (!imageFileName) return null;
      
      if (imageFileName.startsWith('http://') || imageFileName.startsWith('https://')) {
        return imageFileName;
      }
      
      if (imageFileName.startsWith('data:')) {
        return imageFileName;
      }
      
      const cleanFileName = imageFileName.split('?')[0];
      const encodedFileName = encodeURIComponent(cleanFileName);
      
      const isDev = import.meta.env.DEV;
      
      let imageUrl;
      
      if (isDev) {
        const viteImageBaseDev = import.meta.env.VITE_IMAGE_BASE_DEV || '/uploads/site-visit/';
        imageUrl = `${viteImageBaseDev}${encodedFileName}`;
      } else {
        const viteImageBaseProd = import.meta.env.VITE_IMAGE_BASE_PROD;
        if (viteImageBaseProd) {
          imageUrl = `${viteImageBaseProd}${encodedFileName}`;
        } else {
          const protocol = window.location.protocol;
          const host = window.location.host;
          imageUrl = `${protocol}//${host}/growpro/backend/uploads/site-visit/${encodedFileName}`;
        }
      }
      
      return imageUrl;
    };

    /* ----------------------------------
       HEADER WITH LOGO
    ---------------------------------- */

    await addLogoToPage(1);

    doc.setFontSize(14);
    doc.setFont(undefined, "bold");
    doc.text("Site Inspection Report", pageWidth / 2 + 10, 20, { align: "center" });
    
    yPos = 40;
    
    doc.setFontSize(10);
    doc.setFont(undefined, "normal");
    
    const textStartX = margin + 30;
    doc.text("Client Name:", textStartX, yPos);
    doc.line(textStartX + 25, yPos + 1, textStartX + 85, yPos + 1);
    doc.text(visitData.customer_name || "", textStartX + 26, yPos);
    
    doc.text("Date of Visit:", pageWidth - 75, yPos);
    doc.line(pageWidth - 45, yPos + 1, pageWidth - 15, yPos + 1);
    doc.text(visitData.created_date || "", pageWidth - 44, yPos);
    
    yPos += 7;
    doc.text("Visited By:", textStartX, yPos);
    doc.line(textStartX + 25, yPos + 1, textStartX + 85, yPos + 1);
    doc.text(visitData.technician_name || "", textStartX + 26, yPos);
    
    yPos += 10;
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    
    yPos += 15;

    /* ----------------------------------
       DATA SHORTCUTS
    ---------------------------------- */

    const siteVisit = fullApiData.site_visit?.[0] || {};

    /* ----------------------------------
       I. BASIC VISUAL INSPECTION - UPDATED WITH EQUIPMENT DAMAGE REASON
    ---------------------------------- */
    doc.setFontSize(11);
    doc.setFont(undefined, "normal");
    doc.text("Dear Customer, the following are our observations from our Visit.", pageWidth / 2, yPos, { align: "center" });

    yPos += 10;

    drawSection("I. Basic Visual Inspection");

    drawYesNo("1. All plants are getting water?", siteVisit.are_plants_getting_water);
    drawYesNo("2. Water above the pump?", siteVisit.water_above_pump);

    // Timer question
    drawYesNo("3. Timer working?", siteVisit.timer_working);
    if (siteVisit.timer_working && String(siteVisit.timer_working).toLowerCase() === "no") {
        const reason = siteVisit.timer_issue || "";
        if (reason) {
            drawLineField("   If no, reason:", reason, 100);
        }
    }

    // Motor question
    drawYesNo("4. Motor working?", siteVisit.motor_working);
    if (siteVisit.motor_working && String(siteVisit.motor_working).toLowerCase() === "no") {
        const reason = siteVisit.motor_issue || "";
        if (reason) {
            drawLineField("   If no, reason:", reason, 100);
        }
    }

    // Lights question
    drawYesNo("5. Lights working?", siteVisit.light_working);
    if (siteVisit.light_working && String(siteVisit.light_working).toLowerCase() === "no") {
        const reason = siteVisit.light_issue || "";
        if (reason) {
            drawLineField("   If no, reason:", reason, 100);
        }
    }

    // Equipment damaged question - SHOW REASON IF YES
    drawYesNo("6. Any other equipment damaged?", siteVisit.equipment_damaged);
    if (siteVisit.equipment_damaged && String(siteVisit.equipment_damaged).toLowerCase() === "yes") {
        const reason = siteVisit.damaged_items || siteVisit.equipment_damage_reason || "";
        if (reason) {
            drawLineField("   If yes, details:", reason, 100);
        }
    }

    // Any leaks question
    drawYesNo("7. Any leaks?", siteVisit.any_leaks);
    if (siteVisit.any_leaks && String(siteVisit.any_leaks).toLowerCase() === "yes") {
        const reason = siteVisit.leaks_details || siteVisit.leaks_reason || "";
        if (reason) {
            drawLineField("   If yes, details:", reason, 100);
        }
    }

    drawYesNo("8. Clean growing equipment & surroundings?", siteVisit.clean_equipment);
    drawYesNo("9. Electric connections secured by clients?", siteVisit.electric_connections_secured);

    /* ----------------------------------
       II. TECHNICAL OBSERVATIONS
    ---------------------------------- */

    yPos += 3;
    drawSection("II. Technical Observations");

    drawLineField("1. pH:", siteVisit.initial_ph);
    drawLineField("2. Corrected pH:", siteVisit.corrected_ph);
    drawLineField("3. Initial TDS (ppm):", siteVisit.initial_tds);
    drawLineField("4. Corrected TDS (ppm):", siteVisit.corrected_tds);

    /* ----------------------------------
       FILTER BY CURRENT VISIT ID
    ---------------------------------- */

    const currentVisitId =
      visitData.site_visit_id ||
      visitData.visit_id ||
      visitData.id ||
      siteVisit.id;

    /* Plant Problems (FILTERED) */
    const filteredPlantProblems = Array.isArray(fullApiData.plantProblems)
      ? fullApiData.plantProblems.filter(p =>
          String(p.visit_id) === String(currentVisitId)
        )
      : [];

    const problemAnswer = filteredPlantProblems.length ? "yes" : "no";
    drawYesNo("5. Plant Problems?", problemAnswer);

    if (filteredPlantProblems.length) {
      const problemNames = filteredPlantProblems
        .map(p =>
          p.problem_name === "Others"
            ? (p.other_problem_name || "Others")
            : p.problem_name
        )
        .join(", ");

      drawLineField("    If yes, symptoms?", problemNames, 120);
    }

    /* Pests (FILTERED) */
    const filteredPests = Array.isArray(fullApiData.pestTypes)
      ? fullApiData.pestTypes.filter(p =>
          String(p.visit_id) === String(currentVisitId)
        )
      : [];

    const pestAnswer = filteredPests.length ? "yes" : "no";
    drawYesNo("6. Presence of pests?", pestAnswer);

    if (filteredPests.length) {
      const pestNames = filteredPests
        .map(p =>
          p.pest_name === "Others"
            ? (p.other_pest_name || "Others")
            : p.pest_name
        )
        .join(", ");

      drawLineField("    If yes, which?", pestNames, 100);
    }

    drawLineField("7. Any nutrient deficiency?", siteVisit.nutrient_deficiency);
    drawLineField("    Other:", siteVisit.deficiency_details || siteVisit.other_observation, 120);

    /* ----------------------------------
       III. CLIENT TRAINING
    ---------------------------------- */

    yPos += 3;
    drawSection("III. Client Training");

    drawYesNo("1. How & When to Harvest", siteVisit.client_training_harvest);
    drawYesNo("2. Pest Management", siteVisit.pest_management);
    drawYesNo("3. Equipment Cleaning", siteVisit.equipment_cleaning);
    drawYesNo("4. Plant Maintenance", siteVisit.plant_maintenance);

    yPos += 5;
    drawLineField("Scope of Improvement:", siteVisit.scope_of_improvement, 120);

    /* ----------------------------------
       IV. MATERIAL SUPPLY
    ---------------------------------- */

    yPos += 8;
    drawSection("IV. Material Supply");

    // Supplied Plants
    const suppliedPlants = Array.isArray(fullApiData.suppliedPlants) ?
      fullApiData.suppliedPlants.filter(p =>
        String(p.visit_id) === String(visitData.site_visit_id || visitData.visit_id || visitData.id)
      ) : [];

    if (suppliedPlants.length > 0) {
      ensureSpace(15);
      doc.setFontSize(10);
      doc.setFont(undefined, "bold");
      doc.text("Plants Supplied:", margin, yPos);
      yPos += 6;
      doc.setFont(undefined, "normal");

      drawTable(
        suppliedPlants.map((p, index) => ({
          no: index + 1,
          plant_name: p.plant_name === "Others" ? (p.other_plant_name || "Others") : (p.plant_name || "-"),
          quantity: p.quantity || "-",
        })),
        [
          { key: "no", header: "#", width: 15 },
          { key: "plant_name", header: "Plant Name", width: 100 },
          { key: "quantity", header: "Quantity", width: 35 },
        ]
      );
    }

    // Supplied Nutrients
    const suppliedNutrients = Array.isArray(fullApiData.suppliedNutrients) ?
      fullApiData.suppliedNutrients.filter(n =>
        String(n.visit_id) === String(visitData.site_visit_id || visitData.visit_id || visitData.id)
      ) : [];

    if (suppliedNutrients.length > 0) {
      ensureSpace(15);
      doc.setFontSize(10);
      doc.setFont(undefined, "bold");
      doc.text("Nutrients Supplied:", margin, yPos);
      yPos += 6;
      doc.setFont(undefined, "normal");

     drawTable(
    suppliedNutrients.map((n, index) => {
      const tankCap = parseFloat(n.tank_capacity) || 0;
      const topups = parseFloat(n.topups) || 0;
      const total = tankCap * topups;

      return {
        no: index + 1,
        nutrient_type:
          n.nutrient_type === "Others"
            ? (n.other_nutrient_name || "Others")
            : (n.nutrient_type || "-"),
        tank_capacity: tankCap || "-",
        topups: topups || "-",
        total: total ? `${total} Ltr` : "-"
      };
    }),
    [
      { key: "no", header: "#", width: 15 },
      { key: "nutrient_type", header: "Type", width: 55 },
      { key: "tank_capacity", header: "Tank Cap.", width: 30 },
      { key: "topups", header: "Topups", width: 25 },
     { key: "total", header: "Total (Ltr)", width: 30 }
    ]
    );
    }

    // Supplied Chargeable Items
    const suppliedChargeable = Array.isArray(fullApiData.suppliedChargeableItem) ?
      fullApiData.suppliedChargeableItem.filter(i =>
        String(i.visit_id) === String(visitData.site_visit_id || visitData.visit_id || visitData.id)
      ) : [];

    if (suppliedChargeable.length > 0) {
      ensureSpace(15);
      doc.setFontSize(10);
      doc.setFont(undefined, "bold");
      doc.text("Other Items Supplied:", margin, yPos);
      yPos += 6;
      doc.setFont(undefined, "normal");

      drawTable(
        suppliedChargeable.map((i, index) => ({
          no: index + 1,
          item_name: i.item_name === "Others" ? (i.other_item_name || "Others") : (i.item_name || "-"),
          quantity: i.quantity || "-",
          unit_price: i.unit_price || "-",
          total: ((parseFloat(i.quantity) || 0) * (parseFloat(i.unit_price) || 0)).toFixed(2)
        })),
        [
          { key: "no", header: "#", width: 15 },
          { key: "item_name", header: "Item Name", width: 60 },
          { key: "quantity", header: "Qty", width: 25 },
        ]
      );
    }

    /* ----------------------------------
       V. MATERIAL NEED TO DELIVER
    ---------------------------------- */

    yPos += 8;
    drawSection("V. Material Need To Deliver");

    // Needed Plants
    const needPlants = Array.isArray(fullApiData.needPlants) ?
      fullApiData.needPlants.filter(p =>
        String(p.visit_id) === String(visitData.site_visit_id || visitData.visit_id || visitData.id)
      ) : [];

    if (needPlants.length > 0) {
      ensureSpace(15);
      doc.setFontSize(10);
      doc.setFont(undefined, "bold");
      doc.text("Plants Needed:", margin, yPos);
      yPos += 6;
      doc.setFont(undefined, "normal");

      drawTable(
        needPlants.map((p, index) => ({
          no: index + 1,
          plant_name: p.plant_name === "Others" ? (p.other_plant_name || "Others") : (p.plant_name || "-"),
          quantity: p.quantity || "-",
          priority: p.priority || "-"
        })),
        [
          { key: "no", header: "#", width: 15 },
          { key: "plant_name", header: "Plant Name", width: 80 },
          { key: "quantity", header: "Quantity", width: 30 },
        ]
      );
    }

    // Needed Nutrients
    const needNutrients = Array.isArray(fullApiData.needNutrients) ?
      fullApiData.needNutrients.filter(n =>
        String(n.visit_id) === String(visitData.site_visit_id || visitData.visit_id || visitData.id)
      ) : [];

    if (needNutrients.length > 0) {
      ensureSpace(15);
      doc.setFontSize(10);
      doc.setFont(undefined, "bold");
      doc.text("Nutrients Needed:", margin, yPos);
      yPos += 6;
      doc.setFont(undefined, "normal");

     drawTable(
    needNutrients.map((n, index) => {
      const tankCap = parseFloat(n.tank_capacity) || 0;
      const topups = parseFloat(n.topups) || 0;
      const total = tankCap * topups;

      return {
        no: index + 1,
        nutrient_type:
          n.nutrient_type === "Others"
            ? (n.other_nutrient_name || "Others")
            : (n.nutrient_type || "-"),
        tank_capacity: tankCap || "-",
        topups: topups || "-",
        total: total ? `${total} Ltr` : "-"
      };
    }),
    [
      { key: "no", header: "#", width: 15 },
      { key: "nutrient_type", header: "Type", width: 50 },
      { key: "tank_capacity", header: "Tank Cap.", width: 30 },
      { key: "topups", header: "Topup", width: 25 },
      { key: "total", header: "Total (Ltr)", width: 30 }
    ]
    );
    }

    // Needed Chargeable Items
    const needChargeable = Array.isArray(fullApiData.needChargeableItem) ?
      fullApiData.needChargeableItem.filter(i =>
        String(i.visit_id) === String(visitData.site_visit_id || visitData.visit_id || visitData.id)
      ) : [];

    if (needChargeable.length > 0) {
      ensureSpace(15);
      doc.setFontSize(10);
      doc.setFont(undefined, "bold");
      doc.text("Chargeable Items Needed:", margin, yPos);
      yPos += 6;
      doc.setFont(undefined, "normal");

      drawTable(
        needChargeable.map((i, index) => ({
          no: index + 1,
          item_name: i.item_name === "Others" ? (i.other_item_name || "Others") : (i.item_name || "-"),
          quantity: i.quantity || "-",
          estimated_price: i.estimated_price || "-"
        })),
        [
          { key: "no", header: "#", width: 15 },
          { key: "item_name", header: "Item Name", width: 80 },
          { key: "quantity", header: "Qty", width: 25 },
        ]
      );
    }

    /* ----------------------------------
       SETUP PHOTOS
    ---------------------------------- */

    const photos = Array.isArray(fullApiData.suppliedPhotoSetup) ? 
      fullApiData.suppliedPhotoSetup.filter(p => 
        String(p.visit_id) === String(visitData.site_visit_id || visitData.visit_id || visitData.id)
      ) : [];

    if (photos.length > 0) {
      const remainingSpace = pageHeight - 25 - yPos;
      
      let photosPerRow;
      let imgWidth, imgHeight;
      
      if (photos.length <= 3) {
        photosPerRow = 3;
        imgWidth = 25;
        imgHeight = 18;
      } else if (photos.length <= 6) {
        photosPerRow = 2;
        imgWidth = 35;
        imgHeight = 25;
      } else {
        photosPerRow = 2;
        imgWidth = 30;
        imgHeight = 22;
      }
      
      const verticalSpacing = 5;
      const rowHeight = imgHeight + verticalSpacing;
      
      const rowsNeeded = Math.ceil(photos.length / photosPerRow);
      const spaceNeeded = (rowsNeeded * rowHeight) + 50;
      
      if (remainingSpace < spaceNeeded) {
        doc.addPage();
        currentPage++;
        totalPages = currentPage;
        yPos = 20 + 25;
        await addLogoToPage(currentPage);
      }
      
      drawSection("Setup Photos");
      
      const availableWidth = pageWidth - (2 * margin);
      const totalSpacing = 5 * (photosPerRow - 1);
      const columnWidth = (availableWidth - totalSpacing) / photosPerRow;
      
      for (let i = 0; i < photos.length; i++) {
        const photo = photos[i];
        const imageFileName = photo.image_url || photo.filename || photo.preview || photo.url;
        
        if (!imageFileName) continue;
        
        const rowIndex = Math.floor(i / photosPerRow);
        const colIndex = i % photosPerRow;
        
        const currentRowYPos = yPos + (rowIndex * rowHeight);
        
        try {
          const imageUrl = getImageUrl(imageFileName);
          if (!imageUrl) continue;
          
          const dataUrl = await loadImageToDataURL(imageUrl);
          if (!dataUrl) continue;
          
          const img = new Image();
          
          await new Promise((resolve, reject) => {
            img.onload = () => resolve();
            img.onerror = () => reject(new Error(`Failed to load`));
            img.src = dataUrl;
            if (img.complete) resolve();
          });
          
          const xPos = margin + (colIndex * (columnWidth + 5));
          
          const aspectRatio = img.width / img.height;
          let displayWidth = imgWidth;
          let displayHeight = imgHeight;
          
          if (aspectRatio > 1) {
            displayHeight = imgWidth / aspectRatio;
          } else {
            displayWidth = imgHeight * aspectRatio;
          }
          
          const xOffset = (imgWidth - displayWidth) / 2;
          const yOffset = (imgHeight - displayHeight) / 2;
          
          let format = 'JPEG';
          if (dataUrl.startsWith('data:image/png')) format = 'PNG';
          
          doc.addImage(dataUrl, format, xPos + xOffset, currentRowYPos + yOffset, displayWidth, displayHeight);
          
          doc.setDrawColor(180, 180, 180);
          doc.setLineWidth(0.1);
          doc.rect(xPos, currentRowYPos, imgWidth, imgHeight);
          
        } catch (error) {
          console.error(`Failed to process image ${i + 1}:`, error);
        }
      }
      
      yPos += (rowsNeeded * rowHeight) + 10;
    }

    /* ----------------------------------
       SIGNATURE SECTION
    ---------------------------------- */

    doc.setPage(totalPages);
    ensureSpace(70);
    
    /* ----------------------------------
       CLARIFICATION SECTION
    ---------------------------------- */

    yPos += 10;
    doc.setFontSize(11);
    doc.setFont(undefined, "normal");
    doc.text("Do let us know if you'd like clarity on any of our observations/suggestions.", margin, yPos);
    
    yPos += 10;
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.2);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    
    yPos += 10;

    /* ----------------------------------
       HAPPY GROWING SECTION
    ---------------------------------- */

    doc.setFontSize(16);
    doc.setFont(undefined, "bold");
    doc.text("Happy Growing!", margin, yPos);

    yPos += 10;
    doc.setFontSize(11);
    doc.setFont(undefined, "normal");
    doc.textWithLink("Email: sales@growpro.co.in", margin, yPos, {
      url: "mailto:sales@growpro.co.in"
    });

    yPos += 8;
    doc.textWithLink("Phone: 8591753001", margin, yPos, {
      url: "tel:+918591753001"
    });

    yPos += 15;

    /* ----------------------------------
       FOOTER TABLE
    ---------------------------------- */

    yPos = pageHeight - 25;
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.3);
    doc.line(margin, yPos - 2, pageWidth - margin, yPos - 2);

    const footerY = pageHeight - 20;
    doc.setFontSize(9);
    doc.setFont(undefined, "normal");
    doc.textWithLink("Phone: +91 859 175 3001", margin, footerY, {
      url: "tel:+918591753001"
    });

    doc.setFont(undefined, "bold");
    doc.text("GrowPro Technology", pageWidth - margin, footerY, { align: "right" });

    const companyText = "GrowPro Technology";
    const textWidth = doc.getTextWidth(companyText);
    doc.link(pageWidth - margin - textWidth, footerY - 4, textWidth, 5, {
      url: "https://growpro.co.in/"
    });

    const footerY2 = pageHeight - 15;
    doc.setFont(undefined, "normal");
    doc.textWithLink("Email: sales@growpro.co.in", margin, footerY2, {
      url: "mailto:sales@growpro.co.in"
    });

    /* ----------------------------------
       FINAL STEP: Ensure logo is on all pages
    ---------------------------------- */

    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      if (i > 1) {
        await addLogoToPage(i);
      }
    }

    doc.setPage(totalPages);

    /* ----------------------------------
       SAVE
    ---------------------------------- */

    const safeName = (visitData.customer_name || "site_visit")
      .replace(/\s+/g, "_")
      .replace(/[^\w-_]/g, "");

    const formatDate = (dateString) => {
      if (!dateString) return new Date().toISOString().split('T')[0];
      try {
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
      } catch (e) {
        return new Date().toISOString().split('T')[0];
      }
    };

    console.log("PDF generation complete, saving...");
    doc.save(`${safeName}_Grower_Inspection_Report_${formatDate(visitData.created_date)}.pdf`);
    console.log("PDF saved successfully!");
    
  } catch (error) {
    console.error("Error generating PDF:", error);
    alert(`Failed to generate PDF: ${error.message}`);
  }
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
                      {userRole !== "technician" && (
                        <th className="w-[12%] py-4 px-4 font-medium text-gray-700 text-center">PDF Report</th>
                      )}
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
                          {userRole !== "technician" && (
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
                          )}

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