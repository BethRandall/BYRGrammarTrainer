
function BlockMove(event)
{
	event.preventDefault();
}


$(document).ready(function(){
                  // Grammar tab functionality: shows one category and hides others
                  // if there is no noun list, show pronoun list.  Code is in initLesson.js.
                  
                  $('#answerCategoryTabContainer ul li').click(function(){
                      if(!$(this).hasClass('active')) {
                          $('.answerCategoryTab').removeClass('active');
                          $(this).addClass('active');
                          $('#selectedAnswerList>section').hide();
                                                               
                          var tab = $(this).attr('id');
                          tab = tab.substr(0,(tab.indexOf('T')));
                          tab = "#" + tab +"List";                                     
                          $(tab).show();                                     
                          }
                      });
                   
                  // Orator button
                  $("#oralPromptButton").click(function(){ saySomething(); });
                  
                  // Delete button
                  $("#answerContainer #deleteButton").click(function(){ eraseAnswer(); });
                  
                  // Menu button labelled "Exit"
                  $("#menuButton").click(function(){ exitLesson(); });
                  
                  // button labelled "Exit" on left-hand side
                  $("#leftExitButton").click(function(){ //$("#big_video_box").empty();
                            document.getElementById('video').pause(); exitLesson(); });
                  
                  // Submit button
                  $("#answerContainer #submitButton").click(function(){ submitAnswer(); });
});

// Words for the current answer
var currentAnswer = "";
// Current word being dragged
var currentWord;

// Redo mode
var redoMode = false;
var jitterNext = true;
var didJitter = false;
// An array of incorrectly answered prompts to redo
var promptsToRedo;

// Array of answer words
var currentAnswerWords;
var draggableAnswerWords;

var lessonIndex;
var theLesson;
var indexArray;       // these get initialized by initDataModel.js
var redoNumArray;     // this array holds info about how many times each exercise needs to be redone.
var numToRedo = 2;    // each wrong exercise must be done correctly this many times.
var step;             // index to move through indexArray, randomized list of exercises.
var prevExNum;        // number of previous exercise.
var numWrong;         // number of exercises that have been done wrong in the current lesson.
var maxWrong = 10;    // maximum number of answers the user is allowed to get wrong before being sent back to previous phase.
var numWrong = 0;
var currentExercise;
var nounWords;
var verbWords;
var adjectiveWords;
var pronounWords;
//var genderChecked = false;

// Dot Array
var dotMatrix;

// Constants for the dots
const DOT_UNTRIED = 0;
const DOT_INCOMPLETE = 1;
const DOT_WRONG = 2;
const DOT_CORRECT = 3;

function countRedDots() {
    var red_counter = 0;
    for (var i = 0; i < dotMatrix.length; i++) {
        if (dotMatrix[i] == DOT_WRONG) {
            red_counter ++;
        }
    }
    return red_counter;
}

function countGreenDots() {
    var green_counter = 0;
    for (var i = 0; i < dotMatrix.length; i++) {
        if (dotMatrix[i] == DOT_CORRECT) {
            green_counter ++;
        }
    }
    return green_counter;
}

function countOrangeDots() {
    var orange_counter = 0;
    for (var i = 0; i < dotMatrix.length; i++) {
        if (dotMatrix[i] == DOT_INCOMPLETE) {
            orange_counter ++;
        }
    }
    return orange_counter;
}

function countBlueDots() {
    var blue_counter = 0;
    for (var i = 0; i < dotMatrix.length; i++) {
        if (dotMatrix[i] == DOT_UNTRIED) {
            blue_counter ++;
        }
    }
    return blue_counter;
}

function buildRedoNumArray() {
    setRedoNumArray();
    for (var i = 0; i < dotMatrix.length; i++) {
        if ((dotMatrix[i] == DOT_WRONG) || (dotMatrix[i] == DOT_INCOMPLETE)) {
            //alert("will set redoNumArray at: " + i + ", to numToRedo: " + numToRedo);
            redoNumArray[i] = numToRedo;
        }
    }
}


function pushPromptToRedo(exNum)
{
    // promptsToRedo is a list of the exercises that were answered wrong.
    // redoNumArray is a list of how many more times each exercise needs to be answered right.
    //alert("inside pushPromptToRedo: ");
    var already_recorded = false;
    // first, check whether this exercise is already on the list to redo.
    // This might happen if we were in redo mode, and got the exercise wrong again.
    for (var i = 0; i < promptsToRedo.length; i++) {
        if (promptsToRedo[i] == exNum) { already_recorded = true; break; }
    }
    /*
    if (!already_recorded) {
        if (redoMode) { promptsToRedo.unshift(indexArray[exNum]); } // unshift adds to the beginning of the array.
        else { promptsToRedo.push(indexArray[exNum]); } }
     */
    if (!already_recorded) {
        if (redoMode) { promptsToRedo.unshift(exNum); } // unshift adds to the beginning of the array.
        else { promptsToRedo.push(exNum); } }

    dotMatrix[exNum] = DOT_WRONG;
    try {
        if (!redoMode) {
            redoNumArray[exNum] = numToRedo; }
        // if we were in redo mode, we need to add 1 to the number of times to redo, since it will be immediately decremented when
        // we get the exercise right.
        if (redoMode) {
            redoNumArray[exNum] = numToRedo + 1; } }
    catch (err) {
        alert("ISAMBARD unable to access redoNumArray at exNum:  " + exNum); }
}


function randomizeRedo() {
    //alert("inside randomizeRedo: ");
    //BYR randomize redo list here.
    // usedDex will contain a list of indices used in the randomized array.
    var usedDex = new Array();
    var tempArray = new Array();
    // initialize usedDex with indices.
    for(var exerNum = 0; exerNum < promptsToRedo.length; exerNum++) {
        usedDex[exerNum] = promptsToRedo[exerNum]; }
    
    // randomizing happens in this for loop.
    for(var exerNum = 0; exerNum < promptsToRedo.length; exerNum++)
    {
        //document.write("<p>" + firstExercise.multipleChoice[answerChoice] + "</p>");
        var randdex =  Math.floor(Math.random()*usedDex.length);
        var newranddex = usedDex[randdex];
        // if you don't want to randomize the exercises, comment out the following line:
        promptsToRedo[exerNum] = newranddex;
        usedDex.splice(randdex, 1); }
}

