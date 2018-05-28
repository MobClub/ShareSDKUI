//
//  SSUIContext.h
//  ShareSDKUI
//
//  Created by Max on 2018/4/3.
//  Copyright © 2018年 Max. All rights reserved.
//

#import <UIKit/UIKit.h>
#import "SSUITypeDef.h"
#import "SSUIShareSheetConfiguration.h"
#import "SSUIEditorConfiguration.h"

@interface SSUIContext : NSObject

/**
 单例对象
 */
+ (instancetype)defaultContext;

- (id)showShareActionSheet:(UIView *)view
                 customItems:(NSArray *)items
                 shareParams:(NSMutableDictionary *)shareParams
          sheetConfiguration:(SSUIShareSheetConfiguration *)config
              onStateChanged:(SSUIShareStateChangedHandler)stateChangedHandler;

- (id)showShareEditor:(SSDKPlatformType)platformType
         otherPlatforms:(NSArray *)platformTypes
            shareParams:(NSMutableDictionary *)shareParams
    editorConfiguration:(SSUIEditorConfiguration *)config
         onStateChanged:(SSUIShareStateChangedHandler)shareStateChangedHandler;

- (void)shareActionSheet:(id)sheet setEditorConfiguration:(SSUIEditorConfiguration *)configuration;

- (void)dismissShareController:(id)controller;

@end
