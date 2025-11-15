import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { toast } from "react-toastify";

const StepperCustomerForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    staffPhoneNumber: '',
    profilePic: null,
    address: '',
    state: '',
    city: '',
    locality: '',
    landmark: '',
    pincode: '',
    isActive: true
  });
  const [checking, setChecking] = useState(false);
  const plantOptions = [
    { value: 'Spinach', label: 'Spinach' },
    { value: 'Methi', label: 'Methi' },
    { value: 'Coriander', label: 'Coriander' },
    { value: 'Red Amaranthus', label: 'Red Amaranthus' },
    { value: 'Radish Leaves', label: 'Radish Leaves' },
    { value: 'Mustard Leaves', label: 'Mustard Leaves' },
    { value: 'Mint', label: 'Mint' },
    { value: 'Peppermint', label: 'Peppermint' },
    { value: 'Italian Basil', label: 'Italian Basil' },
    { value: 'Thai Basil', label: 'Thai Basil' },
    { value: 'Lemon Basil', label: 'Lemon Basil' },
    { value: 'Celery', label: 'Celery' },
    { value: 'Parsley', label: 'Parsley' },
    { value: 'Ajwain', label: 'Ajwain' },
    { value: 'Oregano', label: 'Oregano' },
    { value: 'Thyme', label: 'Thyme' },
    { value: 'Rosemary', label: 'Rosemary' },
    { value: 'Sage', label: 'Sage' },
    { value: 'Iceberg Lettuce', label: 'Iceberg Lettuce' },
    { value: 'Lollo Rosso Lettuce', label: 'Lollo Rosso Lettuce' },
    { value: 'Romaine Lettuce', label: 'Romaine Lettuce' },
    { value: 'Butterhead Lettuce', label: 'Butterhead Lettuce' },
    { value: 'Curly Kale', label: 'Curly Kale' },
    { value: 'Rocket Arugula', label: 'Rocket Arugula' },
    { value: 'Pak Choi', label: 'Pak Choi' },
    { value: 'Endives', label: 'Endives' },
    { value: 'Red Sorrell', label: 'Red Sorrell' },
    { value: 'Desi Tomatoes', label: 'Desi Tomatoes' },
    { value: 'Cherry Tomatoes', label: 'Cherry Tomatoes' },
    { value: 'San Marzano Tomatoes', label: 'San Marzano Tomatoes' },
    { value: 'Chili', label: 'Chili' },
    { value: 'Bhindi', label: 'Bhindi' },
    { value: 'Dudhi', label: 'Dudhi' },
    { value: 'Zucchini', label: 'Zucchini' },
    { value: 'Brinjal', label: 'Brinjal' },
    { value: 'Jalapenos', label: 'Jalapenos' },
    { value: 'Cauliflower', label: 'Cauliflower' },
    { value: 'Cucumber', label: 'Cucumber' },
    { value: 'other', label: 'Other (Specify Below)' },
  ];


  const [errors, setErrors] = useState({});
  const [previews, setPreviews] = useState([]);
  const [profilePreview, setProfilePreview] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [growers, setGrowers] = useState([{
    systemType: '',
    systemTypeOther: '',
    numPlants: '',
    numLevels: '',
    setupDimension: '',
    motorType: '',
    motorTypeOther: '',
    timerUsed: '',
    timerUsedOther: '',
    numLights: "",
    modelOfLight: "",
    modelOfLightOther: "",
    lengthOfLight: "",
    lengthOfLightOther: "",
    tankCapacity: "",
    tankCapacityOther: "",
    nutritionGiven: "",
    otherSpecifications: "",
    photoAtInstallation: null
  }]);

  const systemTypes = ['Small Grower', 'Long Grower', 'Mini Pro Grower',
    'Semi Pro Grower', 'Pro Grower', 'Vertical Outdoor Grower', 'Flat Bed',
    'Indoor Grower', 'Furniture Integrated Grower', 'Mini Grower', 'Dutch Bucket',
    'Growbags', 'Microgreen Racks', 'Other'];
  const motorTypes = ['Small Motor (10W)', 'Big Motor (40W)', 'Other'];
  const timerOptions = ['Digital', 'Cyclic-15 mins', 'TS1W1', '800XC', 'Other'];
  const modelOfLight = ['Nx1.1', 'Nx4', 'Other'];
  const lengthOfLight = ['2ft', '3ft', '4ft', 'Other'];
  const tankCapacity = ['20L', '40L', '100L', '150L', '200L', 'Other'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };
  const handleFileChange = (e, index) => {
    const file = e.target.files[0];
    if (file) {
      // Update grower's photo
      const updatedGrowers = [...growers];
      updatedGrowers[index] = {
        ...updatedGrowers[index],
        photoAtInstallation: file
      };
      setGrowers(updatedGrowers);

      // Update preview
      const updatedPreviews = [...previews];
      updatedPreviews[index] = URL.createObjectURL(file);
      setPreviews(updatedPreviews);
    }
  };

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, profilePic: file }); // Update form data
      setProfilePreview(URL.createObjectURL(file)); // Set preview
    }
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
      const res = await fetch(`${import.meta.env.VITE_API_URL}api/customer.php?email=${encodeURIComponent(email)}`);
      const data = await res.json();

      if (data.status === "error") {
        // toast.error(data.message);
        setErrors((prev) => ({
          ...prev,
          email: "An account with this email already exists. Please use a different email.",
        }));
        // setTimeout(() => {
        //   setFormData((prev) => ({
        //     ...prev,
        //     email: "",
        //   }));
        // }, 2000);
      }
    } catch (error) {
      console.error("Error checking email:", error);
    } finally {
      setChecking(false);
    }
  };



  const handleGrowerChange = (index, e, customField, customValue) => {
    const updatedGrowers = [...growers];

    if (customField) {
      updatedGrowers[index][customField] = customValue;
      setGrowers(updatedGrowers);
      setErrors(prev => ({ ...prev, [`${customField}_${index}`]: '' }));
      return;
    }

    const { name, value } = e.target;
    updatedGrowers[index][name] = value;
    setGrowers(updatedGrowers);
    setErrors(prev => ({ ...prev, [`${name}_${index}`]: '' }));
  };


  const addGrower = () => {
    setGrowers([...growers, {
      systemType: '',
      systemTypeOther: '',
      numPlants: '',
      numLevels: '',
      setupDimension: '',
      motorType: '',
      motorTypeOther: '',
      timerUsed: '',
      timerUsedOther: '',
      numLights: "",
      modelOfLight: "",
      modelOfLightOther: "",
      lengthOfLight: "",
      lengthOfLightOther: "",
      tankCapacity: "",
      tankCapacityOther: "",
      nutritionGiven: "",
      otherSpecifications: "",
      photoAtInstallation: null,
      selectedPlants: [],
      selectedPlantsOther: '',
    }]);
  };

  const handlePlantSelectChange = (index, selectedOptions) => {
    const updatedGrowers = [...growers];
    updatedGrowers[index].selectedPlants = selectedOptions || [];

    // ✅ Check lowercase 'other'
    const hasOther = selectedOptions?.some((opt) => opt.value === "other");
    updatedGrowers[index].selectedPlantsOther = hasOther
      ? updatedGrowers[index].selectedPlantsOther || ""
      : "";

    setGrowers(updatedGrowers);
    setErrors((prev) => ({ ...prev, [`selectedPlants_${index}`]: "" }));
  };
  const removeGrower = () => {
    if (growers.length <= 1) return;
    setGrowers(growers.slice(0, -1));
  };

  const validateStep = () => {
    let stepErrors = {};

    if (currentStep === 1) {
      if (!formData.name.trim()) stepErrors.name = 'Name is required';
      if (!formData.email.trim()) stepErrors.email = 'Email is required';
      if (!formData.phoneNumber.trim()) stepErrors.phoneNumber = 'Phone number is required';
      else if (!/^\d{10}$/.test(formData.phoneNumber)) stepErrors.phoneNumber = 'Phone number must be 10 digits';
      if (formData.staffPhoneNumber && !/^\d{10}$/.test(formData.staffPhoneNumber)) {
        stepErrors.staffPhoneNumber = 'Staff phone number must be 10 digits';
      }
      if (!formData.state) stepErrors.state = 'State is required';
      if (!formData.city) stepErrors.city = 'City is required';
      if (!formData.locality.trim()) stepErrors.locality = 'Locality is required'; // ✅ new
      if (!formData.landmark.trim()) stepErrors.landmark = 'Landmark is required'; // ✅ new
      if (!formData.pincode.trim()) stepErrors.pincode = 'Pincode is required';
      else if (!/^\d{6}$/.test(formData.pincode)) stepErrors.pincode = 'Pincode must be exactly 6 digits';
      if (!formData.address.trim()) stepErrors.address = 'Street address is required';
    }



    if (currentStep === 2) {
      growers.forEach((grower, index) => {
        if (!grower.systemType) stepErrors[`systemType_${index}`] = 'System type is required';
        if (grower.systemType === 'Other' && !grower.systemTypeOther.trim()) stepErrors[`systemTypeOther_${index}`] = 'Please specify other system type';
        if (!grower.numPlants) stepErrors[`numPlants_${index}`] = 'Number of plants is required';
        else if (parseInt(grower.numPlants) < 0) stepErrors[`numPlants_${index}`] = 'Number of plants cannot be negative';
        if (!grower.numLevels) stepErrors[`numLevels_${index}`] = 'Number of levels is required';
        else if (parseInt(grower.numLevels) < 0) stepErrors[`numLevels_${index}`] = 'Number of levels cannot be negative';
        if (!grower.setupDimension.trim()) stepErrors[`setupDimension_${index}`] = 'Setup dimension is required';
        if (!grower.motorType) stepErrors[`motorType_${index}`] = 'Motor type is required';
        if (grower.motorType === 'Other' && !grower.motorTypeOther.trim()) stepErrors[`motorTypeOther_${index}`] = 'Please specify other motor type';
        if (!grower.timerUsed) stepErrors[`timerUsed_${index}`] = 'Timer used is required';
        if (grower.timerUsed === 'Other' && !grower.timerUsedOther.trim()) stepErrors[`timerUsedOther_${index}`] = 'Please specify other timer';
        if (!grower.modelOfLight) stepErrors[`modelOfLight_${index}`] = 'Model of Light is required';
        if (grower.modelOfLight === 'Other' && !grower.modelOfLightOther.trim()) stepErrors[`modelOfLightOther_${index}`] = 'Please specify other model of light';
        if (!grower.lengthOfLight) stepErrors[`lengthOfLight_${index}`] = 'Length of Light is required';
        if (grower.lengthOfLight === 'Other' && !grower.lengthOfLightOther.trim()) stepErrors[`lengthOfLightOther_${index}`] = 'Please specify other length of light';
        if (!grower.tankCapacity) stepErrors[`tankCapacity_${index}`] = 'Tank Capacity is required';
        if (grower.tankCapacity === 'Other' && !grower.tankCapacityOther.trim()) stepErrors[`tankCapacityOther_${index}`] = 'Please specify other tank capacity';
        if (!grower.nutritionGiven) stepErrors[`nutritionGiven_${index}`] = 'Nutrition Given is required';
        if (!grower.otherSpecifications) stepErrors[`otherSpecifications_${index}`] = 'Other Specification is required';
        if (!grower.photoAtInstallation) stepErrors[`photoAtInstallation_${index}`] = 'Photo At Installation is required';

        // ✅ Plant chosen validation
        if (!grower.selectedPlants || grower.selectedPlants.length === 0) {
          stepErrors[`selectedPlants_${index}`] = 'Select at least one plant';
        }

        const hasOtherSelected = grower.selectedPlants?.some(
          (p) => p.value === 'other'
        );

        if (hasOtherSelected && !grower.selectedPlantsOther.trim()) {
          stepErrors[`selectedPlantsOther_${index}`] =
            'Please specify other plant name';

        }
      });
    }


    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;

    const formPayload = new FormData();

    // Append main form fields
    Object.keys(formData).forEach((key) => {
      formPayload.append(key, formData[key]);
    });

    // Loop through growers
    growers.forEach((grower, index) => {
      // Clone grower and remove image from JSON object
      const growerData = { ...grower };
      const imageFile = growerData.photoAtInstallation;
      delete growerData.photoAtInstallation;

      // Add JSON grower data
      // formPayload.append(`growers[${index}]`, JSON.stringify(growerData));
      formPayload.append("growers", JSON.stringify(growers));

      // Add image separately if exists
      if (imageFile instanceof File) {
        formPayload.append(`photoAtInstallation_${index}`, imageFile);
      }
    });

    console.log("Form Payload Data:");
    for (let pair of formPayload.entries()) {
      console.log(pair[0] + ": ", pair[1]);
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}api/customer.php`,
        {
          method: "POST",
          body: formPayload,
        }
      );

      const text = await response.text(); // first get raw text
      console.log("Raw Response:", text);

      const result = JSON.parse(text); // then parse safely
      console.log("Server Parsed JSON:", result);

      if (result.status === "success") {
        toast.success("Customer added successfully");
        setErrors({});
      } else {
        toast.error(result.message || "Something went wrong");
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      alert("Server error. Contact admin.");
    }
  };
  const [cities, setCities] = useState([]);
  const statesAndCities = {
    Maharashtra: ['Mumbai', 'Pune', 'Nagpur', 'Nashik'],
    Karnataka: ['Bengaluru', 'Mysore', 'Mangalore'],
    Gujarat: ['Ahmedabad', 'Surat', 'Vadodara'],
  };
  const handleStateChange = (e) => {
    const selectedState = e.target.value;
    setFormData({ ...formData, state: selectedState, city: '' });
    setCities(statesAndCities[selectedState] || []);
  };
  const nextStep = () => {
    if (validateStep()) setCurrentStep(prev => Math.min(prev + 1, 3));
  };
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));
  const StepperHeader = () => (

    <div className="flex overflow-x-auto md:overflow-visible space-x-4 md:space-x-0 justify-between mb-8 pl-4 md:pl-0 pt-3">
      {[1, 2, 3].map((step, idx) => (
        <div key={step} className="flex-1 flex flex-col items-center min-w-[70px] relative">
          {idx !== 0 && (
            <div className="absolute left-0 top-5 w-full h-1 bg-gray-200 -z-10"></div>
          )}
          <div className={`w-10 h-10 flex items-center justify-center rounded-full text-white font-semibold transition-all duration-300 ${currentStep === step ? 'bg-blue-600 scale-110 shadow-lg' : 'bg-gray-300'}`}>
            {step}
          </div>
          <div className="text-xs mt-2 text-gray-700 font-medium text-center">
            {step === 1 ? 'Customer(ग्राहक)' : step === 2 ? 'Grower(उत्पादक )' : 'Review(जाँच करना)'}
          </div>
        </div>
      ))}
    </div>
  );
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-6 py-6">
            {/* Name */}
            <div className="flex flex-col">
              <label className="mb-1 font-medium text-gray-700">
                Name (नाम) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter name"
                className={`px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:outline-none transition ${errors.name ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'
                  }`}
              />
              {errors.name && <span className="text-red-500 text-sm mt-1">{errors.name}</span>}
            </div>

            {/* Email */}
            <div className="flex flex-col">
              <label className="mb-1 font-medium text-gray-700">
                Email (ईमेल) <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter email"
                className={`px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:outline-none transition ${errors.email ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'
                  }`}
              />
              {checking && <span className="text-gray-400 text-sm mt-1">Checking email availability...</span>}
              {errors.email && <span className="text-red-500 text-sm mt-1">{errors.email}</span>}
            </div>

            {/* Phone Number */}
            <div className="flex flex-col">
              <label className="mb-1 font-medium text-gray-700">
                Phone Number (फ़ोन नंबर) <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                placeholder="Enter phone number"
                className={`px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:outline-none transition ${errors.phoneNumber ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'
                  }`}
              />
              {errors.phoneNumber && <span className="text-red-500 text-sm mt-1">{errors.phoneNumber}</span>}
            </div>

            {/* Staff Phone Number */}
            <div className="flex flex-col">
              <label className="mb-1 font-medium text-gray-700">
                Staff Phone Number (स्टाफ फ़ोन नंबर)
              </label>
              <input
                type="tel"
                name="staffPhoneNumber"
                value={formData.staffPhoneNumber}
                onChange={handleInputChange}
                placeholder="Enter staff phone"
                className={`px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:outline-none transition ${errors.staffPhoneNumber ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'
                  }`}
              />
              {errors.staffPhoneNumber && <span className="text-red-500 text-sm mt-1">{errors.staffPhoneNumber}</span>}
            </div>

            {/* Profile Pic */}
            <div className="flex flex-col">
              <label className="mb-1 font-medium text-gray-700">
                Profile Pic (प्रोफ़ाइल चित्र)
              </label>

              <div className="flex items-center gap-3">
                {/* ✅ Image Preview */}
                {profilePreview && (
                  <img
                    src={profilePreview}
                    alt="Profile Preview"
                    className="w-16 h-16 object-cover rounded-md border"
                  />
                )}

                <input
                  type="file"
                  name="profilePic"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setFormData({ ...formData, profilePic: file });
                      setProfilePreview(URL.createObjectURL(file)); // <-- set preview
                    }
                  }}
                  className={`px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:outline-none transition ${errors.profilePic ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'
                    }`}
                />
              </div>

              {/* Error Message */}
              {errors.profilePic && (
                <span className="text-red-500 text-sm mt-1">{errors.profilePic}</span>
              )}
            </div>


            {/* State */}
            <div className="flex-1 flex flex-col">
              <label className="mb-1 font-medium text-gray-700">
                State (राज्य) <span className="text-red-500">*</span>
              </label>
              <select
                name="state"
                value={formData.state}
                onChange={handleStateChange}
                className={`px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:outline-none transition ${errors.state ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'
                  }`}
              >
                <option value="" disabled>Select state</option>
                {Object.keys(statesAndCities).map((state) => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
              {errors.state && <span className="text-red-500 text-sm mt-1">{errors.state}</span>}
            </div>

            {/* City */}
            <div className="flex-1 flex flex-col">
              <label className="mb-1 font-medium text-gray-700">
                City (शहर) <span className="text-red-500">*</span>
              </label>
              <select
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                className={`px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:outline-none transition ${errors.city ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'
                  }`}
                disabled={!cities.length}
              >
                <option value="" disabled>Select city</option>
                {cities.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
              {errors.city && <span className="text-red-500 text-sm mt-1">{errors.city}</span>}
            </div>

            {/* Locality */}
            <div className="flex-1 flex flex-col">
              <label className="mb-1 font-medium text-gray-700">
                Locality (इलाका) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="locality"
                value={formData.locality}
                onChange={handleInputChange}
                placeholder="Eg - Andheri."
                className={`px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:outline-none transition ${errors.locality ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'
                  }`}
              />
              {errors.locality && <span className="text-red-500 text-sm mt-1">{errors.locality}</span>}
            </div>

            {/* Landmark */}
            <div className="flex-1 flex flex-col">
              <label className="mb-1 font-medium text-gray-700">
                Landmark (लैंडमार्क) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="landmark"
                value={formData.landmark}
                onChange={handleInputChange}
                placeholder="Near City Mall"
                className={`px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:outline-none transition ${errors.landmark ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'
                  }`}
              />
              {errors.landmark && <span className="text-red-500 text-sm mt-1">{errors.landmark}</span>}
            </div>

            {/* Pincode */}
            <div className="flex-1 flex flex-col">
              <label className="mb-1 font-medium text-gray-700">
                Pincode (पिनकोड) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="pincode"
                value={formData.pincode}
                onChange={handleInputChange}
                placeholder="Enter pincode"
                className={`px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:outline-none transition ${errors.pincode ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'
                  }`}
              />
              {errors.pincode && <span className="text-red-500 text-sm mt-1">{errors.pincode}</span>}
            </div>

            {/* Street Address */}
            <div className="flex flex-col md:col-span-2">
              <label className="mb-1 font-medium text-gray-700">
                Street Address (सड़क पता) <span className="text-red-500">*</span>
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Enter address"
                rows={3}
                className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:outline-none transition ${errors.address ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'
                  }`}
              />
              {errors.address && <span className="text-red-500 text-sm mt-1">{errors.address}</span>}
            </div>

            {/* Active Checkbox */}
            {/* <div className="flex items-center md:col-span-2">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                id="isActive"
              />
              <label htmlFor="isActive" className="ml-2 block text-gray-700 font-medium">
                Active (सक्रिय)
              </label>
            </div> */}
          </div>

        );
      case 2:
        return (
          <div className="space-y-8 px-6 py-6">
            {growers.map((grower, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                <h3 className="text-lg font-semibold mb-4 text-gray-700">Grower {index + 1}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col">
                    <label className="mb-1 font-medium text-gray-700">
                      System Type (सिस्टम प्रकार) <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="systemType"
                      value={grower.systemType}
                      onChange={(e) => handleGrowerChange(index, e)}
                      className={`px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:outline-none transition ${errors[`systemType_${index}`] ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'}`}
                    >
                      <option value="">Select system type</option>
                      {systemTypes.map((s, i) => <option key={i} value={s}>{s}</option>)}
                    </select>
                    {errors[`systemType_${index}`] && <span className="text-red-500 text-sm mt-1">{errors[`systemType_${index}`]}</span>}
                    {grower.systemType === 'Other' && (
                      <input
                        type="text"
                        name="systemTypeOther"
                        value={grower.systemTypeOther}
                        onChange={(e) => handleGrowerChange(index, e)}
                        placeholder="Specify other"
                        className={`w-full mt-2 px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:outline-none transition ${errors[`systemTypeOther_${index}`] ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'}`}
                      />
                    )}
                    {errors[`systemTypeOther_${index}`] && <span className="text-red-500 text-sm mt-1">{errors[`systemTypeOther_${index}`]}</span>}
                  </div>

                  <div className="flex flex-col">
                    <label className="mb-1 font-medium text-gray-700">
                      No. of Plants (पौधों की संख्या) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="numPlants"
                      value={grower.numPlants}
                      onChange={(e) => handleGrowerChange(index, e)}
                      min="1"
                      className={`px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:outline-none transition ${errors[`numPlants_${index}`] ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'}`}
                    />
                    {errors[`numPlants_${index}`] && <span className="text-red-500 text-sm mt-1">{errors[`numPlants_${index}`]}</span>}
                  </div>

                  <div className="flex flex-col">
                    <label className="mb-1 font-medium text-gray-700">
                      No. of Levels (स्तरों की संख्या) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="numLevels"
                      value={grower.numLevels}
                      onChange={(e) => handleGrowerChange(index, e)}
                      min="1"
                      className={`px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:outline-none transition ${errors[`numLevels_${index}`] ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'}`}
                    />
                    {errors[`numLevels_${index}`] && <span className="text-red-500 text-sm mt-1">{errors[`numLevels_${index}`]}</span>}
                  </div>

                  <div className="flex flex-col">
                    <label className="mb-1 font-medium text-gray-700">
                      Setup Dimension (सेटअप आयाम) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="setupDimension"
                      value={grower.setupDimension}
                      onChange={(e) => handleGrowerChange(index, e)}
                      placeholder="ft"
                      className={`px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:outline-none transition ${errors[`setupDimension_${index}`] ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'}`}
                    />
                    {errors[`setupDimension_${index}`] && <span className="text-red-500 text-sm mt-1">{errors[`setupDimension_${index}`]}</span>}
                  </div>

                  <div className="flex flex-col">
                    <label className="mb-1 font-medium text-gray-700">
                      Motor Used (मोटर उपयोग) <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="motorType"
                      value={grower.motorType}
                      onChange={(e) => handleGrowerChange(index, e)}
                      className={`px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:outline-none transition ${errors[`motorType_${index}`] ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'}`}
                    >
                      <option value="">Select motor</option>
                      {motorTypes.map((m, i) => <option key={i} value={m}>{m}</option>)}
                    </select>
                    {errors[`motorType_${index}`] && <span className="text-red-500 text-sm mt-1">{errors[`motorType_${index}`]}</span>}
                    {grower.motorType === 'Other' && (
                      <input
                        type="text"
                        name="motorTypeOther"
                        value={grower.motorTypeOther}
                        onChange={(e) => handleGrowerChange(index, e)}
                        placeholder="Specify other"
                        className={`w-full mt-2 px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:outline-none transition ${errors[`motorTypeOther_${index}`] ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'}`}
                      />
                    )}
                    {errors[`motorTypeOther_${index}`] && <span className="text-red-500 text-sm mt-1">{errors[`motorTypeOther_${index}`]}</span>}
                  </div>

                  <div className="flex flex-col">
                    <label className="mb-1 font-medium text-gray-700">
                      Timer Used (टाइमर उपयोग) <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="timerUsed"
                      value={grower.timerUsed}
                      onChange={(e) => handleGrowerChange(index, e)}
                      className={`px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:outline-none transition ${errors[`timerUsed_${index}`] ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'}`}
                    >
                      <option value="">Select timer</option>
                      {timerOptions.map((t, i) => <option key={i} value={t}>{t}</option>)}
                    </select>
                    {errors[`timerUsed_${index}`] && <span className="text-red-500 text-sm mt-1">{errors[`timerUsed_${index}`]}</span>}
                    {grower.timerUsed === 'Other' && (
                      <input
                        type="text"
                        name="timerUsedOther"
                        value={grower.timerUsedOther}
                        onChange={(e) => handleGrowerChange(index, e)}
                        placeholder="Specify other"
                        className={`w-full mt-2 px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:outline-none transition ${errors[`timerUsedOther_${index}`] ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'}`}
                      />
                    )}
                    {errors[`timerUsedOther_${index}`] && <span className="text-red-500 text-sm mt-1">{errors[`timerUsedOther_${index}`]}</span>}
                  </div>

                  <div className="flex flex-col">
                    <label className="mb-1 font-medium text-gray-700">
                      No. of Lights <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="numLights"
                      value={grower.numLights}
                      onChange={(e) => handleGrowerChange(index, e)}
                      min="1"
                      className={`px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:outline-none transition ${errors[`numLights_${index}`] ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'}`}
                    />
                    {errors[`numLights_${index}`] && <span className="text-red-500 text-sm mt-1">{errors[`numLights_${index}`]}</span>}
                  </div>

                  <div className="flex flex-col">
                    <label className="mb-1 font-medium text-gray-700">
                      Model of Lights <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="modelOfLight"
                      value={grower.modelOfLight}
                      onChange={(e) => handleGrowerChange(index, e)}
                      className={`px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:outline-none transition ${errors[`modelOfLight_${index}`] ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'}`}
                    >
                      <option value="">Select Model of Light</option>
                      {modelOfLight.map((t, i) => <option key={i} value={t}>{t}</option>)}
                    </select>
                    {errors[`modelOfLight_${index}`] && <span className="text-red-500 text-sm mt-1">{errors[`modelOfLight_${index}`]}</span>}
                    {grower.modelOfLight === 'Other' && (
                      <input
                        type="text"
                        name="modelOfLightOther"
                        value={grower.modelOfLightOther}
                        onChange={(e) => handleGrowerChange(index, e)}
                        placeholder="Specify other"
                        className={`w-full mt-2 px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:outline-none transition ${errors[`modelOfLightOther_${index}`] ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'}`}
                      />
                    )}
                    {errors[`modelOfLightOther_${index}`] && <span className="text-red-500 text-sm mt-1">{errors[`modelOfLightOther_${index}`]}</span>}
                  </div>

                  <div className="flex flex-col">
                    <label className="mb-1 font-medium text-gray-700">
                      Length of Lights <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="lengthOfLight"
                      value={grower.lengthOfLight}
                      onChange={(e) => handleGrowerChange(index, e)}
                      className={`px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:outline-none transition ${errors[`lengthOfLight_${index}`] ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'}`}
                    >
                      <option value="">Select Length of Lights</option>
                      {lengthOfLight.map((t, i) => <option key={i} value={t}>{t}</option>)}
                    </select>
                    {errors[`lengthOfLight_${index}`] && <span className="text-red-500 text-sm mt-1">{errors[`lengthOfLight_${index}`]}</span>}
                    {grower.lengthOfLight === 'Other' && (
                      <input
                        type="text"
                        name="lengthOfLightOther"
                        value={grower.lengthOfLightOther}
                        onChange={(e) => handleGrowerChange(index, e)}
                        placeholder="Specify other"
                        className={`w-full mt-2 px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:outline-none transition ${errors[`lengthOfLightOther_${index}`] ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'}`}
                      />
                    )}
                    {errors[`lengthOfLightOther_${index}`] && <span className="text-red-500 text-sm mt-1">{errors[`lengthOfLightOther_${index}`]}</span>}
                  </div>

                  <div className="flex flex-col">
                    <label className="mb-1 font-medium text-gray-700">
                      Tank Capacity<span className="text-red-500">*</span>
                    </label>
                    <select
                      name="tankCapacity"
                      value={grower.tankCapacity}
                      onChange={(e) => handleGrowerChange(index, e)}
                      className={`px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:outline-none transition ${errors[`tankCapacity_${index}`] ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'}`}
                    >
                      <option value="">Select Tank Capacity</option>
                      {tankCapacity.map((t, i) => <option key={i} value={t}>{t}</option>)}
                    </select>
                    {errors[`tankCapacity_${index}`] && <span className="text-red-500 text-sm mt-1">{errors[`tankCapacity_${index}`]}</span>}
                    {grower.tankCapacity === 'Other' && (
                      <input
                        type="text"
                        name="tankCapacityOther"
                        value={grower.tankCapacityOther}
                        onChange={(e) => handleGrowerChange(index, e)}
                        placeholder="Specify other"
                        className={`w-full mt-2 px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:outline-none transition ${errors[`tankCapacityOther_${index}`] ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'}`}
                      />
                    )}
                    {errors[`tankCapacityOther_${index}`] && <span className="text-red-500 text-sm mt-1">{errors[`tankCapacityOther_${index}`]}</span>}
                  </div>

                  <div className="flex flex-col">
                    <label className="mb-1 font-medium text-gray-700">
                      Nutrition Given <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="nutritionGiven"
                      value={grower.nutritionGiven}
                      onChange={(e) => handleGrowerChange(index, e)}
                      className={`px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:outline-none transition ${errors[`nutritionGiven_${index}`] ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'}`}
                    />
                    {errors[`nutritionGiven_${index}`] && <span className="text-red-500 text-sm mt-1">{errors[`nutritionGiven_${index}`]}</span>}
                  </div>

                  <div className="flex flex-col">
                    <label className="mb-1 font-medium text-gray-700">
                      Other Specifications <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="otherSpecifications"
                      value={grower.otherSpecifications}
                      onChange={(e) => handleGrowerChange(index, e)}
                      min="1"
                      className={`px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:outline-none transition ${errors[`otherSpecifications_${index}`] ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'}`}
                    />
                    {errors[`otherSpecifications_${index}`] && <span className="text-red-500 text-sm mt-1">{errors[`otherSpecifications_${index}`]}</span>}
                  </div>

                  <div className="flex flex-col">
                    <label className="mb-1 font-medium text-gray-700">
                      Photo at Time of Installation <span className="text-red-500">*</span>
                    </label>

                    <div className="flex items-center gap-3">
                      {/* ✅ Image Preview */}
                      {previews[index] && (
                        <img
                          src={previews[index]}
                          alt="Installation Preview"
                          className="w-16 h-16 object-cover rounded-md border"
                        />
                      )}

                      <input
                        type="file"
                        name="photoAtInstallation"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, index)} // Pass the current grower index
                        className={`flex-1 px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:outline-none transition ${errors[`photoAtInstallation_${index}`]
                          ? "border-red-500 focus:ring-red-400"
                          : "border-gray-300 focus:ring-blue-400"
                          }`}
                      />
                    </div>

                    {/* Error Message */}
                    {errors[`photoAtInstallation_${index}`] && (
                      <span className="text-red-500 text-sm mt-1">
                        {errors[`photoAtInstallation_${index}`]}
                      </span>
                    )}
                  </div>


                  <div className="flex flex-col md:col-span-2">
                    <label className="mb-1 font-medium text-gray-700">
                      Plants Chosen (चुने गए पौधे) <span className="text-red-500">*</span>
                    </label>

                    <Select
                      isMulti
                      options={plantOptions}
                      value={grower.selectedPlants}
                      onChange={(selected) => handlePlantSelectChange(index, selected)}
                      classNamePrefix="react-select"
                      placeholder="Select plants..."
                      styles={{
                        menu: (provided) => ({ ...provided, zIndex: 9999 }),
                      }}
                    />

                    {/* ✅ Show input if "Other" is selected */}
                    {grower.selectedPlants?.some((opt) => opt.value === "other") && (
                      <input
                        type="text"
                        name="selectedPlantsOther"
                        value={grower.selectedPlantsOther || ""}
                        onChange={(e) => handleGrowerChange(index, e)}
                        placeholder="Specify other plant"
                        className={`mt-2 px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none transition ${errors[`selectedPlantsOther_${index}`]
                          ? "border-red-500 focus:ring-red-400"
                          : "border-gray-300 focus:ring-blue-400"
                          }`}
                      />
                    )}

                    {errors[`selectedPlants_${index}`] && (
                      <span className="text-red-500 text-sm mt-1">
                        {errors[`selectedPlants_${index}`]}
                      </span>
                    )}
                  </div>


                </div>
              </div>
            ))}
          </div>
        );
      case 3:
        return (
        <div className="px-6 py-6">
  <h3 className="md:text-2xl sm:text-xl font-bold mb-6 text-gray-800">Review Your Information</h3>

  <div className="space-y-6">
    {/* Profile Picture */}
    <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
      <h4 className="text-lg font-semibold mb-4 text-gray-700">Profile Picture</h4>
      <div className="flex items-center gap-4">
        {formData.profilePic ? (
          <>
            <p className="text-gray-800">{formData.profilePic.name}</p>
            <img
              src={profilePreview || URL.createObjectURL(formData.profilePic)}
              alt="Profile Preview"
              className="w-24 h-24 object-cover rounded-md border border-gray-300 shadow-sm"
            />
          </>
        ) : (
          <p className="text-gray-800">No profile picture uploaded</p>
        )}
      </div>
    </div>

    {/* Customer Details */}
    <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
      <h4 className="text-lg font-semibold mb-4 text-gray-700">Customer Details</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-gray-800">
            <span className="font-medium text-gray-600">Name: </span>
            {formData.name}
          </p>
        </div>
        <div>
          <p className="text-gray-800">
            <span className="font-medium text-gray-600">Email: </span>
            {formData.email}
          </p>
        </div>
        <div>
          <p className="text-gray-800">
            <span className="font-medium text-gray-600">Phone Number: </span>
            {formData.phoneNumber}
          </p>
        </div>
        {formData.staffPhoneNumber && (
          <div>
            <p className="text-gray-800">
              <span className="font-medium text-gray-600">Staff Phone Number: </span>
              {formData.staffPhoneNumber}
            </p>
          </div>
        )}
        <div>
          <p className="text-gray-800">
            <span className="font-medium text-gray-600">State: </span>
            {formData.state}
          </p>
        </div>
        <div>
          <p className="text-gray-800">
            <span className="font-medium text-gray-600">City: </span>
            {formData.city}
          </p>
        </div>
        <div>
          <p className="text-gray-800">
            <span className="font-medium text-gray-600">Pincode: </span>
            {formData.pincode}
          </p>
        </div>

        {/* Added Locality */}
        <div>
          <p className="text-gray-800">
            <span className="font-medium text-gray-600">Locality: </span>
            {formData.locality || "N/A"}
          </p>
        </div>

        {/* Added Landmark */}
        <div>
          <p className="text-gray-800">
            <span className="font-medium text-gray-600">Landmark: </span>
            {formData.landmark || "N/A"}
          </p>
        </div>

        <div className="md:col-span-2">
          <p className="text-gray-800">
            <span className="font-medium text-gray-600">Address: </span>
            {formData.address}
          </p>
        </div>
      </div>
    </div>

    {/* Grower Information */}
    <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
      <h4 className="text-lg font-semibold mb-4 text-gray-700">Grower Information</h4>
      {growers.map((grower, index) => (
        <div key={index} className="mb-6 last:mb-0">
          <h5 className="font-semibold text-gray-700 mb-3">Grower {index + 1}</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-800">
                <span className="font-medium text-gray-600">System Type: </span>
                {grower.systemType === 'Other' ? grower.systemTypeOther : grower.systemType}
              </p>
            </div>
            <div>
              <p className="text-gray-800">
                <span className="font-medium text-gray-600">No. of Plants: </span>
                {grower.numPlants}
              </p>
            </div>
            <div>
              <p className="text-gray-800">
                <span className="font-medium text-gray-600">No. of Levels: </span>
                {grower.numLevels}
              </p>
            </div>
            <div>
              <p className="text-gray-800">
                <span className="font-medium text-gray-600">Setup Dimension: </span>
                {grower.setupDimension}
              </p>
            </div>
            <div>
              <p className="text-gray-800">
                <span className="font-medium text-gray-600">Motor Used: </span>
                {grower.motorType === 'Other' ? grower.motorTypeOther : grower.motorType}
              </p>
            </div>
            <div>
              <p className="text-gray-800">
                <span className="font-medium text-gray-600">Timer Used: </span>
                {grower.timerUsed === 'Other' ? grower.timerUsedOther : grower.timerUsed}
              </p>
            </div>
            <div>
              <p className="text-gray-800">
                <span className="font-medium text-gray-600">No. of Lights: </span>
                {grower.numLights}
              </p>
            </div>
            <div>
              <p className="text-gray-800">
                <span className="font-medium text-gray-600">Model of Lights: </span>
                {grower.modelOfLight === 'Other' ? grower.modelOfLightOther : grower.modelOfLight}
              </p>
            </div>
            <div>
              <p className="text-gray-800">
                <span className="font-medium text-gray-600">Length of Lights: </span>
                {grower.lengthOfLight === 'Other' ? grower.lengthOfLightOther : grower.lengthOfLight}
              </p>
            </div>
            <div>
              <p className="text-gray-800">
                <span className="font-medium text-gray-600">Tank Capacity: </span>
                {grower.tankCapacity === 'Other' ? grower.tankCapacityOther : grower.tankCapacity}
              </p>
            </div>
            <div>
              <p className="text-gray-800">
                <span className="font-medium text-gray-600">Nutrition Given: </span>
                {grower.nutritionGiven}
              </p>
            </div>
            <div>
              <p className="text-gray-800">
                <span className="font-medium text-gray-600">Other Specifications: </span>
                {grower.otherSpecifications}
              </p>
            </div>
            <div>
              <p className="text-gray-800">
                <span className="font-medium text-gray-600">Photo at Time of Installation: </span>
                {grower.photoAtInstallation ? (
                  <span>{grower.photoAtInstallation.name}</span>
                ) : (
                  "No file uploaded"
                )}
              </p>
              {grower.photoAtInstallation && (
                <img
                  src={URL.createObjectURL(grower.photoAtInstallation)}
                  alt="Installation Preview"
                  className="w-24 h-24 object-cover rounded-md mt-2 border border-gray-300 shadow-sm"
                />
              )}
            </div>
            <div className="md:col-span-2">
              <p className="text-gray-800">
                <span className="font-medium text-gray-600">Plants Chosen: </span>
                {grower.selectedPlants && grower.selectedPlants.length > 0 ? (
                  <>
                    {grower.selectedPlants
                      .map((p) =>
                        p.value === "other" ? `Other: ${grower.selectedPlantsOther || "N/A"}` : p.label
                      )
                      .join(", ")}
                  </>
                ) : (
                  "N/A"
                )}
              </p>
            </div>
            <div className="md:col-span-2">
              <p className="text-gray-800">
                <span className="font-medium text-gray-600">Status: </span>
                <span className={`font-semibold ${formData.isActive ? 'text-green-600' : 'text-red-600'}`}>
                  {formData.isActive ? 'Active' : 'Inactive'}
                </span>
              </p>
            </div>
          </div>

          {index < growers.length - 1 && <hr className="my-4 border-gray-300" />}
        </div>
      ))}
    </div>
  </div>
</div>


        );
      default:
        return null;
    }
  };
  return (
    <div className="w-full min-h-screen bg-gray-100 mt-10">
      <div className="mx-auto bg-white rounded-2xl shadow-xl p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Add a Customer (ग्राहक जोड़ें)</h2>
        <StepperHeader />

        <div className="mt-6 space-y-6">
          {renderStep()}

          {/* Buttons Section */}
          <div className="mt-6 px-6">
            {currentStep === 2 ? (
              <div className="flex flex-col sm:flex-row flex-wrap justify-between items-center gap-3">
                {/* Add / Remove Grower Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={addGrower}
                    className="bg-[#9FC762] hover:bg-[#8DB350] text-white font-medium px-6 py-2 rounded-lg w-full sm:w-auto transition"
                  >
                    + Add Grower(उत्पादक जोड़ें)
                  </button>

                  {growers.length > 1 && (
                    <button
                      type="button"
                      onClick={removeGrower}
                      className="bg-red-500 hover:bg-red-600 text-white font-medium px-6 py-2 rounded-lg w-full sm:w-auto transition"
                    >
                      - Remove Grower(उत्पादक निकालना)
                    </button>
                  )}
                </div>

                {/* Navigation Buttons */}
                <div className="flex flex-col-2 sm:flex-row gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="btn-primary"
                  >
                    Previous(पिछला)
                  </button>

                  <button
                    type="button"
                    onClick={nextStep}
                    className="btn-primary "
                  >
                    Next(आगे)
                  </button>
                </div>
              </div>
            ) : (
              // Other Step Buttons
              <div className="flex flex-col md:flex-row justify-end w-full gap-3">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="btn-primary"
                  >
                    Previous(पिछला)
                  </button>
                )}

                {currentStep < 3 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="btn-primary"
                  >
                    Next (आगे)
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-2 rounded-lg w-full md:w-auto transition ml-auto"
                  >
                    Submit(जमा करें)
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default StepperCustomerForm;




// case 3:
//   return (
//     <div className="px-6 py-6">
//       <h3 className="text-2xl font-bold mb-6 text-gray-800">Review Your Information (JSON)</h3>
//       <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm text-gray-800">
//         {JSON.stringify(
//           {
//             ...formData,
//             growers: growers.map(g => ({
//               ...g,
//               // selectedPlants: only keep values/labels if needed
//               selectedPlants: g.selectedPlants.map(p => p.label)
//             }))
//           },
//           null,
//           2
//         )}
//       </pre>
//     </div>
//   );


// for json