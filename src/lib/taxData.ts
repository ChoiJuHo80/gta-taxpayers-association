export interface TreatyCountry {
  no: number;
  country: string;
}

export const TREATY_COUNTRIES: TreatyCountry[] = [
  { no: 1, country: "Albania" },
  { no: 2, country: "Algeria" },
  { no: 3, country: "Andorra" },
  { no: 4, country: "Australia" },
  { no: 5, country: "Austria" },
  { no: 6, country: "Azerbaijan" },
  { no: 7, country: "Bahrain" },
  { no: 8, country: "Bangladesh" },
  { no: 9, country: "Belarus" },
  { no: 10, country: "Belgium" },
  { no: 11, country: "Brazil" },
  { no: 12, country: "Brunei" },
  { no: 13, country: "Bulgaria" },
  { no: 14, country: "Cambodia" },
  { no: 15, country: "Canada" },
  { no: 16, country: "Chile" },
  { no: 17, country: "China" },
  { no: 18, country: "Colombia" },
  { no: 19, country: "Croatia" },
  { no: 20, country: "Czech" },
  { no: 21, country: "Denmark" },
  { no: 22, country: "Ecuador" },
  { no: 23, country: "Egypt" },
  { no: 24, country: "Estonia" },
  { no: 25, country: "Ethiopia" },
  { no: 26, country: "Fiji" },
  { no: 27, country: "Finland" },
  { no: 28, country: "France" },
  { no: 29, country: "Gabon" },
  { no: 30, country: "Georgia" },
  { no: 31, country: "Germany" },
  { no: 32, country: "Greece" },
  { no: 33, country: "Hong Kong" },
  { no: 34, country: "Hungary" },
  { no: 35, country: "Iceland" },
  { no: 36, country: "India" },
  { no: 37, country: "Indonesia" },
  { no: 38, country: "Iran" },
  { no: 39, country: "Ireland" },
  { no: 40, country: "Israel" },
  { no: 41, country: "Italy" },
  { no: 42, country: "Japan" },
  { no: 43, country: "Jordan" },
  { no: 44, country: "Kazakhstan" },
  { no: 45, country: "Kenya" },
  { no: 46, country: "Kuwait" },
  { no: 47, country: "Kyrgyz" },
  { no: 48, country: "Laos" },
  { no: 49, country: "Latvia" },
  { no: 50, country: "Lithuania" },
  { no: 51, country: "Luxembourg" },
  { no: 52, country: "Malaysia" },
  { no: 53, country: "Malta" },
  { no: 54, country: "Mexico" },
  { no: 55, country: "Mongolia" },
  { no: 56, country: "Morocco" },
  { no: 57, country: "Myanmar" },
  { no: 58, country: "Nepal" },
  { no: 59, country: "Netherlands" },
  { no: 60, country: "New Zealand" },
  { no: 61, country: "Nigeria" },
  { no: 62, country: "Norway" },
  { no: 63, country: "Oman" },
  { no: 64, country: "Pakistan" },
  { no: 65, country: "Panama" },
  { no: 66, country: "Papua New Guinea" },
  { no: 67, country: "Peru" },
  { no: 68, country: "Philippines" },
  { no: 69, country: "Poland" },
  { no: 70, country: "Portugal" },
  { no: 71, country: "Qatar" },
  { no: 72, country: "Romania" },
  { no: 73, country: "Russia" },
  { no: 74, country: "Rwanda" },
  { no: 75, country: "Saudi Arabia" },
  { no: 76, country: "Serbia" },
  { no: 77, country: "Singapore" },
  { no: 78, country: "Slovakia" },
  { no: 79, country: "Slovenia" },
  { no: 80, country: "South Africa" },
  { no: 81, country: "Spain" },
  { no: 82, country: "Sri Lanka" },
  { no: 83, country: "Sudan" },
  { no: 84, country: "Sweden" },
  { no: 85, country: "Switzerland" },
  { no: 86, country: "Taiwan" },
  { no: 87, country: "Tajikistan" },
  { no: 88, country: "Thailand" },
  { no: 89, country: "Tunisia" },
  { no: 90, country: "Turkiye" },
  { no: 91, country: "Turkmenistan" },
  { no: 92, country: "U.A.E" },
  { no: 93, country: "UK" },
  { no: 94, country: "Ukraine" },
  { no: 95, country: "Uruguay" },
  { no: 96, country: "U.S.A" },
  { no: 97, country: "Uzbekistan" },
  { no: 98, country: "Venezuela" },
  { no: 99, country: "Vietnam" }
];

