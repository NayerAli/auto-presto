// /src/types.ts

export interface FormData {
  date: string;
  immatriculation: string;
  nom: string;
  marque: string;
  portable: string;
  model: string;
  kilometrage: string;
  prochainCT: string;
  interior: { [key: string]: boolean };
  engine: { [key: string]: boolean };
  front: { [key: string]: boolean };
  rear: { [key: string]: boolean };
  accessories: { [key: string]: boolean };
  comments: string;
  revision: {
    type: string;
    quantity: string;
    viscosity: string;
    torque: string;
  };
  minDiscThicknessFront: string;
  minDiscThicknessRear: string;
  tasks: {
    resetOilChange: boolean;
    tightenWheels: boolean;
    oilChangeLabel: boolean;
    timingBeltLabel: boolean;
    brakePadsLabel: boolean;
    perfume: boolean;
    cleaning: boolean;
  };
}

export interface CheckItems {
  interior: string[];
  engine: string[];
  front: string[];
  rear: string[];
  accessories: string[];
}