//
//  SSUIEditerViewController.m
//  ShareSDKUI
//
//  Created by Max on 2018/4/11.
//  Copyright © 2018年 Max. All rights reserved.
//

#import "SSUIEditerViewController.h"
#import "SSUIEditorConfiguration.h"
#import "SSUIiPadEditorViewController.h"

@interface SSUIEditerViewController ()
{
    NSLayoutConstraint *_editorViewHeightConstraint;
    NSLayoutConstraint *_editorViewleftConstraint;
    NSLayoutConstraint *_editorViewRightConstraint;
    NSLayoutConstraint *_imageViewWidthConstraint;
    
    UIStatusBarStyle _originalStatusBarStyle;
}

@property (weak, nonatomic) UIView *editorView;
@property (weak, nonatomic) UITextView *contentTextView;
@property (weak, nonatomic) UIImageView *imageView;

@end

@implementation SSUIEditerViewController

- (void)viewDidLoad
{
    [super viewDidLoad];
    self.view.backgroundColor = [MOBFColor colorWithARGB:0x4c000000];
    self.edgesForExtendedLayout = UIRectEdgeNone;
    if (![MOBFDevice isPad])
    {
        [self _configNavigationBar];
    }

    [self _configUI];
    [self _setImage];
}

- (void)_configNavigationBar
{
    UIImage *barBackgroundImage = self.configuration.iPhoneNavigationBarBackgroundImage;
    if (barBackgroundImage)
    {
        [self.navigationController.navigationBar setBackgroundImage:barBackgroundImage forBarMetrics:UIBarMetricsDefault];
    }
    
    UIColor *barBackgroundColor = self.configuration.iPhoneNavigationBarBackgroundColor;
    if (barBackgroundColor)
    {
        self.navigationController.navigationBar.barTintColor = barBackgroundColor;
    }

    UILabel *label = [[UILabel alloc] init];
    label.text = self.configuration.title;
    UIColor *titleColor = self.configuration.titleColor;
    if (titleColor)
    {
        label.textColor = titleColor;
    }
    [label sizeToFit];
    self.navigationItem.titleView = label;
    
    self.navigationItem.rightBarButtonItem = [[UIBarButtonItem alloc] initWithCustomView:self.rightBarItemButton];
    self.navigationItem.leftBarButtonItem = [[UIBarButtonItem alloc] initWithCustomView:self.leftBarItemButton];
}

