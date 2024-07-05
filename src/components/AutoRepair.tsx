// src/components/AutoRepair.tsx
"use client"

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { generatePDF } from '@/utils/pdfGenerator2';
import { FormData, CheckItems } from '../types';

const checkItems: CheckItems = {
  interior: ['Antivol de roue', 'Démarreur', 'Témoin tableau de bord', 'Rétroviseur', 'Klaxon', 'Frein à main', 'Essuie glace', 'Eclairage', 'Jeux au volant'],
  engine: ['Teste batterie/alternateur', 'Plaque immat AV', 'Fuite boite', 'Fuite moteur', 'Supports moteur', 'Liquide de frein', 'Filtre à air', 'Courroie accessoire'],
  front: ['Roulement', 'Pneus avant', 'Paralellisme', 'Disque avant', 'Plaquettes avant', 'Amortisseur avant', 'Biellette barre stab', 'Direction complet', 'Cardans', 'Triangles avant', 'Flexible de frein'],
  rear: ['Pneus AR', 'Frein AR', 'Roulement AR', 'Flexible AR', 'Amortisseur AR', 'Silent Bloc AR'],
  accessories: ['Plaque immat AR', 'Antenne radio', 'Roue de secours', 'Gilet/Triangle secu', 'Crique / Clé roue']
};

const initialFormData: FormData = {
  date: '',
  immatriculation: '',
  nom: '',
  marque: '',
  portable: '',
  model: '',
  kilometrage: '',
  prochainCT: '',
  interior: {},
  engine: {},
  front: {},
  rear: {},
  accessories: {},
  comments: '',
  revision: {
    type: '',
    quantity: '',
    viscosity: '',
    torque: ''
  },
  minDiscThicknessFront: '',
  minDiscThicknessRear: '',
  tasks: {
    resetOilChange: false,
    tightenWheels: false,
    oilChangeLabel: false,
    timingBeltLabel: false,
    brakePadsLabel: false,
    perfume: false,
    cleaning: false
  }
};

