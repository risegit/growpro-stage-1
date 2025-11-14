// AMCForm.jsx
import React, { useEffect, useState, useRef } from 'react';
import Select from 'react-select';

export default function AMCForm() {
  const [formData, setFormData] = useState({
    customer: null, // will be an object from react-select { value, label }
    grower: null,
    validityFrom: '',
    validityUpto: '',
    duration: '',
    customDuration: '',
    visitsPerMonth: '',
    consumables: [], // array of {value,label}
    customConsumable: '',
    pricing: '',
    transport: '',
    gst: '',
    total: ''
  });

  const [errors, setErrors] = useState({});
  const [customers, setCustomers] = useState([]); // options for react-select
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const toastTimerRef = useRef(null);
  const [growers, setGrowers] = useState([]); // list of growers for selected customer
  const [consumableoptions, setConsumable] = useState([]);
  const [loadingGrowers, setLoadingGrowers] = useState(false);
  const [loadingConsumable, setLoadingConsumable] = useState(false);


  // Consumable options including "Other"
  // const consumableOptions = [
  //   { value: 'germinated-plants', label: 'Germinated Plants in Jiffy Bags' },
  //   { value: 'seeds', label: 'Seeds' },
  //   { value: 'jiffy-bags', label: 'Jiffy Bags' },
  //   { value: 'leafy-nutrients', label: 'Leafy Nutrients' },
  //   { value: 'fruiting-nutrients', label: 'Fruiting Nutrients' },
  //   { value: 'neem-oil', label: 'Neem Oil' },
  //   { value: 'ph-updown', label: 'pH up/down' },
  //   { value: 'organic-pesticide', label: 'Organic Pesticide' },
  //   { value: 'other', label: 'Other (Specify Below)' },
  // ];

  const durationOptions = [
    { value: '30', label: 'Monthly' },
    { value: '90', label: 'Quarterly' },
    { value: '180', label: 'Semi Annually' },
    { value: '365', label: 'Annually' },
    { value: 'other', label: 'Other' },
  ];

  useEffect(() => {
    let mounted = true;
    const loadCustomers = async () => {
      setLoadingCustomers(true);
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}api/customer.php`);
        if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
        const data = await res.json();
        console.log("Fetched customers:", data);
        const opts = Array.isArray(data.data)
          ? data.data.map((c) => ({ 
            value: c.id,
            label: `${c.name} - ${c.phone}`,
            }))
          : [];
        if (mounted) setCustomers(opts);
      } catch (err) {
        console.error('Error loading customers:', err);
      } finally {
        if (mounted) setLoadingCustomers(false);
      }
    };

    loadCustomers();
    return () => {
      mounted = false;
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

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
      } else {
        
      }
    } catch (error) {
      console.error("Error fetching consumables:", error);
      
    } finally {
      setLoadingConsumable(false);
    }
  };

  fetchConsumable();

  return () => {
    if (toastTimerRef?.current) clearTimeout(toastTimerRef.current);
  };
}, []);

  

  const showToast = (message, type = 'success', duration = 3000) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ show: true, message, type });
    toastTimerRef.current = setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, duration);
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // If user types into numeric fields, keep them as string until parse
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

  // react-select customer change (single select)
 const handleCustomerChange = async (selected) => {
  // If customer cleared → reset grower and growers list
  if (!selected) {
    setFormData((prev) => ({ ...prev, customer: null, grower: null }));
    setGrowers([]);
    return;
  }

  // If same customer is re-selected, do nothing
  if (formData.customer && formData.customer.value === selected.value) return;

  // Set only the customer (don’t clear grower yet)
  setFormData((prev) => ({ ...prev, customer: selected }));

  if (errors.customer) {
    setErrors((prev) => ({ ...prev, customer: '' }));
  }

  // Now fetch growers for the selected customer
  setLoadingGrowers(true);
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}api/amc.php?customer_id=${selected.value}`);
    if (!res.ok) throw new Error('Failed to fetch growers');

    const data = await res.json();
    const opts = Array.isArray(data.data)
      ? data.data.map((g) => ({
          value: g.id,
          label: g.system_type,
        }))
      : [];

    // ✅ Update growers
    setGrowers(opts);

    // ✅ Clear grower selection only *after* new growers are loaded
    setFormData((prev) => ({
      ...prev,
      grower: null,
    }));
  } catch (err) {
    console.error('Error fetching growers:', err);
    setGrowers([]);
    setFormData((prev) => ({ ...prev, grower: null }));
  } finally {
    setLoadingGrowers(false);
  }
};



