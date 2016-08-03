//
//  SSUIiPhoneEditorView.m
//  ShareSDKUI
//
//  Created by chenjd on 15/7/3.
//  Copyright (c) 2015年 mob. All rights reserved.
//

#import "SSUIiPhoneEditorView.h"
#import "SSUIShareContentEditorDef.h"
#import <MOBFoundation/MOBFColor.h>
#import <MOBFoundation/MOBFDevice.h>
#import <MOBFoundation/MOBFImage.h>

#import <ShareSDK/SSDKTypeDefine.h>
#import "SSUITypeDef.h"

#define PADDING_LEFT 5.0
#define PADDING_TOP 5.0
#define PADDING_RIGHT 5.0
#define PADDING_BOTTOM 5.0
#define HORIZONTAL_GAP 5.0

#define PAD_PADDING_LEFT 10.0
#define PAD_PADDING_TOP 10.0
#define PAD_PADDING_RIGHT 10.0
#define PAD_PADDING_BOTTOM 10.0
#define TOOLBAR_HEIGHT 32.0

@interface SSUIiPhoneEditorView ()
{
@private
    NSString *_content;
    SSDKImage *_image;
    NSArray *_platformTypes;
    
    SSUIiPhoneEditorToolBar *_toolbar; //工具栏
    SSDKPlatformType _platType;
    BOOL _needLayout;
    BOOL _firstTimeSet;
    UIInterfaceOrientation _interfaceOrientation;
}

/**
 *  内容视图
 */
@property (nonatomic, strong) UITextView *contentView;

@property (nonatomic, strong) UIImageView *picView;

@end

@implementation SSUIiPhoneEditorView

- (id)initWithFrame:(CGRect)frame
{
    self = [super initWithFrame:frame];
    if (self)
    {
        _contentView = [[UITextView alloc] initWithFrame:CGRectMake(0.0,
                                                                    0.0,
                                                                    SSUI_WIDTH(self),
                                                                    SSUI_HEIGHT(self))];
        _contentView.textColor = [MOBFColor colorWithRGB:0x767676];
        [self addSubview:_contentView];
        
        if (![MOBFDevice isPad])
        {
            _contentView.font = [UIFont systemFontOfSize:16];
            self.backgroundColor = [UIColor whiteColor];
        }
        else
        {
            _contentView.font = [UIFont systemFontOfSize:20];
        }
    }
    
    return self;
}

- (void)updateWithContent:(NSString *)content
                    image:(SSDKImage *)image
            platformTypes:(NSArray *)platformTypes
     interfaceOrientation:(UIInterfaceOrientation)interfaceOrientation
{
    _interfaceOrientation = interfaceOrientation;
    _platformTypes = platformTypes;
    _image = image;
    _content = content;
    //设置键盘焦点
    [_contentView becomeFirstResponder];
    _needLayout = YES;
    _firstTimeSet = YES;
    [self setNeedsLayout];
}

- (void)rotationToInterfaceOrientation:(UIInterfaceOrientation)interfaceOrientation
{
    _interfaceOrientation = interfaceOrientation;
    [self updateLayout];
}

- (void)setNeedsLayout
{
    _needLayout = YES;
    [self layoutSubviews];
}


