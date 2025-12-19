import React, { useState, useEffect } from "react";
import Select from "react-select";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";

export default function ObservationForm({ onSubmit = (data) => console.log(data) }) {
    const [step, setStep] = useState(1);
    const [loadingCustomers, setLoadingCustomers] = useState(false);
    const [customers, setCustomers] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    const user = JSON.parse(localStorage.getItem("user"));
    const user_code = user?.user_code;

    const location = useLocation();
    const schId = location.state?.scheduleId;
    console.log("Received scheduleId from location state:", schId);

    const addDynamicRow = () => {
        setFormData((prevFormData) => ({
            ...prevFormData,
            nutrientsData: [
                ...prevFormData.nutrientsData,
                { nutrients: "", tankCapacity: "", numberOfTopups: "" },
            ],
        }));
    };

    const removeDynamicRow = (index) => {
        setFormData((prevFormData) => ({
            ...prevFormData,
            nutrientsData: prevFormData.nutrientsData.filter((_, idx) => idx !== index),
        }));

        setErrors((prevErrors) => {
            if (prevErrors.nutrientsData && prevErrors.nutrientsData[index]) {
                const newErrors = { ...prevErrors };
                if (newErrors.nutrientsData) {
                    newErrors.nutrientsData = newErrors.nutrientsData.filter((_, idx) => idx !== index);
                }
                return newErrors;
            }
            return prevErrors;
        });
    };

    const handleDynamicFieldChange = (index, field, value) => {
        setFormData((prevFormData) => {
            const updatedFields = [...prevFormData.nutrientsData];
            updatedFields[index][field] = value;
            return {
                ...prevFormData,
                nutrientsData: updatedFields,
            };
        });

        setErrors((prevErrors) => {
            const newErrors = { ...prevErrors };
            if (newErrors.nutrientsData && newErrors.nutrientsData[index]) {
                newErrors.nutrientsData[index] = {
                    ...newErrors.nutrientsData[index],
                    [field]: "",
                };

                const hasRowErrors = Object.values(newErrors.nutrientsData[index]).some(error => error);
                if (!hasRowErrors) {
                    newErrors.nutrientsData = newErrors.nutrientsData.filter((_, idx) => idx !== index);
                    if (newErrors.nutrientsData.length === 0) {
                        delete newErrors.nutrientsData;
                    }
                }
            }
            return newErrors;
        });
    };

    const initialFormState = {
        customers: null,
        plantsWater: "",
        waterAbovePump: "",
        timerWorking: "",
        timerIssue: "",
        motorWorking: "",
        motorIssue: "",
        lightsWorking: "",
        lightsIssue: "",
        equipmentDamaged: "",
        equipmentDamageDetails: "",
        anyLeaks: "",
        cleanEnvironment: "",
        electricSecured: "",

        initialPh: "",
        correctedPh: "",
        initialTds: "",
        correctedTds: "",
        pestsPresent: "",
        pestTypes: [],
        pestOther: "",
        nutrientDeficiency: "",
        deficiencyDetails: "",
        plantProblems: [],
        cropNames: "",

        harvestTraining: "",
        pestManagement: "",
        equipmentCleaning: "",
        plantMaintenance: "",
        scopesOfImprovement: "",
        siteRating: "",

        plants: [],
        plantQuantities: {},
        materialsSuppliedPlantData: "",
        material_supplied_neemoil: "",
        material_supplied_chargeable_items: [],
        materialschargeableItemsOptionsother: "",
        chargeableOtherName: "",
        chargeableQuantities: {},
        setupPhotos: [],
        materialNeedsDelivery: false,
        nutrientsData: [{ nutrients: "", tankCapacity: "", numberOfTopups: "" }],

        step5Plants: [],
        materialsDeliveredPlantData: "",
        material_need_chargeable_items: [],
        materialsNeedChargeableItemsOptionsother: "",
        chargeableNeedQuantities: {},
        material_need_nutrientsData: [{ nutrients: "", tankCapacity: "", numberOfTopups: "" }],
        material_need_neemoil: "",
        materialNeedPlantQuantities: {},
    };

    const [formData, setFormData] = useState(initialFormState);
    const [errors, setErrors] = useState({});

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
        { label: "Bolting", value: "Bolting" }
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

    useEffect(() => {
        let mounted = true;
        const loadCustomers = async () => {
            setLoadingCustomers(true);
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}api/site-visit.php?chkScheduleVisit='active'&user_code=${user_code}&techId=${user?.id}`);
                if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
                const data = await res.json();
                const opts = Array.isArray(data.data)
                    ? data.data.map((c) => ({
                        value: c.schedule_id,
                        label: `${c.name} - ${c.phone} - ${c.visit_time}`,
                    }))
                    : [];
                if (mounted) {
                    setCustomers(opts);
                    const selected = opts.find((item) => item.value == schId);
                    if (selected) {
                        setFormData((prev) => ({
                            ...prev,
                            customers: selected,
                        }));
                    }
                }
            } catch (err) {
                console.error('Error loading customers:', err);
            } finally {
                if (mounted) setLoadingCustomers(false);
            }
        };

        loadCustomers();
        return () => {
            mounted = false;
        };
    }, []);

    const resetForm = () => {
        setFormData(initialFormState);
        setErrors({});
        setStep(1);

        if (formData.setupPhotos && formData.setupPhotos.length > 0) {
            formData.setupPhotos.forEach(photo => {
                if (photo.preview) {
                    URL.revokeObjectURL(photo.preview);
                }
            });
        }
    };

    const handleSubmit = async () => {
        setSubmitting(true);

        try {
            await new Promise(resolve => setTimeout(resolve, 800));

            const formPayload = new FormData();

            const appendFormData = (key, value) => {
                if (value === null || value === undefined) {
                    formPayload.append(key, '');
                } else if (typeof value === 'object') {
                    if (Array.isArray(value)) {
                        formPayload.append(key, JSON.stringify(value.map(item => item.value || item)));
                    } else if (value instanceof File) {
                        formPayload.append(key, value);
                    } else if (value && value.hasOwnProperty('value')) {
                        formPayload.append(key, value.value);
                    } else {
                        formPayload.append(key, JSON.stringify(value));
                    }
                } else {
                    formPayload.append(key, value.toString());
                }
            };

            Object.keys(formData).forEach((key) => {
                const value = formData[key];

                switch (key) {
                    case 'customers':
                        if (value) {
                            formPayload.append("schedule_id", value.value || "");
                        }
                        break;

                    case 'pestTypes':
                    case 'plantProblems':
                    case 'plants':
                    case 'material_supplied_chargeable_items':
                    case 'step5Plants':
                    case 'material_need_chargeable_items':
                        if (value && Array.isArray(value)) {
                            formPayload.append(key, JSON.stringify(value.map(i => i.value || i)));
                        } else {
                            formPayload.append(key, '[]');
                        }
                        break;

                    case 'setupPhotos':
                        if (value && Array.isArray(value)) {
                            value.forEach((photo, index) => {
                                if (photo && photo.file) {
                                    formPayload.append(`setupPhotos_${index}`, photo.file);
                                }
                            });
                        }
                        break;

                    case 'nutrientsData':
                    case 'material_need_nutrientsData':
                    case 'plantQuantities':
                    case 'materialNeedPlantQuantities':
                    case 'chargeableQuantities':
                    case 'chargeableNeedQuantities':
                        formPayload.append(key, JSON.stringify(value || []));
                        break;

                    default:
                        appendFormData(key, value);
                }
            });

            if (user_code) {
                formPayload.append("user_code", user_code);
            }

            const res = await fetch(`${import.meta.env.VITE_API_URL}api/site-visit.php`, {
                method: "POST",
                body: formPayload,
            });

            const responseText = await res.text();
            let result;

            try {
                const cleanedResponse = responseText.trim();
                result = JSON.parse(cleanedResponse);
            } catch (parseError) {
                console.error('JSON Parse Error:', parseError);
                if (responseText.toLowerCase().includes('success') || responseText.toLowerCase().includes('inserted')) {
                    toast.success("Form submitted successfully!");
                    return;
                } else if (responseText.toLowerCase().includes('error') || responseText.toLowerCase().includes('fail')) {
                    toast.error("Submission failed. Please try again.");
                    return;
                } else {
                    toast.error("Unexpected response from server. Please check console for details.");
                    return;
                }
            }

            if (result.status === "success") {
                toast.success(result.message || "Form submitted successfully!");
                resetForm();
            } else {
                toast.error(result.error || result.message || "Something went wrong");
            }

        } catch (err) {
            console.error('Submit failed:', err);
            toast.error('Submission failed. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        let updated = { ...formData, [name]: value };

        if (name === "timerWorking" && value === "yes") updated.timerIssue = "";
        if (name === "motorWorking" && value === "yes") updated.motorIssue = "";
        if (name === "lightsWorking" && value === "yes") updated.lightsIssue = "";
        if (name === "equipmentDamaged" && value === "no") updated.equipmentDamageDetails = "";
        if (name === "pestsPresent" && value === "no") {
            updated.pestTypes = [];
            updated.pestOther = "";
        }
        if (name === "nutrientDeficiency" && value === "no") updated.deficiencyDetails = "";

        setFormData(updated);
        setErrors({ ...errors, [name]: "" });
    };

    const handlePhotoChange = (e) => {
        const files = Array.from(e.target.files);
        const updatedPhotos = files.map(file => ({
            file: file,
            preview: URL.createObjectURL(file),
        }));

        setFormData({
            ...formData,
            setupPhotos: updatedPhotos,
        });

        setErrors({ ...errors, setupPhoto: "" });
    };

    const handleStep4MaterialsSelection = (selected) => {
        const newMaterials = selected || [];
        const newQuantities = {};

        newMaterials.forEach(material => {
            const key = material.value;
            if (formData.plantQuantities[key] !== undefined) {
                newQuantities[key] = formData.plantQuantities[key];
            }
        });

        setFormData({
            ...formData,
            plants: newMaterials,
            plantQuantities: newQuantities,
        });

        setErrors({ ...errors, plants: "", plantQuantities: "" });
    };

    const handleStep5MaterialsSelection = (selected) => {
        const newMaterials = selected || [];
        const newQuantities = {};

        newMaterials.forEach(material => {
            const key = material.value;
            if (formData.materialNeedPlantQuantities[key] !== undefined) {
                newQuantities[key] = formData.materialNeedPlantQuantities[key];
            }
        });

        const hasOthers = newMaterials.some(m => m.value === "Others");
        if (!hasOthers && newQuantities["Others"] !== undefined) {
            delete newQuantities["Others"];
        }

        setFormData({
            ...formData,
            step5Plants: newMaterials,
            materialNeedPlantQuantities: newQuantities,
        });

        setErrors({ ...errors, step5Plants: "", materialNeedPlantQuantities: "" });
    };

    const handleCustomerChange = (selected) => {
        setFormData(prev => ({
            ...prev,
            customers: selected,
        }));
    };

    const handleChargeableItemsChange = (selected) => {
        const newItems = selected || [];
        const newQuantities = { ...formData.chargeableQuantities };

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
            material_supplied_chargeable_items: newItems,
            chargeableQuantities: newQuantities,
        });

        setErrors((prevErrors) => ({
            ...prevErrors,
            material_supplied_chargeable_items: "",
            materialschargeableItemsOptionsother: "",
            chargeableOtherName: "",
            chargeableQuantities: {}
        }));
    };

    const handleStep4QuantityChange = (plantValue, quantity) => {
        setFormData({
            ...formData,
            plantQuantities: {
                ...formData.plantQuantities,
                [plantValue]: quantity,
            },
        });

        setErrors((prevErrors) => {
            const newErrors = { ...prevErrors };
            if (newErrors.plantQuantities && newErrors.plantQuantities[plantValue]) {
                delete newErrors.plantQuantities[plantValue];

                if (Object.keys(newErrors.plantQuantities).length === 0) {
                    delete newErrors.plantQuantities;
                }
            }
            return newErrors;
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
            materialNeedPlantQuantities: {
                ...formData.materialNeedPlantQuantities,
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

    const validateStep1 = () => {
        let newErrors = {};

        if (!formData.customers) newErrors.customers = "Required";
        if (!formData.plantsWater) newErrors.plantsWater = "Required";
        if (!formData.waterAbovePump) newErrors.waterAbovePump = "Required";

        if (!formData.timerWorking) newErrors.timerWorking = "Required";
        if (formData.timerWorking === "no" && !formData.timerIssue)
            newErrors.timerIssue = "Please specify";

        if (!formData.motorWorking) newErrors.motorWorking = "Required";
        if (formData.motorWorking === "no" && !formData.motorIssue)
            newErrors.motorIssue = "Please specify";

        if (!formData.lightsWorking) newErrors.lightsWorking = "Required";
        if (formData.lightsWorking === "no" && !formData.lightsIssue)
            newErrors.lightsIssue = "Please specify";

        if (!formData.equipmentDamaged) newErrors.equipmentDamaged = "Required";
        if (formData.equipmentDamaged === "yes" && !formData.equipmentDamageDetails)
            newErrors.equipmentDamageDetails = "Enter details";

        if (!formData.anyLeaks) newErrors.anyLeaks = "Required";
        if (!formData.cleanEnvironment) newErrors.cleanEnvironment = "Required";
        if (!formData.electricSecured) newErrors.electricSecured = "Required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep2 = () => {
        let newErrors = {};

        if (!formData.initialPh?.trim()) newErrors.initialPh = "Required";
        if (!formData.correctedPh?.trim()) newErrors.correctedPh = "Required";
        if (!formData.initialTds?.trim()) newErrors.initialTds = "Required";
        if (!formData.correctedTds?.trim()) newErrors.correctedTds = "Required";

        if (!formData.pestsPresent) newErrors.pestsPresent = "Required";

        if (formData.pestsPresent === "yes") {
            if (!formData.pestTypes || formData.pestTypes.length === 0) {
                newErrors.pestTypes = "Select at least one";
            }

            const othersSelected = formData.pestTypes?.some((p) => p.value === "Others");
            if (othersSelected && !formData.pestOther?.trim()) {
                newErrors.pestOther = "Specify other pest";
            }
        }

        if (!formData.nutrientDeficiency) newErrors.nutrientDeficiency = "Required";

        if (formData.nutrientDeficiency === "yes") {
            if (!formData.deficiencyDetails?.trim()) {
                newErrors.deficiencyDetails = "Please specify deficiency";
            }
        }

        if (!formData.plantProblems || formData.plantProblems.length === 0) {
            newErrors.plantProblems = "Select at least one problem";
        }

        if (!formData.cropNames?.trim()) {
            newErrors.cropNames = "Required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep3 = () => {
        let newErrors = {};

        if (!formData.harvestTraining) newErrors.harvestTraining = "Required";
        if (!formData.pestManagement) newErrors.pestManagement = "Required";
        if (!formData.equipmentCleaning) newErrors.equipmentCleaning = "Required";
        if (!formData.plantMaintenance) newErrors.plantMaintenance = "Required";
        if (!formData.scopesOfImprovement?.trim())
            newErrors.scopesOfImprovement = "Required";

        if (!formData.siteRating || formData.siteRating === "") {
            newErrors.siteRating = "Please select a site rating";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep4 = () => {
        let newErrors = {};
        
        // 1. Materials Supplied validation (plants field)
        if (!formData.plants || formData.plants.length === 0) {
            newErrors.plants = "Required";
        } else {
            // Validate quantities for selected plants
            const quantityErrors = {};
            let hasQuantityErrors = false;
            
            formData.plants.forEach((plant) => {
                if (plant.value !== "Others") {
                    const quantity = formData.plantQuantities?.[plant.value];
                    if (!quantity || quantity.trim() === "" || isNaN(quantity) || parseInt(quantity) <= 0) {
                        quantityErrors[plant.value] = "Quantity is required";
                        hasQuantityErrors = true;
                    }
                } else {
                    const otherQuantity = formData.plantQuantities?.["Others"];
                    if (!otherQuantity || otherQuantity.trim() === "" || isNaN(otherQuantity) || parseInt(otherQuantity) <= 0) {
                        quantityErrors["Others"] = "Quantity is required";
                        hasQuantityErrors = true;
                    }
                }
            });
            
            if (hasQuantityErrors) {
                newErrors.plantQuantities = quantityErrors;
            }
        }
        
        // 2. Photo of the Setup validation
        if (!formData.setupPhotos || formData.setupPhotos.length === 0) {
            newErrors.setupPhoto = "Required";
        }
        
        // 3. Neem Oil validation
        if (!formData.material_supplied_neemoil) {
            newErrors.material_supplied_neemoil = "Required";
        }
        
        // REMOVED: NutrientsData validation
        // REMOVED: Chargeable Items validation
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep5 = () => {
        let newErrors = {};

        if (formData.step5Plants && formData.step5Plants.length > 0) {
            const quantityErrors = {};
            let hasQuantityErrors = false;

            formData.step5Plants.forEach((plant) => {
                if (plant.value !== "Others") {
                    const quantity = formData.materialNeedPlantQuantities?.[plant.value];
                    if (!quantity || quantity.trim() === "" || isNaN(quantity) || parseInt(quantity) <= 0) {
                        quantityErrors[plant.value] = "Quantity is required";
                        hasQuantityErrors = true;
                    }
                } else {
                    const otherQuantity = formData.materialNeedPlantQuantities?.["Others"];
                    if (!otherQuantity || otherQuantity.trim() === "" || isNaN(otherQuantity) || parseInt(otherQuantity) <= 0) {
                        quantityErrors["Others"] = "Quantity is required";
                        hasQuantityErrors = true;
                    }
                }
            });

            if (hasQuantityErrors) {
                newErrors.materialNeedPlantQuantities = quantityErrors;
            }
        }

        formData.material_need_nutrientsData.forEach((field, index) => {
            if (field.nutrients) {
                const rowErrors = {};

                if (!field.tankCapacity) {
                    rowErrors.tankCapacity = "Required when Nutrients is selected";
                }

                if (!field.numberOfTopups && field.numberOfTopups !== 0) {
                    rowErrors.numberOfTopups = "Required when Nutrients is selected";
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
                const qty = formData.chargeableNeedQuantities?.[key];

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
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        let isValid = false;

        switch (step) {
            case 1:
                isValid = validateStep1();
                if (isValid) setStep(2);
                break;
            case 2:
                isValid = validateStep2();
                if (isValid) setStep(3);
                break;
            case 3:
                isValid = validateStep3();
                if (isValid) setStep(4);
                break;
            case 4:
                isValid = validateStep4();
                if (isValid) {
                    if (formData.materialNeedsDelivery) {
                        setStep(5);
                    } else {
                        handleSubmit();
                    }
                }
                break;
            case 5:
                isValid = validateStep5();
                if (isValid) {
                    handleSubmit();
                }
                break;
            default:
                break;
        }
    };

    const prevStep = () => {
        if (step > 1) {
            setStep(step - 1);
        }
    };

    const addStep5DynamicRow = () => {
        setFormData((prevFormData) => ({
            ...prevFormData,
            material_need_nutrientsData: [
                ...prevFormData.material_need_nutrientsData,
                { nutrients: "", tankCapacity: "", numberOfTopups: "" },
            ],
        }));
    };

    const removeStep5DynamicRow = (index) => {
        setFormData((prevFormData) => ({
            ...prevFormData,
            material_need_nutrientsData: prevFormData.material_need_nutrientsData.filter((_, idx) => idx !== index),
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

    const handleStep5DynamicFieldChange = (index, field, value) => {
        setFormData((prevFormData) => {
            const updatedFields = [...prevFormData.material_need_nutrientsData];
            updatedFields[index][field] = value;
            return {
                ...prevFormData,
                material_need_nutrientsData: updatedFields,
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

    const handleStep4OtherInput = (e) => {
        const { value } = e.target;
        setFormData({
            ...formData,
            materialsSuppliedPlantData: value,
        });
        setErrors({ ...errors, materialsSuppliedPlantData: "" });
    };

    const handleStep5OtherInput = (e) => {
        const { value } = e.target;
        setFormData({
            ...formData,
            materialsDeliveredPlantData: value,
        });
        setErrors({ ...errors, materialsDeliveredPlantData: "" });
    };

    const StepperHeader = () => (
        <div className="flex overflow-x-auto md:overflow-visible space-x-4 md:space-x-0 justify-between mb-8 pl-4 md:pl-0 pt-3">
            {[1, 2, 3, 4, 5].map((stepNum, idx) => (
                <div key={stepNum} className="flex-1 flex flex-col items-center min-w-[70px] relative">
                    {idx !== 0 && (
                        <div className="absolute left-0 top-5 w-full h-1 bg-gray-200 -z-10"></div>
                    )}
                    <div className={`w-10 h-10 flex items-center justify-center rounded-full text-white font-semibold transition-all duration-300 ${step === stepNum ? 'bg-blue-600 scale-110 shadow-lg' : 'bg-gray-300'
                        }`}>
                        {stepNum}
                    </div>
                    <div className="text-xs mt-2 text-gray-700 font-medium text-center">
                        {stepNum === 1 ? 'Visual Observations' :
                            stepNum === 2 ? 'Technical Observations' :
                                stepNum === 3 ? 'Client Training' :
                                    stepNum === 4 ? 'Material Supply' :
                                        stepNum === 5 ? 'Material Need To Deliver' : ''}
                    </div>
                </div>
            ))}
        </div>
    );

    const YesNoSimple = ({ name, label, required = false }) => (
        <div className="flex flex-col">
            <label className="mb-1 font-medium text-gray-700">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <div className="flex gap-6">
                {["yes", "no"].map((v) => (
                    <label key={v} className="flex items-center gap-2">
                        <input
                            type="radio"
                            name={name}
                            value={v}
                            checked={formData[name] === v}
                            onChange={handleChange}
                        />
                        {v.toUpperCase()}
                    </label>
                ))}
            </div>
            {errors[name] && <span className="text-red-500 text-sm">{errors[name]}</span>}
        </div>
    );

    return (
        <div className="w-full min-h-screen bg-gray-100 mt-10">
            <div className="mx-auto bg-white rounded-2xl shadow-xl p-6">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">Observation Form</h2>
                <StepperHeader />

                <div className="mt-6 space-y-6">
                    {/* STEP 1 */}
                    {step === 1 && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-6 py-6">
                            <div className="flex flex-col md:col-span-3">
                                <label className="mb-1 font-medium text-gray-700">
                                    Select Customer (ग्राहक नाम) <span className="text-red-500">*</span>
                                </label>
                                <Select
                                    options={customers}
                                    value={formData.customers}
                                    onChange={handleCustomerChange}
                                    isClearable
                                    isLoading={loadingCustomers}
                                    placeholder={loadingCustomers ? 'Loading customers...' : 'Select customer...'}
                                    classNamePrefix="react-select"
                                    styles={{ menu: (provided) => ({ ...provided, zIndex: 9999 }) }}
                                />
                                {errors.customers && (
                                    <span className="text-red-500 text-sm mt-1">{errors.customers}</span>
                                )}
                            </div>

                            <YesNoSimple name="plantsWater" label="Are the Plants Getting Water (क्या पौधों को पानी मिल रहा है?)" required={true} />
                            <YesNoSimple name="waterAbovePump" label="Water above the pump (पंप के ऊपर पानी)" required={true} />

                            {/* Timer Working */}
                            <div className="flex flex-col">
                                <label className="mb-1 font-medium text-gray-700">
                                    Timer Working (टाइमर काम कर रही है) <span className="text-red-500">*</span>
                                </label>
                                <div className="flex gap-6">
                                    {["yes", "no"].map((v) => (
                                        <label key={v} className="flex items-center gap-2">
                                            <input
                                                type="radio"
                                                name="timerWorking"
                                                value={v}
                                                checked={formData.timerWorking === v}
                                                onChange={handleChange}
                                            />
                                            {v.toUpperCase()}
                                        </label>
                                    ))}
                                </div>
                                {errors.timerWorking && <span className="text-red-500 text-sm mt-1">{errors.timerWorking}</span>}
                                {formData.timerWorking === "no" && (
                                    <div className="mt-3">
                                        <input
                                            type="text"
                                            name="timerIssue"
                                            value={formData.timerIssue}
                                            onChange={handleChange}
                                            placeholder="Enter timer issue details"
                                            className={`px-3 py-2 border rounded-lg w-full shadow-sm focus:ring-2 focus:outline-none transition ${errors.timerIssue ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'}`}
                                        />
                                        {errors.timerIssue && <span className="text-red-500 text-sm mt-1">{errors.timerIssue}</span>}
                                    </div>
                                )}
                            </div>

                            {/* Motor Working */}
                            <div className="flex flex-col">
                                <label className="mb-1 font-medium text-gray-700">
                                    Motor Working (मोटर काम कर रही है) <span className="text-red-500">*</span>
                                </label>
                                <div className="flex gap-6">
                                    {["yes", "no"].map((v) => (
                                        <label key={v} className="flex items-center gap-2">
                                            <input
                                                type="radio"
                                                name="motorWorking"
                                                value={v}
                                                checked={formData.motorWorking === v}
                                                onChange={handleChange}
                                            />
                                            {v.toUpperCase()}
                                        </label>
                                    ))}
                                </div>
                                {errors.motorWorking && <span className="text-red-500 text-sm mt-1">{errors.motorWorking}</span>}
                                {formData.motorWorking === "no" && (
                                    <div className="mt-3">
                                        <input
                                            type="text"
                                            name="motorIssue"
                                            value={formData.motorIssue}
                                            onChange={handleChange}
                                            placeholder="Enter motor issue details"
                                            className={`px-3 py-2 border rounded-lg w-full shadow-sm focus:ring-2 focus:outline-none transition ${errors.motorIssue ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'}`}
                                        />
                                        {errors.motorIssue && <span className="text-red-500 text-sm mt-1">{errors.motorIssue}</span>}
                                    </div>
                                )}
                            </div>

                            {/* Lights Working */}
                            <div className="flex flex-col">
                                <label className="mb-1 font-medium text-gray-700">
                                    Lights Working (Light काम कर रही है) <span className="text-red-500">*</span>
                                </label>
                                <div className="flex gap-6">
                                    {["yes", "no"].map((v) => (
                                        <label key={v} className="flex items-center gap-2">
                                            <input
                                                type="radio"
                                                name="lightsWorking"
                                                value={v}
                                                checked={formData.lightsWorking === v}
                                                onChange={handleChange}
                                            />
                                            {v.toUpperCase()}
                                        </label>
                                    ))}
                                </div>
                                {errors.lightsWorking && <span className="text-red-500 text-sm mt-1">{errors.lightsWorking}</span>}
                                {formData.lightsWorking === "no" && (
                                    <div className="mt-3">
                                        <input
                                            type="text"
                                            name="lightsIssue"
                                            value={formData.lightsIssue}
                                            onChange={handleChange}
                                            placeholder="Enter lights issue details"
                                            className={`px-3 py-2 border rounded-lg w-full shadow-sm focus:ring-2 focus:outline-none transition ${errors.lightsIssue ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'}`}
                                        />
                                        {errors.lightsIssue && <span className="text-red-500 text-sm mt-1">{errors.lightsIssue}</span>}
                                    </div>
                                )}
                            </div>

                            {/* Equipment Damaged */}
                            <div className="flex flex-col">
                                <label className="mb-1 font-medium text-gray-700">
                                    Equipment Damaged? (उपकरण ख़राब ?) <span className="text-red-500">*</span>
                                </label>
                                <div className="flex gap-6">
                                    {["yes", "no"].map((v) => (
                                        <label key={v} className="flex items-center gap-2">
                                            <input
                                                type="radio"
                                                name="equipmentDamaged"
                                                value={v}
                                                checked={formData.equipmentDamaged === v}
                                                onChange={handleChange}
                                            />
                                            {v.toUpperCase()}
                                        </label>
                                    ))}
                                </div>
                                {errors.equipmentDamaged && <span className="text-red-500 text-sm mt-1">{errors.equipmentDamaged}</span>}
                                {formData.equipmentDamaged === "yes" && (
                                    <div className="mt-3">
                                        <input
                                            type="text"
                                            name="equipmentDamageDetails"
                                            value={formData.equipmentDamageDetails}
                                            onChange={handleChange}
                                            placeholder="Enter equipment damage details"
                                            className={`px-3 py-2 border rounded-lg w-full shadow-sm focus:ring-2 focus:outline-none transition ${errors.equipmentDamageDetails ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'}`}
                                        />
                                        {errors.equipmentDamageDetails && <span className="text-red-500 text-sm mt-1">{errors.equipmentDamageDetails}</span>}
                                    </div>
                                )}
                            </div>

                            <YesNoSimple name="anyLeaks" label="Any leaks (कोई भी लीक)" required={true} />
                            <YesNoSimple name="cleanEnvironment" label="Clean Environment (स्वच्छ वातावरण)" required={true} />
                            <YesNoSimple name="electricSecured" label="Electric Connections Secured (विद्युत कनेक्शन सुरक्षित)" required={true} />
                        </div>
                    )}

                    {/* STEP 2 */}
                    {step === 2 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-6 py-6">
                            {/* Initial pH */}
                            <div className="flex flex-col">
                                <label className="mb-1 font-medium text-gray-700">
                                    Initial pH (प्रारंभिक पीएच)<span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    step="0.1"
                                    name="initialPh"
                                    value={formData.initialPh}
                                    onChange={handleChange}
                                    className={`px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:outline-none transition ${errors.initialPh ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'}`}
                                />
                                {errors.initialPh && (
                                    <span className="text-red-500 text-sm mt-1">{errors.initialPh}</span>
                                )}
                            </div>

                            {/* Corrected pH */}
                            <div className="flex flex-col">
                                <label className="mb-1 font-medium text-gray-700">
                                    Corrected pH (सही पीएच) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    step="0.1"
                                    name="correctedPh"
                                    value={formData.correctedPh}
                                    onChange={handleChange}
                                    className={`px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:outline-none transition ${errors.correctedPh ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'}`}
                                />
                                {errors.correctedPh && (
                                    <span className="text-red-500 text-sm mt-1">{errors.correctedPh}</span>
                                )}
                            </div>

                            {/* Initial TDS */}
                            <div className="flex flex-col">
                                <label className="mb-1 font-medium text-gray-700">
                                    Initial TDS (ppm) (प्रारंभिक टीडीएस (पीपीएम)) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    name="initialTds"
                                    value={formData.initialTds}
                                    onChange={handleChange}
                                    className={`px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:outline-none transition ${errors.initialTds ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'}`}
                                />
                                {errors.initialTds && (
                                    <span className="text-red-500 text-sm mt-1">{errors.initialTds}</span>
                                )}
                            </div>

                            {/* Corrected TDS */}
                            <div className="flex flex-col">
                                <label className="mb-1 font-medium text-gray-700">
                                    Corrected TDS (ppm) (टीडीएस ठीक किया गया) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    name="correctedTds"
                                    value={formData.correctedTds}
                                    onChange={handleChange}
                                    className={`px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:outline-none transition ${errors.correctedTds ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'}`}
                                />
                                {errors.correctedTds && (
                                    <span className="text-red-500 text-sm mt-1">{errors.correctedTds}</span>
                                )}
                            </div>

                            {/* Plant Problems */}
                            <div className="flex flex-col">
                                <label className="mb-1 font-medium text-gray-700">
                                    Plant Problems (पौधों की समस्याएँ) <span className="text-red-500">*</span>
                                </label>
                                <Select
                                    isMulti
                                    options={plantProblemOptions}
                                    value={formData.plantProblems}
                                    onChange={(selected) =>
                                        setFormData({ ...formData, plantProblems: selected || [] })
                                    }
                                    classNamePrefix="react-select"
                                    placeholder="Select plant problems..."
                                    styles={{ menu: (p) => ({ ...p, zIndex: 9999 }) }}
                                />
                                {errors.plantProblems && (
                                    <span className="text-red-500 text-sm mt-1">{errors.plantProblems}</span>
                                )}
                            </div>

                            {/* Crop Names */}
                            <div className="flex flex-col">
                                <label className="mb-1 font-medium text-gray-700">
                                    State which crops (कौन सी फसल बताएं?) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="cropNames"
                                    value={formData.cropNames}
                                    onChange={handleChange}
                                    placeholder="Enter crop names (e.g., Lettuce, Tomato, Basil)"
                                    className={`px-3 py-2 border rounded-lg w-full shadow-sm focus:ring-2 focus:outline-none transition ${errors.cropNames ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'}`}
                                />
                                {errors.cropNames && (
                                    <span className="text-red-500 text-sm mt-1">{errors.cropNames}</span>
                                )}
                            </div>

                            {/* Presence of Pests */}
                            <div className="flex flex-col">
                                <label className="mb-1 font-medium text-gray-700">
                                    Presence of Pests (कीटों की उपस्थिति) <span className="text-red-500">*</span>
                                </label>
                                <div className="flex gap-6 mt-2">
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            name="pestsPresent"
                                            value="yes"
                                            checked={formData.pestsPresent === "yes"}
                                            onChange={handleChange}
                                        />
                                        YES
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            name="pestsPresent"
                                            value="no"
                                            checked={formData.pestsPresent === "no"}
                                            onChange={handleChange}
                                        />
                                        NO
                                    </label>
                                </div>
                                {errors.pestsPresent && (
                                    <span className="text-red-500 text-sm mt-1">{errors.pestsPresent}</span>
                                )}
                            </div>

                            {/* Which Pests */}
                            {formData.pestsPresent === "yes" && (
                                <div className="flex flex-col">
                                    <label className="mb-1 font-medium text-gray-700">
                                        Which Pests? (कौन से कीट) <span className="text-red-500">*</span>
                                    </label>
                                    <Select
                                        isMulti
                                        options={pestOptions}
                                        value={formData.pestTypes}
                                        onChange={(selected) =>
                                            setFormData({ ...formData, pestTypes: selected || [] })
                                        }
                                        classNamePrefix="react-select"
                                        placeholder="Select pests..."
                                        styles={{ menu: (p) => ({ ...p, zIndex: 9999 }) }}
                                    />
                                    {errors.pestTypes && (
                                        <span className="text-red-500 text-sm mt-1">{errors.pestTypes}</span>
                                    )}
                                    {formData.pestTypes?.some((p) => p.value === "Others") && (
                                        <div className="mt-3">
                                            <input
                                                type="text"
                                                name="pestOther"
                                                value={formData.pestOther}
                                                onChange={handleChange}
                                                placeholder="Specify other pest"
                                                className={`px-3 py-2 border rounded-lg w-full shadow-sm focus:ring-2 focus:outline-none transition ${errors.pestOther ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'}`}
                                            />
                                            {errors.pestOther && (
                                                <span className="text-red-500 text-sm mt-1">{errors.pestOther}</span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Nutrient Deficiency */}
                            <div className="flex flex-col">
                                <label className="mb-1 font-medium text-gray-700">
                                    Nutrient Deficiency (पोषक तत्वों की कमी) <span className="text-red-500">*</span>
                                </label>
                                <div className="flex gap-6 mt-2">
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            name="nutrientDeficiency"
                                            value="yes"
                                            checked={formData.nutrientDeficiency === "yes"}
                                            onChange={handleChange}
                                        />
                                        YES
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            name="nutrientDeficiency"
                                            value="no"
                                            checked={formData.nutrientDeficiency === "no"}
                                            onChange={handleChange}
                                        />
                                        NO
                                    </label>
                                </div>
                                {errors.nutrientDeficiency && (
                                    <span className="text-red-500 text-sm mt-1">{errors.nutrientDeficiency}</span>
                                )}
                                {formData.nutrientDeficiency === "yes" && (
                                    <div className="mt-3">
                                        <input
                                            type="text"
                                            name="deficiencyDetails"
                                            value={formData.deficiencyDetails}
                                            onChange={handleChange}
                                            placeholder="Specify deficiency"
                                            className={`px-3 py-2 border rounded-lg w-full shadow-sm focus:ring-2 focus:outline-none transition ${errors.deficiencyDetails ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'}`}
                                        />
                                        {errors.deficiencyDetails && (
                                            <span className="text-red-500 text-sm mt-1">{errors.deficiencyDetails}</span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* STEP 3 */}
                    {step === 3 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-6 py-6">
                            {/* Yes/No fields */}
                            <YesNoSimple name="harvestTraining" label="How & When to Harvest (कटाई कैसे और कब करें)" required={true} />
                            <YesNoSimple name="pestManagement" label="Pest Management (कीट प्रबंधन)" required={true} />
                            <YesNoSimple name="equipmentCleaning" label="Equipment Cleaning (उपकरण की सफ़ाई)" required={true} />
                            <YesNoSimple name="plantMaintenance" label="Plant Maintenance (पौध रखरखाव)" required={true} />

                            {/* Scopes of Improvement + Site Rating */}
                            <div className="flex flex-col md:flex-row md:space-x-4 md:col-span-2">
                                {/* Scopes of Improvement - Half width */}
                                <div className="flex-1 mb-4 md:mb-0">
                                    <label className="mb-1 font-medium text-gray-700">
                                        Scopes of Improvement (सुधार की गुंजाइशें) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="scopesOfImprovement"
                                        value={formData.scopesOfImprovement}
                                        onChange={handleChange}
                                        placeholder="Specify areas for improvement"
                                        className={`px-3 py-2 border rounded-lg w-full shadow-sm focus:ring-2 focus:outline-none transition ${errors.scopesOfImprovement ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'
                                            }`}
                                    />
                                    {errors.scopesOfImprovement && (
                                        <span className="text-red-500 text-sm mt-1">{errors.scopesOfImprovement}</span>
                                    )}
                                </div>

                                {/* Site Rating - Half width */}
                                <div className="flex-1">
                                    <label className="mb-1 font-medium text-gray-700">
                                        Site Rating (साइट रेटिंग) <span className="text-red-500">*</span>
                                    </label>
                                    <div className="flex items-center space-x-1 mt-1">
                                        {[1, 2, 3, 4, 5].map((star) => {
                                            let color = 'text-red-500';
                                            if (formData.siteRating === 3) color = 'text-orange-500';
                                            if (formData.siteRating === 4 || formData.siteRating === 5) color = 'text-green-500';

                                            return (
                                                <svg
                                                    key={star}
                                                    onClick={() => setFormData({ ...formData, siteRating: star })}
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className={`h-8 w-8 cursor-pointer transition duration-200 ${formData.siteRating >= star ? color : 'text-gray-300'
                                                        }`}
                                                    fill="currentColor"
                                                    viewBox="0 0 20 20"
                                                >
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.974a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.374 2.452a1 1 0 00-.364 1.118l1.286 3.974c.3.921-.755 1.688-1.54 1.118l-3.374-2.452a1 1 0 00-1.176 0l-3.374 2.452c-.784.57-1.838-.197-1.539-1.118l1.285-3.974a1 1 0 00-.364-1.118L2.05 9.401c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.951-.69l1.285-3.974z" />
                                                </svg>
                                            );
                                        })}
                                    </div>
                                    {errors.siteRating && (
                                        <span className="text-red-500 text-sm mt-1">{errors.siteRating}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 4 */}
                    {step === 4 && (
                        <div className="space-y-6 px-6 py-6 max-w-full">
                            {/* Materials Supplied - KEEP REQUIRED */}
                            <div className="flex flex-col">
                                <label className="mb-1 font-medium text-gray-700">
                                    Materials Supplied (सप्लाई किए जाने वाले सामान) <span className="text-red-500">*</span>
                                </label>
                                <Select
                                    isMulti
                                    options={plantOptions}
                                    value={formData.plants}
                                    onChange={handleStep4MaterialsSelection}
                                    classNamePrefix="react-select"
                                    placeholder="Select materials..."
                                    styles={{ menu: (p) => ({ ...p, zIndex: 9999, overflow: "visible" }) }}
                                />
                                {errors.plants && (
                                    <span className="text-red-500 text-sm mt-1">{errors.plants}</span>
                                )}

                                {formData.plants?.some((item) => item.value === "Others") && (
                                    <div className="mt-3">
                                        <input
                                            type="text"
                                            name="materialsSuppliedPlantData"
                                            value={formData.materialsSuppliedPlantData || ""}
                                            onChange={handleStep4OtherInput}
                                            placeholder="Specify other material"
                                            className={`px-3 py-2 border rounded-lg w-full shadow-sm focus:ring-2 focus:outline-none transition ${errors.materialsSuppliedPlantData
                                                ? "border-red-500 focus:ring-red-400"
                                                : "border-gray-300 focus:ring-blue-400"
                                                }`}
                                        />
                                        {errors.materialsSuppliedPlantData && (
                                            <span className="text-red-500 text-sm mt-1">
                                                {errors.materialsSuppliedPlantData}
                                            </span>
                                        )}
                                    </div>
                                )}

                                {formData.plants && formData.plants.length > 0 && (
                                    <div className="flex flex-col mt-4">
                                        <label className="mb-2 font-medium text-gray-700">
                                            Quantity of Materials <span className="text-red-500">*</span>
                                        </label>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                            {formData.plants
                                                .filter((item) => item.value !== "Others")
                                                .map((material) => (
                                                    <div key={material.value} className="flex flex-col gap-2">
                                                        <div className="flex items-center gap-3">
                                                            <label className="font-medium text-gray-600 min-w-[140px]">
                                                                {material.label}:
                                                            </label>
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                value={formData.plantQuantities?.[material.value] || ""}
                                                                onChange={(e) => handleStep4QuantityChange(material.value, e.target.value)}
                                                                placeholder="Qty"
                                                                className={`px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:outline-none transition ${errors.plantQuantities && errors.plantQuantities[material.value]
                                                                    ? 'border-red-500 focus:ring-red-400'
                                                                    : 'border-gray-300 focus:ring-blue-400'
                                                                    } w-24`}
                                                            />
                                                        </div>
                                                        {errors.plantQuantities && errors.plantQuantities[material.value] && (
                                                            <span className="text-red-500 text-sm">{errors.plantQuantities[material.value]}</span>
                                                        )}

                                                    </div>
                                                ))}

                                            {formData.plants?.some((item) => item.value === "Others") &&
                                                formData.materialsSuppliedPlantData?.trim() !== "" && (
                                                    <div className="flex flex-col gap-2">
                                                        <div className="flex items-center gap-3">
                                                            <label className="font-medium text-gray-600 min-w-[140px]">
                                                                {formData.materialsSuppliedPlantData}:
                                                            </label>
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                value={formData.plantQuantities?.["Others"] || ""}
                                                                onChange={(e) => handleStep4QuantityChange("Others", e.target.value)}
                                                                placeholder="Qty"
                                                                className={`px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:outline-none transition ${errors.plantQuantities && errors.plantQuantities["Others"]
                                                                    ? 'border-red-500 focus:ring-red-400'
                                                                    : 'border-gray-300 focus:ring-blue-400'
                                                                    } w-24`}
                                                            />
                                                        </div>
                                                        {errors.plantQuantities && errors.plantQuantities["Others"] && (
                                                            <span className="text-red-500 text-sm">{errors.plantQuantities["Others"]}</span>
                                                        )}
                                                    </div>
                                                )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Dynamic Fields for Nutrients Data - REMOVE REQUIRED */}
                            {formData.nutrientsData.map((field, index) => (
                                <div key={index} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                    {/* Nutrients */}
                                    <div className="flex flex-col">
                                        <label className="mb-1 font-medium text-gray-700">
                                            Nutrients (पोषक तत्व)
                                        </label>
                                        <Select
                                            options={nutrientOptions}
                                            value={nutrientOptions.find(opt => opt.value === field.nutrients)}
                                            onChange={(selected) => handleDynamicFieldChange(index, 'nutrients', selected?.value || '')}
                                            classNamePrefix="react-select"
                                            placeholder="Select nutrient type..."
                                        />
                                    </div>

                                    {/* Tank Capacity */}
                                    <div className="flex flex-col">
                                        <label className="mb-1 font-medium text-gray-700">
                                            Tank Capacity in Litre (टैंक क्षमता लीटर में)
                                        </label>

                                        <input
                                            type="number"
                                            list="tankCapacityOptions"
                                            value={field.tankCapacity}
                                            onChange={(e) => handleDynamicFieldChange(index, "tankCapacity", e.target.value)}
                                            placeholder="Enter tank capacity in litres"
                                            className="border border-gray-300 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-blue-400"
                                        />

                                        <datalist id="tankCapacityOptions">
                                            <option value="20" />
                                            <option value="40" />
                                            <option value="100" />
                                            <option value="150" />
                                            <option value="200" />
                                        </datalist>
                                    </div>

                                    {/* Number of Top-ups */}
                                    <div className="flex flex-col">
                                        <label className="mb-1 font-medium text-gray-700">
                                            Number of Top-ups (टॉप-अप की संख्या)
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={field.numberOfTopups}
                                            onChange={(e) => handleDynamicFieldChange(index, 'numberOfTopups', e.target.value)}
                                            placeholder="Enter number of top-ups"
                                            className="px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:outline-none focus:ring-blue-400 transition w-full"
                                        />
                                    </div>
                                </div>
                            ))}

                            {/* Add More and Remove Row Buttons */}
                            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 mt-4">
                                {formData.nutrientsData.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeDynamicRow(formData.nutrientsData.length - 1)}
                                        className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition w-full sm:w-auto"
                                    >
                                        Remove Row
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={addDynamicRow}
                                    className="bg-[#9FC762] hover:bg-[#8DB350] text-white font-medium px-6 py-2 rounded-lg transition w-full sm:w-auto"
                                >
                                    Add More
                                </button>
                            </div>

                            {/* Neem Oil - KEEP REQUIRED */}
                            <YesNoSimple name="material_supplied_neemoil" label="Neem Oil (नीम का तेल)" required={true} />

                            {/* Chargeable Items - REMOVE REQUIRED */}
                            <div className="flex flex-col sm:flex-row space-x-0 sm:space-x-4 gap-4">
                                {/* Chargeable Items Supplied */}
                                <div className="flex-1">
                                    <label className="mb-1 font-medium text-gray-700">
                                        Chargeable Items Supplied (जो वस्तुएँ पैसे के लिए दी गई हैं)
                                    </label>

                                    <Select
                                        isMulti
                                        options={changebleItemsOptions}
                                        value={formData.material_supplied_chargeable_items}
                                        onChange={handleChargeableItemsChange}
                                        classNamePrefix="react-select"
                                        placeholder="Select items (optional)..."
                                        styles={{ menu: (p) => ({ ...p, zIndex: 9999 }) }}
                                    />

                                    {formData.material_supplied_chargeable_items?.some((item) => item.value === "Others") && (
                                        <div className="mt-3">
                                            <input
                                                type="text"
                                                placeholder="Specify other item"
                                                value={formData.chargeableOtherName || ""}
                                                onChange={(e) => setFormData({ ...formData, chargeableOtherName: e.target.value })}
                                                className="px-3 py-2 border border-gray-300 rounded-lg w-full shadow-sm focus:ring-2 focus:outline-none focus:ring-blue-400 transition"
                                            />
                                        </div>
                                    )}

                                    {/* Only show quantity section if items are selected */}
                                    {formData.material_supplied_chargeable_items?.length > 0 && (
                                        <div className="flex flex-col mt-4">
                                            <label className="mb-2 font-medium text-gray-700">
                                                Quantity of Chargeable Items
                                            </label>

                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                                                {formData.material_supplied_chargeable_items
                                                    .filter((i) => i.value !== "Others")
                                                    .map((item) => (
                                                        <div key={item.value} className="flex flex-col gap-2">
                                                            <label className="font-medium text-gray-600">{item.label}:</label>
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                value={formData.chargeableQuantities?.[item.value] || ""}
                                                                onChange={(e) => {
                                                                    const value = e.target.value;

                                                                    setFormData({
                                                                        ...formData,
                                                                        chargeableQuantities: {
                                                                            ...formData.chargeableQuantities,
                                                                            [item.value]: value
                                                                        }
                                                                    });
                                                                }}
                                                                placeholder="Qty"
                                                                className="px-3 py-2 border border-gray-300 rounded-lg shadow-sm w-24 focus:ring-2 outline-none focus:ring-blue-400 transition"
                                                            />
                                                        </div>
                                                    ))}

                                                {formData.material_supplied_chargeable_items?.some((i) => i.value === "Others") &&
                                                    formData.chargeableOtherName?.trim() !== "" && (
                                                        <div className="flex flex-col gap-2">
                                                            <label className="font-medium text-gray-600">{formData.chargeableOtherName}:</label>
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                value={formData.chargeableQuantities?.["Others"] || ""}
                                                                onChange={(e) => {
                                                                    const value = e.target.value;

                                                                    setFormData({
                                                                        ...formData,
                                                                        chargeableQuantities: {
                                                                            ...formData.chargeableQuantities,
                                                                            Others: value
                                                                        }
                                                                    });
                                                                }}
                                                                placeholder="Qty"
                                                                className="px-3 py-2 border border-gray-300 rounded-lg shadow-sm w-24 focus:ring-2 outline-none focus:ring-blue-400 transition"
                                                            />
                                                        </div>
                                                    )}

                                            </div>
                                        </div>
                                    )}
                                    <div className="flex items-center mt-4">
                                        <input
                                            type="checkbox"
                                            name="materialNeedsDelivery"
                                            checked={formData.materialNeedsDelivery}
                                            onChange={(e) => setFormData({ ...formData, materialNeedsDelivery: e.target.checked })}
                                            className="h-4 w-4 text-[#9FC762] focus:ring-[#9FC762] border-gray-300 rounded"
                                        />
                                        <label className="ml-2 text-gray-700">
                                            Material Needs to be delivered? (सामग्री जिसे पहुँचाना है)
                                        </label>
                                    </div>
                                </div>

                                {/* Photo of the Setup - KEEP REQUIRED */}
                                <div className="flex-1">
                                    <label className="mb-1 font-medium text-gray-700">
                                        Photo of the Setup (सेटअप की तस्वीर) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        name="setupPhoto"
                                        multiple
                                        onChange={handlePhotoChange}
                                        className={`px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:outline-none transition ${errors.setupPhoto ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'} w-full`}
                                    />
                                    <div className="mt-3 flex flex-wrap gap-4">
                                        {formData.setupPhotos && formData.setupPhotos.map((photo, index) => (
                                            <div key={index} className="flex flex-col items-center">
                                                <img
                                                    src={photo.preview}
                                                    alt={`Setup Preview ${index + 1}`}
                                                    className="w-20 h-20 object-cover rounded-md"
                                                />
                                                <span className="text-sm mt-1 text-gray-600">Photo {index + 1}</span>
                                            </div>
                                        ))}
                                    </div>
                                    {errors.setupPhoto && (
                                        <span className="text-red-500 text-sm mt-1">{errors.setupPhoto}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 5 */}
                    {step === 5 && (
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
                                                                value={formData.materialNeedPlantQuantities?.[material.value] || ""}
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
                                                                value={formData.materialNeedPlantQuantities?.["Others"] || ""}
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
                            {formData.material_need_nutrientsData.map((field, index) => (
                                <div key={index} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                    {/* Nutrients */}
                                    <div className="flex flex-col">
                                        <label className="mb-1 font-medium text-gray-700">
                                            Nutrients (पोषक तत्व)
                                        </label>
                                        <Select
                                            options={nutrientOptions}
                                            value={nutrientOptions.find(opt => opt.value === field.nutrients)}
                                            onChange={(selected) => handleStep5DynamicFieldChange(index, 'nutrients', selected?.value || '')}
                                            classNamePrefix="react-select"
                                            placeholder="Select nutrient type..."
                                        />
                                    </div>

                                    {/* Tank Capacity */}
                                    <div className="flex flex-col">
                                        <label className="mb-1 font-medium text-gray-700">
                                            Tank Capacity in Litre (टैंक क्षमता लीटर में) {field.nutrients && <span className="text-red-500">*</span>}
                                        </label>

                                        <input
                                            type="number"
                                            min="1"
                                            value={field.tankCapacity || ""}
                                            onChange={(e) => handleStep5DynamicFieldChange(index, 'tankCapacity', e.target.value)}
                                            placeholder="Enter tank capacity in litres"
                                            className={`border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-blue-400 ${field.nutrients && errors.material_need_nutrientsData && errors.material_need_nutrientsData[index]?.tankCapacity
                                                ? 'border-red-500 focus:ring-red-400'
                                                : 'border-gray-300 focus:ring-blue-400'
                                                }`}
                                        />

                                        {field.nutrients && errors.material_need_nutrientsData && errors.material_need_nutrientsData[index]?.tankCapacity && (
                                            <span className="text-red-500 text-sm mt-1">
                                                {errors.material_need_nutrientsData[index]?.tankCapacity}
                                            </span>
                                        )}
                                    </div>

                                    {/* Number of Top-ups */}
                                    <div className="flex flex-col">
                                        <label className="mb-1 font-medium text-gray-700">
                                            Number of Top-ups (टॉप-अप की संख्या) {field.nutrients && <span className="text-red-500">*</span>}
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={field.numberOfTopups}
                                            onChange={(e) => handleStep5DynamicFieldChange(index, 'numberOfTopups', e.target.value)}
                                            placeholder="Enter number of top-ups"
                                            className={`px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:outline-none transition ${field.nutrients && errors.material_need_nutrientsData && errors.material_need_nutrientsData[index]?.numberOfTopups
                                                ? 'border-red-500 focus:ring-red-400'
                                                : 'border-gray-300 focus:ring-blue-400'
                                                } w-full`}
                                        />
                                        {field.nutrients && errors.material_need_nutrientsData && errors.material_need_nutrientsData[index]?.numberOfTopups && (
                                            <span className="text-red-500 text-sm mt-1">{errors.material_need_nutrientsData[index]?.numberOfTopups}</span>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {/* Add More and Remove Row Buttons */}
                            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 mt-4">
                                {formData.material_need_nutrientsData.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeStep5DynamicRow(formData.material_need_nutrientsData.length - 1)}
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
                                        const newQuantities = { ...formData.chargeableNeedQuantities };

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
                                            chargeableNeedQuantities: newQuantities,
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
                                                            value={formData.chargeableNeedQuantities?.[item.value] || ""}
                                                            onChange={(e) => {
                                                                const value = e.target.value;
                                                                setFormData({
                                                                    ...formData,
                                                                    chargeableNeedQuantities: {
                                                                        ...formData.chargeableNeedQuantities,
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
                                                            value={formData.chargeableNeedQuantities?.["Others"] || ""}
                                                            onChange={(e) => {
                                                                const value = e.target.value;
                                                                setFormData({
                                                                    ...formData,
                                                                    chargeableNeedQuantities: {
                                                                        ...formData.chargeableNeedQuantities,
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
                    )}

                    {/* BUTTONS */}
                    <div className="mt-6 px-6">
                        <div className="flex flex-col md:flex-row justify-end w-full gap-3">
                            {step > 1 && (
                                <button
                                    type="button"
                                    onClick={prevStep}
                                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium px-6 py-2 rounded-lg w-full md:w-auto transition"
                                >
                                    Previous
                                </button>
                            )}
                            <button
                                type="button"
                                disabled={submitting}
                                onClick={async () => {
                                    console.log('Submit button clicked, step:', step);
                                    console.log('materialNeedsDelivery:', formData.materialNeedsDelivery);

                                    if (step === 5 || (step === 4 && !formData.materialNeedsDelivery)) {
                                        console.log('Should submit form');
                                        let isValid = false;
                                        if (step === 4) {
                                            console.log('Validating step 4');
                                            isValid = validateStep4();
                                            console.log('Step 4 validation result:', isValid);
                                        } else if (step === 5) {
                                            console.log('Validating step 5');
                                            isValid = validateStep5();
                                            console.log('Step 5 validation result:', isValid);
                                        }

                                        if (isValid) {
                                            console.log('Validation passed, calling handleSubmit');
                                            await handleSubmit();
                                        } else {
                                            console.log('Validation failed, errors:', errors);
                                            toast.error("Please fix validation errors before submitting");
                                        }
                                    } else {
                                        console.log('Going to next step');
                                        handleNext();
                                    }
                                }}
                                className={`bg-[#9FC762] hover:bg-[#8DB350] text-white font-medium px-6 py-2 rounded-lg w-full md:w-auto transition
                ${submitting ? "opacity-60 cursor-not-allowed" : ""}`}
                            >
                                {submitting
                                    ? "Please wait..."
                                    : (step === 5 || (step === 4 && !formData.materialNeedsDelivery))
                                        ? "Submit"
                                        : "Next"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}