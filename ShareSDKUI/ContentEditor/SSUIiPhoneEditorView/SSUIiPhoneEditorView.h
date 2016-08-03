//
//  SSUIiPhoneEditorView.h
//  ShareSDKUI
//
//  Created by chenjd on 15/7/3.
//  Copyright (c) 2015年 mob. All rights reserved.
//

#import <UIKit/UIKit.h>
#import <ShareSDK/ShareSDK.h>
#import "SSUIiPhoneEditorToolBar.h"
@interface SSUIiPhoneEditorView : UIView

@property (nonatomic,readonly) NSArray *platformTypes;

/**
 *	@brief	分享内容
 */
@property (nonatomic,readonly) NSString* content;

/**
 *	@brief	内容视图
 */
@property (nonatomic,readonly) UITextView *contentView;

@property (nonatomic,readonly) SSUIiPhoneEditorToolBar *toolbar;

@property (nonatomic,strong) NSMutableArray* selectedPlatformArray;
/**
 *	@brief	旋转到对应设备方向
 *
 *	@param 	interfaceOrientation 	设备方向
 */
- (void)rotationToInterfaceOrientation:(UIInterfaceOrientation)interfaceOrientation;


- (void)updateWithContent:(NSString *)content
                    image:(SSDKImage *)image
            platformTypes:(NSArray *)platformTypes
     interfaceOrientation:(UIInterfaceOrientation)interfaceOrientation;

@end
