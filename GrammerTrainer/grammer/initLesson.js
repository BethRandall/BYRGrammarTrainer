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
    
    //BYR randomize multiple choices here.
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
    //alert("inside setCurrentExercise: currEx:  " + currEx);
    
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
    //updateDotFeedback();
    initDots();
    
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

function initLessonNameContainer() {
   
    $("#lessonNameContainer").empty();
    if (typeof theLesson.name1 == 'undefined') {
        $("#lessonNameContainer").hide();
        return; }
    if (typeof theLesson.name1 != 'undefined') {
        $("#lessonNameContainer").append(theLesson.name1); }
    else {  $("#lessonNameContainer").append("name1"); }
    $("#lessonNameContainer").append("<br />");
    if (typeof theLesson.name2 != 'undefined') {
        $("#lessonNameContainer").append(theLesson.name2); }
    else {  $("#lessonNameContainer").append("name2"); }
    $("#lessonNameContainer").append("<br />");
    if (typeof theLesson.name2 != 'undefined') {
        $("#lessonNameContainer").append(theLesson.name3); }
    else {  $("#lessonNameContainer").append("name3"); }
}

function initDots() {
    //alert("about to initDots: ");
    // Load the dots (the context needs to be the dotContainer element)
    $("#dotContainer").empty();
    for( var d = 0; d < dotMatrix.length; d++ )
    {
        if( (d % 6 == 0) && (d != 0) )
        {
            $("#dotContainer").append("<br />");
        }
        if(dotMatrix[d] == DOT_UNTRIED)
        { $("#dotContainer").append("<img class=\"dotImage\" src=\"img/blueDot.png\" />"); }
        else if(dotMatrix[d] == DOT_INCOMPLETE)
        { $("#dotContainer").append("<img class=\"dotImage\" src=\"img/yellowDot.png\" />"); }
        else if(dotMatrix[d] == DOT_WRONG)
        { $("#dotContainer").append("<img class=\"dotImage\" src=\"img/redDot.png\" />"); }
        else
        { $("#dotContainer").append("<img class=\"dotImage\" src=\"img/greenDot.png\" />"); }
    }
}

function setIndexArray() {
    
    indexArray = new Array();
    // Create an array of numbers in numerical order
    for( var a = 0; a < theLesson.exerciseArray.length; a++ )
    { indexArray.push(a); }

    //BYR randomize here.
    //alert("about to randomize: ");
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
        indexArray[exerNum] = newranddex;
        usedDex.splice(randdex, 1); }
}

function unRandomizeExes () {
    for (var i = 0; i < indexArray.length; i++) {
        indexArray[i] = i;
    }
    
}

function setDotArray() {
    dotMatrix = new Array();
    for( var c = 0; c < theLesson.exerciseArray.length; c++ )
   // { dotMatrix[c] = DOT_INCOMPLETE; }
    { dotMatrix[c] = DOT_UNTRIED; }
}

function setRedoNumArray() {
    redoNumArray = new Array();
    // Create an array of numbers in numerical order
    for( var a = 0; a < theLesson.exerciseArray.length; a++ )
    { redoNumArray.push(0); }
}


