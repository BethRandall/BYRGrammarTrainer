// Dependencies
// theLesson object needs to be set up before entering

var lessonName;

// For each exercise, first set wordlists at the lesson level.  Then override with wordlists from the exercise level
// as given in the .json files.

function setWordLists(context) {
   
    if((typeof context.nounWords != 'undefined') && (context.nounWords.length > 0)) {
        nounWords = context.nounWords.sort(); }
    if((typeof context.verbWords != 'undefined') && (context.verbWords.length > 0)) {
        verbWords = context.verbWords.sort(); }
    if((typeof context.adjectiveWords != 'undefined') && (context.adjectiveWords.length > 0)){
        adjectiveWords = context.adjectiveWords.sort(); }
    if((typeof context.pronounWords != 'undefined') && (context.pronounWords.length > 0)) {
        pronounWords = context.pronounWords.sort(); }
    if((typeof context.prepositionWords != 'undefined') && (context.prepositionWords.length > 0)) {
        prepositionWords = context.prepositionWords.sort(); }
}

function setWordTabs() {
    //alert("inside setWordTabs: ");

    //if nounWords exists, make nounTab active.
    if((typeof nounWords != 'undefined') && (nounWords.length > 0)) {
        layoutDraggableWords(document.getElementById('nounList'), nounWords, 'noun');
        $('#nounTab').addClass('active');
        $('#selectedAnswerList>section').hide();
        $('#nounList').show(); // causes draggable words from the nounList to show
    } else {
        $("#nounTab").hide(); }
    if((typeof verbWords != 'undefined') && (verbWords.length > 0)) {
        $('#verbTab').removeClass('active');
        layoutDraggableWords(document.getElementById('verbList'), verbWords, 'verb');
    } else {
        $("#verbTab").hide(); }
    if((typeof adjectiveWords != 'undefined') && (adjectiveWords.length > 0))  {
        $('#adjectiveTab').removeClass('active');
        layoutDraggableWords(document.getElementById('adjectiveList'), adjectiveWords, 'adjective');
    } else {
        $("#adjectiveTab").hide(); }
    // if there's no list of nounWords, make pronounTab active, if it exists.
    if((typeof pronounWords != 'undefined') && (pronounWords.length > 0)) {
        layoutDraggableWords(document.getElementById('pronounList'), pronounWords, 'pronoun');
        if (typeof nounWords != "undefined") {
            $('#pronounTab').removeClass('active'); }
        if (typeof nounWords == 'undefined') {
            $('#pronounTab').addClass('active');
            $('#selectedAnswerList>section').hide();
            $('#pronounList').show(); }
    } else {
        $("#pronounTab").hide(); }
    if((typeof prepositionWords != 'undefined') && (prepositionWords.length > 0)) {
        $('#prepositionTab').removeClass('active');
        layoutDraggableWords(document.getElementById('prepositionList'), prepositionWords, 'preposition');
    } else {
        $("#prepositionTab").hide(); }
}

function setMultipleChoiceBox(context) {
    // context is currentExercise.
    var choiceArray = context.multipleChoice;
    
    if ((typeof context.multipleChoice == 'undefined') ||  (choiceArray.length < 1)) {
        $("#multipleChoiceBox").hide();
        $("#multipleChoiceDisplay").hide();
        return; }
    
    $("#multipleChoiceBox").show();     
    $("#multipleChoiceBox #presentedChoices").html("");
    
    //BYR randomize here.
    var usedDex = new Array(); 
    // initialize usedDex with indices.
    for(var answerChoice = 0; answerChoice < choiceArray.length; answerChoice++) {
        usedDex[answerChoice] = answerChoice; }
 
    for(var answerChoice = 0; answerChoice < choiceArray.length; answerChoice++)
    {
        //document.write("<p>" + firstExercise.multipleChoice[answerChoice] + "</p>"); 
        var randdex =  Math.floor(Math.random()*usedDex.length);
        var newranddex = usedDex[randdex];
        $("#presentedChoices").append("<p>" + choiceArray[newranddex] + "</p>");
        usedDex.splice(randdex, 1); }
    return;
}

function setOralPrompt(context) {

    if(typeof context.oralprompt == "undefined") {
        //document.getElementById('oralpromptText').innerHTML = "";
        $("#oralPromptButton").hide();
        $("#oralpromptText").hide();
    } else {
        document.getElementById('oralpromptText').innerHTML = context.oralpromptText;
        $("#oralPromptButton").show();
        if (typeof context.oralpromptText != "undefined") {
            $("#oralpromptText").show(); }
        else {
            $("#oralpromptText").hide(); } }
}

