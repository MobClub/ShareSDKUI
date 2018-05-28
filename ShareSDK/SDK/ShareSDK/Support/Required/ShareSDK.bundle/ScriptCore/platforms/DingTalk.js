/**
 * Created By Chen JD on 16/09/14
 *
 *
 *
 *
 */

var $pluginID = "com.mob.sharesdk.DingTalk";

/**
 * 钉钉应用信息键名定义
 * @type {{AppId: string, ConvertUrl : string}}
 */
var DingTalkInfoKeys = {
    "AppId"         : "app_id",
    "ConvertUrl"    : "covert_url"
};

/**
 * 钉钉好友分享内容集合
 * @type {{}}
 */
var DingTalkShareContentSet = {};

/**
 * 钉钉
 * @param type  平台类型
 * @constructor
 */
function DingTalk (type)
{
    this._type = type;
    this._appInfo = {};
    //设置当前语言环境
    this._currentLanguage = $mob.shareSDK.preferredLanguageLocalize();
}

/**
 * 获取平台类型
 * @returns {*} 平台类型
 */
DingTalk.prototype.type = function ()
{
    return this._type;
};

/**
 * 授权状态改变
 * @param sessionId         会话标识
 * @param data              返回数据
 * @private
 */
DingTalk.prototype.authStateChanged = function (sessionId, data)
{
    $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Cancel, null);
};

/**
 * 获取平台名称
 * @returns {string}    平台名称
 */
DingTalk.prototype.name = function ()
{
    if(this._currentLanguage === "zh-Hans")
    {
        return "钉钉";
    }
    else
    {
        return "DingTalk";
    }
};

/**
 * 获取应用标识
 * @returns {*} 应用标识
 */
DingTalk.prototype.appId = function ()
{
    if (this._appInfo[DingTalkInfoKeys.AppId] !== undefined) 
    {
        return this._appInfo[DingTalkInfoKeys.AppId];
    }

    return null;
};

/**
 * 获取缓存域名
 * @returns {string}    域名
 */
DingTalk.prototype.cacheDomain = function ()
{
    return "SSDK-Platform-" + this.type() + "-" + this.appId();
};

/**
 * 获取是否转换短链
 *
 * @return  true 转换， false 不转换
 */
DingTalk.prototype.convertUrlEnabled = function ()
{
    if (this._appInfo[DingTalkInfoKeys.ConvertUrl] !== undefined) 
    {
        return this._appInfo[DingTalkInfoKeys.ConvertUrl];
    }

    return $mob.shareSDK.convertUrlEnabled();
};

/**
 * 设置/获取应用信息
 * @param value 应用信息
 * @returns {*}
 */
DingTalk.prototype.setAppInfo = function (value)
{
    if (arguments.length === 0) 
    { 
        return this._appInfo;
    }
    else
    {
        this._appInfo = this._checkAppInfoAvailable(value);
        this._setupApp(this.appId());
    }
};

/**
 * 保存配置信息
 */
DingTalk.prototype.saveConfig = function ()
{
    var self = this;
    var domain = "SSDK-Platform";
    $mob.ext.getCacheData("currentApp", false, domain, function (data) {

        if (data != null)
        {
            var curApps = data.value;
            if (curApps == null)
            {
                curApps = {};
            }

            curApps["plat_" + self.type()] = self.appId();
            $mob.ext.setCacheData("currentApp", curApps, false, domain, null);
        }

    });
};

/**
 * 获取是否支持授权
 * @returns {boolean} true 支持， false 不支持
 */
DingTalk.prototype.isSupportAuth = function ()
{
    return false;
};

/**
 * 用户授权
 * @param sessionId     授权会话标识
 * @param settings      授权设置
 */
DingTalk.prototype.authorize = function (sessionId, settings)
{
    
    var error_message = null;
    
    if(this._currentLanguage === "zh-Hans")
    {
        error_message = "平台［" + this.name() + "］不支持授权功能!";
    }
    else
    {
        error_message = "Platform［" + this.name() + "］do not support authorize!";
    }

    var error = {
        "error_code" : $mob.shareSDK.errorCode.UnsupportFeature,
        "error_message" : error_message
    };
    $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Fail, error);
};

/**
 * 处理分享回调
 * @param sessionId     会话ID
 * @param callbackUrl   回调URL
 * @param sourceApplication     原始应用名称
 * @param annotation            附加数据
 */