// Add a draggable word to the answer
function addWordToAnswer(targetWord, wordID)
{
	//alert("Target word: " + targetWord + " ID: " + wordID);
	var tempAnswerID = 0;
	var tempWord;
	var tempLeftPosition = 4;
    var shift = 0;
	
	//var tempJQueryString = wordID;
	var tempJQueryPosition = $("#" + wordID).offset();
	var tempJQueryCalc = tempJQueryPosition.top + (document.getElementById(wordID).offsetHeight / 2);
	var tempAnswerBox = $("#droppableAnswerBox").offset();
	
	// If the word being dragged is within the bounds of the answer box
	if( (tempJQueryCalc >= tempAnswerBox.top) && (tempJQueryCalc <= (tempAnswerBox.top + document.getElementById("droppableAnswerBox").offsetHeight)) )
	{
		// Play word dropping sound
		playSound("wordDropSound");
		
		// If there is nothing in the answer box
		if( currentAnswerWords.length == 0 ) {
			// Just add one word in the answer box
			currentAnswerWords.push(targetWord);
			// Clear "Drop answer here" message
           // if ((currentExercise.prefill != 'undefined') && (currentExercise.prefill.length > 0)) {
             // $("#droppableAnswerBox p").html(prefill);
            //} else {
              $("#droppableAnswerBox p").html(" "); //}
        }
		else
		{
			// If there is only one answer word in the answer box
			if( currentAnswerWords.length == 1 )
			{
				// If the word being dragged is on the left side of the answer word
				if( (tempJQueryPosition.left + (document.getElementById(wordID).offsetWidth / 2)) < ($("#droppableAnswerBox p #answer_0").offset().left + document.getElementById("answer_0").offsetWidth / 2) ) {
					// Add the dragged word to the left of the sentence
					currentAnswerWords.unshift(targetWord); }
				else {
					// Otherwise, add the dragged word to the right of the sentence
					currentAnswerWords.push(targetWord); }
			}
			else
			{
				// If the word being dragged is on the left side of the first answer word
				if( (tempJQueryPosition.left + (document.getElementById(wordID).offsetWidth / 2)) < ($("#droppableAnswerBox p #answer_0").offset().left + document.getElementById("answer_0").offsetWidth / 2) )
				{
					// Add the dragged word to the left of the sentence
					currentAnswerWords.unshift(targetWord); }
				else if( (tempJQueryPosition.left + (document.getElementById(wordID).offsetWidth / 2)) >= ($("#droppableAnswerBox p #answer_" + (currentAnswerWords.length - 1)).offset().left + document.getElementById("answer_" + (currentAnswerWords.length - 1)).offsetWidth / 2) )
				{
					// If the word being dragged is on the right side of the last answer word, then add the dragged word to the right of the sentence
					currentAnswerWords.push(targetWord); }
				else
				{
					for( var i = 0; i < (currentAnswerWords.length - 1); i++ )
					{
						var j = i + 1;
						
						// Check if the word being dragged is between two words
						if( ((tempJQueryPosition.left + (document.getElementById(wordID).offsetWidth / 2)) >= ($("#droppableAnswerBox p #answer_" + i).offset().left + document.getElementById("answer_" + i).offsetWidth / 2)) && ((tempJQueryPosition.left + (document.getElementById(wordID).offsetWidth / 2)) < ($("#droppableAnswerBox p #answer_" + j).offset().left + document.getElementById("answer_" + j).offsetWidth / 2)) )
						{
							// Add the new word between two words
							var tempNewWordPosition = j;
							//alert("Found position: " + tempNewWordPosition);
							currentAnswerWords.splice(tempNewWordPosition, 0, String(targetWord));
						}
					}
				}
			}
		}
		
		// Initialize the answer ID tracker
		tempAnswerID = 0;
		
		// Clear the draggable answer array
		draggableAnswerWords = new Array();
		
        answerWordsLowerCase();
        capFirstAnswerWord();
        displayAnswerWords();
    }
}

// Used to move or delete answer words
function moveAnswer(answerNumber)
{
	var tempLeftPosition = 4;
	var tempStoredWord;
	var tempAnswerID = 0;
	
	var tempJQueryString = "#droppableAnswerBox p #answer_" + answerNumber;
	var tempJQueryPosition = $(tempJQueryString).offset();
	var tempJQueryCalc = tempJQueryPosition.top + (document.getElementById("answer_" + answerNumber).offsetHeight / 2);
	var tempAnswerBox = $("#droppableAnswerBox").offset();
	
	// If the word being dragged is between the top and bottom of the droppable answer box
	if( (tempJQueryCalc >= tempAnswerBox.top) && (tempJQueryCalc <= (tempAnswerBox.top + document.getElementById("droppableAnswerBox").offsetHeight)) )
	{
		// Play word dropping sound
		playSound("wordDropSound");
		
		// If there is more than one word in the answer box
		if( currentAnswerWords.length > 1 )
		{
			var foundTheSpot = false;
			var wordBackwardsTrack = 0;
			var storedAnswerNumberPosition = tempJQueryPosition.left;
			for( var i = (currentAnswerWords.length - 1); i > answerNumber; i-- )
			{
				var wordBeingObservedOffset = $("#droppableAnswerBox p #answer_" + i).offset();
				//alert(storedAnswerNumberPosition);
				
				if( (tempJQueryPosition.left >= wordBeingObservedOffset.left) && (foundTheSpot == false) )
				{
					wordBackwardsTrack = i;
					foundTheSpot = true; }
					//alert("Found the spot!"); }
            }
			
			if( !foundTheSpot )
			{
				for( var j = 0; j <= (answerNumber - 1); j++ )
				{
					var wordBeingObservedOffset = $("#droppableAnswerBox p #answer_" + j).offset();
					
					if( ((tempJQueryPosition.left + document.getElementById("answer_" + answerNumber).offsetWidth) <= (wordBeingObservedOffset.left + document.getElementById("answer_" + j).offsetWidth)) && (foundTheSpot == false) ) {
						wordBackwardsTrack = j;
						foundTheSpot = true;
						//alert("Found the spot in the back!");
                    }
				}
			}
			
			if(foundTheSpot)
			{
				// Take out the current word
				tempStoredWord = currentAnswerWords.splice(answerNumber, 1);
				// Insert the current word into the answer array
				currentAnswerWords.splice(wordBackwardsTrack, 0, String(tempStoredWord));
			}
		}
	}
	else
	{
		// Erase the word
		currentAnswerWords.splice(answerNumber, 1); }
	
	// Clear the draggable answer array
	draggableAnswerWords = new Array();
    answerWordsLowerCase();
    capFirstAnswerWord();
    displayAnswerWords();
	// If there are no words in the answer array, then clear the answer box
	if( currentAnswerWords.length == 0 )
        { eraseAnswer(); }
}

