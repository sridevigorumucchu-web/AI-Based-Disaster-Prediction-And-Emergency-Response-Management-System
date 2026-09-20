export interface IndianState {
  name: string;
  type: 'State' | 'UT';
  lat: number;
  lng: number;
  capital: string;
  population: string;
  emergencyContacts: {
    disasterManagement: string;
    police: string;
    fire: string;
    ambulance: string;
  };
  districts: Record<string, {
    cities: string[];
    riskLevel: 'Green' | 'Yellow' | 'Orange' | 'Red';
    weather: { temp: number; rain: string; wind: number; humidity: number };
    disasters: {
      floodProb: number;
      cycloneProb: number;
      earthquakeProb: number;
      landslideProb: number;
      fireProb: number;
    };
  }>;
}

export interface VillageData {
  name: string;
  district: string;
  state: string;
  pinCode: string;
  lat: number;
  lng: number;
}

export interface SavedLocation {
  id: string;
  label: 'Home' | 'Office' | 'College' | 'Parents Home' | 'Village' | 'Favourite Places' | string;
  customName?: string;
  state: string;
  district: string;
  city: string;
  village?: string;
  pinCode: string;
  lat: number;
  lng: number;
}

// Bounding boxes coordinates for simplified state shapes to render an awesome vector map
export interface StateShape {
  id: string;
  name: string;
  points: [number, number][]; // lat, lng coordinates
  center: [number, number];
}

