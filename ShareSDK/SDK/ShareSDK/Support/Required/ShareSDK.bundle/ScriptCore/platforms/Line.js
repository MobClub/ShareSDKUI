/**
 * Created with JetBrains WebStorm.
 * User: fenghj
 * Date: 15/9/22
 * Time: 下午5:16
 * To change this template use File | Settings | File Templates.
 */

var $pluginID = "com.mob.sharesdk.Line";

/**
 * Line信息键名定义
 * @type {{AppID: "app_id", AppKey: "app_key", AuthType: "auth_type", ConvertUrl: "covert_url"}}
 */
var LineInfoKeys =
{
    "ConvertUrl"    : "covert_url",
    "ChannelID"     : "channel_id",
    "AuthType"      : "auth_type"
};

/**
 * Line
 * @param type  平台类型
 * @constructor
 */
function Line (type)
{
    this._type = type;
    this._appInfo ={};

    //当前授权用户
    this._currentUser = null;
    //设置当前语言环境
    this._currentLanguage = $mob.shareSDK.preferredLanguageLocalize();
}

var LineOtps = {};

/**
 * 获取平台类型
 * @returns {*} 平台类型
 */
Line.prototype.type = function ()
{
    return this._type;
};

/**
 * 授权状态改变
 * @param sessionId         会话标识
 * @param data              返回数据
 * @private
 */
Line.prototype.authStateChanged = function (sessionId, data)
{
    $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Cancel, null);
};

/**
 * 获取平台名称
 * @returns {string}    平台名称
 */
Line.prototype.name = function ()
{
    return "Line";
};

/**
 * 获取缓存域名
 * @returns {string}    域名
 */
Line.prototype.cacheDomain = function ()
{
    if(this.channelID() != null)
    {
        return "SSDK-Platform-" + this.type() + "-" + this.channelID();
    }
    else
    {
        return "SSDK-Platform-" + this.type();
    }
};

/**
 * 获取是否转换短链
 *
 * @return  true 转换， false 不转换
 */
Line.prototype.convertUrlEnabled = function ()
{
    if (this._appInfo[LineInfoKeys.ConvertUrl] !== undefined) 
    {
        return this._appInfo[LineInfoKeys.ConvertUrl];
    }

    return $mob.shareSDK.convertUrlEnabled();
};

/**
 * 获取应用标识
 * @returns {*} 应用标识
 */
Line.prototype.channelID = function ()
{
    if (this._appInfo[LineInfoKeys.ChannelID] !== undefined) 
    {
        return this._appInfo[LineInfoKeys.ChannelID];
    }

    return null;
};

/**
 * 获取授权方式
 *
 * @return  web 网页授权方式，sso 单点登录授权方式，both 两者共同使用，优先使用SSO
 */
Line.prototype.authType = function ()
{
    if (this._appInfo[LineInfoKeys.AuthType] !== undefined) 
    {
        return this._appInfo[LineInfoKeys.AuthType];
    }

    return $mob.shareSDK.authType();
};

/**
 * 设置/获取应用信息
 * @param value 应用信息
 * @returns {*}
 */
Line.prototype.setAppInfo = function (value)
{
    if (arguments.length === 0) 
    { 
        return this._appInfo;
    }
    else
    {
        this._appInfo = this._checkAppInfoAvailable(value);
        this._updateCallbackURLSchemes();
    }
};

/**
 * 检测应用信息有效性
 * @param appInfo   应用信息
 * @private
 */
Line.prototype._checkAppInfoAvailable = function (appInfo)
{
    var channelID = $mob.utils.trim(appInfo[LineInfoKeys.ChannelID]);

    if (channelID == null)
    {
        $mob.ext.getAppConfig(function (data){
            if(data != null)
            {
                if(data.LineSDKConfig.ChannelID != null)
                {
                    appInfo [LineInfoKeys.ChannelID] = data.LineSDKConfig.ChannelID;
                }
            }
        });
    }
    else
    {
        appInfo [LineInfoKeys.ChannelID] = channelID;
    }

    return appInfo;
};

/**
 * 保存配置信息
 */
