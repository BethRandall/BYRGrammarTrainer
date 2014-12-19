
/*
     File: Lesson.m
 Abstract: A simple model class to represent a quotation with information about the character, and the act and scene in which the quotation was made.
 
  Version: 2.0
  
 Copyright (C) 2011 Apple Inc. All Rights Reserved.
 
 */

#import "Lesson.h"


@implementation Lesson

@synthesize lessonName, topic, loadFile, lessonNumber, showMultipleChoice, index, resultsDictionary;

- (NSString *)description {
    
    //NSLog([NSString stringWithFormat:@"lessonName: %@\n topic:%@\n loadFile: %@\n lessonNumber: %@\n", lessonName, topic, loadFile, lessonNumber]);
    return [NSString stringWithFormat:@"lessonName: %@\n topic:%@\n loadFile: %@\n lessonNumber: %@\n", lessonName, topic, loadFile, lessonNumber];
}

@end
