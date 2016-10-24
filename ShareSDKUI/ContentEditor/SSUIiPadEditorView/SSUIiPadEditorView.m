//
//  SSUIiPadEditorView.m
//  ShareSDKUI
//
//  Created by chenjd on 15/7/6.
//  Copyright (c) 2015年 mob. All rights reserved.
//

#import "SSUIiPadEditorView.h"
#import "SSUIShareContentEditorDef.h"
#import "SSUIEditorViewStyle_Private.h"
#define NAV_BAR_HEIGHT 44.0

#define NAV_BAR_PADDING_LEFT 10.0
#define NAV_BAR_PADDING_RIGHT 10.0

#define ORIGINAL_FRAME_X 144.0
#define ORIGINAL_FRAME_Y 60.0
#define ORIGINAL_FRAME_W 480.0
#define ORIGINAL_FRAME_H 300.0
#define GAP 5.0

@interface SSUIiPadEditorView()
{
@private
    UIButton *_cancelButton;
    UIButton *_sendButton;
    UILabel *_titleView;
    SSUIiPhoneEditorView *_contentView;
    NSArray *_platformTypes;
    SSDKImage *_image;
    BOOL _needRelayout;
}
@end

@implementation SSUIiPadEditorView

- (id)initWithFrame:(CGRect)frame
{
    self = [super initWithFrame:frame];
    if (self)
    {
        
        self.backgroundColor = [UIColor whiteColor];
        self.layer.cornerRadius = 10;

        _cancelButton = [UIButton buttonWithType:UIButtonTypeRoundedRect];
        if ([SSUIEditorViewStyle sharedInstance].cancelButtonLabel)
        {
            [_cancelButton setTitle:[SSUIEditorViewStyle sharedInstance].cancelButtonLabel forState:UIControlStateNormal];
        }
        else
        {
            [_cancelButton setTitle:NSLocalizedStringWithDefaultValue(@"Cancel", @"ShareSDKUI_Localizable", [NSBundle bundleWithPath:[[NSBundle mainBundle] pathForResource:@"ShareSDKUI" ofType:@"bundle"]], @"Cancel", nil) forState:UIControlStateNormal];
        }
        
        [_cancelButton setTitleColor:[MOBFColor colorWithRGB:0x007aff] forState:UIControlStateNormal];
        _cancelButton.titleLabel.font = [UIFont systemFontOfSize:15];
        [_cancelButton addTarget:self action:@selector(cancelButtonClickHandler:) forControlEvents:UIControlEventTouchUpInside];
        [_cancelButton sizeToFit];
        _cancelButton.frame = CGRectMake(NAV_BAR_PADDING_LEFT,
                                         (NAV_BAR_HEIGHT - SSUI_HEIGHT(_cancelButton)) / 2,
                                         SSUI_WIDTH(_cancelButton),
                                         SSUI_HEIGHT(_cancelButton));
        _cancelButton.autoresizingMask = UIViewAutoresizingFlexibleLeftMargin | UIViewAutoresizingFlexibleRightMargin | UIViewAutoresizingFlexibleBottomMargin | UIViewAutoresizingFlexibleTopMargin;
        
        _sendButton = [UIButton buttonWithType:UIButtonTypeRoundedRect];
        
        if ([SSUIEditorViewStyle sharedInstance].shareButtonLabel)
        {
            [_sendButton setTitle:[SSUIEditorViewStyle sharedInstance].shareButtonLabel forState:UIControlStateNormal];
        }
        else
        {
            
            [_sendButton setTitle:NSLocalizedStringWithDefaultValue(@"Share",
                                                                    @"ShareSDKUI_Localizable",
                                                                    [NSBundle bundleWithPath:[[NSBundle mainBundle] pathForResource:@"ShareSDKUI" ofType:@"bundle"]],
                                                                    @"Share", nil)
                         forState:UIControlStateNormal];
        }
        
        [_sendButton setTitleColor:[MOBFColor colorWithRGB:0x007aff] forState:UIControlStateNormal];
        _sendButton.titleLabel.font = [UIFont systemFontOfSize:15];
        [_sendButton addTarget:self action:@selector(sendButtonClickHandler:) forControlEvents:UIControlEventTouchUpInside];
        [_sendButton sizeToFit];
        _sendButton.frame = CGRectMake(SSUI_WIDTH(self) - NAV_BAR_PADDING_RIGHT - SSUI_WIDTH(_sendButton),
                                       (NAV_BAR_HEIGHT - SSUI_HEIGHT(_sendButton)) / 2,
                                       SSUI_WIDTH(_sendButton),
                                       SSUI_HEIGHT(_sendButton));
        _sendButton.autoresizingMask = UIViewAutoresizingFlexibleLeftMargin |
        UIViewAutoresizingFlexibleRightMargin |
        UIViewAutoresizingFlexibleBottomMargin |
        UIViewAutoresizingFlexibleTopMargin;
        
        
        _titleView = [[UILabel alloc] initWithFrame:CGRectZero];
        _titleView.font = [UIFont systemFontOfSize:17];
        _titleView.textColor = [UIColor blackColor];
        _titleView.text = NSLocalizedStringWithDefaultValue(@"ShareContent",
                                                            @"ShareSDKUI_Localizable",
                                                            [NSBundle bundleWithPath:[[NSBundle mainBundle] pathForResource:@"ShareSDKUI" ofType:@"bundle"]],
                                                            @"ShareContent",
                                                            nil);
        
        [_titleView sizeToFit];
        _titleView.frame = CGRectMake((SSUI_WIDTH(self) - SSUI_WIDTH(_titleView)) / 2,
                                      (NAV_BAR_HEIGHT - SSUI_HEIGHT(_titleView)) / 2,
                                      SSUI_WIDTH(_titleView),
                                      SSUI_HEIGHT(_titleView));
        _titleView.autoresizingMask = UIViewAutoresizingFlexibleLeftMargin|
        UIViewAutoresizingFlexibleRightMargin |
        UIViewAutoresizingFlexibleBottomMargin |
        UIViewAutoresizingFlexibleTopMargin;
        
        [self setUIStyle];
        [self addSubview:_cancelButton];
        [self addSubview:_sendButton];
        [self addSubview:_titleView];

        NSString *bundlePath = [[NSBundle mainBundle] pathForResource:@"ShareSDKUI" ofType:@"bundle"];
        UIImageView *lineView = [[UIImageView alloc] initWithImage:[MOBFImage imageName:@"ContentEditorImg/line@2x.gif" bundle:[NSBundle bundleWithPath:bundlePath]]];
        lineView.backgroundColor =  [UIColor greenColor];
        lineView.frame = CGRectMake(0.0,
                                    NAV_BAR_HEIGHT - 1,
                                    SSUI_WIDTH(self),
                                    SSUI_HEIGHT(lineView));
        lineView.autoresizingMask = UIViewAutoresizingFlexibleWidth;
        [self addSubview:lineView];

        _contentView = [[SSUIiPhoneEditorView alloc] initWithFrame:CGRectMake(0.0,
                                                                              NAV_BAR_HEIGHT, SSUI_WIDTH(self),
                                                                              SSUI_HEIGHT(self) - NAV_BAR_HEIGHT)];
        if ([SSUIEditorViewStyle sharedInstance].contentViewBackgroundColor) {
            [_contentView setBackgroundColor:[SSUIEditorViewStyle sharedInstance].contentViewBackgroundColor];
        }
        _needRelayout= NO;
        [self addSubview:_contentView];
        
    }
    
    return self;
}

