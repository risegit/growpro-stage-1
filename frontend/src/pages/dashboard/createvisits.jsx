import React, { useState } from "react";
import Select from "react-select";

export default function ObservationForm({ onSubmit = (data) => console.log(data) }) {
    const [step, setStep] = useState(1);

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

        // Clear errors for the removed row
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
    };

    const [formData, setFormData] = useState({
        /* STEP 1 */
        clientName: "",
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

        /* STEP 2 */
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

        /* STEP 3 */
        harvestTraining: "",
        pestManagement: "",
        equipmentCleaning: "",
        plantMaintenance: "",
        scopesOfImprovement: "",

        /* STEP 4 - Material Supply */
        plants: [],
        plantQuantities: {},
        otherPlants: "",
        otherPlantName: "",
        nutrients: "",
        tankCapacity: "",
        numberOfTopups: "",
        additionalNutrients: "",

        neemOil: "",
        chargeableItemsSupplied: [],
        changebleItemsOptionsother: "",
        setupPhotos: [],
        plantOthersInput: "",
        materialsOtherInput: "",


        materialNeedsDelivery: false,

        // Dynamic fields for multiple rows of nutrients, tank capacity, and top-ups
        nutrientsData: [{ nutrients: "", tankCapacity: "", numberOfTopups: "" }],

        /* STEP 5 - Delivery Details (same as Step 4 but without setup photos) */
        step5Plants: [], // <-- separate state for Step 5
        step5MaterialsOtherInput: "",
        step5ChargeableItemsSupplied: [],
        step5ChangebleItemsOptionsother: "",
        step5DynamicFields: [
            { nutrients: "", tankCapacity: "", numberOfTopups: "" }
        ],
        step5NeemOil: ""
    });

    const [errors, setErrors] = useState({});

    const pestOptions = [
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
        { label: "Leaf Miners", value: "Leaf Miners" },
        { label: "Others", value: "Others" }
    ];

    const changebleItemsOptions = [
        { label: "Motor", value: "Motor" },
        { label: "Timer", value: "Timer" },
        { label: "Lights", value: "Lights" },
        { label: "End caps", value: "End caps" },
        { label: "Netpots", value: "Netpots" },
        { label: "others", value: "Others" }
    ];

    const plantProblemOptions = [
        { label: "Light Deficiency", value: "Light Deficiency" },
        { label: "Improper Maintenance", value: "Improper Maintenance" },
        { label: "Overgrown crops", value: "Overgrown crops" },
        { label: "Improper Harvesting", value: "Improper Harvesting" },
        { label: "Bolting", value: "Bolting" }
    ];

    // Material Supply Options
    const plantOptions = [
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
        { label: "Cucumber", value: "Cucumber" },
        { label: "Others", value: "Others" }
    ];

    const nutrientOptions = [
        { label: "Leafy", value: "Leafy" },
        { label: "Fruiting", value: "Fruiting" }
    ];

    const tankCapacityOptions = [
        { label: "20L", value: "20L" },
        { label: "40L", value: "40L" },
        { label: "100L", value: "100L" },
        { label: "150L", value: "150L" },
        { label: "200L", value: "200L" }
    ];

    /* ----------------------- HANDLE INPUT CHANGE ----------------------- */
    const handleChange = (e) => {
        const { name, value } = e.target;
        let updated = { ...formData, [name]: value };

        // Auto-clear issue fields (step 1)
        if (name === "timerWorking" && value === "yes") updated.timerIssue = "";
        if (name === "motorWorking" && value === "yes") updated.motorIssue = "";
        if (name === "lightsWorking" && value === "yes") updated.lightsIssue = "";
        if (name === "equipmentDamaged" && value === "no") updated.equipmentDamageDetails = "";

        // Auto-clear pests
        if (name === "pestsPresent" && value === "no") {
            updated.pestTypes = [];
            updated.pestOther = "";
        }

        // Auto-clear deficiency
        if (name === "nutrientDeficiency" && value === "no") updated.deficiencyDetails = "";

        // Update the "Other" plant name if it's being entered
        if (name === "otherPlantName") {
            updated.otherPlantName = value;
        }

        setFormData(updated);
        setErrors({ ...errors, [name]: "" });
    };

    const handlePhotoChange = (e) => {
        const files = Array.from(e.target.files); // Get all selected files

        // Map over the selected files to generate preview URLs
        const updatedPhotos = files.map(file => ({
            file: file,
            preview: URL.createObjectURL(file), // Create preview URL
        }));

        // Update the form data with the new photos
        setFormData({
            ...formData,
            setupPhotos: updatedPhotos,
        });

        // Reset any errors related to photo validation
        setErrors({ ...errors, setupPhoto: "" });
    };

    const handlePlantSelection = (selected) => {
        const newPlants = selected || [];
        const newQuantities = { ...formData.plantQuantities };

        // Remove quantities for deselected plants
        const selectedValues = newPlants.map(p => p.value);
        Object.keys(newQuantities).forEach(plant => {
            if (!selectedValues.includes(plant)) {
                delete newQuantities[plant];
            }
        });

        // Check if "Other" is selected
        if (selectedValues.includes("Other")) {
            // If "Other" is selected, set empty plant name and quantity for it
            newQuantities["Other"] = formData.plantQuantities["Other"] || ""; // Preserve quantity if already exists
        } else {
            // If "Other" is not selected, clear the custom plant name and quantity
            newQuantities["Other"] = "";  // Clear quantity for "Other"
            formData.otherPlantName = ""; // Clear the custom plant name
        }

        setFormData({
            ...formData,
            plants: newPlants,
            plantQuantities: newQuantities,
            otherPlantName: formData.otherPlantName // Retain the custom plant name
        });

        setErrors({ ...errors, plants: "", plantQuantities: "" });
    };

    const handleStep5PlantSelection = (selected) => {
        const newPlants = selected || [];
        const newQuantities = { ...formData.step5PlantQuantities };

        // Remove quantities for deselected plants
        const selectedValues = newPlants.map(p => p.value);
        Object.keys(newQuantities).forEach(plant => {
            if (!selectedValues.includes(plant)) {
                delete newQuantities[plant];
            }
        });

        // Check if "Other" is selected
        if (selectedValues.includes("Other")) {
            // If "Other" is selected, set empty plant name and quantity for it
            newQuantities["Other"] = formData.plantQuantities["Other"] || ""; // Preserve quantity if already exists
        } else {
            // If "Other" is not selected, clear the custom plant name and quantity
            newQuantities["Other"] = "";  // Clear quantity for "Other"
            formData.otherPlantName = ""; // Clear the custom plant name
        }

        setFormData({
            ...formData,
            step5Plants: newPlants,
            step5PlantQuantities: newQuantities,
            step5OtherPlantName: formData.otherPlantName // Retain the custom plant name
        });

        setErrors({ ...errors, step5Plants: "", step5PlantQuantities: "" });
    };

    // const handlePlantQuantity = (plantValue, quantity) => {
    //     setFormData({
    //         ...formData,
    //         plantQuantities: {
    //             ...formData.plantQuantities,
    //             [plantValue]: quantity
    //         }
    //     });
    //     setErrors({ ...errors, plantQuantities: "" });
    // };

    // const handleStep5PlantQuantity = (plantValue, quantity) => {
    //     setFormData({
    //         ...formData,
    //         step5PlantQuantities: {
    //             ...formData.step5PlantQuantities,
    //             [plantValue]: quantity
    //         }
    //     });
    //     setErrors({ ...errors, step5PlantQuantities: "" });
    // };

    /* ----------------------- VALIDATION ----------------------- */
    const validateStep1 = () => {
        let newErrors = {};

        if (!formData.clientName) newErrors.clientName = "Required";
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

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep4 = () => {
        let newErrors = {};

        if (!formData.plants || formData.plants.length === 0) {
            newErrors.plants = "Select at least one plant";
        }

        formData.nutrientsData.forEach((field, index) => {
            if (!field.nutrients) {
                if (!newErrors.nutrientsData) newErrors.nutrientsData = [];
                newErrors.nutrientsData[index] = {
                    ...newErrors.nutrientsData[index],
                    nutrients: "Required",
                };
            }

            if (
                formData.plants.some((i) => i.value === "Others") &&
                !formData.plantOthersInput
            ) {
                errors.plantOthersInput = "Please specify the other material";
            }

            if (!field.tankCapacity) {
                if (!newErrors.nutrientsData) newErrors.nutrientsData = [];
                newErrors.nutrientsData[index] = {
                    ...newErrors.nutrientsData[index],
                    tankCapacity: "Required",
                };
            }
            if (!field.numberOfTopups && field.numberOfTopups !== 0) {
                if (!newErrors.nutrientsData) newErrors.nutrientsData = [];
                newErrors.nutrientsData[index] = {
                    ...newErrors.nutrientsData[index],
                    numberOfTopups: "Required",
                };
            }
        });

        if (!formData.neemOil) {
            newErrors.neemOil = "Required";
        }

        if (!formData.chargeableItemsSupplied || formData.chargeableItemsSupplied.length === 0) {
            newErrors.chargeableItemsSupplied = "Select chargeable items supplied";
        }

        if (
            formData.chargeableItemsSupplied?.some((item) => item.value === "Others") &&
            !formData.changebleItemsOptionsother
        ) {
            newErrors.changebleItemsOptionsother = "Please specify other items";
        }

        if (!formData.setupPhotos || formData.setupPhotos.length === 0) {
            newErrors.setupPhoto = "At least one photo of the setup is required.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep5 = () => {
        let newErrors = {};

        // Materials Supplied
        if (!formData.step5Plants || formData.step5Plants.length === 0) {
            newErrors.step5Plants = "Select at least one plant";
        }

        // Dynamic Fields
        formData.step5DynamicFields.forEach((field, index) => {
            if (!field.nutrients) {
                if (!newErrors.step5DynamicFields) newErrors.step5DynamicFields = [];
                newErrors.step5DynamicFields[index] = {
                    ...newErrors.step5DynamicFields[index],
                    nutrients: "Required",
                };
            }

            if (
                formData.plants.some((i) => i.value === "Others") &&
                !formData.plantOthersInput
            ) {
                errors.plantOthersInput = "Please specify the other material";
            }

            if (!field.tankCapacity) {
                if (!newErrors.step5DynamicFields) newErrors.step5DynamicFields = [];
                newErrors.step5DynamicFields[index] = {
                    ...newErrors.step5DynamicFields[index],
                    tankCapacity: "Required",
                };
            }
            if (!field.numberOfTopups && field.numberOfTopups !== 0) {
                if (!newErrors.step5DynamicFields) newErrors.step5DynamicFields = [];
                newErrors.step5DynamicFields[index] = {
                    ...newErrors.step5DynamicFields[index],
                    numberOfTopups: "Required",
                };
            }
        });

        // Neem Oil
        if (!formData.step5NeemOil) {
            newErrors.step5NeemOil = "Required";
        }

        // Chargeable Items
        if (!formData.step5ChargeableItemsSupplied || formData.step5ChargeableItemsSupplied.length === 0) {
            newErrors.step5ChargeableItemsSupplied = "Select chargeable items supplied";
        }

        if (
            formData.step5ChargeableItemsSupplied?.some((item) => item.value === "Others") &&
            !formData.step5ChangebleItemsOptionsother
        ) {
            newErrors.step5ChangebleItemsOptionsother = "Please specify other items";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    /* ----------------------- NEXT / PREVIOUS / SUBMIT ----------------------- */
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
                        onSubmit(formData);
                    }
                }
                break;
            case 5:
                isValid = validateStep5();
                if (isValid) {
                    console.log("SUBMITTING FROM STEP 5:", formData);
                    onSubmit(formData);
                }
                break;
            default:
                break;
        }
    };

    const addStep5DynamicRow = () => {
        setFormData((prevFormData) => ({
            ...prevFormData,
            step5DynamicFields: [
                ...prevFormData.step5DynamicFields,
                { nutrients: "", tankCapacity: "", numberOfTopups: "" },
            ],
        }));
    };

    const removeStep5DynamicRow = (index) => {
        setFormData((prevFormData) => ({
            ...prevFormData,
            step5DynamicFields: prevFormData.step5DynamicFields.filter((_, idx) => idx !== index),
        }));
    };

    const handleStep5DynamicFieldChange = (index, field, value) => {
        setFormData((prevFormData) => {
            const updatedFields = [...prevFormData.step5DynamicFields];
            updatedFields[index][field] = value;
            return {
                ...prevFormData,
                step5DynamicFields: updatedFields,
            };
        });
    };

    const handleStep5Change = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        setErrors({ ...errors, [name]: "" });
    };

    const prevStep = () => {
        if (step > 1) setStep(step - 1);
    };

    /* ----------------------- UI COMPONENTS ----------------------- */
    const SmallInput = ({ name, placeholder }) => (
        <input
            type="text"
            name={name}
            value={formData[name]}
            onChange={handleChange}
            placeholder={placeholder}
            className={`px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:outline-none transition ${errors[name] ? "border-red-500 focus:ring-red-400" : "border-gray-300 focus:ring-blue-400"
                }`}
        />
    );

    const YesNoWithInput = ({ name, issueName, label, showOn }) => (
        <div className="flex flex-col">
            <label className="mb-1 font-medium text-gray-700">
                {label} <span className="text-red-500">*</span>
            </label>

            <div className="flex gap-4">
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

            {formData[name] === showOn && (
                <SmallInput name={issueName} placeholder="Describe" />
            )}

            {errors[name] && <span className="text-red-500 text-sm">{errors[name]}</span>}
            {errors[issueName] && (
                <span className="text-red-500 text-sm">{errors[issueName]}</span>
            )}
        </div>
    );

    const YesNoSimple = ({ name, label }) => (
        <div className="flex flex-col">
            <label className="mb-1 font-medium text-gray-700">
                {label} <span className="text-red-500">*</span>
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

    /* ----------------------- STEPPER HEADER ---------------------- */
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
                                        stepNum === 5 ? 'Delivery Details' : ''}
                    </div>

                </div>
            ))}
        </div>
    );

    return (
        <div className="w-full min-h-screen bg-gray-100 mt-10">
            <div className="mx-auto bg-white rounded-2xl shadow-xl p-6">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">Observation Form</h2>
                <StepperHeader />

                <div className="mt-6 space-y-6">
                    {/* ========================= STEP 1 ========================= */}
                    {step === 1 && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-6 py-6">
                            <div className="flex flex-col md:col-span-3">
                                <label className="mb-1 font-medium text-gray-700">
                                    Client Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="clientName"
                                    value={formData.clientName}
                                    onChange={handleChange}
                                    placeholder="Enter client name"
                                    className={`px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:outline-none transition ${errors.clientName ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'
                                        }`}
                                />
                                {errors.clientName && (
                                    <span className="text-red-500 text-sm mt-1">{errors.clientName}</span>
                                )}
                            </div>

                            <YesNoSimple name="plantsWater" label="Are the Plants Getting Water" />
                            <YesNoSimple name="waterAbovePump" label="Water above the pump" />

                            <YesNoWithInput
                                name="timerWorking"
                                issueName="timerIssue"
                                label="Timer Working"
                                showOn="no"
                            />

                            <YesNoWithInput
                                name="motorWorking"
                                issueName="motorIssue"
                                label="Motor Working"
                                showOn="no"
                            />

                            <YesNoWithInput
                                name="lightsWorking"
                                issueName="lightsIssue"
                                label="Lights Working"
                                showOn="no"
                            />

                            <YesNoWithInput
                                name="equipmentDamaged"
                                issueName="equipmentDamageDetails"
                                label="Equipment Damaged?"
                                showOn="yes"
                            />

                            <YesNoSimple name="anyLeaks" label="Any leaks" />
                            <YesNoSimple name="cleanEnvironment" label="Clean Environment" />
                            <YesNoSimple name="electricSecured" label="Electric Connections Secured" />
                        </div>
                    )}

                    {/* ========================= STEP 2 ========================= */}
                    {step === 2 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-6 py-6">
                            {/* Initial pH */}
                            <div className="flex flex-col">
                                <label className="mb-1 font-medium text-gray-700">
                                    Initial pH <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    step="0.1"
                                    name="initialPh"
                                    value={formData.initialPh}
                                    onChange={handleChange}
                                    className={`px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:outline-none transition ${errors.initialPh ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'
                                        }`}
                                />
                                {errors.initialPh && (
                                    <span className="text-red-500 text-sm mt-1">{errors.initialPh}</span>
                                )}
                            </div>

                            {/* Corrected pH */}
                            <div className="flex flex-col">
                                <label className="mb-1 font-medium text-gray-700">
                                    Corrected pH <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    step="0.1"
                                    name="correctedPh"
                                    value={formData.correctedPh}
                                    onChange={handleChange}
                                    className={`px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:outline-none transition ${errors.correctedPh ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'
                                        }`}
                                />
                                {errors.correctedPh && (
                                    <span className="text-red-500 text-sm mt-1">{errors.correctedPh}</span>
                                )}
                            </div>

                            {/* Initial TDS */}
                            <div className="flex flex-col">
                                <label className="mb-1 font-medium text-gray-700">
                                    Initial TDS (ppm) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    name="initialTds"
                                    value={formData.initialTds}
                                    onChange={handleChange}
                                    className={`px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:outline-none transition ${errors.initialTds ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'
                                        }`}
                                />
                                {errors.initialTds && (
                                    <span className="text-red-500 text-sm mt-1">{errors.initialTds}</span>
                                )}
                            </div>

                            {/* Corrected TDS */}
                            <div className="flex flex-col">
                                <label className="mb-1 font-medium text-gray-700">
                                    Corrected TDS (ppm) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    name="correctedTds"
                                    value={formData.correctedTds}
                                    onChange={handleChange}
                                    className={`px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:outline-none transition ${errors.correctedTds ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'
                                        }`}
                                />
                                {errors.correctedTds && (
                                    <span className="text-red-500 text-sm mt-1">{errors.correctedTds}</span>
                                )}
                            </div>

                            {/* Presence of Pests */}
                            <div className="flex flex-col">
                                <label className="mb-1 font-medium text-gray-700">
                                    Presence of Pests <span className="text-red-500">*</span>
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

                            {/* Nutrient Deficiency */}
                            <div className="flex flex-col">
                                <label className="mb-1 font-medium text-gray-700">
                                    Nutrient Deficiency <span className="text-red-500">*</span>
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

                                {formData.nutrientDeficiency === "yes" && (
                                    <div className="mt-3">
                                        <input
                                            type="text"
                                            name="deficiencyDetails"
                                            value={formData.deficiencyDetails}
                                            onChange={handleChange}
                                            placeholder="Specify deficiency"
                                            className={`px-3 py-2 border rounded-lg w-full shadow-sm focus:ring-2 focus:outline-none transition ${errors.deficiencyDetails ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'
                                                }`}
                                        />
                                        {errors.deficiencyDetails && (
                                            <span className="text-red-500 text-sm mt-1">{errors.deficiencyDetails}</span>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Which Pests */}
                            {formData.pestsPresent === "yes" && (
                                <div className="flex flex-col">
                                    <label className="mb-1 font-medium text-gray-700">
                                        Which Pests? <span className="text-red-500">*</span>
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
                                                className={`px-3 py-2 border rounded-lg w-full shadow-sm focus:ring-2 focus:outline-none transition ${errors.pestOther ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'
                                                    }`}
                                            />
                                            {errors.pestOther && (
                                                <span className="text-red-500 text-sm mt-1">{errors.pestOther}</span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Plant Problems */}
                            <div className="flex flex-col">
                                <label className="mb-1 font-medium text-gray-700">
                                    Plant Problems <span className="text-red-500">*</span>
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
                                    State which crops <span className="text-red-500">*</span>
                                </label>

                                <input
                                    type="text"
                                    name="cropNames"
                                    value={formData.cropNames}
                                    onChange={handleChange}
                                    placeholder="Enter crop names (e.g., Lettuce, Tomato, Basil)"
                                    className={`px-3 py-2 border rounded-lg w-full shadow-sm focus:ring-2 focus:outline-none transition ${errors.cropNames ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'
                                        }`}
                                />
                                {errors.cropNames && (
                                    <span className="text-red-500 text-sm mt-1">{errors.cropNames}</span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ========================= STEP 3 ========================= */}
                    {step === 3 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-6 py-6">
                            {/* How & When to Harvest */}
                            <div className="flex flex-col">
                                <label className="mb-1 font-medium text-gray-700">
                                    How & When to Harvest <span className="text-red-500">*</span>
                                </label>
                                <div className="flex gap-6 mt-2">
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            name="harvestTraining"
                                            value="yes"
                                            checked={formData.harvestTraining === "yes"}
                                            onChange={handleChange}
                                        />
                                        YES
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            name="harvestTraining"
                                            value="no"
                                            checked={formData.harvestTraining === "no"}
                                            onChange={handleChange}
                                        />
                                        NO
                                    </label>
                                </div>
                                {errors.harvestTraining && (
                                    <span className="text-red-500 text-sm mt-1">{errors.harvestTraining}</span>
                                )}
                            </div>

                            {/* Pest Management */}
                            <div className="flex flex-col">
                                <label className="mb-1 font-medium text-gray-700">
                                    Pest Management <span className="text-red-500">*</span>
                                </label>
                                <div className="flex gap-6 mt-2">
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            name="pestManagement"
                                            value="yes"
                                            checked={formData.pestManagement === "yes"}
                                            onChange={handleChange}
                                        />
                                        YES
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            name="pestManagement"
                                            value="no"
                                            checked={formData.pestManagement === "no"}
                                            onChange={handleChange}
                                        />
                                        NO
                                    </label>
                                </div>
                                {errors.pestManagement && (
                                    <span className="text-red-500 text-sm mt-1">{errors.pestManagement}</span>
                                )}
                            </div>

                            {/* Equipment Cleaning */}
                            <div className="flex flex-col">
                                <label className="mb-1 font-medium text-gray-700">
                                    Equipment Cleaning <span className="text-red-500">*</span>
                                </label>
                                <div className="flex gap-6 mt-2">
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            name="equipmentCleaning"
                                            value="yes"
                                            checked={formData.equipmentCleaning === "yes"}
                                            onChange={handleChange}
                                        />
                                        YES
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            name="equipmentCleaning"
                                            value="no"
                                            checked={formData.equipmentCleaning === "no"}
                                            onChange={handleChange}
                                        />
                                        NO
                                    </label>
                                </div>
                                {errors.equipmentCleaning && (
                                    <span className="text-red-500 text-sm mt-1">{errors.equipmentCleaning}</span>
                                )}
                            </div>

                            {/* Plant Maintenance */}
                            <div className="flex flex-col">
                                <label className="mb-1 font-medium text-gray-700">
                                    Plant Maintenance <span className="text-red-500">*</span>
                                </label>
                                <div className="flex gap-6 mt-2">
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            name="plantMaintenance"
                                            value="yes"
                                            checked={formData.plantMaintenance === "yes"}
                                            onChange={handleChange}
                                        />
                                        YES
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            name="plantMaintenance"
                                            value="no"
                                            checked={formData.plantMaintenance === "no"}
                                            onChange={handleChange}
                                        />
                                        NO
                                    </label>
                                </div>
                                {errors.plantMaintenance && (
                                    <span className="text-red-500 text-sm mt-1">{errors.plantMaintenance}</span>
                                )}
                            </div>

                            {/* Scopes of Improvement */}
                            <div className="flex flex-col md:col-span-2">
                                <label className="mb-1 font-medium text-gray-700">
                                    Scopes of Improvement <span className="text-red-500">*</span>
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
                        </div>
                    )}

                    {/* ========================= STEP 4 ========================= */}
                    {step === 4 && (
                        <div className="space-y-6 px-6 py-6 max-w-full overflow-x-hidden">
                            {/* Materials Supplied */}
                            <div className="flex flex-col">
                                <label className="mb-1 font-medium text-gray-700">
                                    Materials Supplied <span className="text-red-500">*</span>
                                </label>

                                <Select
                                    isMulti
                                    options={plantOptions}
                                    value={formData.plants}
                                    onChange={(selected) => {
                                        setFormData({
                                            ...formData,
                                            plants: selected || [],
                                        });
                                    }}
                                    classNamePrefix="react-select"
                                    placeholder="Select materials..."
                                    styles={{ menu: (p) => ({ ...p, zIndex: 9999 }) }}
                                />

                                {errors.plants && (
                                    <span className="text-red-500 text-sm mt-1">{errors.plants}</span>
                                )}

                                {/* Show input if Others selected */}
                                {formData.plants?.some((item) => item.value === "Others") && (
                                    <div className="mt-3">
                                        <input
                                            type="text"
                                            name="materialsOtherInput"
                                            value={formData.materialsOtherInput || ""}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    materialsOtherInput: e.target.value,
                                                })
                                            }
                                            placeholder="Specify other material"
                                            className={`px-3 py-2 border rounded-lg w-full shadow-sm focus:ring-2 focus:outline-none transition ${errors.materialsOtherInput
                                                ? "border-red-500 focus:ring-red-400"
                                                : "border-gray-300 focus:ring-blue-400"
                                                }`}
                                        />

                                        {errors.materialsOtherInput && (
                                            <span className="text-red-500 text-sm mt-1">
                                                {errors.materialsOtherInput}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>


                            {/* Initial Row for Nutrients, Tank Capacity, and Number of Top-ups */}
                            <div key="initial-row" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                {/* Nutrients */}
                                <div className="flex flex-col">
                                    <label className="mb-1 font-medium text-gray-700">
                                        Nutrients <span className="text-red-500">*</span>
                                    </label>
                                    <Select
                                        options={nutrientOptions}
                                        value={nutrientOptions.find(opt => opt.value === formData.nutrientsData[0]?.nutrients)}
                                        onChange={(selected) => handleDynamicFieldChange(0, 'nutrients', selected?.value || '')}
                                        classNamePrefix="react-select"
                                        placeholder="Select nutrient type..."
                                    />
                                    {errors.nutrientsData && errors.nutrientsData[0]?.nutrients && (
                                        <span className="text-red-500 text-sm mt-1">{errors.nutrientsData[0]?.nutrients}</span>
                                    )}
                                </div>

                                {/* Tank Capacity */}
                                <div className="flex flex-col">
                                    <label className="mb-1 font-medium text-gray-700">
                                        Tank Capacity <span className="text-red-500">*</span>
                                    </label>
                                    <Select
                                        options={tankCapacityOptions}
                                        value={tankCapacityOptions.find(opt => opt.value === formData.nutrientsData[0]?.tankCapacity)}
                                        onChange={(selected) => handleDynamicFieldChange(0, 'tankCapacity', selected?.value || '')}
                                        classNamePrefix="react-select"
                                        placeholder="Select tank capacity..."
                                    />
                                    {errors.nutrientsData && errors.nutrientsData[0]?.tankCapacity && (
                                        <span className="text-red-500 text-sm mt-1">{errors.nutrientsData[0]?.tankCapacity}</span>
                                    )}
                                </div>

                                {/* Number of Top-ups */}
                                <div className="flex flex-col">
                                    <label className="mb-1 font-medium text-gray-700">
                                        Number of Top-ups <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={formData.nutrientsData[0]?.numberOfTopups}
                                        onChange={(e) => handleDynamicFieldChange(0, 'numberOfTopups', e.target.value)}
                                        placeholder="Enter number of top-ups"
                                        className={`px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:outline-none transition ${errors.nutrientsData && errors.nutrientsData[0]?.numberOfTopups ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'} w-full`}
                                    />
                                    {errors.nutrientsData && errors.nutrientsData[0]?.numberOfTopups && (
                                        <span className="text-red-500 text-sm mt-1">{errors.nutrientsData[0]?.numberOfTopups}</span>
                                    )}
                                </div>
                            </div>

                            {/* Dynamic Fields for Additional Rows */}
                            {formData.nutrientsData.slice(1).map((field, index) => (
                                <div key={index + 1} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                    {/* Nutrients */}
                                    <div className="flex flex-col">
                                        <label className="mb-1 font-medium text-gray-700">
                                            Nutrients <span className="text-red-500">*</span>
                                        </label>
                                        <Select
                                            options={nutrientOptions}
                                            value={nutrientOptions.find(opt => opt.value === field.nutrients)}
                                            onChange={(selected) => handleDynamicFieldChange(index + 1, 'nutrients', selected?.value || '')}
                                            classNamePrefix="react-select"
                                            placeholder="Select nutrient type..."
                                        />
                                        {errors.nutrientsData && errors.nutrientsData[index + 1]?.nutrients && (
                                            <span className="text-red-500 text-sm mt-1">{errors.nutrientsData[index + 1]?.nutrients}</span>
                                        )}
                                    </div>

                                    {/* Tank Capacity */}
                                    <div className="flex flex-col">
                                        <label className="mb-1 font-medium text-gray-700">
                                            Tank Capacity <span className="text-red-500">*</span>
                                        </label>
                                        <Select
                                            options={tankCapacityOptions}
                                            value={tankCapacityOptions.find(opt => opt.value === field.tankCapacity)}
                                            onChange={(selected) => handleDynamicFieldChange(index + 1, 'tankCapacity', selected?.value || '')}
                                            classNamePrefix="react-select"
                                            placeholder="Select tank capacity..."
                                        />
                                        {errors.nutrientsData && errors.nutrientsData[index + 1]?.tankCapacity && (
                                            <span className="text-red-500 text-sm mt-1">{errors.nutrientsData[index + 1]?.tankCapacity}</span>
                                        )}
                                    </div>

                                    {/* Number of Top-ups */}
                                    <div className="flex flex-col">
                                        <label className="mb-1 font-medium text-gray-700">
                                            Number of Top-ups <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={field.numberOfTopups}
                                            onChange={(e) => handleDynamicFieldChange(index + 1, 'numberOfTopups', e.target.value)}
                                            placeholder="Enter number of top-ups"
                                            className={`px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:outline-none transition ${errors.nutrientsData && errors.nutrientsData[index + 1]?.numberOfTopups ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'} w-full`}
                                        />
                                        {errors.nutrientsData && errors.nutrientsData[index + 1]?.numberOfTopups && (
                                            <span className="text-red-500 text-sm mt-1">{errors.nutrientsData[index + 1]?.numberOfTopups}</span>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {/* Add More and Remove Row Buttons - Side by Side */}
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

                            {/* Neem Oil */}
                            <div className="flex flex-col">
                                <label className="mb-1 font-medium text-gray-700">
                                    Neem Oil <span className="text-red-500">*</span>
                                </label>
                                <div className="flex gap-6 mt-2">
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            name="neemOil"
                                            value="yes"
                                            checked={formData.neemOil === "yes"}
                                            onChange={handleChange}
                                        />
                                        YES
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            name="neemOil"
                                            value="no"
                                            checked={formData.neemOil === "no"}
                                            onChange={handleChange}
                                        />
                                        NO
                                    </label>
                                </div>
                                {errors.neemOil && (
                                    <span className="text-red-500 text-sm mt-1">{errors.neemOil}</span>
                                )}
                            </div>

                            {/* Chargeable Items */}
                            <div className="flex flex-col sm:flex-row space-x-0 sm:space-x-4 gap-4">
                                {/* Chargeable Items Supplied */}
                                <div className="flex-1">
                                    <label className="mb-1 font-medium text-gray-700">
                                        Chargeable Items Supplied <span className="text-red-500">*</span>
                                    </label>
                                    <Select
                                        isMulti
                                        options={changebleItemsOptions}
                                        value={formData.chargeableItemsSupplied}
                                        onChange={(selected) => {
                                            setFormData({
                                                ...formData,
                                                chargeableItemsSupplied: selected || [],
                                            });
                                        }}
                                        classNamePrefix="react-select"
                                        placeholder="Select items..."
                                        styles={{ menu: (p) => ({ ...p, zIndex: 9999 }) }}
                                    />
                                    {errors.chargeableItemsSupplied && (
                                        <span className="text-red-500 text-sm mt-1">{errors.chargeableItemsSupplied}</span>
                                    )}

                                    {/* Render the "Others" input field if "Others" is selected */}
                                    {formData.chargeableItemsSupplied?.some((item) => item.value === "Others") && (
                                        <div className="mt-3">
                                            <input
                                                type="text"
                                                name="changebleItemsOptionsother"
                                                value={formData.changebleItemsOptionsother || ""}
                                                onChange={handleChange}
                                                placeholder="Specify other item"
                                                className={`px-3 py-2 border rounded-lg w-full shadow-sm focus:ring-2 focus:outline-none transition ${errors.changebleItemsOptionsother ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'
                                                    }`}
                                            />
                                            {errors.changebleItemsOptionsother && (
                                                <span className="text-red-500 text-sm mt-1">
                                                    {errors.changebleItemsOptionsother}
                                                </span>
                                            )}
                                        </div>
                                    )}


                                    {/* Checkbox for "Material Needs to be delivered?" */}
                                    <div className="flex items-center mt-4">
                                        <input
                                            type="checkbox"
                                            name="materialNeedsDelivery"
                                            checked={formData.materialNeedsDelivery}
                                            onChange={(e) => setFormData({ ...formData, materialNeedsDelivery: e.target.checked })}
                                            className="h-4 w-4 text-[#9FC762] focus:ring-[#9FC762] border-gray-300 rounded"
                                        />
                                        <label className="ml-2 text-gray-700">
                                            Material Needs to be delivered?
                                        </label>
                                    </div>
                                </div>

                                {/* Photo of the Setup */}
                                <div className="flex-1">
                                    <label className="mb-1 font-medium text-gray-700">
                                        Photo of the Setup <span className="text-red-500">*</span>
                                    </label>

                                    {/* Photo Upload Input */}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        name="setupPhoto"
                                        multiple
                                        onChange={handlePhotoChange}
                                        className={`px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:outline-none transition ${errors.setupPhoto ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'} w-full`}
                                    />

                                    {/* Photo Preview */}
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

                                    {/* Error Message */}
                                    {errors.setupPhoto && (
                                        <span className="text-red-500 text-sm mt-1">{errors.setupPhoto}</span>
                                    )}
                                </div>
                            </div>

                        </div>
                    )}

                    {/* ========================= STEP 5 ========================== */}
                    {step === 5 && (
                        <div className="space-y-6 px-6 py-6 max-w-full overflow-x-hidden">
                            {/* Title */}
                            <h3 className="font-semibold text-lg text-gray-800">Delivery Details</h3>

                            {/* Materials Supplied */}
                            <div className="flex flex-col">
                                <label className="mb-1 font-medium text-gray-700">
                                    Materials Supplied <span className="text-red-500">*</span>
                                </label>

                                <Select
                                    isMulti
                                    options={plantOptions}
                                    value={formData.step5Plants}   // <-- step5 state
                                    onChange={(selected) => {
                                        setFormData({
                                            ...formData,
                                            step5Plants: selected || [],
                                        });
                                    }}
                                    classNamePrefix="react-select"
                                    placeholder="Select materials..."
                                    styles={{ menu: (p) => ({ ...p, zIndex: 9999 }) }}
                                />

                                {errors.plants && (
                                    <span className="text-red-500 text-sm mt-1">{errors.plants}</span>
                                )}

                                {/* Show input if Others selected */}
                                {formData.step5Plants?.some((item) => item.value === "Others") && (
                                    <div className="mt-3">
                                        <input
                                            type="text"
                                            name="step5MaterialsOtherInput"
                                            value={formData.step5MaterialsOtherInput || ""}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    step5MaterialsOtherInput: e.target.value,
                                                })
                                            }
                                            placeholder="Specify other material"
                                            className="px-3 py-2 border rounded-lg w-full shadow-sm focus:ring-2 focus:outline-none transition"
                                        />
                                    </div>
                                )}

                            </div>

                            {/* Initial Row for Nutrients, Tank Capacity, and Number of Top-ups */}
                            <div key="initial-row" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                {/* Nutrients */}
                                <div className="flex flex-col">
                                    <label className="mb-1 font-medium text-gray-700">
                                        Nutrients <span className="text-red-500">*</span>
                                    </label>
                                    <Select
                                        options={nutrientOptions}
                                        value={nutrientOptions.find(opt => opt.value === formData.step5DynamicFields[0]?.nutrients)}
                                        onChange={(selected) => handleStep5DynamicFieldChange(0, 'nutrients', selected?.value || '')}
                                        classNamePrefix="react-select"
                                        placeholder="Select nutrient type..."
                                    />
                                    {errors.step5DynamicFields && errors.step5DynamicFields[0]?.nutrients && (
                                        <span className="text-red-500 text-sm mt-1">{errors.step5DynamicFields[0]?.nutrients}</span>
                                    )}
                                </div>

                                {/* Tank Capacity */}
                                <div className="flex flex-col">
                                    <label className="mb-1 font-medium text-gray-700">
                                        Tank Capacity <span className="text-red-500">*</span>
                                    </label>
                                    <Select
                                        options={tankCapacityOptions}
                                        value={tankCapacityOptions.find(opt => opt.value === formData.step5DynamicFields[0]?.tankCapacity)}
                                        onChange={(selected) => handleStep5DynamicFieldChange(0, 'tankCapacity', selected?.value || '')}
                                        classNamePrefix="react-select"
                                        placeholder="Select tank capacity..."
                                    />
                                    {errors.step5DynamicFields && errors.step5DynamicFields[0]?.tankCapacity && (
                                        <span className="text-red-500 text-sm mt-1">{errors.step5DynamicFields[0]?.tankCapacity}</span>
                                    )}
                                </div>

                                {/* Number of Top-ups */}
                                <div className="flex flex-col">
                                    <label className="mb-1 font-medium text-gray-700">
                                        Number of Top-ups <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={formData.step5DynamicFields[0]?.numberOfTopups}
                                        onChange={(e) => handleStep5DynamicFieldChange(0, 'numberOfTopups', e.target.value)}
                                        placeholder="Enter number of top-ups"
                                        className={`px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:outline-none transition ${errors.step5DynamicFields && errors.step5DynamicFields[0]?.numberOfTopups ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'} w-full`}
                                    />
                                    {errors.step5DynamicFields && errors.step5DynamicFields[0]?.numberOfTopups && (
                                        <span className="text-red-500 text-sm mt-1">{errors.step5DynamicFields[0]?.numberOfTopups}</span>
                                    )}
                                </div>
                            </div>

                            {/* Dynamic Fields for Additional Rows */}
                            {formData.step5DynamicFields.slice(1).map((field, index) => (
                                <div key={index + 1} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                    {/* Nutrients */}
                                    <div className="flex flex-col">
                                        <label className="mb-1 font-medium text-gray-700">
                                            Nutrients <span className="text-red-500">*</span>
                                        </label>
                                        <Select
                                            options={nutrientOptions}
                                            value={nutrientOptions.find(opt => opt.value === field.nutrients)}
                                            onChange={(selected) => handleStep5DynamicFieldChange(index + 1, 'nutrients', selected?.value || '')}
                                            classNamePrefix="react-select"
                                            placeholder="Select nutrient type..."
                                        />
                                        {errors.step5DynamicFields && errors.step5DynamicFields[index + 1]?.nutrients && (
                                            <span className="text-red-500 text-sm mt-1">{errors.step5DynamicFields[index + 1]?.nutrients}</span>
                                        )}
                                    </div>

                                    {/* Tank Capacity */}
                                    <div className="flex flex-col">
                                        <label className="mb-1 font-medium text-gray-700">
                                            Tank Capacity <span className="text-red-500">*</span>
                                        </label>
                                        <Select
                                            options={tankCapacityOptions}
                                            value={tankCapacityOptions.find(opt => opt.value === field.tankCapacity)}
                                            onChange={(selected) => handleStep5DynamicFieldChange(index + 1, 'tankCapacity', selected?.value || '')}
                                            classNamePrefix="react-select"
                                            placeholder="Select tank capacity..."
                                        />
                                        {errors.step5DynamicFields && errors.step5DynamicFields[index + 1]?.tankCapacity && (
                                            <span className="text-red-500 text-sm mt-1">{errors.step5DynamicFields[index + 1]?.tankCapacity}</span>
                                        )}
                                    </div>

                                    {/* Number of Top-ups */}
                                    <div className="flex flex-col">
                                        <label className="mb-1 font-medium text-gray-700">
                                            Number of Top-ups <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={field.numberOfTopups}
                                            onChange={(e) => handleStep5DynamicFieldChange(index + 1, 'numberOfTopups', e.target.value)}
                                            placeholder="Enter number of top-ups"
                                            className={`px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:outline-none transition ${errors.step5DynamicFields && errors.step5DynamicFields[index + 1]?.numberOfTopups ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'} w-full`}
                                        />
                                        {errors.step5DynamicFields && errors.step5DynamicFields[index + 1]?.numberOfTopups && (
                                            <span className="text-red-500 text-sm mt-1">{errors.step5DynamicFields[index + 1]?.numberOfTopups}</span>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {/* Add More and Remove Row Buttons - Side by Side */}
                            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 mt-4">
                                {formData.step5DynamicFields.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeStep5DynamicRow(formData.step5DynamicFields.length - 1)}
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
                                    Neem Oil <span className="text-red-500">*</span>
                                </label>
                                <div className="flex gap-6 mt-2">
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            name="step5NeemOil"
                                            value="yes"
                                            checked={formData.step5NeemOil === "yes"}
                                            onChange={handleStep5Change}
                                        />
                                        YES
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            name="step5NeemOil"
                                            value="no"
                                            checked={formData.step5NeemOil === "no"}
                                            onChange={handleStep5Change}
                                        />
                                        NO
                                    </label>
                                </div>
                                {errors.step5NeemOil && (
                                    <span className="text-red-500 text-sm mt-1">{errors.step5NeemOil}</span>
                                )}
                            </div>
                            {/* Chargeable Items */}
                            <div className="flex flex-col">
                                <label className="mb-1 font-medium text-gray-700">
                                    Chargeable Items Supplied <span className="text-red-500">*</span>
                                </label>
                                <Select
                                    isMulti
                                    options={changebleItemsOptions}
                                    value={formData.step5ChargeableItemsSupplied}
                                    onChange={(selected) => {
                                        setFormData({
                                            ...formData,
                                            step5ChargeableItemsSupplied: selected || [],
                                        });
                                    }}
                                    classNamePrefix="react-select"
                                    placeholder="Select items..."
                                    styles={{ menu: (p) => ({ ...p, zIndex: 9999 }) }}
                                />
                                {errors.step5ChargeableItemsSupplied && (
                                    <span className="text-red-500 text-sm mt-1">{errors.step5ChargeableItemsSupplied}</span>
                                )}

                                {/* Render the "Others" input field if "Others" is selected */}
                                {formData.step5ChargeableItemsSupplied?.some((item) => item.value === "Others") && (
                                    <div className="mt-3">
                                        <input
                                            type="text"
                                            name="step5ChangebleItemsOptionsother"
                                            value={formData.step5ChangebleItemsOptionsother || ""}
                                            onChange={handleStep5Change}
                                            placeholder="Specify other item"
                                            className={`px-3 py-2 border rounded-lg w-full shadow-sm focus:ring-2 focus:outline-none transition ${errors.step5ChangebleItemsOptionsother ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'
                                                }`}
                                        />
                                        {errors.step5ChangebleItemsOptionsother && (
                                            <span className="text-red-500 text-sm mt-1">
                                                {errors.step5ChangebleItemsOptionsother}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* BUTTONS */}
                    <div className="mt-6 px-6">
                        <div className="flex flex-col md:flex-row justify-end w-full gap-3">
                            {/* Previous Button */}
                            {step > 1 && (
                                <button
                                    type="button"
                                    onClick={prevStep}
                                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium px-6 py-2 rounded-lg w-full md:w-auto transition"
                                >
                                    Previous
                                </button>
                            )}

                            {/* Conditional Next/Submit Button */}
                            <button
                                type="button"
                                onClick={handleNext}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-lg w-full md:w-auto transition"
                            >
                                {step === 4 && formData.materialNeedsDelivery ? "Next"
                                    : step === 5 ? "Submit"
                                        : step < 4 ? "Next"
                                            : "Submit"
                                }
                            </button>

                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}