//
//  SSUIEditorConfiguration.m
//  ShareSDKUI
//
//  Created by Max on 2018/4/10.
//  Copyright © 2018年 Max. All rights reserved.
//

#import "SSUIEditorConfiguration.h"

@implementation SSUIEditorConfiguration

- (instancetype)init
{
    if (self = [super init])
    {
        _title = SSUILocalized(@"ShareContent");
        _cancelButtonTitle = SSUILocalized(@"Cancel");
        _shareButtonTitle = SSUILocalized(@"Share");
        _interfaceOrientationMask = UIInterfaceOrientationMaskAll;
        _editorViewBackgroundColor = [UIColor whiteColor];
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
