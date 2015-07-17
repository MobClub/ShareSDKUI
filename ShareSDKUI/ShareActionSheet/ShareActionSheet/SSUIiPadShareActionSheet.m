//
//  SSUIiPadShareActionSheet.m
//  ShareSDKUI
//
//  Created by fenghj on 15/6/18.
//  Copyright (c) 2015年 mob. All rights reserved.
//

#import "SSUIiPadShareActionSheet.h"
#import "SSUIBaseShareActionSheet_Private.h"
#import "SSUIiPadShareActionSheetViewController.h"
#import "SSUIShareActionSheetStyle_Private.h"
#import <MOBFoundation/MOBFDevice.h>

@interface SSUIiPadShareActionSheet ()

@property (nonatomic, strong) SSUIiPadShareActionSheetViewController *viewCtr;

@end

@implementation SSUIiPadShareActionSheet

- (instancetype)initWithItems:(NSArray *)items
{
    if (self = [super init])
    {
        self.items = items;
        
        _viewCtr = [[SSUIiPadShareActionSheetViewController alloc] initWithItems:self.items];
        _viewCtr.view.backgroundColor = [UIColor clearColor];
        _popover = [[UIPopoverController alloc] initWithContentViewController:_viewCtr];
        
        if ([MOBFDevice versionCompare:@"7.0"] >= 0)
        {
            if ([SSUIShareActionSheetStyle sharedInstance].actionSheetColor)
            {
                _popover.backgroundColor = [SSUIShareActionSheetStyle sharedInstance].actionSheetColor;
            }
        }

        _popover.popoverContentSize = CGSizeMake(300, 400);
        _popover.delegate = self;
    }
    
    return self;
}

-(void)showInView:(UIView *)view
{
    [_viewCtr showInView:view];
    
    [_popover presentPopoverFromRect:view.bounds
                              inView:view
            permittedArrowDirections:UIPopoverArrowDirectionAny
                            animated:YES];
}

- (void)onItemClick:(SSUIShareActionSheetItemClickHandler)itemClickHandler
{
    [super onItemClick:itemClickHandler];
    
    _viewCtr.clickHandle = itemClickHandler;
}

- (void)onCancel:(SSUIShareActionSheetCancelHandler)cancelHandler
{
    [super onCancel:cancelHandler];
    
    _viewCtr.cancelHandle = cancelHandler;
}

- (void)dismiss
{
    if (_popover.popoverVisible)
    {
        [_popover dismissPopoverAnimated:NO];
    }
}

-(void)popoverControllerDidDismissPopover:(UIPopoverController *)popoverController
{
    if (self.cancelHandler)
    {
        self.cancelHandler ();
    }
}

@end