DingTalk.prototype.handleShareCallback = function (sessionId, callbackUrl, sourceApplication, annotation)
{
    var self = this;

    if (callbackUrl.indexOf(this.appId() + "://") === 0)
    {
        
        $mob.ext.ssdk_isConnectedPlatformSDK("DTOpenAPI",function(data) {

            if(data.result)
            {
                //处理回调
                $mob.ext.isPluginRegisted("com.mob.sharesdk.connector.dingtalk", function (data){

                    if(data.result)
                    {
                        //处理回调
                        $mob.ext.ssdk_dingtalkHandleShareCallback(self.appId(), callbackUrl, function (data) {

                            //从分享内容集合中取出分享内容
                            var shareParams = DingTalkShareContentSet [sessionId];
                            var content = null;
                            var userData = null;
                            if (shareParams != null)
                            {
                                content = shareParams ["content"];
                                userData = shareParams ["user_data"];
                            }

                            switch (data.state)
                            {
                                case $mob.shareSDK.responseState.Success:
                                {
                                    //转换数据
                                    var resultData = {};
                                    resultData["raw_data"] = content;
                                    resultData["text"] = content["text"];

                                    var urls = [];
                                    if (content["url"])
                                    {
                                        urls.push(content["url"]);
                                    }
                                    resultData["urls"] = urls;

                                    if (content ["image"] != null)
                                    {
                                        resultData["images"] = [content ["image"]];
                                    }

                                    $mob.native.ssdk_shareStateChanged(sessionId, $mob.shareSDK.responseState.Success, resultData, null, userData);

                                    break;
                                }
                                case $mob.shareSDK.responseState.Fail:
                                    //失败
                                    var error = {
                                        "error_code" : $mob.shareSDK.errorCode.APIRequestFail,
                                        "user_data" :  {"error_code" : data.error_code, "error_message" : data.error_message}
                                    };

                                    $mob.native.ssdk_shareStateChanged(sessionId, $mob.shareSDK.responseState.Fail, error, null, userData);
                                    break;
                                default :
                                    //取消
                                    $mob.native.ssdk_shareStateChanged(sessionId, $mob.shareSDK.responseState.Cancel, null, null, userData);
                                    break;
                            }

                            //移除分享参数集合中的数据
                            delete DingTalkShareContentSet[sessionId];
                            DingTalkShareContentSet[sessionId] = null;
                        });
                    }
                    else
                    {
                        self._handleShareCallbackWithoutSDK(sessionId, callbackUrl);
                    }

                });
            }
            else
            {
                self._handleShareCallbackWithoutSDK(sessionId, callbackUrl);
            }

        });

        return true;
    }

    return false;
};


DingTalk.prototype._handleShareCallbackWithoutSDK = function (sessionId, callbackUrl)
{
    $mob.ext.ssdk_getDataFromPasteboard(this.appId(), sessionId, callbackUrl,$mob.shareSDK.platformType.DingTalk,function(data){

        if(data.result)
        {
            //从分享内容集合中取出分享内容
            var shareParams = DingTalkShareContentSet [sessionId];
            var content = null;
            var userData = null;
            if (shareParams != null)
            {
                content = shareParams ["content"];
                userData = shareParams ["user_data"];
            }

            var objects = data.retData;
            var errorCode = objects[1]["errorCode"];
            var errorMessage = objects[3];

            switch (errorCode)
            {
                case 0:
                {
                    //转换数据
                    var resultData = {};
                    resultData["raw_data"] = content;
                    resultData["text"] = content["text"];

                    var urls = [];
                    if (content["url"])
                    {
                        urls.push(content["url"]);
                    }
                    resultData["urls"] = urls;

                    if (content ["image"] != null)
                    {
                        resultData["images"] = [content ["image"]];
                    }

                    $mob.native.ssdk_shareStateChanged(sessionId, $mob.shareSDK.responseState.Success, resultData, null, userData);
                    break;
                }
                case -2:
                {
                    $mob.native.ssdk_shareStateChanged(sessionId, $mob.shareSDK.responseState.Cancel, null, null, userData);
                    break;
                }
                default :
                {
                    //失败
                    var error = {
                        "error_code" : $mob.shareSDK.errorCode.APIRequestFail,
                        "user_data" :  {"error_code" : errorCode, "error_message" : errorMessage}
                    };

                    $mob.native.ssdk_shareStateChanged(sessionId, $mob.shareSDK.responseState.Fail, error, null, userData);
                    break;
                }

            }
        }

    });
};

/**
 * 取消授权
 * @param callback      方法回调，回调方法声明如下:function (stat, data);
 */
DingTalk.prototype.cancelAuthorize = function (callback)
{

};

/**
 * 获取用户信息
 * @param query         查询信息
 * @param callback      方法回调
 */
