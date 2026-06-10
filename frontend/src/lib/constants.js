// Must match the backend's schemas.js CATEGORIES enum exactly (mining context).
export const CATEGORIES = [
  "Equipment Failure",
  "Safety Incident",
  "Production Issue",
  "Logistics & Supply",
  "Environmental Compliance",
  "Staff & Training",
  "Billing & Licensing",
  "Payroll & Finance",
  "Feature Request",
  "Account & Access",
  "Other",
];

export const PRIORITIES = ["Low", "Medium", "High", "Urgent"];

// Priority -> { spine color (left bar), badge classes }. Kept earthy but readable.
// Left-edge "spine" color per priority.
export const PRIORITY_SPINE = {
  Urgent: "#9A3412",
  High: "#B45309",
  Medium: "#B8935A",
  Low: "#5B7A52",
};

export const PRIORITY_BADGE = {
  Urgent: "bg-[#FBE6E0] text-[#9A3412]",
  High: "bg-[#F7E8CF] text-[#92531A]",
  Medium: "bg-[#EFE7DA] text-[#6B5D52]",
  Low: "bg-[#E7EEE6] text-[#3F6B4B]",
};

export const SENTIMENT_BADGE = {
  Positive: "bg-[#E7EEE6] text-[#3F6B4B]",
  Neutral: "bg-[#ECE6DC] text-[#6B5D52]",
  Negative: "bg-[#FBE6E0] text-[#9A3412]",
};

// Suggested starter questions for the assistant's empty state (match seeded KB).
export const STARTER_QUESTIONS = [
  "How does the payroll module handle overtime?",
  "What does the Grade Control module do?",
  "How are contractor certifications tracked?",
];
