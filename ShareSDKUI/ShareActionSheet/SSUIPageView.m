//
//  SSUIPageView.m
//  ShareSDKUI
//
//  Created by 刘 靖煌 on 15/7/9.
//  Copyright (c) 2015年 mob. All rights reserved.
//

#import "SSUIPageView.h"
#import "SSUIPlatformsView.h"
#import <MOBFoundation/MOBFDevice.h>
#import "SSUIShareActionSheetStyle_Private.h"

@interface SSUIPageView () <UIScrollViewDelegate>

@property (nonatomic, strong) NSArray *items;
@property (nonatomic, strong) UIPageControl *pageCtr;
@property (nonatomic, strong) UIScrollView *scrollView;
@property (nonatomic, strong) SSUIPlatformsView *platformView;

@end

@implementation SSUIPageView

- (instancetype)initWithItems:(NSArray *)items totalColumn:(NSInteger)columnCount totalRow:(NSInteger)rowCount
{
    return [self initWithItems:items totalColumn:columnCount totalRow:rowCount platformItemH:78.0];
}

- (instancetype)initWithItems:(NSArray *)items totalColumn:(NSInteger)columnCount totalRow:(NSInteger)rowCount platformItemH:(CGFloat)itemH
{
    if (self = [super init])
    {
        _platformArr = [NSMutableArray array];
        _items = items;
        _totalRow = rowCount;
        _totalColums = columnCount;
        _topIntervalH = 35.0;
        _pageControlH = 35.0;

        if ([SSUIShareActionSheetStyle sharedInstance].style == ShareActionSheetStyleSimple && ![MOBFDevice isPad])
        {
            _topIntervalH = 0.0;
            _platformItemW = itemH;
        }
        
        self.backgroundColor = [UIColor whiteColor];
        
        if ([SSUIShareActionSheetStyle sharedInstance].actionSheetColor)
        {
            self.backgroundColor = [SSUIShareActionSheetStyle sharedInstance].actionSheetColor;
        }
        
        //计算出每页有多少个item和共有多少页
        [self updataPageData];
        
        //设置UIScrollView
        [self setupScrollViewWithItems:self.items];
        
        //设置UIPageControl
        [self setupPageControlWithItems:self.items];
    }
    return self;
}

-(void)updataPageData
{
    self.pageSize = self.totalColums * self.totalRow;
    self.pageNum = ceil([self.items count]* 1.0 /self.pageSize);
    
    if (self.pageNum > 1)
    {
        self.pageCtr.hidden = NO;
    }
    else
    {
        self.pageCtr.hidden = NO;
    }
}

/**
 *  iPad使用
 */
- (instancetype)initWithItems:(NSArray *)items
{
    NSInteger row = ceil([items count] * 1.0 /3.0);
    if (row > 2)
    {
        return [self initWithItems:items totalColumn:3 totalRow:3];
    }
    else
    {
        return [self initWithItems:items totalColumn:3 totalRow:row];
    }
}

- (void)setupScrollViewWithItems:(NSArray *)items
{
    UIScrollView *scrollView = [[UIScrollView alloc] init];
    scrollView.delegate = self;
    scrollView.showsHorizontalScrollIndicator = NO;
    scrollView.pagingEnabled = YES;
    scrollView.bounces = NO;
    _scrollView = scrollView;
    [self addSubview:_scrollView];
}

- (void)setupPageControlWithItems:(NSArray *)items
{
    //超过一页，才显示UIPageControl控件
    if (self.pageNum > 1)
    {
        if (!_pageCtr)
        {
            _pageCtr = [[UIPageControl alloc] init];
        }
        
        _pageCtr.numberOfPages = self.pageNum;
        _pageCtr.userInteractionEnabled = NO;
        _pageCtr.hidden = NO;
        _pageCtr.currentPageIndicatorTintColor = [UIColor colorWithRed:22/255.0 green:100/255.0 blue:255/255.0 alpha:1.0];
        _pageCtr.pageIndicatorTintColor = [UIColor colorWithRed:160/255.0 green:199/255.0 blue:250/255.0 alpha:1.0];
        _pageCtr.backgroundColor = [UIColor whiteColor];
        
        if ([SSUIShareActionSheetStyle sharedInstance].actionSheetColor)
        {
            _pageCtr.backgroundColor = [SSUIShareActionSheetStyle sharedInstance].actionSheetColor;
        }
        
        if ([SSUIShareActionSheetStyle sharedInstance].currentPageIndicatorTintColor)
        {
            _pageCtr.currentPageIndicatorTintColor = [SSUIShareActionSheetStyle sharedInstance].currentPageIndicatorTintColor;
        }
        
        if ([SSUIShareActionSheetStyle sharedInstance].pageIndicatorTintColor)
        {
            _pageCtr.pageIndicatorTintColor = [SSUIShareActionSheetStyle sharedInstance].pageIndicatorTintColor;
        }
        
        _pageCtr.autoresizingMask = UIViewAutoresizingFlexibleHeight | UIViewAutoresizingFlexibleWidth;
        [self addSubview:_pageCtr];
    }
    else
    {
        _pageCtr.hidden = YES;
    }
}

