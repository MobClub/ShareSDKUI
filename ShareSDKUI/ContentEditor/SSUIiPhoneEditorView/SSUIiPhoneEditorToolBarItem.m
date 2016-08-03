//
//  SSUIiPhoneEditorToolBarItem.m
//  ShareSDKUI
//
//  Created by chenjd on 15/7/6.
//  Copyright (c) 2015年 mob. All rights reserved.
//

#import "SSUIiPhoneEditorToolBarItem.h"
#import "SSUIShareContentEditorDef.h"
#import <ShareSDK/SSDKTypeDefine.h>
#import <MOBFoundation/MOBFImage.h>
#import "SSUITypeDef.h"
#import "SSUIShareActionSheetStyle_Private.h"

#define ICON_WIDTH 21
#define ICON_HEIGHT 21

#define KEY_TYPE @"type"
#define KEY_TITLE @"title"
#define KEY_SELECTED @"selected"
#define KEY_USERNAME @"username"
#define KEY_USERICON @"uicon"
#define KEY_IS_GET_INFO @"isGetInfo"

@implementation SSUIiPhoneEditorToolBarItem

@synthesize delegate = _delegate;
@synthesize data = _data;

- (id)initWithReuseIdentifier:(NSString *)reuseIdentifier
{
    if (self = [super initWithReuseIdentifier:reuseIdentifier])
    {
        self.backgroundColor = [UIColor clearColor];
        
        //以宽度为主的正方形图标
        _iconView = [[UIImageView alloc] initWithFrame:CGRectMake((SSUI_WIDTH(self) - ICON_WIDTH) / 2,
                                                                  (SSUI_HEIGHT(self) - ICON_HEIGHT) / 2,
                                                                  ICON_WIDTH,
                                                                  ICON_HEIGHT)];
        _iconView.autoresizingMask = UIViewAutoresizingFlexibleLeftMargin | UIViewAutoresizingFlexibleRightMargin | UIViewAutoresizingFlexibleTopMargin | UIViewAutoresizingFlexibleBottomMargin;
        [self addSubview:_iconView];
    }
    
    return self;
}

- (void)setData:(NSMutableDictionary *)data
{
    _data = data;
    
    _needLayout = YES;
    [self setNeedsLayout];
}

- (void)layoutSubviews
{
    [super layoutSubviews];
    
    if (_needLayout && _data)
    {
        _needLayout = NO;
        
        NSString *bundlePath = [[NSBundle mainBundle] pathForResource:@"ShareSDKUI"
                                                               ofType:@"bundle"];
        NSBundle *uiBundle = [NSBundle bundleWithPath:bundlePath];
        UIImage *iconImage = [MOBFImage imageName:[NSString stringWithFormat:@"Icon/sns_icon_%ld.png",
                                                   (long)[[_data objectForKey:KEY_TYPE] integerValue]]
                                           bundle:uiBundle];
        
        if ([SSUIShareActionSheetStyle sharedInstance].style == ShareActionSheetStyleSimple)
        {
            iconImage = [MOBFImage imageName:[NSString stringWithFormat:@"Icon_simple/sns_icon_%ld.png",
                                  (long)[[_data objectForKey:KEY_TYPE] integerValue]]
                          bundle:uiBundle];
        }
        
        BOOL selected = [[_data objectForKey:KEY_SELECTED] boolValue];
        
        if (!selected)
        {
            iconImage = [self getGrayImage:iconImage];
        }
        
         _iconView.image = iconImage;
    }
}

//获取灰度图方法
- (UIImage *)getGrayImage:(UIImage *)sourceImage
{
    int width = sourceImage.size.width;
    int height = sourceImage.size.height;
    
    CGColorSpaceRef colorSpace = CGColorSpaceCreateDeviceGray();
    
    CGContextRef context = NULL;
    
    if ([SSUIShareActionSheetStyle sharedInstance].style == ShareActionSheetStyleSimple)
    {
        context = CGBitmapContextCreate (nil,
                                         width,
                                         height,
                                         8,
                                         0,
                                         colorSpace,
                                         kCGImageAlphaOnly);
    }
    else
    {
        context = CGBitmapContextCreate (nil,
                                         width,
                                         height,
                                         8,
                                         0,
                                         colorSpace,
                                         kCGBitmapByteOrderDefault);
    }

    
    CGColorSpaceRelease(colorSpace);
    
    if (context == NULL)
    {
        return nil;
    }
    
    CGContextDrawImage(context,
                       CGRectMake(0, 0, width, height),
                       sourceImage.CGImage);
    
    CGImageRef img = CGBitmapContextCreateImage(context);
    UIImage *grayImage = [UIImage imageWithCGImage:img];
    UIImage *finalImage = [MOBFImage roundRectImage:grayImage
                                           withSize:CGSizeMake(30 , 30)
                                          ovalWidth:5.0
                                         ovalHeight:5.0
                                           ovalType:MOBFOvalTypeAll];
    CGContextRelease(context);
    CFRelease(img);
    
    return finalImage;
}

- (void)touchesEnded:(NSSet *)touches withEvent:(UIEvent *)event
{
    [super touchesEnded:touches withEvent:event];
    
    if ([_delegate conformsToProtocol:@protocol(SSUIHorizontalTableViewItemDelegate)] &&
        [_delegate respondsToSelector:@selector(itemOnClick:)])
    {
        [_delegate itemOnClick:self];
    }
}


@end
