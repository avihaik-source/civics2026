// ===== יחידות לימוד =====
const UNITS_DATA = [
  {
    id: 1, stage: "א", stageTitle: "יסודות היסטוריים ומושגיים",
    title: "הרקע ההיסטורי והחלטה 181",
    icon: "fa-landmark",
    topics: ["הקונגרס הציוני","הצהרת בלפור","כתב המנדט","החלטת החלוקה","הקו הירוק"],
    frequency: "בינונית", freqColor: "yellow", questionCount: 2
  },
  {
    id: 2, stage: "א", stageTitle: "יסודות היסטוריים ומושגיים",
    title: "הכרזת העצמאות + הצדקות",
    icon: "fa-scroll",
    topics: ["5 חלקי המגילה","הצדקות","פניות","עקרונות יסוד"],
    frequency: "גבוהה", freqColor: "red", questionCount: 4
  },
  {
    id: 3, stage: "א", stageTitle: "יסודות היסטוריים ומושגיים",
    title: "הרעיון הלאומי",
    icon: "fa-flag",
    topics: ["5 תנאים למדינה","לאומיות אתנית-תרבותית מול פוליטית","עמדות לגבי אופי המדינה"],
    frequency: "גבוהה", freqColor: "red", questionCount: 3
  },
  {
    id: 4, stage: "א", stageTitle: "יסודות היסטוריים ומושגיים",
    title: "מאפייני מדינה יהודית",
    icon: "fa-star-of-david",
    topics: ["חוק השבות","סמלים","סטטוס קוו","חוק הלאום"],
    frequency: "גבוהה", freqColor: "red", questionCount: 4
  },
  {
    id: 5, stage: "א", stageTitle: "יסודות היסטוריים ומושגיים",
    title: "מדינת ישראל והמיעוטים",
    icon: "fa-people-group",
    topics: ["זכויות מיעוטים","שסע לאומי","ערבים בישראל"],
    frequency: "בינונית", freqColor: "yellow", questionCount: 3
  },
  {
    id: 6, stage: "א", stageTitle: "יסודות היסטוריים ומושגיים",
    title: "יחסי ישראל והתפוצות",
    icon: "fa-globe",
    topics: ["מחויבות הדדית","יד ושם","הצדקה היסטורית"],
    frequency: "בינונית", freqColor: "yellow", questionCount: 3
  },
  {
    id: 7, stage: "ב", stageTitle: "עקרונות דמוקרטיה וזכויות",
    title: "עקרונות הדמוקרטיה",
    icon: "fa-balance-scale",
    topics: ["שלטון העם","פלורליזם","הסכמיות","סובלנות","הכרעת הרוב","שלטון החוק"],
    frequency: "גבוהה מאוד", freqColor: "red", questionCount: 6
  },
  {
    id: 8, stage: "ב", stageTitle: "עקרונות דמוקרטיה וזכויות",
    title: "זכויות האדם והאזרח",
    icon: "fa-shield-halved",
    topics: ["זכויות טבעיות","פרטיות","שוויון","חירות","הליך הוגן"],
    frequency: "גבוהה מאוד", freqColor: "red", questionCount: 10
  },
  {
    id: 9, stage: "ב", stageTitle: "עקרונות דמוקרטיה וזכויות",
    title: "חוקי יסוד ודמוקרטיה מתגוננת",
    icon: "fa-gavel",
    topics: ["חוקי יסוד","המהפכה החוקתית","דמוקרטיה מתגוננת","ביקורת שיפוטית"],
    frequency: "בינונית-גבוהה", freqColor: "orange", questionCount: 3
  },
  {
    id: 10, stage: "ב", stageTitle: "עקרונות דמוקרטיה וזכויות",
    title: "גישות כלכליות-חברתיות",
    icon: "fa-coins",
    topics: ["ליברלית מול סוציאל-דמוקרטית","מיסוי","מעורבות מדינה"],
    frequency: "בינונית-גבוהה", freqColor: "orange", questionCount: 4
  },
  {
    id: 11, stage: "ג", stageTitle: "מוסדות שלטון ומנגנונים",
    title: "שלוש רשויות השלטון",
    icon: "fa-building-columns",
    topics: ["הכנסת","הממשלה","הרשות השופטת"],
    frequency: "גבוהה", freqColor: "red", questionCount: 4
  },
  {
    id: 12, stage: "ג", stageTitle: "מוסדות שלטון ומנגנונים",
    title: "מנגנוני פיקוח וביקורת",
    icon: "fa-magnifying-glass",
    topics: ["פורמליים ובלתי פורמליים","מבקר המדינה","נציב תלונות הציבור"],
    frequency: "גבוהה", freqColor: "red", questionCount: 4
  },
  {
    id: 13, stage: "ג", stageTitle: "מוסדות שלטון ומנגנונים",
    title: "שיטת הבחירות בישראל",
    icon: "fa-check-to-slot",
    topics: ["שיטת בחירות יחסית","אחוז חסימה","קואליציה"],
    frequency: "לא במיקוד", freqColor: "gray", questionCount: 2,
    notInFocus: true
  },
  {
    id: 14, stage: "ד", stageTitle: "חברה ותרבות פוליטית",
    title: "תקשורת ודמוקרטיה",
    icon: "fa-tv",
    topics: ["תקשורת המונים","חופש העיתונות","בעלות צולבת"],
    frequency: "לא במיקוד", freqColor: "gray", questionCount: 2,
    notInFocus: true
  },
  {
    id: 15, stage: "ד", stageTitle: "חברה ותרבות פוליטית",
    title: "מעורבות אזרחית ורשויות מקומיות",
    icon: "fa-handshake",
    topics: ["קבוצות אינטרס","ועדה קרואה","רשות מקומית"],
    frequency: "לא במיקוד", freqColor: "gray", questionCount: 2,
    notInFocus: true
  },
  {
    id: 16, stage: "ד", stageTitle: "חברה ותרבות פוליטית",
    title: "סיכום ואינטגרציה",
    icon: "fa-puzzle-piece",
    topics: ["קישור בין יחידות","סימולציית בחינה","חזרה כללית"],
    frequency: "בינונית", freqColor: "yellow", questionCount: 5
  }
];

// Stage colors
const STAGE_COLORS = {
  "א": { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", badge: "bg-blue-100 text-blue-800", icon: "text-blue-500" },
  "ב": { bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-700", badge: "bg-purple-100 text-purple-800", icon: "text-purple-500" },
  "ג": { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", badge: "bg-emerald-100 text-emerald-800", icon: "text-emerald-500" },
  "ד": { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", badge: "bg-amber-100 text-amber-800", icon: "text-amber-500" }
};

const FREQ_COLORS = {
  red: "bg-red-100 text-red-700",
  orange: "bg-orange-100 text-orange-700",
  yellow: "bg-yellow-100 text-yellow-700",
  gray: "bg-gray-100 text-gray-500"
};
