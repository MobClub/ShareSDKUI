/**
 * Created with JetBrains WebStorm.
 * User: fenghj
 * Date: 15/10/8
 * Time: 下午12:15
 * To change this template use File | Settings | File Templates.
 */

var $pluginID = "com.mob.sharesdk.AliPaySocial";

/**
 * 支付宝应用信息键名定义
 * @type {{AppKey: string, AppSecret: string, RedirectUri: string}}
 */
var AliPaySocialInfoKeys = {
    "AppId"         : "app_id",
    "ConvertUrl"    : "covert_url"
};

/**
 * 支付宝分享场景
 * @type {{QQFriend: number, QZone: number}}
 */
var APScene = {
    "Session"      : 0,
    "Timeline"     : 1
};

/**
 * 支付宝好友分享内容集合
 * @type {{}}
 */
var AliPaySocialShareContentSet = {};

/**
 * 支付宝好友
 * @param type  平台类型
 * @constructor
 */
function AliPaySocial (type)
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
AliPaySocial.prototype.type = function ()
{
    return this._type;
};

/**
 * 授权状态改变
 * @param sessionId         会话标识
 * @param data              返回数据
 * @private
 */
AliPaySocial.prototype.authStateChanged = function (sessionId, data)
{
    $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Cancel, null);
};

/**
 * 获取平台名称
 * @returns {string}    平台名称
 */
AliPaySocial.prototype.name = function ()
{
    if(this._currentLanguage === "zh-Hans")
    {
        return "支付宝好友";
    }
    else
    {
        return "AliPaySocial";
    }
};

/**
 * 获取应用标识
 * @returns {*} 应用标识
 */
AliPaySocial.prototype.appId = function ()
{
    if (this._appInfo[AliPaySocialInfoKeys.AppId] !== undefined) 
    {
        return this._appInfo[AliPaySocialInfoKeys.AppId];
    }

    return null;
};

/**
 * 获取缓存域名
 * @returns {string}    域名
 */
AliPaySocial.prototype.cacheDomain = function ()
{
    return "SSDK-Platform-" + this.type() + "-" + this.appId();
};

/**
 * 获取是否转换短链
 *
 * @return  true 转换， false 不转换
 */
AliPaySocial.prototype.convertUrlEnabled = function ()
{
    if (this._appInfo[AliPaySocialInfoKeys.ConvertUrl] !== undefined ) 
    {
        return this._appInfo[AliPaySocialInfoKeys.ConvertUrl];
    }

    return $mob.shareSDK.convertUrlEnabled();
};

/**
 * 设置/获取应用信息
 * @param value 应用信息
 * @returns {*}
 */
AliPaySocial.prototype.setAppInfo = function (value)
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
AliPaySocial.prototype.saveConfig = function ()
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
AliPaySocial.prototype.isSupportAuth = function ()
{
    return false;
};

/**
 * 用户授权
 * @param sessionId     授权会话标识
 * @param settings      授权设置
 */
