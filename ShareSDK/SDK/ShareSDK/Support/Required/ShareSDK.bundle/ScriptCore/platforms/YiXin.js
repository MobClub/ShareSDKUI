/**
 * Created with JetBrains WebStorm.
 * User: fenghj
 * Date: 15/12/1
 * Time: 下午2:52
 * To change this template use File | Settings | File Templates.
 */

var $pluginID = "com.mob.sharesdk.YiXin";

/**
 * 易信应用信息键名定义
 * @type {{AppId: "app_id", ConvertUrl: "covert_url"}}
 */
var YiXinAppInfoKeys = {
    "AppId"        : "app_id",
    "AppSecret"    : "app_secret",
    "RedirectUri"  : "redirect_uri",
    "AuthType"     : "auth_type",
    "ConvertUrl"   : "covert_url",
    "Scopes"       : "auth_scopes"
};

/**
 * 易信场景
 * @type {{Session: number, Timeline: number, Fav: number}}
 */
var YiXinScene = {
    "Session"       : 0,
    "Timeline"      : 1,
    "Fav"           : 2
};

/**
 * 易信分享内容集合
 * @type {{}}
 */
var YiXinShareContentSet = {};

/**
 * 易信
 * @param type  平台类型
 * @constructor
 */
function YiXin (type)
{
    this._type = type;
    this._appInfo = {};
    this._authScopes = null;
    //当前授权用户
    this._currentUser = null;
    //设置当前语言环境
    this._currentLanguage = $mob.shareSDK.preferredLanguageLocalize();
}

/**
 * 获取平台类型
 * @returns {*} 平台类型
 */
YiXin.prototype.type = function ()
{
    return this._type;
};

/**
 * 获取平台名称
 * @returns {string}    平台名称
 */
YiXin.prototype.name = function ()
{
    
    if(this._currentLanguage === "zh-Hans")
    {
        return "易信";
    }
    else
    {
        return "YiXin";
    }
    
};

/**
 * 获取应用标识
 * @returns {*} 应用标识
 */
YiXin.prototype.appID = function ()
{
    if (this._appInfo[YiXinAppInfoKeys.AppId] !== undefined) 
    {
        return this._appInfo[YiXinAppInfoKeys.AppId];
    }

    return null;
};

/**
 * 获取应用密钥
 * @returns {*} 应用标识
 */
YiXin.prototype.appSecret = function ()
{
    if (this._appInfo[YiXinAppInfoKeys.AppSecret] !== undefined) 
    {
        return this._appInfo[YiXinAppInfoKeys.AppSecret];
    }

    return null;
};

/**
 * 获取应用密钥
 * @returns {*} 应用标识
 */
YiXin.prototype.redirectUri = function ()
{
    if (this._appInfo[YiXinAppInfoKeys.RedirectUri] !== undefined) 
    {
        return this._appInfo[YiXinAppInfoKeys.RedirectUri];
    }

    return "https://open.yixin.im/resource/oauth2_callback.html";
};

/**
 * 获取授权方式
 *
 * @return  web 网页授权方式，sso 单点登录授权方式，both 两者共同使用，优先使用SSO
 */
YiXin.prototype.authType = function ()
{
    if (this._appInfo[YiXinAppInfoKeys.AuthType] !== undefined) 
    {
        return this._appInfo[YiXinAppInfoKeys.AuthType];
    }

    return $mob.shareSDK.authType();
};

/**
 * 获取缓存域名
 * @returns {string}    域名
 */
YiXin.prototype.cacheDomain = function ()
{
    return "SSDK-Platform-" + this.type() + "-" + this.appID();
};

/**
 * 获取授权方式
 *
 * @return  web 网页授权方式，sso 单点登录授权方式，both 两者共同使用，优先使用SSO
 */
YiXin.prototype.convertUrlEnabled = function ()
{
    if (this._appInfo[YiXinAppInfoKeys.ConvertUrl] !== undefined) 
    {
        return this._appInfo[YiXinAppInfoKeys.ConvertUrl];
    }

    return $mob.shareSDK.convertUrlEnabled();
};

/**
 * 设置/获取应用信息
 * @param value 应用信息
 * @returns {*}
 */
YiXin.prototype.setAppInfo = function (value)
{
    if (arguments.length === 0) 
    { 
        return this._appInfo;
    }
    else
    {
        this._appInfo = this._checkAppInfoAvailable(value);
        this._authScopes = this._checkAuthScopes(value);
        this._setupApp(this.appID());
    }
};

/**
 * 保存配置信息
 */
YiXin.prototype.saveConfig = function ()
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

            curApps["plat_" + self.type()] = self.appID();
            $mob.ext.setCacheData("currentApp", curApps, false, domain, null);
        }

    });
};

/**
 * 获取是否支持授权
 * @returns {boolean} true 支持， false 不支持
 */
YiXin.prototype.isSupportAuth = function ()
{
    return true;
};

/**
 * 用户授权
 * @param sessionId     授权会话标识
 * @param settings      授权设置
 */
YiXin.prototype.authorize = function (sessionId, settings)
{
    var error = null;
    var self = this;
    var errorStr;
    if (self._isAvailable())
    {

        var authType = self.authType();
        if (authType === "both" || authType === "sso")
        {
            //检测是否支持多任务
            $mob.ext.isMultitaskingSupported(function (data){
                if (data.result)
                {
                    //检测URL Scheme
                    self._checkUrlScheme(function (hasReady, urlScheme){
                        
                        if (hasReady)
                        {
                            //进行SSO授权
                            self._ssoAuthorize(sessionId, urlScheme, settings);
                        }
                        else if (authType === "both")
                        {
                            //进行网页授权
                            self._webAuthorize(sessionId, settings);
                        }
                        else
                        {
                            errorStr = null;
                                             
                            if(this._currentLanguage === "zh-Hans")
                            {
                                errorStr = "分享平台［" + self.name() + "］尚未配置URL Scheme:" + self.appID() + "，无法进行授权!";
                            }
                            else
                            {
                                errorStr = "Can't authorize because platform［" + self.name() + "］did not set URL Scheme:" +  self.appID();
                            }

                            var error = {
                                "error_code" : $mob.shareSDK.errorCode.UnsetURLScheme,
                                "error_message" : errorStr
                            };
                            $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Fail, error);
                        }

                    });
                }
                else if (authType === "both")
                {
                    //进行网页授权
                    self._webAuthorize(sessionId, settings);
                }
                else
                {
                    errorStr = null;
 
                    if(this._currentLanguage === "zh-Hans")
                    {
                        errorStr = "分享平台［" + self.name() + "］不支持[" + authType + "]授权方式!";
                    }
                    else
                    {
                        errorStr = "Platform [" + self.name() + "］do not support auth type :[" + authType + "]!";
                    }

                    var error = {
                        "error_code" : $mob.shareSDK.errorCode.UnsupportFeature,
                        "error_message" : errorStr
                    };
                    $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Fail, error);
                }
            });
        }
        else if (authType === "web")
        {
            //进行网页授权
            self._webAuthorize(sessionId, settings);
        }
        else
        {
            errorStr = null;
 
            if(this._currentLanguage === "zh-Hans")
            {
                errorStr = "分享平台［" + self.name() + "］不支持[" + authType + "]授权方式!";
            }
            else
            {
                errorStr = "Platform [" + self.name() + "］do not support auth type :[" + authType + "]!";
            }

            error = {
                "error_code" : $mob.shareSDK.errorCode.UnsupportFeature,
                "error_message" : errorStr
            };
            $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Fail, error);
        }
    }
    else
    {
        errorStr = null;
    
        if(this._currentLanguage === "zh-Hans")
        {
            errorStr = "分享平台［" + this.name() + "］应用信息无效!";
        }
        else
        {
            errorStr = "Platform［" + this.name() + "］invalid congfiguration!";
        }

        error = {
            "error_code" : $mob.shareSDK.errorCode.InvaildPlatform,
            "error_message" : errorStr
        };
        $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Fail, error);
    }

};

/**
 * 处理用户授权回调
 * @param sessionId     授权会话标识
 * @param callbackUrl   回调地址
 */
YiXin.prototype.handleAuthCallback = function (sessionId, callbackUrl)
{
    var error = null;
    var errorStr;
    var urlInfo = $mob.utils.parseUrl(callbackUrl);
    if (urlInfo != null && urlInfo.query != null)
    {
        var params = $mob.utils.parseUrlParameters(urlInfo.query);
        if (params != null && params.code != null)
        {
            this._authHandler(sessionId, params);
        }
        else
        {
            errorStr = null;
 
            if(this._currentLanguage === "zh-Hans")
            {
                errorStr = "无效的授权回调:[" + callbackUrl + "]";
            }
            else
            {
                errorStr = "Invalid callback url:[" + callbackUrl + "]";
            }

            error = {
                "error_code" : $mob.shareSDK.errorCode.InvalidAuthCallback,
                "error_message" : errorStr
            };
            $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Fail, error);
        }
    }
    else
    {
        errorStr = null;
 
        if(this._currentLanguage === "zh-Hans")
        {
            errorStr = "无效的授权回调:[" + callbackUrl + "]";
        }
        else
        {
            errorStr = "Invalid callback url:[" + callbackUrl + "]";
        }

        error = {
            "error_code" : $mob.shareSDK.errorCode.InvalidAuthCallback,
            "error_message" : errorStr
        };
        $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Fail, error);
    }
};

/**
 * 处理SSO授权回调
 * @param sessionId     会话ID
 * @param callbackUrl   回调URL
 * @param sourceApplication     原始应用名称
 * @param annotation            附加数据
 */
YiXin.prototype.handleSSOCallback = function (sessionId, callbackUrl, sourceApplication, annotation)
{
    var self = this;
    if (callbackUrl.indexOf(this.appID() + "://") === 0)
    {
        //处理回调
        $mob.ext.ssdk_isConnectedPlatformSDK("YXApi",function(data){
            if(data.result)
            {
                $mob.ext.isPluginRegisted("com.mob.sharesdk.connector.yixin", function (data) {
                    if (data.result)
                    {
                        $mob.ext.ssdk_yixinHandleSSOCallback(self.appID(), sessionId, callbackUrl, function (data) {

                            switch (data.state)
                            {
                                case $mob.shareSDK.responseState.Success:
                                    self._authHandler(sessionId, data.result);
                                    break;
                                case $mob.shareSDK.responseState.Fail:
                                    $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Fail, data.result);
                                    break;
                                default :
                                    $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Cancel, null);
                                    break;
                            }

                        });
                    }
                    else
                    {
                        self._handleSSOCallbackWithoutSDK(self.appID(), sessionId, callbackUrl);
                    }
                });
            }
            else
            {
                self._handleSSOCallbackWithoutSDK(self.appID(), sessionId, callbackUrl);
            }
        });

        return true;
    }

    return false;
};

YiXin.prototype._handleSSOCallbackWithoutSDK = function (appID, sessionId, callbackUrl)
{
    var self = this;
    if(callbackUrl.slice(0, "yx".length) === "yx")
    {
        $mob.ext.ssdk_getDataFromPasteboard(appID, sessionId, callbackUrl,$mob.shareSDK.platformType.YiXin,function(data){
            if(data.result)
            {
                var retData = data['retData'];
                if(retData != null)
                {
                    var dictInfoData = retData['dictInfoData'];
                    if(dictInfoData != null)
                    {
                        var code = dictInfoData['code'];
                        if(code === -2)
                        {
                            $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Cancel, data);
                        }
                        else if(code === 0)
                        {
                            self._authHandler(sessionId, {'code' : dictInfoData['authCode']});
                        }
                        else
                        {
                            $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Fail, data);
                        }
                    }
                    else{
                        $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Fail, data);
                    }
                }
                else{
                    $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Fail, data);
                }
            }
            else{
                $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Fail, data);
            }
        });
    }
};

/**
 * 处理分享回调
 * @param sessionId     会话ID
 * @param callbackUrl   回调URL
 * @param sourceApplication     原始应用名称
 * @param annotation            附加数据
 */
