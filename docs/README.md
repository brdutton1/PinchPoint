# PinchPoint — documents

Practitioner-facing overview of the app, for sharing with a clinician.

- **PinchPoint-Clinical-Overview.pdf** — the PDF to email.
- **PinchPoint-Clinical-Overview.docx** — Word version for the clinician to mark up / comment on.
- **clinical-overview.html** — human-readable source (open or print to PDF in any browser).

## Regenerating

The PDF and DOCX are generated from small Node scripts:

```bash
npm install pdfkit docx
node build_pdf.js     # -> PinchPoint-Clinical-Overview.pdf
node build_docx.js    # -> PinchPoint-Clinical-Overview.docx
```

When the app's measures or thresholds change, update the text in these scripts
(and `clinical-overview.html`) and re-run so the overview stays in sync.
