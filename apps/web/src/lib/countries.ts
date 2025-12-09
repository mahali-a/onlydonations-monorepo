import type { CountryCode } from "libphonenumber-js";

export type Country = {
  code: CountryCode;
  name: string;
  dialCode: string;
};

export const countries: Country[] = [
  { code: "GH", name: "Ghana", dialCode: "+233" },
  { code: "NG", name: "Nigeria", dialCode: "+234" },
  { code: "KE", name: "Kenya", dialCode: "+254" },
  { code: "ZA", name: "South Africa", dialCode: "+27" },
  { code: "US", name: "United States", dialCode: "+1" },
  { code: "GB", name: "United Kingdom", dialCode: "+44" },
  { code: "CA", name: "Canada", dialCode: "+1" },
  { code: "DE", name: "Germany", dialCode: "+49" },
  { code: "FR", name: "France", dialCode: "+33" },
  { code: "NL", name: "Netherlands", dialCode: "+31" },
  { code: "AU", name: "Australia", dialCode: "+61" },
  { code: "IN", name: "India", dialCode: "+91" },
  { code: "AE", name: "United Arab Emirates", dialCode: "+971" },
  { code: "SG", name: "Singapore", dialCode: "+65" },
  { code: "RW", name: "Rwanda", dialCode: "+250" },
  { code: "TZ", name: "Tanzania", dialCode: "+255" },
  { code: "UG", name: "Uganda", dialCode: "+256" },
  { code: "ET", name: "Ethiopia", dialCode: "+251" },
  { code: "EG", name: "Egypt", dialCode: "+20" },
  { code: "MA", name: "Morocco", dialCode: "+212" },
  { code: "CI", name: "Côte d'Ivoire", dialCode: "+225" },
  { code: "SN", name: "Senegal", dialCode: "+221" },
  { code: "CM", name: "Cameroon", dialCode: "+237" },
  { code: "ZW", name: "Zimbabwe", dialCode: "+263" },
  { code: "BW", name: "Botswana", dialCode: "+267" },
];

export const defaultCountry: Country = {
  code: "GH",
  name: "Ghana",
  dialCode: "+233",
};

export function getCountryByCode(code: CountryCode): Country | undefined {
  return countries.find((c) => c.code === code);
}

export function getCountryByDialCode(dialCode: string): Country | undefined {
  return countries.find((c) => c.dialCode === dialCode);
}
