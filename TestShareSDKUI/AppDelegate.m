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

#import <KakaoOpenSDK/KakaoOpenSDK.h>

//支付宝SDK
#import "APOpenAPI.h"

//易信SDK头文件
#import "YXApi.h"

//Facebook Messenger SDK
#import <FBSDKMessengerShareKit/FBSDKMessengerSharer.h>

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
//    NSString *str = NSLocalizedStringWithDefaultValue(@"NoValidPlatform", @"ShareSDKUI_Localizable", [NSBundle bundleWithPath:[[NSBundle mainBundle] pathForResource:@"ShareSDKUI" ofType:@"bundle"]], @"NoValidPlatform", nil);
    
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
//                                 @(SSDKPlatformTypeUnknown),
                                 @(SSDKPlatformSubTypeQZone),
//                                 @(SSDKPlatformSubTypeWechatSession),
//                                 @(SSDKPlatformSubTypeWechatTimeline),
                                 @(SSDKPlatformSubTypeQQFriend),
//                                 @(SSDKPlatformSubTypeWechatFav),
//                                 @(SSDKPlatformTypeAny),
                                 @(SSDKPlatformTypeRenren),
                                 @(SSDKPlatformTypeDouBan),
                                 @(SSDKPlatformTypeKaixin),
                                 @(SSDKPlatformTypeGooglePlus),
