// /src/components/AutoRepairApp.tsx
"use client"

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { generatePDF } from '../utils/pdfGenerator';
import { FormData, CheckItems } from '../types';

// Define ErrorMessage component in-file
const ErrorMessage: React.FC<{ message: string }> = ({ message }) => (
  <p className="text-red-500 text-sm mt-1">{message}</p>
);

// Define Checkbox component in-file
interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  onCheckedChange?: (checked: boolean) => void;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, onCheckedChange, ...props }, ref) => {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (onCheckedChange) {
        onCheckedChange(event.target.checked);
      }
    };

    return (
      <label className="flex items-center space-x-2 cursor-pointer">
        <div className="relative">
          <input
            type="checkbox"
            ref={ref}
            className="sr-only"
            onChange={handleChange}
            {...props}
          />
          <div className={`w-5 h-5 border-2 rounded transition-all duration-200 ease-in-out ${
            props.checked ? 'bg-blue-500 border-blue-500' : 'bg-white border-gray-300'
          }`}>
            <svg className={`w-4 h-4 text-white fill-current ${props.checked ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200 ease-in-out`} viewBox="0 0 20 20">
              <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
            </svg>
          </div>
        </div>
        {label && <span className="text-sm">{label}</span>}
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';

interface CheckItems {
  interior: string[];
  engine: string[];
  front: string[];
  rear: string[];
  accessories: string[];
}

const checkItems: CheckItems = {
  interior: ['Antivol de roue', 'Démarreur', 'Témoin tableau de bord', 'Rétroviseur', 'Klaxon', 'Frein à main', 'Essuie glace', 'Eclairage', 'Jeux au volant'],
  engine: ['Teste batterie/alternateur', 'Plaque immat AV', 'Fuite boite', 'Fuite moteur', 'Supports moteur', 'Liquide de frein', 'Filtre à air', 'Courroie accessoire'],
  front: ['Roulement', 'Pneus avant', 'Paralellisme', 'Disque avant', 'Plaquettes avant', 'Amortisseur avant', 'Biellette barre stab', 'Direction complet', 'Cardans', 'Triangles avant', 'Flexible de frein'],
  rear: ['Pneus AR', 'Frein AR', 'Roulement AR', 'Flexible AR', 'Amortisseur AR', 'Silent Bloc AR'],
  accessories: ['Plaque immat AR', 'Antenne radio', 'Roue de secours', 'Gilet/Triangle secu', 'Crique / Clé roue']
};

interface MovableCardProps {
  id: string;
  children: React.ReactNode;
  index: number;
  moveCard: (dragIndex: number, hoverIndex: number) => void;
}

const MovableCard: React.FC<MovableCardProps> = ({ id, children, index, moveCard }) => {
  const [, drag] = useDrag({
    type: 'CARD',
    item: { id, index },
  });

  const [, drop] = useDrop({
    accept: 'CARD',
    hover: (item: { index: number }, monitor) => {
      if (item.index !== index) {
        moveCard(item.index, index);
        item.index = index;
      }
    },
  });

  return (
    <div ref={(node) => drag(drop(node))} className="mb-4 transform transition-transform duration-300 ease-in-out hover:scale-102">
      {children}
    </div>
  );
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
    viscosity: ''
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
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [cardOrder, setCardOrder] = useState(['vehicle', 'interior', 'engine', 'front', 'rear', 'accessories', 'revision', 'discThickness', 'tasks', 'comments']);

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
    
    // Clear error when user starts typing
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
    const newErrors: {[key: string]: string} = {};
    
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
    
    // Validate revision fields
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
        const doc = generatePDF(formData, checkItems);
        doc.save('auto_repair_inspection.pdf');
      } catch (error) {
        console.error('Error generating PDF:', error);
        setErrors(prevErrors => ({ ...prevErrors, pdfGeneration: 'Error generating PDF. Please try again.' }));
      }
    } else {
      console.log('Form has errors');
    }
  };

  const moveCard = (dragIndex: number, hoverIndex: number) => {
    const newCardOrder = [...cardOrder];
    const dragCard = newCardOrder[dragIndex];
    newCardOrder.splice(dragIndex, 1);
    newCardOrder.splice(hoverIndex, 0, dragCard);
    setCardOrder(newCardOrder);
  };

  const renderCheckboxSection = (title: string, category: keyof CheckItems) => (
    <Card>
      <CardHeader>
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
    <DndProvider backend={HTML5Backend}>
      <div className="max-w-7xl mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">Auto Repair Inspection</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          {cardOrder.map((cardId, index) => (
            <MovableCard key={cardId} id={cardId} index={index} moveCard={moveCard}>
              {cardId === 'vehicle' && (
                <Card>
                  <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <Label htmlFor="date">Date</Label>
                      <Input type="date" id="date" name="date" value={formData.date} onChange={handleChange} className="w-full" />
                      {errors.date && <ErrorMessage message={errors.date} />}</div>
                    <div>
                      <Label htmlFor="immatriculation">Immatriculation</Label>
                      <Input id="immatriculation" name="immatriculation" value={formData.immatriculation} onChange={handleChange} placeholder="AB-123-CD" className="w-full" />
                      {errors.immatriculation && <ErrorMessage message={errors.immatriculation} />}
                    </div>
                    <div>
                      <Label htmlFor="nom">Nom</Label>
                      <Input id="nom" name="nom" value={formData.nom} onChange={handleChange} className="w-full" />
                    </div>
                    <div>
                      <Label htmlFor="marque">Marque</Label>
                      <Input id="marque" name="marque" value={formData.marque} onChange={handleChange} className="w-full" />
                    </div>
                    <div>
                      <Label htmlFor="portable">Portable</Label>
                      <Input id="portable" name="portable" value={formData.portable} onChange={handleChange} placeholder="0123456789" className="w-full" />
                      {errors.portable && <ErrorMessage message={errors.portable} />}
                    </div>
                    <div>
                      <Label htmlFor="model">Modèle</Label>
                      <Input id="model" name="model" value={formData.model} onChange={handleChange} className="w-full" />
                    </div>
                    <div>
                      <Label htmlFor="kilometrage">Kilométrage</Label>
                      <div className="relative">
                        <Input type="number" id="kilometrage" name="kilometrage" value={formData.kilometrage} onChange={handleChange} className="w-full pr-8" />
                        <span className="absolute inset-y-0 right-0 flex items-center pr-2 text-gray-500">km</span>
                      </div>
                      {errors.kilometrage && <ErrorMessage message={errors.kilometrage} />}
                    </div>
                    <div>
                      <Label htmlFor="prochainCT">Prochain CT</Label>
                      <Input type="date" id="prochainCT" name="prochainCT" value={formData.prochainCT} onChange={handleChange} className="w-full" />
                    </div>
                  </CardContent>
                </Card>
              )}
              {cardId === 'interior' && renderCheckboxSection('Intérieur', 'interior')}
              {cardId === 'engine' && renderCheckboxSection('Moteur', 'engine')}
              {cardId === 'front' && renderCheckboxSection('Avant', 'front')}
              {cardId === 'rear' && renderCheckboxSection('Arrière', 'rear')}
              {cardId === 'accessories' && renderCheckboxSection('Accessoires', 'accessories')}
              {cardId === 'revision' && (
                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-medium">Révision</h3>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="revisionType">Type</Label>
                        <Input id="revisionType" name="revision.type" value={formData.revision.type} onChange={handleChange} />
                        {errors['revision.type'] && <ErrorMessage message={errors['revision.type']} />}
                      </div>
                      <div>
                        <Label htmlFor="revisionQuantity">Quantité</Label>
                        <div className="relative">
                          <Input id="revisionQuantity" name="revision.quantity" value={formData.revision.quantity} onChange={handleChange} className="pr-8" />
                          <span className="absolute inset-y-0 right-0 flex items-center pr-2 text-gray-500">L</span>
                        </div>
                        {errors['revision.quantity'] && <ErrorMessage message={errors['revision.quantity']} />}
                      </div>
                      <div>
                        <Label htmlFor="revisionViscosity">Viscosité</Label>
                        <Input id="revisionViscosity" name="revision.viscosity" value={formData.revision.viscosity} onChange={handleChange} />
                        {errors['revision.viscosity'] && <ErrorMessage message={errors['revision.viscosity']} />}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              {cardId === 'discThickness' && (
                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-medium">Épaisseur minimale des disques</h3>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="minDiscThicknessFront">Avant</Label>
                        <div className="relative">
                          <Input id="minDiscThicknessFront" name="minDiscThicknessFront" value={formData.minDiscThicknessFront} onChange={handleChange} className="pr-8" />
                          <span className="absolute inset-y-0 right-0 flex items-center pr-2 text-gray-500">mm</span>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="minDiscThicknessRear">Arrière</Label>
                        <div className="relative">
                          <Input id="minDiscThicknessRear" name="minDiscThicknessRear" value={formData.minDiscThicknessRear} onChange={handleChange} className="pr-8" />
                          <span className="absolute inset-y-0 right-0 flex items-center pr-2 text-gray-500">mm</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              {cardId === 'tasks' && (
                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-medium">Travaux</h3>
                  </CardHeader>
                  <CardContent>
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
              )}
              {cardId === 'comments' && (
                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-medium">Commentaires</h3>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      id="comments"
                      name="comments"
                      value={formData.comments}
                      onChange={handleChange}
                      className="mt-1"
                    />
                  </CardContent>
                </Card>
              )}
            </MovableCard>
          ))}
          <Button type="submit" className="w-full">Générer le rapport PDF</Button>
        </form>
        {errors.pdfGeneration && <ErrorMessage message={errors.pdfGeneration} />}
        {errors.submission && <ErrorMessage message={errors.submission} />}
      </div>
    </DndProvider>
  );
}