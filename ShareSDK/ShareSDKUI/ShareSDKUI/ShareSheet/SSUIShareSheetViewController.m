//
//  SSUIShareSheetViewController.m
//  ShareSDKUI
//
//  Created by Max on 2018/4/3.
//  Copyright © 2018年 Max. All rights reserved.
//

#import "SSUIShareSheetViewController.h"
#import "SSUIShareSheetConfiguration.h"
#import "SSUICollectionViewCell.h"
#import "SSUICollectionViewSimpleCell.h"
#import "SSUICollectionViewLayout.h"
#import "SSUIPlatformItem.h"

@interface SSUIShareSheetViewController ()<UICollectionViewDelegate,UICollectionViewDataSource>
{
    NSLayoutConstraint *_containerViewTopConstraint;
    NSLayoutConstraint *_containerViewHeightConstraint;
    NSLayoutConstraint *_collectionViewHeightConstraint;
    //用于设置iphoneX横屏的左右间距
    NSLayoutConstraint *_containerViewLeftConstraint;
    NSLayoutConstraint *_containerViewRightConstraint;
    
    UIStatusBarStyle _originalStatusBarStyle;
}

@property (weak, nonatomic) UIView *containerView;
@property (weak, nonatomic) UIPageControl *pageControl;
@property (weak, nonatomic) UIButton *cancelButton;

@end

static NSString *const kSSUICollectionViewCellReuseIdentifier = @"SSUICollectionViewCellReuseIdentifier";

@implementation SSUIShareSheetViewController

- (void)viewDidLoad
{
    [super viewDidLoad];
    
    self.automaticallyAdjustsScrollViewInsets = NO;
    self.view.backgroundColor = [MOBFColor colorWithARGB:0x4c000000];

    [self _configUI];
    [self _setLayoutConstraints];
    if ([MOBFDevice isPad])
    {
        [self _layoutSubViews];
    }
}

- (void)viewDidAppear:(BOOL)animated
{
    [super viewDidAppear:animated];
    
    if (![MOBFDevice isPad])
    {
        [self _layoutSubViews];
    }
}

- (void)_configUI
{
    UIView *containerView = [[UIView alloc] init];
    containerView.backgroundColor = self.configuration.menuBackgroundColor;
    if (self.configuration.style == SSUIActionSheetStyleSystem)
    {
        containerView.layer.cornerRadius = kCornerRadius;
    }
    [self.view addSubview:containerView];
    _containerView = containerView;
    
    UICollectionView *platformsCollectionView = [[UICollectionView alloc] initWithFrame:CGRectZero collectionViewLayout:self.flowLayoutForMenu];
    if (self.configuration.style == SSUIActionSheetStyleSimple)
    {
        platformsCollectionView.layer.borderWidth = 0.5;
        platformsCollectionView.layer.borderColor = [MOBFColor colorWithRGB:0xF5F5F5].CGColor;
    }
    platformsCollectionView.backgroundColor = self.configuration.menuBackgroundColor;
    platformsCollectionView.showsHorizontalScrollIndicator = NO;
    platformsCollectionView.pagingEnabled = YES;
    platformsCollectionView.delegate = self;
    platformsCollectionView.dataSource = self;
    Class cellClass = self.configuration.style == SSUIActionSheetStyleSystem ? SSUICollectionViewCell.class:SSUICollectionViewSimpleCell.class;
    [platformsCollectionView registerClass:cellClass forCellWithReuseIdentifier:kSSUICollectionViewCellReuseIdentifier];
    [_containerView addSubview:platformsCollectionView];
    _platformsCollectionView = platformsCollectionView;
    
    UIPageControl *pageControl = [[UIPageControl alloc] init];
    pageControl.currentPageIndicatorTintColor = self.configuration.currentPageIndicatorTintColor;
    pageControl.pageIndicatorTintColor = self.configuration.pageIndicatorTintColor;
    [_containerView addSubview:pageControl];
    _pageControl = pageControl;
    
    UIButton *cancelButton = [UIButton buttonWithType:UIButtonTypeSystem];
    cancelButton.layer.cornerRadius = kCornerRadius;
    [cancelButton setTitle:@"取消" forState:UIControlStateNormal];
    [cancelButton setTitleColor:self.configuration.cancelButtonTitleColor forState:UIControlStateNormal];
    cancelButton.backgroundColor = self.configuration.cancelButtonBackgroundColor;
    [cancelButton addTarget:self action:@selector(touchesBegan:withEvent:) forControlEvents:UIControlEventTouchUpInside];
    [self.view addSubview:cancelButton];
    cancelButton.hidden = (self.configuration.style==SSUIActionSheetStyleSimple || self.configuration.isCancelButtonHidden);
    _cancelButton = cancelButton;
}

