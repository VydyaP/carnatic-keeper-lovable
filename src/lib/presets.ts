export const RAGAS = [
  "Shankarabharanam",
  "Kalyani",
  "Todi",
  "Bhairavi",
  "Kharaharapriya",
  "Mohanam",
  "Hamsadhwani",
  "Kambhoji",
  "Kedaragowla",
  "Abhogi",
  "Saveri",
  "Hindolam",
  "Madhyamavati",
  "Sriranjani",
  "Reetigowla",
  "Anandabhairavi",
  "Natabhairavi",
  "Charukesi",
  "Simhendramadhyamam",
  "Behag",
];

export const TALAS = [
  "Adi",
  "Rupakam",
  "Misra Chapu",
  "Khanda Chapu",
  "Triputa",
  "Jhampa",
  "Ata",
  "Eka",
  "Matya",
  "Dhruva",
];

export const COMPOSERS = [
  "Tyagaraja",
  "Muthuswami Dikshitar",
  "Syama Sastri",
  "Purandara Dasa",
  "Annamacharya",
  "Swathi Thirunal",
  "Papanasam Sivan",
  "Oothukkadu Venkata Kavi",
  "Mysore Vasudevachar",
  "Bhadrachala Ramadasu",
  "Patnam Subramania Iyer",
  "Gopalakrishna Bharathi",
];

export const DEITIES = [
  "Rama",
  "Krishna",
  "Shiva",
  "Devi",
  "Ganesha",
  "Muruga",
  "Venkateswara",
  "Hanuman",
  "Saraswati",
  "Lakshmi",
  "Vishnu",
  "Ayyappa",
];

export const LANGUAGES = [
  { key: "telugu", label: "Telugu" },
  { key: "tamil", label: "Tamil" },
  { key: "english", label: "English" },
] as const;

export type NotationLanguage = (typeof LANGUAGES)[number]["key"];

/** Free-tier storage budget for notation uploads (1 GB). */
export const STORAGE_BUDGET_BYTES = 1024 * 1024 * 1024;

export const FIELDS = [
  { key: "raga", label: "Raga", options: RAGAS },
  { key: "tala", label: "Tala", options: TALAS },
  { key: "composer", label: "Composer", options: COMPOSERS },
  { key: "deity", label: "Deity", options: DEITIES },
] as const;

export type FieldKey = (typeof FIELDS)[number]["key"];

export function formatBytes(bytes: number): string {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / Math.pow(1024, i);
  return `${value >= 10 || i === 0 ? Math.round(value) : value.toFixed(1)} ${units[i]}`;
}