function displayAnswerWords() {
    var tempAnswerID = 0;
	var tempWord;
	var tempLeftPosition = 4;
    var shift = 0;
    // Add the first removable answer word
    $("#droppableAnswerBox p").html("<div class=\"draggableWord\" id=\"answer_0\" style=\"position:absolute; padding:6px; left:" + tempLeftPosition + "px\">" + currentAnswerWords[0] + "</div>");
    draggableAnswerWords[0] = new webkit_draggable('answer_0', {revert : false, onStart : function(){currentWord = currentAnswerWords[0];},onEnd : function(){moveAnswer(0);}});

    tempLeftPosition += document.getElementById("answer_0").offsetWidth + 2;

    // Add more removable answer words
    for( var i = 1; i < currentAnswerWords.length; i++ )
    {
        tempAnswerID = i;
        $("#droppableAnswerBox p").append("<div class=\"draggableWord\" id=\"answer_" + i + "\" style=\"position:absolute; padding:6px; left:" + tempLeftPosition + "px\">" + currentAnswerWords[i] + "</div>");
        var tempAnswerString = "answer_" + i;
        draggableAnswerWords[i] = new webkit_draggable(tempAnswerString, {revert : false, onStart : function(){currentWord = currentAnswerWords[i];}, onEnd : function(i){return function() {moveAnswer(i);}} (i)});
        tempLeftPosition += document.getElementById(tempAnswerString).offsetWidth + 2; }

    if (typeof currentExercise.balloonPrefill == "undefined") {
        $("#speechBubble p").html(currentAnswerWords.join(" ") + "."); }

    // Add period
    tempAnswerID++;
    $("#droppableAnswerBox p").append("<div class=\"draggableWord\" id=\"answer_" + tempAnswerID + "\" style=\"position:absolute; padding:6px; left:" + tempLeftPosition + "px\">" + "." + "</div>");
}

function answerWordsLowerCase() {
    // Make all words in the answer array lower case
    for( var i = 0; i < currentAnswerWords.length; i++ )
    {
        // Except these following words
        if( (currentAnswerWords[i] !== "I") )
        {
            var targetWordForLowerCase = currentAnswerWords[i].toLowerCase();
            currentAnswerWords[i] = targetWordForLowerCase; }
    }
}

function capFirstAnswerWord() {
    // The first letter of the first word must be capital
    //alert("inside capFirstAnswerword: length of currentAnswerWords: " + currentAnswerWords.length);
	if((currentAnswerWords.length > 0) && (typeof theLesson.capFirstWord == "undefined")
       && (typeof currentExercise.capFirstWord == "undefined"))
	{
		var capitalLetter = currentAnswerWords[0].substring(0,1).toUpperCase();
		var firstAnswerWord = capitalLetter + currentAnswerWords[0].substring(1);
		currentAnswerWords[0] = firstAnswerWord;
	}
}

// Erase the whole answer
function eraseAnswer()
{
	//currentAnswer = "";
	currentAnswerWords = new Array();
    if ((typeof currentExercise.prefill != 'undefined') && (currentExercise.prefill.length > 0)) {
        $("#droppableAnswerBox p").html(currentExercise.prefill);
    }
    else {
        $("#droppableAnswerBox p").html("Drop answer here."); }
    if (typeof currentExercise.balloonPrefill == "undefined") {
        $("#speechBubble p").html(" "); }
}

function saySomething() {
    NativeBridge.call("toSpeech", [currentExercise.oralprompt]); }

function myLeftExit() {
    //alert("step:  " + step);
    //dotMatrix[step] = DOT_CORRECT;
   exitLesson();
}

/*
function genderIsChecked() {
    NativeBridge.call("genderIsChecked");
}
 */

function showMenu()
{
	//alert("will call showMenu:");
    NativeBridge.call("showMenu"); }


function exitLesson()
{
	//alert("will call exitLesson:");
    saveProgramState();
    NativeBridge.call("exitLesson"); }


function sendValues(a, b, c, d, e)
{
	// Send some values to the native side
	// The send arg is an array of arguments
	//for( var i = 0; i &lt; arguments.length; i++ ) {
    //    arguments[ i ] ;
    //}
    
    NativeBridge.call("recordNative", [a,b,c,d,e]);    }

function sendDebug(a, b, c, d)
{
    // Send some values to the navtive side
    // The send arg is an array of arguments
    //for( var i = 0; i &lt; arguments.length; i++ ) {
    //    arguments[ i ] ;
    //}
    NativeBridge.call("printDebug", [a,b,c,d]);  }

// Submit answer
function submitAnswer()
{
    //alert("inside submitAnswer:  currentAnswerWords.length:  " + currentAnswerWords.length);
    // if someone hits "submit" on an empty answer, nothing happens.
	if (currentAnswerWords.length == 0) { return; }
    if (backDoor()) { return; }
    //alert("about to call MetaDetermineFeedback: ");
	MetaDetermineFeedback();
    //alert("about to update dot feedback matrix: ");
	// Update the dot feedback matrix
    initDots();
}

// "backdoor" method for advancing to particular exercise; repeat an answer word at beginning of sentence ("I I").
function backDoor() {
    //for (var j = 0; j < currentAnswerWords.length; j++) {
      //  alert("currentAnswerWords[" + j + "]:  " + currentAnswerWords[j]); }
    //alert("currentAnswerWords.length: " + currentAnswerWords.length);
    if (currentAnswerWords.length < 2) { return false; }
    for (var i = 0; i + 1 < currentAnswerWords.length; i++) {
        if (currentAnswerWords[i].toLowerCase() == currentAnswerWords[i + 1].toLowerCase()) {
           // alert("currentAnswerWords[i] == currentAnswerWords[i+1]: i = " + i); }
           continue; }
        else { return false; } }
    //alert("back door to exercise number " + currentAnswerWords.length);
    var backNum = parseInt(prompt("Enter the number of the exercise you'd like to go to: ", ""), 10);
    //subtract 1 because the Lesson array is indexed beginning at 0 rather than 1.
    backDoorUpdateExercise(backNum - 1);
    return true;
}

// gets index of lesson in LessonArray (see modules.plist.)
// For the moment, I only care if it's the first lesson in the array,
// so I've marked those as lessonIndex: 0 in the .json file.
function getLessonIndex() {
    if (typeof theLesson.lessonIndex != "undefined") {
        return (theLesson.lessonIndex);
    }
    lessonIndex = 100;
    return lessonIndex;
}

function setLessonConstants() {
    //alert("about to call isGenderChecked:")
    /*
    if (typeof NativeBridge != 'undefined') {
        NativeBridge.call("getGender", "", function (response) {
                          if(response != null) {
                          setGender(response);
                          } else { alert("No Response"); }
                          });
     */
/*
    if (typeof NativeBridge != 'undefined') {
        NativeBridge.call("isGenderChecked", "", function (response) {
            if(response != null) {
                alert("called isGenderChecked: response: " + response);
                if (response == "false" && (typeof theLesson.needGender != "undefined")) {
                    askGender();
                          NativeBridge.call("genderIsChecked"); }}
                          else { alert("null response from isGenderChecked: "); }
                          });
     */
    jitterNext = true;
    didJitter = false;
    numWrong = 0;    
}