- (void)_setLayoutConstraints
{
    BOOL isSystemStyle = self.configuration.style == SSUIActionSheetStyleSystem;
    CGFloat menuH = self.menuHeight;
    CGFloat menuSpace = self.menuSpace;
    CGFloat portraitVerticalSpace = isSystemStyle ? kItemPortraitVerticalSpace : 0;
    
    _containerView.translatesAutoresizingMaskIntoConstraints = NO;
    NSLayoutConstraint *containerViewLeft = [NSLayoutConstraint constraintWithItem:_containerView attribute:NSLayoutAttributeLeft relatedBy:NSLayoutRelationEqual toItem:self.view attribute:NSLayoutAttributeLeft multiplier:1.0 constant:menuSpace];
    NSLayoutConstraint *containerViewRight = [NSLayoutConstraint constraintWithItem:_containerView attribute:NSLayoutAttributeRight relatedBy:NSLayoutRelationEqual toItem:self.view attribute:NSLayoutAttributeRight multiplier:1.0 constant:-menuSpace];
    NSLayoutConstraint *containerViewTop = [NSLayoutConstraint constraintWithItem:_containerView attribute:NSLayoutAttributeTop relatedBy:NSLayoutRelationEqual toItem:self.view attribute:NSLayoutAttributeBottom multiplier:1.0 constant:0];
    NSLayoutConstraint *containerViewHeight = [NSLayoutConstraint constraintWithItem:_containerView attribute:NSLayoutAttributeHeight relatedBy:NSLayoutRelationEqual toItem:nil attribute:NSLayoutAttributeHeight multiplier:1.0 constant:menuH];
    [self.view addConstraints:@[containerViewLeft,containerViewRight,containerViewTop,containerViewHeight]];
    _containerViewTopConstraint = containerViewTop;
    _containerViewHeightConstraint = containerViewHeight;
    _containerViewLeftConstraint = containerViewLeft;
    _containerViewRightConstraint = containerViewRight;
    
    _platformsCollectionView.translatesAutoresizingMaskIntoConstraints = NO;
    NSLayoutConstraint *platformsCollectionViewLeft = [NSLayoutConstraint constraintWithItem:_platformsCollectionView attribute:NSLayoutAttributeLeft relatedBy:NSLayoutRelationEqual toItem:_containerView attribute:NSLayoutAttributeLeft multiplier:1.0 constant:0];
    NSLayoutConstraint *platformsCollectionViewRight = [NSLayoutConstraint constraintWithItem:_platformsCollectionView attribute:NSLayoutAttributeRight relatedBy:NSLayoutRelationEqual toItem:_containerView attribute:NSLayoutAttributeRight multiplier:1.0 constant:0];
    NSLayoutConstraint *platformsCollectionViewTop = [NSLayoutConstraint constraintWithItem:_platformsCollectionView attribute:NSLayoutAttributeTop relatedBy:NSLayoutRelationEqual toItem:_containerView attribute:NSLayoutAttributeTop multiplier:1.0 constant:portraitVerticalSpace];
    NSLayoutConstraint *platformsCollectionViewHeight = [NSLayoutConstraint constraintWithItem:_platformsCollectionView attribute:NSLayoutAttributeHeight relatedBy:NSLayoutRelationEqual toItem:nil attribute:NSLayoutAttributeHeight multiplier:1.0 constant:menuH - 2*kPageControlSpace - (isSystemStyle ? kItemPortraitVerticalSpace:0)];
    [_containerView addConstraints:@[platformsCollectionViewLeft,platformsCollectionViewRight,platformsCollectionViewTop,platformsCollectionViewHeight]];
    _collectionViewHeightConstraint = platformsCollectionViewHeight;

    _pageControl.translatesAutoresizingMaskIntoConstraints = NO;
    NSLayoutConstraint *pageControlCenterX = [NSLayoutConstraint constraintWithItem:_containerView attribute:NSLayoutAttributeCenterX relatedBy:NSLayoutRelationEqual toItem:_pageControl attribute:NSLayoutAttributeCenterX multiplier:1 constant:0];
    NSLayoutConstraint *pageControlCenterY = [NSLayoutConstraint constraintWithItem:_pageControl attribute:NSLayoutAttributeCenterY relatedBy:NSLayoutRelationEqual toItem:_platformsCollectionView attribute:NSLayoutAttributeBottom multiplier:1 constant:kPageControlSpace-2];//-2往上抬一点
    [_containerView addConstraints:@[pageControlCenterX,pageControlCenterY]];
    
    _cancelButton.translatesAutoresizingMaskIntoConstraints = NO;
    NSLayoutConstraint *cancelBtnCenterX = [NSLayoutConstraint constraintWithItem:_containerView attribute:NSLayoutAttributeCenterX relatedBy:NSLayoutRelationEqual toItem:_cancelButton attribute:NSLayoutAttributeCenterX multiplier:1 constant:0];
    NSLayoutConstraint *cancelBtnTop = [NSLayoutConstraint constraintWithItem:_cancelButton attribute:NSLayoutAttributeTop relatedBy:NSLayoutRelationEqual toItem:_containerView attribute:NSLayoutAttributeBottom multiplier:1 constant:kMenuSpace];
    NSLayoutConstraint *cancelBtnWidth = [NSLayoutConstraint constraintWithItem:_cancelButton attribute:NSLayoutAttributeWidth relatedBy:NSLayoutRelationEqual toItem:_containerView attribute:NSLayoutAttributeWidth multiplier:1 constant:0];
    NSLayoutConstraint *cancelBtnHeight = [NSLayoutConstraint constraintWithItem:_cancelButton attribute:NSLayoutAttributeHeight relatedBy:NSLayoutRelationEqual toItem:nil attribute:NSLayoutAttributeHeight multiplier:1 constant:kCancelButtonHeight];
    [self.view addConstraints:@[cancelBtnCenterX,cancelBtnTop,cancelBtnWidth,cancelBtnHeight]];
}

