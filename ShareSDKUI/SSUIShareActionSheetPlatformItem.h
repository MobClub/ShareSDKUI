//
//  SSUIShareActionSheetPlatformItem.h
//  ShareSDKUI
//
//  Created by fenghj on 15/6/18.
//  Copyright (c) 2015年 mob. All rights reserved.
//

#import "SSUIShareActionSheetItem.h"

/**
 *  平台分享菜单项
 */
@interface SSUIShareActionSheetPlatformItem : SSUIShareActionSheetItem

/**
 *  平台类型
 */
@property (nonatomic, readonly) SSDKPlatformType platformType;

/**
 *  初始化平台分享菜单项
 *
 *  @param platformType 平台类型
 *
 *  @return 分享菜单项
 */
- (instancetype)initWithPlatformType:(SSDKPlatformType)platformType;

@end
