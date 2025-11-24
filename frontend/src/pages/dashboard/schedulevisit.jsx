import React, { useState } from "react";

export default function CustomerVisitForm() {
    const [formData, setFormData] = useState({
        customerName: "",
        technician: "",
        visitDate: "",
        visitTime: "",
    });

    const [errors, setErrors] = useState({});
    const [submitted, setSubmitted] = useState(false);

    const customers = ["John Doe", "Nimish", "Akash", "Rohan"];
    const technicians = ["Technician 1", "Technician 2", "Technician 3"];

    const visitTimeOptions = ["Morning (8:00 am - 11:00 am)", "Afternoon (11:00 am - 3:00 pm)", "Evening (3 pm - 6 pm)", "Night (6 pm -9 pm)"];
 
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        setErrors({ ...errors, [name]: "" });
    };

    const validateForm = () => {
        let newErrors = {};

        if (!formData.customerName) newErrors.customerName = "Customer name is required.";
        if (!formData.technician) newErrors.technician = "Technician selection is required.";
        if (!formData.visitDate) newErrors.visitDate = "Visit date is required.";
        if (!formData.visitTime) newErrors.visitTime = "Visit time is required.";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        console.log("Final Form Data:", formData);

        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 2500);
    };

    return (
        <form onSubmit={handleSubmit}>
              <div className="w-full min-h-screen bg-gray-100 mt-10">
            <div className="mx-auto bg-white rounded-2xl shadow-xl p-6">
                <div className="px-6 py-4 border-b">
                    <h1 className="text-2xl font-bold mb-6 text-gray-800">Edit an User</h1>
                </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-6 py-6 [&_input]:h-[42px] [&_select]:h-[42px]">

                {/* Customer Name */}
                <div className="flex flex-col">
                    <label className="mb-1 font-medium text-gray-700">
                        Customer Name <span className="text-red-500">*</span>
                    </label>
                    <select
                        name="customerName"
                        value={formData.customerName}
                        onChange={handleInputChange}
                        className={`px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:outline-none transition 
                        ${errors.customerName ? "border-red-500 focus:ring-red-400" : "border-gray-300 focus:ring-blue-400"}`}
                    >
                        <option value="" disabled>Select customer</option>
                        {customers.map((c) => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                    {errors.customerName && <span className="text-red-500 text-sm mt-1">{errors.customerName}</span>}
                </div>

                {/* Technician */}
                <div className="flex flex-col">
                    <label className="mb-1 font-medium text-gray-700">
                        Assign Technician <span className="text-red-500">*</span>
                    </label>
                    <select
                        name="technician"
                        value={formData.technician}
                        onChange={handleInputChange}
                        className={`px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:outline-none transition 
                        ${errors.technician ? "border-red-500 focus:ring-red-400" : "border-gray-300 focus:ring-blue-400"}`}
                    >
                        <option value="" disabled>Select technician</option>
                        {technicians.map((t) => (
                            <option key={t} value={t}>{t}</option>
                        ))}
                    </select>
                    {errors.technician && <span className="text-red-500 text-sm mt-1">{errors.technician}</span>}
                </div>

                {/* Visit Date */}
                <div className="flex flex-col">
                    <label className="mb-1 font-medium text-gray-700">
                        Visit Date <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="date"
                        name="visitDate"
                        value={formData.visitDate}
                        onChange={handleInputChange}
                        min={new Date().toISOString().split("T")[0]}
                        className={`px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:outline-none transition 
                        ${errors.visitDate ? "border-red-500 focus:ring-red-400" : "border-gray-300 focus:ring-blue-400"}`}
                    />
                    {errors.visitDate && <span className="text-red-500 text-sm mt-1">{errors.visitDate}</span>}
                </div>

                {/* Visit Time */}
                <div className="flex flex-col">
                    <label className="mb-1 font-medium text-gray-700">
                        Visit Time <span className="text-red-500">*</span>
                    </label>
                    <select
                        name="visitTime"
                        value={formData.visitTime}
                        onChange={handleInputChange}
                        className={`px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:outline-none transition 
                        ${errors.visitTime ? "border-red-500 focus:ring-red-400" : "border-gray-300 focus:ring-blue-400"}`}
                    >
                        <option value="" disabled>Select time slot</option>
                        {visitTimeOptions.map((time) => (
                            <option key={time} value={time}>{time}</option>
                        ))}
                    </select>
                    {errors.visitTime && <span className="text-red-500 text-sm mt-1">{errors.visitTime}</span>}
                </div>

            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-end px-4 py-4 border-t">
                <button
                    type="submit"
                    className="btn-primary"
                >
                    Submit
                </button>

                {submitted && (
                    <p className="btn-primary">
                        Form submitted successfully!
                    </p>
                )}
            </div></div>
            </div>
        </form>
    );
}
