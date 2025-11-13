import React, { useEffect, useState, useRef } from 'react';
import Select from 'react-select';


export default function AMCForm() {
  const [mainForm, setMainForm] = useState({
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

  const [addonForms, setAddonForms] = useState([]);
  const [errors, setErrors] = useState({ main: {}, addons: [] });
  const [customers, setCustomers] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const toastTimerRef = useRef(null);

  const consumableOptions = [
    { value: 'germinated-plants', label: 'Germinated Plants in Jiffy Bags' },
    { value: 'seeds', label: 'Seeds' },
    { value: 'jiffy-bags', label: 'Jiffy Bags' },
    { value: 'leafy-nutrients', label: 'Leafy Nutrients' },
    { value: 'fruiting-nutrients', label: 'Fruiting Nutrients' },
    { value: 'neem-oil', label: 'Neem Oil' },
    { value: 'ph-updown', label: 'pH up/down' },
    { value: 'organic-pesticide', label: 'Organic Pesticide' },
    { value: 'other', label: 'Other (Specify Below)' },
  ];

  const durationOptions = [
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'semi-annually', label: 'Semi Annually' },
    { value: 'annually', label: 'Annually' },
    { value: 'other', label: 'Other' },
  ];

  useEffect(() => {
    let mounted = true;
    const loadCustomers = async () => {
      setLoadingCustomers(true);
      try {
        const res = await fetch('/api/customers');
        if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
        const data = await res.json();
        const opts = Array.isArray(data)
          ? data.map((c) => ({ value: c.id ?? c._id ?? c.value ?? c.name, label: c.name ?? c.label ?? String(c.value) }))
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

  const showToast = (message, type = 'success', duration = 3000) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ show: true, message, type });
    toastTimerRef.current = setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, duration);
  };

  const handleAddAddon = () => {
    const newAddon = {
      id: Date.now(),
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
    };
    setAddonForms([...addonForms, newAddon]);
    setErrors(prev => ({ ...prev, addons: [...prev.addons, {}] }));
  };

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

  const renderFormFields = (formData, isMain = false, index = null) => {
    const handleInputChange = isMain ? handleMainInputChange : (e) => handleAddonInputChange(index, e);
    const handleConsumableChange = isMain
      ? handleMainConsumableChange
      : (selected) => handleAddonConsumableChange(index, selected);
    const formErrors = isMain ? errors.main : (errors.addons[index] || {});
    const consumablesHasOther = formData.consumables.some((c) => c.value === 'other');

    return (
      <>
        {/* Validity From */}
        <div className="flex flex-col">
          <label className="mb-1 font-medium text-gray-700">Validity From <span className="text-red-500">*</span></label>
          <input
            type="date"
            name="validityFrom"
            value={formData.validityFrom}
            onChange={handleInputChange}
            className={`px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none transition ${formErrors.validityFrom ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'}`}
          />
          {formErrors.validityFrom && <span className="text-red-500 text-sm mt-1">{formErrors.validityFrom}</span>}
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
            className={`px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none transition ${formErrors.validityUpto ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'}`}
          />
          {formErrors.validityUpto && <span className="text-red-500 text-sm mt-1">{formErrors.validityUpto}</span>}
        </div>

        {/* Duration */}
        <div className="flex flex-col">
          <label className="mb-1 font-medium text-gray-700">Duration of AMC <span className="text-red-500">*</span></label>
          <select
            name="duration"
            value={formData.duration}
            onChange={handleInputChange}
            className={`px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none transition ${formErrors.duration ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'}`}
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
              className={`mt-2 px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none transition ${formErrors.customDuration ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'}`}
            />
          )}
          {formErrors.duration && <span className="text-red-500 text-sm mt-1">{formErrors.duration}</span>}
          {formErrors.customDuration && <span className="text-red-500 text-sm mt-1">{formErrors.customDuration}</span>}
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
            className={`px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none transition ${formErrors.visitsPerMonth ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'}`}
          />
          {formErrors.visitsPerMonth && <span className="text-red-500 text-sm mt-1">{formErrors.visitsPerMonth}</span>}
        </div>

        {/* Consumables */}
        <div className="flex flex-col md:col-span-2">
          <label className="mb-2 font-medium text-gray-700">Consumables Included in the AMC <span className="text-red-500">*</span></label>
          <Select
            isMulti
            options={consumableOptions}
            value={formData.consumables}
            onChange={handleConsumableChange}
            classNamePrefix="react-select"
            placeholder="Select consumables..."
            styles={{ menu: (provided) => ({ ...provided, zIndex: 9999 }) }}
          />
          {consumablesHasOther && (
            <input
              type="text"
              name="customConsumable"
              value={formData.customConsumable}
              onChange={handleInputChange}
              placeholder="Specify other consumable"
              className={`mt-2 px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none transition ${formErrors.customConsumable ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'}`}
            />
          )}
          {formErrors.consumables && <span className="text-red-500 text-sm mt-1">{formErrors.consumables}</span>}
          {formErrors.customConsumable && <span className="text-red-500 text-sm mt-1">{formErrors.customConsumable}</span>}
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
            className={`px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none transition ${formErrors.pricing ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'}`}
          />
          {formErrors.pricing && <span className="text-red-500 text-sm mt-1">{formErrors.pricing}</span>}
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
            className={`px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none transition ${formErrors.transport ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'}`}
          />
          {formErrors.transport && <span className="text-red-500 text-sm mt-1">{formErrors.transport}</span>}
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
            className={`px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none transition ${formErrors.gst ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'}`}
          />
          {formErrors.gst && <span className="text-red-500 text-sm mt-1">{formErrors.gst}</span>}
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
      </>
    );
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
          {/* Customer - only in main form */}
          <div className="flex flex-col md:col-span-2">
            <label className="mb-1 font-medium text-gray-700">Select Customer <span className="text-red-500">*</span></label>
            <Select
              options={customers}
              value={mainForm.customer}
              onChange={handleMainCustomerChange}
              isClearable
              isLoading={loadingCustomers}
              placeholder={loadingCustomers ? 'Loading customers...' : 'Select customer...'}
              classNamePrefix="react-select"
              styles={{ menu: (provided) => ({ ...provided, zIndex: 9999 }) }}
            />
            {errors.main.customer && <span className="text-red-500 text-sm mt-1">{errors.main.customer}</span>}
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
              + Add on
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleRemoveAddon(0)}
              className="bg-red-500 hover:bg-red-600 text-white font-medium px-6 py-2 rounded-lg w-full sm:w-auto transition"
            >
              Remove Add-on
            </button>
          )}

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