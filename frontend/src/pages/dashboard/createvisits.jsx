import React, { useState } from "react";
import Select from "react-select";

export default function ObservationForm({ onSubmit = (data) => console.log(data) }) {
    const [step, setStep] = useState(1);

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

    const plantProblemOptions = [
        { label: "Light Deficiency", value: "Light Deficiency" },
        { label: "Improper Maintenance", value: "Improper Maintenance" },
        { label: "Overgrown crops", value: "Overgrown crops" },
        { label: "Improper Harvesting", value: "Improper Harvesting" },
        { label: "Bolting", value: "Bolting" }
    ];

    /* ----------------------- HANDLE INPUT CHANGE ----------------------- */
    const handleChange = (e) => {
        const { name, value } = e.target;
        let updated = { ...formData, [name]: value };

        // Auto-clear issue fields (step 1)
        if (name === "timerWorking" && value === "yes") updated.timerIssue = "";
        if (name === "motorWorking" && value === "yes") updated.motorIssue = "";
        if (name === "lightsWorking" && value === "yes") updated.lightsIssue = "";

        if (name === "equipmentDamaged" && value === "no")
            updated.equipmentDamageDetails = "";

        // Auto-clear pests  
        if (name === "pestsPresent" && value === "no") {
            updated.pestTypes = [];
            updated.pestOther = "";
        }

        // Auto-clear deficiency
        if (name === "nutrientDeficiency" && value === "no")
            updated.deficiencyDetails = "";

        setFormData(updated);
        setErrors({ ...errors, [name]: "" });
    };

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

        if (!formData.pestsPresent)
            newErrors.pestsPresent = "Required";

        if (formData.pestsPresent === "yes") {
            if (!formData.pestTypes || formData.pestTypes.length === 0) {
                newErrors.pestTypes = "Select at least one";
            }

            const othersSelected = formData.pestTypes?.some(
                (p) => p.value === "Others"
            );

            if (othersSelected && !formData.pestOther?.trim()) {
                newErrors.pestOther = "Specify other pest";
            }
        }

        if (!formData.nutrientDeficiency)
            newErrors.nutrientDeficiency = "Required";

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

    /* ----------------------- NEXT / SUBMIT ----------------------- */
   const handleNext = () => {
    if (step === 1 && validateStep1()) {
        setStep(2);
    } else if (step === 2 && validateStep2()) {
        setStep(3);
    } else if (step === 3 && validateStep3()) {
        // only submit if step 3 is valid
        onSubmit(formData);
    }
};





    const prevStep = () => setStep(1);

    /* ----------------------- UI COMPONENTS ----------------------- */

    const SmallInput = ({ name, placeholder }) => (
        <input
            type="text"
            name={name}
            value={formData[name]}
            onChange={handleChange}
            placeholder={placeholder}
            className={`px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:outline-none transition border-gray-300 focus:ring-blue-400 ${errors[name] ? "border-red-500" : "border-gray-300"
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

    /* ----------------------- STEPPER HEADER ----------------------- */
    const StepperHeader = () => (
        <div className="flex overflow-x-auto md:overflow-visible space-x-4 md:space-x-0 justify-between mb-8 pl-4 md:pl-0 pt-3">
            {[1, 2, 3].map((stepNum, idx) => (
                <div key={stepNum} className="flex-1 flex flex-col items-center min-w-[70px] relative">
                    {idx !== 0 && (
                        <div className="absolute left-0 top-5 w-full h-1 bg-gray-200 -z-10"></div>
                    )}
                    <div className={`w-10 h-10 flex items-center justify-center rounded-full text-white font-semibold transition-all duration-300 ${step === stepNum ? 'bg-blue-600 scale-110 shadow-lg' : 'bg-gray-300'}`}>
                        {stepNum}
                    </div>
                    <div className="text-xs mt-2 text-gray-700 font-medium text-center">
                        {stepNum === 1 ? 'Visual Observations' : stepNum === 2 ? 'Technical Observations' : 'Client Training'}
                    </div>
                </div>
            ))}

        </div>
    );

    /* ================================================================= */
    /* ==========================  RETURN UI =========================== */
    /* ================================================================= */

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
                                    <span className="text-red-500 text-sm mt-1">
                                        {errors.clientName}
                                    </span>
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
                                    className={`px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:outline-none transition ${errors.initialPh ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'}`}
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
                                    className={`px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:outline-none transition ${errors.correctedPh ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'}`}
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
                                    className={`px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:outline-none transition ${errors.initialTds ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'}`}
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
                                    className={`px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:outline-none transition ${errors.correctedTds ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'}`}
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

                                {/* Move Nutrient Deficiency Input below the label in the same column */}
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

                                    {/* Other pest input */}
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
                                    className={`px-3 py-2 border rounded-lg w-full shadow-sm focus:ring-2 focus:outline-none transition ${errors.cropNames ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'}`}
                                />
                                {errors.cropNames && (
                                    <span className="text-red-500 text-sm mt-1">{errors.cropNames}</span>
                                )}
                            </div>

                        </div>
                    )}


                    {step === 3 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-6 py-6">
                            {/* Heading */}
                            {/* <h2 className="text-xl font-bold col-span-2 mb-4">Client Training</h2> */}

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
                                    className={`px-3 py-2 border rounded-lg w-full shadow-sm focus:ring-2 focus:outline-none transition ${errors.scopesOfImprovement ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'}`}
                                />
                                {errors.scopesOfImprovement && (
                                    <span className="text-red-500 text-sm mt-1">{errors.scopesOfImprovement}</span>
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
                                onClick={handleNext}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-lg w-full md:w-auto transition"
                            >
                                {step < 3 ? "Next" : "Submit"}
                            </button>

                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

// px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:outline-none transition border-gray-300 focus:ring-blue-400