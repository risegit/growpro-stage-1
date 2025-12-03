import React, { useState, useEffect } from "react";
import Select from "react-select";
import { toast } from "react-toastify";

const user = JSON.parse(localStorage.getItem("user"));
const user_id = user?.id;

export default function CustomerVisitForm() {
    const [formData, setFormData] = useState({
        amc_id: null,
        technicians: null,
        visitDate: "",
        visitTime: "",
    });

    const [errors, setErrors] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [amc_id, setCustomers] = useState([]);
    const [technicians, setTechnician] = useState([]);
    const [loadingCustomers, setLoadingCustomers] = useState(false);
    const [loadingtechnicians, setLoadingtechnicians] = useState(false);
    const [loading, setLoading] = useState(false);

    // const customers = ["John Doe", "Nimish", "Akash", "Rohan"];
    // const technicians = ["Technician 1", "Technician 2", "Technician 3"];

    const visitTimeOptions = ["Morning (8:00 am - 11:00 am)", "Afternoon (11:00 am - 3:00 pm)", "Evening (3:00 pm - 6:00 pm)", "Night (6:00 pm - 9:00 pm)"];
 
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        setErrors({ ...errors, [name]: "" });
    };

    const validateForm = () => {
        let newErrors = {};

        if (!formData.amc_id) newErrors.amc_id = "Customer name is required.";
        if (!formData.technicians) newErrors.technicians = "Technician selection is required.";
        if (!formData.visitDate) newErrors.visitDate = "Visit date is required.";
        if (!formData.visitTime) newErrors.visitTime = "Visit time is required.";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    useEffect(() => {
        let mounted = true;
        const loadCustomers = async () => {
            setLoadingCustomers(true);
            setLoadingtechnicians(true);
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}api/schedule-site-visit.php?status=active`);
                if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
                const data = await res.json();
                const opts = Array.isArray(data.data)
                    ? data.data.map((c) => ({
                        value: c.amc_id,
                        label: `${c.name} - ${c.phone} - ${c.amc_free_paid} Visits`,
                    }))
                    : [];

                    const opts1 = Array.isArray(data.technician)
                    ? data.technician.map((c) => ({
                        value: c.id,
                        label: `${c.name} - ${c.user_code}`,
                    }))
                    : [];

                    // console.log("Fetched Customers:", opts);
                    console.log("Fetched Customers:", opts1);
                if (mounted) {
                    setCustomers(opts);
                    setTechnician(opts1);
                }

            } catch (err) {
                console.error('Error loading customers:', err);
            } finally {
                if (mounted) setLoadingCustomers(false);setLoadingtechnicians(false);
            }
        };

        loadCustomers();
        return () => {
            mounted = false;
        };
    }, []);
    

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setLoading(true); // 🔥 Start loading (disable button + change label)

        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
    
            const form = new FormData();

            Object.entries(formData).forEach(([key, value]) => {
                if (value !== null) {
                    form.append(key, typeof value === "object" ? value.value : value);
                }
            });

            console.log("Submitting form data...");
            for (let pair of form.entries()) {
                console.log(pair[0] + ": ", pair[1]);
            }

            const response = await fetch(`${import.meta.env.VITE_API_URL}api/schedule-site-visit.php?id=${user_id}`, {
                method: 'POST',
                body: form,
            });

            const result = await response.json();

            if (result.status == 'success') {
                toast.success(result.message);

                // setFormData({
                //     name: '',
                //     email: '',
                //     password: '',
                //     phone: '',
                //     bankName: '',
                //     accountNumber: '',
                //     ifscNo: '',
                //     profilePic: null,
                //     locality: '',
                //     landmark: '',
                //     state: '',
                //     city: '',
                //     pincode: '',
                //     streetAddress: '',
                //     role: '',
                //     aadhaarNo: ''
                // });
                setErrors({});

            } else {
                toast.error(result.message || 'Failed to add user');
            }

        } catch (error) {
            toast.error('Something went wrong!');
        } finally {
            setLoading(false);  // 🔥 Stop loading
        }
    };

    return (
        // <form onSubmit={handleSubmit}>
              <div className="w-full min-h-screen bg-gray-100 mt-10">
            <div className="mx-auto bg-white rounded-2xl shadow-xl p-6">
                <div className="px-6 py-4 border-b">
                    <h1 className="text-2xl font-bold mb-6 text-gray-800">Schedule Visit</h1>
                </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-6 py-6 [&_input]:h-[42px] [&_select]:h-[42px]">

                {/* Customer Name */}
                <div className="flex flex-col">
                    <label className="mb-1 font-medium text-gray-700">
                        Customer Name <span className="text-red-500">*</span>
                    </label>
                    <Select
                        options={amc_id}
                        value={formData.amc_id}
                        isClearable
                        isLoading={loadingCustomers}
                        placeholder={loadingCustomers ? 'Loading customers...' : 'Select customer...'}
                        classNamePrefix="react-select"
                        styles={{ menu: (provided) => ({ ...provided, zIndex: 9999 }) }}
                        onChange={(selectedOption) => {
                            setFormData((prev) => ({
                                ...prev,
                                amc_id: selectedOption,
                            }));

                            setErrors((prev) => ({
                                ...prev,
                                amc_id: "",   // ✅ Clear error here
                            }));
                        }}

                    
                    />
                    {errors.customers && (
                        <span className="text-red-500 text-sm mt-1">{errors.customers}</span>
                    )}
                </div>

                {/* Technician */}
                <div className="flex flex-col">
                    <label className="mb-1 font-medium text-gray-700">
                        Assign Technician <span className="text-red-500">*</span>
                    </label>
                    <Select
                        options={technicians}
                        value={formData.technicians}
                        isClearable
                        isLoading={loadingtechnicians}
                        placeholder={loadingtechnicians ? 'Loading technicians...' : 'Select customer...'}
                        classNamePrefix="react-select"
                        styles={{ menu: (provided) => ({ ...provided, zIndex: 9999 }) }}
                        onChange={(selectedOption) => {
                            setFormData((prev) => ({
                                ...prev,
                                technicians: selectedOption,
                            }));

                            setErrors((prev) => ({
                                ...prev,
                                technicians: "",   // ✅ Clear error
                            }));
                        }}

                    
                    />
                    {errors.technicians && (
                        <span className="text-red-500 text-sm mt-1">{errors.technicians}</span>
                    )}
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
            <div className="flex justify-end px-6 py-4">
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className={`btn-primary ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
                        >
                            {loading ? "Please wait..." : "Submit (जमा करें)"}
                        </button>

                </div>
            </div>
            </div>
        // </form>
    );
}
