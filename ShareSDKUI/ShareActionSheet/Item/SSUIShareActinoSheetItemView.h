//
//  SSUIShareActinoSheetItemView.h
//  ShareSDKUI
//
//  Created by 刘 靖煌 on 15/7/15.
//  Copyright (c) 2015年 mob. All rights reserved.
//

#import <UIKit/UIKit.h>
#import "SSUITypeDef.h"
#import "SSUIShareActionSheetItem.h"

@interface SSUIShareActinoSheetItemView : UIButton

@property (nonatomic) NSInteger index;
@property (nonatomic, strong) UILabel *nameLabel;
@property (nonatomic, strong) UIImageView *platformIcon;
@property (nonatomic, strong) SSUIShareActionSheetItem *item;
@property (nonatomic, copy) SSUIShareActionSheetItemClickHandler clickHandle;
@property (nonatomic, copy) SSUIShareActionSheetCancelHandler cancelHandle;

@property (nonatomic, assign) CGFloat itemW;

-(instancetype)initWithIndex:(NSInteger)index itemW:(CGFloat)itemWidth itemH:(CGFloat)itemHeight;

@end
