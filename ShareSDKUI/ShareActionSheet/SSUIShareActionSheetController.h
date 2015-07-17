//
//  SSUIShareActionSheet.h
//  ShareSDKUI
//
//  Created by fenghj on 15/6/18.
//  Copyright (c) 2015年 mob. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>
#import "SSUITypeDef.h"

/**
 *  分享菜单
 */
@interface SSUIShareActionSheetController : NSObject

/**
 *  初始化分享菜单
 *
 *  @param items 菜单项集合
 *
 *  @return 分享菜单控制器对象
 */
- (instancetype)initWithItems:(NSArray *)items;

/**
 *  显示分享菜单
 *
 *  @param view     要显示菜单的视图
 */
- (void)showInView:(UIView *)view;

/**
 *  使分享菜单消失
 */
- (void)dismiss;

/**
 *  菜单项点击事件
 *
 *  @param itemClickHandler 菜单项点击事件处理器
 */
- (void)onItemClick:(SSUIShareActionSheetItemClickHandler)itemClickHandler;

/**
 *  分享菜单取消事件
 *
 *  @param cancelHandler 取消事件处理器
 */
- (void)onCancel:(SSUIShareActionSheetCancelHandler)cancelHandler;

@end
