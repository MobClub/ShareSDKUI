//
//  SSUIPlatformInfo.m
//  ShareSDKUI
//
//  Created by Max on 2018/4/9.
//  Copyright © 2018年 Max. All rights reserved.
//

#import "SSUIPlatformItem.h"

@interface SSUIPlatformItem()

@property (weak, nonatomic) id target;
@property (assign, nonatomic) SEL selector;

@end

@implementation SSUIPlatformItem

+ (instancetype)itemWithPlatformType:(SSDKPlatformType)platformType
{
    SSUIPlatformItem *info = [[self alloc] init];
    
    NSString *bundlePath = [[NSBundle mainBundle] pathForResource:@"ShareSDKUI"
                                                           ofType:@"bundle"];
    NSBundle *bundle = [NSBundle bundleWithPath:bundlePath];
    
    info.iconNormal = [MOBFImage imageName:[NSString stringWithFormat:@"Icon/sns_icon_%zi.png",platformType] bundle:bundle];
    info.iconSimple = [MOBFImage imageName:[NSString stringWithFormat:@"Icon_simple/sns_icon_%zi.png",platformType] bundle:bundle];
    
    NSString *temName = [NSString stringWithFormat:@"ShareType_%zi",platformType];
    info.platformName = NSLocalizedStringWithDefaultValue(temName, @"ShareSDKUI_Localizable", bundle, temName, nil);
    
    return info;
}

- (void)addTarget:(id)target action:(SEL)selector
{
    _target = target;
    _selector = selector;
}

- (void)triggerClick
{
#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Warc-performSelector-leaks"
    [_target performSelector:_selector withObject:self];
#pragma clang diagnostic pop
}

@end