DingTalk.prototype.getUserInfo = function (query, callback)
{
    var error_message = null;
    
    if(this._currentLanguage === "zh-Hans")
    {
        error_message = "平台［" + this.name() + "］不支持获取用户信息功能!";
    }
    else
    {
        error_message = "Platform［" + this.name() + "］do not support getting userInfo!";
    }

    var error = {
        "error_code" : $mob.shareSDK.errorCode.UnsupportFeature,
        "error_message" : error_message
    };
    if (callback != null)
    {
        callback ($mob.shareSDK.responseState.Fail, error);
    }
};

/**
 * 添加好友
 * @param sessionId     会话标识
 * @param user          用户信息
 * @param callback      方法回调，回调方法声明如下:function (stat, data);
 */
DingTalk.prototype.addFriend = function (sessionId, user, callback)
{
    
    var error_message = null;
    
    if(this._currentLanguage === "zh-Hans")
    {
        error_message = "平台［" + this.name() + "］不支持添加好友方法!";
    }
    else
    {
        error_message = "Platform［" + this.name() + "］do not support adding friends";
    }

    var error = {
        "error_code" : $mob.shareSDK.errorCode.UnsupportFeature,
        "error_message" : error_message
    };

    if (callback != null)
    {
        callback ($mob.shareSDK.responseState.Fail, error);
    }
};

/**
 * 获取好友列表
 * @param cursor        分页游标
 * @param size          分页尺寸
 * @param callback      方法回调，回调方法声明如下:function (state, data);
 */
DingTalk.prototype.getFriends = function (cursor, size, callback)
{
    var error_message = null;
    
    if(this._currentLanguage === "zh-Hans")
    {
        error_message = "平台［" + this.name() + "不支持获取好友列表方法!";
    }
    else
    {
        error_message = "Platform［" + this.name() + "］do not support getting friend list";
    }

    var error = {
        "error_code" : $mob.shareSDK.errorCode.UnsupportFeature,
        "error_message" : error_message
    };

    if (callback != null)
    {
        callback ($mob.shareSDK.responseState.Fail, error);
    }
};

/**
 * 调用API接口
 * @param url           接口URL
 * @param method        请求方式
 * @param params        请求参数
 * @param headers       请求头
 * @param callback      方法回调, 回调方法声明如下:function (state, data);
 */
DingTalk.prototype.callApi = function (url, method, params, headers, callback)
{
    var error_message = null;
    
    if(this._currentLanguage === "zh-Hans")
    {
        error_message = "平台［" + this.name() + "不支持该功能!";
    }
    else
    {
        error_message = "Platform［" + this.name() + "］do not support this feature";
    }

    var error = {
        "error_code" : $mob.shareSDK.errorCode.UnsupportFeature,
        "error_message" : error_message
    };
    if (callback != null)
    {
        callback ($mob.shareSDK.responseState.Fail, error);
    }
};

/**
 * 创建用户信息
 * @param rawData       原始用户数据
 * @returns {null}      用户数据
 */
DingTalk.prototype.createUserByRawData = function (rawData)
{
    return null;
};

/**
 * 分享内容
 * @param sessionId         会话ID
 * @param parameters        分享参数
 * @param callback          方法回调，回调方法声明如下:function (state, data, user, userData);
 */
DingTalk.prototype.share = function (sessionId, parameters, callback)
{


    //获取分享统计标识
    var flags = parameters != null ? parameters ["@flags"] : null;
    var userData =
    {
        "@flags" : flags
    };
    if (this._canShare())
    {
        var self = this;
        //检测是否支持多任务
        $mob.ext.isMultitaskingSupported(function (data)
        {
            if (data.result)
            {
                //检测URL Scheme
                self._checkUrlScheme(function (hasReady, urlScheme)
                {
                    if (hasReady)
                    {
                        $mob.ext.ssdk_isConnectedPlatformSDK("DTOpenAPI",function(data)
                        {
                            if(data.result)
                            {
                                //进行分享
                                $mob.ext.isPluginRegisted("com.mob.sharesdk.connector.dingtalk", function (data) {

                                    if (data.result)
                                    {
                                        //进行分享
                                        self._share(sessionId, parameters, userData, callback);
                                    }
                                    else
                                    {
                                        self._shareWithoutSDK(sessionId, parameters, userData, callback);
                                    }
                                });
                            }
                            else
                            {
                                self._shareWithoutSDK(sessionId, parameters, userData, callback);
                            }
                        });
                    }
                    else
                    {
                        var error_message = null;

                        if(this._currentLanguage === "zh-Hans")
                        {
                            error_message = "尚未设置分享平台［" + self.name() + "］的URL Scheme:" + self.appId() + "，无法进行分享!请在项目设置中设置URL Scheme后再试!";
                        }
                        else
                        {
                            error_message = "Can't share because platform［" + self.name() + "］did not set URL Scheme:" + self.appId() + "!Please try again after set URL Scheme!";
                        }


                        //返回错误
                        var error =
                        {
                            "error_code" : $mob.shareSDK.errorCode.UnsetURLScheme,
                            "error_message" : error_message
                        };

                        if (callback != null)
                        {
                            callback ($mob.shareSDK.responseState.Fail, error, null, userData);
                        }
                    }

                });
            }
            else
            {

                //返回错误
                var error =
                {
                    "error_code" : $mob.shareSDK.errorCode.UnsupportFeature,
                    "error_message" : "应用已禁用后台模式，分享平台［" + self.name() + "］无法进行分享! 请在项目设置中开启后台模式后再试!"
                };

                if (callback != null)
                {
                    callback ($mob.shareSDK.responseState.Fail, error, null, userData);
                }
            }
        });
    }
    else
    {
        var error_message = null;
        
        if(this._currentLanguage === "zh-Hans")
        {
            error_message = "分享平台［" + this.name() + "］应用信息无效!";
        }
        else
        {
            error_message = "Platform［" + this.name() + "］Invalid configuration!";
        }
        
        var error =
        {
            "error_code" : $mob.shareSDK.errorCode.InvaildPlatform,
            "error_message" : error_message
        };

        if (callback != null)
        {
            callback ($mob.shareSDK.responseState.Fail, error, null, userData);
        }
    }
};

