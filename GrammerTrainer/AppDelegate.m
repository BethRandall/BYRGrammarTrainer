//
//  AppDelegate.m
//  GrammerTrainer
//
//  Created by Eric Kille on 12/27/11.
//  Copyright (c) 2011 __MyCompanyName__. All rights reserved.
//

#import "AppDelegate.h"

#import "ViewController.h"
#import "Level.h"
#import "Module.h"
#import "Lesson.h"
#import "Reachability.h"

@interface AppDelegate ()

@property (nonatomic, strong) NSArray *levels;

@end

@implementation AppDelegate

@synthesize window = _window, levels=levels_;
@synthesize viewController = _viewController;


- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
    self.window = [[UIWindow alloc] initWithFrame:[[UIScreen mainScreen] bounds]];
    // Override point for customization after application launch.
    if ([[UIDevice currentDevice] userInterfaceIdiom] == UIUserInterfaceIdiomPhone) {
        self.viewController = [[ViewController alloc] initWithNibName:@"ViewController_iPhone" bundle:nil];
    } else {
        self.viewController = [[ViewController alloc] initWithNibName:@"ViewController_iPad" bundle:nil];
    }
    
    /*
     Get the levels,modules, and lessons data from the plist, then pass the array on to the table view controller.
     */
    //[self readInDataModel:@"moduleFull"];
    
    
    // Observe the kNetworkReachabilityChangedNotification. When that notification is posted, the
    // method "reachabilityChanged" will be called.
    // (BPLL) Checks for internet connection issues vs. specific server issues
    [[NSNotificationCenter defaultCenter] addObserver: self selector: @selector(reachabilityChanged:) name: kReachabilityChangedNotification object: nil];
    
    //Change the host name here to change the server your monitoring - (BPLL) checks for internet
	hostReach = [Reachability reachabilityWithHostName: @"www.apple.com"];
	[hostReach startNotifier];

    self.window.rootViewController = self.viewController;
    [self.window makeKeyAndVisible];
    return YES;
}

//Called by Reachability whenever status changes.
- (void) reachabilityChanged: (NSNotification* )note
{
	Reachability* curReach = [note object];
	NSParameterAssert([curReach isKindOfClass: [Reachability class]]);
    
    NetworkStatus netStatus = [curReach currentReachabilityStatus];
    BOOL connectionRequired= [curReach connectionRequired];
    NSString* statusString= @"";
    switch (netStatus)
    {
        case NotReachable:
        {
            statusString = @"Access Not Available";
            //Minor interface detail- connectionRequired may return yes, even when the host is unreachable.  We cover that up here...
            connectionRequired= NO;  
            break;
        }
        case ReachableViaWWAN:
        {
            statusString = @"Reachable WWAN";
            break;
        }
        case ReachableViaWiFi:
        {
            statusString= @"Reachable WiFi";
            [self sendOfflineEntriesToServerIfExist];
            break;
        }
    }
    
    NSLog(@"Network Status: %@", statusString);
}

- (NSString *)docDir {
    // Open a stream for the file we're going to receive into.
    NSArray *paths = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES);
    NSString *documentsDirectory = [paths objectAtIndex:0];
    
    return documentsDirectory;    
}


- (void)sendOfflineEntriesToServerIfExist {
	
    NSString *path = [[self docDir] stringByAppendingPathComponent:@"offline.plist"];
    
    NSMutableArray *cacheArray;
    
    if ([[NSFileManager defaultManager] fileExistsAtPath:path]) {
        // File found, need to send entries to server
        cacheArray = [[NSMutableArray alloc] initWithContentsOfFile:path];

        if (cacheArray) {
            
            for (NSString *theURL in cacheArray) {
                
                NSLog(@"Sending offline cache to server with %lu entries", (unsigned long)[cacheArray count]);

                // create the request
                NSURLRequest *theRequest=[NSURLRequest requestWithURL:[NSURL URLWithString:theURL]
                                                          cachePolicy:NSURLRequestUseProtocolCachePolicy
                                                      timeoutInterval:60.0];
                
                [NSURLConnection sendAsynchronousRequest:theRequest queue:[NSOperationQueue mainQueue] completionHandler:^(NSURLResponse *response, NSData *theData, NSError *error) {
                    
                    // If there was an error getting the data
                    if (error) {
                        
                        // Save the encoded URL to a file, we'll try again later                        
                        [cacheArray addObject:theRequest.URL.absoluteString];            
                        [cacheArray writeToFile:path atomically:YES];
                        
                        NSLog(@"Error: %@", error);
                        return;
                    } else {
                        // Great!
                        NSLog(@"Send OK");
                        [cacheArray removeObject:theURL];
                        
                        // update plist
                        if ([cacheArray count]) {
                            NSLog(@"Updates made but not all offline entries sent");
                            [cacheArray writeToFile:path atomically:YES];
                        } else {
                            NSLog(@"All offline entries sent");
                            [[NSFileManager defaultManager] removeItemAtPath:path error:nil];
                        }

                    }

                }];

            }
            
        }
    } 
}

