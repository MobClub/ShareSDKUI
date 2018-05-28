//
//  ShareSDK+SSUIDeprecated.m
//  ShareSDKUI
//
//  Created by Max on 2018/4/27.
//  Copyright © 2018年 mob. All rights reserved.
//

#import "ShareSDK+SSUIDeprecated.h"
#import "ShareSDK+SSUI.h"
#import "SSUIShareActionSheetStyle.h"
#import "SSUIEditorViewStyle.h"

@implementation ShareSDK (SSUIDeprecated)

+ (id)showShareActionSheet:(UIView *)view
                     items:(NSArray *)items
               shareParams:(NSMutableDictionary *)shareParams
       onShareStateChanged:(SSUIShareStateChangedHandler)shareStateChangedHandler
{
    return [ShareSDK showShareActionSheet:view customItems:items shareParams:shareParams sheetConfiguration:[SSUIShareActionSheetStyle defaultSheetStyle] onStateChanged:shareStateChangedHandler];
}

+ (id)showShareEditor:(SSDKPlatformType)platformType
   otherPlatformTypes:(NSArray *)otherPlatformTypes
          shareParams:(NSMutableDictionary *)shareParams
  onShareStateChanged:(SSUIShareStateChangedHandler)shareStateChangedHandler
{
    return [ShareSDK showShareEditor:platformType otherPlatforms:otherPlatformTypes shareParams:shareParams editorConfiguration:[SSUIEditorViewStyle defaultEditorStyle] onStateChanged:shareStateChangedHandler];
}

+ (void)setSupportedInterfaceOrientation:(UIInterfaceOrientationMask)toInterfaceOrientation
{
    [SSUIShareActionSheetStyle setSupportedInterfaceOrientation:toInterfaceOrientation];
    [SSUIEditorViewStyle setSupportedInterfaceOrientation:toInterfaceOrientation];
}

@end