/**
 * 不使用原生SDK进行分享
 * @param sessionId         会话标识
 * @param parameters        分享参数
 * @param userData          用户数据
 * @param callback          回调
 * @private
 */
DingTalk.prototype._shareWithoutSDK = function (sessionId, parameters, userData, callback)
{
    var text = null;
    var title = null;
    var images = null;
    var image = null;
    var url = null;
    var error_message;
    text = $mob.shareSDK.getShareParam(this.type(), parameters, "text");
    title = $mob.shareSDK.getShareParam(this.type(), parameters, "title");
    images = $mob.shareSDK.getShareParam(this.type(), parameters, "images");
    if (Object.prototype.toString.apply(images) === '[object Array]')
    {
        //取第一张图片进行分享
        image = images [0];
    }
    url = $mob.shareSDK.getShareParam(this.type(), parameters, "url");

    var error = null;
    var type = $mob.shareSDK.getShareParam(this.type(), parameters, "type");
    if (type == null)
    {
        type = $mob.shareSDK.contentType.Auto;
    }
    if (type === $mob.shareSDK.contentType.Auto)
    {
        type = this._getShareType(parameters);
    }

    var DTMediaType = "DTMediaTextObject";

    switch (type)
    {
        case $mob.shareSDK.contentType.Text:
        {
            DTMediaType = "DTMediaTextObject";
            break;
        }
        case $mob.shareSDK.contentType.Image:
        {
            DTMediaType = "DTMediaImageObject";
            break;
        }
        case  $mob.shareSDK.contentType.WebPage:
        {
            DTMediaType = "DTMediaWebObject";
            break;
        }
        default :
        {
            break;
        }
    }

    var self = this;
    $mob.ext.getAppConfig(function (data){

        var item0 = "$null";
        var item1 = {
            "$class":{"CF$UID":12},
            "appBundleIdentifier":{"CF$UID":3},
            "appId":{"CF$UID":2},
            "message":{"CF$UID":5},
            "openSDKVersion":{"CF$UID":4},
            "reqType":1,
            "scene":0
        };
        var item2 = self.appId();
        var item3 = data.CFBundleIdentifier;
        var item4 = "2.0.0";
        //messagetype:1 - webpage;2 - text;3 - Image
        var item5 = {
            "$class" : {"CF$UID":11},
            "mediaObject" : {"CF$UID":8},
            "messageDescription" : {"CF$UID":6},
            "messageType" : 2,
            "thumbData" : {"CF$UID":7},
            "thumbURL" : {"CF$UID":6},
            "title" : {"CF$UID":6}
        };

        //倒数第三个item
        var lastThirdItem = {
            "$classes" : [DTMediaType,"NSObject"],
            "$classname" : DTMediaType
        };
        //倒数第二个item
        var lastSecondItem = {
            "$classes" : ["DTMediaMessage","NSObject"],
            "$classname" : "DTMediaMessage"
        };
        //倒数第一个item
        var lastFirtsItem = {
            "$classes" : ["DTSendMessageToDingTalkReq","DTBaseReq","NSObject"],
            "$classname" : "DTSendMessageToDingTalkReq"
        };

        var objectsValue = [];

        switch (type)
        {
            case $mob.shareSDK.contentType.Text:
            {
                if (text != null)
                {
                    self._convertUrl([text], function (data) {

                        text = data.result[0];
                        var item6 = "";
                        var item7 = "";
                        var item8 = {
                            "$class" : {"CF$UID":10},
                            "text" : {"CF$UID":9}
                        };
                        var item9 = text;
                        var item10 = lastThirdItem;
                        var item11 = lastSecondItem;
                        var item12 = lastFirtsItem;
                        objectsValue.push(item0,item1,item2,item3,item4,item5,item6,item7,item8,item9,item10,item11,item12);

                        var shareData = {
                            "$archiver": "NSKeyedArchiver",
                            "$objects": objectsValue,
                            "$top": {"root" : {"CF$UID": 1}},
                            "$version": 100000,
                            "contentType":type
                        };

                        //记录分享内容
                        var shareParams = {"text" : text};
                        DingTalkShareContentSet [sessionId] = {"content" : shareParams, "user_data" : userData};

                        //数据传递给UIPasteboard
                        $mob.ext.ssdk_setDataToPasteboard($mob.shareSDK.platformType.DingTalk , self.appId(), shareData , sessionId,function(data){

                            if(data.result)
                            {
                                var urlstring = "dingtalk-open://openapi/sendMessage?appId=" + self.appId() + "&action=sendReq";

                                $mob.ext.canOpenURL(urlstring,function(data) {
                                    if (data.result)
                                    {
                                        $mob.native.openURL(urlstring);
                                    }
                                });
                            }
                        });
                    });
                }
                else
                {
                    error_message = null;

                    if(self._currentLanguage === "zh-Hans")
                    {
                        error_message = "分享参数text不能为空!";
                    }
                    else
                    {
                        error_message = "share param text can not be nil!";
                    }

                    error = {
                        "error_code" : $mob.shareSDK.errorCode.APIRequestFail,
                        "error_message" : error_message
                    };

                    if (callback != null)
                    {
                        callback ($mob.shareSDK.responseState.Fail, error, null, userData);
                    }
                }

                break;
            }
            case $mob.shareSDK.contentType.Image:
            {
                if (image != null)
                {
                    item5["messageType"] = 3;
                    var item6 = "";
                    var item7 = "";

                    var item8;
                    var regex = new RegExp("^(file\\:/)?/");
                    if(regex.exec(image))
                    {
                        //本地图片
                        item8 = {
                            "$class" : {"CF$UID":10},
                            "imageData" : {"CF$UID":9},
                            "imageURL" : {"CF$UID":6}
                        };
                    }
                    else
                    {
                        //网络图片
                        item8 = {
                            "$class" : {"CF$UID":10},
                            "imageData" : {"CF$UID":7},
                            "imageURL" : {"CF$UID":9}
                        };
                    }

                    var item9 = image;
                    var item10 = lastThirdItem;
                    var item11 = lastSecondItem;
                    var item12 = lastFirtsItem;
                    objectsValue.push(item0,item1,item2,item3,item4,item5,item6,item7,item8,item9,item10,item11,item12);

                    var shareData = {
                        "$archiver": "NSKeyedArchiver",
                        "$objects": objectsValue,
                        "$top": {"root" : {"CF$UID": 1}},
                        "$version": 100000,
                        "contentType":type
                    };

                    //记录分享内容
                    var shareParams = {"text" : text, "title" : title, "image" : image};
                    DingTalkShareContentSet [sessionId] = {"content" : shareParams, "user_data" : userData};

                    //数据传递给UIPasteboard
                    $mob.ext.ssdk_setDataToPasteboard($mob.shareSDK.platformType.DingTalk , self.appId(), shareData , sessionId,function(data){

                        if(data.result)
                        {
                            var urlstring = "dingtalk-open://openapi/sendMessage?appId=" + self.appId() + "&action=sendReq";

                            $mob.ext.canOpenURL(urlstring,function(data) {
                                if (data.result)
                                {
                                    $mob.native.openURL(urlstring);
                                }
                            });
                        }
                    });


                }
                else
                {
                    error_message = null;

                    if(self._currentLanguage === "zh-Hans")
                    {
                        error_message = "分享参数image不能为空!";
                    }
                    else
                    {
                        error_message = "share param image can not be nil!";
                    }

                    error = {
                        "error_code" : $mob.shareSDK.errorCode.APIRequestFail,
                        "error_message" : error_message
                    };

                    if (callback != null)
                    {
                        callback ($mob.shareSDK.responseState.Fail, error, null, userData);
                    }
                }

                break;
            }
            case  $mob.shareSDK.contentType.WebPage:
            {
                if (image != null && url != null)
                {
                    self._convertUrl([text, url], function (data) {

                        text = data.result[0];
                        url = data.result[1];
                        var item6;
                        var item7;
                        var item8;
                        var item9;
                        var item10;
                        var item11;
                        var item12;
                        var item13;
                        var item14;
                        var item15;

                        var regex = new RegExp("^(file\\:/)?/");
                        if(regex.exec(image))
                        {
                            //本地图片
                            item1["$class"]= {"CF$UID":15};
                            item5 = {
                                "$class" : {"CF$UID":14},
                                "mediaObject" : {"CF$UID":11},
                                "messageDescription" : {"CF$UID":7},
                                "messageType" : 1,
                                "thumbData" : {"CF$UID":8},
                                "thumbURL" : {"CF$UID":10},
                                "title" : {"CF$UID":6}
                            };
                            item6 = title;
                            item7 = text;
                            item8 = image;
                            item9 = {
                                "$class":["NSMutableData","NSData","NSObject"],
                                "$classname":"NSMutableData"
                            };
                            item10 = "";
                            item11 = {
                                "$class" : {"CF$UID":13},
                                "pageURL" : {"CF$UID":12}
                            };
                            item12 = url;
                            item13 = lastThirdItem;
                            item14 = lastSecondItem;
                            item15 = lastFirtsItem;
                            objectsValue.push(item0,item1,item2,item3,item4,item5,item6,item7,item8,item9,item10,item11,item12,item13,item14,item15);
                        }
                        else
                        {
                            //网络图片
                            item1["$class"] = {"CF$UID":14};
                            item5 = {
                                "$class" : {"CF$UID":13},
                                "mediaObject" : {"CF$UID":10},
                                "messageDescription" : {"CF$UID":7},
                                "messageType" : 1,
                                "thumbData" : {"CF$UID":8},
                                "thumbURL" : {"CF$UID":9},
                                "title" : {"CF$UID":6}
                            };
                            item6 = title;
                            item7 = text;
                            item8 = "";
                            item9 = image;
                            item10 = {
                                "$class" : {"CF$UID":12},
                                "pageURL" : {"CF$UID":11}
                            };
                            item11 = url;
                            item12 = lastThirdItem;
                            item13 = lastSecondItem;
                            item14 = lastFirtsItem;
                            objectsValue.push(item0,item1,item2,item3,item4,item5,item6,item7,item8,item9,item10,item11,item12,item13,item14);
                        }

                        var shareData = {
                            "$archiver": "NSKeyedArchiver",
                            "$objects": objectsValue,
                            "$top": {"root" : {"CF$UID": 1}},
                            "$version": 100000,
                            "contentType":type
                        };

                        //记录分享内容
                        var shareParams = {"text" : text, "title" : title, "image" : image, "url" : url};
                        DingTalkShareContentSet [sessionId] = {"content" : shareParams, "user_data" : userData};

                        //数据传递给UIPasteboard
                        $mob.ext.ssdk_setDataToPasteboard($mob.shareSDK.platformType.DingTalk , self.appId(), shareData , sessionId,function(data){

                            if(data.result)
                            {
                                var urlstring = "dingtalk-open://openapi/sendMessage?appId=" + self.appId() + "&action=sendReq";

                                $mob.ext.canOpenURL(urlstring,function(data) {
                                    if (data.result)
                                    {
                                        $mob.native.openURL(urlstring);
                                    }
                                });
                            }
                        });



                    });
                }
                else
                {
                    error_message = null;

                    if(self._currentLanguage === "zh-Hans")
                    {
                        error_message = "分享参数image或url不能为空!";
                    }
                    else
                    {
                        error_message = "share param image or url can not be nil!";
                    }

                    error = {
                        "error_code" : $mob.shareSDK.errorCode.APIRequestFail,
                        "error_message" : error_message
                    };

                    if (callback != null)
                    {
                        callback ($mob.shareSDK.responseState.Fail, error, null, userData);
                    }
                }

                break;
            }
            default :
            {
                error_message = null;

                if(self._currentLanguage === "zh-Hans")
                {
                    error_message = "不支持的分享类型[" + type + "]";
                }
                else
                {
                    error_message = "unsupported share type [" + type + "]";
                }

                error = {
                    "error_code" : $mob.shareSDK.errorCode.UnsupportContentType,
                    "error_message" : error_message
                };

                if (callback != null)
                {
                    callback ($mob.shareSDK.responseState.Fail, error, null, userData);
                }

                break;
            }
        }
    });
};

