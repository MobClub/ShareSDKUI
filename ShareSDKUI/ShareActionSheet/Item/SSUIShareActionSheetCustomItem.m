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

@end

@implementation SSUIShareActionSheetCustomItem

- (instancetype)initWithIcon:(UIImage *)icon
                       label:(NSString *)label
                clickHandler:(void (^)())clickHandler
{
    if (self = [super init])
    {
        _icon = icon;
        _label = label;
        
        _clickHandler = clickHandler;
    }
    
    return self;
}

- (UIImage *)icon
{
    return _icon;
}

- (NSString *)label
{
    return _label;
}

- (void)triggerClick
{
    _clickHandler ();
}

@end
