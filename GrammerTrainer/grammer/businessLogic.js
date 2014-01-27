
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
                  
                  // Menu button
                  $("#menuButton").click(function(){ showMenu(); });
                  
                  // Submit button
                  $("#answerContainer #submitButton").click(function(){ submitAnswer(); });
                  
                  // Multiple choice button
                  // BYR AFAIK this code is not used.
                 // $("#multipleChoiceContainer #multipleChoiceTab").click(function(){
                      // Function for the multiple choice button
                   //   document.getElementById("multipleChoiceTab").style.backgroundColor = "#7f3b1b"; // reddish-brown
                     // document.getElementById("multipleChoiceTab").style.color = "#ffffff"; // white
                     // ("#imageAnimationContainer").hide();
                      //alert ("wombat will show multiple choice");
                     // $("#multipleChoiceDisplay").show();
                      //$("#multipleChoiceBox").show();
                      //});
                  
                  // BYR AFAIK this code is not used.
                  //$("#multipleChoiceCloseBtn").click(function(){
                    //  document.getElementById("multipleChoiceTab").style.backgroundColor = "#fdd79e"; // orangey-beige
                      //document.getElementById("multipleChoiceTab").style.color = "#522611"; // dark brown
                      //$("#imageAnimationContainer").show();
                      //$("#multipleChoiceDisplay").hide();
                      //$("#multipleChoiceBox").hide();
                      //});
                  
                  });


// Lesson Number
var currentLessonNumber;
// Exercise Number
var currentExerciseNumber;

// Words for the current answer
var currentAnswer = "";
// Current word being dragged
var currentWord;

// Redo mode
var redoMode = false;
// An array of incorrectly answered prompts to redo
var promptsToRedo;
// Current redo prompt track
var currentRedoPromptNumber;

// Array of answer words
var currentAnswerWords;
var draggableAnswerWords;

var theLesson;
var indexArray;        // these get initialized by initDataModel.js
var step;
var currentExercise;
var nounWords;
var verbWords;
var adjectiveWords;
var pronounWords;

// Dot Array
var dotMatrix;

// Constants for the dots
const DOT_INCOMPLETE = 0;
const DOT_WRONG = 1;
const DOT_CORRECT = 2;

// Preload the dot images
var dotImageYellow = new Image(20,20);
dotImageYellow.src = "img/yellowDot.png";
var dotImageRed = new Image(20,20);
dotImageRed.src = "img/redDot.png";
var dotImageGreen = new Image(20,20);
dotImageGreen.src = "img/greenDot.png";

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
		
		// Make all words in the answer array lower case
		for( var i = 0; i < currentAnswerWords.length; i++ )
		{
			// Except these following words
			if( (currentAnswerWords[i] !== "I") )
			{
				//alert("Current word in check: " + currentAnswerWords[i]);
				var targetWordForLowerCase = currentAnswerWords[i].toLowerCase();
				currentAnswerWords[i] = targetWordForLowerCase;
			}
		}
		
		// The first letter of the word must be capital
		if( currentAnswerWords.length > 0 )
		{
			//alert("Constructor: " + currentAnswerWords[0].constructor);
			var capitalLetter = currentAnswerWords[0].substring(0,1).toUpperCase();
			//alert("Capital letter: " + capitalLetter);
			var firstAnswerWord = capitalLetter + currentAnswerWords[0].substring(1);
			currentAnswerWords[0] = firstAnswerWord;
		}
		
		// Add the first removable answer word
		$("#droppableAnswerBox p").html("<div class=\"draggableWord\" id=\"answer_" + tempAnswerID + "\" style=\"position:absolute; padding:6px; left:" + tempLeftPosition + "px\">" + currentAnswerWords[0] + "</div>");
		draggableAnswerWords[0] = new webkit_draggable('answer_0', {revert : false, onStart : function(){currentWord = currentAnswerWords[0];}, onEnd : function(){moveAnswer(0);}});
		
		tempLeftPosition += document.getElementById("answer_0").offsetWidth + 2;
		
		// Add more removable answer words
		for( var i = 1; i < currentAnswerWords.length; i++ )
		{
			//$("#droppableAnswerBox").css("display", "inline");
			tempAnswerID = i;
			//var tempNumberForDrag = i;
			$("#droppableAnswerBox p").append("<div class=\"draggableWord\" id=\"answer_" + tempAnswerID + "\" style=\"position:absolute; padding:6px; left:" + tempLeftPosition + "px\">" + currentAnswerWords[i] + "</div>");
			var tempAnswerString = "answer_" + tempAnswerID;
			draggableAnswerWords[i] = new webkit_draggable('answer_' + i, {revert : false, onStart : function(){currentWord = currentAnswerWords[i];}, onEnd : function(i){return function() {moveAnswer(i);}} (i)});
			tempLeftPosition += document.getElementById(tempAnswerString).offsetWidth + 2;
			//alert("Current left position of answer_" + i + " is " + tempLeftPosition + "!");
		}
        
        $("#speechBubble p").html(currentAnswerWords.join(" "));
        
		// Add period
		tempAnswerID++;
		$("#droppableAnswerBox p").append("<div class=\"draggableWord\" id=\"answer_" + tempAnswerID + "\" style=\"position:absolute; padding:6px; left:" + tempLeftPosition + "px\">" + "." + "</div>");
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
   	
	// Make all words in the answer array lower case
	for( var i = 0; i < currentAnswerWords.length; i++ )
	{
		// Except these following words
		if( (currentAnswerWords[i] !== "I") )
		{
			var targetWordForLowerCase = currentAnswerWords[i].toLowerCase();
			currentAnswerWords[i] = targetWordForLowerCase; }
	}
	
	// The first letter of the word must be capital
	if( currentAnswerWords.length > 0 )
	{
		var capitalLetter = currentAnswerWords[0].substring(0,1).toUpperCase();
		var firstAnswerWord = capitalLetter + currentAnswerWords[0].substring(1);
		currentAnswerWords[0] = firstAnswerWord;
	}
	
	// Add the first removable answer word
	$("#droppableAnswerBox p").html("<div class=\"draggableWord\" id=\"answer_0\" style=\"position:absolute; padding:6px; left:" + tempLeftPosition + "px\">" + currentAnswerWords[0] + "</div>");
	draggableAnswerWords[0] = new webkit_draggable('answer_0', {revert : false, onStart : function(){currentWord = currentAnswerWords[0];}, onEnd : function(){moveAnswer(0);}});
	
	tempLeftPosition += document.getElementById("answer_0").offsetWidth + 2;
	
	// Add more removable answer words
	for( var i = 1; i < currentAnswerWords.length; i++ )
	{
		tempAnswerID = i;
		$("#droppableAnswerBox p").append("<div class=\"draggableWord\" id=\"answer_" + i + "\" style=\"position:absolute; padding:6px; left:" + tempLeftPosition + "px\">" + currentAnswerWords[i] + "</div>");
		var tempAnswerString = "answer_" + i;
		draggableAnswerWords[i] = new webkit_draggable(tempAnswerString, {revert : false, onStart : function(){currentWord = currentAnswerWords[i];}, onEnd : function(i){return function() {moveAnswer(i);}} (i)});
		tempLeftPosition += document.getElementById(tempAnswerString).offsetWidth + 2; }
	
	// Add period
	tempAnswerID++;
	$("#droppableAnswerBox p").append("<div class=\"draggableWord\" id=\"answer_" + tempAnswerID + "\" style=\"position:absolute; padding:6px; left:" + tempLeftPosition + "px\">" + "." + "</div>");
	
	// If there are no words in the answer array, then clear the answer box
	if( currentAnswerWords.length == 0 )
	{ eraseAnswer(); }
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
    $("#speechBubble p").html(" ");
}