Line.prototype.saveConfig = function ()
{
    var self = this;
    if(self.channelID() != null)
    {
        var domain = "SSDK-Platform";
        $mob.ext.getCacheData("currentApp", false, domain, function (data) {
        
           if (data != null)
           {
               var curApps = data.value;
               if (curApps == null)
               {
                   curApps = {};
               }
               curApps["plat_" + self.type()] = self.channelID();
               $mob.ext.setCacheData("currentApp", curApps, false, domain, null);
           }
        });
    }
};

/**
 * 获取是否支持授权
 * @returns {boolean} true 支持， false 不支持
 */
Line.prototype.isSupportAuth = function ()
{
    return true;
};

/**
 * 用户授权
 * @param sessionId     授权会话标识
 * @param settings      授权设置
 */
Line.prototype.authorize = function (sessionId, settings)
{
    var error_message = null;
    var self = this;
    if(this.channelID() != null)
    {
        //检测是否支持多任务
        $mob.ext.isMultitaskingSupported(function (data){

            if(data.result)
            {
                //检测URL Scheme
                self._checkUrlScheme(function (hasReady, urlScheme)
                {
                    if(hasReady)
                    {
                        //进行SSO授权
                        self._ssoAuthorize(sessionId, urlScheme, settings);
                    }
                    else
                    {

                        error_message = null;

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
        });
    }
    else
    {
         error_message = null;

        if(this._currentLanguage === "zh-Hans")
        {
            error_message = "分享平台［" + self.name() + "］尚未配置ChannelID 无法进行授权!";
        }
        else
        {
            error_message = "Can't authorize because platform［" + self.name() + "］did not set ChannelID";
        }

        var error =
        {
            "error_code" : $mob.shareSDK.errorCode.UninitPlatform,
            "error_message" : error_message
        };
        $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Fail, error);
    }
};

/**
 * SSO授权
 * @param sessionId     会话标识
 * @param urlScheme     回调URL Scheme
 * @param settings      授权设置
 * @private
 */
Line.prototype._ssoAuthorize = function (sessionId, urlScheme, settings)
{
    var self = this;
    $mob.ext.ssdk_isConnectedPlatformSDK("LineSDKLogin",function(data){
        if(data.result)
        {
            $mob.ext.isPluginRegisted("com.mob.sharesdk.connector.line", function (data) {
                if (data.result)
                {
                    var scope = null;
                    if (settings != null && settings.scopes != null && Object.prototype.toString.apply(settings.scopes) === '[object Array]')
                    {
                        scope = settings.scopes.join(",");
                    }
                    else if (self._authScopes != null)
                    {
                        scope = self._authScopes;
                    }
                    $mob.ext.ssdk_lineAuth(self.authType(),function (data) {
                        if (data.state != null)
                        {
                            if(data.state === $mob.shareSDK.responseState.Cancel)
                            {
                                $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Cancel, null);
                            }
                        }
                    });
                }
                else
                {
                    //无SDK
                    self._ssoAuthorizeWithOutSDK(sessionId, urlScheme, settings);
                }
            });
        }
        else
        {
            //无SDK
            self._ssoAuthorizeWithOutSDK(sessionId, urlScheme, settings);
        }
    });
};

/**
 * SSO授权 无SDK
 * @param sessionId     会话标识
 * @param urlScheme     回调URL Scheme
 * @param settings      授权设置
 * @private
 */
Line.prototype._ssoAuthorizeWithOutSDK = function (sessionId, urlScheme, settings)
{
    var self = this;
    var error;
    $mob.ext.getAppConfig(function (data){
        if(data != null)
        {
            //获取 otp
            var bundleId = data.CFBundleIdentifier;
            var buildVersion = data.CFBundleShortVersionString;
            var model = data.MOBDeviceModel;
            var systemVersion = data.MOBSystemVersion;
            systemVersion = systemVersion.replace(/\./g, "_");
            var userAgent = bundleId + "/" + buildVersion + " ChannelSDK/4.0.1 (" + model + "; CPU iPhone OS " + systemVersion +" like Mac OS X)";
            var params = {"client_id" : self.channelID()};
            var headers = {
                            "Accept" : "application/json" ,
                            "Cache-Control" : "private, no-store, no-cache, must-revalidate",
                            "User-Agent" : userAgent
                            };
            $mob.ext.ssdk_callHTTPApi(self.type(), null, "https://api.line.me/v2/oauth/otp", "POST", params, headers, function (data) {
                if (data != null)
                {
                    if(data.status_code === 200)
                    {
                        var response_data = $mob.utils.jsonStringToObject($mob.utils.base64Decode(data.response_data));
                        if(response_data.otpId != null)
                        {
                            LineOtps[sessionId] = response_data.otp;
                            var authType = self.authType();
                            var returnUrl = $mob.utils.urlEncode(self._urlScheme+"://authorize/");
                            var webURL;
                            if(authType === "web")
                            {
                                webURL = "https://access.line.me/dialog/oauth/weblogin?";
                                webURL += "client_id="+self.channelID();
                                webURL += "&otpId="+$mob.utils.urlEncode(response_data.otpId);
                                webURL += "&state="+$mob.utils.urlEncode(response_data.otpId);
                                webURL += "&redirect_uri="+$mob.utils.urlEncode(self._urlScheme+"://authorize/");
                                webURL += "&response_type=code";
                                $mob.native.ssdk_openAuthUrl(sessionId, webURL, self._urlScheme);
                            }
                            else
                            {
                                var openURL = "lineauth://authorize/?channelId="+self.channelID()+"&otpId="+$mob.utils.urlEncode(response_data.otpId)+"&returnUrl="+returnUrl;
                                $mob.ext.canOpenURL(openURL, function (data) {
                                    if (data.result)
                                    {
                                        //客户端授权
                                        $mob.native.openURL(openURL);
                                    }
                                    else
                                    {
                                        //网页授权
                                        webURL = "https://access.line.me/dialog/oauth/weblogin?";
                                        webURL += "client_id="+self.channelID();
                                        webURL += "&otpId="+$mob.utils.urlEncode(response_data.otpId);
                                        webURL += "&state="+$mob.utils.urlEncode(response_data.otpId);
                                        webURL += "&redirect_uri="+$mob.utils.urlEncode(self._urlScheme+"://authorize/");
                                        webURL += "&response_type=code";
                                        $mob.native.ssdk_openAuthUrl(sessionId, webURL, self._urlScheme);
                                    }
                                });
                            }
                        }
                        else
                        {
                            error = {
                                "error_code" : $mob.shareSDK.errorCode.APIRequestFail,
                                "error_message" : "no otp"
                            };
                            $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Fail, error);
                        }
                    }
                    else
                    {
                        error = {
                            "error_code" : $mob.shareSDK.errorCode.APIRequestFail,
                            "error_message" : "no otp"
                        };
                        $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Fail, error);
                    }
                }
                else
                {
                    error = {
                        "error_code" : $mob.shareSDK.errorCode.APIRequestFail,
                        "error_message" : "no otp"
                    };
                    $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Fail, error);
                }
            });
        }
        else
        {
             error =
            {
                "error_code" : $mob.shareSDK.errorCode.APIRequestFail,
                "error_message" : "no AppConfig"
            };
            $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Fail, error);
        }
    });
};


