/* Copyright (c) 2007 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

//
//  SpreadsheetController.m
//

#import "SpreadsheetController.h"

@interface SpreadsheetController (PrivateMethods)

- (void)fetchFeedOfSpreadsheets;
- (void)fetchWorksheetsForSpreadsheetAtIndex: (NSUInteger)index;
- (void)fetchCellsForWorksheet:(NSUInteger)cellListSelector;
- (void)printWorksheetEntries;
- (void)fetchEntriesForWorksheet:(NSString *)name;

- (NSUInteger)indexOfSpreadSheetNamed:(NSString *)name;

- (GDataServiceGoogleSpreadsheet *)spreadsheetService;
- (GDataEntrySpreadsheet *)selectedSpreadsheet;
- (GDataEntryWorksheet *)selectedWorksheet;
- (GDataEntryBase *)selectedEntry;

- (GDataFeedSpreadsheet *)spreadsheetFeed;
- (void)setSpreadsheetFeed:(GDataFeedSpreadsheet *)feed;
- (NSError *)spreadsheetFetchError;
- (void)setSpreadsheetFetchError:(NSError *)error;  

- (GDataFeedWorksheet *)worksheetFeed;
- (void)setWorksheetFeed:(GDataFeedWorksheet *)feed;
- (NSError *)worksheetFetchError;
- (void)setWorksheetFetchError:(NSError *)error;
  
- (GDataFeedBase *)entryFeed;
- (void)setEntryFeed:(GDataFeedBase *)feed;
- (NSError *)entryFetchError;
- (void)setEntryFetchError:(NSError *)error;

@end

@implementation SpreadsheetController

@synthesize userName, passWord, delegate;

- (void)dealloc {
    
    delegate = nil;
    
    [userName release];
    [passWord release];
    
  [mSpreadsheetFeed release];
  [mSpreadsheetFetchError release];
  
  [mWorksheetFeed release];
  [mWorksheetFetchError release];
  
  [mEntryFeed release];
  [mEntryFetchError release];
  
  [super dealloc];
}

#pragma mark -

- (void)fetchSpreadSheetsForUserName:(NSString *)username andPassWord:(NSString *)password {
  
  NSCharacterSet *whitespace = [NSCharacterSet whitespaceAndNewlineCharacterSet];

  username = [username stringByTrimmingCharactersInSet:whitespace];
  
  if ([username rangeOfString:@"@"].location == NSNotFound) {
    // if no domain was supplied, add @gmail.com
    username = [username stringByAppendingString:@"@gmail.com"];
  }
    
    self.userName = username;
    self.passWord = password;

  
  [self fetchFeedOfSpreadsheets];
    
}

- (void)fetchEntriesForWorksheet:(NSString *)username {
    
    NSCharacterSet *whitespace = [NSCharacterSet whitespaceAndNewlineCharacterSet];
    
    username = [username stringByTrimmingCharactersInSet:whitespace];
    
    if ([username rangeOfString:@"@"].location == NSNotFound) {
        // if no domain was supplied, add @gmail.com
        username = [username stringByAppendingString:@"@gmail.com"];
    }
    
    self.userName = username;
    
    [self fetchFeedOfSpreadsheets];
}

- (void)feedSegmentClicked:(id)sender {
  // user switched between cell and list feed
  //[self fetchSelectedWorksheet];
}


#pragma mark -

// get a spreadsheet service object with the current username/password
//
// A "service" object handles networking tasks.  Service objects
// contain user authentication information as well as networking
// state information (such as cookies and the "last modified" date for
// fetched data.)

- (GDataServiceGoogleSpreadsheet *)spreadsheetService {
  
  static GDataServiceGoogleSpreadsheet* service = nil;

  if (!service) {
    service = [[GDataServiceGoogleSpreadsheet alloc] init];

    [service setShouldCacheResponseData:YES];
    [service setServiceShouldFollowNextLinks:YES];
  }

  
  [service setUserCredentialsWithUsername:self.userName
                                 password:self.passWord];
  
  return service;
}


// get the cell or list entry selected in the bottom list
- (GDataEntryBase *)selectedEntryForIndex:(NSUInteger)index {
  
  NSArray *entries = [mEntryFeed entries];
  

    if ([entries count] > 0 && index > -1) {
    
    GDataEntryBase *entry = [entries objectAtIndex:index];
    return entry;
  }
  return nil;
}

#pragma mark Fetch feed of all of the user's spreadsheets

// begin retrieving the list of the user's spreadsheets
- (void)fetchFeedOfSpreadsheets {

  [self setSpreadsheetFeed:nil];
  [self setSpreadsheetFetchError:nil];
    
  [self setWorksheetFeed:nil];
  [self setWorksheetFetchError:nil];
  [self setEntryFeed:nil];
  [self setEntryFetchError:nil];

  mIsSpreadsheetFetchPending = YES;

  GDataServiceGoogleSpreadsheet *service = [self spreadsheetService];
  NSURL *feedURL = [NSURL URLWithString:kGDataGoogleSpreadsheetsPrivateFullFeed];
  [service fetchFeedWithURL:feedURL
                   delegate:self
          didFinishSelector:@selector(feedTicket:finishedWithFeed:error:)];

}

// spreadsheet list fetch callback
- (void)feedTicket:(GDataServiceTicket *)ticket
  finishedWithFeed:(GDataFeedSpreadsheet *)feed
             error:(NSError *)error {

  [self setSpreadsheetFeed:feed]; // retain feed and assign to our ivar mSpreadsheetFeed
  [self setSpreadsheetFetchError:error];

  mIsSpreadsheetFetchPending = NO;
    
    
    NSArray *spreadsheets = [mSpreadsheetFeed entries];
    GDataEntrySpreadsheet *sheet;

    for (sheet in spreadsheets) {
        NSLog(@"Spreadsheet: %@", [[sheet title] stringValue]);
    }

    NSUInteger indexOfSheet = [self indexOfSpreadSheetNamed:@"Grammer-Credentials"];
    
    if (indexOfSheet == NSNotFound) {
        NSLog(@"Could not Find: %@", @"Sample");
    } else {
        [self fetchWorksheetsForSpreadsheetAtIndex:indexOfSheet];
        
    }

}

- (NSUInteger)indexOfSpreadSheetNamed:(NSString *)name {
    
    NSUInteger index = NSNotFound;
    
    NSArray *spreadsheets = [mSpreadsheetFeed entries];
    GDataEntrySpreadsheet *sheet;
    
    for (sheet in spreadsheets) {
        if ([[[sheet title] stringValue] isEqualToString:name]) {
            return [spreadsheets indexOfObject:sheet];
        }
    }    
    
    return index;
}

#pragma mark Fetch a spreadsheet's Worksheets

// for the spreadsheet selected in the top list, begin retrieving the list of
// Worksheets
- (void)fetchWorksheetsForSpreadsheetAtIndex: (NSUInteger)index {
    
    
    NSArray *spreadsheets = [mSpreadsheetFeed entries];
    
    GDataEntrySpreadsheet *spreadsheet;

    if ([spreadsheets count] > 0) {
        
        spreadsheet = (GDataEntrySpreadsheet *)[spreadsheets objectAtIndex:index];

    }
    
 if (spreadsheet) {
    
    NSURL *feedURL = [spreadsheet worksheetsFeedURL];  // GDataEntryBase
    if (feedURL) {
      
      [self setWorksheetFeed:nil];
      [self setWorksheetFetchError:nil];
      mIsWorksheetFetchPending = YES;
      
      [self setEntryFeed:nil];
      [self setEntryFetchError:nil];      

      GDataServiceGoogleSpreadsheet *service = [self spreadsheetService];
      [service fetchFeedWithURL:feedURL
                       delegate:self
              didFinishSelector:@selector(worksheetsTicket:finishedWithFeed:error:)];

    }
  }
}


// fetch worksheet feed callback
- (void)worksheetsTicket:(GDataServiceTicket *)ticket
        finishedWithFeed:(GDataFeedWorksheet *)feed
                   error:(NSError *)error {

  [self setWorksheetFeed:feed]; // set the ivar mWorksheetFeed
  [self setWorksheetFetchError:error];

  mIsWorksheetFetchPending = NO;
    
/*    
    NSArray *worksheets = [mWorksheetFeed entries];
    GDataEntryWorksheet *sheet;
    
    for (sheet in worksheets) {
        NSLog(@"Worksheets: %@", [[sheet title] stringValue]);
    }
*/

    [self fetchCellsForWorksheet:1]; // This parameter selects either list(1) or cells(0)
    //[self putCellsForWorksheet:1];
    

}

