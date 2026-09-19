"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type Lang = "te" | "en" | "hi";

type Dict = Record<string, string>;

function flatten(obj: Record<string, unknown>, prefix = ""): Dict {
  const out: Dict = {};
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "string") {
      out[path] = value;
    } else {
      Object.assign(out, flatten(value as Record<string, unknown>, path));
    }
  }
  return out;
}

const raw = {
  en: {
    common: {
      appName: "Sasyamedha",
      back: "Back",
      retry: "Retry",
      call: "Call",
      loading: "Loading…",
      speak: "Listen",
      stop: "Stop",
      skip: "Skip",
      save: "Save",
      continueBtn: "Continue",
      km: "km away",
      languageSwitchLabel: "Language",
      priceTrendLabel: "price trend",
      justNow: "just now",
      minAgo: "{n} min ago",
      hrAgo: "{n} hr ago",
      daysAgo: "{n} days ago",
    },
    language: {
      title: "Choose your language",
      subtitle: "Pick the language you are most comfortable with",
      te: "తెలుగు",
      en: "English",
      hi: "हिन्दी",
    },
    onboarding: {
      title: "Tell us about yourself",
      nameLabel: "Your name",
      namePlaceholder: "Enter your name",
      phoneLabel: "Phone number",
      phonePlaceholder: "10-digit mobile number",
      stateLabel: "State",
      districtLabel: "District",
      cropLabel: "What do you mostly grow?",
      cropTomato: "Tomato",
      cropOnion: "Onion",
      cropChilli: "Chilli",
      cropBrinjal: "Brinjal",
      skip: "Skip for now",
      continueBtn: "Continue",
    },
    home: {
      greeting: "Hello, {name}",
      batchTitle: "Your current crop",
      batchEmpty: "No active crop batch yet",
      batchCreate: "Add a crop batch",
      batchQuantity: "{qty} kg",
      tileScan: "Check Crop",
      tileMarket: "Market Prices",
      tileSell: "Sell Crop",
      tileStorage: "Cold Storage",
      tileTransport: "Transport",
      tileAssistant: "Assistant",
      updated: "Updated {time}",
      online: "Online",
      offline: "Offline",
    },
    scan: {
      title: "Check your crop",
      hintFill: "Fill the frame with the leaf",
      hintDaylight: "Take the photo in daylight",
      hintPlain: "Use a plain background",
      capture: "Take photo",
      uploading: "Checking your photo…",
    },
    scanResult: {
      title: "Result",
      confidenceHigh: "Very likely",
      confidenceMedium: "Fairly sure",
      confidenceLow: "Not sure",
      mockChip: "Demo model — not a trained classifier",
      retake: "Retake photograph",
      askExpert: "Ask an expert",
      viewTreatment: "View treatment",
      clearerPhoto: "Take a clearer photo to confirm",
      caution: "This result is not reliable enough to trust. Please retake the photo.",
    },
    treatment: {
      title: "Treatment guidance",
      symptoms: "Symptoms",
      actions: "What to do now",
      prevention: "Prevention",
      cost: "Indicative cost",
      disclaimer: "Advisory disclaimer",
      notAvailable: "Guidance not available. Please contact your extension officer.",
    },
    prices: {
      title: "Market Prices",
      filterCommodity: "Crop",
      filterDistrict: "District",
      sortPrice: "Sort: Price",
      sortDistance: "Sort: Distance",
      perQuintal: "per quintal",
      perKg: "per kg",
      sourceDate: "Prices for {date}",
      stale: "This price may be outdated",
      trend: "Last 14 days",
      allCommodities: "All crops",
      allDistricts: "All districts",
    },
    sell: {
      title: "Sell Crop",
      quantity: "Quantity",
      bestForYou: "Best for you",
      netReturn: "Net return",
      pricePerKg: "₹{price}/kg",
      breakdown: "See how this is calculated",
      hideBreakdown: "Hide calculation",
      call: "Call",
      noResults: "No destinations found for this crop yet.",
    },
    buyers: {
      title: "Buyers & FPOs",
      tabBuyers: "Buyers",
      tabFpos: "FPOs",
      verified: "Verified",
      cropsSought: "Crops bought",
      quantityWindow: "Quantity accepted",
      indicativePrice: "Indicative price",
      pickupOffered: "Farm-gate pickup available",
      noResults: "No buyers found nearby.",
    },
    storage: {
      title: "Cold Storage",
      available: "{pct}% space free",
      costPerDay: "₹{cost}/kg/day",
      noResults: "No cold storage found nearby.",
    },
    transport: {
      title: "Transport",
      capacity: "Capacity: {cap} kg",
      estimatedCost: "Estimated cost",
      requestTitle: "Request this vehicle",
      pickupLabel: "Pickup location",
      destinationLabel: "Destination",
      cropLabel: "Crop",
      quantityLabel: "Quantity (kg)",
      dateLabel: "Date",
      submit: "Request transport",
      referencePrefix: "Your reference number",
      noResults: "No vehicle can carry this quantity yet.",
    },
    assistant: {
      title: "Assistant",
      placeholder: "Type what you need — e.g. prices, sell, storage",
      send: "Send",
    },
    offline: {
      banner: "You are offline. Showing saved data.",
    },
    errors: {
      network: "Could not reach the server. Please check your connection.",
      generic: "Something went wrong. Please try again.",
      cameraPermission: "Camera access is needed to check your crop.",
      loginFailed: "We could not find this phone number. Please check and try again.",
    },
  },
  te: {
    common: {
      appName: "సస్యమేధ",
      back: "వెనక్కి",
      retry: "మళ్లీ ప్రయత్నించండి",
      call: "కాల్ చేయండి",
      loading: "లోడ్ అవుతోంది…",
      speak: "వినండి",
      stop: "ఆపు",
      skip: "దాటవేయండి",
      save: "సేవ్ చేయండి",
      continueBtn: "కొనసాగించండి",
      km: "కి.మీ దూరం",
      languageSwitchLabel: "భాష",
      priceTrendLabel: "ధర ధోరణి",
      justNow: "ఇప్పుడే",
      minAgo: "{n} నిమిషాల క్రితం",
      hrAgo: "{n} గంటల క్రితం",
      daysAgo: "{n} రోజుల క్రితం",
    },
    language: {
      title: "మీ భాషను ఎంచుకోండి",
      subtitle: "మీకు అనువైన భాషను ఎంచుకోండి",
      te: "తెలుగు",
      en: "English",
      hi: "हिन्दी",
    },
    onboarding: {
      title: "మీ గురించి చెప్పండి",
      nameLabel: "మీ పేరు",
      namePlaceholder: "మీ పేరు నమోదు చేయండి",
      phoneLabel: "ఫోన్ నంబర్",
      phonePlaceholder: "10 అంకెల మొబైల్ నంబర్",
      stateLabel: "రాష్ట్రం",
      districtLabel: "జిల్లా",
      cropLabel: "మీరు ఎక్కువగా ఏమి పండిస్తారు?",
      cropTomato: "టమాటా",
      cropOnion: "ఉల్లిపాయ",
      cropChilli: "మిర్చి",
      cropBrinjal: "వంకాయ",
      skip: "ప్రస్తుతానికి దాటవేయండి",
      continueBtn: "కొనసాగించండి",
    },
    home: {
      greeting: "నమస్కారం, {name}",
      batchTitle: "మీ ప్రస్తుత పంట",
      batchEmpty: "ఇంకా పంట బ్యాచ్ లేదు",
      batchCreate: "పంట బ్యాచ్‌ను జోడించండి",
      batchQuantity: "{qty} కిలోలు",
      tileScan: "పంటను తనిఖీ చేయండి",
      tileMarket: "మార్కెట్ ధరలు",
      tileSell: "పంటను అమ్మండి",
      tileStorage: "కోల్డ్ స్టోరేజ్",
      tileTransport: "రవాణా",
      tileAssistant: "సహాయకుడు",
      updated: "నవీకరించబడింది {time}",
      online: "ఆన్‌లైన్",
      offline: "ఆఫ్‌లైన్",
    },
    scan: {
      title: "మీ పంటను తనిఖీ చేయండి",
      hintFill: "ఆకుతో ఫ్రేమ్‌ను నింపండి",
      hintDaylight: "పగటి వెలుతురులో ఫోటో తీయండి",
      hintPlain: "సాదా నేపథ్యాన్ని ఉపయోగించండి",
      capture: "ఫోటో తీయండి",
      uploading: "మీ ఫోటోను తనిఖీ చేస్తోంది…",
    },
    scanResult: {
      title: "ఫలితం",
      confidenceHigh: "ఖచ్చితంగా ఉంది",
      confidenceMedium: "సాధారణంగా నమ్మవచ్చు",
      confidenceLow: "నమ్మకం లేదు",
      mockChip: "డెమో మోడల్ — శిక్షణ పొందిన వర్గీకరణి కాదు",
      retake: "మళ్లీ ఫోటో తీయండి",
      askExpert: "నిపుణుడిని అడగండి",
      viewTreatment: "చికిత్స చూడండి",
      clearerPhoto: "నిర్ధారించడానికి స్పష్టమైన ఫోటో తీయండి",
      caution: "ఈ ఫలితం నమ్మదగినది కాదు. దయచేసి మళ్లీ ఫోటో తీయండి.",
    },
    treatment: {
      title: "చికిత్స మార్గదర్శకం",
      symptoms: "లక్షణాలు",
      actions: "ఇప్పుడు ఏమి చేయాలి",
      prevention: "నివారణ",
      cost: "సూచించిన ఖర్చు",
      disclaimer: "సలహా నిరాకరణ",
      notAvailable: "మార్గదర్శకం అందుబాటులో లేదు. దయచేసి మీ వ్యవసాయ అధికారిని సంప్రదించండి.",
    },
    prices: {
      title: "మార్కెట్ ధరలు",
      filterCommodity: "పంట",
      filterDistrict: "జిల్లా",
      sortPrice: "క్రమం: ధర",
      sortDistance: "క్రమం: దూరం",
      perQuintal: "ప్రతి క్వింటాల్‌కు",
      perKg: "ప్రతి కిలోకు",
      sourceDate: "{date} నాటి ధరలు",
      stale: "ఈ ధర పాతది కావచ్చు",
      trend: "గత 14 రోజులు",
      allCommodities: "అన్ని పంటలు",
      allDistricts: "అన్ని జిల్లాలు",
    },
    sell: {
      title: "పంటను అమ్మండి",
      quantity: "పరిమాణం",
      bestForYou: "మీకు ఉత్తమమైనది",
      netReturn: "నికర రాబడి",
      pricePerKg: "₹{price}/కిలో",
      breakdown: "ఇది ఎలా లెక్కించారో చూడండి",
      hideBreakdown: "లెక్కను దాచండి",
      call: "కాల్ చేయండి",
      noResults: "ఈ పంటకు గమ్యస్థానాలు కనుగొనబడలేదు.",
    },
    buyers: {
      title: "కొనుగోలుదారులు & రైతు సంఘాలు",
      tabBuyers: "కొనుగోలుదారులు",
      tabFpos: "రైతు సంఘాలు",
      verified: "ధృవీకరించబడింది",
      cropsSought: "కొనే పంటలు",
      quantityWindow: "అంగీకరించే పరిమాణం",
      indicativePrice: "సూచించిన ధర",
      pickupOffered: "పొలం వద్దే సేకరణ అందుబాటులో ఉంది",
      noResults: "సమీపంలో కొనుగోలుదారులు కనుగొనబడలేదు.",
    },
    storage: {
      title: "కోల్డ్ స్టోరేజ్",
      available: "{pct}% స్థలం ఖాళీగా ఉంది",
      costPerDay: "₹{cost}/కిలో/రోజుకు",
      noResults: "సమీపంలో కోల్డ్ స్టోరేజ్ కనుగొనబడలేదు.",
    },
    transport: {
      title: "రవాణా",
      capacity: "సామర్థ్యం: {cap} కిలోలు",
      estimatedCost: "అంచనా ఖర్చు",
      requestTitle: "ఈ వాహనాన్ని అభ్యర్థించండి",
      pickupLabel: "సేకరణ స్థలం",
      destinationLabel: "గమ్యస్థానం",
      cropLabel: "పంట",
      quantityLabel: "పరిమాణం (కిలోలు)",
      dateLabel: "తేదీ",
      submit: "రవాణాను అభ్యర్థించండి",
      referencePrefix: "మీ రిఫరెన్స్ నంబర్",
      noResults: "ఈ పరిమాణాన్ని మోసుకెళ్లే వాహనం లేదు.",
    },
    assistant: {
      title: "సహాయకుడు",
      placeholder: "మీకు కావలసినది టైప్ చేయండి — ఉదా. ధరలు, అమ్మకం, నిల్వ",
      send: "పంపండి",
    },
    offline: {
      banner: "మీరు ఆఫ్‌లైన్‌లో ఉన్నారు. సేవ్ చేసిన డేటాను చూపిస్తోంది.",
    },
    errors: {
      network: "సర్వర్‌ను చేరుకోలేకపోయాము. దయచేసి మీ ఇంటర్నెట్‌ను తనిఖీ చేయండి.",
      generic: "ఏదో తప్పు జరిగింది. దయచేసి మళ్లీ ప్రయత్నించండి.",
      cameraPermission: "మీ పంటను తనిఖీ చేయడానికి కెమెరా అనుమతి అవసరం.",
      loginFailed: "ఈ ఫోన్ నంబర్ కనుగొనబడలేదు. దయచేసి తనిఖీ చేసి మళ్లీ ప్రయత్నించండి.",
    },
  },
  hi: {
    common: {
      appName: "सस्यमेधा",
      back: "वापस",
      retry: "फिर से कोशिश करें",
      call: "कॉल करें",
      loading: "लोड हो रहा है…",
      speak: "सुनें",
      stop: "रोकें",
      skip: "छोड़ें",
      save: "सेव करें",
      continueBtn: "आगे बढ़ें",
      km: "किमी दूर",
      languageSwitchLabel: "भाषा",
      priceTrendLabel: "कीमत रुझान",
      justNow: "अभी अभी",
      minAgo: "{n} मिनट पहले",
      hrAgo: "{n} घंटे पहले",
      daysAgo: "{n} दिन पहले",
    },
    language: {
      title: "अपनी भाषा चुनें",
      subtitle: "वह भाषा चुनें जो आपको सबसे सहज लगे",
      te: "తెలుగు",
      en: "English",
      hi: "हिन्दी",
    },
    onboarding: {
      title: "अपने बारे में बताएं",
      nameLabel: "आपका नाम",
      namePlaceholder: "अपना नाम दर्ज करें",
      phoneLabel: "फोन नंबर",
      phonePlaceholder: "10 अंकों का मोबाइल नंबर",
      stateLabel: "राज्य",
      districtLabel: "जिला",
      cropLabel: "आप मुख्य रूप से क्या उगाते हैं?",
      cropTomato: "टमाटर",
      cropOnion: "प्याज",
      cropChilli: "मिर्च",
      cropBrinjal: "बैंगन",
      skip: "अभी के लिए छोड़ें",
      continueBtn: "आगे बढ़ें",
    },
    home: {
      greeting: "नमस्ते, {name}",
      batchTitle: "आपकी मौजूदा फसल",
      batchEmpty: "अभी कोई फसल बैच नहीं है",
      batchCreate: "फसल बैच जोड़ें",
      batchQuantity: "{qty} किलो",
      tileScan: "फसल जांचें",
      tileMarket: "बाजार भाव",
      tileSell: "फसल बेचें",
      tileStorage: "कोल्ड स्टोरेज",
      tileTransport: "परिवहन",
      tileAssistant: "सहायक",
      updated: "अपडेट किया गया {time}",
      online: "ऑनलाइन",
      offline: "ऑफ़लाइन",
    },
    scan: {
      title: "अपनी फसल जांचें",
      hintFill: "पत्ती से फ्रेम भरें",
      hintDaylight: "दिन की रोशनी में फोटो लें",
      hintPlain: "सादा पृष्ठभूमि का उपयोग करें",
      capture: "फोटो लें",
      uploading: "आपकी फोटो जांची जा रही है…",
    },
    scanResult: {
      title: "परिणाम",
      confidenceHigh: "पूरा भरोसा है",
      confidenceMedium: "काफी हद तक सही",
      confidenceLow: "भरोसा नहीं है",
      mockChip: "डेमो मॉडल — प्रशिक्षित वर्गीकरणकर्ता नहीं है",
      retake: "फिर से फोटो लें",
      askExpert: "विशेषज्ञ से पूछें",
      viewTreatment: "उपचार देखें",
      clearerPhoto: "पुष्टि के लिए स्पष्ट फोटो लें",
      caution: "यह परिणाम भरोसेमंद नहीं है। कृपया फिर से फोटो लें।",
    },
    treatment: {
      title: "उपचार मार्गदर्शन",
      symptoms: "लक्षण",
      actions: "अभी क्या करें",
      prevention: "रोकथाम",
      cost: "सांकेतिक लागत",
      disclaimer: "सलाह अस्वीकरण",
      notAvailable: "मार्गदर्शन उपलब्ध नहीं है। कृपया अपने कृषि अधिकारी से संपर्क करें।",
    },
    prices: {
      title: "बाजार भाव",
      filterCommodity: "फसल",
      filterDistrict: "जिला",
      sortPrice: "क्रम: कीमत",
      sortDistance: "क्रम: दूरी",
      perQuintal: "प्रति क्विंटल",
      perKg: "प्रति किलो",
      sourceDate: "{date} के भाव",
      stale: "यह कीमत पुरानी हो सकती है",
      trend: "पिछले 14 दिन",
      allCommodities: "सभी फसलें",
      allDistricts: "सभी जिले",
    },
    sell: {
      title: "फसल बेचें",
      quantity: "मात्रा",
      bestForYou: "आपके लिए सबसे अच्छा",
      netReturn: "शुद्ध आय",
      pricePerKg: "₹{price}/किलो",
      breakdown: "यह कैसे निकाला गया देखें",
      hideBreakdown: "गणना छुपाएं",
      call: "कॉल करें",
      noResults: "इस फसल के लिए अभी कोई गंतव्य नहीं मिला।",
    },
    buyers: {
      title: "खरीदार और एफपीओ",
      tabBuyers: "खरीदार",
      tabFpos: "एफपीओ",
      verified: "सत्यापित",
      cropsSought: "खरीदी जाने वाली फसलें",
      quantityWindow: "स्वीकृत मात्रा",
      indicativePrice: "सांकेतिक कीमत",
      pickupOffered: "खेत से पिकअप उपलब्ध है",
      noResults: "आसपास कोई खरीदार नहीं मिला।",
    },
    storage: {
      title: "कोल्ड स्टोरेज",
      available: "{pct}% जगह खाली है",
      costPerDay: "₹{cost}/किलो/दिन",
      noResults: "आसपास कोई कोल्ड स्टोरेज नहीं मिला।",
    },
    transport: {
      title: "परिवहन",
      capacity: "क्षमता: {cap} किलो",
      estimatedCost: "अनुमानित लागत",
      requestTitle: "यह वाहन अनुरोध करें",
      pickupLabel: "पिकअप स्थान",
      destinationLabel: "गंतव्य",
      cropLabel: "फसल",
      quantityLabel: "मात्रा (किलो)",
      dateLabel: "तारीख",
      submit: "परिवहन अनुरोध करें",
      referencePrefix: "आपका संदर्भ नंबर",
      noResults: "इतनी मात्रा ले जाने वाला कोई वाहन नहीं है।",
    },
    assistant: {
      title: "सहायक",
      placeholder: "आपको क्या चाहिए टाइप करें — जैसे भाव, बिक्री, भंडारण",
      send: "भेजें",
    },
    offline: {
      banner: "आप ऑफ़लाइन हैं। सेव किया गया डेटा दिखाया जा रहा है।",
    },
    errors: {
      network: "सर्वर से संपर्क नहीं हो सका। कृपया अपना इंटरनेट जांचें।",
      generic: "कुछ गड़बड़ हो गई। कृपया फिर से कोशिश करें।",
      cameraPermission: "आपकी फसल जांचने के लिए कैमरा अनुमति आवश्यक है।",
      loginFailed: "यह फोन नंबर नहीं मिला। कृपया जांचकर फिर से कोशिश करें।",
    },
  },
} satisfies Record<Lang, Record<string, Record<string, string>>>;

const dicts: Record<Lang, Dict> = {
  en: flatten(raw.en),
  te: flatten(raw.te),
  hi: flatten(raw.hi),
};

const STORAGE_KEY = "sasyamedha_lang";

type Vars = Record<string, string | number>;

function interpolate(template: string, vars?: Vars): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, key) => String(vars[key] ?? ""));
}

interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string, vars?: Vars) => string;
  ready: boolean;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("te");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY) as Lang | null;
      if (stored === "te" || stored === "en" || stored === "hi") {
        setLangState(stored);
      }
    } catch {
      // localStorage unavailable — keep default
    }
    setReady(true);
  }, []);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore
    }
  }, []);

  const t = useCallback(
    (key: string, vars?: Vars) => interpolate(dicts[lang][key] ?? dicts.en[key] ?? key, vars),
    [lang]
  );

  const value = useMemo(() => ({ lang, setLang, t, ready }), [lang, setLang, t, ready]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useT() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useT must be used within LanguageProvider");
  return ctx;
}