Line.prototype.handleSSOCallback = function (sessionId, callbackUrl, sourceApplication, annotation)
{
    var self = this;
    if ((callbackUrl.indexOf(this._urlScheme.toLowerCase() + "://") === 0) || (callbackUrl.indexOf(this._urlScheme + "://") === 0))
    {
        $mob.ext.ssdk_isConnectedPlatformSDK("LineSDKLogin",function(data)
        {
            if(data.result)
            {
                $mob.ext.isPluginRegisted("com.mob.sharesdk.connector.line", function (data) {

                    if (data.result)
                    {
                        //处理回调
                        $mob.ext.ssdk_lineHandleSSOCalback(callbackUrl, function (data) {
                            switch (data.state)
                            {
                                case $mob.shareSDK.responseState.Success:
                                    self._succeedAuthorize(sessionId, data.result);
                                    break;
                                case $mob.shareSDK.responseState.Fail:
                                    $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Fail, data.result);
                                    break;
                                default :
                                    $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Cancel, data.result);
                                    break;
                            }

                        });
                    }
                    else
                    {
                        //去SDK
                        self._handleSSOCallbackWithOutSDK(sessionId,callbackUrl);
                    }
                });
            }
            else
            {
                //去SDK
                self._handleSSOCallbackWithOutSDK(sessionId,callbackUrl);
            }
        });
        return true;
    }

    return false;
};

