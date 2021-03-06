
/*
     File: Module.m
 Abstract: A simple model class to represent a play with a name and a collection of quotations.
 
  Version: 2.0
  
 Copyright (C) 2011 Apple Inc. All Rights Reserved.
 
 */

#import "Module.h"


@implementation Module

@synthesize name, lessons, moduleNumber, index;

- (NSString *)description {
    
    return [NSString stringWithFormat:@"name: %@\n lessons:%@ \n moduleNumber:%@ \n", name, lessons, moduleNumber];
}

@end