export const INDIAN_STATES_DATA: Record<string, IndianState> = {
  "Andhra Pradesh": {
    name: "Andhra Pradesh",
    type: "State",
    lat: 15.9129,
    lng: 79.7400,
    capital: "Amaravati",
    population: "53.2 Million",
    emergencyContacts: { disasterManagement: "1070", police: "100", fire: "101", ambulance: "108" },
    districts: {
      "Visakhapatnam": {
        cities: ["Visakhapatnam City", "Gajuwaka", "Anakapalle", "Bheemunipatnam"],
        riskLevel: "Orange",
        weather: { temp: 31, rain: "Moderate Rain", wind: 28, humidity: 82 },
        disasters: { floodProb: 45, cycloneProb: 75, earthquakeProb: 15, landslideProb: 25, fireProb: 10 }
      },
      "Krishna": {
        cities: ["Vijayawada", "Machilipatnam", "Gudivada", "Nuzvid", "Jaggayyapeta"],
        riskLevel: "Red",
        weather: { temp: 29, rain: "Heavy Downpours", wind: 35, humidity: 90 },
        disasters: { floodProb: 88, cycloneProb: 65, earthquakeProb: 10, landslideProb: 5, fireProb: 5 }
      },
      "East Godavari": {
        cities: ["Rajahmundry", "Kakinada", "Mandapeta", "Samalkot"],
        riskLevel: "Orange",
        weather: { temp: 30, rain: "Heavy Rain", wind: 22, humidity: 85 },
        disasters: { floodProb: 70, cycloneProb: 60, earthquakeProb: 5, landslideProb: 10, fireProb: 8 }
      },
      "Guntur": {
        cities: ["Guntur City", "Tenali", "Narasaraopet", "Bapatla"],
        riskLevel: "Yellow",
        weather: { temp: 32, rain: "Light Drizzle", wind: 18, humidity: 75 },
        disasters: { floodProb: 35, cycloneProb: 40, earthquakeProb: 8, landslideProb: 5, fireProb: 15 }
      },
      "Kurnool": {
        cities: ["Kurnool City", "Adoni", "Nandyal", "Yemmiganur"],
        riskLevel: "Green",
        weather: { temp: 34, rain: "Cloudy", wind: 12, humidity: 60 },
        disasters: { floodProb: 15, cycloneProb: 10, earthquakeProb: 12, landslideProb: 8, fireProb: 25 }
      },
      "Chittoor": {
        cities: ["Chittoor City", "Tirupati", "Madanapalle", "Srikalahasti"],
        riskLevel: "Yellow",
        weather: { temp: 30, rain: "Partly Cloudy", wind: 14, humidity: 65 },
        disasters: { floodProb: 20, cycloneProb: 35, earthquakeProb: 15, landslideProb: 20, fireProb: 10 }
      },
      "Anantapur": {
        cities: ["Anantapur City", "Hindupur", "Dharmavaram", "Guntakal"],
        riskLevel: "Green",
        weather: { temp: 36, rain: "Sunny", wind: 10, humidity: 45 },
        disasters: { floodProb: 5, cycloneProb: 5, earthquakeProb: 10, landslideProb: 2, fireProb: 40 }
      },
      "NTR": {
        cities: ["Vijayawada Rural", "Mylavaram", "Nandigama", "Tiruvuru"],
        riskLevel: "Orange",
        weather: { temp: 29, rain: "Showers", wind: 24, humidity: 80 },
        disasters: { floodProb: 65, cycloneProb: 30, earthquakeProb: 8, landslideProb: 10, fireProb: 5 }
      },
      "Prakasam": {
        cities: ["Ongole", "Chirala", "Markapur", "Kandukur"],
        riskLevel: "Yellow",
        weather: { temp: 33, rain: "Cloudy", wind: 20, humidity: 70 },
        disasters: { floodProb: 30, cycloneProb: 50, earthquakeProb: 10, landslideProb: 5, fireProb: 18 }
      },
      "Sri Sathya Sai": {
        cities: ["Puttaparthi", "Kadiri", "Penukonda", "Dharmavaram Rural"],
        riskLevel: "Green",
        weather: { temp: 33, rain: "Clear Sky", wind: 12, humidity: 55 },
        disasters: { floodProb: 10, cycloneProb: 15, earthquakeProb: 10, landslideProb: 5, fireProb: 30 }
      },
      "Vizianagaram": {
        cities: ["Vizianagaram City", "Bobbili", "Parvathipuram", "Salur"],
        riskLevel: "Orange",
        weather: { temp: 28, rain: "Heavy Rainfall", wind: 26, humidity: 88 },
        disasters: { floodProb: 60, cycloneProb: 70, earthquakeProb: 12, landslideProb: 35, fireProb: 5 }
      },
      "YSR Kadapa": {
        cities: ["Kadapa City", "Proddatur", "Pulivendula", "Rayachoty"],
        riskLevel: "Green",
        weather: { temp: 35, rain: "Sunny", wind: 11, humidity: 50 },
        disasters: { floodProb: 12, cycloneProb: 15, earthquakeProb: 8, landslideProb: 10, fireProb: 28 }
      }
    }
  },
  "Tamil Nadu": {
    name: "Tamil Nadu",
    type: "State",
    lat: 11.1271,
    lng: 78.6569,
    capital: "Chennai",
    population: "72.1 Million",
    emergencyContacts: { disasterManagement: "1070", police: "100", fire: "101", ambulance: "108" },
    districts: {
      "Chennai": {
        cities: ["Chennai City", "Tambaram", "Ambattur", "Avadi"],
        riskLevel: "Red",
        weather: { temp: 30, rain: "Extreme Rain", wind: 42, humidity: 92 },
        disasters: { floodProb: 95, cycloneProb: 85, earthquakeProb: 15, landslideProb: 2, fireProb: 5 }
      },
      "Coimbatore": {
        cities: ["Coimbatore City", "Pollachi", "Mettupalayam", "Valparai"],
        riskLevel: "Green",
        weather: { temp: 26, rain: "Light Showers", wind: 16, humidity: 70 },
        disasters: { floodProb: 15, cycloneProb: 5, earthquakeProb: 20, landslideProb: 40, fireProb: 12 }
      },
      "Madurai": {
        cities: ["Madurai City", "Thirumangalam", "Melur", "Usilampatti"],
        riskLevel: "Yellow",
        weather: { temp: 32, rain: "Cloudy", wind: 15, humidity: 65 },
        disasters: { floodProb: 25, cycloneProb: 20, earthquakeProb: 10, landslideProb: 5, fireProb: 20 }
      },
      "Nilgiris": {
        cities: ["Ooty", "Coonoor", "Gudalur", "Kotagiri"],
        riskLevel: "Orange",
        weather: { temp: 16, rain: "Heavy Downpours", wind: 28, humidity: 95 },
        disasters: { floodProb: 35, cycloneProb: 15, earthquakeProb: 25, landslideProb: 90, fireProb: 2 }
      },
      "Cuddalore": {
        cities: ["Cuddalore City", "Chidambaram", "Panruti", "Virudhachalam"],
        riskLevel: "Red",
        weather: { temp: 28, rain: "Cyclonic Storm", wind: 55, humidity: 94 },
        disasters: { floodProb: 85, cycloneProb: 95, earthquakeProb: 10, landslideProb: 5, fireProb: 5 }
      }
    }
  },
  "Karnataka": {
    name: "Karnataka",
    type: "State",
    lat: 15.3173,
    lng: 75.7139,
    capital: "Bengaluru",
    population: "61.1 Million",
    emergencyContacts: { disasterManagement: "1070", police: "112", fire: "101", ambulance: "108" },
    districts: {
      "Bengaluru Urban": {
        cities: ["Bengaluru City", "Yelahanka", "Kengeri", "Whitefield"],
        riskLevel: "Yellow",
        weather: { temp: 27, rain: "Thunderstorms", wind: 20, humidity: 80 },
        disasters: { floodProb: 55, cycloneProb: 5, earthquakeProb: 15, landslideProb: 5, fireProb: 10 }
      },
      "Dakshina Kannada": {
        cities: ["Mangaluru", "Ullal", "Puttur", "Bantwal"],
        riskLevel: "Orange",
        weather: { temp: 28, rain: "Torrential Rain", wind: 30, humidity: 90 },
        disasters: { floodProb: 75, cycloneProb: 40, earthquakeProb: 18, landslideProb: 65, fireProb: 5 }
      },
      "Kodagu": {
        cities: ["Madikeri", "Somwarpet", "Virajpet", "Kushalnagar"],
        riskLevel: "Red",
        weather: { temp: 20, rain: "Monsoon Downpours", wind: 26, humidity: 98 },
        disasters: { floodProb: 60, cycloneProb: 10, earthquakeProb: 22, landslideProb: 95, fireProb: 2 }
      },
      "Mysuru": {
        cities: ["Mysuru City", "Nanjangud", "Hunsur", "T. Narasipura"],
        riskLevel: "Green",
        weather: { temp: 29, rain: "Light Rain", wind: 14, humidity: 72 },
        disasters: { floodProb: 20, cycloneProb: 5, earthquakeProb: 12, landslideProb: 10, fireProb: 15 }
      }
    }
  },
  "Maharashtra": {
    name: "Maharashtra",
    type: "State",
    lat: 19.7515,
    lng: 75.7139,
    capital: "Mumbai",
    population: "112.4 Million",
    emergencyContacts: { disasterManagement: "108", police: "100", fire: "101", ambulance: "102" },
    districts: {
      "Mumbai City": {
        cities: ["Mumbai South", "Colaba", "Dadar", "Byculla"],
        riskLevel: "Red",
        weather: { temp: 29, rain: "Cloudburst", wind: 48, humidity: 95 },
        disasters: { floodProb: 98, cycloneProb: 70, earthquakeProb: 25, landslideProb: 10, fireProb: 15 }
      },
      "Pune": {
        cities: ["Pune City", "Pimpri-Chinchwad", "Lonavala", "Baramati"],
        riskLevel: "Yellow",
        weather: { temp: 26, rain: "Showers", wind: 18, humidity: 78 },
        disasters: { floodProb: 40, cycloneProb: 15, earthquakeProb: 20, landslideProb: 35, fireProb: 12 }
      },
      "Ratnagiri": {
        cities: ["Ratnagiri Town", "Chiplun", "Dapoli", "Guhagar"],
        riskLevel: "Orange",
        weather: { temp: 27, rain: "Extremely Heavy Rain", wind: 35, humidity: 92 },
        disasters: { floodProb: 70, cycloneProb: 75, earthquakeProb: 28, landslideProb: 80, fireProb: 4 }
      },
      "Nagpur": {
        cities: ["Nagpur City", "Kamptee", "Umred", "Katol"],
        riskLevel: "Green",
        weather: { temp: 34, rain: "Partly Cloudy", wind: 12, humidity: 55 },
        disasters: { floodProb: 20, cycloneProb: 5, earthquakeProb: 10, landslideProb: 5, fireProb: 25 }
      }
    }
  },
  "Kerala": {
    name: "Kerala",
    type: "State",
    lat: 10.8505,
    lng: 76.2711,
    capital: "Thiruvananthapuram",
    population: "33.4 Million",
    emergencyContacts: { disasterManagement: "1077", police: "112", fire: "101", ambulance: "108" },
    districts: {
      "Wayanad": {
        cities: ["Kalpetta", "Mananthavady", "Sulthan Bathery"],
        riskLevel: "Red",
        weather: { temp: 21, rain: "Monsoon Deluge", wind: 32, humidity: 100 },
        disasters: { floodProb: 80, cycloneProb: 15, earthquakeProb: 30, landslideProb: 98, fireProb: 2 }
      },
      "Ernakulam": {
        cities: ["Kochi City", "Aluva", "Muvattupuzha", "Angamaly"],
        riskLevel: "Red",
        weather: { temp: 28, rain: "Extremely Heavy Rain", wind: 40, humidity: 94 },
        disasters: { floodProb: 92, cycloneProb: 50, earthquakeProb: 18, landslideProb: 15, fireProb: 8 }
      },
      "Idukki": {
        cities: ["Thodupuzha", "Munnar", "Adimali", "Painavu"],
        riskLevel: "Orange",
        weather: { temp: 18, rain: "Heavy Downpours", wind: 24, humidity: 95 },
        disasters: { floodProb: 50, cycloneProb: 10, earthquakeProb: 25, landslideProb: 88, fireProb: 5 }
      }
    }
  },
  "Gujarat": {
    name: "Gujarat",
    type: "State",
    lat: 22.2587,
    lng: 71.1924,
    capital: "Gandhinagar",
    population: "60.4 Million",
    emergencyContacts: { disasterManagement: "1070", police: "100", fire: "101", ambulance: "108" },
    districts: {
      "Kutch": {
        cities: ["Bhuj", "Gandhidham", "Mandvi", "Anjar"],
        riskLevel: "Orange",
        weather: { temp: 37, rain: "Dusty Wind", wind: 30, humidity: 55 },
        disasters: { floodProb: 15, cycloneProb: 55, earthquakeProb: 92, landslideProb: 2, fireProb: 30 }
      },
      "Ahmedabad": {
        cities: ["Ahmedabad City", "Sanand", "Bavla", "Dholka"],
        riskLevel: "Green",
        weather: { temp: 35, rain: "Sunny", wind: 14, humidity: 50 },
        disasters: { floodProb: 20, cycloneProb: 15, earthquakeProb: 45, landslideProb: 1, fireProb: 20 }
      },
      "Surat": {
        cities: ["Surat City", "Varachha", "Rander", "Bardoli"],
        riskLevel: "Yellow",
        weather: { temp: 31, rain: "Light Showers", wind: 20, humidity: 75 },
        disasters: { floodProb: 45, cycloneProb: 35, earthquakeProb: 35, landslideProb: 5, fireProb: 12 }
      }
    }
  },
  "Delhi": {
    name: "Delhi",
    type: "UT",
    lat: 28.7041,
    lng: 77.1025,
    capital: "New Delhi",
    population: "16.8 Million",
    emergencyContacts: { disasterManagement: "1077", police: "112", fire: "101", ambulance: "102" },
    districts: {
      "New Delhi": {
        cities: ["Chanakyapuri", "Connaught Place", "Vasant Vihar"],
        riskLevel: "Yellow",
        weather: { temp: 34, rain: "Overcast", wind: 15, humidity: 70 },
        disasters: { floodProb: 35, cycloneProb: 2, earthquakeProb: 60, landslideProb: 1, fireProb: 25 }
      },
      "North Delhi": {
        cities: ["Sadar Bazar", "Civil Lines", "Kotwali"],
        riskLevel: "Orange",
        weather: { temp: 33, rain: "Heavy Storms", wind: 22, humidity: 80 },
        disasters: { floodProb: 65, cycloneProb: 2, earthquakeProb: 62, landslideProb: 2, fireProb: 18 }
      }
    }
  },
  "West Bengal": {
    name: "West Bengal",
    type: "State",
    lat: 22.9868,
    lng: 87.8550,
    capital: "Kolkata",
    population: "91.3 Million",
    emergencyContacts: { disasterManagement: "1070", police: "100", fire: "101", ambulance: "102" },
    districts: {
      "Kolkata": {
        cities: ["Alipore", "Salt Lake", "Tollygunge", "Howrah Link"],
        riskLevel: "Red",
        weather: { temp: 28, rain: "Cyclone Landfall", wind: 65, humidity: 95 },
        disasters: { floodProb: 90, cycloneProb: 95, earthquakeProb: 30, landslideProb: 2, fireProb: 10 }
      },
      "Darjeeling": {
        cities: ["Darjeeling Town", "Kalimpong Link", "Kurseong", "Mirik"],
        riskLevel: "Orange",
        weather: { temp: 15, rain: "Torrential Downpour", wind: 25, humidity: 98 },
        disasters: { floodProb: 30, cycloneProb: 10, earthquakeProb: 65, landslideProb: 92, fireProb: 2 }
      },
      "South 24 Parganas": {
        cities: ["Sundarbans", "Diamond Harbour", "Baruipur", "Canning"],
        riskLevel: "Red",
        weather: { temp: 27, rain: "Storm Surge", wind: 72, humidity: 98 },
        disasters: { floodProb: 96, cycloneProb: 98, earthquakeProb: 25, landslideProb: 5, fireProb: 4 }
      }
    }
  }
};