- (void)setUIStyle
{
    
    if ([SSUIEditorViewStyle sharedInstance].title)
    {
        _titleView.text = [SSUIEditorViewStyle sharedInstance].title;
    }
    
    if ([SSUIEditorViewStyle sharedInstance].titleColor)
    {
        _titleView.textColor = [SSUIEditorViewStyle sharedInstance].titleColor;
    }
    
    if ([SSUIEditorViewStyle sharedInstance].cancelButtonImage)
    {
         [_cancelButton setBackgroundImage:[SSUIEditorViewStyle sharedInstance].cancelButtonImage
                                  forState:UIControlStateNormal];
    }
    
    if ([SSUIEditorViewStyle sharedInstance].cancelButtonLabelColor)
    {
        [_cancelButton setTitleColor:[SSUIEditorViewStyle sharedInstance].cancelButtonLabelColor
                            forState:UIControlStateNormal];
    }
    
    if ([SSUIEditorViewStyle sharedInstance].shareButtonImage)
    {
        [_sendButton setBackgroundImage:[SSUIEditorViewStyle sharedInstance].shareButtonImage
                               forState:UIControlStateNormal];
    }
    
    if ([SSUIEditorViewStyle sharedInstance].shareButtonLabelColor)
    {
        [_sendButton setTitleColor:[SSUIEditorViewStyle sharedInstance].shareButtonLabelColor
                          forState:UIControlStateNormal];
    }
    
    if ([SSUIEditorViewStyle sharedInstance].iPadNavigationbarBackgroundColor)
    {
        [self setBackgroundColor:[SSUIEditorViewStyle sharedInstance].iPadNavigationbarBackgroundColor];
    }
    
}

