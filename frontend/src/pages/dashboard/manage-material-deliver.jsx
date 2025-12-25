import React, { useState, useEffect, useMemo } from "react";
import { FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function UserTable() {
  const [allUsers, setAllUsers] = useState([]);
  const [plantsList, setPlantsList] = useState([]);
  const [nutrientsList, setNutrientsList] = useState([]);
  const [chargeableItemList, setChargeableItemList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'ascending' // 'ascending' or 'descending'
  });

  const user = JSON.parse(localStorage.getItem("user"));
  const userRole = user?.role;
  const isAdmin = userRole === "admin"; // Check if user is admin

  // Helper function to calculate supplies
  const calculateSupplies = (tankCapacity, topups) => {
    if (!tankCapacity || !topups) return "-";
    
    const capacity = parseFloat(tankCapacity);
    const topupCount = parseFloat(topups);
    
    if (isNaN(capacity) || isNaN(topupCount)) return "-";
    
    const result = capacity * topupCount;
    // Format to 2 decimal places if it's a decimal, otherwise show as integer
    return result % 1 === 0 ? result.toString() : result.toFixed(2);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const usersPerPage = 10;
  const navigate = useNavigate();
  const [pdfLoaded, setPdfLoaded] = useState(false);

  // 🔹 Fetch data from backend API
  // useEffect(() => {
  //   const fetchUsers = async () => {
  //     try {
  //       const response = await fetch(`${import.meta.env.VITE_API_URL}api/material-deliver.php`, {
  //         method: "GET",
  //       });
  //       const data = await response.json();
  //       console.log("user data=", data);
  //       setAllUsers(data.data);
  //       // 🔹 Store plants array
  //     setPlantsList(data.plants || []);
  //     } catch (error) {
  //       console.error("Error fetching users:", error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchUsers();
  // }, []);

  // 🔹 Fetch data from backend API
useEffect(() => {
  const fetchUsers = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}api/material-deliver.php`, {
        method: "GET",
      });
      const data = await response.json();
      console.log("API Response:", data);
      
      // Match plants with users based on customer_id
      const usersWithPlants = data.data.map(user => {
        // Find plants for this specific user based on customer_id
        const userPlants = data.plants.filter(plant => 
          plant.customer_id === user.customer_id
        );
        const userNutrients = data.nutrients.filter(nutrient => 
          nutrient.customer_id === user.customer_id
        );
        const userchargeableItem = data.chargeableItems.filter(chargeableItem => 
          chargeableItem.customer_id === user.customer_id
        );
        
        return {
          ...user,
          plants: userPlants,
          nutrients: userNutrients,
          chargeableItems: userchargeableItem

        };
      });
      
      console.log("Users with plants:", usersWithPlants);
      setAllUsers(usersWithPlants);
      setPlantsList(data.plants || []);
      setNutrientsList(data.nutrients || []);
      setChargeableItemList(data.chargeableItems || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  fetchUsers();
}, []);

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


const generatePDF = (user) => {
  if (!window.jspdf) {
    alert('PDF library is still loading. Please try again in a moment.');
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  // Helper function to format dates
  const formatDateForPDF = (dateString) => {
    if (!dateString) return "-";
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Helper function for nutrient calculation
  const calculateSuppliesForPDF = (tankCapacity, topups) => {
    if (!tankCapacity || !topups) return "0";
    const capacity = parseFloat(tankCapacity);
    const topup = parseFloat(topups);
    if (isNaN(capacity) || isNaN(topup)) return "0";
    return (capacity * topup).toFixed(2);
  };

  /* -------------------------------------------------------
     🔹 CUSTOMER HEADER INFORMATION
  --------------------------------------------------------*/
  // Determine delivery date based on status
  let deliveryDateText;
  
  if (user.delivery_status && 
      (user.delivery_status.toLowerCase() === 'partial' || 
       user.delivery_status.toLowerCase() === 'yes')) {
    // Check if updated_date exists and is not null
    if (user.updated_date && user.updated_date !== null && user.updated_date !== 'null') {
      deliveryDateText = formatDateForPDF(user.updated_date);
    } else {
      // Fallback to created_date if updated_date is not available
      deliveryDateText = formatDateForPDF(user.created_date || new Date().toISOString());
    }
  } else if (user.delivery_status && user.delivery_status.toLowerCase() === 'no') {
    deliveryDateText = "Not Delivered";
  } else {
    // Default case
    deliveryDateText = formatDateForPDF(user.created_date || new Date().toISOString());
  }

  // Determine delivery status text and color
  const deliveryStatus = user.delivery_status || "Not specified";
  let statusText = deliveryStatus;
  let statusColor = [0, 0, 0]; // Default black
  
  switch(deliveryStatus.toLowerCase()) {
    case 'delivered':
    case 'yes':
      statusColor = [34, 197, 94]; // Green
      statusText = "Delivered";
      break;
    case 'partial':
      statusColor = [244, 166, 76]; // Amber/Orange
      statusText = "Partially Delivered";
      break;
    case 'pending':
    case 'no':
      statusColor = [239, 68, 68]; // Red
      statusText = "Pending";
      break;
  }

  /* -------------------------------------------------------
     🔹 HEADER DESIGN (Matching your design)
  --------------------------------------------------------*/
  const logoPath = `${import.meta.env.BASE_URL}img/growprologo.jpeg`; 
  doc.addImage(logoPath, 'JPEG', 15, 10, 30, 30);

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  const textStartX = margin + 30;

  // Title
  doc.setFontSize(14);
  doc.setFont(undefined, "bold");
  doc.text("Consumables Delivery Report", pageWidth / 2, 20, { align: "center" });

  let yPos = 40;

  // Client Name (Customer Name in our case)
  doc.setFontSize(10);
  doc.setFont(undefined, "normal");
  doc.text("Client Name:", textStartX, yPos);
  doc.setFont(undefined, "bold");
  // Draw line for client name
  doc.line(textStartX + 28, yPos + 1, textStartX + 90, yPos + 1);
  // Add customer name text
  doc.text(user.name || "", textStartX + 29, yPos);

  // Delivery Date on the right side
  doc.setFont(undefined, "normal");
  doc.text("Delivery Date:", pageWidth - 75, yPos);
  doc.setFont(undefined, "bold");
  // Draw line for delivery date
  doc.line(pageWidth - 45, yPos + 1, pageWidth - 15, yPos + 1);
  // Add delivery date text
  doc.text(deliveryDateText, pageWidth - 44, yPos);

  yPos += 7;

  // Visited By (Technician Name in our case)
  doc.setFont(undefined, "normal");
  // doc.text("Visited By:", textStartX, yPos);
  doc.setFont(undefined, "bold");
  // Draw line for visited by
  // doc.line(textStartX + 28, yPos + 1, textStartX + 90, yPos + 1);
  // Add technician name text
  // doc.text(user.tech_name || "-", textStartX + 29, yPos);

  // Delivery Status on the right side
  doc.setFont(undefined, "normal");
  doc.text("Delivery Status:", pageWidth - 75, yPos);
  doc.setFont(undefined, "bold");
  // Draw line for delivery status
  doc.line(pageWidth - 45, yPos + 1, pageWidth - 15, yPos + 1);
  // Add delivery status with color
  doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
  doc.text(statusText, pageWidth - 44, yPos);
  doc.setTextColor(0, 0, 0); // Reset to black

  yPos += 10;

  // Separator line below header
  doc.setDrawColor(0, 0, 0); // Black line
  doc.setLineWidth(0.5);
  doc.line(margin, yPos, pageWidth - margin, yPos);

  yPos += 15;

  // Reset to normal font weight
  doc.setFont(undefined, "normal");

  /* -------------------------------------------------------
     🔹 DELIVERY INFORMATION
  --------------------------------------------------------*/
  yPos += 5;
  doc.setFontSize(12);
  doc.setFont(undefined, "bold");
  doc.setTextColor(59, 130, 246);
  doc.text("Dear Customer, the following are our consumables we have delivered to you:", 20, yPos);

  yPos += 6;
  doc.setLineWidth(0.3);
  doc.line(20, yPos, 190, yPos);

  yPos += 10;
  doc.setFontSize(11);

  /* -------------------------------------------------------
     🔹 PLANTS DELIVERED
  --------------------------------------------------------*/
  // Check if we need a new page before plants
  if (yPos > 250 && user.plants && user.plants.length > 0) {
    doc.addPage();
    yPos = 20;
  }

  if (user.plants && user.plants.length > 0) {
    doc.setFontSize(16);
    doc.setFont(undefined, "bold");
    doc.setTextColor(59, 130, 246);
    doc.text("Plant Delivery:", 20, yPos);
    

    yPos += 6;
    doc.setLineWidth(0.3);
    doc.line(20, yPos, 190, yPos);

    yPos += 10;

    // Table headers for plants
    doc.setFontSize(10);
    doc.setFont(undefined, "bold");
    doc.setTextColor(244, 166, 76);
    doc.text("#", 25, yPos);
    doc.text("Plant Name", 35, yPos);
    doc.text("Quantity", 120, yPos);
    
    yPos += 8;
    doc.setLineWidth(0.2);
    doc.line(20, yPos, 190, yPos);
    yPos += 5;
    
    // Plants data rows
    doc.setFontSize(9);
    doc.setFont(undefined, "normal");
    doc.setTextColor(0, 0, 0);
    
    user.plants.forEach((plant, index) => {
      // Check if we need a new page
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      
      const serialNo = index + 1;
      const plantName = plant.plant_name === "Others" || plant.plant_name === "others"
        ? (plant.other_plant_name || "Custom Plant")
        : plant.plant_name || "-";
      const quantity = plant.quantity || "-";
      
      doc.text(serialNo.toString(), 25, yPos);
      doc.text(plantName, 35, yPos);
      doc.text(quantity.toString(), 120, yPos);
      
      yPos += 8;
      
      // Add small space between rows
      if (index < user.plants.length - 1) {
        doc.setLineWidth(0.1);
        doc.line(35, yPos, 180, yPos);
        yPos += 5;
      }
    });
    
    // Add total summary for plants
    yPos += 10;
    doc.setFontSize(10);
    
    // Total Plants label (orange)
    doc.setFont(undefined, "bold");
    doc.setTextColor(244, 166, 76);
    doc.text("Total Plants: ", 25, yPos);
    
    // Total Plants value (black)
    doc.setFont(undefined, "bold");
    doc.setTextColor(0, 0, 0);
    doc.text(`${user.plants.length}`, 60, yPos);
    
    const totalPlantQuantity = user.plants.reduce((sum, plant) => {
      return sum + (parseInt(plant.quantity) || 0);
    }, 0);
    
    // Total Plant Quantity label (orange)
    doc.setFont(undefined, "bold");
    doc.setTextColor(244, 166, 76);
    doc.text("Total Plant Quantity: ", 100, yPos);
    
    // Total Plant Quantity value (black)
    doc.setFont(undefined, "bold");
    doc.setTextColor(0, 0, 0);
    doc.text(`${totalPlantQuantity} units`, 145, yPos);
    
    yPos += 15;
    
  } else {
    doc.setFontSize(10);
    doc.setFont(undefined, "normal");
    doc.text("No plants listed for delivery", 25, yPos);
    yPos += 15;
  }

  /* -------------------------------------------------------
     🔹 NUTRIENTS INFORMATION
  --------------------------------------------------------*/
  // Check if we need a new page before nutrients
  if (yPos > 180 && user.nutrients && user.nutrients.length > 0) {
    doc.addPage();
    yPos = 20;
  }

  if (user.nutrients && user.nutrients.length > 0) {
    doc.setFontSize(16);
    doc.setFont(undefined, "bold");
    doc.setTextColor(59, 130, 246);
    doc.text("Nutrients Delivery:", 20, yPos);
    
    yPos += 6;
    doc.setLineWidth(0.3);
    doc.line(20, yPos, 190, yPos);
    
    yPos += 10;
    
    // Table headers for nutrients
    doc.setFontSize(10);
    doc.setFont(undefined, "bold");
    doc.setTextColor(244, 166, 76);
    doc.text("#", 25, yPos);
    doc.text("Nutrient Type", 35, yPos);
    doc.text("Tank Capacity", 90, yPos);
    doc.text("Topups", 130, yPos);
    doc.text("Total Nutrients", 160, yPos);
    
    yPos += 8;
    doc.setLineWidth(0.2);
    doc.line(20, yPos, 190, yPos);
    yPos += 5;
    
    // Nutrients data rows
    doc.setFontSize(9);
    doc.setFont(undefined, "normal");
    doc.setTextColor(0, 0, 0);
    
    user.nutrients.forEach((nutrient, index) => {
      // Check if we need a new page
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      
      const serialNo = index + 1;
      const nutrientType = nutrient.nutrient_type || "-";
      const tankCapacity = nutrient.tank_capacity || "-";
      const topups = nutrient.topups || "-";
      const supplies = calculateSuppliesForPDF(nutrient.tank_capacity, nutrient.topups) + " L";
      
      doc.text(serialNo.toString(), 25, yPos);
      doc.text(nutrientType, 35, yPos);
      doc.text(`${tankCapacity} L`, 90, yPos);
      doc.text(topups, 130, yPos);
      doc.text(supplies, 160, yPos);
      
      yPos += 8;
      
      // Add small space between rows
      if (index < user.nutrients.length - 1) {
        doc.setLineWidth(0.1);
        doc.line(35, yPos, 180, yPos);
        yPos += 5;
      }
    });
    
    // Add total summary for nutrients
    yPos += 10;
    doc.setFontSize(10);
    
    const totalSupplies = user.nutrients.reduce((sum, nutrient) => {
      if (!nutrient.tank_capacity || !nutrient.topups) return sum;
      const capacity = parseFloat(nutrient.tank_capacity);
      const topups = parseFloat(nutrient.topups);
      if (isNaN(capacity) || isNaN(topups)) return sum;
      return sum + (capacity * topups);
    }, 0);
    
    // Total Nutrient Supplies label (orange)
    doc.setFont(undefined, "bold");
    doc.setTextColor(244, 166, 76);
    doc.text("Total Nutrient Supplies: ", 25, yPos);
    
    // Total Nutrient Supplies value (black)
    doc.setFont(undefined, "bold");
    doc.setTextColor(0, 0, 0);
    doc.text(`${totalSupplies.toFixed(2)} L`, 70, yPos);
    
    yPos += 15;
  }

  /* -------------------------------------------------------
     🔹 CHARGEABLE ITEMS
  --------------------------------------------------------*/
  // Check if we need a new page before chargeable items
  if (yPos > 180 && user.chargeableItems && user.chargeableItems.length > 0) {
    doc.addPage();
    yPos = 20;
  }

  if (user.chargeableItems && user.chargeableItems.length > 0) {
    doc.setFontSize(16);
    doc.setFont(undefined, "bold");
    doc.setTextColor(59, 130, 246);
    doc.text("Chargeable Items:", 20, yPos);
    
    yPos += 6;
    doc.setLineWidth(0.3);
    doc.line(20, yPos, 190, yPos);
    
    yPos += 10;
    
    // Table headers for chargeable items
    doc.setFontSize(10);
    doc.setFont(undefined, "bold");
    doc.setTextColor(244, 166, 76);
    doc.text("#", 25, yPos);
    doc.text("Item Name", 40, yPos);
    doc.text("Quantity", 150, yPos);
    
    yPos += 8;
    doc.setLineWidth(0.2);
    doc.line(20, yPos, 190, yPos);
    yPos += 5;
    
    // Chargeable items data rows
    doc.setFontSize(9);
    doc.setFont(undefined, "normal");
    doc.setTextColor(0, 0, 0);
    
    user.chargeableItems.forEach((item, index) => {
      // Check if we need a new page
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      
      const serialNo = index + 1;
      const itemName = item.item_name === "Others" || item.item_name === "others"
        ? (item.other_item_name || "Custom Item")
        : item.item_name || "-";
      const quantity = item.quantity || "-";
      
      doc.text(serialNo.toString(), 25, yPos);
      doc.text(itemName, 40, yPos);
      doc.text(quantity.toString(), 150, yPos);
      
      yPos += 8;
      
      // Add small space between rows
      if (index < user.chargeableItems.length - 1) {
        doc.setLineWidth(0.1);
        doc.line(40, yPos, 180, yPos);
        yPos += 5;
      }
    });
    
    // Add total summary for chargeable items
    yPos += 10;
    doc.setFontSize(10);
    
    const totalChargeableItems = user.chargeableItems.length;
    const totalChargeableQuantity = user.chargeableItems.reduce((sum, item) => {
      return sum + (parseInt(item.quantity) || 0);
    }, 0);
    
    // Total Chargeable Items label (orange)
    doc.setFont(undefined, "bold");
    doc.setTextColor(244, 166, 76);
    doc.text("Total Chargeable Items: ", 25, yPos);
    
    // Total Chargeable Items value (black)
    doc.setFont(undefined, "bold");
    doc.setTextColor(0, 0, 0);
    doc.text(`${totalChargeableItems}`, 75, yPos);
    
    // Total Quantity label (orange)
    doc.setFont(undefined, "bold");
    doc.setTextColor(244, 166, 76);
    doc.text("Total Quantity: ", 100, yPos);
    
    // Total Quantity value (black)
    doc.setFont(undefined, "bold");
    doc.setTextColor(0, 0, 0);
    doc.text(`${totalChargeableQuantity} units`, 130, yPos);
    
    yPos += 15;
  }

  /* -------------------------------------------------------
     🔹 OVERALL SUMMARY
  --------------------------------------------------------*/
  yPos += 5;
  doc.setFontSize(14);
  doc.setFont(undefined, "bold");
  doc.setTextColor(59, 130, 246);
  doc.text("Overall Summary", 20, yPos);
  
  yPos += 6;
  doc.setLineWidth(0.3);
  doc.line(20, yPos, 190, yPos);
  
  yPos += 10;
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  
  // Calculate totals
  const totalPlants = user.plants?.length || 0;
  const totalNutrientsCount = user.nutrients?.length || 0;
  const totalChargeableItemsCount = user.chargeableItems?.length || 0;
  const totalItems = totalPlants + totalNutrientsCount + totalChargeableItemsCount;
  
  doc.text(`Total Items Delivered: ${totalItems}`, 25, yPos);
  yPos += 8;
  
  if (totalPlants > 0) {
    const totalPlantQty = user.plants.reduce((sum, plant) => sum + (parseInt(plant.quantity) || 0), 0);
    doc.text(`Total Plants: ${totalPlantQty} units`, 25, yPos);
    yPos += 8;
  }
  
  if (totalNutrientsCount > 0) {
    const totalSupplies = user.nutrients.reduce((sum, nutrient) => {
      if (!nutrient.tank_capacity || !nutrient.topups) return sum;
      const capacity = parseFloat(nutrient.tank_capacity);
      const topups = parseFloat(nutrient.topups);
      if (isNaN(capacity) || isNaN(topups)) return sum;
      return sum + (capacity * topups);
    }, 0);
    doc.text(`Total Nutrients: ${totalSupplies.toFixed(2)} L`, 25, yPos);
    yPos += 8;
  }
  
  if (totalChargeableItemsCount > 0) {
    const totalChargeableQty = user.chargeableItems.reduce((sum, item) => 
      sum + (parseInt(item.quantity) || 0), 0);
    doc.text(`Total Chargeable Items: ${totalChargeableQty} units`, 25, yPos);
    yPos += 8;
  }

  yPos += 15;
  doc.setFontSize(12);
  doc.setFont(undefined, "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("Do let us know if you'd like any further clarity on the material supplied. ", 20, yPos);
  
  yPos += 15;
  doc.text("Happy Growing!", 20, yPos);
  yPos += 8;
  doc.setFontSize(10);
  doc.setFont(undefined, "normal");
  doc.setTextColor(66, 66, 66);
  doc.text("Email: sales@growpro.co.in", 20, yPos);
  doc.link(20, yPos - 5, 200, 10, { url: "mailto:sales@growpro.co.in" });
  yPos += 6;
  doc.text("Phone: 859 175 3001", 20, yPos);
  doc.link(20, yPos - 5, 200, 10, { url: "tel:+91 859 175 3001" });
  yPos += 6;
  doc.text("GrowPro Technology", 20, yPos);
  doc.link(20, yPos - 5, 200, 10, { url: "https://growpro.com/" });

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
  const safeName = (user.name || "customer").replace(/\s+/g, '_');
  const fileName = `Consumables_Delivery_Report_${formatDateForPDF(user.created_date)}_${safeName}.pdf`;
  doc.save(fileName);
};

// Helper function for nutrient calculation
function calculateSuppliesForPDF(tankCapacity, topups) {
  if (!tankCapacity || !topups) return "0";
  const capacity = parseFloat(tankCapacity);
  const topup = parseFloat(topups);
  if (isNaN(capacity) || isNaN(topup)) return "0";
  return (capacity * topup).toFixed(2);
}

  // 🔹 Handle sorting
  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // 🔹 Sort users based on sortConfig
  const sortedUsers = useMemo(() => {
    const users = [...allUsers];
    if (sortConfig.key) {
      users.sort((a, b) => {
        // Handle different data types for proper sorting
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        // Convert to lowercase for string comparison
        if (typeof aValue === 'string') {
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
    }
    return users;
  }, [allUsers, sortConfig]);

  // 🔹 Filter users based on search
const filteredUsers = useMemo(() => {
  if (!searchQuery.trim()) return sortedUsers;{plantsList.length > 0 ? "Plants" : ""}

  const query = searchQuery.toLowerCase();

  return sortedUsers.filter((user) => {
    return (
      user.name?.toLowerCase().includes(query) ||
      user.tech_name?.toLowerCase().includes(query) ||
      user.locality?.toLowerCase().includes(query) ||
      user.delivery_status?.toLowerCase().includes(query)
    );
  });
}, [sortedUsers, searchQuery]);


  // Pagination logic
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  // 🔹 Sort indicator component
  const SortIndicator = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) {
      return <span className="ml-1 opacity-50">↕↕</span>;
    }
    return (
      <span className="ml-1">
        {sortConfig.direction === 'ascending' ? '↑' : '↓'}
      </span>
    );
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleEdit = (userId) => {
    navigate(`/dashboard/editmaterialdeliver/${userId}`);
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
              Manage Material Deliver
            </h2>
            <p className="text-sm sm:text-base text-gray-600">
              View and manage deliver material
            </p>
          </div>

          <div className="mt-3 sm:mt-0 w-full sm:w-1/3 relative">
            <input
              type="text"
              placeholder="Search by name, email, role, or mobile..."
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
                        className="w-[20%] py-4 px-4 font-medium text-gray-700 text-left cursor-pointer hover:bg-gray-50 transition"
                        onClick={() => handleSort('name')}
                      >
                        <div className="flex items-center">
                          Customer Name
                          <SortIndicator columnKey="name" />
                        </div>
                      </th>
                      <th
                        className="w-[12%] py-4 px-4 font-medium text-gray-700 text-left cursor-pointer hover:bg-gray-50 transition"
                        onClick={() => handleSort('tech_name')}
                      >
                        <div className="flex items-center">
                          Tech Name
                          <SortIndicator columnKey="tech_name" />
                        </div>
                      </th>
                      <th
                        className="w-[14%] py-4 px-4 font-medium text-gray-700 text-left cursor-pointer hover:bg-gray-50 transition"
                        onClick={() => handleSort('locality')}
                      >
                        <div className="flex items-center">
                          Locality
                          <SortIndicator columnKey="locality" />
                        </div>
                      </th>
                      <th
                        className="w-[25%] py-4 px-4 font-medium text-gray-700 text-left cursor-pointer hover:bg-gray-50 transition"
                        onClick={() => handleSort('plant')}
                      >
                        <div className="flex items-center">
                          Material Need To Deliver
                          <SortIndicator columnKey="plant" />
                        </div>
                      </th>
                      <th
                        className="w-[15%] py-4 px-4 font-medium text-gray-700 text-left cursor-pointer hover:bg-gray-50 transition"
                        onClick={() => handleSort('delivery_status')}
                      >
                        <div className="flex items-center">
                          Deliver Status
                          <SortIndicator columnKey="delivery_status" />
                        </div>
                      </th>
                      {userRole !== "technician" && (
                      <>
                        <th className="w-[12%] py-4 px-4 font-medium text-gray-700 text-center">
                          PDF Report
                        </th>
                        <th className="w-[10%] py-4 px-4 font-medium text-gray-700 text-right">
                          Action
                        </th>
                      </>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {currentUsers.map((user) => {

                      return (
                        <tr
                          key={user._id}
                          className="border-b border-gray-200 hover:bg-gray-50 transition"
                        >
                          {/* Name */}
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={
                                  user.profile_pic
                                    ? `${import.meta.env.VITE_API_URL}uploads/users/${user.profile_pic}`
                                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                      user.name
                                    )}&background=3b82f6&color=fff`
                                }
                                alt={user.name}
                                className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                              />
                              <span className="font-medium text-gray-800 truncate">
                                {user.name}
                              </span>
                            </div>
                          </td>

                          <td className="py-4 px-4 text-gray-700 truncate">
                            {user.tech_name}
                          </td>

                          {/* Phone */}
                          <td className="py-4 px-4 text-gray-700 truncate">
                            {/* <a href={`tel:${user.phone || user.mobile}`} className="text-blue-600 hover:underline"> */}
                              {user.locality}
                            {/* </a> */}
                          </td>

                          <td className="py-4 px-4 text-gray-700">
                            {user.plants?.length > 0 && "Plants"}
                            {user.nutrients?.length > 0 && (user.plants?.length > 0 ? ", Nutrients" : "Nutrients")}
                            {user.chargeableItems?.length > 0 &&
                              ((user.plants?.length > 0 || user.nutrients?.length > 0)
                                ? ", Chargeable Items"
                                : "Chargeable Items")}
                          </td>


                          <td className="py-4 px-4 text-gray-700 truncate">
                            {user.delivery_status?.toUpperCase()}
                          </td>
                          {userRole !== "technician" && (
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
                          )}

                          {/* Action */}
                          {userRole !== "technician" && (
                            <td className="py-4 px-4 text-right">
                              <button
                                onClick={() => handleEdit(user.id)}
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
                      key={user._id}
                      className="border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition bg-white"
                    >
                      <div className="flex items-start gap-4 mb-5">
                        <img
                          src={
                            user.profile_pic
                              ? `${import.meta.env.VITE_API_URL}uploads/users/${user.profile_pic}`
                              : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                user.name
                              )}&background=3b82f6&color=fff`
                          }
                          alt={user.name}
                          className="w-14 h-14 rounded-full object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-800 text-lg mb-2">
                            {user.name} <br /><small>({user.user_code})</small>
                          </h3>
                        </div>
                      </div>

                      <div className="space-y-3 mb-5">
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                            Locality
                          </span>
                          <span className="text-sm text-gray-700 break-all">
                            {/* <a href={`tel:${user.phone}`} className="text-blue-600 hover:underline"> */}
                              {user.locality}
                            {/* </a> */}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleEdit(user.id)}
                        className="w-full px-4 py-2.5 btn-primary"
                      >
                        Edit
                      </button>
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