// Fallback skeleton states for other 28 States & UTs to ensure absolute ALL territories coverage
const REMAINING_STATES = [
  { name: "Arunachal Pradesh", type: "State", lat: 28.2180, lng: 94.7278, capital: "Itanagar" },
  { name: "Assam", type: "State", lat: 26.2006, lng: 92.9376, capital: "Dispur" },
  { name: "Bihar", type: "State", lat: 25.0961, lng: 85.3131, capital: "Patna" },
  { name: "Chhattisgarh", type: "State", lat: 21.2787, lng: 81.8661, capital: "Raipur" },
  { name: "Goa", type: "State", lat: 15.2993, lng: 74.1240, capital: "Panaji" },
  { name: "Haryana", type: "State", lat: 29.0588, lng: 76.0856, capital: "Chandigarh" },
  { name: "Himachal Pradesh", type: "State", lat: 31.1048, lng: 77.1734, capital: "Shimla" },
  { name: "Jharkhand", type: "State", lat: 23.6102, lng: 85.2799, capital: "Ranchi" },
  { name: "Madhya Pradesh", type: "State", lat: 22.9734, lng: 78.6569, capital: "Bhopal" },
  { name: "Manipur", type: "State", lat: 24.6637, lng: 93.9063, capital: "Imphal" },
  { name: "Meghalaya", type: "State", lat: 25.4670, lng: 91.3662, capital: "Shillong" },
  { name: "Mizoram", type: "State", lat: 23.1645, lng: 92.9376, capital: "Aizawl" },
  { name: "Nagaland", type: "State", lat: 26.1584, lng: 94.5624, capital: "Kohima" },
  { name: "Odisha", type: "State", lat: 20.9517, lng: 85.0985, capital: "Bhubaneswar" },
  { name: "Punjab", type: "State", lat: 31.1471, lng: 75.3412, capital: "Chandigarh" },
  { name: "Rajasthan", type: "State", lat: 27.0238, lng: 74.2179, capital: "Jaipur" },
  { name: "Sikkim", type: "State", lat: 27.5330, lng: 88.5122, capital: "Gangtok" },
  { name: "Telangana", type: "State", lat: 18.1124, lng: 79.0193, capital: "Hyderabad" },
  { name: "Tripura", type: "State", lat: 23.9408, lng: 91.9882, capital: "Agartala" },
  { name: "Uttar Pradesh", type: "State", lat: 26.8467, lng: 80.9462, capital: "Lucknow" },
  { name: "Uttarakhand", type: "State", lat: 30.0668, lng: 79.0193, capital: "Dehradun" },
  { name: "Andaman and Nicobar Islands", type: "UT", lat: 11.7401, lng: 92.6586, capital: "Port Blair" },
  { name: "Chandigarh", type: "UT", lat: 30.7333, lng: 76.7794, capital: "Chandigarh" },
  { name: "Dadra and Nagar Haveli and Daman and Diu", type: "UT", lat: 20.1809, lng: 73.0169, capital: "Daman" },
  { name: "Jammu and Kashmir", type: "UT", lat: 33.7782, lng: 76.5762, capital: "Srinagar" },
  { name: "Ladakh", type: "UT", lat: 34.1526, lng: 77.5771, capital: "Leh" },
  { name: "Lakshadweep", type: "UT", lat: 10.5667, lng: 72.6417, capital: "Kavaratti" },
  { name: "Puducherry", type: "UT", lat: 11.9416, lng: 79.8083, capital: "Puducherry" }
];

