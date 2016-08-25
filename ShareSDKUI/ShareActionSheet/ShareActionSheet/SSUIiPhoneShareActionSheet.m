//
//  SSUIiPhoneShareActionSheet.m
//  ShareSDKUI
//
//  Created by 刘 靖煌 on 15/6/18.
//  Copyright (c) 2015年 mob. All rights reserved.
//

#import "SSUIiPhoneShareActionSheet.h"
#import "SSUIBaseShareActionSheet_Private.h"
#import "SSUIiPhoneShareActionSheetViewController.h"
#import <MOBFoundation/MOBFColor.h>
#import "SSUIShareActionSheetStyle_Private.h"

@interface SSUIiPhoneShareActionSheet ()

@property (nonatomic, strong) UIWindow *window;
@property (nonatomic, strong) SSUIiPhoneShareActionSheetViewController *viewCtr;

@end

@implementation SSUIiPhoneShareActionSheet

- (instancetype)initWithItems:(NSArray *)items
{
    if (self = [super init])
    {
        self.items = items;
        _viewCtr = [[SSUIiPhoneShareActionSheetViewController alloc] initWithItems:items];
        
        _viewCtr.view.backgroundColor = [MOBFColor colorWithARGB:0x4c000000];
        if ([SSUIShareActionSheetStyle sharedInstance].actionSheetBackgroundColor)
        {
            _viewCtr.view.backgroundColor = [SSUIShareActionSheetStyle sharedInstance].actionSheetBackgroundColor;
        }
    }
    
    return self;
}

- (void)showInView:(UIView *)view
{
    [_viewCtr showInView:view];
    
    _window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
    _window.windowLevel = [UIApplication sharedApplication].keyWindow.windowLevel + 1;
    _window.userInteractionEnabled = YES;
    _window.rootViewController = _viewCtr;
    [_window makeKeyAndVisible];
}

- (void)onItemClick:(SSUIShareActionSheetItemClickHandler)itemClickHandler
{
    [super onItemClick:itemClickHandler];
    
    _viewCtr.clickHandle = itemClickHandler;
}

- (void)onCancel:(SSUIShareActionSheetCancelHandler)cancelHandler
{
    [super onCancel:cancelHandler];
    
    _viewCtr.cancelHandle = cancelHandler;
}

- (void)dismiss
{
    [_viewCtr dismiss];
    
    if (_window)
    {
        [_window resignKeyWindow];
        _window.hidden = YES;
        _window = nil;
    }
}

//-(void)dealloc
//{
//    NSLog(@"%@被销毁了", self);
//}

@end
