//
//  ShareSDK+SSUI.m
//  ShareSDKUI
//
//  Created by fenghj on 15/6/18.
//  Copyright (c) 2015年 mob. All rights reserved.
//

#import "ShareSDK+SSUI.h"
#import "ShareSDKUI.h"
#import "SSUIShareActionSheetPlatformItem.h"
#import "SSUIShareActionSheetCustomItem.h"
#import <ShareSDK/ShareSDK+Base.h>
#import "SSUIShareActionSheetStyle.h"
#import "SSUIEditorViewStyle.h"
#import <ShareSDKExtension/ShareSDK+Extension.h>

/**
 *  错误域
 */
extern NSString *const SSDKErrorDomain;

/**
 *  无任何平台
 */
extern const NSInteger SSDKErrorCodePlatformNotFound;

@implementation ShareSDK (SSUI)

+ (SSUIShareActionSheetController *)showShareActionSheet:(UIView *)view
                                                   items:(NSArray *)items
                                             shareParams:(NSMutableDictionary *)shareParams
                                     onShareStateChanged:(SSUIShareStateChangedHandler)shareStateChangedHandler
{
    SSUIShareActionSheetController *actionSheet = [ShareSDKUI shareActionSheetWithItems:items];
    __block NSMutableSet *directSharePlt = actionSheet.directSharePlatforms;
    
    NSMutableArray *activePlatforms = [NSMutableArray arrayWithArray:[ShareSDK activePlatforms]];
    
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
                 [obj isEqual: @(SSDKPlatformSubTypeQQFriend)] ||
                 [obj isEqual: @(SSDKPlatformTypeInstagram)])
             {
                 if (![ShareSDK isClientInstalled:[obj integerValue]])
                 {
                     [activePlatforms removeObject:obj];
                 }
             }
         }
     }];
    
    if ([activePlatforms count] < 1)
    {
        NSError *error = [NSError errorWithDomain:SSDKErrorDomain
                                             code:SSDKErrorCodePlatformNotFound
                                         userInfo:@{@"error description ":@" There is no valid platform to show . the reason may be that the active platform need app client to share and the ios device do not have one."}];
        shareStateChangedHandler (SSDKResponseStateFail, SSDKPlatformTypeUnknown, nil, nil, error, YES);
    }
    
    [actionSheet onCancel:^{
        if (shareStateChangedHandler)
        {
            shareStateChangedHandler (SSDKResponseStateCancel, SSDKPlatformTypeUnknown, nil, nil, nil, YES);
        }
    }];
    
    [actionSheet onItemClick:^(NSInteger index, SSUIShareActionSheetItem *item) {
        
        if ([item isKindOfClass:[SSUIShareActionSheetPlatformItem class]])
        {
            //获取一个平台类型列表，用于传入editor中的otherPlatformTypes中
            NSMutableArray *otherPlatformTypes = [NSMutableArray array];
            
            NSArray *activePlatforms = [ShareSDK activePlatforms];
            if (!items)
            {
                [otherPlatformTypes addObjectsFromArray:activePlatforms];
            }
            else
            {
                [items enumerateObjectsUsingBlock:^(id obj, NSUInteger idx, BOOL *stop) {
                    
                    if ([obj isKindOfClass:[NSNumber class]])
                    {
                        if ([activePlatforms containsObject:obj])
                        {
                            [otherPlatformTypes addObject:obj];
                        }
                    }
                }];
            }

            SSUIShareActionSheetPlatformItem *platItem = (SSUIShareActionSheetPlatformItem *)item;
            //构造其他平台列表
            if ([otherPlatformTypes containsObject:@(platItem.platformType)])
            {
                [otherPlatformTypes removeObject:@(platItem.platformType)];
            }
            
            //对微信和QQ等包含多个平台的平台处理
            if ([directSharePlt containsObject:@(SSDKPlatformTypeWechat)])
            {
                if (![directSharePlt containsObject:@(SSDKPlatformSubTypeWechatSession)])
                {
                    [directSharePlt addObject:@(SSDKPlatformSubTypeWechatSession)];
                }
                
                if (![directSharePlt containsObject:@(SSDKPlatformSubTypeWechatTimeline)]) {
                    [directSharePlt addObject:@(SSDKPlatformSubTypeWechatTimeline)];
                }
                
                if (![directSharePlt containsObject:@(SSDKPlatformSubTypeWechatFav)]) {
                    [directSharePlt addObject:@(SSDKPlatformSubTypeWechatFav)];
                }
                
                [directSharePlt removeObject:@(SSDKPlatformTypeWechat)];
            }
            
            if ([directSharePlt containsObject:@(SSDKPlatformTypeQQ)])
            {
                if (![directSharePlt containsObject:@(SSDKPlatformSubTypeQZone)]) {
                    [directSharePlt addObject:@(SSDKPlatformSubTypeQZone)];
                }
                
                if (![directSharePlt containsObject:@(SSDKPlatformSubTypeQQFriend)]) {
                    [directSharePlt addObject:@(SSDKPlatformSubTypeQQFriend)];
                }
                
                [directSharePlt removeObject:@(SSDKPlatformTypeQQ)];
            }
            
            if ([directSharePlt containsObject:@(platItem.platformType)])
            {
                [ShareSDK share:platItem.platformType
                     parameters:shareParams
                 onStateChanged:^(SSDKResponseState state, NSDictionary *userData, SSDKContentEntity *contentEntity, NSError *error) {
                     
                     if (shareStateChangedHandler)
                     {
                         shareStateChangedHandler (state, platItem.platformType, userData, contentEntity, error, YES);
                     }
                 }];
            }
            else
            {
                //显示内容编辑视图
                [self showShareEditor:platItem.platformType
                   otherPlatformTypes:otherPlatformTypes
                          shareParams:shareParams
                  onShareStateChanged:shareStateChangedHandler];
            }
        }
        else if ([item isKindOfClass:[SSUIShareActionSheetCustomItem class]])
        {
            //触发自定义点击事件
            [(SSUIShareActionSheetCustomItem *)item triggerClick];
        }
    }];
    
    [actionSheet showInView:view];

    return actionSheet;
}

