//
//  SSUIHelper.h
//  ShareSDKUI
//
//  Created by Max on 2018/4/9.
//  Copyright © 2018年 Max. All rights reserved.
//

#import <UIKit/UIKit.h>

@interface SSUIHelper : NSObject

+ (instancetype)shareHelper;

// 过滤掉未安装客户端导致无法分享的平台
- (NSMutableArray *)activePlatformsWithCustomItems:(NSArray *)items;

// 过滤掉不支持一键分享的平台
- (NSMutableArray *)filteUnSupportOneKeySharePlatforms:(NSArray *)platforms params:(NSDictionary *)params;

// 处理平台类型
- (SSDKPlatformType)processPlatform:(SSDKPlatformType)platformType;

// 编辑界面提取文本内容
- (NSString *)extractContentWithParams:(NSMutableDictionary *)params platform:(SSDKPlatformType)platform;

// 编辑界面提取图片内容
- (SSDKImage *)extractImageWithParams:(NSMutableDictionary *)params platform:(SSDKPlatformType)platform;

// 编辑界面的图片剪切
- (UIImage *)clipImage:(UIImage *)image forImageViewSize:(CGSize)size;

//获取灰度图方法
- (UIImage *)getGrayImage:(UIImage *)sourceImage;

//判断是否需要显示编辑菜单
- (BOOL)shareDirectlyWithPlatform:(SSDKPlatformType)platformType directSharePlatforms:(NSMutableArray *)directSharePlatforms;

// 编辑界面点击分享后判断是否需要授权
- (BOOL)checkIfNeedAuthWithPlatform:(SSDKPlatformType)platformType;

// 过滤掉未授权不需要分享的平台
- (NSMutableArray *)filteAuthedPlatforms:(NSArray *)selectedPlatforms;

// 根据editor的编辑内容重新配置参数
- (NSMutableDictionary *)editedParamsWithContent:(NSString *)content orginalParams:(NSMutableDictionary *)params;

@end