#pragma mark Fetch or set a worksheet's entries

// for the worksheet selected, fetch either a cell feed or a list feed
// of its contents, depending on the segmented control's setting

- (void)fetchCellsForWorksheet:(NSUInteger)cellListSelector {
  
    // Use 0 for cell and 1 for list
    
    
    // Here were always getting the first worksheet
    GDataEntryWorksheet *worksheet = [[mWorksheetFeed entries] objectAtIndex:0];
    
  if (worksheet) {
    
    // the segmented control lets the user retrieve cell entries (position 0)
    // or list entries (position 1)

    NSURL *feedURL;

    if (cellListSelector == 0) {
      feedURL = [[worksheet cellsLink] URL];
    } else {
      feedURL = [worksheet listFeedURL];
    }

    if (feedURL) {

      [self setEntryFeed:nil];
      [self setEntryFetchError:nil];

      mIsEntryFetchPending = YES;

      GDataServiceGoogleSpreadsheet *service = [self spreadsheetService];
      [service fetchFeedWithURL:feedURL
                       delegate:self
              didFinishSelector:@selector(entriesTicket:finishedWithFeed:error:)];

    }
  }
}

- (void)putCellsForWorksheet:(NSUInteger)cellListSelector {
    
    // Use 0 for cell and 1 for list
    
    
    // Here were always getting the first worksheet
    GDataEntryWorksheet *selectedWorksheet = [[mWorksheetFeed entries] objectAtIndex:0];
    
    NSString *worksheetName = [[selectedWorksheet title] stringValue];
    
    //NSURL *postURL = [[selectedWorksheet postLink] URL];
    
    if (worksheetName != nil) {
        
        // add a 2-column, 3-row table to the selected worksheet
        GDataEntrySpreadsheetTable *newEntry;
        newEntry = [GDataEntrySpreadsheetTable tableEntry];
        
        NSString *title = [NSString stringWithFormat:@"Table Created %@",
                           [NSDate date]];
        [newEntry setTitleWithString:title];
        [newEntry setWorksheetNameWithString:worksheetName];
        [newEntry setSpreadsheetHeaderWithRow:3];
        
        GDataSpreadsheetData *spData;
        spData = [GDataSpreadsheetData spreadsheetDataWithStartIndex:4
                                                        numberOfRows:3
                                                       insertionMode:kGDataSpreadsheetModeInsert];
        [spData addColumn:[GDataSpreadsheetColumn columnWithIndexString:@"A"
                                                                   name:@"Column Alpha"]];
        [spData addColumn:[GDataSpreadsheetColumn columnWithIndexString:@"B"
                                                                   name:@"Column Beta"]];
        [newEntry setSpreadsheetData:spData];
        
        /*
        GDataServiceGoogleSpreadsheet *service = [self spreadsheetService];
        GDataServiceTicket *ticket;
        ticket = [service fetchEntryByInsertingEntry:newEntry
                                          forFeedURL:postURL
                                            delegate:self
                                   didFinishSelector:@selector(addTableTicket:finishedWithEntry:error:)];
         */
    }

}