+ (SSUIShareContentEditorViewController *)showShareEditor:(SSDKPlatformType)platformType
                                       otherPlatformTypes:(NSArray *)otherPlatformTypes
                                              shareParams:(NSMutableDictionary *)shareParams
                                      onShareStateChanged:(SSUIShareStateChangedHandler)shareStateChangedHandler
{
    
    NSString *text = [shareParams objectForKey:@"text"];
    SSDKImage *image = nil;
    NSArray *images = [shareParams objectForKey:@"images"];
    
    if (images.count > 0)
    {
        image = images [0];
    }
    
    BOOL unSupportOneKeyShare = NO;
    NSArray* unSupportOneKeySharePlatforms = @[@(SSDKPlatformTypeWechat),
                                               @(SSDKPlatformTypeQQ),
                                               @(SSDKPlatformSubTypeQQFriend),
                                               @(SSDKPlatformSubTypeQZone),
                                               @(SSDKPlatformSubTypeWechatSession),
                                               @(SSDKPlatformSubTypeWechatTimeline),
                                               @(SSDKPlatformSubTypeWechatFav),
                                               @(SSDKPlatformTypeMail),
                                               @(SSDKPlatformTypeSMS),
                                               @(SSDKPlatformTypeCopy),
                                               @(SSDKPlatformTypeGooglePlus)
                                               ];

    if ([unSupportOneKeySharePlatforms containsObject:@(platformType)])
    {
        unSupportOneKeyShare = YES;
    }
 
    NSMutableArray *platforms = [NSMutableArray array];
    if (platformType == SSDKPlatformTypeWechat)
    {
        //如果设置微信类型，则默认使用微信好友分享
        platformType = SSDKPlatformSubTypeWechatSession;
    }
    else if (platformType == SSDKPlatformTypeQQ)
    {
        //如果设置QQ类型，则默认使用QQ好友分享
        platformType = SSDKPlatformSubTypeQQFriend;
    }

    if (otherPlatformTypes && !unSupportOneKeyShare)
    {
        [otherPlatformTypes enumerateObjectsUsingBlock:^(NSNumber *platformNum, NSUInteger idx, BOOL *stop) {
            
            SSDKPlatformType type = [platformNum integerValue];
            switch (type)
            {
                case SSDKPlatformTypeSinaWeibo:
                case SSDKPlatformTypeTencentWeibo:
                case SSDKPlatformTypeFacebook:
                case SSDKPlatformTypeTwitter:
                    [platforms addObject:platformNum];
                    break;
                default:
                    break;
            }
        }];
    }

    NSMutableArray *plats = [NSMutableArray arrayWithObject:@(platformType)];
    [plats addObjectsFromArray:platforms];
    SSUIShareContentEditorViewController *vc = [[SSUIShareContentEditorViewController alloc] initWithContent:text
                                                                                                       image:image
                                                                                               platformTypes:plats];
    [vc show];
    [vc onCancel:^{
        
        if (shareStateChangedHandler)
        {
            shareStateChangedHandler (SSDKResponseStateCancel, [[plats objectAtIndex:0] integerValue], nil, nil, nil, YES);
        }
    }];
    
    [vc onSubmit:^(NSArray *platforms, NSString *content, SSDKImage *image) {
        
        //修改分享参数
        if (content)
        {
            [shareParams setObject:content forKey:@"text"];
        }
        else
        {
            [shareParams removeObjectForKey:@"text"];
        }
        
        NSMutableArray *images = [[shareParams objectForKey:@"images"] mutableCopy];
        
        if (image)
        {
            if (images)
            {
                [images replaceObjectAtIndex:0 withObject:image];
            }
            else
            {
                [images addObject:image];
            }
        }
        else
        {
            if (images.count > 0)
            {
                [images removeObjectAtIndex:0];
            }
        }
        
        NSURL* url = [shareParams objectForKey:@"url"];
        NSString* title = [shareParams objectForKey:@"title"];
        SSDKContentType contentType = [[shareParams objectForKey:@"type"] integerValue];
        [shareParams SSDKSetupShareParamsByText:content images:images url:url title:title type:contentType];
        
        //进行分享
        __block NSInteger completedCount = 0;
        [platforms enumerateObjectsUsingBlock:^(NSNumber *platform, NSUInteger idx, BOOL *stop) {
            
            SSDKPlatformType platformType = [platform integerValue];
            
            //派发开始分享状态
            if (shareStateChangedHandler)
            {
                shareStateChangedHandler (SSDKResponseStateBegin, platformType, nil, nil, nil, NO);
            }
            
            [ShareSDK share:platformType
                 parameters:shareParams
             onStateChanged:^(SSDKResponseState state, NSDictionary *userData, SSDKContentEntity *contentEntity, NSError *error) {
                 
                 completedCount ++;
                 if (shareStateChangedHandler)
                 {
                     shareStateChangedHandler (state, platformType, userData, contentEntity, error, platforms.count == completedCount);
                 }
             }];
        }];
    }];
    return vc;
}

+ (void)setSupportedInterfaceOrientation:(UIInterfaceOrientationMask)toInterfaceOrientation
{
    [SSUIShareActionSheetStyle setSupportedInterfaceOrientation:toInterfaceOrientation];
    [SSUIEditorViewStyle setSupportedInterfaceOrientation:toInterfaceOrientation];
}

@end
