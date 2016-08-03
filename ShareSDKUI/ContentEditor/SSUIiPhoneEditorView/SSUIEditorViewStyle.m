//
//  SSUIEditorViewStyle.m
//  ShareSDKUI
//
//  Created by chenjd on 15/7/15.
//  Copyright (c) 2015年 mob. All rights reserved.
//

#import "SSUIEditorViewStyle.h"
#import "SSUIEditorViewStyle_Private.h"
#import <MOBFoundation/MOBFColor.h>

static SSUIEditorViewStyle *style = nil;
@implementation SSUIEditorViewStyle

+ (void)setTitle:(NSString *)title
{
    [SSUIEditorViewStyle sharedInstance].title = title;
}

+ (void)setTitleColor:(UIColor *)color
{
    [SSUIEditorViewStyle sharedInstance].titleColor = color;
}

+ (void)setiPhoneNavigationBarBackgroundImage:(UIImage *)image
{
    [SSUIEditorViewStyle sharedInstance].iPhoneNavigationbarBackgroundImage = image;
}

+ (void)setiPhoneNavigationBarBackgroundColor:(UIColor *)color
{
    [SSUIEditorViewStyle sharedInstance].iPhoneNavigationbarBackgroundColor = color;
}

+ (void)setiPadNavigationBarBackgroundColor:(UIColor *)color
{
    [SSUIEditorViewStyle sharedInstance].iPadNavigationbarBackgroundColor = color;
}

+ (void)setContentViewBackgroundColor:(UIColor *)color
{
    [SSUIEditorViewStyle sharedInstance].contentViewBackgroundColor = color;
}

+ (void)setCancelButtonLabel:(NSString *)label
{
    [SSUIEditorViewStyle sharedInstance].cancelButtonLabel = label;
}

+ (void)setCancelButtonLabelColor:(UIColor *)color
{
    [SSUIEditorViewStyle sharedInstance].cancelButtonLabelColor = color;
}

+ (void)setCancelButtonImage:(UIImage *)image
{
    [SSUIEditorViewStyle sharedInstance].cancelButtonImage = image;
}

+ (void)setShareButtonLabel:(NSString *)label
{
    [SSUIEditorViewStyle sharedInstance].shareButtonLabel = label;
}

+ (void)setShareButtonLabelColor:(UIColor *)color
{
    [SSUIEditorViewStyle sharedInstance].shareButtonLabelColor = color;
}

+ (void)setShareButtonImage:(UIImage *)image
{
    [SSUIEditorViewStyle sharedInstance].shareButtonImage = image;
}

+ (instancetype)sharedInstance
{
    static dispatch_once_t sharedInstancePredicate;
    dispatch_once(&sharedInstancePredicate, ^{
        if (style == nil)
        {
            style = [[SSUIEditorViewStyle alloc] init];
            style.unNeedAuthPlatforms = [NSMutableArray array];
        }
    });
    return style;
}

+(void)setSupportedInterfaceOrientation:(UIInterfaceOrientationMask)toInterfaceOrientation
{
    [SSUIEditorViewStyle sharedInstance].supportedInterfaceOrientation = toInterfaceOrientation;
}

+ (void)setStatusBarStyle:(UIStatusBarStyle)statusBarStyle
{
    [SSUIEditorViewStyle sharedInstance].statusBarStyle = statusBarStyle;
}

@end
