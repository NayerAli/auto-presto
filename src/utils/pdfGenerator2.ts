// /src/utils/pdfGenerator.ts

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

  // Colors
  const primaryColor = '#1a5f7a';
  const secondaryColor = '#57c5b6';
  const accentColor = '#f58634';
  const backgroundColor = '#f9f9f9';

  // Helper function to create rounded rectangles
  const roundedRect = (x: number, y: number, w: number, h: number, r: number, color: string) => {
    doc.setFillColor(color);
    doc.roundedRect(x, y, w, h, r, r, 'F');
  };

  // Header
  roundedRect(0, 0, 210, 40, 0, primaryColor);
  //doc.addImage(LOGO_PATH, 'PNG', 10, 5, 30, 30);
  doc.setTextColor('#ffffff');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.text('AUTO PRESTO', 50, 25);

  // Sidebar
  roundedRect(0, 40, 50, 257, 0, secondaryColor);
  
  // Main content area
  roundedRect(50, 40, 160, 257, 0, backgroundColor);

  // Vehicle Information
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(primaryColor);
  doc.text('Vehicle Information', 55, 50);

  const addField = (label: string, value: string, x: number, y: number) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor('#333333');
    doc.text(label, x, y);
    doc.setFont('helvetica', 'bold');
    doc.text(value, x, y + 5);
  };

  addField('IMMATRICULATION', formData.immatriculation, 55, 60);
  addField('NOM', formData.nom, 130, 60);
  addField('MARQUE', formData.marque, 55, 75);
  addField('PORTABLE', formData.portable, 130, 75);
  addField('MODEL', formData.model, 55, 90);
  addField('KILOMETRAGE', `${formData.kilometrage} KMS`, 130, 90);

  // Next CT Date Stamp
  doc.setFillColor(accentColor);
  doc.circle(180, 70, 15, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor('#ffffff');
  doc.text('NEXT CT', 180, 65, { align: 'center' });
  doc.setFontSize(10);
  doc.text(formData.prochainCT, 180, 75, { align: 'center' });

  // Checklist sections
  const addChecklistSection = (title: string, items: {[key: string]: boolean}, startX: number, startY: number, width: number) => {
    roundedRect(startX, startY, width, 7, 2, secondaryColor);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(primaryColor);
    doc.text(title, startX + 2, startY + 5);

    let y = startY + 12;
    let checkedCount = 0;
    Object.entries(items).forEach(([item, checked]) => {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor('#333333');
      doc.text(item, startX + 5, y);
      
      // Draw checkbox
      doc.setDrawColor(primaryColor);
      doc.roundedRect(startX + width - 10, y - 4, 4, 4, 1, 1);
      if (checked) {
        doc.setFillColor(primaryColor);
        doc.roundedRect(startX + width - 9.5, y - 3.5, 3, 3, 0.5, 0.5, 'F');
        checkedCount++;
      }
      y += 7;
    });

    // Progress bar
    const totalItems = Object.keys(items).length;
    const progress = checkedCount / totalItems;
    roundedRect(startX, y + 2, width, 3, 1.5, '#e0e0e0');
    roundedRect(startX, y + 2, width * progress, 3, 1.5, accentColor);
  };

  const columnWidth = 75;
  addChecklistSection('INTERIEUR', formData.interior, 55, 100, columnWidth);
  addChecklistSection('MOTEUR', formData.engine, 135, 100, columnWidth);
  addChecklistSection('AVANT', formData.front, 55, 160, columnWidth);
  addChecklistSection('ARRIERE', formData.rear, 135, 160, columnWidth);
  addChecklistSection('ACCESSOIRES', formData.accessories, 55, 220, columnWidth);

  // Comments
  roundedRect(135, 220, 75, 7, 2, secondaryColor);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(primaryColor);
  doc.text('COMMENTAIRE', 137, 225);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor('#333333');
  const splitComments = doc.splitTextToSize(formData.comments, 70);
  doc.text(splitComments, 137, 232);

  // Revision
  roundedRect(55, 280, 75, 7, 2, secondaryColor);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(primaryColor);
  doc.text('REVISION', 57, 285);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor('#333333');
  doc.text(`${formData.revision.type} ${formData.revision.quantity}L ${formData.revision.viscosity}`, 57, 292);
  doc.text(`${formData.revision.torque} NM`, 57, 299);

  // Disc thickness visual representation
  const maxThickness = 30; // Assuming 30mm is the maximum disc thickness
  const frontThickness = Number(formData.minDiscThicknessFront);
  const rearThickness = Number(formData.minDiscThicknessRear);

  const drawThicknessBar = (label: string, thickness: number, x: number, y: number) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(label, x, y);
    roundedRect(x, y + 2, 50, 5, 2.5, '#e0e0e0');
    roundedRect(x, y + 2, 50 * (thickness / maxThickness), 5, 2.5, accentColor);
    doc.text(`${thickness} MM`, x + 55, y + 5);
  };

  drawThicknessBar('Avant', frontThickness, 57, 306);
  drawThicknessBar('Arrière', rearThickness, 57, 318);

  // Tasks
  roundedRect(135, 280, 75, 7, 2, secondaryColor);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(primaryColor);
  doc.text('TRAVAUX :', 137, 285);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor('#333333');
  let taskY = 292;
  Object.entries(formData.tasks).forEach(([key, value]) => {
    doc.roundedRect(137, taskY - 4, 4, 4, 1, 1);
    if (value) {
      doc.setFillColor(primaryColor);
      doc.roundedRect(137.5, taskY - 3.5, 3, 3, 0.5, 0.5, 'F');
    }
    doc.text(key.replace(/([A-Z])/g, ' $1').trim().toUpperCase(), 143, taskY);
    taskY += 7;
  });

  // Sidebar content
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor('#ffffff');
  doc.text('QUICK INFO', 25, 50, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`Date: ${formData.date}`, 5, 60);
  doc.text(`Immat: ${formData.immatriculation}`, 5, 70);
  doc.text(`Nom: ${formData.nom}`, 5, 80);
  doc.text(`Model: ${formData.model}`, 5, 90);
  doc.text(`KM: ${formData.kilometrage}`, 5, 100);

  // Footer
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor('#666666');
  doc.text(`Generated on ${new Date().toLocaleString()}`, 55, 295);
  doc.text('Page 1 of 1', 185, 295, { align: 'right' });

  // Watermark
  doc.setGState(new doc.GState({opacity: 0.1}));
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(60);
  doc.setTextColor(primaryColor);
  doc.text('AUTO PRESTO', 105, 150, { angle: 45, align: 'center' });

  return doc;
};