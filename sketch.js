// Bakeoff #3 - EscriWta em Smartwatches
// IPM 2020-21, Semestre 2
// Entrega: até dia 4 de Junho às 23h59 através do Fenix
// Bake-off: durante os laboratórios da semana de 31 de Maio

// p5.js reference: https://p5js.org/reference/

// Database (CHANGE THESE!)
const GROUP_NUMBER = 38;      // add your group number here as an integer (e.g., 2, 3)
const BAKE_OFF_DAY = true;  // set to 'true' before sharing during the simulation and bake-off days
<<<<<<< HEAD
const VERSION = "1-01-03";
=======
const VERSION = "1-01-02";
>>>>>>> b79b848350e9623cb6ecb295792b728bd8ac36a3

let PPI, PPCM;                 // pixel density (DO NOT CHANGE!)
let second_attempt_button;     // button that starts the second attempt (DO NOT CHANGE!)

// Finger parameters (DO NOT CHANGE!)
let finger_img;                // holds our finger image that simules the 'fat finger' problem
let FINGER_SIZE, FINGER_OFFSET;// finger size and cursor offsett (calculated after entering fullscreen)

// Arm parameters (DO NOT CHANGE!)
let arm_img;                   // holds our arm/watch image
let ARM_LENGTH, ARM_HEIGHT;  // arm size and position (calculated after entering fullscreen)

// Study control parameters (DO NOT CHANGE!)
let draw_finger_arm = false;  // used to control what to show in draw()
let phrases = [];     // contains all 501 phrases that can be asked of the user
let current_trial = 0;      // the current trial out of 2 phrases (indexes into phrases array above)
let attempt = 0       // the current attempt out of 2 (to account for practice)
let target_phrase = "";     // the current target phrase
let entered = new Array(2); // array to store the result of the two trials (i.e., the two phrases entered in one attempt)
let CPS = 0;      // add the characters per second (CPS) here (once for every attempt)
let total_characters = 0;

// Metrics
let attempt_start_time, attempt_end_time; // attemps start and end times (includes both trials)
let trial_end_time;            // the timestamp of when the lastest trial was completed
let letters_entered = 0;      // running number of letters entered (for final WPM computation)
let letters_expected = 0;      // running number of letters expected (from target phrase)
let errors = 0;      // a running total of the number of errors (when hitting 'ACCEPT')
let database;                  // Firebase DB

// 2D Keyboard UI
let leftArrow, rightArrow;     // holds the left and right UI images for our basic 2D keyboard   
let ARROW_SIZE;                // UI button size
let char_index = 0;

//cursor
let showCursor = false;

//sendInput
let space = false;
let backspace = false;
let guess1, guess2 = false;
let onKey = false;

//hoveEffect
let xHover = 0;
let yHover = 0;
let wHover = 0;
let hHover = 0;

function parseVersion() {
  let v = [];
  let aux = "";
  for (let i = 0; i < VERSION.length; i++) {
    if (VERSION[i] == '-') {
      v.push(aux);
      aux = "";
    } else {
      aux += VERSION[i];
    }
  }
  v.push(aux);
  return v;
}

// Runs once before the setup() and loads our data (images, phrases)
function preload() {
  // Loads simulation images (arm, finger) -- DO NOT CHANGE!
  arm = loadImage("data/arm_watch.png");
  fingerOcclusion = loadImage("data/finger.png");

  // Loads the target phrases (DO NOT CHANGE!)
  phrases = loadStrings("data/phrases.txt");

}

// Runs once at the start
function setup() {
  createCanvas(700, 500);   // window size in px before we go into fullScreen()
  frameRate(60);            // frame rate (DO NOT CHANGE!)

  // DO NOT CHANGE THESE!
  shuffle(phrases, true);   // randomize the order of the phrases list (N=501)
  target_phrase = phrases[current_trial];
  total_characters += target_phrase.length;
  drawUserIDScreen();       // draws the user input screen (student number and display size)
}

