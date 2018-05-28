//
//  ShareSDK+SSUI.m
//  ShareSDKUI
//
//  Created by Max on 2018/4/3.
//  Copyright © 2018年 Max. All rights reserved.
//

#import "ShareSDK+SSUI.h"
#import "SSUIContext.h"

@implementation ShareSDK (SSUI)

+ (id)showShareActionSheet:(UIView *)view
               customItems:(NSArray *)items
               shareParams:(NSMutableDictionary *)shareParams
        sheetConfiguration:(SSUIShareSheetConfiguration *)configuration
            onStateChanged:(SSUIShareStateChangedHandler)stateChangedHandler
{
    return [[SSUIContext defaultContext] showShareActionSheet:view
                                                  customItems:items
                                                  shareParams:shareParams
                                           sheetConfiguration:configuration
                                               onStateChanged:stateChangedHandler];
}

+ (void)shareActionSheet:(id)sheet setEditorConfiguration:(SSUIEditorConfiguration *)configuration
{
    [[SSUIContext defaultContext] shareActionSheet:sheet setEditorConfiguration:configuration];
}

+ (id)showShareEditor:(SSDKPlatformType)platformType
       otherPlatforms:(NSArray *)platformTypes
          shareParams:(NSMutableDictionary *)shareParams
  editorConfiguration:(SSUIEditorConfiguration *)configuration
       onStateChanged:(SSUIShareStateChangedHandler)stateChangedHandler
{
    return [[SSUIContext defaultContext] showShareEditor:platformType
                                          otherPlatforms:(NSArray *)platformTypes
                                             shareParams:shareParams
                                     editorConfiguration:configuration
                                          onStateChanged:stateChangedHandler];
}

+ (void)dismissShareController:(id)controller
{
    [[SSUIContext defaultContext] dismissShareController:controller];
}

@end
