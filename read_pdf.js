const fs = require('fs');
const path = require('path');

// Try to use pdf-parse from the backend's node_modules
const pdfParse = require('./backend/node_modules/pdf-parse');

const dataBuffer = fs.readFileSync('./Hackathon_2026_Style_Guide.pdf');
pdfParse(dataBuffer).then(data => {
    console.log(data.text);
}).catch(err => {
    console.error('Error:', err.message);
});