//function initAnswer() {
  //  if ((typeof currentExercise.prefill != 'undefined') && (currentExercise.prefill.length > 0)) {
    //    alert("in initAnswer:  found currentExercise defined prefill:  ");

      //  var pre = currentExercise.prefill.trim();
        //var res = pre.split(" ");
        //for (var i = 0; i < res.length; i++) {
          //  alert("will push res[i]: " + res[i]);
            ///currentAnswerWords.push(res[i]);
       // }
        //alert("after initAnswer, length of currentAnswerWords:  " + currentAnswerWords.length);
    //}
//}

function saySomething() {
    
    if(redoMode) {
        // When were in redoMode we work off the promptsToRedo which has the indices of the prompts we need to redo instead of the indexArray indices.
        currentExercise = theLesson.exerciseArray[promptsToRedo[step]];
    }else{
        currentExercise = theLesson.exerciseArray[indexArray[step]]; }
    
    var theElement = "<audio id=\"prompt_" + step + "\" src=\"" + currentExercise.oralprompt + "\"></audio>";
    
    $("body").append(theElement);
    
	playSound("prompt_" + step);    
}


function showMenu()
{
	//alert("Coming Soon...");
    
    NativeBridge.call("showMenu"); }

function sendValues(a, b, c, d)
{
	// Send some values to the navtive side
	// The send arg is an array of arguments
	//for( var i = 0; i &lt; arguments.length; i++ ) {
    //    arguments[ i ] ;
    //}
    
    NativeBridge.call("recordNative", [a,b,c,d]);    
}

function sendDebug(a, b, c, d)
{
    // Send some values to the navtive side
    // The send arg is an array of arguments
    //for( var i = 0; i &lt; arguments.length; i++ ) {
    //    arguments[ i ] ;
    //}
    NativeBridge.call("printDebug", [a,b,c,d]);  
}

// Submit answer
function submitAnswer()
{
	if (currentAnswerWords.length == 0) { return; }
    //var tempSentence = currentAnswerWords.join(" ");
	//tempSentence += ".";
	//DetermineFeedback();
    //alert("about to go to MetaDetermineFeedback: ");
	MetaDetermineFeedback();
    //alert("back from MetaDetermineFeedback: ");
	
	// Update the dot feedback matrix
	updateDotFeedback();
}

// This function is used by encrypted code INTENGINEAP_NEW_E.js
function Noun(word)
{
    var nounArray = new Array("one", "circle", "square", "triangle", "rectangle", "oval", "elipse", "diamond", "shape", "dot", "spot", "stripe", "top", "bottom", "right", "left", "middle", "inside", "outside", "front", "corner", "edge", "arrow", "girl", "boy");
    if (Member(GetRoot(word), nounArray)) return true;
    else return false;
}

