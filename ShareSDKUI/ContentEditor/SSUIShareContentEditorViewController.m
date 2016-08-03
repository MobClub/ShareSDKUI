//
//  SSUIShareContentEditorView.m
//  ShareSDKUI
//
//  Created by fenghj on 15/6/18.
//  Copyright (c) 2015年 mob. All rights reserved.
//

#import "SSUIShareContentEditorViewController.h"
#import "SSUIBaseShareContentEditor.h"
#import "SSUIiPadShareContentEditor.h"
#import "SSUIiPhoneShareContentEditor.h"
#import <MOBFoundation/MOBFoundation.h>

@interface SSUIShareContentEditorViewController ()

/**
 *  分享内容编辑器
 */
@property (nonatomic, strong) SSUIBaseShareContentEditor *shareContentEditor;

@end

@implementation SSUIShareContentEditorViewController

- (instancetype)initWithContent:(NSString *)content
                          image:(SSDKImage *)image
                  platformTypes:(NSArray *)platformTypes
{
    if (self = [super init])
    {
        if ([MOBFDevice isPad])
        {
            self.shareContentEditor = [[SSUIiPadShareContentEditor alloc] initWithContent:content
                                                                                    image:image
                                                                            platformTypes:platformTypes];
        }
        else
        {
            self.shareContentEditor = [[SSUIiPhoneShareContentEditor alloc] initWithContent:content
                                                                                      image:image
                                                                              platformTypes:platformTypes];
        }
    }
    
    return self;
}

- (void)show
{
    [self.shareContentEditor show];
}

- (void)dismiss
{
    [self.shareContentEditor dismiss];
}

- (void)dealloc
{
    
}

- (void)onSubmit:(SSUIShareContentEditorViewSubmitHandler)submitHandler
{
    [self.shareContentEditor onSubmit:submitHandler];
}

- (void)onCancel:(SSUIShareContentEditorViewCancelHandler)cancelHandler
{
    [self.shareContentEditor onCancel:cancelHandler];
}

@end
