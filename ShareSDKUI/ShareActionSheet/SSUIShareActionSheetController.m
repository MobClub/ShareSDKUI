//
//  SSUIShareActionSheet.m
//  ShareSDKUI
//
//  Created by 刘 靖煌 on 15/6/18.
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
#import "SSUIShareActionSheetStyle.h"
#import "SSUIShareActionSheetStyle_Private.h"
#import "ShareSDK+SSUI.h"

@interface SSUIShareActionSheetController ()

@property (nonatomic, strong) SSUIBaseShareActionSheet *shareActionSheet;
@property (nonatomic, strong) SSUIShareActionSheetController *selfRef;

@end

@implementation SSUIShareActionSheetController

- (instancetype)initWithItems:(NSArray *)items
{
    self.directSharePlatforms = [NSMutableSet setWithObjects:
                                 @(SSDKPlatformTypeWechat),
                                 @(SSDKPlatformTypeQQ),
                                 @(SSDKPlatformTypeInstagram),
                                 @(SSDKPlatformTypeWhatsApp),
                                 @(SSDKPlatformTypeLine),
                                 @(SSDKPlatformSubTypeKakaoTalk),
                                 @(SSDKPlatformTypeAliPaySocial),
                                 @(SSDKPlatformTypeAliPaySocialTimeline),
                                 @(SSDKPlatformTypeFacebookMessenger),
                                 @(SSDKPlatformTypeYiXin),
//                                 @(SSDKPlatformTypeDingTalk),
                                 nil];
    
    NSMutableArray *activePlatforms = nil;
    if (!items)
    {
        activePlatforms = [NSMutableArray arrayWithArray:[ShareSDK activePlatforms]];
    }
    else
    {
        activePlatforms = [NSMutableArray arrayWithArray:items];
    }
    
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
    NSArray *platformsNeedClient = @[
                                     @(SSDKPlatformTypeWechat),
                                     @(SSDKPlatformSubTypeWechatSession),
                                     @(SSDKPlatformSubTypeWechatTimeline),
                                     @(SSDKPlatformSubTypeWechatFav),
                                     @(SSDKPlatformTypeQQ),
                                     @(SSDKPlatformSubTypeQZone),
                                     @(SSDKPlatformSubTypeQQFriend),
                                     @(SSDKPlatformTypeInstagram),
                                     @(SSDKPlatformTypeWhatsApp),
                                     @(SSDKPlatformTypeLine),
                                     @(SSDKPlatformTypeKakao),
                                     @(SSDKPlatformSubTypeKakaoTalk),
                                     @(SSDKPlatformTypePinterest),
                                     @(SSDKPlatformTypeAliPaySocial),
                                     @(SSDKPlatformTypeAliPaySocialTimeline),
                                     @(SSDKPlatformTypeFacebookMessenger)
//                                     ,@(SSDKPlatformTypeDingTalk)
                                     ];
    [temPlatform enumerateObjectsUsingBlock:^(id obj, NSUInteger idx, BOOL *stop)
     {
         if ([obj isKindOfClass:[NSNumber class]])
         {
             if ([platformsNeedClient containsObject:obj])
             {
                 if ([obj isEqual:@(SSDKPlatformSubTypeQZone)])
                 {
                     if (![ShareSDK isClientInstalled:(SSDKPlatformSubTypeQQFriend)])
                     {
                         [activePlatforms removeObject:@(SSDKPlatformSubTypeQZone)];
                     }
                 }
                 else if (![ShareSDK isClientInstalled:[obj integerValue]])
                 {
                     [activePlatforms removeObject:obj];
                 }
             }
         }
     }];
    
    //对微信和QQ、Kakao等包含多个平台的平台处理
    if ([activePlatforms containsObject:@(SSDKPlatformTypeWechat)])
    {
        if (![activePlatforms containsObject:@(SSDKPlatformSubTypeWechatSession)])
        {
            [activePlatforms insertObject:@(SSDKPlatformSubTypeWechatSession) atIndex:[activePlatforms indexOfObject:@(SSDKPlatformTypeWechat)]];
        }
        
        if (![activePlatforms containsObject:@(SSDKPlatformSubTypeWechatTimeline)])
        {
            [activePlatforms insertObject:@(SSDKPlatformSubTypeWechatTimeline) atIndex:[activePlatforms indexOfObject:@(SSDKPlatformTypeWechat)]];
        }
        
        if (![activePlatforms containsObject:@(SSDKPlatformSubTypeWechatFav)])
        {
            [activePlatforms insertObject:@(SSDKPlatformSubTypeWechatFav) atIndex:[activePlatforms indexOfObject:@(SSDKPlatformTypeWechat)]];
        }
        
        [activePlatforms removeObject:@(SSDKPlatformTypeWechat)];
    }
    
    if ([activePlatforms containsObject:@(SSDKPlatformTypeKakao)])
    {
        if (![activePlatforms containsObject:@(SSDKPlatformSubTypeKakaoStory)])
        {
            [activePlatforms insertObject:@(SSDKPlatformSubTypeKakaoStory) atIndex:[activePlatforms indexOfObject:@(SSDKPlatformTypeKakao)]];
        }
        
        if (![activePlatforms containsObject:@(SSDKPlatformSubTypeKakaoTalk)])
        {
            [activePlatforms insertObject:@(SSDKPlatformSubTypeKakaoTalk) atIndex:[activePlatforms indexOfObject:@(SSDKPlatformTypeKakao)]];
        }
        
        [activePlatforms removeObject:@(SSDKPlatformTypeKakao)];
    }
    
    if ([activePlatforms containsObject:@(SSDKPlatformTypeQQ)])
    {
        if (![activePlatforms containsObject:@(SSDKPlatformSubTypeQQFriend)])
        {
            [activePlatforms insertObject:@(SSDKPlatformSubTypeQQFriend) atIndex:[activePlatforms indexOfObject:@(SSDKPlatformTypeQQ)]];
        }
        
        if (![activePlatforms containsObject:@(SSDKPlatformSubTypeQZone)])
        {
            [activePlatforms insertObject:@(SSDKPlatformSubTypeQZone) atIndex:[activePlatforms indexOfObject:@(SSDKPlatformTypeQQ)]];
        }

        [activePlatforms removeObject:@(SSDKPlatformTypeQQ)];
    }
    
    if ([activePlatforms containsObject:@(SSDKPlatformTypeYiXin)])
    {
        if (![activePlatforms containsObject:@(SSDKPlatformSubTypeYiXinFav)])
        {
            [activePlatforms addObject:@(SSDKPlatformSubTypeYiXinFav)];
        }
        
        if (![activePlatforms containsObject:@(SSDKPlatformSubTypeYiXinSession)])
        {
            [activePlatforms addObject:@(SSDKPlatformSubTypeYiXinSession)];
        }
        
        if (![activePlatforms containsObject:@(SSDKPlatformSubTypeYiXinTimeline)])
        {
            [activePlatforms addObject:@(SSDKPlatformSubTypeYiXinTimeline)];
        }
        
        [activePlatforms removeObject:@(SSDKPlatformTypeYiXin)];
    }
    
    //过滤菜单列表，如没有集成平台
    NSMutableArray *showActivePlatforms = [NSMutableArray array];
    NSMutableArray *actionSheetItems = [NSMutableArray array];
    
    [activePlatforms enumerateObjectsUsingBlock:^(id obj, NSUInteger idx, BOOL *stop) {
        
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
        else if ([obj isKindOfClass:[NSString class]])
        {
            //ANE、Unity情况下obj为NSString类型
            if ([activePlatforms containsObject:obj])
            {
                [showActivePlatforms addObject:obj];
                
                [actionSheetItems addObject:[SSUIShareActionSheetItem itemWithPlatformType:[obj integerValue]]];
            }
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
