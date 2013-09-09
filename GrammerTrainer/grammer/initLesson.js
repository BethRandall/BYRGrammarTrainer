// Dependencies
// theLesson object needs to be set up before entering

him_her = 'her';
he_she = 'she';
Him_Her = 'Her';
He_She = 'She';

function posterFilename(wholePath) {
    // "gt_videos/transportation_theme_videos/1_lesson_1.m4v"
    // "gt_videos/transportation_theme_videos/poster/1_lesson_1.bmp"
    var pathArray = wholePath.split( '/' );
    var filename = pathArray.pop();
    var output = pathArray.join('/') + "/posters/" + filename.split('.')[0] + '.bmp';
    
    return output;
}

// 1. layoutDraggableWords(container, wordList, partOfSpeech) 
// 2. createDraggableWord(theWord, partOfSpeech, top, left)
// 3. initDraggable(theWord,partOfSpeech,top,left)

function createDraggableWord(theWord, partOfSpeech, top, left) {
    
    var topPx = Math.floor(top) + 'px';
    var leftPx = Math.floor(left) + 'px';
    
    //console.log(theWord + " " + topPx + " " +  leftPx );
    //document.write(theWord + " " + topPx + " " +  leftPx +  "</br>");
    
    // Need to create this...
    // <div class="draggableWord listWord" id="noun_Windows" style="position:absolute; 	padding:14px; top:112px; left:4px">windows</div>
    
    // Start by creating a wrapper div 
    var wordDiv = document.createElement('div');
    
    var theWordsID = partOfSpeech + "_" + theWord;
    // Randomly choose a leaf image and assign it to the newly created element 
    wordDiv.className = 'draggableWord listWord';
    wordDiv.id = theWordsID;
    wordDiv.style.position = 'absolute';
    wordDiv.style.padding = '14px';
    
    
    // Position the leaf at a random location within the screen 
    wordDiv.style.top = topPx;
    wordDiv.style.left = leftPx;
    
    // now some text
    sometext = document.createTextNode(theWord);
    // append to paragraph
    wordDiv.appendChild(sometext);
    
    // REST HERE...	
    // Return this div so it can be added to the document 
    return wordDiv;
    
    
}



function initDraggable(theWord,partOfSpeech,top,left) {
    
    //console.log(theWord + " " + topPx + " " +  leftPx );
    
    var topPx = Math.floor(top) + 'px';
    var leftPx = Math.floor(left) + 'px';
    
    var theWordsID = partOfSpeech + "_" + theWord;
    
    
    var line1 = "addWordToAnswer('" + theWord +"','" + theWordsID + "');"; // addWordToAnswer('her','pronoun_Her');
    var line2 = "document.getElementById('" + theWordsID + "').style.top = '" + topPx + "';";
    var line3 = "document.getElementById('" + theWordsID + "').style.left = '" + leftPx + "';";
    
    //console.log(theWordsID);
    //console.log(line2);
    //console.log(line3);
    
    var onStartFucn =new Function("currentWord = '" + theWord + "';");
    var onEndFucn =new Function(line1 + line2 + line3);
    
    var test = 'pronoun_Her';
    
    new webkit_draggable(
                         theWordsID, {
                         revert : false, 
                         onStart : onStartFucn, 
                         onEnd : onEndFucn
                         }
                         ); 
    
    
}

function checkGender() {
 
/*   
    if (typeof NativeBridge != 'undefined') {
        NativeBridge.call("getGender", "", function (response) {
                          
                          if(response != null) {
                                                    
                              if(response == 'female') {
                                  him_her = 'her';
                                  he_she = 'she';
                                  Him_Her = 'Her';
                                  He_She = 'She';                          
                              } else {
                                  him_her = 'him';
                                  he_she = 'he';
                                  Him_Her = 'Him';
                                  He_She = 'He';                          
                              }
                          
                          } else {
                              alert("No Response");                          
                          }
                    });
    } else {
        alert("NativeBridge is NOT defined!");
    }
*/
    him_her = 'her';
    he_she = 'she';
    Him_Her = 'Her';
    He_She = 'She';                          

}


