//
//  SSUIiPhoneEditorViewController.m
//  ShareSDKUI
//
//  Created by chenjd on 15/7/3.
//  Copyright (c) 2015年 mob. All rights reserved.
//

#import "SSUIiPhoneEditorViewController.h"
#import "SSUIShareContentEditorDef.h"
#import "SSUIEditorViewStyle_Private.h"

#define SPACING 5.0
#define VIEW_HEIGHT_3_5 190.0
#define VIEW_HEIGHT_4_0 250.0
#define VIEW_HEIGHT_4_7 280.0
#define VIEW_HEIGHT_5_5 340.0

#define VIEW_HEIGHT_L_3_5 96.0
#define VIEW_HEIGHT_L_4_0 96.0
#define VIEW_HEIGHT_L_4_7 120.0
#define VIEW_HEIGHT_L_5_5 140.0

@interface SSUIiPhoneEditorViewController ()
{
@private
    SSUIiPhoneEditorView *_contentView;     //分享视图
    
    NSString *_content;
    
    BOOL _needUpdate;
    
}

@property (nonatomic, strong) NSArray *platformTypes;

@property (nonatomic, strong) SSDKImage *image;

@end

@implementation SSUIiPhoneEditorViewController

- (id)init
{
    if (self = [super init])
    {

        self.title = NSLocalizedStringWithDefaultValue(@"ShareContent", @"ShareSDKUI_Localizable", [NSBundle bundleWithPath:[[NSBundle mainBundle] pathForResource:@"ShareSDKUI" ofType:@"bundle"]], @"ShareContent", nil);//导航栏的title

        self.navigationItem.leftBarButtonItem = [[UIBarButtonItem alloc] initWithTitle:
                                                 NSLocalizedStringWithDefaultValue(@"Cancel", @"ShareSDKUI_Localizable", [NSBundle bundleWithPath:[[NSBundle mainBundle] pathForResource:@"ShareSDKUI" ofType:@"bundle"]], @"Cancel", nil)
                                                                                 style:UIBarButtonItemStyleBordered
                                                                                target:self
                                                                                action:@selector(cancelButtonClickHandler:)];
        
        
        
        
        
        
        self.navigationItem.rightBarButtonItem = [[UIBarButtonItem alloc] initWithTitle:
                                                  NSLocalizedStringWithDefaultValue(@"Share", @"ShareSDKUI_Localizable", [NSBundle bundleWithPath:[[NSBundle mainBundle] pathForResource:@"ShareSDKUI" ofType:@"bundle"]], @"Share", nil)
                                                                                  style:UIBarButtonItemStyleBordered
                                                                                 target:self
                                                                                 action:@selector(sendButtonClickHandler:)];
        
        [self setNavigationItemStyle];
    
       
    }
    return self;
}



- (void)viewDidLoad
{
    [super viewDidLoad];
    self.view.backgroundColor = [UIColor clearColor];
    [self.navigationController.navigationBar setTitleTextAttributes:@{NSFontAttributeName:[UIFont systemFontOfSize:20],
                                                                      NSForegroundColorAttributeName:[UIColor blackColor]}];
    if ([MOBFDevice versionCompare:@"7.0"] >= 0)
    {
        self.extendedLayoutIncludesOpaqueBars = NO;
        self.edgesForExtendedLayout = UIRectEdgeNone;
    }
    self.navigationController.navigationBar.translucent = NO;
    [self setNavigationBarStyle];
  
    CGFloat viewW;
    CGFloat viewH;
    CGFloat screenHeight = [UIScreen mainScreen].bounds.size.height;
    CGFloat screenWidth = [UIScreen mainScreen].bounds.size.width;
    
    //分享内容编辑页面的尺寸
    if (UIInterfaceOrientationIsLandscape(self.interfaceOrientation))
    {
        
        if (screenWidth < screenHeight)
        {
            screenWidth = [UIScreen mainScreen].bounds.size.height;
            screenHeight = [UIScreen mainScreen].bounds.size.width;
        }
        //横屏
        viewW = screenWidth;
        
        viewH = screenHeight * 0.32;
       
    }
    else
    {
        //竖屏
        viewW = screenWidth;
        viewH = screenHeight * 0.4;
    }
    
    _contentView = [[SSUIiPhoneEditorView alloc] initWithFrame:CGRectMake(SPACING, SPACING, viewW - 2 * SPACING, viewH)];
    if ([SSUIEditorViewStyle sharedInstance].contentViewBackgroundColor)
    {
        [_contentView setBackgroundColor:[SSUIEditorViewStyle sharedInstance].contentViewBackgroundColor];
    }
    [self.view addSubview:_contentView];
    
    
    if (_needUpdate)
    {
        [self initView];
        _needUpdate = NO;
    }
}

- (void)updateWithContent:(NSString *)content
                    image:(SSDKImage *)image
            platformTypes:(NSArray *)platformTypes
{
    _content = content;
    _platformTypes = platformTypes;
    _image = image;
    
    if (self.isViewLoaded)
    {
        
        [self initView];
    }
    else
    {
        _needUpdate = YES;
    }

}

- (void)initView
{
    [_contentView updateWithContent:_content
                              image:_image
                      platformTypes:_platformTypes
               interfaceOrientation:self.interfaceOrientation];
}

