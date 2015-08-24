//
//  SSUIPlatformsView.m
//  ShareSDKUI
//
//  Created by 刘 靖煌 on 15/7/9.
//  Copyright (c) 2015年 mob. All rights reserved.
//

#import "SSUIPlatformsView.h"
#import "SSUIShareActionSheetItem.h"
#import <MOBFoundation/MOBFDevice.h>
#import "SSUITypeDef.h"
#import "SSUIShareActinoSheetItemView.h"
#import "SSUIShareActionSheetStyle_Private.h"

static const CGFloat itemW = 60;
static const CGFloat itemH = 78;

@interface SSUIPlatformsView ()

@property (nonatomic, strong) NSMutableArray *itemArr;
@property (nonatomic, strong) SSUIShareActinoSheetItemView *itemView;

@end

@implementation SSUIPlatformsView

- (instancetype)initWithTotalColumn:(NSInteger)columnCount totalRow:(NSInteger)rowCount platformIndex:(NSInteger)index
{
    if (self = [super init])
    {
        _totalRow = rowCount;
        _totalColums = columnCount;
        _platformIndex = index;
        _itemArr = [NSMutableArray array];
        
        self.backgroundColor = [UIColor whiteColor];
        if ([SSUIShareActionSheetStyle sharedInstance].actionSheetColor)
        {
            self.backgroundColor = [SSUIShareActionSheetStyle sharedInstance].actionSheetColor;
        }
    }
    return self;
}

-(void)setItems:(NSArray *)items
{
    _items = items;
}

-(void)setTotalColums:(NSInteger)totalColums
{
    _totalColums = totalColums;
}

-(void)setTotalRow:(NSInteger)totalRow
{
    _totalRow = totalRow;
}

-(void)layoutSubviews
{
    CGFloat viewW = SSUI_WIDTH(self);
    CGFloat viewH = SSUI_HEIGHT(self);
    
    CGFloat marginX = (viewW - self.totalColums * itemW) / (self.totalColums + 1);
    CGFloat marginY = 0;
    
    if (self.totalRow > 1)
    {
        marginY = (viewH - self.totalRow *itemH)/ (self.totalRow - 1);
    }
    
    for (int index = 0; index < [self.items count]; index++)
    {
        if (self.itemArr.count > index)
        {
            _itemView = self.itemArr[index];
        }
        else
        {
            _itemView = [[SSUIShareActinoSheetItemView alloc] initWithIndex:(index + self.platformIndex *self.totalRow*self.totalColums)];
            [self.itemArr addObject:_itemView];
        }
        
        _itemView.item = self.items[index];
        _itemView.hidden = NO;
        _itemView.clickHandle = self.clickHandle;
        _itemView.cancelHandle = self.cancelHandle;

        //计算item的frame
        CGFloat row = index / self.totalColums;
        CGFloat col = index % self.totalColums;
        CGFloat itemX = marginX + col * (itemW + marginX);
        CGFloat itemY = row * (itemH + marginY);
        _itemView.frame = CGRectMake(itemX, itemY, itemW, itemH);
        
        [self addSubview:_itemView];
    }
    
    for (NSUInteger index = self.items.count; index < self.itemArr.count; index++)
    {
        SSUIShareActinoSheetItemView *itemView = self.itemArr[index];
        itemView.hidden = YES;
    }
}

@end