function layoutDraggableWords(container, wordList, partOfSpeech) {
    
    //console.log("layoutDraggableWords " + wordList.length);
    
    var left = 4;
    var top = 4;
    for (var i = 0; i < wordList.length; i++) {
        
        var wordDiv = createDraggableWord(wordList[i],partOfSpeech,top, left);
        
        container.appendChild(wordDiv);
        
        // Make the div draggable
        initDraggable(wordList[i],partOfSpeech,top,left);
        
        left = left + wordList[i].length*10 + 42;
        if(left > 900) {
            left = 4;
            top = top + 54;
        } 
    }     
}

function resetLesson() {
    

    // Lesson Number
    currentLessonNumber = 1;
    // Exercise Number
    currentExerciseNumber = 1;
    
    step = 0; // one-up for next exercise
    
    // Words for the current answer
    currentAnswer = "";
    // Current word being dragged
    currentWord = "";
    
    // Redo mode
    redoMode = false;
    // An array of incorrectly answered prompts to redo
    promptsToRedo = new Array();
    // Current redo prompt track
    currentRedoPromptNumber = 0;
    
    
    if(typeof theLesson == 'undefined') {
        alert("theLesson undefined");
    } else {
        
        // NOTE: theLesson variables is populated by our <lesson>.json file
        
        // Randomize the questions in lesson 1
        indexArray = new Array();
        var randomLength = Number(theLesson.exerciseArray.length);
        
        
        // Create an array of numbers in numerical order
        for( var a = 0; a < randomLength; a++ )
        {
            indexArray.push(a);
        }
        
        // Then, shuffle the numbers
        //indexArray.sort(function() {return 0.5 - Math.random()});
        
        // Dot Array
        dotMatrix = new Array();
        for( var c = 0; c < theLesson.exerciseArray.length; c++ )
        {
            dotMatrix[c] = DOT_INCOMPLETE;
        }
    }
}

