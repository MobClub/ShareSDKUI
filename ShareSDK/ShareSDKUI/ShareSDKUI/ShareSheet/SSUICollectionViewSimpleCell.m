//
//  SSUICollectionViewSimpleCell.m
//  ShareSDKUI
//
//  Created by Max on 2018/4/9.
//  Copyright © 2018年 Max. All rights reserved.
//

#import "SSUICollectionViewSimpleCell.h"
#import "SSUIPlatformItem.h"

@interface SSUICollectionViewSimpleCell()

@property (weak, nonatomic) UIImageView *iconImageView;
@property (weak, nonatomic) UILabel *nameLabel;

@end

@implementation SSUICollectionViewSimpleCell

- (instancetype)initWithFrame:(CGRect)frame
{
    if (self = [super initWithFrame:frame])
    {
        [self _configUI];
    }
    return self;
}

- (void)_configUI
{
    UIImageView *iconImageView = [[UIImageView alloc] init];
    [self.contentView addSubview:iconImageView];
    _iconImageView = iconImageView;
    
    UILabel *nameLabel = [[UILabel alloc] init];
    nameLabel.numberOfLines = 0;
    nameLabel.textAlignment = NSTextAlignmentCenter;
    nameLabel.text = @"null";
    [self.contentView addSubview:nameLabel];
    _nameLabel = nameLabel;
    
    //设置约束
    iconImageView.translatesAutoresizingMaskIntoConstraints = NO;
    NSLayoutConstraint *iconImageViewCenterX = [NSLayoutConstraint constraintWithItem:iconImageView attribute:NSLayoutAttributeCenterX relatedBy:NSLayoutRelationEqual toItem:self.contentView attribute:NSLayoutAttributeCenterX multiplier:1.0 constant:0];
    NSLayoutConstraint *iconImageViewCenterY = [NSLayoutConstraint constraintWithItem:iconImageView attribute:NSLayoutAttributeBottom relatedBy:NSLayoutRelationEqual toItem:self.contentView attribute:NSLayoutAttributeCenterY multiplier:1.0 constant:0];
    NSLayoutConstraint *iconImageViewHeight = [NSLayoutConstraint constraintWithItem:iconImageView attribute:NSLayoutAttributeWidth relatedBy:NSLayoutRelationEqual toItem:iconImageView attribute:NSLayoutAttributeHeight multiplier:1.0 constant:0];
    NSLayoutConstraint *iconImageViewWidth = [NSLayoutConstraint constraintWithItem:iconImageView attribute:NSLayoutAttributeWidth relatedBy:NSLayoutRelationEqual toItem:self.contentView attribute:NSLayoutAttributeHeight multiplier:1.0/3 constant:0];
    [self.contentView addConstraints:@[iconImageViewCenterX,iconImageViewCenterY,iconImageViewHeight,iconImageViewWidth]];
    
    nameLabel.translatesAutoresizingMaskIntoConstraints = NO;
    NSLayoutConstraint *nameLabelCenterX = [NSLayoutConstraint constraintWithItem:nameLabel attribute:NSLayoutAttributeCenterX relatedBy:NSLayoutRelationEqual toItem:iconImageView attribute:NSLayoutAttributeCenterX multiplier:1 constant:0];
    NSLayoutConstraint *nameLabelTop = [NSLayoutConstraint constraintWithItem:nameLabel attribute:NSLayoutAttributeTop relatedBy:NSLayoutRelationEqual toItem:iconImageView attribute:NSLayoutAttributeBottom multiplier:1 constant:kTitleSpaceSimple];
    [self.contentView addConstraints:@[nameLabelCenterX,nameLabelTop]];
    
    self.contentView.layer.borderWidth = 0.5;
    self.contentView.layer.borderColor = [MOBFColor colorWithRGB:0xF5F5F5].CGColor;
}

- (void)setupWithPlatFormItem:(SSUIPlatformItem *)platformItem titleColor:(UIColor *)titleColor titleFont:(UIFont *)titleFont
{
    self.iconImageView.image = platformItem.iconSimple;
    self.nameLabel.textColor = titleColor;
    self.nameLabel.font = titleFont;
    self.nameLabel.text = platformItem.platformName;
}

@end
