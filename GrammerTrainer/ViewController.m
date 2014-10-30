//
//  ViewController.m
//  GrammerTrainer
//
//  Created by Eric Kille on 12/27/11.
//  Copyright (c) 2011 __MyCompanyName__. All rights reserved.
//

#import "ViewController.h"
#import "Level.h"
#import "Module.h"
#import "Lesson.h"
#import "SectionInfo.h"
#import "QuoteCell.h"
#import "ResultsTableViewCell.h"
#import "SpreadsheetController.h"
#import "AppDelegate.h"
#import "NSString+HTML.h"
#import <MediaPlayer/MediaPlayer.h>

#import "DownloadUrlToDiskOperation.h"

#import <QuartzCore/QuartzCore.h>

#pragma mark -
#pragma mark ViewController


// Private TableViewController properties and methods.
@interface ViewController () 

@property (nonatomic, assign) IBOutlet ResultsTableViewCell *tmpCell;

@property (nonatomic, strong) NSMutableArray* sectionInfoArray;
@property (nonatomic, assign) NSInteger openSectionIndex;
@property (strong, nonatomic) IBOutlet UIScrollView *iconScrollView;
@property (strong, nonatomic) IBOutlet UIView *iconView;
@property (strong, nonatomic) IBOutlet UILabel *levelLabel;
@property (strong, nonatomic) IBOutlet UILabel *signLabel;
@property (strong, nonatomic) IBOutlet UILabel *versionLabel;
@property (strong, nonatomic) IBOutlet UIView *loginView;
@property (strong, nonatomic) IBOutlet UITextView *loginTextView;
@property (strong, nonatomic) IBOutlet UITextView *passwordTextView;
@property (strong, nonatomic) SpreadsheetController *theSpreadsheetController;

@property (strong, nonatomic) NSMutableDictionary *loginInfo;


@property (strong, nonatomic) NSMutableDictionary *resultsDict;


@property (strong, nonatomic) Level *currentLevel;
@property (strong, nonatomic) Module *currentModule;
@property (strong, nonatomic) Lesson *currentLesson;
@property (strong, nonatomic) NSIndexPath *indexPath;
@property (nonatomic, assign) NSInteger myLessonIndex;


@property (strong, nonatomic) NSArray *modules;

- (IBAction)logoutButtonPushed:(id)sender;
- (IBAction)backButtonPushed:(id)sender;
- (IBAction)userPushedLogin:(id)sender;

@end



#define DEFAULT_ROW_HEIGHT 82
#define HEADER_HEIGHT 55


@implementation ViewController

@synthesize theWebView = _theWebView;
@synthesize theTableView = _theTableView;
@synthesize levels = _levels, modules = modules_;
@synthesize rightOverlayView = _rightOverlayView, leftOverlayView = _leftOverlayView, levelLabel = levelLabel_, signLabel = signLabel_;
@synthesize sectionInfoArray=_sectionInfoArray,openSectionIndex=openSectionIndex_, quoteCell=newsCell_;
@synthesize iconScrollView = iconScrollView_, iconView=iconView_;
@synthesize tmpCell = tmpCell_;
@synthesize loginView = loginView_;
@synthesize loginTextView = loginTextView_;
@synthesize passwordTextView = passwordTextView_;
@synthesize userName = userName_;
@synthesize theSpreadsheetController = theSpreadsheetController_;
@synthesize currentModule = currentModule_;
@synthesize currentLevel = currentLevel_;
@synthesize currentLesson = currentLesson_;
@synthesize indexPath = indexPath_;
@synthesize loginInfo = loginInfo_;
@synthesize versionLabel = versionLabel_;
@synthesize resultsDict = resultsDict_;
@synthesize fliteController;
@synthesize slt;


static NSString *versionNumber = @"1.20";

- (FliteController *)fliteController { if (fliteController == nil) {
    fliteController = [[FliteController alloc] init]; }
    return fliteController; }

- (Slt *)slt {
    if (slt == nil) {
        slt = [[Slt alloc] init]; }
    return slt; }

- (void)didReceiveMemoryWarning
{
    [super didReceiveMemoryWarning];
    // Release any cached data, images, etc that aren't in use.
}

#pragma mark - Helper Methods

- (void)showMenu {
    
    // This really means toggle menu
    
    CGRect newFrame;
    CGRect newFrame2;
    
    //NSLog (@"in showMenu:  menuVisible: %d", menuVisible);
    
    if (menuVisible) {
        // hide menu
        // then show Levels
        newFrame = CGRectOffset(_leftOverlayView.frame, -_leftOverlayView.bounds.size.width, 0.0);
        newFrame2 = CGRectOffset(_rightOverlayView.frame, _rightOverlayView.bounds.size.width, 0.0);

        menuVisible = NO;
    } else {
        //NSLog(@"inShowMenu:  found menu not visible: ");
        signLabel_.text = currentLevel_.levelName;

        newFrame = CGRectOffset(_leftOverlayView.frame, _leftOverlayView.bounds.size.width, 0.0);
        newFrame2 = CGRectOffset(_rightOverlayView.frame, -_rightOverlayView.bounds.size.width, 0.0);
        menuVisible = YES;
        //NSLog(@"in ShowMenu:  just set menuVisible: YES");
    }

    [UIView animateWithDuration:1.0 animations:^{
        _leftOverlayView.frame = newFrame;
        _rightOverlayView.frame = newFrame2;
    }];
}

- (void)exitLesson {
    
    CGRect newFrame;
    CGRect newFrame2;
    
    //NSLog(@"in exitLesson:  found menu not visible: ");
    signLabel_.text = currentLevel_.levelName;
        
    newFrame = CGRectOffset(_leftOverlayView.frame, _leftOverlayView.bounds.size.width, 0.0);
    newFrame2 = CGRectOffset(_rightOverlayView.frame, -_rightOverlayView.bounds.size.width, 0.0);
    menuVisible = YES;
      
    
    [UIView animateWithDuration:1.0 animations:^{
        _leftOverlayView.frame = newFrame;
        _rightOverlayView.frame = newFrame2;
    }];
}


- (void)loadInstructionsVideo {
    
    [self showMenu];
    
    NSString *thePathURL = [[[NSBundle mainBundle] bundlePath] stringByAppendingPathComponent:@"grammer/gt_instructions.html"];
    
    NSURLRequest *theRequest = [NSURLRequest requestWithURL:[NSURL fileURLWithPath:thePathURL]];
    
    [_theWebView loadRequest:theRequest];

}

- (void)copyOverLesson:(NSString *)lessonFileName {
    
    
    NSFileManager *fileMgr = [NSFileManager defaultManager];
    
    // Remote dataModel.js  from ./grammer directory
    // Copy lesson_x.js to ./grammer/dataModel.js
    
    NSString *lessonFile = [[NSBundle mainBundle] pathForResource:[lessonFileName stringByDeletingPathExtension] ofType:@"json"];

    NSString *grammerDir = [NSHomeDirectory() stringByAppendingPathComponent:  @"Documents/grammer"];
    //NSString *dest = [grammerDir stringByAppendingPathComponent:@"datamodel.js"];
    NSString *dest = [grammerDir stringByAppendingPathComponent:lessonFileName];

    NSError *error = nil;

    [fileMgr removeItemAtPath:dest error:&error];
    NSLog(@"Remove File - Any Error?: %@", error?@"No Error":error);
    
    
    [fileMgr copyItemAtPath:lessonFile toPath:dest error:&error];
    NSLog(@"Copy in New - Any Error?: %@", error?@"No Error":error);

    
}

