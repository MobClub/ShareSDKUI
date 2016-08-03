//
//  SSUIiPhoneEditorWindow.m
//  ShareSDKUI
//
//  Created by chenjd on 15/7/3.
//  Copyright (c) 2015年 mob. All rights reserved.
//

#import "SSUIiPhoneEditorWindow.h"
#import "SSUIBaseShareContentEditor_Private.h"
#import <MOBFoundation/MOBFColor.h>

@interface SSUIiPhoneEditorWindow ()
{
    UIWindow * _lastUserWindow;
}
@end

@implementation SSUIiPhoneEditorWindow

- (id)initWithFrame:(CGRect)frame
{
    self = [super initWithFrame:[UIScreen mainScreen].bounds];
    if (self)
    {
        self.backgroundColor = [MOBFColor colorWithARGB:0x4c000000];
        self.windowLevel = [UIApplication sharedApplication].keyWindow.windowLevel + 1;
        SSUIiPhoneEditorNavigationController* naviVc = [[SSUIiPhoneEditorNavigationController alloc] initShareViewController];
        self.rootViewController  = naviVc ;
    }
    return self;
}

- (void)setSubmitHandler:(SSUIShareContentEditorViewSubmitHandler)submitHandler
{
    ((SSUIiPhoneEditorNavigationController *)self.rootViewController).submitHandler = submitHandler;
}

- (SSUIShareContentEditorViewSubmitHandler)submitHandler
{
    return ((SSUIiPhoneEditorNavigationController *)self.rootViewController).submitHandler;
}

- (void)setCancelHandler:(SSUIShareContentEditorViewCancelHandler)cancelHandler
{
    
    ((SSUIiPhoneEditorNavigationController *)self.rootViewController).cancelHandler = cancelHandler;
    
}

- (SSUIShareContentEditorViewCancelHandler)cancelHandler
{
    return ((SSUIiPhoneEditorNavigationController *)self.rootViewController).cancelHandler;
}

- (void)showWithContent:(NSString *)content
                  image:(SSDKImage *)image
          platformTypes:(NSArray *)platformTypes
{
    
    [self makeKeyAndVisible];
    [self becomeKeyWindow];
   
    [(SSUIiPhoneEditorNavigationController*)self.rootViewController updateWithContent:content
                                                                                image:image
                                                                        platformTypes:platformTypes];
        
}

- (void)dismiss
{
    [self resignKeyWindow];
    self.hidden = YES;
    UIWindow *userWindow = [[UIApplication sharedApplication] keyWindow] ;
    if (userWindow != _lastUserWindow)
    {
        [_lastUserWindow makeKeyAndVisible];
    }
}

@end
