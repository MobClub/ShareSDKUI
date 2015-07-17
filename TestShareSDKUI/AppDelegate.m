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

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
    //需要集成的平台
    NSArray *activePlatforms = @[@(SSDKPlatformTypeSinaWeibo),
                                 @(SSDKPlatformTypeWechat),
                                 @(SSDKPlatformTypeTwitter),
                                 @(SSDKPlatformTypeQQ),
                                 @(SSDKPlatformTypeFacebook),
                                 @(SSDKPlatformTypeTencentWeibo),
                                 @(SSDKPlatformTypeUnknown),
                                 @(SSDKPlatformSubTypeQZone),
                                 @(SSDKPlatformSubTypeWechatSession),
                                 @(SSDKPlatformSubTypeWechatTimeline),
                                 @(SSDKPlatformSubTypeQQFriend),
                                 @(SSDKPlatformSubTypeWechatFav),
                                 @(SSDKPlatformTypeAny)
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
                      [appInfo SSDKSetupTencentWeiboByAppKey:@"801565430" appSecret:@"f297c4bd9499f9e1bb0b1d34719d0c2f" redirectUri:@"http://mob.com"];
                      
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
                  default:
                      break;
              }
              
          }];
    
    return YES;
}

@end
