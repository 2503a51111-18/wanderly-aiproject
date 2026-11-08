
import React, { useEffect, useMemo, useState } from "react";
import InteractiveMap from "./InteractiveMap";
import "./styles.css";

const API = "http://127.0.0.1:8001/api";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80";

const HOTEL_PHOTOS = [
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=85",
  "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1000&q=85",
  "https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1000&q=85",
  "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1000&q=85"
];

// Maps destinations and attractions to their Wikipedia articles.
// Their article thumbnails are used to load place-related photographs.
const PLACE_ARTICLES = {
  Hyderabad: "Hyderabad",
  Goa: "Goa",
  Kerala: "Kerala",
  Jaipur: "Jaipur",
  Agra: "Agra",
  Delhi: "Delhi",
  Mumbai: "Mumbai",
  Bengaluru: "Bangalore",
  Mysuru: "Mysore",
  Chennai: "Chennai",
  Manali: "Manali, Himachal Pradesh",
  Varanasi: "Varanasi",
  Bali: "Bali",
  Dubai: "Dubai",
  Singapore: "Singapore",
  Switzerland: "Switzerland",
  Japan: "Japan",
  Wayanad: "Wayanad",
  Dandeli: "Dandeli",
  "Jim Corbett": "Jim Corbett National Park",
  Kaziranga: "Kaziranga National Park",

  Charminar: "Charminar",
  "Golconda Fort": "Golconda Fort",
  "Hussain Sagar": "Hussain Sagar",
  "Chowmahalla Palace": "Chowmahalla Palace",
  "Baga Beach": "Baga Beach",
  "Fort Aguada": "Fort Aguada",
  "Old Goa": "Old Goa",
  "Palolem Beach": "Palolem Beach",
  "Alleppey Backwaters": "Alappuzha",
  Munnar: "Munnar",
  "Fort Kochi": "Fort Kochi",
  "Varkala Beach": "Varkala Beach",
  "Amber Fort": "Amer Fort",
  "Hawa Mahal": "Hawa Mahal",
  "City Palace": "City Palace, Jaipur",
  "Jantar Mantar": "Jantar Mantar, Jaipur",
  "Taj Mahal": "Taj Mahal",
  "Agra Fort": "Agra Fort",
  "Mehtab Bagh": "Mehtab Bagh",
  "Fatehpur Sikri": "Fatehpur Sikri",
  "Red Fort": "Red Fort",
  "Qutub Minar": "Qutb Minar",
  "India Gate": "India Gate",
  "Humayun's Tomb": "Humayun's Tomb",
  "Gateway of India": "Gateway of India",
  "Marine Drive": "Marine Drive, Mumbai",
  "Elephanta Caves": "Elephanta Caves",
  "Juhu Beach": "Juhu",
  Lalbagh: "Lalbagh Botanical Garden",
  "Cubbon Park": "Cubbon Park",
  "Bengaluru Palace": "Bangalore Palace",
  "Vidhana Soudha": "Vidhana Soudha",
  "Mysore Palace": "Mysore Palace",
  "Chamundi Hills": "Chamundi Hills",
  "Brindavan Gardens": "Brindavan Gardens",
  "St Philomena's Church": "St. Philomena's Church, Mysore",
  "Marina Beach": "Marina Beach, Chennai",
  "Kapaleeshwarar Temple": "Kapaleeshwarar Temple",
  "Fort St George": "Fort St. George, India",
  "Government Museum": "Government Museum, Chennai",
  "Solang Valley": "Solang Valley",
  "Hadimba Temple": "Hidimba Devi Temple",
  "Old Manali": "Old Manali",
  "Atal Tunnel viewpoints": "Atal Tunnel",
  "Dashashwamedh Ghat": "Dashashwamedh Ghat",
  "Assi Ghat": "Assi Ghat",
  Sarnath: "Sarnath",
  "Kashi Vishwanath Temple": "Kashi Vishwanath Temple",
  "Ubud Rice Terraces": "Tegallalang Rice Terraces",
  "Uluwatu Temple": "Uluwatu Temple",
  Ubud: "Ubud",
  "Nusa Dua": "Nusa Dua",
  "Burj Khalifa": "Burj Khalifa",
  "Dubai Marina": "Dubai Marina",
  "Dubai Frame": "Dubai Frame",
  "Desert Safari": "Dubai Desert Conservation Reserve",
  "Gardens by the Bay": "Gardens by the Bay",
  "Marina Bay Sands": "Marina Bay Sands",
  Sentosa: "Sentosa",
  Chinatown: "Chinatown, Singapore",
  "Lake Lucerne": "Lake Lucerne",
  Interlaken: "Interlaken",
  Jungfraujoch: "Jungfraujoch",
  Zermatt: "Zermatt",
  "Fushimi Inari Shrine": "Fushimi Inari-taisha",
  "Mount Fuji": "Mount Fuji",
  Tokyo: "Tokyo",
  Arashiyama: "Arashiyama",
  "Edakkal Caves": "Edakkal Caves",
  "Banasura Sagar Dam": "Banasura Sagar Dam",
  "Soochipara Falls": "Soochipara Falls",
  "Wayanad Wildlife Sanctuary": "Wayanad Wildlife Sanctuary",
  "Kali River": "Kali River, Karnataka",
  "Dandeli Wildlife Sanctuary": "Dandeli Wildlife Sanctuary",
  "Syntheri Rocks": "Syntheri Rocks",
  "Kavala Caves": "Kavala Caves",
  "Corbett National Park": "Jim Corbett National Park",
  "Dhikala Zone": "Dhikala",
  "Garjiya Devi Temple": "Garjiya Devi Temple",
  "Kosi River": "Kosi River",
  "Kaziranga National Park": "Kaziranga National Park",
  "Kohora Range": "Kaziranga National Park",
  "Brahmaputra River": "Brahmaputra River",
  "Orchid Park": "Kaziranga National Orchid and Biodiversity Park"
};

const placeImageCache = new Map();

