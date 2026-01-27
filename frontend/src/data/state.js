const statesData = [
  {
    state: "Andhra Pradesh",
    cities: ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Tirupati", "Kakinada", "Rajahmundry", "Kadapa", "Anantapur", "Srikakulam"],
  },
  {
    state: "Arunachal Pradesh",
    cities: ["Itanagar", "Naharlagun", "Pasighat", "Ziro", "Roing"],
  },
  {
    state: "Assam",
    cities: ["Guwahati", "Dibrugarh", "Silchar", "Jorhat", "Tezpur", "Nagaon", "Tinsukia", "Bongaigaon"],
  },
  {
    state: "Bihar",
    cities: ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Darbhanga", "Purnia", "Bihar Sharif", "Begusarai"],
  },
  {
    state: "Chhattisgarh",
    cities: ["Raipur", "Bilaspur", "Durg", "Korba", "Bhilai", "Jagdalpur", "Ambikapur", "Raigarh"],
  },
  {
    state: "Goa",
    cities: ["Panaji", "Margao", "Vasco da Gama", "Mapusa", "Ponda", "Benaulim"],
  },
  {
    state: "Gujarat",
    cities: ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Gandhinagar", "Jamnagar", "Junagadh", "Anand", "Navsari"],
  },
  {
    state: "Haryana",
    cities: ["Gurgaon", "Faridabad", "Panipat", "Ambala", "Karnal", "Sonipat", "Yamunanagar", "Rohtak", "Hisar"],
  },
  {
    state: "Himachal Pradesh",
    cities: ["Shimla", "Manali", "Dharamshala", "Solan", "Mandi", "Kullu", "Palampur", "Chamba"],
  },
  {
    state: "Jharkhand",
    cities: ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Deoghar", "Giridih", "Hazaribagh", "Bhubaneswari"],
  },
  {
    state: "Karnataka",
    cities: ["Bengaluru", "Mysuru", "Mangaluru", "Hubli", "Belagavi", "Davangere", "Ballari", "Kalaburagi", "Shimoga"],
  },
  {
    state: "Kerala",
    cities: ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Alappuzha", "Kollam", "Palakkad", "Kannur", "Kottayam"],
  },
  {
    state: "Madhya Pradesh",
    cities: ["Bhopal", "Indore", "Jabalpur", "Gwalior", "Ujjain", "Sagar", "Satna", "Ratlam", "Rewa"],
  },
  {
    state: "Maharashtra",
    cities: ["Mumbai","Navi Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad", "Thane", "Solapur", "Kolhapur", "Nanded", "Amravati","Lonavala ","Alibaug"],
  },
  {
    state: "Manipur",
    cities: ["Imphal", "Thoubal", "Churachandpur"],
  },
  {
    state: "Meghalaya",
    cities: ["Shillong", "Tura", "Nongpoh"],
  },
  {
    state: "Mizoram",
    cities: ["Aizawl", "Lunglei", "Serchhip"],
  },
  {
    state: "Nagaland",
    cities: ["Kohima", "Dimapur", "Mokokchung", "Tuensang"],
  },
  {
    state: "Odisha",
    cities: ["Bhubaneswar", "Cuttack", "Rourkela", "Puri", "Berhampur", "Sambalpur", "Balasore"],
  },
  {
    state: "Punjab",
    cities: ["Chandigarh", "Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda", "Mohali"],
  },
  {
    state: "Rajasthan",
    cities: ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Bikaner", "Ajmer", "Alwar", "Bharatpur", "Sikar"],
  },
  {
    state: "Sikkim",
    cities: ["Gangtok", "Namchi", "Geyzing"],
  },
  {
    state: "Tamil Nadu",
    cities: ["Chennai", "Coimbatore", "Madurai", "Salem", "Tiruchirappalli", "Tirunelveli", "Erode", "Vellore", "Thoothukudi"],
  },
  {
    state: "Telangana",
    cities: ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Khammam", "Mahbubnagar", "Adilabad"],
  },
  {
    state: "Tripura",
    cities: ["Agartala", "Udaipur", "Dharmanagar"],
  },
  {
    state: "Uttar Pradesh",
    cities: ["Lucknow", "Kanpur", "Noida", "Ghaziabad", "Agra", "Varanasi", "Meerut", "Aligarh", "Mathura", "Moradabad"],
  },
  {
    state: "Uttarakhand",
    cities: ["Dehradun", "Haridwar", "Rishikesh", "Nainital", "Roorkee", "Haldwani", "Pithoragarh"],
  },
  {
    state: "West Bengal",
    cities: ["Kolkata", "Howrah", "Durgapur", "Siliguri", "Asansol", "Bardhaman", "Kharagpur", "Raiganj"],
  },

  // 🔹 Union Territories
  {
    state: "Delhi",
    cities: ["New Delhi", "Dwarka", "Rohini", "Saket", "Connaught Place", "Karol Bagh", "Janakpuri"],
  },
  {
    state: "Jammu and Kashmir",
    cities: ["Srinagar", "Jammu", "Anantnag", "Baramulla"],
  },
  {
    state: "Ladakh",
    cities: ["Leh", "Kargil", "Diskit"],
  },
  {
    state: "Chandigarh",
    cities: ["Chandigarh"],
  },
  {
    state: "Puducherry",
    cities: ["Puducherry", "Karaikal", "Mahe", "Yanam"],
  },
  {
    state: "Andaman and Nicobar Islands",
    cities: ["Port Blair", "Havelock Island"],
  },
  {
    state: "Dadra and Nagar Haveli and Daman and Diu",
    cities: ["Daman", "Silvassa", "Diu"],
  },
  {
    state: "Lakshadweep",
    cities: ["Kavaratti", "Agatti"],
  },
];

export default statesData;
