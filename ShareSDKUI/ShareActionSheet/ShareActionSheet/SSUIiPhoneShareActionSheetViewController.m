//
//  SSUIiPhoneShareActionSheetViewController.m
//  ShareSDKUI
//
//  Created by 刘 靖煌 on 15/7/15.
//  Copyright (c) 2015年 mob. All rights reserved.
//

#import "SSUIiPhoneShareActionSheetViewController.h"
#import "SSUIPageView.h"
#import <MOBFoundation/MOBFColor.h>
#import "SSUIPageView.h"
#import <MOBFoundation/MOBFDevice.h>
#import "SSUIShareActionSheetStyle_Private.h"

static const CGFloat animationDuration = 0.35;
static const CGFloat platformItemW = 60.0;
static const CGFloat temIntervalW = 30;          //竖屏下临时水平方向间距
static const CGFloat temIntervalH = 35;          //竖屏下临时竖直方向间距
static const CGFloat temLandscapeIntervalH = 10; //横屏下临时的竖直方向的间距

static const CGFloat maxPlatformsItemW = 105;

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
        UITapGestureRecognizer *tapGr = [[UITapGestureRecognizer alloc] initWithTarget:self action:@selector(viewTapped:)];
        [self.view addGestureRecognizer:tapGr];
        
        _spacing = 10.0;
        _cancelButtonH = 63.0;
        _platformItemH = 78.0;
        
        //屏幕宽度
        _screenW = [UIScreen mainScreen].bounds.size.width < [UIScreen mainScreen].bounds.size.height ? [UIScreen mainScreen].bounds.size.width : [UIScreen mainScreen].bounds.size.height;
        
        //屏幕高度
        _screenH = [UIScreen mainScreen].bounds.size.width > [UIScreen mainScreen].bounds.size.height ? [UIScreen mainScreen].bounds.size.width : [UIScreen mainScreen].bounds.size.height;
        
        if ([SSUIShareActionSheetStyle sharedInstance].style == ShareActionSheetStyleSimple)
        {
            _spacing = 0;
            _cancelButtonH = 43.0;
        }
        
        self.items = items;
        
        if (UIInterfaceOrientationIsLandscape([UIApplication sharedApplication].statusBarOrientation))
        {
            _pageViewW = _screenH - 2 * _spacing;
            _totalRows = 2;
            _intervalH = temLandscapeIntervalH;
        }
        else
        {
            _pageViewW = _screenW - 2 * _spacing;
            _totalRows = 3;
            _intervalH = temIntervalH;
        }
        
        _pageViewH = _totalRows * _platformItemH + _intervalH * (_totalRows - 1) + 70;

        CGFloat contentViewW = _pageViewW;
        
        if ([MOBFDevice isPad])
        {
            _pageView = [[SSUIPageView alloc] initWithItems:items];
        }
        else
        {
            //计算行数和列数
            if ([SSUIShareActionSheetStyle sharedInstance].style == ShareActionSheetStyleSimple)
            {
                _totalColumns = 4;
                
                CGFloat temWidth;
                
                //如果是横屏
                if (UIInterfaceOrientationIsLandscape([UIApplication sharedApplication].statusBarOrientation))
                {
                    temWidth = _screenH;
                }
                else
                {
                    temWidth = _screenW;
                }
                
                while ( maxPlatformsItemW < temWidth/_totalColumns)
                {
                    _totalColumns = _totalColumns + 1;
                }
                
                _platformItemH = temWidth/_totalColumns;
                _pageViewH = _platformItemH * _totalRows + 35;
            }
            else
            {
                _totalColumns = (contentViewW + temIntervalW) / (temIntervalW + platformItemW);
            }
            
            //根据集成平台个数决定高度
            if ([self.items count] <= _totalRows * _totalColumns)
            {
                _totalRows = ceil([self.items count]*1.0 / _totalColumns);
                _pageViewH = _platformItemH * _totalRows + _intervalH * (_totalRows - 1) + 70;
                
                if ([SSUIShareActionSheetStyle sharedInstance].style == ShareActionSheetStyleSimple)
                {
                    _pageViewH = _platformItemH * _totalRows;
                }
            }

            _pageView = [[SSUIPageView alloc] initWithItems:items totalColumn:_totalColumns totalRow:_totalRows platformItemH:_platformItemH];
            _pageView.autoresizingMask =  UIViewAutoresizingFlexibleTopMargin;
        }
        
        if ([SSUIShareActionSheetStyle sharedInstance].style == ShareActionSheetStyleSystem)
        {
            _pageView.clipsToBounds = YES;
            _pageView.layer.cornerRadius = 12.0;
            
         }

        //取消按钮
        if (![SSUIShareActionSheetStyle sharedInstance].isCancelButtomHidden)
        {
            _cancelButton = [UIButton buttonWithType:UIButtonTypeCustom];
            if ([SSUIShareActionSheetStyle sharedInstance].style == ShareActionSheetStyleSystem)
            {
                _cancelButton.layer.cornerRadius = 12.0;
            }
            
            _cancelButton.autoresizingMask = UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleTopMargin;
            _cancelButton.frame = CGRectMake(_spacing, SSUI_HEIGHT(self.view) + _pageViewH - _spacing, SSUI_WIDTH(self.view) -  2 * _spacing, _cancelButtonH - 2 * _spacing);
            _cancelButton.backgroundColor = [UIColor whiteColor];
            [_cancelButton setTitleColor:[MOBFColor colorWithRGB:0x037bff] forState:UIControlStateNormal];
            [_cancelButton setTitle:NSLocalizedStringWithDefaultValue(@"Cancel", @"ShareSDKUI_Localizable", [NSBundle bundleWithPath:[[NSBundle mainBundle] pathForResource:@"ShareSDKUI" ofType:@"bundle"]], @"Cancel", nil)
                           forState:UIControlStateNormal];
            
            //如果有自定义颜色
            if ([SSUIShareActionSheetStyle sharedInstance].cancelButtonBackgroundColor)
            {
                _cancelButton.backgroundColor = [SSUIShareActionSheetStyle sharedInstance].cancelButtonBackgroundColor;
            }
            
            if ([SSUIShareActionSheetStyle sharedInstance].cancelButtonLabelColor)
            {
                [_cancelButton setTitleColor:[SSUIShareActionSheetStyle sharedInstance].cancelButtonLabelColor forState:UIControlStateNormal];
            }
            
            [_cancelButton addTarget:self
                              action:@selector(cancelButtonClick:)
                    forControlEvents:UIControlEventTouchUpInside];
            [self.view addSubview:_cancelButton];
        }
        
        if (UIInterfaceOrientationIsLandscape([UIApplication sharedApplication].statusBarOrientation))
        {
            _pageView.frame = CGRectMake(_spacing, _screenW, _screenH - 2 * _spacing, _pageViewH);
        }
        else
        {
            _pageView.frame = CGRectMake(_spacing, _screenH, _screenW - 2 * _spacing, _pageViewH);
        }
        
        [self.view addSubview:_pageView];
    }
    
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