function initUserInterface() {

    //alert("initUserInterface");

    // NOTE: Must call resetLesson() or something else to init vars before calling this
    
    // Array of answer words
    currentAnswerWords = new Array();   // the state of this is not saved
    draggableAnswerWords = new Array(); // the state of this is not saved

    // Call Native to find out gender of user
    // checkGender() inits the following variables; him_her,he_she,Him_Her,He_She                          
    checkGender();
    
    nounWords = theLesson.nounWords.sort();
    verbWords = theLesson.verbWords.sort();
    
    if(typeof theLesson.adjectiveWords != 'undefined') {
        adjectiveWords = theLesson.adjectiveWords.sort(); }
    
    if(typeof theLesson.pronounWords != 'undefined') {
        pronounWords = theLesson.pronounWords.sort(); }
    
    if(typeof theLesson.prepositionWords != 'undefined') {
        prepositionWords = theLesson.prepositionWords.sort(); }

    //alert("The step is " + step);
    
    var firstExercise = theLesson.exerciseArray[indexArray[step]];
    

    // Load the video
    
    // document.write("<video autoplay=\"autoplay\" controls=\"controls\" id=\"video\" width=\"533\" height=\"300\" src=" + firstExercise.lessonVideo + "></video>");
    
    // NativeBridge.call("recordNative", ["initDataModel:",firstExercise.lessonVideo,"three"]);
    
    
    if(typeof firstExercise.lessonImage == "undefined") {
        // Were talking videos...
        
        var lessonFilePath = firstExercise.lessonVideo;
        var posterFilePath = posterFilename(lessonFilePath);
        var testStr = "<video autoplay=\"autoplay\" controls=\"controls\" id=\"video\" width=\"533\" height=\"300\" src=" + lessonFilePath + " poster=" + posterFilePath +  "></video>";
        $("#video_box").append("<video autoplay=\"autoplay\" controls=\"controls\" id=\"video\" width=\"533\" height=\"300\" src=" + lessonFilePath + " poster=" + posterFilePath +  "></video>");
        
        document.getElementById('oralpromptText').innerHTML = firstExercise.oralpromptText;

        document.getElementById('questionContainer').innerHTML = "<p>" +  firstExercise.prompt + "</p>";

        
        //$("#video_box").append("<div id=\"captionBox\"></div>");
        //$("#video_box").append("<p class=\"caption\">" + firstExercise.question + "</p>");
        
        // If the question text contains the substring "empty ballon" show the empty ballon
        var theQuestion  = firstExercise.question;
        var theIndex = theQuestion.search("empty balloon");
        
        
        if (theIndex > 0) {
            
            
            var bubbleSpecsString  = firstExercise.balloonSpecs;
            
            var specs = bubbleSpecsString.split(",");
            // Looks like this... "left, 100, 10"
            
            if (specs[0] == "left") {
                
                $("#speechBubble").css("top", "10px");
                $("#speechBubble").css("left", "350px");
                
                $("#speechBubble p").removeClass("speechRight");
                $("#speechBubble p").addClass("speechLeft");
                
                
            } else {
                
                $("#speechBubble").css("top", "10px");
                $("#speechBubble").css("left", "10px");
                
                $("#speechBubble p").removeClass("speechLeft");
                $("#speechBubble p").addClass("speechRight");
            }
            
            $("#speechBubble").show();
        } else {
            $("#speechBubble").hide();            
        }
        
        
    } else {
        
        // This is a photo
        $("#video_box").append("<img id=\"lessonImage\" width=\"533\" height=auto src=" + "images/" + firstExercise.lessonImage + "></img>");
        //$("#video_box").append("<div id=\"quoteBox\">" + firstExercise.question + "</div>");
        //$("#video_box").append("<div id=\"quoteBoxAnswer\">" + firstExercise.answers[0] + "</div>");
        $("#questionContainer").text(firstExercise.question);

        $("#speechBubble").hide();            
 
        
    }
    
    // <img src="smiley.gif" alt="Smiley face" height="42" width="42" />
    
    
    
    // Load the dots (the context needs to be the dotContainer element)
    for( var d = 0; d < dotMatrix.length; d++ )
    {
        if( (d % 6 == 0) && (d != 0) )
        {
            //document.write("<br />");
            //document.write("<img class=\"dotImage\" src=\"img/yellowDot.png\" />");
            
            // $("#video").attr("src", currentExercise.lessonVideo);
            
            $("#dotContainer").append("<br />");
            
        }
        
        if(dotMatrix[d] == DOT_INCOMPLETE)
        {
            $("#dotContainer").append("<img class=\"dotImage\" src=\"img/yellowDot.png\" />");
        }
        else if(dotMatrix[d] == DOT_WRONG)
        {
            $("#dotContainer").append("<img class=\"dotImage\" src=\"img/redDot.png\" />");
        }
        else
        {
            $("#dotContainer").append("<img class=\"dotImage\" src=\"img/greenDot.png\" />");
        }
    }
    
    
    
    // Load multiple choices (the context is presentedChoices)
    
    var choiceArray = firstExercise.multipleChoice;
    
    for(var answerChoice = 0; answerChoice < choiceArray.length; answerChoice++)
    {
        //document.write("<p>" + firstExercise.multipleChoice[answerChoice] + "</p>");
        
        $("#presentedChoices").append("<p>" + choiceArray[answerChoice] + "</p>");
        
    }
    
    
    // word list are initialized in <lesson>.json file
    
    layoutDraggableWords(document.getElementById('nounList'), nounWords, 'noun');
    layoutDraggableWords(document.getElementById('verbList'), verbWords, 'verb');

    if(typeof adjectiveWords != 'undefined') {
        layoutDraggableWords(document.getElementById('adjectiveList'), adjectiveWords, 'adjective');
    } else {
        $("#adjectiveTab").hide(); }
    
    if(typeof pronounWords != 'undefined') {
        layoutDraggableWords(document.getElementById('pronounList'), pronounWords, 'pronoun');
    } else {
        $("#pronounTab").hide(); }
    
    if(typeof prepositionWords != 'undefined') {
        layoutDraggableWords(document.getElementById('prepositionList'), prepositionWords, 'preposition');
    } else {
        $("#prepositionTab").hide(); }

    if(typeof firstExercise.oralprompt == "undefined") {
        $("#oralPromptButton").hide();
    }
    if(typeof firstExercise.oralpromptText == "undefined") {
        $("#oralpromptText").hide(); }
    
    setMultipleChoicePref();
    appLoaded();
}