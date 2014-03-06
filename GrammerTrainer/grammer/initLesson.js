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
    //alert("inside setMultipleChoiceBox: ");
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
    /*
    if(typeof firstExercise.oralprompt == "undefined") {
        $("#oralPromptButton").hide(); }
    if(typeof firstExercise.oralpromptText == "undefined") {
        $("#oralpromptText").hide(); }
    */
     if(typeof context.oralprompt == "undefined") {
        document.getElementById('oralpromptText').innerHTML = "";
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
    currentRedoPromptNumber = 0;
    
    if(typeof theLesson == 'undefined') {
        alert("trouble downloading:  please try again");
    } else {
        // NOTE: theLesson variables is populated by our <lesson>.json file
        // Randomize the questions in lesson 1
        
        indexArray = new Array();
        var randomLength = Number(theLesson.exerciseArray.length);
        
        // Create an array of numbers in numerical order
        for( var a = 0; a < randomLength; a++ )
        { indexArray.push(a); }
        
        // Then, shuffle the numbers
        //indexArray.sort(function() {return 0.5 - Math.random()});
        
        // Dot Array
        dotMatrix = new Array();
        for( var c = 0; c < theLesson.exerciseArray.length; c++ )
        { dotMatrix[c] = DOT_INCOMPLETE; }
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
    
    var firstExercise = theLesson.exerciseArray[indexArray[step]];
    currentExercise = theLesson.exerciseArray[indexArray[step]];
    eraseAnswer();
    //initAnswer();
    
     // if wordlists are defined at the lesson level, use them;
    // if wordslists are defined at the exercise level, write over the lesson level.
    
    setWordLists(theLesson);
    setWordLists(currentExercise);
    
    //alert("The step is " + step);
    
    //var firstExercise = theLesson.exerciseArray[indexArray[step]];

    // Load the video
    // document.write("<video autoplay=\"autoplay\" controls=\"controls\" id=\"video\" width=\"533\" height=\"300\" src=" + firstExercise.lessonVideo + "></video>");
    // NativeBridge.call("recordNative", ["initDataModel:",firstExercise.lessonVideo,"three"]);
   
    if(typeof firstExercise.lessonImage == "undefined") {
        // Were talking videos...
        //setVideo(currentExercise);
        var lessonFilePath = firstExercise.lessonVideo;
        var posterFilePath = posterFilename(lessonFilePath);
        var testStr = "<video autoplay=\"autoplay\" controls=\"controls\" id=\"video\" width=\"533\" height=\"300\" src=" + lessonFilePath + " poster=" + posterFilePath +  "></video>";
        $("#video_box").append("<video autoplay=\"autoplay\" controls=\"controls\" id=\"video\" width=\"533\" height=\"300\" src=" + lessonFilePath + " poster=" + posterFilePath +  "></video>");
        
        document.getElementById('oralpromptText').innerHTML = firstExercise.oralpromptText;

        document.getElementById('questionContainer').innerHTML = "<p>" +  firstExercise.prompt + "</p>";
        setOralPrompt(currentExercise); 
        setSpeechBubble(currentExercise);
 
    }else {
        
        // This is a photo
        //$("#video_box").append("<img id=\"lessonImage\" width=\"533\" height=auto src=" + "images/" + firstExercise.lessonImage + "></img>");
         $("#video_box").append("<img id=\"lessonImage\" width=\"350\" height=auto src=" + "images/" + firstExercise.lessonImage + "></img>");
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
        { $("#dotContainer").append("<img class=\"dotImage\" src=\"img/yellowDot.png\" />"); }
        else if(dotMatrix[d] == DOT_WRONG)
        { $("#dotContainer").append("<img class=\"dotImage\" src=\"img/redDot.png\" />"); }
        else
        { $("#dotContainer").append("<img class=\"dotImage\" src=\"img/greenDot.png\" />"); }
    }
    //alert("about to setMultipleChoiceBox: ");
    setMultipleChoiceBox(firstExercise);
    
    // word list are initialized in <lesson>.json file
    setWordTabs();
    setOralPrompt(firstExercise);
    appLoaded();
}