- (void)_configUI
{
    UIView *editorView = [[UIView alloc] init];
    editorView.backgroundColor = self.configuration.editorViewBackgroundColor;
    [self.view addSubview:editorView];
    _editorView = editorView;

    UITextView *contentTextView = [[UITextView alloc] init];
    contentTextView.backgroundColor = self.configuration.textViewBackgroundColor;
    contentTextView.textColor = [MOBFColor colorWithRGB:0x767676];
    contentTextView.text = self.content;
    contentTextView.font = [UIFont systemFontOfSize:16.0];
    [editorView addSubview:contentTextView];
    _contentTextView = contentTextView;
    
    BOOL isShowImage = _image ? YES : NO;
    UIImageView *imageView = [[UIImageView alloc] init];
    imageView.backgroundColor = [UIColor blueColor];
    [editorView addSubview:imageView];
    imageView.hidden = !isShowImage;
    _imageView = imageView;
    
    UIView *line = [[UIView alloc] init];
    line.backgroundColor = [MOBFColor colorWithARGB:0x4c000000];
    [editorView addSubview:line];
    
    UIView *bar = [[UIView alloc] init];
    [editorView addSubview:bar];
    
    UILabel *shareToLabel = [[UILabel alloc] init];
    shareToLabel.text = SSUILocalized(@"ShareTo");
    shareToLabel.textColor = [MOBFColor colorWithRGB:0x9a9a9a];
    shareToLabel.font = [UIFont systemFontOfSize:12];
    [bar addSubview:shareToLabel];
    
    UIScrollView *platformsScrollView = [[UIScrollView alloc] init];
    [bar addSubview:platformsScrollView];
    
    // 设置整个EditorView约束
    editorView.translatesAutoresizingMaskIntoConstraints = NO;
    NSLayoutConstraint *editorViewleft = [NSLayoutConstraint constraintWithItem:editorView attribute:NSLayoutAttributeLeft relatedBy:NSLayoutRelationEqual toItem:self.view attribute:NSLayoutAttributeLeft multiplier:1.0 constant:self.editorViewSpace];
    NSLayoutConstraint *editorViewRight = [NSLayoutConstraint constraintWithItem:editorView attribute:NSLayoutAttributeRight relatedBy:NSLayoutRelationEqual toItem:self.view attribute:NSLayoutAttributeRight multiplier:1.0 constant:-self.editorViewSpace];
    NSLayoutConstraint *editorViewTop = [NSLayoutConstraint constraintWithItem:editorView attribute:NSLayoutAttributeTop relatedBy:NSLayoutRelationEqual toItem:self.view attribute:NSLayoutAttributeTop multiplier:1.0 constant:[MOBFDevice isPad] ? 0:kEditorViewSpace];
    NSLayoutConstraint *editorViewHeight = [NSLayoutConstraint constraintWithItem:editorView attribute:NSLayoutAttributeHeight relatedBy:NSLayoutRelationEqual toItem:nil attribute:NSLayoutAttributeHeight multiplier:1.0 constant:self.editorViewHeight];
    [self.view addConstraints:@[editorViewleft,editorViewRight,editorViewTop,editorViewHeight]];
    _editorViewHeightConstraint = editorViewHeight;
    _editorViewleftConstraint = editorViewleft;
    _editorViewRightConstraint = editorViewRight;
    
    // 设置TextView约束
    contentTextView.translatesAutoresizingMaskIntoConstraints = NO;
    NSLayoutConstraint *contentTextViewLeft = [NSLayoutConstraint constraintWithItem:contentTextView attribute:NSLayoutAttributeLeft relatedBy:NSLayoutRelationEqual toItem:editorView attribute:NSLayoutAttributeLeft multiplier:1.0 constant:kEditorViewSpace];
    NSLayoutConstraint *contentTextViewRight = [NSLayoutConstraint constraintWithItem:contentTextView attribute:NSLayoutAttributeRight relatedBy:NSLayoutRelationEqual toItem:imageView attribute:NSLayoutAttributeLeft multiplier:1.0 constant:-kEditorViewSpace];
    NSLayoutConstraint *contentTextViewTop = [NSLayoutConstraint constraintWithItem:contentTextView attribute:NSLayoutAttributeTop relatedBy:NSLayoutRelationEqual toItem:editorView attribute:NSLayoutAttributeTop multiplier:1.0 constant:kEditorViewSpace];
    NSLayoutConstraint *contentTextViewHeight = [NSLayoutConstraint constraintWithItem:contentTextView attribute:NSLayoutAttributeHeight relatedBy:NSLayoutRelationEqual toItem:editorView attribute:NSLayoutAttributeHeight multiplier:1.0 constant:-(2*kEditorViewSpace+kEditorViewBarHeight)];
    [self.view addConstraints:@[contentTextViewLeft,contentTextViewRight,contentTextViewTop,contentTextViewHeight]];

    // 设置imageView约束
    imageView.translatesAutoresizingMaskIntoConstraints = NO;
    NSLayoutConstraint *imageViewTop = [NSLayoutConstraint constraintWithItem:imageView attribute:NSLayoutAttributeTop relatedBy:NSLayoutRelationEqual toItem:contentTextView attribute:NSLayoutAttributeTop multiplier:1.0 constant:0];
    NSLayoutConstraint *imageViewRight = [NSLayoutConstraint constraintWithItem:imageView attribute:NSLayoutAttributeRight relatedBy:NSLayoutRelationEqual toItem:editorView attribute:NSLayoutAttributeRight multiplier:1.0 constant:isShowImage?-kEditorViewSpace:0.0];
    NSLayoutConstraint *imageViewBottom = [NSLayoutConstraint constraintWithItem:imageView attribute:NSLayoutAttributeBottom relatedBy:NSLayoutRelationEqual toItem:contentTextView attribute:NSLayoutAttributeBottom multiplier:1.0 constant:0];
    NSLayoutConstraint *imageViewWidth = [NSLayoutConstraint constraintWithItem:imageView attribute:NSLayoutAttributeWidth relatedBy:NSLayoutRelationEqual toItem:nil attribute:NSLayoutAttributeWidth multiplier:1.0 constant:self.imageViewWidth];
    [self.view addConstraints:@[imageViewTop,imageViewRight,imageViewBottom,imageViewWidth]];
    _imageViewWidthConstraint = imageViewWidth;
    
    // 设置Line的约束
    line.translatesAutoresizingMaskIntoConstraints = NO;
    NSLayoutConstraint *lineTop = [NSLayoutConstraint constraintWithItem:line attribute:NSLayoutAttributeTop relatedBy:NSLayoutRelationEqual toItem:contentTextView attribute:NSLayoutAttributeBottom multiplier:1.0 constant:kEditorViewSpace];
    NSLayoutConstraint *lineLeft = [NSLayoutConstraint constraintWithItem:line attribute:NSLayoutAttributeLeft relatedBy:NSLayoutRelationEqual toItem:editorView attribute:NSLayoutAttributeLeft multiplier:1.0 constant:0];
    NSLayoutConstraint *lineRight = [NSLayoutConstraint constraintWithItem:line attribute:NSLayoutAttributeRight relatedBy:NSLayoutRelationEqual toItem:editorView attribute:NSLayoutAttributeRight multiplier:1.0 constant:0];
    NSLayoutConstraint *lineHeight= [NSLayoutConstraint constraintWithItem:line attribute:NSLayoutAttributeHeight relatedBy:NSLayoutRelationEqual toItem:nil attribute:NSLayoutAttributeHeight multiplier:1.0 constant:1.0];
    [editorView addConstraints:@[lineTop,lineLeft,lineRight,lineHeight]];

    // 设置Bar的约束
    bar.translatesAutoresizingMaskIntoConstraints = NO;
    NSLayoutConstraint *barTop = [NSLayoutConstraint constraintWithItem:bar attribute:NSLayoutAttributeTop relatedBy:NSLayoutRelationEqual toItem:line attribute:NSLayoutAttributeBottom multiplier:1.0 constant:0];
    NSLayoutConstraint *barLeft = [NSLayoutConstraint constraintWithItem:bar attribute:NSLayoutAttributeLeft relatedBy:NSLayoutRelationEqual toItem:editorView attribute:NSLayoutAttributeLeft multiplier:1.0 constant:0];
    NSLayoutConstraint *barRight = [NSLayoutConstraint constraintWithItem:bar attribute:NSLayoutAttributeRight relatedBy:NSLayoutRelationEqual toItem:editorView attribute:NSLayoutAttributeRight multiplier:1.0 constant:0];
    NSLayoutConstraint *barBottom = [NSLayoutConstraint constraintWithItem:bar attribute:NSLayoutAttributeBottom relatedBy:NSLayoutRelationEqual toItem:editorView attribute:NSLayoutAttributeBottom multiplier:1.0 constant:0];
    [editorView addConstraints:@[barTop,barLeft,barRight,barBottom]];

    // 设置 “分享至” 文本约束
    shareToLabel.translatesAutoresizingMaskIntoConstraints = NO;
    NSLayoutConstraint *shareToLabelCenterY = [NSLayoutConstraint constraintWithItem:shareToLabel attribute:NSLayoutAttributeCenterY relatedBy:NSLayoutRelationEqual toItem:bar attribute:NSLayoutAttributeCenterY multiplier:1.0 constant:0];
    NSLayoutConstraint *shareToLabelLeft = [NSLayoutConstraint constraintWithItem:shareToLabel attribute:NSLayoutAttributeLeft relatedBy:NSLayoutRelationEqual toItem:bar attribute:NSLayoutAttributeLeft multiplier:1.0 constant:kEditorViewShareToLabelSpaceLeft];
    [editorView addConstraints:@[shareToLabelLeft,shareToLabelCenterY]];

    // 设置 平台scrollView的约束
    platformsScrollView.translatesAutoresizingMaskIntoConstraints = NO;
    NSLayoutConstraint *scrollViewLeft = [NSLayoutConstraint constraintWithItem:platformsScrollView attribute:NSLayoutAttributeLeft relatedBy:NSLayoutRelationEqual toItem:shareToLabel attribute:NSLayoutAttributeRight multiplier:1.0 constant:kEditorViewShareToLabelSpaceRight];
    NSLayoutConstraint *scrollViewRight = [NSLayoutConstraint constraintWithItem:platformsScrollView attribute:NSLayoutAttributeRight relatedBy:NSLayoutRelationEqual toItem:bar attribute:NSLayoutAttributeRight multiplier:1.0 constant:-kEditorViewSpace];
    NSLayoutConstraint *scrollViewTop = [NSLayoutConstraint constraintWithItem:platformsScrollView attribute:NSLayoutAttributeTop relatedBy:NSLayoutRelationEqual toItem:bar attribute:NSLayoutAttributeTop multiplier:1.0 constant:0];
    NSLayoutConstraint *scrollViewBottom = [NSLayoutConstraint constraintWithItem:platformsScrollView attribute:NSLayoutAttributeBottom relatedBy:NSLayoutRelationEqual toItem:bar attribute:NSLayoutAttributeBottom multiplier:1.0 constant:0];
    [bar addConstraints:@[scrollViewLeft,scrollViewRight,scrollViewTop,scrollViewBottom]];
    
    for (NSInteger i=0; i<self.platforms.count; i++)
    {
        SSDKPlatformType type = [self.platforms[i] integerValue];
        NSString *bundlePath = [[NSBundle mainBundle] pathForResource:@"ShareSDKUI"
                                                               ofType:@"bundle"];
        UIImage *iconImage = [MOBFImage imageName:[NSString stringWithFormat:@"Icon/sns_icon_%ld.png",(unsigned long)type]
                                           bundle:[NSBundle bundleWithPath:bundlePath]];
        UIImage *grayImage = [[SSUIHelper shareHelper] getGrayImage:iconImage];
        UIButton *platButton = [UIButton buttonWithType:UIButtonTypeCustom];
        [platButton setImage:grayImage forState:UIControlStateNormal];
        [platButton setImage:iconImage forState:UIControlStateDisabled];
        [platButton addTarget:self action:@selector(platformItemClick:) forControlEvents:UIControlEventTouchUpInside];
        platButton.adjustsImageWhenHighlighted = NO;
        platButton.tag = 10000 + type;
        [platformsScrollView addSubview:platButton];
        
        if (i == 0)
        {
            platButton.enabled = NO;
        }
        else
        {
            platButton.enabled = ![ShareSDK hasAuthorized:type];
        }
        
        platButton.translatesAutoresizingMaskIntoConstraints = NO;
        NSLayoutConstraint *platButtonLeft = [NSLayoutConstraint constraintWithItem:platButton attribute:NSLayoutAttributeLeft relatedBy:NSLayoutRelationEqual toItem:platformsScrollView attribute:NSLayoutAttributeLeft multiplier:1.0 constant:i*(kEditorViewPlatformItemSpace + kEditorViewPlatformItemSideLength)];
        NSLayoutConstraint *platButtonCenterY = [NSLayoutConstraint constraintWithItem:platButton attribute:NSLayoutAttributeCenterY relatedBy:NSLayoutRelationEqual toItem:platformsScrollView attribute:NSLayoutAttributeCenterY multiplier:1.0 constant:0];
        NSLayoutConstraint *platButtonWidth = [NSLayoutConstraint constraintWithItem:platButton attribute:NSLayoutAttributeWidth relatedBy:NSLayoutRelationEqual toItem:nil attribute:NSLayoutAttributeWidth multiplier:1.0 constant:kEditorViewPlatformItemSideLength];
        NSLayoutConstraint *platButtonHeight = [NSLayoutConstraint constraintWithItem:platButton attribute:NSLayoutAttributeHeight relatedBy:NSLayoutRelationEqual toItem:nil attribute:NSLayoutAttributeHeight multiplier:1.0 constant:kEditorViewPlatformItemSideLength];
        [platformsScrollView addConstraints:@[platButtonLeft,platButtonCenterY,platButtonWidth,platButtonHeight]];
    }
    
    platformsScrollView.contentSize = CGSizeMake((kEditorViewPlatformItemSideLength + kEditorViewPlatformItemSpace)*self.platforms.count - kEditorViewPlatformItemSpace, 0);
}

