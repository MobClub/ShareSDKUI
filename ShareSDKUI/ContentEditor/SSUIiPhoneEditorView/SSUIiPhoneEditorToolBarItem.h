//
//  SSUIiPhoneEditorToolBarItem.h
//  ShareSDKUI
//
//  Created by chenjd on 15/7/6.
//  Copyright (c) 2015年 mob. All rights reserved.
//

#import "SSUIHorizontalTableViewItem.h"

@class SSUIHorizontalTableViewItem;

/**
 *	@brief	分享平台项协议
 */
@protocol SSUIHorizontalTableViewItemDelegate <NSObject>


/**
 *	@brief	分享项点击
 *
 *	@param 	item 	分享项对象
 */
- (void)itemOnClick:(SSUIHorizontalTableViewItem *)itemView;

@end


@interface SSUIiPhoneEditorToolBarItem : SSUIHorizontalTableViewItem

{
@private
    UIImageView *_iconView;
    NSMutableDictionary *_data;
    BOOL _needLayout;
    id<SSUIHorizontalTableViewItemDelegate> __unsafe_unretained _delegate;
}

/**
 *	@brief	委托对象
 */
@property (nonatomic,assign) id<SSUIHorizontalTableViewItemDelegate> delegate;

/**
 *	@brief	分享项数据
 */
@property (nonatomic, retain) NSMutableDictionary *data;

/**
 *	@brief	初始化分享列表项
 *
 *	@param 	reuseIdentifier 	复用标识
 *
 *	@return	分享列表项
 */
- (id)initWithReuseIdentifier:(NSString *)reuseIdentifier;


@end
