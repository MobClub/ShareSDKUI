//
//  SSUIShareActionSheet.h
//  ShareSDKUI
//
//  Created by fenghj on 15/6/18.
//  Copyright (c) 2015年 mob. All rights reserved.
//

#import <UIKit/UIKit.h>
#import "ISSUIHorizontalTableViewItem.h"

@class SSUIHorizontalTableView;

///#begin zh-cn
/**
 *	@brief	水平排版表格数据源
 */
///#end
///#begin en
/**
 *	@brief	Horizontal table view data source.
 */
///#end
@protocol SSUIHorizontalTableViewDataSource <NSObject>

@required

///#begin zh-cn
/**
 *	@brief	返回表格的列表项数量
 *
 *	@param 	tableView 	表格视图
 *
 *	@return	列表项数量
 */
///#end
///#begin en
/**
 *	@brief	Return items count.
 *
 *	@param 	tableView 	Table view object.
 *
 *	@return	item number of table view.
 */
///#end
- (NSInteger)itemNumberOfTableView:(SSUIHorizontalTableView *)tableView;

///#begin zh-cn
/**
 *	@brief	返回列表项视图
 *
 *	@param 	tableView 	表格视图
 *	@param 	indexPath 	索引位置
 *
 *	@return	列表项视图
 */
///#end
///#begin en
/**
 *	@brief	Return a table view item.
 *
 *	@param 	tableView 	Table view object.
 *	@param 	indexPath 	Index path.
 *
 *	@return	Item object.
 */
///#end
- (UIView<ISSUIHorizontalTableViewItem> *)tableView:(SSUIHorizontalTableView *)tableView itemForIndexPath:(NSIndexPath *)indexPath;

@end

///#begin zh-cn
/**
 *	@brief	水平排版表格委托
 */
///#end
///#begin en
/**
 *	@brief	Horizontal table view delegate.
 */
///#end
@protocol SSUIHorizontalTableViewDelegate <NSObject>

@optional

///#begin zh-cn
/**
 *	@brief	返回列表项宽度
 *
 *	@param 	tableView 	表格视图
 *	@param 	indexPath 	索引位置
 *
 *	@return	列表项宽度
 */
///#end
///#begin en
/**
 *	@brief	Get item width.
 *
 *	@param 	tableView 	Table view object.
 *	@param 	indexPath 	Index path.
 *
 *	@return	Item width.
 */
///#end
- (CGFloat)tableView:(SSUIHorizontalTableView *)tableView itemWidthForIndexPath:(NSIndexPath *)indexPath;

///#begin zh-cn
/**
 *	@brief	子项将要显示
 *
 *	@param 	tableView 	表格视图
 *  @param  item    子项视图
 *	@param 	indexPath 	索引位置
 */
///#end
///#begin en
/**
 *	@brief	item will display
 *
 *	@param 	tableView 	Table view object.
 *  @param  item    Item view.
 *	@param 	indexPath 	Index path.
 */
///#end
- (void)tableView:(SSUIHorizontalTableView *)tableView
  willDisplayItem:(UIView<ISSUIHorizontalTableViewItem> *)item
        indexPath:(NSIndexPath *)indexPath;


@end

///#begin zh-cn
/**
 *	@brief	水平排版表格
 */
///#end
///#begin en
/**
 *	@brief	Horizontal Table View
 */
///#end
@interface SSUIHorizontalTableView : UIView <UIScrollViewDelegate>
{
@private
    NSMutableDictionary *_reuseItemDictionary;
    NSMutableArray *_visibleItemArray;
    
    __unsafe_unretained id<SSUIHorizontalTableViewDataSource> _dataSource;
    __unsafe_unretained id<SSUIHorizontalTableViewDelegate> _delegate;
    NSMutableArray *_itemsMeasureArray;
    BOOL _needLayout;
    NSInteger _itemCount;
    CGFloat _itemWidth;
    CGFloat _currX;
    
    UIScrollView *_contentView;
}

///#begin zh-cn
/**
 *	@brief	数据源
 */
///#end
///#begin en
/**
 *	@brief	Data source.
 */
///#end
@property (nonatomic,assign) id<SSUIHorizontalTableViewDataSource> dataSource;

///#begin zh-cn
/**
 *	@brief	委托
 */
///#end
///#begin en
/**
 *	@brief	Delegate object.
 */
///#end
@property (nonatomic,assign) id<SSUIHorizontalTableViewDelegate> delegate;

///#begin zh-cn
/**
 *	@brief	列表项宽度
 */
///#end
///#begin en
/**
 *	@brief	Item width.
 */
///#end
@property (nonatomic) CGFloat itemWidth;

///#begin zh-cn
/**
 *	@brief	显示水平方向滚动条
 */
///#end
///#begin en
/**
 *	@brief	Show horizontal scroll indicator.
 */
///#end
@property (nonatomic) BOOL showsHorizontalScrollIndicator;

///#begin zh-cn
/**
 *	@brief	重新刷新数据
 */
///#end
///#begin en
/**
 *	@brief	Reload data.
 */
///#end
- (void)reloadData;

///#begin zh-cn
/**
 *	@brief	根据标识值获取可用的子项视图
 *
 *	@param 	identifier 	复用标识
 *
 *	@return	子项视图对象
 */
///#end
///#begin en
/**
 *	@brief	Dequeue a reusable item.
 *
 *	@param 	identifier 	Item identifier.
 *
 *	@return	Item object.
 */
///#end
- (UIView<ISSUIHorizontalTableViewItem> *)dequeueReusableItemWithIdentifier:(NSString *)identifier;



@end
