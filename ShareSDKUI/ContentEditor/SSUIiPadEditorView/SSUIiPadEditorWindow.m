//
//  SSUIiPadEditorWindow.m
//  ShareSDKUI
//
//  Created by chenjd on 15/7/6.
//  Copyright (c) 2015年 mob. All rights reserved.
//

#import "SSUIiPadEditorWindow.h"
#import <MOBFoundation/MOBFColor.h>
#import <ShareSDK/SSDKImage.h>
#import "SSUIiPadEditorViewController.h"

@interface SSUIiPadEditorWindow()
{
    UIWindow * _lastUserWindow;
}

@end

@implementation SSUIiPadEditorWindow

- (id)init
{
    self = [super initWithFrame:[UIScreen mainScreen].bounds];
    if (self)
    {
        self.backgroundColor = [MOBFColor colorWithARGB:0x4c000000];
        self.windowLevel = [UIApplication sharedApplication].keyWindow.windowLevel + 1;
        SSUIiPadEditorViewController *vc = [[SSUIiPadEditorViewController alloc] init];
        self.rootViewController = vc;
   
    }
    return self;
}

- (void)setSubmitHandler:(SSUIShareContentEditorViewSubmitHandler)submitHandler
{
    ((SSUIiPadEditorViewController *)self.rootViewController).submitHandler = submitHandler;
}

- (SSUIShareContentEditorViewSubmitHandler)submitHandler
{
    return ((SSUIiPadEditorViewController *)self.rootViewController).submitHandler;
}

- (void)setCancelHandler:(SSUIShareContentEditorViewCancelHandler)cancelHandler
{
    
    ((SSUIiPadEditorViewController *)self.rootViewController).cancelHandler = cancelHandler;
    
}

- (SSUIShareContentEditorViewCancelHandler)cancelHandler
{
    return ((SSUIiPadEditorViewController *)self.rootViewController).cancelHandler;
}


- (void)showWithContent:(NSString *)content
                  image:(SSDKImage *)image
          platformTypes:(NSArray *)platformTypes
{
    [self makeKeyAndVisible];
    [self becomeKeyWindow];
    
    [(SSUIiPadEditorViewController*)self.rootViewController updateWithContent:content
                                                                        image:image
                                                                platformTypes:platformTypes];
}

- (void)dismiss
{
    [self resignKeyWindow];
    self.hidden = YES;
}

@end
