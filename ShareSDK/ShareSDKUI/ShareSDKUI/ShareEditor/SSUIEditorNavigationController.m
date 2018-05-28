//
//  SSUIEditorNavigationController.m
//  ShareSDKUI
//
//  Created by Max on 2018/4/16.
//  Copyright © 2018年 Max. All rights reserved.
//

#import "SSUIEditorNavigationController.h"
#import "SSUIEditerViewController.h"
#import "SSUIEditorConfiguration.h"

@interface SSUIEditorNavigationController ()

@end

@implementation SSUIEditorNavigationController

- (void)viewDidLoad
{
    [super viewDidLoad];
}

- (UIInterfaceOrientationMask)supportedInterfaceOrientations
{
    SSUIEditerViewController *vc = self.viewControllers.firstObject;
    return vc.configuration.interfaceOrientationMask;
}

- (void)dealloc
{
    SSUILog(@"------------------DELLOC-------------------");
}
@end
