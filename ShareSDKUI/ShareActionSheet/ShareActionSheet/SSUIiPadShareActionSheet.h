//
//  SSUIiPadShareActionSheet.h
//  ShareSDKUI
//
//  Created by 刘 靖煌 on 15/6/18.
//  Copyright (c) 2015年 mob. All rights reserved.
//

#import "SSUIBaseShareActionSheet.h"

/**
 *  iPad分享菜单
 */
@interface SSUIiPadShareActionSheet : SSUIBaseShareActionSheet <UIPopoverControllerDelegate>
{
    UIPopoverController *_popover;
    NSInteger _row;
}

- (instancetype)initWithItems:(NSArray *)items;

@end
