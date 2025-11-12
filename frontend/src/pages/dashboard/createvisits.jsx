import React, { useState } from "react";

export default function CreateVisitsForm() {
    const [formData, setFormData] = useState({
        clientName: "",
        visitDate: "",
        visitedBy: "",
    });

    const [errors, setErrors] = useState({});
    const [searchQuery, setSearchQuery] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);

    // Sample visitor names - replace with your actual data or API call
    const visitorNames = [
        "Nimish",
        "Dilip",
        "Rahul",
        "Aditya",
        "Chandani",
    ];

    // Filtered visitors for search
    const filteredVisitors = visitorNames.filter((name) =>
        name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
        if (errors[name]) {
            setErrors({ ...errors, [name]: "" });
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.clientName.trim()) newErrors.clientName = "Client name is required";
        if (!formData.visitDate) newErrors.visitDate = "Date of visit is required";
        if (!formData.visitedBy.trim()) newErrors.visitedBy = "Visited by field is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (validateForm()) {
            console.log("Form submitted:", formData);
            alert("Visit created successfully!");
            setFormData({
                clientName: "",
                visitDate: "",
                visitedBy: "",
            });
            setSearchQuery("");
        }
    };

    return (
        <div className="w-full min-h-screen bg-gray-100 mt-10">
            <div className="mx-auto bg-white rounded-2xl shadow-xl p-6">
                <div className="px-6 py-4 border-b">
                    <h2 className="text-2xl font-semibold text-gray-800">
                    Create Visits (विज़िट बनाएं)
                    </h2>
        </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-6 py-6">
                {/* CLIENT NAME FIELD (TEXT INPUT) */}
                <div className="flex flex-col">
                    <label className="mb-1 font-medium text-gray-700">
                        Client Name (ग्राहक का नाम) <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="clientName"
                        value={formData.clientName}
                        onChange={handleInputChange}
                        placeholder="Enter client name"
                        className={`px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:outline-none transition ${errors.clientName
                                ? "border-red-500 focus:ring-red-400"
                                : "border-gray-300 focus:ring-blue-400"
                            }`}
                    />
                    {errors.clientName && (
                        <span className="text-red-500 text-sm mt-1">
                            {errors.clientName}
                        </span>
                    )}
                </div>

                {/* DATE FIELD */}
                <div className="flex flex-col">
                    <label className="mb-1 font-medium text-gray-700">
                        Date of Visit (विज़िट की तारीख) <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="date"
                        name="visitDate"
                        value={formData.visitDate}
                        onChange={handleInputChange}
                        className={`px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:outline-none transition ${errors.visitDate
                                ? "border-red-500 focus:ring-red-400"
                                : "border-gray-300 focus:ring-blue-400"
                            }`}
                    />
                    {errors.visitDate && (
                        <span className="text-red-500 text-sm mt-1">
                            {errors.visitDate}
                        </span>
                    )}
                </div>

                {/* SEARCHABLE DROPDOWN FOR VISITED BY */}
                <div className="flex flex-col md:col-span-2 relative">
                    <label className="mb-1 font-medium text-gray-700">
                        Visited by (द्वारा विज़िट किया गया){" "}
                        <span className="text-red-500">*</span>
                    </label>

                    <input
                        type="text"
                        name="visitedBy"
                        value={searchQuery || formData.visitedBy}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setShowDropdown(true);
                        }}
                        onFocus={() => setShowDropdown(true)}
                        placeholder="Search or select visitor"
                        className={`px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:outline-none transition ${errors.visitedBy
                                ? "border-red-500 focus:ring-red-400"
                                : "border-gray-300 focus:ring-blue-400"
                            }`}
                    />

                    {showDropdown && filteredVisitors.length > 0 && (
                        <ul className="absolute top-full mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto z-10">
                            {filteredVisitors.map((name) => (
                                <li
                                    key={name}
                                    onClick={() => {
                                        setFormData({ ...formData, visitedBy: name });
                                        setSearchQuery(name);
                                        setShowDropdown(false);
                                        if (errors.visitedBy) setErrors({ ...errors, visitedBy: "" });
                                    }}
                                    className="px-4 py-2 hover:bg-blue-100 cursor-pointer transition"
                                >
                                    {name}
                                </li>
                            ))}
                        </ul>
                    )}

                    {errors.visitedBy && (
                        <span className="text-red-500 text-sm mt-1">
                            {errors.visitedBy}
                        </span>
                    )}
                </div>
            </div>

            <div className="px-6 py-4 flex justify-end">
                <button
                    onClick={handleSubmit}
                    className="btn-primary"
                >
                    Submit (जमा करें)
                </button>
            </div>
        </div>
        </div>
    );
}
