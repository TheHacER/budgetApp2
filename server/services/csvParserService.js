const { parse } = require('csv-parse/sync');
const ImportProfile = require('../models/ImportProfile');

function cleanAndParseFloat(value) {
    if (typeof value !== 'string') return 0;
    // This regex is more robust, handling commas in thousands and currency symbols.
    const cleanedValue = value.replace(/[^0-9.-]+/g, "");
    return parseFloat(cleanedValue || 0);
}

function normalizeDate(dateString, format) {
    if (!dateString) return null;
    
    // Attempt standard parsing first
    let date = new Date(dateString);
    if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
    }

    // Use format if provided (e.g., DD/MM/YYYY or DD-Mon-YY)
    if (format) {
        // Handle formats like DD-Mon-YY (e.g., 01-Jul-24)
        const dateParts = dateString.split(/[-\/]/);
        const formatParts = format.toUpperCase().split(/[-\/]/);

        if (formatParts.length === dateParts.length) {
            const dateObj = {};
            formatParts.forEach((part, i) => {
                dateObj[part] = dateParts[i];
            });

            const day = parseInt(dateObj.DD, 10);
            const year = parseInt(dateObj.YY || dateObj.YYYY, 10);
            
            // Convert month abbreviation to number
            const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
            const month = monthNames.indexOf(dateObj.MMM.toUpperCase());

            if (!isNaN(day) && !isNaN(year) && month !== -1) {
                const fullYear = year < 100 ? 2000 + year : year; // Convert YY to YYYY
                date = new Date(Date.UTC(fullYear, month, day));
                 if (!isNaN(date.getTime())) {
                    return date.toISOString().split('T')[0];
                }
            }
        }
    }
    
    return null; // Return null if all parsing fails
}


class CsvParserService {
  static async parse(fileBuffer, profileId) {
    const profile = await ImportProfile.findById(profileId);
    if (!profile) {
      throw new Error('Import profile not found.');
    }

    const records = parse(fileBuffer, {
      // This is the fix: dynamically handle columns instead of a fixed header.
      columns: false,
      skip_empty_lines: true,
      trim: true,
      // This allows for rows with a different number of columns.
      relax_column_count: true, 
      // Skip lines at the top of the file that are not data
      from_line: 5 
    });

    const results = [];
    
    // Find column indexes based on the profile
    const dateIndex = 0; // 'Date' is the first column
    const descriptionIndex = 2; // 'Description' is the third column
    const debitIndex = 3; // 'Paid out' is the fourth column
    const creditIndex = 4; // 'Paid in' is the fifth column

    for (const row of records) {
      const date = normalizeDate(row[dateIndex], profile.date_format);
      if (!date) continue; // Skip rows with invalid dates

      const description = row[descriptionIndex] || 'N/A';
      let amount = 0;

      // Logic for separate debit/credit columns
      const debit = cleanAndParseFloat(row[debitIndex]);
      const credit = cleanAndParseFloat(row[creditIndex]);
      amount = credit - debit;
      
      if (Math.abs(amount) < 0.01) continue; // Skip zero-amount transactions

      results.push({
        date: date,
        description: description,
        amount: amount, // Positive for income, negative for expenses
        source: profile.profile_name,
      });
    }

    return results;
  }
}

module.exports = CsvParserService;