import { rrulestr } from 'rrule';

function processSingleEvent(event, now) {
  const details = event.eventDetails;
  
  if (!details?.isRecurring || !details?.recurrenceRule) return event;

  try {
    const seedStartStr = details.startDateTime || event.date;
    const seedEndStr = details.endDateTime || seedStartStr;
    
    if (!seedStartStr) return event;

    let startTimeStr = "00:00:00";
    if (seedStartStr.includes("T")) {
      startTimeStr = seedStartStr.split("T")[1];
    } else if (seedStartStr.includes(" ")) {
      startTimeStr = seedStartStr.split(" ")[1];
    }

    const parts = seedStartStr.split(/[-T: ]/);
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const d = parseInt(parts[2], 10);
    const h = parts[3] ? parseInt(parts[3], 10) : 0;
    const min = parts[4] ? parseInt(parts[4], 10) : 0;
    const s = parts[5] ? parseInt(parts[5], 10) : 0;
    
    const naiveUtcStart = new Date(Date.UTC(y, m, d, h, min, s));
    const rule = rrulestr(details.recurrenceRule, { dtstart: naiveUtcStart });
    
    const naiveUtcNow = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds()));
    const searchStart = naiveUtcStart > naiveUtcNow ? naiveUtcStart : naiveUtcNow;
    const nextDate = rule.after(searchStart, true);

    if (!nextDate) return event;

    const seedStartDate = new Date(seedStartStr);
    const seedEndDate = new Date(seedEndStr);
    const durationMs = seedEndDate.getTime() - seedStartDate.getTime();

    const year = nextDate.getUTCFullYear();
    const month = String(nextDate.getUTCMonth() + 1).padStart(2, '0');
    const day = String(nextDate.getUTCDate()).padStart(2, '0');
    const dateOnly = `${year}-${month}-${day}`;

    const newStartStr = `${dateOnly}T${startTimeStr}`;
    const newStartObj = new Date(newStartStr);
    const newEndObj = new Date(newStartObj.getTime() + durationMs);
    
    const formatToISO = (dateObj) => {
       const dy = dateObj.getFullYear();
       const dm = String(dateObj.getMonth() + 1).padStart(2, '0');
       const dd = String(dateObj.getDate()).padStart(2, '0');
       const dh = String(dateObj.getHours()).padStart(2, '0');
       const dmin = String(dateObj.getMinutes()).padStart(2, '0');
       const ds = String(dateObj.getSeconds()).padStart(2, '0');
       return `${dy}-${dm}-${dd}T${dh}:${dmin}:${ds}`;
    };

    const newEndStr = formatToISO(newEndObj);
    
    return {
      ...event,
      date: newStartStr,
      isVirtualOccurrence: true,
      eventDetails: {
        ...details,
        startDateTime: newStartStr,
        endDateTime: newEndStr,
      }
    };
  } catch (err) {
    console.error("Error expanding recurring event:", err);
    return event; 
  }
}

/**
 * Expands recurring events to only return the single most immediate upcoming occurrence.
 * @param {Array} events - The list of events.
 * @returns {Array} - A chronologically sorted array of all events with transposed dates.
 */
export function expandRecurringEvents(events) {
  if (!events || !Array.isArray(events)) return [];

  const now = new Date();

  return events
    .map(event => processSingleEvent(event, now))
    .sort((a, b) => {
      const aDate = new Date(a.eventDetails?.startDateTime || a.date).getTime();
      const bDate = new Date(b.eventDetails?.startDateTime || b.date).getTime();
      return aDate - bDate;
    });
}
