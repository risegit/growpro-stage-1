// AMCForm.jsx
import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import Select from 'react-select';
import { toast } from "react-toastify";

export default function AMCForm() {
  const [formData, setFormData] = useState({
    systemType: [],
    systemQty: '',
    systemTypeOther: "",
    validityFrom: "",
    validityUpto: "",
    amc_free_paid: "",  
    duration: "",
    otherDuration: "",
    visitsPerMonth: "",
    consumables: [],
    otherConsumable: "",
    pricing: "",
    transport: "",
    gst: "",
    total: ""
  });

  const consumablesHasOther = formData.consumables.some((c) => c.value === '9');

  const [growerData, setGrowerData] = useState({
    systemType: [],
    systemTypeOther: ''
  });

  const growerHasOther = Array.isArray(formData.grower) && formData.grower.some((g) => g.label === "Other");

  const [addonFormData, setAddonFormData] = useState({
    grower: '',
    systemQty: '',
    validityFrom: '',
    validityUpto: '',
    duration: '',
    otherDuration: '',
    visitsPerMonth: '',
    consumables: [],
    otherConsumable: '',
    pricing: '',
    transport: '',
    gst: '',
    total: ''
  });

  const [systemQty, setSystemQty] = useState({});
  const [showAddon, setShowAddon] = useState(false);
  const [consumableData, setConsumableData] = useState({
    id: '',
    name: ''
  });


  const systemTypes = ['Small Grower', 'Long Grower', 'Mini Pro Grower',
    'Semi Pro Grower', 'Pro Grower', 'Vertical Outdoor Grower', 'Flat Bed',
    'Indoor Grower', 'Furniture Integrated Grower', 'Mini Grower', 'Dutch Bucket',
    'Growbags', 'Microgreen Racks', 'Other'];

  const systemTypeOptions = systemTypes.map(s => ({
    value: s,
    label: s
  }));

  const [errors, setErrors] = useState({});
  const [addonErrors, setAddonErrors] = useState({});

  const [growers, setGrowers] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [consumableoptions, setConsumable] = useState([]);
  const [loadingConsumable, setLoadingConsumable] = useState(false);
  const [isNoGrowers, setIsNoGrowers] = useState(false);
  const NoRemove = (props) => null;

  const durationOptions = [
    { value: '30', label: 'Monthly' },
    { value: '90', label: 'Quarterly' },
    { value: '180', label: 'Semi Annually' },
    { value: '365', label: 'Annually' },
    { value: 'other', label: 'Other' },
  ];


  const formatName = (str) => {
    return str
      .replace(/-/g, " ")                // replace hyphens with space
      .toLowerCase()                     // convert all to lowercase
      .replace(/\b\w/g, (c) => c.toUpperCase()); // capitalize each word
  };


  useEffect(() => {
    const fetchUser = async () => {
      if (!id) return;
      setLoading(true);
      setSystemQty({});

      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}api/amc.php?id=${id}`);
        const data = await response.json();

        console.log("Fetched data:", data);

        const amc = Array.isArray(data.amc_data) ? data.amc_data[0] : data.amc_data;
        // const grower_data = Array.isArray(data.grower_data) ? data.grower_data[0] : data.grower_data;
        const consumable_data = Array.isArray(data.consumable_data) ? data.consumable_data : [];

        // ------------------------------------
        // FIND OTHER CONSUMABLE VALUE
        // ------------------------------------
        const otherItem = consumable_data.find(
          c => c.other_consumable && c.other_consumable.trim() !== ""
        );

        // ------------------------------------
        // SET AMC FIELDS
        // ------------------------------------
        if (amc) {
          setFormData(prev => ({
            ...prev,
            customer: amc.name || "",
            systemQty: amc.grower_qty || "",
            amc_free_paid: amc.amc_free_paid || "",
            duration: amc.duration || "",
            otherDuration: amc.duration_other || "",
            validityFrom: amc.validity_from || "",
            validityUpto: amc.validity_upto || "",
            visitsPerMonth: amc.visits_per_month || "",
            consumables: consumable_data.map(p => ({ value: p.id, label: p.name })),
            otherConsumable: otherItem ? otherItem.other_consumable : "",
            pricing: amc.pricing || "",
            transport: amc.transport || "",
            gst: amc.gst || "",
            total: amc.total || ""
          }));
        }

        const opts = Array.isArray(data.grower_data)
          ? data.grower_data.map((g) => ({
            value: g.grower_id,
            label: g.system_type,
            other: g.system_type_other,  // <-- VERY IMPORTANT
            qty: g.grower_qty ?? "",
            max_qty: g.max_qty ?? "",
          }))
          : [];

        const isEmptyGrowers = opts.length === 0;
        setIsNoGrowers(isEmptyGrowers);
        if (isEmptyGrowers) {
          // No growers available for customer → AMC for all growers
          setGrowers([]);
          setFormData((prev) => ({
            ...prev,
            grower: [],
            systemTypeOther: "",
          }));
          return;
        }

        const hasOther = opts.some((g) => g.other && g.other.trim() !== "");
        const otherValue = hasOther
          ? opts.find((g) => g.other && g.other.trim() !== "")?.other
          : "";

        setGrowers(opts);

        // ⭐ PRESERVE OLD QTY, FILL NEW API QTY
        setSystemQty((prevQty) => {
          const updatedQty = { ...prevQty };

          opts.forEach((g) => {
            if (updatedQty[g.value] === undefined) {
              updatedQty[g.value] = g.qty ?? "";
            }
          });

          // Remove qty if grower removed
          Object.keys(updatedQty).forEach((key) => {
            if (!opts.some((g) => g.value == key)) {
              delete updatedQty[key];
            }
          });

          // 🟦 Log the cleaned qty map as well
          // console.log("🟢 updated systemQty (after clean):", updatedQty);

          return updatedQty;
        });

        setFormData((prev) => ({
          ...prev,
          grower: opts,
          systemTypeOther: otherValue,
        }));

      } catch (error) {
        console.error("Error fetching user:", error);
        alert("Failed to fetch user details!");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);



  useEffect(() => {
    const fetchConsumable = async () => {
      try {
        setLoadingConsumable(true);
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}api/consum-grower.php?amc_id=${id}`
        );
        const data = await response.json();

        console.log("✅ API Response:", data);

        if (data.status === "success") {
          const grower_opts = Array.isArray(data.grower_data)
            ? data.grower_data.map((g) => ({
              value: g.grower_id,
              label: g.system_type,
              other: g.system_type_other
            }))
            : [];

          const opts = Array.isArray(data.data)
            ? data.data.map((c) => ({
              value: c.id,
              label: formatName(c.name),
            }))
            : [];

          // setGrowers(grower_opts);

          
          // setFormData((prev) => ({
          //   ...prev,
          //   grower: grower_opts,
          // }));



          setConsumable(opts);
        }
      } catch (error) {
        console.error("Error fetching consumables:", error);
      } finally {
        setLoadingConsumable(false);
      }
    };

    fetchConsumable();
  }, []);

  const handlePriceChange = (e) => {
  const { name, value } = e.target;

  if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
  }

  setFormData((prev) => {
    if (value === "Free") {
      return {
        ...prev,
        [name]: value,
        pricing: "0",
        transport: "0",
        gst: "0",
        total: "0",
      };
    }

    
    // If Paid → clear values (but not null)
    if (value === "Paid") {

      return {
        ...prev,
        [name]: value,
        pricing: "",
        transport: "",
        gst: "",
        total: "",
      };
    }

    return { ...prev, [name]: value };
  });
};

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    // ==============================
    // CASE 1: DURATION DROPDOWN CHANGED
    // ==============================
    if (name === "duration") {
      // If user chooses OTHER
      if (value === "other") {
        setFormData((prev) => ({
          ...prev,
          duration: value,
          validityFrom: "",
          validityUpto: "",
          otherDuration: "" // Allow user to type
        }));
        return;
      }

      // If user selects predefined values (30, 60, 90…)
      if (value !== "") {
        const days = parseInt(value, 10);
        const today = new Date();

        const validityFrom = today.toISOString().split("T")[0];

        const validityUptoDate = new Date();
        validityUptoDate.setDate(validityUptoDate.getDate() + days);
        const validityUpto = validityUptoDate.toISOString().split("T")[0];

        setFormData((prev) => ({
          ...prev,
          duration: value,
          validityFrom: validityFrom,
          validityUpto: validityUpto,
          otherDuration: "" // clear text field
        }));
      }
    }

    // ==============================
    // CASE 2: USER TYPING IN "OTHER DURATION"
    // ==============================
    if (name === "otherDuration") {
      if (!isNaN(value) && value !== "") {
        const days = parseInt(value, 10);
        const today = new Date();

        const validityFrom = today.toISOString().split("T")[0];

        const validityUptoDate = new Date();
        validityUptoDate.setDate(validityUptoDate.getDate() + days);
        const validityUpto = validityUptoDate.toISOString().split("T")[0];

        setFormData((prev) => ({
          ...prev,
          otherDuration: value,
          validityFrom: validityFrom,
          validityUpto: validityUpto,
        }));
      }
    }

    // ==============================
    // PRICE RELATED FIELDS
    // ==============================
    if (name === "pricing" || name === "transport" || name === "gst") {
      calculateTotal(name, value);
    }
  };

  const handleAddonInputChange = (e) => {
    const { name, value } = e.target;
    setAddonFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (addonErrors[name]) {
      setAddonErrors((prev) => ({ ...prev, [name]: '' }));
    }

    if (name === 'pricing' || name === 'transport' || name === 'gst') {
      calculateAddonTotal(name, value);
    }
  };

  const handleCustomerChange = (selected) => {
    setFormData((prev) => ({ ...prev, customer: selected }));
    if (errors.customer) {
      setErrors((prev) => ({ ...prev, customer: '' }));
    }
  };

  const handleGrowerChange = (selected) => {
    setAddonFormData((prev) => ({ ...prev, grower: selected }));
    if (addonErrors.grower) {
      setAddonErrors((prev) => ({ ...prev, grower: '' }));
    }
  };

  const handleConsumableChange = (selected) => {
    setFormData((prev) => ({
      ...prev,
      consumables: selected || []
    }));
    if (errors.consumables) {
      setErrors((prev) => ({ ...prev, consumables: '' }));
    }
  };

  const handleAddonConsumableChange = (selected) => {
    setAddonFormData((prev) => ({
      ...prev,
      consumables: selected || []
    }));
    if (addonErrors.consumables) {
      setAddonErrors((prev) => ({ ...prev, consumables: '' }));
    }
  };

  const calculateTotal = (changedField, changedValue) => {
    const pricing = parseFloat(changedField === 'pricing' ? changedValue : formData.pricing) || 0;
    const transport = parseFloat(changedField === 'transport' ? changedValue : formData.transport) || 0;
    const gst = parseFloat(changedField === 'gst' ? changedValue : formData.gst) || 0;

    const subtotal = pricing + transport;
    const gstAmount = (subtotal * gst) / 100;
    const total = subtotal + gstAmount;

    setFormData((prev) => ({ ...prev, total: total.toFixed(2) }));
  };

  const calculateAddonTotal = (changedField, changedValue) => {
    const pricing = parseFloat(changedField === 'pricing' ? changedValue : addonFormData.pricing) || 0;
    const transport = parseFloat(changedField === 'transport' ? changedValue : addonFormData.transport) || 0;
    const gst = parseFloat(changedField === 'gst' ? changedValue : addonFormData.gst) || 0;

    const subtotal = pricing + transport;
    const gstAmount = (subtotal * gst) / 100;
    const total = subtotal + gstAmount;

    setAddonFormData((prev) => ({ ...prev, total: total.toFixed(2) }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.validityFrom) newErrors.validityFrom = 'Validity From date is required';
    if (!formData.validityUpto) newErrors.validityUpto = 'Validity Upto date is required';
    else if (formData.validityFrom && new Date(formData.validityUpto) <= new Date(formData.validityFrom)) {
      newErrors.validityUpto = 'Validity Upto must be after Validity From';
    }

    if (!formData.amc_free_paid) newErrors.amc_free_paid = 'AMC Free or Paid is required';

    if (!formData.duration) newErrors.duration = 'Duration of AMC is required';
    else if (formData.duration === 'other' && !formData.otherDuration.trim()) {
      newErrors.otherDuration = 'Please specify the custom duration';
    }

    if (!formData.visitsPerMonth && formData.visitsPerMonth !== 0) newErrors.visitsPerMonth = 'Number of visits is required';
    else if (formData.visitsPerMonth !== '' && Number(formData.visitsPerMonth) < 0) newErrors.visitsPerMonth = 'Visits cannot be negative';

    if (!formData.consumables || formData.consumables.length === 0) newErrors.consumables = 'Select at least one consumable';

    if (formData.pricing === '') newErrors.pricing = 'Pricing is required';
    else if (isNaN(parseFloat(formData.pricing)) || parseFloat(formData.pricing) < 0) newErrors.pricing = 'Pricing must be a positive number';

    if (formData.transport === '') newErrors.transport = 'Transport is required';
    else if (isNaN(parseFloat(formData.transport)) || parseFloat(formData.transport) < 0) newErrors.transport = 'Transport must be a positive number';

    if (formData.gst === '') newErrors.gst = 'GST is required';
    else if (isNaN(parseFloat(formData.gst)) || parseFloat(formData.gst) < 0 || parseFloat(formData.gst) > 100) {
      newErrors.gst = 'GST must be between 0 and 100';
    }

    // Validate grower quantities
    if (formData.grower && formData.grower.length > 0) {
      const quantityErrors = [];
      formData.grower.forEach((grower) => {
        const qty = systemQty[grower.value];
        if (!qty || qty === '' || parseInt(qty) <= 0) {
          quantityErrors.push(`${grower.label} quantity is required and must be greater than 0`);
        }
      });
      if (quantityErrors.length > 0) {
        newErrors.systemQty = quantityErrors.join(', ');
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateAddonForm = () => {
    if (!showAddon) return true;

    const newErrors = {};

    if (!addonFormData.grower || !addonFormData.grower.value) {
      newErrors.grower = 'Please select a grower';
    }

    if (!addonFormData.validityFrom) newErrors.validityFrom = 'Validity From date is required';
    if (!addonFormData.validityUpto) newErrors.validityUpto = 'Validity Upto date is required';
    else if (addonFormData.validityFrom && new Date(addonFormData.validityUpto) <= new Date(addonFormData.validityFrom)) {
      newErrors.validityUpto = 'Validity Upto must be after Validity From';
    }

    if (!addonFormData.duration) newErrors.duration = 'Duration of AMC is required';
    else if (addonFormData.duration === 'other' && !addonFormData.otherDuration.trim()) {
      newErrors.otherDuration = 'Please specify the custom duration';
    }

    if (!addonFormData.visitsPerMonth && addonFormData.visitsPerMonth !== 0) newErrors.visitsPerMonth = 'Number of visits is required';
    else if (addonFormData.visitsPerMonth !== '' && Number(addonFormData.visitsPerMonth) < 0) newErrors.visitsPerMonth = 'Visits cannot be negative';

    if (!addonFormData.consumables || addonFormData.consumables.length === 0) newErrors.consumables = 'Select at least one consumable';

    if (addonFormData.pricing === '') newErrors.pricing = 'Pricing is required';
    else if (isNaN(parseFloat(addonFormData.pricing)) || parseFloat(addonFormData.pricing) < 0) newErrors.pricing = 'Pricing must be a positive number';

    if (addonFormData.transport === '') newErrors.transport = 'Transport is required';
    else if (isNaN(parseFloat(addonFormData.transport)) || parseFloat(addonFormData.transport) < 0) newErrors.transport = 'Transport must be a positive number';

    if (addonFormData.gst === '') newErrors.gst = 'GST is required';
    else if (isNaN(parseFloat(addonFormData.gst)) || parseFloat(addonFormData.gst) < 0 || parseFloat(addonFormData.gst) > 100) {
      newErrors.gst = 'GST must be between 0 and 100';
    }

    setAddonErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    // Validate form including grower quantities
    if (!validateForm()) {
      toast.error("Please fix all errors before submitting.");
      return;
    }

    setLoading(true); // 🔥 Disable button + show "Please wait..."

    try {
      // ⏳ Optional delay (1 second)
      await new Promise(resolve => setTimeout(resolve, 1000));

      const form = new FormData();

      // 1️⃣ Convert multi-select values into plain arrays
      const consumableIds = formData.consumables?.map(c => c.value) || [];

      // 2️⃣ Prepare grower data with quantities
      const growerData = formData.grower?.map(grower => ({
        id: grower.value,
        label: grower.label,
        qty: systemQty[grower.value] || "",
        other: grower.other || ""
      })) || [];

      // 3️⃣ Append converted arrays
      form.append("consumables", JSON.stringify(consumableIds));
      form.append("growerData", JSON.stringify(growerData));

      // 4️⃣ Append remaining fields except arrays
      Object.entries(formData).forEach(([key, value]) => {
        if (!["consumables", "grower", "customer"].includes(key)) {
          form.append(key, value ?? "");
        }
      });

      // 5️⃣ Append systemQty data
      form.append("systemQty", JSON.stringify(systemQty));

      // 6️⃣ Additional fields
      form.append("id", id);
      form.append("_method", "PUT");

      console.log("PAYLOAD SENDING:");
      for (let p of form.entries()) console.log(p[0], p[1]);

      // 7️⃣ Submit request
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}api/amc.php?id=${id}`,
        {
          method: "POST",
          body: form
        }
      );

      const result = await response.json();
      console.log("API RESPONSE:", result);

      if (result.status === "success") {
        toast.success(result.message);
        setErrors({});
      } else {
        toast.error(result.error || "Something went wrong!");
      }

    } catch (error) {
      console.error("Submit Error:", error);
      toast.error("Submission failed. Check console.");
    } finally {
      setLoading(false); // 🔥 Re-enable button
    }
  };

  const handleAddOn = () => {
    setShowAddon(true);
  };

  const handleRemoveAddon = () => {
    setShowAddon(false);
    setAddonFormData({
      grower: '',
      systemQty: '',
      validityFrom: '',
      validityUpto: '',
      duration: '',
      otherDuration: '',
      visitsPerMonth: '',
      consumables: [],
      otherConsumable: '',
      pricing: '',
      transport: '',
      gst: '',
      total: ''
    });
    setAddonErrors({});
  };

  // Handle grower selection change - remove quantity when grower is removed
  const handleGrowerSelectionChange = (selected) => {
    // Get removed growers
    const currentGrowers = formData.grower || [];
    const removedGrowers = currentGrowers.filter(
      current => !selected.some(sel => sel.value === current.value)
    );

    // Remove quantities for removed growers
    const updatedSystemQty = { ...systemQty };
    removedGrowers.forEach(grower => {
      delete updatedSystemQty[grower.value];
    });

    // Add default quantity for newly added growers
    selected.forEach(grower => {
      if (updatedSystemQty[grower.value] === undefined) {
        updatedSystemQty[grower.value] = grower.qty || "";
      }
    });

    setSystemQty(updatedSystemQty);
    setFormData({ ...formData, grower: selected });
  };

  return (
    <div className="w-full min-h-screen bg-gray-100 mt-10">
      <div className="mx-auto bg-white rounded-2xl shadow-xl p-6">
        {/* Header */}
        <div className="px-2 py-4 border-b">
          <h1 className="text-2xl font-bold mb-1 text-gray-800">Edit AMC Contract</h1>
          <p className="text-sm text-gray-600">Annual Maintenance Contract Details</p>
        </div>

        {/* Main Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-4 py-6 [&_input]:h-[44px] [&_select]:h-[44px]">
          {/* Customer */}
          <div className="flex flex-col">
            <label className="mb-1 font-medium text-gray-700">Customer Name: <span className="text-green-500">{formData.customer}</span></label>
          </div>

          <div className="flex flex-col">
            <label className="mb-1 font-medium text-gray-700">
              System Type <span className="text-red-500">*</span>
            </label>

            {isNoGrowers ? (
              <div className="px-3 py-4 border rounded-lg bg-gray-100 text-gray-700">
                AMC created for all the growers
              </div>
            ) : (
              <>
                <Select
                  isMulti
                  options={growers}
                  value={formData.grower}
                  onChange={handleGrowerSelectionChange}
                  classNamePrefix="react-select"
                  styles={{
                    menu: (provided) => ({ ...provided, zIndex: 9999 }),
                  }}
                />

                {growerHasOther && (
                  <input
                    type="text"
                    name="systemTypeOther"
                    value={formData.systemTypeOther}
                    readOnly
                    className="mt-2 px-3 py-2 border rounded-lg"
                  />
                )}
              </>
            )}

            {errors.grower && (
              <span className="text-red-500 text-sm mt-1">{errors.grower}</span>
            )}
          </div>

          {/* Grower Quantities Section */}
          {formData.grower && formData.grower.length > 0 && (
            <div className="md:col-span-2 mt-4">
              <h3 className="text-gray-800 font-semibold mb-2">Grower Quantities</h3>

              {errors.systemQty && (
                <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded">
                  <span className="text-red-500 text-sm">{errors.systemQty}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formData.grower.map((grower) => (
                  <div className="flex flex-col" key={grower.value}>
                    <label className="mb-1 font-medium text-gray-700">
                      {grower.label} Qty: <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={grower.max_qty}
                      value={systemQty[grower.value] || ''}
                      onChange={(e) => {
                        let val = Number(e.target.value);

                        // ⬅️ Enforce max limit
                        if (grower.qty && val > grower.max_qty) {
                          val = grower.qty;
                        }

                        setSystemQty({
                          ...systemQty,
                          [grower.value]: val,
                        });
                      }}
                      className={`px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none transition ${
                        errors.systemQty &&
                        (!systemQty[grower.value] ||
                          parseInt(systemQty[grower.value]) <= 0)
                          ? 'border-red-500 focus:ring-red-400'
                          : 'border-gray-300 focus:ring-blue-400'
                      }`}
                      placeholder={`Enter ${grower.label} quantity`}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col">
            <label className="mb-1 font-medium text-gray-700">AMC Free or Paid ?<span className="text-red-500">*</span></label>
            <select
              name="amc_free_paid"
              value={formData.amc_free_paid}
              onChange={handlePriceChange}
              className={`px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none transition ${errors.amc_free_paid ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'}`}
            >
              <option value="" disabled>Select Free or Paid</option>
              <option value="Paid">Paid</option>
              <option value="Free">Free</option>
            </select>
            {errors.amc_free_paid && <span className="text-red-500 text-sm mt-1">{errors.amc_free_paid}</span>}
          </div>

          {/* Duration */}
          <div className="flex flex-col">
            <label className="mb-1 font-medium text-gray-700">Duration of AMC <span className="text-red-500">*</span></label>
            <select
              name="duration"
              value={formData.duration}
              onChange={handleInputChange}
              className={`px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none transition ${errors.duration ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'}`}
            >
              <option value="" disabled>Select duration</option>
              {durationOptions.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
            </select>
            {formData.duration === 'other' && (
              <input
                type="text"
                name="otherDuration"
                value={formData.otherDuration}
                onChange={handleInputChange}
                placeholder="Duration in days (e.g. for monthly type 30)"
                className={`mt-2 px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none transition ${errors.otherDuration ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'}`}
              />
            )}
            {errors.duration && <span className="text-red-500 text-sm mt-1">{errors.duration}</span>}
            {errors.otherDuration && <span className="text-red-500 text-sm mt-1">{errors.otherDuration}</span>}
          </div>

          {/* Visits per Month */}
          <div className="flex flex-col">
            <label className="mb-1 font-medium text-gray-700">Visits per Month <span className="text-red-500">*</span></label>
            <input
              type="number"
              name="visitsPerMonth"
              value={formData.visitsPerMonth}
              onChange={handleInputChange}
              placeholder="Enter number of visits"
              min="0"
              className={`px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none transition ${errors.visitsPerMonth ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'}`}
            />
            {errors.visitsPerMonth && <span className="text-red-500 text-sm mt-1">{errors.visitsPerMonth}</span>}
          </div>

          {/* Validity From */}
          <div className="flex flex-col">
            <label className="mb-1 font-medium text-gray-700">Validity From <span className="text-red-500">*</span></label>
            <input
              type="date"
              name="validityFrom"
              value={formData.validityFrom}
              onChange={handleInputChange}
              className={`px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none transition ${errors.validityFrom ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'}`}
            />
            {errors.validityFrom && <span className="text-red-500 text-sm mt-1">{errors.validityFrom}</span>}
          </div>

          {/* Validity Upto */}
          <div className="flex flex-col">
            <label className="mb-1 font-medium text-gray-700">Validity Upto <span className="text-red-500">*</span></label>
            <input
              type="date"
              name="validityUpto"
              value={formData.validityUpto}
              onChange={handleInputChange}
              min={formData.validityFrom || undefined}
              className={`px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none transition ${errors.validityUpto ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'}`}
            />
            {errors.validityUpto && <span className="text-red-500 text-sm mt-1">{errors.validityUpto}</span>}
          </div>

          {/* Consumables */}
          <div className="flex flex-col md:col-span-2">
            <label className="mb-2 font-medium text-gray-700">Consumables Included in the AMC <span className="text-red-500">*</span></label>
            <Select
              isMulti
              options={consumableoptions}
              value={formData.consumables}
              onChange={handleConsumableChange}
              classNamePrefix="react-select"
              placeholder="Select consumables..."
              styles={{
                menu: (provided) => ({ ...provided, zIndex: 9999 }),
              }}
            />
            {consumablesHasOther && (
              <input
                type="text"
                name="otherConsumable"
                value={formData.otherConsumable}
                onChange={handleInputChange}
                placeholder="Specify other consumable"
                className={`mt-2 px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none transition ${errors.otherConsumable ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'}`}
              />
            )}
            {errors.consumables && <span className="text-red-500 text-sm mt-1">{errors.consumables}</span>}
            {errors.otherConsumable && <span className="text-red-500 text-sm mt-1">{errors.otherConsumable}</span>}
          </div>

          {/* Pricing */}
          <div className="flex flex-col">
            <label className="mb-1 font-medium text-gray-700">Pricing (₹) <span className="text-red-500">*</span></label>
            <input
              type="number"
              name="pricing"
              value={formData.pricing}
              onChange={handleInputChange}
              placeholder="Enter pricing"
              step="0.01"
              min="0"
              className={`px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none transition ${errors.pricing ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'}`}
            />
            {errors.pricing && <span className="text-red-500 text-sm mt-1">{errors.pricing}</span>}
          </div>

          {/* Transport */}
          <div className="flex flex-col">
            <label className="mb-1 font-medium text-gray-700">Transport (₹) <span className="text-red-500">*</span></label>
            <input
              type="number"
              name="transport"
              value={formData.transport}
              onChange={handleInputChange}
              placeholder="Enter transport cost"
              step="0.01"
              min="0"
              className={`px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none transition ${errors.transport ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'}`}
            />
            {errors.transport && <span className="text-red-500 text-sm mt-1">{errors.transport}</span>}
          </div>

          {/* GST */}
          <div className="flex flex-col">
            <label className="mb-1 font-medium text-gray-700">GST (%) <span className="text-red-500">*</span></label>
            <input
              type="number"
              name="gst"
              value={formData.gst}
              onChange={handleInputChange}
              placeholder="Enter GST percentage"
              step="0.01"
              min="0"
              max="100"
              className={`px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none transition ${errors.gst ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'}`}
            />
            {errors.gst && <span className="text-red-500 text-sm mt-1">{errors.gst}</span>}
          </div>

          {/* Total */}
          <div className="flex flex-col">
            <label className="mb-1 font-medium text-gray-700">Total (₹)</label>
            <input
              type="text"
              name="total"
              value={formData.total ? `₹ ${formData.total}` : ''}
              readOnly
              placeholder="Auto-calculated"
              className="px-3 py-2 border rounded-lg bg-gray-50 text-gray-700 font-semibold cursor-not-allowed"
            />
            <span className="text-xs text-gray-500 mt-1">Auto-calculated from Pricing + Transport + GST</span>
          </div>
        </div>

        {/* Add On Form */}
        {showAddon && (
          <div className="border-t pt-6">
            <div className="px-2 py-4 border-b flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Add On Contract</h2>
                <p className="text-sm text-gray-600">Additional AMC Details</p>
              </div>
              <button
                onClick={handleRemoveAddon}
                className="bg-red-500 hover:bg-red-600 text-white font-medium px-4 py-2 rounded-lg transition"
              >
                Remove
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-4 py-6 [&_input]:h-[44px] [&_select]:h-[44px]">
              {/* Grower - Full Width */}
              <div className="flex flex-col md:col-span-2">
                <label className="mb-2 font-medium text-gray-700">Select Grower <span className="text-red-500">*</span></label>
                <Select
                  options={growers}
                  value={addonFormData.grower}
                  onChange={handleGrowerChange}
                  classNamePrefix="react-select"
                  placeholder="Select grower..."
                  styles={{
                    menu: (provided) => ({ ...provided, zIndex: 9999 }),
                    control: (provided) => ({ ...provided, minHeight: '44px' }),
                  }}
                />
                {addonErrors.grower && <span className="text-red-500 text-sm mt-1">{addonErrors.grower}</span>}
              </div>

              {/* Validity From */}
              <div className="flex flex-col">
                <label className="mb-1 font-medium text-gray-700">Validity From <span className="text-red-500">*</span></label>
                <input
                  type="date"
                  name="validityFrom"
                  value={addonFormData.validityFrom}
                  onChange={handleAddonInputChange}
                  className={`px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none transition ${addonErrors.validityFrom ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'}`}
                />
                {addonErrors.validityFrom && <span className="text-red-500 text-sm mt-1">{addonErrors.validityFrom}</span>}
              </div>

              {/* Validity Upto */}
              <div className="flex flex-col">
                <label className="mb-1 font-medium text-gray-700">Validity Upto <span className="text-red-500">*</span></label>
                <input
                  type="date"
                  name="validityUpto"
                  value={addonFormData.validityUpto}
                  onChange={handleAddonInputChange}
                  min={addonFormData.validityFrom || undefined}
                  className={`px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none transition ${addonErrors.validityUpto ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'}`}
                />
                {addonErrors.validityUpto && <span className="text-red-500 text-sm mt-1">{addonErrors.validityUpto}</span>}
              </div>

              {/* Duration */}
              <div className="flex flex-col">
                <label className="mb-1 font-medium text-gray-700">Duration of AMC <span className="text-red-500">*</span></label>
                <select
                  name="duration"
                  value={addonFormData.duration}
                  onChange={handleAddonInputChange}
                  className={`px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none transition ${addonErrors.duration ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'}`}
                >
                  <option value="">Select duration</option>
                  {durationOptions.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
                </select>
                {addonFormData.duration === 'other' && (
                  <input
                    type="text"
                    name="otherDuration"
                    value={addonFormData.otherDuration}
                    onChange={handleAddonInputChange}
                    placeholder="Enter custom duration (e.g., 18 months)"
                    className={`mt-2 px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none transition ${addonErrors.otherDuration ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'}`}
                  />
                )}
                {addonErrors.duration && <span className="text-red-500 text-sm mt-1">{addonErrors.duration}</span>}
                {addonErrors.otherDuration && <span className="text-red-500 text-sm mt-1">{addonErrors.otherDuration}</span>}
              </div>

              {/* Visits per Month */}
              <div className="flex flex-col">
                <label className="mb-1 font-medium text-gray-700">Visits per Month <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  name="visitsPerMonth"
                  value={addonFormData.visitsPerMonth}
                  onChange={handleAddonInputChange}
                  placeholder="Enter number of visits"
                  min="0"
                  className={`px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none transition ${addonErrors.visitsPerMonth ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'}`}
                />
                {addonErrors.visitsPerMonth && <span className="text-red-500 text-sm mt-1">{addonErrors.visitsPerMonth}</span>}
              </div>

              {/* Consumables */}
              <div className="flex flex-col md:col-span-2">
                <label className="mb-2 font-medium text-gray-700">Consumables Included in the AMC <span className="text-red-500">*</span></label>
                <Select
                  isMulti
                  options={consumableoptions}
                  value={addonFormData.consumables}
                  onChange={handleAddonConsumableChange}
                  classNamePrefix="react-select"
                  placeholder="Select consumables..."
                  styles={{
                    menu: (provided) => ({ ...provided, zIndex: 9999 }),
                  }}
                />
                {addonErrors.consumables && <span className="text-red-500 text-sm mt-1">{addonErrors.consumables}</span>}
              </div>

              {/* Pricing */}
              <div className="flex flex-col">
                <label className="mb-1 font-medium text-gray-700">Pricing (₹) <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  name="pricing"
                  value={addonFormData.pricing}
                  onChange={handleAddonInputChange}
                  placeholder="Enter pricing"
                  step="0.01"
                  min="0"
                  className={`px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none transition ${addonErrors.pricing ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'}`}
                />
                {addonErrors.pricing && <span className="text-red-500 text-sm mt-1">{addonErrors.pricing}</span>}
              </div>

              {/* Transport */}
              <div className="flex flex-col">
                <label className="mb-1 font-medium text-gray-700">Transport (₹) <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  name="transport"
                  value={addonFormData.transport}
                  onChange={handleAddonInputChange}
                  placeholder="Enter transport cost"
                  step="0.01"
                  min="0"
                  className={`px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none transition ${addonErrors.transport ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'}`}
                />
                {addonErrors.transport && <span className="text-red-500 text-sm mt-1">{addonErrors.transport}</span>}
              </div>

              {/* GST */}
              <div className="flex flex-col">
                <label className="mb-1 font-medium text-gray-700">GST (%) <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  name="gst"
                  value={addonFormData.gst}
                  onChange={handleAddonInputChange}
                  placeholder="Enter GST percentage"
                  step="0.01"
                  min="0"
                  max="100"
                  className={`px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none transition ${addonErrors.gst ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'}`}
                />
                {addonErrors.gst && <span className="text-red-500 text-sm mt-1">{addonErrors.gst}</span>}
              </div>

              {/* Total */}
              <div className="flex flex-col">
                <label className="mb-1 font-medium text-gray-700">Total (₹)</label>
                <input
                  type="text"
                  name="total"
                  value={addonFormData.total ? `₹ ${addonFormData.total}` : ''}
                  readOnly
                  placeholder="Auto-calculated"
                  className="px-3 py-2 border rounded-lg bg-gray-50 text-gray-700 font-semibold cursor-not-allowed"
                />
                <span className="text-xs text-gray-500 mt-1">Auto-calculated from Pricing + Transport + GST</span>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex items-center justify-end px-4 py-4">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`px-6 py-3 btn-primary ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? "Please wait..." : "Submit (जमा करें)"}
          </button>
        </div>
      </div>
    </div>
  );
}