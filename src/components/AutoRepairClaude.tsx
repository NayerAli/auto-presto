// /src/components/AutoRepairClaude.tsx
"use client"

import React, { useState, useRef } from 'react';
import { jsPDF } from "jspdf";
import html2canvas from 'html2canvas';
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast, Toaster } from 'react-hot-toast';

interface FormData {
  date: string;
  immatriculation: string;
  marque: string;
  model: string;
  kilometrage: string;
  prochainCT: string;
  nom: string;
  portable: string;
  commentaire: string;
  revision: string;
  epaisseurMinDisqueAvant: string;
  epaisseurMinDisqueArriere: string;
}

interface Checkboxes {
  [key: string]: boolean;
}

const AutoPrestoForm: React.FC = () => {
  const formRef = useRef<HTMLFormElement>(null);
  const [formData, setFormData] = useState<FormData>({
    date: '',
    immatriculation: '',
    marque: '',
    model: '',
    kilometrage: '',
    prochainCT: '',
    nom: '',
    portable: '',
    commentaire: '',
    revision: '',
    epaisseurMinDisqueAvant: '',
    epaisseurMinDisqueArriere: '',
  });

  const [checkboxes, setCheckboxes] = useState<Checkboxes>({
    // INTERIEUR
    antivolRoue: false, demarreur: false, temoinTableauBord: false,
    retroviseur: false, klaxon: false, freinAMain: false,
    essuieGlace: false, eclairage: false, jeuxAuVolant: false,
    // AVANT
    roulement: false, pneusAvant: false, parallelisme: false,
    disqueAvant: false, plaquettesAvant: false, amortisseurAvant: false,
    bielletteBarre: false, directionComplet: false, cardans: false,
    trianglesAvant: false, flexibleDeFrein: false,
    // MOTEUR
    testeBatterieAlternateur: false, plaqueImmatAV: false, fuiteBoite: false,
    fuiteMoteur: false, supportsMoteur: false, liquideDeFrein: false,
    filtreAAir: false, courroieAccessoire: false,
    // ARRIERE
    pneusAR: false, freinAR: false, roulementAR: false,
    flexibleAR: false, amortisseurAR: false, silentBlocAR: false,
    // ACCESSOIRE
    plaqueImmatAR: false, antenneRadio: false, roueDeSecours: false,
    giletTriangleSecu: false, criqueEtCleRoue: false,
    // TRAVAUX
    miseAZeroVidange: false, roueSerrerAuCouple: false, etiquetteDeVidange: false,
    etiquetteDistribution: false, etiquettePlaquette: false, parfum: false,
    nettoyage: false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleCheckboxChange = (name: string) => {
    setCheckboxes(prevState => ({
      ...prevState,
      [name]: !prevState[name]
    }));
  };

  const generatePDF = async () => {
    if (formRef.current) {
      const canvas = await html2canvas(formRef.current);
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save("auto-presto-form.pdf");
      toast.success('PDF generated successfully!');
    } else {
      toast.error('Failed to generate PDF. Form reference not found.');
    }
  };

  interface CheckboxGroupProps {
    title: string;
    items: string[];
  }

  const CheckboxGroup: React.FC<CheckboxGroupProps> = ({ title, items }) => (
    <div className="space-y-2">
      <h3 className="font-bold text-lg">{title}</h3>
      {items.map((item) => (
        <div key={item} className="flex items-center space-x-2">
          <Switch
            id={item}
            checked={checkboxes[item]}
            onCheckedChange={() => handleCheckboxChange(item)}
          />
          <Label htmlFor={item}>{item.replace(/([A-Z])/g, ' $1').replace(/^./, (str: string) => str.toUpperCase())}</Label>
        </div>
      ))}
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 p-8"
    >
      <Toaster position="top-right" />
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center text-blue-600">Auto Presto Service Form</CardTitle>
        </CardHeader>
        <CardContent>
          <form ref={formRef} className="space-y-6">
            {/* Form content remains the same */}
            {/* ... */}
            <Button onClick={generatePDF} className="w-full">Generate PDF</Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AutoPrestoForm;