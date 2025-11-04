import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function EditUserForm() {
  const { id } = useParams(); 

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    aadhaarNo: '',
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

  const [showCopied, setShowCopied] = useState(false);
  const [cities, setCities] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const statesAndCities = {
    Maharashtra: ['Mumbai', 'Pune', 'Nagpur', 'Nashik'],
    Karnataka: ['Bengaluru', 'Mysore', 'Mangalore'],
    Gujarat: ['Ahmedabad', 'Surat', 'Vadodara'],
    Delhi: ['New Delhi', 'Central Delhi', 'South Delhi', 'North Delhi'],
    'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Salem']
  };

  // 🟢 Fetch user details when component loads
  useEffect(() => {
    const fetchUser = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}api/user.php?id=${id}`);
        const data = await response.json();

        console.log("Fetched user data:", data);

        if (data.status === "success" && data.data){
          const user = data.data;

          setFormData({
            name: user.name || '',
            email: user.email || '',
            password: '',
            phone: user.phone || '',
            aadhaarNo: user.aadhaar_no || '',
            bankName: user.bank_name || '',
            accountNumber: user.acc_no || '',
            ifscNo: user.IFSC_code || '',
            state: user.state || '',
            city: user.city || '',
            pincode: user.pincode || '',
            streetAddress: user.street_address || '',
            role: user.role || '',
            profilePic: user.profile_pic ? `${import.meta.env.VITE_API_URL}/uploads/users/${user.profile_pic}` : ''
          });

          if (user.state && statesAndCities[user.state]) {
            setCities(statesAndCities[user.state]);
          }
        } else {
          alert('User not found!');
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        alert('Failed to fetch user details!');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  // 🟡 Input handlers
  const handleStateChange = (e) => {
    const selectedState = e.target.value;
    setFormData({ ...formData, state: selectedState, city: '' });
    setCities(statesAndCities[selectedState] || []);
    if (errors.state) setErrors({ ...errors, state: '' });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors({ ...errors, [name]: '' });
  };

  const handleAccountNumberChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 18) {
      setFormData(prev => ({ ...prev, accountNumber: value }));
      if (errors.accountNumber) setErrors({ ...errors, accountNumber: '' });
    }
  };

  const handleIFSCChange = (e) => {
    const value = e.target.value.toUpperCase();
    if (value.length <= 11) {
      setFormData(prev => ({ ...prev, ifscNo: value }));
      if (errors.ifscNo) setErrors({ ...errors, ifscNo: '' });
    }
  };

  const handlePincodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 6) {
      setFormData(prev => ({ ...prev, pincode: value }));
      if (errors.pincode) setErrors({ ...errors, pincode: '' });
    }
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({ ...prev, profilePic: e.target.files[0] }));
  };

  const generatePassword = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$';
        let password = '';
        for (let i = 0; i < 10; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setFormData(prev => ({ ...prev, password }));
        if (errors.password) setErrors({ ...errors, password: '' });
  };

  // 🔵 Validation
  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email';
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    else if (!/^\d{10}$/.test(formData.phone)) newErrors.phone = 'Phone must be 10 digits';
    if (!formData.role) newErrors.role = 'Role is required';

    if (['manager', 'technician'].includes(formData.role)) {
      if (!formData.aadhaarNo.trim()) newErrors.aadhaarNo = 'Aadhaar required';
      else if (!/^\d{12}$/.test(formData.aadhaarNo.trim())) newErrors.aadhaarNo = 'Must be 12 digits';
      if (!formData.bankName.trim()) newErrors.bankName = 'Bank name required';
      if (!formData.accountNumber) newErrors.accountNumber = 'Account number required';
      else if (formData.accountNumber.length < 9 || formData.accountNumber.length > 18)
        newErrors.accountNumber = 'Must be 9-18 digits';
      if (!formData.ifscNo) newErrors.ifscNo = 'IFSC required';
      else if (formData.ifscNo.length !== 11)
        newErrors.ifscNo = 'Must be 11 characters';
      else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.ifscNo))
        newErrors.ifscNo = 'Invalid IFSC format';
    }

    if (!formData.state) newErrors.state = 'State required';
    if (!formData.city) newErrors.city = 'City required';
    if (!formData.pincode) newErrors.pincode = 'Pincode required';
    else if (formData.pincode.length !== 6) newErrors.pincode = 'Must be 6 digits';
    if (!formData.streetAddress.trim()) newErrors.streetAddress = 'Address required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 🟢 Submit handler
  const handleSubmit = async () => {
    if (!validateForm()) return;
    try {
      const form = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null) form.append(key, value);
      });
      form.append('id', id);
      form.append('_method', 'PUT');

    //   console.log("Form data entries:");
    //   for (let [key, value] of form.entries()) {
    //     console.log(key, ":", value);
    //   }


      const response = await fetch(`${import.meta.env.VITE_API_URL}api/user.php?id=${id}`, {
        method: 'POST',
        body: form,
      });

      const result = await response.json();
    //   console.log("Updated fields:", result.data);

      if (result.status) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
        // alert(result.message || 'Failed to update user');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Something went wrong!');
    }
  };

  // 🧩 UI Rendering
  return (
        <div className="w-full min-h-screen bg-gray-100 mt-10">
            <div className="mx-auto bg-white rounded-2xl shadow-xl p-6">
                <div className="px-6 py-4 border-b">
                    <h1 className="text-2xl font-bold mb-6 text-gray-800">Edit an User </h1>
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
                            type="hidden"
                            name="_method"
                            value="PUT"
                            className={`px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:outline-none transition ${errors.name ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'}`}
                        />
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
                                className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                            >
                                Generate
                            </button>
                        </div>
                        {errors.password && <span className="text-red-500 text-sm mt-1">{errors.password}</span>}
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
                        {formData.profilePic && typeof formData.profilePic === "string" && (
                            <img
                                src={formData.profilePic}
                                alt="Profile"
                                className="w-24 h-24 object-cover rounded-full mb-2 border"
                            />
                            )}

                    <div className="flex-1 flex flex-col">
                        <label className="mb-1 font-medium text-gray-700">Profile Pic(प्रोफ़ाइल चित्र)</label>
                        <input
                            type="file"
                            name="profilePic"
                            onChange={handleFileChange}
                            accept="image/*"
                            className={`px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:outline-none transition border-gray-300 focus:ring-blue-400`}
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
                            className={`px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:outline-none transition ${
                                errors.aadhaarNo ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'
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
