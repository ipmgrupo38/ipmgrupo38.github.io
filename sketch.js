// Bakeoff #2 - Seleção de Alvos e Fatores Humanos
// IPM 2020-21, Semestre 2
// Entrega: até dia 7 de Maio às 23h59 através do Fenix
// Bake-off: durante os laboratórios da semana de 3 de Maio

// p5.js reference: https://p5js.org/reference/

// Database (CHANGE THESE!)
const GROUP_NUMBER = 38;      // Add your group number here as an integer (e.g., 2, 3)
const BAKE_OFF_DAY = false;  // Set to 'true' before sharing during the simulation and bake-off days
const VERSION = "3-00-05";
const V_DESCRIPTION = "Final Version";

// Target and grid properties (DO NOT CHANGE!)
let PPI, PPCM;
let TARGET_SIZE;
let TARGET_PADDING, MARGIN, LEFT_PADDING, TOP_PADDING;
let continue_button;

// Metrics
let testStartTime, testEndTime;// time between the start and end of one attempt (48 trials)
let hits = 0;      // number of successful selections
let misses = 0;      // number of missed selections (used to calculate accuracy)
let database;                  // Firebase DB  
let ourDatabase;

// Study control parameters
let draw_targets = false;  // used to control what to show in draw()
let trials = [];     // contains the order of targets that activate in the test
let current_trial = 0;      // the current trial number (indexes into trials array above)
let attempt = 0;      // users complete each test twice to account for practice (attemps 0 and 1)
let fitts_IDs = [];     // add the Fitts ID for each selection here (-1 when there is a miss)
let mouseXprev;       //stores de X coordinate of previous mouse position to calculate fitts
let mouseYprev;       //stores de Y coordinate of previous mouse position to calculate fitts
let sounds = [];

// Circle stuff
const stroke_next_BASE = 6;
const stroke_two_times_BASE = 10;
let stroke_next = stroke_next_BASE;
let stroke_two_times = stroke_two_times_BASE;

// Ghost ball
const ghost_speed_BASE = 5;
let ghost_speed = ghost_speed_BASE;
let offset;
let diff_dist;
let diff_vec_norm;
let current_pos;
let next_pos;

// Target class (position and width)
class Target {
  constructor(x, y, w) {
    this.x = x;
    this.y = y;
    this.w = w;
  }
}

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

// Runs once at the start
function setup() {
  createCanvas(700, 500);    // window size in px before we go into fullScreen()
  frameRate(60);             // frame rate (DO NOT CHANGE!)

  randomizeTrials();         // randomize the trial order at the start of execution

  textFont("Arial", 18);     // font size for the majority of the text
  drawUserIDScreen();        // draws the user input screen (student number and display size)
}

function preload() {
  loadSounds();
}

function isOverTarget() {
  let target = getTargetBounds(trials[current_trial]);
  if (dist(target.x, target.y, mouseX, mouseY) < target.w / 2) {
    return true;
  }
  return false;
}

function loadSounds() {
  sounds.push(loadSound("./sounds/newSounds/success.mp3"));

  sounds.push(loadSound("./sounds/newSounds/fail.mp3"));

}

function sumVectors(v1, v2) {
  return createVector(v1.x + v2.x, v1.y + v2.y);
}

function mulVector(v, a) {
  return createVector(v.x * a, v.y * a);
}

function doCalculations() {
  let current = getTargetBounds(trials[current_trial]);
  let next = getTargetBounds(trials[current_trial + 1]);

  let x_off = next.x - current.x;
  let y_off = next.y - current.y;

  current_pos = createVector(current.x, current.y);
  next_pos = createVector(next.x, next.y);
  let vec = createVector(x_off, y_off);
  diff_dist = vec.mag();
  diff_vec_norm = vec.normalize();
  offset = 0;
}

function drawGhost() {
  let target = getTargetBounds(trials[current_trial]);
  push();
  noStroke();
  fill(color(0, 255, 60, 45));

  let pos = sumVectors(current_pos, mulVector(diff_vec_norm, offset));
  circle(pos.x, pos.y, target.w);
  pop();

  offset += ghost_speed * (sumVectors(next_pos, mulVector(pos, -1)).mag()) / 100;
}

