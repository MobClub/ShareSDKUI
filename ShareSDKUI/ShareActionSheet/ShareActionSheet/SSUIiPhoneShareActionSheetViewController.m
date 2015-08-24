//
//  SSUIiPhoneShareActionSheetViewController.m
//  ShareSDKUI
//
//  Created by 刘靖煌 on 15/7/15.
//  Copyright (c) 2015年 mob. All rights reserved.
//

#import "SSUIiPhoneShareActionSheetViewController.h"
#import "SSUIPageView.h"
#import <MOBFoundation/MOBFColor.h>
#import "SSUIPageView.h"
#import <MOBFoundation/MOBFDevice.h>
#import "SSUIShareActionSheetStyle_Private.h"

static const CGFloat cancelButtonH = 63.0;
static const CGFloat spacing = 10.0;
static const CGFloat animationDuration = 0.35;

static const CGFloat temIntervalW = 30;          //竖屏下临时水平方向间距
static const CGFloat temIntervalH = 35;          //竖屏下临时竖直方向间距
static const CGFloat temLandscapeIntervalH = 10; //横屏下临时的竖直方向的间距

static const CGFloat platformItemW = 60.0;
static const CGFloat platformItemH = 78.0;

@interface SSUIiPhoneShareActionSheetViewController ()

@property (nonatomic, strong) UIButton *cancelButton;
@property (nonatomic, strong) SSUIPageView *pageView;
@property (nonatomic, assign) CGFloat pageViewH;
@property (nonatomic, assign) CGFloat pageViewW;
@property (nonatomic, assign) CGFloat screenW;

@property (nonatomic, assign) CGFloat screenH;
@property (nonatomic, assign) NSInteger totalColumns;
@property (nonatomic, assign) NSInteger totalRows;
@property (nonatomic, strong) NSArray *items;
@property (nonatomic, assign) CGFloat intervalH;

@end

@implementation SSUIiPhoneShareActionSheetViewController


- (instancetype)initWithItems:(NSArray *)items
{
    if (self = [super init])
    {
        self.items = items;

        //屏幕宽度
        _screenW = [UIScreen mainScreen].bounds.size.width < [UIScreen mainScreen].bounds.size.height ? [UIScreen mainScreen].bounds.size.width : [UIScreen mainScreen].bounds.size.height;

        //屏幕高度
        _screenH = [UIScreen mainScreen].bounds.size.width > [UIScreen mainScreen].bounds.size.height ? [UIScreen mainScreen].bounds.size.width : [UIScreen mainScreen].bounds.size.height;

        if (UIInterfaceOrientationIsLandscape([UIApplication sharedApplication].statusBarOrientation))
        {
            _pageViewW = _screenH - 2 * spacing;
            _totalRows = 2;
            _intervalH = temLandscapeIntervalH;
        }
        else
        {
            _pageViewW = _screenW - 2 * spacing;
            _totalRows = 3;
            _intervalH = temIntervalH;
        }
        
        _pageViewH = _totalRows * platformItemH + _intervalH * (_totalRows - 1) + 70;

        CGFloat contentViewW = _pageViewW;
        
        if ([MOBFDevice isPad])
        {
            _pageView = [[SSUIPageView alloc] initWithItems:items];
        }
        else
        {
            //计算行数和列数
            _totalColumns = (contentViewW + temIntervalW) / (temIntervalW + platformItemW);
            
            //根据集成平台个数决定高度
            if ([self.items count] < _totalRows * _totalColumns)
            {
                _totalRows = ceil([self.items count]*1.0 / _totalColumns);
                _pageViewH = platformItemH * _totalRows + _intervalH * (_totalRows - 1) + 70;
            }
            _pageView = [[SSUIPageView alloc] initWithItems:items totalColumn:_totalColumns totalRow:_totalRows];
            _pageView.autoresizingMask =  UIViewAutoresizingFlexibleTopMargin;
        }

        _pageView.clipsToBounds = YES;
        _pageView.layer.cornerRadius = 12.0;
        
        //取消按钮
        _cancelButton = [UIButton buttonWithType:UIButtonTypeCustom];
        _cancelButton.layer.cornerRadius = 12.0;
        _cancelButton.autoresizingMask = UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleTopMargin;
        _cancelButton.frame = CGRectMake(spacing, SSUI_HEIGHT(self.view) + _pageViewH - spacing, SSUI_WIDTH(self.view) -  2 * spacing, cancelButtonH - 2 * spacing);
        _cancelButton.backgroundColor = [UIColor whiteColor];
        [_cancelButton setTitleColor:[MOBFColor colorWithRGB:0x037bff] forState:UIControlStateNormal];
        [_cancelButton setTitle:NSLocalizedStringWithDefaultValue(@"Cancel", @"ShareSDKUI_Localizable", [NSBundle bundleWithPath:[[NSBundle mainBundle] pathForResource:@"ShareSDKUI" ofType:@"bundle"]], @"Cancel", nil)
                       forState:UIControlStateNormal];
        
        if (UIInterfaceOrientationIsLandscape([UIApplication sharedApplication].statusBarOrientation))
        {
            _pageView.frame = CGRectMake(spacing, _screenW, _screenH - 2 * spacing, _pageViewH);
        }
        else
        {
            _pageView.frame = CGRectMake(spacing, _screenH, _screenW - 2 * spacing, _pageViewH);
        }
        
        [self.view addSubview:_pageView];
        
        //如果有自定义颜色
        if ([SSUIShareActionSheetStyle sharedInstance].cancelButtonBackgroundColor)
        {
            _cancelButton.backgroundColor = [SSUIShareActionSheetStyle sharedInstance].cancelButtonBackgroundColor;
        }
        
        if ([SSUIShareActionSheetStyle sharedInstance].cancelButtonLabelColor)
        {
            [_cancelButton setTitleColor:[SSUIShareActionSheetStyle sharedInstance].cancelButtonLabelColor forState:UIControlStateNormal];
        }
        
        [_cancelButton addTarget:self action:@selector(cancelButtonClick:) forControlEvents:UIControlEventTouchUpInside];
        [self.view addSubview:_cancelButton];
    }
    
    UITapGestureRecognizer *tapGr = [[UITapGestureRecognizer alloc] initWithTarget:self action:@selector(viewTapped:)];
    [self.view addGestureRecognizer:tapGr];
    
    return self;
}

