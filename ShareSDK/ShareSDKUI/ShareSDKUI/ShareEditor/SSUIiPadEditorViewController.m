//
//  SSUIiPadEditorViewController.m
//  ShareSDKUI
//
//  Created by Max on 2018/4/13.
//  Copyright © 2018年 Max. All rights reserved.
//

#import "SSUIiPadEditorViewController.h"
#import "SSUIEditorConfiguration.h"

@interface SSUIiPadEditorViewController ()

@property (weak, nonatomic) UIView *editorView;

@end

@implementation SSUIiPadEditorViewController

- (void)viewDidLoad
{
    [super viewDidLoad];
    [self _configUI];
}

- (void)_configUI
{
    self.view.backgroundColor = [MOBFColor colorWithARGB:0x4c000000];
    
    UIView *editorView = [[UIView alloc] init];
    editorView.backgroundColor = [UIColor whiteColor];
    editorView.layer.cornerRadius = 10.0;
    editorView.layer.masksToBounds = YES;
    [self.view addSubview:editorView];
    _editorView = editorView;
    
    UIView *bar = [[UIView alloc] init];
    bar.backgroundColor = self.editorVc.configuration.iPadNavigationBarBackgroundColor;
    [editorView addSubview:bar];

    UIButton *cancelButton = self.editorVc.leftBarItemButton;
    [bar addSubview:self.editorVc.leftBarItemButton];

    UIButton *sendButton = self.editorVc.rightBarItemButton;
    [bar addSubview:sendButton];
    
    UIActivityIndicatorView *indicatorView = self.editorVc.indicatorView;
    [indicatorView stopAnimating];
    indicatorView.hidden = YES;
    [editorView addSubview:indicatorView];
    
    UILabel *titleLabel = [[UILabel alloc] init];
    titleLabel.font = [UIFont systemFontOfSize:17];
    titleLabel.textColor =self.editorVc.configuration.titleColor ?: [UIColor darkTextColor];
    titleLabel.text = self.editorVc.configuration.title;
    [bar addSubview:titleLabel];
    
    UIView *line = [[UIView alloc] init];
    line.backgroundColor = [MOBFColor colorWithARGB:0x4c000000];
    [editorView addSubview:line];
    
    UIView *contentView = self.editorVc.view;
    [editorView addSubview:contentView];
    
    //设置一波约束
    editorView.translatesAutoresizingMaskIntoConstraints = NO;
    NSLayoutConstraint *editorViewCenterX = [NSLayoutConstraint constraintWithItem:editorView attribute:NSLayoutAttributeCenterX relatedBy:NSLayoutRelationEqual toItem:self.view attribute:NSLayoutAttributeCenterX multiplier:1.0 constant:0];
    NSLayoutConstraint *editorViewTop = [NSLayoutConstraint constraintWithItem:editorView attribute:NSLayoutAttributeTop relatedBy:NSLayoutRelationEqual toItem:self.view attribute:NSLayoutAttributeTop multiplier:1.0 constant:kEditorViewiPadTopSpace];
    NSLayoutConstraint *editorViewWidth = [NSLayoutConstraint constraintWithItem:editorView attribute:NSLayoutAttributeWidth relatedBy:NSLayoutRelationEqual toItem:nil attribute:NSLayoutAttributeWidth multiplier:1.0 constant:kEditorViewiPadWidth];
    NSLayoutConstraint *editorViewHeight = [NSLayoutConstraint constraintWithItem:editorView attribute:NSLayoutAttributeHeight relatedBy:NSLayoutRelationEqual toItem:nil attribute:NSLayoutAttributeHeight multiplier:1.0 constant:kEditorViewiPadHeight];
    [self.view addConstraints:@[editorViewCenterX,editorViewTop,editorViewWidth,editorViewHeight]];
    
    bar.translatesAutoresizingMaskIntoConstraints = NO;
    NSLayoutConstraint *barTop = [NSLayoutConstraint constraintWithItem:bar attribute:NSLayoutAttributeTop relatedBy:NSLayoutRelationEqual toItem:editorView attribute:NSLayoutAttributeTop multiplier:1.0 constant:0];
    NSLayoutConstraint *barLeft = [NSLayoutConstraint constraintWithItem:bar attribute:NSLayoutAttributeLeft relatedBy:NSLayoutRelationEqual toItem:editorView attribute:NSLayoutAttributeLeft multiplier:1.0 constant:0];
    NSLayoutConstraint *barRight = [NSLayoutConstraint constraintWithItem:bar attribute:NSLayoutAttributeRight relatedBy:NSLayoutRelationEqual toItem:editorView attribute:NSLayoutAttributeRight multiplier:1.0 constant:0];
    NSLayoutConstraint *barHeight = [NSLayoutConstraint constraintWithItem:bar attribute:NSLayoutAttributeHeight relatedBy:NSLayoutRelationEqual toItem:nil attribute:NSLayoutAttributeHeight multiplier:1.0 constant:44.0];
    [editorView addConstraints:@[barTop,barLeft,barRight,barHeight]];
    
    cancelButton.translatesAutoresizingMaskIntoConstraints = NO;
    NSLayoutConstraint *cancelButtonLeft = [NSLayoutConstraint constraintWithItem:cancelButton attribute:NSLayoutAttributeLeft relatedBy:NSLayoutRelationEqual toItem:bar attribute:NSLayoutAttributeLeft multiplier:1.0 constant:10.0];
    NSLayoutConstraint *cancelButtonCenterY = [NSLayoutConstraint constraintWithItem:cancelButton attribute:NSLayoutAttributeCenterY relatedBy:NSLayoutRelationEqual toItem:bar attribute:NSLayoutAttributeCenterY multiplier:1.0 constant:0];
    [editorView addConstraints:@[cancelButtonLeft,cancelButtonCenterY]];
    
    sendButton.translatesAutoresizingMaskIntoConstraints = NO;
    NSLayoutConstraint *sendButtonRight = [NSLayoutConstraint constraintWithItem:sendButton attribute:NSLayoutAttributeRight relatedBy:NSLayoutRelationEqual toItem:bar attribute:NSLayoutAttributeRight multiplier:1.0 constant:-10.0];
    NSLayoutConstraint *sendButtonTop = [NSLayoutConstraint constraintWithItem:sendButton attribute:NSLayoutAttributeTop relatedBy:NSLayoutRelationEqual toItem:cancelButton attribute:NSLayoutAttributeTop multiplier:1.0 constant:0];
    [editorView addConstraints:@[sendButtonRight,sendButtonTop]];
    
    indicatorView.translatesAutoresizingMaskIntoConstraints = NO;
    NSLayoutConstraint *indicatorViewCenterX = [NSLayoutConstraint constraintWithItem:indicatorView attribute:NSLayoutAttributeCenterX relatedBy:NSLayoutRelationEqual toItem:sendButton attribute:NSLayoutAttributeCenterX multiplier:1.0 constant:0];
    NSLayoutConstraint *indicatorViewCenterY = [NSLayoutConstraint constraintWithItem:indicatorView attribute:NSLayoutAttributeCenterY relatedBy:NSLayoutRelationEqual toItem:sendButton attribute:NSLayoutAttributeCenterY multiplier:1.0 constant:0];
    [editorView addConstraints:@[indicatorViewCenterX, indicatorViewCenterY]];
    
    titleLabel.translatesAutoresizingMaskIntoConstraints = NO;
    NSLayoutConstraint *titleLabelCenterX = [NSLayoutConstraint constraintWithItem:titleLabel attribute:NSLayoutAttributeCenterX relatedBy:NSLayoutRelationEqual toItem:bar attribute:NSLayoutAttributeCenterX multiplier:1.0 constant:0];
    NSLayoutConstraint *titleLabelCenterY = [NSLayoutConstraint constraintWithItem:titleLabel attribute:NSLayoutAttributeCenterY relatedBy:NSLayoutRelationEqual toItem:cancelButton attribute:NSLayoutAttributeCenterY multiplier:1.0 constant:0];
    [editorView addConstraints:@[titleLabelCenterX,titleLabelCenterY]];
    
    line.translatesAutoresizingMaskIntoConstraints = NO;
    NSLayoutConstraint *lineLeft = [NSLayoutConstraint constraintWithItem:line attribute:NSLayoutAttributeLeft relatedBy:NSLayoutRelationEqual toItem:editorView attribute:NSLayoutAttributeLeft multiplier:1.0 constant:0];
    NSLayoutConstraint *lineRight = [NSLayoutConstraint constraintWithItem:line attribute:NSLayoutAttributeRight relatedBy:NSLayoutRelationEqual toItem:editorView attribute:NSLayoutAttributeRight multiplier:1.0 constant:0];
    NSLayoutConstraint *lineTop = [NSLayoutConstraint constraintWithItem:line attribute:NSLayoutAttributeTop relatedBy:NSLayoutRelationEqual toItem:editorView attribute:NSLayoutAttributeTop multiplier:1.0 constant:44.0];
    NSLayoutConstraint *lineHeight = [NSLayoutConstraint constraintWithItem:line attribute:NSLayoutAttributeHeight relatedBy:NSLayoutRelationEqual toItem:nil attribute:NSLayoutAttributeHeight multiplier:1.0 constant:1.0];
    [editorView addConstraints:@[lineLeft,lineRight,lineTop,lineHeight]];
    
    contentView.translatesAutoresizingMaskIntoConstraints = NO;
    NSLayoutConstraint *contentViewLeft = [NSLayoutConstraint constraintWithItem:contentView attribute:NSLayoutAttributeLeft relatedBy:NSLayoutRelationEqual toItem:editorView attribute:NSLayoutAttributeLeft multiplier:1.0 constant:0];
    NSLayoutConstraint *contentViewRight = [NSLayoutConstraint constraintWithItem:contentView attribute:NSLayoutAttributeRight relatedBy:NSLayoutRelationEqual toItem:editorView attribute:NSLayoutAttributeRight multiplier:1.0 constant:0];
    NSLayoutConstraint *contentViewBottom = [NSLayoutConstraint constraintWithItem:contentView attribute:NSLayoutAttributeBottom relatedBy:NSLayoutRelationEqual toItem:editorView attribute:NSLayoutAttributeBottom multiplier:1.0 constant:0];
    NSLayoutConstraint *contentViewTop = [NSLayoutConstraint constraintWithItem:contentView attribute:NSLayoutAttributeTop relatedBy:NSLayoutRelationEqual toItem:line attribute:NSLayoutAttributeBottom multiplier:1.0 constant:0];
    [editorView addConstraints:@[contentViewLeft,contentViewRight,contentViewBottom,contentViewTop]];
}

- (UIInterfaceOrientationMask)supportedInterfaceOrientations
{
    return self.editorVc.configuration.interfaceOrientationMask;
}

- (void)dealloc
{
    SSUILog(@"------------------DELLOC-------------------");
}

@end