async function getRealPlaceImage(placeName) {
  const article = PLACE_ARTICLES[placeName] || placeName;

  if (placeImageCache.has(article)) {
    return placeImageCache.get(article);
  }

  const request = fetch(
    `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
      article.replaceAll(" ", "_")
    )}`
  )
    .then(response => {
      if (!response.ok) {
        throw new Error("Image unavailable");
      }

      return response.json();
    })
    .then(data => {
      if (data.type === "disambiguation") {
        throw new Error("Ambiguous article");
      }

      const image =
        data.originalimage?.source || data.thumbnail?.source;

      if (!image) {
        throw new Error("No image available");
      }

      return image.startsWith("//") ? `https:${image}` : image;
    })
    .catch(() => FALLBACK_IMAGE);

  placeImageCache.set(article, request);
  return request;
}

const ATTRACTION_DETAILS = {
  Charminar: {
    image:
      "https://images.unsplash.com/photo-1565552629477-5a9f2c7b8b7e?auto=format&fit=crop&w=1200&q=85",
    description:
      "Explore Hyderabad's iconic historic monument, surrounded by lively markets, traditional shops and local food."
  },
  "Golconda Fort": {
    image:
      "https://images.unsplash.com/photo-1590050752117-23a9d7fc3a3e?auto=format&fit=crop&w=1200&q=85",
    description:
      "Discover historic fortifications, impressive gateways and panoramic views. Check visitor timings before your trip."
  },
  "Hussain Sagar": {
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=85",
    description:
      "Enjoy a lakeside outing and scenic views around one of Hyderabad's best-known waterfront landmarks."
  },
  "Chowmahalla Palace": {
    image:
      "https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?auto=format&fit=crop&w=1200&q=85",
    description:
      "Discover royal architecture, elegant courtyards and the heritage associated with the Nizams of Hyderabad."
  },
  "Taj Mahal": {
    image:
      "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=85",
    description:
      "Visit the celebrated marble mausoleum in Agra and learn about its Mughal architecture and history."
  },
  "Hawa Mahal": {
    image:
      "https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?auto=format&fit=crop&w=1200&q=85",
    description:
      "Admire Jaipur's distinctive palace facade and explore the surrounding historic markets."
  },
  "Gateway of India": {
    image:
      "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1200&q=85",
    description:
      "Explore Mumbai's famous waterfront landmark and the surrounding harbour area."
  },
  "Burj Khalifa": {
    image:
      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=85",
    description:
      "Experience Dubai's celebrated skyline and plan ahead if you want to visit an observation deck."
  },
  "Gardens by the Bay": {
    image:
      "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=1200&q=85",
    description:
      "Explore Singapore's distinctive garden landscapes, conservatories and impressive Supertree structures."
  },
  "Mount Fuji": {
    image:
      "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=85",
    description:
      "Plan a visit around Japan's iconic mountain, taking seasonal weather and access conditions into account."
  },
  "Baga Beach": {
    image:
      "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=85",
    description:
      "Enjoy Goa's lively coastal atmosphere, beachside dining and nearby local experiences."
  },
  Munnar: {
    image:
      "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=85",
    description:
      "Discover Kerala's green hill landscapes, tea-growing regions and scenic viewpoints."
  },
  "Amber Fort": {
    image:
      "https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?auto=format&fit=crop&w=1200&q=85",
    description:
      "Explore a historic hilltop fort known for its courtyards, gateways and Rajput-era architecture."
  }
};

function getAttractionDetails(name) {
  if (ATTRACTION_DETAILS[name]) {
    return ATTRACTION_DETAILS[name];
  }

  return {
    image: FALLBACK_IMAGE,
    description: `Discover ${name}, a place to explore during your visit. Check local visitor information, opening hours and travel guidance before setting out.`
  };
}

function handleImageError(event) {
  const image = event.currentTarget;
  image.onerror = null;
  image.src = FALLBACK_IMAGE;
}

// Loads the article-associated photograph while preserving the existing
// image element's class names, sizing and other CSS-related attributes.
function RealPlaceImage({ name, fallback, alt, ...props }) {
  const [src, setSrc] = useState(fallback || FALLBACK_IMAGE);

  useEffect(() => {
    let active = true;

    getRealPlaceImage(name).then(image => {
      if (active) {
        setSrc(image);
      }
    });

    return () => {
      active = false;
    };
  }, [name]);

  return (
    <img
      {...props}
      src={src}
      alt={alt || name}
      onError={handleImageError}
    />
  );
}

