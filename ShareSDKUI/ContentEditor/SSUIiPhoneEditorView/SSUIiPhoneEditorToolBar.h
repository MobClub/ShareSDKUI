//
//  SSUIiPhoneEditorToolBar.h
//  ShareSDKUI
//
//  Created by chenjd on 15/7/6.
//  Copyright (c) 2015年 mob. All rights reserved.
//

#import <UIKit/UIKit.h>
#import "SSUIHorizontalTableView.h"
#import "SSUIiPhoneEditorToolBarItem.h"
#import <ShareSDK/SSDKTypeDefine.h>

@interface SSUIiPhoneEditorToolBar : UIView <SSUIHorizontalTableViewDelegate,
                                            SSUIHorizontalTableViewDataSource,
                                            SSUIHorizontalTableViewItemDelegate>
{
@private
    SSUIHorizontalTableView *_platTableView;
    UILabel *_textLabel;
    
    SSDKPlatformType _platType;
    NSArray *_platformArray;
    
}
/**
 *	@brief	选中平台列表
 */
@property (nonatomic,readonly) NSArray *selectedPlatforms;

@property (nonatomic, strong)  SSUIHorizontalTableView *platTableView;

/**
 *	@brief	更新工具栏
 *
 *  @param  platType    平台类型
 *	@param 	platforms 	平台信息
 */
- (void)updateWithType:(SSDKPlatformType)platType
             platforms:(NSArray *)platform;



@end
