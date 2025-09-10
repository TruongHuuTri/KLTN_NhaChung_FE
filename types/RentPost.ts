export type Address = {
  street?: string; // Optional theo API guide
  ward: string;
  city: string;
  specificAddress?: string; // Thay thế houseNumber
  showSpecificAddress?: boolean; // Thay thế showHouseNumber
  provinceCode: string;
  provinceName: string;
  wardCode: string;
  wardName: string;
  additionalInfo?: string;
};
export type PhongTroData = {
  addr: Address | null;
  furniture: "" | "full" | "co-ban" | "trong";
  area: number;
  price: number;
  deposit: number;
  title: string;
  desc: string;
};

export type ChungCuData = {
  buildingName: string;
  addr: Address | null;
  blockOrTower: string;
  floorNumber: number;
  unitCode: string;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  direction: string;
  furniture: string;
  legalStatus: string;
  area: number;
  price: number;
  deposit: number;
  title: string;
  desc: string;
};

export type NhaNguyenCanData = {
  addr: Address | null;
  khuLo: string;
  unitCode: string;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  direction: string;
  totalFloors: number;
  furniture: string;
  legalStatus: string;
  landArea: number;
  usableArea: number;
  width: number;
  length: number;
  price: number;
  deposit: number;
  title: string;
  desc: string;
  features: string[];
};