- (void)_layoutSubViews
{
    CGFloat space = self.editorViewSpace;
    _editorViewHeightConstraint.constant = self.editorViewHeight;
    _editorViewleftConstraint.constant = space;
    _editorViewRightConstraint.constant = -space;
    _imageViewWidthConstraint.constant = self.imageViewWidth;
    [UIView animateWithDuration:0.25 animations:^{
        [self.view layoutIfNeeded];
    }];
    
    [self _setImage];
}

- (CGFloat)editorViewSpace
{
    if (isLandscape && isiPhoneXDevice)
    {
        return kiPhoneXLandscapeSafaAreaOffset;
    }
    else
    {
        return [MOBFDevice isPad] ? 0:kEditorViewSpace;
    }
}

- (void)_setImage
{
    __weak typeof(self) weakSelf = self;
    [_image getNativeImage:^(UIImage *image) {
        UIImage *clipedImage = [[SSUIHelper shareHelper] clipImage:image forImageViewSize:CGSizeMake((kScreenWidth-weakSelf.editorViewSpace)*0.2, weakSelf.editorViewHeight-(2*kEditorViewSpace+kEditorViewBarHeight))];
        weakSelf.imageView.image = clipedImage;
    }];
}

#pragma mark - click event

- (void)send:(id)sender
{
    if (self.contentTextView.text.length == 0)
    {
        [[[UIAlertView alloc]initWithTitle:SSUILocalized(@"Alert")
                                   message:SSUILocalized(@"InputTheShareContent")
                                  delegate:self
                         cancelButtonTitle:SSUILocalized(@"OK")
                         otherButtonTitles:nil] show];
        return;
    }
    
    __weak typeof(self) weakSelf = self;
    
    if ([MOBFDevice isPad])
    {
        self.rightBarItemButton.hidden = YES;
        self.indicatorView.hidden = NO;
        [self.indicatorView startAnimating];
    }
    else
    {
        self.navigationItem.rightBarButtonItem = [[UIBarButtonItem alloc] initWithCustomView:self.indicatorView];
    }
    self.leftBarItemButton.enabled = NO;
    [self.delegate shareEditor:self didShareWithContent:self.contentTextView.text authCallback:^(BOOL isAuthed) {
        if ([MOBFDevice isPad])
        {
            [self.indicatorView stopAnimating];
            self.rightBarItemButton.hidden = NO;
            self.indicatorView.hidden = YES;
        }
        else
        {
            weakSelf.navigationItem.rightBarButtonItem = [[UIBarButtonItem alloc] initWithCustomView:weakSelf.rightBarItemButton];
        }
        weakSelf.leftBarItemButton.enabled = YES;
    }];
}

