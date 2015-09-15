//
//  SSUIShareActionSheetPlatformItem.m
//  ShareSDKUI
//
//  Created by 刘 靖煌 on 15/6/18.
//  Copyright (c) 2015年 mob. All rights reserved.
//

#import "SSUIShareActionSheetPlatformItem.h"
#import <MOBFoundation/MOBFImage.h>

static NSBundle *uiBundle = nil;

@interface SSUIShareActionSheetPlatformItem ()

@end

@implementation SSUIShareActionSheetPlatformItem

- (instancetype)initWithPlatformType:(SSDKPlatformType)platformType
{
    if (self = [super init])
    {
        _platformType = platformType;
        
        if (!uiBundle)
        {
            NSString *bundlePath = [[NSBundle mainBundle] pathForResource:@"ShareSDKUI"
                                                                   ofType:@"bundle"];
            uiBundle = [NSBundle bundleWithPath:bundlePath];
        }
        
        _icon = [MOBFImage imageName:[NSString stringWithFormat:@"Icon/sns_icon_%zi.png",_platformType] bundle:uiBundle];
        
        NSString *temName = [NSString stringWithFormat:@"ShareType_%zi",_platformType];
        _label = NSLocalizedStringWithDefaultValue(temName, @"ShareSDKUI_Localizable", uiBundle, temName, nil);
    }
    return self;
}

- (NSString *)label
{
    return _label;
}

- (UIImage *)icon
{
    return _icon;
}

@end