/**
 * 处理SSO用户授权回调 去SDK
 * @param sessionId     授权会话标识
 * @param callbackUrl   回调地址
 */
Line.prototype._handleSSOCallbackWithOutSDK = function (sessionId, callbackUrl)
{
    var self = this;
    var error_message;
    var error;
    var urlInfo = $mob.utils.parseUrl(callbackUrl);
    if (urlInfo != null && urlInfo.query != null)
    {
        var params = $mob.utils.parseUrlParameters(urlInfo.query);
        if (params != null)
        {
            if(params.requestToken != null)
            {
                self._authorizeCallbackWithOutSDK(sessionId,params.requestToken);
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
 * 授权成功
 * @param sessionId             会话ID
 * @param credentialRawData     授权凭证原始数据
 * @private
 */
Line.prototype._succeedAuthorize = function (sessionId, rawData)
{
    var self = this;
    var credentialRawData = rawData.credential;
    var profileRawData = rawData.profile;
    //成功
    var credential = {
        "uid"       : profileRawData.userID,
        "token"     : credentialRawData.accessToken,
        "expired"   : (new Date().getTime() +  credentialRawData.expiresIn * 1000),
        "raw_data"  : credentialRawData,
        "type"      : $mob.shareSDK.credentialType.OAuth2
    };
    var user = {
        "platform_type" : self.type(),
        "credential" : credential
    };
    user.raw_data = profileRawData;
    user.nickname = profileRawData.displayName;
    user.icon = profileRawData.pictureURL;
    user.about_me = profileRawData.statusMessage;
    //设置当前授权用户
    self._setCurrentUser(user, function () {
        $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Success, user);
    });
};

/**
 * 设置当前用户信息
 * @param user      用户信息
 * @param callback  回调方法
 * @private
 */
Line.prototype._setCurrentUser = function (user, callback)
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

Line.prototype._authorizeCallbackWithOutSDK = function (sessionId, code)
{
    var self = this;
    var error;
    $mob.ext.getAppConfig(function (data){
        if(data != null)
        {
            var bundleId = data.CFBundleIdentifier;
            var buildVersion = data.CFBundleShortVersionString;
            var model = data.MOBDeviceModel;
            var systemVersion = data.MOBSystemVersion;
            systemVersion = systemVersion.replace(/\./g, "_");
            var userAgent = bundleId + "/" + buildVersion + " ChannelSDK/4.0.1 (" + model + "; CPU iPhone OS " + systemVersion +" like Mac OS X)";
            var otp = LineOtps[sessionId];
            var headers = {
                    "Accept" : "application/json" ,
                    "Cache-Control" : "private, no-store, no-cache, must-revalidate",
                    "User-Agent" : userAgent
                    };
            var redirectURI = self._urlScheme+"://authorize/";
            var params = {
                        "code" : code,
                        "client_id" : self.channelID(),
                        "redirect_uri" : redirectURI,
                        "otp" : otp,
                        "grant_type" : "authorization_code",
                        };
            //获取 accessToken
            $mob.ext.ssdk_callHTTPApi(self.type(), null, "https://api.line.me/v2/oauth/accessToken", "POST", params, headers, function (data) {
                if(data != null){
                    if(data.status_code === 200)
                    {
                        var accessTokenData = $mob.utils.jsonStringToObject($mob.utils.base64Decode(data.response_data));
                        //凭证数据
                        var credential = {
                            "token"     : accessTokenData.access_token,
                            "expired"   : (new Date().getTime() +  accessTokenData.expires_in * 1000),
                            "raw_data"  : accessTokenData,
                            "type"      : $mob.shareSDK.credentialType.OAuth2
                        };
                        //获取userinfo
                        headers.Authorization = accessTokenData.token_type+" "+accessTokenData.access_token;
                        $mob.ext.ssdk_callHTTPApi(self.type(), null, "https://api.line.me/v2/profile", "POST", null, headers, function (data) {
                            if(data != null)
                            {
                                if(data.status_code === 200){
                                    var profileData = $mob.utils.jsonStringToObject($mob.utils.base64Decode(data.response_data));
                                    credential.uid = profileData.userId;
                                    //user数据
                                    var user = {
                                        "platform_type" : self.type(),
                                        "credential" : credential
                                    };
                                    user.raw_data = profileData;
                                    user.nickname = profileData.displayName;
                                    user.icon = profileData.pictureUrl;
                                    if(profileData.statusMessage != null)
                                    {
                                        user.about_me = profileData.statusMessage;
                                    }
                                    self._setCurrentUser(user, function () {
                                        $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Success, user);
                                    });
                                }
                                else
                                {
                                    error = {
                                        "error_code" : $mob.shareSDK.errorCode.APIRequestFail,
                                        "error_message" : "no profile"
                                    };
                                    $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Fail, error);
                                }
                            }
                            else
                            {
                                error = {
                                    "error_code" : $mob.shareSDK.errorCode.APIRequestFail,
                                    "error_message" : "no profile"
                                };
                                $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Fail, error);
                            }
                        });
                    }
                    else
                    {
                        error = {
                            "error_code" : $mob.shareSDK.errorCode.APIRequestFail,
                            "error_message" : "no accessToken"
                        };
                        $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Fail, error);
                    }
                }
                else
                {
                    error = {
                        "error_code" : $mob.shareSDK.errorCode.APIRequestFail,
                        "error_message" : "no accessToken"
                    };
                    $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Fail, error);
                }
            });
            delete LineOtps[sessionId];
        }
    });
};