-(NSString*)urlEscapeString:(NSString *)unencodedString 
{
    CFStringRef originalStringRef = (__bridge_retained CFStringRef)unencodedString;
    NSString *s = (__bridge_transfer NSString *)CFURLCreateStringByAddingPercentEscapes(NULL,originalStringRef, NULL, NULL,kCFStringEncodingUTF8);
    CFRelease(originalStringRef);
    return s;
}


-(NSString*)addQueryStringToUrlString:(NSString *)urlString withDictionary:(NSDictionary *)dictionary
{
    NSMutableString *urlWithQuerystring = [[NSMutableString alloc] initWithString:urlString];
    
    for (id key in dictionary) {
        NSString *keyString = [key description];
        NSString *valueString = [[dictionary objectForKey:key] description];
        
        if ([urlWithQuerystring rangeOfString:@"?"].location == NSNotFound) {
            [urlWithQuerystring appendFormat:@"?%@=%@", [self urlEscapeString:keyString], [self urlEscapeString:valueString]];
        } else {
            [urlWithQuerystring appendFormat:@"&%@=%@", [self urlEscapeString:keyString], [self urlEscapeString:valueString]];
        }
    }
    return urlWithQuerystring;
}

- (void)loadLesson:(Lesson *)theLesson {
    
    NSString *lessonFileName = theLesson.loadFile;
    
    NSLog(@"loadLesson: %@", lessonFileName);
    
    //NSString *lessonFile = [[NSBundle mainBundle] pathForResource:[lessonFileName stringByDeletingPathExtension] ofType:@"json"];

    NSString *docsDir = [NSHomeDirectory() stringByAppendingPathComponent:  @"Documents/grammer"];
    
    if (docsDir) {
        
        //[self showMenu]; // 
        // This copies selected lesson into initDataModel.js, this will be inserted once page finishes loading
        //[self copyOverLesson:lessonFileName];
        
        signLabel_.text = [NSString stringWithFormat:@"Loading %@...", theLesson.lessonName];
        NSString *docsDir = [NSHomeDirectory() stringByAppendingPathComponent:  @"Documents/grammer"]; 
        NSURL *url;
        
        if ([theLesson.loadFile isEqualToString:@"demoTrigger"]) {
            
            UIAlertView *alertView = [[UIAlertView alloc] 
                                      initWithTitle:@"Coming Soon"
                                      message:@"This is where we will show tutorials" 
                                      delegate:self 
                                      cancelButtonTitle:nil 
                                      otherButtonTitles:@"OK", nil];
            
            [alertView show];
            //url = [[NSBundle mainBundle] URLForResource:@"playTutorialVideo" withExtension:@"html"];  
            pendingDataModelLoad = NO;
        } else { 
            NSString *baseURLStr = [docsDir stringByAppendingPathComponent:@"gt_main.html"];
            
            //NSString *baseURLWithQuery = [self addQueryStringToUrlString:baseURLStr withDictionary:[NSDictionary dictionaryWithObject:[lessonFileName stringByDeletingPathExtension] forKey:@"lesson"]];
            
            NSString *query = [NSString stringWithFormat:@"lesson=%@", lessonFileName];  
            
            NSString *encodedPath = [baseURLStr stringByAddingPercentEscapesUsingEncoding: NSUTF8StringEncoding];
            
            url = [NSURL URLWithString:[NSString stringWithFormat:@"file://%@?%@",
                                               encodedPath,
                                               query]];     
            
            pendingDataModelLoad = YES;
            NSLog(@"Load request: %@", url); 
            NSMutableURLRequest *theRequest = [[NSMutableURLRequest alloc] initWithURL:url
                                                                           cachePolicy:NSURLRequestReloadIgnoringLocalAndRemoteCacheData
                                                                       timeoutInterval:30.0];
            
            [_theWebView loadRequest:theRequest];
        }
    
    } else {
        
        NSString *theMessage = [NSString stringWithFormat:@"The referenced javascript file %@ was not found.", lessonFileName ];
        // open a alert with an OK and cancel button
        UIAlertView *alert = [[UIAlertView alloc] initWithTitle:@"File Not Found" message:theMessage
                                                       delegate:nil cancelButtonTitle:nil otherButtonTitles:@"OK", nil];
        [alert show];
    }
}

- (IBAction)logoutButtonPushed:(id)sender {
    
   
    [UIView beginAnimations:nil context:NULL];
    [UIView setAnimationDuration:2.00];
    [UIView setAnimationTransition:UIViewAnimationTransitionFlipFromLeft forView:self.view cache:YES];
    
    // Remove existing question view
    [self.view addSubview:loginView_ ];
    
    // Animate!
    [UIView commitAnimations];
    
}


- (void)showMessageBoard {
    signLabel_.hidden = NO;
    [self.rightOverlayView bringSubviewToFront:signLabel_];
}

- (void)addAnimationOverlay {
    
    if ([self.rightOverlayView viewWithTag:123432] != nil) {
        return;
    } else {
        
        UIWebView *webView = [[UIWebView alloc] init];
        webView.frame =self.rightOverlayView.frame;
        webView.tag = 123432;
        
        webView.opaque = NO;
        webView.backgroundColor = [UIColor clearColor];
        webView.scrollView.scrollEnabled = NO;
        
        [self.rightOverlayView addSubview:webView];
        
        NSString *thePathURL = [[[NSBundle mainBundle] bundlePath] stringByAppendingPathComponent:@"clouds/index.html"];
        
        NSURLRequest *theRequest = [NSURLRequest requestWithURL:[NSURL fileURLWithPath:thePathURL]];
        
        [webView loadRequest:theRequest];
    }
    
    signLabel_.hidden = YES;
    // Need to add delay to give time for webview to load
    [self performSelector:@selector(showMessageBoard) withObject:signLabel_ afterDelay:2.0];
}

- (void)handleCorrectPassword {
    
    [UIView beginAnimations:nil context:NULL];
    [UIView setAnimationDuration:2.00];
    [UIView setAnimationTransition:UIViewAnimationTransitionFlipFromRight forView:self.view cache:YES];
    
    // Remove existing question view
    [loginView_ removeFromSuperview];
    
    // Animate!
    [UIView commitAnimations];
  
    [self addAnimationOverlay];
/*    
    [UIView animateWithDuration:2.0 delay:0.0 options:UIViewAnimationTransitionFlipFromRight animations:^{
        
        // Remove existing question view
        [loginView_ removeFromSuperview];
        
    } completion:^(BOOL finished){
    
        //[self addMoviePlayer];

    }];
        
*/
}

