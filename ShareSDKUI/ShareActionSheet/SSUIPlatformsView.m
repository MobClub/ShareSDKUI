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

@interface SSUIPlatformsView ()

@property (nonatomic, strong) NSMutableArray *itemArr;
@property (nonatomic, strong) SSUIShareActinoSheetItemView *itemView;
@property (nonatomic, assign) CGFloat screenW;
@property (nonatomic, assign) CGFloat screenH;

@end

@implementation SSUIPlatformsView

- (instancetype)initWithTotalColumn:(NSInteger)columnCount
                           totalRow:(NSInteger)rowCount
                      platformIndex:(NSInteger)index
{
    if (self = [super init])
    {
        //横竖屏切换时，重绘
        self.contentMode = UIViewContentModeRedraw;
        self.backgroundColor = [UIColor whiteColor];
        self.userInteractionEnabled = YES;
        
        _totalRow = rowCount;
        _totalColums = columnCount;
        _platformIndex = index;
        _itemArr = [NSMutableArray array];
        _itemW = 60;
        _itemH = 78;
        
        _screenW = [UIScreen mainScreen].bounds.size.width < [UIScreen mainScreen].bounds.size.height ? [UIScreen mainScreen].bounds.size.width : [UIScreen mainScreen].bounds.size.height;
        
        _screenH = [UIScreen mainScreen].bounds.size.width > [UIScreen mainScreen].bounds.size.height ? [UIScreen mainScreen].bounds.size.width : [UIScreen mainScreen].bounds.size.height;
        
        
        if ([SSUIShareActionSheetStyle sharedInstance].style == ShareActionSheetStyleSimple && ![MOBFDevice isPad])
        {
            if (UIInterfaceOrientationIsLandscape([UIApplication sharedApplication].statusBarOrientation))
            {
                _itemW = _screenH/_totalColums;
            }
            else
            {
                _itemW = _screenW/_totalColums;
            }

            _itemH = _itemW;
        }
    
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

- (void)setplatformItemW:(CGFloat)platformItemW
{
    _platformItemW = platformItemW;
}

-(void)layoutSubviews
{
    CGFloat viewW = SSUI_WIDTH(self);
    CGFloat viewH = SSUI_HEIGHT(self);
    
    CGFloat marginX = (viewW - self.totalColums * _itemW) / (self.totalColums + 1);
    CGFloat marginY = 0;
    
    if (self.totalRow > 1)
    {
        marginY = (viewH - self.totalRow *_itemH)/ (self.totalRow - 1);
    }
    
    if ([SSUIShareActionSheetStyle sharedInstance].style == ShareActionSheetStyleSimple && ![MOBFDevice isPad])
    {
        marginX = 0;
        marginY = 0;
    }

    for (int index = 0; index < [self.items count]; index++)
    {
        if (self.itemArr.count > index)
        {
            _itemView = self.itemArr[index];
            
            if ([SSUIShareActionSheetStyle sharedInstance].style == ShareActionSheetStyleSimple && ![MOBFDevice isPad])
            {
                CGFloat temWidth;
                //如果是横屏
                if (UIInterfaceOrientationIsLandscape([UIApplication sharedApplication].statusBarOrientation))
                {
                    temWidth = _screenH;
                }
                else
                {
                    temWidth = _screenW;
                }
                
                _platformItemW = temWidth/_totalColums;
                
                _itemView.itemW = _platformItemW;
                _itemW = _platformItemW;
            }
        }
        else
        {
            if ([SSUIShareActionSheetStyle sharedInstance].style == ShareActionSheetStyleSimple && ![MOBFDevice isPad])
            {
                CGFloat temWidth;
                //如果是横屏
                if (UIInterfaceOrientationIsLandscape([UIApplication sharedApplication].statusBarOrientation))
                {
                    temWidth = _screenH;
                }
                else
                {
                    temWidth = _screenW;
                }
                
                _platformItemW = temWidth/_totalColums;
                
                _itemView = [[SSUIShareActinoSheetItemView alloc] initWithIndex:(index + self.platformIndex *self.totalRow*self.totalColums)
                                                                          itemW:_platformItemW
                                                                          itemH:_platformItemW];
            }
            else
            {
                _itemView = [[SSUIShareActinoSheetItemView alloc] initWithIndex:(index + self.platformIndex *self.totalRow*self.totalColums)
                                                                          itemW:_itemW
                                                                          itemH:_itemW];
            }
            
            [self.itemArr addObject:_itemView];
        }

        _itemView.item = self.items[index];
        _itemView.hidden = NO;
        _itemView.clickHandle = self.clickHandle;
        _itemView.cancelHandle = self.cancelHandle;

        //计算item的frame
        CGFloat row = index / self.totalColums;
        CGFloat col = index % self.totalColums;
        CGFloat itemX = marginX + col * (_itemW + marginX);
        CGFloat itemY = row * (_itemH + marginY);
        _itemView.frame = CGRectMake(itemX, itemY, _itemW, _itemH);
        
        if ([SSUIShareActionSheetStyle sharedInstance].style == ShareActionSheetStyleSimple && ![MOBFDevice isPad])
        {
            //留一个像素画线
            itemY = row * (_itemW + marginY);
            _itemView.frame = CGRectMake(itemX+1, itemY+1, _itemW-2, _itemW-2);
        }
        
        [self addSubview:_itemView];
    }
    
    for (NSUInteger index = self.items.count; index < self.itemArr.count; index++)
    {
        SSUIShareActinoSheetItemView *itemView = self.itemArr[index];
        itemView.hidden = YES;
    }
}

- (void)needRedrawRect:(CGRect)rect
{
    UIBezierPath *path = [UIBezierPath bezierPath];

    //画横线
    for (int row = 1; row <= _totalRow ; row++)
    {
        [path moveToPoint:CGPointMake(0, _itemW*row)];
        
        if (UIInterfaceOrientationIsLandscape([UIApplication sharedApplication].statusBarOrientation))
        {
            [path addLineToPoint:CGPointMake(_screenH, _itemW*row)];
        }
        else
        {
            [path addLineToPoint:CGPointMake(_screenW, _itemW*row)];
        }
    }
    
    //画竖线
    for (int colums = 1; colums < _totalColums; colums++)
    {
        [path moveToPoint:CGPointMake(_itemW*colums, 0)];
        [path addLineToPoint:CGPointMake(_itemW*colums, _platformItemW *_totalRow)];
    }
    
    // 设置线宽
    path.lineWidth = 1.0;
    
    // 设置画笔颜色
    UIColor *strokeColor = [UIColor colorWithRed:242.0/255 green:242.0/255 blue:242.0/255 alpha:0.8];
    [strokeColor set];
    
    // 根据我们设置的各个点连线
    [path stroke];
}

- (void)drawRect:(CGRect)rect
{
    [super drawRect:rect];
    
    if ([SSUIShareActionSheetStyle sharedInstance].style == ShareActionSheetStyleSimple && ![MOBFDevice isPad])
    {
        [self needRedrawRect:rect];
    }
}

@end