function toNextLesson() {
    setLessonConstants();
    saveProgramState();
    // You must call "exitLesson" from inside businessLogic to get the happyFace to show up between lessons.
    // You won't see the happyFace if you call "exitLesson" from inside "goToNextLesson".
    NativeBridge.call("exitLesson");
    NativeBridge.call("goToNextLesson");
}

function toPreviousLesson() {
    setLessonConstants();
    saveProgramState();
    // You must call "exitLesson" from inside businessLogic to get the happyFace to show up between lessons.
    // You won't see the happyFace if you call "exitLesson" from inside "goToPreviousLesson".
    NativeBridge.call("exitLesson");
    NativeBridge.call("goToPreviousLesson");
}


function goToNextVideo() {
    dotMatrix[step] = DOT_CORRECT;
    //currentExerciseNumber++;
    step++;
    $("#big_video_box").empty();
    if((step + 1) > theLesson.exerciseArray.length) {
        toNextLesson(); }
    else {
        updateExercise();
    }
}

function goToNextExercise()
{
    //alert("inside goToNextExercise: ");
    var greenDotCounter = countGreenDots();
    //alert("greenDotCounter: " + greenDotCounter + ", promptsToRedo.length:  " + promptsToRedo.length);
    // BYR:  If all the dots are green, the lesson is finished.  Go on to the next lesson.
    //alert("greenDotCounter:  " + greenDotCounter + ", redoMode: " + redoMode + ", theLesson.exerciseArray.length: " + theLesson.exerciseArray.length); 
	if(greenDotCounter >= theLesson.exerciseArray.length)
	{
        // For now we just exit out to the native side, but we should add some congratulations here!
        //alert("found all green dots:  will go to next lesson: ");
        toNextLesson();
        return;
    }
	else
	{
        // Not all the dots are green. Were either have not been through all the quesions, or we got some wrong. Determine which.
        // determine if we are in redoMode or if we should move to redoMode
		// If the user is redoing the prompts he/she got wrong
        //alert("about to check for redoMode: ");
		if( redoMode )
		{
            //Note: once your in the redoMode, we should be working off the promptsToRedo array instead of indexArray.
            //var promptsString = "";
            //for (var i = 0; i < promptsToRedo.length; i++) {
              //  promptsString += promptsToRedo[i] + ", "; }
            //alert("Prompts to Redo:  " + promptsString);
            //if( currentExerciseNumber < promptsToRedo.length) BYR: nonsense!
            // advance through promptsToRedo; you may need to cycle back to beginning.  Remember each exercise must be done correctly twice!
            if (step < promptsToRedo.length) 
			{
                // Nope. Were still on the first round. Advance to next question.
                step++;
                if (step == promptsToRedo.length) {
                    //alert("about to set step to 0: ");
                    step = 0;
                }}
			else
			{
                // All redo questions have now been answered once [BYR -- should be twice!]. But all dots are not green so stay in redo mode.
                setDotWrongToIncomplete();
                step = 0;
			}
		}
		else
		{
			// Check to see if all questions have been asked.
            //if( currentExerciseNumber < theLesson.exerciseArray.length)
            if( (step + 1) < theLesson.exerciseArray.length)
			{
                // Nope. Were still on the first round. Advance to next question.
                step++;
                //while((dotMatrix[step] != DOT_INCOMPLETE) && (dotMatrix[step] != DOT_UNTRIED)) {
                while((dotMatrix[indexArray[step]] != DOT_INCOMPLETE) && (dotMatrix[indexArray[step]] != DOT_UNTRIED)) {
                    step++;
                    if (step >= dotMatrix.length) { break; }
                }
                if (step >= dotMatrix.length) { alert("GARGANTUA step >= dotMatrix.length:  " + step);}
            }
			else
			{
                // All questions have now been answered once. But not all dots are green so enter redo mode.
				redoMode = true;
                randomizeRedo();
                setDotWrongToIncomplete();
                step = 0;
			}
		}
	}
	
	// Update the page
    //alert("about to updateExercise: ");
    prevExNum = GetExNum();
	updateExercise();
}

// take all the wrong answers and move them to incomplete
function setDotWrongToIncomplete() {
    for( var j = 0; j < dotMatrix.length; j++ )
    {
        if((dotMatrix[j] == DOT_WRONG) || (dotMatrix[j] == DOT_INCOMPLETE))
        { dotMatrix[j] = DOT_INCOMPLETE; } }
}

function saveProgramState() {
    
    var saveState = new Object();
    saveState.step = step;
    saveState.currentAnswer = currentAnswer;
    saveState.currentWord = currentWord;
    saveState.redoMode = redoMode;
    saveState.promptsToRedo = promptsToRedo;
    saveState.redoNumArray = redoNumArray;
    saveState.indexArray = indexArray;
    saveState.dotMatrix = dotMatrix;
    
    var myJSONText = JSON.stringify(saveState);
    
    NativeBridge.call("saveState",saveState);
    
    // Now call NativeBridge to save the values (must be done on native side)
    
}

function randomExercise(notThisOne, prevExNum) {
    //salert("in randomExercise:  notThisOne:  " + notThisOne + ", prevExNum: " + prevExNum);
    var randdex =  Math.floor(Math.random()*(theLesson.exerciseArray).length);
    
    if ((theLesson.exerciseArray).length > 2) {
        while (randdex == notThisOne || randdex == prevExNum) {
            //alert("randdex: " + randdex);
            randdex =  Math.floor(Math.random()*(theLesson.exerciseArray).length); }}
    // Update question
    // First save state
    saveProgramState();
    //alert("will set currentExercise:  randdex:  " + randdex);
    if ((randdex >= theLesson.exerciseArray.length) || (randdex < 0)) {
        alert("BONOBO cannot load exerciseNumber:  " + randdex + ", theLesson.length:  " + theLesson.exerciseArray.length);
    }
    //alert("BONOBO will load: randdex:  " + randdex);
    prevExNum = GetExNum();
    currentExercise = theLesson.exerciseArray[randdex];
    setCurrentExercise(currentExercise);
}


// Go to next exercise by updating the current question and answer
function backDoorUpdateExercise(newExNum) {
    // if newExNum is too big for the exercise array, set it to the last index of the array
    if (newExNum >= (theLesson.exerciseArray).length) {
        newExNum = theLesson.exerciseArray.length - 1; }
    // proceed from the new exercise onward.
    step = newExNum;
    unRandomizeExes();
    // Update question
    // First save state
    saveProgramState();
    if ((newExNum >= theLesson.exerciseArray.length) || (newExNum < 0)) {
        alert("CANTALOUPE cannot load exerciseNumber:  " + newExNum + ", theLesson.length:  " + theLesson.exerciseArray.length); }
    currentExercise = theLesson.exerciseArray[newExNum];
    setCurrentExercise(currentExercise);
}

