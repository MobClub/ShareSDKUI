//
//  SSUIEditerViewController.h
//  ShareSDKUI
//
//  Created by Max on 2018/4/11.
//  Copyright © 2018年 Max. All rights reserved.
//

#import <UIKit/UIKit.h>
@class SSUIEditorConfiguration;
@class SSUIEditerViewController;
@class SSUIiPadEditorViewController;

@protocol SSUIEditerViewControllerDelegate <NSObject>

- (void)shareEditor:(SSUIEditerViewController *)editor didCancelShareWithContent:(NSString *)content;
- (void)shareEditor:(SSUIEditerViewController *)editor didShareWithContent:(NSString *)content authCallback:(void(^)(BOOL isAuthed))callback;

@end

@interface SSUIEditerViewController : UIViewController

@property (weak, nonatomic) id<SSUIEditerViewControllerDelegate> delegate;
@property (strong, nonatomic) NSMutableDictionary *params;
@property (strong, nonatomic) NSArray *platforms;
@property (copy, nonatomic) NSString *content;
@property (strong, nonatomic) SSDKImage *image;
@property (strong, nonatomic) SSUIEditorConfiguration *configuration;

@property (weak, nonatomic) UIWindow *window;
@property (assign, nonatomic) UIStatusBarStyle originalStyle;

@property (strong, nonatomic) UIButton *rightBarItemButton;
@property (strong, nonatomic) UIButton *leftBarItemButton;
@property (strong, nonatomic) UIActivityIndicatorView *indicatorView;
@property (copy, nonatomic) SSUIShareStateChangedHandler stateChangedHandler;

@end