// This function is used by encrypted code INTENGINEAP_NEW_E.js
function SuppletiveSets()
{
    var suppletiveSets = new Array();
    suppletiveSets[0] = new Array("be", "is", "are", "am", "was", "were");
    suppletiveSets[1] = new Array("he", "him", "his");
    suppletiveSets[2] = new Array("she", "her", "hers");
    suppletiveSets[3] = new Array("they", "them", "their");
    suppletiveSets[4] = new Array("have", "has");
    return suppletiveSets;
    // …
    // for irregular verbs (including those only irregular in their spelling), comparative adjectives and pronouns (nominative, accusative, possessive,
    // absolute possessive).  The first member should always be the default root form (nominative/simple present/singular/absolutive)
}

// This function is used by encrypted code INTENGINEAP_NEW_E.js
function ParaphraseSets()
{
    var paraphraseSets = new Array();
    paraphraseSets[0] = new Array("under", "underneath", "beneath", "below");
    paraphraseSets[1] = new Array("above", "over");
    paraphraseSets[2] = new Array("in", "inside");
    paraphraseSets[3] = new Array("small", "little");
    paraphraseSets[4] = new Array("smaller", "littler");
    paraphraseSets[5] = new Array("smallest", "littlest");
    paraphraseSets[6] = new Array("big", "large");
    paraphraseSets[7] = new Array("bigger", "larger");
    paraphraseSets[8] = new Array("biggest", "largest");
    paraphraseSets[9] = new Array(".", "!");
    paraphraseSets[10] = new Array("medium", "medium-sized", "medium-size", "mid-size", "mid-sized", "medium sized", "medium size", "mid size", "mid sized");
    paraphraseSets[11] = new Array("oval", "elipse");
    paraphraseSets[12] = new Array("except", "except for", "but", "besides", "save");
    paraphraseSets[13] = new Array("between", "in between");
    paraphraseSets[14] = new Array("close", "near");
    paraphraseSets[15] = new Array("farther", "further");
    paraphraseSets[16] = new Array("gray", "grey");
    paraphraseSets[17] = new Array("color", "colour");
    paraphraseSets[18] = new Array("dot", "spot");
    paraphraseSets[19] = new Array("thin", "narrow");
    paraphraseSets[20] = new Array("beside", "by");
    return paraphraseSets;
    // …
    // A list of paraphraseSets for synonymous stems like may/might or alternative spellings (e.g. of British or American English)
}

// This function is used by encrypted code INTENGINEAP_NEW_E.js
function MajorWords()
{
    var majorWords = new Array("it", "they", "them", "this", "that", "these", "those", "have", "has", "is", "are", "point", "one", "circle", "square", "triangle", "rectangle", "oval", "elipse", "diamond", "shape", "dot", "spot", "stripe", "top", "bottom", "high", "low", "up", "down", "right", "left", "middle", "inside", "outside", "front", "behind", "corner", "edge", "blue", "red", "green", "yellow", "orange", "purple", "color", "colour", "dark", "light", "black", "gray", "grey", "small", "little", "big", "large", "long", "short", "tall", "thin", "narrow", "medium", "medium-size", "medium-sized", "mid-size", "mid-sized",  "medium size", "medium sized", "mid size", "mid sized", "close", "near", "farther", "further", "all", "except", "except for", "beside", "besides", "save", "but", "only", "just", "each", "every", "some", "none", "no", "neither", "both", "by", "girl", "boy", "call", "help");
    return majorWords;
}