function updateExercise()
{
 	// Update question
    // First save state
    saveProgramState();
    //alert("in updateExercise: redoMode: " + redoMode);
    if(redoMode) {
        //alert("in updateExercise:  found redoMode: ");
        // When were in redoMode we work off the promptsToRedo which has the indices of the prompts we need to redo
        // instead of the indexArray indices.
        // If there's only one item to redo, alternate with random exercises.
        // need boolean variable to keep track of whether the jitter has happened yet or not.
        if (promptsToRedo.length == 1 && jitterNext == true) {
            //alert("AARDVARK will jitter");
            randomExercise(promptsToRedo[0], prevExNum);
            didJitter = true;
        } else {
            //alert("in updateExercise: will set currentExercise: step: " + step);
            if ((promptsToRedo[step] >= theLesson.exerciseArray.length) || (promptsToRedo[step] < 0)) {
                alert("DAFFODIL cannot load exerciseNumber:  " + promptsToRedo[step] + ", theLesson.length:  " + theLesson.exerciseArray.length);
            }
            currentExercise = theLesson.exerciseArray[promptsToRedo[step]]; }
    }else{
        if ((indexArray[step] >= theLesson.exerciseArray.length) || (indexArray[step] < 0)) {
            alert("ELEPHANT cannot load exerciseNumber:  " + indexArray[step] + ", theLesson.length:  " + theLesson.exerciseArray.length);
        }
        if (step >= indexArray.length) {
            alert("ELEPHANT step:  " + step);
            alert("ELEPHANT will load: indexArray[step]:  " + indexArray[step]); }
      currentExercise = theLesson.exerciseArray[indexArray[step]]; }
    
    setCurrentExercise(currentExercise);
    //alert("leaving updateExercise: ");
}

// Plays sound
function playSound(soundID)
{
	document.getElementById(soundID).play(); }

// When the page is finished loading, run this function
function appLoaded()
{
	$("#loadingScreen").hide();
    
    //if(typeof lessonFileName != "undefined") {
        //alert("lessonFileName: " + lessonFileName);
    //}
    //alert("inside appLoaded");
    NativeBridge.call("lessonLoaded");
}

//Check for polite mode
function NotPolite(theFeedbackType)
{
    //if(theFeedbackType.indexOf("polite") !== -1 && theFeedbackType.indexOf("Polite") !== -1)
    if (theFeedbackType == "subjectRequest") { return false; }
    if(theFeedbackType.indexOf("polite") == -1 && theFeedbackType.indexOf("Polite") == -1)
    { //alert("not polite: ");
        return true; }
    //alert("polite: ");
    return false;
}

