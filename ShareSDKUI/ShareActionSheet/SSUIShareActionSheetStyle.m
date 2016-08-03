//
//  SSUIShareActionSheetStyle.m
//  ShareSDKUI
//
//  Created by 刘 靖煌 on 15/7/15.
//  Copyright (c) 2015年 mob. All rights reserved.
//

#import "SSUIShareActionSheetStyle.h"
#import "SSUIShareActionSheetStyle_Private.h"

@implementation SSUIShareActionSheetStyle

+ (instancetype)sharedInstance
{
    static SSUIShareActionSheetStyle *style = nil;
    static dispatch_once_t once;
    dispatch_once(&once, ^{
        if (style == nil)
        {
            style = [[SSUIShareActionSheetStyle alloc] init];
        }
    });
    return style;
}

+ (void)setShareActionSheetStyle:(ShareActionSheetStyle)style
{
    [SSUIShareActionSheetStyle sharedInstance].style = style;
    
    //默认隐藏取消按钮
    if ([SSUIShareActionSheetStyle sharedInstance].style == ShareActionSheetStyleSimple)
    {
        [self isCancelButtomHidden:YES];
    }
    else
    {
        [self isCancelButtomHidden:NO];
    }
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

+ (void)isCancelButtomHidden:(BOOL)isCancelButtomHidden
{
    [SSUIShareActionSheetStyle sharedInstance].isCancelButtomHidden = isCancelButtomHidden;
}

@end
