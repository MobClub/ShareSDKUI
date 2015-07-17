//
//  SSUIPageView.h
//  ShareSDKUI
//
//  Created by 刘 靖煌 on 15/7/9.
//  Copyright (c) 2015年 mob. All rights reserved.
//

#import <UIKit/UIKit.h>
#import "SSUITypeDef.h"

@interface SSUIPageView : UIView

/**
 *   每页包含的个数
 */
@property (nonatomic, assign) NSInteger pageSize;

/**
 *  共有多少页
 */
@property (nonatomic, assign) NSInteger pageNum;

/**
 *  总行数
 */
@property (nonatomic, assign) NSInteger totalRow;

/**
 *  总列数
 */
@property (nonatomic, assign) NSInteger totalColums;

/**
 *  存储平台页面的数组
 */
@property (nonatomic, strong) NSMutableArray *platformArr;


@property (nonatomic, copy) SSUIShareActionSheetItemClickHandler clickHandle;
@property (nonatomic, copy) SSUIShareActionSheetCancelHandler cancelHandle;

/**
 *  初始化
 *
 *  @param items       平台数组
 *  @param columnCount 列数
 *  @param rowCount    行数
 */
- (instancetype)initWithItems:(NSArray *)items;
- (instancetype)initWithItems:(NSArray *)items totalColumn:(NSInteger)columnCount totalRow:(NSInteger)rowCount;

@end