function draw() {
  if (draw_finger_arm) {
    background(255);           // clear background
    noCursor();                // hides the cursor to simulate the 'fat finger'

    drawArmAndWatch();         // draws arm and watch background
    writeTargetAndEntered();   // writes the target and entered phrases above the watch
    drawACCEPT();              // draws the 'ACCEPT' button that submits a phrase and completes a trial

    // Draws the non-interactive screen area (4x1cm) -- DO NOT CHANGE SIZE!
    noStroke();
    fill(210);
    rect(width / 2 - 2.0 * PPCM, height / 2 - 2.0 * PPCM, 4.0 * PPCM, 1.0 * PPCM);
    fill(255);
    stroke(0);
    circle(width / 2, height / 2 - 1.75 * PPCM, 0.5 * PPCM);
    textAlign(CENTER);
    textFont("Arial", 0.30 * PPCM);
    fill(0);
    text("" + current_letter, width / 2, height / 2 - 1.6 * PPCM);

    // Draws the touch input area (4x3cm) -- DO NOT CHANGE SIZE!
    noStroke();
    fill(210)
    rect(width / 2 - 2.0 * PPCM, height / 2 - 1.0 * PPCM, 4.0 * PPCM, 3.0 * PPCM);

    draw2DKeyboard();

    drawFatFinger();

    displayCursor();

    if (showCursor) {
      drawCursor();// draws the finger that simulates the 'fat finger' problem
    }

  }
}

function mouseReleased() {
  if (onKey) {
    if (guess1) {
      UpdateCurrentlyTyped(current_guess);
      guess1 = false;
    }

    else if (guess2) {
      UpdateCurrentlyTyped(current_guess2);
      guess2 = false;

    }

    else if (backspace) {
      BackSpaceCurrentWord();
      backspace = false;

    }

    else if (space) {
      //TODO AddLetterCurrentWord(" ")
      AddLetterCurrentlyTyped(" ");
      ResetCurrentWord();
      space = false;

    }
    else {
      AddLetterCurrentWord(current_letter);

    }
    onKey = false;
  }
}

function calcCPS(attempt_duration) {
  return total_characters / attempt_duration;
}

function draw2DKeyboard() {

  keysKeyboard();
  lettersKeyboard();

}

// Evoked when the mouse button was pressed
function mousePressed() {
  // Only look for mouse presses during the actual test
  if (draw_finger_arm) {

    // Check if mouse click happened within 'ACCEPT' 
    // (i.e., submits a phrase and completes a trial)
    if (mouseClickWithin(width / 2 - 2 * PPCM, height / 2 - 5.1 * PPCM, 4.0 * PPCM, 2.0 * PPCM)) {
      DeliverCurrentlyTyped();
      ResetCurrentWord();
      // Saves metrics for the current trial
      letters_expected += target_phrase.trim().length;
      letters_entered += currently_typed.trim().length;
      errors += computeLevenshteinDistance(currently_typed.trim(), target_phrase.trim());
      entered[current_trial] = currently_typed;
      trial_end_time = millis();

      current_trial++;

      // Check if the user has one more trial/phrase to go
      if (current_trial < 2) {
        // Prepares for new trial
        ResetCurrentlyTyped()
        target_phrase = phrases[current_trial];
        total_characters += target_phrase.length;
      }
      else {
        // The user has completed both phrases for one attempt
        draw_finger_arm = false;
        attempt_end_time = millis();

        printAndSavePerformance();        // prints the user's results on-screen and sends these to the DB
        attempt++;

        // Check if the user is about to start their second attempt
        if (attempt < 2) {
          second_attempt_button = createButton('START 2ND ATTEMPT');
          second_attempt_button.mouseReleased(startSecondAttempt);
          second_attempt_button.position(width / 2 - second_attempt_button.size().width / 2, height / 2 + 200);
        }
      }
    }
  }
}

// Resets variables for second attempt
function startSecondAttempt() {
  // Re-randomize the trial order (DO NOT CHANG THESE!)
  shuffle(phrases, true);
  current_trial = 0;
  target_phrase = phrases[current_trial];
  total_characters += target_phrase.length;
  // Resets performance variables (DO NOT CHANG THESE!)
  letters_expected = 0;
  letters_entered = 0;
  errors = 0;
  ResetCurrentlyTyped();
  ResetCurrentWord();
  CPS = 0;

  SetCurrentLetter('a')
  ResetCurrentWord()

  // Show the watch and keyboard again
  second_attempt_button.remove();
  draw_finger_arm = true;
  attempt_start_time = millis();
}