YiXin.prototype.handleShareCallback = function (sessionId, callbackUrl, sourceApplication, annotation)
{

    var self = this;
    if (callbackUrl.indexOf(this.appID() + "://") === 0)
    {
        $mob.ext.ssdk_isConnectedPlatformSDK("YXApi",function(data){
            if (data.result)
            {
                $mob.ext.isPluginRegisted("com.mob.sharesdk.connector.yixin", function (data) {

                    if (data.result)
                    {
                        $mob.ext.ssdk_yixinHandleShareCalback(self.appID(), callbackUrl, function (data) {

                            self._getCurrentUser(function (user) {

                                //从分享内容集合中取出分享内容
                                var shareParams = YiXinShareContentSet [sessionId];
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

                                        $mob.native.ssdk_shareStateChanged(sessionId, $mob.shareSDK.responseState.Success, resultData, user, userData);

                                        break;
                                    }
                                    case $mob.shareSDK.responseState.Fail:
                                        //失败
                                        var error = {
                                            "error_code" : $mob.shareSDK.errorCode.APIRequestFail,
                                            "user_data" :  {"error_code" : data.error_code}
                                        };

                                        $mob.native.ssdk_shareStateChanged(sessionId, $mob.shareSDK.responseState.Fail, error, user, userData);
                                        break;
                                    default :
                                        //取消
                                        $mob.native.ssdk_shareStateChanged(sessionId, $mob.shareSDK.responseState.Cancel, null, user, userData);
                                        break;
                                }

                                //移除分享参数集合中的数据
                                delete YiXinShareContentSet[sessionId];
                                YiXinShareContentSet[sessionId] = null;

                            });
                        });

                    }
                    else
                    {
                        //无SDK
                        self._handleShareCallbackWithoutSDK(sessionId, callbackUrl);
                    }
                });
            }
            else
            {
                //无SDK
                self._handleShareCallbackWithoutSDK(sessionId, callbackUrl);
            }
        });
        return true;
    }

    return false;
};

YiXin.prototype._handleShareCallbackWithoutSDK = function(sessionId , callbackURL)
{
    var self = this;
    self._getCurrentUser(function (user) {
    	var shareParams = YiXinShareContentSet [sessionId];
        var content = null;
        var error;
        var userData = null;
        if (shareParams != null)
        {
            content = shareParams ["content"];
            userData = shareParams ["user_data"];
        }
        $mob.ext.ssdk_getDataFromPasteboard(self.appID(), sessionId, callbackURL,$mob.shareSDK.platformType.YiXin, function(data){
            if(data.result)
            {
                var retData = data['retData'];
                if(retData != null)
                {
                    var dictInfoData = retData['dictInfoData'];
                    if(dictInfoData != null)
                    {
                        var code = dictInfoData['code'];
                        if(code === -2)
                        {
                            $mob.native.ssdk_shareStateChanged(sessionId, $mob.shareSDK.responseState.Cancel, null, user, userData);
                        }
                        else if(code === 0)
                        {
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
                            $mob.native.ssdk_shareStateChanged(sessionId, $mob.shareSDK.responseState.Success, resultData, user, userData);
                        }
                        else
                        {
                            error = {
                                "error_code" : $mob.shareSDK.errorCode.APIRequestFail,
                            };
                            $mob.native.ssdk_shareStateChanged(sessionId, $mob.shareSDK.responseState.Fail, error, user, userData);
                        }
                    }
                    else{
                            error = {
                                "error_code" : $mob.shareSDK.errorCode.APIRequestFail
                            };
                            $mob.native.ssdk_shareStateChanged(sessionId, $mob.shareSDK.responseState.Fail, error, user, userData);
                    }
                }
                else
                {
                    error = {
                                "error_code" : $mob.shareSDK.errorCode.APIRequestFail
                            };
                    $mob.native.ssdk_shareStateChanged(sessionId, $mob.shareSDK.responseState.Fail, error, user, userData);
                }
            }
            else
            {
                error = {
                                "error_code" : $mob.shareSDK.errorCode.APIRequestFail
                            };
                $mob.native.ssdk_shareStateChanged(sessionId, $mob.shareSDK.responseState.Fail, error, user, userData);
            }
            //清理缓存
            delete YiXinShareContentSet[sessionId];
       		YiXinShareContentSet[sessionId] = null;
        });
    });
};

/**
 * 取消授权
 */
YiXin.prototype.cancelAuthorize = function ()
{
    this._setCurrentUser(null, null);
};

/**
 * 获取用户信息
 * @param query         查询信息
 * @param callback      方法回调
 */
YiXin.prototype.getUserInfo = function (query, callback)
{
    var self = this;
    this._getCurrentUser(function(user) {

        var params = {};
        if (query != null)
        {
            var errorStr = null;
 
            if(this._currentLanguage === "zh-Hans")
            {
                errorStr = "分享平台［" + self.name() + "］不支持获取其他用户资料!";
            }
            else
            {
                errorStr = "Platform [" + self.name() + "］do not support getting other's userInfo!";
            }

            var error = {
                "error_code" : $mob.shareSDK.errorCode.UnsupportFeature,
                "error_message" : errorStr
            };

            if (callback != null)
            {
                callback ($mob.shareSDK.responseState.Fail, error);
            }

            return;
        }

        self.callApi("https://open.yixin.im/api/userinfo", "GET", params, null, function (state, data) {

            var resultData = data;
            if (state === $mob.shareSDK.responseState.Success)
            {
                //转换用户数据
                resultData = {"platform_type" : self.type()};
                self._updateUserInfo(resultData, data["userinfo"]);

                //如果用户数据和授权用户相同
                if (resultData["uid"] === user["uid"])
                {
                    //将授权凭证赋值给用户信息
                    resultData["credential"] = user["credential"];
                }
            }

            if (callback != null)
            {
                callback (state, resultData);
            }

        });

    });
};

/**
 * 添加好友
 * @param sessionId     会话标识
 * @param user          用户信息
 * @param callback      方法回调，回调方法声明如下:function (stat, data);
 */
