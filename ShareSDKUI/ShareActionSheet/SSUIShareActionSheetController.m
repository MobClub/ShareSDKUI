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
#import <ShareSDKExtension/ShareSDK+Extension.h>

@interface SSUIShareActionSheetController ()

@property (nonatomic, strong) SSUIBaseShareActionSheet *shareActionSheet;
@property (nonatomic, strong) SSUIShareActionSheetController *selfRef;

@end

@implementation SSUIShareActionSheetController

- (instancetype)initWithItems:(NSArray *)items
{
    self.directSharePlatforms = [NSMutableSet setWithObjects:@(SSDKPlatformTypeWechat),@(SSDKPlatformTypeQQ),nil];
    
    NSMutableArray *activePlatforms = [NSMutableArray arrayWithArray:[ShareSDK activePlatforms]];
    
    //过滤掉未知和任意2个平台
    if ([activePlatforms containsObject:@(SSDKPlatformTypeAny)])
    {
        [activePlatforms removeObject:@(SSDKPlatformTypeAny)];
    }
    
    if ([activePlatforms containsObject:@(SSDKPlatformTypeUnknown)])
    {
        [activePlatforms removeObject:@(SSDKPlatformTypeUnknown)];
    }
    
    //过滤掉未安装客户端且依赖客户端分享的平台
    NSMutableArray *temPlatform = [NSMutableArray arrayWithArray:activePlatforms];
    [temPlatform enumerateObjectsUsingBlock:^(id obj, NSUInteger idx, BOOL *stop)
     {
         if ([obj isKindOfClass:[NSNumber class]])
         {
             if ([obj isEqual: @(SSDKPlatformTypeWechat)] ||
                 [obj isEqual: @(SSDKPlatformSubTypeWechatSession)]||
                 [obj isEqual: @(SSDKPlatformSubTypeWechatTimeline)]||
                 [obj isEqual: @(SSDKPlatformSubTypeWechatFav)] ||
                 [obj isEqual: @(SSDKPlatformTypeQQ)] ||
                 [obj isEqual: @(SSDKPlatformSubTypeQZone)] ||
                 [obj isEqual: @(SSDKPlatformSubTypeQQFriend)])
             {
                 if (![ShareSDK isClientInstalled:[obj integerValue]])
                 {
                     [activePlatforms removeObject:obj];
                 }
             }
         }
     }];
    
    //对微信和QQ等包含多个平台的平台处理
    if ([activePlatforms containsObject:@(SSDKPlatformTypeWechat)])
    {
        if (![activePlatforms containsObject:@(SSDKPlatformSubTypeWechatSession)])
        {
            [activePlatforms addObject:@(SSDKPlatformSubTypeWechatSession)];
        }

        if (![activePlatforms containsObject:@(SSDKPlatformSubTypeWechatTimeline)]) {
            [activePlatforms addObject:@(SSDKPlatformSubTypeWechatTimeline)];
        }
        
        if (![activePlatforms containsObject:@(SSDKPlatformSubTypeWechatFav)]) {
            [activePlatforms addObject:@(SSDKPlatformSubTypeWechatFav)];
        }
        
        [activePlatforms removeObject:@(SSDKPlatformTypeWechat)];
    }
    
    if ([activePlatforms containsObject:@(SSDKPlatformTypeQQ)])
    {
        if (![activePlatforms containsObject:@(SSDKPlatformSubTypeQZone)]) {
            [activePlatforms addObject:@(SSDKPlatformSubTypeQZone)];
        }
        
        if (![activePlatforms containsObject:@(SSDKPlatformSubTypeQQFriend)]) {
            [activePlatforms addObject:@(SSDKPlatformSubTypeQQFriend)];
        }
        
        [activePlatforms removeObject:@(SSDKPlatformTypeQQ)];
    }

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
    
    return self;
}

- (void)showInView:(UIView *)view
{
    self.selfRef = self;
    [self.shareActionSheet showInView:view];
}

- (void)dismiss
{
    self.selfRef = nil;
    [self.shareActionSheet dismiss];
}

- (void)onItemClick:(SSUIShareActionSheetItemClickHandler)itemClickHandler
{
    __weak SSUIShareActionSheetController *theController = self;
    
    [self.shareActionSheet onItemClick:^(NSInteger index, SSUIShareActionSheetItem *item) {
        
        if (itemClickHandler)
        {
            itemClickHandler (index, item);
        }
        
        [theController dismiss];
    }];
}

- (void)onCancel:(SSUIShareActionSheetCancelHandler)cancelHandler
{
    __weak SSUIShareActionSheetController *theController = self;
    
    [self.shareActionSheet onCancel:^{
        if (cancelHandler)
        {
            cancelHandler ();
        }
        
        [theController dismiss];
    }];
}

@end
