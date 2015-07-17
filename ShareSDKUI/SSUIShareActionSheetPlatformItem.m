//
//  SSUIShareActionSheetPlatformItem.m
//  ShareSDKUI
//
//  Created by fenghj on 15/6/18.
//  Copyright (c) 2015年 mob. All rights reserved.
//

#import "SSUIShareActionSheetPlatformItem.h"

@interface SSUIShareActionSheetPlatformItem ()

/**
 *  平台类型
 */
@property (nonatomic) SSDKPlatformType platformType;

@end

@implementation SSUIShareActionSheetPlatformItem

- (instancetype)initWithPlatformType:(SSDKPlatformType)platformType
{
    if (self = [super init])
    {
        self.platformType = platformType;
    }
    
    return self;
}

- (NSString *)label
{
    return nil;
}

- (UIImage *)icon
{
    return nil;
}

@end