// Print and save results at the end of 2 trials
function printAndSavePerformance() {
  // DO NOT CHANGE THESE
  let attempt_duration = (attempt_end_time - attempt_start_time) / 60000;          // 60K is number of milliseconds in minute
  let wpm = (letters_entered / 5.0) / attempt_duration;
  let freebie_errors = letters_expected * 0.05;                                  // no penalty if errors are under 5% of chars
  let penalty = max(0, (errors - freebie_errors) / attempt_duration);
  let wpm_w_penalty = max((wpm - penalty), 0);                                   // minus because higher WPM is better: NET WPM
  let timestamp = day() + "/" + month() + "/" + year() + "  " + hour() + ":" + minute() + ":" + second();

  CPS = calcCPS(attempt_duration * 60);
  total_characters = 0;

  background(color(0, 0, 0));    // clears screen
  cursor();                    // shows the cursor again

  textFont("Arial", 16);       // sets the font to Arial size 16
  fill(color(255, 255, 255));    //set text fill color to white
  text(timestamp, 100, 20);    // display time on screen 

  text("Finished attempt " + (attempt + 1) + " out of 2!", width / 2, height / 2);

  // For each trial/phrase
  let h = 20;
  for (i = 0; i < 2; i++, h += 40) {
    text("Target phrase " + (i + 1) + ": " + phrases[i], width / 2, height / 2 + h);
    text("User typed " + (i + 1) + ": " + entered[i], width / 2, height / 2 + h + 20);
  }

  text("Raw WPM: " + wpm.toFixed(2), width / 2, height / 2 + h + 20);
  text("Freebie errors: " + freebie_errors.toFixed(2), width / 2, height / 2 + h + 40);
  text("Penalty: " + penalty.toFixed(2), width / 2, height / 2 + h + 60);
  text("WPM with penalty: " + wpm_w_penalty.toFixed(2), width / 2, height / 2 + h + 80);
  text("CPS: " + CPS.toFixed(2), width / 2, height / 2 + h + 100);
  // Saves results (DO NOT CHANGE!)
  let attempt_data =
  {
    project_from: GROUP_NUMBER,
    assessed_by: student_ID,
    attempt_completed_by: timestamp,
    attempt: attempt,
    attempt_duration: attempt_duration,
    raw_wpm: wpm,
    freebie_errors: freebie_errors,
    penalty: penalty,
    wpm_w_penalty: wpm_w_penalty,
    cps: CPS
  }

  // Send data to DB (DO NOT CHANGE!)
  if (BAKE_OFF_DAY) {
    // Access the Firebase DB
    if (attempt === 0) {
      firebase.initializeApp(firebaseConfig);
      database = firebase.database();
    }

    // Add user performance results
    let db_ref = database.ref('G' + GROUP_NUMBER);
    db_ref.push(attempt_data);
  }

  // Our database
  let ourAttempt_data = {
    version: VERSION,
    assessed_by: student_ID,
    attempt_completed_by: timestamp,
    attempt: attempt,
    attempt_duration: attempt_duration,
    raw_wpm: wpm,
    freebie_errors: freebie_errors,
    penalty: penalty,
    wpm_w_penalty: wpm_w_penalty,
    cps: CPS
  }

  if (attempt === 0) {
    firebase.initializeApp(myFirebaseConfig, "myapp");

    ourDatabase = firebase.app("myapp").database();
  }
  if (student_ID != 1111) {
    let aux = ""
    let v = parseVersion();

    for (let i = 0; i < v.length; i++)
      aux += v[i] + "/";
    let my_ref = ourDatabase.ref("v" + aux);
    my_ref.push(ourAttempt_data);
  }
}

// Is invoked when the canvas is resized (e.g., when we go fullscreen)
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  let display = new Display({ diagonal: display_size }, window.screen);

  // DO NO CHANGE THESE!
  PPI = display.ppi;                        // calculates pixels per inch
  PPCM = PPI / 2.54;                         // calculates pixels per cm
  FINGER_SIZE = (int)(11 * PPCM);
  FINGER_OFFSET = (int)(0.8 * PPCM)
  ARM_LENGTH = (int)(19 * PPCM);
  ARM_HEIGHT = (int)(11.2 * PPCM);

  ARROW_SIZE = (int)(2.2 * PPCM);


  // Starts drawing the watch immediately after we go fullscreen (DO NO CHANGE THIS!)
  draw_finger_arm = true;
  attempt_start_time = millis();
}

function cursorWithin(x, y, w, h) {
  return (mouseX > x && mouseX < x + w && mouseY - 0.75 * PPCM > y && mouseY - 0.75 * PPCM < y + h);
}

function drawHoverEffect() {
  if (guess1 || guess2) {
    fill(121, 168, 226);
    stroke(10);
    rect(xHover, yHover, wHover, hHover, 0.05 * PPCM, 0.05 * PPCM);
  }

  else {
    fill(150);
    stroke(10);
    rect(xHover, yHover, wHover, hHover, 0.05 * PPCM, 0.05 * PPCM);
  }

}

