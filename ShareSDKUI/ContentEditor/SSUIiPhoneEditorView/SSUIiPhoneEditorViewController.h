//
//  SSUIiPhoneEditorViewController.h
//  ShareSDKUI
//
//  Created by chenjd on 15/7/3.
//  Copyright (c) 2015年 mob. All rights reserved.
//

#import <UIKit/UIKit.h>
#import "SSUIiPhoneEditorView.h"
#import "SSUIiPhoneEditorWindow.h"
#import <ShareSDK/SSDKImage.h>
#import <ShareSDK/ShareSDK.h>
#import <MOBFoundation/MOBFDevice.h>
#import <MOBFoundation/MOBFColor.h>


@interface SSUIiPhoneEditorViewController : UIViewController

@property (nonatomic, copy) SSUIShareContentEditorViewSubmitHandler submitHandler;
@property (nonatomic, copy) SSUIShareContentEditorViewCancelHandler cancelHandler;

- (void)updateWithContent:(NSString *)content
                    image:(SSDKImage *)image
            platformTypes:(NSArray *)platformTypes;

@end
