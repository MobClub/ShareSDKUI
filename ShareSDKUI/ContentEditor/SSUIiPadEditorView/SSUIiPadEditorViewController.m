//
//  SSUIiPadEditorViewController.m
//  ShareSDKUI
//
//  Created by chenjd on 15/7/6.
//  Copyright (c) 2015年 mob. All rights reserved.
//

#import "SSUIiPadEditorViewController.h"
#import "SSUIShareContentEditorDef.h"


#define CONTENT_VIEW_WIDTH 480
#define CONTENT_VIEW_HEIGHT 300
#define PADDING_TOP 60.0

@implementation SSUIiPadEditorViewController

- (void)viewDidLoad

{
    [super viewDidLoad];
    
    self.view.backgroundColor = [MOBFColor colorWithARGB:0xcc64666c];
    
    _contentView = [[SSUIiPadEditorView alloc] initWithFrame:CGRectMake((SSUI_WIDTH(self.view) - CONTENT_VIEW_WIDTH) / 2,
                                                                            PADDING_TOP,
                                                                            CONTENT_VIEW_WIDTH,
                                                                            CONTENT_VIEW_HEIGHT)];
    _contentView.autoresizingMask = UIViewAutoresizingFlexibleLeftMargin | UIViewAutoresizingFlexibleRightMargin | UIViewAutoresizingFlexibleBottomMargin;
    [self.view addSubview:_contentView];

}

-(void)updateWithContent:(NSString *)content image:(SSDKImage *)image platformTypes:(NSArray *)platformTypes{
    
    _platformTypes = platformTypes;
    
    [_contentView updateWithType:_platformTypes content:content image:image interfaceOrientation:self.interfaceOrientation viewController:self];
    
    _contentView.submitHandler = self.submitHandler;
    _contentView.cancelHandler = self.cancelHandler;
    
}

@end
