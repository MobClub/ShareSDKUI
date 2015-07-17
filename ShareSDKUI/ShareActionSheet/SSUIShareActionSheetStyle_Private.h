//
//  SSUIShareActionSheetStyle_Private.h
//  ShareSDKUI
//
//  Created by 刘靖煌 on 15/7/15.
//  Copyright (c) 2015年 mob. All rights reserved.
//

#import "SSUIShareActionSheetStyle.h"

@interface SSUIShareActionSheetStyle ()

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
 *  获取授权视图风格共享实例
 *
 *  @return 风格实例
 */
+ (instancetype)sharedInstance;

@end
