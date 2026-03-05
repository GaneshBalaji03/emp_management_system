const fs = require('fs');
const pdfParse = require('pdf-parse');

const dataBuffer = fs.readFileSync('../Hackathon_2026_Style_Guide.pdf');
pdfParse(dataBuffer).then(data => {
    console.log('=== STYLE GUIDE TEXT ===');
    console.log(data.text);
    console.log('=== END ===');
});
