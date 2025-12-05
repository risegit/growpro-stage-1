import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function EditMaterialDeliver() {
  const { id } = useParams();
  const user = JSON.parse(localStorage.getItem("user"));
  const user_code = user?.user_code;

  const [materialData, setMaterialData] = useState(null);
  const [materialPlants, setMaterialPlantsData] = useState([]);
  const [materialNutrients, setMaterialNutrientsData] = useState([]);
  const [materialChargeableItems, setMaterialChargeableItemsData] = useState([]);
  const [materialDeliverData, setMaterialDeliverData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deliveryStatus, setDeliveryStatus] = useState('yes');
  const [deliveryNote, setDeliveryNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Fetch material deliver details when component loads
  useEffect(() => {
    const fetchMaterialData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}api/material-deliver.php?id=${id}`);
        const data = await response.json();

        console.log("Fetched material data:", data);

        if (data.status === "success") {
          if (data.data && data.data.length > 0) {
            setMaterialData(data.data[0]);
          }
          if (data.plants) {
            setMaterialPlantsData(data.plants);
          }
          if (data.nutrients) {
            setMaterialNutrientsData(data.nutrients);
          }
          if (data.chargeableItems) {
            setMaterialChargeableItemsData(data.chargeableItems);
          }
          if (data.materialDeliver && data.materialDeliver.length > 0) {
            const deliverData = data.materialDeliver[0];
            setMaterialDeliverData(deliverData);
            
            // Auto-fill delivery status and note from API
            if (deliverData.delivery_status) {
              setDeliveryStatus(deliverData.delivery_status);
            }
            if (deliverData.delivery_note) {
              setDeliveryNote(deliverData.delivery_note);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching material data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMaterialData();
  }, [id]);

  const handleStatusChange = (e) => {
    const value = e.target.value;
    setDeliveryStatus(value);
    if (value !== 'partial') {
      setDeliveryNote('');
    }
  };

  const handleSubmit = async () => {
    if (!materialData) return;

    setSubmitting(true);

    try {
      const form = new FormData();

      form.append("id", id);
      form.append("delivery_status", deliveryStatus);
      form.append("delivery_note", deliveryNote);
      form.append("submitted_at", new Date().toISOString());

      console.log("Submitting:", Object.fromEntries(form.entries()));

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}api/material-deliver.php?user_id=${user_code}`,
        {
          method: "POST",
          body: form,
        }
      );

      const result = await response.json();
      
      if (result.status === "success") {
        toast.success("Delivery status updated successfully!");
      } else {
        toast.error(result.message || "Failed to update delivery status");
      }
    } catch (error) {
      console.error("Error submitting delivery status:", error);
      toast.error("Failed to update delivery status");
    } finally {
      setSubmitting(false);
    }
  };

  // Function to render plants display
  const renderPlants = () => {
    if (!materialPlants || materialPlants.length === 0) {
      return (
        <div className="flex flex-col md:col-span-2">
          <label className="mb-1 font-medium text-gray-700">
            Plants and Quantities
          </label>
          <div className="px-3 py-2 border border-gray-300 rounded-lg shadow-sm bg-gray-50 text-gray-700 min-h-[42px]">
            <p className="text-gray-500 italic">No plants specified</p>
          </div>
        </div>
      );
    }

    if (materialPlants.length === 1) {
      const plant = materialPlants[0];
      const plantName = plant.other_plant_name?.trim() || plant.plant_name || '';
      return (
        <div className="flex flex-col md:col-span-2">
          <label className="mb-1 font-medium text-gray-700">
            Plant and Quantity
          </label>
          <input
            type="text"
            value={`${plantName}${plant.quantity ? ` - Qty: ${plant.quantity}` : ''}`}
            readOnly
            className="px-3 py-2 border border-gray-300 rounded-lg shadow-sm bg-gray-50 text-gray-700"
          />
        </div>
      );
    }

    // Multiple plants - show as a list in a textarea
    const plantsText = materialPlants.map(plant => {
      const plantName = plant.other_plant_name?.trim() || plant.plant_name || 'Unnamed Plant';
      return `${plantName}${plant.quantity ? ` - Quantity: ${plant.quantity}` : ''}`;
    }).join('\n');

    return (
      <div className="flex flex-col md:col-span-2">
        <label className="mb-1 font-medium text-gray-700">
          Plants and Quantities ({materialPlants.length} items)
        </label>
        <textarea
          value={plantsText}
          readOnly
          rows={Math.min(materialPlants.length + 1, 5)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm bg-gray-50 text-gray-700"
        />
      </div>
    );
  };

  // Function to render nutrients display
  const renderNutrients = () => {
    if (!materialNutrients || materialNutrients.length === 0) {
      return (
        <div className="flex flex-col md:col-span-2">
          <label className="mb-1 font-medium text-gray-700">
            Nutrients
          </label>
          <div className="px-3 py-2 border border-gray-300 rounded-lg shadow-sm bg-gray-50 text-gray-700 min-h-[42px]">
            <p className="text-gray-500 italic">No nutrients specified</p>
          </div>
        </div>
      );
    }

    if (materialNutrients.length === 1) {
      const nutrient = materialNutrients[0];
      const nutrientName = nutrient.other_nutrient_name?.trim() || nutrient.nutrient_type || '';
      
      let nutrientInfo = nutrientName;
      if (nutrient.tank_capacity) nutrientInfo += `, Tank: ${nutrient.tank_capacity}`;
      if (nutrient.topups) nutrientInfo += `, Topups: ${nutrient.topups}`;
      const multiply = nutrient.tank_capacity * nutrient.topups;
      nutrientInfo += ` - Total: ${multiply} Litre`;
      if (nutrient.other_info) nutrientInfo += `, ${nutrient.other_info}`;

      return (
        <div className="flex flex-col md:col-span-2">
          <label className="mb-1 font-medium text-gray-700">
            Nutrient Details
          </label>
          <input
            type="text"
            value={nutrientInfo}
            readOnly
            className="px-3 py-2 border border-gray-300 rounded-lg shadow-sm bg-gray-50 text-gray-700"
          />
        </div>
      );
    }

    // Multiple nutrients - show as a list in a textarea
    const nutrientsText = materialNutrients.map(nutrient => {
      const nutrientName = nutrient.other_nutrient_name?.trim() || nutrient.nutrient_type || 'Unnamed Nutrient';
      
      let nutrientInfo = `${nutrientName}:`;
      if (nutrient.tank_capacity) nutrientInfo += ` Tank Capacity: ${nutrient.tank_capacity}`;
      if (nutrient.topups) nutrientInfo += `, Topups: ${nutrient.topups}`;
      if (nutrient.other_info) nutrientInfo += `, ${nutrient.other_info}`;
      
      return nutrientInfo;
    }).join('\n');

    return (
      <div className="flex flex-col md:col-span-2">
        <label className="mb-1 font-medium text-gray-700">
          Nutrients ({materialNutrients.length} items)
        </label>
        <textarea
          value={nutrientsText}
          readOnly
          rows={Math.min(materialNutrients.length + 2, 6)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm bg-gray-50 text-gray-700"
        />
      </div>
    );
  };

  // Function to render chargeable items display
  const renderChargeableItems = () => {
    if (!materialChargeableItems || materialChargeableItems.length === 0) {
      return (
        <div className="flex flex-col md:col-span-2">
          <label className="mb-1 font-medium text-gray-700">
            Chargeable Items
          </label>
          <div className="px-3 py-2 border border-gray-300 rounded-lg shadow-sm bg-gray-50 text-gray-700 min-h-[42px]">
            <p className="text-gray-500 italic">No chargeable items specified</p>
          </div>
        </div>
      );
    }

    if (materialChargeableItems.length === 1) {
      const item = materialChargeableItems[0];
      const itemName = item.other_item_name?.trim() || item.item_name || '';
      
      let itemInfo = itemName;
      if (item.quantity) itemInfo += ` - Quantity: ${item.quantity}`;
      if (item.other_info) itemInfo += `, ${item.other_info}`;

      return (
        <div className="flex flex-col md:col-span-2">
          <label className="mb-1 font-medium text-gray-700">
            Chargeable Item Details
          </label>
          <input
            type="text"
            value={itemInfo}
            readOnly
            className="px-3 py-2 border border-gray-300 rounded-lg shadow-sm bg-gray-50 text-gray-700"
          />
        </div>
      );
    }

    // Multiple chargeable items - show as a list in a textarea
    const itemsText = materialChargeableItems.map(item => {
      const itemName = item.other_item_name?.trim() || item.item_name || 'Unnamed Item';
      
      let itemInfo = itemName;
      if (item.quantity) itemInfo += ` - Quantity: ${item.quantity}`;
      if (item.other_info) itemInfo += `, ${item.other_info}`;
      
      return itemInfo;
    }).join('\n');

    return (
      <div className="flex flex-col md:col-span-2">
        <label className="mb-1 font-medium text-gray-700">
          Chargeable Items ({materialChargeableItems.length} items)
        </label>
        <textarea
          value={itemsText}
          readOnly
          rows={Math.min(materialChargeableItems.length + 2, 6)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm bg-gray-50 text-gray-700"
        />
      </div>
    );
  };

  // Function to show delivery status indicator
  const renderDeliveryStatusInfo = () => {
    if (!materialDeliverData) return null;
    
    const getStatusColor = (status) => {
      switch(status) {
        case 'yes': return 'bg-green-100 text-green-800';
        case 'partial': return 'bg-yellow-100 text-yellow-800';
        case 'no': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    };

    const getStatusText = (status) => {
      switch(status) {
        case 'yes': return 'Delivered Successfully';
        case 'partial': return 'Partially Delivered';
        case 'no': return 'Not Delivered';
        default: return 'Unknown Status';
      }
    };

    return (
      <div className="flex flex-col md:col-span-2 bg-gray-50 p-4 rounded-lg border">
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium text-gray-700">Current Delivery Status:</span>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(materialDeliverData.delivery_status)}`}>
            {getStatusText(materialDeliverData.delivery_status)}
          </span>
        </div>
        {materialDeliverData.updated_at && (
          <p className="text-sm text-gray-500">
            Last updated: {new Date(materialDeliverData.updated_at).toLocaleString()}
          </p>
        )}
      </div>
    );
  };

  // 🧩 UI Rendering
  return (
    <div className="w-full min-h-screen bg-gray-100 mt-10">
      <div className="mx-auto bg-white rounded-2xl shadow-xl p-6">
        <div className="px-6 py-4 border-b">
          <h1 className="text-2xl font-bold mb-6 text-gray-800">Deliver Material</h1>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading...</span>
          </div>
        ) : materialData ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-6 py-6">
              {/* Name */}
              <div className="flex flex-col">
                <label className="mb-1 font-medium text-gray-700">
                  Name (नाम)<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={materialData.name || ''}
                  readOnly
                  className="px-3 py-2 border border-gray-300 rounded-lg shadow-sm bg-gray-50 text-gray-700"
                />
              </div>

              {/* Phone Number */}
              <div className="flex flex-col">
                <label className="mb-1 font-medium text-gray-700">
                  Phone Number(फ़ोन नंबर) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={materialData.phone || ''}
                  readOnly
                  className="px-3 py-2 border border-gray-300 rounded-lg shadow-sm bg-gray-50 text-gray-700"
                />
              </div>

              {/* Profile Pic */}
              <div className="flex flex-col">
                <label className="mb-1 font-medium text-gray-700">
                  Profile Pic(प्रोफ़ाइल चित्र)
                </label>
                <div className="flex items-center gap-3">
                  {materialData.profile_pic ? (
                    <img
                      src={`${import.meta.env.VITE_API_URL}uploads/users/${materialData.profile_pic}`}
                      alt="Profile"
                      className="w-10 h-10 object-cover rounded-full border"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                  <input
                    type="text"
                    value={materialData.profile_pic ? "Profile picture uploaded" : "No file chosen"}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg shadow-sm bg-gray-50 text-gray-700"
                  />
                </div>
              </div>

              {/* Technician Name */}
              <div className="flex flex-col">
                <label className="mb-1 font-medium text-gray-700">
                  Technician Name
                </label>
                <input
                  type="text"
                  value={materialData.tech_name || ''}
                  readOnly
                  className="px-3 py-2 border border-gray-300 rounded-lg shadow-sm bg-gray-50 text-gray-700"
                />
              </div>

              {/* Plants */}
              {renderPlants()}

              {/* Nutrients */}
              {renderNutrients()}

              {/* Chargeable Items */}
              {renderChargeableItems()}

              {/* Show current delivery status if it exists */}
              {materialDeliverData && renderDeliveryStatusInfo()}

              {/* Delivery Status Dropdown */}
              <div className="flex flex-col md:col-span-2">
                <label className="mb-1 font-medium text-gray-700">
                  Update Delivery Status <span className="text-red-500">*</span>
                </label>
                <select
                  value={deliveryStatus}
                  onChange={handleStatusChange}
                  className="px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
                >
                  <option value="yes">Yes - Delivered Successfully</option>
                  <option value="partial">Partial Delivery</option>
                  <option value="no">Not Delivered</option>
                </select>
              </div>

              {/* Delivery Note (shown when status is "partial" or if there's existing note) */}
              {(deliveryStatus === 'partial' || deliveryNote) && (
                <div className="flex flex-col md:col-span-2">
                  <label className="mb-1 font-medium text-gray-700">
                    Delivery Note {deliveryStatus === 'partial' && <span className="text-red-500">*</span>}
                  </label>
                  <textarea
                    value={deliveryNote}
                    onChange={(e) => setDeliveryNote(e.target.value)}
                    placeholder="Please specify what was delivered and what is pending..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
                  />
                  {materialDeliverData?.delivery_note && (
                    <p className="text-sm text-gray-500 mt-1">
                      Previously entered note will be updated
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end px-6 py-4 border-t">
              <button
                onClick={handleSubmit}
                disabled={submitting || (deliveryStatus === 'partial' && !deliveryNote.trim())}
                className={`px-6 py-2 btn-primary ${submitting ? "opacity-60 cursor-not-allowed" : ""} ${
                  deliveryStatus === 'partial' && !deliveryNote.trim() ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {submitting ? "Please wait..." : "Update Delivery Status"}
              </button>
            </div>
          </>
        ) : (
          <div className="px-6 py-6 text-center">
            <p className="text-gray-600">No material data found</p>
          </div>
        )}
      </div>
    </div>
  );
}