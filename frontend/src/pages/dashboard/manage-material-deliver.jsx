import React, { useState, useEffect, useMemo } from "react";
import { FileText, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function UserTable() {
  const [allUsers, setAllUsers] = useState([]);
  const [plantsList, setPlantsList] = useState([]);
  const [nutrientsList, setNutrientsList] = useState([]);
  const [chargeableItemList, setChargeableItemList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage, setUsersPerPage] = useState(10);
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

  const navigate = useNavigate();
  const [pdfLoaded, setPdfLoaded] = useState(false);

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
            plant.customer_id === user.customer_id &&
            plant.onsite_id === user.onsite_id &&
            (plant.plant_name != '' || plant.other_plant_name != '')
          );
          const userNutrients = data.nutrients.filter(nutrient =>
            nutrient.customer_id === user.customer_id &&
            nutrient.onsite_id === user.onsite_id &&
            (nutrient.nutrient_type != '' || nutrient.other_nutrient_name != '')
          );
          const userchargeableItem = data.chargeableItems.filter(chargeableItem =>
            chargeableItem.customer_id === user.customer_id &&
            chargeableItem.onsite_id === user.onsite_id &&
            (chargeableItem.item_name != '' || chargeableItem.other_item_name != '')
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
       🔹 DETERMINE ORDER TYPE AND FILTER ITEMS
    --------------------------------------------------------*/
    const isOffsiteOrder = user.offsite_id && user.offsite_id !== null && user.offsite_id !== 'null';
    const isOnsiteOrder = user.onsite_id && user.onsite_id !== null && user.onsite_id !== 'null';
    
    let orderId = "-";
    let orderType = "";
    let filteredPlants = [];
    let filteredNutrients = [];
    let filteredChargeableItems = [];
    
    // CRITICAL: Filter items by BOTH order ID AND customer ID
    if (isOffsiteOrder) {
      orderId = user.offsite_id;
      orderType = "Offsite Order";
      
      // Filter plants - must match both offsite_id AND customer_id
      if (user.plants && Array.isArray(user.plants)) {
        filteredPlants = user.plants.filter(plant => 
          plant.offsite_id === orderId && 
          plant.customer_id === user.customer_id
        );
      }
      
      // Filter nutrients - must match both offsite_id AND customer_id
      if (user.nutrients && Array.isArray(user.nutrients)) {
        filteredNutrients = user.nutrients.filter(nutrient => 
          nutrient.offsite_id === orderId && 
          nutrient.customer_id === user.customer_id
        );
      }
      
      // Filter chargeable items - must match both offsite_id AND customer_id
      if (user.chargeableItems && Array.isArray(user.chargeableItems)) {
        filteredChargeableItems = user.chargeableItems.filter(item => 
          item.offsite_id === orderId && 
          item.customer_id === user.customer_id
        );
      }
      
    } else if (isOnsiteOrder) {
      orderId = user.onsite_id;
      orderType = "Onsite Order";
      
      // Filter plants - must match both onsite_id AND customer_id
      if (user.plants && Array.isArray(user.plants)) {
        filteredPlants = user.plants.filter(plant => 
          plant.onsite_id === orderId && 
          plant.customer_id === user.customer_id
        );
      }
      
      // Filter nutrients - must match both onsite_id AND customer_id
      if (user.nutrients && Array.isArray(user.nutrients)) {
        filteredNutrients = user.nutrients.filter(nutrient => 
          nutrient.onsite_id === orderId && 
          nutrient.customer_id === user.customer_id
        );
      }
      
      // Filter chargeable items - must match both onsite_id AND customer_id
      if (user.chargeableItems && Array.isArray(user.chargeableItems)) {
        filteredChargeableItems = user.chargeableItems.filter(item => 
          item.onsite_id === orderId && 
          item.customer_id === user.customer_id
        );
      }
      
    } else {
      // Fallback - no specific order type
      orderId = user.id || "-";
      orderType = "Order";
      filteredPlants = user.plants || [];
      filteredNutrients = user.nutrients || [];
      filteredChargeableItems = user.chargeableItems || [];
    }

    // Debug log to verify filtering
    console.log(`Generating PDF for ${orderType} ID: ${orderId}, Customer ID: ${user.customer_id}`);
    console.log(`Filtered Plants: ${filteredPlants.length} items`);
    console.log(`Filtered Nutrients: ${filteredNutrients.length} items`);
    console.log(`Filtered Chargeable Items: ${filteredChargeableItems.length} items`);

    /* -------------------------------------------------------
       🔹 CUSTOMER HEADER INFORMATION
    --------------------------------------------------------*/
    let deliveryDateText;

    if (user.delivery_status &&
      (user.delivery_status.toLowerCase() === 'partial' ||
        user.delivery_status.toLowerCase() === 'yes')) {
      if (user.updated_date && user.updated_date !== null && user.updated_date !== 'null') {
        deliveryDateText = formatDateForPDF(user.updated_date);
      } else {
        deliveryDateText = formatDateForPDF(user.created_date || new Date().toISOString());
      }
    } else if (user.delivery_status && user.delivery_status.toLowerCase() === 'no') {
      deliveryDateText = "Not Delivered";
    } else {
      deliveryDateText = formatDateForPDF(user.created_date || new Date().toISOString());
    }

    const deliveryStatus = user.delivery_status || "Not specified";
    let statusText = deliveryStatus;
    let statusColor = [0, 0, 0];

    switch (deliveryStatus.toLowerCase()) {
      case 'delivered':
      case 'yes':
        statusColor = [34, 197, 94];
        statusText = "Delivered";
        break;
      case 'partial':
        statusColor = [244, 166, 76];
        statusText = "Partially Delivered";
        break;
      case 'pending':
      case 'no':
        statusColor = [239, 68, 68];
        statusText = "Pending";
        break;
    }

    /* -------------------------------------------------------
       🔹 HEADER DESIGN
    --------------------------------------------------------*/
    const logoPath = `${import.meta.env.BASE_URL}img/growprologo.jpeg`;
    try {
      doc.addImage(logoPath, 'JPEG', 15, 10, 30, 30);
    } catch (error) {
      console.error('Error adding logo:', error);
    }

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    const textStartX = margin + 30;

    doc.setFontSize(14);
    doc.setFont(undefined, "bold");
    doc.text("Consumables Delivery Report", pageWidth / 2, 20, { align: "center" });

    let yPos = 40;

    // Client Name
    doc.setFontSize(10);
    doc.setFont(undefined, "normal");
    doc.text("Client Name:", textStartX, yPos);
    doc.setFont(undefined, "bold");
    doc.line(textStartX + 28, yPos + 1, textStartX + 90, yPos + 1);
    doc.text(user.name || "", textStartX + 29, yPos);

    // Delivery Date
    doc.setFont(undefined, "normal");
    doc.text("Delivery Date:", pageWidth - 75, yPos);
    doc.setFont(undefined, "bold");
    doc.line(pageWidth - 45, yPos + 1, pageWidth - 15, yPos + 1);
    doc.text(deliveryDateText, pageWidth - 44, yPos);

    yPos += 7;

    // Delivery Status
    doc.setFont(undefined, "normal");
    doc.text("Delivery Status:", pageWidth - 75, yPos);
    doc.setFont(undefined, "bold");
    doc.line(pageWidth - 45, yPos + 1, pageWidth - 15, yPos + 1);
    doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
    doc.text(statusText, pageWidth - 44, yPos);
    doc.setTextColor(0, 0, 0);

    yPos += 7;

    // Order ID and Customer ID
    doc.setFont(undefined, "normal");
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(`${orderType} ID:`, textStartX, yPos);
    doc.setFont(undefined, "bold");
    doc.setTextColor(0, 0, 0);
    const orderLabelWidth = orderType === "Offsite Order" ? 35 : 32;
    doc.line(textStartX + orderLabelWidth, yPos + 1, textStartX + 90, yPos + 1);
    doc.text(orderId.toString(), textStartX + orderLabelWidth + 1, yPos);

    // Customer ID
    doc.setFont(undefined, "normal");
    doc.setTextColor(100, 100, 100);
    doc.text("Customer ID:", pageWidth - 75, yPos);
    doc.setFont(undefined, "bold");
    doc.setTextColor(0, 0, 0);
    doc.line(pageWidth - 45, yPos + 1, pageWidth - 15, yPos + 1);
    doc.text(user.customer_id?.toString() || "-", pageWidth - 44, yPos);
    
    doc.setTextColor(0, 0, 0);

    yPos += 10;

    // Separator line
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.line(margin, yPos, pageWidth - margin, yPos);

    yPos += 15;
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
       🔹 PLANTS DELIVERED (FILTERED BY ORDER)
    --------------------------------------------------------*/
    if (yPos > 200 && filteredPlants.length > 0) {
      doc.addPage();
      yPos = 20;
    }

    if (filteredPlants.length > 0) {
      doc.setFontSize(16);
      doc.setFont(undefined, "bold");
      doc.setTextColor(59, 130, 246);
      doc.text("Plant Delivery:", 20, yPos);

      yPos += 6;
      doc.setLineWidth(0.3);
      doc.line(20, yPos, 190, yPos);

      yPos += 10;

      // Table headers
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

      doc.setFontSize(9);
      doc.setFont(undefined, "normal");
      doc.setTextColor(0, 0, 0);

      filteredPlants.forEach((plant, index) => {
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }

        const serialNo = index + 1;
        // Handle "Others" plant names
        const plantName = plant.plant_name === "Others" || plant.plant_name === "others"
          ? (plant.other_plant_name || "Custom Plant")
          : plant.plant_name || "-";
        const quantity = plant.quantity || "-";

        doc.text(serialNo.toString(), 25, yPos);
        doc.text(plantName, 35, yPos);
        doc.text(quantity.toString(), 120, yPos);

        yPos += 8;

        if (index < filteredPlants.length - 1) {
          doc.setLineWidth(0.1);
          doc.line(35, yPos, 180, yPos);
          yPos += 5;
        }
      });

      // Total summary
      yPos += 10;
      doc.setFontSize(10);

      doc.setFont(undefined, "bold");
      doc.setTextColor(244, 166, 76);
      doc.text("Total Plants: ", 25, yPos);

      doc.setFont(undefined, "bold");
      doc.setTextColor(0, 0, 0);
      doc.text(`${filteredPlants.length}`, 60, yPos);

      const totalPlantQuantity = filteredPlants.reduce((sum, plant) => {
        return sum + (parseInt(plant.quantity) || 0);
      }, 0);

      doc.setFont(undefined, "bold");
      doc.setTextColor(244, 166, 76);
      doc.text("Total Plant Quantity: ", 100, yPos);

      doc.setFont(undefined, "bold");
      doc.setTextColor(0, 0, 0);
      doc.text(`${totalPlantQuantity} units`, 145, yPos);

      yPos += 15;

    } else {
      doc.setFontSize(10);
      doc.setFont(undefined, "normal");
      doc.text("No plants listed for this delivery", 25, yPos);
      yPos += 15;
    }

    /* -------------------------------------------------------
       🔹 NUTRIENTS INFORMATION (FILTERED BY ORDER)
    --------------------------------------------------------*/
    if (yPos > 180 && filteredNutrients.length > 0) {
      doc.addPage();
      yPos = 20;
    }

    if (filteredNutrients.length > 0) {
      doc.setFontSize(16);
      doc.setFont(undefined, "bold");
      doc.setTextColor(59, 130, 246);
      doc.text("Nutrients Delivery:", 20, yPos);

      yPos += 6;
      doc.setLineWidth(0.3);
      doc.line(20, yPos, 190, yPos);

      yPos += 10;

      // Table headers
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

      doc.setFontSize(9);
      doc.setFont(undefined, "normal");
      doc.setTextColor(0, 0, 0);

      filteredNutrients.forEach((nutrient, index) => {
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

        if (index < filteredNutrients.length - 1) {
          doc.setLineWidth(0.1);
          doc.line(35, yPos, 180, yPos);
          yPos += 5;
        }
      });

      // Total summary
      yPos += 10;
      doc.setFontSize(10);

      const totalSupplies = filteredNutrients.reduce((sum, nutrient) => {
        if (!nutrient.tank_capacity || !nutrient.topups) return sum;
        const capacity = parseFloat(nutrient.tank_capacity);
        const topups = parseFloat(nutrient.topups);
        if (isNaN(capacity) || isNaN(topups)) return sum;
        return sum + (capacity * topups);
      }, 0);

      doc.setFont(undefined, "bold");
      doc.setTextColor(244, 166, 76);
      doc.text("Total Nutrient Supplies: ", 25, yPos);

      doc.setFont(undefined, "bold");
      doc.setTextColor(0, 0, 0);
      doc.text(`${totalSupplies.toFixed(2)} L`, 70, yPos);

      yPos += 15;
    }

    /* -------------------------------------------------------
       🔹 CHARGEABLE ITEMS (FILTERED BY ORDER)
    --------------------------------------------------------*/
    if (yPos > 180 && filteredChargeableItems.length > 0) {
      doc.addPage();
      yPos = 20;
    }

    if (filteredChargeableItems.length > 0) {
      doc.setFontSize(16);
      doc.setFont(undefined, "bold");
      doc.setTextColor(59, 130, 246);
      doc.text("Chargeable Items:", 20, yPos);

      yPos += 6;
      doc.setLineWidth(0.3);
      doc.line(20, yPos, 190, yPos);

      yPos += 10;

      // Table headers
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

      doc.setFontSize(9);
      doc.setFont(undefined, "normal");
      doc.setTextColor(0, 0, 0);

      filteredChargeableItems.forEach((item, index) => {
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

        if (index < filteredChargeableItems.length - 1) {
          doc.setLineWidth(0.1);
          doc.line(40, yPos, 180, yPos);
          yPos += 5;
        }
      });

      // Total summary
      yPos += 10;
      doc.setFontSize(10);

      const totalChargeableItems = filteredChargeableItems.length;
      const totalChargeableQuantity = filteredChargeableItems.reduce((sum, item) => {
        return sum + (parseInt(item.quantity) || 0);
      }, 0);

      doc.setFont(undefined, "bold");
      doc.setTextColor(244, 166, 76);
      doc.text("Total Chargeable Items: ", 25, yPos);

      doc.setFont(undefined, "bold");
      doc.setTextColor(0, 0, 0);
      doc.text(`${totalChargeableItems}`, 75, yPos);

      doc.setFont(undefined, "bold");
      doc.setTextColor(244, 166, 76);
      doc.text("Total Quantity: ", 100, yPos);

      doc.setFont(undefined, "bold");
      doc.setTextColor(0, 0, 0);
      doc.text(`${totalChargeableQuantity} units`, 130, yPos);

      yPos += 15;
    }

    /* -------------------------------------------------------
       🔹 OVERALL SUMMARY (Using Filtered Data)
    --------------------------------------------------------*/
    if (yPos > 150) {
      doc.addPage();
      yPos = 20;
    }

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

    const totalPlants = filteredPlants.length;
    const totalNutrientsCount = filteredNutrients.length;
    const totalChargeableItemsCount = filteredChargeableItems.length;
    const totalItems = totalPlants + totalNutrientsCount + totalChargeableItemsCount;

    doc.text(`Total Items Delivered: ${totalItems}`, 25, yPos);
    yPos += 8;

    if (totalPlants > 0) {
      const totalPlantQty = filteredPlants.reduce((sum, plant) => sum + (parseInt(plant.quantity) || 0), 0);
      doc.text(`Total Plants: ${totalPlantQty} units`, 25, yPos);
      yPos += 8;
    }

    if (totalNutrientsCount > 0) {
      const totalSupplies = filteredNutrients.reduce((sum, nutrient) => {
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
      const totalChargeableQty = filteredChargeableItems.reduce((sum, item) =>
        sum + (parseInt(item.quantity) || 0), 0);
      doc.text(`Total Chargeable Items: ${totalChargeableQty} units`, 25, yPos);
      yPos += 8;
    }

    /* -------------------------------------------------------
       🔹 CLOSING CONTENT
    --------------------------------------------------------*/
    if (yPos > 180) {
      doc.addPage();
      yPos = 20;
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

      const footerHeight = 22;
      const footerY = pageHeight - footerHeight;

      doc.setFillColor(255, 255, 255);
      doc.rect(0, footerY, pageWidth, footerHeight, "F");

      doc.setDrawColor(225, 122, 0);
      doc.setLineWidth(1.2);
      doc.line(0, footerY + 2, pageWidth, footerY + 2);

      const row1Y = footerY + 10;
      const row2Y = footerY + 17;

      doc.setFontSize(10);
      doc.setTextColor(225, 122, 0);
      doc.setFont(undefined, "bold");
      doc.text("Email:", 20, row1Y);

      const emailText = "sales@growpro.co.in";
      const emailX = 40;
      doc.setTextColor(0, 102, 204);
      doc.setFont(undefined, "normal");
      doc.text(emailText, emailX, row1Y);
      const emailWidth = doc.getTextWidth(emailText);
      doc.setDrawColor(0, 102, 204);
      doc.setLineWidth(0.2);
      doc.line(emailX, row1Y + 0.5, emailX + emailWidth, row1Y + 0.5);

      doc.setTextColor(225, 122, 0);
      doc.setFont(undefined, "bold");
      doc.text("Phone:", 20, row2Y);

      const phoneText = "+91 859 175 3001";
      const phoneX = 40;
      doc.setTextColor(0, 102, 204);
      doc.setFont(undefined, "normal");
      doc.text(phoneText, phoneX, row2Y);
      const phoneWidth = doc.getTextWidth(phoneText);
      doc.setDrawColor(0, 102, 204);
      doc.setLineWidth(0.2);
      doc.line(phoneX, row2Y + 0.5, phoneX + phoneWidth, row2Y + 0.5);

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
    const orderTypePrefix = isOffsiteOrder ? "Offsite" : (isOnsiteOrder ? "Onsite" : "Order");
    const fileName = `${orderTypePrefix}_${orderId}_${formatDateForPDF(user.created_date)}_${safeName}.pdf`;
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
    if (!searchQuery.trim()) {
      // Filter out users without plants, nutrients, or chargeable items
      return sortedUsers.filter((user) => {
        const hasData = 
          (user.plants?.length > 0) ||
          (user.nutrients?.length > 0) ||
          (user.chargeableItems?.length > 0);
        return hasData;
      });
    }
    const query = searchQuery.toLowerCase();
    
    return sortedUsers.filter((user) => {
      // First check if user has any data
      const hasData = 
        (user.plants?.length > 0) ||
        (user.nutrients?.length > 0) ||
        (user.chargeableItems?.length > 0);
      
      if (!hasData) return false;

      // Convert query to check for onsite/offsite
      const isOnsiteQuery = query.includes('onsite');
      const isOffsiteQuery = query.includes('offsite');

      return (
        user.name?.toLowerCase().includes(query) ||
        user.tech_name?.toLowerCase().includes(query) ||
        user.locality?.toLowerCase().includes(query) ||
        user.delivery_status?.toLowerCase().includes(query) ||
        user.order_type?.toLowerCase().includes(query) ||

        // Search for onsite/offsite status
        (isOnsiteQuery && user.tech_name) ||
        (isOffsiteQuery && !user.tech_name) ||

        // Also search the derived string value
        (user.tech_name ? 'onsite' : 'offsite').includes(query)
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

  const handleEdit = (userId, orderType) => {
    { orderType == 'onsite' ? navigate(`/dashboard/editmaterialdeliver/${userId}`) : navigate(`/dashboard/edit-offsite-material-order/${userId}`); }
  };

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const goToPrevious = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const goToNext = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const goToFirst = () => setCurrentPage(1);
  const goToLast = () => setCurrentPage(totalPages);

  // Get visible page numbers with ellipsis
  const getVisiblePages = () => {
    const delta = 2; // Number of pages to show on each side
    const range = [];
    
    if (totalPages <= 7) {
      // Show all pages if total pages is 7 or less
      for (let i = 1; i <= totalPages; i++) {
        range.push(i);
      }
      return range;
    }
    
    // Always include first page
    range.push(1);
    
    // Calculate range around current page
    const start = Math.max(2, currentPage - delta);
    const end = Math.min(totalPages - 1, currentPage + delta);
    
    // Add ellipsis if needed before middle range
    if (start > 2) {
      range.push("...");
    }
    
    // Add middle range
    for (let i = start; i <= end; i++) {
      range.push(i);
    }
    
    // Add ellipsis if needed after middle range
    if (end < totalPages - 1) {
      range.push("...");
    }
    
    // Always include last page
    if (totalPages > 1) {
      range.push(totalPages);
    }
    
    return range;
  };

  // Handle page size change
  const handlePageSizeChange = (e) => {
    setUsersPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

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
              placeholder="Search by name, technician, locality, or status..."
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
                      <th
                        className="w-[15%] py-4 px-4 font-medium text-gray-700 text-left cursor-pointer hover:bg-gray-50 transition"
                        onClick={() => handleSort('delivery_status')}
                      >
                        <div className="flex items-center">
                          Order Type
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
                                    ? `${import.meta.env.VITE_API_URL}uploads/customers/${user.profile_pic}`
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

                          {/* Locality */} 
                          <td className="py-4 px-4 text-gray-700 truncate">
                            {user.locality}
                          </td>

                          {/* Materials */}
                          <td className="py-4 px-4 text-gray-700">
                            {`${user.id}: `}
                            {user.plants?.length > 0 && "Plants"}
                            {user.nutrients?.length > 0 && (user.plants?.length > 0 ? ", Nutrients" : "Nutrients")}
                            {user.chargeableItems?.length > 0 &&
                              ((user.plants?.length > 0 || user.nutrients?.length > 0)
                                ? ", Chargeable Items"
                                : "Chargeable Items")}
                          </td>

                          {/* Delivery Status */}
                          <td className="py-4 px-4 text-gray-700 truncate">
                            {user.delivery_status?.toUpperCase()}
                          </td>
                          <td className="py-4 px-4 text-gray-700 truncate">
                            <span className={`font-medium px-2 py-1 rounded ${user.tech_name ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {user.tech_name ? 'onsite' : 'offsite'}
                            </span>
                          </td>

                          {userRole !== "technician" && (
                            <>
                              {/* PDF Report */}
                              <td className="py-4 px-4 text-center">
                                <button
                                  onClick={() => generatePDF(user)}
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

                              {/* Action */}
                              <td className="py-4 px-4 text-right">
                                <button
                                  onClick={() => handleEdit(user.onsite_id || user.offsite_id, user.tech_name ? 'onsite' : 'offsite')}
                                  className="px-4 py-2 btn-primary"
                                >
                                  Edit
                                </button>
                              </td>
                            </>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile View - UPDATED WITH API DATA */}
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
                              ? `${import.meta.env.VITE_API_URL}uploads/customers/${user.profile_pic}`
                              : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                user.name
                              )}&background=3b82f6&color=fff`
                          }
                          alt={user.name}
                          className="w-14 h-14 rounded-full object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-800 text-lg mb-2">
                            {user.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Technician: {user.tech_name || "Not assigned"}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3 mb-5">
                        {/* Locality */}
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                            Locality
                          </span>
                          <span className="text-sm text-gray-700 break-all">
                            {user.locality || "Not specified"}
                          </span>
                        </div>

                        {/* Materials to Deliver */}
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                            Materials to Deliver
                          </span>
                          <span className="text-sm text-gray-700">
                            {user.plants?.length > 0 && "Plants"}
                            {user.nutrients?.length > 0 && (user.plants?.length > 0 ? ", Nutrients" : "Nutrients")}
                            {user.chargeableItems?.length > 0 &&
                              ((user.plants?.length > 0 || user.nutrients?.length > 0)
                                ? ", Chargeable Items"
                                : "Chargeable Items")}
                            {!user.plants?.length && !user.nutrients?.length && !user.chargeableItems?.length &&
                              "No materials specified"}
                          </span>
                        </div>

                        {/* Delivery Status */}
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                            Delivery Status
                          </span>
                          <span className={`text-sm font-medium ${user.delivery_status?.toLowerCase() === 'yes' || user.delivery_status?.toLowerCase() === 'delivered'
                            ? 'text-green-600'
                            : user.delivery_status?.toLowerCase() === 'partial'
                              ? 'text-amber-600'
                              : 'text-red-600'
                            }`}>
                            {user.delivery_status?.toUpperCase() || "PENDING"}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons for Mobile */}
                      {userRole !== "technician" && (
                        <div className="flex flex-col sm:flex-row gap-3 mt-6">
                          <button
                            onClick={() => generatePDF(user)}
                            disabled={!pdfLoaded}
                            className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition ${pdfLoaded
                              ? 'bg-red-600 text-white hover:bg-red-700'
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              }`}
                            title={pdfLoaded ? "Download PDF Report" : "Loading PDF library..."}
                          >
                            <FileText size={18} />
                            Download PDF
                          </button>
                          <button
                            onClick={() => handleEdit(user.id, user.tech_name ? 'onsite' : 'offsite')}
                            className="flex-1 px-4 py-3 btn-primary"
                          >
                            Edit Delivery
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

        {/* Enhanced Pagination */}
        {filteredUsers.length > 0 && (
          <div className="px-5 sm:px-6 py-4 border-t bg-gray-50">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Entries per page selector */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Show</span>
                <select
                  value={usersPerPage}
                  onChange={handlePageSizeChange}
                  className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={30}>30</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span className="text-sm text-gray-600">entries per page</span>
              </div>

              {/* Page information */}
              <p className="text-sm text-gray-600">
                Showing <span className="font-medium">{indexOfFirstUser + 1}</span> to{" "}
                <span className="font-medium">{Math.min(indexOfLastUser, filteredUsers.length)}</span> of{" "}
                <span className="font-medium">{filteredUsers.length}</span> entries
              </p>

              {/* Compact pagination controls */}
              <div className="flex items-center gap-1">
                {/* First page button */}
                <button
                  onClick={goToFirst}
                  disabled={currentPage === 1}
                  className={`p-2 rounded-lg transition ${currentPage === 1
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-gray-600 hover:bg-gray-200"
                    }`}
                  title="First page"
                >
                  <ChevronsLeft size={18} />
                </button>

                {/* Previous button */}
                <button
                  onClick={goToPrevious}
                  disabled={currentPage === 1}
                  className={`p-2 rounded-lg transition ${currentPage === 1
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-gray-600 hover:bg-gray-200"
                    }`}
                  title="Previous page"
                >
                  <ChevronLeft size={18} />
                </button>

                {/* Page numbers with ellipsis */}
                {getVisiblePages().map((page, index) => (
                  page === "..." ? (
                    <span
                      key={`ellipsis-${index}`}
                      className="px-2 py-1 text-gray-500"
                    >
                      ...
                    </span>
                  ) : (
                    <button
                      key={page}
                      onClick={() => goToPage(page)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition ${currentPage === page
                          ? "bg-blue-600 text-white"
                          : "text-gray-700 hover:bg-gray-200"
                        }`}
                    >
                      {page}
                    </button>
                  )
                ))}

                {/* Next button */}
                <button
                  onClick={goToNext}
                  disabled={currentPage === totalPages}
                  className={`p-2 rounded-lg transition ${currentPage === totalPages
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-gray-600 hover:bg-gray-200"
                    }`}
                  title="Next page"
                >
                  <ChevronRight size={18} />
                </button>

                {/* Last page button */}
                <button
                  onClick={goToLast}
                  disabled={currentPage === totalPages}
                  className={`p-2 rounded-lg transition ${currentPage === totalPages
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-gray-600 hover:bg-gray-200"
                    }`}
                  title="Last page"
                >
                  <ChevronsRight size={18} />
                </button>
              </div>
            </div>

            {/* Quick page jump */}

          </div>
        )}
      </div>
    </div>
  );
}