/**
 * 检测应用信息有效性
 * @param appInfo   应用信息
 * @private
 */
DingTalk.prototype._checkAppInfoAvailable = function (appInfo)
{
    var appId = $mob.utils.trim(appInfo [DingTalkInfoKeys.AppId]);

    if (appId != null)
    {
        appInfo [DingTalkInfoKeys.AppId] = appId;
    }
    else
    {
        appInfo [DingTalkInfoKeys.AppId] = this.appId();
    }

    return appInfo;
};

/**
 * 初始化应用
 * @param appId     应用标识
 * @private
 */
DingTalk.prototype._setupApp = function (appId)
{
    if (appId != null)
    {
        $mob.ext.isPluginRegisted("com.mob.sharesdk.connector.dingtalk", function (data) {

            if (data.result)
            {
                //注册微信
                $mob.native.ssdk_plugin_dingtalk_setup(appId);
            }
        });
    }
};


/**
 * 根据分享参数返回分享类型
 * @param parameters            分享参数
 * @private
 */
DingTalk.prototype._getShareType = function (parameters)
{
    var type = $mob.shareSDK.contentType.Text;
    var url = $mob.shareSDK.getShareParam(this.type(), parameters, "url");
    var images = $mob.shareSDK.getShareParam(this.type(), parameters, "images");

    if (Object.prototype.toString.apply(images) === '[object Array]' && url != null)
    {
        type = $mob.shareSDK.contentType.WebPage;
    }
    else if (Object.prototype.toString.apply(images) === '[object Array]')
    {
        type = $mob.shareSDK.contentType.Image;
    }

    return type;
};