// Enriching the main map so all states are fully operational
REMAINING_STATES.forEach(st => {
  if (!INDIAN_STATES_DATA[st.name]) {
    // Generate simulated standard districts for each remaining state
    const defaultDistricts: Record<string, any> = {};
    const districtNames = [
      `${st.name} North`,
      `${st.name} South`,
      `${st.name} Central`,
      `${st.name} Coast`
    ];
    
    districtNames.forEach((dName, idx) => {
      const risk: 'Green' | 'Yellow' | 'Orange' | 'Red' = idx === 0 ? "Green" : idx === 1 ? "Yellow" : idx === 2 ? "Orange" : "Red";
      defaultDistricts[dName] = {
        cities: [`${dName} Smart City`, `${dName} Headquarter`, `${dName} Township`],
        riskLevel: risk,
        weather: {
          temp: 24 + idx * 3,
          rain: idx % 2 === 0 ? "Intermittent Rain" : "Heavy Thunderstorms",
          wind: 12 + idx * 6,
          humidity: 60 + idx * 8
        },
        disasters: {
          floodProb: Math.round(20 + idx * 22),
          cycloneProb: Math.round(10 + idx * 15),
          earthquakeProb: Math.round(5 + idx * 18),
          landslideProb: Math.round(8 + idx * 25),
          fireProb: Math.round(15 + idx * 10)
        }
      };
    });

    INDIAN_STATES_DATA[st.name] = {
      name: st.name,
      type: st.type as any,
      lat: st.lat,
      lng: st.lng,
      capital: st.capital,
      population: "8.5 Million",
      emergencyContacts: { disasterManagement: "1070", police: "100", fire: "101", ambulance: "108" },
      districts: defaultDistricts
    };
  }
});