//draw
function keysKeyboard() {

  fill(170);
  stroke(10);

  rect(width / 2 - 1.97 * PPCM, height / 2 - 0.95 * PPCM, 0.43 * PPCM, 0.50 * PPCM, 0.05 * PPCM, 0.05 * PPCM);
  rect(width / 2 - 1.53 * PPCM, height / 2 - 0.95 * PPCM, 0.43 * PPCM, 0.50 * PPCM, 0.05 * PPCM, 0.05 * PPCM);
  rect(width / 2 - 1.08 * PPCM, height / 2 - 0.95 * PPCM, 0.43 * PPCM, 0.50 * PPCM, 0.05 * PPCM, 0.05 * PPCM);
  rect(width / 2 - 0.63 * PPCM, height / 2 - 0.95 * PPCM, 0.43 * PPCM, 0.50 * PPCM, 0.05 * PPCM, 0.05 * PPCM);
  rect(width / 2 - 0.18 * PPCM, height / 2 - 0.95 * PPCM, 0.43 * PPCM, 0.50 * PPCM, 0.05 * PPCM, 0.05 * PPCM);
  rect(width / 2 + 0.27 * PPCM, height / 2 - 0.95 * PPCM, 0.43 * PPCM, 0.50 * PPCM, 0.05 * PPCM, 0.05 * PPCM);
  rect(width / 2 + 0.72 * PPCM, height / 2 - 0.95 * PPCM, 0.43 * PPCM, 0.50 * PPCM, 0.05 * PPCM, 0.05 * PPCM);
  rect(width / 2 + 1.17 * PPCM, height / 2 - 0.95 * PPCM, 0.43 * PPCM, 0.50 * PPCM, 0.05 * PPCM, 0.05 * PPCM);
  rect(width / 2 + 1.62 * PPCM, height / 2 - 0.95 * PPCM, 0.43 * PPCM, 0.50 * PPCM, 0.05 * PPCM, 0.05 * PPCM);

  rect(width / 2 - 1.97 * PPCM, height / 2 - 0.45 * PPCM, 0.43 * PPCM, 0.50 * PPCM, 0.05 * PPCM, 0.05 * PPCM);
  rect(width / 2 - 1.53 * PPCM, height / 2 - 0.45 * PPCM, 0.43 * PPCM, 0.50 * PPCM, 0.05 * PPCM, 0.05 * PPCM);
  rect(width / 2 - 1.08 * PPCM, height / 2 - 0.45 * PPCM, 0.43 * PPCM, 0.50 * PPCM, 0.05 * PPCM, 0.05 * PPCM);
  rect(width / 2 - 0.63 * PPCM, height / 2 - 0.45 * PPCM, 0.43 * PPCM, 0.50 * PPCM, 0.05 * PPCM, 0.05 * PPCM);
  rect(width / 2 - 0.18 * PPCM, height / 2 - 0.45 * PPCM, 0.43 * PPCM, 0.50 * PPCM, 0.05 * PPCM, 0.05 * PPCM);
  rect(width / 2 + 0.27 * PPCM, height / 2 - 0.45 * PPCM, 0.43 * PPCM, 0.50 * PPCM, 0.05 * PPCM, 0.05 * PPCM);
  rect(width / 2 + 0.72 * PPCM, height / 2 - 0.45 * PPCM, 0.43 * PPCM, 0.50 * PPCM, 0.05 * PPCM, 0.05 * PPCM);
  rect(width / 2 + 1.17 * PPCM, height / 2 - 0.45 * PPCM, 0.43 * PPCM, 0.50 * PPCM, 0.05 * PPCM, 0.05 * PPCM);
  rect(width / 2 + 1.62 * PPCM, height / 2 - 0.45 * PPCM, 0.43 * PPCM, 0.50 * PPCM, 0.05 * PPCM, 0.05 * PPCM);

  rect(width / 2 - 1.75 * PPCM, height / 2 + 0.05 * PPCM, 0.43 * PPCM, 0.50 * PPCM, 0.05 * PPCM, 0.05 * PPCM);
  rect(width / 2 - 1.31 * PPCM, height / 2 + 0.05 * PPCM, 0.43 * PPCM, 0.50 * PPCM, 0.05 * PPCM, 0.05 * PPCM);
  rect(width / 2 - 0.87 * PPCM, height / 2 + 0.05 * PPCM, 0.43 * PPCM, 0.50 * PPCM, 0.05 * PPCM, 0.05 * PPCM);
  rect(width / 2 - 0.43 * PPCM, height / 2 + 0.05 * PPCM, 0.43 * PPCM, 0.50 * PPCM, 0.05 * PPCM, 0.05 * PPCM);
  rect(width / 2 + 0.01 * PPCM, height / 2 + 0.05 * PPCM, 0.43 * PPCM, 0.50 * PPCM, 0.05 * PPCM, 0.05 * PPCM);
  rect(width / 2 + 0.45 * PPCM, height / 2 + 0.05 * PPCM, 0.43 * PPCM, 0.50 * PPCM, 0.05 * PPCM, 0.05 * PPCM);
  rect(width / 2 + 0.89 * PPCM, height / 2 + 0.05 * PPCM, 0.43 * PPCM, 0.50 * PPCM, 0.05 * PPCM, 0.05 * PPCM);
  rect(width / 2 + 1.33 * PPCM, height / 2 + 0.05 * PPCM, 0.43 * PPCM, 0.50 * PPCM, 0.05 * PPCM, 0.05 * PPCM);

  fill(188, 212, 241);
  stroke(10);

  rect(width / 2 - 1.97 * PPCM, height / 2 - 1.45 * PPCM, 2 * PPCM, 0.50 * PPCM, 0.05 * PPCM, 0.05 * PPCM);
  rect(width / 2 + 0.05 * PPCM, height / 2 - 1.45 * PPCM, 2 * PPCM, 0.50 * PPCM, 0.05 * PPCM, 0.05 * PPCM);

  fill(170);
  stroke(10);

  rect(width / 2 - 1.34 * PPCM, height / 2 + 0.55 * PPCM, 1.5 * PPCM, 0.50 * PPCM, 0.05 * PPCM, 0.05 * PPCM);
  rect(width / 2 + 0.28 * PPCM, height / 2 + 0.55 * PPCM, 1 * PPCM, 0.50 * PPCM, 0.05 * PPCM, 0.05 * PPCM);

  if (onKey) {
    drawHoverEffect();
  }

}