const CATALOGUE = [
  {
    name: "Hyderabad",
    state: "Telangana",
    country: "India",
    category: "History • Food • Culture",
    type: "India",
    rating: 4.7,
    cost: 2200,
    lat: 17.385,
    lon: 78.4867,
    bestTime: "October to February",
    description:
      "Discover Nizam heritage, historic monuments, lively markets and famous Hyderabadi cuisine.",
    attractions: ["Charminar", "Golconda Fort", "Hussain Sagar", "Chowmahalla Palace"],
    food: ["Hyderabadi biryani", "Haleem", "Irani chai"],
    image:
      "https://images.unsplash.com/photo-1588416936097-41850ab3d86d?auto=format&fit=crop&w=1200&q=85"
  },
  {
    name: "Goa",
    state: "Goa",
    country: "India",
    category: "Beaches • Relaxation • Nightlife",
    type: "Beaches",
    rating: 4.8,
    cost: 3000,
    lat: 15.2993,
    lon: 74.124,
    bestTime: "November to February",
    description:
      "Enjoy beautiful beaches, Portuguese-influenced architecture and coastal experiences.",
    attractions: ["Baga Beach", "Fort Aguada", "Old Goa", "Palolem Beach"],
    food: ["Goan fish curry", "Bebinca", "Local seafood"],
    image:
      "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1000&q=80"
  },
  {
    name: "Kerala",
    state: "Kerala",
    country: "India",
    category: "Nature • Backwaters • Wellness",
    type: "India",
    rating: 4.9,
    cost: 2800,
    lat: 10.1632,
    lon: 76.6413,
    bestTime: "October to March",
    description:
      "Explore peaceful backwaters, green landscapes, hill stations and local culture.",
    attractions: ["Alleppey Backwaters", "Munnar", "Fort Kochi", "Varkala Beach"],
    food: ["Appam and stew", "Puttu and kadala", "Kerala sadya"],
    image:
      "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1000&q=80"
  },
  {
    name: "Jaipur",
    state: "Rajasthan",
    country: "India",
    category: "Forts • Heritage • Shopping",
    type: "India",
    rating: 4.6,
    cost: 2400,
    lat: 26.9124,
    lon: 75.7873,
    bestTime: "October to March",
    description:
      "Discover royal forts, palaces, traditional markets and Rajasthani cuisine.",
    attractions: ["Amber Fort", "Hawa Mahal", "City Palace", "Jantar Mantar"],
    food: ["Dal baati churma", "Ghewar", "Pyaaz kachori"],
    image:
      "https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?auto=format&fit=crop&w=1000&q=80"
  },
  {
    name: "Agra",
    state: "Uttar Pradesh",
    country: "India",
    category: "History • Architecture • Heritage",
    type: "India",
    rating: 4.7,
    cost: 2200,
    lat: 27.1767,
    lon: 78.0081,
    bestTime: "October to March",
    description:
      "Experience Mughal architecture and the world-famous Taj Mahal.",
    attractions: ["Taj Mahal", "Agra Fort", "Mehtab Bagh", "Fatehpur Sikri"],
    food: ["Petha", "Bedai and jalebi", "Mughlai dishes"],
    image:
      "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1000&q=80"
  },
  {
    name: "Delhi",
    state: "Delhi",
    country: "India",
    category: "History • Food • Shopping",
    type: "India",
    rating: 4.7,
    cost: 2600,
    lat: 28.6139,
    lon: 77.209,
    bestTime: "October to March",
    description:
      "Explore historic monuments, museums, street food and modern neighbourhoods.",
    attractions: ["Red Fort", "Qutub Minar", "India Gate", "Humayun's Tomb"],
    food: ["Chole bhature", "Parathas", "Chaat"],
    image:
      "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1000&q=80"
  },
  {
    name: "Mumbai",
    state: "Maharashtra",
    country: "India",
    category: "City Life • Food • Coast",
    type: "India",
    rating: 4.6,
    cost: 3200,
    lat: 19.076,
    lon: 72.8777,
    bestTime: "November to February",
    description:
      "Discover coastal landmarks, markets, entertainment and diverse food.",
    attractions: ["Gateway of India", "Marine Drive", "Elephanta Caves", "Juhu Beach"],
    food: ["Vada pav", "Pav bhaji", "Bombay sandwich"],
    image:
      "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1000&q=80"
  },
  {
    name: "Bengaluru",
    state: "Karnataka",
    country: "India",
    category: "Gardens • Cafes • City Life",
    type: "India",
    rating: 4.5,
    cost: 2600,
    lat: 12.9716,
    lon: 77.5946,
    bestTime: "October to February",
    description:
      "Enjoy green parks, cafes, cultural attractions and nearby day trips.",
    attractions: ["Lalbagh", "Cubbon Park", "Bengaluru Palace", "Vidhana Soudha"],
    food: ["Masala dosa", "Idli vada", "Filter coffee"],
    image:
      "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=1000&q=80"
  },
  {
    name: "Mysuru",
    state: "Karnataka",
    country: "India",
    category: "Palaces • Culture • Heritage",
    type: "India",
    rating: 4.7,
    cost: 2000,
    lat: 12.2958,
    lon: 76.6394,
    bestTime: "October to March",
    description:
      "Explore royal architecture, traditional markets and southern Indian heritage.",
    attractions: ["Mysore Palace", "Chamundi Hills", "Brindavan Gardens", "St Philomena's Church"],
    food: ["Mysore masala dosa", "Mysore pak", "Traditional meals"],
    image:
      "https://images.unsplash.com/photo-1600112356915-089abb8fc71a?auto=format&fit=crop&w=1000&q=80"
  },
  {
    name: "Chennai",
    state: "Tamil Nadu",
    country: "India",
    category: "Temples • Beaches • Culture",
    type: "Beaches",
    rating: 4.5,
    cost: 2300,
    lat: 13.0827,
    lon: 80.2707,
    bestTime: "November to February",
    description:
      "Discover Tamil culture, historic temples and coastal scenery.",
    attractions: ["Marina Beach", "Kapaleeshwarar Temple", "Fort St George", "Government Museum"],
    food: ["Idli and sambar", "Dosa", "Filter coffee"],
    image:
      "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1000&q=80"
  },
  {
    name: "Manali",
    state: "Himachal Pradesh",
    country: "India",
    category: "Mountains • Nature • Adventure",
    type: "Mountains",
    rating: 4.8,
    cost: 3000,
    lat: 32.2432,
    lon: 77.1892,
    bestTime: "March to June",
    description:
      "Enjoy Himalayan scenery, mountain villages and scenic valleys.",
    attractions: ["Solang Valley", "Hadimba Temple", "Old Manali", "Atal Tunnel viewpoints"],
    food: ["Siddu", "Thukpa", "Himachali dham"],
    image:
      "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1000&q=80"
  },
  {
    name: "Varanasi",
    state: "Uttar Pradesh",
    country: "India",
    category: "Culture • Spirituality • History",
    type: "India",
    rating: 4.8,
    cost: 2000,
    lat: 25.3176,
    lon: 82.9739,
    bestTime: "October to March",
    description:
      "Experience ancient streets, riverside ghats and traditions of the Ganges.",
    attractions: ["Dashashwamedh Ghat", "Assi Ghat", "Sarnath", "Kashi Vishwanath Temple"],
    food: ["Kachori sabzi", "Tamatar chaat", "Banarasi sweets"],
    image:
      "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1000&q=80"
  },
  {
    name: "Bali",
    state: "Indonesia",
    country: "Indonesia",
    category: "International • Beaches • Nature",
    type: "International",
    rating: 4.8,
    cost: 6500,
    lat: -8.4095,
    lon: 115.1889,
    bestTime: "April to October",
    description:
      "Discover tropical beaches, rice terraces, temples and island culture.",
    attractions: ["Ubud Rice Terraces", "Uluwatu Temple", "Ubud", "Nusa Dua"],
    food: ["Nasi goreng", "Satay", "Gado-gado"],
    image:
      "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1000&q=80"
  },
  {
    name: "Dubai",
    state: "United Arab Emirates",
    country: "United Arab Emirates",
    category: "International • Shopping • Adventure",
    type: "International",
    rating: 4.7,
    cost: 9000,
    lat: 25.2048,
    lon: 55.2708,
    bestTime: "November to March",
    description:
      "Explore modern architecture, desert landscapes, shopping and waterfront attractions.",
    attractions: ["Burj Khalifa", "Dubai Marina", "Dubai Frame", "Desert Safari"],
    food: ["Machboos", "Shawarma", "Luqaimat"],
    image:
      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1000&q=80"
  },
  {
    name: "Singapore",
    state: "Singapore",
    country: "Singapore",
    category: "International • City • Family",
    type: "International",
    rating: 4.8,
    cost: 11000,
    lat: 1.3521,
    lon: 103.8198,
    bestTime: "February to April",
    description:
      "Discover waterfront gardens, exciting attractions and vibrant city neighbourhoods.",
    attractions: ["Gardens by the Bay", "Marina Bay Sands", "Sentosa", "Chinatown"],
    food: ["Hainanese chicken rice", "Laksa", "Satay"],
    image:
      "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=1000&q=80"
  },
  {
    name: "Switzerland",
    state: "Switzerland",
    country: "Switzerland",
    category: "International • Mountains • Nature",
    type: "International",
    rating: 4.9,
    cost: 18000,
    lat: 46.8182,
    lon: 8.2275,
    bestTime: "June to September",
    description:
      "Experience Alpine villages, scenic railways, mountain lakes and beautiful valleys.",
    attractions: ["Lake Lucerne", "Interlaken", "Jungfraujoch", "Zermatt"],
    food: ["Swiss fondue", "Rösti", "Swiss chocolate"],
    image:
      "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=1000&q=80"
  },
  {
    name: "Japan",
    state: "Japan",
    country: "Japan",
    category: "International • Culture • Mountains",
    type: "International",
    rating: 4.9,
    cost: 13000,
    lat: 36.2048,
    lon: 138.2529,
    bestTime: "March to May",
    description:
      "Discover historic temples, modern cities, mountain scenery and seasonal landscapes.",
    attractions: ["Fushimi Inari Shrine", "Mount Fuji", "Tokyo", "Arashiyama"],
    food: ["Ramen", "Sushi", "Okonomiyaki"],
    image:
      "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1000&q=80"
  },
  {
    name: "Wayanad",
    state: "Kerala",
    country: "India",
    category: "Forest • Wildlife • Nature",
    type: "Forest & Wildlife",
    rating: 4.7,
    cost: 2500,
    lat: 11.6854,
    lon: 76.132,
    bestTime: "October to May",
    description:
      "Explore green forests, waterfalls, caves and guided nature experiences.",
    attractions: ["Edakkal Caves", "Banasura Sagar Dam", "Soochipara Falls", "Wayanad Wildlife Sanctuary"],
    food: ["Kerala sadya", "Malabar biryani", "Banana chips"],
    image:
      "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1000&q=80"
  },
  {
    name: "Dandeli",
    state: "Karnataka",
    country: "India",
    category: "Forest • Wildlife • Adventure",
    type: "Forest & Wildlife",
    rating: 4.6,
    cost: 2300,
    lat: 15.247,
    lon: 74.629,
    bestTime: "October to March",
    description:
      "Enjoy forest trails, river scenery, birdwatching and guided outdoor activities.",
    attractions: ["Kali River", "Dandeli Wildlife Sanctuary", "Syntheri Rocks", "Kavala Caves"],
    food: ["North Karnataka meals", "Jolada rotti", "Local vegetarian dishes"],
    image:
      "https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=1000&q=80"
  },
  {
    name: "Jim Corbett",
    state: "Uttarakhand",
    country: "India",
    category: "Forest • Wildlife • Nature",
    type: "Forest & Wildlife",
    rating: 4.7,
    cost: 4000,
    lat: 29.53,
    lon: 78.7747,
    bestTime: "November to June",
    description:
      "Discover forest landscapes and wildlife through authorised guided safaris.",
    attractions: ["Corbett National Park", "Dhikala Zone", "Garjiya Devi Temple", "Kosi River"],
    food: ["Kumaoni dishes", "Aloo ke gutke", "Local thalis"],
    image:
      "https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=1000&q=80"
  },
  {
    name: "Kaziranga",
    state: "Assam",
    country: "India",
    category: "Forest • Wildlife • Nature",
    type: "Forest & Wildlife",
    rating: 4.8,
    cost: 3500,
    lat: 26.5775,
    lon: 93.1711,
    bestTime: "November to April",
    description:
      "Explore protected grasslands and wetlands with authorised wildlife guides.",
    attractions: ["Kaziranga National Park", "Kohora Range", "Brahmaputra River", "Orchid Park"],
    food: ["Assamese thali", "Masor tenga", "Pitha"],
    image:
      "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1000&q=80"
  }
];