// Complete village database index for searching
export const PROMINENT_VILLAGES: VillageData[] = [
  { name: "Pothamarru", district: "Krishna", state: "Andhra Pradesh", pinCode: "521150", lat: 16.2132, lng: 80.9850 },
  { name: "Annavaram", district: "East Godavari", state: "Andhra Pradesh", pinCode: "533406", lat: 17.2811, lng: 82.4014 },
  { name: "Kummamuru", district: "Sri Sathya Sai", state: "Andhra Pradesh", pinCode: "515134", lat: 14.1542, lng: 77.8105 },
  { name: "Bheemili Village", district: "Visakhapatnam", state: "Andhra Pradesh", pinCode: "531163", lat: 17.8911, lng: 83.4542 },
  { name: "Valparai Tea Estate", district: "Coimbatore", state: "Tamil Nadu", pinCode: "642127", lat: 10.3700, lng: 76.9700 },
  { name: "Mahabalipuram Village", district: "Chengalpattu", state: "Tamil Nadu", pinCode: "603104", lat: 12.6269, lng: 80.1927 },
  { name: "Somwarpet Village", district: "Kodagu", state: "Karnataka", pinCode: "571236", lat: 12.5960, lng: 75.8652 },
  { name: "Lonavala Village", district: "Pune", state: "Maharashtra", pinCode: "410401", lat: 18.7557, lng: 73.4091 },
  { name: "Munnar Valley", district: "Idukki", state: "Kerala", pinCode: "685612", lat: 10.0889, lng: 77.0595 },
  { name: "Chooralmala", district: "Wayanad", state: "Kerala", pinCode: "673577", lat: 11.5284, lng: 76.1215 },
  { name: "Mundakkai", district: "Wayanad", state: "Kerala", pinCode: "673577", lat: 11.5361, lng: 76.1305 },
  { name: "Mandvi Beach Village", district: "Kutch", state: "Gujarat", pinCode: "370465", lat: 22.8286, lng: 69.3492 },
  { name: "Sundarbans Delta Village", district: "South 24 Parganas", state: "West Bengal", pinCode: "743370", lat: 21.9497, lng: 88.8950 },
  { name: "Singla Hill", district: "Darjeeling", state: "West Bengal", pinCode: "734101", lat: 27.1120, lng: 88.2612 }
];

// Simplified state SVG path vertices coordinates for rendering an amazing vector map of India.
// These coordinates are mapped on a standard coordinate transformation.
export const STATE_BOUNDARIES: StateShape[] = Object.keys(INDIAN_STATES_DATA).map(key => {
  const state = INDIAN_STATES_DATA[key];
  
  // Custom simple polygonal footprints relative to India's bounding box
  // Let's model stylized circular/rectangular block bounds representing each state relative to its real lat/lng
  const radius = state.type === 'UT' ? 0.45 : 1.15;
  const lat = state.lat;
  const lng = state.lng;
  
  // Generate a beautiful octagon shape representing the territory on the vector overview
  const points: [number, number][] = [];
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI) / 4;
    const pLat = lat + Math.sin(angle) * radius * 0.75;
    const pLng = lng + Math.cos(angle) * radius * 0.95;
    points.push([pLat, pLng]);
  }

  return {
    id: key.toLowerCase().replace(/\s+/g, '_'),
    name: key,
    points,
    center: [lat, lng]
  };
});