- (void)showWrongPasswordAlert:(NSString *)userName {
    
    NSString *theMessage = [NSString stringWithFormat:@"Hi %@! Wrong Password. Try again or see the teacher for help!", userName ];
    // open a alert with an OK and cancel button
    UIAlertView *alert = [[UIAlertView alloc] initWithTitle:@"Wrong Password" message:theMessage
                                                   delegate:nil cancelButtonTitle:nil otherButtonTitles:@"OK", nil];
    [alert show];
}
- (void)showWrongUserNameAlert:(NSString *)userName {
    
    NSString *theMessage = [NSString stringWithFormat:@"Hi %@, I don't recognize this username. Try again or see the teacher for help!", userName ];
    // open a alert with an OK and cancel button
    UIAlertView *alert = [[UIAlertView alloc] initWithTitle:@"Wrong Username" message:theMessage
                                                   delegate:nil cancelButtonTitle:nil otherButtonTitles:@"OK", nil];
    [alert show];
}

- (void)checkPassword:(NSString *)password forUser:(NSString *)user {
    
    user = [user stringByTrimmingCharactersInSet: [NSCharacterSet whitespaceCharacterSet]];
    self.userName = user;

    NSLog(@"BYR UserName: +%@+", userName_);
    
    NSString *moduleName;
    
    moduleName = @"modules";  // modules.plist file
    AppDelegate *theDelegate = (AppDelegate *)[[UIApplication sharedApplication] delegate];
    [theDelegate readInDataModel:moduleName forUser:userName_];
    
    [self layoutIcons:self.levels];

    BOOL youreIn = NO;
    NSDictionary *userInfo = [loginInfo_ objectForKey:user];
    
    if (userInfo != nil) {
        
        NSString *realPassWord = [userInfo objectForKey:@"password"];
        if (realPassWord && [password isEqualToString:realPassWord]) {
            youreIn = YES;
        }
        
        // TEMP!
        youreIn = YES;
        
        if (youreIn) {
            NSLog(@"You're in!");
            [self handleCorrectPassword];
        } else {
            [self showWrongPasswordAlert:userName_];
            NSLog(@"Hi %@! Wrong Password. Try Again or see the teacher for help!", userName_);
        }
        
    } else {
        [self showWrongUserNameAlert:userName_];
        NSLog(@"Hi %@, I don't recognize this username. Try Again or see the teacher for help!", userName_);
    }
}


- (IBAction)userPushedLogin:(id)sender {
    
    NSString *theUserName = @"guest";
    
    if ([loginTextView_.text length] != 0) {
        self.userName = loginTextView_.text;
        theUserName = loginTextView_.text;
    }
    
    [self checkPassword:passwordTextView_.text forUser:theUserName];
}

- (IBAction)backButtonPushed:(id)sender {
    
    // show iconView
    // hide leftOverlay
    
    iconsVisible = YES;
    
    CGRect newFrame;
    CGRect newFrame2;

    newFrame = CGRectOffset(_leftOverlayView.frame, -_leftOverlayView.bounds.size.width, 0.0);
    newFrame2 = CGRectOffset(iconView_.frame, iconView_.bounds.size.width, 0.0);
        
    menuVisible = NO;
    
    signLabel_.text = [NSString stringWithFormat:@"Welcome to SentenceWeaver %@", versionNumber];

    
    [UIView animateWithDuration:0.7 animations:^{
        _leftOverlayView.frame = newFrame;

    } completion:^(BOOL finished){
        
        [UIView animateWithDuration:0.7 animations:^{
            iconView_.frame = newFrame2;
        }];
    }];
}



- (void)buttonPushed:(id)sender {
    
    UIButton *theButton = (UIButton *)sender;
    
    NSLog(@"The button is: %d", theButton.tag);
    
    currentLevel_ = [_levels objectAtIndex:theButton.tag];
    currentLevel_.index = @(theButton.tag); //  Keeps track of current selection
    
    self.modules = [currentLevel_ modules];
    
    [_theTableView reloadData];
    
    levelLabel_.text = currentLevel_.levelName;
    
    signLabel_.text = currentLevel_.levelName;

    
    // hide iconView
    // show leftOverlay
    
    iconsVisible = NO;
    
    CGRect newFrame;
    CGRect newFrame2;
    
    newFrame = CGRectOffset(_leftOverlayView.frame, _leftOverlayView.bounds.size.width, 0.0);
    newFrame2 = CGRectOffset(iconView_.frame, -iconView_.bounds.size.width, 0.0);
    
    menuVisible = YES;
    
    [UIView animateWithDuration:0.7 animations:^{
        iconView_.frame = newFrame2;

    } completion:^(BOOL finished){
        
        [UIView animateWithDuration:0.7 animations:^{
            _leftOverlayView.frame = newFrame; }];
    }];
}

- (void)layoutIcons: (NSArray *)levelsArray {

	// reset iconScrollView
	for (UIView *view in [iconScrollView_ subviews])
	{
		[view removeFromSuperview]; }
	
	NSUInteger xIndex = 0;
	NSUInteger yIndex = 0;
	NSUInteger vSpacing = 88;
	NSUInteger hSpacing = 100;
	NSUInteger index = 0;
	
	NSUInteger xOffset = 90;
	NSUInteger yOffset = 56;
	
	NSUInteger pageIndex = 0;
    NSUInteger perspectiveShift = 9;
    
    NSUInteger iconsPerRow = 2;
    NSUInteger iconsPerPage = 4;
	
	for (Level *theLevel in levelsArray) {
		
		pageIndex = index / iconsPerPage; // Nine icons per page
		xIndex = index % iconsPerRow + pageIndex * iconsPerRow;
		yIndex = index / iconsPerRow - pageIndex * iconsPerRow;    // Note this is interger arthimetic
		
		//DLog(@"Index: %d xIndex: %d yIndex: %d pageIndex: %d", index, xIndex, yIndex, pageIndex);
		
		UIButton *newButton = [UIButton buttonWithType:UIButtonTypeCustom];
		newButton.tag = index;
		
		[newButton addTarget:self action:@selector(buttonPushed:) forControlEvents:UIControlEventTouchUpInside];
		newButton.bounds = CGRectMake(0, 0, hSpacing, vSpacing);
		newButton.center = CGPointMake(xOffset+(pageIndex*10.0) + xIndex*hSpacing, yOffset + yIndex*vSpacing - xIndex*perspectiveShift);
		      
		//UIImage *iconImage = [iconImageDict objectForKey:[menuItemDict objectForKey:@"iconFileName"]];

        [newButton setImage:[UIImage imageNamed:@"levelIcon.png"] forState:UIControlStateNormal];		
        
        CGFloat skewAngle = -5.0f;
        CGFloat skew = tan(skewAngle * M_PI / 180.f);
        //CGAffineTransform t = CGAffineTransformMake(1.0, 0.0, skew, 1.0, 0.0, 0.0);
        CGAffineTransform t = CGAffineTransformMakeRotation(skew);

        newButton.transform = t;
        
		//DLog(@"frame: %f %f %f %f", newButton.frame.origin.x, newButton.frame.origin.y,newButton.frame.size.width, newButton.frame.size.height);
		
		[self.iconScrollView addSubview:newButton];
		
		UILabel *buttonLabel = [[UILabel alloc] initWithFrame:CGRectZero];
		buttonLabel.text = theLevel.levelName;
		buttonLabel.transform = t;
		buttonLabel.frame = CGRectMake(0.0, 0.0, 125.0, 30.0);
        
		buttonLabel.textAlignment = UITextAlignmentCenter;
		buttonLabel.center = CGPointMake(xOffset+(pageIndex*10.0) + xIndex*hSpacing, yOffset + yIndex*vSpacing + 40.0 - xIndex*perspectiveShift);
		buttonLabel.backgroundColor = [UIColor clearColor];
		buttonLabel.textColor = [UIColor darkGrayColor];
		
		[self.iconScrollView addSubview:buttonLabel];
		
		index++; }
	
	// set the content size so it can be scrollable
	CGFloat pageCount = ceilf([levelsArray count] / 9.0f);
	[iconScrollView_ setContentSize:CGSizeMake(pageCount*320.0, iconScrollView_.frame.size.height)];
	
	//iconScrollPageControl.numberOfPages = pageCount;
	//iconScrollPageControl.currentPage = 0;
	//[iconScrollPageControl updateCurrentPageDisplay];
}