const handleGrowerChange = (selected) => {
  setFormData((prev) => ({ ...prev, grower: selected }));

  if (errors.grower) {
    setErrors((prev) => ({ ...prev, grower: '' }));
  }
};


  // react-select consumables (multi)
  const handleConsumableChange = (selected) => {
    setFormData((prev) => ({
      ...prev,
      consumables: selected || []
    }));

    if (errors.consumables) {
      setErrors((prev) => ({ ...prev, consumables: '' }));
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

  // Validate form before submit
  const validateForm = () => {
    const newErrors = {};

    if (!formData.customer || !formData.customer.value) {
      newErrors.customer = 'Please select a customer';
    }

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
    else if (formData.consumables.some((c) => c.value === 'other') && !formData.customConsumable.trim()) {
      newErrors.customConsumable = 'Please specify the other consumable';
    }

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

  // Submit handler - POSTs to /api/amc (replace with your real endpoint)
  const handleSubmit = async () => {
    if (!validateForm()) {
      showToast('Please fix form errors before submitting', 'error');
      return;
    }

    setSubmitting(true);
    try {
      // Build payload
      const formPayload = new FormData();

      // Append main form fields
      Object.keys(formData).forEach((key) => {
        if (!["consumables", "grower", "customer"].includes(key)) {
          formPayload.append(key, formData[key]);
        }
      });

      if (formData.customer) {
        formPayload.append("customer", formData.customer.value || "");
      }

      // Properly append multi-select arrays
      formPayload.append(
        "consumables",
        JSON.stringify(formData.consumables?.map((c) => c.value) || [])
      );
      formPayload.append(
        "growers",
        JSON.stringify(formData.grower?.map((g) => g.value) || [])
      );

      // ✅ Optional: log for debugging
      console.log("Form Payload Data:");
      for (let [key, value] of formPayload.entries()) {
        console.log(`${key}: ${value}`);
      }

      // ✅ Send the request
      const res = await fetch(`${import.meta.env.VITE_API_URL}api/amc.php`, {
        method: "POST",
        body: formPayload,
      });


      if (!res.ok) {
        const text = await res.text().catch(() => null);
        throw new Error(`Server error: ${res.status} ${text ?? ''}`);
      }

      const respJson = await res.json().catch(() => ({}));

      // Success
      showToast('AMC submitted successfully', 'success');

      // Reset form
      // setFormData({
      //   customer: null,
      //   validityFrom: '',
      //   validityUpto: '',
      //   duration: '',
      //   customDuration: '',
      //   visitsPerMonth: '',
      //   consumables: [],
      //   customConsumable: '',
      //   pricing: '',
      //   transport: '',
      //   gst: '',
      //   total: ''
      // });
      setErrors({});
      console.log('Submitted payload:', formPayload, 'server response:', respJson);
    } catch (err) {
      console.error('Submit failed:', err);
      showToast('Submission failed. See console for details.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Small helper to derive whether consumables include 'other'
  const consumablesHasOther = formData.consumables.some((c) => c.value === 'other');

  return (
    <div className="w-full min-h-screen bg-gray-100 mt-10">
      {/* Toast */}


      <div className="mx-auto bg-white rounded-2xl shadow-xl p-6">
        {/* Header */}
        <div className="px-2 py-4 border-b">
          <h1 className="text-2xl font-bold mb-1 text-gray-800">Add AMC Contract</h1>
          <p className="text-sm text-gray-600">Annual Maintenance Contract Details</p>
        </div>

        {/* Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-4 py-6 [&_input]:h-[44px] [&_select]:h-[44px]">
          {/* Customer - react-select single */}
          <div className="flex flex-col">
            <label className="mb-1 font-medium text-gray-700">Select Customer <span className="text-red-500">*</span></label>
            <Select
              options={customers}
              value={formData.customer}
              onChange={handleCustomerChange}
              isClearable
              isLoading={loadingCustomers}
              placeholder={loadingCustomers ? 'Loading customers...' : 'Select customer...'}
              classNamePrefix="react-select"
              styles={{
                menu: (provided) => ({ ...provided, zIndex: 9999 }),
              }}
            />
            {errors.customer && <span className="text-red-500 text-sm mt-1">{errors.customer}</span>}
          </div>

          <div className="flex flex-col">
            <label className="mb-1 font-medium text-gray-700">
              Select Grower <span className="text-red-500">*</span>
            </label>
            <Select
              isMulti
              options={growers}
              value={formData.grower}
              onChange={(selected) => setFormData((prev) => ({ ...prev, grower: selected }))}
              isClearable
              isLoading={loadingGrowers}
              placeholder={
                !formData.customer
                  ? 'Select customer first...'
                  : loadingGrowers
                  ? 'Loading growers...'
                  : 'Select grower...'
              }
              classNamePrefix="react-select"
              styles={{
                menu: (provided) => ({ ...provided, zIndex: 9999 }),
              }}
              isDisabled={!formData.customer}
            />
            {errors.grower && <span className="text-red-500 text-sm mt-1">{errors.grower}</span>}
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
                name="customDuration"
                value={formData.customDuration}
                onChange={handleInputChange}
                placeholder="In days (e.g., 30)"
                className={`mt-2 px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none transition ${errors.customDuration ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'}`}
              />
            )}
            {errors.duration && <span className="text-red-500 text-sm mt-1">{errors.duration}</span>}
            {errors.customDuration && <span className="text-red-500 text-sm mt-1">{errors.customDuration}</span>}
          </div>

          {/* Visits per Month (number input) */}
          <div className="flex flex-col">
            <label className="mb-1 font-medium text-gray-700"> Visits per Month <span className="text-red-500">*</span></label>
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

          {/* Consumables - multi select with Other */}
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
                name="customConsumable"
                value={formData.customConsumable}
                onChange={handleInputChange}
                placeholder="Specify other consumable"
                className={`mt-2 px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none transition ${errors.customConsumable ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'}`}
              />
            )}
            {errors.consumables && <span className="text-red-500 text-sm mt-1">{errors.consumables}</span>}
            {errors.customConsumable && <span className="text-red-500 text-sm mt-1">{errors.customConsumable}</span>}
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

        {/* Submit */}
        <div className="flex items-center justify-between px-4 py-4 border-t">
      
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className={`btn-primary shadow ${submitting ? 'bg-gray-400 cursor-not-allowed' : ''}`}
          >
            {submitting ? 'Submitting...' : 'Submit'}
          </button>

        </div>
      </div>
    </div>
  );
}