// Moves to the next exercise when the user clicks the active next button
function goToNextExercise()
{
	// Count all the green dots
	var greenDotCounter = 0;
	for( var i = 0; i < dotMatrix.length; i++ )
	{
		if( dotMatrix[i] == DOT_CORRECT )
		{ greenDotCounter++; } }
	
	// If all the dots are green, then go to the congratuations page
	if( greenDotCounter >= theLesson.exerciseArray.length )
	{
		//window.location.replace("gt_congratulations.html");
        // For now we just exit out to the native side, but we should add some congratulatons here!
        showMenu(); }
	else
	{
        // All the dots are not green. Were either have not been through all the quesions, or we got some wrong. Determine which.
        // determine if we are in redoMode or if we should move to redoMode
		// If the user is redoing the prompts he/she got wrong
		if( redoMode )
		{
            // We know were already in redo mode
            
//			var lastRedoTrack = promptsToRedo.length - 1;  // Assumption is that you remove items from the promptToRedo array as they are completed. So this would give the index of the last item.
//			alert("Index of Last Redo: " + lastRedoTrack);
//			if( currentRedoPromptNumber < lastRedoTrack ) // The currentRedoPromptNumber is the current index into the promptsToRedo array. But I think were just going to use step.
//			{
//				if( currentRedoPromptNumber != lastRedoTrack )
//				{
//					var currentPromptNumberInRedo = Number(promptsToRedo[currentRedoPromptNumber]);
//					//alert("Current prompt number in redo: " + currentPromptNumberInRedo);
//					var nextPromptNumberInRedo = Number(promptsToRedo[currentRedoPromptNumber + 1]);
//					//alert("Next prompt number in redo: " + nextPromptNumberInRedo);
//					if( currentPromptNumberInRedo >= nextPromptNumberInRedo )
//					{
//						for( var j = 0; j < dotMatrix.length; j++ )
//						{
//							if( dotMatrix[j] == DOT_WRONG )
//							{
//								dotMatrix[j] = DOT_INCOMPLETE;
//							}
//						}
//					}
//				}
//				currentRedoPromptNumber++;
//			}
//			currentExerciseNumber = Number(promptsToRedo[currentRedoPromptNumber]) + 1;
            
            //Note: once your in the redoMode, we should be working off the promptsToRedo array instead of indexArray.
            
            if( currentExerciseNumber < promptsToRedo.length)
			{
                // Nope. Were still on the first round. Advance to next question.
				currentExerciseNumber++;
                step++; }
			else
			{
                // All redo questions have now been answered once. But all dots are not green so stay in redo mode.
				for( var j = 0; j < dotMatrix.length; j++ )
				{
                    // take all the wrong answers and move them to incomplete
					if( dotMatrix[j] == DOT_WRONG )
					{ dotMatrix[j] = DOT_INCOMPLETE; }
				}
				currentRedoPromptNumber = 0;
				currentExerciseNumber = Number(promptsToRedo[0]) + 1;
                step = 0;
			}
		}
		else
		{
			// Check to see if all questions have been asked.
//			var tempExerciseTrack = new Number(currentExerciseNumber - 1);
//			if( tempExerciseTrack < (theLesson.exerciseArray.length - 1) )
            if( currentExerciseNumber < theLesson.exerciseArray.length)
			{
                // Nope. Were still on the first round. Advance to next question.
				currentExerciseNumber++;
                step++;
			}
			else
			{
                // All questions have now been answered once. But all dots are not green so enter redo mode.
                
				redoMode = true;
				for( var j = 0; j < dotMatrix.length; j++ )
				{
                    // take all the wrong answers and move them to incomplete
					if( dotMatrix[j] == DOT_WRONG )
					{ dotMatrix[j] = DOT_INCOMPLETE; }
				}
				currentRedoPromptNumber = 0;
				currentExerciseNumber = Number(promptsToRedo[0]) + 1;
                step = 0;
			}
		}
	}
	
	// Update the page
	updateExercise();
}

function saveProgramState() {
    
    var saveState = new Object();
    saveState.currentLessonNumber = currentLessonNumber;
    saveState.currentExerciseNumber = currentExerciseNumber;
    saveState.step = step;
    saveState.currentAnswer = currentAnswer;
    saveState.currentWord = currentWord;
    saveState.redoMode = redoMode;
    saveState.promptsToRedo = promptsToRedo;
    saveState.currentRedoPromptNumber = currentRedoPromptNumber;
    saveState.indexArray = indexArray;
    saveState.dotMatrix = dotMatrix;
    
    var myJSONText = JSON.stringify(saveState);
    
    NativeBridge.call("saveState",saveState);
    
    // Now call NativeBridge to save the values (must be done on native side)
    
}

// Go to next exercise by updating the current question and answer
// Called when the user hits the Next Button

function updateExercise()
{
	// Update question
    // First save state
    saveProgramState();
    
    if(redoMode) {
        // When were in redoMode we work off the promptsToRedo which has the indices of the prompts we need to redo instead of the indexArray indices.
        currentExercise = theLesson.exerciseArray[promptsToRedo[step]];
    }else{
        currentExercise = theLesson.exerciseArray[indexArray[step]];
    }
    
    if(typeof currentExercise.lessonImage == "undefined") {
        // Lesson uses video
        //setVideo(currentExercise);
        document.getElementById('video').pause();
        $("#video").attr("src", currentExercise.lessonVideo);
        //alert($('#video').attr("src"));
        document.getElementById('video').load();
        //document.getElementById('video').play();
        
      //  if (currentExercise.prompt != "undefined") {
            document.getElementById('questionContainer').innerHTML = "<p>" +  currentExercise.prompt + "</p>"; //}
        //else {
          //  if (currentExercise.question != "undefined") {
            //    document.getElementById('questionContainer').innerHTML = "<p>" +  currentExercise.question + "</p>"; }
            //}
        //}
        
        $("#video_box p").text(currentExercise.question);
        
        setOralPrompt(currentExercise);
        setSpeechBubble(currentExercise);
 
    } else {
        
        //alert("image: " + currentExercise.lessonImage);
        
        // This is a photo
        $("#lessonImage").attr("src", "images/" + currentExercise.lessonImage);
        $("#quoteBox").text(currentExercise.question);
        //$("#quoteBoxAnswer").text(currentExercise.answers[0]);
        $("#questionContainer").text(currentExercise.question);
    }
    
    $("#speechBubble p").html(" ");
    
    // if wordlists are defined at the lesson level, use them;
    // if wordslists are defined at the exercise level, write over the lesson level.
    setWordLists(theLesson);
    setWordLists(currentExercise);
 
    setWordTabs();
    
	// Clear answer feedback box
	$("#answerContainer #answerFeedbackBox p").html("  ");
	//$("#answerContainer #answerFeedbackBox p").html("Your answer has not been submitted yet.");
	
	// Update multiple choices
    setMultipleChoiceBox(currentExercise);
    
	// Update dot feedback
	updateDotFeedback();
	
	// Clear the droppable answer box
	eraseAnswer();
	
	// Disable the next button
	$("#nextButton").html("<a>Next</a>");
	$("#nextButton a").css({"background":"#08324f","color":"#26527c","-webkit-box-shadow":"0 0 0 transparent"});
}

