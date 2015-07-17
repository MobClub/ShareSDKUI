//
//  SSUIiPhoneEditorNavigationController.h
//  ShareSDKUI
//
//  Created by chenjd on 15/7/3.
//  Copyright (c) 2015年 mob. All rights reserved.
//

#import <UIKit/UIKit.h>
#import "SSUITypeDef.h"
@class SSUIiPhoneEditorViewController;

@interface SSUIiPhoneEditorNavigationController : UINavigationController
{
@private
    SSUIiPhoneEditorViewController *_iPhoneEditViewController;

}
@property (nonatomic, copy) SSUIShareContentEditorViewSubmitHandler submitHandler;
@property (nonatomic, copy) SSUIShareContentEditorViewCancelHandler cancelHandler;

- (id)initShareViewController;

- (void)updateWithContent:(NSString *)content
                    image:(SSDKImage *)image
            platformTypes:(NSArray *)platformTypes;


@end
