//
//  SSUIiPhoneEditorNavigationController.m
//  ShareSDKUI
//
//  Created by chenjd on 15/7/3.
//  Copyright (c) 2015年 mob. All rights reserved.
//

#import "SSUIiPhoneEditorNavigationController.h"
#import "SSUIiPhoneEditorViewController.h"
#import "SSUIEditorViewStyle_Private.h"

@implementation SSUIiPhoneEditorNavigationController

-(id)initShareViewController
{
    SSUIiPhoneEditorViewController *iPhoneEditViewController = [[SSUIiPhoneEditorViewController alloc]init];
    self = [self initWithRootViewController:iPhoneEditViewController];
    if (self)
    {
        _iPhoneEditViewController = iPhoneEditViewController;
    }
    return  self;
}

- (void)viewDidLoad
{
    [super viewDidLoad];
    self.view.backgroundColor = [UIColor clearColor];
}

- (BOOL)shouldAutorotateToInterfaceOrientation:(UIInterfaceOrientation)toInterfaceOrientation
{
    if ([SSUIEditorViewStyle sharedInstance].supportedInterfaceOrientation)
    {
        
        switch ([SSUIEditorViewStyle sharedInstance].supportedInterfaceOrientation)
        {
            case UIInterfaceOrientationMaskPortrait:
                return toInterfaceOrientation == UIInterfaceOrientationPortrait;
            case UIInterfaceOrientationMaskLandscapeLeft:
                return toInterfaceOrientation == UIInterfaceOrientationLandscapeLeft;
            case UIInterfaceOrientationMaskLandscapeRight:
                return toInterfaceOrientation == UIInterfaceOrientationLandscapeRight;
            case UIInterfaceOrientationMaskPortraitUpsideDown:
                return toInterfaceOrientation == UIDeviceOrientationPortraitUpsideDown;
            case UIInterfaceOrientationMaskLandscape:
                return (toInterfaceOrientation == UIInterfaceOrientationLandscapeLeft ||
                        toInterfaceOrientation == UIInterfaceOrientationLandscapeRight);
            case UIInterfaceOrientationMaskAll:
                return YES;
            case UIInterfaceOrientationMaskAllButUpsideDown:
                return (toInterfaceOrientation != UIDeviceOrientationPortraitUpsideDown);
            default:
                break;
        }
    }
    
    return [super shouldAutorotateToInterfaceOrientation:toInterfaceOrientation];
}

//iOS 6
- (BOOL)shouldAutorotate
{
    return YES;
}

- (UIInterfaceOrientationMask)supportedInterfaceOrientations
{
    if ([SSUIEditorViewStyle sharedInstance].supportedInterfaceOrientation)
    {
        return [SSUIEditorViewStyle sharedInstance].supportedInterfaceOrientation;
    }
    
    return UIInterfaceOrientationMaskAll;
}

- (UIStatusBarStyle)preferredStatusBarStyle
{
    if ([SSUIEditorViewStyle sharedInstance].statusBarStyle)
    {
        return [SSUIEditorViewStyle sharedInstance].statusBarStyle;
    }
    return UIStatusBarStyleDefault;
}


- (void)updateWithContent:(NSString *)content
                    image:(SSDKImage *)image
            platformTypes:(NSArray *)platformTypes
{
    
    [_iPhoneEditViewController updateWithContent:content
                                           image:image
                                   platformTypes:platformTypes];
    _iPhoneEditViewController.submitHandler = self.submitHandler;
    _iPhoneEditViewController.cancelHandler = self.cancelHandler;
    
}

@end
