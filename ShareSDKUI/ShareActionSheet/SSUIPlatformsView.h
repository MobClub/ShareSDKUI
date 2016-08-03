//
//  SSUIPlatformsView.h
//  ShareSDKUI
//
//  Created by 刘 靖煌 on 15/7/9.
//  Copyright (c) 2015年 mob. All rights reserved.
//

#import <UIKit/UIKit.h>
#import "SSUITypeDef.h"

@interface SSUIPlatformsView : UIView

@property (nonatomic, strong) NSArray *items;
@property (nonatomic, assign) NSInteger totalColums;
@property (nonatomic, assign) NSInteger totalRow;
@property (nonatomic, assign) NSInteger platformIndex;
@property (nonatomic, assign) CGFloat itemW;

@property (nonatomic, assign) CGFloat itemH;
@property (nonatomic, assign) CGFloat platformItemW;
@property (nonatomic, copy) SSUIShareActionSheetItemClickHandler clickHandle;
@property (nonatomic, copy) SSUIShareActionSheetCancelHandler cancelHandle;

- (instancetype)initWithTotalColumn:(NSInteger)columnCount totalRow:(NSInteger)rowCount platformIndex:(NSInteger)index;

@end
