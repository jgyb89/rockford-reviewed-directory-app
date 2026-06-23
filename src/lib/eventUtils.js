import { rrulestr } from 'rrule';

/**
 * Expands recurring events to only return the single most immediate upcoming occurrence.
 * @param {Array} events - The list of events.
 * @returns {Array} - A chronologically sorted array of all events with transposed dates.
 */
export function expandRecurringEvents(events) {
  if (!events || !Array.isArray(events)) return [];

  const now = new Date();

  return events.map(event => {
    const details = event.eventDetails;
    
    // Check if it's a valid recurring event
    if (details?.isRecurring && details?.recurrenceRule) {
      try {
        const seedStartStr = details.startDateTime || event.date;
        const seedEndStr = details.endDateTime || seedStartStr;
        
        if (!seedStartStr) return event;

        // 1. Extract the raw time strings to preserve local time
        let startTimeStr = "00:00:00";
        if (seedStartStr.includes("T")) {
          startTimeStr = seedStartStr.split("T")[1];
        } else if (seedStartStr.includes(" ")) {
          startTimeStr = seedStartStr.split(" ")[1];
        }

        // 2. Parse the seed date into a naive UTC Date object to feed rrule
        const parts = seedStartStr.split(/[-T: ]/);
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1;
        const d = parseInt(parts[2], 10);
        const h = parts[3] ? parseInt(parts[3], 10) : 0;
        const min = parts[4] ? parseInt(parts[4], 10) : 0;
        const s = parts[5] ? parseInt(parts[5], 10) : 0;
        
        const naiveUtcStart = new Date(Date.UTC(y, m, d, h, min, s));

        // 3. Generate rules using the naive UTC date as the start
        const rule = rrulestr(details.recurrenceRule, { dtstart: naiveUtcStart });
        
        // 4. Get the single NEXT occurrence after right now
        const naiveUtcNow = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds()));
        const searchStart = naiveUtcStart > naiveUtcNow ? naiveUtcStart : naiveUtcNow;
        const nextDate = rule.after(searchStart, true);

        // If the rule has entirely expired, pass through the original event
        if (!nextDate) return event;

        // Calculate original duration in milliseconds
        const seedStartDate = new Date(seedStartStr);
        const seedEndDate = new Date(seedEndStr);
        const durationMs = seedEndDate.getTime() - seedStartDate.getTime();

        // Extract the YYYY-MM-DD from the UTC occurrence Date
        const year = nextDate.getUTCFullYear();
        const month = String(nextDate.getUTCMonth() + 1).padStart(2, '0');
        const day = String(nextDate.getUTCDate()).padStart(2, '0');
        const dateOnly = `${year}-${month}-${day}`;

        // Re-attach the exact original time string
        const newStartStr = `${dateOnly}T${startTimeStr}`;
        const newStartObj = new Date(newStartStr);
        const newEndObj = new Date(newStartObj.getTime() + durationMs);
        
        // Construct the new end string in ISO-like format
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
          isVirtualOccurrence: true, // Tag as virtual transposed
          eventDetails: {
            ...details,
            startDateTime: newStartStr,
            endDateTime: newEndStr,
          }
        };
      } catch (err) {
        console.error("Error expanding recurring event:", err);
        return event; // fallback to original if parsing fails
      }
    }

    // Not recurring, push as is
    return event;
  }).sort((a, b) => {
    const aDate = new Date(a.eventDetails?.startDateTime || a.date).getTime();
    const bDate = new Date(b.eventDetails?.startDateTime || b.date).getTime();
    return aDate - bDate;
  });
}
