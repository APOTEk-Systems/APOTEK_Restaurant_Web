import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return `TZS ${amount.toLocaleString('en-US')}`;
}


export const getUnitSymbol = (unitName: string): string => {
  const unitSymbols: Record<string, string> = {
    // Weight
    kilogram: "kg",
    kilograms: "kg",
    kg: "kg",
    gram: "g",
    grams: "g",
    g: "g",
    milligram: "mg",
    milligrams: "mg",
    mg: "mg",
    ton: "t",
    tons: "t",
    tonne: "t",
    tonnes: "t",
    // Volume
    liter: "l",
    liters: "l",
    litre: "l",
    litres: "l",
    L: "L",
    milliliter: "mL",
    milliliters: "mL",
    ml: "mL",
    gallon: "gal",
    gallons: "gal",
    gal: "gal",
    ounce: "oz",
    ounces: "oz",
    oz: "oz",
    // Count
    piece: "pc",
    pieces: "pcs",
    pc: "pc",
    pcs: "pcs",
    unit: "u",
    units: "u",
    box: "box",
    boxes: "box",
    packet: "pkt",
    packets: "pkt",
    pkt: "pkt",
    case: "case",
    cases: "case",
    dozen: "doz",
    dozens: "doz",
    doz: "doz",
    bottle: "btl",
    bottles: "btl",
    btl: "btl",
    can: "can",
    cans: "can",
    sack: "sack",
    sacks: "sack",
    bag: "bag",
    bags: "bag",
  };
  
  const normalized = unitName.toLowerCase().trim();
  return unitSymbols[normalized] || unitName;
};
