const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const path = require('path');

async function parseResume(filePath, mimetype) {
  const ext = path.extname(filePath).toLowerCase();

  if (mimetype === 'application/pdf' || ext === '.pdf') {
    const dataBuffer = require('fs').readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    return data.text;
  }

  if (
    mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    mimetype === 'application/msword' ||
    ext === '.docx' ||
    ext === '.doc'
  ) {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  }

  throw new Error(`Unsupported file type: ${ext}`);
}

module.exports = { parseResume };
