//
//  SSUIShareActionSheet.m
//  ShareSDKUI
//
//  Created by fenghj on 15/6/18.
//  Copyright (c) 2015年 mob. All rights reserved.
//

#import "SSUIShareActionSheetController.h"
#import "SSUIShareActionSheetItem.h"
#import "SSUIShareActionSheetPlatformItem.h"
#import "SSUIShareActionSheetCustomItem.h"
#import "SSUIBaseShareActionSheet.h"
#import "SSUIiPhoneShareActionSheet.h"
#import "SSUIiPadShareActionSheet.h"
#import <ShareSDK/ShareSDK+Base.h>
#import <MOBFoundation/MOBFoundation.h>

@interface SSUIShareActionSheetController ()

/**
 *  分享菜单对象
 */
@property (nonatomic, strong) SSUIBaseShareActionSheet *shareActionSheet;

@end

@implementation SSUIShareActionSheetController

- (instancetype)initWithItems:(NSArray *)items
{
    NSArray *activePlatforms = [ShareSDK activePlatforms];
    if (!items)
    {
        items = activePlatforms;
    }
    
    //过滤菜单列表，如没有集成平台
    NSMutableArray *showActivePlatforms = [NSMutableArray array];
    NSMutableArray *actionSheetItems = [NSMutableArray array];
    [items enumerateObjectsUsingBlock:^(id obj, NSUInteger idx, BOOL *stop) {
        
        if ([obj isKindOfClass:[NSNumber class]])
        {
            if ([activePlatforms containsObject:obj])
            {
                [showActivePlatforms addObject:obj];
                [actionSheetItems addObject:[SSUIShareActionSheetItem itemWithPlatformType:[obj integerValue]]];
            }
        }
        else if ([obj isKindOfClass:[SSUIShareActionSheetPlatformItem class]])
        {
            SSDKPlatformType platformType = ((SSUIShareActionSheetPlatformItem *)obj).platformType;
            if ([activePlatforms containsObject:@(platformType)])
            {
                [showActivePlatforms addObject:@(platformType)];
                [actionSheetItems addObject:obj];
            }
        }
        else if ([obj isKindOfClass:[SSUIShareActionSheetItem class]])
        {
            [actionSheetItems addObject:obj];
        }
        
    }];
    
    if (actionSheetItems.count == 0)
    {
        return nil;
    }
    
    if (self = [super init])
    {
        if ([MOBFDevice isPad])
        {
            //iPad
            self.shareActionSheet = [[SSUIiPadShareActionSheet alloc] initWithItems:actionSheetItems];
        }
        else
        {
            //iPhone
            self.shareActionSheet = [[SSUIiPhoneShareActionSheet alloc] initWithItems:actionSheetItems];
        }
        
    }
    
    return nil;
}

- (void)showInView:(UIView *)view
{
    [self.shareActionSheet showInView:view];
}

- (void)dismiss
{
    [self.shareActionSheet dismiss];
}

- (void)onItemClick:(SSUIShareActionSheetItemClickHandler)itemClickHandler
{
    [self.shareActionSheet onItemClick:itemClickHandler];
}

- (void)onCancel:(SSUIShareActionSheetCancelHandler)cancelHandler
{
    [self.shareActionSheet onCancel:cancelHandler];
}

@end
