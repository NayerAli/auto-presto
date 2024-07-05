// /src/utils/pdfGenerator3.ts

import jsPDF from 'jspdf';
import { FormData } from '../types';

const LOGO_PATH = '/images/auto_presto_logo.png';

// Colors
const DARK_GRAY = '#333333';
const MEDIUM_GRAY = '#777777';
const LIGHT_GRAY = '#F5F5F5';
const ACCENT_COLOR = '#4A90E2';

export const generatePDF = (formData: FormData) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;

  // Helper functions
  const addText = (text: string, x: number, y: number, fontSize: number, color: string, isBold: boolean = false) => {
    doc.setFontSize(fontSize);
    doc.setTextColor(color);
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    doc.text(text, x, y);
  };

  const addRoundedRect = (x: number, y: number, w: number, h: number, r: number, color: string, isFilled: boolean = false) => {
    const cornerRadius = Math.min(r, h / 2, w / 2);
    doc.setDrawColor(color);
    doc.setFillColor(color);
    doc.roundedRect(x, y, w, h, cornerRadius, cornerRadius, isFilled ? 'F' : 'D');
  };

  // Background
  addRoundedRect(0, 0, pageWidth, pageHeight, 0, LIGHT_GRAY, true);

  // Header
  addRoundedRect(0, 0, pageWidth, pageHeight * 0.12, 0, ACCENT_COLOR, true);
  //doc.addImage(LOGO_PATH, 'PNG', 10, 5, pageWidth * 0.05, pageHeight * 0.05);
  addText('AUTO PRESTO', pageWidth * 0.1, pageHeight * 0.05, 20, LIGHT_GRAY, true);
  addText('3 rue de la Guadeloupe, 97490 SAINTE CLOTILDE', pageWidth * 0.1, pageHeight * 0.08, 10, LIGHT_GRAY);
  addText('0693 01 25 39', pageWidth * 0.1, pageHeight * 0.1, 10, LIGHT_GRAY);

  // Vehicle Information
  addText('Vehicle Information', 10, pageHeight * 0.15, 16, ACCENT_COLOR, true);
  addRoundedRect(5, pageHeight * 0.16, pageWidth - 10, pageHeight * 0.12, 3, MEDIUM_GRAY);

  const addField = (label: string, value: string, x: number, y: number) => {
    addText(label, x, y, 8, MEDIUM_GRAY);
    addText(value, x, y + 5, 10, DARK_GRAY, true);
  };

  addField('IMMATRICULATION', formData.immatriculation, 10, pageHeight * 0.19);
  addField('NOM', formData.nom, pageWidth * 0.33, pageHeight * 0.19);
  addField('MARQUE', formData.marque, pageWidth * 0.66, pageHeight * 0.19);
  addField('PORTABLE', formData.portable, 10, pageHeight * 0.24);
  addField('MODEL', formData.model, pageWidth * 0.33, pageHeight * 0.24);
  addField('KILOMETRAGE', `${formData.kilometrage} KMS`, pageWidth * 0.66, pageHeight * 0.24);

  // Next CT Date
  addRoundedRect(pageWidth * 0.8, pageHeight * 0.17, pageWidth * 0.15, pageHeight * 0.06, 3, ACCENT_COLOR, true);
  addText('NEXT CT', pageWidth * 0.875, pageHeight * 0.19, 8, LIGHT_GRAY, true);
  addText(formData.prochainCT, pageWidth * 0.875, pageHeight * 0.22, 10, LIGHT_GRAY, true);

  // Checklist sections
  const addChecklistSection = (title: string, items: {[key: string]: boolean}, x: number, y: number, width: number) => {
    addRoundedRect(x, y, width, pageHeight * 0.02, 2, ACCENT_COLOR, true);
    addText(title, x + 2, y + 5, 10, LIGHT_GRAY, true);

    let currentY = y + pageHeight * 0.03;
    Object.entries(items).forEach(([item, checked]) => {
      addRoundedRect(x + 2, currentY - 3, 3, 3, 0.5, MEDIUM_GRAY);
      if (checked) {
        addRoundedRect(x + 2.5, currentY - 2.5, 2, 2, 0.5, ACCENT_COLOR, true);
      }
      addText(item, x + 7, currentY, 8, DARK_GRAY);
      currentY += 5;
    });

    return currentY;
  };

  const columnWidth = pageWidth * 0.45;
  let leftColumnY = pageHeight * 0.3;
  let rightColumnY = pageHeight * 0.3;

  leftColumnY = addChecklistSection('INTERIEUR', formData.interior, 5, leftColumnY, columnWidth) + 2;
  leftColumnY = addChecklistSection('MOTEUR', formData.engine, 5, leftColumnY, columnWidth) + 2;
  leftColumnY = addChecklistSection('AVANT', formData.front, 5, leftColumnY, columnWidth) + 2;

  rightColumnY = addChecklistSection('ARRIERE', formData.rear, pageWidth * 0.5, rightColumnY, columnWidth) + 2;
  rightColumnY = addChecklistSection('ACCESSOIRES', formData.accessories, pageWidth * 0.5, rightColumnY, columnWidth) + 2;

  // Comments
  const commentY = Math.max(leftColumnY, rightColumnY);
  const availableHeight = pageHeight - commentY - pageHeight * 0.15; // Reserve space for Revision and Tasks
  const commentBoxHeight = Math.min(availableHeight * 0.5, pageHeight * 0.2); // Limit to 20% of page height
  addRoundedRect(5, commentY, pageWidth - 10, commentBoxHeight, 3, MEDIUM_GRAY);
  addText('COMMENTAIRE', 7, commentY + 5, 10, DARK_GRAY, true);
  const splitComments = doc.splitTextToSize(formData.comments, pageWidth - 15);
  const maxLines = Math.floor((commentBoxHeight - 10) / 4); // 4mm per line
  const truncatedComments = splitComments.slice(0, maxLines);
  addText(truncatedComments, 7, commentY + 10, 8, DARK_GRAY);

  // Revision and Tasks
  const bottomSectionY = commentY + commentBoxHeight + 5;
  const bottomSectionHeight = pageHeight - bottomSectionY - pageHeight * 0.05; // Reserve space for footer

  // Revision
  addRoundedRect(5, bottomSectionY, columnWidth, bottomSectionHeight, 3, MEDIUM_GRAY);
  addText('REVISION', 7, bottomSectionY + 5, 10, DARK_GRAY, true);
  addText(`${formData.revision.type} ${formData.revision.quantity}L ${formData.revision.viscosity}`, 7, bottomSectionY + 10, 8, DARK_GRAY);
  addText(`Couple: ${formData.revision.torque} NM`, 7, bottomSectionY + 15, 8, DARK_GRAY);
  addText(`Disque avant: ${formData.minDiscThicknessFront} MM`, 7, bottomSectionY + 20, 8, DARK_GRAY);
  addText(`Disque arrière: ${formData.minDiscThicknessRear} MM`, 7, bottomSectionY + 25, 8, DARK_GRAY);

  // Tasks
  addRoundedRect(pageWidth * 0.5, bottomSectionY, columnWidth, bottomSectionHeight, 3, MEDIUM_GRAY);
  addText('TRAVAUX', pageWidth * 0.5 + 2, bottomSectionY + 5, 10, DARK_GRAY, true);
  let taskY = bottomSectionY + 10;
  Object.entries(formData.tasks).forEach(([key, value]) => {
    addRoundedRect(pageWidth * 0.5 + 2, taskY - 3, 3, 3, 0.5, MEDIUM_GRAY);
    if (value) {
      addRoundedRect(pageWidth * 0.5 + 2.5, taskY - 2.5, 2, 2, 0.5, ACCENT_COLOR, true);
    }
    addText(key.replace(/([A-Z])/g, ' $1').trim(), pageWidth * 0.5 + 7, taskY, 8, DARK_GRAY);
    taskY += 5;
  });

  // Footer
  addRoundedRect(0, pageHeight - 10, pageWidth, 10, 0, ACCENT_COLOR, true);
  addText(`Generated on ${new Date().toLocaleString()}`, 5, pageHeight - 3, 8, LIGHT_GRAY);
  addText('Page 1 of 1', pageWidth - 5, pageHeight - 3, 8, LIGHT_GRAY, true);

  return doc;
};