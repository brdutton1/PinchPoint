const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } = require('docx');
const fs = require('fs');

const PRIORITY = 'C0392B', MONITOR = 'B9770E', EDU = '1F6F9C', MUTE = '555555';

const P = (text, opts={}) => new Paragraph({
  spacing: { after: 120, line: 276 },
  children: [ new TextRun({ text, ...opts }) ],
});
const RUNS = (runs, paraOpts={}) => new Paragraph({ spacing: { after: 120, line: 276 }, children: runs, ...paraOpts });
const H1 = (text) => new Paragraph({ heading: HeadingLevel.TITLE, spacing: { after: 60 }, children: [ new TextRun({ text, bold: true }) ] });
const H2 = (text) => new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 260, after: 100 },
  border: { bottom: { color: 'BBBBBB', space: 2, style: BorderStyle.SINGLE, size: 6 } },
  children: [ new TextRun({ text, bold: true }) ] });
const H3 = (text) => new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 160, after: 60 }, children: [ new TextRun({ text, bold: true }) ] });
const BULLET = (text) => new Paragraph({ bullet: { level: 0 }, spacing: { after: 80, line: 264 }, children: [ new TextRun({ text }) ] });
// term + description, one paragraph (easy to comment on)
const DEF = (term, desc, color) => new Paragraph({ spacing: { after: 140, line: 264 }, children: [
  new TextRun({ text: term + ' — ', bold: true, color: color || undefined }),
  new TextRun({ text: desc }),
]});

