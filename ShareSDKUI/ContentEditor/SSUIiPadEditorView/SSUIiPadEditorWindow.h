//
//  SSUIiPadEditorWindow.h
//  ShareSDKUI
//
//  Created by chenjd on 15/7/6.
//  Copyright (c) 2015年 mob. All rights reserved.
//

#import <UIKit/UIKit.h>
#import <ShareSDK/SSDKImage.h>
#import "SSUITypeDef.h"
@interface SSUIiPadEditorWindow : UIWindow

@property (nonatomic, copy) SSUIShareContentEditorViewSubmitHandler submitHandler;
@property (nonatomic, copy) SSUIShareContentEditorViewCancelHandler cancelHandler;

- (void)showWithContent:(NSString *)content
                  image:(SSDKImage *)image
          platformTypes:(NSArray *)platformTypes;

- (void)dismiss;


@end
