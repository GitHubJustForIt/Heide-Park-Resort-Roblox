/* -------------------------- */
/* POPUP ELEMENTS */
/* -------------------------- */

const popup = document.getElementById("bookingPopup");
const closePopupBtn = document.getElementById("closePopup");

const form = document.getElementById("bookingForm");

const usernameInput = document.getElementById("usernameInput");
const platformSelect = document.getElementById("platformSelect");
const termsCheck = document.getElementById("termsCheck");

const confirmBtn = document.getElementById("confirmBooking");


/* -------------------------- */
/* OPEN POPUP */
/* -------------------------- */

function openBookingPopup(){

popup.style.display = "flex";

usernameInput.value = "";

termsCheck.checked = false;

}


/* -------------------------- */
/* CLOSE POPUP */
/* -------------------------- */

closePopupBtn.onclick = ()=>{

popup.style.display = "none";

};


/* -------------------------- */
/* BOOKING SUBMIT */
/* -------------------------- */

form.addEventListener("submit", async (e)=>{

e.preventDefault();

let localUser = getLocalUser();

if(!localUser){

alert("Please login first");

return;

}

let username = usernameInput.value.trim();

if(username.length < 2){

alert("Enter a valid username");

return;

}

if(!termsCheck.checked){

alert("You must accept the terms");

return;

}

confirmBtn.innerHTML =
'<i class="fa-solid fa-spinner fa-spin"></i> Processing';

confirmBtn.disabled = true;



/* -------------------------- */
/* SAVE BOOKING */
/* -------------------------- */

addBooking(selectedDay, localUser);



/* -------------------------- */
/* SEND WEBHOOK */
/* -------------------------- */

let payload = {

embeds:[{

title:"New Heide Park Booking",

color:16753920,

fields:[

{
name:"Day",
value:selectedDay,
inline:true
},

{
name:"Account",
value:localUser,
inline:true
},

{
name:"Contact Platform",
value:platformSelect.value,
inline:true
},

{
name:"Contact Username",
value:username,
inline:true
}

]

}]

};



try{

await fetch(SETTINGS.webhookURL,{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify(payload)
});

}catch(err){

console.log("Webhook error",err);

}



/* -------------------------- */
/* FINISH */
/* -------------------------- */

setTimeout(()=>{

popup.style.display = "none";

confirmBtn.disabled = false;

confirmBtn.innerHTML =
'<i class="fa-solid fa-check"></i> Confirm Booking';

drawCalendar();

},1200);

});



/* -------------------------- */
/* PREVENT DOUBLE BOOKINGS */
/* -------------------------- */

function userAlreadyBooked(date){

let bookings = getBookings();

let user = getLocalUser();

if(!bookings[date]) return false;

return bookings[date].includes(user);

}



/* -------------------------- */
/* GLOBAL CLICK CLOSE */
/* -------------------------- */

window.onclick = function(event){

if(event.target === popup){

popup.style.display = "none";

}

};
