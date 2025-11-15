// AMCForm.jsx
import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import Select from 'react-select';

export default function AMCForm() {
  const [formData, setFormData] = useState({
    validityFrom: '',
    validityUpto: '',
    duration: '',
    customDuration: '',
    visitsPerMonth: '',
    consumables: [],
    customConsumable: '',
    pricing: '',
    transport: '',
    gst: '',
    total: ''
  });

  const consumablesHasOther = formData.consumables.some((c) => c.value === '9');

  const [growerData, setGrowerData] = useState({
    systemType: [],
    systemTypeOther: ''
  });

  // const growerHasOther = growerData.systemType.some((c) => c.value === 'Other');
  const growerHasOther = growerData.systemType.some(item => item.value === "Other");


  const [addonFormData, setAddonFormData] = useState({
    grower: '',
    validityFrom: '',
    validityUpto: '',
    duration: '',
    customDuration: '',
    visitsPerMonth: '',
    consumables: [],
    customConsumable: '',
    pricing: '',
    transport: '',
    gst: '',
    total: ''
  });

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
  
  const durationOptions = [
    { value: '30', label: 'Monthly' },
    { value: '90', label: 'Quarterly' },
    { value: '180', label: 'Semi Annually' },
    { value: '365', label: 'Annually' },
    { value: 'other', label: 'Other' },
  ];


//     useEffect(() => {
//     const fetchSystemTypes = async () => {
//   try {
//     const response = await fetch(`${import.meta.env.VITE_API_URL}api/amc.php?id=${id}`);
//     const apiData = await response.json();

//     console.log("API system types response:", apiData);

//     // apiData = [ { id: "45", system_type: "Mini Grower" } ]

//     const options = apiData.map(item => ({
//       value: item.id,
//       label: item.system_type
//     }));

//     setSystemTypeOptions(options);

//   } catch (error) {
//     console.error("Error fetching system types:", error);
//   }
// };

//     fetchSystemTypes();
//   }, []);

  // useEffect(() => {
  //   const fetchUser = async () => {
  //     if (!id) return;
  //     setLoading(true);
  //     try {
  //       const response = await fetch(`${import.meta.env.VITE_API_URL}api/amc.php?id=${id}`);
  //       const data = await response.json();

  //       console.log("Fetched user data:", data.amc_data);

  //       const amc = Array.isArray(data.amc_data) ? data.amc_data[0] : data.amc_data;
  //       const grower_data = Array.isArray(data.grower_data) ? data.grower_data[0] : data.grower_data;
  //       const consumable_data = Array.isArray(data.consumable_data) ? data.consumable_data : [];
  //       const consumable_value = (consumable_data || []).map((p) => ({
  //         value: p.id,
  //         label: p.name,
  //       }));
  //       if (data.status === "success" && amc) {
  //         setFormData({
  //           customer: amc.name || '',
  //           duration: amc.duration || '',
  //           customDuration: amc.duration_other || '',
  //           validityFrom: amc.validity_from || '',
  //           validityUpto: amc.validity_upto || '',
  //           visitsPerMonth: amc.visits_per_month || '',
  //           consumables: consumable_value,
  //           customConsumable: '',
  //           pricing: amc.pricing || '',
  //           transport: amc.transport || '',
  //           gst: amc.gst || '',
  //           total: amc.total || ''
  //         });
  //       } else {
  //         console.log('AMC not found!');
  //       }

  //       if (data.status === "success" && grower_data) {
  //         let apiGrowers = grower_data.system_type;   // example: "Mini Grower"

  //         let parsedGrowers = [];

  //         if (Array.isArray(apiGrowers)) {
  //           parsedGrowers = apiGrowers;
  //         } else if (typeof apiGrowers === "string") {
  //           parsedGrowers = apiGrowers.split(",").map(v => v.trim());
  //         }

  //         setGrowerData({
  //           name: grower_data.system_type || ''
  //         });
  //       } else {
  //         console.log('AMC not found!');
  //       }
        
  //       if (data.status === "success" && consumable_data) {
  //         setConsumableData({
  //           id: amc.id || '',
  //           name: amc.name || ''
  //         });
  //       } else {
  //         console.log('AMC not found!');
  //       }
  //     } catch (error) {
  //       console.error('Error fetching user:', error);
  //       alert('Failed to fetch user details!');
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchUser();
  // }, [id]);

  useEffect(() => {
  const fetchUser = async () => {
    if (!id) return;
    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}api/amc.php?id=${id}`);
      const data = await response.json();

      console.log("Fetched data:", data);

      const amc = Array.isArray(data.amc_data) ? data.amc_data[0] : data.amc_data;
      const grower_data = Array.isArray(data.grower_data) ? data.grower_data[0] : data.grower_data;
      const consumable_data = Array.isArray(data.consumable_data) ? data.consumable_data : [];

      // -----------------------------
      // Set AMC FORM DATA
      // -----------------------------
      if (amc) {
        setFormData({
          customer: amc.name || '',
          duration: amc.duration || '',
          customDuration: amc.duration_other || '',
          validityFrom: amc.validity_from || '',
          validityUpto: amc.validity_upto || '',
          visitsPerMonth: amc.visits_per_month || '',
          consumables: consumable_data.map(p => ({ value: p.id, label: p.name })),
          customConsumable: '',
          pricing: amc.pricing || '',
          transport: amc.transport || '',
          gst: amc.gst || '',
          total: amc.total || ''
        });
      }

      if (grower_data) {
  let systemType = grower_data.system_type;
  let systemTypeOther = grower_data.system_type_other;

  let parsedGrowers = [];

  // -----------------------------
  // RULE:
  // If system_type_other has value → show "Other"
  // -----------------------------
  if (systemTypeOther && systemTypeOther.trim() !== "") {
    parsedGrowers = ["Other"];  
  } 
  else {
    // If system_type contains comma-separated values
    if (Array.isArray(systemType)) {
      parsedGrowers = systemType;
    } else if (typeof systemType === "string") {
      if (systemType.trim() !== "") {
        parsedGrowers = systemType.split(",").map(v => v.trim());
      }
    }
  }

  // Convert to react-select format
  const selectedGrowers = parsedGrowers.map(g => ({
    value: g,
    label: g
  }));

  setGrowerData(prev => ({
    ...prev,
    systemType: selectedGrowers,
    systemTypeOther: systemTypeOther || ""
  }));
}


      // -----------------------------
      // OTHER CONSUMABLE DATA
      // -----------------------------
      if (consumable_data) {
        setConsumableData({
          id: amc?.id || '',
          name: amc?.name || ''
        });
      }

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
        const response = await fetch(`${import.meta.env.VITE_API_URL}api/consumable.php`);
        const data = await response.json();

        console.log("✅ API Response:", data);

        if (data.status === "success" && data.data?.length > 0) {
          const opts = Array.isArray(data.data)
            ? data.data.map((c) => ({
              value: c.id,
              label: `${c.name}`,
            }))
            : [];
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }

    if (name === 'pricing' || name === 'transport' || name === 'gst') {
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

    if (!formData.duration) newErrors.duration = 'Duration of AMC is required';
    else if (formData.duration === 'other' && !formData.customDuration.trim()) {
      newErrors.customDuration = 'Please specify the custom duration';
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
    else if (addonFormData.duration === 'other' && !addonFormData.customDuration.trim()) {
      newErrors.customDuration = 'Please specify the custom duration';
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
  if (!validateForm()) return;

  try {
    const form = new FormData();

    // convert consumables to array of ids
    const consumableIds = formData.consumables.map((c) => c.value);
    form.append("consumables", JSON.stringify(consumableIds));

    // append remaining keys
    Object.entries(formData).forEach(([key, value]) => {
      if (key !== "consumables") {
        form.append(key, value);
      }
    });

    form.append("id", id);
    form.append("_method", "PUT");

    console.log("Payload you are sending:");
    for (let p of form.entries()) console.log(p[0], p[1]);

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}api/amc.php?id=${id}`,
      { method: "POST", body: form }
    );

    const result = await response.json();
    console.log("API Response:", result);

  } catch (error) {
    console.error("Submit Error:", error);
  }
};


  const handleAddOn = () => {
    setShowAddon(true);
  };

  const handleRemoveAddon = () => {
    setShowAddon(false);
    setAddonFormData({
      grower: '',
      validityFrom: '',
      validityUpto: '',
      duration: '',
      customDuration: '',
      visitsPerMonth: '',
      consumables: [],
      customConsumable: '',
      pricing: '',
      transport: '',
      gst: '',
      total: ''
    });
    setAddonErrors({});
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
            <Select
              isMulti
  git config --global user.name "Your Name"
              name="systemType"
              options={systemTypeOptions}
              value={growerData.systemType}   // <-- Array of values
              onChange={(selected) =>
                setGrowerData(prev => ({ ...prev, systemType: selected }))
              }
              placeholder="Select grower..."
              classNamePrefix="react-select"
            />
            {growerHasOther && (
              <input
                type="text"
                name="systemTypeOther"
                value={growerData.systemTypeOther}
                onChange={handleInputChange}
                placeholder="Specify other consumable"
                className={`mt-2 px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none transition ${errors.systemTypeOther ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'}`}
              />
            )}
            {errors.grower && <span className="text-red-500 text-sm mt-1">{errors.grower}</span>}
            {errors.customDuration && <span className="text-red-500 text-sm mt-1">{errors.customDuration}</span>}
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

          {/* Duration */}
          <div className="flex flex-col">
            <label className="mb-1 font-medium text-gray-700">Duration of AMC <span className="text-red-500">*</span></label>
            <select
              name="duration"
              value={formData.duration}
              onChange={handleInputChange}
              className={`px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none transition ${errors.duration ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'}`}
            >
              <option value="">Select duration</option>
              {durationOptions.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
            </select>
            {formData.duration === 'other' && (
              <input
                type="text"
                name="customDuration"
                value={formData.customDuration}
                onChange={handleInputChange}
                placeholder="Enter custom duration (e.g., 18 months)"
                className={`mt-2 px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none transition ${errors.customDuration ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'}`}
              />
            )}
            {errors.duration && <span className="text-red-500 text-sm mt-1">{errors.duration}</span>}
            {errors.customDuration && <span className="text-red-500 text-sm mt-1">{errors.customDuration}</span>}
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
                value={formData.customConsumable}
                onChange={handleInputChange}
                placeholder="Specify other consumable"
                className={`mt-2 px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none transition ${errors.customConsumable ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'}`}
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
                  options={growerOptions}
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
                    name="customDuration"
                    value={addonFormData.customDuration}
                    onChange={handleAddonInputChange}
                    placeholder="Enter custom duration (e.g., 18 months)"
                    className={`mt-2 px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none transition ${addonErrors.customDuration ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'}`}
                  />
                )}
                {addonErrors.duration && <span className="text-red-500 text-sm mt-1">{addonErrors.duration}</span>}
                {addonErrors.customDuration && <span className="text-red-500 text-sm mt-1">{addonErrors.customDuration}</span>}
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
          {!showAddon && (
            <div className="px-4 py-4  flex justify-center">
              {/* <button
                onClick={handleAddOn}
                className="bg-[#9FC762] hover:bg-[#8DB350] text-white font-medium px-6 py-2 rounded-lg w-full sm:w-auto transition"
              >
                + Add On
              </button> */}
            </div>
          )}
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className={`btn-primary ${submitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600'}`}

          >
            {submitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </div>
    </div>
  );
}