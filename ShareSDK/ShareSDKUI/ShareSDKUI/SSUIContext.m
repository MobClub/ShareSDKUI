//
//  SSUIContext.m
//  ShareSDKUI
//
//  Created by Max on 2018/4/3.
//  Copyright © 2018年 Max. All rights reserved.
//

#import "SSUIContext.h"
#import "SSUIShareSheetViewController.h"
#import "SSUIEditerViewController.h"
#import "SSUIiPadEditorViewController.h"
#import "SSUIEditorNavigationController.h"
#import "SSUIHelper.h"
#import "SSUIPlatformItem.h"
#import <ShareSDK/ShareSDK+Base.h>

@interface SSUIContext() <SSUIShareSheetViewControllerDelegate,SSUIEditerViewControllerDelegate,UIPopoverPresentationControllerDelegate>

@property (strong, nonatomic) NSMutableArray *windows;

@end

@implementation SSUIContext

+ (instancetype)defaultContext
{
    static SSUIContext *_instance = nil;
    static dispatch_once_t defaultContextPredicate;
    dispatch_once(&defaultContextPredicate, ^{
        _instance = [[SSUIContext alloc] init];
        _instance.windows = [NSMutableArray array];
    });
    
    return _instance;
}

/**
 显示分享菜单
 */
- (id)showShareActionSheet:(UIView *)view
               customItems:(NSArray *)items
               shareParams:(NSMutableDictionary *)shareParams
        sheetConfiguration:(SSUIShareSheetConfiguration *)configuration
            onStateChanged:(SSUIShareStateChangedHandler)stateChangedHandler
{
    [ShareSDK enableAutomaticRecordingEvent:YES];
    
    SSUIShareSheetViewController *rootVc = [[SSUIShareSheetViewController alloc] init];
    rootVc.platforms = [[SSUIHelper shareHelper] activePlatformsWithCustomItems:items];
    rootVc.params = shareParams;
    rootVc.delegate = self;
    rootVc.configuration = configuration ?: [[SSUIShareSheetConfiguration alloc] init];
    rootVc.stateChangedHandler = stateChangedHandler;
    rootVc.originalStyle = [UIApplication sharedApplication].statusBarStyle;
    [[UIApplication sharedApplication] setStatusBarStyle:configuration.statusBarStyle];
    
    if ([MOBFDevice isPad])
    {
        if (view)
        {
            rootVc.modalPresentationStyle = UIModalPresentationPopover;
            rootVc.popoverPresentationController.sourceView = view;
            rootVc.popoverPresentationController.sourceRect = view.bounds;
            rootVc.popoverPresentationController.delegate = self;
            rootVc.preferredContentSize = CGSizeMake(kShareSheetiPadWidth, rootVc.menuHeight);
            
            [[MOBFViewController currentViewController] presentViewController:rootVc
                                                                     animated:YES
                                                                   completion:nil];
        }
        else
        {
            NSLog(@"#warning : It's necessary to point out a view for showShareActionSheet: ...");
        }
    }
    else
    {
        UIWindow *sheetWindow = [self carriarWindow];
        sheetWindow.rootViewController = rootVc;
        rootVc.window = sheetWindow;
        sheetWindow.hidden = NO;
    }
    
    if (!([MOBFDevice isPad] && view == nil))
    {
        [ShareSDK recordShareEventWithPlatform:0 eventType:SSDKShareEventTypeOpenMenu];
    }
    
    return rootVc;
}

/**
 显示编辑视图
 */
