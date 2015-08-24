//
//  SSUIShareActinoSheetItemView.m
//  ShareSDKUI
//
//  Created by 刘 靖煌 on 15/7/15.
//  Copyright (c) 2015年 mob. All rights reserved.
//

#import "SSUIShareActinoSheetItemView.h"
#import "SSUIShareActionSheetItem.h"
#import "SSUIShareActionSheetPlatformItem.h"
#import "SSUIShareActionSheetCustomItem.h"
#import "SSUIShareActionSheetStyle_Private.h"

static const CGFloat iconW = 60.0;
static const CGFloat iconH = 60.0;
static const CGFloat nameH = 18;

@interface SSUIShareActinoSheetItemView ()

@property (nonatomic ,strong) SSUIShareActionSheetItem *baseItem;

@end

@implementation SSUIShareActinoSheetItemView

-(instancetype)initWithIndex:(NSInteger)index
{
    if (self = [super init])
    {
        self.index = index;
        
        UILabel *name = [[UILabel alloc] init];
        name.textAlignment = NSTextAlignmentCenter;
        name.textColor = [UIColor blackColor];
        name.backgroundColor = [UIColor clearColor];
        name.font = [UIFont systemFontOfSize:12];
        
        if ([SSUIShareActionSheetStyle sharedInstance].itemNameColor)
        {
            name.textColor = [SSUIShareActionSheetStyle sharedInstance].itemNameColor;
        }
        
        if ([SSUIShareActionSheetStyle sharedInstance].itemNameFont)
        {
            name.font = [SSUIShareActionSheetStyle sharedInstance].itemNameFont;
        }
        
        [self addSubview:name];
        self.nameLabel = name;
        
        UIButton *icon = [[UIButton alloc] init];
        [icon addTarget:self action:@selector(itemClicked:) forControlEvents:UIControlEventTouchUpInside];
        [self addSubview:icon];
        self.platformIcon = icon;
    }
    return self;
}

-(void)setItem:(SSUIShareActionSheetItem *)item
{
    _item = item;
    [self.platformIcon setBackgroundImage:item.icon forState:UIControlStateNormal];
    self.nameLabel.text = item.label;
}

- (void)itemClicked:(id)sender
{
    if (self.clickHandle)
    {
        self.clickHandle(self.index,self.item);
    }
}

- (void)layoutSubviews
{
    [super layoutSubviews];
    
    self.platformIcon.frame = CGRectMake(0, 0, iconW, iconH);
    
    CGFloat nameY = CGRectGetMaxY(self.platformIcon.frame);
    self.nameLabel.frame = CGRectMake(0, nameY, iconW, nameH);
}


@end
