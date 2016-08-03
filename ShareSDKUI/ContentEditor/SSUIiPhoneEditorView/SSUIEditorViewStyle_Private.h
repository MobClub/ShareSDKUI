//
//  SSUIEditorViewStyle_Private.h
//  ShareSDKUI
//
//  Created by chenjd on 15/7/15.
//  Copyright (c) 2015年 mob. All rights reserved.
//

#import "SSUIEditorViewStyle.h"
@interface SSUIEditorViewStyle ()

/**
 *  导航栏背景图片
 */
@property (nonatomic, strong) UIImage *iPhoneNavigationbarBackgroundImage;

/**
 *  iphone导航栏背景颜色
 */
@property (nonatomic, strong) UIColor *iPhoneNavigationbarBackgroundColor;

/**
 *  ipad导航栏背景颜色
 */
@property (nonatomic, strong) UIColor *iPadNavigationbarBackgroundColor;

/**
 *  编辑界面背景颜色
 */
@property (nonatomic, strong) UIColor *contentViewBackgroundColor;
/**
 *  标题
 */
@property (nonatomic, copy) NSString *title;

/**
 *  标题文本颜色
 */
@property (nonatomic, strong) UIColor *titleColor;

/**
 *  取消按钮标签文本
 */
@property (nonatomic, copy) NSString *cancelButtonLabel;

/**
 *  取消按钮标签文本颜色
 */
@property (nonatomic, strong) UIColor *cancelButtonLabelColor;

/**
 *  取消按钮背景图片
 */
@property (nonatomic, strong) UIImage *cancelButtonImage;

/**
 *  分享按钮标签文本
 */
@property (nonatomic, copy) NSString *shareButtonLabel;

/**
 *  分享按钮标签文本颜色
 */
@property (nonatomic, strong) UIColor *shareButtonLabelColor;

/**
 *  分享按钮背景图片
 */
@property (nonatomic, strong) UIImage *shareButtonImage;

/**
 *  支持的屏幕方向
 */
@property (nonatomic, assign) UIInterfaceOrientationMask supportedInterfaceOrientation;

/**
 *  分享菜单栏状态栏的风格
 */
@property (nonatomic, assign) UIStatusBarStyle statusBarStyle;

/**
 *  用于保存特定情况不需要授权的平台列表(如Sina客户端分享,Facebook Webpage分享)
 */
@property (nonatomic, strong) NSMutableArray *unNeedAuthPlatforms;

/**
 *  获取授权视图风格共享实例
 *
 *  @return 风格实例
 */
+ (instancetype)sharedInstance;

@end

