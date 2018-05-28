//
//  SSUICollectionViewLayout.m
//  ShareSDKUI
//
//  Created by Max on 2018/4/8.
//  Copyright © 2018年 Max. All rights reserved.
//

#import "SSUICollectionViewLayout.h"

@interface SSUICollectionViewLayout()

@property (strong, nonatomic) NSMutableArray<UICollectionViewLayoutAttributes *> *layoutAttributes;

@end

@implementation SSUICollectionViewLayout

- (instancetype)init
{
    if (self = [super init])
    {
        _layoutAttributes = [NSMutableArray array];
    }
    return self;
}

- (BOOL)shouldInvalidateLayoutForBoundsChange:(CGRect)newBounds
{
    return YES;
}

- (void)prepareLayout
{
    for (NSInteger i=0; i<[self.collectionView numberOfItemsInSection:0]; i++)
    {
        UICollectionViewLayoutAttributes *attr = [UICollectionViewLayoutAttributes layoutAttributesForCellWithIndexPath:[NSIndexPath indexPathForRow:i inSection:0]];
        
        //第几页 从0页开始 每页只是x差了一个屏幕
        NSInteger pageCount = i / (self.columnCount * self.rowCount);
        CGFloat xOffset = pageCount * self.collectionView.bounds.size.width;
        
        CGFloat x = [self _layoutAttributeXWithIndex:i] + xOffset;
        CGFloat y = (i / self.columnCount - pageCount * self.rowCount) * (self.verticalSpacing + self.itemHeight);
        
        attr.frame = CGRectMake(x, y, self.itemWidth, self.itemHeight);

        [self.layoutAttributes addObject:attr];
    }
}

- (NSArray<UICollectionViewLayoutAttributes *> *)layoutAttributesForElementsInRect:(CGRect)rect
{
    return self.layoutAttributes;
}

- (UICollectionViewLayoutAttributes *)layoutAttributesForItemAtIndexPath:(NSIndexPath *)indexPath
{
    return self.layoutAttributes[indexPath.row];
}

- (CGSize)collectionViewContentSize
{
    NSInteger pageCount = ([self.collectionView numberOfItemsInSection:0] - 1) / (self.columnCount * self.rowCount) + 1;
    
    return CGSizeMake(pageCount * self.collectionView.bounds.size.width, 0);
}

- (CGFloat)_layoutAttributeXWithIndex:(NSInteger)i
{
    NSInteger itemsCount = [self.collectionView numberOfItemsInSection:0];
    NSInteger spaceCount = (itemsCount / self.columnCount + 1) * self.columnCount - itemsCount;
    NSInteger lastRowMinIndex = itemsCount - self.columnCount + spaceCount;
    
    switch (self.alignment)
    {
        case SSUIItemAlignmentRight:
        {
            if (i >= lastRowMinIndex)
            {
                return ((i + spaceCount) % self.columnCount + 1) * self.horizontalSpacing + (i + spaceCount) % self.columnCount * self.itemWidth;
            }
            else
            {
                return (i % self.columnCount + 1) * self.horizontalSpacing + i % self.columnCount * self.itemWidth;
            }
        }
        case SSUIItemAlignmentCenter:
        {
            if (i >= lastRowMinIndex)
            {
                CGFloat horizontalSpacing = (self.collectionView.frame.size.width - (self.columnCount - spaceCount) * self.itemWidth)/(self.columnCount - spaceCount + 1);
                return (i % self.columnCount + 1) * (self.horizontalSpacing ? horizontalSpacing:0.0) + i % self.columnCount * self.itemWidth;
            }
            else
            {
                return (i % self.columnCount + 1) * self.horizontalSpacing + i % self.columnCount * self.itemWidth;
            }
        }
        default:
            return (i % self.columnCount + 1) * self.horizontalSpacing + i % self.columnCount * self.itemWidth;
    }
}

@end