- (void)layoutSubviews
{
    [super layoutSubviews];
    
    if (_needLayout)
    {
        _needLayout = NO;
        

        if ([_contentView.text isEqualToString:@""] && _firstTimeSet)
        {
            _contentView.text = _content;
            _firstTimeSet = NO;
        }

        
        NSMutableArray* shareList = [NSMutableArray array];
        
        _platType = [[_platformTypes objectAtIndex:0] integerValue];
        for (NSNumber *shareTypeNum in _platformTypes)
        {
            BOOL selected = NO;
            if ([shareTypeNum integerValue] == _platType)
            {
                selected = YES;
            }
            [shareList addObject:[NSMutableDictionary dictionaryWithObjectsAndKeys:
                                  shareTypeNum,
                                  KEY_TYPE,
                                  [NSNumber numberWithBool:selected],
                                  KEY_SELECTED,
                                  nil]];
                
            [_toolbar updateWithType:_platType platforms:shareList];   
        }

        if (!_toolbar)
        {
            _toolbar = [[SSUIiPhoneEditorToolBar alloc] initWithFrame:CGRectMake(0.0,
                                                                            SSUI_HEIGHT(self) - TOOLBAR_HEIGHT,
                                                                            SSUI_WIDTH(self),
                                                                            TOOLBAR_HEIGHT)];
            [self addSubview:_toolbar];
        
        }

        _toolbar.hidden = NO;
        [_toolbar updateWithType:_platType platforms:shareList];
        [self updateLayout];
    }
}


- (void)updateLayout
{
    if (UIInterfaceOrientationIsLandscape(_interfaceOrientation))
    {
        //横屏
        [self layoutLandscape];
    }
    else
    {
        //竖屏
        [self layoutPortrait];
    }
}

- (void)layoutLandscape
{
    CGFloat toolbarH = 0.0;
    CGFloat pLeft = PADDING_LEFT;
    CGFloat pRight = PADDING_RIGHT;
    CGFloat pTop = PADDING_TOP;
    CGFloat pBottom = PADDING_BOTTOM;
    
    if ([MOBFDevice isPad])
    {
        pLeft = PAD_PADDING_LEFT;
        pRight = PAD_PADDING_RIGHT;
        pTop = PAD_PADDING_TOP;
        pBottom = PAD_PADDING_BOTTOM;
    }
    
    if (!_toolbar.hidden)
    {
        toolbarH = TOOLBAR_HEIGHT;
        
        _toolbar.frame = CGRectMake(0.0,
                                    SSUI_HEIGHT(self) - TOOLBAR_HEIGHT,
                                    SSUI_WIDTH(self),
                                    TOOLBAR_HEIGHT);
    }
    
    if (_image)
    {
        
        CGFloat imgH ;
        CGFloat imgW ;
        imgH = self.frame.size.height * 0.6;
        imgW = self.frame.size.width * 0.2;
        
        //要对6,6+适量增大比例
        if ([UIScreen mainScreen].bounds.size.width > 666)
        {
            imgH = self.frame.size.height * 0.675;
        }
        
        if ([MOBFDevice isPad])
        {
            imgH = self.frame.size.height * 0.8;
        }
        
        //没有图片
        if (!_picView)
        {
            _picView = [[UIImageView alloc] initWithFrame:CGRectMake(SSUI_WIDTH(self) - pRight - imgW,
                                                                     pTop,
                                                                     imgW,
                                                                     imgH)];
            [self addSubview:_picView];
            
        }
        
        _picView.hidden = YES;
        _picView.frame = CGRectMake(SSUI_WIDTH(self) - pRight - imgW,
                                    pTop,
                                    imgW,
                                    imgH);
        _contentView.frame = CGRectMake(pLeft,
                                        pTop,
                                        SSUI_WIDTH(self) - pLeft - pRight,
                                        SSUI_HEIGHT(self) - pTop - pBottom - toolbarH);
        
        //带图片
        __weak SSUIiPhoneEditorView *theView = self;
        [_image getNativeImage:^(UIImage *image) {
            
            theView.picView.hidden = NO;
            
            
            //裁剪图片
            CGFloat vw = imgW;
            CGFloat vh = imgH;
            CGFloat w = image.size.width;
            CGFloat h = image.size.height;
            
            CGFloat scale = w / vw < h / vh ? w / vw : h / vh;
            
            vw = vw * scale;
            vh = vh * scale;
            
            CGRect rect = CGRectMake((w - vw) / 2, (h - vh) / 2, vw, vh);
            theView.picView.image = [MOBFImage clipImage:image withRect:rect];
            
            theView.contentView.frame = CGRectMake(pLeft,
                                                   pTop,
                                                   SSUI_WIDTH(theView) - pLeft - imgW - pRight - HORIZONTAL_GAP,
                                                   SSUI_HEIGHT(theView) - pTop - pBottom - toolbarH);
            
        }];
        
    }
    else
    {
        _picView.hidden = YES;
        _contentView.frame = CGRectMake(pLeft,
                                        pTop,
                                        SSUI_WIDTH(self) - pLeft - pRight,
                                        SSUI_HEIGHT(self) - pTop - pBottom - toolbarH);
    }
}