//屏幕旋转的时候这些约束要重新计算
- (void)_layoutSubViews
{
    BOOL isSystemStyle = self.configuration.style == SSUIActionSheetStyleSystem;
    
    // 取消按钮是否存在
    CGFloat spaceWithBottom = 0.0;
    if (![MOBFDevice isPad])
    {
        if (isSystemStyle)
        {
            if (self.configuration.isCancelButtonHidden)
            {
                spaceWithBottom = kCancelButtonSpace;
            }
            else
            {
                spaceWithBottom = 2 * kCancelButtonSpace + kCancelButtonHeight;
            }
        }
    }
    
    // 竖屏情况下的iPhoneX底部偏移
    CGFloat iPhoneXSafeAreaOffSet = isiPhoneXDevice ? 15.0:0.0;
    CGFloat menuH = self.menuHeight;
    CGFloat menuSpace = self.menuSpace;
    
    NSInteger pageCount = self.pageCount;
    if (pageCount <= 1)
    {
        _pageControl.hidden = YES;
    }
    else
    {
        _pageControl.numberOfPages = pageCount;
        _pageControl.currentPage = 0;
    }

    _containerViewHeightConstraint.constant = menuH + (isSystemStyle ? 0.0:iPhoneXSafeAreaOffSet);
    _collectionViewHeightConstraint.constant = menuH - 2*kPageControlSpace - (isSystemStyle ? kItemPortraitVerticalSpace:0);
    _containerViewTopConstraint.constant = - (menuH + spaceWithBottom + iPhoneXSafeAreaOffSet);
    _containerViewLeftConstraint.constant = menuSpace;
    _containerViewRightConstraint.constant = -menuSpace;

    [_platformsCollectionView setCollectionViewLayout:self.flowLayoutForMenu animated:NO];//设置后collectionView有个初始偏移量
    _platformsCollectionView.contentOffset = CGPointZero;
    [UIView animateWithDuration:0.25 animations:^{
        [self.view layoutIfNeeded];
        if (isiPhoneXDevice && isLandscape)
        {
            _platformsCollectionView.contentOffset = CGPointZero;
        }
    }];
}