- (void)updateWithType:(NSArray *)platType
               content:(NSString *)content
                 image:(SSDKImage *)image
  interfaceOrientation:(UIInterfaceOrientation)interfaceOrientation
        viewController:(UIViewController *)viewController
{
    
    _platformTypes = platType;
    _image = image;
    [_contentView updateWithContent:content
                              image:image
                      platformTypes:platType
               interfaceOrientation:interfaceOrientation];
    
}



- (void)updateLayoutWithSplitViewSize:(CGSize)size
{
    CGFloat width = size.width;
    if (width < ORIGINAL_FRAME_W)
    {
        self.frame = CGRectMake(GAP,
                                ORIGINAL_FRAME_Y ,
                                width - 2*GAP ,
                                ORIGINAL_FRAME_H);
        
        _contentView.frame = CGRectMake(0,
                                        NAV_BAR_HEIGHT,
                                        width - 2*GAP,
                                        SSUI_HEIGHT(self) - NAV_BAR_HEIGHT);
        [_contentView setNeedsLayout];
     
    }
    else
    {
        self.frame = CGRectMake((width - ORIGINAL_FRAME_W)/2,
                                ORIGINAL_FRAME_Y,
                                ORIGINAL_FRAME_W,
                                ORIGINAL_FRAME_H);
        
        _contentView.frame = CGRectMake(0.0,
                                        NAV_BAR_HEIGHT,
                                        ORIGINAL_FRAME_W,
                                        SSUI_HEIGHT(self) - NAV_BAR_HEIGHT);
        [_contentView setNeedsLayout];
    }
}

- (void)cancelButtonClickHandler:(id)sender
{
    [_contentView.contentView resignFirstResponder];
    
    if (self.cancelHandler)
    {
        self.cancelHandler();
    }
}