- (void)addTableTicket:(GDataServiceTicket *)ticket
     finishedWithEntry:(GDataEntrySpreadsheetTable *)entry
                 error:(NSError *)error {
    if (error == nil) {

    } else {

    }
}



// fetch entries callback
- (void)entriesTicket:(GDataServiceTicket *)ticket
     finishedWithFeed:(GDataFeedBase *)feed
                error:(NSError *)error {

  [self setEntryFeed:feed]; // set iVar mEntryFeed
  [self setEntryFetchError:error];

  mIsEntryFetchPending = NO;
    

    [self printWorksheetEntries];

}

#pragma mark TableView delegate methods
//
// table view delegate methods
//


- (void)printWorksheetEntries {
    
    NSMutableArray *array = [NSMutableArray array];
    GDataEntryBase *entry;
    
    for (entry  in [mEntryFeed entries]) {
        GDataEntrySpreadsheetList *listEntry = (GDataEntrySpreadsheetList *)entry;
        NSDictionary *customElements = [listEntry customElementDictionary];
        [array addObject:customElements];
    }
    
    if ([delegate respondsToSelector:@selector(spreadsheetController:didFetchSpreadSheets:)]) {
        [delegate spreadsheetController:self didFetchSpreadSheets:[NSArray arrayWithArray:array]];
    }



    
    // format list entry data
    //
    // a list entry we will show as a sequence of (name,value) items from
    // the entry's custom elements
     
     // entry table; get a string for the cell or the list item
    entry = [[mEntryFeed entries] objectAtIndex:0];

    GDataEntrySpreadsheetList *listEntry = (GDataEntrySpreadsheetList *)entry;
    NSDictionary *customElements = [listEntry customElementDictionary];
    
    NSEnumerator *enumerator = [customElements objectEnumerator];
    GDataSpreadsheetCustomElement *element;
    
    while ((element = [enumerator nextObject]) != nil) {
        
        NSString *elemStr = [NSString stringWithFormat:@"(%@, %@)",
                             [element name], [element stringValue]];
        [array addObject:elemStr];
    }
    
    //NSLog(@"Row: %@", [array componentsJoinedByString:@", "] );

    

     
}