#pragma mark - View lifecycle

- (void)copyWebSiteFromBundle {
    
    NSString *grammerDir = [[[NSBundle mainBundle] bundlePath] stringByAppendingPathComponent:@"grammer"];
    NSFileManager *fileMgr = [NSFileManager defaultManager];
        
    NSString *docsDir = [NSHomeDirectory() stringByAppendingPathComponent:  @"Documents/grammer"];
    
    NSError *error = nil;
    
    BOOL didCopy = [fileMgr copyItemAtPath:grammerDir toPath:docsDir error:&error];
    
    NSLog(@"%d: Check For Errors: %@",didCopy, error);
}

/* Returns a URL to a local movie in the app bundle. */
-(NSURL *)localMovieURL
{
	NSURL *theMovieURL = nil;
	NSBundle *bundle = [NSBundle mainBundle];
	if (bundle) 
	{
		NSString *moviePath = [bundle pathForResource:@"grammarTrainer2" ofType:@"mov"];
		if (moviePath)
		{
			theMovieURL = [NSURL fileURLWithPath:moviePath];
		}
	}
    
    NSLog(@"Movie URL: %@",theMovieURL );
    return theMovieURL;
}

- (void)addMoviePlayer {
    
    MPMoviePlayerController *player =
    [[MPMoviePlayerController alloc] initWithContentURL: [self localMovieURL]];
    [player prepareToPlay];
    [player setRepeatMode:MPMovieRepeatModeOne];
    
    [player.view setFrame: _rightOverlayView.bounds];  // player's frame must match parent's
    [_rightOverlayView addSubview: player.view];
    // ...
    [player play];
}

- (void)toSpeech:(NSString *)toSay {
    self.fliteController.duration_stretch = 1.8;
    [self.fliteController say:toSay withVoice:self.slt]; }

- (void)viewDidLoad
{
    [super viewDidLoad];
	// Do any additional setup after loading the view, typically from a nib.
    
    menuVisible = YES;
    iconsVisible = YES;
    pendingDataModelLoad = NO;
    
    loginInfo_ = [NSMutableDictionary new];
    
    self.view.backgroundColor = [UIColor colorWithPatternImage:[UIImage imageNamed:@"canvasTexture.jpg"]];
    
    // Set up default values.
    self.theTableView.sectionHeaderHeight = HEADER_HEIGHT;
    
    // Open a stream for the file we're going to receive into.
    NSArray *paths = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES);
    NSString *documentsDirectory = [paths objectAtIndex:0];

    NSString *loginPlist = [documentsDirectory stringByAppendingPathComponent:  @"login.plist"];
        
    NSDictionary *userDict = [[NSDictionary alloc] initWithContentsOfFile:loginPlist];
    
    if (userDict) {
        [loginInfo_ addEntriesFromDictionary:userDict];
    } else {
        NSLog(@"No login.plist found. Will need to wait for google spreadsheet results to come back."); }

    NSString *sUserAgentString = [NSString stringWithFormat:@"Version %@ (%@)", [[[NSBundle mainBundle] infoDictionary] objectForKey:@"CFBundleShortVersionString"], [[[NSBundle mainBundle] infoDictionary] objectForKey:@"CFBundleVersion"]];
    
    self.versionLabel.text = sUserAgentString;
    
    // Going to post results to a goole spreadsheet
    theSpreadsheetController_ = [[SpreadsheetController alloc] init];
    theSpreadsheetController_.delegate = self;    
    [theSpreadsheetController_ fetchSpreadSheetsForUserName:@"grammer.trainer" andPassWord:@"Grammer@Trainer"];


    /*
     The section info array is thrown away in viewWillUnload, so it's OK to set the default values here. If you keep the section information etc. then set the default values in the designated initializer.
     */

    openSectionIndex_ = NSNotFound;
    
    [self layoutIcons:self.levels];
    
    [self copyWebSiteFromBundle];
    
    // Instanciate JSON parser library
    json = [ SBJSON new ];
    signLabel_.text = [NSString stringWithFormat:@"Welcome to SentenceWeaver %@", versionNumber];
    //[self synchWithServer];
}

#pragma mark -
#pragma KVO Observing

- (void)viewDidUnload
{
    [super viewDidUnload];
    // To reduce memory pressure, reset the section info array if the view is unloaded.
	self.sectionInfoArray = nil;
}

- (void)viewWillAppear:(BOOL)animated
{
    [super viewWillAppear:animated]; }

- (void)viewDidAppear:(BOOL)animated
{
    [super viewDidAppear:animated]; }

- (void)viewWillDisappear:(BOOL)animated
{
	[super viewWillDisappear:animated]; }

- (void)viewDidDisappear:(BOOL)animated
{
	[super viewDidDisappear:animated]; }

- (BOOL)shouldAutorotateToInterfaceOrientation:(UIInterfaceOrientation)interfaceOrientation
{
    if (interfaceOrientation==UIInterfaceOrientationLandscapeLeft || interfaceOrientation==UIInterfaceOrientationLandscapeRight)
        return YES;
    
    return NO; }

- (void)willAnimateRotationToInterfaceOrientation:(UIInterfaceOrientation)interfaceOrientation duration:(NSTimeInterval)duration {
    
    iconScrollView_.frame = CGRectMake(0.0, 172.0, 320.0, 768.0-80.0-20.0-100.0); }

#pragma mark Text View Delegate

