//
//  SSUIBaseShareContentEditor.m
//  ShareSDKUI
//
//  Created by fenghj on 15/6/18.
//  Copyright (c) 2015年 mob. All rights reserved.
//

#import "SSUIBaseShareContentEditor.h"
#import "SSUIBaseShareContentEditor_Private.h"

@implementation SSUIBaseShareContentEditor

- (instancetype)initWithContent:(NSString *)content
                          image:(SSDKImage *)image
                  platformTypes:(NSArray *)platformTypes
{
    if (self = [super init])
    {
        self.content = content;
        self.image = image;
        self.platformTypes = platformTypes;
        
    }
    return self;
}

- (void)show
{
    //子类重写
}

- (void)dismiss
{
    //子类重写
}

- (void)onSubmit:(SSUIShareContentEditorViewSubmitHandler)submitHandler
{
    
    self.submitHandler = submitHandler;
}

- (void)onCancel:(SSUIShareContentEditorViewCancelHandler)cancelHandler
{
    self.cancelHandler = cancelHandler;
}

@end