/**
 * 判断是否能够进行分享
 * @private
 */
DingTalk.prototype._canShare = function ()
{
    if (this.appId() != null)
    {
        return true;
    }

    $mob.native.log("[ShareSDK-WARNING] [" + this.name() + "]应用信息有误，不能进行相关操作。请检查本地代码中和服务端的[" + this.name() + "]平台应用配置是否有误! " +
        "\n配置:" + $mob.utils.objectToJsonString(this._appInfo));

    return false;
};

/**
 * 检测是否配置URL Scheme
 * @param callback 方法回调
 * @private
 */
DingTalk.prototype._checkUrlScheme = function (callback)
{
    var self = this;
    $mob.ext.getAppConfig(function (data){

        var urlScheme = null;
        var hasReady = false;

        if (data != null && data.CFBundleURLTypes != null)
        {

            for (var i = 0; i < data.CFBundleURLTypes.length; i++)
            {
                var typeObj = data.CFBundleURLTypes [i];
                if (typeObj != null && typeObj.CFBundleURLSchemes != null)
                {
                    for (var j = 0; j < typeObj.CFBundleURLSchemes.length; j++)
                    {
                        var schema = typeObj.CFBundleURLSchemes [j];
                        if (schema === self.appId())
                        {
                            hasReady = true;
                            urlScheme = schema;
                            break;
                        }
                    }
                }

                if (hasReady)
                {
                    break;
                }
            }

        }

        if (!hasReady)
        {
            $mob.native.log("[ShareSDK-WARNING] 尚未配置[" + self.name() + "]URL Scheme:" + self.appId() + ", 无法使用进行授权。");
        }

        if (callback != null)
        {
            callback (hasReady, urlScheme);
        }

    });
};