/**
 * 处理用户授权回调
 * @param sessionId     授权会话标识
 * @param callbackUrl   回调地址
 */
Line.prototype.handleAuthCallback = function (sessionId, callbackUrl)
{
    var self = this;
    var error_message;
    var error;
    var urlInfo = $mob.utils.parseUrl(callbackUrl);
    if (urlInfo != null && urlInfo.query != null)
    {
        var params = $mob.utils.parseUrlParameters(urlInfo.query);
        if (params != null)
        {
            if(params.code != null)
            {
                self._authorizeCallbackWithOutSDK(sessionId,params.code);
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
 * 检测是否配置URL Scheme
 * @param callback 方法回调
 * @private
 */
Line.prototype._checkUrlScheme = function (callback)
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
            $mob.native.log("[ShareSDK-WARNING] 尚未配置[" + self.name() + "]URL Scheme:" + self._urlScheme);
        }

        if (callback != null)
        {
            callback (hasReady, urlScheme);
        }
    });
};

/**
 * 取消授权
 * @param callback      方法回调，回调方法声明如下:function (stat, data);
 */
Line.prototype.cancelAuthorize = function (callback)
{
    this._setCurrentUser(null, null);
};

/**
 * 获取用户信息
 * @param query         查询信息
 * @param callback      方法回调
 */
Line.prototype.getUserInfo = function (query, callback)
{
    var self = this;
    self._getCurrentUser(function (user) {
        if(user != null)
        {
            if (callback != null)
            {
                callback ($mob.shareSDK.responseState.Success, user);
            }
        }
        else
        {
            if (callback != null)
            {
                var error =
                {
                    "error_code" : $mob.shareSDK.errorCode.UserUnauth,
                    "error_message" : "尚未授权"
                };
                callback ($mob.shareSDK.responseState.Fail, error);
            }
        }
    });
};


/**
 * 获取当前用户信息
 * @param callback  回调方法
 * @private
 */
Line.prototype._getCurrentUser = function (callback)
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
 * 添加好友
 * @param sessionId     会话标识
 * @param user          用户信息
 * @param callback      方法回调，回调方法声明如下:function (stat, data);
 */
