/* -------------------------- */
/* CANVAS SETUP */
/* -------------------------- */

const canvas = document.getElementById("calendarCanvas");
const ctx = canvas.getContext("2d");

let width;
let height;

function resizeCanvas(){

width = canvas.clientWidth;
height = canvas.clientHeight;

canvas.width = width;
canvas.height = height;

drawCalendar();

}

window.addEventListener("resize", resizeCanvas);



/* -------------------------- */
/* CALENDAR STATE */
/* -------------------------- */

let currentYear = new Date().getFullYear();
let selectedDay = null;

const yearDisplay = document.getElementById("yearDisplay");



/* -------------------------- */
/* COLORS */
/* -------------------------- */

const COLORS = {

available: "#1f9d55",
pending: "#ff8c00",
full: "#ff3b3b",
disabled: "#444"

};



/* -------------------------- */
/* DRAW CALENDAR */
/* -------------------------- */

function drawCalendar(){

ctx.clearRect(0,0,width,height);

yearDisplay.innerText = currentYear;

let today = new Date();

let cellWidth = width / 7;
let cellHeight = height / 6;

let dayCounter = 1;

for(let row=0; row<6; row++){

for(let col=0; col<7; col++){

let x = col * cellWidth;
let y = row * cellHeight;

let date = new Date(currentYear, today.getMonth(), dayCounter);

if(dayCounter <= 31){

let dateStr = formatDate(date);

let status = getDayStatus(dateStr);

drawCell(x,y,cellWidth,cellHeight,dayCounter,status);

}

dayCounter++;

}

}

}



/* -------------------------- */
/* DRAW CELL */
/* -------------------------- */

function drawCell(x,y,w,h,day,status){

ctx.fillStyle = COLORS[status] || COLORS.available;

ctx.globalAlpha = 0.25;

ctx.fillRect(x,y,w,h);

ctx.globalAlpha = 1;

ctx.strokeStyle = "rgba(255,255,255,0.08)";
ctx.strokeRect(x,y,w,h);


ctx.fillStyle = "white";
ctx.font = "16px Segoe UI";

ctx.fillText(day,x+10,y+22);

}



/* -------------------------- */
/* CLICK SYSTEM */
/* -------------------------- */

canvas.addEventListener("click", (event)=>{

let rect = canvas.getBoundingClientRect();

let x = event.clientX - rect.left;
let y = event.clientY - rect.top;

let cellWidth = width / 7;
let cellHeight = height / 6;

let col = Math.floor(x / cellWidth);
let row = Math.floor(y / cellHeight);

let day = row * 7 + col + 1;

let today = new Date();

let clickedDate = new Date(currentYear, today.getMonth(), day);

let dateStr = formatDate(clickedDate);

if(!isDateAllowed(clickedDate)) return;

let status = getDayStatus(dateStr);

if(status !== "available") return;

selectedDay = dateStr;

openBookingPopup();

});



/* -------------------------- */
/* YEAR CONTROLS */
/* -------------------------- */

document.getElementById("prevYear").onclick = ()=>{

currentYear--;

drawCalendar();

};

document.getElementById("nextYear").onclick = ()=>{

currentYear++;

drawCalendar();

};



/* -------------------------- */
/* INITIALIZE */
/* -------------------------- */

window.addEventListener("load", ()=>{

resizeCanvas();

});
