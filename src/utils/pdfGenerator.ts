// /src/utils/pdfGenerator.ts
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { FormData, CheckItems } from '../types'; // Make sure to create this types file

export const generatePDF = (formData: FormData, checkItems: CheckItems) => {
  const doc = new jsPDF();
  
  // Set up the document
  doc.setFontSize(18);
  doc.setTextColor(0, 0, 0);
  doc.text('AUTO PRESTO', 105, 15, { align: 'center' });

  // Add logo (uncomment and adjust path as needed)
  // doc.addImage('/path/to/logo.png', 'PNG', 10, 10, 30, 30);

  doc.setFontSize(10);
  doc.text('3 rue de la Guadeloupe', 105, 25, { align: 'center' });
  doc.text('97490 SAINTE CLOTILDE', 105, 30, { align: 'center' });
  doc.text('0693 01 25 39', 105, 35, { align: 'center' });

  let y = 45;

  // Vehicle Information
  const addField = (label: string, value: string, x: number, width: number) => {
    doc.setFontSize(8);
    doc.text(label, x, y);
    doc.line(x, y + 1, x + width, y + 1);
    doc.setFontSize(10);
    doc.text(value || '', x, y + 6);
    y += 10;
  };

  addField('DATE :', formData.date || '', 10, 40);
  addField('IMMATRICULATION', formData.immatriculation || '', 60, 40);
  addField('NOM', formData.nom || '', 110, 90);
  y -= 10;
  addField('MARQUE', formData.marque || '', 10, 40);
  addField('PORTABLE', formData.portable || '', 60, 40);
  addField('MODEL', formData.model || '', 110, 40);
  addField('KILOMETRAGE', `${formData.kilometrage || ''} KMS`, 160, 40);
  addField('PROCHAIN C.T', formData.prochainCT || '', 10, 40);

  y += 5;

  // Checklist sections
  const addChecklistSection = (title: string, items: string[], startX: number, width: number) => {
    doc.setFillColor(200, 200, 200);
    doc.rect(startX, y, width, 7, 'F');
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(title, startX + 2, y + 5);
    y += 10;

    items.forEach(item => {
      doc.setFontSize(8);
      doc.text(item, startX + 2, y);
      doc.rect(startX + width - 8, y - 4, 6, 6);
      const sectionData = formData[title.toLowerCase() as keyof FormData] as Record<string, boolean>;
      if (sectionData && sectionData[item]) {
        doc.text('✓', startX + width - 7, y);
      }
      y += 7;
    });
    y += 3;
  };

  const columnWidth = 95;
  addChecklistSection('INTERIEUR', checkItems.interior, 10, columnWidth);
  y = 100; // Reset y for the second column
  addChecklistSection('MOTEUR', checkItems.engine, 105, columnWidth);
  y = Math.max(y, 170); // Ensure we're below both columns
  addChecklistSection('AVANT', checkItems.front, 10, columnWidth);
  addChecklistSection('ARRIERE', checkItems.rear, 105, columnWidth);
  addChecklistSection('ACCESSOIRES', checkItems.accessories, 10, columnWidth);

  // Revision
  y += 10;
  doc.setFillColor(200, 200, 200);
  doc.rect(10, y, 190, 7, 'F');
  doc.setFontSize(10);
  doc.text('REVISION', 12, y + 5);
  y += 10;
  doc.setFontSize(8);
  doc.text(`${formData.revision?.type || ''} ${formData.revision?.quantity || ''}L ${formData.revision?.viscosity || ''}`, 12, y);

  // Disc thickness
  y += 10;
  doc.text(`Epaisseur_min_disque_avant ${formData.minDiscThicknessFront || ''} MM`, 12, y);
  y += 7;
  doc.text(`Epaisseur_min_disque_arrière ${formData.minDiscThicknessRear || ''} MM`, 12, y);

  // Tasks
  y += 10;
  doc.setFillColor(200, 200, 200);
  doc.rect(10, y, 190, 7, 'F');
  doc.setFontSize(10);
  doc.text('TRAVAUX :', 12, y + 5);
  y += 10;
  doc.setFontSize(8);
  Object.entries(formData.tasks || {}).forEach(([key, value]) => {
    if (value) {
      doc.text('✓', 12, y);
      doc.text(key.replace(/([A-Z])/g, ' $1').trim().toUpperCase(), 20, y);
      y += 7;
    }
  });

  // Comments
  y += 10;
  doc.setFillColor(200, 200, 200);
  doc.rect(10, y, 190, 7, 'F');
  doc.setFontSize(10);
  doc.text('COMMENTAIRE', 12, y + 5);
  y += 10;
  doc.setFontSize(8);
  const splitComments = doc.splitTextToSize(formData.comments || '', 180);
  doc.text(splitComments, 12, y);

  return doc;
};