- (UIInterfaceOrientationMask)supportedInterfaceOrientations
{
    if ([SSUIShareActionSheetStyle sharedInstance].supportedInterfaceOrientation)
    {
        return [SSUIShareActionSheetStyle sharedInstance].supportedInterfaceOrientation;
    }
    
    return UIInterfaceOrientationMaskAll;
}

- (UIStatusBarStyle)preferredStatusBarStyle
{
    if ([SSUIShareActionSheetStyle sharedInstance].statusBarStyle)
    {
        return [SSUIShareActionSheetStyle sharedInstance].statusBarStyle;
    }
    return UIStatusBarStyleDefault;
}

- (void)updateLayout
{
    if (UIInterfaceOrientationIsLandscape([UIApplication sharedApplication].statusBarOrientation))
    {
        _pageViewH = _screenW * 0.6;
        _pageViewW = _screenH - 2 * _spacing;
        _intervalH = temLandscapeIntervalH;
    }
    else
    {
        _pageViewH = _screenH * 0.6;
        _pageViewW = _screenW - 2 * _spacing;
        _intervalH = temIntervalH;
    }
    
    if (UIInterfaceOrientationIsLandscape([UIApplication sharedApplication].statusBarOrientation))
    {
        _pageViewW = _screenH - 2 * _spacing;
        _totalRows = 2;
    }
    else
    {
        _pageViewW = _screenW - 2 * _spacing;
        _totalRows = 3;
    }

    _pageViewH = _totalRows * _platformItemH + _intervalH * (_totalRows - 1) + 70;
    CGFloat contentViewW = _pageViewW;
    
    //计算行数和列数
    _totalColumns = (contentViewW + temIntervalW) / (temIntervalW + platformItemW);
    if ([SSUIShareActionSheetStyle sharedInstance].style == ShareActionSheetStyleSimple)
    {
        _totalColumns = 4;
        
        CGFloat temWidth;
        
        //如果是横屏
        if (UIInterfaceOrientationIsLandscape([UIApplication sharedApplication].statusBarOrientation))
        {
            temWidth = _screenH;
        }
        else
        {
            temWidth = _screenW;
        }
        
        while ( maxPlatformsItemW < temWidth/_totalColumns)
        {
            _totalColumns = _totalColumns + 1;
        }
        
        _platformItemH = temWidth/_totalColumns;
        _pageViewH = _platformItemH * _totalRows + 35;
    }
    
    //根据集成平台个数决定高度
    if ([self.items count] <= _totalRows * _totalColumns)
    {
        _totalRows = ceil([self.items count]*1.0 / _totalColumns);
        _pageViewH = _platformItemH * _totalRows + _intervalH * (_totalRows - 1) + 70;
        
        if ([SSUIShareActionSheetStyle sharedInstance].style == ShareActionSheetStyleSimple)
        {
            _pageViewH = _platformItemH * _totalRows;
        }
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
    _pageView.platformItemW = _platformItemH;
    
    if([SSUIShareActionSheetStyle sharedInstance].style == ShareActionSheetStyleSimple)
    {
        _pageView.platformItemW = self.platformItemH;
    }
    
    if ([SSUIShareActionSheetStyle sharedInstance].isCancelButtomHidden)
    {
        _pageView.frame = CGRectMake(_spacing, _screenW - _spacing - _pageViewH, _screenH -  2 * _spacing, _pageViewH);
    }
    else
    {
        _pageView.frame = CGRectMake(_spacing, _cancelButton.frame.origin.y - _spacing - _pageViewH, _screenH -  2 * _spacing, _pageViewH);
    }
}

- (void)layoutPortrait
{
    _pageView.totalColums = self.totalColumns;
    _pageView.totalRow = self.totalRows;
    _pageView.platformItemW = _platformItemH;
    
    if([SSUIShareActionSheetStyle sharedInstance].style == ShareActionSheetStyleSimple)
    {
        _pageView.platformItemW = self.platformItemH;
    }
    
    if ([SSUIShareActionSheetStyle sharedInstance].isCancelButtomHidden)
    {
        _pageView.frame = CGRectMake(_spacing, _screenH - _spacing - _pageViewH , _screenW -  2 * _spacing, _pageViewH);
    }
    else
    {
        _pageView.frame = CGRectMake(_spacing, _cancelButton.frame.origin.y - _spacing - _pageViewH , _screenW -  2 * _spacing, _pageViewH);
    }
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
                             
                             if([SSUIShareActionSheetStyle sharedInstance].isCancelButtomHidden)
                             {
                                 theSheet.pageView.frame = CGRectMake(_spacing, _screenH - _spacing - theSheet.pageViewH, _screenW -  2 * _spacing, theSheet.pageViewH);
                             }
                             else
                             {
                                 theSheet.cancelButton.frame = CGRectMake(_spacing, SSUI_HEIGHT(self.view) - _cancelButtonH + _spacing, SSUI_WIDTH(self.view) - 2 * _spacing, _cancelButtonH - 2 * _spacing);
                                 
                                 theSheet.pageView.frame = CGRectMake(_spacing, theSheet.cancelButton.frame.origin.y - _spacing - theSheet.pageViewH, _screenW -  2 * _spacing, theSheet.pageViewH);
                             }
                             
                             
                         } completion:^(BOOL finished) {}];
    }
    else
    {
        [UIView animateWithDuration:animationDuration
                              delay:0.0
                            options:UIViewAnimationOptionCurveEaseOut
                         animations:^{
                             
                             if ([SSUIShareActionSheetStyle sharedInstance].isCancelButtomHidden)
                             {
                                 theSheet.pageView.frame = CGRectMake(_spacing, _screenW - _spacing - theSheet.pageViewH, _screenH -  2 * _spacing, theSheet.pageViewH);
                             }
                             else
                             {
                                 theSheet.cancelButton.frame = CGRectMake(_spacing, SSUI_HEIGHT(self.view) - _cancelButtonH + _spacing, SSUI_WIDTH(self.view) -   2 * _spacing, _cancelButtonH - 2 * _spacing);
                                 
                                 theSheet.pageView.frame = CGRectMake(_spacing, theSheet.cancelButton.frame.origin.y - _spacing - theSheet.pageViewH, _screenH -  2 * _spacing, theSheet.pageViewH);
                             }
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
                         
                         actionSheet.pageView.frame = CGRectMake(_spacing, SSUI_HEIGHT(actionSheet.view), SSUI_WIDTH(actionSheet.view) -  2 * _spacing, actionSheet.pageViewH);
                         
                         if(![SSUIShareActionSheetStyle sharedInstance].isCancelButtomHidden)
                         {
                             actionSheet.cancelButton.frame = CGRectMake(_spacing, SSUI_HEIGHT(actionSheet.view) + actionSheet.pageViewH - _spacing, SSUI_WIDTH(actionSheet.view) -  2 * _spacing, _cancelButtonH - 2 * _spacing);
                         }
                     }
                     completion:^(BOOL finished) {
                         
                         if (completionHandler)
                         {
                             completionHandler ();
                         }
                     }];
}

@end
