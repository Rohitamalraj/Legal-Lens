import jsPDF from 'jspdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType, BorderStyle, ShadingType } from 'docx';
import { saveAs } from 'file-saver';

interface DocumentData {
  id: string;
  name: string;
  uploadDate: string;
  size: number | string;
  type: string;
  status: string;
  extractedText: string;
  analysis?: any;
}

interface DetailedAnalysis {
  clauses: ClauseData[];
  risks: RiskData[];
}

interface ClauseData {
  id: string;
  type: string;
  title: string;
  originalText: string;
  simplifiedPoints: string[];
  keyTakeaway: string;
}

interface RiskData {
  id: string;
  level: 'high' | 'medium' | 'low';
  title: string;
  section: string;
  description: string;
  recommendation: string;
  impact: string;
}

interface SummaryData {
  processingTime: number;
  overview: string;
  keyInformation: Array<{
    label: string;
    value: string;
  }>;
}

export class ReportGenerator {
  
  private formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  private getRiskColor(level: string): string {
    switch (level.toLowerCase()) {
      case 'high': return '#dc2626';
      case 'medium': return '#ea580c';
      case 'low': return '#16a34a';
      default: return '#6b7280';
    }
  }

  async generatePDFReport(
    documentData: DocumentData,
    summaryData: SummaryData,
    detailedAnalysis: DetailedAnalysis
  ): Promise<void> {
    const pdf = new jsPDF();
    let yPosition = 20;
    const pageWidth = pdf.internal.pageSize.getWidth();
    const marginLeft = 20;
    const marginRight = 20;
    const contentWidth = pageWidth - marginLeft - marginRight;

    // Helper function to check if we need a new page
    const checkNewPage = (requiredSpace: number = 30) => {
      if (yPosition + requiredSpace > pdf.internal.pageSize.getHeight() - 20) {
        pdf.addPage();
        yPosition = 20;
      }
    };

    const addWrappedText = (text: string, fontSize: number = 10, maxWidth: number = contentWidth) => {
      pdf.setFontSize(fontSize);
      const lines = pdf.splitTextToSize(text, maxWidth);
      lines.forEach((line: string) => {
        checkNewPage();
        pdf.text(line, marginLeft, yPosition);
        yPosition += fontSize * 0.4;
      });
      yPosition += 5;
    };

    // Title
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Legal Document Analysis Report', marginLeft, yPosition);
    yPosition += 30;

    // Document Information
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Document Information', marginLeft, yPosition);
    yPosition += 15;

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    
    const docInfo = [
      ['Document Name:', documentData.name],
      ['Upload Date:', this.formatDate(documentData.uploadDate)],
      ['Document Type:', documentData.type],
      ['File Size:', typeof documentData.size === 'number' ? `${documentData.size} bytes` : documentData.size],
      ['Processing Status:', documentData.status],
      ['Report Generated:', this.formatDate(new Date().toISOString())]
    ];

    docInfo.forEach(([label, value]) => {
      checkNewPage();
      pdf.setFont('helvetica', 'bold');
      pdf.text(label, marginLeft, yPosition);
      pdf.setFont('helvetica', 'normal');
      pdf.text(value, marginLeft + 80, yPosition);
      yPosition += 12;
    });

    yPosition += 10;

    // Executive Summary
    checkNewPage(40);
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Executive Summary', marginLeft, yPosition);
    yPosition += 15;

    addWrappedText(summaryData.overview, 12);

    // Key Information
    if (summaryData.keyInformation.length > 0) {
      checkNewPage(30);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Key Information', marginLeft, yPosition);
      yPosition += 15;

      summaryData.keyInformation.forEach(({ label, value }) => {
        checkNewPage();
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`${label}:`, marginLeft, yPosition);
        pdf.setFont('helvetica', 'normal');
        const lines = pdf.splitTextToSize(value, contentWidth - 80);
        lines.forEach((line: string, index: number) => {
          if (index === 0) {
            pdf.text(line, marginLeft + 80, yPosition);
          } else {
            yPosition += 12;
            checkNewPage();
            pdf.text(line, marginLeft + 80, yPosition);
          }
        });
        yPosition += 15;
      });
    }

