//
//  SSUIiPadShareActionSheetViewController.h
//  ShareSDKUI
//
//  Created by 刘 靖煌 on 15/7/15.
//  Copyright (c) 2015年 mob. All rights reserved.
//

#import <UIKit/UIKit.h>
#import "SSUITypeDef.h"

/**
 *  iPad分享菜单
 */
@interface SSUIiPadShareActionSheetViewController : UIViewController<UIPopoverControllerDelegate>

@property (nonatomic, copy) SSUIShareActionSheetItemClickHandler clickHandle;
@property (nonatomic, copy) SSUIShareActionSheetCancelHandler cancelHandle;
@property (nonatomic, assign) NSInteger itemsCount;

- (instancetype)initWithItems:(NSArray *)items;

- (void)showInView:(UIView *)view;

@end