- (void)textViewDidChange:(UITextView *)textView {
    
    if (textView == passwordTextView_) {
        // See if they hit the enter key
        if ([textView.text hasSuffix:@"\n"]) {
            
            NSString *trimmed = [loginTextView_.text substringWithRange:NSMakeRange(0, [loginTextView_.text length]-1)];
            // trim trailing spaces
            trimmed = [trimmed stringByTrimmingCharactersInSet:[NSCharacterSet whitespaceCharacterSet]];
            [self checkPassword:passwordTextView_.text forUser:trimmed];
            [textView setText:@""]; // Blank it out
        }
    } else {
        // See if they hit the enter key
        // loginTextView
        if ([textView.text hasSuffix:@"\n"]) {
            
            NSString *trimmed = [textView.text substringWithRange:NSMakeRange(0, [textView.text length]-1)];
            // trim trailing spaces
            trimmed = [trimmed stringByTrimmingCharactersInSet:[NSCharacterSet whitespaceCharacterSet]];
            textView.text = trimmed;
            [textView resignFirstResponder];
            [passwordTextView_ becomeFirstResponder];
        }
    }
}

#pragma mark Table view data source and delegate

-(NSInteger)numberOfSectionsInTableView:(UITableView*)tableView {
    
    return [modules_ count]; }

-(NSInteger)tableView:(UITableView*)tableView numberOfRowsInSection:(NSInteger)section {
    	
    Module *theModule = (Module *)[modules_ objectAtIndex:section];
    
    return [theModule.lessons count]; }

