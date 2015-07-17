//
//  SSUIiPadEditorView.h
//  ShareSDKUI
//
//  Created by chenjd on 15/7/6.
//  Copyright (c) 2015年 mob. All rights reserved.
//

#import <UIKit/UIKit.h>
#import <ShareSDK/SSDKTypeDefine.h>
#import <ShareSDK/SSDKImage.h>
#import "SSUIiPadEditorView.h"
#import <MOBFoundation/MOBFColor.h>
#import <MOBFoundation/MOBFImage.h>
#import "SSUIiPhoneEditorView.h"
#import "SSUITypeDef.h"
@interface SSUIiPadEditorView : UIView

@property (nonatomic, copy) SSUIShareContentEditorViewSubmitHandler submitHandler;
@property (nonatomic, copy) SSUIShareContentEditorViewCancelHandler cancelHandler;

- (void)updateWithType:(NSArray*)platType
               content:(NSString*)content
                 image:(SSDKImage*)image
  interfaceOrientation:(UIInterfaceOrientation)interfaceOrientation
        viewController:(UIViewController *)viewController;
             
@end
