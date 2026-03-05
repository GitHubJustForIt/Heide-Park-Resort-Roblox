/* -------------------------- */
/* POPUP ELEMENTE */
/* -------------------------- */

const popup = document.getElementById("bookingPopup");
const confirmBtn = document.getElementById("confirmBooking");
const cancelBtn = document.getElementById("cancelBooking");

const contactInput = document.getElementById("contactName");
const platformSelect = document.getElementById("contactPlatform");
const termsCheck = document.getElementById("termsCheck");


/* -------------------------- */
/* OPEN / CLOSE POPUP */
/* -------------------------- */

function openBookingPopup(){

popup.style.display="flex";

contactInput.value="";
platformSelect.value="Discord";
termsCheck.checked=false;

}

cancelBtn.onclick = ()=> popup.style.display="none";

window.onclick = (e)=>{
if(e.target === popup) popup.style.display="none";
};


/* -------------------------- */
/* BOOKING SUBMIT */
/* -------------------------- */

confirmBtn.onclick = async ()=>{

let user = getUser();

if(!user){
alert("Login required!");
return;
}

let contact = contactInput.value.trim();
let platform = platformSelect.value;

if(contact.length<2){
alert("Enter a valid contact username");
return;
}

if(!termsCheck.checked){
alert("You must accept the terms");
return;
}

if(!selectedDate){
alert("No date selected");
return;
}

if(!isBookable(new Date(selectedDate))){
alert("Date not bookable");
return;
}

if(!addBooking(selectedDate,user)){
alert("You already booked this day");
return;
}


/* -------------------------- */
/* LOAD INDICATOR */
confirmBtn.innerHTML='<i class="fa-solid fa-spinner fa-spin"></i> Booking...';
confirmBtn.disabled=true;


/* -------------------------- */
/* SEND DISCORD WEBHOOK */

let payload={
embeds:[{
title:"New Heide Park Booking",
color:16753920,
fields:[
{name:"Date",value:selectedDate,inline:true},
{name:"User",value:user,inline:true},
{name:"Contact Platform",value:platform,inline:true},
{name:"Contact Username",value:contact,inline:true}
]
}]
};

try{
await fetch(CONFIG.webhookURL,{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify(payload)
});
}catch(err){
console.error("Webhook error",err);
}


/* -------------------------- */
/* FINISH */
setTimeout(()=>{

confirmBtn.innerHTML='<i class="fa-solid fa-check"></i> Confirm Booking';
confirmBtn.disabled=false;

popup.style.display="none";
selectedDate=null;

drawCalendar();

alert("Booking successful!");

},1200);

};