- (void)willAnimateRotationToInterfaceOrientation:(UIInterfaceOrientation)toInterfaceOrientation
                                         duration:(NSTimeInterval)duration
{
    
    CGFloat viewH ;
    CGFloat screenHeight = [UIScreen mainScreen].bounds.size.height;
    
    if (UIInterfaceOrientationIsLandscape(toInterfaceOrientation))
    {

        viewH = screenHeight * 0.32;
        if ([MOBFDevice versionCompare:@"8.0"] < 0)
        {
            viewH = screenHeight * 0.19;
        }
    }
    else
    {
 
          viewH = screenHeight * 0.4;
 
    }
    
     _contentView.frame = CGRectMake(SPACING, SPACING, SSUI_WIDTH(self.view) - 2 * SPACING, viewH);
    
    [_contentView rotationToInterfaceOrientation:toInterfaceOrientation];
}


#pragma mark - Private

/**
 *	@brief	取消按钮点击
 *
 *	@param 	sender 	事件对象
 */
- (void)cancelButtonClickHandler:(id)sender
{
    
    [_contentView.contentView resignFirstResponder];
    
    if (self.cancelHandler)
    {
         self.cancelHandler();
    }
}

/**
 *	@brief	发送按钮点击
 *
 *	@param 	sender 	事件对象
 */
- (void)sendButtonClickHandler:(id)sender
{
    
    if (self.submitHandler)
    {
        [_contentView.contentView resignFirstResponder];
        
        NSString *contentText = _contentView.contentView.text;
        NSMutableArray *selectedPlatform =[[_contentView.toolbar selectedPlatforms] mutableCopy];
        
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
                                                                                         @(SSDKPlatformTypePinterest),
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
                __weak SSUIiPhoneEditorViewController *theController = self;
                [ShareSDK authorize:[[_platformTypes objectAtIndex:0] integerValue]
                           settings:nil
                     onStateChanged:^(SSDKResponseState state, SSDKUser *user, NSError *error)
                 {
                     if (state == SSDKResponseStateSuccess)
                     {
                         theController.submitHandler(selectedPlatform,contentText, theController.image);
                     }
                     
                     if (state == SSDKResponseStateFail)
                     {
                         
                         UIAlertView *alert = [[UIAlertView alloc]initWithTitle: NSLocalizedStringWithDefaultValue(@"Alert", @"ShareSDKUI_Localizable", [NSBundle bundleWithPath:[[NSBundle mainBundle] pathForResource:@"ShareSDKUI" ofType:@"bundle"]], @"Alert", nil)
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

- (void)setNavigationItemStyle
{
    
    if ([SSUIEditorViewStyle sharedInstance].cancelButtonLabel)
    {
        self.navigationItem.leftBarButtonItem.title = [SSUIEditorViewStyle sharedInstance].cancelButtonLabel;
    }
    
    if ([SSUIEditorViewStyle sharedInstance].cancelButtonImage)
    {
        [self.navigationItem.leftBarButtonItem setBackgroundImage:[SSUIEditorViewStyle sharedInstance].cancelButtonImage
                                                         forState:UIControlStateNormal barMetrics:UIBarMetricsDefault];
    }
    
    if ([SSUIEditorViewStyle sharedInstance].cancelButtonLabelColor)
    {
        self.navigationItem.leftBarButtonItem.tintColor = [SSUIEditorViewStyle sharedInstance].cancelButtonLabelColor;
    }
    
    if ([SSUIEditorViewStyle sharedInstance].shareButtonImage)
    {
       [self.navigationItem.rightBarButtonItem setBackgroundImage:[SSUIEditorViewStyle sharedInstance].shareButtonImage
                                                         forState:UIControlStateNormal barMetrics:UIBarMetricsDefault];
    }
    
    if ([SSUIEditorViewStyle sharedInstance].shareButtonLabel)
    {
        self.navigationItem.rightBarButtonItem.title = [SSUIEditorViewStyle sharedInstance].shareButtonLabel;
    }
    
    if ([SSUIEditorViewStyle sharedInstance].shareButtonLabelColor)
    {
        self.navigationItem.rightBarButtonItem.tintColor = [SSUIEditorViewStyle sharedInstance].shareButtonLabelColor;
        
    }
}

- (void)setNavigationBarStyle
{
    if ([SSUIEditorViewStyle sharedInstance].title)
    {
        self.title = [SSUIEditorViewStyle sharedInstance].title;
    }
    
    if ([SSUIEditorViewStyle sharedInstance].titleColor)
    {
        [self.navigationController.navigationBar setTitleTextAttributes:@{NSFontAttributeName:[UIFont systemFontOfSize:20],
                                                                          NSForegroundColorAttributeName:[SSUIEditorViewStyle sharedInstance].titleColor}];
    }
    
    if ([SSUIEditorViewStyle sharedInstance].iPhoneNavigationbarBackgroundImage)
    {
        [self.navigationController.navigationBar setBackgroundImage:[SSUIEditorViewStyle sharedInstance].iPhoneNavigationbarBackgroundImage forBarMetrics:UIBarMetricsDefault];
    }
    
    if ([MOBFDevice versionCompare:@"7.0"] >= 0)
    {
        if ([SSUIEditorViewStyle sharedInstance].iPhoneNavigationbarBackgroundColor)
        {
        self.navigationController.navigationBar.barTintColor = [SSUIEditorViewStyle sharedInstance].iPhoneNavigationbarBackgroundColor;
        }
    }
}

@end