#pragma mark Setters and Getters


- (GDataFeedSpreadsheet *)spreadsheetFeed {
  return mSpreadsheetFeed; 
}

- (void)setSpreadsheetFeed:(GDataFeedSpreadsheet *)feed {
  [mSpreadsheetFeed autorelease];
  mSpreadsheetFeed = [feed retain];
}
 

- (NSError *)spreadsheetFetchError {
  return mSpreadsheetFetchError; 
}


- (void)setSpreadsheetFetchError:(NSError *)error {
  [mSpreadsheetFetchError release];
  mSpreadsheetFetchError = [error retain];
}


- (GDataFeedWorksheet *)worksheetFeed {
  return mWorksheetFeed; 
}

- (void)setWorksheetFeed:(GDataFeedWorksheet *)feed {
  [mWorksheetFeed autorelease];
  mWorksheetFeed = [feed retain];
}
 

- (NSError *)worksheetFetchError {
  return mWorksheetFetchError; 
}

- (void)setWorksheetFetchError:(NSError *)error {
  [mWorksheetFetchError release];
  mWorksheetFetchError = [error retain];
}

- (GDataFeedBase *)entryFeed {
  return mEntryFeed; 
}

- (void)setEntryFeed:(GDataFeedBase *)feed {
  [mEntryFeed autorelease];
  mEntryFeed = [feed retain];
}

- (NSError *)entryFetchError {
  return mEntryFetchError; 
}

- (void)setEntryFetchError:(NSError *)error {
  [mEntryFetchError release];
  mEntryFetchError = [error retain];
}
 


@end