    // Risk Analysis
    if (detailedAnalysis.risks.length > 0) {
      checkNewPage(40);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Risk Analysis', marginLeft, yPosition);
      yPosition += 20;

      detailedAnalysis.risks.forEach((risk, index) => {
        checkNewPage(50);
        
        // Risk title with level color
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(0, 0, 0);
        pdf.text(`${index + 1}. ${risk.title}`, marginLeft, yPosition);
        
        // Risk level badge
        const badgeColor = this.getRiskColor(risk.level);
        pdf.setFillColor(badgeColor);
        pdf.rect(marginLeft + 150, yPosition - 8, 30, 12, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(10);
        pdf.text(risk.level.toUpperCase(), marginLeft + 155, yPosition - 1);
        
        yPosition += 20;

        // Risk details
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Section:', marginLeft + 10, yPosition);
        pdf.setFont('helvetica', 'normal');
        addWrappedText(risk.section, 11, contentWidth - 20);

        pdf.setFont('helvetica', 'bold');
        pdf.text('Description:', marginLeft + 10, yPosition);
        yPosition += 12;
        pdf.setFont('helvetica', 'normal');
        addWrappedText(risk.description, 11, contentWidth - 20);

        pdf.setFont('helvetica', 'bold');
        pdf.text('Recommendation:', marginLeft + 10, yPosition);
        yPosition += 12;
        pdf.setFont('helvetica', 'normal');
        addWrappedText(risk.recommendation, 11, contentWidth - 20);

        yPosition += 10;
      });
    }

    // Clauses Analysis
    if (detailedAnalysis.clauses.length > 0) {
      checkNewPage(40);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Clauses Analysis', marginLeft, yPosition);
      yPosition += 20;

      detailedAnalysis.clauses.forEach((clause, index) => {
        checkNewPage(60);
        
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`${index + 1}. ${clause.title}`, marginLeft, yPosition);
        yPosition += 15;

        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Type:', marginLeft + 10, yPosition);
        pdf.setFont('helvetica', 'normal');
        pdf.text(clause.type, marginLeft + 40, yPosition);
        yPosition += 15;

        pdf.setFont('helvetica', 'bold');
        pdf.text('Original Text:', marginLeft + 10, yPosition);
        yPosition += 12;
        pdf.setFont('helvetica', 'normal');
        addWrappedText(clause.originalText, 10, contentWidth - 20);

        pdf.setFont('helvetica', 'bold');
        pdf.text('Key Points:', marginLeft + 10, yPosition);
        yPosition += 12;
        
        clause.simplifiedPoints.forEach(point => {
          checkNewPage();
          pdf.setFont('helvetica', 'normal');
          pdf.text('• ', marginLeft + 15, yPosition);
          const lines = pdf.splitTextToSize(point, contentWidth - 30);
          lines.forEach((line: string, lineIndex: number) => {
            pdf.text(line, marginLeft + (lineIndex === 0 ? 20 : 25), yPosition);
            if (lineIndex < lines.length - 1) {
              yPosition += 12;
              checkNewPage();
            }
          });
          yPosition += 12;
        });

        pdf.setFont('helvetica', 'bold');
        pdf.text('Key Takeaway:', marginLeft + 10, yPosition);
        yPosition += 12;
        pdf.setFont('helvetica', 'normal');
        addWrappedText(clause.keyTakeaway, 11, contentWidth - 20);

        yPosition += 10;
      });
    }

