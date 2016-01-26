//
//  SSUIiPhoneEditorToolBar.m
//  ShareSDKUI
//
//  Created by chenjd on 15/7/6.
//  Copyright (c) 2015年 mob. All rights reserved.
//

#import "SSUIiPhoneEditorToolBar.h"
#import <MOBFoundation/MOBFImage.h>
#import <MOBFoundation/MOBFColor.h>
#import "SSUIShareContentEditorDef.h"
#import <ShareSDK/ShareSDK.h>
#import "SSUITypeDef.h"

#define KEY_TYPE @"type"
#define KEY_TITLE @"title"
#define KEY_SELECTED @"selected"
#define KEY_USERNAME @"username"
#define KEY_USERICON @"uicon"
#define KEY_IS_GET_INFO @"isGetInfo"

#define ITEM_WIDTH 35.0
#define LABEL_WIDTH 60.0

#define ITEM_ID @"platformItem"

@implementation SSUIiPhoneEditorToolBar

- (id)initWithFrame:(CGRect)frame
{
    self = [super initWithFrame:frame];
    if (self)
    {
        NSString* bundlePath = [[NSBundle mainBundle] pathForResource:@"ShareSDKUI"
                                                               ofType:@"bundle"];
        
        UIImageView *lineView = [[UIImageView alloc] initWithImage:[MOBFImage imageName:@"ContentEditorImg/line@2x.gif"
                                                                                 bundle:[NSBundle bundleWithPath:bundlePath]]];
        
        
        
        lineView.frame = CGRectMake(0.0, 0.0, SSUI_WIDTH(self), SSUI_HEIGHT(lineView));
        lineView.autoresizingMask = UIViewAutoresizingFlexibleWidth;
        [self addSubview:lineView];
        
        _textLabel = [[UILabel alloc] initWithFrame:CGRectMake(0.0, SSUI_BOTTOM(lineView), LABEL_WIDTH, SSUI_HEIGHT(self) - SSUI_HEIGHT(lineView))];
        _textLabel.textColor = [MOBFColor colorWithRGB:0x9a9a9a];
        _textLabel.font = [UIFont systemFontOfSize:12];
        _textLabel.text = NSLocalizedStringWithDefaultValue(@"ShareTo", @"ShareSDKUI_Localizable", [NSBundle bundleWithPath:[[NSBundle mainBundle] pathForResource:@"ShareSDKUI" ofType:@"bundle"]], @"ShareTo", nil);
        _textLabel.textAlignment = NSTextAlignmentCenter;
        [self addSubview:_textLabel];
        
        _platTableView = [[SSUIHorizontalTableView alloc] initWithFrame:CGRectMake(LABEL_WIDTH, SSUI_BOTTOM(lineView), SSUI_WIDTH(self) - LABEL_WIDTH, SSUI_HEIGHT(self) - SSUI_HEIGHT(lineView))];
        _platTableView.autoresizingMask = UIViewAutoresizingFlexibleTopMargin | UIViewAutoresizingFlexibleWidth;
        _platTableView.itemWidth = ITEM_WIDTH;
        _platTableView.dataSource = self;
        _platTableView.delegate = self;
        [self addSubview:_platTableView];
    }
    
    return self;
}

- (void)updateWithType:(SSDKPlatformType)platType
             platforms:(NSArray *)platforms
{
    _platType = platType;
    
    _platformArray = platforms;
    
    [_platTableView reloadData];
}


- (NSArray *)selectedPlatforms
{
    NSMutableArray *selPlatforms = [NSMutableArray array];
    for (int i = 0; i < [_platformArray count]; i++)
    {
        NSDictionary *item = [_platformArray objectAtIndex:i];
        BOOL selected = [[item objectForKey:KEY_SELECTED] boolValue];
        
        if (selected)
        {
            [selPlatforms addObject:[item objectForKey:KEY_TYPE]];
        }
    }
    
    return selPlatforms;
}

#pragma mark - SSUIHorizontalTableViewDataSource

- (NSInteger)itemNumberOfTableView:(SSUIHorizontalTableView *)tableView
{
    return [_platformArray count];
}

#pragma mark - SSUIHorizontalTableViewDelegate

- (UIView<ISSUIHorizontalTableViewItem> *)tableView:(SSUIHorizontalTableView *)tableView itemForIndexPath:(NSIndexPath *)indexPath
{
    UIView<ISSUIHorizontalTableViewItem> *item = [tableView dequeueReusableItemWithIdentifier:ITEM_ID];
    
    if (item == nil)
    {
        item = [[SSUIiPhoneEditorToolBarItem alloc] initWithReuseIdentifier:ITEM_ID];
        ((SSUIiPhoneEditorToolBarItem *)item).delegate = self;
    }
    
    if (indexPath.row < [_platformArray count])
    {
        ((SSUIiPhoneEditorToolBarItem *)item).data = [_platformArray objectAtIndex:indexPath.row];

    }
    
    return item;
}

#pragma mark - SSUIHorizontalTableViewItemDelegate

- (void)itemOnClick:(SSUIiPhoneEditorToolBarItem *)itemView
{
    __weak SSUIiPhoneEditorToolBar *theToolbar = self;
    NSMutableDictionary *data = itemView.data;
    SSDKPlatformType platType = (SSDKPlatformType)[[data objectForKey:KEY_TYPE] integerValue];
    BOOL selected = ![[data objectForKey:KEY_SELECTED] boolValue];
    if (selected)
    {
        //判断是否需要授权
        BOOL authorized = [ShareSDK hasAuthorized:platType];
        if (authorized) {
                
            [data setObject:[NSNumber numberWithBool:selected] forKey:KEY_SELECTED];
            [_platTableView reloadData];
                
        }else{
                
            [ShareSDK authorize:platType
                       settings:nil
                 onStateChanged:^(SSDKResponseState state, SSDKUser *user, NSError *error) {
                    
                if (state == SSDKResponseStateSuccess) {
                    [data setObject:[NSNumber numberWithBool:selected] forKey:KEY_SELECTED];
                    [theToolbar.platTableView reloadData];
                }
            }];
        }
 
    }
    else
    {
        if (platType == _platType)
        {
            //无法取消当前发送平台平台
            return;
        }
        
        [data setObject:[NSNumber numberWithBool:selected] forKey:KEY_SELECTED];
    }
    
    [_platTableView reloadData];
}


@end
