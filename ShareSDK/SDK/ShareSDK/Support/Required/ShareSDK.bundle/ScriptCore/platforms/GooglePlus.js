/**
 * Created with JetBrains WebStorm.
 * User: fenghj
 * Date: 15/8/11
 * Time: 下午12:04
 * To change this template use File | Settings | File Templates.
 */
 
var $pluginID = "com.mob.sharesdk.Google+";

/**
 * Google+应用信息键名定义
 * @type {{ApiKey: string, SecretKey: string, RedirectUri: string, ConvertUrl: string}}
 */
var GooglePlusAppInfoKeys = {
    "ClientId"          : "client_id",
    "ClientSecret"      : "client_secret",
    "RedirectUri"       : "redirect_uri",
    "AuthType"          : "auth_type",
    "ConvertUrl"        : "covert_url",
    "Scopes"            : "auth_scopes"
};

/**
 * Google+
 * @param type  平台类型
 * @constructor
 */
function GooglePlus (type)
{
    this._type = type;
    this._appInfo = {};
    this._authScopes = null;
    //设置当前语言环境
    this._currentLanguage = $mob.shareSDK.preferredLanguageLocalize();
    //当前授权用户
    this._currentUser = null;
    //回调链接
    this._callbackURLScheme = null;
    //是否需要分享，如果为true，那么在授权时会主动变为SSO授权方式
    this._needShare = null;
}

/**
 * 获取平台类型
 * @returns {*} 平台类型
 */
GooglePlus.prototype.type = function ()
{
    return this._type;
};

/**
 * 授权状态改变
 * @param sessionId         会话标识
 * @param data              返回数据
 * @private
 */
GooglePlus.prototype.authStateChanged = function (sessionId, data)
{
    $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Cancel, null);
};

/**
 * 获取平台名称
 * @returns {string}    平台名称
 */
GooglePlus.prototype.name = function ()
{
    return "Google+";
};

/**
 * 获取应用标识
 * @returns {*} 应用标识
 */
GooglePlus.prototype.clientId = function ()
{
    if (this._appInfo[GooglePlusAppInfoKeys.ClientId] !== undefined) 
    {
        return this._appInfo[GooglePlusAppInfoKeys.ClientId];
    }

    return null;
};

/**
 * 获取应用Key
 * @returns {*} 应用密钥
 */
GooglePlus.prototype.clientSecret = function ()
{
    if (this._appInfo[GooglePlusAppInfoKeys.ClientSecret] !== undefined) 
    {
        return this._appInfo[GooglePlusAppInfoKeys.ClientSecret];
    }

    return null;
};

/**
 * 获取缓存域名
 * @returns {string}    域名
 */
GooglePlus.prototype.cacheDomain = function ()
{
    return "SSDK-Platform-" + this.type() + "-" + this.clientId();
};

/**
 * 获取是否转换短链
 *
 * @return  true 转换， false 不转换
 */
GooglePlus.prototype.convertUrlEnabled = function ()
{
    if (this._appInfo[GooglePlusAppInfoKeys.ConvertUrl] !== undefined) 
    {
        return this._appInfo[GooglePlusAppInfoKeys.ConvertUrl];
    }

    return $mob.shareSDK.convertUrlEnabled();
};

/**
 * 获取应用密钥
 * @returns {*} 回调地址
 */
GooglePlus.prototype.redirectUri = function ()
{
    if (this._appInfo[GooglePlusAppInfoKeys.RedirectUri] !== undefined) 
    {
        return this._appInfo[GooglePlusAppInfoKeys.RedirectUri];
    }

    return null;
};

/**
 * 设置/获取应用信息
 * @param value 应用信息
 * @returns {*}
 */
GooglePlus.prototype.setAppInfo = function (value)
{
    if (arguments.length === 0) 
    { 
        return this._appInfo;
    }
    else
    {
        this._appInfo = this._checkAppInfoAvailable(value);
        this._authScopes = this._checkAuthScopes(value);
        this._setupApp(this.clientId());
    }
};

/**
 * 保存配置信息
 */
GooglePlus.prototype.saveConfig = function ()
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

            curApps["plat_" + self.type()] = self.clientId();
            $mob.ext.setCacheData("currentApp", curApps, false, domain, null);
        }

    });
};

/**
 * 获取是否支持授权
 * @returns {boolean} true 支持， false 不支持
 */
