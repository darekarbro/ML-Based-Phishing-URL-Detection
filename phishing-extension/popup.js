document.getElementById("checkBtn").addEventListener("click", function(){

let resultBox = document.getElementById("resultBox");

resultBox.innerHTML="Scanning...";
resultBox.className="loading";

chrome.tabs.query(
{active:true,currentWindow:true},

function(tabs){

let currentURL=tabs[0].url;

fetch("http://127.0.0.1:8000/predict",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({
url:currentURL,
mode:"fast"
})

})

.then(response=>response.json())

.then(data=>{

if(data.probability>50){

resultBox.innerHTML=
"⚠ High Phishing Risk<br>"+data.probability+"% probability";

resultBox.className="danger";
}

else{

resultBox.innerHTML=
"✅ Website Appears Safe<br>"+data.probability+"% risk";

resultBox.className="safe";
}

})

.catch(error=>{

resultBox.innerHTML=
"API connection failed";

});

});

});