function lettersKeyboard() {

  fill(0);
  noStroke();
  textFont("Arial", 0.25 * PPCM);
  textStyle(NORMAL);
  text("Q", width / 2 - 1.80 * PPCM, height / 2 - 0.67 * PPCM);
  text("W", width / 2 - 1.35 * PPCM, height / 2 - 0.67 * PPCM);
  text("E", width / 2 - 0.90 * PPCM, height / 2 - 0.67 * PPCM);
  text("R", width / 2 - 0.45 * PPCM, height / 2 - 0.67 * PPCM);
  text("T", width / 2 - 0.00 * PPCM, height / 2 - 0.67 * PPCM);
  text("Y", width / 2 + 0.45 * PPCM, height / 2 - 0.67 * PPCM);
  text("U", width / 2 + 0.90 * PPCM, height / 2 - 0.67 * PPCM);
  text("I", width / 2 + 1.35 * PPCM, height / 2 - 0.67 * PPCM);
  text("O", width / 2 + 1.80 * PPCM, height / 2 - 0.67 * PPCM);


  text("A", width / 2 - 1.80 * PPCM, height / 2 - 0.17 * PPCM);
  text("S", width / 2 - 1.35 * PPCM, height / 2 - 0.17 * PPCM);
  text("D", width / 2 - 0.90 * PPCM, height / 2 - 0.17 * PPCM);
  text("F", width / 2 - 0.45 * PPCM, height / 2 - 0.17 * PPCM);
  text("G", width / 2 + 0.00 * PPCM, height / 2 - 0.17 * PPCM);
  text("H", width / 2 + 0.45 * PPCM, height / 2 - 0.17 * PPCM);
  text("J", width / 2 + 0.90 * PPCM, height / 2 - 0.17 * PPCM);
  text("K", width / 2 + 1.35 * PPCM, height / 2 - 0.17 * PPCM);
  text("P", width / 2 + 1.80 * PPCM, height / 2 - 0.17 * PPCM);

  text("Z", width / 2 - 1.52 * PPCM, height / 2 + 0.33 * PPCM);
  text("X", width / 2 - 1.07 * PPCM, height / 2 + 0.33 * PPCM);
  text("C", width / 2 - 0.62 * PPCM, height / 2 + 0.33 * PPCM);
  text("V", width / 2 - 0.17 * PPCM, height / 2 + 0.33 * PPCM);
  text("B", width / 2 + 0.28 * PPCM, height / 2 + 0.33 * PPCM);
  text("N", width / 2 + 0.73 * PPCM, height / 2 + 0.33 * PPCM);
  text("M", width / 2 + 1.18 * PPCM, height / 2 + 0.33 * PPCM);
  text("L", width / 2 + 1.63 * PPCM, height / 2 + 0.33 * PPCM);

  text("" + current_guess, width / 2 - 1.00 * PPCM, height / 2 - 1.07 * PPCM);
  text("" + current_guess2, width / 2 + 1.00 * PPCM, height / 2 - 1.07 * PPCM);
  //current_guess2 is the other suggestion
  console.log(current_guess2);
  text("<", width / 2 + 0.75 * PPCM, height / 2 + 0.83 * PPCM);


}

