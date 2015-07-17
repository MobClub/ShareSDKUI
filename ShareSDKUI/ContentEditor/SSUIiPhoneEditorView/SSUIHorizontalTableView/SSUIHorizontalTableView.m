//
//  CMHorizontalTableView.m
//  Common
//
//  Created by 冯 鸿杰 on 13-2-25.
//  Copyright (c) 2013年 掌淘科技. All rights reserved.
//

#import "SSUIHorizontalTableView.h"

#define ITEM_WIDTH 45.0

@interface SSUIHorizontalTableView (Private)

/**
 *	@brief	回收所有显示子项
 */
- (void)recoverAllVisibleItems;

/**
 *	@brief	回收子项
 *
 *	@param 	item 	子项对象
 */
- (void)recoverItem:(UIView<ISSUIHorizontalTableViewItem> *)item;

@end

@implementation SSUIHorizontalTableView

@synthesize dataSource = _dataSource;
@synthesize delegate = _delegate;
@synthesize itemWidth = _itemWidth;
@synthesize showsHorizontalScrollIndicator;

- (id)initWithFrame:(CGRect)frame
{
    self = [super initWithFrame:frame];
    if (self)
    {
        _contentView = [[UIScrollView alloc] initWithFrame:CGRectMake(0.0, 0.0, frame.size.width, frame.size.height)];
        _contentView.autoresizingMask = UIViewAutoresizingFlexibleHeight | UIViewAutoresizingFlexibleWidth;
        _contentView.delegate = self;
        _contentView.showsVerticalScrollIndicator = NO;
        [self addSubview:_contentView];
        
        _reuseItemDictionary = [[NSMutableDictionary alloc] init];
        _visibleItemArray = [[NSMutableArray alloc] init];
        _itemsMeasureArray = [[NSMutableArray alloc] init];
        _needLayout = YES;
        _itemWidth = ITEM_WIDTH;
    }
    return self;
}

- (void)setShowsHorizontalScrollIndicator:(BOOL)aShowsHorizontalScrollIndicator
{
    _contentView.showsHorizontalScrollIndicator = aShowsHorizontalScrollIndicator;
}

- (BOOL)showsHorizontalScrollIndicator
{
    return _contentView.showsHorizontalScrollIndicator;
}

- (void)layoutSubviews
{
    [super layoutSubviews];
    
    if (_needLayout)
    {
        _needLayout = NO;
        
        NSIndexPath *startIndex = nil;
        NSIndexPath *endIndex = nil;
        
        //获取列表项数量
        if (_dataSource)
        {
            _itemCount = [_dataSource itemNumberOfTableView:self];
        }
        else
        {
            _itemCount = 0;
        }
        
        //获取各个列表项宽度
        CGFloat totalWidth = 0;
        [_itemsMeasureArray removeAllObjects];
        for (int i = 0; i < _itemCount; i++)
        {
            NSIndexPath *indexPath = [NSIndexPath indexPathForRow:i inSection:0];
            CGFloat height = _itemWidth;
            if ([_delegate conformsToProtocol:@protocol(SSUIHorizontalTableViewDelegate)] &&
                [_delegate respondsToSelector:@selector(tableView:itemWidthForIndexPath:)])
            {
                height = [_delegate tableView:self itemWidthForIndexPath:indexPath];
            }
            
            [_itemsMeasureArray addObject:[NSArray arrayWithObjects:
                                          [NSNumber numberWithFloat:totalWidth],
                                          [NSNumber numberWithFloat:height],
                                          nil]];
            
            totalWidth += height;
            
            if (!startIndex && totalWidth > _contentView.contentOffset.x)
            {
                startIndex = [NSIndexPath indexPathForRow:i inSection:0];
            }
            else if(!endIndex && totalWidth > _contentView.contentOffset.x + self.frame.size.width)
            {
                endIndex = [NSIndexPath indexPathForRow:i inSection:9];
            }
        }
        
        if (endIndex == nil)
        {
            endIndex = [NSIndexPath indexPathForRow:_itemCount - 1 inSection:9];
        }
        
        //设置内容宽度
        _contentView.contentSize = CGSizeMake(totalWidth, self.frame.size.height);
        
        //回收所有显示子项
        [self recoverAllVisibleItems];
        
        //进行排版
        for (NSInteger i = startIndex.row; i <= endIndex.row; i++)
        {
            NSIndexPath *indexPath = [NSIndexPath indexPathForRow:i inSection:0];
            UIView<ISSUIHorizontalTableViewItem> *item = [_dataSource tableView:self itemForIndexPath:indexPath];
            item.indexPath = indexPath;
            
            NSArray *measure = [_itemsMeasureArray objectAtIndex:i];
            item.frame = CGRectMake([[measure objectAtIndex:0] floatValue], 0.0, [[measure objectAtIndex:1] floatValue], self.frame.size.height);
            [_contentView addSubview:item];
            [_visibleItemArray addObject:item];
        }
    }
    
}

