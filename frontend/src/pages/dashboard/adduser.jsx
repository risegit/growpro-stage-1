import React, { useState, useEffect, useRef } from 'react';
import { toast } from "react-toastify";

export default function AddUserForm() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        bankName: '',
        accountNumber: '',
        ifscNo: '',
        profilePic: null,
        state: '',
        locality: '',
        landmark: '',
        city: '',
        pincode: '',
        streetAddress: '',
        role: '',
        aadhaarNo: ''
    });
    const [showCopied, setShowCopied] = useState(false);
    const [cities, setCities] = useState([]);
    const [errors, setErrors] = useState({});
    const [checking, setChecking] = useState(false);
    const fileInputRef = useRef(null);

    const [previewImage, setPreviewImage] = useState(null);




    const statesAndCities = {
        Maharashtra: ['Mumbai', 'Pune', 'Nagpur', 'Nashik'],
        Karnataka: ['Bengaluru', 'Mysore', 'Mangalore'],
        Gujarat: ['Ahmedabad', 'Surat', 'Vadodara'],
        Delhi: ['New Delhi', 'Central Delhi', 'South Delhi', 'North Delhi'],
        'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Salem']
    };

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
          if (formData.email && formData.email.includes("@")) {
            checkEmailExists(formData.email);
          }
        }, 600); // Wait 600ms after typing stops
    
        return () => clearTimeout(delayDebounce);
      }, [formData.email]);
    
      // 👇 Function to check email existence in backend
      const checkEmailExists = async (email) => {
        setChecking(true);
        try {
          const res = await fetch(`${import.meta.env.VITE_API_URL}api/user.php?email=${encodeURIComponent(email)}`);
          const data = await res.json();
    
          if (data.status === "error") {
            // toast.error(data.message);
            setErrors((prev) => ({
              ...prev,
              email: "An account with this email already exists. Please use a different email.",
            }));
          }
        } catch (error) {
          console.error("Error checking email:", error);
        } finally {
          setChecking(false);
        }
    };

    // Generate random alphanumeric password
    const generatePassword = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$';
        let password = '';
        for (let i = 0; i < 10; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setFormData(prev => ({ ...prev, password }));
        if (errors.password) setErrors({ ...errors, password: '' });
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

    // const handleFileChange = (e) => {
    //     setFormData(prev => ({
    //         ...prev,
    //         profilePic: e.target.files[0]
    //     }));
    // };


    const handleFileChange = (e) => {
        const file = e.target.files[0];

        // Keep your existing logic
        setFormData(prev => ({
            ...prev,
            profilePic: file,
        }));

        // Add image preview logic
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setPreviewImage(imageUrl);
        }
    };

    useEffect(() => {
        return () => {
            if (previewImage) URL.revokeObjectURL(previewImage);
        };
    }, [previewImage]);


    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
        if (!formData.password.trim()) newErrors.password = 'Password is required';
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

            if (!formData.locality.trim()) newErrors.locality = 'Locality is required';
            if (!formData.landmark.trim()) newErrors.landmark = 'Landmark is required';

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
                if (value !== null) form.append(key, value);
            });

            const response = await fetch(`${import.meta.env.VITE_API_URL}api/user.php`, {
                method: 'POST',
                body: form,
            });

            const result = await response.json();
            // alert(`result1 = ${result.message}`);
            if (result.status == 'success') {
                toast.success(result.message);
                setFormData({
                    name: '',
                    email: '',
                    password: '',
                    phone: '',
                    bankName: '',
                    accountNumber: '',
                    ifscNo: '',
                    profilePic: null,
                    locality: '',
                    landmark: '',
                    state: '',
                    city: '',
                    pincode: '',
                    streetAddress: '',
                    role: '',
                    aadhaarNo: ''
                });
                setCities([]);
                setErrors({});
                if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                }

            } else {
                toast.error(result.message || 'Failed to add user');
            }

        } catch (error) {
            // console.error('Error submitting form:', error);
            toast.error('Something went wrong!');
        }
    };

    return (
        <div className="w-full min-h-screen bg-gray-100 mt-10">
            <div className="mx-auto bg-white rounded-2xl shadow-xl p-6">
                <div className="px-6 py-4 border-b">
                    <h1 className="text-2xl font-bold mb-6 text-gray-800">Add a Employee (कर्मचारी जोड़ें)</h1>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-6 py-6 [&_input]:h-[42px] [&_select]:h-[42px]">
                    {/* Row 1: Role & Name */}
                    <div className="flex flex-col">
                        <label className="mb-1 font-medium text-gray-700">Role (भूमिका) <span className="text-red-500">*</span></label>
                        <select
                            name="role"
                            value={formData.role}
                            onChange={handleInputChange}
                            className={`px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none transition ${errors.role ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'}`}
                        >
                            <option value="" disabled>Select role</option>
                            <option value="admin">Admin</option>
                            <option value="manager">Manager</option>
                            <option value="technician">Technician</option>
                        </select>
                        {errors.role && <span className="text-red-500 text-sm mt-1">{errors.role}</span>}
                    </div>

                    <div className="flex flex-col">
                        <label className="mb-1 font-medium text-gray-700">Name (नाम) <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="Enter name"
                            className={`px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none transition ${errors.name ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'}`}
                        />
                        {errors.name && <span className="text-red-500 text-sm mt-1">{errors.name}</span>}
                    </div>

                    {/* Row 2: Email & Password */}
                    <div className="flex flex-col">
                        <label className="mb-1 font-medium text-gray-700">Email (ई-मेल) <span className="text-red-500">*</span></label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="Enter email"
                            className={`px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none transition ${errors.email ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'}`}
                        />
                        {checking && <span className="text-gray-400 text-sm mt-1">Checking email availability...</span>}
                        {errors.email && <span className="text-red-500 text-sm mt-1">{errors.email}</span>}
                    </div>

                    <div className="flex flex-col relative">
                        <label className="mb-1 font-medium text-gray-700">Password (पासवर्ड) <span className="text-red-500">*</span></label>
                        <div className="flex gap-2">
                            <div className="flex-1 relative">
                                <input
                                    type="text"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    placeholder="Enter password"
                                    className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:outline-none transition ${errors.password ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'}`}
                                />
                                {formData.password && (
                                    <>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                navigator.clipboard.writeText(formData.password);
                                                setShowCopied(true);
                                                setTimeout(() => setShowCopied(false), 2000);
                                            }}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-500 hover:text-blue-500 transition"
                                            title="Copy password"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                            </svg>
                                        </button>
                                        {showCopied && (
                                            <div className="absolute -top-10 right-0 bg-gray-800 text-white text-xs px-3 py-1.5 rounded shadow-lg animate-fade-in">
                                                Copied to clipboard!
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={generatePassword}
                                className="btn-primary "
                            >
                                Generate
                            </button>
                        </div>
                        {errors.password && <span className="text-red-500 text-sm mt-1">{errors.password}</span>}
                    </div>

                    {/* Row 3: Phone & Profile Pic */}
                    <div className="flex flex-col">
                        <label className="mb-1 font-medium text-gray-700">Phone Number (फ़ोन नंबर) <span className="text-red-500">*</span></label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="Enter phone number"
                            className={`px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none transition ${errors.phone ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'}`}
                        />
                        {errors.phone && <span className="text-red-500 text-sm mt-1">{errors.phone}</span>}
                    </div>

                    <div className="flex flex-col items-start">
                        <label className="mb-1 font-medium text-gray-700">
                            Profile Photo (प्रोफ़ाइल चित्र)
                        </label>
                        {/* Image preview ABOVE input */}
                        {previewImage && (
                            <div className="mb-3">
                                <img
                                    src={previewImage}
                                    alt="Profile preview"
                                    className="w-20 h-20 object-cover rounded-full border"
                                />
                            </div>
                        )}

                        <input
                            type="file"
                            name="profilePic"
                            accept="image/*"
                            onChange={handleFileChange}
                            ref={fileInputRef}
                            className="px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none border-gray-300 focus:ring-blue-400"
                        />
                    </div>
                    {/* Row 4: State, City, Locality, Landmark, Pincode */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:col-span-2">
                        <div className="flex flex-col">
                            <label className="mb-1 font-medium text-gray-700">State (राज्य) <span className="text-red-500">*</span></label>
                            <select
                                name="state"
                                value={formData.state}
                                onChange={handleStateChange}
                                className={`px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none transition ${errors.state ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'
                                    }`}
                            >
                                <option value="" disabled>Select state</option>
                                {Object.keys(statesAndCities).map((state) => (
                                    <option key={state} value={state}>{state}</option>
                                ))}
                            </select>
                            {errors.state && <span className="text-red-500 text-sm mt-1">{errors.state}</span>}
                        </div>

                        <div className="flex flex-col">
                            <label className="mb-1 font-medium text-gray-700">City (शहर) <span className="text-red-500">*</span></label>
                            <select
                                name="city"
                                value={formData.city}
                                onChange={handleInputChange}
                                disabled={!cities.length}
                                className={`px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none transition ${errors.city ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'
                                    }`}
                            >
                                <option value="" disabled>Select city</option>
                                {cities.map((city) => (
                                    <option key={city} value={city}>{city}</option>
                                ))}
                            </select>
                            {errors.city && <span className="text-red-500 text-sm mt-1">{errors.city}</span>}
                        </div>

                        <div className="flex flex-col">
                            <label className="mb-1 font-medium text-gray-700">Locality (स्थानीयता) <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                name="locality"
                                value={formData.locality}
                                onChange={handleInputChange}
                                placeholder="Ex- Andheri"
                                className={`px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none transition ${errors.locality ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'
                                    }`}
                            />
                            {errors.locality && <span className="text-red-500 text-sm mt-1">{errors.locality}</span>}
                        </div>

                        <div className="flex flex-col">
                            <label className="mb-1 font-medium text-gray-700">Landmark (सीमाचिह्न) <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                name="landmark"
                                value={formData.landmark}
                                onChange={handleInputChange}
                                placeholder="Ex - Near City Mall"
                                className={`px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none transition ${errors.landmark ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'
                                    }`}
                            />
                            {errors.landmark && <span className="text-red-500 text-sm mt-1">{errors.landmark}</span>}
                        </div>

                        <div className="flex flex-col">
                            <label className="mb-1 font-medium text-gray-700">Pincode (पिनकोड) <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                name="pincode"
                                value={formData.pincode}
                                onChange={handlePincodeChange}
                                placeholder="Enter pincode"
                                maxLength="6"
                                className={`px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none transition ${errors.pincode ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'
                                    }`}
                            />
                            {errors.pincode && <span className="text-red-500 text-sm mt-1">{errors.pincode}</span>}
                        </div>
                    </div>


                    {/* Address */}
                    <div className="flex flex-col md:col-span-2">
                        <label className="mb-1 font-medium text-gray-700">Address (पता) <span className="text-red-500">*</span></label>
                        <textarea
                            name="streetAddress"
                            value={formData.streetAddress}
                            onChange={handleInputChange}
                            placeholder="Enter address"
                            rows={3}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none transition ${errors.streetAddress ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'}`}
                        />
                        {errors.streetAddress && <span className="text-red-500 text-sm mt-1">{errors.streetAddress}</span>}
                    </div>

                    {/* Manager / Technician Extra Fields */}
                    {['manager', 'technician'].includes(formData.role) && (
                        <>
                            <div className="flex flex-col">
                                <label className="mb-1 font-medium text-gray-700">Aadhaar No <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    name="aadhaarNo"
                                    value={formData.aadhaarNo}
                                    onChange={handleInputChange}
                                    maxLength="12"
                                    placeholder="Enter Aadhaar number"
                                    className={`px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none transition ${errors.aadhaarNo ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'}`}
                                />
                                {errors.aadhaarNo && <span className="text-red-500 text-sm mt-1">{errors.aadhaarNo}</span>}
                            </div>

                            <div className="flex flex-col">
                                <label className="mb-1 font-medium text-gray-700">Bank Name <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    name="bankName"
                                    value={formData.bankName}
                                    onChange={handleInputChange}
                                    placeholder="Enter bank name"
                                    className={`px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none transition ${errors.bankName ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'}`}
                                />
                                {errors.bankName && <span className="text-red-500 text-sm mt-1">{errors.bankName}</span>}
                            </div>

                            <div className="flex flex-col">
                                <label className="mb-1 font-medium text-gray-700">Account Number <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    name="accountNumber"
                                    value={formData.accountNumber}
                                    onChange={handleAccountNumberChange}
                                    placeholder="Enter account number"
                                    maxLength="18"
                                    className={`px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none transition ${errors.accountNumber ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'}`}
                                />
                                {errors.accountNumber && <span className="text-red-500 text-sm mt-1">{errors.accountNumber}</span>}
                            </div>

                            <div className="flex flex-col">
                                <label className="mb-1 font-medium text-gray-700">IFSC No <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    name="ifscNo"
                                    value={formData.ifscNo}
                                    onChange={handleIFSCChange}
                                    placeholder="Enter IFSC code"
                                    maxLength="11"
                                    className={`px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none transition ${errors.ifscNo ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'}`}
                                />
                                {errors.ifscNo && <span className="text-red-500 text-sm mt-1">{errors.ifscNo}</span>}
                            </div>
                        </>
                    )}
                </div>

                {/* Submit Button */}
                <div className="flex justify-end px-6 py-4">
                    <button
                        onClick={handleSubmit}
                        className="btn-primary "
                    >
                        Submit (जमा करें)
                    </button>
                </div>
            </div>
        </div>
    );
}
