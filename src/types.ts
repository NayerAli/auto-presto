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
    interior: Record<string, boolean>;
    engine: Record<string, boolean>;
    front: Record<string, boolean>;
    rear: Record<string, boolean>;
    accessories: Record<string, boolean>;
    comments: string;
    revision: {
      type: string;
      quantity: string;
      viscosity: string;
    };
    minDiscThicknessFront: string;
    minDiscThicknessRear: string;
    tasks: Record<string, boolean>;
  }
  
  export interface CheckItems {
    interior: string[];
    engine: string[];
    front: string[];
    rear: string[];
    accessories: string[];
  }