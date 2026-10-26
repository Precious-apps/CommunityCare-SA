import {db} from"./firebase.js";
import{
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  query,
  orderBy
}from "firebase/firestore";
import'./style.css'

document.querySelector('#app').innerHTML=`
<header class="topbar">
 <a class="brand"href="#">
  <span class="brand-icon"></span>
  <span>CommunityCare<strong>SA</strong></span>
 </a> 
 <span class="country">South Africa</span>
</header>

<main>
 <section class ="hero">
  <span class="eyebrow">OUR COMMUNITY,OUR FUTURE</span>
  <h1>A safer, greener community starts <span>with us.</span></h1>
  <p>Share local environmental concerns, find practical safety tips, and work together to care for our communities.</p>
  <div class="hero-actions">
   <a class="button primary"href="#report">Report a problem</a>
   <a class="button secondary"href="#tips">Explore safety tips<a/>
   </div>
   <div class="hero-note"> Small actions today can make a difference tomorrow.</div>
   </section>

  <section class="section"id="report">
    <div class="section-heading">
     <span class="eyebrow">MAKE YOUR VOICE HEARD</span>
     <h2>What's happening in your community?</h2>
     <p>Share an environmental concern so your community can become mote aware.</p>
    </div> 

  <form id="report-form" class="report-card">
   <lable for="category">What would you like to report?</label>
   <select id="category"required>
    <option value="">Choose a category</option>
    <option>Water shortage</option>
    <option>Flooding</option>
    <option>Illigal dumping</option>
    <option>Electricity disruption</option>
    <option>Other environmental concern</option>
   </select>

   <label for="location">Area or suburb</label>
   <input id="location" type="text" placeholder="e.g.Bophelong Vanderbijlpark" maxlength="80" required/>

   <label for="description">Describe the problem </label>
   <textarea id="description"placeholder="Tell us what is happening .."maxlength="500"rows="3"required></textarea>

    <button class="button primary submit-button" type="submit">Submit community report </button>
    <p id="form-message"class="form-message"role="status"aria-live="polite"></p>
    </form>
  </section?>

  <section class="section report-section" id="reports">
     <div class="section-heading">
      <span class="eyebrow">COMMUNITY VOICES</span>
      <h2>Recent community reports</h2>
      <p>Reports shared on this demo appear below on this device.</p>
    </div>
    <div id="report-list" class="report-list"></div>
    <div class="insight-card">
     <span class="insight-icon"></span
     <div>
      <h3>Community insights</h3>
      <p id="insights">As reports are shared, we'll show which concerns are appearing most often.</p>
      </div>
    </div>
  </section>
  
  <section class="section tips-section"id="tips">
   <div class="section-heading">
    <span class="eyebrow">STAY INFORMED</span>
    <h2>Simple tips to stay safe</h2>
    <p>Practical reminders for everyday environmental challenges.</p>
   </div>
   <div class="tips-grid">
    <article class="tip-card">
    <span class="tip-icon"></span>
    <h3>Heavy rain and flooding</h3>
    <p>Avoid walking or driving through floodwater. Move to safer,higher ground if water is rising.</p>
    </article>
    <article class="tip-card">
     <span class="tip-icon"></span>
     <h3>Water shortages</h3>
     <p>Store clean water in covered containers and follow trusted local water-safety guidance.</p>
    </article>
    <article class="tip-card">
     <span class="tip-icon"></span>
     <h3>Cleaner neighbourhoods</h3>
     <P>Keep rubbish out of drains and use designated waste collection points where available.</P.
    </article>
   </div>
   <p class="disclaimer">CommunityCare SA is a community prototype. Reports are user-submitted and not independently verified. For urgent danger,contact the relevant emergency service or local authority.</p>
  </section>
</main>

<footer>
 <a class="brand footer-brand"href="#">CommunityCare SA</a>
 <p>Working together for safer,greener communities.</p>
 <small>Community information prototype.South Africa</small>
</footer>

`

const form= document.querySelector('#report-form');
const reportList= document.querySelector('#report-list');
const formMessage= document.querySelector('#form-message');
const insights= document.querySelector('#insights')

let reports= [];

try{
  const savedReports=
  JSON.parse(localStorage.getItem('communitycare-reports')||'[]');
   if(Array.isArray(savedReports)) reports= savedReports
}catch{
  reports=[]
}

function renderReports(){
  reportList.replaceChildren()

  if (reports.length ===0){
    const empty= document.createElement('p')
    empty.className= 'empty-state'
    empty.textContent='No reports yet.Be the first to share a community concern.'
    reportList.append(empty)
    insights.textContent='No report have been submitted yet.'
    return
  }

  reports.slice().reverse().forEach((report)=>{
    const card= document.createElement('article')
    card.className='community-report'

    const title= document.createElement('h3')
    title.textContent= report.category

    const area= document.createElement('p')
    area.className='report-area'
    area.textContent=`${report.location}`

    const description= document.createElement('p')
    description.textContent= report.description

    const note= document.createElement('small')
    note.textContent= `Community-submitted. ${report.date}`

    card.append(title,area,description,note)
    reportList.append(card)
  })

  const counts={}
  reports.forEach((report)=>{
    counts[report.category]=(counts[report.category]||0)+1
  })
  const mostCommon= Object.entries(counts).sort((a,b)=> b[1]-a[1])[0]
  insights.textContent= `${reports,length} report(s)shared. Most frequently reported category:${mostCommon[0]}(${mostCommon[1]}). These are community-submitted reports, not verified incidents.`
}

form.addEventListener('submit',async (event) =>{
  event.preventDefault();

  const category= document.querySelector('#category').value;
  const location= document.querySelector('#location').value.trim();
  const description= document.querySelector('#description').value.trim();

  if(!category||!location||!description){
    formMessage.textContent='Please complete all fields.';
    return;
  }

  const report={
    category,
    location,
    description,
    date:new Date().toLocaleDateString('en-ZA')
  };

  try{
    await addDoc(collection(db,"reports"),{
      category,
      location,
      description,
      status:"pending",
      createdAt:serverTimestamp()
    });
    
    reports.push(report);
 
    try{
    localStorage.setItem('communitycare-reports',
      JSON.stringify(reports));
  }catch (storageError){
    console.warm("Report saved online,but not on this device",storageError);
  }

  renderReports()
  form.reset()
  formMessage.textContent="Success! Your community report had been saved online";
  document.querySelector("#reports").scrollIntoView({behavior:'smooth'});

}catch(error){
  console.error("Could not save report to Firebase",error)
  formMessage.textContent="We couldnt save your report online.Please try again";
}
});

renderReports()

async function loadReportsdFromFirebase(){
try{
  const reportsQuery= query(
    collection(db,"reports"),
    orderBy("createdAt","desc")
  );

  const snapshot= await getDocs(reportsQuery);

  reports = snapshot.docs.map((document)=>{
    const data= document.data();

    return{
      category:data.category,
      location:data.location,
      description:data.description,
      date:data.createdAt
      ?data.createdAt.toDate().toLocaleDateString("en-ZA")
      :""
    };
  });
  renderReports();
}catch (error){
  console.error("Could not load reports from Firebase:",error);
 }
}

loadReportsdFromFirebase();
