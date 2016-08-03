//
//  SSUIiPhoneShareActionSheetViewController.h
//  ShareSDKUI
//
//  Created by 刘 靖煌 on 15/7/15.
//  Copyright (c) 2015年 mob. All rights reserved.
//

#import <UIKit/UIKit.h>
#import "SSUITypeDef.h"

@interface SSUIiPhoneShareActionSheetViewController : UIViewController
{
    UIInterfaceOrientation _interfaceOrientation;
}

@property (nonatomic, copy) SSUIShareActionSheetItemClickHandler clickHandle;
@property (nonatomic, copy) SSUIShareActionSheetCancelHandler cancelHandle;
@property (nonatomic, assign) CGFloat spacing;
@property (nonatomic, assign) CGFloat cancelButtonH;
@property (nonatomic, assign) CGFloat platformItemH;

/**
 *  初始化分享菜单
 *
 *  @param items 菜单项
 *
 *  @return 分享菜单
 */
- (instancetype)initWithItems:(NSArray *)items;

/**
 *  显示分享菜单
 *
 *  @param view     要显示菜单的视图
 */
- (void)showInView:(UIView *)view;

/**
 *  关闭分享菜单
 */
- (void)dismiss;


@end
