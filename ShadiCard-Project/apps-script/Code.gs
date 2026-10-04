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

function getSheetData(sheet) {
  if (!sheet) return [];
  const range = sheet.getDataRange().getValues();
  if (range.length < 2) return [];
  
  const headers = range[0].map(h => 
    String(h).trim().toLowerCase()
      .replace(/\s*\(auto\)/g, '')
      .replace(/[^a-z0-9_]/g, '_')
  );
  
  return range.slice(1).map(row => {
    let obj = {};
    headers.forEach((h, idx) => {
      let val = row[idx];
      
      // Strict Timezone Handling (Asia/Kolkata)
      if (val instanceof Date) {
        const year = val.getFullYear();
        if (year <= 1900) {
          // Pure Time Field -> e.g. "09:30 PM"
          val = Utilities.formatDate(val, "Asia/Kolkata", "hh:mm a");
        } else {
          // Standard Numeric ISO Date -> "yyyy-MM-dd" (e.g. "2026-10-27")
          // Is format se frontend 0 error ke sath exact 27th pick karega
          val = Utilities.formatDate(val, "Asia/Kolkata", "yyyy-MM-dd");
        }
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
