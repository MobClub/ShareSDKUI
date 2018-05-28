//
//  SSUICollectionViewLayout.h
//  ShareSDKUI
//
//  Created by Max on 2018/4/8.
//  Copyright © 2018年 Max. All rights reserved.
//

#import <UIKit/UIKit.h>
#import "SSUIShareSheetConfiguration.h"

@interface SSUICollectionViewLayout : UICollectionViewLayout

@property (assign, nonatomic) SSUIItemAlignment alignment;
@property (assign, nonatomic) NSInteger rowCount;
@property (assign, nonatomic) NSInteger columnCount;
@property (assign, nonatomic) CGFloat horizontalSpacing;
@property (assign, nonatomic) CGFloat verticalSpacing;
@property (assign, nonatomic) CGFloat itemWidth;
@property (assign, nonatomic) CGFloat itemHeight;

@end