- (void)cancel:(id)sender
{
    [self.delegate shareEditor:self didCancelShareWithContent:self.contentTextView.text];
}

- (void)platformItemClick:(UIButton *)sender
{
    [ShareSDK authorize:sender.tag-10000 settings:nil onStateChanged:^(SSDKResponseState state, SSDKUser *user, NSError *error) {
        if (state == SSDKResponseStateSuccess)
        {
            sender.enabled = NO;
        }
        
        if (state == SSDKResponseStateFail)
        {
            [[[UIAlertView alloc] initWithTitle: SSUILocalized(@"Alert")
                                        message:[NSString stringWithFormat:@"%@, error message:%@",SSUILocalized(@"AuthorizeFailed"), error.userInfo]
                                       delegate:nil
                              cancelButtonTitle:SSUILocalized(@"OK")
                              otherButtonTitles:nil] show];
        }
    }];
}

#pragma mark - Getter

- (UIButton *)rightBarItemButton
{
    if (!_rightBarItemButton)
    {
        UIButton *rightBtn = [UIButton buttonWithType:UIButtonTypeSystem];
        NSString *sendTitle = self.configuration.shareButtonTitle;
        [rightBtn setTitle:sendTitle forState:UIControlStateNormal];
        UIColor *shareButtonTitleColor = self.configuration.shareButtonTitleColor;
        if (shareButtonTitleColor)
        {
            [rightBtn setTitleColor:shareButtonTitleColor forState:UIControlStateNormal];
        }
        UIImage *shareButtonImage = self.configuration.shareButtonImage;
        if (shareButtonImage)
        {
            [rightBtn setImage:shareButtonImage forState:UIControlStateNormal];
        }
        [rightBtn addTarget:self action:@selector(send:) forControlEvents:UIControlEventTouchUpInside];
        rightBtn.titleLabel.font = [UIFont systemFontOfSize:17];
        [rightBtn sizeToFit];
        _rightBarItemButton = rightBtn;
    }
    
    return _rightBarItemButton;
}

