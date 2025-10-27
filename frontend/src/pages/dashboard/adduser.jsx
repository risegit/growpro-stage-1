import React, { useState } from 'react';

export default function AddUserForm() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        bankName: '',
        accountNumber: '',
        ifscNo: '',
        profilePic: null,
        state: '',
        city: '',
        pincode: '',
        streetAddress: '',
        role: ''
    });

    const [cities, setCities] = useState([]);
    const [errors, setErrors] = useState({});

    const statesAndCities = {
        Maharashtra: ['Mumbai', 'Pune', 'Nagpur', 'Nashik'],
        Karnataka: ['Bengaluru', 'Mysore', 'Mangalore'],
        Gujarat: ['Ahmedabad', 'Surat', 'Vadodara'],
        Delhi: ['New Delhi', 'Central Delhi', 'South Delhi', 'North Delhi'],
        'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Salem']
    };

    const handleStateChange = (e) => {
        const selectedState = e.target.value;
        setFormData({ ...formData, state: selectedState, city: '' });
        setCities(statesAndCities[selectedState] || []);
        if (errors.state) {
            setErrors({ ...errors, state: '' });
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }
    };

    const handleAccountNumberChange = (e) => {
        const value = e.target.value.replace(/\D/g, '');
        if (value.length <= 18) {
            setFormData(prev => ({ ...prev, accountNumber: value }));
            if (errors.accountNumber) {
                setErrors({ ...errors, accountNumber: '' });
            }
        }
    };

    const handleIFSCChange = (e) => {
        const value = e.target.value.toUpperCase();
        if (value.length <= 11) {
            setFormData(prev => ({ ...prev, ifscNo: value }));
            if (errors.ifscNo) {
                setErrors({ ...errors, ifscNo: '' });
            }
        }
    };

    const handlePincodeChange = (e) => {
        const value = e.target.value.replace(/\D/g, '');
        if (value.length <= 6) {
            setFormData(prev => ({ ...prev, pincode: value }));
            if (errors.pincode) {
                setErrors({ ...errors, pincode: '' });
            }
        }
    };

    const handleFileChange = (e) => {
        setFormData(prev => ({
            ...prev,
            profilePic: e.target.files[0]
        }));
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
        if (!formData.phone.trim()) {
            newErrors.phone = 'Phone number is required';
        } else if (!/^\d{10}$/.test(formData.phone.trim())) {
            newErrors.phone = 'Phone number must be 10 digits';
        }

        if (!formData.role) newErrors.role = 'Role is required';

        // Only validate bank details if role is manager or technician
        if (['manager', 'technician'].includes(formData.role)) {
            if (!formData.aadhaarNo.trim()) newErrors.aadhaarNo = 'Aadhaar number is required';
            else if (!/^\d{12}$/.test(formData.aadhaarNo.trim())) newErrors.aadhaarNo = 'Aadhaar number must be 12 digits';
            if (!formData.bankName.trim()) newErrors.bankName = 'Bank name is required';
            if (!formData.accountNumber) newErrors.accountNumber = 'Account number is required';
            else if (formData.accountNumber.length < 9 || formData.accountNumber.length > 18) {
                newErrors.accountNumber = 'Account number must be between 9 and 18 digits';
            }
            if (!formData.ifscNo) newErrors.ifscNo = 'IFSC code is required';
            else if (formData.ifscNo.length !== 11) {
                newErrors.ifscNo = 'IFSC code must be exactly 11 characters';
            } else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.ifscNo)) {
                newErrors.ifscNo = 'Invalid IFSC code format';
            }
        }

        if (!formData.state) newErrors.state = 'State is required';
        if (!formData.city) newErrors.city = 'City is required';
        if (!formData.pincode) newErrors.pincode = 'Pincode is required';
        else if (formData.pincode.length !== 6) {
            newErrors.pincode = 'Pincode must be exactly 6 digits';
        }
        if (!formData.streetAddress.trim()) newErrors.streetAddress = 'Street address is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        try {
            const form = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                if (value !== null) { // Skip null values if needed (like profilePic initially)
                    form.append(key, value);
                }
            });

            if (formData.profilePic) {
                form.append('profilePic', formData.profilePic);
            }

            const response = await fetch('http://localhost/growpro/growpro-stage-1/backend/api/user.php', {
                method: 'POST',
                body: form, // automatically sets Content-Type to multipart/form-data
            });

            const result = await response.json();
            alert('Done');
            if (result.success) {
                alert('User added successfully!\n' + JSON.stringify(result.data, null, 2));

                setFormData({
                    name: '',
                    email: '',
                    phone: '',
                    bankName: '',
                    accountNumber: '',
                    ifscNo: '',
                    profilePic: null,
                    state: '',
                    city: '',
                    pincode: '',
                    streetAddress: '',
                    role: ''
                });
                setCities([]);
                setErrors({});
            } else {
                alert(result.message || 'Failed to add user');
            }

        } catch (error) {
            console.error('Error submitting form:', error);
            alert('Something went wrong!');
        }
    };


    return (
        <div className="w-full min-h-screen bg-gray-100 mt-10">
            <div className="mx-auto bg-white rounded-2xl shadow-xl p-6">
                <div className="px-6 py-4 border-b">
                    <h1 className="text-2xl font-bold mb-6 text-gray-800">Add a User(उपयोगकर्ता जोड़ें)</h1>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-6 py-6">
                    {/* Role */}
                    <div className="flex flex-col">
                        <label className="mb-1 font-medium text-gray-700">
                            Role(भूमिका`) <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="role"
                            value={formData.role}
                            onChange={handleInputChange}
                            className={`px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:outline-none transition ${errors.role ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'}`}
                        >
                            <option value="">Select role</option>
                            <option value="admin">Admin</option>
                            <option value="manager">Manager</option>
                            <option value="technician">Technician</option>
                        </select>
                        {errors.role && <span className="text-red-500 text-sm mt-1">{errors.role}</span>}
                    </div>

                    {/* Name */}
                    <div className="flex flex-col">
                        <label className="mb-1 font-medium text-gray-700">
                            Name (नाम)<span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="Enter name"
                            className={`px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:outline-none transition ${errors.name ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'}`}
                        />
                        {errors.name && <span className="text-red-500 text-sm mt-1">{errors.name}</span>}
                    </div>

                    {/* Email */}
                    <div className="flex flex-col">
                        <label className="mb-1 font-medium text-gray-700">
                            Email(ई-मेल) <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="Enter email"
                            className={`px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:outline-none transition ${errors.email ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'}`}
                        />
                        {errors.email && <span className="text-red-500 text-sm mt-1">{errors.email}</span>}
                    </div>

                    {/* Phone Number */}
                    <div className="flex flex-col">
                        <label className="mb-1 font-medium text-gray-700">
                            Phone Number(फ़ोन नंबर) <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="Enter phone number"
                            className={`px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:outline-none transition ${errors.phone ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'}`}
                        />
                        {errors.phone && <span className="text-red-500 text-sm mt-1">{errors.phone}</span>}
                    </div>


                    {/* State, City, Pincode */}
                    <div className="flex flex-wrap gap-4 md:col-span-2">
                        <div className="flex-1 flex flex-col">
                            <label className="mb-1 font-medium text-gray-700">
                                State(राज्य) <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="state"
                                value={formData.state}
                                onChange={handleStateChange}
                                className={`px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:outline-none transition ${errors.state ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'}`}
                            >
                                <option value="">Select state</option>
                                {Object.keys(statesAndCities).map((state) => (
                                    <option key={state} value={state}>
                                        {state}
                                    </option>
                                ))}
                            </select>
                            {errors.state && <span className="text-red-500 text-sm mt-1">{errors.state}</span>}
                        </div>
                        <div className="flex-1 flex flex-col">
                            <label className="mb-1 font-medium text-gray-700">
                                City(शहर) <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="city"
                                value={formData.city}
                                onChange={handleInputChange}
                                className={`px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:outline-none transition ${errors.city ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'}`}
                                disabled={!cities.length}
                            >
                                <option value="">Select city</option>
                                {cities.map((city) => (
                                    <option key={city} value={city}>
                                        {city}
                                    </option>
                                ))}
                            </select>
                            {errors.city && <span className="text-red-500 text-sm mt-1">{errors.city}</span>}
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-4 md:col-span-2">
                        <div className="flex-1 flex flex-col">
                            <label className="mb-1 font-medium text-gray-700">
                                Pincode(पिनकोड) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="pincode"
                                value={formData.pincode}
                                onChange={handlePincodeChange}
                                placeholder="Enter pincode"
                                maxLength="6"
                                className={`px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:outline-none transition ${errors.pincode ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'}`}
                            />
                            {errors.pincode && <span className="text-red-500 text-sm mt-1">{errors.pincode}</span>}
                        </div>

                        {/* Profile Pic */}
                        <div className="flex-1 flex flex-col">
                            <label className="mb-1 font-medium text-gray-700">Profile Pic(प्रोफ़ाइल चित्र)</label>
                            {/* <input
                            type="file"
                            name="profilePic"
                            onChange={handleFileChange}
                            accept="image/*"
                            className={`px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:outline-none transition border-gray-300 focus:ring-blue-400`}
                            
                        /> */}
                            <input
                                type="file"
                                name="profilePic"
                                onChange={(e) => setFormData({ ...formData, profilePic: e.target.files[0] })}
                                className={`px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:outline-none transition ${errors.profilePic ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'}`}
                            />
                        </div>

                    </div>

                    {/* Street Address */}
                    <div className="flex flex-col md:col-span-2">
                        <label className="mb-1 font-medium text-gray-700">
                            Street Address(सड़क पता) <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            name="streetAddress"
                            value={formData.streetAddress}
                            onChange={handleInputChange}
                            placeholder="Enter address"
                            rows={3}
                            className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:outline-none transition ${errors.streetAddress ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'}`}
                        />
                        {errors.streetAddress && <span className="text-red-500 text-sm mt-1">{errors.streetAddress}</span>}
                    </div>



                    {/* Bank Name */}
                    {/* Show Bank Details only for Manager or Technician */}
                    {['manager', 'technician'].includes(formData.role) && (
                        <>
                            <div className="flex flex-col">
                                <label className="mb-1 font-medium text-gray-700">
                                    Aadhaar No <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="aadhaarNo"
                                    value={formData.aadhaarNo}
                                    onChange={handleInputChange}
                                    placeholder="Enter Aadhaar number"
                                    maxLength="12"
                                    className={`px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:outline-none transition ${errors.aadhaarNo ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'
                                        }`}
                                />
                                {errors.aadhaarNo && <span className="text-red-500 text-sm mt-1">{errors.aadhaarNo}</span>}
                            </div>

                            {/* Bank Name */}
                            <div className="flex flex-col">
                                <label className="mb-1 font-medium text-gray-700">
                                    Bank Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="bankName"
                                    value={formData.bankName}
                                    onChange={handleInputChange}
                                    placeholder="Enter bank name"
                                    className={`px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:outline-none transition ${errors.bankName ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'}`}
                                />
                                {errors.bankName && <span className="text-red-500 text-sm mt-1">{errors.bankName}</span>}
                            </div>

                            {/* Account Number */}
                            <div className="flex flex-col">
                                <label className="mb-1 font-medium text-gray-700">
                                    Account Number <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="accountNumber"
                                    value={formData.accountNumber}
                                    onChange={handleAccountNumberChange}
                                    placeholder="Enter account number"
                                    maxLength="18"
                                    className={`px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:outline-none transition ${errors.accountNumber ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'}`}
                                />
                                {errors.accountNumber && <span className="text-red-500 text-sm mt-1">{errors.accountNumber}</span>}
                            </div>

                            {/* IFSC No */}
                            <div className="flex flex-col">
                                <label className="mb-1 font-medium text-gray-700">
                                    IFSC No <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="ifscNo"
                                    value={formData.ifscNo}
                                    onChange={handleIFSCChange}
                                    placeholder="Enter IFSC code"
                                    maxLength="11"
                                    className={`px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:outline-none transition ${errors.ifscNo ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'}`}
                                />
                                {errors.ifscNo && <span className="text-red-500 text-sm mt-1">{errors.ifscNo}</span>}
                            </div>
                        </>
                    )}


                </div>
                {/* Submit Button */}
                <div className="flex justify-end px-6 py-4 ">
                    <button
                        onClick={handleSubmit}
                        className="px-6 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                    >
                        Submit(जमा करें)
                    </button>
                </div>
            </div>
        </div>
    );
}