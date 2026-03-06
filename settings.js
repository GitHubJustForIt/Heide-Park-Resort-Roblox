// ============================================================
//  HEIDE PARK ROBLOX — SETTINGS.JS  v3
//  Master Configuration — edit ONLY this file.
//  The website reads 100% of its data from here.
// ============================================================

const SETTINGS = {

  // ──────────────────────────────────────────────────────────
  //  PARK INFO
  // ──────────────────────────────────────────────────────────
  park: {
    name:              "Heide Park Roblox",
    tagline:           "THE Roblox Theme Park",
    maxBookingsPerDay: 4,     // confirmed spots per day (PENDING does not count toward this)
    bookingWindowDays: 14,    // how many days ahead users may request a booking
  },

  // ──────────────────────────────────────────────────────────
  //  WEBHOOKS
  //  Both URLs are pre-configured and ready.
  // ──────────────────────────────────────────────────────────
  webhooks: {
    regularBooking: "https://discordapp.com/api/webhooks/1473284499931533438/eZnWVr5ohWSBWLMsGSRNtWC5x3EPGHVnl9HsTjZf7pO9Ayhz-OjH7dNiacpB1ZMhauNS",
    goldenTicket:   "https://discordapp.com/api/webhooks/1478765370515914764/MWtoQRSeeujSimtfOBJ8-KOQ7lR7kwd-OCZG1ObXf3tH8FJ-dFqeKwbjG-D3YoJO9JIS",
  },

  // ──────────────────────────────────────────────────────────
  //  GOLDEN TICKET SYSTEM
  //
  //  enabled:     true / false — shows the section on the homepage
  //  claimedBy:   "" — username of the person who CONFIRMED the ticket
  //               Leave empty ("") if nobody has it yet.
  //               PENDING claims are stored in localStorage, not here.
  //  pendingBy:   "" — if someone requested it and you approved it,
  //               move their username into claimedBy and clear pendingBy.
  //  bookingDate: "YYYY-MM-DD" — the specific date it's valid for.
  //               Set to null if it grants open entry on any day.
  //  label:       A short display name for the event, e.g. "VIP Saturday"
  // ──────────────────────────────────────────────────────────
  goldenTicket: {
    enabled:     false,
    claimedBy:   "",              // set to a username once you confirm it
    pendingBy:   "",              // auto-filled by the system when someone requests — you clear this after deciding
    bookingDate: "2026-03-22",    // YYYY-MM-DD
    label:       "VIP Spring Saturday",
  },

  // ──────────────────────────────────────────────────────────
  //  BOOKING CALENDAR
  //
  //  Structure: bookingDays[YEAR][MONTH][DAY]
  //
  //  Each entry is an object with:
  //    enabled:    true / false  — whether this day appears as bookable
  //    bookedBy:   []            — array of CONFIRMED Roblox usernames
  //                               (max = maxBookingsPerDay → Sold Out)
  //    pendingBy:  []            — array of PENDING usernames
  //                               (these are waiting for your approval)
  //
  //  HOW TO CONFIRM A BOOKING:
  //    1. You receive a Discord notification from the webhook.
  //    2. Open settings.js.
  //    3. Find the correct year → month → day.
  //    4. Move the username from pendingBy[] to bookedBy[].
  //    5. Save the file. The website reflects it on reload.
  //
  //  Months are 1-indexed (1 = January, 12 = December).
  //  Days are the calendar day number (1–31).
  //  Past days are automatically hidden by the site.
  // ──────────────────────────────────────────────────────────
  bookingDays: {

    2026: {

      3: { // March 2026
        //  Sat 7 March
        7:  { enabled: true,  bookedBy: [],                    pendingBy: [] },
        //  Sun 8 March
        8:  { enabled: true,  bookedBy: [],       pendingBy: [] },
        //  Sat 14 March
        14: { enabled: true,  bookedBy: [],                    pendingBy: [] },
        //  Sun 15 March
        15: { enabled: true,  bookedBy: [],                    pendingBy: [] },
        //  Sat 21 March
        21: { enabled: true,  bookedBy: [],                    pendingBy: [] },
        //  Sun 22 March  ← Golden Ticket day
        22: { enabled: true,  bookedBy: [],                    pendingBy: [] },
        //  Sat 28 March
        28: { enabled: true,  bookedBy: [],                    pendingBy: [] },
        //  Sun 29 March
        29: { enabled: true,  bookedBy: [],                    pendingBy: [] },
      },

      4: { // April 2026
        4:  { enabled: true,  bookedBy: [],                    pendingBy: [] },
        5:  { enabled: true,  bookedBy: [],                    pendingBy: [] },
        11: { enabled: true,  bookedBy: [],                    pendingBy: [] },
        12: { enabled: true,  bookedBy: [],                    pendingBy: [] },
        18: { enabled: true,  bookedBy: [],                    pendingBy: [] },
        19: { enabled: true,  bookedBy: [],                    pendingBy: [] },
        25: { enabled: true,  bookedBy: [],                    pendingBy: [] },
        26: { enabled: true,  bookedBy: [],                    pendingBy: [] },
      },

      5: { // May 2026
        2:  { enabled: true,  bookedBy: [],                    pendingBy: [] },
        3:  { enabled: true,  bookedBy: [],                    pendingBy: [] },
        9:  { enabled: true,  bookedBy: [],                    pendingBy: [] },
        10: { enabled: true,  bookedBy: [],                    pendingBy: [] },
        16: { enabled: true,  bookedBy: [],                    pendingBy: [] },
        17: { enabled: true,  bookedBy: [],                    pendingBy: [] },
        23: { enabled: false, bookedBy: [],                    pendingBy: [] }, // disabled
        24: { enabled: true,  bookedBy: [],                    pendingBy: [] },
        30: { enabled: true,  bookedBy: [],                    pendingBy: [] },
        31: { enabled: true,  bookedBy: [],                    pendingBy: [] },
      },

      6: { // June 2026
        6:  { enabled: true,  bookedBy: [],                    pendingBy: [] },
        7:  { enabled: true,  bookedBy: [],                    pendingBy: [] },
        13: { enabled: true,  bookedBy: [],                    pendingBy: [] },
        14: { enabled: true,  bookedBy: [],                    pendingBy: [] },
        20: { enabled: true,  bookedBy: [],                    pendingBy: [] },
        21: { enabled: true,  bookedBy: [],                    pendingBy: [] },
        27: { enabled: true,  bookedBy: [],                    pendingBy: [] },
        28: { enabled: true,  bookedBy: [],                    pendingBy: [] },
      },

      7: { // July 2026
        4:  { enabled: true,  bookedBy: [],                    pendingBy: [] },
        5:  { enabled: true,  bookedBy: [],                    pendingBy: [] },
        11: { enabled: true,  bookedBy: [],                    pendingBy: [] },
        12: { enabled: true,  bookedBy: [],                    pendingBy: [] },
        18: { enabled: true,  bookedBy: [],                    pendingBy: [] },
        19: { enabled: true,  bookedBy: [],                    pendingBy: [] },
        25: { enabled: true,  bookedBy: [],                    pendingBy: [] },
        26: { enabled: true,  bookedBy: [],                    pendingBy: [] },
      },

    },

  },

  // ──────────────────────────────────────────────────────────
  //  FUN FACTS  (rotated on homepage every 5 seconds)
  //  Add, remove, or edit freely.
  // ──────────────────────────────────────────────────────────
  funFacts: [
    "Heide Park Roblox was founded in 2026 and now has over 100 active members!",
    "Our most popular attraction gets visited over 200 times per event day.",
    "The park record for most visitors in one day stands at 42 simultaneous players!",
    "Our build team has collectively spent over 10,000 hours creating the park.",
    "Golden Tickets have only ever been issued 3 times in park history.",
    "The park map is larger than 10 full Roblox baseplate areas combined.",
  ],

  // ──────────────────────────────────────────────────────────
  //  PARK NEWS TICKER
  // ──────────────────────────────────────────────────────────
  parkNews: [
      { date: "2026-03-06", text: "Heide Park Roblox got released!" },
  ],

  // ──────────────────────────────────────────────────────────
  //  VISITOR TIPS
  // ──────────────────────────────────────────────────────────
  visitorTips: [
    "Book fast, tickets are sold out faster than you can blink!",
  ],

  // ──────────────────────────────────────────────────────────
  //  NEXT ATTRACTIONS  (shown on homepage)
  // ──────────────────────────────────────────────────────────
  nextAttractions: [
    { name: "Alpenflitz",    eta: "Summer 2026",    icon: "⚡" },
  ],

};

// ──────────────────────────────────────────────────────────
//  END OF SETTINGS
//  Do not add code below this line.
// ──────────────────────────────────────────────────────────
if (typeof module !== "undefined") module.exports = SETTINGS;
