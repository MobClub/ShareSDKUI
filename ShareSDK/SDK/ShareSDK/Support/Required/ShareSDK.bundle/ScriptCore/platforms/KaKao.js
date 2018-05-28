/**
 * Created with JetBrains WebStorm.
 * User: fenghj
 * Date: 15/10/26
 * Time: 上午10:24
 * To change this template use File | Settings | File Templates.
 */

var $pluginID = "com.mob.sharesdk.KaKao";

/**
 * Pinterest应用信息键名定义
 * @type {{AppId: "app_id", AppSecret: "app_secret", ConvertUrl: "covert_url"}}
 */
var KaKaoInfoKeys = {
    "AppKey"            : "app_key",
    "RestApiKey"        : "rest_api_key",
    "RedirectUri"       : "redirect_uri",
    "AuthType"          : "auth_type",
    "ConvertUrl"        : "covert_url",
    "Scopes"            : "auth_scopes"
};

/**
 * KaKao场景
 * @type {{Story: number, Talk: number}}
 */
var KaKaoScene = {
    "Story"         : 0,
    "Talk"          : 1
};

/**
 * KaKao
 * @param type  平台类型
 * @constructor
 */
function KaKao (type)
{
    this._type = type;
    this._appInfo = {};
    this._authScopes = null;
    this._urlScheme = null;
    this._currentUser = null;
    //设置当前语言环境
    this._currentLanguage = $mob.shareSDK.preferredLanguageLocalize();
}

/**
 * 获取平台类型
 * @returns {*} 平台类型
 */
KaKao.prototype.type = function ()
{
    return this._type;
};

/**
 * 授权状态改变
 * @param sessionId         会话标识
 * @param data              返回数据
 * @private
 */
KaKao.prototype.authStateChanged = function (sessionId, data)
{
    $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Cancel, null);
};

/**
 * 获取平台名称
 * @returns {string}    平台名称
 */
KaKao.prototype.name = function ()
{
    return "KaKao";
};

/**
 * 获取应用标识
 * @returns {*} 应用标识
 */
KaKao.prototype.appKey = function ()
{
    if (this._appInfo[KaKaoInfoKeys.AppKey] !== undefined) 
    {
        return this._appInfo[KaKaoInfoKeys.AppKey];
    }

    return null;
};

/**
 * 获取应用标识
 * @returns {*} 应用标识
 */
KaKao.prototype.restApiKey = function ()
{
    if (this._appInfo[KaKaoInfoKeys.RestApiKey] !== undefined) 
    {
        return this._appInfo[KaKaoInfoKeys.RestApiKey];
    }

    return null;
};

/**
 * 获取应用回调地址
 * @returns {*} 应用回调地址
 */
KaKao.prototype.redirectUri = function ()
{
    if (this._appInfo[KaKaoInfoKeys.RedirectUri] !== undefined) 
    {
        return this._appInfo[KaKaoInfoKeys.RedirectUri];
    }

    return null;
};

/**
 * 获取授权方式
 *
 * @return  web 网页授权方式，sso 单点登录授权方式，both 两者共同使用，优先使用SSO
 */
KaKao.prototype.authType = function ()
{
    if (this._appInfo[KaKaoInfoKeys.AuthType] !== undefined) 
    {
        return this._appInfo[KaKaoInfoKeys.AuthType];
    }

    return $mob.shareSDK.authType();
};

/**
 * 获取缓存域名
 * @returns {string}    域名
 */
KaKao.prototype.cacheDomain = function ()
{
    return "SSDK-Platform-" + this.type() + "-" + this.restApiKey();
};

/**
 * 获取授权方式
 *
 * @return  web 网页授权方式，sso 单点登录授权方式，both 两者共同使用，优先使用SSO
 */
KaKao.prototype.convertUrlEnabled = function ()
{
    if (this._appInfo[KaKaoInfoKeys.ConvertUrl] !== undefined) 
    {
        return this._appInfo[KaKaoInfoKeys.ConvertUrl];
    }

    return $mob.shareSDK.convertUrlEnabled();
};

/**
 * 设置/获取应用信息
 * @param value 应用信息
 * @returns {*}
 */
KaKao.prototype.setAppInfo = function (value)
{
    if (arguments.length === 0) 
    { 
        return this._appInfo;
    }
    else
    {
        this._appInfo = this._checkAppInfoAvailable(value);
        this._authScopes = this._checkAuthScopes(value);
        this._updateUrlScheme();
    }

};

/**
 * 保存配置信息
 */
KaKao.prototype.saveConfig = function ()
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

            curApps["plat_" + self.type()] = self.restApiKey();
            $mob.ext.setCacheData("currentApp", curApps, false, domain, null);
        }
    });
};

/**
 * 获取是否支持授权
 * @returns {boolean} true 支持， false 不支持
 */
KaKao.prototype.isSupportAuth = function ()
{
    return true;
};

/**
 * 用户授权
 * @param sessionId     授权会话标识
 * @param settings      授权设置
 */
