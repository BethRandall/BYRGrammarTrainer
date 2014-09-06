//
//  ViewController.h
//  GrammerTrainer
//
//  Created by Eric Kille on 12/27/11.
//  Copyright (c) 2011 __MyCompanyName__. All rights reserved.
//

#import <UIKit/UIKit.h>
#import "SBJSON.h"
#import "SectionHeaderView.h"
#import <Slt/Slt.h>
#import <OpenEars/FliteController.h>

@class QuoteCell, Lesson; // SpreadsheetController;

@interface ViewController : UIViewController <UIWebViewDelegate, UITableViewDataSource, UITableViewDelegate, SectionHeaderViewDelegate, UITextViewDelegate, UIAlertViewDelegate> {
    
    SBJSON *json;
    BOOL menuVisible;
    BOOL iconsVisible;
    BOOL pendingDataModelLoad;
    FliteController *fliteController;
    Slt *slt;
    
}

@property (strong, nonatomic) NSArray *levels;

@property (nonatomic, assign) IBOutlet QuoteCell *quoteCell;


@property (strong, nonatomic) IBOutlet UIWebView *theWebView;
@property (strong, nonatomic) IBOutlet UITableView *theTableView;
@property (strong, nonatomic) IBOutlet UIView *rightOverlayView;

@property (strong, nonatomic) IBOutlet UIView *leftOverlayView;

@property (strong, nonatomic) NSString *userName;

@property (strong, nonatomic) FliteController *fliteController; @property (strong, nonatomic) Slt *slt;




@end
