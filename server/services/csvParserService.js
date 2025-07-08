const fs = require('fs');
const csv = require('csv-parser');
const { Readable } = require('stream');

function cleanAndParseFloat(value) {
  if (typeof value !== 'string') return 0;
  const cleanedValue = value.replace(/[^0-9.-]+/g, "");
  return parseFloat(cleanedValue || 0);
}

class CsvParserService {
  static parse(filePath) {
    return new Promise((resolve, reject) => {
      const results = [];
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const lines = fileContent.split('\n');
      let format = null;
      let headerRowIndex = -1;

      for (let i = 0; i < 15 && i < lines.length; i++) {
        const line = lines[i].toLowerCase();
        if (line.includes('date') && line.includes('transaction type') && line.includes('paid out')) {
          format = 'nationwide';
          headerRowIndex = i;
          break;
        }
        if (i === 0 && line.includes('date') && line.includes('description') && line.includes('amount')) {
          format = 'amex';
          headerRowIndex = i;
          break;
        }
      }

      if (headerRowIndex === -1) {
        fs.unlinkSync(filePath);
        return reject(new Error('Could not identify a valid header row in the CSV file.'));
      }

      const cleanCsvContent = lines.slice(headerRowIndex).join('\n');
      const readableStream = Readable.from(cleanCsvContent);

      readableStream
        .pipe(csv())
        .on('data', (row) => {
          const cleanRow = {};
          for (const key in row) {
              cleanRow[key.trim().toLowerCase()] = row[key];
          }

          if (format === 'nationwide') {
              const paidOut = cleanAndParseFloat(cleanRow['paid out']);
              const paidIn = cleanAndParseFloat(cleanRow['paid in']);
              if ((paidOut > 0 || paidIn > 0) && cleanRow['date']) {
                  results.push({
                      date: cleanRow['date'],
                      description: cleanRow['description'],
                      amount: paidOut > 0 ? -paidOut : paidIn,
                      source: 'nationwide'
                  });
              }
          } else if (format === 'amex') {
              const amount = cleanAndParseFloat(cleanRow['amount']);
              if (!isNaN(amount) && cleanRow['date']) {
                  results.push({
                      date: cleanRow['date'],
                      description: cleanRow['description'],
                      amount: -amount,
                      source: 'amex'
                  });
              }
          }
        })
        .on('end', () => {
          fs.unlinkSync(filePath);
          resolve(results);
        })
        .on('error', (error) => {
          fs.unlinkSync(filePath);
          reject(error);
        });
    });
  }
}

module.exports = CsvParserService;
