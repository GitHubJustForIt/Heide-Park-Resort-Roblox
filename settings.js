/* -------------------------- */
/* GLOBAL SETTINGS */
/* -------------------------- */

const CONFIG = {

siteName: "Heide Park Resort Roblox",

maxBookingsPerDay: 3,

bookingDaysAhead: 14,

webhookURL:
"https://discordapp.com/api/webhooks/1473284499931533438/eZnWVr5ohWSBWLMsGSRNtWC5x3EPGHVnl9HsTjZf7pO9Ayhz-OjH7dNiacpB1ZMhauNS",



/* -------------------------- */
/* CALENDAR DAY SETTINGS */
/* -------------------------- */

calendarDays: {

"2026-04-01": {
status:"full"
},

"2026-04-02": {
status:"disabled"
},

"2026-04-03": {
status:"pending",
users:["ExampleUser"]
}

}

};



/* -------------------------- */
/* RANGE TOOL */
/* -------------------------- */

function addRange(start,end,status){

let startDate = new Date(start);
let endDate = new Date(end);

for(let d = new Date(startDate); d <= endDate; d.setDate(d.getDate()+1)){

CONFIG.calendarDays[formatDate(d)] = {status:status};

}

}



/* -------------------------- */
/* ACCOUNT SYSTEM */
/* -------------------------- */

function getAccounts(){

let data = localStorage.getItem("hp_accounts");

if(!data) return {};

return JSON.parse(data);

}

function saveAccounts(data){

localStorage.setItem("hp_accounts", JSON.stringify(data));

}



function registerAccount(username,password){

let accounts = getAccounts();

if(accounts[username]){

alert("Account already exists");

return false;

}

accounts[username] = {

password:password

};

saveAccounts(accounts);

return true;

}



function loginAccount(username,password){

let accounts = getAccounts();

if(!accounts[username]){

alert("Account not found");

return false;

}

if(accounts[username].password !== password){

alert("Wrong password");

return false;

}

localStorage.setItem("hp_loggedUser",username);

return true;

}



function logout(){

localStorage.removeItem("hp_loggedUser");

location.reload();

}



function getUser(){

return localStorage.getItem("hp_loggedUser");

}



/* -------------------------- */
/* LOGIN UI */
/* -------------------------- */

window.addEventListener("load",()=>{

let loginScreen = document.getElementById("loginScreen");

let site = document.getElementById("siteWrapper");

let user = getUser();

if(user){

loginScreen.style.display="none";

site.style.display="block";

document.getElementById("accountName").innerText=user;

}else{

loginScreen.style.display="flex";

site.style.display="none";

}



document.getElementById("loginBtnMain").onclick=()=>{

let u=document.getElementById("loginUsername").value;

let p=document.getElementById("loginPassword").value;

if(loginAccount(u,p)){

location.reload();

}

};



document.getElementById("registerBtn").onclick=()=>{

let u=document.getElementById("loginUsername").value;

let p=document.getElementById("loginPassword").value;

if(registerAccount(u,p)){

alert("Account created");

}

};



document.getElementById("logoutBtn").onclick=logout;

});



/* -------------------------- */
/* BOOKINGS */
/* -------------------------- */

function getBookings(){

let data = localStorage.getItem("hp_bookings");

if(!data) return {};

return JSON.parse(data);

}

function saveBookings(data){

localStorage.setItem("hp_bookings",JSON.stringify(data));

}



function addBooking(date,user){

let bookings=getBookings();

if(!bookings[date]) bookings[date]=[];

if(bookings[date].includes(user)) return false;

bookings[date].push(user);

saveBookings(bookings);

return true;

}



/* -------------------------- */
/* STATUS CHECK */
/* -------------------------- */

function getDayStatus(date){

if(CONFIG.calendarDays[date]){

return CONFIG.calendarDays[date].status;

}

let bookings=getBookings();

if(bookings[date]){

if(bookings[date].length>=CONFIG.maxBookingsPerDay){

return "full";

}

return "pending";

}

return "available";

}



/* -------------------------- */
/* DATE FORMAT */
/* -------------------------- */

function formatDate(date){

let y=date.getFullYear();

let m=String(date.getMonth()+1).padStart(2,"0");

let d=String(date.getDate()).padStart(2,"0");

return `${y}-${m}-${d}`;

}



/* -------------------------- */
/* BOOKING LIMIT */
/* -------------------------- */

function isBookable(date){

let today=new Date();

let max=new Date();

max.setDate(today.getDate()+CONFIG.bookingDaysAhead);

return date>=today && date<=max;

}
