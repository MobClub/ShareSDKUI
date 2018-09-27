//
//  SSUIHelper.m
//  ShareSDKUI
//
//  Created by Max on 2018/4/9.
//  Copyright © 2018年 Max. All rights reserved.
//

#import "SSUIHelper.h"
#import <ShareSDK/ShareSDK+Base.h>
#import <MessageUI/MessageUI.h>

@interface SSUIHelper()

@end

@implementation SSUIHelper

+ (instancetype)shareHelper
{
    static SSUIHelper *_instance = nil;
    static dispatch_once_t defaultContextPredicate;
    dispatch_once(&defaultContextPredicate, ^{
        _instance = [[SSUIHelper alloc] init];
    });
    return _instance;
}

- (NSMutableArray *)activePlatformsWithCustomItems:(NSArray *)items
{
    NSMutableArray *filtedPlatforms = items.count ? items.mutableCopy:ShareSDK.activePlatforms.mutableCopy;

    for (NSNumber *obj in filtedPlatforms.copy)
    {
        if (![obj isKindOfClass:NSNumber.class])
        {
            continue;
        }
        
        switch (obj.integerValue)
        {
            case SSDKPlatformTypeWechat:
            case SSDKPlatformSubTypeWechatSession:
            case SSDKPlatformSubTypeWechatTimeline:
            case SSDKPlatformSubTypeWechatFav:
            {
                BOOL isInstalled = [MOBFApplication canOpenUrl:[NSURL URLWithString:@"weixin://"]] || [MOBFApplication canOpenUrl:[NSURL URLWithString:@"wechat://"]];
                if (!isInstalled)
                {
                    [filtedPlatforms removeObject:obj];
                }
            }
                break;
            case SSDKPlatformTypeQQ:
            case SSDKPlatformSubTypeQQFriend:
            case SSDKPlatformSubTypeQZone:
            {
                if (![MOBFApplication canOpenUrl:[NSURL URLWithString:@"mqq://"]])
                {
                    [filtedPlatforms removeObject:obj];
                }
            }
                break;
            case SSDKPlatformTypeInstagram:
            {
                if (![MOBFApplication canOpenUrl:[NSURL URLWithString:@"instagram://app"]])
                {
                    [filtedPlatforms removeObject:obj];
                }
            }
                break;
            case SSDKPlatformTypeWhatsApp:
            {
                if (![MOBFApplication canOpenUrl:[NSURL URLWithString:@"whatsapp://"]])
                {
                    [filtedPlatforms removeObject:obj];
                }
            }
                break;
            case SSDKPlatformTypeLine:
            {
                if (![MOBFApplication canOpenUrl:[NSURL URLWithString:@"line://"]])
                {
                    [filtedPlatforms removeObject:obj];
                }
            }
                break;
            case SSDKPlatformTypeKakao:
            case SSDKPlatformSubTypeKakaoTalk:
            {
                if (![MOBFApplication canOpenUrl:[NSURL URLWithString:@"storykompassauth://"]])
                {
                    [filtedPlatforms removeObject:obj];
                }
            }
                break;
            case SSDKPlatformTypeAliSocial:
            case SSDKPlatformTypeAliSocialTimeline:
            {
                NSString *encodeStr = @"YWxpcGF5Oi8v";
                NSData *data = [MOBFString dataByBase64DecodeString:encodeStr];
                NSString *decodeStr = [[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding];
                if (![MOBFApplication canOpenUrl:[NSURL URLWithString:decodeStr]])
                {
                    [filtedPlatforms removeObject:obj];
                }
            }
                break;
            case SSDKPlatformTypeFacebookMessenger:
            {
                if (![MOBFApplication canOpenUrl:[NSURL URLWithString:@"fb-messenger://"]])
                {
                    [filtedPlatforms removeObject:obj];
                }
            }
                break;
            case SSDKPlatformTypeDingTalk:
            {
                if (![MOBFApplication canOpenUrl:[NSURL URLWithString:@"dingtalk://"]])
                {
                    [filtedPlatforms removeObject:obj];
                }
            }
                break;
            case SSDKPlatformTypeMeiPai:
            {
                if (![MOBFApplication canOpenUrl:[NSURL URLWithString:@"mtmv://"]])
                {
                    [filtedPlatforms removeObject:obj];
                }
            }
            break;
            case SSDKPlatformTypeMail:
            {
                if (![MFMailComposeViewController canSendMail])
                {
                    [filtedPlatforms removeObject:obj];
                }
                break;
            }
            case SSDKPlatformTypeCMCC:
                [filtedPlatforms removeObject:obj];
                break;
                
            case SSDKPlatformTypeTelegram:
            {
                if (![MOBFApplication canOpenUrl:[NSURL URLWithString:@"tg://"]])
                {
                    [filtedPlatforms removeObject:obj];
                }
            }
                break;
                
            default:
                break;
        }
    }
    
    //对微信和QQ、Kakao等包含多个平台的平台处理
    if ([filtedPlatforms containsObject:@(SSDKPlatformTypeWechat)])
    {
        if (![filtedPlatforms containsObject:@(SSDKPlatformSubTypeWechatSession)])
        {
            [filtedPlatforms insertObject:@(SSDKPlatformSubTypeWechatSession) atIndex:[filtedPlatforms indexOfObject:@(SSDKPlatformTypeWechat)]];
        }
        
        if (![filtedPlatforms containsObject:@(SSDKPlatformSubTypeWechatTimeline)])
        {
            [filtedPlatforms insertObject:@(SSDKPlatformSubTypeWechatTimeline) atIndex:[filtedPlatforms indexOfObject:@(SSDKPlatformTypeWechat)]];
        }
        
        if (![filtedPlatforms containsObject:@(SSDKPlatformSubTypeWechatFav)])
        {
            [filtedPlatforms insertObject:@(SSDKPlatformSubTypeWechatFav) atIndex:[filtedPlatforms indexOfObject:@(SSDKPlatformTypeWechat)]];
        }
        
        [filtedPlatforms removeObject:@(SSDKPlatformTypeWechat)];
    }
    
    if ([filtedPlatforms containsObject:@(SSDKPlatformTypeKakao)])
    {
        if (![filtedPlatforms containsObject:@(SSDKPlatformSubTypeKakaoStory)])
        {
            [filtedPlatforms insertObject:@(SSDKPlatformSubTypeKakaoStory) atIndex:[filtedPlatforms indexOfObject:@(SSDKPlatformTypeKakao)]];
        }
        
        if (![filtedPlatforms containsObject:@(SSDKPlatformSubTypeKakaoTalk)])
        {
            [filtedPlatforms insertObject:@(SSDKPlatformSubTypeKakaoTalk) atIndex:[filtedPlatforms indexOfObject:@(SSDKPlatformTypeKakao)]];
        }
        
        [filtedPlatforms removeObject:@(SSDKPlatformTypeKakao)];
    }
    
    if ([filtedPlatforms containsObject:@(SSDKPlatformTypeQQ)])
    {
        if (![filtedPlatforms containsObject:@(SSDKPlatformSubTypeQQFriend)])
        {
            [filtedPlatforms insertObject:@(SSDKPlatformSubTypeQQFriend) atIndex:[filtedPlatforms indexOfObject:@(SSDKPlatformTypeQQ)]];
        }
        
        if (![filtedPlatforms containsObject:@(SSDKPlatformSubTypeQZone)])
        {
            [filtedPlatforms insertObject:@(SSDKPlatformSubTypeQZone) atIndex:[filtedPlatforms indexOfObject:@(SSDKPlatformTypeQQ)]];
        }
        
        [filtedPlatforms removeObject:@(SSDKPlatformTypeQQ)];
    }
    
    if ([filtedPlatforms containsObject:@(SSDKPlatformTypeYiXin)])
    {
        if (![filtedPlatforms containsObject:@(SSDKPlatformSubTypeYiXinFav)])
        {
            [filtedPlatforms addObject:@(SSDKPlatformSubTypeYiXinFav)];
        }
        
        if (![filtedPlatforms containsObject:@(SSDKPlatformSubTypeYiXinSession)])
        {
            [filtedPlatforms addObject:@(SSDKPlatformSubTypeYiXinSession)];
        }
        
        if (![filtedPlatforms containsObject:@(SSDKPlatformSubTypeYiXinTimeline)])
        {
            [filtedPlatforms addObject:@(SSDKPlatformSubTypeYiXinTimeline)];
        }
        
        [filtedPlatforms removeObject:@(SSDKPlatformTypeYiXin)];
    }
    
    return filtedPlatforms;
}

- (SSDKPlatformType)processPlatform:(SSDKPlatformType)platformType
{
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
    
    return platformType;
}

- (NSMutableArray *)filteUnSupportOneKeySharePlatforms:(NSArray *)platforms params:(NSDictionary *)params;
{
    NSMutableArray *filtedArr = [NSMutableArray array];
    for (NSNumber *obj in platforms)
    {
        SSDKPlatformType type = [obj integerValue];
        switch (type)
        {
            case SSDKPlatformTypeTencentWeibo:
            case SSDKPlatformTypeTwitter:
            case SSDKPlatformTypeDouBan:
            case SSDKPlatformTypeRenren:
            case SSDKPlatformTypeKaixin:
            case SSDKPlatformTypeLinkedIn:
            case SSDKPlatformTypePocket:
            case SSDKPlatformTypeTumblr:
                [filtedArr addObject:obj];
                break;
            case SSDKPlatformTypeFacebook://facebook如果开启了客户端分享或者是web分享就过滤掉
            {
                BOOL enableClientShare = [params[@"@client_share"] boolValue];
                
                BOOL isWebShare = NO;
                
                NSString *facebookKey = [NSString stringWithFormat:@"@platform(%lu)",(unsigned long)SSDKPlatformTypeFacebook];
                NSDictionary *facebookParams = [params objectForKey:facebookKey];
                
                if (facebookParams)
                {
                    SSDKContentType type = [facebookParams[@"type"] integerValue];
                    if (type == SSDKContentTypeWebPage)
                    {
                        isWebShare = YES;
                    }
                    else if (type == SSDKContentTypeAuto)
                    {
                        if (facebookParams[@"title"] && facebookParams[@"url"])
                        {
                            isWebShare = YES;
                        }
                    }
                }
                else
                {
                    SSDKContentType type = [params[@"type"] integerValue];
                    if (type == SSDKContentTypeWebPage)
                    {
                        isWebShare = YES;
                    }
                    else if (type == SSDKContentTypeAuto)
                    {
                        if (params[@"title"] && params[@"url"])
                        {
                            isWebShare = YES;
                        }
                    }
                }
                
                if (!enableClientShare && !isWebShare)
                {
                    [filtedArr addObject:obj];
                }
            }
                break;
            default:
                break;
        }
    }
    
    return filtedArr;
}

// 编辑界面提取文本内容
- (NSString *)extractContentWithParams:(NSMutableDictionary *)params platform:(SSDKPlatformType)platform
{
    NSString *text = params[@"text"];
    NSString *customText = nil;
    
    NSString *platformString = [NSString stringWithFormat:@"@platform(%lu)",(unsigned long)platform];
    
    NSDictionary *customParams = params[platformString];
    if (customParams && [customParams isKindOfClass:NSDictionary.class])
    {
       customText = customParams[@"text"];
    }
    
    return customText ?: text ;
}

// 编辑界面提取图片内容
- (SSDKImage *)extractImageWithParams:(NSMutableDictionary *)params platform:(SSDKPlatformType)platform
{
    SSDKImage *image = [params[@"images"] firstObject];
    SSDKImage *customImage = nil;
    
    NSString *platformString = [NSString stringWithFormat:@"@platform(%lu)",(unsigned long)platform];
    
    NSDictionary *customParams = params[platformString];
    if (customParams && [customParams isKindOfClass:NSDictionary.class])
    {
        customImage = [customParams[@"images"] firstObject];
    }
    
    return customImage ?: image;
}

- (UIImage *)clipImage:(UIImage *)image forImageViewSize:(CGSize)size
{
    //裁剪图片
    CGFloat vw = size.width ;
    CGFloat vh = size.height;
    CGFloat w = image.size.width;
    CGFloat h = image.size.height;
    
    CGFloat scale = w / vw < h / vh ? w / vw : h / vh;
    
    vw = vw * scale;
    vh = vh * scale;
    
    CGRect rect = CGRectMake((w - vw) / 2, (h - vh) / 2, vw, vh);
    return [MOBFImage clipImage:image withRect:rect];
}

//获取灰度图方法
- (UIImage *)getGrayImage:(UIImage *)sourceImage
{
    int width = sourceImage.size.width;
    int height = sourceImage.size.height;
    
    CGColorSpaceRef colorSpace = CGColorSpaceCreateDeviceGray();
    
    CGContextRef context = NULL;

    context = CGBitmapContextCreate (nil,
                                     width,
                                     height,
                                     8,
                                     0,
                                     colorSpace,
                                     kCGBitmapByteOrderDefault);

    CGColorSpaceRelease(colorSpace);
    
    if (context == NULL)
    {
        return nil;
    }
    
    CGContextDrawImage(context,
                       CGRectMake(0, 0, width, height),
                       sourceImage.CGImage);
    
    CGImageRef img = CGBitmapContextCreateImage(context);
    UIImage *grayImage = [UIImage imageWithCGImage:img];
    UIImage *finalImage = [MOBFImage roundRectImage:grayImage
                                           withSize:CGSizeMake(30 , 30)
                                          ovalWidth:5.0
                                         ovalHeight:5.0
                                           ovalType:MOBFOvalTypeAll];
    CGContextRelease(context);
    CFRelease(img);
    
    return finalImage;
}

- (BOOL)shareDirectlyWithPlatform:(SSDKPlatformType)platformType directSharePlatforms:(NSMutableArray *)directSharePlatforms
{
    if (!directSharePlatforms)
    {
        directSharePlatforms = @[@(SSDKPlatformTypeWechat),
                                 @(SSDKPlatformTypeQQ),
                                 @(SSDKPlatformTypeSinaWeibo),
                                 @(SSDKPlatformTypeInstagram),
                                 @(SSDKPlatformTypeWhatsApp),
                                 @(SSDKPlatformTypeLine),
                                 @(SSDKPlatformSubTypeKakaoTalk),
                                 @(SSDKPlatformTypeAliSocial),
                                 @(SSDKPlatformTypeAliSocialTimeline),
                                 @(SSDKPlatformTypeFacebookMessenger),
                                 @(SSDKPlatformTypeFacebook),
                                 @(SSDKPlatformTypeYiXin),
                                 @(SSDKPlatformTypeDingTalk),
                                 @(SSDKPlatformTypeMeiPai),
                                 @(SSDKPlatformTypeTelegram)].mutableCopy;
    }
    
    //对微信和QQ、Kakao等包含多个平台的平台处理
    if ([directSharePlatforms containsObject:@(SSDKPlatformTypeWechat)])
    {
        if (![directSharePlatforms containsObject:@(SSDKPlatformSubTypeWechatSession)])
        {
            [directSharePlatforms addObject:@(SSDKPlatformSubTypeWechatSession)];
        }
        
        if (![directSharePlatforms containsObject:@(SSDKPlatformSubTypeWechatTimeline)]) {
            [directSharePlatforms addObject:@(SSDKPlatformSubTypeWechatTimeline)];
        }
        
        if (![directSharePlatforms containsObject:@(SSDKPlatformSubTypeWechatFav)]) {
            [directSharePlatforms addObject:@(SSDKPlatformSubTypeWechatFav)];
        }
        
        [directSharePlatforms removeObject:@(SSDKPlatformTypeWechat)];
    }
    
    //易信
    if([directSharePlatforms containsObject:@(SSDKPlatformTypeYiXin)])
    {
        if (![directSharePlatforms containsObject:@(SSDKPlatformSubTypeYiXinSession)])
        {
            [directSharePlatforms addObject:@(SSDKPlatformSubTypeYiXinSession)];
        }
        
        if (![directSharePlatforms containsObject:@(SSDKPlatformSubTypeYiXinTimeline)])
        {
            [directSharePlatforms addObject:@(SSDKPlatformSubTypeYiXinTimeline)];
        }
        
        if (![directSharePlatforms containsObject:@(SSDKPlatformSubTypeYiXinFav)])
        {
            [directSharePlatforms addObject:@(SSDKPlatformSubTypeYiXinFav)];
        }
    }
    
    if ([directSharePlatforms containsObject:@(SSDKPlatformTypeKakao)])
    {
        if (![directSharePlatforms containsObject:@(SSDKPlatformSubTypeKakaoTalk)])
        {
            [directSharePlatforms addObject:@(SSDKPlatformSubTypeKakaoTalk)];
        }
        
        if (![directSharePlatforms containsObject:@(SSDKPlatformSubTypeKakaoStory)])
        {
            [directSharePlatforms addObject:@(SSDKPlatformSubTypeKakaoStory)];
        }
        
        [directSharePlatforms removeObject:@(SSDKPlatformTypeKakao)];
    }
    
    if ([directSharePlatforms containsObject:@(SSDKPlatformTypeQQ)])
    {
        if (![directSharePlatforms containsObject:@(SSDKPlatformSubTypeQZone)]) {
            [directSharePlatforms addObject:@(SSDKPlatformSubTypeQZone)];
        }
        
        if (![directSharePlatforms containsObject:@(SSDKPlatformSubTypeQQFriend)]) {
            [directSharePlatforms addObject:@(SSDKPlatformSubTypeQQFriend)];
        }
        
        [directSharePlatforms removeObject:@(SSDKPlatformTypeQQ)];
    }
    
    return [directSharePlatforms containsObject:@(platformType)];
}

- (BOOL)checkIfNeedAuthWithPlatform:(SSDKPlatformType)platformType
{
    NSMutableArray *unNeedAuthorizedPlatforms = @[@(SSDKPlatformTypeWechat),
                                                  @(SSDKPlatformTypeQQ),
                                                  @(SSDKPlatformSubTypeQZone),
                                                  @(SSDKPlatformSubTypeQQFriend),
                                                  @(SSDKPlatformSubTypeWechatSession),
                                                  @(SSDKPlatformSubTypeWechatTimeline),
                                                  @(SSDKPlatformSubTypeWechatFav),
                                                  @(SSDKPlatformTypeSMS),
                                                  @(SSDKPlatformTypeMail),
                                                  @(SSDKPlatformTypeCopy),
                                                  @(SSDKPlatformTypeGooglePlus),
                                                  @(SSDKPlatformTypeInstagram),
                                                  @(SSDKPlatformTypeWhatsApp),
                                                  @(SSDKPlatformTypeLine),
                                                  @(SSDKPlatformTypeKakao),
                                                  @(SSDKPlatformSubTypeKakaoTalk),
                                                  @(SSDKPlatformTypeAliSocial),
                                                  @(SSDKPlatformTypeAliSocialTimeline),
                                                  @(SSDKPlatformTypePrint),
                                                  @(SSDKPlatformTypeFacebookMessenger),
                                                  @(SSDKPlatformTypeDingTalk),
                                                  @(SSDKPlatformTypeMeiPai),
                                                  ].mutableCopy;
    
    if ([MOBFApplication canOpenUrl:[NSURL URLWithString:@"sinaweibo://"]]
        || [MOBFApplication canOpenUrl:[NSURL URLWithString:@"sinaweibohd://"]])
    {
        [unNeedAuthorizedPlatforms addObject:@(SSDKPlatformTypeSinaWeibo)];
    }
    
    if ([MOBFApplication canOpenUrl:[NSURL URLWithString:@"fbauth2://"]])
    {
        [unNeedAuthorizedPlatforms addObject:@(SSDKPlatformTypeFacebook)];
    }
    
    return ![unNeedAuthorizedPlatforms containsObject:@(platformType)] && ![ShareSDK hasAuthorized:platformType];
}

- (NSMutableArray *)filteAuthedPlatforms:(NSArray *)selectedPlatforms
{
    NSMutableArray *filedPlatforms = [NSMutableArray arrayWithObject:selectedPlatforms.firstObject];
    
    for (NSInteger i=1; i<selectedPlatforms.count; i++)
    {
        SSDKPlatformType type = [selectedPlatforms[i] integerValue];
        
        if ([ShareSDK hasAuthorized:type])
        {
            [filedPlatforms addObject:selectedPlatforms[i]];
        }
    }
    
    return filedPlatforms;
}

- (NSMutableDictionary *)editedParamsWithContent:(NSString *)content orginalParams:(NSMutableDictionary *)params platforms:(NSArray *)platformTypes
{
    NSMutableDictionary *editedParams = params.mutableCopy;
    
    for (NSNumber *obj in platformTypes)
    {
        NSString *platformKey = [NSString stringWithFormat:@"@platform(%@)",obj];
        NSMutableDictionary *costomParams = [params[platformKey] mutableCopy];
        if ([costomParams isKindOfClass:NSMutableDictionary.class])
        {
            costomParams[@"text"] = content;
        }
        else
        {
            costomParams = @{@"text":content?:@""}.mutableCopy;
        }
        
        editedParams[platformKey] = costomParams;
    }
    
    return editedParams;
}

- (BOOL)needSafaAreaAdapt
{
    CGSize size = [UIScreen mainScreen].currentMode.size;
    CGFloat scale = size.height * 1.0 / size.width;
    return scale > 2;
}

@end
