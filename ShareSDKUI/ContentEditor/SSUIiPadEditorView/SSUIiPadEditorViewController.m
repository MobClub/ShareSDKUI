//
//  SSUIiPadEditorViewController.m
//  ShareSDKUI
//
//  Created by chenjd on 15/7/6.
//  Copyright (c) 2015年 mob. All rights reserved.
//

#import "SSUIiPadEditorViewController.h"
#import "SSUIShareContentEditorDef.h"
#import "SSUIEditorViewStyle_Private.h"
#import <MOBFoundation/MOBFDevice.h>
#import "SSUIEditorViewStyle.h"

#define CONTENT_VIEW_WIDTH 480
#define CONTENT_VIEW_HEIGHT 300
#define PADDING_TOP 60.0

@implementation SSUIiPadEditorViewController

- (void)viewDidLoad
{
    [super viewDidLoad];
    
    self.view.backgroundColor = [MOBFColor colorWithARGB:0xcc64666c];
    
    _contentView = [[SSUIiPadEditorView alloc] initWithFrame:CGRectMake((SSUI_WIDTH(self.view) - CONTENT_VIEW_WIDTH) / 2,
                                                                            PADDING_TOP,
                                                                            CONTENT_VIEW_WIDTH,
                                                                            CONTENT_VIEW_HEIGHT)];
    
    if ([MOBFDevice versionCompare:@"9.0"] < 0)
    {
        _contentView.autoresizingMask = UIViewAutoresizingFlexibleLeftMargin | UIViewAutoresizingFlexibleRightMargin | UIViewAutoresizingFlexibleBottomMargin;
    }
    [self.view addSubview:_contentView];

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

//iOS9分屏委托
- (void)viewWillTransitionToSize:(CGSize)size withTransitionCoordinator:(id <UIViewControllerTransitionCoordinator>)coordinator 
{
    if ([MOBFDevice versionCompare:@"9.0"] >= 0)
    {
        [super viewWillTransitionToSize:size withTransitionCoordinator:coordinator];
        [_contentView updateLayoutWithSplitViewSize:size];
    }
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

-(void)updateWithContent:(NSString *)content
                   image:(SSDKImage *)image
           platformTypes:(NSArray *)platformTypes
{
    
    _platformTypes = platformTypes;
    
    [_contentView updateWithType:_platformTypes
                         content:content
                           image:image
            interfaceOrientation:self.interfaceOrientation
                  viewController:self];
    
    _contentView.submitHandler = self.submitHandler;
    _contentView.cancelHandler = self.cancelHandler;
    
}

@end
