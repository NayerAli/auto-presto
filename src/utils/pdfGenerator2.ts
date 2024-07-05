// /src/utils/pdfGenerator2.ts

import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { FormData } from '../types';

const LOGO_PATH = '/images/auto_presto_logo.png';

export const generatePDF = (formData: FormData) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Add custom font
  doc.addFont('helvetica', 'normal');
  doc.addFont('helvetica', 'bold');

  // Colors
  const primaryColor = [0, 0, 150];
  const secondaryColor = [230, 230, 250];

  // Header
  //doc.addImage(LOGO_PATH, 'PNG', 10, 10, 30, 30);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text('AUTO PRESTO', 50, 25);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text('3 rue de la Guadeloupe', 50, 32);
  doc.text('97490 SAINTE CLOTILDE', 50, 37);
  doc.text('0693 01 25 39', 50, 42);

  // Date
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('DATE :', 140, 20);
  doc.setFont('helvetica', 'normal');
  doc.text(formData.date, 160, 20);

  // Vehicle Information
  const addField = (label: string, value: string, x: number, y: number) => {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text(label, x, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text(value, x, y + 5);
  };

  addField('IMMATRICULATION', formData.immatriculation, 10, 55);
  addField('NOM', formData.nom, 105, 55);
  addField('MARQUE', formData.marque, 10, 70);
  addField('PORTABLE', formData.portable, 105, 70);
  addField('MODEL', formData.model, 10, 85);
  addField('KILOMETRAGE', `${formData.kilometrage} KMS`, 105, 85);
  addField('PROCHAIN C.T', formData.prochainCT, 10, 100);

  // Checklist sections
  const addChecklistSection = (title: string, items: {[key: string]: boolean}, startX: number, startY: number, width: number) => {
    doc.setFillColor(...secondaryColor);
    doc.rect(startX, startY, width, 7, 'F');
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text(title, startX + 2, startY + 5);

    let y = startY + 12;
    Object.entries(items).forEach(([item, checked]) => {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      doc.text(item, startX + 5, y);
      
      // Draw checkbox
      doc.setDrawColor(0);
      doc.rect(startX + width - 10, y - 4, 4, 4);
      if (checked) {
        doc.setFillColor(0);
        doc.rect(startX + width - 9.5, y - 3.5, 3, 3, 'F');
      }
      y += 7;
    });
  };

  const columnWidth = 95;
  addChecklistSection('INTERIEUR', formData.interior, 10, 110, columnWidth);
  addChecklistSection('MOTEUR', formData.engine, 105, 110, columnWidth);
  addChecklistSection('AVANT', formData.front, 10, 160, columnWidth);
  addChecklistSection('ARRIERE', formData.rear, 105, 160, columnWidth);
  addChecklistSection('ACCESSOIRES', formData.accessories, 10, 210, columnWidth);

  // Comments
  doc.setFillColor(...secondaryColor);
  doc.rect(105, 210, columnWidth, 7, 'F');
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text('COMMENTAIRE', 107, 215);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  const splitComments = doc.splitTextToSize(formData.comments, 90);
  doc.text(splitComments, 107, 222);

  // Revision
  doc.setFillColor(...secondaryColor);
  doc.rect(10, 260, columnWidth, 7, 'F');
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text('REVISION', 12, 265);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  doc.text(`${formData.revision.type} ${formData.revision.quantity}L ${formData.revision.viscosity}`, 12, 272);
  doc.text(`${formData.revision.torque} NM`, 12, 279);
  doc.text(`Epaisseur_min_disque_avant ${formData.minDiscThicknessFront} MM`, 12, 286);
  doc.text(`Epaisseur_min_disque_arrière ${formData.minDiscThicknessRear} MM`, 12, 293);

  // Tasks
  doc.setFillColor(...secondaryColor);
  doc.rect(105, 260, columnWidth, 7, 'F');
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text('TRAVAUX :', 107, 265);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  let taskY = 272;
  Object.entries(formData.tasks).forEach(([key, value]) => {
    doc.rect(107, taskY - 4, 4, 4);
    if (value) {
      doc.setFillColor(0);
      doc.rect(107.5, taskY - 3.5, 3, 3, 'F');
    }
    doc.text(key.replace(/([A-Z])/g, ' $1').trim().toUpperCase(), 113, taskY);
    taskY += 7;
  });

  return doc;
};