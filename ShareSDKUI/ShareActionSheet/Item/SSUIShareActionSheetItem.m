//
//  SSUIShareActionSheetItem.m
//  ShareSDKUI
//
//  Created by fenghj on 15/6/18.
//  Copyright (c) 2015年 mob. All rights reserved.
//

#import "SSUIShareActionSheetItem.h"
#import "SSUIShareActionSheetPlatformItem.h"
#import "SSUIShareActionSheetCustomItem.h"

@implementation SSUIShareActionSheetItem

+ (instancetype)itemWithPlatformType:(SSDKPlatformType)platformType
{
    return [[SSUIShareActionSheetPlatformItem alloc] initWithPlatformType:platformType];
}

+ (instancetype)itemWithIcon:(UIImage *)icon label:(NSString *)label onClick:(void(^)())clickHandler
{
    return [[SSUIShareActionSheetCustomItem alloc] initWithIcon:icon label:label clickHandler:clickHandler];
}

@end
