//
//  SSUIShareSheetViewController.h
//  ShareSDKUI
//
//  Created by Max on 2018/4/3.
//  Copyright © 2018年 Max. All rights reserved.
//

#import <UIKit/UIKit.h>
@class SSUIShareSheetConfiguration;
@class SSUIShareSheetViewController;
@class SSUIEditorConfiguration;

@protocol SSUIShareSheetViewControllerDelegate <NSObject>
- (void)shareSheet:(SSUIShareSheetViewController *)shareSheet didSelectPlatform:(id)platform params:(NSMutableDictionary *)params;
- (void)shareSheet:(SSUIShareSheetViewController *)shareSheet didCancelShareWithParams:(NSMutableDictionary *)params;
@end

@interface SSUIShareSheetViewController : UIViewController

@property (weak, nonatomic) UICollectionView *platformsCollectionView;
@property (weak, nonatomic) id<SSUIShareSheetViewControllerDelegate> delegate;
@property (strong, nonatomic) SSUIShareSheetConfiguration *configuration;
@property (strong, nonatomic) SSUIEditorConfiguration *editorConfiguration;

@property (strong, nonatomic) NSArray *platforms;
@property (strong, nonatomic) NSMutableDictionary *params;
@property (copy, nonatomic) SSUIShareStateChangedHandler stateChangedHandler;

@property (weak, nonatomic) UIWindow *window;
@property (assign, nonatomic) UIStatusBarStyle originalStyle;

// 菜单高度 暴露给ipad显示用
- (CGFloat)menuHeight;

//总行数 暴露给ipad显示用
- (NSInteger)totalRows;

// 隐藏菜单
- (void)hideSheetWithAnimationCompletion:(void (^)(void))completion;
@end