- (UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath
{
    /*
    static NSString *CellIdentifier = @"Cell";
    
    UITableViewCell *cell = [tableView dequeueReusableCellWithIdentifier:CellIdentifier];
    if (cell == nil) {
        cell = [[UITableViewCell alloc] initWithStyle:UITableViewCellStyleValue1 reuseIdentifier:CellIdentifier];
    }
    */
    
    static NSString *ResultsCellIdentifier = @"ResultsTableViewCell";
	
	ResultsTableViewCell *cell = (ResultsTableViewCell *)[tableView dequeueReusableCellWithIdentifier:ResultsCellIdentifier];
	if (cell == nil) {		
		[[NSBundle mainBundle] loadNibNamed:@"ResultsTableCell" owner:self options:nil];
        cell = tmpCell_;
        self.tmpCell = nil;
		//cell.backgroundView = [[UACellBackgroundView alloc] initWithFrame:CGRectZero];
        cell.backgroundColor = [UIColor colorWithPatternImage:[UIImage imageNamed:@"paperPattern.png"]];
	}

    cell.contentView.backgroundColor = [UIColor colorWithPatternImage:[UIImage imageNamed:@"paperPattern.png"]];
    // Configure the cell...
    
    Module *theModule = (Module *)[modules_ objectAtIndex:indexPath.section];

    Lesson *theLesson = (Lesson *)[theModule.lessons objectAtIndex:indexPath.row];

    //cell.textLabel.text = [theLesson lessonName];
    //cell.detailTextLabel.text = [theLesson topic];
	cell.scoreLabel.text = [theLesson topic];
	//cell.descriptionOne.text = [dictItem objectForKey:@"Metric"];
	cell.descriptionTwo.text = [theLesson lessonName];
    
    NSDictionary *stateDict = [theLesson.resultsDictionary objectForKey:@"jsonStateVector"];
    NSArray *dotMatrix = [stateDict objectForKey:@"dotMatrix"];
    NSInteger currentStep = [self correctCount:dotMatrix];
    
    NSArray *redoMatrix = [stateDict objectForKey:@"promptsToRedo"];

    NSString *pctCmp = [NSString stringWithFormat:@"%d of %d", currentStep, [dotMatrix count]];
    NSString *correctCnt = [NSString stringWithFormat:@"%d", currentStep];
    NSString *wrongCnt = [NSString stringWithFormat:@"%d", [redoMatrix count]];
    
    NSString *partComplete = ([pctCmp isEqualToString:@"0 of 0"])?nil:pctCmp;

    NSString *imageName = @"CheckMarkUnChecked.png";
    if (partComplete) {
        
        cell.greenCount.text = correctCnt;
        cell.redCount.text = wrongCnt;
        
        if (currentStep == [dotMatrix count]) {
            imageName = @"HappyFace.png";
            cell.redCount.text = @"";
            cell.greenCount.text = @"";
        } else {
            imageName = @"CheckMarkUnChecked.png";
        }
    } else {
        
        cell.greenCount.text = @"";
        cell.redCount.text = @""; }
    
    cell.checkMark.image = [UIImage imageNamed:imageName];
	
	//[cell setPosition:UACellBackgroundViewPositionMiddle];
	[cell setColor:UACellBackgroundLightGray];
	
	[cell setPosition:UACellBackgroundViewPositionMiddle];

    return cell;
}

- (NSInteger)correctCount:(NSArray *)dotStateArray {
    
    NSInteger i = 0;
    for (NSNumber *num in dotStateArray) {
        if(num.integerValue == 2)
            i++;
    }
    return  i;
}

- (NSString *)partComplete:(Lesson *)lesson {
    
    NSDictionary *stateDict = [lesson.resultsDictionary objectForKey:@"jsonStateVector"];
    NSArray *indexArray = [stateDict objectForKey:@"indexArray"];
    NSInteger currentStep = [[stateDict objectForKey:@"step"] integerValue];
    
    NSString *pctCmp = [NSString stringWithFormat:@"%d of %d", currentStep, [indexArray count]];
    
    return ([pctCmp isEqualToString:@"0 of 0"])?nil:pctCmp;
}

-(UIView*)tableView:(UITableView*)tableView viewForHeaderInSection:(NSInteger)section {

    Module *theModule = (Module *)[modules_ objectAtIndex:section];

    CGRect titleLabelFrame = CGRectMake(0.0, 0.0, 320.0, 40.0);
    
    UIView *sectionView = [[UIView alloc] initWithFrame:titleLabelFrame];
    sectionView.backgroundColor = [UIColor colorWithPatternImage:[UIImage imageNamed:@"paperPattern.png"]];
    
    //sectionView.layer.borderColor = [[UIColor lightGrayColor] CGColor];
    //sectionView.layer.borderWidth = 1.0;
    
    UILabel *label = [[UILabel alloc] initWithFrame:CGRectInset(titleLabelFrame, 10.0, 0)];
    label.text = theModule.name;
    label.font = [UIFont boldSystemFontOfSize:17.0];
    label.textColor = [UIColor colorWithRed:0.25 green:0.25 blue:0.70 alpha:1.0];
    label.backgroundColor = [UIColor clearColor];
    
    [sectionView addSubview:label];
    
    return sectionView;
}

-(CGFloat)tableView:(UITableView*)tableView heightForRowAtIndexPath:(NSIndexPath*)indexPath {
    
	//SectionInfo *sectionInfo = [self.sectionInfoArray objectAtIndex:indexPath.section];
    //return [[sectionInfo objectInRowHeightsAtIndex:indexPath.row] floatValue];
    // Alternatively, return rowHeight.
    
    return 88;
}

- (void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath
{
    Module *theModule = (Module *)[modules_ objectAtIndex:indexPath.section]; 
    Lesson *theLesson = (Lesson *)[theModule.lessons objectAtIndex:indexPath.row];

    // Save the currently selected module and lesson
    self.currentModule = theModule;
    self.currentLesson = theLesson;
    self.indexPath = indexPath;
    self.myLessonIndex = indexPath.row;
    //self.myLessonIndex = [NSNumber numberWithInteger:indexPath.row];
    
    currentModule_.index = @(indexPath.section); //  Keeps track of current selection
    currentLesson_.index = @(indexPath.row); //  Keeps track of current selection
    
    [self loadLesson:theLesson];
    [tableView deselectRowAtIndexPath:indexPath animated:YES];
}

//- (void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath
- (void)goToNextLesson
{
   
    [self exitLesson];
    //NSLog(@"inside goToNextLesson:  after self exitLesson: ");
    //NSLog(@"MELFI MELFI myLessonIndex: %ld", (long)self.myLessonIndex);
 
    Module *theModule = (Module *)[modules_ objectAtIndex:indexPath_.section];

    self.myLessonIndex = self.myLessonIndex + 1;
    //NSLog(@"MEADOW theModule.lessons.count: %lu:  myLessonIndex:  %ld", (unsigned long)theModule.lessons.count, (long)self.myLessonIndex);
    if (self.myLessonIndex >= theModule.lessons.count) {
        NSLog(@"found myLessonIndex >= theModule.lessons.count:");
        menuVisible = NO;
        [self showMenu];
        return;
    }
    
    Lesson *theLesson = (Lesson *)[theModule.lessons objectAtIndex:self.myLessonIndex];
   
    // Save the currently selected module and lesson
    self.currentModule = theModule;
    self.currentLesson = theLesson;
    
    currentModule_.index = @(indexPath_.section); //  Keeps track of current selection
    currentLesson_.index = @(indexPath_.row); //  Keeps track of current selection

    menuVisible = YES;
 
    [self loadLesson:theLesson];
}


#pragma Native Web Interface

// Call this function when you have results to send back to javascript callbacks
// callbackId : int comes from handleCall function
// args: list of objects to send to the javascript callback
- (void)returnResult:(int)callbackId args:(id)arg, ...;
{
    if (callbackId==0) return;
    
    va_list argsList;
    NSMutableArray *resultArray = [[NSMutableArray alloc] init];
    
    if(arg != nil){
        [resultArray addObject:arg];
        va_start(argsList, arg);
        while((arg = va_arg(argsList, id)) != nil)
            [resultArray addObject:arg];
        va_end(argsList);
    }
    
    NSError* error = nil;
    
    NSString *resultArrayString = [json stringWithObject:resultArray allowScalar:YES error:&error];

    //DLog(@"resultArrayString: %@", resultArrayString);
    
    NSLog(@"returnResult for callbackID: %d result:%@", callbackId,resultArrayString);
    
    // We need to perform selector with afterDelay 0 in order to avoid weird recursion stop
    // when calling NativeBridge in a recursion more then 200 times :s (fails ont 201th calls!!!)
    [self performSelector:@selector(returnResultAfterDelay:) withObject:[NSString stringWithFormat:@"NativeBridge.resultForCallback(%d,%@);",callbackId,resultArrayString] afterDelay:0];
    NSLog(@"back from returnResultAfterDelay 3: ");
}

-(void)returnResultAfterDelay:(NSString*)str {
    // Now perform this selector with waitUntilDone:NO in order to get a huge speed boost! (about 3x faster on simulator!!!)
    NSLog(@"stringByEvaluatingJavaScriptFromString: %@", str);

    [self.theWebView performSelectorOnMainThread:@selector(stringByEvaluatingJavaScriptFromString:) withObject:str waitUntilDone:NO];
    NSLog(@"about to exit returnResultAfterDelay: ");
}


- (void)sendEntryToServer:(NSDictionary *)entry {
	
    // userID, entryDate,responseText,lesson,module, questionNumber,feedbackType
    
    NSMutableString *theQuery = [[NSMutableString alloc] init];
    [theQuery appendFormat:@"?userID=%@", [entry objectForKey:@"userID"]];
    [theQuery appendFormat:@"&entryDate=%@", [entry objectForKey:@"entryDate"]];
    [theQuery appendFormat:@"&responseText=%@", [entry objectForKey:@"responseText"]];
    [theQuery appendFormat:@"&lesson=%@", [entry objectForKey:@"lesson"]];
    [theQuery appendFormat:@"&module=%@", [entry objectForKey:@"module"]];
    [theQuery appendFormat:@"&questionNumber=%@", [entry objectForKey:@"questionNumber"]];
    [theQuery appendFormat:@"&feedbackType=%@", [entry objectForKey:@"feedbackType"]];
    
	NSString *urlString = [[NSString alloc] initWithFormat:@"http://leo.goodwin.drexel.edu/grammerapp/addGTEvent.php%@", theQuery];
    
    NSString *encodedURL = [urlString stringByAddingPercentEscapesUsingEncoding:NSUTF8StringEncoding];
    NSLog(@"sendEntryToServer URL: %@", encodedURL);
    	
	// new code
	// create the request
	NSURLRequest *theRequest=[NSURLRequest requestWithURL:[NSURL URLWithString:encodedURL]
											  cachePolicy:NSURLRequestUseProtocolCachePolicy
										  timeoutInterval:60.0];
/*    
	// create the connection with the request
	// and start loading the data
	NSURLConnection *theConnection=[[NSURLConnection alloc] initWithRequest:theRequest delegate:self];
	if (theConnection) {
		// Create the NSMutableData that will hold
		// the received data
		// receivedData is declared as a method instance elsewhere
		receivedData=[[NSMutableData data] retain];
        
	} else {
		// inform the user that the download could not be made
	}
	// end new code
*/
    
    [NSURLConnection sendAsynchronousRequest:theRequest queue:[NSOperationQueue mainQueue] completionHandler:^(NSURLResponse *response, NSData *theData, NSError *error) {
        
        // If there was an error getting the data
        if (error) {
            
            // Save the encoded URL to a file, we'll try again later
              
            NSString *path = [[self docDir] stringByAppendingPathComponent:@"offline.plist"];
            NSMutableArray *cacheArray;
            
            if ([[NSFileManager defaultManager] fileExistsAtPath:path]) {
                // File already exist, were going to add to it
                cacheArray = [[NSMutableArray alloc] initWithContentsOfFile:path];
            } else {
                // File does not yet exist, we'll create it
                cacheArray = [NSMutableArray new]; }
                 
            [cacheArray addObject:theRequest.URL.absoluteString];            
            [cacheArray writeToFile:path atomically:YES];
            
            NSLog(@"Error: %@", error);
            return;
        }
        NSLog(@"All right! No Error");
    }];
	
}

-(void)updateStateWithDict:(NSDictionary *)state {
    
    //         NSString *uniqueFile = [NSString stringWithFormat:@"%@_%@_%@_%@.plist",self.userName, currentLevel_.index,currentModule_.index,currentLesson_.index];

    // Need to insert this into ...    
}

// Implements all you native function in this one, by matching 'functionName' and parsing 'args'
// Use 'callbackId' with 'returnResult' selector when you get some results to send back to javascript
- (void)handleCall:(NSString*)functionName callbackId:(int)callbackId args:(NSArray*)args
{
         
   if ([functionName isEqualToString:@"goToNextLesson"]) {
        [self goToNextLesson];    
    } else if ([functionName isEqualToString:@"lessonLoaded"]) {
        //NSLog(@"Did call lessonLoaded");
        menuVisible = YES;
        [self showMenu];
   /* }  else if ([functionName isEqualToString:@"showMenu"]) {
        //NSLog(@"Did call showMenu");
        menuVisible = NO;
        [self showMenu];
        [self.theTableView reloadData];*/
    }  else if ([functionName isEqualToString:@"exitLesson"]) {
        //NSLog(@"SNAKESSSSSS Did call exitLesson");
        //menuVisible = NO;
        [self exitLesson];
        [self.theTableView reloadData];
    } else if ([functionName isEqualToString:@"toSpeech"]) {
        NSString *oneArg = (NSString*)[args objectAtIndex:0];
        [self toSpeech:oneArg];
    }  else if ([functionName isEqualToString:@"saveState"]) {
        
        NSLog(@"Did call saveState");
        //[self saveState];
        //NSLog(@"saveState arg count: %d", [args count]);
        //NSString *state = (NSString*)[args objectAtIndex:0];
        // Save user, lesson, stateVector
        // userName
        
        NSDictionary *stateDict  = @{@"jsonStateVector": args};
        currentLesson_.resultsDictionary = stateDict;
        NSString *uniqueFile = [NSString stringWithFormat:@"%@_%@_%@_%@.plist",self.userName, currentLevel_.index,currentModule_.index,currentLesson_.index]; 
        NSString *path = [[self docDir] stringByAppendingPathComponent:uniqueFile];
        [stateDict writeToFile:path atomically:YES];
        // [self updateStateWithDict:stateDict ];
        //NSLog(@"saveState arg: %@", args);
    }  else if ([functionName isEqualToString:@"getGender"]) {
        NSLog(@"Javascript: getGender");

        NSDictionary *userInfo = [self.loginInfo objectForKey:userName_];
        NSString *gender = @"male";
        if (userInfo) {
            NSString *morf = [userInfo objectForKey:@"gender"]; // M or F
            gender = [morf isEqualToString:@"M"]?@"male":@"female";
            NSLog(@"Gender is %@", morf);
        }
        [self returnResult:callbackId args:gender,nil];
        
    } else if ([functionName isEqualToString:@"printDebug"]) {
        
        NSString *oneArg = (NSString*)[args objectAtIndex:0];
        NSString *twoArg = (NSString*)[args objectAtIndex:1];
        NSString *threeArg = (NSString*)[args objectAtIndex:2];
        NSString *fourArg = (NSString*)[args objectAtIndex:3];
        
        NSLog(@"Debug: %@, %@, %@, %@", oneArg, twoArg,threeArg,fourArg);
    }  else if ([functionName isEqualToString:@"recordNative"]) {
        NSLog(@"Did call recordNative");
        
        if ([args count]!=4) {
            NSLog(@"recordNative exactly 4 arguments!");
            return;
        }
        
        NSString *feedback = (NSString*)[args objectAtIndex:0];
        NSString *responseText = (NSString*)[args objectAtIndex:1];
        NSString *points = (NSString*)[args objectAtIndex:2];
        NSString *exNum = (NSString*)[args objectAtIndex:3];
        
        // if feedback is equal to "correct"
        // put up an alert or fireworks or something,
        
        if ([feedback isEqualToString:@"CorrectAnswer"]) {
            
            UIAlertView *alertView = [[UIAlertView alloc] 
                         initWithTitle:@"All right!"
                         message:@"That is the correct answer!" 
                         delegate:self 
                         cancelButtonTitle:nil 
                         otherButtonTitles:@"Next", nil];

           [alertView show];
            // Further processing in alertView:didDismissWithButtonIndex:
        }
        
        // Prepare a dictionary of values and send it to the server
        
        NSDate *now = [NSDate date];
        
        NSDateFormatter *dateFormatter = [[NSDateFormatter alloc] init];
        [dateFormatter setDateFormat:@"yyyy-MM-dd HH:mm:ss"];
        NSString *formattedDateString = [dateFormatter stringFromDate:now];
        
        NSLog(@"Values: %@, %@, %@, %@, %@",userName_, formattedDateString, feedback,responseText,points);
        
        // userID, entryDate,responseText,lesson,module, questionNumber,feedbackType

        NSDictionary *theEntry = @{@"userID": userName_,
                                  @"entryDate": formattedDateString,
                                  @"responseText": responseText,
                                  @"lesson": self.currentLesson.lessonNumber,
                                  @"module": self.currentModule.moduleNumber,
                                  @"questionNumber": exNum,
                                  @"feedbackType": feedback};
        
        [self sendEntryToServer:theEntry];
        
    } else {
        NSLog(@"Unimplemented method '%@'",functionName);
    }
}

- (void)alertView:(UIAlertView *)alertView didDismissWithButtonIndex:(NSInteger)buttonIndex {
    
    if ([alertView.title isEqualToString:@"All right!"]) {
            // Tell webview to goto next exercise
        // Instead of calling resetLesson() we pass init using our saved stateVector
        NSString *javascriptString = @"goToNextExercise();";
        [self performSelector:@selector(returnResultAfterDelay:) withObject:javascriptString afterDelay:0.1];
        //NSLog(@"back from returnResultAfterDelay: ");
    }
}




#pragma UIWebview Delegate

- (void)webViewDidFinishLoad:(UIWebView *)webView {
    
    [webView setHidden:NO]; 
    
    NSLog(@"webViewDidFinishLoad with pendingDataModelLoad:%@", pendingDataModelLoad?@"True":@"False");
    
    if (pendingDataModelLoad) {
        
        pendingDataModelLoad = NO;
        // intialize datamodel        
        //  NSString *path = [[NSBundle mainBundle] pathForResource:@"initDataModel" ofType:@"js"];
        
        //NSString *uniqueFile = [NSString stringWithFormat:@"%@_%@_%@_%@.plist",self.userName,currentLevel_.index,currentModule_.index,currentLesson_.index];
        
        //NSString *path = [[self docDir] stringByAppendingPathComponent:uniqueFile];
        
        NSDictionary *stateVectorDict  = currentLesson_.resultsDictionary; //[[NSDictionary alloc] initWithContentsOfFile:path];

        if (stateVectorDict) {
             
            NSDictionary *stateVector = [stateVectorDict objectForKey:@"jsonStateVector"];
            
            NSMutableString *someJavaScript = [NSMutableString new];
            [someJavaScript appendFormat:@"currentLessonNumber = %@;", [stateVector objectForKey:@"currentLessonNumber"] ];
            [someJavaScript appendFormat:@"currentExerciseNumber = %@;", [stateVector objectForKey:@"currentExerciseNumber"] ];
            [someJavaScript appendFormat:@"step = %@;", [stateVector objectForKey:@"step"] ];
            [someJavaScript appendFormat:@"currentAnswer = \"%@\";", [stateVector objectForKey:@"currentAnswer"] ];
            [someJavaScript appendFormat:@"currentWord = \"%@\";", [stateVector objectForKey:@"currentWord"] ];
            [someJavaScript appendFormat:@"redoMode = %@;", [stateVector objectForKey:@"redoMode"] ];
            
            [someJavaScript appendString:[self makeJavaArrayFromArray:[stateVector objectForKey:@"promptsToRedo"] withName:@"promptsToRedo"]];
            [someJavaScript appendFormat:@"currentRedoPromptNumber = %@;", [stateVector objectForKey:@"currentRedoPromptNumber"] ];

            [someJavaScript appendString:[self makeJavaArrayFromArray:[stateVector objectForKey:@"indexArray"] withName:@"indexArray"]];
            [someJavaScript appendString:[self makeJavaArrayFromArray:[stateVector objectForKey:@"dotMatrix"] withName:@"dotMatrix"]];             
          
            /*
             Making something which should look like this...
             
             currentLessonNumber = 1;
             currentExerciseNumber = 3;
             step = 2;
             currentAnswer = "";
             currentWord = "you";
             redoMode = 0;
             promptsToRedo = [1];
             currentRedoPromptNumber = 0;
             indexArray = [8,3,7,0,14,5,6,2,11,9,1,10,12,4,15,13];
             dotMatrix = [0,0,0,1,0,0,0,0,2,0,0,0,0,0,0,0];
            */
            
            NSLog(@"The Dict: %@", someJavaScript);
            
            // Instead of calling resetLesson() we pass init using our saved stateVector
            NSString *javascriptString = [NSString stringWithFormat:@"%@%@",someJavaScript,  @"initUserInterface();" ];
            [self performSelector:@selector(returnResultAfterDelay:) withObject:javascriptString afterDelay:1.0];
            NSLog(@"back from returnResultAfterDelay 1: ");

        } else {
            NSString *javascriptString = @"resetLesson();  initUserInterface();";
            [self performSelector:@selector(returnResultAfterDelay:) withObject:javascriptString afterDelay:1.0];
            NSLog(@"back from returnResultAfterDelay 2: ");
        }
        
        //NSString *javascriptString = [NSString stringWithContentsOfFile:path encoding:NSASCIIStringEncoding error:nil];
        
        
        // We need to perform selector with afterDelay 0 in order to avoid weird recursion stop
        // when calling NativeBridge in a recursion more then 200 times :s (fails ont 201th calls!!!)
        
        //[self returnResultAfterDelay:javascriptString];
        
        //     [self.theWebView performSelectorOnMainThread:@selector(stringByEvaluatingJavaScriptFromString:) withObject:str waitUntilDone:NO];
        
        //[self.theWebView stringByEvaluatingJavaScriptFromString:javascriptString];
    } else {
        menuVisible = NO;
        [self showMenu];
    }

}

- (NSString *)makeJavaArrayFromArray:(NSArray *)theArray withName:(NSString *)theName {
    
    NSMutableString *someJavaScript = [NSMutableString new];
    
    if (theArray) {
        [someJavaScript appendFormat:@"%@ = [", theName];
        
        for (int i=0;i < [theArray count];i++) {
            if (i == [theArray count]-1) {
                [someJavaScript appendFormat:@"%@", [theArray objectAtIndex:i] ];                    
            } else {
                [someJavaScript appendFormat:@"%@,", [theArray objectAtIndex:i] ];                    
            }
        }
        [someJavaScript appendString:@"];"];                
    } else {
        return nil;
    }
    
    return someJavaScript;
}

- (void)webView:(UIWebView *)webView didFailLoadWithError:(NSError *)error {
    
    NSLog(@"webViewDidFailLoadWithError: %@", error);
}

- (BOOL)webView:(UIWebView *)webView2 shouldStartLoadWithRequest:(NSURLRequest *)request  navigationType:(UIWebViewNavigationType)navigationType {
    
	NSString *requestString = [[request URL] absoluteString];
    
    //NSLog(@"CORRADO request : %@",requestString);
    
    if ([requestString hasPrefix:@"js-frame:"]) {
        
        NSArray *components = [requestString componentsSeparatedByString:@":"];
        
        NSString *function = (NSString*)[components objectAtIndex:1];
		int callbackId = [((NSString*)[components objectAtIndex:2]) intValue];
        NSString *argsAsString = [(NSString*)[components objectAtIndex:3] 
                                  stringByReplacingPercentEscapesUsingEncoding:NSUTF8StringEncoding];
        NSArray *args = (NSArray*)[json objectWithString:argsAsString error:nil]; 
        [self handleCall:function callbackId:callbackId args:args];
        return NO;
    }
    return YES;
}


#pragma mark - Spreadsheet Delegate

- (void)spreadsheetController:(SpreadsheetController *)controller didFetchSpreadSheets:(NSArray *)entries {
    
    //NSString *message = [NSString stringWithFormat:@"Found %d Locations", [entries count]];
    
    
    if ([entries count] > 0) {
                
        NSDictionary *customElements;        
        
        for (customElements in entries) {
            
            /* customElements look like this...
             Row: {
             firstname = "GDataSpreadsheetCustomElement 0x2c5cf0: {name:firstname stringValue:Obinna}";
             gender = "GDataSpreadsheetCustomElement 0x2c61f0: {name:gender stringValue:M}";
             lastname = "GDataSpreadsheetCustomElement 0x2c5f40: {name:lastname stringValue:Otti}";
             login = "GDataSpreadsheetCustomElement 0x2c5a50: {name:login stringValue:obinna}";
             password = "GDataSpreadsheetCustomElement 0x2c60b0: {name:password stringValue:pass}";
             }

             */
            
            GDataSpreadsheetCustomElement *element;
            element = [customElements objectForKey:@"firstname"];
            NSString *firstname = [element stringValue];

            //plotLocation.latitude = [[element stringValue] floatValue];
            element = [customElements objectForKey:@"lastname"];
			//plotLocation.longitude = [[element stringValue] floatValue];
            NSString *lastname = [element stringValue];
            
            //CoreOppAnnotation *pin = [[CoreOppAnnotation alloc] initWithCoordinate:plotLocation];
            element = [customElements objectForKey:@"gender"];
            NSString *gender = [element stringValue];

            //pin.theTitle = [element stringValue];
            element = [customElements objectForKey:@"login"];
            NSString *login = [element stringValue];

            //pin.theSubtitle = [element stringValue];
            
            element = [customElements objectForKey:@"password"];
            NSString *password = [element stringValue];

            //pin.urlFurtherInfo = [NSURL URLWithString:[element stringValue]];
            
            NSDictionary *userDict = @{@"firstname": firstname,
                                      @"lastname": lastname,
                                      @"gender": gender,
                                      @"login": login,
                                      @"password": password};
            
            [loginInfo_ setObject:userDict forKey:login];
        }
        
        NSString *loginPlist = [[self docDir] stringByAppendingPathComponent:  @"login.plist"];
        
        [loginInfo_ writeToFile:loginPlist atomically:YES];      
    }
}

- (NSString *)docDir {
    
    // Open a stream for the file we're going to receive into.
    NSArray *paths = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES);
    NSString *documentsDirectory = [paths objectAtIndex:0];
    
    return documentsDirectory;
}


@end
