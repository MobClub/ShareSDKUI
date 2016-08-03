//
//  SSUIShareActionSheetStyle_Private.h
//  ShareSDKUI
//
//  Created by 刘 靖煌 on 15/7/15.
//  Copyright (c) 2015年 mob. All rights reserved.
//

#import "SSUIShareActionSheetStyle.h"

@interface SSUIShareActionSheetStyle ()

/**
 *  ShareSDK UI风格
 */
@property (nonatomic, assign) ShareActionSheetStyle style;

/**
 *  分享菜单栏颜色
 */
@property (nonatomic, strong) UIColor *actionSheetColor;

/**
 *  分享菜单栏背景颜色
 */
@property (nonatomic, strong) UIColor *actionSheetBackgroundColor;

/**
 *  标题文本颜色
 */
@property (nonatomic, strong) UIColor *itemNameColor;

/**
 *  标题文本字体
 */
@property (nonatomic, strong) UIFont *itemNameFont;

/**
 *  取消按钮标签文本颜色
 */
@property (nonatomic, strong) UIColor *cancelButtonLabelColor;

/**
 *  取消按钮背景颜色
 */
@property (nonatomic, strong) UIColor *cancelButtonBackgroundColor;

/**
 *  UIPageControl的Indicator的颜色
 */
@property (nonatomic, strong) UIColor *pageIndicatorTintColor;

/**
 *  UIPageControl当前页的Indicator的颜色
 */
@property (nonatomic, strong) UIColor *currentPageIndicatorTintColor;

/**
 *  支持的方向
 */
@property (nonatomic, assign) UIInterfaceOrientationMask supportedInterfaceOrientation;

/**
 *  分享菜单栏状态栏的风格
 */
@property (nonatomic, assign) UIStatusBarStyle statusBarStyle;

/**
 *  取消按钮是否隐藏
 */
@property (nonatomic, assign) BOOL isCancelButtomHidden;

/**
 *  获取授权视图风格共享实例
 *
 *  @return 风格类实例
 */
+ (instancetype)sharedInstance;

@end