// Update the dot feedback matrix
function updateDotFeedback()
{
	$("#dotContainer").html("");
    
    //alert("dotContainer: " + dotMatrix);
	
	for( var d = 0; d < dotMatrix.length; d++ )
	{
		if( (d % 6 == 0) && (d != 0) )
		{
			$("#dotContainer").append("<br />");
			if(dotMatrix[d] == DOT_INCOMPLETE)
			{
				$("#dotContainer").append("<img class=\"dotImage\" src=\"img/yellowDot.png\" />"); }
			else if(dotMatrix[d] == DOT_WRONG)
			{
				$("#dotContainer").append("<img class=\"dotImage\" src=\"img/redDot.png\" />"); }
			else
			{
				$("#dotContainer").append("<img class=\"dotImage\" src=\"img/greenDot.png\" />"); }
		}
		else
		{
			if(dotMatrix[d] == DOT_INCOMPLETE)
			{
				$("#dotContainer").append("<img class=\"dotImage\" src=\"img/yellowDot.png\" />"); }
			else if(dotMatrix[d] == DOT_WRONG)
			{
				$("#dotContainer").append("<img class=\"dotImage\" src=\"img/redDot.png\" />"); }
			else
			{
				$("#dotContainer").append("<img class=\"dotImage\" src=\"img/greenDot.png\" />"); }
		}
	}
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
    NativeBridge.call("lessonLoaded");
}

//Check for polite mode
function NotPolite(theFeedbackType)
{
    //if(theFeedbackType.indexOf("polite") !== -1 && theFeedbackType.indexOf("Polite") !== -1)
    if (theFeedbackType == "subjectRequest") { return false; }
    if(theFeedbackType.indexOf("polite") == -1 && theFeedbackType.indexOf("Polite") == -1)
    {
        //alert("not polite: ");
        return true; }
    //alert("polite: ");
    return false;
}