// Original GT stuff
function MetaDetermineFeedback()
{
    //first, you need to collect your data about the current exercise number, the current exercise, and the current score
    //you can do this using code like this:
    //alert("in MetaDetermineFeedback: ");
    
	var exNum = GetExNum();
    //alert("in MetaDetermineFeedback:  about to getLessonNumber: ");
    var lessonNumber = getLessonNumber();
    //alert("back from getLessonNumber:  " + lessonNumber);
    var currentExercise = new GetExercise(exNum); //see function below
    //alert("about to GetScore:");
    
	var score = GetScore(); //see function below
    //alert("back from GetScore: " + score);
    //next you need to determine whether this is the user's first time through an exercise--see code below
	var status = GetStatus();  // always returns "freshAnswer". Why? I don't know i didn't write it.
    //alert("back from GetStatus: " + status);
    //next, get the user's response from the responseBox and clean it up:

    var response = buildResponse(currentAnswerWords);
  
    //next, turn this response into an array of words, in the order given
	var tokenizedResponse = TokenizeResponse(response);
    //alert("back from TokenizedResponse:");
    //next, call DetermineFeedback with response and tokenizedResponse as arguments
    //alert("will call DetermineFeedback: ");
	var feedbackTuple = DetermineFeedback(response, tokenizedResponse, currentExercise, exNum, score, status);
    //alert("back from DetermineFeedback: ");
    //feedBackTuple consists of the following pieces of information:
	var feedbackType = feedbackTuple[1];
	var wordButtonMarkingInfo = feedbackTuple[2];
	var message = feedbackTuple[3];
	var points = feedbackTuple[4];
    //alert("the type of feedback is: " + feedbackType);
    //alert("the feedback message is: " + message);
    
    sendDebug(feedbackTuple, message, feedbackType, exNum);
    
    //alert("about to send values:  ");
	sendValues(feedbackType, response, points, exNum, lessonNumber);
    //alert("back from sendValues:  ");
	
	//alert("your word button marking info is " + wordButtonMarkingInfo);  //if its undefined there are no words to maark
	//alert("the number of points the user has is: " + points);
	
	// Write the message to the feedback box
	//$("#answerFeedbackBox p").html(message);
	   
    //### using your code, print out the message (which is in html code) and the points
    //depending on what sort of feedback this is, different outputs are necessary
    if ((feedbackType != "CorrectAnswer") && NotPolite(feedbackType)) { numWrong += 1; }
    if (feedbackType == "CorrectAnswer" || !(NotPolite(feedbackType))) { numWrong = 0; }
    //alert("numWrong:  " + numWrong);
	if (feedbackType == "CorrectAnswer")
    {
        //alert("found correct answer:  redoMode:  " + redoMode + ", promptsToRedo.length: " + promptsToRedo.length + ", jitterNext: " + jitterNext);
        //alert("found correct answer: ");
        if (redoMode) {
            //alert("in redoMode: redoNum at index:  " + redoNumArray[index]);
            if ((promptsToRedo.length > 1) || ((promptsToRedo.length == 1) && (jitterNext == false))) {
                if (promptsToRedo.length == 1) { jitterNext = true; }
                var index = GetExNum();
                //alert("about to get index to decrement: index:  " + index + ", length of redoNumArray: " + redoNumArray.length);
                //alert("will decrement redoNum at index:  " + index + " from: " + redoNumArray[index]);
                // must redo the incorrect answer twice.
                // decrement number of times the exercise must be redone.
                
                redoNumArray[index] = redoNumArray[index] - 1;
                if (redoNumArray[index] <= 0) {
                    removed = promptsToRedo.splice(step, 1);
                    //dotMatrix[exNum] = DOT_CORRECT;
                    dotMatrix[index] = DOT_CORRECT;
                    saveProgramState();
                    if (promptsToRedo.length == 0) {
                        return;
                    }}
                else { dotMatrix[exNum] = DOT_INCOMPLETE; }
            }
            if (didJitter) {
                jitterNext = false;
                didJitter = false; }
        }
       
		//if the answer is correct, move on to the next exercise
		//####your code for moving on to the next exercise goes here!
        //alert("The answer is correct.");
        else { // not in redo mode.
            //alert("will set DOT_CORRECT");
            if (dotMatrix[exNum] != DOT_WRONG) { dotMatrix[exNum] = DOT_CORRECT; }
            saveProgramState(); }
        // Display the correct answer feedback
        //$("#answerFeedbackBox p").html("Your answer is correct!");
        return;
    }
    
    if ((feedbackType == "wrongWords")|| (feedbackType == "wrongWordsPolite"))
    {
		
        //alert("found wrong words feedback type.");
        //if( dotMatrix[exNum] != DOT_CORRECT && NotPolite(feedbackType))
    
        //{
        if (NotPolite(feedbackType)) {
            //alert("about to pushPromptToRedo: exNum:  " + exNum);
            pushPromptToRedo(exNum); }
        
        // Write the message to the feedback box
        $("#answerFeedbackBox p").html(message);
        //if there are wrong words in the answer, the array wordButtonMarkingInfo tells you which words need to be in red
        setWrongWordsRed(currentAnswerWords, tokenizedResponse, wordButtonMarkingInfo);
        
    }
	if (feedbackType == "pronounAntecedentFeedback")
    {
        //if( dotMatrix[exNum] != DOT_CORRECT && NotPolite(feedbackType) )
        if (NotPolite(feedbackType))
            { pushPromptToRedo(exNum); }
		var convertToFullNPList = wordButtonMarkingInfo[0];  //convertToFullNPList tells you which words need to be in red
		var convertToPronounList = wordButtonMarkingInfo[1]; //convertToPronounList tells you which words need to be in orange
		//####your button-changing code goes here!
        //alert("Pronoun Antecedent Feedback.");
        
        // Display the feedback
        $("#answerFeedbackBox p").html("Change the word in red to non-pronoun and/or change the word in orange to pronoun.");
        
        var fullNPNumbers = new Array();
        var pronounNumbers = new Array();
        
        for( var i = 0; i < tokenizedResponse.length; i++ )
        {
            for( var j = 0; j < convertToFullNPList.length; j++ )
            {
                if( tokenizedResponse[i] == convertToFullNPList[j] )
                { fullNPNumbers.push(i); } }
            
            for( var k = 0; k < convertToPronounList.length; k++ )
            {
                if( tokenizedResponse[i] == convertToPronounList[k] )
                { pronounNumbers.push(i); } }
        }
        
        // Change the background color of wrong words to red
        for( var l = 0; l < fullNPNumbers.length; l++ ) {
        // dark red
        $("#answer_" + fullNPNumbers[l]).css("background", "#990000 url(img/watercolorTextureTransparent.png) repeat"); }
        
        // Change the background color of wrong words to orange
        for( var m = 0; m < pronounNumbers.length; m++ ) {
        // raw sienna
        $("#answer_" + pronounNumbers[m]).css("background", "#cc6600 url(img/watercolorTextureTransparent.png) repeat"); }
    }
	if (feedbackType == "morphologyFeedback")
    {
        //alert("morphologyFeedback: step:  " + step + ", notPolite:  " + NotPolite(feedbackType));
        //if( dotMatrix[exNum] != DOT_CORRECT && NotPolite(feedbackType) )
        if(NotPolite(feedbackType))
            { pushPromptToRedo(exNum); }
        //alert("back from pushPromptToRedo: ");
		var wrongForms = wordButtonMarkingInfo[0];  //wrongForms tell you which buttons need to be in orange ("is" instead of "are")
		var wrongEndings = wordButtonMarkingInfo[1]; //wrongEndings tells you which buttons need the ending to be in red (for example girl<red>s</red>)
        //Use the GetStem(word) to figure out which part of the word button NOT to be in red:
        //e.g., GetStem("girls") = "girl", and what comes after "girl" ("s") is what needs to be in read.
        
		var needEndings = wordButtonMarkingInfo[2];  //needEndings tells you which buttons need a red __  (for example girl_ if we want "girls")
		var wrongFormAndEnding = wordButtonMarkingInfo[3]; // wrongFormAndEnding tells you which word stems need to be in orange and which word endings need to be in red
        //use GetStem(word) again for this
		//####your button-changing code goes here!
        //alert("Morphology Feedback.");
       
          
        // Write the message to the feedback box
        //$("#answerFeedbackBox p").html(message);
        
        if( wrongFormAndEnding.length > 0 )
        {
            $("#answerFeedbackBox p").html("One or more words have wrong forms and endings. Change the word in orange");
        }
        else if( needEndings.length > 0 )
        {
            $("#answerFeedbackBox p").html("One or more words need endings. Change the words with red underscore");
        }
        else if( wrongEndings.length > 0 )
        {
            $("#answerFeedbackBox p").html("One or more words have wrong endings. Change the words with red endings.");
        }
        else
        {
            $("#answerFeedbackBox p").html("One or more words have wrong forms. Change the words in orange.");
        }
       
        
        var wrongFormNumbers = new Array();
        var wrongEndingNumbers = new Array();
        var needEndingNumbers = new Array();
        var wrongFormAndEndingNumbers = new Array();
        
        for( var i = 0; i < tokenizedResponse.length; i++ )
        {
            for( var j = 0; j < wrongForms.length; j++ )
            {
                if( tokenizedResponse[i] == wrongForms[j] )
                { wrongFormNumbers.push(i); } }
            
            for( var k = 0; k < wrongEndings.length; k++ )
            {
                if( tokenizedResponse[i] == wrongEndings[k] )
                { wrongEndingNumbers.push(i); } }
            
            for( var l = 0; l < needEndings.length; l++ )
            {
                if( tokenizedResponse[i] == needEndings[l] )
                { needEndingNumbers.push(i); } }
            
            for( var m = 0; m < needEndings.length; m++ )
            {
                if( tokenizedResponse[i] == needEndings[m] )
                { needEndingNumbers.push(i); } }
        }
        
        // Change the background color of wrong words to orange
        for( var a = 0; a < wrongFormNumbers.length; a++ )
        {
            $("#answer_" + wrongFormNumbers[a]).css("background", "#cc6600 url(img/watercolorTextureTransparent.png) repeat"); // raw sienna
        }
        
        // Change the background color of wrong words to red
        for( var b = 0; b < wrongEndingNumbers.length; b++ )
        {
            var stemWord = GetStem(String(tokenizedResponse[wrongEndingNumbers[b]]));
            //alert("Stem word: " + stemWord);
            var targetEnding = tokenizedResponse[wrongEndingNumbers[b]].substr(stemWord.length);
            //alert("Extra ending: " + targetEnding);
            $("#answer_" + wrongEndingNumbers[b]).html(stemWord + "<span style=\"color:#990000\">" + targetEnding + "</span>"); // dark red
            //$("#answer_" + wrongEndingNumbers[b]).css("background", "#990000 url(img/watercolorTextureTransparent.png) repeat");
        }
        
        // Change the background color of wrong words to #990099
        for( var c = 0; c < needEndingNumbers.length; c++ )
        {
            //$("#answer_" + needEndingNumbers[c]).html(mainWord + "<span style=\"color:#990000\">" + _ + "</span>");
            $("#answer_" + needEndingNumbers[c]).append("<span style=\"color:#990000\">_</span>"); // dark red
        }
        
        // Change the background color of wrong words to #22ff00; BYR would be bright green!
        for( var d = 0; d < wrongFormAndEndingNumbers.length; d++ )
        {
            var stemWord = GetStem(String(tokenizedResponse[wrongEndingNumbers[d]]));
            var targetEnding = tokenizedResponse[wrongEndingNumbers[d]].substr(stemWord.length);
            $("#answer_" + wrongFormAndEndingNumbers[d]).html(stemWord + "<span style=\"color:#990000\">" + targetEnding + "</span>"); // dark red
            $("#answer_" + wrongFormAndEndingNumbers[d]).css("background", "#ff9900 url(img/watercolorTextureTransparent.png) repeat"); // orange
        }
    }
	if (feedbackType == "articleFeedback")
    {
        //if( dotMatrix[exNum] != DOT_CORRECT && NotPolite(feedbackType) )
        if (NotPolite(feedbackType))
            { pushPromptToRedo(exNum); }
		var nounWithWrongArticleList = wordButtonMarkingInfo[0];  //nounWithWrongArticleList tells you which buttons need to be in red
		var nounMissingAnArticleList = wordButtonMarkingInfo[1]; //nounMissingAnArticleList tells you which buttons need to be in orange
		//####your button-changing code goes here!
        //alert("articleFeedback");
        
        // Write the message to the feedback box
        $("#answerFeedbackBox p").html(message);
        //$("#answerFeedbackBox p").html("Remove/change the articles in red / add articles before the words in orange.");
        
        var nounWithWrongArticleNumbers = new Array();
        var nounMissingAnArticleNumbers = new Array();
        
        for( var i = 0; i < tokenizedResponse.length; i++ )
        {
            for( var j = 0; j < nounWithWrongArticleList.length; j++ )
            {
                if( (tokenizedResponse[i] == nounWithWrongArticleList[j]) && (i != 0) )
                {
                    if( (tokenizedResponse[i-1] == "a") || (tokenizedResponse[i-1] == "an") || (tokenizedResponse[i-1] == "the") )
                        nounWithWrongArticleNumbers.push(i-1); } }
            
            for( var k = 0; k < nounMissingAnArticleList.length; k++ )
            {
                if( tokenizedResponse[i] == nounMissingAnArticleList[k] )
                {
                    nounMissingAnArticleNumbers.push(i); } }
        }
        
        // Change the background color of wrong words to red
        for( var l = 0; l < nounWithWrongArticleNumbers.length; l++ )
        {
            $("#answer_" + nounWithWrongArticleNumbers[l]).css("background", "#990000 url(img/watercolorTextureTransparent.png) repeat");
            // dark red
        }
       /*
        // Change the background color of wrong words to yellow
        for( var m = 0; m < nounMissingAnArticleNumbers.length; m++ )
        {
            $("#answer_" + nounMissingAnArticleNumbers[m]).css("background", "#cc6600 url(img/watercolorTextureTransparent.png) repeat");
            // raw sienna
        }
        */
        // Change the background color of words missing articles to blue
        for( var m = 0; m < nounMissingAnArticleNumbers.length; m++ )
        {
            $("#answer_" + nounMissingAnArticleNumbers[m]).css("background", "#0aaaf5 url(img/watercolorTextureTransparent.png) repeat");
            // raw sienna
        }
        
    }
	if (feedbackType == "strandedArticle")
    {
        //if( dotMatrix[exNum] != DOT_CORRECT && NotPolite(feedbackType) )
        if (NotPolite(feedbackType) )
            { pushPromptToRedo(exNum); }
		var strandedArticle = wordButtonMarkingInfo[0];  //tells you which word needs to be in red
		var articleIndex = wordButtonMarkingInfo[1]; //tells you which position this word has in the sequence of words that the user inputted (starts at 0)
		//####your button-changing code goes here!
        //alert("strandedArticle: " + strandedArticle + ", articleIndex:  " + articleIndex);
       
        
        // Write the message to the feedback box
        $("#answerFeedbackBox p").html(message);
        //$("#answerFeedbackBox p").html("You have one or more unnecessary articles. Remove them.");
        
        // Change the background color of wrong words to red
        /*
        for(var i = 0; i < articleIndex.length; i++)
        {
            $("#answer_" + articleIndex[i]).css("background", "#990000 url(img/watercolorTextureTransparent.png) repeat");
        }
         */
        $("#answer_" + articleIndex).css("background", "#990000 url(img/watercolorTextureTransparent.png) repeat");
        
    }
	if (feedbackType == "syntaxFeedback")
    {
        //if( dotMatrix[exNum] != DOT_CORRECT )
        //{
            pushPromptToRedo(exNum); //}

		var orderIndeces = wordButtonMarkingInfo; //orderIndeces gives you pairs of starting and ending points for word sequences that need to be in red
        //the lowest index is 0
		//####your button-changing code goes here!
        //alert("Syntax Problem.");
         
        // Write the message to the feedback box
        //$("#answerFeedbackBox p").html(message);
        $("#answerFeedbackBox p").html("Some of your words are in the wrong order. Change the order of the words in red.");
        
        // Change the background color of wrong words to red
        for(var i = 0; i < orderIndeces.length; i++)
        {
            var firstOrderNumber = Number(orderIndeces[i][0]);
            var lastOrderNumber = Number(orderIndeces[i][1]);
            //alert("orderIndeces[" + i + "]: " + orderIndeces[i]);
            //alert("firstOrderNumber: " + firstOrderNumber);
            //alert("lastOrderNumber: " + lastOrderNumber);
            for( var j = firstOrderNumber; j <= lastOrderNumber; j++ )
            {
                $("#answer_" + j).css("background", "#990000 url(img/watercolorTextureTransparent.png) repeat"); // dark red
            }
        }
    }
    
    if ((feedbackType == "missingWordsPolite") || (feedbackType == "subjectRequest") || (feedbackType == "wrongWordsPolite") || (feedbackType == "missingWords"))
    {
        //alert("in businessLogic:  looking at feedbackType echidna:");
        var missingWordsList = wordButtonMarkingInfo;
        //alert("Missing words: " + missingWordsList);
        
        //if( dotMatrix[exNum] != DOT_CORRECT && NotPolite(feedbackType) )
        if( NotPolite(feedbackType) )
        { pushPromptToRedo(exNum); }
                    
        // Write the message to the feedback box
        $("#answerFeedbackBox p").html(message);
        
        // Write the message to the feedback box
        //$("#answerFeedbackBox p").html("The following words are missing:");
        for( var i = 0; i < missingWordsList.length; i++ )
        {
            if( (i == missingWordsList.length - 1) && (missingWordsList.length > 1) )
            {
                $("#answerFeedbackBox p").append(" and"); }
            $("#answerFeedbackBox p").append(" <span style=\"color:#990000\">" + missingWordsList[i] + "</span>"); // dark red
            if( i < (missingWordsList.length - 1) )
            {
                $("#answerFeedbackBox p").append(","); }
        }
        $("#answerFeedbackBox p").append(".");
    }
    // if we're here, the answer was wrong.
    lessonIndex = getLessonIndex();
    //alert("lessonIndex: " + lessonIndex);
    //alert("theLesson.name3:  " + theLesson.name3);
    if ((numWrong >= maxWrong) && (lessonIndex > 0) && (theLesson.name3 != "Hints")) {
        alert("number of wrong answers is " + numWrong + ": will return to previous phase:");
        toPreviousLesson(); }
}

