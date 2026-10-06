/**
 * ============================================================
 * WEDDING HUB / SHADI CARD API
 * ZERO-TIMEZONE DISPLAY VALUE ENGINE (FINAL PRODUCTION)
 * ============================================================
 * Handles: 27-Oct-2026, 24-Oct-2026, etc. directly from sheet!
 */

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
    const events = allEvents
      .filter(ev => String(ev.wedding_id || '').trim().toLowerCase() === String(wedding.wedding_id || '').trim().toLowerCase())
      .sort((a, b) => Number(a.sort || 999) - Number(b.sort || 999));
                            
    const allThemes = getSheetData(ss.getSheetByName('Themes'));
    const weddingTheme = String(wedding.theme || '').trim().toLowerCase();
    const theme = allThemes.find(t => String(t.theme || '').trim().toLowerCase() === weddingTheme) || allThemes[0] || {};
    
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
  
  // CRITICAL FIX: getDisplayValues() reads "27-Oct-2026" as pure plain text!
  // It NEVER creates a JS Date object, preventing UTC midnight rollback permanently.
  const range = sheet.getDataRange().getDisplayValues();
  if (range.length < 2) return [];
  
  const headers = range[0].map(h => 
    String(h).trim().toLowerCase()
      .replace(/\s*\(auto\)/g, '')
      .replace(/[^a-z0-9_]/g, '_')
  );
  
  return range.slice(1).map(row => {
    let obj = {};
    headers.forEach((h, idx) => {
      let val = String(row[idx] || '').trim();
      
      // Centralized Date Normalizer for any date column
      if (h === 'date' || h.endsWith('_date') || h.includes('date')) {
        val = normalizeDateString(val);
      }
      
      obj[h] = val;
    });
    return obj;
  });
}

/**
 * Normalizes "27-Oct-2026", "27/10/2026", "27-10-2026" into "2026-10-27"
 * Pure String parsing - ZERO Date objects, ZERO Timezone shift!
 */
function normalizeDateString(str) {
  if (!str) return '';
  const s = String(str).trim();
  
  // 1. Check DD-MMM-YYYY (e.g. 27-Oct-2026, 24-Oct-2026)
  const dMmmY = s.match(/^(\d{1,2})[\s\-\/]+([A-Za-z]+)[\s\-\/]+(\d{4})/);
  if (dMmmY) {
    const d = String(dMmmY[1]).padStart(2, '0');
    const mStr = dMmmY[2].toLowerCase().slice(0, 3);
    const y = dMmmY[3];
    const months = {
      jan:'01', feb:'02', mar:'03', apr:'04', may:'05', jun:'06',
      jul:'07', aug:'08', sep:'09', oct:'10', nov:'11', dec:'12'
    };
    if (months[mStr]) {
      return `${y}-${months[mStr]}-${d}`;
    }
  }

  // 2. Check DD/MM/YYYY or DD-MM-YYYY (e.g. 27/10/2026)
  const dmy = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (dmy) {
    const d = String(dmy[1]).padStart(2, '0');
    const m = String(dmy[2]).padStart(2, '0');
    const y = dmy[3];
    return `${y}-${m}-${d}`;
  }

  // 3. If already YYYY-MM-DD
  const ymd = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (ymd) {
    const y = ymd[1];
    const m = String(ymd[2]).padStart(2, '0');
    const d = String(ymd[3]).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  return s;
}

function responseJSON(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