-(void)setTotalColums:(NSInteger)totalColums
{
    _totalColums = totalColums;
    [self updataPageData];
    [self setupPageControlWithItems:_items];
}

-(void)setTotalRow:(NSInteger)totalRow
{
    _totalRow = totalRow;
    [self updataPageData];
    [self setupPageControlWithItems:_items];
}

- (void)setPlatformItemW:(CGFloat)platformItemW
{
    _platformItemW = platformItemW;
}

-(void)layoutSubviews
{
    CGFloat platformViewW = SSUI_WIDTH(self);
    CGFloat platformViewH = SSUI_HEIGHT(self) - _topIntervalH - _pageControlH;
    
    _scrollView.contentSize = CGSizeMake(SSUI_WIDTH(self) * self.pageNum, 0);
    _scrollView.frame = CGRectMake(0, 0, SSUI_WIDTH(self), SSUI_HEIGHT(self));
    
    NSInteger loc = 0;
    
    for (int index = 0; index < self.pageNum; index++)
    {
        //每页包含的平台数组
        NSInteger len = loc + self.pageSize > [self.items count] ? [self.items count] - loc : self.pageSize;
        NSArray *arr = [self.items subarrayWithRange:NSMakeRange(loc, len)];

        _platformView = nil;
        if (self.platformArr.count > index)
        {
            _platformView = self.platformArr[index];
        }
        else
        {
            _platformView = [[SSUIPlatformsView alloc] initWithTotalColumn:self.totalColums totalRow:self.totalRow platformIndex:index];
            [self.platformArr addObject:_platformView];
        }
        
        _platformView.hidden = NO;
        _platformView.totalRow = self.totalRow;
        _platformView.totalColums = self.totalColums;
        _platformView.platformItemW = self.platformItemW;
        _platformView.items = arr;
        
        if ([SSUIShareActionSheetStyle sharedInstance].style == ShareActionSheetStyleSimple && ![MOBFDevice isPad])
        {
            platformViewH = _platformItemW * _platformView.totalRow;
        }
        
        _platformView.frame = CGRectMake(index * platformViewW, _topIntervalH, platformViewW, platformViewH);
        
        _platformView.clickHandle = self.clickHandle;
        _platformView.cancelHandle = self.cancelHandle;
        [self.scrollView addSubview:_platformView];
        loc += self.pageSize;
    }
    
    for (NSUInteger index = self.pageNum; index < self.platformArr.count; index ++)
    {
        SSUIPlatformsView *view = self.platformArr[index];
        view.hidden = YES;
    }
    
    _pageCtr.frame = CGRectMake(0, SSUI_HEIGHT(self) - _pageControlH, SSUI_WIDTH(self), _pageControlH - 1);
    _scrollView.contentOffset = CGPointMake(_pageCtr.currentPage * platformViewW, 0.0);
}

- (void)scrollViewDidScroll:(UIScrollView *)scrollView
{
    //1、取出水平方向上滚动的距离
    CGFloat offsetX = scrollView.contentOffset.x;
    
    //2、求出页码
    double pageDouble = offsetX / scrollView.frame.size.width;
    int pageInt = (int)(pageDouble + 0.5);
    _pageCtr.currentPage = pageInt;
}

- (void)needRedrawRect:(CGRect)rect
{
    UIBezierPath *path = [UIBezierPath bezierPath];
    
    CGFloat _screenW = [UIScreen mainScreen].bounds.size.width < [UIScreen mainScreen].bounds.size.height ? [UIScreen mainScreen].bounds.size.width : [UIScreen mainScreen].bounds.size.height;
    
    CGFloat _screenH = [UIScreen mainScreen].bounds.size.width > [UIScreen mainScreen].bounds.size.height ? [UIScreen mainScreen].bounds.size.width : [UIScreen mainScreen].bounds.size.height;
    
    [path moveToPoint:CGPointMake(0, CGRectGetMaxY(_pageCtr.frame)+1)];
    
    if (UIInterfaceOrientationIsLandscape([UIApplication sharedApplication].statusBarOrientation))
    {
        [path addLineToPoint:CGPointMake(_screenH, CGRectGetMaxY(_pageCtr.frame)+1)];
    }
    else
    {
        [path addLineToPoint:CGPointMake(_screenW, CGRectGetMaxY(_pageCtr.frame)+1)];
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