function setSpeechBubble(context) {
    if (typeof context.balloonSpecs != "undefined") {
        $("#speechBubble").show();
        var bubbleSpecsString = context.balloonSpecs;
        var specs = bubbleSpecsString.split(",");
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
    } else {
        $("#speechBubble").hide(); }
    if (typeof context.balloonPrefill != "undefined") {
        $("#speechBubble p").html(context.balloonPrefill); }
}

function setVideo(context) {
    // Lesson uses video
 
    document.getElementById('video').pause();
    $("#video").attr("src", context.lessonVideo);
    document.getElementById('video').load();

    //  if (currentExercise.prompt != "undefined") {
    document.getElementById('questionContainer').innerHTML = "<p>" +  context.prompt + "</p>"; //}
    //else {
    //  if (currentExercise.question != "undefined") {
    //    document.getElementById('questionContainer').innerHTML = "<p>" +  currentExercise.question + "</p>"; }
    //}
    //}

    setOralPrompt(context);
    setSpeechBubble(context);
}

function setCurrentExercise(currEx) {
    //alert("inside setCurrentExercise: ");
    
    if(typeof currEx.lessonImage == "undefined") {
        // Lesson uses video
        setVideo(currEx);
    } else {
        //alert("image: " + currEx.lessonImage);
        // This is a photo
        myLoadLessonImage();
    }
    
    if (typeof currEx.balloonPrefill == "undefined") {
        $("#speechBubble p").html(" "); }
    
    // if wordlists are defined at the lesson level, use them;
    // if wordslists are defined at the exercise level, write over the lesson level.
    setWordLists(theLesson);
    setWordLists(currEx);
    
    setWordTabs();
    
    // Clear answer feedback box
    $("#answerContainer #answerFeedbackBox p").html("  ");
    // Update multiple choices
    setMultipleChoiceBox(currEx);
    
    // Update dot feedback
    updateDotFeedback();
    
    //alert("will erase Answer: ");
    // Clear the droppable answer box
    eraseAnswer();
  /*
    // Disable the next button
    $("#nextButton").html("<a>AARDVARK Next</a>");
    $("#nextButton a").css({"background":"#08324f","color":"#26527c","-webkit-box-shadow":"0 0 0 transparent"});
   */

}

function myLoadLessonImage() {
    //alert("in myLoadLessonImage:  currentExercise.lessonImage" + currentExercise.lessonImage);

    $("#video_box").empty();
    if (typeof currentExercise.imageType == "undefined") {
        //alert("found imageType undefined");
        $("#video_box").append("<img id=\"lessonImage\" width=auto height=\"300\" src=" + "images/" + currentExercise.lessonImage + "></img>");
    } else {
        //alert("found imageType:");
        if (currentExercise.imageType == "xlong") {
            //alert("found xlong");
            $("#video_box").append("<img id=\"lessonImage\" width=\"500\" height=auto src=" + "images/" + currentExercise.lessonImage + "></img>");
        }
        else {
              $("#video_box").append("<img id=\"lessonImage\" width=auto height=\"300\" src=" + "images/" + currentExercise.lessonImage + "></img>");
        }
    }
    $("#questionContainer").text(currentExercise.question);
    $("#speechBubble").hide();
}

function initDots() {
    // Load the dots (the context needs to be the dotContainer element)
    $("#dotContainer").empty();
    for( var d = 0; d < dotMatrix.length; d++ )
    {
        if( (d % 6 == 0) && (d != 0) )
        {
            $("#dotContainer").append("<br />");
        }
        if(dotMatrix[d] == DOT_INCOMPLETE)
        { $("#dotContainer").append("<img class=\"dotImage\" src=\"img/yellowDot.png\" />"); }
        else if(dotMatrix[d] == DOT_WRONG)
        { $("#dotContainer").append("<img class=\"dotImage\" src=\"img/redDot.png\" />"); }
        else
        { $("#dotContainer").append("<img class=\"dotImage\" src=\"img/greenDot.png\" />"); }
    }
}

