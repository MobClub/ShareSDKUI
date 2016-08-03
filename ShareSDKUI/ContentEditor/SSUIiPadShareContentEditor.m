//
//  SSUIiPadShareContentEditor.m
//  ShareSDKUI
//
//  Created by fenghj on 15/6/18.
//  Copyright (c) 2015年 mob. All rights reserved.
//

#import "SSUIiPadShareContentEditor.h"
#import "SSUIBaseShareContentEditor_Private.h"
#import "SSUIiPadEditorWindow.h"

@interface SSUIiPadShareContentEditor ()

@property (nonatomic, strong) SSUIiPadShareContentEditor* selRef;
@property (nonatomic, strong) SSUIiPadEditorWindow* shareContentWindow;

@end

@implementation SSUIiPadShareContentEditor

- (void)show
{
    self.selRef = self;
    __weak SSUIiPadShareContentEditor *theEditor = self;
    self.shareContentWindow = [[SSUIiPadEditorWindow alloc]init];
    
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
    self.selRef = nil;
    [self.shareContentWindow dismiss];
    self.shareContentWindow = nil;
}

- (void)dealloc
{
    
}


@end
