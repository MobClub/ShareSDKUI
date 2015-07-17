//
//  SSUIiPadShareActionSheetViewController.h
//  ShareSDKUI
//
//  Created by 刘靖煌 on 15/7/15.
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

- (instancetype)initWithItems:(NSArray *)items;

- (void)showInView:(UIView *)view;

@end