function setWrongWordsRed(currentAnswerWords, tokenizedResponse, wordButtonMarkingInfo) {

    var wrongAnswerNumbers = new Array();

    // If there is at least one answer word

    if( currentAnswerWords.length != 0 )
    {
    for( var i = 0; i < wordButtonMarkingInfo.length; i++ ) {
            for( var j = 0; j < tokenizedResponse.length; j++ ) {
            // If the word in the user's answer and the wrong answer word matches
            if( tokenizedResponse[j] == wordButtonMarkingInfo[i] ) {
                // Then add the element number of the user's answer array into the wrongAnswerWords array
                wrongAnswerNumbers.push(j); }}}
    
    // Change the background color of wrong words to red
        //alert("will set wrong words to red");
    for(var k = 0; k < wrongAnswerNumbers.length; k++) {
    $("#answer_" + wrongAnswerNumbers[k]).css("background", "#990000 url(img/watercolorTextureTransparent.png) repeat"); // dark red
    }}
}

function buildResponse(currAnsWor) {
    var tempSentenceArray = currAnsWor;
    
	if( tempSentenceArray[0] != "I" ) {
		tempSentenceArray[0] = String(tempSentenceArray[0]).toLowerCase(); }
	var tempSentence = tempSentenceArray.join(" ");
	var resp = tempSentence;
	resp += ".";
    
    return resp;
}

