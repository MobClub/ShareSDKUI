//
//  SSUICollectionViewCell.m
//  ShareSDKUI
//
//  Created by Max on 2018/4/8.
//  Copyright © 2018年 Max. All rights reserved.
//

#import "SSUICollectionViewCell.h"
#import "SSUIPlatformItem.h"

@interface SSUICollectionViewCell()
@property (weak, nonatomic) UIImageView *iconImageView;
@property (weak, nonatomic) UILabel *nameLabel;
@end

@implementation SSUICollectionViewCell

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
    NSLayoutConstraint *iconImageViewLeft = [NSLayoutConstraint constraintWithItem:iconImageView attribute:NSLayoutAttributeLeft relatedBy:NSLayoutRelationEqual toItem:self.contentView attribute:NSLayoutAttributeLeft multiplier:1.0 constant:0];
    NSLayoutConstraint *iconImageViewRight = [NSLayoutConstraint constraintWithItem:iconImageView attribute:NSLayoutAttributeRight relatedBy:NSLayoutRelationEqual toItem:self.contentView attribute:NSLayoutAttributeRight multiplier:1.0 constant:0];
    NSLayoutConstraint *iconImageViewTop = [NSLayoutConstraint constraintWithItem:iconImageView attribute:NSLayoutAttributeTop relatedBy:NSLayoutRelationEqual toItem:self.contentView attribute:NSLayoutAttributeTop multiplier:1.0 constant:0];
    NSLayoutConstraint *iconImageViewHeight = [NSLayoutConstraint constraintWithItem:iconImageView attribute:NSLayoutAttributeWidth relatedBy:NSLayoutRelationEqual toItem:iconImageView attribute:NSLayoutAttributeHeight multiplier:1.0 constant:0];
    [self.contentView addConstraints:@[iconImageViewLeft,iconImageViewRight,iconImageViewTop,iconImageViewHeight]];
    
    nameLabel.translatesAutoresizingMaskIntoConstraints = NO;
    NSLayoutConstraint *nameLabelCenterX = [NSLayoutConstraint constraintWithItem:nameLabel attribute:NSLayoutAttributeCenterX relatedBy:NSLayoutRelationEqual toItem:iconImageView attribute:NSLayoutAttributeCenterX multiplier:1 constant:0];
    NSLayoutConstraint *nameLabelTop = [NSLayoutConstraint constraintWithItem:nameLabel attribute:NSLayoutAttributeTop relatedBy:NSLayoutRelationEqual toItem:iconImageView attribute:NSLayoutAttributeBottom multiplier:1 constant:kTitleSpace];
    NSLayoutConstraint *nameLabelWidth = [NSLayoutConstraint constraintWithItem:nameLabel attribute:NSLayoutAttributeWidth relatedBy:NSLayoutRelationEqual toItem:iconImageView attribute:NSLayoutAttributeWidth multiplier:1 constant:0];
    [self.contentView addConstraints:@[nameLabelCenterX,nameLabelTop,nameLabelWidth]];
}

- (void)setupWithPlatFormItem:(SSUIPlatformItem *)platformItem titleColor:(UIColor *)titleColor titleFont:(UIFont *)titleFont
{
    self.iconImageView.image = platformItem.iconNormal;
    self.nameLabel.textColor = titleColor;
    self.nameLabel.font = titleFont;
    self.nameLabel.text = platformItem.platformName;
}

@end
