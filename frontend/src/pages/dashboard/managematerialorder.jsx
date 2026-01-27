// AMCForm.jsx
import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import axios from 'axios';

export default function AMCForm() {
    const [formData, setFormData] = useState({
        customer: null,
        step5Plants: [],
        materialsDeliveredPlantData: "",
        material_need_chargeable_items: [],
        materialsNeedChargeableItemsOptionsother: "",
        chargeableItemsNeeded: {},
        nutrientsNeeded: [{ nutrientType: "", tankCapacity: "", topups: "" }],
        material_need_neemoil: "",
        plantsNeeded: {},
    });

    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [customers, setCustomers] = useState([]);
    const [loadingCustomers, setLoadingCustomers] = useState(false);


    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                const res = await axios.get(
                    `${import.meta.env.VITE_API_URL}/api/customer.php`
                );

                const raw = Array.isArray(res.data)
                    ? res.data
                    : res.data.data || [];

                const options = raw.map((c) => ({
                    value: c.id,
                    label: `${c.name} - ${c.phone}`,
                }));

                console.log("Mapped options:", options);
                setCustomers(options);
            } catch (e) {
                console.error(e);
            }
        };

        fetchCustomers();
    }, []);



    const pestOptions = [
        { label: "Others", value: "Others" },
        { label: "Aphids", value: "Aphids" },
        { label: "Mites", value: "Mites" },
        { label: "Mealy Bugs", value: "Mealy Bugs" },
        { label: "Thrips", value: "Thrips" },
        { label: "Powdery Mildew", value: "Powdery Mildew" },
        { label: "Ants", value: "Ants" },
        { label: "Caterpillar", value: "Caterpillar" },
        { label: "Rats", value: "Rats" },
        { label: "Birds", value: "Birds" },
        { label: "White flies", value: "White flies" },
        { label: "Leaf Miners", value: "Leaf Miners" }
    ];

    const changebleItemsOptions = [
        { label: "Others", value: "Others" },
        { label: "Motor", value: "Motor" },
        { label: "Timer", value: "Timer" },
        { label: "Lights", value: "Lights" },
        { label: "End caps", value: "End caps" },
        { label: "Netpots", value: "Netpots" }
    ];

    const plantProblemOptions = [
        { label: "No Problem", value: "No Problem" },
        { label: "Light Deficiency", value: "Light Deficiency" },
        { label: "Improper Maintenance", value: "Improper Maintenance" },
        { label: "Overgrown crops", value: "Overgrown crops" },
        { label: "Improper Harvesting", value: "Improper Harvesting" },
        { label: "Bolting", value: "Bolting" },
        { label: "Root Rot", value: "Root Rot" }
    ];

    const plantOptions = [
        { label: "Others", value: "Others" },
        { label: "Spinach", value: "Spinach" },
        { label: "Methi", value: "Methi" },
        { label: "Coriander", value: "Coriander" },
        { label: "Red Amaranthus", value: "Red Amaranthus" },
        { label: "Radish Leaves", value: "Radish Leaves" },
        { label: "Mustard Leaves", value: "Mustard Leaves" },
        { label: "Mint", value: "Mint" },
        { label: "Peppermint", value: "Peppermint" },
        { label: "Italian Basil", value: "Italian Basil" },
        { label: "Thai Basil", value: "Thai Basil" },
        { label: "Lemon Basil", value: "Lemon Basil" },
        { label: "Celery", value: "Celery" },
        { label: "Parsley", value: "Parsley" },
        { label: "Ajwain", value: "Ajwain" },
        { label: "Oregano", value: "Oregano" },
        { label: "Thyme", value: "Thyme" },
        { label: "Rosemary", value: "Rosemary" },
        { label: "Sage", value: "Sage" },
        { label: "Iceberg Lettuce", value: "Iceberg Lettuce" },
        { label: "Lollo Rosso Lettuce", value: "Lollo Rosso Lettuce" },
        { label: "Romaine Lettuce", value: "Romaine Lettuce" },
        { label: "Butterhead Lettuce", value: "Butterhead Lettuce" },
        { label: "Curly Kale", value: "Curly Kale" },
        { label: "Rocket Arugula", value: "Rocket Arugula" },
        { label: "Pak Choi", value: "Pak Choi" },
        { label: "Endives", value: "Endives" },
        { label: "Red Sorrell", value: "Red Sorrell" },
        { label: "Desi Tomatoes", value: "Desi Tomatoes" },
        { label: "Cherry Tomatoes", value: "Cherry Tomatoes" },
        { label: "San Marzano Tomatoes", value: "San Marzano Tomatoes" },
        { label: "Chili", value: "Chili" },
        { label: "Bhindi", value: "Bhindi" },
        { label: "Dudhi", value: "Dudhi" },
        { label: "Zucchini", value: "Zucchini" },
        { label: "Brinjal", value: "Brinjal" },
        { label: "Jalapenos", value: "Jalapenos" },
        { label: "Cauliflower", value: "Cauliflower" },
        { label: "Cucumber", value: "Cucumber" }
    ];

    const nutrientOptions = [
        { label: "Leafy", value: "Leafy" },
        { label: "Fruiting", value: "Fruiting" }
    ];

    const handleStep5MaterialsSelection = (selected) => {
        const newMaterials = selected || [];
        const newQuantities = {};

        newMaterials.forEach(material => {
            const key = material.value;
            if (formData.plantsNeeded[key] !== undefined) {
                newQuantities[key] = formData.plantsNeeded[key];
            }
        });

        const hasOthers = newMaterials.some(m => m.value === "Others");
        if (!hasOthers && newQuantities["Others"] !== undefined) {
            delete newQuantities["Others"];
        }

        setFormData({
            ...formData,
            step5Plants: newMaterials,
            plantsNeeded: newQuantities,
        });

        setErrors({ ...errors, step5Plants: "", materialNeedPlantQuantities: "" });
    };

    const validateForm = () => {
        const newErrors = {};

        // Fixed: Check if customer exists (not null/undefined)
        if (!formData.customer) {
            newErrors.customer = 'Please select a customer';
        }

        if (!formData.step5Plants || formData.step5Plants.length === 0) {
            newErrors.step5Plants = "Please select at least one material";
        } else {
            const quantityErrors = {};

            formData.step5Plants.forEach((plant) => {
                const key = plant.value;

                if (key === "Others") {
                    if (!formData.materialsDeliveredPlantData?.trim()) {
                        newErrors.materialsDeliveredPlantData = "Please specify other plant";
                    }

                    const qty = formData.plantsNeeded?.["Others"];
                    if (!qty || isNaN(qty) || Number(qty) <= 0) {
                        quantityErrors["Others"] = "Quantity is required";
                    }
                } else {
                    const qty = formData.plantsNeeded?.[key];
                    if (!qty || isNaN(qty) || Number(qty) <= 0) {
                        quantityErrors[key] = "Quantity is required";
                    }
                }
            });

            if (Object.keys(quantityErrors).length > 0) {
                newErrors.materialNeedPlantQuantities = quantityErrors;
            }
        }

        formData.nutrientsNeeded.forEach((field, index) => {
            if (field.nutrientType) {
                const rowErrors = {};

                if (!field.tankCapacity) {
                    rowErrors.tankCapacity = "Required when Nutrients is selected";
                }

                if (!field.topups && field.topups !== 0) {
                    rowErrors.topups = "Required when Nutrients is selected";
                }

                if (Object.keys(rowErrors).length > 0) {
                    if (!newErrors.material_need_nutrientsData) newErrors.material_need_nutrientsData = [];
                    newErrors.material_need_nutrientsData[index] = rowErrors;
                }
            }
        });

        if (!formData.material_need_neemoil) {
            newErrors.material_need_neemoil = "Required";
        }

        if (formData.material_need_chargeable_items && formData.material_need_chargeable_items.length > 0) {
            const chargeableQtyErrors = {};
            let hasChargeableQtyErrors = false;

            formData.material_need_chargeable_items.forEach((item) => {
                const key = item.value;
                const qty = formData.chargeableItemsNeeded?.[key];

                if (!qty || qty.trim() === "" || isNaN(qty) || parseInt(qty) <= 0) {
                    chargeableQtyErrors[key] = "Quantity is required";
                    hasChargeableQtyErrors = true;
                }
            });

            if (hasChargeableQtyErrors) {
                newErrors.chargeableNeedQuantities = chargeableQtyErrors;
            }
        }

        setErrors(newErrors);
        console.log("Form validation errors:", newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (!validateForm()) {
            console.log("Form validation failed");
            return;
        }

        setSubmitting(true);
        console.log("Form submitted with data:", formData);

        // Simulate API call
        setTimeout(() => {
            console.log("Form submitted successfully!");
            alert("Form submitted successfully! (This is a demo)");
            setSubmitting(false);
        }, 1000);
    };

    const addStep5DynamicRow = () => {
        setFormData((prevFormData) => ({
            ...prevFormData,
            nutrientsNeeded: [
                ...prevFormData.nutrientsNeeded,
                { nutrientType: "", tankCapacity: "", topups: "" },
            ],
        }));
    };

    const removeStep5DynamicRow = (index) => {
        setFormData((prevFormData) => ({
            ...prevFormData,
            nutrientsNeeded: prevFormData.nutrientsNeeded.filter((_, idx) => idx !== index),
        }));

        setErrors((prevErrors) => {
            if (prevErrors.material_need_nutrientsData && prevErrors.material_need_nutrientsData[index]) {
                const newErrors = { ...prevErrors };
                if (newErrors.material_need_nutrientsData) {
                    newErrors.material_need_nutrientsData = newErrors.material_need_nutrientsData.filter((_, idx) => idx !== index);
                }
                return newErrors;
            }
            return prevErrors;
        });
    };

    const handleStep5QuantityChange = (plantValue, quantity) => {
        const isPlantSelected = formData.step5Plants.some(plant =>
            plant.value === plantValue || (plantValue === "Others" && plant.value === "Others")
        );

        if (!isPlantSelected) {
            return;
        }

        setFormData({
            ...formData,
            plantsNeeded: {
                ...formData.plantsNeeded,
                [plantValue]: quantity,
            },
        });

        setErrors((prevErrors) => {
            const newErrors = { ...prevErrors };
            if (newErrors.materialNeedPlantQuantities && newErrors.materialNeedPlantQuantities[plantValue]) {
                delete newErrors.materialNeedPlantQuantities[plantValue];

                if (Object.keys(newErrors.materialNeedPlantQuantities).length === 0) {
                    delete newErrors.materialNeedPlantQuantities;
                }
            }
            return newErrors;
        });
    };

    const handleStep5DynamicFieldChange = (index, field, value) => {
        setFormData((prevFormData) => {
            const updatedFields = [...prevFormData.nutrientsNeeded];
            updatedFields[index][field] = value;
            return {
                ...prevFormData,
                nutrientsNeeded: updatedFields,
            };
        });

        setErrors((prevErrors) => {
            const newErrors = { ...prevErrors };
            if (newErrors.material_need_nutrientsData && newErrors.material_need_nutrientsData[index]) {
                newErrors.material_need_nutrientsData[index] = {
                    ...newErrors.material_need_nutrientsData[index],
                    [field]: "",
                };

                const hasRowErrors = Object.values(newErrors.material_need_nutrientsData[index]).some(error => error);
                if (!hasRowErrors) {
                    newErrors.material_need_nutrientsData = newErrors.material_need_nutrientsData.filter((_, idx) => idx !== index);
                    if (newErrors.material_need_nutrientsData.length === 0) {
                        delete newErrors.material_need_nutrientsData;
                    }
                }
            }
            return newErrors;
        });
    };

    const handleStep5Change = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        setErrors({ ...errors, [name]: "" });
    };

    const handleStep5OtherInput = (e) => {
        const { value } = e.target;
        setFormData({
            ...formData,
            materialsDeliveredPlantData: value,
        });
        setErrors({ ...errors, materialsDeliveredPlantData: "" });
    };

    return (
        <div className="w-full min-h-screen bg-[#fcfdfa] rounded-2xl mt-10">
            <div className="mx-auto bg-[#fcfdfa] border-[1.8px] border-blue-gray-100 rounded-2xl shadow-xl p-6">
                {/* Header */}
                <div className="px-6 py-4 border-b-2 border-gray-300">
                    <h1 className="text-2xl font-bold mb-1 text-gray-800">Place Offsite Material Order</h1>
                    <p className="text-gray-600 text-sm">Demo Forms</p>
                </div>

                {/* Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-6 py-6 [&_input]:h-[42px] [&_select]:h-[42px]">
                    {/* Customer Name */}
                    <div className="flex flex-col">
                        <label className="mb-1 font-medium text-gray-700">
                            Customer Name <span className="text-red-500">*</span>
                        </label>

                        <Select
                            options={customers}
                            value={formData.customer || null}
                            isClearable
                            isLoading={loadingCustomers}
                            placeholder="Select customer..."
                            classNamePrefix="react-select"
                            styles={{ menu: (provided) => ({ ...provided, zIndex: 9999 }) }}
                            noOptionsMessage={() =>
                                loadingCustomers ? "Loading customers..." : "No customers found"
                            }
                            onChange={(selectedOption) => {
                                setFormData((prev) => ({
                                    ...prev,
                                    customer: selectedOption,
                                }));
                                setErrors((prev) => ({
                                    ...prev,
                                    customer: "",
                                }));
                            }}
                        />

                        {errors.customer && (
                            <span className="text-red-500 text-sm mt-1">
                                {errors.customer}
                            </span>
                        )}
                    </div>



                </div>

                <div className="space-y-6 px-6 py-6 max-w-full">
                    <h3 className="font-semibold text-lg text-gray-800">Material Need To Deliver</h3>

                    {/* Materials Supplied */}
                    <div className="flex flex-col">
                        <label className="mb-1 font-medium text-gray-700">
                            Materials Deliver (डिलीवर किए जाने वाले सामान) <span className="text-red-500">*</span>
                        </label>
                        <Select
                            isMulti
                            options={plantOptions}
                            value={formData.step5Plants}
                            onChange={handleStep5MaterialsSelection}
                            classNamePrefix="react-select"
                            placeholder="Select materials..."
                            styles={{ menu: (p) => ({ ...p, zIndex: 9999 }) }}
                        />

                        {formData.step5Plants?.some((item) => item.value === "Others") && (
                            <div className="mt-3">
                                <input
                                    type="text"
                                    name="materialsDeliveredPlantData"
                                    value={formData.materialsDeliveredPlantData || ""}
                                    onChange={handleStep5OtherInput}
                                    placeholder="Specify other material"
                                    className="px-3 py-2 border border-gray-300 rounded-lg w-full shadow-sm focus:ring-2 focus:outline-none focus:ring-blue-400 transition"
                                />
                            </div>
                        )}

                        {errors.step5Plants && (
                            <span className="text-red-500 text-sm mt-1">
                                {errors.step5Plants}
                            </span>
                        )}

                        {errors.materialsDeliveredPlantData && (
                            <span className="text-red-500 text-sm mt-1">
                                {errors.materialsDeliveredPlantData}
                            </span>
                        )}

                        {formData.step5Plants && formData.step5Plants.length > 0 && (
                            <div className="flex flex-col mt-4">
                                <label className="mb-2 font-medium text-gray-700">
                                    Quantity of Materials <span className="text-red-500">*</span>
                                </label>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {formData.step5Plants
                                        .filter((item) => item.value !== "Others")
                                        .map((material) => (
                                            <div key={material.value} className="flex flex-col gap-2">
                                                <div className="flex items-center gap-3">
                                                    <label className="font-medium text-gray-600 min-w-[150px]">
                                                        {material.label}:
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        value={formData.plantsNeeded?.[material.value] || ""}
                                                        onChange={(e) => handleStep5QuantityChange(material.value, e.target.value)}
                                                        placeholder="Qty"
                                                        className={`px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:outline-none transition ${errors.materialNeedPlantQuantities && errors.materialNeedPlantQuantities[material.value]
                                                            ? 'border-red-500 focus:ring-red-400'
                                                            : 'border-gray-300 focus:ring-blue-400'
                                                            } w-24`}
                                                    />
                                                </div>
                                                {errors.materialNeedPlantQuantities && errors.materialNeedPlantQuantities[material.value] && (
                                                    <span className="text-red-500 text-sm">{errors.materialNeedPlantQuantities[material.value]}</span>
                                                )}
                                            </div>
                                        ))}

                                    {formData.step5Plants?.some((item) => item.value === "Others") &&
                                        formData.materialsDeliveredPlantData?.trim() !== "" && (
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center gap-3">
                                                    <label className="font-medium text-gray-600 min-w-[150px]">
                                                        {formData.materialsDeliveredPlantData}:
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        value={formData.plantsNeeded?.["Others"] || ""}
                                                        onChange={(e) => handleStep5QuantityChange("Others", e.target.value)}
                                                        placeholder="Qty"
                                                        className={`px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:outline-none transition ${errors.materialNeedPlantQuantities && errors.materialNeedPlantQuantities["Others"]
                                                            ? 'border-red-500 focus:ring-red-400'
                                                            : 'border-gray-300 focus:ring-blue-400'
                                                            } w-24`}
                                                    />
                                                </div>
                                                {errors.materialNeedPlantQuantities && errors.materialNeedPlantQuantities["Others"] && (
                                                    <span className="text-red-500 text-sm">{errors.materialNeedPlantQuantities["Others"]}</span>
                                                )}
                                            </div>
                                        )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Dynamic Fields for Step 5 Nutrients Data */}
                    {formData.nutrientsNeeded.map((field, index) => (
                        <div key={index} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {/* Nutrients */}
                            <div className="flex flex-col">
                                <label className="mb-1 font-medium text-gray-700">
                                    Nutrients (पोषक तत्व)
                                </label>
                                <Select
                                    options={nutrientOptions}
                                    value={nutrientOptions.find(opt => opt.value === field.nutrientType)}
                                    onChange={(selected) => handleStep5DynamicFieldChange(index, 'nutrientType', selected?.value || '')}
                                    classNamePrefix="react-select"
                                    placeholder="Select nutrient type..."
                                />
                            </div>

                            {/* Tank Capacity */}
                            <div className="flex flex-col">
                                <label className="mb-1 font-medium text-gray-700">
                                    Tank Capacity in Litre (टैंक क्षमता लीटर में) {field.nutrientType && <span className="text-red-500">*</span>}
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    value={field.tankCapacity || ""}
                                    onChange={(e) => handleStep5DynamicFieldChange(index, 'tankCapacity', e.target.value)}
                                    placeholder="Enter tank capacity in litres"
                                    className={`border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-blue-400 ${field.nutrientType && errors.material_need_nutrientsData && errors.material_need_nutrientsData[index]?.tankCapacity
                                        ? 'border-red-500 focus:ring-red-400'
                                        : 'border-gray-300 focus:ring-blue-400'
                                        }`}
                                />
                                {field.nutrientType && errors.material_need_nutrientsData && errors.material_need_nutrientsData[index]?.tankCapacity && (
                                    <span className="text-red-500 text-sm mt-1">
                                        {errors.material_need_nutrientsData[index]?.tankCapacity}
                                    </span>
                                )}
                            </div>

                            {/* Number of Top-ups */}
                            <div className="flex flex-col">
                                <label className="mb-1 font-medium text-gray-700">
                                    Number of Top-ups (टॉप-अप की संख्या) {field.nutrientType && <span className="text-red-500">*</span>}
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={field.topups}
                                    onChange={(e) => handleStep5DynamicFieldChange(index, 'topups', e.target.value)}
                                    placeholder="Enter number of top-ups"
                                    className={`px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:outline-none transition ${field.nutrientType && errors.material_need_nutrientsData && errors.material_need_nutrientsData[index]?.topups
                                        ? 'border-red-500 focus:ring-red-400'
                                        : 'border-gray-300 focus:ring-blue-400'
                                        } w-full`}
                                />
                                {field.nutrientType && errors.material_need_nutrientsData && errors.material_need_nutrientsData[index]?.topups && (
                                    <span className="text-red-500 text-sm mt-1">{errors.material_need_nutrientsData[index]?.topups}</span>
                                )}
                            </div>
                        </div>
                    ))}

                    {/* Add More and Remove Row Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-end gap-3 mt-4">
                        {formData.nutrientsNeeded.length > 1 && (
                            <button
                                type="button"
                                onClick={() => removeStep5DynamicRow(formData.nutrientsNeeded.length - 1)}
                                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition w-full sm:w-auto"
                            >
                                Remove Row
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={addStep5DynamicRow}
                            className="bg-[#9FC762] hover:bg-[#8DB350] text-white font-medium px-6 py-2 rounded-lg transition w-full sm:w-auto"
                        >
                            Add More
                        </button>
                    </div>

                    {/* Neem Oil */}
                    <div className="flex flex-col">
                        <label className="mb-1 font-medium text-gray-700">
                            Neem Oil (नीम का तेल) <span className="text-red-500">*</span>
                        </label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    name="material_need_neemoil"
                                    value="Yes"
                                    checked={formData.material_need_neemoil === "Yes"}
                                    onChange={handleStep5Change}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                                />
                                <span>Yes</span>
                            </label>
                            <label className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    name="material_need_neemoil"
                                    value="No"
                                    checked={formData.material_need_neemoil === "No"}
                                    onChange={handleStep5Change}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                                />
                                <span>No</span>
                            </label>
                        </div>
                        {errors.material_need_neemoil && (
                            <span className="text-red-500 text-sm mt-1">{errors.material_need_neemoil}</span>
                        )}
                    </div>

                    {/* Chargeable Items */}
                    <div className="flex flex-col">
                        <label className="mb-1 font-medium text-gray-700">
                            Chargeable Items Deliver (जो वस्तुएँ पैसे के लिए दी गई हैं)
                        </label>
                        <Select
                            isMulti
                            options={changebleItemsOptions}
                            value={formData.material_need_chargeable_items}
                            onChange={(selected) => {
                                const newItems = selected || [];
                                const newQuantities = { ...formData.chargeableItemsNeeded };

                                const selectedValues = newItems.map(item => item.value);
                                Object.keys(newQuantities).forEach(key => {
                                    if (!selectedValues.includes(key)) {
                                        delete newQuantities[key];
                                    }
                                });

                                newItems.forEach(item => {
                                    if (!newQuantities[item.value]) {
                                        newQuantities[item.value] = "";
                                    }
                                });

                                setFormData({
                                    ...formData,
                                    material_need_chargeable_items: newItems,
                                    chargeableItemsNeeded: newQuantities,
                                });
                            }}
                            classNamePrefix="react-select"
                            placeholder="Select items..."
                            styles={{ menu: (p) => ({ ...p, zIndex: 9999 }) }}
                        />

                        {formData.material_need_chargeable_items?.some((item) => item.value === "Others") && (
                            <div className="mt-3">
                                <input
                                    type="text"
                                    name="materialsNeedChargeableItemsOptionsother"
                                    value={formData.materialsNeedChargeableItemsOptionsother || ""}
                                    onChange={handleStep5Change}
                                    placeholder="Specify other item"
                                    className="px-3 py-2 border border-gray-300 rounded-lg w-full shadow-sm focus:ring-2 focus:outline-none focus:ring-blue-400 transition"
                                />
                            </div>
                        )}

                        {formData.material_need_chargeable_items?.length > 0 && (
                            <div className="flex flex-col mt-4">
                                <label className="mb-2 font-medium text-gray-700">
                                    Quantity of Chargeable Items <span className="text-red-500">*</span>
                                </label>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {formData.material_need_chargeable_items
                                        .filter((i) => i.value !== "Others")
                                        .map((item) => (
                                            <div key={item.value} className="flex flex-col gap-2">
                                                <label className="font-medium text-gray-600">{item.label}:</label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={formData.chargeableItemsNeeded?.[item.value] || ""}
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        setFormData({
                                                            ...formData,
                                                            chargeableItemsNeeded: {
                                                                ...formData.chargeableItemsNeeded,
                                                                [item.value]: value,
                                                            },
                                                        });
                                                        if (errors.chargeableNeedQuantities?.[item.value]) {
                                                            setErrors(prev => ({
                                                                ...prev,
                                                                chargeableNeedQuantities: {
                                                                    ...prev.chargeableNeedQuantities,
                                                                    [item.value]: undefined,
                                                                },
                                                            }));
                                                        }
                                                    }}
                                                    placeholder="Qty"
                                                    className={`px-3 py-2 border rounded-lg shadow-sm w-24 focus:ring-2 outline-none transition 
                                    ${errors.chargeableNeedQuantities && errors.chargeableNeedQuantities[item.value]
                                                            ? 'border-red-500 focus:ring-red-400'
                                                            : 'border-gray-300 focus:ring-blue-400'
                                                        }`}
                                                />
                                                {errors.chargeableNeedQuantities && errors.chargeableNeedQuantities[item.value] && (
                                                    <span className="text-red-500 text-sm">{errors.chargeableNeedQuantities[item.value]}</span>
                                                )}
                                            </div>
                                        ))}

                                    {formData.material_need_chargeable_items?.some((i) => i.value === "Others") &&
                                        formData.materialsNeedChargeableItemsOptionsother?.trim() !== "" && (
                                            <div className="flex flex-col gap-2">
                                                <label className="font-medium text-gray-600">{formData.materialsNeedChargeableItemsOptionsother}:</label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={formData.chargeableItemsNeeded?.["Others"] || ""}
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        setFormData({
                                                            ...formData,
                                                            chargeableItemsNeeded: {
                                                                ...formData.chargeableItemsNeeded,
                                                                Others: value,
                                                            },
                                                        });
                                                        if (errors.chargeableNeedQuantities?.["Others"]) {
                                                            setErrors(prev => ({
                                                                ...prev,
                                                                chargeableNeedQuantities: {
                                                                    ...prev.chargeableNeedQuantities,
                                                                    Others: undefined,
                                                                },
                                                            }));
                                                        }
                                                    }}
                                                    placeholder="Qty"
                                                    className={`px-3 py-2 border rounded-lg shadow-sm w-24 focus:ring-2 outline-none transition 
                                    ${errors.chargeableNeedQuantities && errors.chargeableNeedQuantities["Others"]
                                                            ? 'border-red-500 focus:ring-red-400'
                                                            : 'border-gray-300 focus:ring-blue-400'
                                                        }`}
                                                />
                                                {errors.chargeableNeedQuantities && errors.chargeableNeedQuantities["Others"] && (
                                                    <span className="text-red-500 text-sm">{errors.chargeableNeedQuantities["Others"]}</span>
                                                )}
                                            </div>
                                        )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Submit */}
                <div className="flex items-center justify-end px-4 py-4 border-t">
                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className={`px-6 py-2 btn-primary ${submitting ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                    >
                        {submitting ? 'Submitting...' : 'Submit Form'}
                    </button>
                </div>
            </div>
        </div>
    );
}