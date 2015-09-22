//
//  SSUIShareActionSheetStyle.m
//  ShareSDKUI
//
//  Created by 刘 靖煌 on 15/7/15.
//  Copyright (c) 2015年 mob. All rights reserved.
//

#import "SSUIShareActionSheetStyle.h"
#import "SSUIShareActionSheetStyle_Private.h"

static SSUIShareActionSheetStyle *style = nil;
@implementation SSUIShareActionSheetStyle

+ (instancetype)sharedInstance
{
    static dispatch_once_t once;
    dispatch_once(&once, ^{
        if (style == nil)
        {
            style = [[SSUIShareActionSheetStyle alloc] init];
        }
    });
    return style;
}

+ (void)setActionSheetColor:(UIColor *)color
{
    [SSUIShareActionSheetStyle sharedInstance].actionSheetColor = color;
}

+ (void)setActionSheetBackgroundColor:(UIColor *)color
{
    [SSUIShareActionSheetStyle sharedInstance].actionSheetBackgroundColor = color;
}

+ (void)setItemNameColor:(UIColor *)color
{
    [SSUIShareActionSheetStyle sharedInstance].itemNameColor = color;
}

+ (void)setItemNameFont:(UIFont *)font
{
    [SSUIShareActionSheetStyle sharedInstance].itemNameFont = font;
}

+ (void)setCancelButtonLabelColor:(UIColor *)color
{
    [SSUIShareActionSheetStyle sharedInstance].cancelButtonLabelColor = color;
}

+ (void)setCancelButtonBackgroundColor:(UIColor *)color
{
    [SSUIShareActionSheetStyle sharedInstance].cancelButtonBackgroundColor = color;
}

+(void)setPageIndicatorTintColor:(UIColor *)color
{
    [SSUIShareActionSheetStyle sharedInstance].pageIndicatorTintColor = color;
}

+(void)setCurrentPageIndicatorTintColor:(UIColor *)color
{
    [SSUIShareActionSheetStyle sharedInstance].currentPageIndicatorTintColor = color;
}

+(void)setSupportedInterfaceOrientation:(UIInterfaceOrientationMask)toInterfaceOrientation
{
    [SSUIShareActionSheetStyle sharedInstance].supportedInterfaceOrientation = toInterfaceOrientation;
}

+ (void)setStatusBarStyle:(UIStatusBarStyle)statusBarStyle
{
    [SSUIShareActionSheetStyle sharedInstance].statusBarStyle = statusBarStyle;
}


@end