YiXin.prototype.addFriend = function (sessionId, user, callback)
{
    var errorStr = null;
    
    if(this._currentLanguage === "zh-Hans")
    {
        errorStr = "平台［" + this.name() + "］不支持添加好友方法!";
    }
    else
    {
        errorStr = "Platform［" + this.name() + "］do not support adding friends";
    }

    var error = {
        "error_code" : $mob.shareSDK.errorCode.UnsupportFeature,
        "error_message" : errorStr

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
YiXin.prototype.getFriends = function (cursor, size, callback)
{
    var self = this;

    self.callApi("https://open.yixin.im/api/friendlist", "GET", null, null, function (state, data) {

        var resultData = data;
        if (state === $mob.shareSDK.responseState.Success)
        {
            //转换数据
            resultData = {};

            //转换用户数据
            var users = [];
            var rawUsersData = data["friendlist"];
            if (rawUsersData != null)
            {
                resultData["total"] = rawUsersData.length;

                for (var i = 0; i < rawUsersData.length; i++)
                {
                    var user = {"platform_type" : self.type()};
                    self._updateUserInfo(user, rawUsersData[i]);
                    users.push(user);
                }
            }
            resultData["users"] = users;
            resultData ["has_next"] = false;
        }

        if (callback != null)
        {
            callback (state, resultData);
        }

    });
};

/**
 * 分享内容
 * @param sessionId         会话ID
 * @param parameters        分享参数
 * @param callback          方法回调，回调方法声明如下:function (state, data, user, userData);
 */
YiXin.prototype.share = function (sessionId, parameters, callback)
{
    var self = this;

    //先判断是否使用客户端分享
    var enableUseClientShare = parameters != null ? parameters ["@client_share"] : false;

    //获取分享统计标识
    var flags = parameters != null ? parameters ["@flags"] : null;
    var userData = {
        "@flags" : flags
    };

    var scene = parameters ["yixin_scene"];
    if (scene == null)
    {
        scene = YiXinScene.Session;
    }

    var platformType = $mob.shareSDK.platformType.Unknown;
    switch (scene)
    {
        case YiXinScene.Session:
            platformType = $mob.shareSDK.platformType.YiXinSession;
            break;
        case YiXinScene.Timeline:
            platformType = $mob.shareSDK.platformType.YiXinTimeline;
            break;
        case YiXinScene.Fav:
            platformType = $mob.shareSDK.platformType.YiXinFav;
            break;
    }
    if(self._isAvailable())
    {
        //是否使用客户端分享
        if (enableUseClientShare)
        {
            $mob.ext.isMultitaskingSupported(function (data){
                if (data.result)
                {
                    //检测URL Scheme
                    self._checkUrlScheme(function (hasReady, urlScheme){
                        if (hasReady)
                        {
                            //检测是否连接平台SDK
                            $mob.ext.ssdk_isConnectedPlatformSDK("YXApi",function(data){
                                if(data.result)
                                {
                                    //检测是否载入 connector
                                    $mob.ext.isPluginRegisted("com.mob.sharesdk.connector.yixin", function (data) {
                                        if (data.result)
                                        {
                                            //进行分享
                                            self._share(platformType, scene, sessionId, parameters, userData, callback);
                                        }
                                        else
                                        {
                                            //去SDK分享
                                            self._shareClientWithoutSDK(platformType, scene, sessionId, parameters, userData, callback);
                                        }
                                    });
                                }
                                else
                                {
                                    //去SDK分享
                                    self._shareClientWithoutSDK(platformType, scene, sessionId, parameters, userData, callback);
                                }
                            });
                        }
                        else
                        {
                            $mob.native.log("[ShareSDK-WARNING] 尚未设置URL Scheme:" + self.appID() + ", 将使用应用内分享!");
                            self._shareWithoutSDK(platformType, parameters, userData, callback);
                        }
                    });
                }
                else
                {
                    $mob.native.log("[ShareSDK-WARNING] 应用已禁用后台模式!将使用应用内分享!");
                    self._shareWithoutSDK(platformType, parameters, userData, callback);
                }
             });
        }
        else
        {
            self._shareWithoutSDK(platformType, parameters, userData, callback);
        }
    }
    else
    {
        var errorMessage = null;
        if(this._currentLanguage === "zh-Hans")
        {
            errorMessage = "分享平台［" + this.name() + "］应用信息无效!";
        }
        else
        {
            errorMessage = "Platform［" + this.name() + "］Invalid configuration!";
        }
        var error = {
            "error_code" : $mob.shareSDK.errorCode.InvaildPlatform,
            "error_message" : errorMessage
        };
        if(callback != null && error != null)
        {
            callback($mob.shareSDK.responseState.Fail, error, null, userData);
        }
    }
};



/**
 * 去SDK分享
 * @param platformType      平台类型
 * @param scene             分享场景
 * @param sessionId         会话标识
 * @param parameters        分享参数
 * @param userData          用户数据
 * @param callback          回调
 * @private
 */
YiXin.prototype._shareClientWithoutSDK = function (platformType, scene, sessionId, parameters, userData, callback)
{
    var self = this;
    var type = $mob.shareSDK.getShareParam(platformType, parameters, "type");
    if (type == null)
    {
        type = $mob.shareSDK.contentType.Auto;
    }
    if (type === $mob.shareSDK.contentType.Auto)
    {
        type = self._getShareType(parameters, platformType);
    }
    switch (type)
    {
        case $mob.shareSDK.contentType.Text:
        {
            self._shareText(platformType, scene, sessionId, parameters, userData, callback);
            break;
        } 
        case $mob.shareSDK.contentType.Image:
        {
            self._shareImage(platformType, scene, sessionId, parameters, userData, callback);
            break;
        }
        case  $mob.shareSDK.contentType.WebPage:
        {
            self._shareWebPage(platformType, scene, sessionId, parameters, userData, callback);
            break;
        }
        case $mob.shareSDK.contentType.App:
        {
            self._shareApp(platformType, scene, sessionId, parameters, userData, callback);
            break;
        }
        case $mob.shareSDK.contentType.Audio:
        {
            self._shareAudio(platformType, scene, sessionId, parameters, userData, callback);
            break;
        }
        case $mob.shareSDK.contentType.Video:
        {
            self._shareVideo(platformType, scene, sessionId, parameters, userData, callback);
            break;
        }
        default :
        {
            var errorStr = null;
            
            if(this._currentLanguage === "zh-Hans")
            {
                errorStr = "不支持的分享类型[" + type + "]";
            }
            else
            {
                errorStr = "unsupported share type [" + type + "]";
            }

            var error = {
                "error_code" : $mob.shareSDK.errorCode.UnsupportContentType,
                "error_message" : errorStr
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
 * 去SDK分享 文字类型
 * @param platformType      平台类型
 * @param scene             分享场景
 * @param sessionId         会话标识
 * @param parameters        分享参数
 * @param userData          用户数据
 * @param callback          回调
 * @private
 */
YiXin.prototype._shareText = function (platformType, scene, sessionId, parameters, userData, callback)
{
    var self = this;
    var text = $mob.shareSDK.getShareParam(platformType, parameters, "text");
    if (text != null)
    {
        var comment = $mob.shareSDK.getShareParam(platformType, parameters, "comment");
        if(comment == null)
        {
            comment = '';
        }
        self._convertUrl(platformType ,[text], function (data) {
            text = data.result[0];
            $mob.ext.canOpenURL('yixinopenapi://',function(data){
                if(data.result)
                {
                    var dictInfoAppData = {};
                    dictInfoAppData[self.appID()] = {};
                    var shareData = {
                                        "dictInfoApp" : dictInfoAppData,
                                        "dictInfoData" : {
                                                            "bText" : 1,
                                                            "toAppID" : "yixinopenapi",
                                                            "fromAppID" : self.appID(),
                                                            "scene" : scene,
                                                            "text" : text,
                                                            "comment" : comment,
                                                            "type" : 1
                                                        }
                                    };
                    var sendData =  {
                                        "type":"share",
                                        "contentType" : $mob.shareSDK.contentType.Text,
                                        "shareData":shareData
                                    };
                    $mob.ext.ssdk_setDataToPasteboard($mob.shareSDK.platformType.YiXin , self.appID(), sendData , sessionId,function(data){

                        if(data.result)
                        {
                            var urlstring = "yixinopenapi://product=yixin";

                            $mob.ext.canOpenURL(urlstring,function(data) {
                                if (data.result)
                                {
                                    $mob.native.openURL(urlstring);

                                    var shareParams = {"platform" : platformType, "scene" : scene, "text" : text , "comment" : comment};
                                    YiXinShareContentSet [sessionId] = {"content" : shareParams, "user_data" : userData};
                                }
                            });
                        }
                    });
                }
                else
                {
                    //未通过判断则说明未安装客户端 使用应用内分享
                    self._shareWithoutSDK(platformType, parameters, userData, callback);
                }
            });
        });
    }
    else
    {
        var errorStr = null;
        
        if(this._currentLanguage === "zh-Hans")
        {
            errorStr = "分享参数text不能为空!";
        }
        else
        {
            errorStr = "share param text can not be nil!";
        }

        var error = {
            "error_code" : $mob.shareSDK.errorCode.APIRequestFail,
            "error_message" : errorStr
        };

        if (callback != null)
        {
            callback ($mob.shareSDK.responseState.Fail, error, null, userData);
        }
    }
};


/**
 * 去SDK分享 图片
 * @param platformType      平台类型
 * @param scene             分享场景
 * @param sessionId         会话标识
 * @param parameters        分享参数
 * @param userData          用户数据
 * @param callback          回调
 * @private
 */
YiXin.prototype._shareImage = function (platformType, scene, sessionId, parameters, userData, callback)
{
    var self = this;
    var images = $mob.shareSDK.getShareParam(platformType, parameters, "images");
    var image = null;
    if (Object.prototype.toString.apply(images) === '[object Array]')
    {
        //取第一张图片进行分享
        image = images [0];
    }
    if (image != null)
    {
        var description = $mob.shareSDK.getShareParam(platformType, parameters, "text");
        if(description == null)
        {
            description = '';
        }
        self._convertUrl(platformType ,[description], function (data) {
            description = data.result[0];
            var comment = $mob.shareSDK.getShareParam(platformType, parameters, "comment");
            if(comment == null)
            {
                comment = '';
            }
            var title = $mob.shareSDK.getShareParam(platformType, parameters, "title");
            if(title == null)
            {
                title = '';
            }
            var thumbImage = $mob.shareSDK.getShareParam(platformType, parameters, "thumb_image");
            if(thumbImage == null)
            {
                thumbImage = '';
            }
            $mob.ext.canOpenURL('yixinopenapi://',function(data){
                if(data.result)
                {
                    var mediaObject ;
                    if (/^(http)/.test(image))//判断为网络图片
                    {
                        mediaObject = { "imageUrl" : image, "mediaType" : 1 };
                    }
                    else
                    {
                        mediaObject = { "imageData" : image, "mediaType" : 1 };
                    }
                    var dictInfoAppData = {};
                    dictInfoAppData[self.appID()] = {};
                    var shareData = {
                                        "dictInfoApp" : dictInfoAppData,
                                        "dictInfoData" : {
                                                            "bText" : 0,
                                                            "toAppID" : "yixinopenapi",
                                                            "fromAppID" : self.appID(),
                                                            "scene" : scene,
                                                            "comment" : comment,
                                                            "message" : {
                                                                            "description" : description,
                                                                            "title" : title,
                                                                            "thumbData" : thumbImage,
                                                                            "mediaObject" : mediaObject
                                                                        },
                                                            "type" : 1
                                                        }
                                    };
                    var sendData =  {
                                        "type":"share",
                                        "contentType" : $mob.shareSDK.contentType.Image,
                                        "shareData":shareData
                                    };
                    $mob.ext.ssdk_setDataToPasteboard($mob.shareSDK.platformType.YiXin , self.appID(), sendData , sessionId,function(data){

                        if(data.result)
                        {
                            var urlstring = "yixinopenapi://product=yixin";

                            $mob.ext.canOpenURL(urlstring,function(data) {
                                if (data.result)
                                {
                                    $mob.native.openURL(urlstring);

                                    var shareParams = {"platform" : platformType, "scene" : scene, "title" : title, "thumb_image" : thumbImage, "image" : image , "comment" : comment , "text" : description};
                                    YiXinShareContentSet [sessionId] = {"content" : shareParams, "user_data" : userData};
                                }
                            });
                        }
                    });
                }
                else
                {
                    //未通过判断则说明未安装客户端 使用应用内分享
                    self._shareWithoutSDK(platformType, parameters, userData, callback);
                }
            });
        });
    }
    else
    {
        var errorStr = null;
                
        if(this._currentLanguage === "zh-Hans")
        {
            errorStr = "分享参数image不能为空!";
        }
        else
        {
            errorStr = "share param image can not be nil!";
        }

        var error = {
            "error_code" : $mob.shareSDK.errorCode.APIRequestFail,
            "error_message" : errorStr
        };

        if (callback != null)
        {
            callback ($mob.shareSDK.responseState.Fail, error, null, userData);
        }
    }
};

/**
 * 去SDK分享 webpage
 * @param platformType      平台类型
 * @param scene             分享场景
 * @param sessionId         会话标识
 * @param parameters        分享参数
 * @param userData          用户数据
 * @param callback          回调
 * @private
 */
YiXin.prototype._shareWebPage = function (platformType, scene, sessionId, parameters, userData, callback)
{
    var self = this;
    var thumbImage = $mob.shareSDK.getShareParam(platformType, parameters, "thumb_image");
    if (thumbImage == null)
    {
        var images = $mob.shareSDK.getShareParam(platformType, parameters, "images");
        if (Object.prototype.toString.apply(images) === '[object Array]')
        {
            //取第一张图片进行分享
            thumbImage = images [0];
        }
    }
    var url = $mob.shareSDK.getShareParam(platformType, parameters, "url");

    if (thumbImage != null && url != null)
    {
        var description = $mob.shareSDK.getShareParam(platformType, parameters, "text");
        if(description == null)
        {
            description = '';
        }
        self._convertUrl(platformType,[description , url], function (data) {
            description = data.result[0];
            url = data.result[1];
            var comment = $mob.shareSDK.getShareParam(platformType, parameters, "comment");
            if(comment == null)
            {
                comment = '';
            }
            
            var title = $mob.shareSDK.getShareParam(platformType, parameters, "title");
            if(title == null)
            {
                title = '';
            }
            $mob.ext.canOpenURL('yixinopenapi://',function(data){
                if(data.result)
                {
                    var mediaObject = { "webpageUrl" : url, "mediaType" : 4 };
                    var dictInfoAppData = {};
                    dictInfoAppData[self.appID()] = {};
                    var shareData = {
                                        "dictInfoApp" : dictInfoAppData,
                                        "dictInfoData" : {
                                                            "bText" : 0,
                                                            "toAppID" : "yixinopenapi",
                                                            "fromAppID" : self.appID(),
                                                            "scene" : scene,
                                                            "comment" : comment,
                                                            "message" : {
                                                                            "description" : description,
                                                                            "title" : title,
                                                                            "thumbData" : thumbImage,
                                                                            "mediaObject" : mediaObject
                                                                        },
                                                            "type" : 1
                                                        }
                                    };
                    var sendData =  {
                                        "type":"share",
                                        "contentType" : $mob.shareSDK.contentType.WebPage,
                                        "shareData":shareData
                                    };
                    $mob.ext.ssdk_setDataToPasteboard($mob.shareSDK.platformType.YiXin , self.appID(), sendData , sessionId,function(data){

                        if(data.result)
                        {
                            var urlstring = "yixinopenapi://product=yixin";

                            $mob.ext.canOpenURL(urlstring,function(data) {
                                if (data.result)
                                {
                                    $mob.native.openURL(urlstring);
                                    var shareParams = {"platform" : platformType, "scene" : scene, "title" : title, "thumb_image" : thumbImage, "url" : url , "comment" : comment , "text" : description};
                                    YiXinShareContentSet [sessionId] = {"content" : shareParams, "user_data" : userData};
                                }
                            });
                        }
                    });
                }
                else
                {
                    //未通过判断则说明未安装客户端 使用应用内分享
                    self._shareWithoutSDK(platformType, parameters, userData, callback);
                }
            });
        });
    }
    else
    {
        var errorStr = null;
                
        if(this._currentLanguage === "zh-Hans")
        {
            errorStr = "分享参数thumbImage、url不能为空!";
        }
        else
        {
            errorStr = "share param thumbImage、url can not be nil!";
        }

        var error = {
            "error_code" : $mob.shareSDK.errorCode.APIRequestFail,
            "error_message" : errorStr
        };

        if (callback != null)
        {
            callback ($mob.shareSDK.responseState.Fail, error, null, userData);
        }
    }
};

/**
 * 去SDK分享 APP
 * @param platformType      平台类型
 * @param scene             分享场景
 * @param sessionId         会话标识
 * @param parameters        分享参数
 * @param userData          用户数据
 * @param callback          回调
 * @private
 */
YiXin.prototype._shareApp = function (platformType, scene, sessionId, parameters, userData, callback)
{
    var self = this;
    var thumbImage = $mob.shareSDK.getShareParam(platformType, parameters, "thumb_image");
    if (thumbImage == null)
    {
        var images = $mob.shareSDK.getShareParam(platformType, parameters, "images");
        if (Object.prototype.toString.apply(images) === '[object Array]')
        {
            //取第一张图片进行分享
            thumbImage = images [0];
        }
    }
    var url = $mob.shareSDK.getShareParam(platformType, parameters, "url");
    if (thumbImage != null && url != null )
    {
        var description = $mob.shareSDK.getShareParam(platformType, parameters, "text");
        if(description == null)
        {
            description = '';
        }
        self._convertUrl(platformType ,[description , url], function (data) {
            description = data.result[0];
            url = data.result[1];
            var comment = $mob.shareSDK.getShareParam(platformType, parameters, "comment");
            if(comment == null)
            {
                comment = '';
            }
            var title = $mob.shareSDK.getShareParam(platformType, parameters, "title");
            if(title == null)
            {
                title = '';
            }
            $mob.ext.canOpenURL('yixinopenapi://',function(data){
                if(data.result)
                {
                    var extInfo = $mob.shareSDK.getShareParam(platformType, parameters, "ext_info");
                    var fileData = $mob.shareSDK.getShareParam(platformType, parameters, "file_data");
                    var mediaObject = {"mediaType" : 3 ,'url' : url};
                    if(extInfo != null)
                    {
                        mediaObject['extInfo'] = extInfo;
                    }
                    if(fileData != null)
                    {
                        mediaObject['fileData'] = fileData;
                    }
                    var dictInfoAppData = {};
                    dictInfoAppData[self.appID()] = {};
                    var shareData = {
                                        "dictInfoApp" : dictInfoAppData,
                                        "dictInfoData" : {
                                                            "bText" : 0,
                                                            "toAppID" : "yixinopenapi",
                                                            "fromAppID" : self.appID(),
                                                            "scene" : scene,
                                                            "comment" : comment,
                                                            "message" : {
                                                                            "description" : description,
                                                                            "title" : title,
                                                                            "thumbData" : thumbImage,
                                                                            "mediaObject" : mediaObject
                                                                        },
                                                            "type" : 1
                                                        }
                                    };
                    var sendData =  {
                                        "type":"share",
                                        "contentType" : $mob.shareSDK.contentType.App,
                                        "shareData":shareData
                                    };
                    $mob.ext.ssdk_setDataToPasteboard($mob.shareSDK.platformType.YiXin , self.appID(), sendData , sessionId,function(data){

                        if(data.result)
                        {
                            var urlstring = "yixinopenapi://product=yixin";

                            $mob.ext.canOpenURL(urlstring,function(data) {
                                if (data.result)
                                {
                                    $mob.native.openURL(urlstring);
                                    var shareParams = {"platform" : platformType, "scene" : scene, "title" : title, "thumb_image" : thumbImage , "comment" : comment , "text" : description , 'url' : url};
                                    if(extInfo != null)
                                    {
                                        shareParams['ext_info'] = extInfo;
                                    }
                                    YiXinShareContentSet [sessionId] = {"content" : shareParams, "user_data" : userData};
                                }
                            });
                        }
                    });
                }
                else
                {
                    //未通过判断则说明未安装客户端 使用应用内分享
                    self._shareWithoutSDK(platformType, parameters, userData, callback);
                }
            });
        });
    }
    else
    {
        var errorStr = null;
                
        if(this._currentLanguage === "zh-Hans")
        {
            errorStr = "分享参数thumbImage、url不能为空!";
        }
        else
        {
            errorStr = "share param thumbImage、url can not be nil!";
        }

        var error = {
            "error_code" : $mob.shareSDK.errorCode.APIRequestFail,
            "error_message" : errorStr
        };

        if (callback != null)
        {
            callback ($mob.shareSDK.responseState.Fail, error, null, userData);
        }
    }
};

/**
 * 去SDK分享 audio
 * @param platformType      平台类型
 * @param scene             分享场景
 * @param sessionId         会话标识
 * @param parameters        分享参数
 * @param userData          用户数据
 * @param callback          回调
 * @private
 */
YiXin.prototype._shareAudio = function (platformType, scene, sessionId, parameters, userData, callback)
{
    var self = this;
    var thumbImage = $mob.shareSDK.getShareParam(platformType, parameters, "thumb_image");
    if (thumbImage == null)
    {
        var images = $mob.shareSDK.getShareParam(platformType, parameters, "images");
        if (Object.prototype.toString.apply(images) === '[object Array]')
        {
            //取第一张图片进行分享
            thumbImage = images [0];
        }
    }
    var url = $mob.shareSDK.getShareParam(platformType, parameters, "url");
    var musicUrl = $mob.shareSDK.getShareParam(platformType, parameters, "audio_url");
    if (thumbImage != null && (url != null || musicUrl != null))
    {
        var description = $mob.shareSDK.getShareParam(platformType, parameters, "text");
        if(description == null)
        {
            description = '';
        }
        self._convertUrl(platformType , [description , url , musicUrl], function (data) {
            description = data.result[0];
            url = data.result[1];
            musicUrl = data.result[2];
            var comment = $mob.shareSDK.getShareParam(platformType, parameters, "comment");
            if(comment == null)
            {
                comment = '';
            }
            
            var title = $mob.shareSDK.getShareParam(platformType, parameters, "title");
            if(title == null)
            {
                title = '';
            }
            $mob.ext.canOpenURL('yixinopenapi://',function(data){
                if(data.result)
                {
                    var mediaObject = {"mediaType" : 2 };
                    if(musicUrl != null)
                    {
                        mediaObject['musicDataUrl'] = musicUrl;
                    }
                    if(url != null)
                    {
                        mediaObject['musicUrl'] = url;
                    }
                    var dictInfoAppData = {};
                    dictInfoAppData[self.appID()] = {};
                    var shareData = {
                                        "dictInfoApp" : dictInfoAppData,
                                        "dictInfoData" : {
                                                            "bText" : 0,
                                                            "toAppID" : "yixinopenapi",
                                                            "fromAppID" : self.appID(),
                                                            "scene" : scene,
                                                            "comment" : comment,
                                                            "message" : {
                                                                            "description" : description,
                                                                            "title" : title,
                                                                            "thumbData" : thumbImage,
                                                                            "mediaObject" : mediaObject
                                                                        },
                                                            "type" : 1
                                                        }
                                    };
                    var sendData =  {
                                        "type":"share",
                                        "contentType" : $mob.shareSDK.contentType.Audio,
                                        "shareData":shareData
                                    };
                    $mob.ext.ssdk_setDataToPasteboard($mob.shareSDK.platformType.YiXin , self.appID(), sendData , sessionId,function(data){

                        if(data.result)
                        {
                            var urlstring = "yixinopenapi://product=yixin";

                            $mob.ext.canOpenURL(urlstring,function(data) {
                                if (data.result)
                                {
                                    $mob.native.openURL(urlstring);
                                    var shareParams = {"platform" : platformType, "scene" : scene, "title" : title, "thumb_image" : thumbImage , "comment" : comment , "text" : description};
                                    if(musicUrl != null)
                                    {
                                        shareParams['audio_url'] = musicUrl;
                                    }
                                    if(url != null)
                                    {
                                        shareParams['url'] = url;
                                    }
                                    YiXinShareContentSet [sessionId] = {"content" : shareParams, "user_data" : userData};
                                }
                            });
                        }
                    });
                }
                else
                {
                    //未通过判断则说明未安装客户端 使用应用内分享
                    self._shareWithoutSDK(platformType, parameters, userData, callback);
                }
            });
        });
    }
    else
    {
        var errorStr = null;
                
        if(this._currentLanguage === "zh-Hans")
        {
            errorStr = "分享参数thumbImage、url不能为空!";
        }
        else
        {
            errorStr = "share param thumbImage、url can not be nil!";
        }

        var error = {
            "error_code" : $mob.shareSDK.errorCode.APIRequestFail,
            "error_message" : errorStr
        };

        if (callback != null)
        {
            callback ($mob.shareSDK.responseState.Fail, error, null, userData);
        }
    }
};

/**
 * 去SDK分享 Video
 * @param platformType      平台类型
 * @param scene             分享场景
 * @param sessionId         会话标识
 * @param parameters        分享参数
 * @param userData          用户数据
 * @param callback          回调
 * @private
 */
YiXin.prototype._shareVideo = function (platformType, scene, sessionId, parameters, userData, callback)
{
    var self = this;
    var thumbImage = $mob.shareSDK.getShareParam(platformType, parameters, "thumb_image");
    if (thumbImage == null)
    {
        var images = $mob.shareSDK.getShareParam(platformType, parameters, "images");
        if (Object.prototype.toString.apply(images) === '[object Array]')
        {
            //取第一张图片进行分享
            thumbImage = images [0];
        }
    }
    var url = $mob.shareSDK.getShareParam(platformType, parameters, "url");

    if (thumbImage != null && url != null)
    {
        var description = $mob.shareSDK.getShareParam(platformType, parameters, "text");
        if(description == null)
        {
            description = '';
        }
        self._convertUrl(platformType ,[description , url], function (data) {
            description = data.result[0];
            url = data.result[1];
            var comment = $mob.shareSDK.getShareParam(platformType, parameters, "comment");
            if(comment == null)
            {
                comment = '';
            }
            
            var title = $mob.shareSDK.getShareParam(platformType, parameters, "title");
            if(title == null)
            {
                title = '';
            }
            $mob.ext.canOpenURL('yixinopenapi://',function(data){
                if(data.result)
                {
                    var mediaObject = { "videoUrl" : url, "mediaType" : 5 };
                    var dictInfoAppData = {};
                    dictInfoAppData[self.appID()] = {};
                    var shareData = {
                                        "dictInfoApp" : dictInfoAppData,
                                        "dictInfoData" : {
                                                            "bText" : 0,
                                                            "toAppID" : "yixinopenapi",
                                                            "fromAppID" : self.appID(),
                                                            "scene" : scene,
                                                            "comment" : comment,
                                                            "message" : {
                                                                            "description" : description,
                                                                            "title" : title,
                                                                            "thumbData" : thumbImage,
                                                                            "mediaObject" : mediaObject
                                                                        },
                                                            "type" : 1
                                                        }
                                    };
                    var sendData =  {
                                        "type":"share",
                                        "contentType" : $mob.shareSDK.contentType.Video,
                                        "shareData":shareData
                                    };
                    $mob.ext.ssdk_setDataToPasteboard($mob.shareSDK.platformType.YiXin , self.appID(), sendData , sessionId,function(data){

                        if(data.result)
                        {
                            var urlstring = "yixinopenapi://product=yixin";

                            $mob.ext.canOpenURL(urlstring,function(data) {
                                if (data.result)
                                {
                                    $mob.native.openURL(urlstring);
                                    var shareParams = {"platform" : platformType, "scene" : scene, "title" : title, "thumb_image" : thumbImage, "url" : url , "comment" : comment , "text" : description};
                                    YiXinShareContentSet [sessionId] = {"content" : shareParams, "user_data" : userData};
                                }
                            });
                        }
                    });
                }
                else
                {
                    //未通过判断则说明未安装客户端 使用应用内分享
                    self._shareWithoutSDK(platformType, parameters, userData, callback);
                }
            });
        });
    }
    else
    {
        var errorStr = null;
                
        if(this._currentLanguage === "zh-Hans")
        {
            errorStr = "分享参数thumbImage、url不能为空!";
        }
        else
        {
            errorStr = "share param thumbImage、url can not be nil!";
        }

        var error = {
            "error_code" : $mob.shareSDK.errorCode.APIRequestFail,
            "error_message" : errorStr
        };

        if (callback != null)
        {
            callback ($mob.shareSDK.responseState.Fail, error, null, userData);
        }
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
YiXin.prototype.callApi = function (url, method, params, headers, callback)
{
    //获取当前用户信息
    var error = null;
    var self = this;
    this._getCurrentUser(function (user){

        if (user != null)
        {
            if (params == null)
            {
                //如果传入空的请求参数则创建一个新参数对象
                params = {};
            }

            //将授权用户的授权令牌作为参数进行HTTP请求
            if (user.credential != null)
            {
                params["access_token"] = user.credential.token;
            }

            $mob.ext.ssdk_callHTTPApi(self.type(), null, url, method, params, headers, function (data) {

                if (data != null)
                {

                    var response = $mob.utils.jsonStringToObject($mob.utils.base64Decode(data["response_data"]));
                    if (data ["status_code"] === 200 && response["code"] === 1)
                    {
                        //成功
                        if (callback)
                        {
                            callback ($mob.shareSDK.responseState.Success, response);
                        }
                    }
                    else
                    {
                        //失败
                        var code = $mob.shareSDK.errorCode.APIRequestFail;

                        error = {
                            "error_code" : code,
                            "user_data" : response
                        };
                        if (callback)
                        {
                            callback ($mob.shareSDK.responseState.Fail, error);
                        }
                    }
                }
                else
                {
                    //失败
                    error = {
                        "error_code" : $mob.shareSDK.errorCode.APIRequestFail
                    };
                    if (callback)
                    {
                        callback ($mob.shareSDK.responseState.Fail, error);
                    }
                }

            });
        }
        else
        {
            var errorStr = null;
 
            if(this._currentLanguage === "zh-Hans")
            {
                errorStr = "尚未授权[" + self.name() + "]用户";
            }
            else
            {
                errorStr = "Invalid Authorization [" + self.name() + "]";
            }
            //尚未授权
            error = {
                "error_code" : $mob.shareSDK.errorCode.UserUnauth,
                "error_message" : errorStr
            };
            if (callback)
            {
                callback ($mob.shareSDK.responseState.Fail, error);
            }
        }

    });
};

/**
 * 创建用户信息
 * @param rawData       原始用户数据
 * @returns {null}      用户数据
 */
YiXin.prototype.createUserByRawData = function (rawData)
{
    //转换用户数据
    var user = {
        "platform_type" : this.type()
    };
    this._updateUserInfo(user, rawData);
    return $mob.utils.objectToJsonString(user);
};

/**
 * 分享内容
 * @param platformType      平台类型
 * @param scene             分享场景
 * @param sessionId         会话标识
 * @param parameters        分享参数
 * @param userData          用户数据
 * @param callback          回调
 * @private
 */
YiXin.prototype._share = function (platformType, scene, sessionId, parameters, userData, callback)
{
    var text = null;
    var title = null;
    var thumbImage = null;
    var images = null;
    var image = null;
    var url = null;
    var error = null;
    var errorStr;
    var self = this;
    var type = $mob.shareSDK.getShareParam(platformType, parameters, "type");
    if (type == null)
    {
        type = $mob.shareSDK.contentType.Auto;
    }
    if (type === $mob.shareSDK.contentType.Auto)
    {
        type = this._getShareType(parameters, platformType);
    }

    switch (type)
    {
        case $mob.shareSDK.contentType.Text:
        {
            text = $mob.shareSDK.getShareParam(platformType, parameters, "text");

            if (text != null)
            {
                this._convertUrl(platformType, [text], function (data) {

                    text = data.result[0];
                    $mob.ext.ssdk_yixinShareText(self.appID(), scene, text, function (data) {

                        if (data.error_code != null)
                        {
                            //使用应用内分享
                            self._shareWithoutSDK(platformType, parameters, userData, callback);
                        }
                        else
                        {
                            //调用成功后不回调，等待微信客户端回调时再触发
                            //记录分享内容
                            var shareParams = {"platform" : platformType, "scene" : scene, "text" : text};
                            YiXinShareContentSet [sessionId] = {"content" : shareParams, "user_data" : userData};
                        }

                    });

                });
            }
            else
            {
                errorStr = null;
                
                if(this._currentLanguage === "zh-Hans")
                {
                    errorStr = "分享参数text不能为空!";
                }
                else
                {
                    errorStr = "share param text can not be nil!";
                }

                error = {
                    "error_code" : $mob.shareSDK.errorCode.APIRequestFail,
                    "error_message" : errorStr
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
            text = $mob.shareSDK.getShareParam(platformType, parameters, "text");
            title = $mob.shareSDK.getShareParam(platformType, parameters, "title");
            thumbImage = $mob.shareSDK.getShareParam(platformType, parameters, "thumb_image");
            images = $mob.shareSDK.getShareParam(platformType, parameters, "images");
            if (Object.prototype.toString.apply(images) === '[object Array]')
            {
                //取第一张图片进行分享
                image = images [0];
            }

            if (image != null)
            {
                this._convertUrl(platformType ,[text], function (data) {

                    text = data.result[0];
                    $mob.ext.ssdk_yixinShareImage(self.appID(), scene, title, text, thumbImage, image, function (data){

                        if (data.error_code != null)
                        {
                            //使用应用内分享
                            self._shareWithoutSDK(platformType, parameters, userData, callback);
                        }
                        else
                        {
                            //调用成功后不回调，等待微信客户端回调时再触发
                            //记录分享内容
                            var shareParams = {"platform" : platformType, "scene" : scene, "text" : text, "title" : title, "thumb_image" : thumbImage, "image" : image};
                            YiXinShareContentSet [sessionId] = {"content" : shareParams, "user_data" : userData};
                        }

                    });

                });
            }
            else
            {
                var error_message = null;
                
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
            thumbImage = $mob.shareSDK.getShareParam(platformType, parameters, "thumb_image");
            if (thumbImage == null)
            {
                images = $mob.shareSDK.getShareParam(platformType, parameters, "images");
                if (Object.prototype.toString.apply(images) === '[object Array]')
                {
                    //取第一张图片进行分享
                    thumbImage = images [0];
                }
            }
            url = $mob.shareSDK.getShareParam(platformType, parameters, "url");

            if (thumbImage != null && url != null)
            {
                this._convertUrl(platformType ,[text, url], function (data) {

                    text = data.result[0];
                    url = data.result[1];

                    $mob.ext.ssdk_yixinShareWebpage(self.appID(), scene, title, text, thumbImage, url, function (data) {

                        if (data.error_code != null)
                        {
                            //使用应用内分享
                            self._shareWithoutSDK(platformType, parameters, userData, callback);
                        }
                        else
                        {
                            //调用成功后不回调，等待微信客户端回调时再触发
                            //记录分享内容
                            var shareParams = {"platform" : platformType, "scene" : scene, "text" : text, "title" : title, "thumb_image" : thumbImage, "url" : url};
                            YiXinShareContentSet [sessionId] = {"content" : shareParams, "user_data" : userData};
                        }

                    });

                });
            }
            else
            {
                errorStr = null;
                
                if(this._currentLanguage === "zh-Hans")
                {
                    errorStr = "分享参数thumbImage、url不能为空!";
                }
                else
                {
                    errorStr = "share param thumbImage、url can not be nil!";
                }

                error = {
                    "error_code" : $mob.shareSDK.errorCode.APIRequestFail,
                    "error_message" : errorStr
                };

                if (callback != null)
                {
                    callback ($mob.shareSDK.responseState.Fail, error, null, userData);
                }
            }

            break;
        }
        case $mob.shareSDK.contentType.App:
        {
            text = $mob.shareSDK.getShareParam(platformType, parameters, "text");
            title = $mob.shareSDK.getShareParam(platformType, parameters, "title");
            thumbImage = $mob.shareSDK.getShareParam(platformType, parameters, "thumb_image");
            if (thumbImage == null)
            {
                images = $mob.shareSDK.getShareParam(platformType, parameters, "images");
                if (Object.prototype.toString.apply(images) === '[object Array]')
                {
                    //取第一张图片进行分享
                    thumbImage = images [0];
                }
            }

            url = $mob.shareSDK.getShareParam(platformType, parameters, "url");
            var extInfo = $mob.shareSDK.getShareParam(platformType, parameters, "ext_info");
            var fileData = $mob.shareSDK.getShareParam(platformType, parameters, "file_data");

            if (thumbImage != null && url != null)
            {
                this._convertUrl( platformType ,[text, url], function(data) {

                    text = data.result[0];
                    url = data.result[1];

                    $mob.ext.ssdk_yixinShareApp(self.appID(), scene, title, text, thumbImage, url, extInfo, fileData, function (data) {

                        if (data.error_code != null)
                        {
                            //使用应用内分享
                            self._shareWithoutSDK(platformType, parameters, userData, callback);
                        }
                        else
                        {
                            //调用成功后不回调，等待微信客户端回调时再触发
                            //记录分享内容
                            var shareParams = {"platform" : platformType, "scene" : scene, "text" : text, "title" : title, "thumb_image" : thumbImage, "url" : url, "ext_info" : extInfo};
                            YiXinShareContentSet [sessionId] = {"content" : shareParams, "user_data" : userData};
                        }

                    });

                });
            }
            else
            {
                errorStr = null;
                
                if(this._currentLanguage === "zh-Hans")
                {
                    errorStr = "分享参数image、url不能为空!";
                }
                else
                {
                    errorStr = "share param image、url can not be nil!";
                }

                error = {
                    "error_code" : $mob.shareSDK.errorCode.APIRequestFail,
                    "error_message" : errorStr
                };

                if (callback != null)
                {
                    callback ($mob.shareSDK.responseState.Fail, error, null, userData);
                }
            }

            break;
        }
        case $mob.shareSDK.contentType.Audio:
        {
            text = $mob.shareSDK.getShareParam(platformType, parameters, "text");
            title = $mob.shareSDK.getShareParam(platformType, parameters, "title");
            thumbImage = $mob.shareSDK.getShareParam(platformType, parameters, "thumb_image");
            if (thumbImage == null)
            {
                images = $mob.shareSDK.getShareParam(platformType, parameters, "images");
                if (Object.prototype.toString.apply(images) === '[object Array]')
                {
                    //取第一张图片进行分享
                    thumbImage = images [0];
                }
            }

            url = $mob.shareSDK.getShareParam(platformType, parameters, "url");
            var musicUrl = $mob.shareSDK.getShareParam(platformType, parameters, "audio_url");

            if (thumbImage != null && (url != null || musicUrl != null))
            {
                this._convertUrl(platformType , [text, url, musicUrl], function (data) {

                    text = data.result[0];
                    url = data.result[1];
                    musicUrl = data.result[2];

                    $mob.ext.ssdk_yixinShareAudio(self.appID(), scene, title, text, thumbImage, url, musicUrl, function (data) {

                        if (data.error_code != null)
                        {
                            //使用应用内分享
                            self._shareWithoutSDK(platformType, parameters, userData, callback);
                        }
                        else
                        {
                            //调用成功后不回调，等待微信客户端回调时再触发
                            //记录分享内容
                            var shareParams = {"platform" : platformType, "scene" : scene, "text" : text, "title" : title, "thumb_image" : thumbImage, "url" : url, "audio_url" : musicUrl};
                            YiXinShareContentSet [sessionId] = {"content" : shareParams, "user_data" : userData};
                        }

                    });

                });
            }
            else
            {
                errorStr = null;
                
                if(this._currentLanguage === "zh-Hans")
                {
                    errorStr = "分享参数thumbImage、url不能为空!";
                }
                else
                {
                    errorStr = "share param thumbImage、url can not be nil!";
                }

                error = {
                    "error_code" : $mob.shareSDK.errorCode.APIRequestFail,
                    "error_message" : errorStr
                };

                if (callback != null)
                {
                    callback ($mob.shareSDK.responseState.Fail, error, null, userData);
                }
            }

            break;
        }
        case $mob.shareSDK.contentType.Video:
        {
            text = $mob.shareSDK.getShareParam(platformType, parameters, "text");
            title = $mob.shareSDK.getShareParam(platformType, parameters, "title");
            thumbImage = $mob.shareSDK.getShareParam(platformType, parameters, "thumb_image");
            if (thumbImage == null)
            {
                images = $mob.shareSDK.getShareParam(platformType, parameters, "images");
                if (Object.prototype.toString.apply(images) === '[object Array]')
                {
                    //取第一张图片进行分享
                    thumbImage = images [0];
                }
            }
            url = $mob.shareSDK.getShareParam(platformType, parameters, "url");

            if (thumbImage != null && url != null)
            {
                this._convertUrl(platformType , [text, url], function (data) {

                    text = data.result[0];
                    url = data.result[1];
                    $mob.ext.ssdk_yixinShareVideo(self.appID(), scene, title, text, thumbImage, url, function (data) {

                        if (data.error_code != null)
                        {
                            //使用应用内分享
                            self._shareWithoutSDK(platformType, parameters, userData, callback);
                        }
                        else
                        {
                            //调用成功后不回调，等待微信客户端回调时再触发
                            //记录分享内容
                            var shareParams = {"platform" : platformType, "scene" : scene, "text" : text, "title" : title, "thumb_image" : thumbImage, "url" : url};
                            YiXinShareContentSet [sessionId] = {"content" : shareParams, "user_data" : userData};
                        }

                    });

                });
            }
            else
            {
                errorStr = null;
                
                if(this._currentLanguage === "zh-Hans")
                {
                    errorStr = "分享参数thumbImage 或 url不能为空!";
                }
                else
                {
                    errorStr = "share param thumbImage or url can not be nil!";
                }

                error = {
                    "error_code" : $mob.shareSDK.errorCode.APIRequestFail,
                    "error_message" : errorStr
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
            errorStr = null;
            
            if(this._currentLanguage === "zh-Hans")
            {
                errorStr = "不支持的分享类型[" + type + "]";
            }
            else
            {
                errorStr = "unsupported share type [" + type + "]";
            }

            error = {
                "error_code" : $mob.shareSDK.errorCode.UnsupportContentType,
                "error_message" : errorStr
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
 * 应用内分享
 * @param platformType      平台类型
 * @param parameters        参数
 * @param userData          自定义数据
 * @param callback          回调
 * @private
 */
YiXin.prototype._shareWithoutSDK = function (platformType, parameters, userData, callback)
{
    var self = this;

    var type = $mob.shareSDK.getShareParam(platformType, parameters, "type");
    if (type == null)
    {
        type = $mob.shareSDK.contentType.Auto;
    }
    if (type === $mob.shareSDK.contentType.Auto)
    {
        type = this._getShareType(parameters, platformType);
    }

    this._getCurrentUser(function (user) {

        switch (platformType)
        {
            case $mob.shareSDK.platformType.YiXinSession:
            {
                //好友
                self._shareToSession(user, type, parameters, userData, callback);
                break;
            }
            case $mob.shareSDK.platformType.YiXinTimeline:
            {
                //朋友圈
                self._shareToTimeline(user, type, parameters, userData, callback);
                break;
            }
            case $mob.shareSDK.platformType.YiXinFav:
            {
                //收藏
                self._shareToFav(user, type, parameters, userData, callback);
                break;
            }
        }

    });

};

/**
 * 分享到收藏
 * @param user          分享用户
 * @param type          分享类型
 * @param parameters    分享参数
 * @param userData      自定义数据
 * @param callback      回调
 * @private
 */
YiXin.prototype._shareToFav = function (user, type, parameters, userData, callback)
{
    var self = this;
    var platformType = $mob.shareSDK.platformType.YiXinFav;

    var jsonData = null;
    var params = null;
    var error = null;
    var i = null;

    var text = null;
    var images = null;
    var imgItem = null;
    var image = null;
    var url = null;

    switch (type)
    {
        case $mob.shareSDK.contentType.Text:
        {
            text = $mob.shareSDK.getShareParam(platformType, parameters, "text");

            self._convertUrl(platformType ,[text], function (data) {

                jsonData = {
                    "type" : "text",
                    "text_content" : data.result[0]
                };

                params = {
                    "content" : $mob.utils.objectToJsonString(jsonData)
                };

                self.callApi("https://open.yixin.im/api/addfav", "POST", params, null, function (state, data){

                    var resultData = data;
                    if (state === $mob.shareSDK.responseState.Success)
                    {
                        //转换数据
                        resultData = {};
                        resultData["text"] = text;
                    }

                    if (callback != null)
                    {
                        callback (state, resultData, user, userData);
                    }

                });

            });

            break;
        }
        case $mob.shareSDK.contentType.Image:
        {
            images = $mob.shareSDK.getShareParam(platformType, parameters, "images");
            for (i = 0; i < images.length; i++)
            {
                imgItem = images[i];
                if (!/^(file\:\/)?\//.test(imgItem))
                {
                    image = imgItem;
                    break;
                }
            }

            if (image != null)
            {
                url = $mob.shareSDK.getShareParam(platformType, parameters, "url");

                self._convertUrl(platformType , [url], function (data) {

                    jsonData = {
                        "type" : "image",
                        "image" : image,
                        "url" : data.result[0]
                    };

                    params = {
                        "content" : $mob.utils.objectToJsonString(jsonData)
                    };

                    self.callApi("https://open.yixin.im/api/addfav", "POST", params, null, function (state, data){

                        var resultData = data;
                        if (state === $mob.shareSDK.responseState.Success)
                        {
                            //转换数据
                            resultData = {};
                            resultData["images"] = [image];
                            if (url != null)
                            {
                                resultData["urls"] = [url];
                            }

                        }

                        if (callback != null)
                        {
                            callback (state, resultData, user, userData);
                        }

                    });

                });
            }
            else
            {
                var error_message = null;
 
                if(this._currentLanguage === "zh-Hans")
                {
                    error_message = "分享参数image不能为空或者必须是网络图片!";
                }
                else
                {
                    error_message = "share param image can not be nil and only local image!";
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

            var errorStr = null;
            
            if(this._currentLanguage === "zh-Hans")
            {
                errorStr = "不支持的分享类型[" + type + "]";
            }
            else
            {
                errorStr = "unsupported share type [" + type + "]";
            }

            error = {
                "error_code" : $mob.shareSDK.errorCode.UnsupportContentType,
                "error_message" : errorStr
            };

            if (callback != null)
            {
                callback ($mob.shareSDK.responseState.Fail, error, null, userData);
            }
            break;
    }
};

/**
 * 分享到好友
 * @param user          分享用户
 * @param type          分享类型
 * @param parameters    分享参数
 * @param userData      自定义数据
 * @param callback      回调
 * @private
 */
YiXin.prototype._shareToSession = function (user, type, parameters, userData, callback)
{
    var self = this;
    var platformType = $mob.shareSDK.platformType.YiXinSession;

    var jsonData = null;
    var params = null;
    var error = null;
    var i = null;
    var errorStr;
    var text = null;
    var desc = null;
    var images = null;
    var imgItem = null;
    var image = null;
    var title = null;
    var url = null;
    var musicUrl = null;

    var accountId = $mob.shareSDK.getShareParam(platformType, parameters, "uid");

    if (accountId != null)
    {
        switch (type)
        {
            case $mob.shareSDK.contentType.Text:
            {
                text = $mob.shareSDK.getShareParam(platformType, parameters, "text");
                desc = $mob.shareSDK.getShareParam(platformType, parameters, "desc");

                self._convertUrl( platformType, [text, desc], function (data) {

                    jsonData = {
                        "type" : "text",
                        "text_content" : data.result[0],
                        "desc" : data.result[1]
                    };

                    params = {
                        "toAccountId" : accountId,
                        "content" : $mob.utils.objectToJsonString(jsonData)
                    };

                    self.callApi("https://open.yixin.im/api/sendp2pmsg", "POST", params, null, function (state, data){

                        var resultData = data;
                        if (state === $mob.shareSDK.responseState.Success)
                        {
                            //转换数据
                            resultData = {};
                            resultData["text"] = text;
                        }

                        if (callback != null)
                        {
                            callback (state, resultData, user, userData);
                        }

                    });

                });

                break;
            }
            case $mob.shareSDK.contentType.Image:
            {
                images = $mob.shareSDK.getShareParam(platformType, parameters, "images");
                for (i = 0; i < images.length; i++)
                {
                    imgItem = images[i];
                    if (!/^(file\:\/)?\//.test(imgItem))
                    {
                        image = imgItem;
                        break;
                    }
                }

                if (image != null)
                {
                    title = $mob.shareSDK.getShareParam(platformType, parameters, "title");
                    url = $mob.shareSDK.getShareParam(platformType, parameters, "url");

                    self._convertUrl(platformType ,[url], function (data) {

                        jsonData = {
                            "type" : "image",
                            "image" : image,
                            "title" : title,
                            "url" : data.result[0]
                        };

                        params = {
                            "toAccountId" : accountId,
                            "content" : $mob.utils.objectToJsonString(jsonData)
                        };

                        self.callApi("https://open.yixin.im/api/sendp2pmsg", "POST", params, null, function (state, data){

                            var resultData = data;
                            if (state === $mob.shareSDK.responseState.Success)
                            {
                                //转换数据
                                resultData = {};
                                resultData["images"] = [image];
                                if (url != null)
                                {
                                    resultData["urls"] = [url];
                                }

                            }

                            if (callback != null)
                            {
                                callback (state, resultData, user, userData);
                            }

                        });

                    });
                }
                else
                {
                    errorStr = null;
 
                    if(this._currentLanguage === "zh-Hans")
                    {
                        errorStr = "分享参数image不能为空或者必须是网络图片!";
                    }
                    else
                    {
                        errorStr = "share param image can not be nil and only local image!";
                    }

                    error = {
                        "error_code" : $mob.shareSDK.errorCode.APIRequestFail,
                        "error_message" : errorStr
                    };

                    if (callback != null)
                    {
                        callback ($mob.shareSDK.responseState.Fail, error, null, userData);
                    }
                }
                break;
            }
            case $mob.shareSDK.contentType.WebPage:
            {
                url = $mob.shareSDK.getShareParam(platformType, parameters, "url");

                images = $mob.shareSDK.getShareParam(platformType, parameters, "images");
                for (i = 0; i < images.length; i++)
                {
                    imgItem = images[i];
                    if (!/^(file\:\/)?\//.test(imgItem))
                    {
                        image = imgItem;
                        break;
                    }
                }

                if (url != null && image != null)
                {
                    title = $mob.shareSDK.getShareParam(platformType, parameters, "title");
                    desc = $mob.shareSDK.getShareParam(platformType, parameters, "text");

                    self._convertUrl(platformType ,[url, desc], function (data) {

                        jsonData = {
                            "type" : "webpage",
                            "image" : image,
                            "title" : title,
                            "url" : data.result[0],
                            "desc" : data.result[1]
                        };

                        params = {
                            "toAccountId" : accountId,
                            "content" : $mob.utils.objectToJsonString(jsonData)
                        };

                        self.callApi("https://open.yixin.im/api/sendp2pmsg", "POST", params, null, function (state, data){

                            var resultData = data;
                            if (state === $mob.shareSDK.responseState.Success)
                            {
                                //转换数据
                                resultData = {};
                                resultData["text"] = desc;
                                resultData["images"] = [image];
                                if (url != null)
                                {
                                    resultData["urls"] = [url];
                                }

                            }

                            if (callback != null)
                            {
                                callback (state, resultData, user, userData);
                            }

                        });

                    });
                }
                else
                {
                    errorStr = null;
 
                    if(this._currentLanguage === "zh-Hans")
                    {
                        errorStr = "分享参数image和url不能为空或者image必须是网络图片!";
                    }
                    else
                    {
                        errorStr = "share param image and url can not be nil, and only local image!";
                    }

                    error = {
                        "error_code" : $mob.shareSDK.errorCode.APIRequestFail,
                        "error_message" : errorStr
                    };

                    if (callback != null)
                    {
                        callback ($mob.shareSDK.responseState.Fail, error, null, userData);
                    }
                }
                break;
            }
            case $mob.shareSDK.contentType.Audio:
            {
                url = $mob.shareSDK.getShareParam(platformType, parameters, "url");
                if (url != null)
                {
                    images = $mob.shareSDK.getShareParam(platformType, parameters, "images");
                    for (i = 0; i < images.length; i++)
                    {
                        imgItem = images[i];
                        if (!/^(file\:\/)?\//.test(imgItem))
                        {
                            image = imgItem;
                            break;
                        }
                    }

                    title = $mob.shareSDK.getShareParam(platformType, parameters, "title");
                    desc = $mob.shareSDK.getShareParam(platformType, parameters, "text");
                    musicUrl = $mob.shareSDK.getShareParam(platformType, parameters, "audio_url");

                    self._convertUrl(platformType ,[url, desc, musicUrl], function (data) {

                        jsonData = {
                            "type" : "music",
                            "image" : image,
                            "title" : title,
                            "url" : data.result[0],
                            "desc" : data.result[1],
                            "music_url" : data.result[2] != null ? data.result[2] : data.result[0]
                        };

                        params = {
                            "toAccountId" : accountId,
                            "content" : $mob.utils.objectToJsonString(jsonData)
                        };

                        self.callApi("https://open.yixin.im/api/sendp2pmsg", "POST", params, null, function (state, data) {

                            var resultData = data;
                            if (state === $mob.shareSDK.responseState.Success)
                            {
                                //转换数据
                                resultData = {};
                                resultData["text"] = desc;
                                resultData["images"] = [image];
                                if (url != null)
                                {
                                    resultData["urls"] = [url];
                                }

                            }

                            if (callback != null)
                            {
                                callback (state, resultData, user, userData);
                            }

                        });

                    });
                }
                else
                {
                    errorStr = null;
 
                    if(this._currentLanguage === "zh-Hans")
                    {
                        errorStr = "分享参数url不能为空!";
                    }
                    else
                    {
                        errorStr = "share param url can not be nil!";
                    }

                    error = {
                        "error_code" : $mob.shareSDK.errorCode.APIRequestFail,
                        "error_message" : errorStr
                    };

                    if (callback != null)
                    {
                        callback ($mob.shareSDK.responseState.Fail, error, null, userData);
                    }
                }
                break;
            }
            case $mob.shareSDK.contentType.Video:
            {
                url = $mob.shareSDK.getShareParam(platformType, parameters, "url");
                if (url != null)
                {
                    images = $mob.shareSDK.getShareParam(platformType, parameters, "images");
                    for (i = 0; i < images.length; i++)
                    {
                        imgItem = images[i];
                        if (!/^(file\:\/)?\//.test(imgItem))
                        {
                            image = imgItem;
                            break;
                        }
                    }

                    title = $mob.shareSDK.getShareParam(platformType, parameters, "title");
                    desc = $mob.shareSDK.getShareParam(platformType, parameters, "text");

                    self._convertUrl(platformType ,[url, desc], function (data) {

                        jsonData = {
                            "type" : "video",
                            "image" : image,
                            "title" : title,
                            "url" : data.result[0],
                            "ps" : data.result[1],
                            "desc" : data.result[2]
                        };

                        params = {
                            "toAccountId" : accountId,
                            "content" : $mob.utils.objectToJsonString(jsonData)
                        };

                        self.callApi("https://open.yixin.im/api/sendp2pmsg", "POST", params, null, function (state, data) {

                            var resultData = data;
                            if (state === $mob.shareSDK.responseState.Success)
                            {
                                //转换数据
                                resultData = {};
                                resultData["text"] = desc;
                                resultData["images"] = [image];
                                if (url != null)
                                {
                                    resultData["urls"] = [url];
                                }

                            }

                            if (callback != null)
                            {
                                callback (state, resultData, user, userData);
                            }

                        });

                    });
                }
                else
                {
                    errorStr = null;
 
                    if(this._currentLanguage === "zh-Hans")
                    {
                        errorStr = "分享参数url不能为空!";
                    }
                    else
                    {
                        errorStr = "share param url can not be nil!";
                    }

                    error = {
                        "error_code" : $mob.shareSDK.errorCode.APIRequestFail,
                        "error_message" : errorStr
                    };

                    if (callback != null)
                    {
                        callback ($mob.shareSDK.responseState.Fail, error, null, userData);
                    }
                }
                break;
            }
            default :

                errorStr = null;
            
                if(this._currentLanguage === "zh-Hans")
                {
                    errorStr = "不支持的分享类型[" + type + "]";
                }
                else
                {
                    errorStr = "unsupported share type [" + type + "]";
                }

                error = {
                    "error_code" : $mob.shareSDK.errorCode.UnsupportContentType,
                    "error_message" : errorStr
                };

                if (callback != null)
                {
                    callback ($mob.shareSDK.responseState.Fail, error, null, userData);
                }
                break;
        }
    }
    else
    {
        errorStr = null;
 
        if(this._currentLanguage === "zh-Hans")
        {
            errorStr = "分享参数uid不能为空!";
        }
        else
        {
            errorStr = "share param uid can not be nil!";
        }

        error = {
            "error_code" : $mob.shareSDK.errorCode.APIRequestFail,
            "error_message" : errorStr
        };

        if (callback != null)
        {
            callback ($mob.shareSDK.responseState.Fail, error, null, userData);
        }
    }

};

/**
 * 分享到朋友圈
 * @param user          分享用户
 * @param type          分享类型
 * @param parameters    参数
 * @param userData      自定义数据
 * @param callback      回调
 * @private
 */
YiXin.prototype._shareToTimeline = function (user, type, parameters, userData, callback)
{
    var self = this;
    var platformType = $mob.shareSDK.platformType.YiXinTimeline;

    var jsonData = null;
    var params = null;
    var error = null;
    var i = null;
    var errorStr;
    var text = null;
    var desc = null;
    var ps = null;
    var images = null;
    var imgItem = null;
    var image = null;
    var title = null;
    var url = null;
    var musicUrl = null;

    switch (type)
    {
        case $mob.shareSDK.contentType.Text:
        {
            text = $mob.shareSDK.getShareParam(platformType, parameters, "text");
            desc = $mob.shareSDK.getShareParam(platformType, parameters, "desc");
            ps = $mob.shareSDK.getShareParam(platformType, parameters, "comment");

            self._convertUrl(platformType , [text, desc, ps], function (data) {

                jsonData = {
                    "type" : "text",
                    "text_content" : data.result[0],
                    "desc" : data.result[1],
                    "ps" : data.result[2]
                };

                params = {
                    "content" : $mob.utils.objectToJsonString(jsonData)
                };

                self.callApi("https://open.yixin.im/api/sendcirclemsg", "POST", params, null, function (state, data){

                    var resultData = data;
                    if (state === $mob.shareSDK.responseState.Success)
                    {
                        //转换数据
                        resultData = {};
                        resultData["text"] = text;
                    }

                    if (callback != null)
                    {
                        callback (state, resultData, user, userData);
                    }

                });
            });
            break;
        }
        case $mob.shareSDK.contentType.Image:
        {
            images = $mob.shareSDK.getShareParam(platformType, parameters, "images");
            for (i = 0; i < images.length; i++)
            {
                imgItem = images[i];
                if (!/^(file\:\/)?\//.test(imgItem))
                {
                    image = imgItem;
                    break;
                }
            }

            if (image != null)
            {
                ps = $mob.shareSDK.getShareParam(platformType, parameters, "comment");
                title = $mob.shareSDK.getShareParam(platformType, parameters, "title");
                url = $mob.shareSDK.getShareParam(platformType, parameters, "url");

                self._convertUrl(platformType , [url, ps], function (data) {

                    jsonData = {
                        "type" : "image",
                        "image" : image,
                        "title" : title,
                        "url" : data.result[0],
                        "ps" : data.result[1]
                    };

                    params = {
                        "content" : $mob.utils.objectToJsonString(jsonData)
                    };

                    self.callApi("https://open.yixin.im/api/sendcirclemsg", "POST", params, null, function (state, data){

                        var resultData = data;
                        if (state === $mob.shareSDK.responseState.Success)
                        {
                            //转换数据
                            resultData = {};
                            resultData["images"] = [image];
                            if (url != null)
                            {
                                resultData["urls"] = [url];
                            }

                        }

                        if (callback != null)
                        {
                            callback (state, resultData, user, userData);
                        }

                    });

                });
            }
            else
            {
                errorStr = null;

                if(this._currentLanguage === "zh-Hans")
                {
                    errorStr = "分享参数image不能为空或者必须是网络图片!";
                }
                else
                {
                    errorStr = "image can not be nil and must be url image!";
                }

                error = {
                    "error_code" : $mob.shareSDK.errorCode.APIRequestFail,
                    "error_message" : errorStr
                };

                if (callback != null)
                {
                    callback ($mob.shareSDK.responseState.Fail, error, null, userData);
                }
            }
            break;
        }
        case $mob.shareSDK.contentType.WebPage:
        {
            url = $mob.shareSDK.getShareParam(platformType, parameters, "url");

            images = $mob.shareSDK.getShareParam(platformType, parameters, "images");
            for (i = 0; i < images.length; i++)
            {
                imgItem = images[i];
                if (!/^(file\:\/)?\//.test(imgItem))
                {
                    image = imgItem;
                    break;
                }
            }

            if (url != null && image != null)
            {
                ps = $mob.shareSDK.getShareParam(platformType, parameters, "comment");
                title = $mob.shareSDK.getShareParam(platformType, parameters, "title");
                desc = $mob.shareSDK.getShareParam(platformType, parameters, "text");

                self._convertUrl(platformType , [url, ps, desc], function (data) {

                    jsonData = {
                        "type" : "webpage",
                        "image" : image,
                        "title" : title,
                        "url" : data.result[0],
                        "ps" : data.result[1],
                        "desc" : data.result[2]
                    };

                    params = {
                        "content" : $mob.utils.objectToJsonString(jsonData)
                    };

                    self.callApi("https://open.yixin.im/api/sendcirclemsg", "POST", params, null, function (state, data){

                        var resultData = data;
                        if (state === $mob.shareSDK.responseState.Success)
                        {
                            //转换数据
                            resultData = {};
                            resultData["text"] = desc;
                            resultData["images"] = [image];
                            if (url != null)
                            {
                                resultData["urls"] = [url];
                            }

                        }

                        if (callback != null)
                        {
                            callback (state, resultData, user, userData);
                        }

                    });

                });
            }
            else
            {
                errorStr = null;
                
                if(this._currentLanguage === "zh-Hans")
                {
                    errorStr = "分享参数image和url不能为空或者image必须是网络图片!";
                }
                else
                {
                    errorStr = "image and url can not be nil and must be url image !";
                }

                error = {
                    "error_code" : $mob.shareSDK.errorCode.APIRequestFail,
                    "error_message" : errorStr
                };

                if (callback != null)
                {
                    callback ($mob.shareSDK.responseState.Fail, error, null, userData);
                }
            }

            break;
        }
        case $mob.shareSDK.contentType.Audio:
        {
            url = $mob.shareSDK.getShareParam(platformType, parameters, "url");
            if (url != null)
            {
                images = $mob.shareSDK.getShareParam(platformType, parameters, "images");
                for (i = 0; i < images.length; i++)
                {
                    imgItem = images[i];
                    if (!/^(file\:\/)?\//.test(imgItem))
                    {
                        image = imgItem;
                        break;
                    }
                }

                ps = $mob.shareSDK.getShareParam(platformType, parameters, "comment");
                title = $mob.shareSDK.getShareParam(platformType, parameters, "title");
                desc = $mob.shareSDK.getShareParam(platformType, parameters, "text");
                musicUrl = $mob.shareSDK.getShareParam(platformType, parameters, "audio_url");

                self._convertUrl(platformType , [url, ps, desc, musicUrl], function (data) {

                    jsonData = {
                        "type" : "music",
                        "image" : image,
                        "title" : title,
                        "url" : data.result[0],
                        "ps" : data.result[1],
                        "desc" : data.result[2],
                        "music_url" : data.result[3] != null ? data.result[3] : data.result[0]
                    };

                    params = {
                        "content" : $mob.utils.objectToJsonString(jsonData)
                    };

                    self.callApi("https://open.yixin.im/api/sendcirclemsg", "POST", params, null, function (state, data) {

                        var resultData = data;
                        if (state === $mob.shareSDK.responseState.Success)
                        {
                            //转换数据
                            resultData = {};
                            resultData["text"] = desc;
                            resultData["images"] = [image];
                            if (url != null)
                            {
                                resultData["urls"] = [url];
                            }

                        }

                        if (callback != null)
                        {
                            callback (state, resultData, user, userData);
                        }

                    });

                });
            }
            else
            {
                errorStr = null;
                
                if(this._currentLanguage === "zh-Hans")
                {
                    errorStr = "分享参数url不能为空!";
                }
                else
                {
                    errorStr = "url can not be nil";
                }

                error = {
                    "error_code" : $mob.shareSDK.errorCode.APIRequestFail,
                    "error_message" : errorStr
                };

                if (callback != null)
                {
                    callback ($mob.shareSDK.responseState.Fail, error, null, userData);
                }
            }
            break;
        }
        case $mob.shareSDK.contentType.Video:
        {
            url = $mob.shareSDK.getShareParam(platformType, parameters, "url");
            if (url != null)
            {
                images = $mob.shareSDK.getShareParam(platformType, parameters, "images");
                for (i = 0; i < images.length; i++)
                {
                    imgItem = images[i];
                    if (!/^(file\:\/)?\//.test(imgItem))
                    {
                        image = imgItem;
                        break;
                    }
                }

                ps = $mob.shareSDK.getShareParam(platformType, parameters, "comment");
                title = $mob.shareSDK.getShareParam(platformType, parameters, "title");
                desc = $mob.shareSDK.getShareParam(platformType, parameters, "text");

                self._convertUrl(platformType , [url, ps, desc], function (data) {

                    jsonData = {
                        "type" : "video",
                        "image" : image,
                        "title" : title,
                        "url" : data.result[0],
                        "ps" : data.result[1],
                        "desc" : data.result[2]
                    };

                    params = {
                        "content" : $mob.utils.objectToJsonString(jsonData)
                    };

                    self.callApi("https://open.yixin.im/api/sendcirclemsg", "POST", params, null, function (state, data) {

                        var resultData = data;
                        if (state === $mob.shareSDK.responseState.Success)
                        {
                            //转换数据
                            resultData = {};
                            resultData["text"] = desc;
                            resultData["images"] = [image];
                            if (url != null)
                            {
                                resultData["urls"] = [url];
                            }

                        }

                        if (callback != null)
                        {
                            callback (state, resultData, user, userData);
                        }

                    });

                });
            }
            else
            {
                errorStr = null;
                
                if(this._currentLanguage === "zh-Hans")
                {
                    errorStr = "分享参数url不能为空!";
                }
                else
                {
                    errorStr = "url can not be nil";
                }
                error = {
                    "error_code" : $mob.shareSDK.errorCode.APIRequestFail,
                    "error_message" : errorStr
                };

                if (callback != null)
                {
                    callback ($mob.shareSDK.responseState.Fail, error, null, userData);
                }
            }
            break;
        }
        default :

            errorStr = null;
            
            if(this._currentLanguage === "zh-Hans")
            {
                errorStr = "不支持的分享类型[" + type + "]";
            }
            else
            {
                errorStr = "unsupported share type [" + type + "]";
            }

            error = {
                "error_code" : $mob.shareSDK.errorCode.UnsupportContentType,
                "error_message" : errorStr
            };

            if (callback != null)
            {
                callback ($mob.shareSDK.responseState.Fail, error, null, userData);
            }
            break;
    }
};

/**
 * 转换链接
 * @param contents      内容列表
 * @param callback      回调
 * @private
 */
YiXin.prototype._convertUrl = function (platformType ,contents, callback)
{
    if (this.convertUrlEnabled())
    {
        this._getCurrentUser(function(user){
            $mob.shareSDK.convertUrl(platformType, user, contents, callback);

        });
    }
    else
    {
        if (callback)
        {
            callback ({"result" : contents});
        }
    }
};

/**
 * 根据分享参数返回分享类型
 * @param parameters            分享参数
 * @param platformType          平台类型
 * @private
 */
YiXin.prototype._getShareType = function (parameters, platformType)
{
    var type = $mob.shareSDK.contentType.Text;
    var url = $mob.shareSDK.getShareParam(platformType, parameters, "url");
    var images = $mob.shareSDK.getShareParam(platformType, parameters, "images");
    var musicUrl = $mob.shareSDK.getShareParam(platformType, parameters, "audio_url");

    if (Object.prototype.toString.apply(images) === '[object Array]' && url != null)
    {
        if (musicUrl != null)
        {
            type = $mob.shareSDK.contentType.Audio;
        }
        else
        {
            type = $mob.shareSDK.contentType.WebPage;
        }

    }
    else if (Object.prototype.toString.apply(images) === '[object Array]')
    {
        type = $mob.shareSDK.contentType.Image;
    }

    return type;
};

/**
 * 授权处理
 * @param sessionId      授权会话标识
 * @param data           授权数据
 * @private
 */
YiXin.prototype._authHandler = function (sessionId, data)
{
    var self = this;
    var error;
    var params = {
        "code" : data ["code"]
    };
    params["client_id"] = this.appID();
    params["client_secret"] = this.appSecret();
    params["grant_type"] =  "authorization_code";
    params["redirect_uri"] = this.redirectUri();

    //请求AccessToken
    $mob.ext.ssdk_callHTTPApi(this.type(), null, "https://open.yixin.im/oauth/token", "POST", params, null, function (data) {

        if (data != null)
        {

            var response = $mob.utils.jsonStringToObject($mob.utils.base64Decode(data["response_data"]));
            if (response.error == null)
            {
                //成功
                self._succeedAuthorize(sessionId, response);
            }
            else
            {
                //失败
                error = {
                    "error_code" : $mob.shareSDK.errorCode.APIRequestFail,
                    "user_data" : response
                };
                $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Fail, error);
            }
        }
        else
        {
            //失败
            error = {
                "error_code" : $mob.shareSDK.errorCode.APIRequestFail
            };
            $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Fail, error);
        }

    });
};

/**
 * 更新用户信息
 * @param user      用户信息
 * @param rawData   原始数据
 * @private
 */
YiXin.prototype._updateUserInfo = function (user, rawData)
{
    if (user != null && rawData != null)
    {
        user["raw_data"] = rawData;
        user["uid"] = rawData ["accountId"];
        user["nickname"] = rawData["nick"];
        user["icon"] = rawData["icon"];
    }
};

/**
 * 检测是否配置URL Scheme
 * @param callback 方法回调
 * @private
 */
YiXin.prototype._checkUrlScheme = function (callback)
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
                        if (schema === self.appID())
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
            $mob.native.log("[ShareSDK-WARNING] 尚未配置[" + self.name() + "]URL Scheme:" + self.appID());
        }

        if (callback != null)
        {
            callback (hasReady, urlScheme);
        }

    });
};

/**
 * 设置当前用户信息
 * @param user      用户信息
 * @param callback  回调方法
 * @private
 */
YiXin.prototype._setCurrentUser = function (user, callback)
{
    this._currentUser = user;

    var domain = this.cacheDomain();
    $mob.ext.setCacheData("currentUser", this._currentUser, false, domain, function (data) {

        if (callback != null)
        {
            callback ();
        }

    });
};

/**
 * 获取当前用户信息
 * @param callback  回调方法
 * @private
 */
YiXin.prototype._getCurrentUser = function (callback)
{
    if (this._currentUser != null)
    {
        if (callback)
        {
            callback (this._currentUser);
        }
    }
    else
    {
        var self = this;
        var domain = this.cacheDomain();
        $mob.ext.getCacheData("currentUser", false, domain, function (data) {

            self._currentUser = data != null ? data.value : null;

            if (callback)
            {
                callback (self._currentUser);
            }

        });
    }
};

/**
 * 网页授权
 * @param sessionId     会话标识
 * @param settings      授权设置
 * @private
 */
YiXin.prototype._webAuthorize = function (sessionId, settings)
{
    var self = this;

        var authUrl = "https://open.yixin.im/oauth/authorize?client_id=" + this.appID() + "&response_type=code&redirect_uri=" +
            $mob.utils.urlEncode(self.redirectUri()) + "&state=" + (new Date().getTime());


        if (settings != null && settings ["scopes"] != null && Object.prototype.toString.apply(settings ["scopes"]) === '[object Array]')
        {
            authUrl += "&scope=" + $mob.utils.urlEncode(settings ["scopes"].join(","));
        }
        else if (this._authScopes != null)
        {   
            authUrl += "&scope=" + $mob.utils.urlEncode(this._authScopes);
        }


        //打开授权
        $mob.native.ssdk_openAuthUrl(sessionId, authUrl, self.redirectUri());
};

/**
 * 授权成功
 * @param sessionId             会话ID
 * @param credentialRawData     授权凭证原始数据
 * @private
 */
YiXin.prototype._succeedAuthorize = function (sessionId, credentialRawData)
{
    var self = this;

    //成功
    var credential = {
        "token"     : credentialRawData["access_token"],
        "expired"   : (new Date().getTime() +  credentialRawData ["expires_in"] * 1000),
        "raw_data"  : credentialRawData,
        "type"      : $mob.shareSDK.credentialType.OAuth2
    };

    var user = {
        "platform_type" : this.type(),
        "credential" : credential
    };

    //设置当前授权用户
    this._setCurrentUser(user, function () {

        //获取用户信息
        self.getUserInfo(null, function (state, data) {

            if (state === $mob.shareSDK.responseState.Success)
            {
                //设置授权凭证给去的用户信息
                user["credential"]["uid"] = data["uid"];
                data["credential"] = user["credential"];
                user = data;

                //重新设置当前用户
                self._setCurrentUser(user, null);

                $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Success, user);
            }
            else
            {
                $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Fail, data);
            }

        });

    });
};

/**
 * SSO授权
 * @param sessionId     会话标识
 * @param urlScheme     回调URL Scheme
 * @param settings      授权设置
 * @private
 */
YiXin.prototype._ssoAuthorize = function (sessionId, urlScheme, settings)
{
    var self = this;

    $mob.ext.ssdk_isConnectedPlatformSDK("YXApi",function(data){
        if(data.result)
        {
            $mob.ext.isPluginRegisted("com.mob.sharesdk.connector.yixin", function (data) {
                if (data.result)
                {
                    $mob.ext.ssdk_yixinAuth(self.appID(), function (data) {
                        if (data.state != null)
                        {
                            switch (data.state)
                            {
                                case $mob.shareSDK.responseState.Fail:
                                    //失败则使用非SDK方式进行尝试
                                    self._ssoAuthorizeWithoutSDK(sessionId, urlScheme, settings);
                                    break;
                                default :
                                    $mob.native.ssdk_authStateChanged(sessionId, data.state, data.result);
                                    break;
                            }
                        }
                    });
                }
                else
                {
                    self._ssoAuthorizeWithoutSDK(sessionId, urlScheme, settings);
                }
            });
        }
        else
        {
            self._ssoAuthorizeWithoutSDK(sessionId, urlScheme, settings);
        }
    });
};

/**
 * 不使用SDK进行SSO授权
 * @param sessionId         会话标识
 * @param urlScheme         回调的URL Scheme
 * @param settings          授权设置
 * @private
 */
YiXin.prototype._ssoAuthorizeWithoutSDK = function (sessionId, urlScheme, settings)
{
    var self = this;
    $mob.ext.canOpenURL('yixinopenapi://',function(data){
        if(data.result)
        {
            var dictInfoAppData = {};
            dictInfoAppData[self.appID()] = {};
            var authData = {
                            "dictInfoApp" : dictInfoAppData,
                            "dictInfoData" : {
                                                "type" : 5,
                                                "toAppID" : "yixinopenapi",
                                                "fromAppID" : self.appID()
                                            }
                        };
            $mob.ext.ssdk_setDataToPasteboard($mob.shareSDK.platformType.YiXin , self.appID(), {"type":"authorize","authData":authData} , sessionId,function(data){

                if(data.result)
                {
                    var urlstring = "yixinopenapi://product=yixin";

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
            //未通过判断则说明未安装客户端 使用web授权
            self._webAuthorize(sessionId, settings);
        }
    });
};

/**
 * 检测应用是否有效
 * @returns {boolean}   true 有效 false 无效
 * @private
 */
YiXin.prototype._isAvailable = function ()
{
    if (this.appID() != null && this.appSecret() != null && this.redirectUri() != null)
    {
        return true;
    }

    $mob.native.log("[ShareSDK-WARNING] [" + this.name() + "]应用信息有误，不能进行相关操作。请检查本地代码中和服务端的[" + this.name() + "]平台应用配置是否有误! " +
        "\n本地配置:" + $mob.utils.objectToJsonString(this._appInfo));

    return false;
};

/**
 * 检测应用信息中的授权信息
 * @param appInfo   应用信息
 * @private
 */
YiXin.prototype._checkAuthScopes = function (appInfo)
{
    return appInfo [YiXinAppInfoKeys.Scopes];
};

/**
 * 检测应用信息有效性
 * @param appInfo   应用信息
 * @private
 */
YiXin.prototype._checkAppInfoAvailable = function (appInfo)
{
    var appKey = $mob.utils.trim(appInfo [YiXinAppInfoKeys.AppId]);
    var appSecret = $mob.utils.trim(appInfo [YiXinAppInfoKeys.AppSecret]);
    var redirectUri = $mob.utils.trim(appInfo [YiXinAppInfoKeys.RedirectUri]);

    if (appKey != null)
    {
        appInfo [YiXinAppInfoKeys.AppId] = appKey;
    }
    else
    {
        appInfo [YiXinAppInfoKeys.AppId] = this.appID();   
    }

    if (appSecret != null)
    {
        appInfo [YiXinAppInfoKeys.AppSecret] = appSecret;
    }
    else
    {
        appInfo [YiXinAppInfoKeys.AppSecret] = this.appSecret();   
    }

    if (redirectUri != null)
    {
        appInfo [YiXinAppInfoKeys.RedirectUri] = redirectUri;
    }
    else
    {
        appInfo [YiXinAppInfoKeys.RedirectUri] = this.redirectUri();   
    }

    return appInfo;
};

/**
 * 初始化应用
 * @param appId     应用标识
 * @private
 */
YiXin.prototype._setupApp = function (appId)
{
    if (appId != null)
    {
        $mob.ext.isPluginRegisted("com.mob.sharesdk.connector.yixin", function (data) {

            if (data.result)
            {
                //注册微信
                $mob.native.ssdk_plugin_yixin_setup(appId);
            }
        });
    }
};

/**
 * 授权状态改变
 * @param sessionId         会话标识
 * @param data              返回数据
 * @private
 */
YiXin.prototype.authStateChanged = function (sessionId, data)
{
    $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Cancel, null);
};

//注册平台
$mob.shareSDK.registerPlatformClass($mob.shareSDK.platformType.YiXin, YiXin);
