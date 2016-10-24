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
#import "SSUIShareActionSheetStyle.h"
#import "SSUIEditorViewStyle.h"
#import "SSUIEditorViewStyle_Private.h"
#import <ShareSDKExtension/ShareSDK+Extension.h>
#import <ShareSDKConfigFile/ShareSDK+XML.h>
#import <ShareSDK/ShareSDK+Base.h>
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
    
    //过滤掉未安装客户端且依赖客户端分享的平台
    NSMutableArray *activePlatforms = [NSMutableArray arrayWithArray:[ShareSDK activePlatforms]];
    
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
    
    NSMutableArray *temPlatform = [NSMutableArray arrayWithArray:activePlatforms];
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
    
    if ([activePlatforms count] < 1)
    {
        NSError *error = [NSError errorWithDomain:SSDKErrorDomain
                                             code:SSDKErrorCodePlatformNotFound
                                         userInfo:@{@"error description ":NSLocalizedStringWithDefaultValue(@"NoValidPlatform", @"ShareSDKUI_Localizable", [NSBundle bundleWithPath:[[NSBundle mainBundle] pathForResource:@"ShareSDKUI" ofType:@"bundle"]], @"NoValidPlatform", nil)}];
        shareStateChangedHandler (SSDKResponseStateFail, SSDKPlatformTypeUnknown, nil, nil, error, YES);
    }
    
    [actionSheet onCancel:^{
        if (shareStateChangedHandler)
        {
            shareStateChangedHandler (SSDKResponseStateCancel, SSDKPlatformTypeUnknown, nil, nil, nil, YES);
        }
    }];
    
    [actionSheet onItemClick:^(NSInteger index, SSUIShareActionSheetItem *item)
    {
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
                [items enumerateObjectsUsingBlock:^(id obj, NSUInteger idx, BOOL *stop)
                {
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
            else if([otherPlatformTypes containsObject:[NSString stringWithFormat:@"%@",@(platItem.platformType)]])
            {
                //ANE,Unity情况下obj为NSString类型
                [otherPlatformTypes removeObject:[NSString stringWithFormat:@"%@",@(platItem.platformType)]];
            }
            
            //对微信和QQ、Kakao等包含多个平台的平台处理
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
            
            //易信
            if([directSharePlt containsObject:@(SSDKPlatformTypeYiXin)])
            {
                if (![directSharePlt containsObject:@(SSDKPlatformSubTypeYiXinSession)])
                {
                    [directSharePlt addObject:@(SSDKPlatformSubTypeYiXinSession)];
                }
                
                if (![directSharePlt containsObject:@(SSDKPlatformSubTypeYiXinTimeline)])
                {
                    [directSharePlt addObject:@(SSDKPlatformSubTypeYiXinTimeline)];
                }
                
                if (![directSharePlt containsObject:@(SSDKPlatformSubTypeYiXinFav)])
                {
                    [directSharePlt addObject:@(SSDKPlatformSubTypeYiXinFav)];
                }
            }
            
            if ([directSharePlt containsObject:@(SSDKPlatformTypeKakao)])
            {
                if (![directSharePlt containsObject:@(SSDKPlatformSubTypeKakaoTalk)])
                {
                    [directSharePlt addObject:@(SSDKPlatformSubTypeKakaoTalk)];
                }
                
                if (![directSharePlt containsObject:@(SSDKPlatformSubTypeKakaoStory)])
                {
                    [directSharePlt addObject:@(SSDKPlatformSubTypeKakaoStory)];
                }
                
                [directSharePlt removeObject:@(SSDKPlatformTypeKakao)];
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
                if (shareStateChangedHandler)
                {
                    shareStateChangedHandler (SSDKResponseStateBegin, platItem.platformType, nil, nil, nil, YES);
                }
                
                [ShareSDK share:platItem.platformType
                     parameters:shareParams
                 onStateChanged:^(SSDKResponseState state, NSDictionary *userData, SSDKContentEntity *contentEntity, NSError *error)
                {
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
    
    //判断是否有定制某平台分享参数，如有则编辑框显示的文字和图片替换为定制的
    NSString *customParamString = [NSString stringWithFormat:@"@platform(%lu)",(unsigned long)platformType];
    id customDict = [shareParams objectForKey:customParamString];
    BOOL didCustomShareParam = NO;
    if (customDict && [customDict isKindOfClass:[NSDictionary class]])
    {
        didCustomShareParam = YES;
        NSArray *customArray = [customDict objectForKey:@"images"];
        if (customArray && [customArray count] > 0)
        {
            image = customArray[0];
        }
        
        NSString *customStr = [customDict objectForKey:@"text"];
        if (customStr)
        {
            text = customStr;
        }
    }
    
    BOOL unSupportOneKeyShare = NO;
    NSMutableArray *unSupportOneKeySharePlatforms = [NSMutableArray arrayWithArray:@[@(SSDKPlatformTypeWechat),
                                                                                     @(SSDKPlatformTypeQQ),
                                                                                     @(SSDKPlatformSubTypeQQFriend),
                                                                                     @(SSDKPlatformSubTypeQZone),
                                                                                     @(SSDKPlatformSubTypeWechatSession),
                                                                                     @(SSDKPlatformSubTypeWechatTimeline),
                                                                                     @(SSDKPlatformSubTypeWechatFav),
                                                                                     @(SSDKPlatformTypeMail),
                                                                                     @(SSDKPlatformTypeSMS),
                                                                                     @(SSDKPlatformTypeCopy),
                                                                                     @(SSDKPlatformTypeGooglePlus),
                                                                                     @(SSDKPlatformTypeInstagram),
                                                                                     @(SSDKPlatformTypeWhatsApp),
                                                                                     @(SSDKPlatformTypeLine),
                                                                                     @(SSDKPlatformTypeKakao),
                                                                                     @(SSDKPlatformSubTypeKakaoTalk),
                                                                                     @(SSDKPlatformTypePinterest),
                                                                                     @(SSDKPlatformTypeAliPaySocial),
                                                                                     @(SSDKPlatformTypeAliPaySocialTimeline),
                                                                                     @(SSDKPlatformTypePrint),
                                                                                     @(SSDKPlatformTypeFacebookMessenger)
//                                                                                     ,@(SSDKPlatformTypeDingTalk)
                                                                                     ]];
    
    
    //如果平台为Facebook且分享类型为webPage时,FB不需要授权
    if (platformType == SSDKPlatformTypeFacebook)
    {
        static BOOL unSupport = NO;
        NSString *facebookKey = [NSString stringWithFormat:@"@platform(%lu)",(unsigned long)SSDKPlatformTypeFacebook];
        NSDictionary *facebookParams = [shareParams objectForKey:facebookKey];
        
        if (facebookParams)
        {
            if ([[facebookParams objectForKey:@"type"] integerValue] == SSDKContentTypeWebPage)
            {
                unSupport = YES;
            }
            else if ([[facebookParams objectForKey:@"type"] integerValue] == SSDKContentTypeAuto)
            {
                if ([facebookParams objectForKey:@"title"] && [facebookParams objectForKey:@"url"])
                {
                    unSupport = YES;
                }
            }
        }
        else
        {
            if ([[shareParams objectForKey:@"type"] integerValue] == SSDKContentTypeWebPage)
            {
                unSupport = YES;
            }
            else if ([[shareParams objectForKey:@"type"] integerValue] == SSDKContentTypeAuto)
            {
                if ([shareParams objectForKey:@"title"] && [shareParams objectForKey:@"url"])
                {
                    unSupport = YES;
                }
            }
        }
        
        if (unSupport)
        {
            [unSupportOneKeySharePlatforms addObject:@(SSDKPlatformTypeFacebook)];
            [[SSUIEditorViewStyle sharedInstance].unNeedAuthPlatforms addObject:@(SSDKPlatformTypeFacebook)];
        }
    }
    
    //如果平台为Sina且分享类型为webPage时(客户端分享),不需要授权
    if (platformType == SSDKPlatformTypeSinaWeibo)
    {
        if ([[shareParams objectForKey:@"@client_share"] boolValue])
        {
            [unSupportOneKeySharePlatforms addObject:@(SSDKPlatformTypeSinaWeibo)];
            [[SSUIEditorViewStyle sharedInstance].unNeedAuthPlatforms addObject:@(SSDKPlatformTypeSinaWeibo)];
        }
    }
    
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
    else if (platformType == SSDKPlatformTypeYiXin)
    {
        platformType = SSDKPlatformSubTypeYiXinSession;
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
                case SSDKPlatformTypeDouBan:
                case SSDKPlatformTypeRenren:
                case SSDKPlatformTypeKaixin:
                case SSDKPlatformTypeLinkedIn:
                case SSDKPlatformTypePocket:
                case SSDKPlatformTypeTumblr:
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
            if (didCustomShareParam)
            {
                //如果对某平台有定制参数
                NSMutableDictionary *customDict = [shareParams objectForKey:[NSString stringWithFormat:@"@platform(%lu)",(unsigned long)platformType]];
                [customDict setObject:content forKey:@"text"];
            }
        }
        else
        {
            [shareParams removeObjectForKey:@"text"];
            if (didCustomShareParam)
            {
                //如果对某平台有定制
                NSMutableDictionary *customDict = [shareParams objectForKey:[NSString stringWithFormat:@"@platform(%lu)",(unsigned long)platformType]];
                [customDict removeObjectForKey:@"text"];
            }
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

+ (SSUIShareActionSheetController *)showShareActionSheet:(UIView *)view
                                                   items:(NSArray *)items
                                             contentName:(NSString *)contentName
                                            customFields:(NSDictionary *)customFields
                                     onShareStateChanged:(SSUIShareStateChangedHandler)shareStateChangedHandler
{
    NSMutableDictionary *shareParams = [ShareSDK getShareParamsWithContentName:contentName customFields:customFields];
    
    if (shareParams && [[shareParams allKeys] count] > 0)
    {
        return [self showShareActionSheet:view
                                    items:items
                              shareParams:shareParams
                      onShareStateChanged:shareStateChangedHandler];
    }
    else
    {
        if (shareStateChangedHandler)
        {
            NSError *error = [NSError errorWithDomain:@"ShareWithXMLContent"
                                                 code:204
                                             userInfo:@{@"error_msg" : @"无效的分享内容"}];
            
            shareStateChangedHandler(SSDKResponseStateFail, SSDKPlatformTypeAny, nil, nil, error, YES);
        }
        
        return nil;
    }
}

+ (SSUIShareContentEditorViewController *)showShareEditor:(SSDKPlatformType)platformType
                                       otherPlatformTypes:(NSArray *)otherPlatformTypes
                                              contentName:(NSString *)contentName
                                             customFields:(NSDictionary *)customFields
                                      onShareStateChanged:(SSUIShareStateChangedHandler)shareStateChangedHandler
{
    NSMutableDictionary *shareParams = [ShareSDK getShareParamsWithContentName:contentName customFields:customFields];
    
    if (shareParams && [[shareParams allKeys] count] > 0)
    {
        return [self showShareEditor:platformType
                  otherPlatformTypes:otherPlatformTypes
                         shareParams:shareParams
                 onShareStateChanged:shareStateChangedHandler];
    }
    else
    {
        if (shareStateChangedHandler)
        {
            NSError *error = [NSError errorWithDomain:@"ShareWithXMLContent"
                                                 code:204
                                             userInfo:@{@"error_msg" : @"无效的分享内容"}];
            
            shareStateChangedHandler(SSDKResponseStateFail, platformType, nil, nil, error, YES);
        }

        return nil;
    }
}

+ (void)setSupportedInterfaceOrientation:(UIInterfaceOrientationMask)toInterfaceOrientation
{
    [SSUIShareActionSheetStyle setSupportedInterfaceOrientation:toInterfaceOrientation];
    [SSUIEditorViewStyle setSupportedInterfaceOrientation:toInterfaceOrientation];
}

@end