//                                 @(SSDKPlatformTypePocket),
//                                 @(SSDKPlatformTypeLinkedIn),
//                                 @(SSDKPlatformTypeTumblr),
//                                 @(SSDKPlatformTypeFlickr),
//                                 @(SSDKPlatformTypeWhatsApp),
//                                 @(SSDKPlatformTypeYouDaoNote),
//                                 @(SSDKPlatformTypeLine),
//                                 @(SSDKPlatformTypeEvernote),
//                                 @(SSDKPlatformTypeYinXiang),
//                                 @(SSDKPlatformTypeAliPaySocial),
//                                 @(SSDKPlatformTypePinterest),
//                                 @(SSDKPlatformTypeKakao),
//                                 @(SSDKPlatformSubTypeKakaoTalk),
//                                 @(SSDKPlatformSubTypeKakaoStory),
//                                 @(SSDKPlatformTypeDropbox),
//                                 @(SSDKPlatformTypeVKontakte),
//                                 @(SSDKPlatformTypeMingDao),
//                                 @(SSDKPlatformTypePrint),
//                                 @(SSDKPlatformTypeYiXin),
//                                 @(SSDKPlatformTypeInstapaper),
//                                 @(SSDKPlatformTypeFacebookMessenger)
                                 ];
    
    //ShareSDK和平台初始化
    [ShareSDK registerApp:@"4a88b2fb067c"
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
                         case SSDKPlatformTypeKakao:
                         case SSDKPlatformSubTypeKakaoStory:
                         case SSDKPlatformSubTypeKakaoTalk:
                             [ShareSDKConnector connectKaKao:[KOSession class]];
                             break;
                         case SSDKPlatformTypeAliPaySocial:
                             [ShareSDKConnector connectAliPaySocial:[APOpenAPI class]];
                             break;
                             
                         case SSDKPlatformTypeYiXin:
                             [ShareSDKConnector connectYiXin:[YXApi class]];
                             break;
                         case SSDKPlatformTypeFacebookMessenger:
                              [ShareSDKConnector connectFacebookMessenger:[FBSDKMessengerSharer class]];
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
                      [appInfo SSDKSetupFacebookByApiKey:@"107704292745179"
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
//                      [appInfo SSDKSetupGooglePlusByClientID:@"232554794995.apps.googleusercontent.com"
//                                                clientSecret:@"PEdFgtrMw97aCvf0joQj7EMk"
//                                                 redirectUri:@"http://localhost"
//                                                    authType:SSDKAuthTypeBoth];
                      
                      [appInfo SSDKSetupGooglePlusByClientID:@"232554794995.apps.googleusercontent.com"
                                                clientSecret:@"PEdFgtrMw97aCvf0joQj7EMk"
                                                 redirectUri:@"http://localhost"];
                      break;
                  case SSDKPlatformTypePocket:
                      [appInfo SSDKSetupPocketByConsumerKey:@"11496-de7c8c5eb25b2c9fcdc2b627"
                                                redirectUri:@"pocketapp1234"
                                                   authType:SSDKAuthTypeBoth];
                      break;
                  case SSDKPlatformTypeLinkedIn:
                      [appInfo SSDKSetupLinkedInByApiKey:@"ejo5ibkye3vo"
                                               secretKey:@"cC7B2jpxITqPLZ5M"
                                             redirectUrl:@"http://sharesdk.cn"];
                      break;
                  case SSDKPlatformTypeTumblr:
                      [appInfo SSDKSetupTumblrByConsumerKey:@"2QUXqO9fcgGdtGG1FcvML6ZunIQzAEL8xY6hIaxdJnDti2DYwM"
                                             consumerSecret:@"3Rt0sPFj7u2g39mEVB3IBpOzKnM3JnTtxX2bao2JKk4VV1gtNo"
                                                callbackUrl:@"http://sharesdk.cn"];
                      break;
                  case SSDKPlatformTypeFlickr:
                      [appInfo SSDKSetupFlickrByApiKey:@"33d833ee6b6fca49943363282dd313dd"
                                             apiSecret:@"3a2c5b42a8fbb8bb"];
                      break;
                  case SSDKPlatformTypeYouDaoNote:
                      
                      [appInfo SSDKSetupYouDaoNoteByConsumerKey:@"dcde25dca105bcc36884ed4534dab940"
                                                 consumerSecret:@"d98217b4020e7f1874263795f44838fe"
                                                  oauthCallback:@"http://www.sharesdk.cn/"];
                      break;
                  
                  case SSDKPlatformTypeYinXiang:
                      //设置印象笔记（中国版）应用信息
                  case SSDKPlatformTypeEvernote:
                      //设置印象笔记（国际版）应用信息
                      [appInfo SSDKSetupEvernoteByConsumerKey:@"sharesdk-7807"
                                               consumerSecret:@"d05bf86993836004"
                                                      sandbox:YES];
                      break;
                  case SSDKPlatformTypeKakao:
//                      [appInfo SSDKSetupKaKaoByAppKey:@"48d3f524e4a636b08d81b3ceb50f1003"
//                                           restApiKey:@"ac360fa50b5002637590d24108e6cb10"
//                                          redirectUri:@"http://www.mob.com/oauth"
//                                             authType:SSDKAuthTypeBoth];
                      [appInfo SSDKSetupKaKaoByAppKey:@"72d8bddd2e3970a531b26d1c69ad2439"
                                           restApiKey:@"5e935c8e198f04c4bc88dfc97e273c56"
                                          redirectUri:@"http://www.mob.com/oauth"
                                             authType:SSDKAuthTypeBoth];
                      break;
                 case SSDKPlatformTypeAliPaySocial:
                      [appInfo SSDKSetupAliPaySocialByAppId:@"2015072400185895"];
                      break;
                 case SSDKPlatformTypePinterest:
                      [appInfo SSDKSetupPinterestByClientId:@"1432928"];
                      break;
                 case SSDKPlatformTypeDropbox:
                      [appInfo SSDKSetupDropboxByAppKey:@"i5vw2mex1zcgjcj"
                                              appSecret:@"3i9xifsgb4omr0s"
                                          oauthCallback:@"https://www.sharesdk.cn"];
                      break;
//                 case SSDKPlatformTypeVKontakte:
//                      [appInfo SSDKSetupVKontakteByApplicationId:@"3921561"
//                                                       secretKey:@"6Qf883ukLDyz4OBepYF1"];
//                      break;
                 case SSDKPlatformTypeMingDao:
                      [appInfo SSDKSetupMingDaoByAppKey:@"EEEE9578D1D431D3215D8C21BF5357E3"
                                              appSecret:@"5EDE59F37B3EFA8F65EEFB9976A4E933"
                                            redirectUri:@"http://sharesdk.cn"];
                      break;
                 case SSDKPlatformTypeYiXin:
                      [appInfo SSDKSetupYiXinByAppId:@"yx0d9a9f9088ea44d78680f3274da1765f"
                                           appSecret:@"1a5bd421ae089c3"
                                         redirectUri:@"https://open.yixin.im/resource/oauth2_callback.html"
                                            authType:SSDKAuthTypeBoth];
                      break;
                 case SSDKPlatformTypeInstapaper:
                      [appInfo SSDKSetupInstapaperByConsumerKey:@"4rDJORmcOcSAZL1YpqGHRI605xUvrLbOhkJ07yO0wWrYrc61FA"
                                                 consumerSecret:@"GNr1GespOQbrm8nvd7rlUsyRQsIo3boIbMguAl9gfpdL0aKZWe"];
                      break;
                  default:
                      break;
                
              }
          }];

    return YES;
}


@end