function resetLesson() {
    //alert("in resetLesson: ");
    
    step = 0; // one-up for next exercise
    
    // Words for the current answer
    currentAnswer = "";
    // Current word being dragged
    currentWord = "";
    
    // Redo mode
    redoMode = false;
    //alert("in initLesson, resetLesson: ");
    // An array of incorrectly answered prompts to redo
    promptsToRedo = new Array();
    // Current redo prompt track
    // BYR -- does this variable do anything?
    //currentRedoPromptNumber = 0;
    numWrong = 0;
    
    if(typeof theLesson == 'undefined') {
        alert("trouble downloading:  please try again");
    } else {
        setRedoNumArray();
        setIndexArray();
        setDotArray();
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

function returnToLesson() {
    var num_green = 0;
    var num_red = 0;
    var num_orange = 0;
    num_green = countGreenDots();
    num_red = countRedDots();
    num_orange = countOrangeDots();
    num_blue = countBlueDots();
    buildRedoNumArray();
    randomizeRedo();
    //alert("num_blue: " + num_blue + ", " +"num_green:  " + num_green + ", num_red: " + num_red + ", num_orange: " + num_orange);
    // if all dots are blue, lesson hasn't been done before.
    if (num_blue == indexArray.length) { return; }
    // Special case:  all green dots.  Return to blank slate.
    if (num_green == indexArray.length) {
        setIndexArray();
        setDotArray();
        redoMode = false;
        return;
    }
    // Special case: all red dots.
    if (num_red == indexArray.length) {
        setDotWrongToIncomplete();
        jitterNext = false;
        redoMode = true;
        return;
    }
    if (promptsToRedo.length <= 0) { return; }
    // Special case: all dots either orange or green.  Ready for redo mode.
    if (((num_green + num_red) == indexArray.length) ||
        ((num_green + num_orange) == indexArray.length)){
        setDotWrongToIncomplete();
        jitterNext = false;
        redoMode = true;
        return;
    }
}


function initUserInterface() {
    // NOTE: Must call resetLesson() or something else to init vars before calling this
    
    jitterNext = true;
    didJitter = false;
    // Array of answer words
    
    currentAnswerWords = new Array();   // the state of this is not saved
    draggableAnswerWords = new Array(); // the state of this is not saved
    
    // Call Native to find out gender of user
    // checkGender() inits the following variables; him_her,he_she,Him_Her,He_She
    checkGender();
    
    //currentExercise = theLesson.exerciseArray[indexArray[step]];
    if ((indexArray[0] >= theLesson.exerciseArray.length) || (indexArray[0] < 0)) {
        alert("FRANKENSTEIN cannot load exerciseNumber:  " + indexArray[0] + ", theLesson.length:  " + theLesson.exerciseArray.length);
    }
    //alert("FRANKENSTEIN will load:  indexArray[0]:  " + indexArray[0]);
    //alert("about to removeGreenDotExercises: ");
    returnToLesson();
    step = 0;
    //while((dotMatrix[step] != DOT_INCOMPLETE) && (dotMatrix[step] != DOT_UNTRIED)) {
    while((dotMatrix[indexArray[step]] != DOT_INCOMPLETE) && (dotMatrix[indexArray[step]] != DOT_UNTRIED)) {
        step++;
        if  (step >= dotMatrix.length) {break;}}
    if (step >= indexArray.length) {
        alert("HILDEGARDE step >= indexArray.length: " + step);
        step = 0;
    }
    currentExercise = theLesson.exerciseArray[indexArray[step]];
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
    
    $("#nextButton").hide();
    $("#leftExitButton").hide();
    if(typeof currentExercise.lessonImage == "undefined") {
        // We're talking videos...
        var lessonFilePath = currentExercise.lessonVideo;
        var posterFilePath = posterFilename(lessonFilePath);
        //var testStr = "<video autoplay=\"autoplay\" controls=\"controls\" id=\"video\" width=\"533\" height=\"300\" src=" + lessonFilePath + " poster=" + posterFilePath +  "></video>";
        //document.getElementById('video').pause();
        //alert("will get poster:  " + posterFilePath);
        if ((currentExercise.videoFormat != "undefined") && (currentExercise.videoFormat == "large"))
        {
           /* $("#big_video_box").append("<video autoplay=\"autoplay\" controls=\"controls\" id=\"video\" width=\"1028\" height=\"768\" src=" + lessonFilePath + " poster=" + posterFilePath +  "></video>"); */
             $("#big_video_box").append("<video autoplay=\"autoplay\" controls=\"controls\" id=\"video\" width=\"936\" height=\"699\" src=" + lessonFilePath + " poster=" + posterFilePath +  "></video>");
            $("#questionContainer").hide();
            $("#answerContainer").hide();
            $("#selectedAnswerList").hide();
            $("#answerCategoryTabContainer").hide();
            $("#progressContainer").hide();
            $("#nextButton").html("<a href=\"javascript:goToNextVideo()\">Next</a>");
            $("#nextButton a").css({"background":"#fdd79f url(img/watercolorTextureTransparent.png) repeat","color":"#522611","-webkit-box-shadow":"inset 3px 3px 3px rgba(255,255,255,0.2), inset -3px -3px 3px rgba(0,0,0,0.2)"});
            $("#nextButton").show();
            $("#leftExitButton").html("<a href=\"javascript:showMenu()\">Exit</a>");
            $("#leftExitButton a").css({"background":"#fdd79f url(img/watercolorTextureTransparent.png) repeat","color":"#522611","-webkit-box-shadow":"inset 3px 3px 3px rgba(255,255,255,0.2), inset -3px -3px 3px rgba(0,0,0,0.2)"});
            $("#leftExitButton").show();
            //dotMatrix[step] = DOT_CORRECT;
        }
        else {
            $("#video_box").append("<video autoplay=\"autoplay\" controls=\"controls\" id=\"video\" width=\"533\" height=\"300\" src=" + lessonFilePath + " poster=" + posterFilePath +  "></video>"); }
        //alert("back from poster:");
        setVideo(currentExercise);
    }else {
        // This is a photo
        myLoadLessonImage(); }

    initDots();
    initLessonNameContainer();
    setMultipleChoiceBox(currentExercise);
    
    // word list are initialized in <lesson>.json file
    setWordTabs();
    setOralPrompt(currentExercise);
    //setFeedBackStuff(currentExercise);

    appLoaded(); 
}