- (id)showShareEditor:(SSDKPlatformType)platformType
       otherPlatforms:(NSArray *)platformTypes
          shareParams:(NSMutableDictionary *)shareParams
  editorConfiguration:(SSUIEditorConfiguration *)configuration
       onStateChanged:(SSUIShareStateChangedHandler)stateChangedHandler
{
    [ShareSDK enableAutomaticRecordingEvent:YES];
    
    SSUIEditerViewController *editor = [[SSUIEditerViewController alloc] init];
    editor.configuration = configuration ?: [[SSUIEditorConfiguration alloc] init];
    editor.image = [[SSUIHelper shareHelper] extractImageWithParams:shareParams platform:platformType];
    editor.content = [[SSUIHelper shareHelper] extractContentWithParams:shareParams platform:platformType];
    NSArray *filedArr = [[SSUIHelper shareHelper] filteUnSupportOneKeySharePlatforms:platformTypes params:shareParams];
    platformType = [[SSUIHelper shareHelper] processPlatform:platformType];
    editor.platforms = [@[@(platformType)] arrayByAddingObjectsFromArray:filedArr];
    editor.delegate = self;
    editor.params = shareParams;
    editor.stateChangedHandler = stateChangedHandler;
    editor.originalStyle = [UIApplication sharedApplication].statusBarStyle;
    [[UIApplication sharedApplication] setStatusBarStyle:configuration.statusBarStyle];
    
    UIWindow *editorWindow = [self carriarWindow];
    editor.window = editorWindow;
    
    if ([MOBFDevice isPad])
    {
        SSUIiPadEditorViewController *iPadEditorVc = [[SSUIiPadEditorViewController alloc] init];
        iPadEditorVc.editorVc = editor;
        editorWindow.rootViewController = iPadEditorVc;
    }
    else
    {
        editorWindow.rootViewController = [[SSUIEditorNavigationController alloc] initWithRootViewController:editor];
    }

    [ShareSDK recordShareEventWithPlatform:platformType eventType:SSDKShareEventTypeOpenEditor];
    
    editorWindow.hidden = NO;
    return editorWindow;
}

- (void)dismissShareController:(id)controller
{
    if ([controller isKindOfClass:SSUIShareSheetViewController.class])
    {
        if ([MOBFDevice isPad])
        {
            [controller dismissViewControllerAnimated:YES completion:nil];
        }
        else
        {
            __weak typeof(self) weakSelf = self;
            [controller hideSheetWithAnimationCompletion:^{
                [weakSelf _dismissWindowForController:controller];
            }];
        }
    }
    
    if ([controller isKindOfClass:SSUIEditerViewController.class])
    {
        [self _dismissWindowForController:controller];
    }
}

- (void)shareActionSheet:(id)sheet setEditorConfiguration:(SSUIEditorConfiguration *)configuration
{
    SSUIShareSheetViewController *shareSheet = sheet;
    shareSheet.editorConfiguration = configuration;
}

#pragma mark - SSUIShareSheetViewControllerDelegate

- (void)shareSheet:(SSUIShareSheetViewController *)shareSheet didSelectPlatform:(id)platform params:(NSMutableDictionary *)params
{
    if ([MOBFDevice isPad])
    {
        [[UIApplication sharedApplication] setStatusBarStyle:shareSheet.originalStyle];
        [shareSheet dismissViewControllerAnimated:YES completion:nil];
    }
    else
    {
        [self _dismissWindowForController:shareSheet];
    }

    SSUIShareStateChangedHandler handler = shareSheet.stateChangedHandler;
    if ([platform isKindOfClass:NSNumber.class])
    {
        SSDKPlatformType type = [platform integerValue];
        if ([[SSUIHelper shareHelper] shareDirectlyWithPlatform:type directSharePlatforms:shareSheet.configuration.directSharePlatforms.mutableCopy])
        {
            [ShareSDK share:type parameters:params onStateChanged:^(SSDKResponseState state, NSDictionary *userData, SSDKContentEntity *contentEntity, NSError *error) {
                if (handler)
                {
                    handler(state, type, userData, contentEntity, error, state != SSDKResponseStateBegin);
                }
            }];
        }
        else
        {
            [self showShareEditor:type otherPlatforms:nil shareParams:params editorConfiguration:shareSheet.editorConfiguration onStateChanged:handler];
        }
    }
    
    if ([platform isKindOfClass:SSUIPlatformItem.class])
    {
        [platform triggerClick];
    }
}

- (void)shareSheet:(SSUIShareSheetViewController *)shareSheet didCancelShareWithParams:(NSMutableDictionary *)params
{
    if (shareSheet.stateChangedHandler)
    {
        shareSheet.stateChangedHandler(SSDKResponseStateCancel, SSDKPlatformTypeUnknown, nil, nil, nil, YES);
    }
    [ShareSDK recordShareEventWithPlatform:0 eventType:SSDKShareEventTypeCloseMenu];
    [self dismissShareController:shareSheet];
}