#pragma mark - UICollectionViewDelegate, UICollectionViewDataSource

- (NSInteger)collectionView:(UICollectionView *)collectionView numberOfItemsInSection:(NSInteger)section
{
    return self.platforms.count;
}

- (UICollectionViewCell *)collectionView:(UICollectionView *)collectionView cellForItemAtIndexPath:(NSIndexPath *)indexPath
{
    id cell = [collectionView dequeueReusableCellWithReuseIdentifier:kSSUICollectionViewCellReuseIdentifier forIndexPath:indexPath];
    
    id platform = self.platforms[indexPath.row];
    // 也有可能是 SSUIPlatformItem 类型 （用户自定义的）
    if ([platform isKindOfClass:NSNumber.class])
    {
        platform = [SSUIPlatformItem itemWithPlatformType:[platform integerValue]];
    }
    
    [cell setupWithPlatFormItem:platform titleColor:self.configuration.itemTitleColor titleFont:self.configuration.itemTitleFont];
    
    return cell;
}

- (void)collectionView:(UICollectionView *)collectionView didSelectItemAtIndexPath:(NSIndexPath *)indexPath
{
    [self.delegate shareSheet:self didSelectPlatform:self.platforms[indexPath.row] params:self.params];
}

- (void)scrollViewDidScroll:(UIScrollView *)scrollView
{
    NSInteger index = scrollView.contentOffset.x / scrollView.bounds.size.width;
    _pageControl.currentPage = index;
}

#pragma mark - Getter 计算属性

// 总列数
- (NSInteger)totalColumns
{
    if (isPortrait)
    {
        if (self.configuration.columnPortraitCount)
        {
            return self.configuration.columnPortraitCount;
        }
    }
    else
    {
        if (self.configuration.columnLandscapeCount)
        {
            return self.configuration.columnLandscapeCount;
        }
    }
    
    if ([MOBFDevice isPad])
    {
        return 3;
    }
    else
    {
        NSInteger tempColumns = 4;
        BOOL isLandscapeIphoneX = UIInterfaceOrientationIsLandscape([UIApplication sharedApplication].statusBarOrientation) && isiPhoneXDevice;
        CGFloat space = isLandscapeIphoneX ? (kMenuSpace+30.0):kMenuSpace;
        CGFloat width = kScreenWidth - space;
        
        while (105.0 < width/tempColumns)
        {
            tempColumns++;
        }
        return tempColumns;
    }
}

//总行数
- (NSInteger)totalRows
{
    NSInteger tempRows = 0;
    if (MOBFDevice.isPad)
    {
        tempRows = 3;
    }
    else
    {
        tempRows = isPortrait ? 3:2;
    }
    
    NSInteger columns = self.totalColumns;
    if (self.platforms.count <= tempRows * columns)
    {
        tempRows = ceil(self.platforms.count*1.0/columns);
    }
    
    return tempRows;
}

// 图标宽度
- (CGFloat)itemWidth
{
    if (self.configuration.style == SSUIActionSheetStyleSystem)
    {
        return kItemWidth;
    }
    else
    {
        CGFloat sheetWidth = MOBFDevice.isPad ? kShareSheetiPadWidth:kScreenWidth;
        sheetWidth -= 2 * ((isiPhoneXDevice && isLandscape) ? kiPhoneXLandscapeSafaAreaOffset:0.0);;
        NSInteger columns = self.totalColumns;
        return sheetWidth/columns;
    }
}