- (void)setFrame:(CGRect)frame
{
    [super setFrame:frame];
    
    _needLayout = YES;
    [self setNeedsLayout];
}

- (void)reloadData
{
    _needLayout = YES;
    [self setNeedsLayout];
}

- (UIView<ISSUIHorizontalTableViewItem> *)dequeueReusableItemWithIdentifier:(NSString *)identifier
{
    NSMutableArray *itemArray = [_reuseItemDictionary objectForKey:identifier];
    if ([itemArray count] > 0)
    {
        //UIView<ISSUIHorizontalTableViewItem> *item = [[[itemArray lastObject] retain] autorelease];
        UIView<ISSUIHorizontalTableViewItem> *item = [itemArray lastObject];
        [itemArray removeLastObject];
        return item;
    }
    
    return nil;
}

#pragma mark - Private

- (void)recoverAllVisibleItems
{
    for (int i = 0; i < [_visibleItemArray count]; i++)
    {
        UIView<ISSUIHorizontalTableViewItem> *item = [_visibleItemArray objectAtIndex:i];
        [self recoverItem:item];
    }
    [_visibleItemArray removeAllObjects];
}

- (void)recoverItem:(UIView<ISSUIHorizontalTableViewItem> *)item
{
    NSMutableArray *itemArray = [_reuseItemDictionary objectForKey:[item reuseIdentifier]];
    if (!itemArray)
    {
        itemArray = [NSMutableArray array];
        [_reuseItemDictionary setObject:itemArray forKey:[item reuseIdentifier]];
    }
    
    [item removeFromSuperview];
    [itemArray addObject:item];
}

#pragma mark - UIScrollViewDelegate