-(void)viewTapped:(UITapGestureRecognizer*)tapGr
{
    __weak SSUIiPhoneShareActionSheetViewController *actionSheet = self;
    
    [self dismissAnimation:^{
        
        if (actionSheet.cancelHandle)
        {
            actionSheet.cancelHandle ();
        }
    }];
}

- (void)willAnimateRotationToInterfaceOrientation:(UIInterfaceOrientation)toInterfaceOrientation duration:(NSTimeInterval)duration
{
    _interfaceOrientation = toInterfaceOrientation;
    [self updateLayout];
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

- (NSUInteger)supportedInterfaceOrientations
{
    if ([SSUIShareActionSheetStyle sharedInstance].supportedInterfaceOrientation)
    {
        return [SSUIShareActionSheetStyle sharedInstance].supportedInterfaceOrientation;
    }
    
    return UIInterfaceOrientationMaskAll;
}

- (void)updateLayout
{
    if (UIInterfaceOrientationIsLandscape([UIApplication sharedApplication].statusBarOrientation))
    {
        _pageViewH = _screenW * 0.6;
        _pageViewW = _screenH - 2 * spacing;
        _intervalH = temLandscapeIntervalH;
    }
    else
    {
        _pageViewH = _screenH * 0.6;
        _pageViewW = _screenW - 2 * spacing;
        _intervalH = temIntervalH;
    }
    
    if (UIInterfaceOrientationIsLandscape([UIApplication sharedApplication].statusBarOrientation))
    {
        _pageViewW = _screenH - 2 * spacing;
        _totalRows = 2;
        
    }
    else
    {
        _pageViewW = _screenW - 2 * spacing;
        _totalRows = 3;
    }

    _pageViewH = _totalRows * platformItemH + _intervalH * (_totalRows - 1) + 70;
    CGFloat contentViewW = _pageViewW;
    
    //计算行数和列数
    _totalColumns = (contentViewW + temIntervalW) / (temIntervalW + platformItemW);
    
    //根据集成平台个数决定高度
    if ([self.items count] < _totalRows * _totalColumns)
    {
        _totalRows = ceil([self.items count]*1.0 / _totalColumns);
        _pageViewH = platformItemH * _totalRows + _intervalH * (_totalRows - 1) + 70;
    }
    
    if (UIInterfaceOrientationIsLandscape(self.interfaceOrientation))
    {
        //横屏
        [self layoutLandscape];
    }
    else
    {
        //竖屏
        [self layoutPortrait];
    }
    [_pageView setNeedsLayout];
}

- (void)layoutLandscape
{
    _pageView.totalColums = self.totalColumns;
    _pageView.totalRow = self.totalRows;
    
    _pageView.frame = CGRectMake(spacing, _cancelButton.frame.origin.y - spacing - _pageViewH, _screenH -  2 * spacing, _pageViewH);
}

- (void)layoutPortrait
{
    _pageView.totalColums = self.totalColumns;
    _pageView.totalRow = self.totalRows;
    _pageView.frame = CGRectMake(spacing, _cancelButton.frame.origin.y - spacing - _pageViewH , _screenW -  2 * spacing, _pageViewH);
}

- (void)showInView:(UIView *)view
{
    _pageView.clickHandle = self.clickHandle;
    _pageView.cancelHandle = self.cancelHandle;
    
    __weak SSUIiPhoneShareActionSheetViewController *theSheet = self;
    
    if (UIInterfaceOrientationIsPortrait([UIApplication sharedApplication].statusBarOrientation))
    {
        [UIView animateWithDuration:animationDuration
                              delay:0.0
                            options:UIViewAnimationOptionCurveEaseOut
                         animations:^{
                             
                             theSheet.cancelButton.frame = CGRectMake(spacing, SSUI_HEIGHT(self.view) - cancelButtonH + spacing, SSUI_WIDTH(self.view) - 2 * spacing, cancelButtonH - 2 * spacing);
                             
                             theSheet.pageView.frame = CGRectMake(spacing, theSheet.cancelButton.frame.origin.y - spacing - theSheet.pageViewH, _screenW -  2 * spacing, theSheet.pageViewH);
                             
                         } completion:^(BOOL finished) {}];
    }
    else
    {
        [UIView animateWithDuration:animationDuration
                              delay:0.0
                            options:UIViewAnimationOptionCurveEaseOut
                         animations:^{
                             
                             theSheet.cancelButton.frame = CGRectMake(spacing, SSUI_HEIGHT(self.view) - cancelButtonH + spacing, SSUI_WIDTH(self.view) -   2 * spacing, cancelButtonH - 2 * spacing);
                        
                             theSheet.pageView.frame = CGRectMake(spacing, theSheet.cancelButton.frame.origin.y - spacing - theSheet.pageViewH, _screenH -  2 * spacing, theSheet.pageViewH);
                             
                         } completion:^(BOOL finished) {}];
    }
    
}

- (void)dismiss
{
    [self dismissAnimation:nil];
}

#pragma mark - Private

/**
 *  取消按钮点击事件
 *
 *  @param sender 事件对象
 */
- (void)cancelButtonClick:(id)sender
{
    __weak SSUIiPhoneShareActionSheetViewController *actionSheet = self;
    
    [self dismissAnimation:^{
        
        if (actionSheet.cancelHandle)
        {
            actionSheet.cancelHandle ();
        }
    }];
}

/**
 *  消失视图动画
 *
 *  @param completionHandler 完成事件
 */
- (void)dismissAnimation:(void(^)())completionHandler
{
    __weak SSUIiPhoneShareActionSheetViewController *actionSheet = self;
    [UIView animateWithDuration:animationDuration
                          delay:0.0
                        options:0
                     animations:^{

                         actionSheet.pageView.frame = CGRectMake(spacing, SSUI_HEIGHT(actionSheet.view), SSUI_WIDTH(actionSheet.view) -  2 * spacing, actionSheet.pageViewH);
                         actionSheet.cancelButton.frame = CGRectMake(spacing, SSUI_HEIGHT(actionSheet.view) + actionSheet.pageViewH - spacing, SSUI_WIDTH(actionSheet.view) -  2 * spacing, cancelButtonH - 2 * spacing);
                     }
                     completion:^(BOOL finished) {
                         
                         if (completionHandler)
                         {
                             completionHandler ();
                         }
                     }];
}

@end
