//
//  SSUIiPhoneShareContentEditor.m
//  ShareSDKUI
//
//  Created by fenghj on 15/6/18.
//  Copyright (c) 2015年 mob. All rights reserved.
//

#import "SSUIiPhoneShareContentEditor.h"
#import "SSUIBaseShareContentEditor_Private.h"
#import "SSUIiPhoneEditorWindow.h"

@interface SSUIiPhoneShareContentEditor ()

@property (nonatomic, strong) SSUIiPhoneShareContentEditor *selfRef;
@property (nonatomic, strong) SSUIiPhoneEditorWindow *shareContentWindow;

@end

@implementation SSUIiPhoneShareContentEditor

- (void)show
{
    self.selfRef = self;
    __weak SSUIiPhoneShareContentEditor *theEditor = self;
    self.shareContentWindow = [[SSUIiPhoneEditorWindow alloc]initWithFrame:CGRectZero];
    [self.shareContentWindow setSubmitHandler:^(NSArray *platforms, NSString *content, SSDKImage *image){
        
        if (theEditor.submitHandler)
        {
            theEditor.submitHandler (platforms, content, image);
            [theEditor dismiss];
        }
    }];
    
    [self.shareContentWindow setCancelHandler:^{
        
        if (theEditor.cancelHandler)
        {
            theEditor.cancelHandler();
            [theEditor dismiss];
        }
    }];
    
    [self.shareContentWindow showWithContent:self.content
                                       image:self.image
                               platformTypes:self.platformTypes];

}

- (void)dismiss
{
    self.selfRef = nil;
    [self.shareContentWindow dismiss];
    self.shareContentWindow = nil;
}

//-(void)dealloc
//{
//    NSLog(@"%@被销毁了", self);
//}

@end
