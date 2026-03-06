// ============================================================
//  HEIDE PARK ROBLOX — SETTINGS.JS
//  Master Configuration File
//  Edit everything here. The website reads all values from here.
// ============================================================

const SETTINGS = {

  // ----------------------------------------------------------
  //  PARK INFO
  // ----------------------------------------------------------
  park: {
    name: "Heide Park Roblox",
    tagline: "The Biggest Roblox Theme Park Experience",
    maxBookingsPerDay: 4,       // Max users per normal day
    bookingWindowDays: 14,      // How many days ahead users can book
  },

  // ----------------------------------------------------------
  //  WEBHOOKS
  // ----------------------------------------------------------
  webhooks: {
    regularBooking: "https://discordapp.com/api/webhooks/1473284499931533438/eZnWVr5ohWSBWLMsGSRNtWC5x3EPGHVnl9HsTjZf7pO9Ayhz-OjH7dNiacpB1ZMhauNS",
    goldenTicket:   "https://discordapp.com/api/webhooks/1478765370515914764/MWtoQRSeeujSimtfOBJ8-KOQ7lR7kwd-OCZG1ObXf3tH8FJ-dFqeKwbjG-D3YoJO9JIS",
  },

  // ----------------------------------------------------------
  //  GOLDEN TICKET SYSTEM
  //  enabled: true/false — show golden ticket on homepage
  //  claimedBy: "" — username who claimed it (empty = not claimed)
  //  bookingDate: "YYYY-MM-DD" or null — which date it grants access to
  //  If bookingDate is null, golden ticket holder gets VIP entry any day
  // ----------------------------------------------------------
  goldenTicket: {
    enabled: false,
    claimedBy: "",              // e.g. "PlayerXYZ" — leave empty if not yet claimed
    bookingDate: "2025-07-19",  // The day the golden ticket is valid for (YYYY-MM-DD)
    label: "Golden Saturday",   // Display name shown on the ticket
  },

  // ----------------------------------------------------------
  //  FUN FACTS (shown on homepage, rotated randomly)
  //  Add as many as you want. Delete any you don't want.
  // ----------------------------------------------------------
  funFacts: [
    "Heide Park Roblox was founded in 2022 and now has over 500 active members!",
    "Our most popular attraction gets visited over 1,000 times per event day.",
    "Every event weekend is planned months in advance with custom builds.",
    "The park record for most visitors in one day is 42 players!",
    "We have over 15 unique themed zones across the map.",
    "Our team of builders has spent over 10,000 hours creating the park.",
    "Golden Tickets have only been issued 3 times in park history.",
    "Every weekend event features live DJ music in the central plaza.",
  ],

  // ----------------------------------------------------------
  //  PARK NEWS (shown as ticker or news section on homepage)
  // ----------------------------------------------------------
  parkNews: [
    { date: "2025-07-10", text: "New roller coaster zone opening this summer!" },
    { date: "2025-07-05", text: "Weekend event capacity increased to 4 guests per session." },
    { date: "2025-06-28", text: "Golden Ticket event coming soon — stay tuned!" },
    { date: "2025-06-20", text: "VIP lounge area has been rebuilt with new lighting effects." },
  ],

  // ----------------------------------------------------------
  //  VISITOR TIPS (shown in tips section on homepage)
  // ----------------------------------------------------------
  visitorTips: [
    "Join the Discord server to get notified when new tickets drop!",
    "Book early — weekends sell out within hours of release.",
    "Arrive in the server 5 minutes early to get the best spawn spots.",
    "Follow park rules or risk being removed from the event.",
    "Use the VIP entrance if you hold a Golden Ticket.",
  ],

  // ----------------------------------------------------------
  //  NEXT ATTRACTIONS (shown on homepage)
  // ----------------------------------------------------------
  nextAttractions: [
    { name: "Thunder Mountain XL",   eta: "August 2025",    icon: "⚡" },
    { name: "Haunted Mansion Reboot", eta: "October 2025",   icon: "👻" },
    { name: "Winter World Zone",      eta: "December 2025",  icon: "❄️" },
  ],

  // ----------------------------------------------------------
  //  BOOKING CALENDAR
  //  Structure: bookingDays[year][month][day]
  //
  //  Each day object:
  //    enabled:  true/false — show this day as bookable
  //    bookedBy: [] — array of Roblox usernames who booked
  //              Max 4 = sold out automatically
  //
  //  months are 1-indexed (1 = January, 7 = July, etc.)
  //  days are the day number of the month (1–31)
  //
  //  ONLY WEEKENDS matter per the rules, but you can add any day.
  //  Past days are automatically hidden by the app.
  // ----------------------------------------------------------
  bookingDays: {

    2025: {

      7: { // July 2025
        5:  { enabled: true,  bookedBy: ["PlayerAlpha", "CoolRider99", "ParkFan2025", "AwesomeGamer"] },
        6:  { enabled: true,  bookedBy: ["XboxKing", "RobloxPro"] },
        12: { enabled: true,  bookedBy: [] },
        13: { enabled: true,  bookedBy: ["NightRider77"] },
        19: { enabled: true,  bookedBy: [] },
        20: { enabled: true,  bookedBy: [] },
        26: { enabled: true,  bookedBy: [] },
        27: { enabled: true,  bookedBy: [] },
      },

      8: { // August 2025
        2:  { enabled: true,  bookedBy: [] },
        3:  { enabled: true,  bookedBy: [] },
        9:  { enabled: true,  bookedBy: [] },
        10: { enabled: true,  bookedBy: [] },
        16: { enabled: true,  bookedBy: [] },
        17: { enabled: true,  bookedBy: [] },
        23: { enabled: true,  bookedBy: [] },
        24: { enabled: true,  bookedBy: [] },
        30: { enabled: true,  bookedBy: [] },
        31: { enabled: true,  bookedBy: [] },
      },

      9: { // September 2025
        6:  { enabled: true,  bookedBy: [] },
        7:  { enabled: true,  bookedBy: [] },
        13: { enabled: true,  bookedBy: [] },
        14: { enabled: true,  bookedBy: [] },
        20: { enabled: true,  bookedBy: [] },
        21: { enabled: true,  bookedBy: [] },
        27: { enabled: true,  bookedBy: [] },
        28: { enabled: true,  bookedBy: [] },
      },

      10: { // October 2025
        4:  { enabled: true,  bookedBy: [] },
        5:  { enabled: true,  bookedBy: [] },
        11: { enabled: true,  bookedBy: [] },
        12: { enabled: true,  bookedBy: [] },
        18: { enabled: true,  bookedBy: [] },
        19: { enabled: true,  bookedBy: [] },
        25: { enabled: false, bookedBy: [] }, // disabled example
        26: { enabled: true,  bookedBy: [] },
      },

    },

    2026: {

      1: { // January 2026
        3:  { enabled: true,  bookedBy: [] },
        4:  { enabled: true,  bookedBy: [] },
        10: { enabled: true,  bookedBy: [] },
        11: { enabled: true,  bookedBy: [] },
        17: { enabled: true,  bookedBy: [] },
        18: { enabled: true,  bookedBy: [] },
        24: { enabled: true,  bookedBy: [] },
        25: { enabled: true,  bookedBy: [] },
        31: { enabled: true,  bookedBy: [] },
      },

      2: { // February 2026
        1:  { enabled: true,  bookedBy: [] },
        7:  { enabled: true,  bookedBy: [] },
        8:  { enabled: true,  bookedBy: [] },
        14: { enabled: true,  bookedBy: [] },
        15: { enabled: true,  bookedBy: [] },
        21: { enabled: true,  bookedBy: [] },
        22: { enabled: true,  bookedBy: [] },
        28: { enabled: true,  bookedBy: [] },
      },

      3: { // March 2026
        1:  { enabled: true,  bookedBy: [] },
        7:  { enabled: true,  bookedBy: [] },
        8:  { enabled: true,  bookedBy: [] },
        14: { enabled: true,  bookedBy: [] },
        15: { enabled: true,  bookedBy: [] },
        21: { enabled: true,  bookedBy: [] },
        22: { enabled: true,  bookedBy: [] },
        28: { enabled: true,  bookedBy: [] },
        29: { enabled: true,  bookedBy: [] },
      },

    },

  },

};
// ============================================================
//  END OF SETTINGS — Do not modify below this line
// ============================================================
if (typeof module !== "undefined") module.exports = SETTINGS;