// Runs every frame and redraws the screen
function draw() {
  if (draw_targets) {
    // The user is interacting with the 4x4 target grid
    background(color(0, 0, 0));        // sets background to black

    // Print trial count at the top left-corner of the canvas
    fill(color(255, 255, 255));
    textAlign(LEFT);
    text("Trial " + (current_trial + 1) + " of " + trials.length, 50, 20);
    text("Version: " + VERSION, 50, 40);
    text(V_DESCRIPTION, 50, 60);

    //if is over the target, cursor changes to pointer. else stays arrow
    /*     if (isOverTarget() == true)
          cursor(HAND);
    
        else
          cursor(ARROW);
     */
    drawGhost();
    // Draw all 16 targets
    for (var i = 0; i < 16; i++) drawTarget(i);
  }
}

// Print and save results at the end of 48 trials
function printAndSavePerformance() {
  // DO NOT CHANGE THESE! 
  let accuracy = parseFloat(hits * 100) / parseFloat(hits + misses);
  let test_time = (testEndTime - testStartTime) / 1000;
  let time_per_target = nf((test_time) / parseFloat(hits + misses), 0, 3);
  let penalty = constrain((((parseFloat(95) - (parseFloat(hits * 100) / parseFloat(hits + misses))) * 0.2)), 0, 100);
  let target_w_penalty = nf(((test_time) / parseFloat(hits + misses) + penalty), 0, 3);
  let timestamp = day() + "/" + month() + "/" + year() + "  " + hour() + ":" + minute() + ":" + second();

  background(color(0, 0, 0));   // clears screen
  fill(color(255, 255, 255));   // set text fill color to white
  text(timestamp, 10, 20);    // display time on screen (top-left corner)

  textAlign(CENTER);
  text("Attempt " + (attempt + 1) + " out of 2 completed!", width / 2, 60);
  text("Hits: " + hits, width / 2, 100);
  text("Misses: " + misses, width / 2, 120);
  text("Accuracy: " + accuracy + "%", width / 2, 140);
  text("Total time taken: " + test_time + "s", width / 2, 160);
  text("Average time per target: " + time_per_target + "s", width / 2, 180);
  text("Average time for each target (+ penalty): " + target_w_penalty + "s", width / 2, 220);
  text("Fitts Index Of Performance", width / 2, 240);
  // Print Fitts IDS (one per target, -1 if failed selection)
  // 
  for (let i = 0; i < 2; i++)
    for (let j = 1; j <= 24; j++) {
      let aux;
      if (fitts_IDs[i * 24 + j - 1] == -1)
        aux = "MISSED";
      else if (fitts_IDs[i * 24 + j - 1] == -2)
        aux = "---";
      else
        aux = fitts_IDs[i * 24 + j - 1]

      text("Trial " + (i * 24 + j) + ": " + aux, (i + 1) * 2 * width / (5 + i * 2), 280 + j * 20);
    }


  // Saves results (DO NOT CHANGE!)
  let attempt_data =
  {
    project_from: GROUP_NUMBER,
    assessed_by: student_ID,
    test_completed_by: timestamp,
    attempt: attempt,
    hits: hits,
    misses: misses,
    accuracy: accuracy,
    attempt_duration: test_time,
    time_per_target: time_per_target,
    target_w_penalty: target_w_penalty,
    fitts_IDs: fitts_IDs
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

  console.log(parseVersion());
  let ourAttempt_data = {
    version: VERSION,
    assessed_by: student_ID,
    test_completed_by: timestamp,
    attempt: attempt,
    hits: hits,
    misses: misses,
    accuracy: accuracy,
    attempt_duration: test_time,
    time_per_target: time_per_target,
    target_w_penalty: target_w_penalty,
    fitts_IDs: fitts_IDs,
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

// Mouse button was pressed - lets test to see if hit was in the correct target
function mousePressed() {
  // Only look for mouse releases during the actual test
  // (i.e., during target selections)

  if (draw_targets) {
    // Get the location and size of the target the user should be trying to select
    let previous;

    if (current_trial != 0) {
      previous = getTargetBounds(trials[current_trial - 1]);
    }

    let target = getTargetBounds(trials[current_trial]);

    if (current_trial < trials.length) {

      // Check to see if the mouse cursor is inside the target bounds,
      // increasing either the 'hits' or 'misses' counters
      if (dist(target.x, target.y, mouseX, mouseY) < target.w / 2) {
        sounds[0].play()
        hits++;
        if (current_trial != 0) {
          let fittsID = Math.log2((dist(target.x, target.y, mouseXprev, mouseYprev) / target.w) + 1)
          fitts_IDs.push(parseFloat(fittsID).toFixed(3));
        }
        else
          fitts_IDs.push(-2);
      }
      else {
        sounds[1].play();
        misses++;
        fitts_IDs.push(-1);
      }
      mouseXprev = mouseX;
      mouseYprev = mouseY;
    }

    current_trial++;                 // Move on to the next trial/target
    if (current_trial <= trials.length) {
      doCalculations();
    }
    // Check if the user has completed all 48 trials
    if (current_trial === trials.length) {
      testEndTime = millis();
      draw_targets = false;          // Stop showing targets and the user performance results
      printAndSavePerformance();     // Print the user's results on-screen and send these to the DB
      attempt++;

      // If there's an attempt to go create a button to start this
      if (attempt < 2) {
        continue_button = createButton('START 2ND ATTEMPT');
        continue_button.mouseReleased(continueTest);
        continue_button.position(width / 2 - continue_button.size().width / 2, 3 * height / 4 - continue_button.size().height / 2);
      }
    }
  }
}

// Draw target on-screen
function drawTarget(i) {
  // Get the location and size for target (i)
  let target = getTargetBounds(i);

  // Check whether this target is the target the user should be trying to select
  if (trials[current_trial] === i) {
    fill(color(98, 255, 0)); // TARGET COLOR
    stroke(color(255, 255, 255));
    strokeWeight(stroke_two_times);

    if (isOverTarget() == true) {
      fill(color(80, 150, 10)); //HOVERING COLOR
    }



    if (trials[current_trial + 1] == i) {
      stroke(color(98, 0, 255));  // TWO TIMES STROKE COLOR
      strokeWeight(stroke_two_times);
    }

  }
  else if (trials[current_trial + 1] === i) {

    fill(color(155, 155, 155)); // NEXT COLOR
    stroke(color(98, 255, 0)); // NEXT STROKE COLOR
    strokeWeight(stroke_next);
  }
  // Does not draw a border if this is not the target the user
  // should be trying to select
  else {
    noStroke();
    fill(color(120, 120, 120)); // delta = 50.4313
  }

  // Draws the target

  circle(target.x, target.y, target.w);

  noStroke();

  // INNER CIRCLE
  if (trials[current_trial] === i) {
    fill(color(0, 150, 10));
    if (trials[current_trial + 1] == i)
      fill(color(98, 0, 255));
    //Draw inner circle
    circle(target.x, target.y, target.w / 3)
  }
}

// Returns the location and size of a given target
function getTargetBounds(i) {
  var x = parseInt(LEFT_PADDING) + parseInt((i % 4) * (TARGET_SIZE + TARGET_PADDING) + MARGIN);
  var y = parseInt(TOP_PADDING) + parseInt(Math.floor(i / 4) * (TARGET_SIZE + TARGET_PADDING) + MARGIN);

  return new Target(x, y, TARGET_SIZE);
}

// Evoked after the user starts its second (and last) attempt
function continueTest() {
  // Re-randomize the trial order
  shuffle(trials, true);
  current_trial = 0;
  print("trial order: " + trials);

  // Resets performance variables
  hits = 0;
  misses = 0;
  fitts_IDs = [];

  continue_button.remove();

  // Shows the targets again
  draw_targets = true;
  testStartTime = millis();
}

// Is invoked when the canvas is resized (e.g., when we go fullscreen)

function calcSize(val, ds) {
  return val * (26.71 / (ds + 5 * Math.PI));
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);

  let display = new Display({ diagonal: display_size }, window.screen);

  // DO NOT CHANGE THESE!
  PPI = display.ppi;                        // calculates pixels per inch
  PPCM = PPI / 2.54;                         // calculates pixels per cm
  TARGET_SIZE = 1.5 * PPCM;                         // sets the target size in cm, i.e, 1.5cm
  TARGET_PADDING = 1.5 * PPCM;                         // sets the padding around the targets in cm
  MARGIN = 1.5 * PPCM;                         // sets the margin around the targets in cm

  // Sets the margin of the grid of targets to the left of the canvas (DO NOT CHANGE!)
  LEFT_PADDING = width / 2 - TARGET_SIZE - 1.5 * TARGET_PADDING - 1.5 * MARGIN;

  // Sets the margin of the grid of targets to the top of the canvas (DO NOT CHANGE!)
  TOP_PADDING = height / 2 - TARGET_SIZE - 1.5 * TARGET_PADDING - 1.5 * MARGIN;


  // Calc sizes of stuff
  ghost_speed = calcSize(ghost_speed_BASE, display_size);
  stroke_next = calcSize(stroke_next_BASE, display_size);
  stroke_two_times = calcSize(stroke_two_times_BASE, display_size);

  // Starts drawing targets immediately after we go fullscreen
  draw_targets = true;
  doCalculations()
}