KaKao.prototype.authorize = function (sessionId, settings)
{
    var error = null;
    var error_message;

    if (this._isAvailable())
    {
        var self = this;
        var authType = this.authType();
        if (authType === "both" || authType === "sso")
        {
            //检测是否支持多任务
            $mob.ext.isMultitaskingSupported(function (data){

                if (data.result)
                {
                    //检测URL Scheme
                    self._checkUrlScheme(function (hasReady, urlScheme)
                    {
                        if (hasReady)
                        {

                        	$mob.ext.ssdk_isConnectedPlatformSDK("KOSession",function(data) {

                        		if(data.result)
                                {
                                    
                                    $mob.ext.isPluginRegisted("com.mob.sharesdk.connector.kakao",function(data){

                                        if(data.result)
                                        {
                                            //使用SDK进行的SSO授权
                                            self._ssoAuthorize(sessionId, urlScheme, settings);
                                        }
                                        else
                                        {
                                                              
                                            //不使用SDK进行的SSO授权
                                            self._ssoAuthorizeWithoutSDK(sessionId, urlScheme, settings);
                                        }
                                    });
                                }
                                else
                                {
                                    //不使用SDK进行的SSO授权
                                    self._ssoAuthorizeWithoutSDK(sessionId, urlScheme, settings);
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

                            var error_message = null;
                                             
                            if(this._currentLanguage === "zh-Hans")
                            {
                                error_message = "分享平台［" + self.name() + "］尚未配置URL Scheme:" + self._urlScheme + "，无法进行授权!";
                            }
                            else
                            {
                                error_message = "Can't authorize because platform［" + self.name() + "］did not set URL Scheme:" +  self._urlScheme;
                            }

                            var error =
                            {
                                "error_code" : $mob.shareSDK.errorCode.UnsetURLScheme,
                                "error_message" : error_message
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

                    var error_message = null;
 
                    if(this._currentLanguage === "zh-Hans")
                    {
                        error_message = "分享平台［" + self.name() + "］不支持[" + authType + "]授权方式!";
                    }
                    else
                    {
                        error_message = "Platform [" + self.name() + "］do not support auth type :[" + authType + "]!";
                    }


                    var error =
                    {
                        "error_code" : $mob.shareSDK.errorCode.UnsupportFeature,
                        "error_message" : error_message
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

            error_message = null;
 
            if(this._currentLanguage === "zh-Hans")
            {
                error_message = "分享平台［" + self.name() + "］不支持[" + authType + "]授权方式!";
            }
            else
            {
                error_message = "Platform [" + self.name() + "］do not support auth type :[" + authType + "]!";
            }

            error =
            {
                "error_code" : $mob.shareSDK.errorCode.UnsupportFeature,
                "error_message" : error_message
            };
            $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Fail, error);
        }
    }
    else
    {

        error_message = null;
    
        if(this._currentLanguage === "zh-Hans")
        {
            error_message = "分享平台［" + this.name() + "］应用信息无效!";
        }
        else
        {
            error_message = "Platform［" + this.name() + "］invalid congfiguration!";
        }

        error = {
            "error_code" : $mob.shareSDK.errorCode.InvaildPlatform,
            "error_message" : error_message
        };
        $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Fail, error);
    }

};

/**
 * 取消授权
 */
KaKao.prototype.cancelAuthorize = function ()
{
    this._setCurrentUser(null, null);
};

/**
 * 获取用户信息
 * @param query         查询信息
 * @param callback      方法回调
 */
KaKao.prototype.getUserInfo = function (query, callback)
{
    var self = this;

    var params = {};
    if (query != null)
    {

        var error_message = null;
 
        if(this._currentLanguage === "zh-Hans")
        {
            error_message = "分享平台［" + self.name() + "］不支持获取其他用户资料!";
        }
        else
        {
            error_message = "Platform [" + self.name() + "］do not support getting other's userInfo!";
        }

        var error = {
            "error_code" : $mob.shareSDK.errorCode.UnsupportFeature,
            "error_message" : error_message
        };
        if (callback != null)
        {
            callback ($mob.shareSDK.responseState.Fail, error);
        }

        return;
    }

    this._getCurrentUser(function(user) {

        params["propertyKeys"] = $mob.utils.objectToJsonString(["nickname", "thumbnail_image", "profile_image"]);

        self.callApi("https://kapi.kakao.com/v1/user/me", "GET", params, null, function (state, data) {

            var resultData = data;
            if (state === $mob.shareSDK.responseState.Success)
            {
                //转换用户数据
                resultData = {"platform_type" : self.type()};
                self._updateUserInfo(resultData, data);

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
KaKao.prototype.addFriend = function (sessionId, user, callback)
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
KaKao.prototype.getFriends = function (cursor, size, callback)
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
 * 分享内容
 * @param sessionId         会话ID
 * @param parameters        分享参数
 * @param callback          方法回调，回调方法声明如下:function (state, data, user, userData);
 */
KaKao.prototype.share = function (sessionId, parameters, callback)
{
    var self = this;
    var platformType = null;

    var scene = parameters ["kakao_scene"];
    if (scene == null)
    {
        scene = KaKaoScene.Story;
    }

    switch (scene)
    {
        case KaKaoScene.Talk:

            platformType = $mob.shareSDK.platformType.KaKaoTalk;
            $mob.ext.ssdk_isConnectedPlatformSDK("KOSession",function(data) {

                if(data.result)
                {

                    $mob.ext.isPluginRegisted("com.mob.sharesdk.connector.kakao",function(data){

                        if(data.result)
                        {
                            //使用SDK进行分享
                            self._talkShare(platformType, parameters, callback);
                        }
                        else
                        {

                            //不使用SDK进行分享
                            self._talkShareWithoutSDK(platformType, parameters, callback);
                        }
                    });
                }
                else
                {
                    //不使用SDK进行分享
                    self._talkShareWithoutSDK(platformType, parameters, callback);
                }

            });
            break;

        default :
            platformType = $mob.shareSDK.platformType.KaKaoStory;
            this._storyShare(platformType, parameters, callback);
            break;
    }


};

/**
 * 处理用户授权回调
 * @param sessionId     授权会话标识
 * @param callbackUrl   回调地址
 */
KaKao.prototype.handleAuthCallback = function (sessionId, callbackUrl)
{
    var error = null;
    var error_message;
    var self = this;
    var urlInfo = $mob.utils.parseUrl(callbackUrl);
    if (urlInfo != null && urlInfo.query != null)
    {
        var params = $mob.utils.parseUrlParameters(urlInfo.query);
        if (params != null && params.code != null)
        {
            params["client_id"] = this.restApiKey();
            params["grant_type"] =  "authorization_code";
            params["redirect_uri"] = this.redirectUri();

            //请求AccessToken
            $mob.ext.ssdk_callHTTPApi(this.type(), null, "https://kauth.kakao.com/oauth/token", "POST", params, null, function (data) {

                if (data != null)
                {

                    if (data ["error_code"] != null)
                    {
                        //失败
                        $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Fail, data);
                    }
                    else
                    {
                        var response = $mob.utils.jsonStringToObject($mob.utils.base64Decode(data["response_data"]));
                        if (data ["status_code"] === 200)
                        {
                            //成功
                            self._succeedAuthorize(sessionId, response);
                        }
                        else
                        {
                            //失败
                            var code = $mob.shareSDK.errorCode.APIRequestFail;
                            error = {
                                "error_code" : code,
                                "user_data" : response
                            };
                            $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Fail, error);
                        }
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
        }
        else
        {

            error_message = null;
 
            if(this._currentLanguage === "zh-Hans")
            {
                error_message = "无效的授权回调:[" + callbackUrl + "]";
            }
            else
            {
                error_message = "invalid callback url:[" + callbackUrl + "]";
            }

            error = {
                "error_code" : $mob.shareSDK.errorCode.InvalidAuthCallback,
                "error_message" : error_message
            };
            $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Fail, error);
        }
    }
    else
    {
        error_message = null;
 
        if(this._currentLanguage === "zh-Hans")
        {
            error_message = "无效的授权回调:[" + callbackUrl + "]";
        }
        else
        {
            error_message = "invalid callback url:[" + callbackUrl + "]";
        }

        error = {
            "error_code" : $mob.shareSDK.errorCode.InvalidAuthCallback,
            "error_message" : error_message
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
KaKao.prototype.handleSSOCallback = function (sessionId, callbackUrl, sourceApplication, annotation)
{
    if (callbackUrl.indexOf(this._urlScheme + "://") === 0)
    {
        var self = this;
        $mob.ext.ssdk_isConnectedPlatformSDK("KOSession",function(data) {

            if(data.result)
            {
                $mob.ext.isPluginRegisted("com.mob.sharesdk.connector.kakao",function(data){

                    if(data.result)
                    {
                        //处理使用SDK进行的SSO授权回调
                        $mob.ext.ssdk_kakaoHandleSSOCallback (self.appKey(), callbackUrl, function (data) {

                            switch (data.state)
                            {
                                case $mob.shareSDK.responseState.Success:
                                {
                                    self._succeedAuthorize(sessionId, data.result);
                                    break;
                                }
                                case $mob.shareSDK.responseState.Fail:
                                {
                                    //授权失败
                                    var error = {
                                        "error_code" : $mob.shareSDK.errorCode.APIRequestFail,
                                        "user_data" :  {"error_code" : data.error_code, "error_message" : data.error_message}
                                    };

                                    $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Fail, error);
                                    break;
                                }
                                default :
                                    $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Cancel, null);
                                    break;
                            }
                        });

                    }
                    else
                    {
                        //处理不使用SDK进行的SSO授权回调
                        self._handleSSOCallbackWithoutSDK(self.appKey(),sessionId ,callbackUrl);
                    }
                });
            }
            else
            {
                //处理不使用SDK进行的SSO授权回调
                self._handleSSOCallbackWithoutSDK(self.appKey(),sessionId ,callbackUrl);
            }

        });

        return true;
    }

    return false;
};

/**
 * 非SDK 处理SSO授权回调
 * @param appID         应用标识
 * @param sessionId     会话ID
 * @param callbackUrl   回调URL
 */
KaKao.prototype._handleSSOCallbackWithoutSDK = function (appID, sessionId, callbackUrl)
{
    //通过code换取token(跟webAuth一样)
    var error = null;
    var error_message;
    var self = this;
    var urlInfo = $mob.utils.parseUrl(callbackUrl);
    if (urlInfo != null && urlInfo.query != null)
    {
        var params = $mob.utils.parseUrlParameters(urlInfo.query);
        if (params != null && params.code != null)
        {
            params["client_id"] = self.appKey();
            params["grant_type"] =  "authorization_code";
            params["redirect_uri"] = "kakao" + self.appKey() + "://oauth";

            //请求AccessToken
            $mob.ext.ssdk_callHTTPApi(this.type(), null, "https://kauth.kakao.com/oauth/token", "POST", params, null, function (data) {

                if (data != null)
                {

                    if (data ["error_code"] != null)
                    {
                        //失败
                        error = {
                            "error_code" : data ["error_code"]
                        };
                        $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Fail, error);
                    }
                    else
                    {
                        var response = $mob.utils.jsonStringToObject($mob.utils.base64Decode(data["response_data"]));
                        if (data ["status_code"] === 200)
                        {
                            //成功
                            self._succeedAuthorize(sessionId, response);
                        }
                        else
                        {
                            //失败
                            var code = $mob.shareSDK.errorCode.APIRequestFail;
                            error = {
                                "error_code" : code,
                                "user_data" : response
                            };
                            $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Fail, error);
                        }
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
        }
        else if(params != null && params.error !=null && params.error === "cancelled")
        {
            $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Cancel, null);
        }
        else
        {

            error_message = null;
            if(this._currentLanguage === "zh-Hans")
            {
                error_message = "无效的授权回调:[" + callbackUrl + "]";
            }
            else
            {
                error_message = "invalid callback url:[" + callbackUrl + "]";
            }

            error = {
                "error_code" : $mob.shareSDK.errorCode.InvalidAuthCallback,
                "error_message" : error_message
            };
            $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Fail, error);
        }
    }
    else
    {
        error_message = null;

        if(this._currentLanguage === "zh-Hans")
        {
            error_message = "无效的授权回调:[" + callbackUrl + "]";
        }
        else
        {
            error_message = "invalid callback url:[" + callbackUrl + "]";
        }

        error = {
            "error_code" : $mob.shareSDK.errorCode.InvalidAuthCallback,
            "error_message" : error_message
        };
        $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Fail, error);
    }
};


/**
 * 处理分享回调
 * @param sessionId     会话ID
 * @param callbackUrl   回调URL
 * @param sourceApplication     原始应用名称
 * @param annotation            附加数据
 */
KaKao.prototype.handleShareCallback = function (sessionId, callbackUrl, sourceApplication, annotation)
{
    return false;
};

/**
 * 调用API接口
 * @param url           接口URL
 * @param method        请求方式
 * @param params        请求参数
 * @param headers       请求头
 * @param callback      方法回调, 回调方法声明如下:function (state, data);
 */
KaKao.prototype.callApi = function (url, method, params, headers, callback)
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

            if (headers == null)
            {
                headers = {};
            }

            //将授权用户的授权令牌作为参数进行HTTP请求
            if (user.credential != null)
            {
                headers["Authorization"] = "Bearer " + user.credential.token;
            }

            $mob.ext.ssdk_callHTTPApi(self.type(), null, url, method, params, headers, function (data) {

                if (data != null)
                {

                    var response = $mob.utils.jsonStringToObject($mob.utils.base64Decode(data["response_data"]));
                    if (data ["status_code"] === 200)
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
            var error_message = null;
 
            if(this._currentLanguage === "zh-Hans")
            {
                error_message = "尚未授权[" + self.name() + "]用户";
            }
            else
            {
                error_message = "Invalid Authorization [" + self.name() + "]";
            }

            //尚未授权
            error = {
                "error_code" : $mob.shareSDK.errorCode.UserUnauth,
                "error_message" : error_message
            };
            if (callback)
            {
                callback ($mob.shareSDK.responseState.Fail, error);
            }
        }

    });
};

/**
 * 检测应用信息中的授权信息
 * @param appInfo   应用信息
 * @private
 */
KaKao.prototype._checkAuthScopes = function (appInfo)
{
    return appInfo [KaKaoInfoKeys.Scopes];
};

/**
 * 检测应用信息有效性
 * @param appInfo   应用信息
 * @private
 */
KaKao.prototype._checkAppInfoAvailable = function (appInfo)
{
    var restApiKey = $mob.utils.trim(appInfo [KaKaoInfoKeys.RestApiKey]);
    var redirectUri = $mob.utils.trim(appInfo [KaKaoInfoKeys.RedirectUri]);

    if (restApiKey != null)
    {
        appInfo [KaKaoInfoKeys.RestApiKey] = restApiKey;
    }
    else
    {
        appInfo [KaKaoInfoKeys.RestApiKey] =  this.restApiKey(); 
    }

    if (redirectUri != null)
    {
        appInfo [KaKaoInfoKeys.RedirectUri] = redirectUri;
    }
    else
    {
        appInfo [KaKaoInfoKeys.RedirectUri] = this.redirectUri();
    }

    return appInfo;
};

/**
 * 检测应用是否有效
 * @returns {boolean}   true 有效 false 无效
 * @private
 */
KaKao.prototype._isAvailable = function ()
{
    if (this.restApiKey() != null && this.redirectUri() != null)
    {
        return true;
    }

    $mob.native.log("[ShareSDK-WARNING] [" + this.name() + "]应用信息有误，不能进行相关操作。请检查本地代码中和服务端的[" + this.name() + "]平台应用配置是否有误! " +
        "\n本地配置:" + $mob.utils.objectToJsonString(this._appInfo));

    return false;
};

/**
 * 网页授权
 * @param sessionId     会话标识
 * @param settings      授权设置
 * @private
 */
KaKao.prototype._webAuthorize = function (sessionId, settings)
{
    var authUrl = "https://kauth.kakao.com/oauth/authorize?client_id=" + $mob.utils.urlEncode(this.restApiKey()) +
        "&response_type=code&redirect_uri=" + $mob.utils.urlEncode(this.redirectUri()) +
        "&state=" + (new Date().getTime());

    //打开授权
    $mob.native.ssdk_openAuthUrl(sessionId, authUrl, this.redirectUri());
};

/**
 * 授权成功
 * @param sessionId             会话ID
 * @param credentialRawData     授权凭证原始数据
 * @private
 */
KaKao.prototype._succeedAuthorize = function (sessionId, credentialRawData)
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
                user ["credential"]["uid"] = data["uid"].toString();
                data["credential"] = user["credential"];
                user = data;

                //重新设置当前用户
                self._setCurrentUser(user, null);

                $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Success, user);
            }
            else
            {

                var error = {
                    "error_code" : $mob.shareSDK.errorCode.APIRequestFail,
                    "user_data" : data
                };

                //重置用户
                self._setCurrentUser(null, null);

                $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Fail, error);
            }

        });

    });
};

/**
 * 设置当前用户信息
 * @param user      用户信息
 * @param callback  回调方法
 * @private
 */
KaKao.prototype._setCurrentUser = function (user, callback)
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
KaKao.prototype._getCurrentUser = function (callback)
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
 * 更新用户信息
 * @param user      用户信息
 * @param rawData   原始数据
 * @private
 */
KaKao.prototype._updateUserInfo = function (user, rawData)
{
    if (user != null && rawData != null)
    {
        user["raw_data"] = rawData;
        user["uid"] = rawData ["id"].toString();
        user["nickname"] = rawData["nickname"];
        user["icon"] = rawData["profile_image"];
    }
};

/**
 * 根据分享参数返回分享类型
 * @param platformType          平台类型
 * @param parameters            分享参数
 * @private
 */
KaKao.prototype._getShareType = function (platformType, parameters)
{
    var type = $mob.shareSDK.contentType.Text;

    var images = $mob.shareSDK.getShareParam(this.type(), parameters, "images");
    var url = $mob.shareSDK.getShareParam(this.type(), parameters, "url");
    var androidExecParams = $mob.shareSDK.getShareParam(platformType, parameters, "android_exec_param");
    var iosExecParams = $mob.shareSDK.getShareParam(platformType, parameters, "iphone_exec_param");
    var ipadExecParams = $mob.shareSDK.getShareParam(platformType, parameters, "ipad_exec_param");

    if (platformType === $mob.shareSDK.platformType.KaKaoTalk && (androidExecParams != null || iosExecParams != null || ipadExecParams != null))
    {
        type = $mob.shareSDK.contentType.App;
    }
    else if (url != null)
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
 * 转换链接
 * @param contents      内容列表
 * @param callback      回调
 * @private
 */
KaKao.prototype._convertUrl = function (platformType , contents, callback)
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
 * 获取图片路径
 * @param url           图片路径
 * @param callback      回调
 * @private
 */
KaKao.prototype._getImagePath = function (url, callback)
{
    if (!/^(file\:\/)?\//.test(url))
    {
        //网络图片需要先下载再分享
        $mob.ext.downloadFile(url, function (data) {

            if (data.result != null)
            {
                if (callback != null)
                {
                    callback (data.result);
                }
            }
            else
            {
                if (callback != null)
                {
                    callback (null);
                }
            }

        });
    }
    else
    {
        if (callback != null)
        {
            callback (url);
        }
    }
};

/**
 * 获取图片列表中的所有图片路径
 * @param images
 * @param index
 * @param callback
 * @private
 */
KaKao.prototype._getImagesPath = function (images, index, callback)
{
    if (images.length > index)
    {

        var self = this;
        this._getImagePath(images[index], function (url) {

            if (url != null)
            {
                images[index] = url;
                index ++;
            }
            else
            {
                //删除
                images.splice(index,1);
            }

            self._getImagesPath(images, index, callback);
        });

    }
    else
    {
        if (callback != null)
        {
            callback (images);
        }
    }
};

/**
 * 更新URL Scheme
 * @private
 */
KaKao.prototype._updateUrlScheme = function ()
{
    this._urlScheme = "kakao" + this.appKey();
};

/**
 * 检测是否配置URL Scheme
 * @param callback 方法回调
 * @private
 */
KaKao.prototype._checkUrlScheme = function (callback)
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
                        if (schema === self._urlScheme)
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
            $mob.native.log("[ShareSDK-WARNING] 尚未配置[" + self.name() + "]URL Scheme:" + self._urlScheme + ", 无法使用进行授权。");
        }

        if (callback != null)
        {
            callback (hasReady, urlScheme);
        }

    });
};

/**
 * SSO授权
 * @param sessionId     会话标识
 * @param urlScheme     回调URL Scheme
 * @param settings      授权设置
 * @private
 */
KaKao.prototype._ssoAuthorize = function (sessionId, urlScheme, settings)
{
    var self = this;
    var scope = null;
    if (settings != null && settings ["scopes"] != null && Object.prototype.toString.apply(settings ["scopes"]) === '[object Array]')
    {
        scope = settings ["scopes"].join(",");
    }
    else if (self._authScopes != null)
    {
        scope = self._authScopes;
    }

    $mob.ext.canOpenURL("kakaokompassauth://", function (data) {

        if (data.result)
        {
            //使用KaKaoStory进行授权
            $mob.ext.ssdk_kakaoAuth(self.appKey(), self.redirectUri(), scope, 2, function (data) {

                if (data["error_code"] != null)
                {
                    //失败则使用非SDK方式进行尝试
                    self._webAuthorize(sessionId, settings);
                }

            });
        }
        else
        {
            $mob.ext.canOpenURL("storykompassauth://", function (data) {

                if (data.result)
                {
                    //使用KaKaoTalk进行授权
                    $mob.ext.ssdk_kakaoAuth(self.appKey(), self.redirectUri(), scope, 4, function (data) {

                        if (data["error_code"] != null)
                        {
                            //失败则使用非SDK方式进行尝试
                            self._webAuthorize(sessionId, settings);
                        }

                    });
                }
                else
                {
                    //使用Web授权
                    self._webAuthorize(sessionId, settings);
                }

            });
        }

    });
};

KaKao.prototype._ssoAuthorizeWithoutSDK = function (sessionId, urlScheme, settings)
{
    var self = this;
    var scope = null;
    if (settings != null && settings ["scopes"] != null && Object.prototype.toString.apply(settings ["scopes"]) === '[object Array]')
    {
        scope = settings ["scopes"].join(",");
    }
    else if (self._authScopes != null)
    {
        scope = self._authScopes;
    }

    $mob.ext.getAppConfig( function(data) {

        var sdkver = "sdk/1.0.64";
        var os = " os/ios-" + data.MOBSystemVersion;
        var lang = " lang/" + self._currentLanguage;
        var res = " res/375x667"; //尚未添加方法获取屏幕宽高,暂时写死
        var origin = " origin/" + data.CFBundleIdentifier;
        var device = null;

        $mob.ext.isPad( function(data) {

            if(data.result)
            {
                device = " device/iPad";
            }
            else
            {
                device = " device/iPhone";
            }

            var KA = { "KA" : sdkver + os + lang + res + device + origin };
            var headers = "headers=" + $mob.utils.urlEncode($mob.utils.objectToJsonString(KA)) ;
            var client_id = "&client_id=" + self.appKey();
            var redirect_uri = "&redirect_uri=" + "kakao" + self.appKey() + "://oauth";
            var authUrl =  headers + client_id + redirect_uri;

            $mob.ext.canOpenURL("kakaokompassauth://", function(data){

                if(data.result)
                {
                    var url = "kakaokompassauth://authorize?" + authUrl;
                    $mob.native.openURL(url);
                }
                else
                {
                    $mob.ext.canOpenURL("storykompassauth://", function(data){

                        if(data.result)
                        {
                            var url = "storykompassauth://authorize?" + authUrl;
                            $mob.native.openURL(url);
                        }
                        else
                        {
                            //使用Web授权
                            self._webAuthorize(sessionId, settings);
                        }

                    });

                }

            });

        });

    });

};

/**
 * Talk 分享
 * @param platformType  平台类型
 * @param parameters    分享参数
 * @param callback      回调
 * @private
 */
KaKao.prototype._talkShare = function (platformType, parameters, callback)
{
    var self = this;

    //获取分享统计标识
    var flags = parameters != null ? parameters ["@flags"] : null;
    var userData = {
        "@flags" : flags
    };

    var type = $mob.shareSDK.getShareParam(platformType, parameters, "type");
    if (type == null)
    {
        type = $mob.shareSDK.contentType.Auto;
    }
    if (type === $mob.shareSDK.contentType.Auto)
    {
        type = this._getShareType(platformType, parameters);
    }

    var error = null;
    var error_message;
    var image = null;
    var imageWidth = null;
    var imageHeight = null;
    var title = null;
    var url = null;
    var appButtonTitle = null;
    var androidExecParams = null;
    var iphoneExecParams = null;
    var ipadExecParams = null;

    var text = $mob.shareSDK.getShareParam(platformType, parameters, "text");

    var images = $mob.shareSDK.getShareParam(platformType, parameters, "images");
    if (Object.prototype.toString.apply(images) === '[object Array]' && images.length > 0)
    {
        for (var i = 0; i < images.length; i++)
        {
             if (!/^(file\:\/)?\//.test(images[i]))
             {
                 //网络图片
                 image = images[i];
                 break;
             }
        }
    }

    imageWidth = $mob.shareSDK.getShareParam(platformType, parameters, "image_width");
    imageHeight = $mob.shareSDK.getShareParam(platformType, parameters, "image_height");

    title = $mob.shareSDK.getShareParam(platformType, parameters, "title");
    url = $mob.shareSDK.getShareParam(platformType, parameters, "url");

    appButtonTitle = $mob.shareSDK.getShareParam(platformType, parameters, "app_button_title");
    androidExecParams = $mob.shareSDK.getShareParam(platformType, parameters, "android_exec_param");
    iphoneExecParams = $mob.shareSDK.getShareParam(platformType, parameters, "iphone_exec_param");
    ipadExecParams = $mob.shareSDK.getShareParam(platformType, parameters, "ipad_exec_param");

    switch (type)
    {
        case $mob.shareSDK.contentType.Text:


            if (text != null)
            {
                this._convertUrl(platformType , [text], function (data) {

                    text = data.result [0];
                    $mob.ext.ssdk_kakaoShareText(self.appKey(), 1, text, function (data) {

                        var resultData = data.result;
                        if (data.state === $mob.shareSDK.responseState.Success)
                        {
                            //转换数据
                            resultData = {};
                            resultData["text"] = text;
                        }

                        if (callback != null)
                        {
                            callback (data.state, resultData, null, userData);
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
        case $mob.shareSDK.contentType.Image:

            if (image != null)
            {
                this._convertUrl(platformType , [text], function (data) {

                    text = data.result [0];
                    $mob.ext.ssdk_kakaoShareImage(self.appKey(), 1, text, image, imageWidth, imageHeight, function (data) {

                        var resultData = data.result;
                        if (data.state === $mob.shareSDK.responseState.Success)
                        {
                            //转换数据
                            resultData = {};
                            resultData["text"] = text;
                            resultData["images"] = [image];
                        }

                        if (callback != null)
                        {
                            callback (data.state, resultData, null, userData);
                        }

                    });

                });
            }
            else
            {

                error_message = null;
                
                if(this._currentLanguage === "zh-Hans")
                {
                    error_message = "分享参数image不能为空或者不是本地图片!";
                }
                else
                {
                    error_message = "share param image can not be nil or url image only!";
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
        case $mob.shareSDK.contentType.WebPage:

            if (url != null)
            {
                this._convertUrl(platformType , [text, url], function (data) {

                    text = data.result [0];
                    url = data.result [1];

                    $mob.ext.ssdk_kakaoShareWebpage(self.appKey(), 1, text, image, imageWidth, imageHeight, title, url, function (data) {

                        var resultData = data.result;
                        if (data.state === $mob.shareSDK.responseState.Success)
                        {
                            //转换数据
                            resultData = {};
                            resultData["raw_data"] = {
                                "title" : title
                            };
                            resultData["text"] = text;
                            resultData["images"] = [image];
                            resultData["urls"] = [url];
                        }

                        if (callback != null)
                        {
                            callback (data.state, resultData, null, userData);
                        }

                    });

                });
            }
            else
            {
                error_message = null;
                
                if(this._currentLanguage === "zh-Hans")
                {
                    error_message = "分享参数url不能为空!";
                }
                else
                {
                    error_message = "share param url can not be nil!";
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
        case $mob.shareSDK.contentType.App:

            this._convertUrl(platformType , [text, url], function (data) {

                text = data.result [0];
                url = data.result [1];

                $mob.ext.ssdk_kakaoShareApp(self.appKey(), 1, text, image, imageWidth, imageHeight, title, url, appButtonTitle, androidExecParams, iphoneExecParams, ipadExecParams, function (data) {

                    var resultData = data.result;
                    if (data.state === $mob.shareSDK.responseState.Success)
                    {
                        //转换数据
                        resultData = {};
                        resultData["raw_data"] = {
                            "title" : title,
                            "android_exec_params" : androidExecParams,
                            "iphone_exec_params" : iphoneExecParams,
                            "ipad_exec_params" : ipadExecParams
                        };
                        resultData["text"] = text;
                        resultData["images"] = [image];
                        resultData["urls"] = [url];
                    }

                    if (callback != null)
                    {
                        callback (data.state, resultData, null, userData);
                    }

                });

            });

            break;
    }
};

/**
 * 使用非SDK进行 Talk 分享
 * @param platformType  平台类型
 * @param parameters    分享参数
 * @param callback      回调
 * @private
 */
KaKao.prototype._talkShareWithoutSDK = function (platformType, parameters, callback)
{
    var self = this;

    //获取分享统计标识
    var flags = parameters != null ? parameters ["@flags"] : null;
    var userData = {
        "@flags" : flags
    };

    var type = $mob.shareSDK.getShareParam(platformType, parameters, "type");
    if (type == null)
    {
        type = $mob.shareSDK.contentType.Auto;
    }
    if (type === $mob.shareSDK.contentType.Auto)
    {
        type = this._getShareType(platformType, parameters);
    }

    var error = null;
    var image = null;
    var imageWidth = null;
    var imageHeight = null;
    var title = null;
    var url = null;
    var appButtonTitle = null;
    var androidExecParams = null;
    var iphoneExecParams = null;
    var ipadExecParams = null;
    var error_message;
    var action;

    var text = $mob.shareSDK.getShareParam(platformType, parameters, "text");

    var images = $mob.shareSDK.getShareParam(platformType, parameters, "images");
    if (Object.prototype.toString.apply(images) === '[object Array]' && images.length > 0)
    {
        for (var i = 0; i < images.length; i++)
        {
            if (!/^(file\:\/)?\//.test(images[i]))
            {
                //网络图片
                image = images[i];
                break;
            }
        }
    }

    imageWidth = $mob.shareSDK.getShareParam(platformType, parameters, "image_width");
    imageHeight = $mob.shareSDK.getShareParam(platformType, parameters, "image_height");

    title = $mob.shareSDK.getShareParam(platformType, parameters, "title");
    url = $mob.shareSDK.getShareParam(platformType, parameters, "url");

    appButtonTitle = $mob.shareSDK.getShareParam(platformType, parameters, "app_button_title");
    androidExecParams = $mob.shareSDK.getShareParam(platformType, parameters, "android_exec_param");
    iphoneExecParams = $mob.shareSDK.getShareParam(platformType, parameters, "iphone_exec_param");
    ipadExecParams = $mob.shareSDK.getShareParam(platformType, parameters, "ipad_exec_param");

    $mob.ext.getAppConfig( function(data) {

        var sdkver = "sdk/1.0.64";
        var os = " os/ios-" + data.MOBSystemVersion;
        var lang = " lang/" + self._currentLanguage;
        var res = " res/375x667"; //尚未添加方法获取屏幕宽高,暂时写死
        var origin = " origin/" + data.CFBundleIdentifier;
        var device = null;

        $mob.ext.isPad( function(isPadData) {

            if(isPadData.result)
            {
                device = " device/iPad";
            }
            else
            {
                device = " device/iPhone";
            }

            var KA = {
                "KA" : sdkver + os + lang + res + device + origin,
                "iosBundleId" : data.CFBundleIdentifier
            };

            var extras = "extras=" + $mob.utils.urlEncode($mob.utils.objectToJsonString(KA));
            var appkey = "&appkey=" + self.appKey();
            var apiver = "&apiver=3.0";
            var appver = "&appver=" + data.CFBundleVersion;
            var forwardable = "&forwardable=NO";
            var linkver = "&linkver=3.5";
            var shareUrl = "kakaolink://send?" + extras + appkey + apiver + appver + forwardable + linkver;

            switch (type)
            {
                case $mob.shareSDK.contentType.Text:

                    if (text != null)
                    {
                        self._convertUrl(platformType , [text], function (data) {

                            text = data.result [0];
                            var textObj = {
                                "objtype" : "label",
                                "text" : text
                            };

                            var objsArr = [textObj];
                            var objs = "&objs=" + $mob.utils.urlEncode($mob.utils.objectToJsonString(objsArr));
                            shareUrl = shareUrl + objs;

                            $mob.ext.canOpenURL(shareUrl, function(data){

                                if(data.result)
                                {
                                    $mob.native.openURL(shareUrl);
                                    var resultData = {
                                        "text" : text
                                    };

                                    if (callback != null)
                                    {
                                        callback ($mob.shareSDK.responseState.Success, resultData, null, userData);
                                    }
                                }
                                else
                                {
                                    if (callback != null)
                                    {
                                        callback ($mob.shareSDK.responseState.Fail, null, null, userData);
                                    }
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

                case $mob.shareSDK.contentType.Image:

                    if (image != null)
                    {
                        self._convertUrl(platformType , [text], function (data) {

                            var textObj = null;
                            var imageObj = null;
                            var objsArr = [];
                            text = data.result [0];
                            if(text != null)
                            {
                                textObj = {
                                    "objtype" : "label",
                                    "text" : text
                                };
                                objsArr.push(textObj);
                            }

                            if(imageWidth == null)
                            {
                                imageWidth = 138;
                            }
                            if(imageHeight == null)
                            {
                                imageHeight = 80;
                            }

                            imageObj = {
                                "height" : imageHeight,
                                "width" : imageWidth,
                                "objtype" : "image",
                                "src" : image
                            };

                            objsArr.push(imageObj);

                            var objs = "&objs=" + $mob.utils.urlEncode($mob.utils.objectToJsonString(objsArr));
                            shareUrl = shareUrl + objs;

                            $mob.ext.canOpenURL(shareUrl, function(data){

                                if(data.result)
                                {
                                    $mob.native.openURL(shareUrl);
                                    var resultData = {
                                        "text" : text,
                                        "images" : [image]
                                    };

                                    if (callback != null)
                                    {
                                        callback ($mob.shareSDK.responseState.Success, resultData, null, userData);
                                    }
                                }
                                else
                                {
                                    if (callback != null)
                                    {
                                        callback ($mob.shareSDK.responseState.Fail, null, null, userData);
                                    }

                                }
                            });

                        });
                    }
                    else
                    {
                        error_message = null;
                        if(self._currentLanguage === "zh-Hans")
                        {
                            error_message = "分享参数image不能为空或者非网络图片";
                        }
                        else
                        {
                            error_message = "share param image can not be nil or not url image";
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

                case $mob.shareSDK.contentType.WebPage:

                    if (url != null)
                    {
                        self._convertUrl(platformType , [text, url], function (data) {

                            text = data.result [0];
                            url = data.result [1];

                            var textObj = null;
                            var imageObj = null;
                            var linkObj = null;
                            var objsArr = [];
                            if(text != null)
                            {
                                textObj = {
                                    "objtype" : "label",
                                    "text" : text
                                };
                                objsArr.push(textObj);
                            }

                            if(imageWidth == null)
                            {
                                imageWidth = 138;
                            }
                            if(imageHeight == null)
                            {
                                imageHeight = 80;
                            }

                            if(image != null )
                            {
                                imageObj = {
                                    "height" : imageHeight,
                                    "width" : imageWidth,
                                    "objtype" : "image",
                                    "src" : image
                                };
                                objsArr.push(imageObj);
                            }

                            action = {
                                "type" : "web",
                                "url" : url
                            };

                            linkObj = {
                                "action" : action,
                                "objtype" : "link",
                                "text" : title
                            };
                            objsArr.push(linkObj);

                            var objs = "&objs=" + $mob.utils.urlEncode($mob.utils.objectToJsonString(objsArr));
                            shareUrl = shareUrl + objs;

                            $mob.ext.canOpenURL(shareUrl, function(data){

                                if(data.result)
                                {
                                    $mob.native.openURL(shareUrl);
                                    var resultData = {
                                        "text" : text,
                                        "images" : [image],
                                        "urls" : [url],
                                        "raw_data" : {"title" : title}
                                    };

                                    if (callback != null)
                                    {
                                        callback ($mob.shareSDK.responseState.Success, resultData, null, userData);
                                    }
                                }
                                else
                                {
                                    if (callback != null)
                                    {
                                        callback ($mob.shareSDK.responseState.Fail, null, null, userData);
                                    }

                                }
                            });

                        });
                    }
                    else
                    {
                        error_message = null;

                        if(self._currentLanguage === "zh-Hans")
                        {
                            error_message = "分享参数url不能为空!";
                        }
                        else
                        {
                            error_message = "share param url can not be nil!";
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

                case $mob.shareSDK.contentType.App:

                    self._convertUrl(platformType , [text, url], function (data) {

                        text = data.result [0];
                        url = data.result [1];

                        var textObj = null;
                        var imageObj = null;
                        var linkObj = null;
                        var buttonObj = null;
                        var objsArr = [];

                        if(text != null)
                        {
                            textObj = {
                                "objtype" : "label",
                                "text" : text
                            };
                            objsArr.push(textObj);
                        }

                        if(imageWidth == null)
                        {
                            imageWidth = 138;
                        }
                        if(imageHeight == null)
                        {
                            imageHeight = 80;
                        }

                        if(image != null )
                        {
                            imageObj = {
                                "height" : imageHeight,
                                "width" : imageWidth,
                                "objtype" : "image",
                                "src" : image
                            };
                            objsArr.push(imageObj);
                        }

                        if(url != null)
                        {
                            action = {
                                "type" : "web",
                                "url" : url
                            };

                            linkObj = {
                                "action" : action,
                                "objtype" : "link",
                                "text" : title
                            };
                            objsArr.push(linkObj);
                        }

                        action = {
                            "type" : "app"
                        };

                        if(androidExecParams != null || iphoneExecParams != null || ipadExecParams != null)
                        {
                            var actioninfo = [];
                            var key;
                            var iOSStr;
                            if(androidExecParams != null)
                            {
                                var andParamsStr = "";
                                for (key in androidExecParams)
                                {
                                    if(androidExecParams.hasOwnProperty(key))
                                    {
                                        andParamsStr = andParamsStr + "&" + key + "=" + androidExecParams[key];
                                    }
                                }
                                andParamsStr = andParamsStr.substr(1, andParamsStr.length);
                                var android = {
                                    "devicetype" : "phone",
                                    "os" : "android",
                                    "execparam" : andParamsStr

                                };
                                actioninfo.push(android);
                            }
                            if(iphoneExecParams != null)
                            {
                                iOSStr = "";
                                for (key in iphoneExecParams)
                                {
                                    if(iphoneExecParams.hasOwnProperty(key))
                                    {
                                        iOSStr = iOSStr + "&" + key + "=" + iphoneExecParams[key];
                                    }
                                }
                                iOSStr = iOSStr.substr(1, iOSStr.length);
                                var iPhone = {
                                    "devicetype" : "phone",
                                    "os" : "ios",
                                    "execparam" : iOSStr

                                };
                                actioninfo.push(iPhone);
                            }
                            if(ipadExecParams != null)
                            {
                                iOSStr = "";
                                for (key in ipadExecParams)
                                {
                                    if(ipadExecParams.hasOwnProperty(key))
                                    {
                                        iOSStr = iOSStr + "&" + key + "=" + ipadExecParams[key];
                                    }
                                }
                                iOSStr = iOSStr.substr(1, iOSStr.length);
                                var iPad = {
                                    "devicetype" : "pad",
                                    "os" : "ios",
                                    "execparam" : iOSStr

                                };
                                actioninfo.push(iPad);
                            }

                            action["actioninfo"] = actioninfo;
                        }

                        buttonObj = {
                            "action" : action,
                            "objtype" : "button",
                            "text" : appButtonTitle
                        };
                        objsArr.push(buttonObj);

                        var objs = "&objs=" + $mob.utils.urlEncode($mob.utils.objectToJsonString(objsArr));
                        shareUrl = shareUrl + objs;

                        $mob.ext.canOpenURL(shareUrl, function(data){

                            if(data.result)
                            {
                                $mob.native.openURL(shareUrl);
                                var resultData = {
                                    "text" : text,
                                    "images" : [image],
                                    "urls" : [url],
                                    "raw_data" : {
                                        "title" : title,
                                        "android_exec_params" : androidExecParams,
                                        "iphone_exec_params" : iphoneExecParams,
                                        "ipad_exec_params" : ipadExecParams
                                    }
                                };

                                if (callback != null)
                                {
                                    callback ($mob.shareSDK.responseState.Success, resultData, null, userData);
                                }
                            }
                            else
                            {
                                if (callback != null)
                                {
                                    callback ($mob.shareSDK.responseState.Fail, null, null, userData);
                                }

                            }
                        });


                    });

                    break;
            }

        });

    });

};


/**
 * Story 分享
 * @param platformType  平台类型
 * @param parameters    分享参数
 * @param callback      回调
 * @private
 */
KaKao.prototype._storyShare = function (platformType, parameters, callback)
{
    var self = this;
    var params = {};
    var error = null;
    var error_message;
    var enableUseClientShare = parameters != null ? parameters ["@client_share"] : false;
    var text = null;
    var images = null;
    var url = null;
    var contents = null;
    var permission = $mob.shareSDK.getShareParam(platformType, parameters, "permission");
    var enableShare = $mob.shareSDK.getShareParam(platformType, parameters, "enable_share");
    var androidExecParams = $mob.shareSDK.getShareParam(platformType, parameters, "android_exec_param");
    var iosExecParams = $mob.shareSDK.getShareParam(platformType, parameters, "iphone_exec_param");
    var andoridMarkParam = $mob.shareSDK.getShareParam(platformType, parameters, "android_market_param");
    var iosMarkParam = $mob.shareSDK.getShareParam(platformType, parameters, "iphone_market_param");

    if (permission != null)
    {
        params["permission"] = permission;
    }
    if (enableShare != null)
    {
        params["enable_share"] = enableShare;
    }
    if (androidExecParams != null)
    {
        params["android_exec_param"] = androidExecParams;
    }
    if (iosExecParams != null)
    {
        params["ios_exec_param"] = iosExecParams;
    }
    if (andoridMarkParam != null)
    {
        params["android_market_param"] = andoridMarkParam;
    }
    if (iosMarkParam != null)
    {
        params["ios_market_param"] = iosMarkParam;
    }

    //获取分享统计标识
    var flags = parameters != null ? parameters ["@flags"] : null;
    var userData = {
        "@flags" : flags
    };

    var type = $mob.shareSDK.getShareParam(platformType, parameters, "type");
    if (type == null)
    {
        type = $mob.shareSDK.contentType.Auto;
    }
    if (type === $mob.shareSDK.contentType.Auto)
    {
        type = this._getShareType(platformType, parameters);
    }

    switch (type)
    {
        case $mob.shareSDK.contentType.Text:

            text = $mob.shareSDK.getShareParam(platformType, parameters, "text");

            params["content"] = text;

            if (text != null)
            {

                contents = [text, andoridMarkParam, iosMarkParam];
                self._convertUrl(platformType , contents, function (data) {

                    params["content"] = data.result[0];
                    if (data.result.length > 1)
                    {
                        params["android_market_param"] = data.result[1];
                    }
                    if (data.result.length > 2)
                    {
                        params["ios_market_param"] = data.result[2];
                    }

                    if (enableUseClientShare)
                    {
                        //获取应用信息
                        $mob.ext.getAppConfig(function (data){

                            if (data != null)
                            {
                                var baseUrl = "storylink://posting";
                                var bundleId = data.CFBundleIdentifier;
                                var appName = data.CFBundleName;
                                var appVer = data.CFBundleShortVersionString;

                                $mob.ext.canOpenURL(baseUrl, function (data){

                                    if (data.result)
                                    {
                                        var reqUrl = baseUrl + "?post=" + $mob.utils.urlEncode(params["content"]) + "&apiver=1.0&appid=" + $mob.utils.urlEncode(bundleId) + "&appver=" + $mob.utils.urlEncode(appVer) + "&appname=" + $mob.utils.urlEncode(appName);
                                        $mob.native.openURL(reqUrl);

                                        self._getCurrentUser(function (user) {

                                            var resultData = {"text" : params["content"]};
                                            if (callback != null)
                                            {
                                                callback ($mob.shareSDK.responseState.Success, resultData, user, userData);
                                            }

                                        });
                                    }
                                    else
                                    {
                                        //使用应用内分享
                                        self._storyShareText (params, userData, callback);
                                    }

                                });
                            }
                            else
                            {
                                //使用应用内分享
                                self._storyShareText (params, userData, callback);
                            }

                        });
                    }
                    else
                    {
                        self._storyShareText (params, userData, callback);
                    }

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
        case $mob.shareSDK.contentType.Image:

            text = $mob.shareSDK.getShareParam(platformType, parameters, "text");
            images = $mob.shareSDK.getShareParam(platformType, parameters, "images");

            if (Object.prototype.toString.apply(images) === '[object Array]' && images.length > 0)
            {
                this._getImagesPath(images, 0, function (images) {

                    //上传图片
                    var uploadParams = {"file" : []};
                    for (var i = 0; i < images.length; i++)
                    {
                        var image = images[i];
                        //本地图片
                        var mimeType = "application/octet-stream";
                        if (/\.jpe?g$/.test(image))
                        {
                            mimeType = "image/jpeg";
                        }
                        else if (/\.png$/.test(image))
                        {
                            mimeType = "image/png";
                        }
                        else if (/\.gif$/.test(image))
                        {
                            mimeType = "image/gif";
                        }

                        var file = {"path" : image, "mime_type": mimeType};
                        uploadParams["file"].push("@file(" + $mob.utils.objectToJsonString(file) + ")");

                        self.callApi("https://kapi.kakao.com/v1/api/story/upload/multi", "POST", uploadParams, null, function (state, data) {

                            if (state === $mob.shareSDK.responseState.Success)
                            {
                                var imageList = data;
                                params["content"] = text;
                                params["image_url_list"] = $mob.utils.objectToJsonString(imageList);

                                contents = [text, andoridMarkParam, iosMarkParam];
                                self._convertUrl(platformType , contents, function (data) {

                                    params["content"] = data.result[0];
                                    if (data.result.length > 1)
                                    {
                                        params["android_market_param"] = data.result[1];
                                    }
                                    if (data.result.length > 2)
                                    {
                                        params["ios_market_param"] = data.result[2];
                                    }

                                    self._getCurrentUser(function (user) {

                                        self.callApi("https://kapi.kakao.com/v1/api/story/post/photo", "POST", params, null, function (state, data) {

                                            var resultData = data;
                                            if (state === $mob.shareSDK.responseState.Success)
                                            {
                                                //转换数据
                                                resultData = {};
                                                resultData["raw_data"] = data;
                                                resultData["cid"] = data["id"];
                                                resultData["text"] = text;
                                                resultData["images"] = imageList;
                                            }

                                            if (callback != null)
                                            {
                                                callback (state, resultData, user, userData);
                                            }

                                        });

                                    });

                                });
                            }
                            else
                            {
                                if (callback != null)
                                {
                                    callback ($mob.shareSDK.responseState.Fail, data, null, userData);
                                }
                            }

                        });
                    }

                });
            }
            else
            {
                error_message = null;
                
                if(this._currentLanguage === "zh-Hans")
                {
                    error_message = "分享参数images不能为空!";
                }
                else
                {
                    error_message = "share param images can not be nil!";
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
        case $mob.shareSDK.contentType.WebPage:

            text = $mob.shareSDK.getShareParam(platformType, parameters, "text");
            url = $mob.shareSDK.getShareParam(platformType, parameters, "url");

            if (url != null)
            {
                contents = [text, url, andoridMarkParam, iosMarkParam];
                self._convertUrl(platformType , contents, function (data) {

                    params["content"] = data.result[0];
                    if (data.result.length > 2)
                    {
                        params["android_market_param"] = data.result[2];
                    }
                    if (data.result.length > 3)
                    {
                        params["ios_market_param"] = data.result[3];
                    }

                    var linkParams = {
                        "url" : data.result[1]
                    };

                    self.callApi("https://kapi.kakao.com/v1/api/story/linkinfo", "GET", linkParams, null, function (state, data) {

                        if (state === $mob.shareSDK.responseState.Success)
                        {
                            params ["link_info"] = $mob.utils.objectToJsonString(data);

                            self._getCurrentUser(function (user) {

                                self.callApi("https://kapi.kakao.com/v1/api/story/post/link", "POST", params, null, function (state, data) {

                                    var resultData = data;
                                    if (state === $mob.shareSDK.responseState.Success)
                                    {
                                        //转换数据
                                        resultData = {};
                                        resultData["raw_data"] = data;
                                        resultData["cid"] = data["id"];
                                        resultData["text"] = text;
                                        resultData["urls"] = [url];
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
                            if (callback != null)
                            {
                                callback ($mob.shareSDK.responseState.Fail, data, null, userData);
                            }
                        }

                    });

                });
            }
            else
            {
                error_message = null;
                
                if(this._currentLanguage === "zh-Hans")
                {
                    error_message = "分享参数url不能为空!";
                }
                else
                {
                    error_message = "share param url can not be nil!";
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
        default :

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
};

/**
 * Sotry分享文本
 * @param params        分享参数
 * @param userData      自定义数据
 * @param callback      回调
 * @private
 */
KaKao.prototype._storyShareText = function (params, userData, callback)
{
    var self = this;
    self._getCurrentUser(function (user) {

        self.callApi("https://kapi.kakao.com/v1/api/story/post/note", "POST", params, null, function (state, data) {

            var resultData = data;
            if (state === $mob.shareSDK.responseState.Success)
            {
                //转换数据
                resultData = {};
                resultData["raw_data"] = data;
                resultData["cid"] = data["id"];
                resultData["text"] = params["content"];
            }

            if (callback != null)
            {
                callback (state, resultData, user, userData);
            }

        });

    });
};


//注册平台
$mob.shareSDK.registerPlatformClass($mob.shareSDK.platformType.KaKao, KaKao);