- (void)shareEditor:(SSUIEditerViewController *)editor didShareWithContent:(NSString *)content authCallback:(void (^)(BOOL))callback
{
    SSDKPlatformType platform = [editor.platforms.firstObject integerValue];
    if ([[SSUIHelper shareHelper] checkIfNeedAuthWithPlatform:platform])
    {
        [ShareSDK authorize:platform settings:nil onStateChanged:^(SSDKResponseState state, SSDKUser *user, NSError *error) {
            
            if (state != SSDKResponseStateBegin)
            {
                callback(state==SSDKResponseStateSuccess);
            }
            
            if (state == SSDKResponseStateSuccess)
            {
                [self _beginShareForEditor:editor content:content];
            }
            
            if (state == SSDKResponseStateFail)
            {
                [[[UIAlertView alloc] initWithTitle: SSUILocalized(@"Alert")
                                            message:[NSString stringWithFormat:@"%@, error message:%@",SSUILocalized(@"AuthorizeFailed"), error.userInfo]
                                           delegate:nil
                                  cancelButtonTitle:SSUILocalized(@"OK")
                                  otherButtonTitles:nil] show];
            }
        }];
    }
    else
    {
        [self _beginShareForEditor:editor content:content];
    }
}

- (void)shareEditor:(SSUIEditerViewController *)editor didCancelShareWithContent:(NSString *)content
{
    if (editor.stateChangedHandler)
    {
        editor.stateChangedHandler(SSDKResponseStateCancel, [editor.platforms.firstObject integerValue], nil, nil, nil, YES);
    }
    
    [self _dismissWindowForController:editor];
}


- (void)_beginShareForEditor:(SSUIEditerViewController *)editor content:(NSString *)content
{
    NSMutableDictionary *params = [[SSUIHelper shareHelper] editedParamsWithContent:content orginalParams:editor.params];
    SSUIShareStateChangedHandler handler = editor.stateChangedHandler;
    NSMutableArray *authedPlatforms = [[SSUIHelper shareHelper] filteAuthedPlatforms:editor.platforms];
    __block NSInteger count = authedPlatforms.count;
    for (NSNumber *obj in authedPlatforms)
    {
        [ShareSDK share:obj.integerValue parameters:params onStateChanged:^(SSDKResponseState state, NSDictionary *userData, SSDKContentEntity *contentEntity, NSError *error) {
            
            if (state != SSDKResponseStateBegin)
            {
                count--;
            }
            
            if (handler)
            {
                handler(state, obj.integerValue, userData, contentEntity, error, count==0);
            }
        }];
    }
    
    [self dismissShareController:editor];
}

- (void)_dismissWindowForController:(id)controller
{
    [[UIApplication sharedApplication] setStatusBarStyle:[controller originalStyle]];
    [controller window].hidden = YES;
    if ([self.windows containsObject:[controller window]])
    {
        [self.windows removeObject:[controller window]];
    }
}

#pragma mark - UIPopoverPresentationControllerDelegate

- (UIModalPresentationStyle)adaptivePresentationStyleForPresentationController:(UIPresentationController *)controller
{
    return UIModalPresentationNone;
}

- (BOOL)popoverPresentationControllerShouldDismissPopover:(UIPopoverPresentationController *)popoverPresentationController
{
    SSUIShareSheetViewController *sheet = [popoverPresentationController valueForKey:@"contentViewController"];
    [[UIApplication sharedApplication] setStatusBarStyle:sheet.originalStyle];
    return  YES;
}

- (void)popoverPresentationControllerDidDismissPopover:(UIPopoverPresentationController *)popoverPresentationController
{
    SSUIShareSheetViewController *sheet = [popoverPresentationController valueForKey:@"contentViewController"];
    [self shareSheet:sheet  didCancelShareWithParams:sheet.params];
}

#pragma mark - Getter

- (UIWindow *)carriarWindow
{
    UIWindow *carriarWindow = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
    carriarWindow.windowLevel = [UIApplication sharedApplication].keyWindow.windowLevel + 1;
    carriarWindow.backgroundColor = [UIColor clearColor];
    [self.windows addObject:carriarWindow];
    return carriarWindow;
}

@end
