//
//  ShareSDKUI.m
//  ShareSDKUI
//
//  Created by fenghj on 15/6/18.
//  Copyright (c) 2015年 mob. All rights reserved.
//

#import "ShareSDKUI.h"
#import "SSUIShareActionSheetController.h"

@implementation ShareSDKUI

+ (SSUIShareActionSheetController *)shareActionSheetWithItems:(NSArray *)items
{
    return [[SSUIShareActionSheetController alloc] initWithItems:items];
}

+ (SSUIShareContentEditorViewController *)contentEditorViewWithContent:(NSString *)content
                                                                 image:(SSDKImage *)image
                                                         platformTypes:(NSArray *)platformTypes
{
    return [[SSUIShareContentEditorViewController alloc] initWithContent:content image:image platformTypes:platformTypes];
}

@end
