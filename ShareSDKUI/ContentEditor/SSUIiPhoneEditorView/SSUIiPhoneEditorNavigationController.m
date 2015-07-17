//
//  SSUIiPhoneEditorNavigationController.m
//  ShareSDKUI
//
//  Created by chenjd on 15/7/3.
//  Copyright (c) 2015年 mob. All rights reserved.
//

#import "SSUIiPhoneEditorNavigationController.h"
#import "SSUIiPhoneEditorViewController.h"

@implementation SSUIiPhoneEditorNavigationController

-(id)initShareViewController{
    SSUIiPhoneEditorViewController* iPhoneEditViewController = [[SSUIiPhoneEditorViewController alloc]init];
    self = [self initWithRootViewController:iPhoneEditViewController];
    if (self) {
        _iPhoneEditViewController = iPhoneEditViewController;

    }
    return  self;
}

- (void)viewDidLoad
{
    [super viewDidLoad];
    self.view.backgroundColor = [UIColor clearColor];

  
}

-(void)updateWithContent:(NSString *)content image:(SSDKImage *)image platformTypes:(NSArray *)platformTypes{
    
    [_iPhoneEditViewController updateWithContent:content image:image platformTypes:platformTypes];
    _iPhoneEditViewController.submitHandler = self.submitHandler;
    _iPhoneEditViewController.cancelHandler = self.cancelHandler;
    
}

@end
