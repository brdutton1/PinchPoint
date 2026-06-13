const PDFDocument = require('pdfkit');
const fs = require('fs');

const doc = new PDFDocument({ size: 'LETTER', margins: { top: 64, bottom: 64, left: 64, right: 64 } });
doc.pipe(fs.createWriteStream('PinchPoint-Clinical-Overview.pdf'));

const PAGE_R = doc.page.width - doc.page.margins.right;
const LEFT = doc.page.margins.left;
const INK = '#1a1a1a', MUTE = '#555555', RULE = '#bbbbbb';
const PRIORITY = '#c0392b', MONITOR = '#b9770e', EDU = '#1f6f9c';

function need(h){ if (doc.y + h > doc.page.height - doc.page.margins.bottom) doc.addPage(); }
function h1(t){ doc.font('Times-Bold').fontSize(21).fillColor(INK).text(t); }
function subtitle(t){ doc.font('Times-Italic').fontSize(11.5).fillColor(MUTE).text(t); doc.moveDown(0.2); }
function meta(t){ doc.font('Times-Roman').fontSize(9.5).fillColor(MUTE).text(t); }
function h2(t){
  doc.moveDown(0.9); need(40);
  doc.font('Times-Bold').fontSize(13.5).fillColor(INK).text(t);
  const y = doc.y + 1;
  doc.moveTo(LEFT, y).lineTo(PAGE_R, y).lineWidth(0.7).strokeColor(RULE).stroke();
  doc.moveDown(0.45);
}
function h3(t){ doc.moveDown(0.45); need(28); doc.font('Times-Bold').fontSize(11.5).fillColor(INK).text(t); doc.moveDown(0.1); }
function para(t){ doc.font('Times-Roman').fontSize(11).fillColor(INK).text(t, { align: 'left', lineGap: 1.5 }); doc.moveDown(0.3); }
function bullets(items){
  doc.font('Times-Roman').fontSize(11).fillColor(INK);
  for (const it of items){
    need(20);
    const startX = LEFT + 14;
    doc.text('•', LEFT + 2, doc.y, { continued: false, width: 10 });
    doc.moveUp();
    doc.text(it, startX, doc.y, { width: PAGE_R - startX, lineGap: 1.2 });
    doc.moveDown(0.22);
  }
  doc.moveDown(0.15);
}
// "definition row": bold term + description, used in place of tables
function defrow(term, desc, color){
  need(34);
  doc.font('Times-Bold').fontSize(11).fillColor(color || INK).text(term, { continued: false });
  doc.font('Times-Roman').fontSize(11).fillColor(INK).text(desc, LEFT + 16, doc.y, { width: PAGE_R - (LEFT + 16), lineGap: 1.2 });
  doc.x = LEFT;
  doc.moveDown(0.4);
}

// ---------- Title ----------
h1('PinchPoint');
subtitle('A patient-facing tool for reviewing sleep-posture alignment — clinical overview for practitioner review');
meta('Prepared for clinical feedback   ·   June 2026   ·   Patient: Bryan Dutton');

// ---------- 1 ----------
h2('1.  What it is');
para('PinchPoint is a free, browser-based educational tool that uses a phone’s camera and on-device pose estimation to give a patient a repeatable, annotated look at their sleep posture — primarily side-lying neck and shoulder alignment — to bring to their chiropractor for discussion. It is intended to support a conversation with a qualified provider, not to replace one.');
para('It is not a medical device, and it does not diagnose, treat, or make clinical recommendations. Every output is framed as an observation and a question to raise at a visit.');

// ---------- 2 ----------
h2('2.  How it works (method & privacy)');
bullets([
  'On-device only. Everything runs in the phone’s web browser. The video feed is processed live on the device using Google’s MediaPipe Pose Landmarker (the “full” model) — a body-keypoint model that estimates 33 anatomical landmarks per frame, in 2-D image coordinates and as 3-D world coordinates (estimated depth).',
  'No upload, no storage. No video or images are sent to any server. Captured snapshots are held only in the phone’s memory until the patient chooses to share them (e.g., via Messages or email), and are cleared when the page is closed.',
  'Inputs. The patient frames their whole body from roughly 6–8 ft away with the camera near bed height, or uses a 3-second self-timer to capture themselves in position. Three views are supported: Side R, Side L, and Back.',
  'Stability. At capture the app averages the last several frames, so the saved numbers are steadier than any single noisy frame.',
  'Outputs. An annotated image (body landmarks, a fuller skeleton including hands/feet/face, a spine reference line, derived neck and trunk reference points, the measured angle, and numbered markers on flagged areas) plus a plain-text report. The patient can capture all three views as a set and send them together.'
]);

// ---------- 3 ----------
h2('3.  What it measures');
para('Findings are grouped by severity to guide attention — not to assign clinical significance:');
defrow('Priority', 'Most pronounced deviation in the frame — worth looking at first.', PRIORITY);
defrow('Monitor', 'A noticeable but milder pattern — worth keeping an eye on.', MONITOR);
defrow('Educational', 'Context or a near-neutral reference, not a flag.', EDU);

