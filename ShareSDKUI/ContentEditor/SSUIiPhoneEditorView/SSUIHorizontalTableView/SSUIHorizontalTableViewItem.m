//
//  CMHTableViewItem.m
//  Common
//
//  Created by 冯 鸿杰 on 13-2-25.
//  Copyright (c) 2013年 掌淘科技. All rights reserved.
//

#import "SSUIHorizontalTableViewItem.h"

@implementation SSUIHorizontalTableViewItem

@synthesize reuseIdentifier = _reuseIdentifier;
@synthesize indexPath = _indexPath;

#pragma mark - ICMHTableViewItem

- (id)initWithReuseIdentifier:(NSString *)reuseIdentifier
{
    if (self = [super initWithFrame:CGRectZero])
    {
        self.backgroundColor = [UIColor whiteColor];
        _reuseIdentifier = [reuseIdentifier copy];
    }
    
    return self;
}

@end