// Original GT stuff
function MetaDetermineFeedback()
{
    //first, you need to collect your data about the current exercise number, the current exercise, and the current score
    //you can do this using code like this:
    
	var exnum = GetExNum();
    
	var currentExercise = new GetExercise(exnum); //see function below
    
	var score = GetScore(); //see function below
    //alert("back from GetScore: " + score);
    //next you need to determine whether this is the user's first time through an exercise--see code below
	var status = GetStatus();  // always returns "freshAnswer". Why? I don't know i didn't write it.
    //alert("back from GetStatus: " + status);
    //next, get the user's response from the responseBox and clean it up:
	var tempSentenceArray = currentAnswerWords;
    //var tempSentenceArray = new Array();
    //BYR get rid of prefill here.
    //if ((typeof currentExercise.prefill != 'undefined') && (currentExercise.prefill.length > 0)) {
      //  var pre = currentExercise.prefill.trim();
        //var res = pre.split(" ");
      //  alert("res.length, currentAnswerWords.length:  " + res.length + ", " + currentAnswerWords.length());
       // for (var i = res.length; i < currentAnswerWords.length(); i++) {
         //   tempSentenceArray.push(currentAnswerWords[i]);
        //}
    //}
    //else { tempSentenceArray = currentAnswerWords; }
	if( tempSentenceArray[0] != "I" ) {
		tempSentenceArray[0] = String(tempSentenceArray[0]).toLowerCase(); }
	var tempSentence = tempSentenceArray.join(" ");
	var lowerCaseTempSentence = tempSentence;
	lowerCaseTempSentence += ".";
	//var response = document.getElementById("responsebox").value;
	//alert("Sentence: " + lowerCaseTempSentence);
	var response = lowerCaseTempSentence;
    //next, turn this response into an array of words, in the order given
	var tokenizedResponse = TokenizeResponse(response);
    //next, call DetermineFeedback with response and tokenizedResponse as arguments
    //alert("will call DetermineFeedback: ");
	var feedbackTuple = DetermineFeedback(response, tokenizedResponse, currentExercise, exnum, score, status);
    //alert("back from DetermineFeedback: ");
    //feedBackTuple consists of the following pieces of information:
	var feedbackType = feedbackTuple[1];
	var wordButtonMarkingInfo = feedbackTuple[2];
	var message = feedbackTuple[3];
	var points = feedbackTuple[4];
    //alert("the type of feedback is: " + feedbackType);
    //alert("the feedback message is: " + message);
    
    sendDebug(feedbackTuple,message,feedbackType,exnum);
	
	sendValues(feedbackType,response,points,exnum);
	
	//alert("your word button marking info is " + wordButtonMarkingInfo);  //if its undefined there are no words to maark
	//alert("the number of points the user has is: " + points);
	
	// Write the message to the feedback box
	//$("#answerFeedbackBox p").html(message);
	
	var tempNum; // Index of current question
    
    if(redoMode) {
        // When were in redoMode we work off the promptsToRedo which has the indices of the prompts we need to redo instead of the indexArray indices.
        tempNum = promptsToRedo[step];
    }else{
        tempNum = indexArray[step];
    }
    
    //alert("tempNum:" + tempNum);
    
	// Pinpoints the punctuation at the end of the sentence
	var punctuationPointer = lowerCaseTempSentence.length - 1;
	// Correct answer without the ending punctuation
	var tempLessonAnswersWithoutPunctuation = lowerCaseTempSentence.slice(0, punctuationPointer);
	// An array of current answer words
	var tempAnswersInArray = tempLessonAnswersWithoutPunctuation.split(" ");
    
    //### using your code, print out the message (which is in html code) and the points
    //depending on what sort of feedback this is, different outputs are necessary
	if (feedbackType == "CorrectAnswer")
    {
        
        if(redoMode) {
            // When were in redo mode and we get one correct we remove that index from the promptsToRedo array
            //removes 1 element from index 'step'
            removed = promptsToRedo.splice(step, 1);
        }
        
		//if the answer is correct, move on to the next exercise
		//####your code for moving on to the next exercise goes here!
        //alert("The answer is correct.");
        if( dotMatrix[tempNum] != DOT_WRONG )
        {
            dotMatrix[tempNum] = DOT_CORRECT;
        }
        // Display the correct answer feedback
        $("#answerFeedbackBox p").html("Your answer is correct!");
        // Turn on the next button
        $("#nextButton").html("<a href=\"javascript:goToNextExercise()\">Next</a>");
        $("#nextButton a").css({"background":"#fdd79f url(img/watercolorTextureTransparent.png) repeat","color":"#522611","-webkit-box-shadow":"inset 3px 3px 3px rgba(255,255,255,0.2), inset -3px -3px 3px rgba(0,0,0,0.2)"});
    }
    
    if ((feedbackType == "wrongWords")|| (feedbackType == "wrongWordsPolite"))
    {
		//if there are wrong words in the answer, the array wordButtonMarkingInfo tells you which words need to be in red
		//####your button-changing code goes here!
        //alert("Wrong words.");
        if( dotMatrix[tempNum] != DOT_CORRECT && NotPolite(feedbackType))
        {
            if( dotMatrix[tempNum] != DOT_WRONG )
                promptsToRedo.push(currentExerciseNumber - 1);
            dotMatrix[tempNum] = DOT_WRONG;
        }
        
        // Write the message to the feedback box
        $("#answerFeedbackBox p").html(message);
        
        var wrongAnswerNumbers = new Array();
        
        // If there is at least one answer word
        if( currentAnswerWords.length != 0 )
        {
            for( var i = 0; i < wordButtonMarkingInfo.length; i++ )
            {
                for( var j = 0; j < tempAnswersInArray.length; j++ )
                {
                    // If the word in the user's answer and the wrong answer word matches
                    if( tempAnswersInArray[j] == wordButtonMarkingInfo[i] )
                    {
                        // Then add the element number of the user's answer array into the wrongAnswerWords array
                        wrongAnswerNumbers.push(j);
                    }
                }
            }
            
            // Change the background color of wrong words to red
            for(var k = 0; k < wrongAnswerNumbers.length; k++)
            {
                $("#answer_" + wrongAnswerNumbers[k]).css("background", "#990000 url(img/watercolorTextureTransparent.png) repeat"); // dark red
            }
        }
    }
	if (feedbackType == "pronounAntecedentFeedback")
    {
		var convertToFullNPList = wordButtonMarkingInfo[0];  //convertToFullNPList tells you which words need to be in red
		var convertToPronounList = wordButtonMarkingInfo[1]; //convertToPronounList tells you which words need to be in orange
		//####your button-changing code goes here!
        //alert("Pronoun Antecedent Feedback.");
        if( dotMatrix[tempNum] != DOT_CORRECT && NotPolite(feedbackType) )
        {
            if( dotMatrix[tempNum] != DOT_WRONG )
                promptsToRedo.push(currentExerciseNumber - 1);
            dotMatrix[tempNum] = DOT_WRONG;
        }
        
        // Display the feedback
        $("#answerFeedbackBox p").html("Change the word in red to non-pronoun and/or change the word in orange to pronoun.");
        
        var fullNPNumbers = new Array();
        var pronounNumbers = new Array();
        
        for( var i = 0; i < tempAnswersInArray.length; i++ )
        {
            for( var j = 0; j < convertToFullNPList.length; j++ )
            {
                if( tempAnswersInArray[i] == convertToFullNPList[j] )
                { fullNPNumbers.push(i); }
            }
            
            for( var k = 0; k < convertToPronounList.length; k++ )
            {
                if( tempAnswersInArray[i] == convertToPronounList[k] )
                { pronounNumbers.push(i); }
            }
        }
        
        // Change the background color of wrong words to red
        for( var l = 0; l < fullNPNumbers.length; l++ )
        {
            $("#answer_" + fullNPNumbers[l]).css("background", "#990000 url(img/watercolorTextureTransparent.png) repeat"); // dark red
        }
        
        // Change the background color of wrong words to orange
        for( var m = 0; m < pronounNumbers.length; m++ )
        {
            $("#answer_" + pronounNumbers[m]).css("background", "#cc6600 url(img/watercolorTextureTransparent.png) repeat"); // raw sienna
        }
    }
	if (feedbackType == "morphologyFeedback")
    {
		var wrongForms = wordButtonMarkingInfo[0];  //wrongForms tell you which buttons need to be in orange ("is" instead of "are")
		var wrongEndings = wordButtonMarkingInfo[1]; //wrongEndings tells you which buttons need the ending to be in red (for example girl<red>s</red>)
        //Use the GetStem(word) to figure out which part of the word button NOT to be in red:
        //e.g., GetStem("girls") = "girl", and what comes after "girl" ("s") is what needs to be in read.
        
		var needEndings = wordButtonMarkingInfo[2];  //needEndings tells you which buttons need a red __  (for example girl_ if we want "girls")
		var wrongFormAndEnding = wordButtonMarkingInfo[3]; // wrongFormAndEnding tells you which word stems need to be in orange and which word endings need to be in red
        //use GetStem(word) again for this
		//####your button-changing code goes here!
        //alert("Morphology Feedback.");
        if( dotMatrix[tempNum] != DOT_CORRECT && NotPolite(feedbackType) )
        {
            if( dotMatrix[tempNum] != DOT_WRONG )
                promptsToRedo.push(currentExerciseNumber - 1);
            dotMatrix[tempNum] = DOT_WRONG;
        }
        
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
        
        for( var i = 0; i < tempAnswersInArray.length; i++ )
        {
            for( var j = 0; j < wrongForms.length; j++ )
            {
                if( tempAnswersInArray[i] == wrongForms[j] )
                { wrongFormNumbers.push(i); }
            }
            
            for( var k = 0; k < wrongEndings.length; k++ )
            {
                if( tempAnswersInArray[i] == wrongEndings[k] )
                { wrongEndingNumbers.push(i); }
            }
            
            for( var l = 0; l < needEndings.length; l++ )
            {
                if( tempAnswersInArray[i] == needEndings[l] )
                { needEndingNumbers.push(i); }
            }
            
            for( var m = 0; m < needEndings.length; m++ )
            {
                if( tempAnswersInArray[i] == needEndings[m] )
                { needEndingNumbers.push(i); }
            }
        }
        
        // Change the background color of wrong words to orange
        for( var a = 0; a < wrongFormNumbers.length; a++ )
        {
            $("#answer_" + wrongFormNumbers[a]).css("background", "#cc6600 url(img/watercolorTextureTransparent.png) repeat"); // raw sienna
        }
        
        // Change the background color of wrong words to red
        for( var b = 0; b < wrongEndingNumbers.length; b++ )
        {
            var stemWord = GetStem(String(tempAnswersInArray[wrongEndingNumbers[b]]));
            //alert("Stem word: " + stemWord);
            var targetEnding = tempAnswersInArray[wrongEndingNumbers[b]].substr(stemWord.length);
            //alert("Extra ending: " + targetEnding);
            $("#answer_" + wrongEndingNumbers[b]).html(stemWord + "<span style=\"color:#990000\">" + targetEnding + "</span>"); // dark red
            //$("#answer_" + wrongEndingNumbers[b]).css("background", "#990000 url(img/watercolorTextureTransparent.png) repeat");
        }
        
        // Change the background color of wrong words to #990099
        for( var c = 0; c < needEndingNumbers.length; c++ )
        {
            //var mainWord = tempAnswersInArray[needEndingNumber[c]];
            //$("#answer_" + needEndingNumbers[c]).html(mainWord + "<span style=\"color:#990000\">" + _ + "</span>");
            $("#answer_" + needEndingNumbers[c]).append("<span style=\"color:#990000\">_</span>"); // dark red
        }
        
        // Change the background color of wrong words to #22ff00; BYR would be bright green!
        for( var d = 0; d < wrongFormAndEndingNumbers.length; d++ )
        {
            var stemWord = GetStem(String(tempAnswersInArray[wrongEndingNumbers[d]]));
            var targetEnding = tempAnswersInArray[wrongEndingNumbers[d]].substr(stemWord.length);
            $("#answer_" + wrongFormAndEndingNumbers[d]).html(stemWord + "<span style=\"color:#990000\">" + targetEnding + "</span>"); // dark red
            $("#answer_" + wrongFormAndEndingNumbers[d]).css("background", "#ff9900 url(img/watercolorTextureTransparent.png) repeat"); // orange
        }
    }
	if (feedbackType == "articleFeedback")
    {
		var nounWithWrongArticleList = wordButtonMarkingInfo[0];  //nounWithWrongArticleList tells you which buttons need to be in red
		var nounMissingAnArticleList = wordButtonMarkingInfo[1]; //nounMissingAnArticleList tells you which buttons need to be in orange
		//####your button-changing code goes here!
        //alert("articleFeedback");
        if( dotMatrix[tempNum] != DOT_CORRECT && NotPolite(feedbackType) )
        {
            if( dotMatrix[tempNum] != DOT_WRONG )
                promptsToRedo.push(currentExerciseNumber - 1);
            dotMatrix[tempNum] = DOT_WRONG;
        }
        
        // Write the message to the feedback box
        //$("#answerFeedbackBox p").html(message);
        $("#answerFeedbackBox p").html("Remove/change the articles in red / add articles before the words in orange.");
        
        var nounWithWrongArticleNumbers = new Array();
        var nounMissingAnArticleNumbers = new Array();
        
        for( var i = 0; i < tempAnswersInArray.length; i++ )
        {
            for( var j = 0; j < nounWithWrongArticleList.length; j++ )
            {
                if( (tempAnswersInArray[i] == nounWithWrongArticleList[j]) && (i != 0) )
                {
                    if( (tempAnswersInArray[i-1] == "a") || (tempAnswersInArray[i-1] == "an") || (tempAnswersInArray[i-1] == "the") )
                        nounWithWrongArticleNumbers.push(i-1);
                }
            }
            
            for( var k = 0; k < nounMissingAnArticleList.length; k++ )
            {
                if( tempAnswersInArray[i] == nounMissingAnArticleList[k] )
                {
                    nounMissingAnArticleNumbers.push(i);
                }
            }
        }
        
        // Change the background color of wrong words to red
        for( var l = 0; l < nounWithWrongArticleNumbers.length; l++ )
        {
            $("#answer_" + nounWithWrongArticleNumbers[l]).css("background", "#990000 url(img/watercolorTextureTransparent.png) repeat");
            // dark red
        }
        
        // Change the background color of wrong words to yellow
        for( var m = 0; m < nounMissingAnArticleNumbers.length; m++ )
        {
            $("#answer_" + nounMissingAnArticleNumbers[m]).css("background", "#cc6600 url(img/watercolorTextureTransparent.png) repeat");
            // raw sienna
        }
    }
	if (feedbackType == "strandedArticle")
    {
		var strandedArticle = wordButtonMarkingInfo[0];  //tells you which word needs to be in red
		var articleIndex = wordButtonMarkingInfo[1]; //tells you which position this word has in the sequence of words that the user inputted (starts at 0)
		//####your button-changing code goes here!
        //alert("Stranded Article.");
        if( dotMatrix[tempNum] != DOT_CORRECT && NotPolite(feedbackType) )
        {
            if( dotMatrix[tempNum] != DOT_WRONG )
                promptsToRedo.push(currentExerciseNumber - 1);
            dotMatrix[tempNum] = DOT_WRONG;
        }
        
        // Write the message to the feedback box
        //$("#answerFeedbackBox p").html(message);
        $("#answerFeedbackBox p").html("You have one or more unnecessary articles. Remove them.");
        
        // Change the background color of wrong words to red
        for(var i = 0; i < articleIndex.length; i++)
        {
            $("#answer_" + articleIndex[i]).css("background", "#990000 url(img/watercolorTextureTransparent.png) repeat");
        }
    }
	if (feedbackType == "syntaxFeedback")
    {
		var orderIndeces = wordButtonMarkingInfo; //orderIndeces gives you pairs of starting and ending points for word sequences that need to be in red
        //the lowest index is 0
		//####your button-changing code goes here!
        //alert("Syntax Problem.");
        if( dotMatrix[tempNum] != DOT_CORRECT )
        {
            if( dotMatrix[tempNum] != DOT_WRONG )
                promptsToRedo.push(currentExerciseNumber - 1);
            dotMatrix[tempNum] = DOT_WRONG;
        }
        
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
        
        if( dotMatrix[tempNum] != DOT_CORRECT && NotPolite(feedbackType) )
        {
            if( dotMatrix[tempNum] != DOT_WRONG )
                promptsToRedo.push(currentExerciseNumber - 1);
            dotMatrix[tempNum] = DOT_WRONG; }
        
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
}

function GetExNum() { return step; }

function GetExercise(exerciseNumber)
{
    //you need all these fields for the feedback code to work, exen if you keep them empty
	this.choices = new Array();
	this.untokenizedAnswersList = new Array();
	this.pronounNounLists = new Array();           //####this field specifies cases where pronouns or nouns are required--you may need to use it
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
    
    if(redoMode) {
        // When were in redoMode we work off the promptsToRedo which has the indices of the prompts we need to redo instead of the indexArray indices.
        theCurrentExercise = theLesson.exerciseArray[promptsToRedo[exerciseNumber]];
    }else{
        theCurrentExercise = theLesson.exerciseArray[indexArray[exerciseNumber]];
    }
    
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
    
   //   var subjreqstr = "";
   //   if (this.subjectRequest.length > 0) {
   //       for (var i = 0; i < this.subjectRequest.length; i++) {
   //       subjreqstr += this.subjectRequest[i] + ", "; }
   //   }
   //   alert("downloaded subjectRequest: " + subjreqstr); }
    
    if(typeof theCurrentExercise.unneededWords != 'undefined') {
        this.unneededWords = theCurrentExercise.unneededWords; }
    
    if(typeof theCurrentExercise.replaceSubject != 'undefined') {
        this.replaceSubject = theCurrentExercise.replaceSubject; }
    
	this.answersList = TokenizeEachAnswer(this.untokenizedAnswersList);
	this.allAnswersList = this.answersList;
	this.wordsLists = GetWordsLists(this.answersList);
	this.allWordsLists = this.wordsLists;
	if (this.choices.length > 0) this.type = "multiple_choice";
}

function GetScore()
{
    //your code for getting the user's current score goes here; for now, I'm just returning 0
	return 0; }

function GetStatus()
{
	return "freshAnswer"; }
	//return "editedAnswer";
