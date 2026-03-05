/* -------------------------- */
/* CALENDAR STATE */
/* -------------------------- */

const canvas = document.getElementById("calendarCanvas");
const ctx = canvas.getContext("2d");

let currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();

let hoveredDay = null;
let selectedDate = null;


/* -------------------------- */
/* COLORS */
/* -------------------------- */

const STATUS_COLORS = {

available:"#1db954",
pending:"#ff8c00",
full:"#ff3b3b",
disabled:"#444"

};


/* -------------------------- */
/* CANVAS RESIZE */
/* -------------------------- */

function resizeCalendar(){

canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

drawCalendar();

}

window.addEventListener("resize", resizeCalendar);



/* -------------------------- */
/* MONTH TITLE */
/* -------------------------- */

function updateMonthTitle(){

const months = [
"January","February","March","April","May","June",
"July","August","September","October","November","December"
];

document.getElementById("monthTitle").innerText =
months[currentMonth] + " " + currentYear;

}



/* -------------------------- */
/* DRAW CALENDAR */
/* -------------------------- */

function drawCalendar(){

ctx.clearRect(0,0,canvas.width,canvas.height);

updateMonthTitle();

let firstDay = new Date(currentYear,currentMonth,1).getDay();
let daysInMonth = new Date(currentYear,currentMonth+1,0).getDate();

if(firstDay === 0) firstDay = 7;

let cellWidth = canvas.width / 7;
let cellHeight = canvas.height / 7;

drawWeekdays(cellWidth);

let day = 1;

for(let row=1; row<=6; row++){

for(let col=1; col<=7; col++){

let x = (col-1)*cellWidth;
let y = row*cellHeight;

if(row===1 && col<firstDay){

continue;

}

if(day>daysInMonth) break;

drawDayCell(day,x,y,cellWidth,cellHeight);

day++;

}

}

}



/* -------------------------- */
/* WEEKDAY HEADER */
/* -------------------------- */

function drawWeekdays(w){

const names = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

ctx.font="14px Segoe UI";
ctx.fillStyle="#aaa";

for(let i=0;i<7;i++){

ctx.fillText(names[i], i*w + 10 , 20);

}

}



/* -------------------------- */
/* DAY CELL */
/* -------------------------- */

function drawDayCell(day,x,y,w,h){

let date = new Date(currentYear,currentMonth,day);

let dateStr = formatDate(date);

let status = getDayStatus(dateStr);

let color = STATUS_COLORS[status] || STATUS_COLORS.available;


/* background */

ctx.globalAlpha = 0.25;

ctx.fillStyle = color;

ctx.fillRect(x,y,w,h);

ctx.globalAlpha = 1;


/* border */

ctx.strokeStyle="rgba(255,255,255,0.05)";
ctx.strokeRect(x,y,w,h);


/* hover effect */

if(hoveredDay === day){

ctx.strokeStyle="#ff8c00";
ctx.lineWidth=2;

ctx.strokeRect(x+2,y+2,w-4,h-4);

}


/* text */

ctx.fillStyle="white";
ctx.font="16px Segoe UI";

ctx.fillText(day,x+10,y+22);


/* lock icon */

if(!isBookable(date)){

ctx.fillStyle="#888";

ctx.font="12px Segoe UI";

ctx.fillText("Locked",x+10,y+40);

}

}



/* -------------------------- */
/* HOVER SYSTEM */
/* -------------------------- */

canvas.addEventListener("mousemove",(e)=>{

let rect = canvas.getBoundingClientRect();

let x = e.clientX - rect.left;
let y = e.clientY - rect.top;

let cellWidth = canvas.width / 7;
let cellHeight = canvas.height / 7;

let col = Math.floor(x / cellWidth);
let row = Math.floor(y / cellHeight) - 1;

let day = row * 7 + col + 1;

hoveredDay = day;

drawCalendar();

});



/* -------------------------- */
/* CLICK SYSTEM */
/* -------------------------- */

canvas.addEventListener("click",(e)=>{

let rect = canvas.getBoundingClientRect();

let x = e.clientX - rect.left;
let y = e.clientY - rect.top;

let cellWidth = canvas.width / 7;
let cellHeight = canvas.height / 7;

let col = Math.floor(x / cellWidth);
let row = Math.floor(y / cellHeight) - 1;

let day = row * 7 + col + 1;

let date = new Date(currentYear,currentMonth,day);

let dateStr = formatDate(date);


if(!isBookable(date)) return;

let status = getDayStatus(dateStr);

if(status !== "available") return;

selectedDate = dateStr;

openBookingPopup();

});



/* -------------------------- */
/* MONTH NAVIGATION */
/* -------------------------- */

document.getElementById("prevMonth").onclick = ()=>{

currentMonth--;

if(currentMonth < 0){

currentMonth = 11;
currentYear--;

}

drawCalendar();

};


document.getElementById("nextMonth").onclick = ()=>{

currentMonth++;

if(currentMonth > 11){

currentMonth = 0;
currentYear++;

}

drawCalendar();

};



/* -------------------------- */
/* INIT */
/* -------------------------- */

window.addEventListener("load",()=>{

resizeCalendar();

});