- (void)layoutPortrait
{
    
    CGFloat toolbarH = 0.0;
    CGFloat pLeft = PADDING_LEFT;
    CGFloat pRight = PADDING_RIGHT;
    CGFloat pTop = PADDING_TOP;
    CGFloat pBottom = PADDING_BOTTOM;
    
    if ([MOBFDevice isPad])
    {
        pLeft = PAD_PADDING_LEFT;
        pRight = PAD_PADDING_RIGHT;
        pTop = PAD_PADDING_TOP;
        pBottom = PAD_PADDING_BOTTOM;
    }
    
    if (!_toolbar.hidden)
    {
        toolbarH = TOOLBAR_HEIGHT;
        
        _toolbar.frame = CGRectMake(0.0,
                                    SSUI_HEIGHT(self) - TOOLBAR_HEIGHT,
                                    SSUI_WIDTH(self),
                                    TOOLBAR_HEIGHT);
    }
    
    //决定图片的高度
    if (_image)
    {
        CGFloat imgH ;
        CGFloat imgW ;
        imgH = self.frame.size.height * 0.8;
        imgW = self.frame.size.width * 0.3;
        
        //要对6,6+适量增大比例
        if ([UIScreen mainScreen].bounds.size.height > 666)
        {
            imgH = self.frame.size.height * 0.85;
        }
        
        if ([MOBFDevice isPad])
        {
            imgH = self.frame.size.height * 0.8;
        }
        
        if (!_picView)
        {
            _picView = [[UIImageView alloc] initWithFrame:CGRectMake(SSUI_WIDTH(self) - pRight - imgW,
                                                                     pTop,
                                                                     imgW,
                                                                     imgH)];
            [self addSubview:_picView];
            
        }
        
        _picView.hidden = YES;
        _picView.frame = CGRectMake(SSUI_WIDTH(self) - pRight - imgW,
                                    pTop,
                                    imgW,
                                    imgH);
        _contentView.frame = CGRectMake(pLeft,
                                        pTop,
                                        SSUI_WIDTH(self) - pLeft - pRight,
                                        SSUI_HEIGHT(self) - pTop - pBottom - toolbarH);
        
        __weak SSUIiPhoneEditorView *theView = self;
        [_image getNativeImage:^(UIImage *image) {
            
            theView.picView.hidden = NO;
            
            //裁剪图片
            CGFloat vw = imgW ;
            CGFloat vh = imgH;
            CGFloat w = image.size.width;
            CGFloat h = image.size.height;
            
            CGFloat scale = w / vw < h / vh ? w / vw : h / vh;
            
            vw = vw * scale;
            vh = vh * scale;
            
            CGRect rect = CGRectMake((w - vw) / 2, (h - vh) / 2, vw, vh);
            theView.picView.image = [MOBFImage clipImage:image withRect:rect];
            
            theView.contentView.frame = CGRectMake(pLeft,
                                                   pTop,
                                                   SSUI_WIDTH(theView) - pLeft - imgW - pRight - HORIZONTAL_GAP,
                                                   SSUI_HEIGHT(theView) - pTop - pBottom - toolbarH);
            
        }];
        
    }
    else
    {
        _picView.hidden = YES;
        _contentView.frame = CGRectMake(pLeft,
                                        pTop,
                                        SSUI_WIDTH(self) - pLeft - pRight,
                                        SSUI_HEIGHT(self) - pTop - pBottom - toolbarH);
    }
    
}


@end
