// src/components/AutoRepair.tsx

import React, { useState } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const ErrorMessage: React.FC<{ message: string }> = ({ message }) => (
  <p className="text-red-500 text-sm mt-1">{message}</p>
);

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
          <div
            className={`w-5 h-5 border-2 rounded transition-all duration-200 ease-in-out ${
              props.checked ? 'bg-blue-500 border-blue-500' : 'bg-white border-gray-300'
            }`}
          >
            <svg
              className={`w-4 h-4 text-white fill-current ${
                props.checked ? 'opacity-100' : 'opacity-0'
              } transition-opacity duration-200 ease-in-out`}
              viewBox="0 0 20 20"
            >
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

interface FormData {
  immat: string;
  name: string;
  phone: string;
  brand: string;
  model: string;
  mileage: string;
  nextCT: string;
  // Add other necessary fields here
}

const generatePdfReport = (formData: FormData) => {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(16);
  doc.text('AUTO PRESTO', 10, 10);
  doc.setFontSize(12);
  doc.text('3 rue de la Guadeloupe, 97490 SAINTE CLOTILDE', 10, 20);
  doc.text('Tel: 0693 01 25 39', 10, 30);

  // Main Information Table
  const headers = [['IMMAT', 'NOM', 'PORTABLE', 'MARQUE', 'MODEL', 'KILOMETRAGE', 'PROCHAIN C.T']];
  const data = [
    [formData.immat, formData.name, formData.phone, formData.brand, formData.model, formData.mileage, formData.nextCT]
  ];

  doc.autoTable({
    head: headers,
    body: data,
    startY: 40,
  });

  // Section Headers
  doc.setFontSize(10);
  doc.text('INTERIEUR', 10, 80);
  doc.text('MOTEUR', 80, 80);
  doc.text('AVANT', 150, 80);

  // Additional custom text and formatting to match the screenshot exactly
  doc.setFontSize(10);
  doc.text('Antivol de roue bon état', 10, 90);
  doc.text('Démarreur', 10, 95);
  // Continue adding text elements for each line in the PDF to match the provided screenshot
  // ...

  // Save the PDF
  doc.save('auto_repair_inspection.pdf');
};

const AutoRepair: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    immat: 'BS824ZE',
    name: 'DE LARYCHAUDY',
    phone: '0693012539',
    brand: 'RENAULT',
    model: 'MASTER',
    mileage: '0 KMS',
    nextCT: '00/01/1900',
    // Initialize other necessary fields here
  });

  const [errors, setErrors] = useState<{ pdfGeneration?: string; submission?: string }>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      generatePdfReport(formData);
      setErrors({});
    } catch (err) {
      setErrors({ pdfGeneration: 'Error generating PDF report' });
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="container mx-auto p-4">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="immat" className="block text-sm font-medium text-gray-700">
                Immatriculation
              </label>
              <input
                type="text"
                name="immat"
                id="immat"
                value={formData.immat}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Nom
              </label>
              <input
                type="text"
                name="name"
                id="name"
                value={formData.name}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            {/* Add other input fields here */}
          </div>
          <button type="submit" className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md">
            Générer le rapport PDF
          </button>
        </form>
        {errors.pdfGeneration && <ErrorMessage message={errors.pdfGeneration} />}
        {errors.submission && <ErrorMessage message={errors.submission} />}
      </div>
    </DndProvider>
  );
};

export default AutoRepair;
