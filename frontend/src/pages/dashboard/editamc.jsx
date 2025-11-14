import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import Select from 'react-select';

export default function AMCForm() {
  const [formData, setFormData] = useState({
    customer: '',
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

  
  const [consumableData, setConsumableData] = useState({
    id: '',
    name: ''
  });

  const [errors, setErrors] = useState({});
  const [customers, setCustomers] = useState([]); 
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [consumableoptions, setConsumable] = useState([]);
  const [loadingConsumable, setLoadingConsumable] = useState(false);
  const toastTimerRef = useRef(null);

  // Consumable options including "Other"


  const durationOptions = [
    { value: '30', label: 'Monthly' },
    { value: '90', label: 'Quarterly' },
    { value: '180', label: 'Semi Annually' },
    { value: '365', label: 'Annually' },
    { value: 'other', label: 'Other' },
  ];

  useEffect(() => {
          const fetchUser = async () => {
              if (!id) return;
              setLoading(true);
              try {
                  const response = await fetch(`${import.meta.env.VITE_API_URL}api/amc.php?id=${id}`);
                  const data = await response.json();
  
                  console.log("Fetched user data:", data.amc_data);

                  const amc = Array.isArray(data.amc_data) ? data.amc_data[0] : data.amc_data;
                  const consumable_data = Array.isArray(data.consumable_data) ? data.consumable_data : [];
                  const consumable_value = (consumable_data || []).map((p) => ({
                          value: p.id,
                          label: p.name,
                        }));
                  if (data.status === "success" && amc) {
                      setFormData({
                          customer: amc.name || '',
                          duration: amc.duration || '',
                          customDuration: amc.duration_other || '',
                          validityFrom: amc.validity_from || '',
                          validityUpto: amc.validity_upto || '',
                          visitsPerMonth: amc.visits_per_month || '',
                          consumables: consumable_value,
                          customConsumable: '',
                          pricing: amc.pricing || '',
                          transport: amc.transport || '',
                          gst: amc.gst || '',
                          total: amc.total || ''
                      });
                      
                  } else {
                      console.log('AMC not found!');
                  }

                  if (data.status === "success" && consumable_data) {
                      setConsumableData({
                          id: amc.id || '',
                          name: amc.name || ''
                      });
                      
                  } else {
                      console.log('AMC not found!');
                  }
              } catch (error) {
                  console.error('Error fetching user:', error);
                  alert('Failed to fetch user details!');
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

  // Fetch customers from backend on mount
  // useEffect(() => {
  //   let mounted = true;
  //   const loadCustomers = async () => {
  //     setLoadingCustomers(true);
  //     try {
  //       // Replace endpoint with your actual API
  //       const res = await fetch('/api/customers');
  //       if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
  //       const data = await res.json();
  //       // Expecting data to be an array of objects with id and name fields
  //       // Convert to react-select format
  //       const opts = Array.isArray(data)
  //         ? data.map((c) => ({ value: c.id ?? c._id ?? c.value ?? c.name, label: c.name ?? c.label ?? String(c.value) }))
  //         : [];
  //       if (mounted) setCustomers(opts);
  //     } catch (err) {
  //       // If fetch fails, we still allow user to type customer (react-select will show no options)
  //       console.error('Error loading customers:', err);
  //     } finally {
  //       if (mounted) setLoadingCustomers(false);
  //     }
  //   };

  //   loadCustomers();
  //   return () => {
  //     mounted = false;
  //     if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
  //   };
  // }, []);

  // const showToast = (message, type = 'success', duration = 3000) => {
  //   if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
  //   setToast({ show: true, message, type });
  //   toastTimerRef.current = setTimeout(() => {
  //     setToast({ show: false, message: '', type: 'success' });
  //   }, duration);
  // };

  // Generic input change handler
  const handleInputChange = (e) => {
    const { name, value } = e.target;

  const handleRemoveAddon = (index) => {
    setAddonForms(addonForms.filter((_, i) => i !== index));
    setErrors(prev => ({
      ...prev,
      addons: prev.addons.filter((_, i) => i !== index)
    }));
  };

  const handleMainInputChange = (e) => {
    const { name, value } = e.target;
    setMainForm(prev => ({ ...prev, [name]: value }));
    if (errors.main[name]) {
      setErrors(prev => ({ ...prev, main: { ...prev.main, [name]: '' } }));
    }
    if (name === 'pricing' || name === 'transport' || name === 'gst') {
      calculateTotal('main', name, value);
    }
  };

  const handleAddonInputChange = (index, e) => {
    const { name, value } = e.target;
    const updatedAddons = [...addonForms];
    updatedAddons[index] = { ...updatedAddons[index], [name]: value };
    setAddonForms(updatedAddons);

    if (errors.addons[index]?.[name]) {
      const newAddonErrors = [...errors.addons];
      newAddonErrors[index] = { ...newAddonErrors[index], [name]: '' };
      setErrors(prev => ({ ...prev, addons: newAddonErrors }));
    }

    if (name === 'pricing' || name === 'transport' || name === 'gst') {
      calculateTotal('addon', name, value, index);
    }
  };

  const handleMainCustomerChange = (selected) => {
    setMainForm(prev => ({ ...prev, customer: selected }));
    if (errors.main.customer) {
      setErrors(prev => ({ ...prev, main: { ...prev.main, customer: '' } }));
    }
  };

  const handleMainConsumableChange = (selected) => {
    setMainForm(prev => ({ ...prev, consumables: selected || [] }));
    if (errors.main.consumables) {
      setErrors(prev => ({ ...prev, main: { ...prev.main, consumables: '' } }));
    }
  };

  const handleAddonConsumableChange = (index, selected) => {
    const updatedAddons = [...addonForms];
    updatedAddons[index] = { ...updatedAddons[index], consumables: selected || [] };
    setAddonForms(updatedAddons);

    if (errors.addons[index]?.consumables) {
      const newAddonErrors = [...errors.addons];
      newAddonErrors[index] = { ...newAddonErrors[index], consumables: '' };
      setErrors(prev => ({ ...prev, addons: newAddonErrors }));
    }
  };

  const calculateTotal = (formType, changedField, changedValue, index = null) => {
    const form = formType === 'main' ? mainForm : addonForms[index];
    const pricing = parseFloat(changedField === 'pricing' ? changedValue : form.pricing) || 0;
    const transport = parseFloat(changedField === 'transport' ? changedValue : form.transport) || 0;
    const gst = parseFloat(changedField === 'gst' ? changedValue : form.gst) || 0;

    const subtotal = pricing + transport;
    const gstAmount = (subtotal * gst) / 100;
    const total = subtotal + gstAmount;

    if (formType === 'main') {
      setMainForm(prev => ({ ...prev, total: total.toFixed(2) }));
    } else {
      const updatedAddons = [...addonForms];
      updatedAddons[index] = { ...updatedAddons[index], total: total.toFixed(2) };
      setAddonForms(updatedAddons);
    }
  };

  const validateSingleForm = (formData, isMain = false) => {
    const newErrors = {};

    if (isMain && (!formData.customer || !formData.customer.value)) {
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

    return newErrors;
  };

  const validateAllForms = () => {
    const mainErrors = validateSingleForm(mainForm, true);
    const addonErrors = addonForms.map(form => validateSingleForm(form, false));

    setErrors({ main: mainErrors, addons: addonErrors });

    const hasMainErrors = Object.keys(mainErrors).length > 0;
    const hasAddonErrors = addonErrors.some(err => Object.keys(err).length > 0);

    return !hasMainErrors && !hasAddonErrors;
  };

  const handleSubmit = async () => {
    if (!validateAllForms()) {
      showToast('Please fix form errors before submitting', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const buildPayload = (formData, isMain = false) => ({
        ...(isMain && { customerId: formData.customer.value }),
        validityFrom: formData.validityFrom,
        validityUpto: formData.validityUpto,
        duration: formData.duration === 'other' ? formData.customDuration : formData.duration,
        visitsPerMonth: Number(formData.visitsPerMonth),
        consumables: formData.consumables.map((c) =>
          c.value === 'other' ? formData.customConsumable : c.label
        ),
        pricing: parseFloat(formData.pricing),
        transport: parseFloat(formData.transport),
        gst: parseFloat(formData.gst),
        total: parseFloat(formData.total) || 0,
      });

      const mainPayload = buildPayload(mainForm, true);
      const addonPayloads = addonForms.map(form => buildPayload(form, false));

      const fullPayload = {
        main: mainPayload,
        addons: addonPayloads
      };

      const res = await fetch('/api/amc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullPayload),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => null);
        throw new Error(`Server error: ${res.status} ${text ?? ''}`);
      }

      const respJson = await res.json().catch(() => ({}));
      showToast('AMC submitted successfully', 'success');

      // Reset all forms
      setMainForm({
        customer: null,
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
      setAddonForms([]);
      setErrors({ main: {}, addons: [] });
      console.log('Submitted payload:', fullPayload, 'server response:', respJson);
    } catch (err) {
      console.error('Submit failed:', err);
      showToast('Submission failed. See console for details.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Small helper to derive whether consumables include 'other'
  // const consumablesHasOther = formData.consumables.some((c) => c.value === 'other');
  // const consumablesHasOther = "test";

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
          {/* Customer - only in main form */}
          <div className="flex flex-col md:col-span-2">
            <label className="mb-1 font-medium text-gray-700">Customer Name: <span className="text-green-500">{formData.customer}</span></label>
          </div>

          {renderFormFields(mainForm, true)}
        </div>

        {/* Add-on Forms */}
        {addonForms.map((addonForm, index) => (
          <div key={addonForm.id} className="border-t-2 border-gray-200 mt-6 pt-6">
           
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-4 [&_input]:h-[44px] [&_select]:h-[44px]">
              {renderFormFields(addonForm, false, index)}
            </div>
          </div>
        ))}

        {/* Footer with Add-on and Submit buttons */}
        {/* Footer with Add-on and Submit buttons */}
        <div className="flex items-center justify-between px-4 py-4 border-t mt-6">
          {addonForms.length === 0 ? (
            <button
              type="button"
              onClick={handleAddAddon}
              className="bg-[#9FC762] hover:bg-[#8DB350] text-white font-medium px-6 py-2 rounded-lg w-full sm:w-auto transition"
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
            {/* {consumablesHasOther && (
              <input
                type="text"
                name="customConsumable"
                value={formData.customConsumable}
                onChange={handleInputChange}
                placeholder="Specify other consumable"
                className={`mt-2 px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none transition ${errors.customConsumable ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'}`}
              />
            )} */}
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

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className={`px-6 py-2 rounded-lg text-white font-medium shadow ${submitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              }`}
          >
            {submitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>

      </div>
    </div>
  );
}