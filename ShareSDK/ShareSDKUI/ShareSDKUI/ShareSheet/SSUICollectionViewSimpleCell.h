//
//  SSUICollectionViewSimpleCell.h
//  ShareSDKUI
//
//  Created by Max on 2018/4/9.
//  Copyright © 2018年 Max. All rights reserved.
//

#import <UIKit/UIKit.h>
@class SSUIPlatformItem;

@interface SSUICollectionViewSimpleCell : UICollectionViewCell

- (void)setupWithPlatFormItem:(SSUIPlatformItem *)platformItem titleColor:(UIColor *)titleColor titleFont:(UIFont *)titleFont;

@end