- (void)scrollViewDidScroll:(UIScrollView *)scrollView
{
    NSIndexPath *prevStartIndexPath = nil;
    NSIndexPath *prevEndIndexPath = nil;
    NSIndexPath *startIndexPath = nil;
    NSIndexPath *endIndexPath = nil;
    UIView<ISSUIHorizontalTableViewItem> *item = nil;
    
    if ([_visibleItemArray count] > 0)
    {
        //取首个子项
        item = [_visibleItemArray objectAtIndex:0];
        prevStartIndexPath = item.indexPath;
        
        item = [_visibleItemArray lastObject];
        prevEndIndexPath = item.indexPath;
    }
    else
    {
        prevStartIndexPath = [NSIndexPath indexPathForRow:0 inSection:0];
        prevEndIndexPath = [NSIndexPath indexPathForRow:0 inSection:0];
    }
    
    if (_currX - scrollView.contentOffset.x > 0)
    {
        //向左
        BOOL hasMatch = NO;
        for (NSInteger i = prevStartIndexPath.row; i >= 0 && i < [_itemsMeasureArray count]; i--)
        {
            NSArray *measure = [_itemsMeasureArray objectAtIndex:i];
            CGFloat left = [[measure objectAtIndex:0] floatValue];
            if (left <= scrollView.contentOffset.x)
            {
                startIndexPath = [NSIndexPath indexPathForRow:i inSection:0];
                hasMatch = YES;
                break;
            }
        }
        
        if (!hasMatch)
        {
            startIndexPath = [NSIndexPath indexPathForRow:0 inSection:0];
        }
        
        hasMatch = NO;
        for (NSInteger i = prevEndIndexPath.row; i >= startIndexPath.row && i < [_itemsMeasureArray count]; i--)
        {
            NSArray *measure = [_itemsMeasureArray objectAtIndex:i];
            CGFloat left = [[measure objectAtIndex:0] floatValue];
            if (left < scrollView.contentOffset.x + self.frame.size.width)
            {
                endIndexPath = [NSIndexPath indexPathForRow:i inSection:0];
                hasMatch = YES;
                break;
            }
        }
        
        if (!hasMatch)
        {
            endIndexPath = startIndexPath;
        }
    }
    else
    {
        //向右
        BOOL hasMatch = NO;
        for (NSInteger i = prevStartIndexPath.row; i < _itemCount && i < [_itemsMeasureArray count]; i++)
        {
            NSArray *measure = [_itemsMeasureArray objectAtIndex:i];
            CGFloat left = [[measure objectAtIndex:0] floatValue];
            CGFloat width = [[measure objectAtIndex:1] floatValue];
            if (left + width > scrollView.contentOffset.x)
            {
                startIndexPath = [NSIndexPath indexPathForRow:i inSection:0];
                hasMatch = YES;
                break;
            }
        }
        
        if (!hasMatch)
        {
            startIndexPath = prevStartIndexPath;
        }
        
        hasMatch = NO;
        for (NSInteger i = prevEndIndexPath.row; i < _itemCount && [_itemsMeasureArray count]; i++)
        {
            NSArray *measure = [_itemsMeasureArray objectAtIndex:i];
            CGFloat left = [[measure objectAtIndex:0] floatValue];
            if (left >= scrollView.contentOffset.x + self.frame.size.width)
            {
                endIndexPath = [NSIndexPath indexPathForRow:i inSection:0];
                hasMatch = YES;
                break;
            }
        }
        
        if (!hasMatch)
        {
            endIndexPath = [NSIndexPath indexPathForRow:_itemCount - 1 inSection:0];
        }
    }
    
    //刷新列表排版
    NSMutableArray *newVisbleItems = [NSMutableArray array];
    for (NSInteger i = startIndexPath.row; i <= endIndexPath.row; i++)
    {
        BOOL bHasExists = NO;
        for (int j = 0; j < [_visibleItemArray count]; j++)
        {
            UIView<ISSUIHorizontalTableViewItem> *item = [_visibleItemArray objectAtIndex:j];
            if (item.indexPath.row == i)
            {
                [newVisbleItems addObject:item];
                bHasExists = YES;
                break;
            }
        }
        
        if (!bHasExists)
        {
            NSIndexPath *indexPath = [NSIndexPath indexPathForRow:i inSection:0];
            UIView<ISSUIHorizontalTableViewItem> *item = [_dataSource tableView:self itemForIndexPath:indexPath];
            
            item.indexPath = indexPath;
            
            NSArray *measure = [_itemsMeasureArray objectAtIndex:i];
            item.frame = CGRectMake([[measure objectAtIndex:0] floatValue], 0.0, [[measure objectAtIndex:1] floatValue], self.frame.size.height);
            
            if ([_delegate conformsToProtocol:@protocol(SSUIHorizontalTableViewDelegate)] &&
                [_delegate respondsToSelector:@selector(tableView:willDisplayItem:indexPath:)])
            {
                [_delegate tableView:self willDisplayItem:item indexPath:indexPath];
            }
            
            [_contentView addSubview:item];
            [newVisbleItems addObject:item];
        }
    }
    
    //回收视图
    for (int i = 0; i < [_visibleItemArray count]; i++)
    {
        UIView<ISSUIHorizontalTableViewItem> *item = [_visibleItemArray objectAtIndex:i];
        if (item.indexPath.row < startIndexPath.row || item.indexPath.row > endIndexPath.row)
        {
            [self recoverItem:item];
        }
    }
    [_visibleItemArray removeAllObjects];
    [_visibleItemArray addObjectsFromArray:newVisbleItems];
    
    _currX = scrollView.contentOffset.x;
}

@end
