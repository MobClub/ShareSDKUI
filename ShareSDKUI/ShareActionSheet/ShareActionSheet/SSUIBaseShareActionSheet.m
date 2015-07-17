//
//  SSUIBaseShareActionSheet.m
//  ShareSDKUI
//
//  Created by fenghj on 15/6/18.
//  Copyright (c) 2015年 mob. All rights reserved.
//

#import "SSUIBaseShareActionSheet.h"
#import "SSUIBaseShareActionSheet_Private.h"

@implementation SSUIBaseShareActionSheet

- (instancetype)initWithItems:(NSArray *)items
{
    if (self = [super init])
    {
        self.items = items;
    }
    
    return self;
}

- (void)showInView:(UIView *)view
{
    //子类重写
}

- (void)dismiss
{
    //子类重写
}

- (void)onItemClick:(SSUIShareActionSheetItemClickHandler)itemClickHandler
{
    self.itemClickHandler = itemClickHandler;
}

- (void)onCancel:(SSUIShareActionSheetCancelHandler)cancelHandler
{
    self.cancelHandler = cancelHandler;
}

@end
