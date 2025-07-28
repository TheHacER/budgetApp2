const { parse } = require('csv-parse/sync');

function looksLikeDate(value) {
  if (!value) return false;
  const d = new Date(value);
  if (!isNaN(d.getTime())) return true;
  const parts = String(value).split(/[\/-]/);
  if (parts.length === 3) {
    const dd = parseInt(parts[0], 10);
    const mm = parseInt(parts[1], 10);
    const yy = parseInt(parts[2], 10);
    if (dd > 0 && dd <= 31 && mm > 0 && mm <= 12 && yy > 0) return true;
  }
  return false;
}

function cleanNumber(value) {
  if (typeof value !== 'string') return NaN;
  const cleaned = value.replace(/[^0-9.-]+/g, '');
  return parseFloat(cleaned);
}

function analyze(buffer) {
  const records = parse(buffer, {
    columns: header => header.map(h => h.trim()),
    skip_empty_lines: true,
    trim: true,
    relax_column_count: true
  });
  if (records.length === 0) return {};

  const headers = Object.keys(records[0]);
  const N = Math.min(records.length, 20);

  const numericInfo = {};
  const dateCandidates = [];
  const textInfo = {};

  for (const h of headers) {
    let dateCount = 0;
    let numValid = 0;
    let numPos = 0;
    let numNeg = 0;
    let lenSum = 0;
    for (let i = 0; i < N; i++) {
      const val = records[i][h];
      if (looksLikeDate(val)) dateCount++;
      const num = cleanNumber(val);
      if (!isNaN(num)) {
        numValid++;
        if (num > 0) numPos++; else if (num < 0) numNeg++;
      }
      lenSum += String(val || '').length;
    }
    if (dateCount >= N / 2) {
      dateCandidates.push(h);
    } else if (numValid >= N / 2) {
      numericInfo[h] = { valid: numValid, pos: numPos, neg: numNeg };
    } else {
      textInfo[h] = { avg: lenSum / N };
    }
  }

  const textCandidates = Object.entries(textInfo).sort((a,b)=>b[1].avg - a[1].avg);
  const description_col = textCandidates[0] ? textCandidates[0][0] : headers[0];

  const numericCandidates = Object.entries(numericInfo)
    .filter(([h]) => !/balance/i.test(h) && !/card/i.test(h));

  let amount_col = null;
  let debit_col = null;
  let credit_col = null;
  let flip_amount_sign = false;

  if (numericCandidates.length >= 2) {
    numericCandidates.sort((a,b)=>b[1].valid - a[1].valid);
    debit_col = numericCandidates[0][0];
    credit_col = numericCandidates[1][0];
    const stats = numericInfo[debit_col];
    if (stats.pos >= stats.neg) flip_amount_sign = true;
  } else if (numericCandidates.length === 1) {
    amount_col = numericCandidates[0][0];
    const stats = numericInfo[amount_col];
    if (stats.pos > stats.neg) flip_amount_sign = true;
  }

  const date_col = dateCandidates[0] || headers[0];

  // sample preview
  const samples = records.slice(0,5).map(r=>({
    date: r[date_col],
    description: r[description_col],
    amount: amount_col ? r[amount_col] : `${r[debit_col]} / ${r[credit_col]}`
  }));

  return { date_col, description_col, amount_col, debit_col, credit_col, flip_amount_sign, samples };
}

module.exports = { analyze };