- (void)sendButtonClickHandler:(id)sender
{
    if (self.submitHandler)
    {
        [_contentView.contentView resignFirstResponder];
        
        NSMutableArray *selectedPlatform =[[_contentView.toolbar selectedPlatforms] mutableCopy];
        
        NSString *contentText = _contentView.contentView.text;
        if (![contentText isEqualToString:@""])
        {
            BOOL needAuthorize = YES;
            NSMutableArray *unNeedAuthorizedPlatforms = [NSMutableArray arrayWithArray:@[@(SSDKPlatformTypeWechat),
                                                                                         @(SSDKPlatformTypeQQ),
                                                                                         @(SSDKPlatformSubTypeQZone),
                                                                                         @(SSDKPlatformSubTypeQQFriend),
                                                                                         @(SSDKPlatformSubTypeWechatSession),
                                                                                         @(SSDKPlatformSubTypeWechatTimeline),
                                                                                         @(SSDKPlatformSubTypeWechatFav),
                                                                                         @(SSDKPlatformTypeSMS),
                                                                                         @(SSDKPlatformTypeMail),
                                                                                         @(SSDKPlatformTypeCopy),
                                                                                         @(SSDKPlatformTypeGooglePlus),
                                                                                         @(SSDKPlatformTypeInstagram),
                                                                                         @(SSDKPlatformTypeWhatsApp),
                                                                                         @(SSDKPlatformTypeLine),
                                                                                         @(SSDKPlatformTypeKakao),
                                                                                         @(SSDKPlatformSubTypeKakaoTalk),
                                                                                         @(SSDKPlatformTypeAliPaySocial),
                                                                                         @(SSDKPlatformTypeAliPaySocialTimeline),
                                                                                         @(SSDKPlatformTypePrint),
                                                                                         @(SSDKPlatformTypeFacebookMessenger)
//                                                                                         ,@(SSDKPlatformTypeDingTalk)
                                                                                         ]];
            
            if ([SSUIEditorViewStyle sharedInstance].unNeedAuthPlatforms.count > 0)
            {
                //如果检测到包含不需要授权的平台
                [unNeedAuthorizedPlatforms addObjectsFromArray:[SSUIEditorViewStyle sharedInstance].unNeedAuthPlatforms];
                [[SSUIEditorViewStyle sharedInstance].unNeedAuthPlatforms removeAllObjects];
            }

            if ([unNeedAuthorizedPlatforms containsObject:[_platformTypes objectAtIndex:0]])
            {
                needAuthorize = NO;
            }
            
            if (!needAuthorize)
            {
                self.submitHandler(selectedPlatform,contentText,_image);
                return;
            }
            
            if ([ShareSDK hasAuthorized:[[_platformTypes objectAtIndex:0] integerValue]])
            {
                self.submitHandler(selectedPlatform,contentText,_image);
            }
            else
            {
                __weak SSUIiPadEditorView *theView = self;
                [ShareSDK authorize:[[_platformTypes objectAtIndex:0] integerValue]
                           settings:nil
                     onStateChanged:^(SSDKResponseState state, SSDKUser *user, NSError *error)
                 {
                     if (state == SSDKResponseStateSuccess)
                     {
                         
                         theView.submitHandler(selectedPlatform,contentText, _image);
                     }
                     
                     if (state ==  SSDKResponseStateFail)
                     {
                         
                         UIAlertView* alert = [[UIAlertView alloc]initWithTitle: NSLocalizedStringWithDefaultValue(@"Alert", @"ShareSDKUI_Localizable", [NSBundle bundleWithPath:[[NSBundle mainBundle] pathForResource:@"ShareSDKUI" ofType:@"bundle"]], @"Alert", nil)
                                                                        message:[NSString stringWithFormat:@"%@, error message:%@",NSLocalizedStringWithDefaultValue(@"AuthorizeFailed", @"ShareSDKUI_Localizable", [NSBundle bundleWithPath:[[NSBundle mainBundle] pathForResource:@"ShareSDKUI" ofType:@"bundle"]], @"AuthorizeFailed", nil), [error userInfo]]
                                                                       delegate:self
                                                              cancelButtonTitle:NSLocalizedStringWithDefaultValue(@"OK", @"ShareSDKUI_Localizable", [NSBundle bundleWithPath:[[NSBundle mainBundle] pathForResource:@"ShareSDKUI" ofType:@"bundle"]], @"OK", nil)
                                                              otherButtonTitles:nil];
                         [alert show];
                     }
                 }];
            }
        }
        else
        {
            UIAlertView *alert =[[UIAlertView alloc]initWithTitle:
                                 NSLocalizedStringWithDefaultValue(@"Alert", @"ShareSDKUI_Localizable", [NSBundle bundleWithPath:[[NSBundle mainBundle] pathForResource:@"ShareSDKUI" ofType:@"bundle"]], @"Alert", nil)
                                                          message:NSLocalizedStringWithDefaultValue(@"InputTheShareContent", @"ShareSDKUI_Localizable", [NSBundle bundleWithPath:[[NSBundle mainBundle] pathForResource:@"ShareSDKUI" ofType:@"bundle"]], @"InputTheShareContent", nil)
                                                         delegate:self
                                                cancelButtonTitle:NSLocalizedStringWithDefaultValue(@"OK", @"ShareSDKUI_Localizable", [NSBundle bundleWithPath:[[NSBundle mainBundle] pathForResource:@"ShareSDKUI" ofType:@"bundle"]], @"OK", nil)
                                                otherButtonTitles:nil];
            [alert show];
        }
    }
}

@end