export interface TaxTableRow {
  monthlySalaryUsd: number;
  annualSalaryUsd: number;
  monthlySalaryKrw: number;
  annualSalaryKrw: number;
  effectiveRate: number; // e.g. 0.0662786... or 0.209
  monthlyPayableTaxKrw: number;
  taxType: 'Progressive' | 'Flat 20.9%';
}

export const SALARY_TAX_TABLE_1300: TaxTableRow[] = [
  {
    monthlySalaryUsd: 3000,
    annualSalaryUsd: 36000,
    monthlySalaryKrw: 3900000,
    annualSalaryKrw: 46800000,
    effectiveRate: 0.066278643162393167,
    monthlyPayableTaxKrw: 258470,
    taxType: 'Progressive'
  },
  {
    monthlySalaryUsd: 4000,
    annualSalaryUsd: 48000,
    monthlySalaryKrw: 5200000,
    annualSalaryKrw: 62400000,
    effectiveRate: 0.087720857371794858,
    monthlyPayableTaxKrw: 456140,
    taxType: 'Progressive'
  },
  {
    monthlySalaryUsd: 5000,
    annualSalaryUsd: 60000,
    monthlySalaryKrw: 6500000,
    annualSalaryKrw: 78000000,
    effectiveRate: 0.11866292307692307,
    monthlyPayableTaxKrw: 771300,
    taxType: 'Progressive'
  },
  {
    monthlySalaryUsd: 6000,
    annualSalaryUsd: 72000,
    monthlySalaryKrw: 7800000,
    annualSalaryKrw: 93600000,
    effectiveRate: 0.13943176923076925,
    monthlyPayableTaxKrw: 1087550,
    taxType: 'Progressive'
  },
  {
    monthlySalaryUsd: 7000,
    annualSalaryUsd: 84000,
    monthlySalaryKrw: 9100000,
    annualSalaryKrw: 109200000,
    effectiveRate: 0.1600364716117216,
    monthlyPayableTaxKrw: 1456320,
    taxType: 'Progressive'
  },
  {
    monthlySalaryUsd: 8000,
    annualSalaryUsd: 96000,
    monthlySalaryKrw: 10400000,
    annualSalaryKrw: 124800000,
    effectiveRate: 0.18842376842948719,
    monthlyPayableTaxKrw: 1959600,
    taxType: 'Progressive'
  },
  {
    monthlySalaryUsd: 9000,
    annualSalaryUsd: 108000,
    monthlySalaryKrw: 11700000,
    annualSalaryKrw: 140400000,
    effectiveRate: 0.20815234971509972,
    monthlyPayableTaxKrw: 2435370,
    taxType: 'Progressive'
  },
  {
    monthlySalaryUsd: 10000,
    annualSalaryUsd: 120000,
    monthlySalaryKrw: 13000000,
    annualSalaryKrw: 156000000,
    effectiveRate: 0.209,
    monthlyPayableTaxKrw: 2717000,
    taxType: 'Flat 20.9%'
  },
  {
    monthlySalaryUsd: 11000,
    annualSalaryUsd: 132000,
    monthlySalaryKrw: 14300000,
    annualSalaryKrw: 171600000,
    effectiveRate: 0.209,
    monthlyPayableTaxKrw: 2988700,
    taxType: 'Flat 20.9%'
  },
  {
    monthlySalaryUsd: 12000,
    annualSalaryUsd: 144000,
    monthlySalaryKrw: 15600000,
    annualSalaryKrw: 187200000,
    effectiveRate: 0.209,
    monthlyPayableTaxKrw: 3260400,
    taxType: 'Flat 20.9%'
  },
  {
    monthlySalaryUsd: 13000,
    annualSalaryUsd: 156000,
    monthlySalaryKrw: 16900000,
    annualSalaryKrw: 202800000,
    effectiveRate: 0.209,
    monthlyPayableTaxKrw: 3532100,
    taxType: 'Flat 20.9%'
  },
  {
    monthlySalaryUsd: 14000,
    annualSalaryUsd: 168000,
    monthlySalaryKrw: 18200000,
    annualSalaryKrw: 218400000,
    effectiveRate: 0.209,
    monthlyPayableTaxKrw: 3803800,
    taxType: 'Flat 20.9%'
  }
];
