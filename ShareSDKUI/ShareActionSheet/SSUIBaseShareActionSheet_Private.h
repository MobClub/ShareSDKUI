//
//  SSUIBaseShareActionSheet_Private.h
//  ShareSDKUI
//
//  Created by fenghj on 15/6/18.
//  Copyright (c) 2015年 mob. All rights reserved.
//

#import "SSUIBaseShareActionSheet.h"

@interface SSUIBaseShareActionSheet ()

/**
 *  菜单项
 */
@property (nonatomic, strong) NSArray *items;

/**
 *  菜单项点击事件处理器
 */
@property (nonatomic, copy) SSUIShareActionSheetItemClickHandler itemClickHandler;

/**
 *  菜单取消事件处理器
 */
@property (nonatomic, copy) SSUIShareActionSheetCancelHandler cancelHandler;

@end