const children = [
  H1('PinchPoint'),
  new Paragraph({ spacing: { after: 60 }, children: [ new TextRun({ text: 'A patient-facing tool for reviewing sleep-posture alignment — clinical overview for practitioner review', italics: true, color: MUTE }) ] }),
  new Paragraph({ spacing: { after: 200 }, children: [ new TextRun({ text: 'Prepared for clinical feedback   ·   June 2026   ·   Patient: Bryan Dutton', size: 19, color: MUTE }) ] }),

  H2('1.  What it is'),
  P('PinchPoint is a free, browser-based educational tool that uses a phone’s camera and on-device pose estimation to give a patient a repeatable, annotated look at their sleep posture — primarily side-lying neck and shoulder alignment — to bring to their chiropractor for discussion. It is intended to support a conversation with a qualified provider, not to replace one.'),
  RUNS([
    new TextRun({ text: 'It is not a medical device, and it does not diagnose, treat, or make clinical recommendations.', bold: true }),
    new TextRun({ text: ' Every output is framed as an observation and a question to raise at a visit.' }),
  ]),

  H2('2.  How it works (method & privacy)'),
  BULLET('On-device only. Everything runs in the phone’s web browser. The video feed is processed live on the device using Google’s MediaPipe Pose Landmarker — a body-keypoint model that estimates 33 anatomical landmarks per frame.'),
  BULLET('No upload, no storage. No video or images are sent to any server. Captured snapshots are held only in the phone’s memory until the patient chooses to share them (e.g., via Messages or email), and are cleared when the page is closed.'),
  BULLET('Inputs. The patient frames their whole body from roughly 6–8 ft away with the camera near bed height, or uses a 3-second self-timer to capture themselves in position. Three views are supported: Side R, Side L, and Back.'),
  BULLET('Outputs. An annotated image (body landmarks, a spine reference line, the measured angle, and numbered markers on flagged areas) plus a plain-text report. The patient can capture all three views as a set and send them together.'),

  H2('3.  What it measures'),
  P('Findings are grouped by severity to guide attention — not to assign clinical significance:'),
  DEF('Priority', 'Most pronounced deviation in the frame — worth looking at first.', PRIORITY),
  DEF('Monitor', 'A noticeable but milder pattern — worth keeping an eye on.', MONITOR),
  DEF('Educational', 'Context or a near-neutral reference, not a flag.', EDU),

  H3('Side views (Side R / Side L)'),
  DEF('Head support / cervical side-bend (the headline measure — a proxy for pillow height)',
    'A “spine axis” is drawn from the mid-shoulder point to the mid-hip point. The head point is taken from the visible (up-facing) ear — chosen by landmark confidence so a pillow-occluded ear is not used — falling back to an eye/nose centroid if both ears are hidden. The app reports the angle between the head and that straight spine axis (0° = head in line with the spine), and whether the head sits toward the mattress (pillow may be too low) or away from it (too high).'),
  DEF('Shoulder protraction', 'Horizontal offset of the top shoulder forward of the hip line, expressed as a percentage of body length.'),
  DEF('Hand under head', 'Proximity of the near-side wrist to the head — a common source of overnight shoulder / brachial-plexus load.'),
  DEF('Knee stacking offset', 'Horizontal separation between the knees (top knee slid forward → pelvic rotation; cue for a knee pillow).'),
  DEF('Shoulder–hip rotation', 'Difference in the angle of the shoulder line vs. the hip line (apparent trunk torsion).'),

  H3('Back view'),
  DEF('Overhead arm position', 'Wrist raised well above shoulder height (sustained shoulder flexion).'),
  DEF('Shoulder asymmetry', 'Vertical height difference between the two shoulders in the image.'),
  DEF('Hip asymmetry', 'Vertical height difference between the two hips (apparent pelvic tilt / rotation).'),
  DEF('Lumbar note', 'The app states that a back view cannot assess lumbar curve and prompts a side photo instead.'),

  H2('4.  Important limitations (please read)'),
  BULLET('Angles are “apparent,” not true goniometry. They are measured in the 2-D image plane from a single photo. Camera height, tilt, and perspective all affect them; they indicate direction and trend more reliably than exact degrees.'),
  BULLET('2-D cannot fully separate rotation from lateral tilt. Preferring the visible ear reduces this, but does not eliminate it.'),
  BULLET('It depends on what the camera can see. Blankets, pillows, and clothing can occlude landmarks. When the app cannot see enough to measure something, it says “could not assess” rather than producing a number.'),
  BULLET('The thresholds are heuristics, not clinical cutoffs. The head-support bands currently used are < 8° = near neutral, 8–18° = mild, and > 18° = priority. These were chosen as reasonable starting points and are explicitly intended to be calibrated by you.'),
  BULLET('A single snapshot is not the whole night. Posture shifts during sleep; a capture reflects one moment of one setup.'),
  BULLET('Educational use only. Not a diagnosis, not treatment, and not a regulated medical device.'),

  H2('5.  Where your input would help'),
  P('The app is deliberately built so a clinician can tune it. The patient would value your view on:'),
  BULLET('Thresholds — do the head-support bands (8° / 18°) and the other cutoffs match what you would consider fine vs. worth addressing?'),
  BULLET('Wording — does the language of the findings and the “discuss with your chiropractor” prompts read appropriately to a clinician (not over- or under-stated)?'),
  BULLET('The right measures — are these the patterns worth flagging for this patient, or would you add, drop, or re-prioritize any?'),
  BULLET('Views — are Side R / L and Back the useful angles, or is something else more informative?'),
  BULLET('Disclaimers — is the “informational, not a diagnosis” framing sufficient from your standpoint?'),
  P('Any feedback — even loose, offhand reactions — can be folded directly back into the app.'),

  H2('6.  Trying it yourself'),
  P('The live app runs in a phone browser (Safari or Chrome): open the link included with this email, grant camera access, choose a position, and tap Start. The on-screen overlay shows the spine line, a dashed “neutral” reference, the up-facing ear point, and the measured angle in real time. Capture (3-second timer) freezes the annotated frame, and Send to chiropractor bundles the captured views with the report. No account is needed and nothing is recorded.'),

  new Paragraph({ spacing: { before: 240, after: 0 }, border: { bottom: { color: 'BBBBBB', space: 2, style: BorderStyle.SINGLE, size: 6 } }, children: [] }),
  new Paragraph({ spacing: { before: 80 }, children: [ new TextRun({ text: 'PinchPoint is an independent, educational, on-device tool. It provides observations to support a conversation with a qualified provider and does not diagnose or treat any condition. Prepared by Bryan Dutton for clinical review.', italics: true, size: 19, color: MUTE }) ] }),
];

const doc = new Document({
  styles: { default: { document: { run: { font: 'Calibri', size: 22 } } } },
  sections: [ { properties: { page: { margin: { top: 1080, bottom: 1080, left: 1080, right: 1080 } } }, children } ],
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync('PinchPoint-Clinical-Overview.docx', buf);
  console.log('DOCX written:', buf.length, 'bytes');
});
