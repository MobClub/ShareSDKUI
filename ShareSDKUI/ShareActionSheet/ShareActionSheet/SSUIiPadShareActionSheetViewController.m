//
//  SSUIiPadShareActionSheetViewController.m
//  ShareSDKUI
//
//  Created by 刘靖煌 on 15/7/15.
//  Copyright (c) 2015年 mob. All rights reserved.
//

#import "SSUIiPadShareActionSheetViewController.h"
#import "SSUIPageView.h"

@interface SSUIiPadShareActionSheetViewController ()

@property (nonatomic, strong) SSUIPageView *pageView;

@end

@implementation SSUIiPadShareActionSheetViewController

- (instancetype)initWithItems:(NSArray *)items
{
    if (self = [super init])
    {
        _pageView = [[SSUIPageView alloc] initWithItems:items];
        [self.view addSubview:_pageView];
    }
    
    return self;
}

-(void)viewDidLoad
{
    [super viewDidLoad];
    
    _pageView.frame = CGRectMake(0, 0, 300, 400);
}

- (void)showInView:(UIView *)view
{
    _pageView.clickHandle = self.clickHandle;
    _pageView.cancelHandle = self.cancelHandle;
}


@end
