//
//  SSUIBaseShareContentEditor_Private.h
//  ShareSDKUI
//
//  Created by fenghj on 15/6/18.
//  Copyright (c) 2015年 mob. All rights reserved.
//

#import "SSUIBaseShareContentEditor.h"

@interface SSUIBaseShareContentEditor ()

/**
 *  内容
 */
@property (nonatomic, copy) NSString *content;

/**
 *  图片
 */
@property (nonatomic, strong) SSDKImage *image;

/**
 *  平台列表
 */
@property (nonatomic, strong) NSArray *platformTypes;

/**
 *  提交事件处理器
 */
@property (nonatomic, copy) SSUIShareContentEditorViewSubmitHandler submitHandler;

/**
 *  取消事件处理器
 */
@property (nonatomic, copy) SSUIShareContentEditorViewCancelHandler cancelHandler;

@end