h3('Side views (Side R / Side L)');
defrow('Head support / cervical side-bend  (the headline measure — a proxy for pillow height)',
  'A “spine axis” is drawn from the mid-shoulder point to the mid-hip point. The head point is taken from the visible (up-facing) ear — chosen by landmark confidence so a pillow-occluded ear is not used — falling back to an eye/nose centroid if both ears are hidden. The app reports the angle between the head and that straight spine axis (0° = head in line with the spine). This angle is now computed in 3-D from the world landmarks (depth-aware, more robust to camera perspective) when available, falling back to the 2-D estimate otherwise; the report labels which basis was used. It also notes whether the head sits toward the mattress (pillow may be too low) or away from it (too high).');
defrow('Forward-head / cranio-vertebral offset  (new)',
  'Horizontal distance the up-facing ear sits forward of the shoulder, as a percentage of torso length — the classic forward-head pattern. Distinct from the head-support angle above; this is an apparent (image-plane) measure. Heuristic bands to calibrate.');
defrow('Head pitch / chin position  (new)',
  'Vertical offset of the nose relative to the up-facing ear (apparent), indicating chin-tucked vs. chin-up. Heuristic bands to calibrate.');
defrow('Shoulder protraction', 'Horizontal offset of the top shoulder forward of the hip line, expressed as a percentage of body length.');
defrow('Hand under head', 'Proximity of the near-side wrist to the head — a common source of overnight shoulder / brachial-plexus load.');
defrow('Knee stacking offset', 'Horizontal separation between the knees (top knee slid forward → pelvic rotation; cue for a knee pillow).');
defrow('Shoulder–hip rotation', 'Difference in the angle of the shoulder line vs. the hip line (apparent trunk torsion).');

h3('Back view');
defrow('Overhead arm position', 'Wrist raised well above shoulder height (sustained shoulder flexion).');
defrow('Shoulder asymmetry', 'Vertical height difference between the two shoulders in the image.');
defrow('Hip asymmetry', 'Vertical height difference between the two hips (apparent pelvic tilt / rotation).');
defrow('Lumbar note', 'The app states that a back view cannot assess lumbar curve and prompts a side photo instead.');

// ---------- 4 ----------
h2('4.  Important limitations (please read)');
bullets([
  'Angle basis. The head-support angle is computed in 3-D (depth-aware) when the world landmarks are available — more robust to perspective than a flat photo — but the depth itself is estimated from a single camera, so it is better than 2-D, not lab goniometry. The forward-head and chin measures remain apparent (2-D image-plane).',
  '2-D cannot fully separate rotation from lateral tilt. Preferring the visible ear and using 3-D for the headline angle reduce this, but do not eliminate it.',
  'It depends on what the camera can see. Blankets, pillows, and clothing can occlude landmarks. When the app cannot see enough to measure something, it says “could not assess” rather than producing a number. The fuller skeleton (hands, feet, face) is low-confidence at 6–8 ft and only drawn when actually detected; no measurement depends on those distal points.',
  'Derived reference points are estimates, not detected anatomy. The trunk reference dots are a straight-line interpolation between the shoulder and hip midpoints and CANNOT show true spinal curvature (no model detects spine points between the shoulders and hips). The neck and head-top markers are likewise estimates. These drive no findings — they are visual references only.',
  'The thresholds are heuristics, not clinical cutoffs. The head-support bands are < 8° = near neutral, 8–18° = mild, > 18° = priority; the new forward-head and chin bands are likewise starting points. All are explicitly intended to be calibrated by you.',
  'A single snapshot is not the whole night. Posture shifts during sleep; a capture reflects one moment of one setup.',
  'Educational use only. Not a diagnosis, not treatment, and not a regulated medical device.'
]);

// ---------- 5 ----------
h2('5.  Where your input would help');
para('The app is deliberately built so a clinician can tune it. The patient would value your view on:');
bullets([
  'Thresholds — do the head-support bands (8° / 18°) and the other cutoffs match what you would consider fine vs. worth addressing?',
  'Wording — does the language of the findings and the “discuss with your chiropractor” prompts read appropriately to a clinician (not over- or under-stated)?',
  'The right measures — are these the patterns worth flagging for this patient, or would you add, drop, or re-prioritize any?',
  'Views — are Side R / L and Back the useful angles, or is something else more informative?',
  'Disclaimers — is the “informational, not a diagnosis” framing sufficient from your standpoint?'
]);
para('Any feedback — even loose, offhand reactions — can be folded directly back into the app.');

// ---------- 6 ----------
h2('6.  Trying it yourself');
para('The live app runs in a phone browser (Safari or Chrome): open the link included with this email, grant camera access, choose a position, and tap Start. The on-screen overlay shows the spine line, a dashed “neutral” reference, the up-facing ear point, and the measured angle in real time. Capture (3-second timer) freezes the annotated frame, and Send to chiropractor bundles the captured views with the report. No account is needed and nothing is recorded.');

// ---------- footer ----------
doc.moveDown(0.8);
need(40);
const fy = doc.y;
doc.moveTo(LEFT, fy).lineTo(PAGE_R, fy).lineWidth(0.7).strokeColor(RULE).stroke();
doc.moveDown(0.4);
doc.font('Times-Italic').fontSize(9.5).fillColor(MUTE).text(
  'PinchPoint is an independent, educational, on-device tool. It provides observations to support a conversation with a qualified provider and does not diagnose or treat any condition. Prepared by Bryan Dutton for clinical review.',
  { lineGap: 1 });

doc.end();
console.log('PDF written');
