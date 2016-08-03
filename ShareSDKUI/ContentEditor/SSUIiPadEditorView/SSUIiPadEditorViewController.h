//
//  SSUIiPadEditorViewController.h
//  ShareSDKUI
//
//  Created by chenjd on 15/7/6.
//  Copyright (c) 2015年 mob. All rights reserved.
//

#import <UIKit/UIKit.h>
#import <ShareSDK/SSDKImage.h>
#import <ShareSDK/SSDKTypeDefine.h>
#import <MOBFoundation/MOBFColor.h>
#import "SSUIiPadEditorView.h"
#import "SSUITypeDef.h"


@interface SSUIiPadEditorViewController : UIViewController
{
@private
    SSUIiPadEditorView *_contentView;
    NSArray *_platformTypes;
  
}

@property (nonatomic, copy) SSUIShareContentEditorViewSubmitHandler submitHandler;
@property (nonatomic, copy) SSUIShareContentEditorViewCancelHandler cancelHandler;


- (void)updateWithContent:(NSString *)content
                    image:(SSDKImage *)image
            platformTypes:(NSArray *)platformTypes;

@end