Line.prototype.addFriend = function (sessionId, user, callback)
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

    var error =
    {
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
Line.prototype.getFriends = function (cursor, size, callback)
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

    var error =
    {
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
Line.prototype.callApi = function (url, method, params, headers, callback)
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

    var error =
    {
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
Line.prototype.createUserByRawData = function (rawData)
{
    return null;
};

/**
 * 分享内容
 * @param sessionId         会话ID
 * @param parameters        分享参数
 * @param callback          方法回调，回调方法声明如下:function (state, data, user, userData);
 */
Line.prototype.share = function (sessionId, parameters, callback)
{
    var text = null;
    var image = null;
    var error = null;
    var self = this;
    var error_message;

    //获取分享统计标识
    var flags = parameters != null ? parameters ["@flags"] : null;
    var userData =
    {
        "@flags" : flags
    };

    var type = $mob.shareSDK.getShareParam(this.type(), parameters, "type");
    if (type == null)
    {
        type = $mob.shareSDK.contentType.Auto;
    }
    if (type === $mob.shareSDK.contentType.Auto)
    {
        type = this._getShareType(parameters);
    }

    $mob.ext.isPluginRegisted("com.mob.sharesdk.connector.line", function (data)
    {
        if (data.result)
        {
            //检测是否已经安装客户端
            $mob.ext.canOpenURL("line://", function (data)
            {
                if (data.result)
                {
                    switch (type)
                    {
                        case $mob.shareSDK.contentType.Text:

                            text = $mob.shareSDK.getShareParam(self.type(), parameters, "text");
                            self._convertUrl([text], function (data)
                            {
                                text = data.result[0];

                                $mob.ext.ssdk_lineShareText($mob.utils.urlEncode(text), function (data)
                                {
                                    var resultData = data.result;
                                    if (data.state === $mob.shareSDK.responseState.Success)
                                    {
                                        resultData = {};
                                        resultData["raw_data"] = data.result;
                                        resultData["text"] = text;
                                    }

                                    if (callback != null)
                                    {
                                        callback (data.state, resultData, null, userData);
                                    }
                                });
                            });

                            break;
                        case $mob.shareSDK.contentType.Image:

                            var images = $mob.shareSDK.getShareParam(self.type(), parameters, "images");
                            if (Object.prototype.toString.apply(images) === '[object Array]')
                            {
                                image = images[0];
                            }

                            if (image != null)
                            {
                                self._getImagePath(image, function (imageUrl)
                                {
                                    $mob.ext.ssdk_lineShareImage(image, function (data)
                                    {
                                        var resultData = data.result;
                                        if (data.state === $mob.shareSDK.responseState.Success)
                                        {
                                            resultData = {};
                                            resultData["raw_data"] = data.result;
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
                }
                else
                {
                    error_message = null;
 
                    if(this._currentLanguage === "zh-Hans")
                    {
                        error_message = "分享平台［" + self.name() + "］尚未安装客户端，不支持分享!";
                    }
                    else
                    {
                        error_message = "Platform［" + self.name() + "］app client is not installed!";
                    }

                    error = {
                        "error_code" : $mob.shareSDK.errorCode.NotYetInstallClient,
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
            error_message = null;
                              
            if(this._currentLanguage === "zh-Hans")
            {
                error_message = "平台[" + self.name() + "]需要依靠LineConnector.framework进行分享，请先导入LineConnector.framework后再试!";
            }
            else
            {
                error_message = "Platform [" + self.name() + "] depends on LineConnector.framework，please import LineConnector.framework then try again!";
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
    });
};

/**
 * 获取图片路径
 * @param url           图片路径
 * @param callback      回调
 * @private
 */
Line.prototype._getImagePath = function (url, callback)
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
 * 根据分享参数返回分享类型
 * @param parameters            分享参数
 * @private
 */
Line.prototype._getShareType = function (parameters)
{
    var type = $mob.shareSDK.contentType.Text;

    var images = $mob.shareSDK.getShareParam(this.type(), parameters, "images");
    if (Object.prototype.toString.apply(images) === '[object Array]')
    {
        type = $mob.shareSDK.contentType.Image;
    }

    return type;
};

/**
 * 更新回调链接
 * @private
 */
Line.prototype._updateCallbackURLSchemes = function ()
{
    var self = this;
    //先删除之前的回调地址
    this._authUrlScheme = null;

    $mob.ext.getAppConfig(function (data){
        //获取BundleID
        self._urlScheme = "line3rdp." + data.CFBundleIdentifier;
    });
};

/**
 * 转换链接
 * @param contents      内容列表
 * @param callback      回调
 * @private
 */
Line.prototype._convertUrl = function (contents, callback)
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
$mob.shareSDK.registerPlatformClass($mob.shareSDK.platformType.Line, Line);
