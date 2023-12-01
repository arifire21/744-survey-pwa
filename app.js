//form id's
const form = document.getElementsByTagName('form')[0];
const pastLogContainer = document.getElementById("past-logs");

// required inputs -- only checkboxes, single radio values grabbed directly in method itself
const teamNumberInput = document.getElementById('team-number');
const startPositionsInput = document.getElementsByName('start-pos');
const scoreHeightsInput = document.getElementsByName('score-height');
const nameInput = document.getElementById('name');

//optional inputs
const feedbackContainer = document.getElementById('feedback-container');
const feedbackInput = document.getElementById('feedback');

//for the conditional feedback textarea
const investmentYesInput = document.getElementsByName('final-inves')[0];
const investmentNoInput = document.getElementsByName('final-inves')[1];

//apparently this doesnt work on IOS (which is the current intended platform so)
//behavior for handling install stuff
//pre-install prep
// let installPrompt = null;
// const installParagraph = document.getElementById('#install-prompt');
// const installButton = document.getElementById('#install');

// window.addEventListener("beforeinstallprompt", (event) => {
//   //dont let browser display native toolbar ui
//   event.preventDefault();
//   //reference for later
//   installPrompt = event;
//   installButton.removeAttribute("hidden");
//   installParagraph.style.display = "block";
// });

// //actual install trigger
// installButton.addEventListener("click", async () => {
//   if (!installPrompt) {
//     return;
//   }
//   const result = await installPrompt.prompt();
//   console.log(`Install prompt was: ${result.outcome}`);
//   //only once promise allowed per instance, so reset
//   disableInAppInstallPrompt();
// });

//browser might still offer even if installed
window.addEventListener("appinstalled", () => {
  disableInAppInstallPrompt();
});

function disableInAppInstallPrompt() {
  installPrompt = null;
  installButton.setAttribute("hidden", "");
}

//and now back to our regularly scheduled formstuffs
var investment = ''
investmentYesInput.addEventListener('click', function(){
  feedbackContainer.style.display = 'block';
  // investment = investmentYesInput.value;
})

investmentNoInput.addEventListener('click', function(){
  feedbackContainer.style.display = 'none';
  feedbackInput.value = '';
  // investment = investmentNoInput.value;
})

let timestamp = '';

// Listen to form submissions.
form.addEventListener("submit", (event) => {
  // Prevent the form from submitting to the server since everything is client-side.
  event.preventDefault();

  // Get values
  const teamNumber = teamNumberInput.value;
  const drivetrain = document.querySelector('input[name="drivetrain"]:checked').value;
  const vision = document.querySelector('input[name="vision"]:checked').value;
  const climbHeight = document.querySelector('input[name="climb-height"]:checked').value;
  const gamePieces = document.querySelector('input[name="game-pieces"]:checked').value;
  const pickup = document.querySelector('input[name="pickup"]:checked').value;
  const name = nameInput.value;
  const investment = document.querySelector('input[name="final-inves"]:checked').value;
  let startPositions = ''
  let scoreHeights = ''

  startPositionsInput.forEach(position => {
    if(position.checked && startPositions === ''){
      startPositions = position.value;
    } else if(position.checked){
      startPositions = startPositions.concat(`, ${position.value}`)
    }
  });
  
  scoreHeightsInput.forEach(height => {
    if(height.checked && scoreHeights === ''){
      scoreHeights = height.value;
    } else if(height.checked){
      scoreHeights = scoreHeights.concat(`, ${height.value}`)
    }
  });


  if (checkRequired(teamNumber, drivetrain, startPositions, vision, scoreHeights, climbHeight, gamePieces, pickup, name, investment)) {
    // If req fields are empty, exit.
    return;
  } else {
    //generate timestamp that will be logged/displayed
    timestamp = new Date(Date.now()).toLocaleString('en-US', {timeZone: 'America/New_York'})
  }

  // Store in our client-side storage.
  storeNewLog(timestamp, teamNumber, drivetrain, vision, scoreHeights, climbHeight, gamePieces, pickup, name, investment);

  // Refresh the UI.
  renderPastLogs();

  // Reset the form.
  form.reset();
});

function checkRequired(teamNumber, drivetrain, startPositions, vision, scoreHeights, climbHeight, gamePieces, pickup, name, investment) {
    if (!teamNumber || !drivetrain || !startPositions || !vision || !climbHeight || !scoreHeights || !gamePieces || !pickup || !name || !investment) {

      // To make the validation robust we could:
      // 1. add error messaging based on error type
      // 2. Alert assistive technology users about the error
      // 3. move focus to the error location
      // instead, for now, we clear the fields if any are missing
      console.log(`#: ${teamNumber}, DT: ${drivetrain}, start: ${startPositions}, vis: ${vision}, CH: ${climbHeight}, SH: ${scoreHeights}, pieces: ${gamePieces}, pickup: ${pickup}, name: ${name}, investment: ${investment}`)
      console.log('invalid elements')
      // form.reset();
      return true;
    }
    // else
    console.log(`#: ${teamNumber}, DT: ${drivetrain}, start: ${startPositions}, vis: ${vision}, CH: ${climbHeight}, SH: ${scoreHeights}, pieces: ${gamePieces}, pickup: ${pickup}, name: ${name}, investment: ${investment}`)
    return false;
}

function checkOptional(){
  //todo. meant for form validation/sanitizing of textarea
}
  
  // Add the storage key as an app-wide constant
const STORAGE_KEY = "robotics-pwa-pit";

function storeNewLog(timestamp, teamNumber, drivetrain, startPositions, vision, climbHeight, scoreHeights, gamePieces, pickup, name, investment) {
  // Get data from storage.
  const logs = getAllStoredLogs();

  // Add the new log object to the end of the array of log objects.
  logs.push({timestamp, teamNumber, drivetrain, startPositions, vision, climbHeight, scoreHeights, gamePieces, pickup, name, investment });

  // Sort the array so that logs are ordered by timestamp for now, may change to team number
  logs.sort((a, b) => {
    return new Date(b.timestamp) - new Date(a.timestamp);
  });

  // Store the updated array back in the storage.
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
}

function getAllStoredLogs() {
  // Get the string of log data from localStorage
  const data = window.localStorage.getItem(STORAGE_KEY);

  // If no logs were stored, default to an empty array
  // otherwise, return the stored data as parsed JSON
  const logs = data ? JSON.parse(data) : [];

  return logs;
}

function renderPastLogs() {
    // get the parsed string of logs, or an empty array.
    const logs = getAllStoredLogs();
  
    // exit if there are no logs
    if (logs.length === 0) {
      return;
    }
  
    // Clear the list of past logs, since we're going to re-render it.
    pastLogContainer.innerHTML = "";
  
    const pastLogHeader = document.createElement("h2");
    pastLogHeader.textContent = "Past Logs";
  
    const pastLogList = document.createElement("ul");
  
    // Loop over all logs and render them.
    logs.forEach((log) => {
      const logEl = document.createElement("li");
      logEl.textContent = `[${log.timestamp}] Team: ${log.teamNumber},  DT choice: ${log.drivetrain}, Preferred start position(s): ${log.startPositions}, Vision: ${log.vision}, Highest climb height: ${log.climbHeight}, Scoring height(s): ${log.scoreHeights}, Game piece(s): ${log.gamePieces}, Pickup location(s): ${log.pickup}, name: ${log.name}, Is surveyor invested in ${log.teamNumber}?: ${log.investment}`;
      pastLogList.appendChild(logEl);
    });
  
    pastLogContainer.appendChild(pastLogHeader);
    pastLogContainer.appendChild(pastLogList);
  }
  