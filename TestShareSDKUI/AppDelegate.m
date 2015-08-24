//
//  AppDelegate.m
//  TestShareSDKUI
//
//  Created by 刘 靖煌 on 15/7/6.
//  Copyright (c) 2015年 mob. All rights reserved.
//

#import "AppDelegate.h"

#import <ShareSDK/ShareSDK.h>
#import <ShareSDKConnector/ShareSDKConnector.h>

#import "WXApi.h"
#import "WeiboSDK.h"
#import <TencentOpenAPI/QQApiInterface.h>
#import <TencentOpenAPI/TencentOAuth.h>
#import <RennSDK/RennSDK.h>
#import <GooglePlus/GooglePlus.h>

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
    //需要集成的平台
    NSArray *activePlatforms = @[
                                 @(SSDKPlatformTypeSinaWeibo),
                                 @(SSDKPlatformTypeWechat),
                                 @(SSDKPlatformTypeTwitter),
                                 @(SSDKPlatformTypeMail),
                                 @(SSDKPlatformTypeSMS),
                                 @(SSDKPlatformTypeCopy),
                                 @(SSDKPlatformTypeQQ),
                                 @(SSDKPlatformTypeFacebook),
                                 @(SSDKPlatformTypeTencentWeibo),
                                 @(SSDKPlatformTypeUnknown),
                                 @(SSDKPlatformSubTypeQZone),
                                 @(SSDKPlatformSubTypeWechatSession),
                                 @(SSDKPlatformSubTypeWechatTimeline),
                                 @(SSDKPlatformSubTypeQQFriend),
                                 @(SSDKPlatformSubTypeWechatFav),
                                 @(SSDKPlatformTypeAny),
                                 @(SSDKPlatformTypeRenren),
                                 @(SSDKPlatformTypeDouBan),
                                 @(SSDKPlatformTypeKaixin),
                                 @(SSDKPlatformTypeGooglePlus),
                                 @(SSDKPlatformTypePocket)
                                 ];
    
    //ShareSDK和平台初始化
    [ShareSDK registerApp:@"iosv1101"
          activePlatforms:activePlatforms
                 onImport:^(SSDKPlatformType platformType) {
                     
                     switch (platformType)
                     {
                         case SSDKPlatformTypeWechat:
                             
                             [ShareSDKConnector connectWeChat:[WXApi class]];
                             
                             break;
                         case SSDKPlatformTypeSinaWeibo:
                             
                             [ShareSDKConnector connectWeibo:[WeiboSDK class]];
                             
                             break;
                         case SSDKPlatformTypeQQ:
                             
                             [ShareSDKConnector connectQQ:[QQApiInterface class]
                                        tencentOAuthClass:[TencentOAuth class]];
                             
                             break;
                         case SSDKPlatformTypeRenren:
                             [ShareSDKConnector connectRenren:[RennClient class]];
                             break;
                         case SSDKPlatformTypeGooglePlus:
                             [ShareSDKConnector connectGooglePlus:[GPPSignIn class]
                                                       shareClass:[GPPShare class]];
                             break;
                         default:
                             break;
                     }
                     
                 }
          onConfiguration:^(SSDKPlatformType platformType, NSMutableDictionary *appInfo) {
              
              switch (platformType)
              {
                  case SSDKPlatformTypeSinaWeibo:
                      
                      //初始化新浪微博
                      [appInfo SSDKSetupSinaWeiboByAppKey:@"568898243"
                                                appSecret:@"38a4f8204cc784f81f9f0daaf31e02e3"
                                              redirectUri:@"http://www.sharesdk.cn"
                                                 authType:SSDKAuthTypeBoth];
                      
                      break;
                  case SSDKPlatformTypeTencentWeibo:
                      [appInfo SSDKSetupTencentWeiboByAppKey:@"801565430"
                                                   appSecret:@"f297c4bd9499f9e1bb0b1d34719d0c2f" redirectUri:@"http://mob.com"];
                      
                      break;
                  case SSDKPlatformTypeWechat:
                      
                      [appInfo SSDKSetupWeChatByAppId:@"wx4868b35061f87885"
                                            appSecret:@"64020361b8ec4c99936c0e3999a9f249"];
                      
                      break;
                  case SSDKPlatformTypeTwitter:
                      
                      [appInfo SSDKSetupTwitterByConsumerKey:@"LRBM0H75rWrU9gNHvlEAA2aOy"
                                              consumerSecret:@"gbeWsZvA9ELJSdoBzJ5oLKX0TU09UOwrzdGfo9Tg7DjyGuMe8G"
                                                 redirectUri:@"http://mob.com"];
                      
                      break;
                  case SSDKPlatformTypeQQ:
                      
                      [appInfo SSDKSetupQQByAppId:@"100371282"
                                           appKey:@"aed9b0303e3ed1e27bae87c33761161d"
                                         authType:SSDKAuthTypeSSO];
                      
                      break;
                  case SSDKPlatformTypeFacebook:
                      
                      [appInfo SSDKSetupFacebookByAppKey:@"107704292745179"
                                               appSecret:@"38053202e1a5fe26c80c753071f0b573"
                                                authType:SSDKAuthTypeWeb];
                      
                      break;
                  case SSDKPlatformTypeDouBan:
                      [appInfo SSDKSetupDouBanByApiKey:@"02e2cbe5ca06de5908a863b15e149b0b"
                                                secret:@"9f1e7b4f71304f2f"
                                           redirectUri:@"http://www.sharesdk.cn"];
                      break;
                  case SSDKPlatformTypeRenren:
                      [appInfo SSDKSetupRenRenByAppId:@"226427"
                                               appKey:@"fc5b8aed373c4c27a05b712acba0f8c3"
                                            secretKey:@"f29df781abdd4f49beca5a2194676ca4"
                                             authType:SSDKAuthTypeBoth];
                      break;
                  case SSDKPlatformTypeKaixin:
                      [appInfo SSDKSetupKaiXinByApiKey:@"358443394194887cee81ff5890870c7c"
                                             secretKey:@"da32179d859c016169f66d90b6db2a23"
                                           redirectUri:@"http://www.sharesdk.cn/"];
                      break;
                  case SSDKPlatformTypeGooglePlus:
                      [appInfo SSDKSetupGooglePlusByClientID:@"232554794995.apps.googleusercontent.com"
                                                clientSecret:@"PEdFgtrMw97aCvf0joQj7EMk"
                                                 redirectUri:@"http://localhost"
                                                    authType:SSDKAuthTypeBoth];
                      break;
                  case SSDKPlatformTypePocket:
                      [appInfo SSDKSetupPocketByConsumerKey:@"11496-de7c8c5eb25b2c9fcdc2b627"
                                                redirectUri:@"pocketapp1234"
                                                   authType:SSDKAuthTypeBoth];
                      break;
                  default:
                      break;
              }
          }];

    return YES;
}



@end