    // Save the PDF
    const fileName = `${documentData.name.replace(/\.[^/.]+$/, '')}-analysis-report.pdf`;
    pdf.save(fileName);
  }

  async generateDOCXReport(
    documentData: DocumentData,
    summaryData: SummaryData,
    detailedAnalysis: DetailedAnalysis
  ): Promise<void> {
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          // Title
          new Paragraph({
            children: [
              new TextRun({
                text: "Legal Document Analysis Report",
                bold: true,
                size: 32,
                color: "1f2937"
              })
            ],
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 }
          }),

          // Document Information Section
          new Paragraph({
            children: [
              new TextRun({
                text: "Document Information",
                bold: true,
                size: 24,
                color: "1f2937"
              })
            ],
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 200 }
          }),

          // Document Information Table
          new Table({
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: "Document Name", bold: true })] })],
                    width: { size: 30, type: WidthType.PERCENTAGE },
                    shading: { fill: "f3f4f6", type: ShadingType.SOLID }
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: documentData.name })] })],
                    width: { size: 70, type: WidthType.PERCENTAGE }
                  })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: "Upload Date", bold: true })] })],
                    shading: { fill: "f3f4f6", type: ShadingType.SOLID }
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: this.formatDate(documentData.uploadDate) })] })]
                  })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: "Document Type", bold: true })] })],
                    shading: { fill: "f3f4f6", type: ShadingType.SOLID }
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: documentData.type })] })]
                  })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: "File Size", bold: true })] })],
                    shading: { fill: "f3f4f6", type: ShadingType.SOLID }
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: typeof documentData.size === 'number' ? `${documentData.size} bytes` : documentData.size })] })]
                  })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: "Report Generated", bold: true })] })],
                    shading: { fill: "f3f4f6", type: ShadingType.SOLID }
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: this.formatDate(new Date().toISOString()) })] })]
                  })
                ]
              })
            ],
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1, color: "d1d5db" },
              bottom: { style: BorderStyle.SINGLE, size: 1, color: "d1d5db" },
              left: { style: BorderStyle.SINGLE, size: 1, color: "d1d5db" },
              right: { style: BorderStyle.SINGLE, size: 1, color: "d1d5db" },
              insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "d1d5db" },
              insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "d1d5db" }
            }
          }),

          // Executive Summary
          new Paragraph({
            children: [
              new TextRun({
                text: "Executive Summary",
                bold: true,
                size: 24,
                color: "1f2937"
              })
            ],
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 }
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: summaryData.overview,
                size: 22
              })
            ],
            spacing: { after: 300 }
          }),

          // Key Information
          ...(summaryData.keyInformation.length > 0 ? [
            new Paragraph({
              children: [
                new TextRun({
                  text: "Key Information",
                  bold: true,
                  size: 24,
                  color: "1f2937"
                })
              ],
              heading: HeadingLevel.HEADING_1,
              spacing: { before: 200, after: 200 }
            }),
            ...summaryData.keyInformation.flatMap(({ label, value }) => [
              new Paragraph({
                children: [
                  new TextRun({ text: `${label}: `, bold: true, size: 22 }),
                  new TextRun({ text: value, size: 22 })
                ],
                spacing: { after: 100 }
              })
            ])
          ] : []),

          // Risk Analysis
          ...(detailedAnalysis.risks.length > 0 ? [
            new Paragraph({
              children: [
                new TextRun({
                  text: "Risk Analysis",
                  bold: true,
                  size: 24,
                  color: "1f2937"
                })
              ],
              heading: HeadingLevel.HEADING_1,
              spacing: { before: 400, after: 200 }
            }),
            ...detailedAnalysis.risks.flatMap((risk, index) => [
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${index + 1}. ${risk.title} `,
                    bold: true,
                    size: 24,
                    color: "1f2937"
                  }),
                  new TextRun({
                    text: `[${risk.level.toUpperCase()}]`,
                    bold: true,
                    size: 20,
                    color: risk.level === 'high' ? "dc2626" : risk.level === 'medium' ? "ea580c" : "16a34a"
                  })
                ],
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 300, after: 100 }
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: "Section: ", bold: true, size: 22 }),
                  new TextRun({ text: risk.section, size: 22 })
                ],
                spacing: { after: 100 }
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: "Description: ", bold: true, size: 22 }),
                  new TextRun({ text: risk.description, size: 22 })
                ],
                spacing: { after: 100 }
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: "Recommendation: ", bold: true, size: 22 }),
                  new TextRun({ text: risk.recommendation, size: 22 })
                ],
                spacing: { after: 200 }
              })
            ])
          ] : []),

          // Clauses Analysis
          ...(detailedAnalysis.clauses.length > 0 ? [
            new Paragraph({
              children: [
                new TextRun({
                  text: "Clauses Analysis",
                  bold: true,
                  size: 24,
                  color: "1f2937"
                })
              ],
              heading: HeadingLevel.HEADING_1,
              spacing: { before: 400, after: 200 }
            }),
            ...detailedAnalysis.clauses.flatMap((clause, index) => [
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${index + 1}. ${clause.title}`,
                    bold: true,
                    size: 24,
                    color: "1f2937"
                  })
                ],
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 300, after: 100 }
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: "Type: ", bold: true, size: 22 }),
                  new TextRun({ text: clause.type, size: 22 })
                ],
                spacing: { after: 100 }
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: "Original Text: ", bold: true, size: 22 }),
                  new TextRun({ text: clause.originalText, size: 22 })
                ],
                spacing: { after: 100 }
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: "Key Points:", bold: true, size: 22 })
                ],
                spacing: { after: 100 }
              }),
              ...clause.simplifiedPoints.map(point => 
                new Paragraph({
                  children: [
                    new TextRun({ text: `• ${point}`, size: 22 })
                  ],
                  spacing: { after: 50 }
                })
              ),
              new Paragraph({
                children: [
                  new TextRun({ text: "Key Takeaway: ", bold: true, size: 22 }),
                  new TextRun({ text: clause.keyTakeaway, size: 22 })
                ],
                spacing: { after: 200 }
              })
            ])
          ] : [])
        ]
      }]
    });

    // Generate and save the DOCX file
    const buffer = await Packer.toBuffer(doc);
    const fileName = `${documentData.name.replace(/\.[^/.]+$/, '')}-analysis-report.docx`;
    const arrayBuffer = new ArrayBuffer(buffer.length);
    const view = new Uint8Array(arrayBuffer);
    for (let i = 0; i < buffer.length; i++) {
      view[i] = buffer[i];
    }
    const blob = new Blob([arrayBuffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    saveAs(blob, fileName);
  }

  async generateReport(
    documentData: DocumentData,
    summaryData: SummaryData,
    detailedAnalysis: DetailedAnalysis,
    originalDocumentType?: string
  ): Promise<void> {
    // Determine output format based on original document type
    const docType = originalDocumentType || documentData.type || 'pdf';
    
    if (docType.toLowerCase().includes('doc') || docType.toLowerCase().includes('word')) {
      // Generate DOCX for Word documents
      await this.generateDOCXReport(documentData, summaryData, detailedAnalysis);
    } else {
      // Generate PDF for all other types (PDF, images, etc.)
      await this.generatePDFReport(documentData, summaryData, detailedAnalysis);
    }
  }
}

export default ReportGenerator;