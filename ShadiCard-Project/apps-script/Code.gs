function doGet(e) {
  const p = e.parameter || {};
  const action = p.action || 'wedding';
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  if (action === 'wedding') {
    const slug = (p.slug || '').trim().toLowerCase();
    const weddings = getSheetData(ss.getSheetByName('Weddings'));
    
    const wedding = weddings.find(w => {
      const rowSlug = String(w.slug || w.slug_auto || w.slug__auto_ || '').trim().toLowerCase();
      const rowId = String(w.wedding_id || '').trim().toLowerCase();
      return rowSlug === slug || rowId === slug;
    });
    
    if (!wedding) {
      return responseJSON({ success: false, error: 'Wedding record not found' });
    }
    
    const allEvents = getSheetData(ss.getSheetByName('Events'));
    const events = allEvents.filter(ev => String(ev.wedding_id || '').trim() === String(wedding.wedding_id || '').trim());
                            
    const allThemes = getSheetData(ss.getSheetByName('Themes'));
    const weddingTheme = String(wedding.theme || '').trim().toLowerCase();
    const theme = allThemes.find(t => String(t.theme || '').trim().toLowerCase() === weddingTheme) || allThemes[0];
    
    return responseJSON({
      success: true,
      wedding: wedding,
      events: events,
      theme: theme
    });
  }

  return responseJSON({ success: false, error: 'Invalid action' });
}

function normalizeSheetDate(value) {
  if (value === null || value === undefined) return '';

  let raw = String(value).trim();
  if (!raw) return '';

  // Already normalized ISO date from a spreadsheet formula or prior pass.
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    return raw;
  }

  // ISO-like datetime string: keep only the YYYY-MM-DD portion, never the UTC offset.
  const isoMatch = raw.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (isoMatch) {
    const year = isoMatch[1];
    const month = String(isoMatch[2]).padStart(2, '0');
    const day = String(isoMatch[3]).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // DD-MMM-YYYY, DD/MM/YYYY, DD-MM-YYYY, DD MMM YYYY, YYYY/MM/DD etc.
  const monthMap = {
    jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
    jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12'
  };

  const m = raw.match(/^(\d{1,2})[\s/\-]+([A-Za-z]{3,9})[\s/\-]+(\d{4})$/i)
    || raw.match(/^(\d{4})[\s/\-]+(\d{1,2})[\s/\-]+(\d{1,2})$/)
    || raw.match(/^(\d{1,2})[\s/\-]+(\d{1,2})[\s/\-]+(\d{4})$/);

  if (m) {
    let year, month, day;

    if (m[1].length === 4) {
      year = m[1];
      month = m[2];
      day = m[3];
    } else {
      const first = Number(m[1]);
      const second = String(m[2]).toLowerCase();
      const third = Number(m[3]);

      if (/^[a-z]+$/i.test(second)) {
        year = third;
        month = monthMap[second.slice(0, 3)] || '01';
        day = first;
      } else {
        year = third;
        month = String(first).padStart(2, '0');
        day = String(second).padStart(2, '0');
      }
    }

    const normalizedMonth = String(Number(month)).padStart(2, '0');
    const normalizedDay = String(Number(day)).padStart(2, '0');
    return `${year}-${normalizedMonth}-${normalizedDay}`;
  }

  return raw;
}

function getSheetData(sheet) {
  if (!sheet) return [];
  const range = sheet.getDisplayValues();
  if (range.length < 2) return [];

  const headers = range[0].map(h =>
    String(h).trim().toLowerCase()
      .replace(/\s*\(auto\)/g, '')
      .replace(/[^a-z0-9_]/g, '_')
  );

  return range.slice(1).map(row => {
    const obj = {};

    headers.forEach((h, idx) => {
      let val = row[idx];
      if (typeof val === 'string') {
        val = val.trim();
      }

      const isDateField = /(^|_)date$/.test(h) || h.includes('date') || h.includes('day');
      if (isDateField && val) {
        val = normalizeSheetDate(val);
      }

      obj[h] = val;
    });

    return obj;
  });
}

function responseJSON(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