function resetLesson() {
    //alert("in resetLesson: ");
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
    // BYR -- does this variable do anything?
    currentRedoPromptNumber = 0;
    
    if(typeof theLesson == 'undefined') {
        alert("trouble downloading:  please try again");
    } else {
        // NOTE: theLesson variables is populated by our <lesson>.json file
      
        indexArray = new Array();
        // Create an array of numbers in numerical order
        for( var a = 0; a < theLesson.exerciseArray.length; a++ )
        { indexArray.push(a); }
        
        redoNumArray = new Array();
        // Create an array of numbers in numerical order
        for( var a = 0; a < theLesson.exerciseArray.length; a++ )
        { redoNumArray.push(0); }
        
        //BYR randomize here.
        // usedDex will contain a list of indices used in the randomized array.
        var usedDex = new Array();
        // initialize usedDex with indices.
        for(var exerNum = 0; exerNum < theLesson.exerciseArray.length; exerNum++) {
            usedDex[exerNum] = exerNum; }
       
        // randomizing happens in this for loop.
        for(var exerNum = 0; exerNum < theLesson.exerciseArray.length; exerNum++)
        {
            //document.write("<p>" + firstExercise.multipleChoice[answerChoice] + "</p>");
            var randdex =  Math.floor(Math.random()*usedDex.length);
            var newranddex = usedDex[randdex];
            // if you don't want to randomize the exercises, comment out the following line:
            //indexArray[exerNum] = newranddex;
            usedDex.splice(randdex, 1); }
        // Dot Array
        dotMatrix = new Array();
        for( var c = 0; c < theLesson.exerciseArray.length; c++ )
        { dotMatrix[c] = DOT_INCOMPLETE; }
    }
}

function doesFileExist(urlToFile)
{
    try {
        var xhr = new XMLHttpRequest();
        xhr.open('HEAD', urlToFile, false);
        xhr.send();
        //alert("xhr status:  " + xhr.status);
    }
    catch(err) {
        //alert("in doesFileExist: err:  will return false:  " + xhr.status + ", " + urlToFile);
        return false;
    }
    if (xhr.status != 0) {
        //alert("AARDVARK! in doesFileExist:  will return false:  " + xhr.status + ", " + urlToFile);
        return false; }
    else {
        //alert("AARDVARK! in doesFileExist:  will return true:  " + xhr.status + ", " + urlToFile);
        return true;
    }
    //return true;
}


function initUserInterface() {
    // NOTE: Must call resetLesson() or something else to init vars before calling this
    
    jitterNext = true;
    // Array of answer words
    
    currentAnswerWords = new Array();   // the state of this is not saved
    draggableAnswerWords = new Array(); // the state of this is not saved
    
    // Call Native to find out gender of user
    // checkGender() inits the following variables; him_her,he_she,Him_Her,He_She
    checkGender();
    
    //currentExercise = theLesson.exerciseArray[indexArray[step]];
    currentExercise = theLesson.exerciseArray[indexArray[0]];
    //alert("in proceedNextLesson: currentExercise.lessonImage:  " + currentExercise.lessonImage);
    eraseAnswer();
    //initAnswer();
    
    // if wordlists are defined at the lesson level, use them;
    // if wordslists are defined at the exercise level, write over the lesson level.
    setWordLists(theLesson);
    setWordLists(currentExercise);
    //alert("The step is " + step);
    
    // Load the video
    // NativeBridge.call("recordNative", ["initDataModel:",firstExercise.lessonVideo,"three"]);
    
    if(typeof currentExercise.lessonImage == "undefined") {
        // We're talking videos...
        var lessonFilePath = currentExercise.lessonVideo;
        var posterFilePath = posterFilename(lessonFilePath);
        //var testStr = "<video autoplay=\"autoplay\" controls=\"controls\" id=\"video\" width=\"533\" height=\"300\" src=" + lessonFilePath + " poster=" + posterFilePath +  "></video>";
        //document.getElementById('video').pause();
        //alert("will get poster:  " + posterFilePath);
        $("#video_box").append("<video autoplay=\"autoplay\" controls=\"controls\" id=\"video\" width=\"533\" height=\"300\" src=" + lessonFilePath + " poster=" + posterFilePath +  "></video>");
        //alert("back from poster:");
        setVideo(currentExercise);
    }else {
        // This is a photo
        myLoadLessonImage(); }

    initDots();
    setMultipleChoiceBox(currentExercise);
    
    // word list are initialized in <lesson>.json file
    setWordTabs();
    setOralPrompt(currentExercise);
    //setFeedBackStuff(currentExercise);

    appLoaded(); 
}