/**
 * 分享内容
 * @param sessionId         会话标识
 * @param parameters        分享参数
 * @param userData          用户数据
 * @param callback          回调
 * @private
 */
DingTalk.prototype._share = function (sessionId, parameters, userData, callback)
{
    var text = null;
    var title = null;
    var images = null;
    var image = null;
    var url = null;
    var error = null;
    var error_message;


    var self = this;
    var type = $mob.shareSDK.getShareParam(this.type(), parameters, "type");
    if (type == null)
    {
        type = $mob.shareSDK.contentType.Auto;
    }
    if (type === $mob.shareSDK.contentType.Auto)
    {
        type = this._getShareType(parameters);
    }

    switch (type)
    {
        case $mob.shareSDK.contentType.Text:
        {
            text = $mob.shareSDK.getShareParam(this.type(), parameters, "text");

            if (text != null)
            {
                this._convertUrl([text], function (data) {

                    text = data.result[0];
                    $mob.ext.ssdk_dingtalkShareText(self.appId(), text, function (data) {

                        if (data.error_code != null)
                        {
                            if (callback != null)
                            {
                                callback ($mob.shareSDK.responseState.Fail, data, null, userData);
                            }
                        }
                        else
                        {
                            //调用成功后不回调，等待微信客户端回调时再触发
                            //记录分享内容
                            var shareParams = {"text" : text};
                            DingTalkShareContentSet [sessionId] = {"content" : shareParams, "user_data" : userData};
                        }

                    });

                });
            }
            else
            {
                error_message = null;

                if(this._currentLanguage === "zh-Hans")
                {
                    error_message = "分享参数text不能为空!";
                }
                else
                {
                    error_message = "share param text can not be nil!";
                }

                error = {
                    "error_code" : $mob.shareSDK.errorCode.APIRequestFail,
                    "error_message" : error_message
                };

                if (callback != null)
                {
                    callback ($mob.shareSDK.responseState.Fail, error, null, userData);
                }
            }

            break;
        }
        case $mob.shareSDK.contentType.Image:
        {
            text = $mob.shareSDK.getShareParam(this.type(), parameters, "text");
            title = $mob.shareSDK.getShareParam(this.type(), parameters, "title");
            images = $mob.shareSDK.getShareParam(this.type(), parameters, "images");
            if (Object.prototype.toString.apply(images) === '[object Array]')
            {
                //取第一张图片进行分享
                image = images [0];
            }

            if (image != null)
            {
                this._convertUrl([text], function (data) {

                    text = data.result[0];
                    $mob.ext.ssdk_dingtalkShareImage(self.appId(), title, text, image, function (data){

                        if (data.error_code != null)
                        {
                            if (callback != null)
                            {
                                callback ($mob.shareSDK.responseState.Fail, data, null, userData);
                            }
                        }
                        else
                        {
                            //调用成功后不回调，等待微信客户端回调时再触发
                            //记录分享内容
                            var shareParams = {"text" : text, "title" : title, "image" : image};
                            DingTalkShareContentSet [sessionId] = {"content" : shareParams, "user_data" : userData};
                        }

                    });

                });
            }
            else
            {
                error_message = null;

                if(this._currentLanguage === "zh-Hans")
                {
                    error_message = "分享参数image不能为空!";
                }
                else
                {
                    error_message = "share param image can not be nil!";
                }

                error = {
                    "error_code" : $mob.shareSDK.errorCode.APIRequestFail,
                    "error_message" : error_message
                };

                if (callback != null)
                {
                    callback ($mob.shareSDK.responseState.Fail, error, null, userData);
                }
            }

            break;
        }
        case  $mob.shareSDK.contentType.WebPage:
        {
            text = $mob.shareSDK.getShareParam(this.type(), parameters, "text");
            title = $mob.shareSDK.getShareParam(this.type(), parameters, "title");
            images = $mob.shareSDK.getShareParam(this.type(), parameters, "images");
            if (Object.prototype.toString.apply(images) === '[object Array]')
            {
                //取第一张图片进行分享
                image = images [0];
            }
            url = $mob.shareSDK.getShareParam(this.type(), parameters, "url");

            if (image != null && url != null)
            {
                this._convertUrl([text, url], function (data) {

                    text = data.result[0];
                    url = data.result[1];

                    $mob.ext.ssdk_dingtalkShareWebpage(self.appId(), title, text, image, url, function (data) {

                        if (data.error_code != null)
                        {
                            if (callback != null)
                            {
                                callback ($mob.shareSDK.responseState.Fail, data, null, userData);
                            }
                        }
                        else
                        {
                            //调用成功后不回调，等待微信客户端回调时再触发
                            //记录分享内容
                            var shareParams = {"text" : text, "title" : title, "image" : image, "url" : url};
                            DingTalkShareContentSet [sessionId] = {"content" : shareParams, "user_data" : userData};
                        }

                    });

                });
            }
            else
            {
                error_message = null;

                if(this._currentLanguage === "zh-Hans")
                {
                    error_message = "分享参数image或url不能为空!";
                }
                else
                {
                    error_message = "share param image or url can not be nil!";
                }

                error = {
                    "error_code" : $mob.shareSDK.errorCode.APIRequestFail,
                    "error_message" : error_message
                };

                if (callback != null)
                {
                    callback ($mob.shareSDK.responseState.Fail, error, null, userData);
                }
            }

            break;
        }
        default :
        {
            error_message = null;

            if(this._currentLanguage === "zh-Hans")
            {
                error_message = "不支持的分享类型[" + type + "]";
            }
            else
            {
                error_message = "unsupported share type [" + type + "]";
            }

            error = {
                "error_code" : $mob.shareSDK.errorCode.UnsupportContentType,
                "error_message" : error_message
            };

            if (callback != null)
            {
                callback ($mob.shareSDK.responseState.Fail, error, null, userData);
            }
            break;
        }

    }
};

/**
 * 转换链接
 * @param contents      内容列表
 * @param callback      回调
 * @private
 */
DingTalk.prototype._convertUrl = function (contents, callback)
{
    if (this.convertUrlEnabled())
    {
        $mob.shareSDK.convertUrl(this.type(), null, contents, callback);
    }
    else
    {
        if (callback)
        {
            callback ({"result" : contents});
        }
    }
};

//注册平台
$mob.shareSDK.registerPlatformClass($mob.shareSDK.platformType.DingTalk, DingTalk);