function GetExNum() {
    if (typeof currentExercise.exnum != "undefined") {
        // alert("found exnum: " + currentExercise.exnum);
        // subtract 1 because array indices begin at 0 but exnums begin at 1.
        return (currentExercise.exnum - 1);
    }
    alert("missing exnum field in .json file:");
    return step; }

function getLessonNumber() {
    if (typeof theLesson.lessonNumber != "undefined") {
        // alert("found exnum: " + currentExercise.exnum);
        // subtract 1 because array indices begin at 0 but exnums begin at 1.
        return (theLesson.lessonNumber);
    }
    alert("missing lessonNumber field in .json file:");
    return step; }

function GetExercise(exerciseNumber)
{
    //alert("inside GetExercise: ");
    //you need all these fields for the feedback code to work, exen if you keep them empty
	//this.choices = new Array();
	this.untokenizedAnswersList = new Array();
	this.pronounNounLists = new Array(); //####this field specifies cases where pronouns or nouns are required--you may need to use it
	this.specialWordsList = new Array();
	this.specialWordsTriggers = new Array();
	this.subjectRequest = new Array();
	this.unneededWords = new Array();
	this.replaceSubject = new Array();
	this.startWords = new Array();
    //this is just one sample exercise: you need to alter this for your specific exercises
    
    // indexArray - is used to radomize the exercise
    // exerciseNumber - is a one up index
    
    var theCurrentExercise;
    
    if ((exerciseNumber >= theLesson.exerciseArray.length) || (exerciseNumber < 0)) {
        alert("AARDVARK cannot load exerciseNumber:  " + exerciseNumber + ", theLesson.length:  " + theLesson.exerciseArray.length);
    }
    //alert("AARDVARK will load:  exerciseNumber:  " + exerciseNumber);
    theCurrentExercise = theLesson.exerciseArray[exerciseNumber];
    
    if(typeof theCurrentExercise.multipleChoice != 'undefined') {
        this.choices = theCurrentExercise.multipleChoice; }
    
    if(typeof theCurrentExercise.answers != 'undefined') {
        this.untokenizedAnswersList = theCurrentExercise.answers; }
    
    if(typeof theCurrentExercise.pronounNounLists != 'undefined') {
        this.pronounNounLists = theCurrentExercise.pronounNounLists; }
    
    if(typeof theCurrentExercise.specialWordsList != 'undefined') {
        this.specialWordsList = theCurrentExercise.specialWordsList; }
    
    if(typeof theCurrentExercise.specialWordsTriggers != 'undefined') {
        this.specialWordsTriggers = theCurrentExercise.specialWordsTriggers; }
    
    if(typeof theCurrentExercise.subjectRequest != 'undefined') {
        this.subjectRequest = theCurrentExercise.subjectRequest; }
    
    if(typeof theCurrentExercise.unneededWords != 'undefined') {
        //alert("found unneeded words: " + theCurrentExercise.unneededWords[0]);
        this.unneededWords = theCurrentExercise.unneededWords; }
    
    if(typeof theCurrentExercise.replaceSubject != 'undefined') {
        this.replaceSubject = theCurrentExercise.replaceSubject; }
    
	this.answersList = TokenizeEachAnswer(this.untokenizedAnswersList);
	this.allAnswersList = this.answersList;
	this.wordsLists = GetWordsLists(this.answersList);
	this.allWordsLists = this.wordsLists;
	//if (this.choices.length > 0) this.type = "multiple_choice";
}

function GetScore()
{
    //your code for getting the user's current score goes here; for now, I'm just returning 0
	return 0; }

function GetStatus()
{
	return "freshAnswer"; }
	//return "editedAnswer";