AliPaySocial.prototype.authorize = function (sessionId, settings)
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
AliPaySocial.prototype.handleShareCallback = function (sessionId, callbackUrl, sourceApplication, annotation)
{
    var self = this;

    if (callbackUrl.indexOf("ap" + this.appId() + "://") === 0)
    {
        //处理回调
        $mob.ext.isPluginRegisted("com.mob.sharesdk.connector.alisocial", function (data)
        {
            if (data.result)
            {
                $mob.ext.ssdk_alipayHandleShareCallback(self.appId(), callbackUrl, function (data) {

                    //从分享内容集合中取出分享内容
                    var shareParams = AliPaySocialShareContentSet [sessionId];
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
                    delete AliPaySocialShareContentSet[sessionId];
                    AliPaySocialShareContentSet[sessionId] = null;
                });
            }
            else
            {
                //获取UIPasteboard取得并解析后的字典数据
                $mob.ext.ssdk_getDataFromPasteboard(self.appId(), sessionId, callbackUrl,$mob.shareSDK.platformType.AliPaySocial,function(data){

                    //授权返回的数据
                    if(data.result)
                    {
                        var object = data.retData;
                        if(object)
                        {
                            //从分享内容集合中取出分享内容
                            var shareParams = AliPaySocialShareContentSet [sessionId];
                            var content = null;
                            var userData = null;
                            if (shareParams != null)
                            {
                                content = shareParams ["content"];
                                userData = shareParams ["user_data"];
                            }

                            switch (parseInt(object[12]))
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
                                    if (content["audio_url"])
                                    {
                                        urls.push(content["audio_url"]);
                                    }
                                    resultData["urls"] = urls;

                                    if (content ["thumb_image"] != null)
                                    {
                                        resultData["images"] = [content ["thumb_image"]];
                                    }
                                    else if (content ["image"] != null)
                                    {
                                        resultData["images"] = [content ["image"]];
                                    }

                                    $mob.native.ssdk_shareStateChanged(sessionId, $mob.shareSDK.responseState.Success, resultData, null, userData);
                                }
                                    break;
                                case -2:
                                {
                                    //取消
                                    $mob.native.ssdk_shareStateChanged(sessionId, $mob.shareSDK.responseState.Cancel, null, null, userData);
                                }
                                    break;
                                default :
                                {
                                    //失败
                                    var error = {
                                        "error_code" : $mob.shareSDK.errorCode.APIRequestFail,
                                        "user_data" :  {"error_code" : parseInt(object[12])},
                                        "error_message" : object[13]
                                    };

                                    $mob.native.ssdk_shareStateChanged(sessionId, $mob.shareSDK.responseState.Fail, error, null, userData);
                                }
                                    break;
                            }
                        }
                    }
                });
            }
        });
        return true;
    }
    return false;
};

/**
 * 取消授权
 * @param callback      方法回调，回调方法声明如下:function (stat, data);
 */
AliPaySocial.prototype.cancelAuthorize = function (callback)
{
    this._setCurrentUser(null, null);
};

/**
 * 获取用户信息
 * @param query         查询信息
 * @param callback      方法回调
 */
AliPaySocial.prototype.getUserInfo = function (query, callback)
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
AliPaySocial.prototype.addFriend = function (sessionId, user, callback)
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
AliPaySocial.prototype.getFriends = function (cursor, size, callback)
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
AliPaySocial.prototype.callApi = function (url, method, params, headers, callback)
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
AliPaySocial.prototype.createUserByRawData = function (rawData)
{
    return null;
};

/**
 * 分享内容
 * @param sessionId         会话ID
 * @param parameters        分享参数
 * @param callback          方法回调，回调方法声明如下:function (state, data, user, userData);
 */