function chooseLetter() {
  if (cursorWithin(width / 2 - 1.97 * PPCM, height / 2 - 0.95 * PPCM, 0.43 * PPCM, 0.50 * PPCM)) {
    resetKey();
    confirmInput(width / 2 - 1.97 * PPCM, height / 2 - 0.95 * PPCM, 0.43 * PPCM, 0.50 * PPCM);
    SetCurrentLetter("q");
  }

  else if (cursorWithin(width / 2 - 1.53 * PPCM, height / 2 - 0.95 * PPCM, 0.43 * PPCM, 0.50 * PPCM)) {
    resetKey();
    confirmInput(width / 2 - 1.53 * PPCM, height / 2 - 0.95 * PPCM, 0.43 * PPCM, 0.50 * PPCM);
    SetCurrentLetter("w");
  }

  else if (cursorWithin(width / 2 - 1.08 * PPCM, height / 2 - 0.95 * PPCM, 0.43 * PPCM, 0.50 * PPCM)) {
    resetKey();
    confirmInput(width / 2 - 1.08 * PPCM, height / 2 - 0.95 * PPCM, 0.43 * PPCM, 0.50 * PPCM);
    SetCurrentLetter("e");
  }

  else if (cursorWithin(width / 2 - 0.63 * PPCM, height / 2 - 0.95 * PPCM, 0.43 * PPCM, 0.50 * PPCM)) {
    resetKey();
    confirmInput(width / 2 - 0.63 * PPCM, height / 2 - 0.95 * PPCM, 0.43 * PPCM, 0.50 * PPCM);
    SetCurrentLetter("r");
  }

  else if (cursorWithin(width / 2 - 0.18 * PPCM, height / 2 - 0.95 * PPCM, 0.43 * PPCM, 0.50 * PPCM)) {
    resetKey();
    confirmInput(width / 2 - 0.18 * PPCM, height / 2 - 0.95 * PPCM, 0.43 * PPCM, 0.50 * PPCM);
    SetCurrentLetter("t");
  }

  else if (cursorWithin(width / 2 + 0.27 * PPCM, height / 2 - 0.95 * PPCM, 0.43 * PPCM, 0.50 * PPCM)) {
    resetKey();
    confirmInput(width / 2 + 0.27 * PPCM, height / 2 - 0.95 * PPCM, 0.43 * PPCM, 0.50 * PPCM);
    SetCurrentLetter("y");
  }

  else if (cursorWithin(width / 2 + 0.72 * PPCM, height / 2 - 0.95 * PPCM, 0.43 * PPCM, 0.50 * PPCM)) {
    resetKey();
    confirmInput(width / 2 + 0.72 * PPCM, height / 2 - 0.95 * PPCM, 0.43 * PPCM, 0.50 * PPCM);
    SetCurrentLetter("u");
  }

  else if (cursorWithin(width / 2 + 1.17 * PPCM, height / 2 - 0.95 * PPCM, 0.43 * PPCM, 0.50 * PPCM)) {
    resetKey();
    confirmInput(width / 2 + 1.17 * PPCM, height / 2 - 0.95 * PPCM, 0.43 * PPCM, 0.50 * PPCM);
    SetCurrentLetter("i");
  }

  else if (cursorWithin(width / 2 + 1.62 * PPCM, height / 2 - 0.95 * PPCM, 0.43 * PPCM, 0.50 * PPCM)) {
    resetKey();
    confirmInput(width / 2 + 1.62 * PPCM, height / 2 - 0.95 * PPCM, 0.43 * PPCM, 0.50 * PPCM);
    SetCurrentLetter("o");
  }

  else if (cursorWithin(width / 2 - 1.97 * PPCM, height / 2 - 0.45 * PPCM, 0.43 * PPCM, 0.50 * PPCM)) {
    resetKey();
    confirmInput(width / 2 - 1.97 * PPCM, height / 2 - 0.45 * PPCM, 0.43 * PPCM, 0.50 * PPCM);
    SetCurrentLetter("a");
  }

  else if (cursorWithin(width / 2 - 1.53 * PPCM, height / 2 - 0.45 * PPCM, 0.43 * PPCM, 0.50 * PPCM)) {
    resetKey();
    confirmInput(width / 2 - 1.53 * PPCM, height / 2 - 0.45 * PPCM, 0.43 * PPCM, 0.50 * PPCM);
    SetCurrentLetter("s");
  }

  else if (cursorWithin(width / 2 - 1.08 * PPCM, height / 2 - 0.45 * PPCM, 0.43 * PPCM, 0.50 * PPCM)) {
    resetKey();
    confirmInput(width / 2 - 1.08 * PPCM, height / 2 - 0.45 * PPCM, 0.43 * PPCM, 0.50 * PPCM);
    SetCurrentLetter("d");
  }

  else if (cursorWithin(width / 2 - 0.63 * PPCM, height / 2 - 0.45 * PPCM, 0.43 * PPCM, 0.50 * PPCM)) {
    resetKey();
    confirmInput(width / 2 - 0.63 * PPCM, height / 2 - 0.45 * PPCM, 0.43 * PPCM, 0.50 * PPCM);
    SetCurrentLetter("f");
  }

  else if (cursorWithin(width / 2 - 0.18 * PPCM, height / 2 - 0.45 * PPCM, 0.43 * PPCM, 0.50 * PPCM)) {
    resetKey();
    confirmInput(width / 2 - 0.18 * PPCM, height / 2 - 0.45 * PPCM, 0.43 * PPCM, 0.50 * PPCM);
    SetCurrentLetter("g");
  }

  else if (cursorWithin(width / 2 + 0.27 * PPCM, height / 2 - 0.45 * PPCM, 0.43 * PPCM, 0.50 * PPCM)) {
    resetKey();
    confirmInput(width / 2 + 0.27 * PPCM, height / 2 - 0.45 * PPCM, 0.43 * PPCM, 0.50 * PPCM);
    SetCurrentLetter("h");
  }

  else if (cursorWithin(width / 2 + 0.72 * PPCM, height / 2 - 0.45 * PPCM, 0.43 * PPCM, 0.50 * PPCM)) {
    resetKey();
    confirmInput(width / 2 + 0.72 * PPCM, height / 2 - 0.45 * PPCM, 0.43 * PPCM, 0.50 * PPCM);
    SetCurrentLetter("j");
  }

  else if (cursorWithin(width / 2 + 1.17 * PPCM, height / 2 - 0.45 * PPCM, 0.43 * PPCM, 0.50 * PPCM)) {
    resetKey();
    confirmInput(width / 2 + 1.17 * PPCM, height / 2 - 0.45 * PPCM, 0.43 * PPCM, 0.50 * PPCM);
    SetCurrentLetter("k");
  }

  else if (cursorWithin(width / 2 + 1.62 * PPCM, height / 2 - 0.45 * PPCM, 0.43 * PPCM, 0.50 * PPCM)) {
    resetKey();
    confirmInput(width / 2 + 1.62 * PPCM, height / 2 - 0.45 * PPCM, 0.43 * PPCM, 0.50 * PPCM);
    SetCurrentLetter("p");
  }

  else if (cursorWithin(width / 2 - 1.75 * PPCM, height / 2 + 0.05 * PPCM, 0.43 * PPCM, 0.50 * PPCM)) {
    resetKey();
    confirmInput(width / 2 - 1.75 * PPCM, height / 2 + 0.05 * PPCM, 0.43 * PPCM, 0.50 * PPCM);
    SetCurrentLetter("z");
  }

  else if (cursorWithin(width / 2 - 1.31 * PPCM, height / 2 + 0.05 * PPCM, 0.43 * PPCM, 0.50 * PPCM)) {
    resetKey();
    confirmInput(width / 2 - 1.31 * PPCM, height / 2 + 0.05 * PPCM, 0.43 * PPCM, 0.50 * PPCM);
    SetCurrentLetter("x");
  }

  else if (cursorWithin(width / 2 - 0.87 * PPCM, height / 2 + 0.05 * PPCM, 0.43 * PPCM, 0.50 * PPCM)) {
    resetKey();
    confirmInput(width / 2 - 0.87 * PPCM, height / 2 + 0.05 * PPCM, 0.43 * PPCM, 0.50 * PPCM);
    SetCurrentLetter("c");
  }

  else if (cursorWithin(width / 2 - 0.43 * PPCM, height / 2 + 0.05 * PPCM, 0.43 * PPCM, 0.50 * PPCM)) {
    resetKey();
    confirmInput(width / 2 - 0.43 * PPCM, height / 2 + 0.05 * PPCM, 0.43 * PPCM, 0.50 * PPCM);
    SetCurrentLetter("v");
  }

  else if (cursorWithin(width / 2 + 0.01 * PPCM, height / 2 + 0.05 * PPCM, 0.43 * PPCM, 0.50 * PPCM)) {
    resetKey();
    confirmInput(width / 2 + 0.01 * PPCM, height / 2 + 0.05 * PPCM, 0.43 * PPCM, 0.50 * PPCM);
    SetCurrentLetter("b");
  }

  else if (cursorWithin(width / 2 + 0.45 * PPCM, height / 2 + 0.05 * PPCM, 0.43 * PPCM, 0.50 * PPCM)) {
    resetKey();
    confirmInput(width / 2 + 0.45 * PPCM, height / 2 + 0.05 * PPCM, 0.43 * PPCM, 0.50 * PPCM);
    SetCurrentLetter("n");
  }

  else if (cursorWithin(width / 2 + 0.89 * PPCM, height / 2 + 0.05 * PPCM, 0.43 * PPCM, 0.50 * PPCM)) {
    resetKey();
    confirmInput(width / 2 + 0.89 * PPCM, height / 2 + 0.05 * PPCM, 0.43 * PPCM, 0.50 * PPCM);
    SetCurrentLetter("m");
  }

  else if (cursorWithin(width / 2 + 1.33 * PPCM, height / 2 + 0.05 * PPCM, 0.43 * PPCM, 0.50 * PPCM)) {
    resetKey();
    confirmInput(width / 2 + 1.33 * PPCM, height / 2 + 0.05 * PPCM, 0.43 * PPCM, 0.50 * PPCM);
    SetCurrentLetter("l");
  }

  else if (cursorWithin(width / 2 - 1.34 * PPCM, height / 2 + 0.55 * PPCM, 1.5 * PPCM, 0.50 * PPCM)) {
    resetKey();
    confirmInput(width / 2 - 1.34 * PPCM, height / 2 + 0.55 * PPCM, 1.5 * PPCM, 0.50 * PPCM);
    SetCurrentLetter(" ");
    space = true;

  }

  else if (cursorWithin(width / 2 + 0.28 * PPCM, height / 2 + 0.55 * PPCM, 1 * PPCM, 0.50 * PPCM)) {
    resetKey();
    confirmInput(width / 2 + 0.28 * PPCM, height / 2 + 0.55 * PPCM, 1 * PPCM, 0.50 * PPCM);
    current_letter = "`";
    backspace = true;
  }

  else if (cursorWithin(width / 2 - 1.97 * PPCM, height / 2 - 1.45 * PPCM, 2 * PPCM, 0.50 * PPCM)) {
    resetKey();
    confirmInput(width / 2 - 1.97 * PPCM, height / 2 - 1.45 * PPCM, 2 * PPCM, 0.50 * PPCM);
    guess1 = true;
  }

  else if (cursorWithin(width / 2 + 0.05 * PPCM, height / 2 - 1.45 * PPCM, 2 * PPCM, 0.50 * PPCM)) {
    resetKey();
    confirmInput(width / 2 + 0.05 * PPCM, height / 2 - 1.45 * PPCM, 2 * PPCM, 0.50 * PPCM);
    guess2 = true;
  }

  else {
    resetKey();
    SetCurrentLetter("");
    onKey = false;
  }

}

function resetKey() {
  backspace = false;
  guess1 = false;
  guess2 = false;
  space = false;
}

function drawCursor() {
  fill(255, 0, 0);
  noStroke();
  circle(mouseX, mouseY - 0.75 * PPCM, 0.1 * PPCM)
}

function displayCursor() {
  if (mouseIsPressed == true && mouseClickWithin(width / 2 - 2.0 * PPCM, height / 2 - 1.0 * PPCM, 4.0 * PPCM, 3.0 * PPCM)) {
    showCursor = true
    chooseLetter();
  }
  else {
    showCursor = false
  }
}

function confirmInput(x, y, w, h) {
  onKey = true;

  xHover = x;
  yHover = y;
  wHover = w;
  hHover = h;
}