export default function AutoRepairApp() {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prevData => {
      const newData = { ...prevData };
      if (name.includes('.')) {
        const [parent, child] = name.split('.');
        newData[parent as keyof FormData] = {
          ...newData[parent as keyof FormData],
          [child]: value
        } as any;
      } else {
        newData[name as keyof FormData] = value as any;
      }
      return newData;
    });

    if (errors[name]) {
      setErrors(prevErrors => {
        const newErrors = { ...prevErrors };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleNestedChange = (category: keyof FormData, item: string, checked: boolean) => {
    setFormData(prevData => ({
      ...prevData,
      [category]: {
        ...prevData[category as keyof typeof prevData],
        [item]: checked,
      },
    }));
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.date) {
      newErrors.date = "Date is required";
    } else {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(formData.date)) {
        newErrors.date = "Invalid date format. Use YYYY-MM-DD";
      }
    }

    if (!/^[A-Z]{2}-\d{3}-[A-Z]{2}$/.test(formData.immatriculation)) {
      newErrors.immatriculation = "Format d'immatriculation invalide (ex: AB-123-CD)";
    }

    if (!/^\d{10}$/.test(formData.portable)) {
      newErrors.portable = "Numéro de téléphone invalide (10 chiffres)";
    }

    if (isNaN(Number(formData.kilometrage)) || formData.kilometrage === '') {
      newErrors.kilometrage = "Kilométrage invalide";
    }

    if (!formData.revision.type) {
      newErrors['revision.type'] = "Type de révision requis";
    }
    if (!formData.revision.quantity) {
      newErrors['revision.quantity'] = "Quantité requise";
    }
    if (!formData.revision.viscosity) {
      newErrors['revision.viscosity'] = "Viscosité requise";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        const doc = generatePDF(formData);
        doc.save('auto_repair_inspection.pdf');
      } catch (error) {
        console.error('Error generating PDF:', error);
        setErrors(prevErrors => ({ ...prevErrors, pdfGeneration: 'Error generating PDF. Please try again.' }));
      }
    } else {
      console.log('Form has errors');
    }
  };

  const renderCheckboxSection = (title: string, category: keyof CheckItems) => (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <h3 className="text-lg font-medium">{title}</h3>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {checkItems[category].map((item) => (
            <Checkbox
              key={item}
              id={`${category}-${item}`}
              checked={formData[category][item] || false}
              onCheckedChange={(checked) => handleNestedChange(category, item, checked as boolean)}
              label={item}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="max-w-7xl mx-auto p-4 bg-gray-50">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-600">Auto Repair Inspection</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="vehicle-info">
            <AccordionTrigger>Vehicle Information</AccordionTrigger>
            <AccordionContent>
              <Card>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-6">
                  <div>
                    <Label htmlFor="date">Date</Label>
                    <Input type="date" id="date" name="date" value={formData.date} onChange={handleChange} className="w-full mt-1" />
                    {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
                  </div>
                  <div>
                    <Label htmlFor="immatriculation">Immatriculation</Label>
                    <Input id="immatriculation" name="immatriculation" value={formData.immatriculation} onChange={handleChange} placeholder="AB-123-CD" className="w-full mt-1" />
                    {errors.immatriculation && <p className="text-red-500 text-sm mt-1">{errors.immatriculation}</p>}
                  </div>
                  <div>
                    <Label htmlFor="nom">Nom</Label>
                    <Input id="nom" name="nom" value={formData.nom} onChange={handleChange} className="w-full mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="marque">Marque</Label>
                    <Input id="marque" name="marque" value={formData.marque} onChange={handleChange} className="w-full mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="portable">Portable</Label>
                    <Input id="portable" name="portable" value={formData.portable} onChange={handleChange} placeholder="0123456789" className="w-full mt-1" />
                    {errors.portable && <p className="text-red-500 text-sm mt-1">{errors.portable}</p>}
                  </div>
                  <div>
                    <Label htmlFor="model">Modèle</Label>
                    <Input id="model" name="model" value={formData.model} onChange={handleChange} className="w-full mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="kilometrage">Kilométrage</Label>
                    <div className="relative mt-1">
                      <Input type="number" id="kilometrage" name="kilometrage" value={formData.kilometrage} onChange={handleChange} className="w-full pr-8" />
                      <span className="absolute inset-y-0 right-0 flex items-center pr-2 text-gray-500">km</span>
                    </div>
                    {errors.kilometrage && <p className="text-red-500 text-sm mt-1">{errors.kilometrage}</p>}
                  </div>
                  <div>
                    <Label htmlFor="prochainCT">Prochain CT</Label>
                    <Input type="date" id="prochainCT" name="prochainCT" value={formData.prochainCT} onChange={handleChange} className="w-full mt-1" />
                  </div>
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="checkboxes">
            <AccordionTrigger>Inspection Checklist</AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderCheckboxSection('Intérieur', 'interior')}
                {renderCheckboxSection('Moteur', 'engine')}
                {renderCheckboxSection('Avant', 'front')}
                {renderCheckboxSection('Arrière', 'rear')}
                {renderCheckboxSection('Accessoires', 'accessories')}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="revision">
            <AccordionTrigger>Révision</AccordionTrigger>
            <AccordionContent>
              <Card>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <Label htmlFor="revisionType">Type</Label>
                      <Input id="revisionType" name="revision.type" value={formData.revision.type} onChange={handleChange} className="w-full mt-1" />
                      {errors['revision.type'] && <p className="text-red-500 text-sm mt-1">{errors['revision.type']}</p>}
                    </div>
                    <div>
                      <Label htmlFor="revisionQuantity">Quantité</Label>
                      <div className="relative mt-1">
                        <Input id="revisionQuantity" name="revision.quantity" value={formData.revision.quantity} onChange={handleChange} className="w-full pr-8" />
                        <span className="absolute inset-y-0 right-0 flex items-center pr-2 text-gray-500">L</span>
                      </div>
                      {errors['revision.quantity'] && <p className="text-red-500 text-sm mt-1">{errors['revision.quantity']}</p>}
                    </div>
                    <div>
                      <Label htmlFor="revisionViscosity">Viscosité</Label>
                      <Input id="revisionViscosity" name="revision.viscosity" value={formData.revision.viscosity} onChange={handleChange} className="w-full mt-1" />
                      {errors['revision.viscosity'] && <p className="text-red-500 text-sm mt-1">{errors['revision.viscosity']}</p>}
                    </div>
                    <div>
                      <Label htmlFor="revisionTorque">Couple</Label>
                      <div className="relative mt-1">
                        <Input id="revisionTorque" name="revision.torque" value={formData.revision.torque} onChange={handleChange} className="w-full pr-8" />
                        <span className="absolute inset-y-0 right-0 flex items-center pr-2 text-gray-500">NM</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="disc-thickness">
            <AccordionTrigger>Épaisseur minimale des disques</AccordionTrigger>
            <AccordionContent>
              <Card>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="minDiscThicknessFront">Avant</Label>
                      <div className="relative mt-1">
                        <Input id="minDiscThicknessFront" name="minDiscThicknessFront" value={formData.minDiscThicknessFront} onChange={handleChange} className="w-full pr-8" />
                        <span className="absolute inset-y-0 right-0 flex items-center pr-2 text-gray-500">mm</span>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="minDiscThicknessRear">Arrière</Label>
                      <div className="relative mt-1">
                        <Input id="minDiscThicknessRear" name="minDiscThicknessRear" value={formData.minDiscThicknessRear} onChange={handleChange} className="w-full pr-8" />
                        <span className="absolute inset-y-0 right-0 flex items-center pr-2 text-gray-500">mm</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="tasks">
            <AccordionTrigger>Travaux</AccordionTrigger>
            <AccordionContent>
              <Card>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                    {Object.entries(formData.tasks).map(([key, value]) => (
                      <Checkbox
                        key={key}
                        id={`tasks-${key}`}
                        checked={value}
                        onCheckedChange={(checked) => handleNestedChange('tasks', key, checked as boolean)}
                        label={key.replace(/([A-Z])/g, ' $1').trim()}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="comments">
            <AccordionTrigger>Commentaires</AccordionTrigger>
            <AccordionContent>
              <Card>
                <CardContent className="pt-6">
                  <Textarea
                    id="comments"
                    name="comments"
                    value={formData.comments}
                    onChange={handleChange}
                    className="w-full"
                    rows={4}
                  />
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition duration-300">
          Générer le rapport PDF
        </Button>
      </form>
      {errors.pdfGeneration && <p className="text-red-500 mt-2 text-center">{errors.pdfGeneration}</p>}
    </div>
  );
}