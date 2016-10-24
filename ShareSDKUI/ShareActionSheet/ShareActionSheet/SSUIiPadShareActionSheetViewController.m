//
//  SSUIiPadShareActionSheetViewController.m
//  ShareSDKUI
//
//  Created by 刘 靖煌 on 15/7/15.
//  Copyright (c) 2015年 mob. All rights reserved.
//

#import "SSUIiPadShareActionSheetViewController.h"
#import "SSUIPageView.h"
#import "SSUIShareActionSheetStyle_Private.h"

const CGFloat SSUIPageViewW = 300;
const CGFloat SSUIPageViewH = 400;

@interface SSUIiPadShareActionSheetViewController ()

@property (nonatomic, strong) SSUIPageView *pageView;

@end

@implementation SSUIiPadShareActionSheetViewController

- (instancetype)initWithItems:(NSArray *)items
{
    if (self = [super init])
    {
        _pageView = [[SSUIPageView alloc] initWithItems:items];
        _itemsCount = [items count];
        [self.view addSubview:_pageView];
    }
    
    return self;
}

- (BOOL)shouldAutorotateToInterfaceOrientation:(UIInterfaceOrientation)toInterfaceOrientation
{
    if ([SSUIShareActionSheetStyle sharedInstance].supportedInterfaceOrientation)
    {
        switch ([SSUIShareActionSheetStyle sharedInstance].supportedInterfaceOrientation)
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

- (UIStatusBarStyle)preferredStatusBarStyle
{
    if ([SSUIShareActionSheetStyle sharedInstance].statusBarStyle)
    {
        return [SSUIShareActionSheetStyle sharedInstance].statusBarStyle;
    }
    return UIStatusBarStyleDefault;
}

- (UIInterfaceOrientationMask)supportedInterfaceOrientations
{
    if ([SSUIShareActionSheetStyle sharedInstance].supportedInterfaceOrientation)
    {
        return [SSUIShareActionSheetStyle sharedInstance].supportedInterfaceOrientation;
    }
    
    return UIInterfaceOrientationMaskAll;
}

-(void)viewDidLoad
{
    [super viewDidLoad];

    NSInteger row = ceil(_itemsCount * 1.0 /3.0);
    
    if (row >2)
    {
        _pageView.frame = CGRectMake(0, 0, SSUIPageViewW, SSUIPageViewH);
    }
    else
    {
        //根据行数调整高度
        _pageView.frame = CGRectMake(0, 0, SSUIPageViewW, 80*(row+1));
    }
}

- (void)showInView:(UIView *)view
{
    _pageView.clickHandle = self.clickHandle;
    _pageView.cancelHandle = self.cancelHandle;
}


@end