- (UIButton *)leftBarItemButton
{
    if (!_leftBarItemButton)
    {
        UIButton *leftBtn = [UIButton buttonWithType:UIButtonTypeSystem];
        NSString *cancelTitle = self.configuration.cancelButtonTitle;
        [leftBtn setTitle:cancelTitle forState:UIControlStateNormal];
        UIColor *cancelButtonTitleColor = self.configuration.cancelButtonTitleColor;
        if (cancelButtonTitleColor)
        {
            [leftBtn setTitleColor:cancelButtonTitleColor forState:UIControlStateNormal];
        }
        UIImage *cancelButtonImage = self.configuration.cancelButtonImage;
        if (cancelButtonImage)
        {
            [leftBtn setImage:cancelButtonImage forState:UIControlStateNormal];
        }
        [leftBtn addTarget:self action:@selector(cancel:) forControlEvents:UIControlEventTouchUpInside];
        leftBtn.titleLabel.font = [UIFont systemFontOfSize:17];
        [leftBtn sizeToFit];
        _leftBarItemButton = leftBtn;
    }
    return _leftBarItemButton;
}

- (UIActivityIndicatorView *)indicatorView
{
    if (!_indicatorView)
    {
        _indicatorView = [[UIActivityIndicatorView alloc] initWithActivityIndicatorStyle:UIActivityIndicatorViewStyleGray];
        [_indicatorView startAnimating];
    }
    
    return _indicatorView;
}


- (CGFloat)editorViewHeight
{
    // 45 是ipad导航栏和分割线的高度
    return [MOBFDevice isPad] ? kEditorViewiPadHeight-45.0 : kScreenHeight * (isPortrait ? 0.4:0.32);
}

- (CGFloat)imageViewWidth
{
    if (_image)
    {
        if ([MOBFDevice isPad])
        {
            return kEditorViewiPadWidth * 0.3;
        }
        else
        {
            return (kScreenWidth-2*kEditorViewSpace)*(isPortrait ? 0.3:0.2);
        }
    }
    return 0.0;
}

- (void)willAnimateRotationToInterfaceOrientation:(UIInterfaceOrientation)toInterfaceOrientation duration:(NSTimeInterval)duration
{
    [self _layoutSubViews];
}

- (void)dealloc
{
    SSUILog(@"------------------DELLOC-------------------");
}

@end