const money = value => Number(value || 0).toLocaleString("en-IN");

async function fetchJSON(url, options = {}) {
  const response = await fetch(url, options);
  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(
      typeof data?.detail === "string"
        ? data.detail
        : `Request failed (${response.status})`
    );
  }

  return data;
}

function App() {
  const [tab, setTab] = useState("Explore");
  const [destinations, setDestinations] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [trips, setTrips] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [search, setSearch] = useState("");
  const [tripFilter, setTripFilter] = useState("All Trips");
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [selectedAttraction, setSelectedAttraction] = useState(null);
  const [mapPlace, setMapPlace] = useState(CATALOGUE[0]);
  const [plan, setPlan] = useState(null);
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [message, setMessage] = useState("");
  const [backendOnline, setBackendOnline] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [form, setForm] = useState({
    destination: "Hyderabad",
    days: 3,
    budget: 10000,
    interest: "History"
  });

  async function load() {
    setLoadingData(true);

    try {
      const d = await fetchJSON(`${API}/destinations`);

      const optional = async (endpoint, fallback) => {
        try {
          return await fetchJSON(`${API}/${endpoint}`);
        } catch (error) {
          console.warn(endpoint, error.message);
          return fallback;
        }
      };

      const [h, b, t, a] = await Promise.all([
        optional("hotels", []),
        optional("bookings", []),
        optional("trips", []),
        optional("analytics", null)
      ]);

      setDestinations(Array.isArray(d) ? d : []);
      setHotels(Array.isArray(h) ? h : []);
      setBookings(Array.isArray(b) ? b : []);
      setTrips(Array.isArray(t) ? t : []);
      setAnalytics(a);
      setBackendOnline(true);
    } catch (error) {
      setBackendOnline(false);
      setMessage(`Backend connection failed: ${error.message}`);
    } finally {
      setLoadingData(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const allPlaces = useMemo(() => {
    const apiPlaces = Array.isArray(destinations) ? destinations : [];

    const merged = CATALOGUE.map(place => {
      const apiPlace = apiPlaces.find(
        item => item.name?.toLowerCase() === place.name.toLowerCase()
      );

      return {
        ...place,
        ...(apiPlace || {}),
        state: apiPlace?.state || place.state,
        category: apiPlace?.category || place.category,
        rating: apiPlace?.rating ?? place.rating,
        cost: apiPlace?.estimated_daily_cost ?? place.cost,
        image: place.image,
        lat: place.lat,
        lon: place.lon,
        attractions: place.attractions,
        food: place.food,
        bestTime: place.bestTime,
        type: place.type,
        country: place.country
      };
    });

    const extraPlaces = apiPlaces
      .filter(
        item =>
          !CATALOGUE.some(
            place => place.name.toLowerCase() === item.name?.toLowerCase()
          )
      )
      .map(item => ({
        ...item,
        cost: item.estimated_daily_cost ?? 0,
        country: item.state || "Location not specified",
        type: /international/i.test(item.category || "")
          ? "International"
          : /forest|wildlife/i.test(item.category || "")
            ? "Forest & Wildlife"
            : "India",
        description: item.description || `Discover ${item.name}.`,
        attractions: [],
        food: [],
        bestTime: "Check local seasonal guidance",
        image: FALLBACK_IMAGE,
        lat: 20,
        lon: 0
      }));

    return [...merged, ...extraPlaces];
  }, [destinations]);

  const filteredPlaces = allPlaces.filter(place => {
    const text =
      `${place.name} ${place.state} ${place.country} ${place.category}`.toLowerCase();

    const matchesSearch = text.includes(search.toLowerCase());
    let matchesFilter = true;

    if (tripFilter === "India") matchesFilter = place.country === "India";
    else if (tripFilter === "International") matchesFilter = place.type === "International";
    else if (tripFilter === "Forest & Wildlife") matchesFilter = place.type === "Forest & Wildlife";
    else if (tripFilter === "Beaches") {
      matchesFilter = place.type === "Beaches" || /beach/i.test(place.category || "");
    } else if (tripFilter === "Mountains") {
      matchesFilter = place.type === "Mountains" || /mountain/i.test(place.category || "");
    }

    return matchesSearch && matchesFilter;
  });

  function openDestination(place) {
    setSelectedPlace(place);
    setSelectedAttraction(null);
    setMapPlace(place);
    setTab("Explore");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function startPlanning(place) {
    const category = place.category || "";

    const interest = /beach/i.test(category)
      ? "Beaches"
      : /nature|forest|wildlife|mountain/i.test(category)
        ? "Nature"
        : /food/i.test(category)
          ? "Food"
          : /shopping/i.test(category)
            ? "Shopping"
            : /adventure/i.test(category)
              ? "Adventure"
              : /culture/i.test(category)
                ? "Culture"
                : "History";

    setForm(previous => ({
      ...previous,
      destination: place.name,
      interest
    }));

    setPlan(null);
    setSelectedPlace(null);
    setSelectedAttraction(null);
    setTab("Planner");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function createPlan(e) {
    e.preventDefault();
    setLoadingPlan(true);
    setMessage("");

    try {
      const data = await fetchJSON(`${API}/planner`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          days: Number(form.days),
          budget: Number(form.budget)
        })
      });

      if (!Array.isArray(data?.itinerary) || data.itinerary.length === 0) {
        setPlan(data);
        setMessage(
          data?.message ||
            "No itinerary was returned. Check that this destination and its attractions exist in the backend database."
        );
        return;
      }

      setPlan(data);

      const savedTrips = await fetchJSON(`${API}/trips`);
      setTrips(Array.isArray(savedTrips) ? savedTrips : []);

      setMessage(
        data.trip_id
          ? `Itinerary saved successfully (Trip #${data.trip_id}).`
          : "Itinerary generated. If it does not appear in My Trips, check the backend planner save route."
      );
    } catch (error) {
      setMessage(`Planner: ${error.message}`);
    } finally {
      setLoadingPlan(false);
    }
  }

  async function book(hotel) {
    const name = window.prompt("Traveler name:", "Demo Traveler");
    if (!name?.trim()) return;

    const nightsInput = window.prompt("Number of nights:", "2");
    if (nightsInput === null) return;

    const nights = Number(nightsInput);

    if (!Number.isInteger(nights) || nights < 1) {
      setMessage("Enter a valid number of nights.");
      return;
    }

    try {
      const booking = await fetchJSON(`${API}/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: name.trim(),
          hotel_id: hotel.id,
          nights
        })
      });

      const payment = await fetchJSON(`${API}/payments/simulate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          booking_id: booking.id,
          method: "Demo UPI"
        })
      });

      setMessage(
        `Booking created. Reference: ${payment.transaction_ref}. Demo payment only.`
      );

      await load();
      setTab("My Trips");
    } catch (error) {
      setMessage(`Booking: ${error.message}`);
    }
  }

  const changeTab = item => {
    setTab(item);
    setSelectedPlace(null);
    setSelectedAttraction(null);
    window.scrollTo({ top: 0, behavior: "smooth" });

    if (item === "My Trips") load();
  };

  const tripValue = bookings.reduce(
    (sum, booking) => sum + Number(booking.total_amount || 0),
    0
  );

  return (
    <div className="wanderly">
      <header className="nav">
        <button className="logo" onClick={() => changeTab("Explore")}>
          Wander<span>ly</span>
        </button>

        <nav className="navlinks">
          {["Explore", "Hotels", "Planner", "My Trips", "Analytics"].map(item => (
            <button
              key={item}
              className={tab === item && !selectedPlace ? "active" : ""}
              onClick={() => changeTab(item)}
            >
              {item}
            </button>
          ))}
        </nav>

        <div className="guest">Demo Traveler</div>
      </header>

      {message && (
        <div className="toast" role="status">
          <span>{message}</span>
          <button onClick={() => setMessage("")} aria-label="Dismiss">×</button>
        </div>
      )}

      {!backendOnline && (
        <div className="status-banner">
          {loadingData
            ? "Connecting to Wanderly..."
            : "Backend unavailable. Live features may not work."}
          <button onClick={load} disabled={loadingData}>
            {loadingData ? "Connecting..." : "Retry"}
          </button>
        </div>
      )}

      {tab === "Explore" && (
        <main>
          {selectedPlace ? (
            <section className="section detail-page">
              <button
                className="back-button"
                onClick={() => {
                  setSelectedPlace(null);
                  setSelectedAttraction(null);
                }}
              >
                ← Back to Explore
              </button>

              <div className="detail-hero">
                <RealPlaceImage
                  name={selectedPlace.name}
                  fallback={selectedPlace.image}
                  alt={selectedPlace.name}
                />
                <div className="detail-overlay">
                  <span className="eyebrow">
                    {selectedPlace.country === "India"
                      ? `${selectedPlace.state}, India`
                      : selectedPlace.country}
                  </span>
                  <h1>{selectedPlace.name}</h1>
                  <p>{selectedPlace.category}</p>
                  <span>★ {selectedPlace.rating} destination rating</span>
                </div>
              </div>

              <div className="detail-grid">
                <div className="detail-main">
                  <h2>Discover {selectedPlace.name}</h2>
                  <p>{selectedPlace.description}</p>

                  <h3>Popular attractions</h3>

                  {selectedPlace.attractions.length ? (
                    <div className="attraction-gallery">
                      {selectedPlace.attractions.map((item, index) => {
                        const attraction = getAttractionDetails(item);

                        return (
                          <button
                            type="button"
                            className="attraction-card"
                            key={item}
                            onClick={() =>
                              setSelectedAttraction({
                                name: item,
                                ...attraction
                              })
                            }
                          >
                            <div className="attraction-image">
                              <RealPlaceImage
                                name={item}
                                fallback={attraction.image}
                                alt={item}
                                loading="lazy"
                              />
                              <span className="attraction-number">
                                {String(index + 1).padStart(2, "0")}
                              </span>
                            </div>

                            <div className="attraction-card-content">
                              <h4>{item}</h4>
                              <p>{attraction.description}</p>
                              <span className="attraction-link">
                                View attraction ↗
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <p>
                      Explore local attractions and visitor information for this destination.
                    </p>
                  )}

                  <h3>Local food to try</h3>
                  <div className="tag-list">
                    {selectedPlace.food.map(item => (
                      <span className="tag" key={item}>{item}</span>
                    ))}
                  </div>

                  <h3>Find it on the map</h3>
                  <InteractiveMap place={selectedPlace} />
                  <p className="map-credit">Map data © OpenStreetMap contributors</p>
                </div>

                <aside className="detail-sidebar">
                  <h3>Plan your visit</h3>
                  <div className="info-row">
                    <span>Country / region</span>
                    <strong>{selectedPlace.country}</strong>
                  </div>
                  <div className="info-row">
                    <span>Daily budget estimate</span>
                    <strong>₹{money(selectedPlace.cost)}</strong>
                  </div>
                  <div className="info-row">
                    <span>Best time to visit</span>
                    <strong>{selectedPlace.bestTime}</strong>
                  </div>
                  <p className="small-note">
                    Costs are illustrative estimates in INR, not live prices.
                    International travel costs, visas and exchange rates may vary.
                  </p>
                  <button
                    className="primary-button full-button"
                    onClick={() => startPlanning(selectedPlace)}
                  >
                    Plan a trip here →
                  </button>
                </aside>
              </div>
            </section>
          ) : (
            <>
              <section className="hero">
                <div className="heroText">
                  <div className="eyebrow">YOUR JOURNEY STARTS HERE</div>
                  <h1>Discover the world.<br />Travel your way.</h1>
                  <p>
                    Explore Indian destinations, international holidays, forests,
                    beaches and mountains. Discover places on the map and build
                    a trip around your interests and budget.
                  </p>

                  <form
                    className="search"
                    onSubmit={e => {
                      e.preventDefault();
                      document.getElementById("destinations")?.scrollIntoView({
                        behavior: "smooth"
                      });
                    }}
                  >
                    <input
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      placeholder="Search places, countries or experiences"
                      aria-label="Search destinations"
                    />
                    <button type="submit">Explore places</button>
                  </form>

                  <div className="hero-stats">
                    <div><strong>{allPlaces.length}</strong><span>Destinations</span></div>
                    <div><strong>Global</strong><span>Travel inspiration</span></div>
                    <div><strong>Your way</strong><span>Personal trip plans</span></div>
                  </div>
                </div>

                <div className="hero-image">
                  <img
                    src="https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1200&q=85"
                    alt="Indian heritage architecture"
                    onError={handleImageError}
                  />
                  <div className="hero-image-caption">
                    <span>Explore somewhere extraordinary</span>
                    <strong>Your next journey awaits</strong>
                  </div>
                </div>
              </section>

              <section className="section" id="destinations">
                <div className="section-heading">
                  <div>
                    <div className="eyebrow">FIND YOUR NEXT EXPERIENCE</div>
                    <h2>Explore destinations</h2>
                    <p className="sub">
                      From Indian heritage to international escapes and wild landscapes.
                    </p>
                  </div>
                </div>

                <div className="trip-filters">
                  {["All Trips", "India", "International", "Forest & Wildlife", "Beaches", "Mountains"].map(filter => (
                    <button
                      key={filter}
                      className={tripFilter === filter ? "active" : ""}
                      onClick={() => setTripFilter(filter)}
                    >
                      {filter}
                    </button>
                  ))}
                </div>

                <div className="cards">
                  {filteredPlaces.map(place => (
                    <article className="card" key={place.name}>
                      <button
                        className="card-image-button"
                        onClick={() => openDestination(place)}
                        aria-label={`View ${place.name} details`}
                      >
                        <RealPlaceImage
                          name={place.name}
                          fallback={place.image}
                          alt={place.name}
                          loading="lazy"
                        />
                        <span className="image-location">
                          {place.country === "India" ? place.state : place.country}
                        </span>
                      </button>

                      <div className="cardbody">
                        <div className="card-title-row">
                          <h3>{place.name}</h3>
                          <span className="rating">★ {place.rating}</span>
                        </div>
                        <p>{place.category}</p>
                        <div className="card-cost">
                          <span>Estimated daily cost</span>
                          <strong>₹{money(place.cost)}</strong>
                        </div>
                        <button
                          className="secondary-button full-button"
                          onClick={() => openDestination(place)}
                        >
                          Explore destination →
                        </button>
                      </div>
                    </article>
                  ))}
                </div>

                {filteredPlaces.length === 0 && (
                  <div className="empty-state">
                    <h3>No destinations found</h3>
                    <p>Try another search or clear the selected filter.</p>
                    <button onClick={() => { setSearch(""); setTripFilter("All Trips"); }}>
                      Clear filters
                    </button>
                  </div>
                )}
              </section>

              <section className="section map-section">
                <div className="section-heading">
                  <div>
                    <div className="eyebrow">EXPLORE GEOGRAPHICALLY</div>
                    <h2>Explore on the map</h2>
                    <p className="sub">Choose a destination to view its map.</p>
                  </div>
                  <select
                    aria-label="Choose map destination"
                    value={mapPlace.name}
                    onChange={e => {
                      const place = allPlaces.find(item => item.name === e.target.value);
                      if (place) setMapPlace(place);
                    }}
                  >
                    {allPlaces.map(place => (
                      <option key={place.name} value={place.name}>{place.name}</option>
                    ))}
                  </select>
                </div>

                <div className="map-layout">
                  <div className="map-frame main-map">
                    <InteractiveMap place={mapPlace} />
                  </div>
                  <aside className="map-info">
                    <span className="eyebrow">SELECTED DESTINATION</span>
                    <h3>{mapPlace.name}</h3>
                    <p>{mapPlace.country === "India" ? `${mapPlace.state}, India` : mapPlace.country}</p>
                    <p>{mapPlace.description}</p>
                    <div className="info-row">
                      <span>Daily budget estimate</span>
                      <strong>₹{money(mapPlace.cost)}</strong>
                    </div>
                    <button className="primary-button full-button" onClick={() => openDestination(mapPlace)}>
                      View destination details
                    </button>
                    <button className="secondary-button full-button" onClick={() => startPlanning(mapPlace)}>
                      Plan a trip here
                    </button>
                  </aside>
                </div>
                <p className="map-credit">Interactive map provided by OpenStreetMap.</p>
              </section>

              <section className="section callout">
                <div>
                  <div className="eyebrow">MAKE IT YOUR JOURNEY</div>
                  <h2>Your interests. Your budget. Your trip.</h2>
                  <p>Create a personalized itinerary for your next adventure.</p>
                </div>
                <button className="primary-button" onClick={() => changeTab("Planner")}>
                  Start planning →
                </button>
              </section>
            </>
          )}
        </main>
      )}

      {tab === "Planner" && (
        <main className="section">
          <div className="planner">
            <div className="planner-intro">
              <div className="eyebrow">SMART TRIP PLANNER</div>
              <h1>Build a trip around your needs.</h1>
              <p>Choose your destination, duration, budget and interests.</p>

              {plan && (
                <div className="planbox">
                  <h2>{plan.destination} · {plan.days} days</h2>
                  <p>Budget: ₹{money(plan.budget)} · Interest: {plan.interest}</p>
                  {plan.trip_id && <p className="pill">Saved trip #{plan.trip_id}</p>}
                  {plan.itinerary?.map((item, index) => (
                    <div className="day" key={`${item.day}-${index}`}>
                      <strong>Day {item.day}</strong>
                      <span>{item.activity}</span>
                      <small>{item.category} · ₹{money(item.estimated_cost)}</small>
                    </div>
                  ))}
                  {plan.itinerary?.length === 0 && (
                    <p>{plan.message || "No itinerary items were returned. Try a destination available in the backend database."}</p>
                  )}
                </div>
              )}
            </div>

            <form className="form" onSubmit={createPlan}>
              <label>
                DESTINATION
                <select value={form.destination} onChange={e => setForm({ ...form, destination: e.target.value })}>
                  {allPlaces.map(place => <option key={place.name} value={place.name}>{place.name}</option>)}
                </select>
              </label>
              <label>
                DAYS
                <input type="number" min="1" max="30" required value={form.days} onChange={e => setForm({ ...form, days: Number(e.target.value) })} />
              </label>
              <label>
                BUDGET (₹)
                <input type="number" min="1" required value={form.budget} onChange={e => setForm({ ...form, budget: Number(e.target.value) })} />
              </label>
              <label>
                INTEREST
                <select value={form.interest} onChange={e => setForm({ ...form, interest: e.target.value })}>
                  {["History", "Food", "Nature", "Beaches", "Adventure", "Culture", "Shopping"].map(item => <option key={item} value={item}>{item}</option>)}
                </select>
              </label>
              <button className="primary-button full-button" disabled={loadingPlan}>
                {loadingPlan ? "Creating your plan..." : "Create my plan"}
              </button>
            </form>
          </div>
        </main>
      )}

      {tab === "Hotels" && (
        <main className="section">
          <div className="eyebrow">STAYS FOR YOUR JOURNEY</div>
          <h1>Hotels & stays</h1>
          <p className="sub">Browse available hotels from your backend. Payments are simulated.</p>

          <div className="hotelgrid">
            {hotels.map((hotel, index) => (
              <article className="hotel" key={hotel.id}>
                <div className="hotelpic">
                  <img
                    src={HOTEL_PHOTOS[index % HOTEL_PHOTOS.length]}
                    alt={`${hotel.name} hotel`}
                    loading="lazy"
                    onError={handleImageError}
                  />
                  <span className="hotel-photo-label">HOTEL & STAY</span>
                </div>
                <div className="hotel-content">
                  <h3>{hotel.name}</h3>
                  <p>{hotel.city} · ★ {hotel.rating}</p>
                  <strong>₹{money(hotel.price_per_night)}/night</strong>
                  <button className="primary-button" onClick={() => book(hotel)}>Book now</button>
                </div>
              </article>
            ))}
          </div>

          {hotels.length === 0 && (
            <div className="empty-state">
              <h3>No hotel records available</h3>
              <button onClick={load} disabled={loadingData}>Refresh hotels</button>
            </div>
          )}
        </main>
      )}

      {tab === "My Trips" && (
        <main className="section">
          <div className="eyebrow">YOUR TRAVEL ACTIVITY</div>
          <h1>My Trips</h1>
          <p className="sub">Your saved itineraries and hotel bookings appear here.</p>

          <div className="kpis">
            <div><b>{trips.length}</b><span>Saved itineraries</span></div>
            <div><b>{bookings.length}</b><span>Hotel bookings</span></div>
            <div><b>{bookings.filter(b => b.payment_status === "Paid").length}</b><span>Paid bookings</span></div>
            <div><b>₹{money(tripValue)}</b><span>Hotel booking value</span></div>
          </div>

          <div className="section-heading">
            <div>
              <h2>Saved itineraries</h2>
              <p className="sub">Itineraries are listed here only when the backend successfully saves them.</p>
            </div>
            <button className="secondary-button" onClick={load} disabled={loadingData}>
              {loadingData ? "Refreshing..." : "Refresh trips"}
            </button>
          </div>

          {trips.length === 0 ? (
            <div className="empty-state">
              <h3>No saved itineraries yet</h3>
              <p>Create a plan in Planner. If no trip appears after creation, check that the backend has the POST /api/planner save logic and GET /api/trips endpoint.</p>
              <button onClick={() => changeTab("Planner")}>Create an itinerary</button>
            </div>
          ) : (
            <div className="trip-list">
              {trips.map((trip, index) => {
                const items = Array.isArray(trip.itinerary)
                  ? trip.itinerary
                  : Array.isArray(trip.items)
                    ? trip.items
                    : [];

                return (
                  <article className="chart trip-card" key={trip.id ?? index}>
                    <div className="section-heading">
                      <div>
                        <h3>{trip.destination || "Trip"}</h3>
                        <p>{trip.days} day(s) · {trip.interest || "Personalized trip"} · Budget ₹{money(trip.budget)}</p>
                      </div>
                      <span className="pill">
                        {trip.created_at ? new Date(trip.created_at).toLocaleDateString("en-IN") : `Trip #${trip.id ?? index + 1}`}
                      </span>
                    </div>
                    {items.length ? items.map((item, i) => (
                      <div className="rowitem" key={item.id ?? `${item.day}-${i}`}>
                        <strong>Day {item.day ?? i + 1} · {item.activity || item.name || "Activity"}</strong>
                        <span>{item.category || item.interest || ""}</span>
                        <span>₹{money(item.estimated_cost ?? item.cost)}</span>
                      </div>
                    )) : <p>No daily items were included in this saved trip record.</p>}
                  </article>
                );
              })}
            </div>
          )}

          <div className="section-heading"><div><h2>Hotel bookings</h2></div></div>
          <div className="table">
            {bookings.length === 0 ? (
              <div className="empty-state">
                <h3>No hotel bookings yet</h3>
                <p>Hotel reservations will appear here after booking.</p>
                <button onClick={() => changeTab("Hotels")}>Explore hotels</button>
              </div>
            ) : bookings.map(booking => (
              <div className="rowitem" key={booking.id}>
                <strong>Booking #{booking.id} · {booking.city}</strong>
                <span>{booking.nights} nights</span>
                <span>₹{money(booking.total_amount)}</span>
                <span className="pill">{booking.payment_status}</span>
              </div>
            ))}
          </div>
        </main>
      )}

      {tab === "Analytics" && (
        <main className="section">
          <div className="eyebrow">TRAVEL DATA OVERVIEW</div>
          <h1>Tourism analytics</h1>
          <p className="sub">Statistics provided by your backend records.</p>

          {analytics ? (
            <>
              <div className="kpis">
                <div><b>{analytics.destination_count ?? allPlaces.length}</b><span>Destinations</span></div>
                <div><b>{analytics.hotel_count ?? hotels.length}</b><span>Hotels</span></div>
                <div><b>{analytics.total_bookings ?? bookings.length}</b><span>Total bookings</span></div>
                <div><b>₹{money(analytics.paid_revenue)}</b><span>Paid revenue</span></div>
              </div>

              <div className="analytics">
                <div className="chart">
                  <h3>Bookings by city</h3>
                  {!analytics.bookings_by_city?.length ? (
                    <p>Booking records will appear here when available.</p>
                  ) : analytics.bookings_by_city.map(item => {
                    const maximum = Math.max(
                      ...analytics.bookings_by_city.map(row => row.bookings),
                      1
                    );

                    return (
                      <div className="barrow" key={item.city}>
                        <span>{item.city}</span>
                        <div className="bar-track">
                          <i style={{ width: `${Math.max(8, item.bookings / maximum * 100)}%` }} />
                        </div>
                        <b>{item.bookings}</b>
                      </div>
                    );
                  })}
                </div>

                <div className="chart">
                  <h3>Platform features</h3>
                  <p>✓ Destination discovery</p>
                  <p>✓ Saved trip itineraries</p>
                  <p>✓ Hotel listings and bookings</p>
                  <p>✓ Simulated payment flow</p>
                  <p>✓ Booking dashboard</p>
                  <p>✓ Tourism analytics API</p>
                </div>
              </div>
            </>
          ) : (
            <div className="empty-state">
              <h3>Analytics unavailable</h3>
              <p>Check your backend connection and retry.</p>
              <button onClick={load} disabled={loadingData}>
                {loadingData ? "Loading..." : "Retry"}
              </button>
            </div>
          )}
        </main>
      )}

      {selectedAttraction && (
        <div
          className="attraction-modal-backdrop"
          onClick={() => setSelectedAttraction(null)}
        >
          <div
            className="attraction-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="attraction-modal-title"
            onClick={e => e.stopPropagation()}
          >
            <button
              type="button"
              className="attraction-modal-close"
              aria-label="Close attraction details"
              onClick={() => setSelectedAttraction(null)}
            >
              ×
            </button>

            <RealPlaceImage
              name={selectedAttraction.name}
              fallback={selectedAttraction.image}
              alt={selectedAttraction.name}
              className="attraction-modal-image"
            />

            <div className="attraction-modal-content">
              <span className="eyebrow">DISCOVER THIS PLACE</span>
              <h2 id="attraction-modal-title">{selectedAttraction.name}</h2>
              <p>{selectedAttraction.description}</p>
              <button
                type="button"
                className="primary-button"
                onClick={() => setSelectedAttraction(null)}
              >
                Back to destination
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="footer">
        <button className="logo" onClick={() => changeTab("Explore")}>
          Wander<span>ly</span>
        </button>
        <p>Discover places. Plan experiences. Travel thoughtfully.</p>
        <small>Student tourism project · Estimated costs are illustrative.</small>
      </footer>
    </div>
  );
}

export default App;
