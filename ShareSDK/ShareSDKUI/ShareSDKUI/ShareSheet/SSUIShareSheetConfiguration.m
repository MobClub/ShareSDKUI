//
//  SSUIShareSheetConfiguration.m
//  ShareSDKUI
//
//  Created by Max on 2018/4/3.
//  Copyright © 2018年 Max. All rights reserved.
//

#import "SSUIShareSheetConfiguration.h"

@implementation SSUIShareSheetConfiguration

- (instancetype)init
{
    if (self = [super init])
    {
        _style = SSUIActionSheetStyleSystem;
        _shadeColor = [MOBFColor colorWithARGB:0x4c000000];
        _menuBackgroundColor = [UIColor whiteColor];
        _itemTitleColor = [UIColor darkTextColor];
        
        //iOS10以上中文大小比iOS以下大,因此字体略缩小
        if ([MOBFDevice versionCompare:@"10.0"] >= 0)
        {
            _itemTitleFont = [UIFont systemFontOfSize:11.5];
        }
        else
        {
            _itemTitleFont = [UIFont systemFontOfSize:12];
        }
        
        _cancelButtonHidden = NO;
        _cancelButtonTitleColor = [MOBFColor colorWithRGB:0x037bff];
        _cancelButtonBackgroundColor = [UIColor whiteColor];
        _pageIndicatorTintColor = [UIColor colorWithRed:160/255.0 green:199/255.0 blue:250/255.0 alpha:1.0];;
        _currentPageIndicatorTintColor = [UIColor colorWithRed:22/255.0 green:100/255.0 blue:255/255.0 alpha:1.0];
        _interfaceOrientationMask = UIInterfaceOrientationMaskAll;
        _statusBarStyle = UIStatusBarStyleDefault;
        _itemAlignment = SSUIItemAlignmentLeft;
    }
    
    return self;
}

// 用户传错会崩
- (void)setInterfaceOrientationMask:(UIInterfaceOrientationMask)interfaceOrientationMask
{
    switch (interfaceOrientationMask)
    {
            case UIInterfaceOrientationMaskPortrait:
            case UIInterfaceOrientationMaskLandscapeLeft:
            case UIInterfaceOrientationMaskLandscapeRight:
            case UIInterfaceOrientationMaskPortraitUpsideDown:
            case UIInterfaceOrientationMaskLandscape:
            case UIInterfaceOrientationMaskAll:
            _interfaceOrientationMask = interfaceOrientationMask;
            return;
            
        default:
            _interfaceOrientationMask = UIInterfaceOrientationMaskAllButUpsideDown;
            return;
    }
}

@end