AliPaySocial.prototype.share = function (sessionId, parameters, callback)
{
    var self = this;

    //获取分享统计标识
    var flags = parameters != null ? parameters ["@flags"] : null;
    var userData =
    {
        "@flags" : flags
    };

    if (this._canShare())
    {
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
                        $mob.ext.ssdk_isConnectedPlatformSDK("APOpenAPI",function(data){

                            if(data.result)
                            {
                                $mob.ext.isPluginRegisted("com.mob.sharesdk.connector.alisocial", function (data)
                                {
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
                            error_message = "尚未设置分享平台［" + self.name() + "］的URL Scheme:ap" + self.appId() + "，无法进行分享!请在项目设置中设置URL Scheme后再试!";
                        }
                        else
                        {
                            error_message = "Can't share because platform［" + self.name() + "］did not set URL Scheme:ap" + self.appId() + "!Please try again after set URL Scheme!";
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
 * 检测应用信息有效性
 * @param appInfo   应用信息
 * @private
 */
AliPaySocial.prototype._checkAppInfoAvailable = function (appInfo)
{
    var appId = $mob.utils.trim(appInfo [AliPaySocialInfoKeys.AppId]);

    if (appId != null)
    {
        appInfo [AliPaySocialInfoKeys.AppId] = appId;
    }
    else
    {
        appInfo [AliPaySocialInfoKeys.AppId] = this.appId();
    }

    return appInfo;
};

/**
 * 初始化应用
 * @param appId     应用标识
 * @private
 */
AliPaySocial.prototype._setupApp = function (appId)
{
    if (appId != null)
    {
        $mob.ext.isPluginRegisted("com.mob.sharesdk.connector.alisocial", function (data) {

            if (data.result)
            {
                //注册微信
                $mob.native.ssdk_plugin_alipay_setup(appId);
            }
        });
    }
};

/**
 * 根据分享参数返回分享类型
 * @param parameters            分享参数
 * @private
 */
AliPaySocial.prototype._getShareType = function (parameters)
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
AliPaySocial.prototype._canShare = function ()
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
AliPaySocial.prototype._checkUrlScheme = function (callback)
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
                        if (schema === "ap" + self.appId())
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
            $mob.native.log("[ShareSDK-WARNING] 尚未配置[" + self.name() + "]URL Scheme:ap" + self.appId() + ", 无法使用进行授权。");
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
AliPaySocial.prototype._share = function (sessionId, parameters, userData, callback)
{
    var text = null;
    var title = null;
    var images = null;
    var image = null;
    var url = null;
    var error = null;
    var platformType = null;
    var error_message;

    var scene = parameters["apsocial_scene"];

    switch (scene)
    {
        case APScene.Timeline:
            platformType = $mob.shareSDK.platformType.AliPaySocialTimeline;
            break;
        default :
            platformType = $mob.shareSDK.platformType.AliPaySocial;
            break;
    }

    var self = this;
    var type = $mob.shareSDK.getShareParam(platformType, parameters, "type");
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

            if (platformType === $mob.shareSDK.platformType.AliPaySocialTimeline) 
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
            }
            else
            {
                text = $mob.shareSDK.getShareParam(platformType, parameters, "text");
                if (text != null)
                {
                    this._convertUrl([text], function (data) {

                        text = data.result[0];
                        $mob.ext.ssdk_alipayShareText(self.appId(), scene, text, function (data) {

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
                                AliPaySocialShareContentSet [sessionId] = {"content" : shareParams, "user_data" : userData};
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
            }
            
            break;
        }
        case $mob.shareSDK.contentType.Image:
        {
            text = $mob.shareSDK.getShareParam(platformType, parameters, "text");
            title = $mob.shareSDK.getShareParam(platformType, parameters, "title");
            images = $mob.shareSDK.getShareParam(platformType, parameters, "images");
            if (Object.prototype.toString.apply(images) === '[object Array]')
            {
                //取第一张图片进行分享
                image = images [0];
            }

            if (image != null)
            {
                this._convertUrl([text], function (data) {

                    text = data.result[0];
                    $mob.ext.ssdk_alipayShareImage(self.appId(), scene, title, text, image, function (data){

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
                            AliPaySocialShareContentSet [sessionId] = {"content" : shareParams, "user_data" : userData};
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
            text = $mob.shareSDK.getShareParam(platformType, parameters, "text");
            title = $mob.shareSDK.getShareParam(platformType, parameters, "title");
            images = $mob.shareSDK.getShareParam(platformType, parameters, "images");
            if (Object.prototype.toString.apply(images) === '[object Array]')
            {
                //取第一张图片进行分享
                image = images [0];
            }
            url = $mob.shareSDK.getShareParam(platformType, parameters, "url");

            if (image != null && url != null)
            {
                this._convertUrl([text, url], function (data) {

                    text = data.result[0];
                    url = data.result[1];

                    $mob.ext.ssdk_alipayShareWebpage(self.appId(), scene, title, text, image, url, function (data) {

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
                            AliPaySocialShareContentSet [sessionId] = {"content" : shareParams, "user_data" : userData};
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

AliPaySocial.prototype._shareWithoutSDK = function (sessionId, parameters, userData, callback)
{
    var text = null;
    var title = null;
    var images = null;
    var image = null;
    var url = null;
    var error = null;
    var platformType = null;
    var error_message;

    var scene = parameters["apsocial_scene"];

    switch (scene)
    {
        case APScene.Timeline:
            platformType = $mob.shareSDK.platformType.AliPaySocialTimeline;
            break;
        default :
            platformType = $mob.shareSDK.platformType.AliPaySocial;
            break;
    }

    var self = this;
    var type = $mob.shareSDK.getShareParam(platformType, parameters, "type");
    if (type == null)
    {
        type = $mob.shareSDK.contentType.Auto;
    }
    if (type === $mob.shareSDK.contentType.Auto)
    {
        type = this._getShareType(parameters);
    }

    //var keyUID = "CF$UID";
    //var keyClass = "$class";
    //var keyClasses = "$classes";
    //var keyClassname = "$classname";

    var UIDValue = 20;
    var APMediaType = "APShareTextObject";

    switch (type)
    {
        case $mob.shareSDK.contentType.Text:
        {
            APMediaType = "APShareTextObject";
            break;
        }
        case $mob.shareSDK.contentType.Image:
        {
            APMediaType = "APShareImageObject";
            break;
        }
        case  $mob.shareSDK.contentType.WebPage:
        {
            APMediaType = "APShareWebObject";
            break;
        }
        default :
        {
            break;
        }
    }

    var item0 = "$null";
    var item1 = {
        "$class": {"CF$UID": (UIDValue)},
        "NS.keys": [{"CF$UID": (2)},{"CF$UID": (3)}],
        "NS.objects": [{"CF$UID": (4)},{"CF$UID": (11)}]};

    var item2 = "app";
    var item3 = "req";
    var item4 = {
        "$class":{"CF$UID":10}, "appKey": {CF$UID: 6},
        "bundleId": {"CF$UID": 7},
        "name": {"CF$UID": 5},
        "scheme": {"CF$UID": 8},
        "sdkVersion": {"CF$UID": 9}};

    $mob.ext.getAppConfig(function (data){

        var bundleID = data.CFBundleIdentifier?data.CFBundleIdentifier:"";
        var appName = data.CFBundleDisplayName?data.CFBundleDisplayName:"";

        var item5 = appName;
        var item6 = self.appId()?self.appId():"";
        var item7 = bundleID;
        var item8 = "ap" + item6;
        var item9 = "1.1.0.151016"; // SDK Version

        var item10 = {
            "$classes" : ["APSdkApp", "NSObject"],
            "$classname": "APSdkApp"};

        var item11 = {
            "$class": {"CF$UID": (UIDValue - 1)},
            "message": {"CF$UID": 13},
            "scene": {"CF$UID": (UIDValue - 2)},
            "type": {"CF$UID": 12}};

        var item12 = 0;
        var item13 = {
            "$class": {"CF$UID": (UIDValue - 3)},
            "mediaObject": {"CF$UID": 14}};
        var objectsValue = [
            item0, item1, item2, item3,
            item4, item5, item6, item7,
            item8, item9, item10, item11,
            item12];

        var item16 = {
            "$classes": [APMediaType, "NSObject"],
            "$classname": APMediaType
        };
        var item17 = {
            "$classes": ["APMediaMessage", "NSObject"],
            "$classname": "APMediaMessage"
        };
        var item18 = Number(scene);
        var item19 = {
            "$classes": ["APSendMessageToAPReq", "APBaseReq", "NSObject"],
            "$classname": "APSendMessageToAPReq"};
        var item20 = {
            "$classes": ["NSMutableDictionary", "NSDictionary", "NSObject"],
            "$classname": "NSMutableDictionary"
        };

        switch (type)
        {
            case $mob.shareSDK.contentType.Text:
            {
                if (platformType === $mob.shareSDK.platformType.AliPaySocialTimeline)
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
                }
                else
                {
                    text = $mob.shareSDK.getShareParam(platformType, parameters, "text");
                    if (text != null)
                    {
                        self._convertUrl([text], function (data) {

                            text = data.result[0];
                            var textItem14 = {
                                "$class": {"CF$UID": (UIDValue - 4)},
                                "text": {"CF$UID": (UIDValue - 5)}};

                            var textItem15 = text?text:"";

                            objectsValue.push(item13,
                                textItem14,
                                textItem15,
                                item16,
                                item17,
                                item18,
                                item19,
                                item20);

                            //记录分享内容
                            var shareParams = {"text" : text};
                            AliPaySocialShareContentSet [sessionId] = {"content" : shareParams, "user_data" : userData};

                            var shareData = {
                                "$archiver": "NSKeyedArchiver",
                                "$objects": objectsValue,
                                "$top": {"root" : {"CF$UID": 1}},
                                "$version": 100000,
                                "contentType":type
                            };

                            //数据传递给UIPasteboard
                            $mob.ext.ssdk_setDataToPasteboard($mob.shareSDK.platformType.AliPaySocial , self.appId(), shareData , sessionId,function(data){

                                if(data.result)
                                {
                                    var urlstring = "alipayshare://platformapi/shareService?action=sendReq&shareId=" + self.appId();

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
                }

                break;
            }
            case $mob.shareSDK.contentType.Image:
            {
                text = $mob.shareSDK.getShareParam(platformType, parameters, "text");
                title = $mob.shareSDK.getShareParam(platformType, parameters, "title");
                images = $mob.shareSDK.getShareParam(platformType, parameters, "images");
                if (Object.prototype.toString.apply(images) === '[object Array]')
                {
                    //取第一张图片进行分享
                    image = images [0];
                }

                if (image != null)
                {
                    self._convertUrl([text], function (data) {

                        text = data.result[0];

                        var imageItem14 = null;
                        var imageItem15 = null;

                        var regex = new RegExp("^(file\\:/)?/");
                        if(regex.exec(image))
                        {
                            //本地图片
                            imageItem14 = {
                                "$class": {"CF$UID": (UIDValue - 4)},
                                "imageData":{"CF$UID" : (UIDValue - 5)}};
                            imageItem15 = image;
                        }
                        else
                        {
                            //网络图片
                            imageItem14 = {
                                "$class": {"CF$UID": (UIDValue - 4)},
                                "imageUrl":{"CF$UID" : (UIDValue - 5)}};

                            imageItem15 = image;
                        }

                        objectsValue.push(item13,imageItem14,imageItem15,item16,item17,item18,item19,item20);

                        //$mob.native.log("regex" + objectsValue);

                        //记录分享内容
                        var shareParams = {"text" : text, "title" : title, "image" : image};
                        AliPaySocialShareContentSet [sessionId] = {"content" : shareParams, "user_data" : userData};

                        var shareData = {
                            "$archiver": "NSKeyedArchiver",
                            "$objects": objectsValue,
                            "$top": {"root" : {"CF$UID": 1}},
                            "$version": 100000,
                            "contentType":type
                        };

                        //数据传递给UIPasteboard
                        $mob.ext.ssdk_setDataToPasteboard($mob.shareSDK.platformType.AliPaySocial , self.appId(), shareData , sessionId,function(data){

                            //$mob.native.log("ssdk_setDataToPasteboard" + data.result);

                            if(data.result)
                            {
                                var urlstring = "alipayshare://platformapi/shareService?action=sendReq&shareId=" + self.appId();

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
                text = $mob.shareSDK.getShareParam(platformType, parameters, "text");
                title = $mob.shareSDK.getShareParam(platformType, parameters, "title");
                images = $mob.shareSDK.getShareParam(platformType, parameters, "images");
                if (Object.prototype.toString.apply(images) === '[object Array]')
                {
                    //取第一张图片进行分享
                    image = images [0];
                }
                url = $mob.shareSDK.getShareParam(platformType, parameters, "url");

                if (image != null && url != null)
                {
                    self._convertUrl([text, url], function (data) {

                        text = data.result[0];
                        url = data.result[1];

                        //在webpage中,公有的Item1与text,image有所不同
                        item1 = {
                            "$class": {"CF$UID": (UIDValue + 3)},
                            "NS.keys": [{"CF$UID": (2)},{"CF$UID": (3)}],
                            "NS.objects": [{"CF$UID": (4)},{"CF$UID": (11)}]};

                        //在webpage中,公有的Item11与text,image有所不同
                        item11 = {
                            "$class": {"CF$UID": (UIDValue + 2)},
                            "message": {"CF$UID": 13},
                            "scene": {"CF$UID": (UIDValue + 1)},
                            "type": {"CF$UID": 12}};

                        objectsValue[1] = item1;
                        objectsValue[11] = item11;

                        var urlItem13 = null;
                        var urlItem16 = null;

                        var regex = new RegExp("^(file\\:/)?/");
                        if(regex.exec(image))
                        {
                            //本地图片
                            urlItem13 = {
                                "$class": {"CF$UID": (UIDValue)},
                                "desc": {"CF$UID": 15},
                                "mediaObject": {"CF$UID": 17},
                                "thumbData": {"CF$UID":16},
                                "title": {"CF$UID": 14}};
                            urlItem16 = image;
                        }
                        else
                        {
                            //网络图片
                            urlItem13 = {
                                "$class": {"CF$UID": (UIDValue)},
                                "desc": {"CF$UID": 15},
                                "mediaObject": {"CF$UID": 17},
                                "thumbUrl": {"CF$UID":16},
                                "title": {"CF$UID": 14}};

                            urlItem16 = image;
                        }

                        var urlItem14 = title?title:"";
                        var urlItem15 = text?text:"";
                        var urlItem17 = {
                            "$class": {"CF$UID": 19},
                            "webpageUrl": {"CF$UID": 18}};
                        var urlItem18 = url?url:"";
                        var urlItem19 = item16;
                        var urlItem20 = item17;
                        var urlItem21 = item18;
                        var urlItem22 = item19;
                        var urlItem23 = item20;

                        objectsValue.push(urlItem13,
                            urlItem14,
                            urlItem15,
                            urlItem16,
                            urlItem17,
                            urlItem18,
                            urlItem19,
                            urlItem20,
                            urlItem21,
                            urlItem22,
                            urlItem23);

                        //记录分享内容
                        var shareParams = {"text" : text, "title" : title, "image" : image, "url" : url};
                        AliPaySocialShareContentSet [sessionId] = {"content" : shareParams, "user_data" : userData};

                        var shareData = {
                            "$archiver": "NSKeyedArchiver",
                            "$objects": objectsValue,
                            "$top": {"root" : {"CF$UID": 1}},
                            "$version": 100000,
                            "contentType":type
                        };

                        //数据传递给UIPasteboard
                        $mob.ext.ssdk_setDataToPasteboard($mob.shareSDK.platformType.AliPaySocial , self.appId(), shareData , sessionId,function(data){

                            if(data.result)
                            {
                                var urlstring = "alipayshare://platformapi/shareService?action=sendReq&shareId=" + self.appId();

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

                    if(this._currentLanguage === "zh-Hans")
                    {
                        error_message = "分享参数image或url不能为空!";
                    }
                    else
                    {
                        error_message = "share param image or url can not be nil!";
                    }

                    error =
                    {
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
    });
};

/**
 * 转换链接
 * @param contents      内容列表
 * @param callback      回调
 * @private
 */
AliPaySocial.prototype._convertUrl = function (contents, callback)
{
    if (this.convertUrlEnabled())
    {
        $mob.shareSDK.convertUrl(this.type(), null, contents, callback);
        //var self = this;
        //this._getCurrentUser(function(user){
        //
        //    $mob.shareSDK.convertUrl(self.type(), user, contents, callback);
        //
        //});
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
$mob.shareSDK.registerPlatformClass($mob.shareSDK.platformType.AliPaySocial, AliPaySocial);
