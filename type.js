let currently_typed = "" //What has been written so fart
let current_word = "" //Current Word 
let current_letter = "" // Current Letter
let current_guess = "" //Current Guess of Current Word
let current_guess2 = ""

//CURRENTLY_TYPED

function UpdateCurrentlyTyped(word) {
    //UpdateCurrentGuess()
    currently_typed = currently_typed.slice(0, currently_typed.length - current_word.length);
    currently_typed += word + " ";

    ResetCurrentWord() //After space start new word
    return currently_typed;
}


function ResetCurrentlyTyped() {
    currently_typed = "";
    return currently_typed;
}

function BackSpaceCurrentlyTyped() {
    if (currently_typed.length > 0) {
        currently_typed = currently_typed.substring(0, currently_typed.length - 1);
    }
    return currently_typed;
}

function AddLetterCurrentlyTyped(letter) {
    currently_typed += letter;
    return currently_typed;
}

function DeliverCurrentlyTyped() {
    if (currently_typed[currently_typed.length - 1] == " ") {
        //If delivering with an extra space
        return BackSpaceCurrentlyTyped();
    }
    return currently_typed;
}

//CURRENT_LETTER

function GetCurrentLetter() {
    return current_letter;
}

function SetCurrentLetter(newLetter) {
    current_letter = newLetter;
    return current_letter;
}

//CURRENT_WORD

function AddLetterCurrentWord(letter) {



    if (letter == " ") {
        //Use python function
        //Store in variables
        //Slice from currently_typed the length of the second word
        //Add space to currently_typed
        //Add second Word to currently_typed
        //Add space to currently_typed
        //ResetCurrentWord
        //Return
    }
    AddLetterCurrentlyTyped(letter);
    current_word += letter;
    UpdateCurrentGuess();
    return current_word;
}

function BackSpaceCurrentWord() {
    BackSpaceCurrentlyTyped()
    if (current_word.length > 0) {
        current_word = current_word.substring(0, current_word.length - 1);
    }
    UpdateCurrentGuess();
    return current_word;
}

function ResetCurrentWord() {
    current_word = "";
    UpdateCurrentGuess();
    return current_word;
}

//CURRENT GUESS

function UpdateCurrentGuess() {
    current_guess = ""
    current_guess2 = ""

    //NEW
    if (current_word == "") {
        current_guess = count_1w_ord[0];
        current_guess2 = count_1w_ord[1];

        return
    }
    if ((Object.keys(count_1w[current_word[0]]))) {//Check if 1st letter exists
        if (current_word.length == 1) {
            for (scdLtrIndex = 0; scdLtrIndex < Object.keys(count_1w[current_word[0]]).length; scdLtrIndex++) {
                for (keyIndex = 0; keyIndex < count_1w[current_word[0]][Object.keys(count_1w[current_word[0]])[scdLtrIndex]].length; keyIndex++) {
                    if (current_guess == "") {
                        current_guess = count_1w[current_word[0]][Object.keys(count_1w[current_word[0]])[scdLtrIndex]][keyIndex];
                    }
                    else {
                        current_guess2 = count_1w[current_word[0]][Object.keys(count_1w[current_word[0]])[scdLtrIndex]][keyIndex];
                        break;
                    }
                }
                if (current_guess2 != "") {
                    break;
                }
            }

            if (current_guess == "" && current_guess2 == "") {
                current_guess = count_1w_ord[0];
                current_guess2 = count_1w_ord[1];
            }
            else if (current_guess2 == "") {
                current_guess2 = count_1w_ord[0];
                if (current_guess2 == current_guess) {
                    current_guess2 = count_1w_ord[1];
                }
            }
            return
        }
        else {
            for (keyIndex = 0; keyIndex < count_1w[current_word[0]][current_word[1]].length; keyIndex++) {
                if (count_1w[current_word[0]][current_word[1]][keyIndex].startsWith(current_word) && count_1w[current_word[0]][current_word[1]][keyIndex].length > current_word.length) {
                    if (current_guess == "") {
                        current_guess = count_1w[current_word[0]][current_word[1]][keyIndex];
                    }
                    else {
                        current_guess2 = count_1w[current_word[0]][current_word[1]][keyIndex];
                        return
                    }
                }
            }

            if (current_guess == "" && current_guess2 == "") {
                current_guess = count_1w_ord[0];
                current_guess2 = count_1w_ord[1];
            }
            else if (current_guess2 == "") {
                current_guess2 = count_1w_ord[0];
                if (current_guess2 == current_guess) {
                    current_guess2 = count_1w_ord[1];
                }
            }

            return
        }
    }
    current_guess = "";
    current_guess2 = "";
    return
}


function GetSuggestionCompletion() {
    if (current_guess == "") {
        return current_guess;
    }
    return current_guess.slice(-(current_guess.length - current_word.length))
}

//SUPORTT

function getNextChar(char) {
    var charCode = char.charCodeAt(0);
    var nextChar = String.fromCharCode(charCode + 1);
    return AlphabetWrapper(nextChar);
}

function getPreviousChar(char) {
    var charCode = char.charCodeAt(0);
    var nextChar = String.fromCharCode(charCode - 1);
    return AlphabetWrapper(nextChar);
}

function AlphabetWrapper(letter) {
    if (letter.charCodeAt(0) > "z".charCodeAt(0)) return '_' //Warp text arround to space
    if (letter.charCodeAt(0) < "_".charCodeAt(0)) return 'z' //Warp 
    return letter
}
