//
//  SSUIShareActionSheetCustomItem.m
//  ShareSDKUI
//
//  Created by fenghj on 15/6/18.
//  Copyright (c) 2015年 mob. All rights reserved.
//

#import "SSUIShareActionSheetCustomItem.h"

@interface SSUIShareActionSheetCustomItem ()
{
@private
    void (^_clickHandler) ();
}

/**
 *  图标
 */
@property (nonatomic, strong) UIImage *customIcon;

/**
 *  标签
 */
@property (nonatomic, copy) NSString *customLabel;

@end

@implementation SSUIShareActionSheetCustomItem

- (instancetype)initWithIcon:(UIImage *)icon
                       label:(NSString *)label
                clickHandler:(void (^)())clickHandler
{
    if (self = [super init])
    {
        self.customIcon = icon;
        self.customLabel = label;
        
        _clickHandler = clickHandler;
    }
    
    return self;
}

- (UIImage *)icon
{
    return self.customIcon;
}

- (NSString *)label
{
    return self.customLabel;
}

- (void)triggerClick
{
    _clickHandler ();
}

@end