GooglePlus.prototype.isSupportAuth = function ()
{
    return true;
};

/**
 * 用户授权
 * @param sessionId     授权会话标识
 * @param settings      授权设置
 */
GooglePlus.prototype.authorize = function (sessionId, settings)
{
    var error = null;
    if (this._isAvailable())
    {
        var self = this;

        if (settings == null)
        {
            settings = {};
        }

        if (settings ["scopes"] == null && self._authScopes == null)
        {
            //设置默认权限
            settings ["scopes"] = [
                "https://www.googleapis.com/auth/plus.login",
                "https://www.googleapis.com/auth/plus.me",
                "https://www.googleapis.com/auth/plus.profile.emails.read"
            ];
        }
       
        //只支持网页授权
        self._webAuthorize(sessionId, settings);

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
            error_message = "Platform［" + this.name() + "］Invalid congfiguration!";
        }

        error = {
            "error_code" : $mob.shareSDK.errorCode.InvaildPlatform,
            "error_message" : error_message
        };
        $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Fail, error);
    }

};

/**
 * 处理用户授权回调
 * @param sessionId     授权会话标识
 * @param callbackUrl   回调地址
 */
GooglePlus.prototype.handleAuthCallback = function (sessionId, callbackUrl)
{
    var error = null;
    var error_message;
    var self = this;
    var urlInfo = $mob.utils.parseUrl(callbackUrl);
    if (urlInfo != null && urlInfo.query != null)
    {
        var params = $mob.utils.parseUrlParameters(urlInfo.query);
        if (params != null)
        {
            if (params["error"] == null)
            {
                //获取AccessToken
                var accessTokenParams = {
                    "code" : params["code"],
                    "client_id" : this.clientId(),
                    "client_secret" : this.clientSecret(),
                    "grant_type" : "authorization_code",
                    "redirect_uri" : this.redirectUri()
                };

                $mob.ext.ssdk_callHTTPApi(this.type(), null, "https://accounts.google.com/o/oauth2/token", "POST", accessTokenParams, null, function (data) {

                    if (data != null)
                    {
                        if (data ["error_code"] != null)
                        {
                            //失败
                            $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Fail, data);
                        }
                        else if (data ["status_code"] != null && data ["status_code"] === 200)
                        {
                            var response = $mob.utils.jsonStringToObject($mob.utils.base64Decode(data["response_data"]));
                            if (response.error == null)
                            {
                                var credRawData = response;

                                //验证授权信息并获取用户ID
                                var tokenInfoParams = {
                                    "access_token" : response["access_token"]
                                };

                                $mob.ext.ssdk_callHTTPApi(self.type(), null, "https://www.googleapis.com/oauth2/v1/tokeninfo", "GET", tokenInfoParams, null, function (data) {

                                    if (data != null)
                                    {
                                        if (data ["error_code"] != null)
                                        {
                                            //失败
                                            $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Fail, data);
                                        }
                                        else if (data ["status_code"] != null && data ["status_code"] === 200)
                                        {
                                            var response = $mob.utils.jsonStringToObject($mob.utils.base64Decode(data["response_data"]));
                                            if (response.error == null)
                                            {
                                                credRawData["uid"] = response["user_id"];
                                                self._succeedAuthorize(sessionId, credRawData);
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
                                                "error_code" : $mob.shareSDK.errorCode.APIRequestFail,
                                                "user_data" : data
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
                                "error_code" : $mob.shareSDK.errorCode.APIRequestFail,
                                "user_data" : data
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
            }
            else
            {
                //失败
                error = {
                    "error_code" : $mob.shareSDK.errorCode.APIRequestFail,
                    "user_data" : params
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
    
    //恢复userAgent
    $mob.native.ssdk_plugin_googleplus_restoreUserAgent();
};


/**
 * 取消授权
 */
GooglePlus.prototype.cancelAuthorize = function ()
{

    this._setCurrentUser(null, null);
    $mob.ext.isPluginRegisted("com.mob.sharesdk.connector.googleplus", function (data) {
                              
        if (data.result)
        {
            $mob.native.ssdk_plugin_googleplus_cancelAuth();
        }
    });

};

/**
 * 添加好友
 * @param sessionId     会话标识
 * @param user          用户信息
 * @param callback      方法回调，回调方法声明如下:function (stat, data);
 */
GooglePlus.prototype.addFriend = function (sessionId, user, callback)
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
GooglePlus.prototype.getFriends = function (cursor, size, callback)
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
GooglePlus.prototype.share = function (sessionId, parameters, callback)
{
    var text = null;
    var url = null;
    var self = this;
    var error;
    var error_message;

    //获取分享统计标识
    var flags = parameters != null ? parameters ["@flags"] : null;
    var userData = {
        "@flags" : flags
    };

    //先判断是否使用客户端分享
    var type = $mob.shareSDK.getShareParam(this.type(), parameters, "type");
    if (type == null)
    {
        type = $mob.shareSDK.contentType.Auto;
    }
    if (type === $mob.shareSDK.contentType.Auto)
    {
        type = this._getShareType(parameters);
    }

    this._getCurrentUser(function (user){

        switch (type)
        {
            case $mob.shareSDK.contentType.Text:
            {
                text = $mob.shareSDK.getShareParam(self.type(), parameters, "text");
                if (text != null)
                {
                    self._convertUrl([text], function(data) {

                        text = data.result[0];
                                     
                        //修改userAgent
                        $mob.native.ssdk_plugin_googleplus_modifyUserAgent("share");
 
                        $mob.ext.ssdk_googleplusShareText(text, function(data) {

                            //恢复userAgent
                            $mob.native.ssdk_plugin_googleplus_restoreUserAgent();
                            self._shareHandler(data, callback, null, userData, {"text" : text});

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
            case $mob.shareSDK.contentType.WebPage:
            {
                url =  $mob.shareSDK.getShareParam(self.type(), parameters, "url");
                if (url != null)
                {
                    text = $mob.shareSDK.getShareParam(self.type(), parameters, "text");

                    self._convertUrl([text, url], function(data) {

                        text = data.result[0];
                        url = data.result[1];
                                     
                        //修改userAgent
                        $mob.native.ssdk_plugin_googleplus_modifyUserAgent("share");
                        $mob.ext.ssdk_googleplusShareWebPage(text, url, function(data){
                                  
                            //恢复userAgent
                            $mob.native.ssdk_plugin_googleplus_restoreUserAgent();
                            self._shareHandler(data, callback, null, userData, {"text" : text, "url" : url});
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
 * 获取用户信息
 * @param query         查询信息
 * @param callback      方法回调
 */
GooglePlus.prototype.getUserInfo = function (query, callback)
{
    var self = this;

    this._getCurrentUser(function(user) {

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

        var url = "https://www.googleapis.com/plus/v1/people/";
        if (user != null && user.credential != null)
        {
            url += user.credential.uid;
        }

        self.callApi(url, "GET", null, null, function (state, data) {

            var resultData = data;
            if (state === $mob.shareSDK.responseState.Success)
            {
                //转换用户数据
                resultData = {
                    "platform_type" : self.type()
                };
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
 * 调用API接口
 * @param url           接口URL
 * @param method        请求方式
 * @param params        请求参数
 * @param headers       请求头
 * @param callback      方法回调, 回调方法声明如下:function (state, data);
 */
GooglePlus.prototype.callApi = function (url, method, params, headers, callback)
{
    //获取当前用户信息
    var error = null;
    var self = this;
    this._getCurrentUser(function (user){

        if (user != null && self._isUserAvaliable(user))
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
                    if (data ["error_code"] != null)
                    {
                        //失败
                        if (callback)
                        {
                            callback ($mob.shareSDK.responseState.Fail, data);
                        }
                    }
                    else
                    {
                        var response = $mob.utils.jsonStringToObject($mob.utils.base64Decode(data["response_data"]));
                        if (data ["status_code"] === 200)
                        {
                            if (response["error"] == null)
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

                            error = {
                                "error_code" : $mob.shareSDK.errorCode.APIRequestFail,
                                "user_data" : response
                            };
                            if (callback)
                            {
                                callback ($mob.shareSDK.responseState.Fail, error);
                            }
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
 * 创建用户信息
 * @param rawData       原始用户数据
 * @returns {null}      用户数据
 */
GooglePlus.prototype.createUserByRawData = function (rawData)
{
    //转换用户数据
    var user = {
        "platform_type" : this.type()
    };
    this._updateUserInfo(user, rawData);
    return $mob.utils.objectToJsonString(user);
};

/**
 * 转换链接
 * @param contents      内容列表
 * @param callback      回调
 * @private
 */
GooglePlus.prototype._convertUrl = function (contents, callback)
{
    if (this.convertUrlEnabled())
    {
        var self = this;
        this._getCurrentUser(function(user){

            $mob.shareSDK.convertUrl(self.type(), user, contents, callback);

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
GooglePlus.prototype._getImagePath = function (url, callback)
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
GooglePlus.prototype._getShareType = function (parameters)
{
    var type = $mob.shareSDK.contentType.Text;

    var images = $mob.shareSDK.getShareParam(this.type(), parameters, "images");
    var url = $mob.shareSDK.getShareParam(this.type(), parameters, "url");
    var deepLinkId = $mob.shareSDK.getShareParam(this.type(), parameters, "deep_link_id");

    if (url != null || deepLinkId != null)
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
 * 初始化应用
 * @param clientId     应用标识
 * @private
 */
GooglePlus.prototype._setupApp = function (clientId)
{
    if (clientId != null)
    {
        $mob.ext.isPluginRegisted("com.mob.sharesdk.connector.googleplus", function (data) {

            if (data.result)
            {
                //$mob.native.ssdk_plugin_googleplus_setup(clientId);
            }
        });
    }
};

/**
 * 授权成功
 * @param sessionId             会话ID
 * @param credentialRawData     授权凭证原始数据
 * @private
 */
GooglePlus.prototype._succeedAuthorize = function (sessionId, credentialRawData)
{
    var self = this;

    //成功
    var credential = {
        "uid"       : credentialRawData["uid"],
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
                data["credential"] = user["credential"];
                user = data;

                //重新设置当前用户
                self._setCurrentUser(user, null);
            }

            $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Success, user);

        });

    });
};

/**
 * 更新用户信息
 * @param user      用户信息
 * @param rawData   原始数据
 * @private
 */
GooglePlus.prototype._updateUserInfo = function (user, rawData)
{
    if (user != null && rawData != null)
    {
        user["raw_data"] = rawData;
        user["uid"] = rawData ["id"];
        user["nickname"] = rawData["displayName"];
        user["gender"] = 2;

        if (rawData["image"] != null)
        {
            user["icon"] = rawData["image"]["url"];
        }

        user["url"] = rawData["url"];
        user["about_me"] = rawData["aboutMe"];
        user["verify_type"] = rawData["verified"] ? 1 : 0;


        //生日
        var birthday = rawData["birthday"];
        var exp = /^(\d+)-(\d+)-(\d+)$/;
        var res = null;
        var date = null;
        if (birthday != null && exp.test(birthday))
        {
            res = exp.exec(birthday);
            date = new Date(res[1], res[2] - 1, res[3], 0, 0, 0);
            user["birthday"] = date.getTime() / 1000;
        }

        var item = null;
        var organizations = rawData["organizations"];
        if (organizations != null)
        {
            //教育信息
            var edus = [];
            var works = [];

            for (var i = 0; i < organizations.length; i++)
            {
                item = {};
                var data = organizations[i];

                if (data["type"] === "school")
                {
                    //教育信息
                    item["school"] = data["name"];
                    item["classes"] = data["department"];

                    edus.push(item);
                }
                else if (data["type"] === "work")
                {
                    //工作信息
                    item["company"] = data["name"];
                    item["dept"] = data["department"];
                    item["position"] = data["title"];

                    works.push(item);
                }
            }


            user["educations"] = edus;
            user["works"] = works;
        }
    }
};

/**
 * 获取当前用户信息
 * @param callback  回调方法
 * @private
 */
GooglePlus.prototype._getCurrentUser = function (callback)
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
 * 设置当前用户信息
 * @param user      用户信息
 * @param callback  回调方法
 * @private
 */
GooglePlus.prototype._setCurrentUser = function (user, callback)
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
 * 网页授权
 * @param sessionId     会话标识
 * @param settings      授权设置
 * @private
 */
GooglePlus.prototype._webAuthorize = function (sessionId, settings)
{
    var authUrl = "https://accounts.google.com/o/oauth2/auth?client_id=" + this.clientId() + "&response_type=code&redirect_uri=" + $mob.utils.urlEncode(this.redirectUri()) +
        "&state=" + new Date().getTime() + "&request_visible_actions=" + $mob.utils.urlEncode("http://schemas.google.com/AddActivity");

    if (settings != null && settings ["scopes"] != null && Object.prototype.toString.apply(settings ["scopes"]) === '[object Array]')
    {
        authUrl += "&scope=" + $mob.utils.urlEncode(settings ["scopes"].join(" "));
    }
    else if (this._authScopes != null)
    {
        var scopesStr = this._authScopes;
        scopesStr = scopesStr.replace(/,/g," ");
        authUrl += "&scope=" + $mob.utils.urlEncode(scopesStr);
    }

    //修改userAgent
    $mob.native.ssdk_plugin_googleplus_modifyUserAgent("auth");
    //打开授权
    $mob.native.ssdk_openAuthUrl(sessionId, authUrl, this.redirectUri());
};

/**
 * 检测应用是否有效
 * @returns {boolean}   true 有效 false 无效
 * @private
 */
GooglePlus.prototype._isAvailable = function ()
{
    if (this.clientId() != null && this.redirectUri() != null)
    {
        return true;
    }

    $mob.native.log("[ShareSDK-WARNING] [" + this.name() + "]应用信息有误，不能进行相关操作。请检查本地代码中和服务端的[" + this.name() + "]平台应用配置是否有误! " +
        "\n配置:" + $mob.utils.objectToJsonString(this._appInfo));

    return false;
};

/**
 * 用户是否有效
 * @param user      用户信息
 * @returns {boolean}   如果授权凭证过期或者不存在则返回false，否则返回true
 * @private
 */
GooglePlus.prototype._isUserAvaliable = function (user)
{
    return user.credential != null && user.credential.uid != null && user.credential.token != null && user.credential.expired > new Date().getTime();
};

/**
 * 分享处理
 * @param data              返回数据
 * @param callback          返回回调
 * @param user              用户
 * @param userData          自定义数据
 * @param shareParams       分享参数
 * @private
 */
GooglePlus.prototype._shareHandler = function (data, callback, user, userData, shareParams)
{
    var resultData = data.result;
    switch (data.state)
    {
        case $mob.shareSDK.responseState.Success:
        {
            //成功
            resultData = {};
            resultData["raw_data"] = shareParams;
            resultData["text"] = shareParams["text"];
            resultData["images"] = [shareParams["image"]];
            resultData["urls"] = [shareParams["url"]];
            break;
        }
        case $mob.shareSDK.responseState.Fail:
        {
            this._needShare = (resultData["error_code"] === $mob.shareSDK.errorCode.UserUnauth);
            break;
        }
    }

    if (callback != null)
    {
        callback (data.state, resultData, user, userData);
    }
};

/**
 * 检测应用信息中的授权信息
 * @param appInfo   应用信息
 * @private
 */
GooglePlus.prototype._checkAuthScopes = function (appInfo)
{
    return appInfo [GooglePlusAppInfoKeys.Scopes];
};

/**
 * 检测应用信息有效性
 * @param appInfo   应用信息
 * @private
 */
GooglePlus.prototype._checkAppInfoAvailable = function (appInfo)
{
    //过滤
    var clientId = $mob.utils.trim(appInfo [GooglePlusAppInfoKeys.ClientId]);
    var clientSecret = $mob.utils.trim(appInfo [GooglePlusAppInfoKeys.ClientSecret]);
    var redirectUri = $mob.utils.trim(appInfo [GooglePlusAppInfoKeys.RedirectUri]);

    if (clientId != null)
    {
        appInfo [GooglePlusAppInfoKeys.ClientId] = clientId;
    }
    else
    {
        appInfo [GooglePlusAppInfoKeys.ClientId] = this.clientId();
    }

    if (clientSecret != null)
    {
        appInfo [GooglePlusAppInfoKeys.ClientSecret] = clientSecret;
    }
    else
    {
        appInfo [GooglePlusAppInfoKeys.ClientSecret] = this.clientSecret(); 
    }

    if (redirectUri != null)
    {
        appInfo [GooglePlusAppInfoKeys.RedirectUri] = redirectUri;
    }
    else
    {
        appInfo [GooglePlusAppInfoKeys.RedirectUri] = this.redirectUri();        
    }
    
    return appInfo;
};

//注册平台
$mob.shareSDK.registerPlatformClass($mob.shareSDK.platformType.GooglePlus, GooglePlus);
