/* -------------------------- */
/* GLOBAL SETTINGS */
/* -------------------------- */

const SETTINGS = {

siteName: "Heide Park Resort Roblox",

mainColor: "#ff8c00",

/* webhook */

webhookURL:
"https://discordapp.com/api/webhooks/1473284499931533438/eZnWVr5ohWSBWLMsGSRNtWC5x3EPGHVnl9HsTjZf7pO9Ayhz-OjH7dNiacpB1ZMhauNS",

/* booking limits */

maxBookingsPerDay: 3,

bookingRangeDays: 14,

/* disabled days */

disabledDates: [

/* format: YYYY-MM-DD */

"2026-04-02",
"2026-04-03"

],

/* manual bookings */

manualBookings: {

"2026-04-01": {

status: "full",

users: [

"ExampleUser1",
"ExampleUser2",
"ExampleUser3"

]

},

"2026-04-05": {

status: "pending",

users: [

"PendingUser"

]

}

}

};



/* -------------------------- */
/* LOCAL STORAGE SYSTEM */
/* -------------------------- */

function getLocalUser(){

return localStorage.getItem("hp_user");

}

function setLocalUser(name){

localStorage.setItem("hp_user", name);

}



/* -------------------------- */
/* BOOKING STORAGE */
/* -------------------------- */

function getBookings(){

let data = localStorage.getItem("hp_bookings");

if(!data) return {};

return JSON.parse(data);

}

function saveBookings(data){

localStorage.setItem("hp_bookings", JSON.stringify(data));

}



/* -------------------------- */
/* DATE HELPERS */
/* -------------------------- */

function formatDate(date){

let y = date.getFullYear();

let m = String(date.getMonth()+1).padStart(2,"0");

let d = String(date.getDate()).padStart(2,"0");

return `${y}-${m}-${d}`;

}



function isDateAllowed(date){

let today = new Date();

let max = new Date();

max.setDate(today.getDate() + SETTINGS.bookingRangeDays);

return date >= today && date <= max;

}



/* -------------------------- */
/* BOOKING CHECKS */
/* -------------------------- */

function getDayStatus(dateString){

let bookings = getBookings();

if(SETTINGS.disabledDates.includes(dateString)){

return "disabled";

}

if(SETTINGS.manualBookings[dateString]){

return SETTINGS.manualBookings[dateString].status;

}

if(bookings[dateString]){

if(bookings[dateString].length >= SETTINGS.maxBookingsPerDay){

return "full";

}

return "pending";

}

return "available";

}



/* -------------------------- */
/* ADD BOOKING */
/* -------------------------- */

function addBooking(dateString, username){

let bookings = getBookings();

if(!bookings[dateString]){

bookings[dateString] = [];

}

bookings[dateString].push(username);

saveBookings(bookings);

}



/* -------------------------- */
/* LOGIN SYSTEM */
/* -------------------------- */

window.addEventListener("load", () => {

let loginBtn = document.getElementById("loginBtn");

let loginPopup = document.getElementById("loginPopup");

let saveBtn = document.getElementById("saveAccount");

let input = document.getElementById("localUsername");

let user = getLocalUser();

if(user){

loginBtn.innerHTML = `<i class="fa-solid fa-user"></i> ${user}`;

}

loginBtn.onclick = () => {

loginPopup.style.display = "flex";

};

saveBtn.onclick = () => {

let name = input.value.trim();

if(name.length < 2) return;

setLocalUser(name);

loginPopup.style.display = "none";

loginBtn.innerHTML =
`<i class="fa-solid fa-user"></i> ${name}`;

};

});
