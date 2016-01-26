//
//  SSUIiPadShareActionSheet.m
//  ShareSDKUI
//
//  Created by 刘 靖煌 on 15/6/18.
//  Copyright (c) 2015年 mob. All rights reserved.
//

#import "SSUIiPadShareActionSheet.h"
#import "SSUIBaseShareActionSheet_Private.h"
#import "SSUIiPadShareActionSheetViewController.h"
#import "SSUIShareActionSheetStyle_Private.h"
#import <MOBFoundation/MOBFDevice.h>
#import <MOBFoundation/MOBFoundation.h>

extern const CGFloat SSUIPageViewW;
extern const CGFloat SSUIPageViewH;

@interface SSUIiPadShareActionSheet ()
<UIPopoverPresentationControllerDelegate>

@property (nonatomic, strong) SSUIiPadShareActionSheetViewController *viewCtr;

@end

@implementation SSUIiPadShareActionSheet

- (instancetype)initWithItems:(NSArray *)items
{
    if (self = [super init])
    {
        self.items = items;
        _viewCtr = [[SSUIiPadShareActionSheetViewController alloc] initWithItems:self.items];
        
        _row = ceil([items count] * 1.0 /3.0);
        
        //分屏适配
        if (!([MOBFDevice versionCompare:@"8.0"] >= 0))
        {
            _popover = [[UIPopoverController alloc] initWithContentViewController:_viewCtr];
            if ([MOBFDevice versionCompare:@"7.0"] >= 0)
            {
                if ([SSUIShareActionSheetStyle sharedInstance].actionSheetColor)
                {
                    _popover.backgroundColor = [SSUIShareActionSheetStyle sharedInstance].actionSheetColor;
                }
            }
            
            if (_row > 2)
            {
                _popover.popoverContentSize = CGSizeMake(SSUIPageViewW, SSUIPageViewH);
            }
            else
            {
                //根据行数调整高度
                _popover.popoverContentSize = CGSizeMake(SSUIPageViewW, 80*(_row + 1));
            }
        
            _popover.delegate = self;
        }
    }
    
    return self;
}

#pragma mark - SSUIBaseShareActionSheet

-(void)showInView:(UIView *)view
{
    [_viewCtr showInView:view];

    //分屏适配
    if ([MOBFDevice versionCompare:@"8.0"] >= 0)
    {
        if (view)
        {
            _viewCtr.modalPresentationStyle = UIModalPresentationPopover;
            _viewCtr.popoverPresentationController.sourceView = view;
            _viewCtr.popoverPresentationController.sourceRect = view.bounds;
            _viewCtr.popoverPresentationController.delegate = self;
            
            if (_row > 2)
            {
                _viewCtr.preferredContentSize = CGSizeMake(SSUIPageViewW, SSUIPageViewH);
            }
            else
            {
                //根据行数调整高度
                _viewCtr.preferredContentSize = CGSizeMake(SSUIPageViewW, 80*(_row + 1));
            }
        
            [[MOBFViewController currentViewController] presentViewController:_viewCtr
                                                                     animated:YES
                                                                   completion:^{}];
        }
        else
        {
            NSLog(@"#warning : It's necessary to point out a view for showShareActionSheet: ...");
        }
    }
    else
    {
        [_popover presentPopoverFromRect:view.bounds
                                  inView:view
                permittedArrowDirections:UIPopoverArrowDirectionAny
                                animated:YES];
    }
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
    //分屏适配
    if ([MOBFDevice versionCompare:@"8.0"] >= 0)
    {
        [_viewCtr dismissViewControllerAnimated:YES
                                     completion:^{}];
    }
    else
    {
        if (_popover.popoverVisible)
        {
            [_popover dismissPopoverAnimated:NO];
        }
    }
}

-(void)popoverControllerDidDismissPopover:(UIPopoverController *)popoverController
{
    if (self.cancelHandler)
    {
        self.cancelHandler ();
    }
}

#pragma mark - UIPopoverPresentationControllerDelegate

- (UIModalPresentationStyle)adaptivePresentationStyleForPresentationController:(UIPresentationController *)controller
{
    return UIModalPresentationNone;
}

-(void)popoverPresentationControllerDidDismissPopover:(UIPopoverPresentationController *)popoverPresentationController
{
    if (self.cancelHandler)
    {
        self.cancelHandler ();
    }
}

@end
