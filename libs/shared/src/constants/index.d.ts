export declare const APP_CONSTANTS: {
    readonly NAME: "CF-ERP";
    readonly VERSION: "1.0.0";
    readonly DESCRIPTION: "Clearing & Forwarding Company ERP System";
    readonly DEFAULT_PAGE_SIZE: 20;
    readonly MAX_PAGE_SIZE: 100;
    readonly DEFAULT_TIMEOUT: 30000;
    readonly JWT_EXPIRY: "24h";
    readonly REFRESH_TOKEN_EXPIRY: "7d";
    readonly PASSWORD_MIN_LENGTH: 8;
    readonly PASSWORD_MAX_LENGTH: 128;
    readonly TOKEN_LENGTH: 32;
    readonly OTP_LENGTH: 6;
    readonly OTP_EXPIRY_MINUTES: 10;
    readonly MAX_LOGIN_ATTEMPTS: 5;
    readonly LOCKOUT_DURATION_MINUTES: 15;
    readonly SESSION_TIMEOUT_MINUTES: 60;
    readonly MAX_FILE_SIZE: number;
    readonly ALLOWED_FILE_TYPES: readonly ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "image/jpeg", "image/png", "image/tiff", "text/csv"];
    readonly CACHE_TTL: {
        readonly SHORT: 60;
        readonly MEDIUM: 300;
        readonly LONG: 3600;
        readonly DAY: 86400;
        readonly WEEK: 604800;
    };
    readonly RATE_LIMIT: {
        readonly DEFAULT: {
            readonly limit: 100;
            readonly windowMs: 60000;
        };
        readonly AUTH: {
            readonly limit: 10;
            readonly windowMs: 60000;
        };
        readonly API: {
            readonly limit: 1000;
            readonly windowMs: 60000;
        };
    };
    readonly PAGINATION: {
        readonly DEFAULT_PAGE: 1;
        readonly DEFAULT_LIMIT: 20;
        readonly MAX_LIMIT: 100;
    };
    readonly DATE_FORMATS: {
        readonly ISO: "YYYY-MM-DD";
        readonly ISO_TIME: "YYYY-MM-DDTHH:mm:ss";
        readonly DISPLAY: "DD/MM/YYYY";
        readonly DISPLAY_TIME: "DD/MM/YYYY HH:mm";
        readonly FILENAME: "YYYYMMDD";
    };
    readonly CURRENCY: {
        readonly DEFAULT: "USD";
        readonly DECIMAL_PLACES: 2;
        readonly ROUNDING_MODE: "HALF_UP";
    };
    readonly WEIGHT_UNITS: readonly ["KG", "LB", "MT", "TON"];
    readonly VOLUME_UNITS: readonly ["CBM", "CFT", "M3", "FT3"];
    readonly LENGTH_UNITS: readonly ["CM", "MM", "M", "IN", "FT"];
    readonly TIMEZONES: readonly ["UTC", "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles", "Europe/London", "Europe/Paris", "Europe/Berlin", "Asia/Dubai", "Asia/Singapore", "Asia/Hong_Kong", "Asia/Tokyo", "Asia/Shanghai", "Australia/Sydney"];
    readonly LANGUAGES: readonly [{
        readonly code: "en";
        readonly name: "English";
    }, {
        readonly code: "zh";
        readonly name: "Chinese";
    }, {
        readonly code: "es";
        readonly name: "Spanish";
    }, {
        readonly code: "fr";
        readonly name: "French";
    }, {
        readonly code: "de";
        readonly name: "German";
    }, {
        readonly code: "ja";
        readonly name: "Japanese";
    }, {
        readonly code: "ko";
        readonly name: "Korean";
    }, {
        readonly code: "ar";
        readonly name: "Arabic";
    }, {
        readonly code: "pt";
        readonly name: "Portuguese";
    }, {
        readonly code: "ru";
        readonly name: "Russian";
    }];
    readonly COUNTRIES: readonly [{
        readonly code: "US";
        readonly name: "United States";
        readonly dialCode: "+1";
    }, {
        readonly code: "CN";
        readonly name: "China";
        readonly dialCode: "+86";
    }, {
        readonly code: "DE";
        readonly name: "Germany";
        readonly dialCode: "+49";
    }, {
        readonly code: "JP";
        readonly name: "Japan";
        readonly dialCode: "+81";
    }, {
        readonly code: "GB";
        readonly name: "United Kingdom";
        readonly dialCode: "+44";
    }, {
        readonly code: "FR";
        readonly name: "France";
        readonly dialCode: "+33";
    }, {
        readonly code: "IN";
        readonly name: "India";
        readonly dialCode: "+91";
    }, {
        readonly code: "IT";
        readonly name: "Italy";
        readonly dialCode: "+39";
    }, {
        readonly code: "BR";
        readonly name: "Brazil";
        readonly dialCode: "+55";
    }, {
        readonly code: "CA";
        readonly name: "Canada";
        readonly dialCode: "+1";
    }, {
        readonly code: "KR";
        readonly name: "South Korea";
        readonly dialCode: "+82";
    }, {
        readonly code: "RU";
        readonly name: "Russia";
        readonly dialCode: "+7";
    }, {
        readonly code: "AU";
        readonly name: "Australia";
        readonly dialCode: "+61";
    }, {
        readonly code: "ES";
        readonly name: "Spain";
        readonly dialCode: "+34";
    }, {
        readonly code: "MX";
        readonly name: "Mexico";
        readonly dialCode: "+52";
    }, {
        readonly code: "ID";
        readonly name: "Indonesia";
        readonly dialCode: "+62";
    }, {
        readonly code: "NL";
        readonly name: "Netherlands";
        readonly dialCode: "+31";
    }, {
        readonly code: "SA";
        readonly name: "Saudi Arabia";
        readonly dialCode: "+966";
    }, {
        readonly code: "TR";
        readonly name: "Turkey";
        readonly dialCode: "+90";
    }, {
        readonly code: "CH";
        readonly name: "Switzerland";
        readonly dialCode: "+41";
    }, {
        readonly code: "TW";
        readonly name: "Taiwan";
        readonly dialCode: "+886";
    }, {
        readonly code: "PL";
        readonly name: "Poland";
        readonly dialCode: "+48";
    }, {
        readonly code: "BE";
        readonly name: "Belgium";
        readonly dialCode: "+32";
    }, {
        readonly code: "SE";
        readonly name: "Sweden";
        readonly dialCode: "+46";
    }, {
        readonly code: "IE";
        readonly name: "Ireland";
        readonly dialCode: "+353";
    }, {
        readonly code: "AT";
        readonly name: "Austria";
        readonly dialCode: "+43";
    }, {
        readonly code: "NO";
        readonly name: "Norway";
        readonly dialCode: "+47";
    }, {
        readonly code: "AE";
        readonly name: "UAE";
        readonly dialCode: "+971";
    }, {
        readonly code: "SG";
        readonly name: "Singapore";
        readonly dialCode: "+65";
    }, {
        readonly code: "HK";
        readonly name: "Hong Kong";
        readonly dialCode: "+852";
    }, {
        readonly code: "MY";
        readonly name: "Malaysia";
        readonly dialCode: "+60";
    }, {
        readonly code: "TH";
        readonly name: "Thailand";
        readonly dialCode: "+66";
    }, {
        readonly code: "VN";
        readonly name: "Vietnam";
        readonly dialCode: "+84";
    }, {
        readonly code: "PH";
        readonly name: "Philippines";
        readonly dialCode: "+63";
    }, {
        readonly code: "ZA";
        readonly name: "South Africa";
        readonly dialCode: "+27";
    }, {
        readonly code: "EG";
        readonly name: "Egypt";
        readonly dialCode: "+20";
    }, {
        readonly code: "NG";
        readonly name: "Nigeria";
        readonly dialCode: "+234";
    }, {
        readonly code: "KE";
        readonly name: "Kenya";
        readonly dialCode: "+254";
    }, {
        readonly code: "MA";
        readonly name: "Morocco";
        readonly dialCode: "+212";
    }, {
        readonly code: "GH";
        readonly name: "Ghana";
        readonly dialCode: "+233";
    }];
    readonly PORTS: readonly [{
        readonly code: "CNSHA";
        readonly name: "Shanghai";
        readonly country: "CN";
    }, {
        readonly code: "SGSIN";
        readonly name: "Singapore";
        readonly country: "SG";
    }, {
        readonly code: "NLRTM";
        readonly name: "Rotterdam";
        readonly country: "NL";
    }, {
        readonly code: "CNSZX";
        readonly name: "Shenzhen";
        readonly country: "CN";
    }, {
        readonly code: "KRBUS";
        readonly name: "Busan";
        readonly country: "KR";
    }, {
        readonly code: "AEJEA";
        readonly name: "Jebel Ali";
        readonly country: "AE";
    }, {
        readonly code: "HKHKG";
        readonly name: "Hong Kong";
        readonly country: "HK";
    }, {
        readonly code: "USLAX";
        readonly name: "Los Angeles";
        readonly country: "US";
    }, {
        readonly code: "USNYC";
        readonly name: "New York";
        readonly country: "US";
    }, {
        readonly code: "DEHAM";
        readonly name: "Hamburg";
        readonly country: "DE";
    }, {
        readonly code: "BEANR";
        readonly name: "Antwerp";
        readonly country: "BE";
    }, {
        readonly code: "CNTXG";
        readonly name: "Tianjin";
        readonly country: "CN";
    }, {
        readonly code: "MYTPP";
        readonly name: "Port Klang";
        readonly country: "MY";
    }, {
        readonly code: "THBKK";
        readonly name: "Bangkok";
        readonly country: "TH";
    }, {
        readonly code: "VNSGN";
        readonly name: "Ho Chi Minh City";
        readonly country: "VN";
    }];
    readonly SHIPPING_LINES: readonly [{
        readonly code: "MSC";
        readonly name: "Mediterranean Shipping Company";
    }, {
        readonly code: "MAEU";
        readonly name: "Maersk Line";
    }, {
        readonly code: "CMA";
        readonly name: "CMA CGM";
    }, {
        readonly code: "COSU";
        readonly name: "COSCO Shipping Lines";
    }, {
        readonly code: "HLCU";
        readonly name: "Hapag-Lloyd";
    }, {
        readonly code: "ONE";
        readonly name: "Ocean Network Express";
    }, {
        readonly code: "EMC";
        readonly name: "Evergreen Marine";
    }, {
        readonly code: "YMLU";
        readonly name: "Yang Ming Marine";
    }, {
        readonly code: "ZIM";
        readonly name: "ZIM Integrated Shipping";
    }, {
        readonly code: "WHL";
        readonly name: "Wan Hai Lines";
    }, {
        readonly code: "PIL";
        readonly name: "Pacific International Lines";
    }, {
        readonly code: "SML";
        readonly name: "Samudera Shipping Line";
    }, {
        readonly code: "RCL";
        readonly name: "Regional Container Lines";
    }, {
        readonly code: "TSL";
        readonly name: "TS Lines";
    }, {
        readonly code: "HEU";
        readonly name: "Heung-A Shipping";
    }];
    readonly AIRLINES: readonly [{
        readonly code: "EK";
        readonly name: "Emirates SkyCargo";
    }, {
        readonly code: "QR";
        readonly name: "Qatar Airways Cargo";
    }, {
        readonly code: "LH";
        readonly name: "Lufthansa Cargo";
    }, {
        readonly code: "CX";
        readonly name: "Cathay Pacific Cargo";
    }, {
        readonly code: "SQ";
        readonly name: "Singapore Airlines Cargo";
    }, {
        readonly code: "KE";
        readonly name: "Korean Air Cargo";
    }, {
        readonly code: "CA";
        readonly name: "Air China Cargo";
    }, {
        readonly code: "CZ";
        readonly name: "China Southern Cargo";
    }, {
        readonly code: "MU";
        readonly name: "China Eastern Cargo";
    }, {
        readonly code: "CV";
        readonly name: "Cargolux";
    }, {
        readonly code: "5S";
        readonly name: "Nippon Cargo Airlines";
    }, {
        readonly code: "CI";
        readonly name: "China Airlines Cargo";
    }, {
        readonly code: "BR";
        readonly name: "EVA Air Cargo";
    }, {
        readonly code: "TK";
        readonly name: "Turkish Cargo";
    }, {
        readonly code: "SV";
        readonly name: "Saudia Cargo";
    }];
    readonly INCOTERMS_2020: readonly ["EXW", "FCA", "CPT", "CIP", "DAP", "DPU", "DDP", "FAS", "FOB", "CFR", "CIF"];
    readonly CONTAINER_TYPES: readonly ["DRY_20FT", "DRY_40FT", "DRY_40FT_HC", "DRY_45FT_HC", "REEFER_20FT", "REEFER_40FT", "REEFER_40FT_HC", "OPEN_TOP_20FT", "OPEN_TOP_40FT", "FLAT_RACK_20FT", "FLAT_RACK_40FT", "TANK_20FT", "TANK_40FT", "SPECIAL"];
    readonly CURRENCIES: readonly [{
        readonly code: "USD";
        readonly name: "US Dollar";
        readonly symbol: "$";
        readonly decimals: 2;
    }, {
        readonly code: "EUR";
        readonly name: "Euro";
        readonly symbol: "€";
        readonly decimals: 2;
    }, {
        readonly code: "GBP";
        readonly name: "British Pound";
        readonly symbol: "£";
        readonly decimals: 2;
    }, {
        readonly code: "JPY";
        readonly name: "Japanese Yen";
        readonly symbol: "¥";
        readonly decimals: 0;
    }, {
        readonly code: "CNY";
        readonly name: "Chinese Yuan";
        readonly symbol: "¥";
        readonly decimals: 2;
    }, {
        readonly code: "INR";
        readonly name: "Indian Rupee";
        readonly symbol: "₹";
        readonly decimals: 2;
    }, {
        readonly code: "AED";
        readonly name: "UAE Dirham";
        readonly symbol: "د.إ";
        readonly decimals: 2;
    }, {
        readonly code: "SAR";
        readonly name: "Saudi Riyal";
        readonly symbol: "﷼";
        readonly decimals: 2;
    }, {
        readonly code: "SGD";
        readonly name: "Singapore Dollar";
        readonly symbol: "S$";
        readonly decimals: 2;
    }, {
        readonly code: "HKD";
        readonly name: "Hong Kong Dollar";
        readonly symbol: "HK$";
        readonly decimals: 2;
    }, {
        readonly code: "AUD";
        readonly name: "Australian Dollar";
        readonly symbol: "A$";
        readonly decimals: 2;
    }, {
        readonly code: "CAD";
        readonly name: "Canadian Dollar";
        readonly symbol: "C$";
        readonly decimals: 2;
    }, {
        readonly code: "CHF";
        readonly name: "Swiss Franc";
        readonly symbol: "CHF";
        readonly decimals: 2;
    }, {
        readonly code: "SEK";
        readonly name: "Swedish Krona";
        readonly symbol: "kr";
        readonly decimals: 2;
    }, {
        readonly code: "NOK";
        readonly name: "Norwegian Krone";
        readonly symbol: "kr";
        readonly decimals: 2;
    }, {
        readonly code: "DKK";
        readonly name: "Danish Krone";
        readonly symbol: "kr";
        readonly decimals: 2;
    }, {
        readonly code: "ZAR";
        readonly name: "South African Rand";
        readonly symbol: "R";
        readonly decimals: 2;
    }, {
        readonly code: "BRL";
        readonly name: "Brazilian Real";
        readonly symbol: "R$";
        readonly decimals: 2;
    }, {
        readonly code: "MXN";
        readonly name: "Mexican Peso";
        readonly symbol: "$";
        readonly decimals: 2;
    }, {
        readonly code: "KRW";
        readonly name: "South Korean Won";
        readonly symbol: "₩";
        readonly decimals: 0;
    }, {
        readonly code: "THB";
        readonly name: "Thai Baht";
        readonly symbol: "฿";
        readonly decimals: 2;
    }, {
        readonly code: "MYR";
        readonly name: "Malaysian Ringgit";
        readonly symbol: "RM";
        readonly decimals: 2;
    }, {
        readonly code: "IDR";
        readonly name: "Indonesian Rupiah";
        readonly symbol: "Rp";
        readonly decimals: 0;
    }, {
        readonly code: "PHP";
        readonly name: "Philippine Peso";
        readonly symbol: "₱";
        readonly decimals: 2;
    }, {
        readonly code: "VND";
        readonly name: "Vietnamese Dong";
        readonly symbol: "₫";
        readonly decimals: 0;
    }, {
        readonly code: "TRY";
        readonly name: "Turkish Lira";
        readonly symbol: "₺";
        readonly decimals: 2;
    }, {
        readonly code: "PLN";
        readonly name: "Polish Zloty";
        readonly symbol: "zł";
        readonly decimals: 2;
    }, {
        readonly code: "CZK";
        readonly name: "Czech Koruna";
        readonly symbol: "Kč";
        readonly decimals: 2;
    }, {
        readonly code: "HUF";
        readonly name: "Hungarian Forint";
        readonly symbol: "Ft";
        readonly decimals: 0;
    }, {
        readonly code: "RON";
        readonly name: "Romanian Leu";
        readonly symbol: "lei";
        readonly decimals: 2;
    }, {
        readonly code: "BGN";
        readonly name: "Bulgarian Lev";
        readonly symbol: "лв";
        readonly decimals: 2;
    }, {
        readonly code: "HRK";
        readonly name: "Croatian Kuna";
        readonly symbol: "kn";
        readonly decimals: 2;
    }];
};
export type AppConstants = typeof APP_CONSTANTS;
