//
//  SSUIShareActionSheetStyle.m
//  ShareSDKUI
//
//  Created by 刘 靖煌 on 15/7/15.
//  Copyright (c) 2015年 mob. All rights reserved.
//

#import "SSUIShareActionSheetStyle.h"
#import "SSUIShareSheetConfiguration.h"

@implementation SSUIShareActionSheetStyle

+ (SSUIShareSheetConfiguration *)defaultSheetStyle
{
    static SSUIShareSheetConfiguration *style = nil;
    static dispatch_once_t once;
    dispatch_once(&once, ^{
        if (style == nil)
        {
            style = [[SSUIShareSheetConfiguration alloc] init];
        }
    });
    return style;
}

+ (void)setShareActionSheetStyle:(ShareActionSheetStyle)style
{
    [SSUIShareActionSheetStyle defaultSheetStyle].style = (SSUIActionSheetStyle)style;
}

+ (void)setActionSheetColor:(UIColor *)color
{
    [SSUIShareActionSheetStyle defaultSheetStyle].shadeColor = color;
}

+ (void)setActionSheetBackgroundColor:(UIColor *)color
{
    [SSUIShareActionSheetStyle defaultSheetStyle].menuBackgroundColor = color;
}

+ (void)setItemNameColor:(UIColor *)color
{
    [SSUIShareActionSheetStyle defaultSheetStyle].itemTitleColor = color;
}

+ (void)setItemNameFont:(UIFont *)font
{
    [SSUIShareActionSheetStyle defaultSheetStyle].itemTitleFont = font;
}

+ (void)setCancelButtonLabelColor:(UIColor *)color
{
    [SSUIShareActionSheetStyle defaultSheetStyle].cancelButtonTitleColor = color;
}

+ (void)setCancelButtonBackgroundColor:(UIColor *)color
{
    [SSUIShareActionSheetStyle defaultSheetStyle].cancelButtonBackgroundColor = color;
}

+(void)setPageIndicatorTintColor:(UIColor *)color
{
    [SSUIShareActionSheetStyle defaultSheetStyle].pageIndicatorTintColor = color;
}

+(void)setCurrentPageIndicatorTintColor:(UIColor *)color
{
    [SSUIShareActionSheetStyle defaultSheetStyle].currentPageIndicatorTintColor = color;
}

+(void)setSupportedInterfaceOrientation:(UIInterfaceOrientationMask)toInterfaceOrientation
{
    [SSUIShareActionSheetStyle defaultSheetStyle].interfaceOrientationMask = toInterfaceOrientation;
}

+ (void)setStatusBarStyle:(UIStatusBarStyle)statusBarStyle
{
    [SSUIShareActionSheetStyle defaultSheetStyle].statusBarStyle = statusBarStyle;
}

+ (void)isCancelButtomHidden:(BOOL)isCancelButtomHidden
{
    [SSUIShareActionSheetStyle defaultSheetStyle].cancelButtonHidden = isCancelButtomHidden;
}

@end
