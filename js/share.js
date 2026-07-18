// ==========================================
// RoastVerse Premium Share System v6
// ==========================================

export function initShare() {

    const shareBtn = document.getElementById("shareBtn");

    if (!shareBtn) return;

    shareBtn.addEventListener("click", createShareCard);

}

let isSharing = false;


// ==========================================
// Create Share Card
// ==========================================

async function createShareCard() {

    if (isSharing) return;

    isSharing = true;

    try {

        fillCard();

        await captureCard();

    }

    catch (err) {

        console.error(err);

        showToast("Failed to generate share card.");

    }

    finally {

        isSharing = false;

    }

}


// ==========================================
// Fill Share Card
// ==========================================

function fillCard() {

    const resultPhoto = document.getElementById("resultPhoto");
    const resultName = document.getElementById("resultName");
    const roastText = document.getElementById("roastText");
    const roastPercent = document.getElementById("roastPercent");

    document.getElementById("sharePhoto").src =
        resultPhoto.src;

    document.getElementById("shareName").textContent =
        resultName.textContent || "Friend";

    document.getElementById("shareRoast").textContent =
        roastText.textContent;

    const score = parseInt(roastPercent.textContent) || 0;

    animateScore(score);

    updateBadge(score);

}


// ==========================================
// Badge
// ==========================================

function updateBadge(score){

    const badge=document.getElementById("shareBadge");

    if(score<20){

        badge.textContent="😊 TOO WHOLESOME";

    }

    else if(score<40){

        badge.textContent="😅 LIGHT ROAST";

    }

    else if(score<60){

        badge.textContent="😂 COMEDY GOLD";

    }

    else if(score<80){

        badge.textContent="🔥 ABSOLUTE SAVAGE";

    }

    else{

        badge.textContent="☠️ CERTIFIED DESTROYER";

    }

}


// ==========================================
// Score Animation
// ==========================================

function animateScore(target){

    const score=document.getElementById("shareScore");

    let value=0;

    score.textContent="0%";

    const timer=setInterval(()=>{

        value++;

        score.textContent=value+"%";

        if(value>=target){

            clearInterval(timer);

        }

    },12);

}


// ==========================================
// Capture
// ==========================================

async function captureCard(){

    const card=document.getElementById("shareCard");

    card.classList.remove("hidden");

    await new Promise(resolve=>setTimeout(resolve,1000));

    const canvas=await html2canvas(card,{

        scale:3,

        useCORS:true,

        backgroundColor:null

    });

    card.classList.add("hidden");

    canvas.toBlob(blob=>{

        if(blob){

            download(blob);

        }

    });

}


// ==========================================
// Download
// ==========================================

function download(blob){

    const url=URL.createObjectURL(blob);

    const a=document.createElement("a");

    a.href=url;

    a.download="RoastVerse.png";

    a.click();

    URL.revokeObjectURL(url);

    showToast("🔥 Share card saved!");

}


// ==========================================
// Toast
// ==========================================

function showToast(message){

    const toast=document.getElementById("toast");

    const text=document.getElementById("toastMessage");

    if(!toast){

        alert(message);

        return;

    }

    text.textContent=message;

    toast.classList.add("show");

    setTimeout(()=>{

        toast.classList.remove("show");

    },2500);

}