// 图标高度
- (CGFloat)itemHeight
{
    if (self.configuration.style == SSUIActionSheetStyleSystem)
    {
        return self.itemWidth + 33.3;
    }
    else
    {
        return kSimpleItemHeight;
    }
}

// item 竖直方向之间的间距
- (CGFloat)itemVerticalSpace
{
    if ([MOBFDevice isPad])
    {
        return kItemPortraitVerticalSpace;
    }
    else
    {
        return isPortrait ? kItemPortraitVerticalSpace : kItemLandscapeVerticalSpace;
    }
}

// item 水平方向之间的间距
- (CGFloat)itemHorizontalSpace
{
    CGFloat sheetWidth = MOBFDevice.isPad ? kShareSheetiPadWidth:(kScreenWidth - 2 * self.menuSpace);
    NSInteger columns = self.totalColumns;
    
    if (self.configuration.style == SSUIActionSheetStyleSystem)
    {
        return (sheetWidth - columns * self.itemWidth)/(columns + 1);
    }
    else
    {
        return 0;
    }
}

// 弹出菜单和屏幕直接的间距
- (CGFloat)menuSpace
{
    if (isiPhoneXDevice && isLandscape)
    {
        return kiPhoneXLandscapeSafaAreaOffset;
    }
    else
    {
        BOOL isSystemStyle = self.configuration.style == SSUIActionSheetStyleSystem;
        return ((isSystemStyle && !MOBFDevice.isPad) ? kMenuSpace:0.0);
        
    }
}

// 菜单高度
- (CGFloat)menuHeight
{
    NSInteger rowCount = self.totalRows;

    if (self.configuration.style == SSUIActionSheetStyleSystem)
    {
        return rowCount * self.itemHeight + kItemPortraitVerticalSpace + (rowCount - 1) * self.itemVerticalSpace + 2 * kPageControlSpace;
    }
    else
    {
        return rowCount * self.itemHeight + 2 * kPageControlSpace;
    }
}

// 页数
- (NSInteger)pageCount
{
    NSInteger row = self.totalRows;
    NSInteger totalColumns = self.totalColumns;
    
    return (self.platforms.count - 1) / (row * totalColumns) + 1;
}

- (SSUICollectionViewLayout *)flowLayoutForMenu
{
    SSUICollectionViewLayout *layout = [[SSUICollectionViewLayout alloc] init];
    layout.rowCount = self.totalRows;
    layout.columnCount = self.totalColumns;
    layout.itemWidth = self.itemWidth;
    layout.itemHeight = self.itemHeight;
    layout.alignment = self.configuration.itemAlignment;
    if (self.configuration.style == SSUIActionSheetStyleSystem)
    {
        layout.horizontalSpacing = self.itemHorizontalSpace;
        layout.verticalSpacing = self.itemVerticalSpace;
    }

    return layout;
}

- (void)willAnimateRotationToInterfaceOrientation:(UIInterfaceOrientation)toInterfaceOrientation duration:(NSTimeInterval)duration
{
    [self _layoutSubViews];
}

- (UIInterfaceOrientationMask)supportedInterfaceOrientations
{
    return self.configuration.interfaceOrientationMask;
}


- (void)touchesBegan:(NSSet<UITouch *> *)touches withEvent:(UIEvent *)event
{
    __weak typeof(self) weakSelf = self;
    [self hideSheetWithAnimationCompletion:^{
        [weakSelf.delegate shareSheet:weakSelf didCancelShareWithParams:weakSelf.params];
    }];
}

- (void)hideSheetWithAnimationCompletion:(void (^)(void))completion
{
    _containerViewTopConstraint.constant = 0;
    [UIView animateWithDuration:0.25 animations:^{
        [self.view layoutIfNeeded];
    } completion:^(BOOL finished) {
        if (completion) {
            completion();
        }
    }];
}

- (void)dealloc
{
    SSUILog(@"------------------DELLOC-------------------");
}

@end