// Levels, Modules ,Lessons
- (void)readInDataModel:(NSString *)fileName forUser:(NSString *)user {
    
    NSURL *url = [[NSBundle mainBundle] URLForResource:fileName withExtension:@"plist"];
    
    NSArray *levelDictionaries = [[NSArray alloc ] initWithContentsOfURL:url];
    
    //     NSError *error;
    
    // This will hold the Level objects we create in the loop
    NSMutableArray *levelsArray = [NSMutableArray arrayWithCapacity:[levelDictionaries count]];
    
    for (NSDictionary *levelDictionary in levelDictionaries) {
        
        Level *level = [[Level alloc] init];
        [level setValuesForKeysWithDictionary:levelDictionary];

        NSArray *moduleDictionariesArray = [levelDictionary objectForKey:@"modules"];

        // This will hold the Module objects we create in the loop
        NSMutableArray *modulesArray = [NSMutableArray arrayWithCapacity:[moduleDictionariesArray count]];
        
        for (NSDictionary *moduleDictionary in moduleDictionariesArray) {
            
            Module *module = [[Module alloc] init];
            module.name = [moduleDictionary objectForKey:@"moduleName"];
            module.moduleNumber = [moduleDictionary objectForKey:@"moduleNumber"];
            
            NSArray *lessonDictionaries = [moduleDictionary objectForKey:@"lessons"];
            
            // This will hold the Lesson objects we create in the loop
            NSMutableArray *lessons = [NSMutableArray arrayWithCapacity:[lessonDictionaries count]];
            
            for (NSDictionary *lessonDictionary in lessonDictionaries) {
                
                NSUInteger levelIndex = [levelDictionaries indexOfObject:levelDictionary];
                NSUInteger moduleIndex = [moduleDictionariesArray indexOfObject:moduleDictionary];
                NSUInteger lessonIndex = [lessonDictionaries indexOfObject:lessonDictionary];
                
                Lesson *lesson = [[Lesson alloc] init];
                [lesson setValuesForKeysWithDictionary:lessonDictionary];
                
                // See if there is a results file stored for this lesson...
                lesson.resultsDictionary = [self readResultsFileForUser:user level:levelIndex module:moduleIndex lesson:lessonIndex];
                
                [lessons addObject:lesson];
            }
            module.lessons = lessons;
            
            [modulesArray addObject:module];
        }
        
        level.modules = modulesArray;
                
        [levelsArray addObject:level];
    }

    self.viewController.levels = self.levels = levelsArray;
        
}

- (NSDictionary *)readResultsFileForUser:(NSString *)user level:(NSUInteger)level module:(NSUInteger)module lesson:(NSUInteger)lesson  {
    
    NSString *uniqueFile = [NSString stringWithFormat:@"%@_%lu_%lu_%lu.plist",user,(unsigned long)level,(unsigned long)module,(unsigned long)lesson];
    
    NSString *path = [[self docDir] stringByAppendingPathComponent:uniqueFile];
    
    NSDictionary *stateVectorDict  = [NSDictionary dictionaryWithContentsOfFile:path];
    
    //NSLog(@"Checking for... %@", uniqueFile);
    //NSLog(@"Found: %@", stateVectorDict);

    return stateVectorDict;
}

- (void)applicationWillResignActive:(UIApplication *)application
{
    /*
     Sent when the application is about to move from active to inactive state. This can occur for certain types of temporary interruptions (such as an incoming phone call or SMS message) or when the user quits the application and it begins the transition to the background state.
     Use this method to pause ongoing tasks, disable timers, and throttle down OpenGL ES frame rates. Games should use this method to pause the game.
     */
}

- (void)applicationDidEnterBackground:(UIApplication *)application
{
    /*
     Use this method to release shared resources, save user data, invalidate timers, and store enough application state information to restore your application to its current state in case it is terminated later. 
     If your application supports background execution, this method is called instead of applicationWillTerminate: when the user quits.
     */
}

- (void)applicationWillEnterForeground:(UIApplication *)application
{
    /*
     Called as part of the transition from the background to the inactive state; here you can undo many of the changes made on entering the background.
     */
}

- (void)applicationDidBecomeActive:(UIApplication *)application
{
    /*
     Restart any tasks that were paused (or not yet started) while the application was inactive. If the application was previously in the background, optionally refresh the user interface.
     */
}

- (void)applicationWillTerminate:(UIApplication *)application
{
    /*
     Called when the application is about to terminate.
     Save data if appropriate.
     See also applicationDidEnterBackground:.
     */
}

@end
