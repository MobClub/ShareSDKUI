//
//  SSUIEditorViewStyle.m
//  ShareSDKUI
//
//  Created by chenjd on 15/7/15.
//  Copyright (c) 2015年 mob. All rights reserved.
//

#import "SSUIEditorViewStyle.h"
#import "SSUIEditorConfiguration.h"

@implementation SSUIEditorViewStyle

+ (SSUIEditorConfiguration *)defaultEditorStyle
{
    static SSUIEditorConfiguration *style = nil;
    static dispatch_once_t sharedInstancePredicate;
    dispatch_once(&sharedInstancePredicate, ^{
        if (style == nil)
        {
            style = [[SSUIEditorConfiguration alloc] init];
        }
    });
    return style;
}

+ (void)setTitle:(NSString *)title
{
    [SSUIEditorViewStyle defaultEditorStyle].title = title;
}

+ (void)setTitleColor:(UIColor *)color
{
    [SSUIEditorViewStyle defaultEditorStyle].titleColor = color;
}

+ (void)setiPhoneNavigationBarBackgroundImage:(UIImage *)image
{
    [SSUIEditorViewStyle defaultEditorStyle].iPhoneNavigationBarBackgroundImage = image;
}

+ (void)setiPhoneNavigationBarBackgroundColor:(UIColor *)color
{
    [SSUIEditorViewStyle defaultEditorStyle].iPhoneNavigationBarBackgroundColor = color;
}

+ (void)setiPadNavigationBarBackgroundColor:(UIColor *)color
{
    [SSUIEditorViewStyle defaultEditorStyle].iPadNavigationBarBackgroundColor = color;
}

+ (void)setContentViewBackgroundColor:(UIColor *)color
{
    [SSUIEditorViewStyle defaultEditorStyle].textViewBackgroundColor = color;
}

+ (void)setCancelButtonLabel:(NSString *)label
{
    [SSUIEditorViewStyle defaultEditorStyle].cancelButtonTitle = label;
}

+ (void)setCancelButtonLabelColor:(UIColor *)color
{
    [SSUIEditorViewStyle defaultEditorStyle].cancelButtonTitleColor = color;
}

+ (void)setCancelButtonImage:(UIImage *)image
{
    [SSUIEditorViewStyle defaultEditorStyle].cancelButtonImage = image;
}

+ (void)setShareButtonLabel:(NSString *)label
{
    [SSUIEditorViewStyle defaultEditorStyle].shareButtonTitle = label;
}

+ (void)setShareButtonLabelColor:(UIColor *)color
{
    [SSUIEditorViewStyle defaultEditorStyle].shareButtonTitleColor = color;
}

+ (void)setShareButtonImage:(UIImage *)image
{
    [SSUIEditorViewStyle defaultEditorStyle].shareButtonImage = image;
}



+(void)setSupportedInterfaceOrientation:(UIInterfaceOrientationMask)toInterfaceOrientation
{
    [SSUIEditorViewStyle defaultEditorStyle].interfaceOrientationMask = toInterfaceOrientation;
}

+ (void)setStatusBarStyle:(UIStatusBarStyle)statusBarStyle
{
    [SSUIEditorViewStyle defaultEditorStyle].statusBarStyle = statusBarStyle;
}

@end
