import React, { useState, useEffect, useRef } from 'react'; // Added useRef
import Select from 'react-select';
import { useParams } from 'react-router-dom';
import { toast } from "react-toastify";
import html2canvas from 'html2canvas'; // Added import
import statesData from '@/data/state';

const convertImagesToBase64 = (element) => {
  const promises = [];

  // Find all img elements within the review section
  const images = element.querySelectorAll('img');

  images.forEach((img) => {
    const promise = new Promise((resolve) => {
      // If image already has a data URL, no need to convert
      if (img.src.startsWith('data:')) {
        resolve();
        return;
      }

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const imgElement = new Image();

      imgElement.crossOrigin = 'anonymous'; // Important for CORS
      imgElement.onload = () => {
        canvas.width = imgElement.width;
        canvas.height = imgElement.height;
        ctx.drawImage(imgElement, 0, 0);

        // Convert to data URL
        img.src = canvas.toDataURL('image/png');
        resolve();
      };

      imgElement.onerror = () => {
        console.warn('Failed to load image:', img.src);
        resolve();
      };

      imgElement.src = img.src;
    });

    promises.push(promise);
  });

  return Promise.all(promises);
};

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
  const [phoneExists, setPhoneExists] = useState(false);
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
    { value: 'Green Amaranthus', label: 'Green Amaranthus' },
  ];

  const { id } = useParams();

  const [errors, setErrors] = useState({});
  const [currentStep, setCurrentStep] = useState(1);

  // Timer options array - updated to match second code example
  const timerOptions = ['Digital', 'Cyclic-15 mins', 'TSIWI', '800XC', 'Other'];

  // Add ref for review section
  const reviewRef = useRef(null);

  const [growers, setGrowers] = useState([{
    growerId: '',
    systemType: '',
    systemTypeOther: '',
    growerQuantity: '',
    numPlants: '',
    numLevels: '',
    numChannelPerLevel: '',
    numHolesPerChannel: '',
    setupDimension: '',
    motorType: '',
    motorTypeOther: '',
    timerUsed: [], // Changed from string to array
    timerQuantities: {}, // Changed from object with all options to dynamic object
    timerUsedOther: '', // Added this field
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
    selectedPlants: []
  }]);

  const systemTypes = ['Small Grower', 'Long Grower', 'Mini Pro Grower',
    'Semi Pro Grower', 'Pro Grower', 'Vertical Outdoor Grower', 'Flat Bed',
    'Indoor Grower', 'Furniture Integrated Grower', 'Mini Grower', 'Dutch Bucket',
    'Growbags', 'Microgreen Racks', 'Other'];
  const motorTypes = ['Small Motor (10W)', 'Big Motor (40W)', 'Other'];
  const modelOfLight = ['Nx1.1', 'Nx4', 'Other'];
  const lengthOfLight = ['2ft', '3ft', '4ft', 'Other'];
  const tankCapacity = ['20L', '40L', '100L', '150L', '200L', 'Other'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));

    // Clear phone exists flag when user edits phone number
    if (name === 'phoneNumber') {
      setPhoneExists(false);
    }
  };

  useEffect(() => {
    if (
      (!formData.email || !formData.email.includes("@")) &&
      (!formData.phoneNumber || formData.phoneNumber.length < 10)
    ) {
      return;
    }

    const delayDebounce = setTimeout(() => {
      checkEmailPhoneExists(formData.email, formData.phoneNumber);
    }, 600);

    return () => clearTimeout(delayDebounce);
  }, [formData.email, formData.phoneNumber]);


  const checkEmailPhoneExists = async (email, phone) => {
    setChecking(true);
    setPhoneExists(false);

    try {
      const query = new URLSearchParams();
      if (email) query.append("email", email);
      if (phone) query.append("phone", phone);
      if (id) query.append("custId", id);

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}api/customer.php?${query.toString()}`
      );

      const data = await res.json();

      if (data.phoneExists) {
        setPhoneExists(true);
      }

      setErrors((prev) => ({
        ...prev,
        email: data.emailExists
          ? "An account with this email already exists."
          : "",
        phoneNumber: data.phoneExists
          ? "An account with this phone number already exists."
          : "",
      }));
    } catch (error) {
      console.error("Error checking email/phone:", error);
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

  // Handle timer selection change
  const handleTimerSelectChange = (index, selectedOptions) => {
    const updatedGrowers = [...growers];
    const selectedValues = selectedOptions ? selectedOptions.map(opt => opt.value) : [];

    // Update the timerUsed array
    updatedGrowers[index].timerUsed = selectedValues;

    // Initialize or update timer quantities
    if (updatedGrowers[index].timerQuantities) {
      // Remove quantities for deselected timers
      const updatedQuantities = { ...updatedGrowers[index].timerQuantities };
      Object.keys(updatedQuantities).forEach(timer => {
        if (!selectedValues.includes(timer)) {
          delete updatedQuantities[timer];
        }
      });
      updatedGrowers[index].timerQuantities = updatedQuantities;
    } else {
      updatedGrowers[index].timerQuantities = {};
    }

    // Initialize quantities for new selections
    selectedValues.forEach(timer => {
      if (!updatedGrowers[index].timerQuantities[timer]) {
        updatedGrowers[index].timerQuantities[timer] = '1';
      }
    });

    // Clear timerUsedOther if "Other" is not selected
    if (!selectedValues.includes('Other')) {
      updatedGrowers[index].timerUsedOther = '';
      // Also remove "Other" quantity if it exists
      if (updatedGrowers[index].timerQuantities['Other']) {
        delete updatedGrowers[index].timerQuantities['Other'];
      }
    }

    setGrowers(updatedGrowers);
    setErrors(prev => ({ ...prev, [`timerUsed_${index}`]: '' }));
  };

  // Handle timer quantity change - FIXED
  const handleTimerQuantityChange = (index, timerType, value) => {
    const updatedGrowers = [...growers];

    // Initialize timerQuantities if it doesn't exist
    if (!updatedGrowers[index].timerQuantities) {
      updatedGrowers[index].timerQuantities = {};
    }

    // Update the quantity for the specific timer type
    updatedGrowers[index].timerQuantities[timerType] = value;

    setGrowers(updatedGrowers);

    // Clear any error for this timer quantity
    const errorKey = `timerQuantity_${timerType}_${index}`;
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[errorKey];
      return newErrors;
    });
  };

  const addGrower = () => {
    setGrowers([...growers, {
      systemType: '',
      systemTypeOther: '',
      growerQuantity: '',
      numPlants: '',
      numLevels: '',
      numChannelPerLevel: '',
      numHolesPerChannel: '',
      setupDimension: '',
      motorType: '',
      motorTypeOther: '',
      timerUsed: [],
      timerQuantities: {},
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
      selectedPlants: []
    }]);
  };

  const handlePlantSelectChange = (index, selectedOptions) => {
    const updatedGrowers = [...growers];
    updatedGrowers[index].selectedPlants = selectedOptions || [];
    setGrowers(updatedGrowers);
    setErrors(prev => ({ ...prev, [`selectedPlants_${index}`]: '' }));
  };

  const removeGrower = () => {
    if (growers.length <= 1) return;
    setGrowers(growers.slice(0, -1));
  };

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log("FormData updated:", formData);
  }, [formData]);

  useEffect(() => {
    const fetchUser = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}api/customer.php?id=${id}`);
        const data = await response.json();

        console.log("✅ Full API Response:", data);
        console.log("📊 Grower Timer Data (raw):", data.grower_timer);
        console.log("📊 Individual Grower Data:", data.grower);

        if (data.status === "success" && data.data) {
          const user = Array.isArray(data.data) ? data.data[0] : data.data;
          const growerArray = Array.isArray(data.grower) ? data.grower : (data.grower ? [data.grower] : []);
          const customerPlants = Array.isArray(data.customer_plant) ? data.customer_plant : [];
          const growerTimerData = Array.isArray(data.grower_timer) ? data.grower_timer : [];

          const newFormData = {
            name: user.name || '',
            email: user.email || '',
            phoneNumber: user.phone || '',
            staffPhoneNumber: user.staff_phone || '',
            state: user.state || '',
            city: user.city || '',
            pincode: user.pincode || '',
            landmark: user.landmark || '',
            locality: user.locality || '',
            address: user.street_address || '',
            profilePic: user.profile_pic || '',
            isActive: user.status ? user.status === "active" : true,
          };
          setFormData(newFormData);

          // Group timers by grower_id if it exists
          const timersByGrowerId = {};
          growerTimerData.forEach(timer => {
            const growerId = timer.grower_id || timer.growerId || null;

            if (growerId) {
              if (!timersByGrowerId[growerId]) {
                timersByGrowerId[growerId] = [];
              }
              timersByGrowerId[growerId].push(timer);
            } else {
              if (!timersByGrowerId['ungrouped']) {
                timersByGrowerId['ungrouped'] = [];
              }
              timersByGrowerId['ungrouped'].push(timer);
            }
          });

          console.log("📊 Timers grouped by grower ID:", timersByGrowerId);

          const newGrowersData = growerArray.map((g, growerIndex) => {
            const growerId = g.id || g.grower_id || `grower_${growerIndex}`;

            // Handle selectedPlants - always keep as array
            let plantsForThisGrower = [];

            // Try to get plants from customer_plant table
            const plantsFromTable = customerPlants
              .filter((p) => {
                if (!p) return false;
                return String(p.grower_id ?? p.growerId ?? '') === String(growerId);
              })
              .map((p) => ({
                value: p.name,
                label: p.name,
              }));

            if (plantsFromTable.length > 0) {
              plantsForThisGrower = plantsFromTable;
            } else if (g.selected_plants) {
              // Fallback: parse from selected_plants field
              try {
                let parsedPlants = g.selected_plants;
                if (typeof g.selected_plants === 'string') {
                  if (g.selected_plants.startsWith('[') || g.selected_plants.startsWith('{')) {
                    parsedPlants = JSON.parse(g.selected_plants);
                  }
                }

                if (Array.isArray(parsedPlants)) {
                  plantsForThisGrower = parsedPlants;
                } else if (typeof parsedPlants === 'string') {
                  plantsForThisGrower = [{ value: parsedPlants, label: parsedPlants }];
                }
              } catch (e) {
                console.error("Error parsing selected plants:", e);
              }
            }

            // Parse timer data for THIS specific grower
            let timerUsed = [];
            let timerQuantities = {};
            let timerUsedOther = '';

            // First, try to get timers specifically assigned to this grower
            const timersForThisGrower = timersByGrowerId[growerId] || [];

            console.log(`Grower ${growerId} - specific timers:`, timersForThisGrower);

            if (timersForThisGrower.length > 0) {
              timersForThisGrower.forEach(timer => {
                const timerType = timer.timer_used;
                const quantity = timer.quantity || '1';

                // IMPORTANT: Check if timerType is actually a custom timer name
                // If it's not in our predefined timerOptions, it's a custom timer
                const isCustomTimer = !timerOptions.includes(timerType);

                if (isCustomTimer) {
                  // This is a custom timer, so we need to add "Other" to timerUsed
                  // and store the custom name in timerUsedOther
                  if (!timerUsed.includes('Other')) {
                    timerUsed.push('Other');
                  }
                  timerUsedOther = timerType; // Store custom name
                  timerQuantities['Other'] = quantity; // Quantity goes under "Other" key
                } else {
                  // This is a standard timer from timerOptions
                  if (!timerUsed.includes(timerType)) {
                    timerUsed.push(timerType);
                  }
                  timerQuantities[timerType] = quantity;
                }
              });
            } else if (growerTimerData.length > 0) {
              const totalGrowers = growerArray.length;
              const timersPerGrower = Math.ceil(growerTimerData.length / totalGrowers);
              const startIndex = growerIndex * timersPerGrower;
              const endIndex = Math.min(startIndex + timersPerGrower, growerTimerData.length);

              const assignedTimers = growerTimerData.slice(startIndex, endIndex);

              console.log(`Grower ${growerId} - assigned timers (index ${growerIndex}):`, assignedTimers);

              assignedTimers.forEach(timer => {
                const timerType = timer.timer_used;
                const quantity = timer.quantity || '1';

                // Check if timerType is a custom timer
                if (timerType === 'Other') {
                  if (!timerUsed.includes('Other')) {
                    timerUsed.push('Other');
                  }

                  // ✅ THIS IS THE FIX
                  timerUsedOther = timer.timer_used_other || '';
                  timerQuantities['Other'] = quantity;

                } else {
                  if (!timerUsed.includes(timerType)) {
                    timerUsed.push(timerType);
                  }
                  timerQuantities[timerType] = quantity;
                }

              });
            }

            // Fallback: Check individual grower fields for timer data
            if (timerUsed.length === 0 && g.timer_used) {
              console.log(`Grower ${growerId} - using individual grower timer fields`);

              try {
                let parsedTimerUsed = g.timer_used;
                if (typeof g.timer_used === 'string') {
                  if (g.timer_used.startsWith('[') || g.timer_used.startsWith('{')) {
                    parsedTimerUsed = JSON.parse(g.timer_used);
                  }
                }

                let parsedTimerQuantity = g.timer_quantity;
                if (g.timer_quantity && typeof g.timer_quantity === 'string') {
                  if (g.timer_quantity.startsWith('{') || g.timer_quantity.startsWith('[')) {
                    parsedTimerQuantity = JSON.parse(g.timer_quantity);
                  }
                }

                if (Array.isArray(parsedTimerUsed)) {
                  // Check if array contains custom timers
                  const containsCustomTimer = parsedTimerUsed.some(timer => !timerOptions.includes(timer));

                  if (containsCustomTimer) {
                    // If we have custom timers, add "Other" to timerUsed
                    timerUsed = ['Other'];

                    // Find the custom timer name (first one not in timerOptions)
                    const customTimer = parsedTimerUsed.find(timer => !timerOptions.includes(timer));
                    if (customTimer) {
                      timerUsedOther = customTimer;
                    }

                    // Get quantity for "Other"
                    if (typeof parsedTimerQuantity === 'object' && parsedTimerQuantity !== null) {
                      // Look for quantity under custom timer name or "Other" key
                      if (parsedTimerQuantity[customTimer]) {
                        timerQuantities['Other'] = parsedTimerQuantity[customTimer];
                      } else if (parsedTimerQuantity['Other']) {
                        timerQuantities['Other'] = parsedTimerQuantity['Other'];
                      } else {
                        timerQuantities['Other'] = '1';
                      }
                    } else {
                      timerQuantities['Other'] = g.timer_quantity || '1';
                    }

                    // Also add any standard timers from the array
                    parsedTimerUsed.forEach(timer => {
                      if (timerOptions.includes(timer) && !timerUsed.includes(timer)) {
                        timerUsed.push(timer);
                        if (typeof parsedTimerQuantity === 'object' && parsedTimerQuantity !== null) {
                          timerQuantities[timer] = parsedTimerQuantity[timer] || '1';
                        } else {
                          timerQuantities[timer] = '1';
                        }
                      }
                    });
                  } else {
                    // No custom timers, all are standard
                    timerUsed = [...new Set(parsedTimerUsed)];

                    if (typeof parsedTimerQuantity === 'object' && parsedTimerQuantity !== null) {
                      timerQuantities = { ...parsedTimerQuantity };
                    } else {
                      parsedTimerUsed.forEach(timer => {
                        timerQuantities[timer] = '1';
                      });
                    }
                  }
                } else if (typeof parsedTimerUsed === 'object' && parsedTimerUsed !== null) {
                  // Handle object case
                  const timerKeys = Object.keys(parsedTimerUsed);
                  const containsCustomTimer = timerKeys.some(key => !timerOptions.includes(key));

                  if (containsCustomTimer) {
                    timerUsed = ['Other'];
                    const customTimer = timerKeys.find(key => !timerOptions.includes(key));
                    if (customTimer) {
                      timerUsedOther = customTimer;
                      timerQuantities['Other'] = parsedTimerUsed[customTimer] || '1';
                    }

                    // Add standard timers
                    timerKeys.forEach(key => {
                      if (timerOptions.includes(key) && !timerUsed.includes(key)) {
                        timerUsed.push(key);
                        timerQuantities[key] = parsedTimerUsed[key] || '1';
                      }
                    });
                  } else {
                    timerUsed = timerKeys;
                    timerQuantities = parsedTimerUsed;
                  }
                } else if (typeof parsedTimerUsed === 'string') {
                  const isCustomTimer = !timerOptions.includes(parsedTimerUsed);

                  if (isCustomTimer) {
                    timerUsed = ['Other'];
                    timerUsedOther = parsedTimerUsed;

                    if (typeof parsedTimerQuantity === 'object' && parsedTimerQuantity !== null) {
                      timerQuantities['Other'] = parsedTimerQuantity[parsedTimerUsed] || parsedTimerQuantity['Other'] || '1';
                    } else if (g.timer_quantity) {
                      timerQuantities['Other'] = g.timer_quantity;
                    } else {
                      timerQuantities['Other'] = '1';
                    }
                  } else {
                    timerUsed = [parsedTimerUsed];

                    if (typeof parsedTimerQuantity === 'object' && parsedTimerQuantity !== null) {
                      timerQuantities = parsedTimerQuantity;
                    } else if (g.timer_quantity) {
                      timerQuantities[parsedTimerUsed] = g.timer_quantity;
                    } else {
                      timerQuantities[parsedTimerUsed] = '1';
                    }
                  }
                }

                timerUsedOther = g.timer_used_other || timerUsedOther;

              } catch (e) {
                console.error("Error parsing timer data:", e);
                if (typeof g.timer_used === 'string') {
                  const isCustomTimer = !timerOptions.includes(g.timer_used);

                  if (isCustomTimer) {
                    timerUsed = ['Other'];
                    timerUsedOther = g.timer_used;
                    timerQuantities = { 'Other': g.timer_quantity || '1' };
                  } else {
                    timerUsed = [g.timer_used];
                    timerQuantities = { [g.timer_used]: g.timer_quantity || '1' };
                  }
                }
              }
            }

            // Ensure all quantity values are strings
            Object.keys(timerQuantities).forEach(key => {
              if (typeof timerQuantities[key] !== 'string') {
                timerQuantities[key] = String(timerQuantities[key]);
              }
            });

            console.log(`Grower ${growerId} FINAL timer data:`, {
              timerUsed,
              timerQuantities,
              timerUsedOther,
              timerCount: timerUsed.length
            });

            return {
              growerId: growerId,
              systemType: g.system_type || '',
              systemTypeOther: g.system_type_other || '',
              growerQuantity: g.grower_qty || '',
              numPlants: g.no_of_plants || '',
              numLevels: g.no_of_levels || '',
              numChannelPerLevel: g.channel_per_level || '',
              numHolesPerChannel: g.holes_per_channel || '',
              setupDimension: g.setup_dimension || '',
              motorType: g.motor_used || '',
              motorTypeOther: g.motor_used_other || '',
              timerUsed: timerUsed,
              timerQuantities: timerQuantities,
              timerUsedOther: timerUsedOther,
              numLights: g.no_of_lights || '',
              modelOfLight: g.model_of_lights || '',
              modelOfLightOther: g.model_of_lights_other || '',
              lengthOfLight: g.length_of_lights || '',
              lengthOfLightOther: g.length_of_lights_other || '',
              tankCapacity: g.tank_capacity || '',
              tankCapacityOther: g.tank_capacity_other || '',
              nutritionGiven: g.nutrition_given || '',
              otherSpecifications: g.other_specifications || '',
              photoAtInstallation: g.installation_photo_url || '',
              selectedPlants: plantsForThisGrower
            };
          });

          setGrowers(newGrowersData);

          if (user.state && statesAndCities[user.state]) {
            setCities(statesAndCities[user.state]);
          }
        } else {
          console.error("API returned error or no data");
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

  const validateStep = () => {
    let stepErrors = {};

    if (currentStep === 1) {
      if (!formData.name.trim()) stepErrors.name = 'Name is required';
      if (!formData.phoneNumber.trim()) stepErrors.phoneNumber = 'Phone number is required';
      else if (!/^\d{10}$/.test(formData.phoneNumber))
        stepErrors.phoneNumber = 'Phone number must be 10 digits';

      if (formData.staffPhoneNumber && !/^\d{10}$/.test(formData.staffPhoneNumber))
        stepErrors.staffPhoneNumber = 'Staff phone number must be 10 digits';

      if (!formData.state) stepErrors.state = 'State is required';
      if (!formData.city) stepErrors.city = 'City is required';
      if (!formData.locality.trim()) stepErrors.locality = 'Locality is required';
      if (!formData.landmark.trim()) stepErrors.landmark = 'Landmark is required';

      if (!formData.pincode.trim()) stepErrors.pincode = 'Pincode is required';
      else if (!/^\d{6}$/.test(formData.pincode))
        stepErrors.pincode = 'Pincode must be exactly 6 digits';

      if (!formData.address.trim()) stepErrors.address = 'Street address is required';

      setErrors(stepErrors);
      return Object.keys(stepErrors).length === 0;
    }

    if (currentStep === 2) {
      growers.forEach((grower, index) => {
        if (!grower.systemType) stepErrors[`systemType_${index}`] = 'System type is required';
        if (grower.systemType === 'Other' && !grower.systemTypeOther.trim()) stepErrors[`systemTypeOther_${index}`] = 'Please specify other system type';
        if (!grower.growerQuantity) stepErrors[`growerQuantity_${index}`] = 'Grower Quantity is required';
        if (!grower.numPlants) stepErrors[`numPlants_${index}`] = 'Number of plants is required';
        else if (parseInt(grower.numPlants) < 0) stepErrors[`numPlants_${index}`] = 'Number of plants cannot be negative';
        if (!grower.numLevels) stepErrors[`numLevels_${index}`] = 'Number of levels is required';
        else if (parseInt(grower.numLevels) < 0) stepErrors[`numLevels_${index}`] = 'Number of levels cannot be negative';
        if (!grower.numChannelPerLevel) stepErrors[`numChannelPerLevel_${index}`] = 'Number of levels is required';
        else if (parseInt(grower.numChannelPerLevel) < 0) stepErrors[`numChannelPerLevel_${index}`] = 'Number of channel per levels cannot be negative';
        if (!grower.numHolesPerChannel) stepErrors[`numHolesPerChannel_${index}`] = 'Number of levels is required';
        else if (parseInt(grower.numHolesPerChannel) < 0) stepErrors[`numHolesPerChannel_${index}`] = 'Number of holes per channel cannot be negative';
        if (!grower.setupDimension.trim()) stepErrors[`setupDimension_${index}`] = 'Setup dimension is required';
        if (!grower.motorType) stepErrors[`motorType_${index}`] = 'Motor type is required';
        if (grower.motorType === 'Other' && !grower.motorTypeOther.trim()) stepErrors[`motorTypeOther_${index}`] = 'Please specify other motor type';

        // Timer validation - updated for new structure
        if (!grower.timerUsed || grower.timerUsed.length === 0) {
          stepErrors[`timerUsed_${index}`] = 'At least one timer type is required';
        } else {
          // Validate quantities for each selected timer
          grower.timerUsed.forEach(timer => {
            const quantityKey = timer === 'Other' ? 'Other' : timer;
            if (!grower.timerQuantities?.[quantityKey]) {
              stepErrors[`timerQuantity_${timer}_${index}`] = `Quantity for ${timer} is required`;
            } else if (parseInt(grower.timerQuantities[quantityKey]) < 1) {
              stepErrors[`timerQuantity_${timer}_${index}`] = `Quantity for ${timer} must be at least 1`;
            }
          });
        }

        if (grower.timerUsed?.includes('Other') && !grower.timerUsedOther.trim()) {
          stepErrors[`timerUsedOther_${index}`] = 'Please specify other timer';
        }

        if (!grower.modelOfLight) stepErrors[`modelOfLight_${index}`] = 'Model of Light is required';
        if (grower.modelOfLight === 'Other' && !grower.modelOfLightOther.trim()) stepErrors[`modelOfLightOther_${index}`] = 'Please specify other model of light';
        if (!grower.lengthOfLight) stepErrors[`lengthOfLight_${index}`] = 'Length of Light is required';
        if (grower.lengthOfLight === 'Other' && !grower.lengthOfLightOther.trim()) stepErrors[`lengthOfLightOther_${index}`] = 'Please specify other length of light';
        if (!grower.tankCapacity) stepErrors[`tankCapacity_${index}`] = 'Tank Capacity is required';
        if (grower.tankCapacity === 'Other' && !grower.tankCapacityOther.trim()) stepErrors[`tankCapacityOther_${index}`] = 'Please specify other tank capacity';
        if (!grower.nutritionGiven) stepErrors[`nutritionGiven_${index}`] = 'Nutrition Given is required';
        if (!grower.otherSpecifications) stepErrors[`otherSpecifications_${index}`] = 'Other Specification is required';

        if (!grower.selectedPlants || grower.selectedPlants.length === 0) {
          stepErrors[`selectedPlants_${index}`] = 'Select at least one plant';
        }
      });
    }

    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;

    setLoading(true);

    const formPayload = new FormData();

    // Append basic form data
    for (const key in formData) {
      if (formData[key] !== undefined && formData[key] !== null) {
        formPayload.append(key, formData[key]);
      }
    }

    formPayload.append('id', id);
    formPayload.append('_method', 'PUT');

    // Prepare growers data properly
    const processedGrowers = growers.map((grower, index) => {
      const growerData = { ...grower };

      // Deep clone timerQuantities to avoid mutations
      let finalTimerQuantities = {};
      if (growerData.timerQuantities && typeof growerData.timerQuantities === 'object') {
        finalTimerQuantities = JSON.parse(JSON.stringify(growerData.timerQuantities));
      }

      // Process timerUsed array - keep "Other" if it exists
      let finalTimerUsed = [...(growerData.timerUsed || [])];
      const hasOtherInTimerUsed = finalTimerUsed.includes('Other');
      const timerOtherName = growerData.timerUsedOther?.trim();

      // IMPORTANT: Keep "Other" in timerQuantities for custom timers
      // If we have a custom timer name and "Other" is selected:
      if (hasOtherInTimerUsed && timerOtherName) {
        // Check if the custom timer name already exists in timerUsed
        const customTimerExists = finalTimerUsed.includes(timerOtherName);

        if (!customTimerExists) {
          // Add custom timer name to timerUsed array while keeping "Other"
          finalTimerUsed = [...finalTimerUsed, timerOtherName];
        }

        // Ensure "Other" has a quantity in timerQuantities
        if (!finalTimerQuantities['Other'] && growerData.timerQuantities?.[timerOtherName]) {
          // If no quantity for "Other" but there is for custom name, use that
          finalTimerQuantities['Other'] = growerData.timerQuantities[timerOtherName];
        } else if (!finalTimerQuantities['Other']) {
          // Default to 1 if no quantity specified
          finalTimerQuantities['Other'] = '1';
        }
      }

      // Ensure all timer quantity values are strings
      Object.keys(finalTimerQuantities).forEach(key => {
        if (typeof finalTimerQuantities[key] !== 'string') {
          finalTimerQuantities[key] = String(finalTimerQuantities[key]);
        }
      });

      // Handle quantities for timer types that aren't in timerUsed
      // Remove quantities for timers that aren't in timerUsed (except "Other")
      Object.keys(finalTimerQuantities).forEach(timerKey => {
        if (timerKey !== 'Other' && !finalTimerUsed.includes(timerKey)) {
          delete finalTimerQuantities[timerKey];
        }
      });

      // DO NOT stringify selectedPlants here - let JSON.stringify handle it
      // Just ensure it's a valid array
      let finalSelectedPlants = growerData.selectedPlants;
      if (!Array.isArray(finalSelectedPlants)) {
        // If it's already a string (JSON), parse it
        if (typeof finalSelectedPlants === 'string') {
          try {
            finalSelectedPlants = JSON.parse(finalSelectedPlants);
          } catch (e) {
            finalSelectedPlants = [];
          }
        } else {
          finalSelectedPlants = [];
        }
      }

      // Store photo separately
      const photoFile = growerData.photoAtInstallation;

      // Create clean grower object
      const cleanGrower = {
        growerId: growerData.growerId,
        systemType: growerData.systemType || '',
        systemTypeOther: growerData.systemTypeOther || '',
        growerQuantity: growerData.growerQuantity || '',
        numPlants: growerData.numPlants || '',
        numLevels: growerData.numLevels || '',
        numChannelPerLevel: growerData.numChannelPerLevel || '',
        numHolesPerChannel: growerData.numHolesPerChannel || '',
        setupDimension: growerData.setupDimension || '',
        motorType: growerData.motorType || '',
        motorTypeOther: growerData.motorTypeOther || '',
        timerUsed: finalTimerUsed, // Use the processed array
        timerQuantities: finalTimerQuantities, // Object with "Other" key
        timerUsedOther: timerOtherName || '', // Custom timer name
        numLights: growerData.numLights || '',
        modelOfLight: growerData.modelOfLight || '',
        modelOfLightOther: growerData.modelOfLightOther || '',
        lengthOfLight: growerData.lengthOfLight || '',
        lengthOfLightOther: growerData.lengthOfLightOther || '',
        tankCapacity: growerData.tankCapacity || '',
        tankCapacityOther: growerData.tankCapacityOther || '',
        nutritionGiven: growerData.nutritionGiven || '',
        otherSpecifications: growerData.otherSpecifications || '',
        selectedPlants: finalSelectedPlants // Array, not string
      };

      return {
        cleanGrower,
        photoFile,
        index
      };
    });

    // Extract clean growers for JSON
    const growersForJson = processedGrowers.map(item => item.cleanGrower);

    // Append growers as JSON
    formPayload.append("growers", JSON.stringify(growersForJson));

    // Append photos separately
    processedGrowers.forEach(item => {
      const { photoFile, index } = item;
      if (photoFile instanceof File) {
        formPayload.append(`photoAtInstallation_${index}`, photoFile);
      } else if (typeof photoFile === 'string' && photoFile) {
        formPayload.append(`existing_photo_${index}`, photoFile);
      }
    });

    // Debug logging
    console.log("=== FORM PAYLOAD DEBUG ===");
    console.log("Full processed growers array:", growersForJson);

    // Check data types
    growersForJson.forEach((grower, index) => {
      console.log(`\nGrower ${index}:`);
      console.log(`timerUsed:`, grower.timerUsed);
      console.log(`timerQuantities:`, grower.timerQuantities);
      console.log(`timerUsedOther:`, grower.timerUsedOther);
    });

    console.log("\nFinal growers JSON to send:");
    console.log(JSON.stringify(growersForJson, null, 2));

    // Log FormData entries
    console.log("\nFormData entries:");
    for (let pair of formPayload.entries()) {
      if (pair[0] === 'growers') {
        try {
          const parsed = JSON.parse(pair[1]);
          console.log("growers (parsed):", parsed);
        } catch (e) {
          console.log("growers (raw):", pair[1]);
        }
      } else if (!(pair[1] instanceof File)) {
        console.log(pair[0] + ": ", pair[1]);
      } else {
        console.log(pair[0] + ": [File]");
      }
    }

    try {
      // Actual API call
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}api/customer.php`,
        {
          method: "POST",
          body: formPayload
        }
      );

      const result = await response.json();
      console.log("Server response:", result);

      if (result.status === "success") {
        toast.success(result.message);
        setErrors({});
      } else {
        toast.error(result.error || "Something went wrong");
        console.error("Server error details:", result);
      }

    } catch (error) {
      toast.error("Error submitting form");
      console.error("Error submitting form:", error);
    } finally {
      setLoading(false);
    }
  };

  const [cities, setCities] = useState([]);
  const statesAndCities = {};

 const handleStateChange = (e) => {
  const selectedState = e.target.value;

  const stateObj = statesData.find(
    (item) => item.state === selectedState
  );

  setFormData((prev) => ({
    ...prev,
    state: selectedState,
    city: "",
  }));

  setCities(stateObj?.cities || []);
};


  const nextStep = () => {
    if (phoneExists && currentStep === 1) {
      toast.error("Phone number already exists. Please use a different number.");
      return;
    }

    if (validateStep()) setCurrentStep(prev => Math.min(prev + 1, 3));
  };

  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  // Add download function
  const downloadReviewAsImage = async () => {
    if (!reviewRef.current) return;

    try {
      toast.info("Generating image... Please wait.");

      const canvas = await html2canvas(reviewRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: reviewRef.current.scrollWidth,
        height: reviewRef.current.scrollHeight,
        scrollY: -window.scrollY
      });

      const image = canvas.toDataURL('image/png', 1.0);

      const link = document.createElement('a');
      const fileName = `customer-review-${formData.name || 'customer'}-${Date.now()}.png`;
      link.download = fileName;
      link.href = image;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`Review downloaded as ${fileName}`);
    } catch (error) {
      console.error("Error downloading review:", error);
      toast.error("Failed to download review. Please try again.");
    }
  };

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
                className={`px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:outline-none transition ${errors.name
                  ? "border-red-500 focus:ring-red-400"
                  : "border-gray-300 focus:ring-blue-400"
                  }`}
              />
              {errors.name && <span className="text-red-500 text-sm mt-1">{errors.name}</span>}
            </div>

            {/* Email */}
            <div className="flex flex-col">
              <label className="mb-1 font-medium text-gray-700">
                Email (ईमेल)
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter email"
                className={`px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:outline-none transition ${errors.email
                  ? "border-red-500 focus:ring-red-400"
                  : "border-gray-300 focus:ring-blue-400"
                  }`}
              />
              {errors.email && <span className="text-red-500 text-sm mt-1">{errors.email}</span>}
            </div>

            {/* Phone Number */}
            <div className="flex flex-col">
              <label className="mb-1 font-medium text-gray-700">
                Phone Number (फ़ोन नंबर) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                placeholder="Enter phone number"
                maxLength={13}
                className={`px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:outline-none transition ${errors.phoneNumber
                  ? "border-red-500 focus:ring-red-400"
                  : "border-gray-300 focus:ring-blue-400"
                  }`}
              />
              {errors.phoneNumber && (
                <span className="text-red-500 text-sm mt-1">{errors.phoneNumber}</span>
              )}
            </div>

            {/* Staff Phone Number */}
            <div className="flex flex-col">
              <label className="mb-1 font-medium text-gray-700">
                Alternate Phone Number (स्टाफ फ़ोन नंबर)
              </label>
              <input
                type="tel"
                name="staffPhoneNumber"
                value={formData.staffPhoneNumber}
                onChange={handleInputChange}
                placeholder="Enter staff phone"
                className={`px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:outline-none transition ${errors.staffPhoneNumber
                  ? "border-red-500 focus:ring-red-400"
                  : "border-gray-300 focus:ring-blue-400"
                  }`}
              />
              {errors.staffPhoneNumber && (
                <span className="text-red-500 text-sm mt-1">{errors.staffPhoneNumber}</span>
              )}
            </div>

            {/* Profile Pic */}
            <div className="flex flex-col">
              <label className="mb-1 font-medium text-gray-700">
                Profile Pic (प्रोफ़ाइल चित्र)
              </label>
              {formData.profilePic && typeof formData.profilePic === "string" && (
                <img
                  src={`${import.meta.env.VITE_API_URL}uploads/customers/${formData.profilePic}`}
                  alt="Profile"
                  className="w-24 h-24 object-cover rounded-full mb-2 border"
                />
              )}
              <input
                type="file"
                name="profilePic"
                onChange={(e) =>
                  setFormData({ ...formData, profilePic: e.target.files[0] })
                }
                accept="image/*"
                className={`px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:outline-none transition ${errors.profilePic
                  ? "border-red-500 focus:ring-red-400"
                  : "border-gray-300 focus:ring-blue-400"
                  }`}
              />
              {errors.profilePic && (
                <span className="text-red-500 text-sm mt-1">{errors.profilePic}</span>
              )}
            </div>

            {/* State */}
            <div className="flex flex-col">
              <label className="mb-1 font-medium text-gray-700">
                State (राज्य) <span className="text-red-500">*</span>
              </label>

              <select
                name="state"
                value={formData.state}
                onChange={handleStateChange}
                className={`px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:outline-none transition ${errors.state
                  ? "border-red-500 focus:ring-red-400"
                  : "border-gray-300 focus:ring-blue-400"
                  }`}
              >
                <option value="" disabled>
                  Select state
                </option>

                {statesData.map((item) => (
                  <option key={item.state} value={item.state}>
                    {item.state}
                  </option>
                ))}
              </select>

              {errors.state && (
                <span className="text-red-500 text-sm mt-1">
                  {errors.state}
                </span>
              )}
            </div>

            {/* City */}
            <div className="flex flex-col">
              <label className="mb-1 font-medium text-gray-700">
                City (शहर) <span className="text-red-500">*</span>
              </label>

              <select
                name="city"
                value={formData.city}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    city: e.target.value,
                  }))
                }
                disabled={!cities.length}
                className={`px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:outline-none transition ${errors.city
                    ? "border-red-500 focus:ring-red-400"
                    : "border-gray-300 focus:ring-blue-400"
                  }`}
              >
                <option value="" disabled>
                  Select city
                </option>

                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>

              {errors.city && (
                <span className="text-red-500 text-sm mt-1">
                  {errors.city}
                </span>
              )}
            </div>


            {/* Locality */}
            <div className="flex flex-col">
              <label className="mb-1 font-medium text-gray-700">
                Locality (इलाका) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="locality"
                value={formData.locality}
                onChange={handleInputChange}
                placeholder="Eg - Andheri."
                className={`px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:outline-none transition ${errors.locality
                  ? "border-red-500 focus:ring-red-400"
                  : "border-gray-300 focus:ring-blue-400"
                  }`}
              />
              {errors.locality && (
                <span className="text-red-500 text-sm mt-1">{errors.locality}</span>
              )}
            </div>

            {/* Landmark */}
            <div className="flex flex-col">
              <label className="mb-1 font-medium text-gray-700">
                Landmark (लैंडमार्क) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="landmark"
                value={formData.landmark}
                onChange={handleInputChange}
                placeholder="Near City Mall"
                className={`px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:outline-none transition ${errors.landmark
                  ? "border-red-500 focus:ring-red-400"
                  : "border-gray-300 focus:ring-blue-400"
                  }`}
              />
              {errors.landmark && (
                <span className="text-red-500 text-sm mt-1">{errors.landmark}</span>
              )}
            </div>

            {/* Pincode */}
            <div className="flex flex-col">
              <label className="mb-1 font-medium text-gray-700">
                Pincode (पिनकोड) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="pincode"
                value={formData.pincode}
                onChange={handleInputChange}
                placeholder="Enter pincode"
                className={`px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:outline-none transition ${errors.pincode
                  ? "border-red-500 focus:ring-red-400"
                  : "border-gray-300 focus:ring-blue-400"
                  }`}
              />
              {errors.pincode && (
                <span className="text-red-500 text-sm mt-1">{errors.pincode}</span>
              )}
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
                className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:outline-none transition ${errors.address
                  ? "border-red-500 focus:ring-red-400"
                  : "border-gray-300 focus:ring-blue-400"
                  }`}
              />
              {errors.address && (
                <span className="text-red-500 text-sm mt-1">{errors.address}</span>
              )}
            </div>

            {/* Active Checkbox */}
            <div className="flex items-center md:col-span-2">
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
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-8 px-6 py-6">
            {growers.map((grower, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                <h3 className="text-lg font-semibold mb-4 text-gray-700">Grower {index + 1}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* System Type */}
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
                      <option value="" disabled>Select system type</option>
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

                  {/* Grower Quantity */}
                  <div className="flex flex-col">
                    <label className="mb-1 font-medium text-gray-700">
                      Quantity of Grower (उत्पादक की मात्रा) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="growerQuantity"
                      value={grower.growerQuantity}
                      onChange={(e) => handleGrowerChange(index, e)}
                      min="1"
                      className={`px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:outline-none transition ${errors[`growerQuantity_${index}`] ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'}`}
                    />
                    {errors[`growerQuantity_${index}`] && <span className="text-red-500 text-sm mt-1">{errors[`growerQuantity_${index}`]}</span>}
                  </div>

                  {/* Number of Plants */}
                  <div className="flex flex-col">
                    <label className="mb-1 font-medium text-gray-700">
                      No. of Plants (पौधों की संख्या) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="numPlants"
                      value={grower.numPlants}
                      onChange={(e) => handleGrowerChange(index, e)}
                      min="0"
                      className={`px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:outline-none transition ${errors[`numPlants_${index}`] ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'}`}
                    />
                    {errors[`numPlants_${index}`] && <span className="text-red-500 text-sm mt-1">{errors[`numPlants_${index}`]}</span>}
                  </div>

                  {/* Number of Levels */}
                  <div className="flex flex-col">
                    <label className="mb-1 font-medium text-gray-700">
                      No. of Levels (स्तरों की संख्या) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="numLevels"
                      value={grower.numLevels}
                      onChange={(e) => handleGrowerChange(index, e)}
                      min="0"
                      className={`px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:outline-none transition ${errors[`numLevels_${index}`] ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'}`}
                    />
                    {errors[`numLevels_${index}`] && <span className="text-red-500 text-sm mt-1">{errors[`numLevels_${index}`]}</span>}
                  </div>

                  {/* Number of Channels per Level */}
                  <div className="flex flex-col">
                    <label className="mb-1 font-medium text-gray-700">
                      No. of Channels per Level <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="numChannelPerLevel"
                      value={grower.numChannelPerLevel}
                      onChange={(e) => handleGrowerChange(index, e)}
                      min="0"
                      className={`px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:outline-none transition ${errors[`numChannelPerLevel_${index}`] ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'}`}
                    />
                    {errors[`numChannelPerLevel_${index}`] && <span className="text-red-500 text-sm mt-1">{errors[`numChannelPerLevel_${index}`]}</span>}
                  </div>

                  {/* Number of Holes per Channel */}
                  <div className="flex flex-col">
                    <label className="mb-1 font-medium text-gray-700">
                      No. of Holes per Channel <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="numHolesPerChannel"
                      value={grower.numHolesPerChannel}
                      onChange={(e) => handleGrowerChange(index, e)}
                      min="0"
                      className={`px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:outline-none transition ${errors[`numHolesPerChannel_${index}`] ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'}`}
                    />
                    {errors[`numHolesPerChannel_${index}`] && <span className="text-red-500 text-sm mt-1">{errors[`numHolesPerChannel_${index}`]}</span>}
                  </div>

                  {/* Setup Dimension */}
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

                  {/* Motor Used */}
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
                      <option value="" disabled>Select motor</option>
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

                  {/* Timer Used Section - FIXED */}
                  <div className="flex flex-col md:col-span-2">
                    <label className="mb-1 font-medium text-gray-700">
                      Timer Used <span className="text-red-500">*</span>
                    </label>

                    <Select
                      isMulti
                      options={timerOptions.map(option => ({ value: option, label: option }))}
                      value={grower.timerUsed?.map(option => ({ value: option, label: option })) || []}
                      onChange={(selectedOptions) => handleTimerSelectChange(index, selectedOptions)}
                      classNamePrefix="react-select"
                      placeholder="Select timer(s)..."
                      styles={{
                        menu: (provided) => ({ ...provided, zIndex: 9999 }),
                      }}
                    />
                    {errors[`timerUsed_${index}`] && <span className="text-red-500 text-sm mt-1">{errors[`timerUsed_${index}`]}</span>}

                    {/* Quantity fields for selected timers */}
                    {grower.timerUsed && grower.timerUsed.length > 0 && (
                      <div className="mt-4 space-y-3">
                        <h4 className="font-medium text-gray-700 mb-2">Timer Quantities:</h4>
                        {grower.timerUsed.map((timer, timerIndex) => (
                          <div key={timerIndex} className="flex items-center gap-3">
                            <div className="w-1/3">
                              <label className="mb-1 text-sm font-medium text-gray-600">
                                {timer === 'Other' ? 'Other Timer' : timer}
                              </label>
                            </div>
                            <div className="w-2/3">
                              <input
                                type="number"
                                min="1"
                                placeholder="Quantity"
                                // For "Other" timer, always use the quantity from timerQuantities.Other
                                value={timer === 'Other'
                                  ? (grower.timerQuantities?.['Other'] || '')
                                  : (grower.timerQuantities?.[timer] || '')
                                }
                                onChange={(e) => {
                                  // Always use "Other" as the key for Other timer quantity
                                  const timerKey = timer === 'Other' ? 'Other' : timer;
                                  handleTimerQuantityChange(index, timerKey, e.target.value);
                                }}
                                className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:outline-none transition ${errors[`timerQuantity_${timer}_${index}`]
                                  ? 'border-red-500 focus:ring-red-400'
                                  : 'border-gray-300 focus:ring-blue-400'
                                  }`}
                              />
                              {errors[`timerQuantity_${timer}_${index}`] && (
                                <span className="text-red-500 text-sm mt-1">{errors[`timerQuantity_${timer}_${index}`]}</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Other timer specification field - SHOWING CUSTOM TIMER NAME */}
                    {grower.timerUsed?.includes('Other') && (
                      <div className="mt-4">
                        <input
                          type="text"
                          name="timerUsedOther"
                          value={grower.timerUsedOther || ''}
                          onChange={(e) => handleGrowerChange(index, e)}
                          placeholder="Specify other timer"
                          className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:outline-none transition ${errors[`timerUsedOther_${index}`]
                            ? 'border-red-500 focus:ring-red-400'
                            : 'border-gray-300 focus:ring-blue-400'
                            }`}
                        />
                        {errors[`timerUsedOther_${index}`] && (
                          <span className="text-red-500 text-sm mt-1">{errors[`timerUsedOther_${index}`]}</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Number of Lights */}
                  <div className="flex flex-col">
                    <label className="mb-1 font-medium text-gray-700">
                      No. of Lights <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="numLights"
                      value={grower.numLights}
                      onChange={(e) => handleGrowerChange(index, e)}
                      min="0"
                      className={`px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:outline-none transition ${errors[`numLights_${index}`] ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'}`}
                    />
                    {errors[`numLights_${index}`] && <span className="text-red-500 text-sm mt-1">{errors[`numLights_${index}`]}</span>}
                  </div>

                  {/* Model of Lights */}
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
                      <option value="" disabled>Select Model of Light</option>
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

                  {/* Length of Lights */}
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
                      <option value="" disabled>Select Length of Lights</option>
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

                  {/* Tank Capacity */}
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
                      <option value="" disabled>Select Tank Capacity</option>
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

                  {/* Nutrition Given */}
                  <div className="flex flex-col">
                    <label className="mb-1 font-medium text-gray-700">
                      Nutrition Given <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="nutritionGiven"
                      value={grower.nutritionGiven}
                      onChange={(e) => handleGrowerChange(index, e)}
                      min="0"
                      className={`px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:outline-none transition ${errors[`nutritionGiven_${index}`] ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'}`}
                    />
                    {errors[`nutritionGiven_${index}`] && <span className="text-red-500 text-sm mt-1">{errors[`nutritionGiven_${index}`]}</span>}
                  </div>

                  {/* Other Specifications */}
                  <div className="flex flex-col">
                    <label className="mb-1 font-medium text-gray-700">
                      Other Specifications <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="otherSpecifications"
                      value={grower.otherSpecifications}
                      onChange={(e) => handleGrowerChange(index, e)}
                      min="0"
                      className={`px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:outline-none transition ${errors[`otherSpecifications_${index}`] ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'}`}
                    />
                    {errors[`otherSpecifications_${index}`] && <span className="text-red-500 text-sm mt-1">{errors[`otherSpecifications_${index}`]}</span>}
                  </div>

                  {/* Photo at Installation */}
                  <div className="flex flex-col">
                    <label className="mb-1 font-medium text-gray-700">
                      Photo at Time of Installation
                    </label>
                    {grower.photoAtInstallation && typeof grower.photoAtInstallation === "string" && (
                      <img
                        src={`${import.meta.env.VITE_API_URL}uploads/customers/${grower.photoAtInstallation}`}
                        alt="Installation Photo"
                        className="w-24 h-24 object-cover rounded-full mb-2 border"
                      />
                    )}
                    <input
                      type="file"
                      name="photoAtInstallation"
                      onChange={(e) =>
                        handleGrowerChange(index, e, 'photoAtInstallation', e.target.files[0])
                      }
                      className={`px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:outline-none transition ${errors[`photoAtInstallation_${index}`]
                        ? 'border-red-500 focus:ring-red-400'
                        : 'border-gray-300 focus:ring-blue-400'
                        }`}
                    />
                  </div>

                  {/* Plants Chosen */}
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
                    />
                    {errors[`selectedPlants_${index}`] && (
                      <span className="text-red-500 text-sm mt-1">{errors[`selectedPlants_${index}`]}</span>
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
            <div className="flex justify-between items-center mb-6">
              <h3 className="md:text-2xl sm:text-xl font-bold text-gray-800">Review Your Information</h3>
              <button
                type="button"
                onClick={downloadReviewAsImage}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-lg flex items-center gap-2 transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                </svg>
                Download Review
              </button>
            </div>

            {/* Wrap the review content in a div with ref for capturing */}
            <div ref={reviewRef}>
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
                      <span className="font-medium text-gray-600">Locality: </span>
                      {formData.locality}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-800">
                      <span className="font-medium text-gray-600">Pincode: </span>
                      {formData.pincode}
                    </p>
                  </div>
                  {formData.landmark && (
                    <div className="md:col-span-2">
                      <p className="text-gray-800">
                        <span className="font-medium text-gray-600">Landmark: </span>
                        {formData.landmark}
                      </p>
                    </div>
                  )}
                  <div className="md:col-span-2">
                    <p className="text-gray-800">
                      <span className="font-medium text-gray-600">Address: </span>
                      {formData.address}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-800">
                      <span className="font-medium text-gray-600">Profile Pic:</span>{" "}
                      {formData.profilePic ? (
                        <span>
                          {typeof formData.profilePic === "string"
                            ? formData.profilePic.split("/").pop()
                            : formData.profilePic.name}
                        </span>
                      ) : (
                        "No file uploaded"
                      )}
                    </p>

                    {formData.profilePic && (
                      <img
                        src={
                          typeof formData.profilePic === "string"
                            ? `${import.meta.env.VITE_API_URL}uploads/customers/${formData.profilePic}`
                            : URL.createObjectURL(formData.profilePic)
                        }
                        alt="Profile Pic"
                        className="w-24 h-24 object-cover rounded-md mt-2 border border-gray-300 shadow-sm"
                      />
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <p className="text-gray-800">
                      <span className="font-medium text-gray-600">Status: </span>
                      <span
                        className={`font-semibold ${formData.isActive ? "text-green-600" : "text-red-600"
                          }`}
                      >
                        {formData.isActive ? "Active" : "Inactive"}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-6 bg-gray-50 mt-6">
                <h4 className="text-lg font-semibold mb-4 text-gray-700">Grower Information</h4>

                {growers && growers.length > 0 ? (
                  growers.map((grower, index) => (
                    <div key={index} className="mb-6 last:mb-0">
                      <h5 className="font-semibold text-gray-700 mb-3">
                        Grower {index + 1}
                      </h5>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-gray-800">
                            <span className="font-medium text-gray-600">System Type: </span>
                            {grower.systemType === "Other"
                              ? grower.systemTypeOther
                              : grower.systemType}
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
                            <span className="font-medium text-gray-600">No. of Channels per Level: </span>
                            {grower.numChannelPerLevel}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-800">
                            <span className="font-medium text-gray-600">No. of Holes per Channel: </span>
                            {grower.numHolesPerChannel}
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
                            {grower.motorType === "Other"
                              ? grower.motorTypeOther
                              : grower.motorType}
                          </p>
                        </div>

                        {/* Timer Used in Review - FIXED */}
                        <div className="md:col-span-2">
                          <p className="text-gray-800">
                            <span className="font-medium text-gray-600">Timer Used: </span>
                            {grower.timerUsed && grower.timerUsed.length > 0 ? (
                              <ul className="list-disc pl-5 mt-1">
                                {grower.timerUsed.map((timer, idx) => (
                                  <li key={idx} className="text-gray-800">
                                    {timer === 'Other' && grower.timerUsedOther ? grower.timerUsedOther : timer}:
                                    <span className="font-semibold ml-1">
                                      {grower.timerQuantities?.[timer === 'Other' ? 'Other' : timer] || '0'} qty
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            ) : 'N/A'}
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
                            {grower.modelOfLight === "Other"
                              ? grower.modelOfLightOther
                              : grower.modelOfLight}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-800">
                            <span className="font-medium text-gray-600">Length of Lights: </span>
                            {grower.lengthOfLight === "Other"
                              ? grower.lengthOfLightOther
                              : grower.lengthOfLight}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-800">
                            <span className="font-medium text-gray-600">Tank Capacity: </span>
                            {grower.tankCapacity === "Other"
                              ? grower.tankCapacityOther
                              : grower.tankCapacity}
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
                            {grower.otherSpecifications || "N/A"}
                          </p>
                        </div>

                        <div>
                          <p className="text-gray-800">
                            <span className="font-medium text-gray-600">
                              Photo at Time of Installation:
                            </span>{" "}
                            {grower.photoAtInstallation ? (
                              <span>
                                {typeof grower.photoAtInstallation === "string"
                                  ? grower.photoAtInstallation.split("/").pop()
                                  : grower.photoAtInstallation.name}
                              </span>
                            ) : (
                              "No file uploaded"
                            )}
                          </p>

                          {grower.photoAtInstallation && (
                            <img
                              src={
                                typeof grower.photoAtInstallation === "string"
                                  ? `${import.meta.env.VITE_API_URL}uploads/customers/${grower.photoAtInstallation}`
                                  : URL.createObjectURL(grower.photoAtInstallation)
                              }
                              alt="Installation Preview"
                              className="w-24 h-24 object-cover rounded-md mt-2 border border-gray-300 shadow-sm"
                            />
                          )}
                        </div>

                        <div className="md:col-span-2">
                          <p className="text-gray-800">
                            <span className="font-medium text-gray-600">Plants Chosen: </span>
                            {grower.selectedPlants && grower.selectedPlants.length > 0
                              ? grower.selectedPlants.map((p) => p.label).join(", ")
                              : "N/A"}
                          </p>
                        </div>
                      </div>

                      {index < growers.length - 1 && (
                        <hr className="my-4 border-gray-300" />
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600 italic">No grower information added yet.</p>
                )}
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
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Edit a Customer </h2>
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
                </div>

                {/* Navigation Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="btn-primary ml-auto"
                  >
                    Previous(पिछला)
                  </button>

                  <button
                    type="button"
                    onClick={nextStep}
                    disabled={phoneExists}
                    className={`btn-primary ml-auto ${phoneExists ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    Next(आगे)
                  </button>
                </div>
              </div>
            ) : (
              // Other Step Buttons
              <div className="flex flex-col md:flex-row justify-between w-full gap-3">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="btn-primary "
                  >
                    Previous(पिछला)
                  </button>
                )}

                {currentStep < 3 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    disabled={currentStep === 1 && phoneExists}
                    className={`btn-primary ml-auto ${currentStep === 1 && phoneExists ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    Next (आगे)
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={loading}
                    onClick={handleSubmit}
                    className={`btn-primary ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
                  >
                    {loading ? "Please wait..." : "Submit(जमा करें)"}
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