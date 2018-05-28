/**
 * Created with JetBrains WebStorm.
 * User: fenghj
 * Date: 15/8/7
 * Time: 下午3:03
 * To change this template use File | Settings | File Templates.
 */

var $pluginID = "com.mob.sharesdk.Pocket";

/**
 * 开心网应用信息键名定义
 * @type {{ApiKey: string, SecretKey: string, RedirectUri: string, ConvertUrl: string}}
 */
var PocketAppInfoKeys = {
    "ConsumerKey"       : "consumer_key",
    "RedirectUri"       : "redirect_uri",
    "AuthType"          : "auth_type",
    "ConvertUrl"        : "covert_url"
};

/**
 * Pocket
 * @param type  平台类型
 * @constructor
 */
function Pocket (type)
{
    this._type = type;
    this._appInfo = {};

    //当前授权用户
    this._currentUser = null;
    
    //设置当前语言环境
    this._currentLanguage = $mob.shareSDK.preferredLanguageLocalize();
}

/**
 * 获取平台类型
 * @returns {*} 平台类型
 */
Pocket.prototype.type = function ()
{
    return this._type;
};

/**
 * 授权状态改变
 * @param sessionId         会话标识
 * @param data              返回数据
 * @private
 */
Pocket.prototype.authStateChanged = function (sessionId, data)
{
    $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Cancel, null);
};

/**
 * 获取平台名称
 * @returns {string}    平台名称
 */
Pocket.prototype.name = function ()
{
    return "Pocket";
};

/**
 * 获取应用标识
 * @returns {*} 应用标识
 */
Pocket.prototype.consumerKey = function ()
{
    if (this._appInfo[PocketAppInfoKeys.ConsumerKey] !== undefined) 
    {
        return this._appInfo[PocketAppInfoKeys.ConsumerKey];
    }

    return null;
};

/**
 * 获取应用密钥
 * @returns {*} 回调地址
 */
Pocket.prototype.redirectUri = function ()
{
    if (this._appInfo[PocketAppInfoKeys.RedirectUri] !== undefined) 
    {
        return this._appInfo[PocketAppInfoKeys.RedirectUri];
    }

    return null;
};

/**
 * 获取授权方式
 *
 * @return  web 网页授权方式，sso 单点登录授权方式，both 两者共同使用，优先使用SSO
 */
Pocket.prototype.authType = function ()
{
    if (this._appInfo[PocketAppInfoKeys.AuthType] !== undefined) 
    {
        return this._appInfo[PocketAppInfoKeys.AuthType];
    }

    return $mob.shareSDK.authType();
};

/**
 * 获取缓存域名
 * @returns {string}    域名
 */
Pocket.prototype.cacheDomain = function ()
{
    return "SSDK-Platform-" + $mob.shareSDK.platformType.Pocket + "-" + this.consumerKey();
};

/**
 * 获取是否转换短链
 *
 * @return  true 转换， false 不转换
 */
Pocket.prototype.convertUrlEnabled = function ()
{
    if (this._appInfo[PocketAppInfoKeys.ConvertUrl] !== undefined) 
    {
        return this._appInfo[PocketAppInfoKeys.ConvertUrl];
    }

    return $mob.shareSDK.convertUrlEnabled();
};

/**
 * 设置/获取应用信息
 * @param value 应用信息
 * @returns {*}
 */
Pocket.prototype.setAppInfo = function (value)
{
    if (arguments.length === 0) 
    { 
        return this._appInfo;
    }
    else
    {
        this._appInfo = this._checkAppInfoAvailable(value);
    }

};

/**
 * 保存配置信息
 */
Pocket.prototype.saveConfig = function ()
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

            curApps["plat_" + self.type()] = self.consumerKey();
            $mob.ext.setCacheData("currentApp", curApps, false, domain, null);
        }

    });
};

/**
 *  设置当前的系统语言
 *
 *  @param value 语言
 *
 *  @returns {*}
 */
Pocket.prototype.setCurrentLanguage = function (value)
{
    this._currentLanguage = value;
};

/**
 * 获取是否支持授权
 * @returns {boolean} true 支持， false 不支持
 */
Pocket.prototype.isSupportAuth = function ()
{
    return true;
};

/**
 * 用户授权
 * @param sessionId     授权会话标识
 * @param settings      授权设置
 */
Pocket.prototype.authorize = function (sessionId, settings)
{
    var self = this;
    var authType = this.authType();

    var error = null;
    if (this._isAvailable())
    {
        //获取RequestToken
        var redirectUri = this.redirectUri() + ":authorizationFinished";
        var params = {
            "consumer_key" : this.consumerKey(),
            "redirect_uri" : redirectUri
        };
        $mob.ext.ssdk_callHTTPApi(this.type(), null, "https://getpocket.com/v3/oauth/request", "POST", params, null, function (data) {

            if (data != null)
            {
                if (data ["error_code"] != null)
                {
                    //失败
                    $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Fail, data);
                }
                else
                {
                    var response = $mob.utils.base64Decode(data["response_data"]);
                    if (data ["status_code"] === 200)
                    {
                        var params = $mob.utils.parseUrlParameters(response);

                        if (authType === "both" || authType === "sso")
                        {
                            //检测是否支持多任务
                            $mob.ext.isMultitaskingSupported(function (data){
                                if (data.result)
                                {
                                    $mob.ext.canOpenURL("pocket-oauth-v1:///authorize", function (data) {

                                        if (data.result)
                                        {
                                            //检测URL Scheme
                                            self._checkUrlScheme(function (hasReady, urlScheme){

                                                if (hasReady)
                                                {
                                                    //进行SSO授权
                                                    self._ssoAuthorize(sessionId, urlScheme, params["code"], settings);
                                                }
                                                else if (authType === "both")
                                                {
                                                    //进行网页授权
                                                    self._webAuthorize(sessionId, params["code"], settings);
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

                                                    var error = {
                                                        "error_code" : $mob.shareSDK.errorCode.UnsupportFeature,
                                                        "error_message" : error_message
                                                    };
                                                    $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Fail, error);
                                                }

                                            });
                                        }
                                        else if (authType === "both")
                                        {
                                            //进行网页授权
                                            self._webAuthorize(sessionId, params["code"], settings);
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

                                            var error = {
                                                "error_code" : $mob.shareSDK.errorCode.UnsupportFeature,
                                                "error_message" : error_message
                                            };

                                            $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Fail, error);
                                        }
                                    });

                                }
                                else if (authType === "both")
                                {
                                    //进行网页授权
                                    self._webAuthorize(sessionId, params["code"], settings);
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

                                    var error = {
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
                            self._webAuthorize(sessionId, params["code"], settings);
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

                            error = {
                                "error_code" : $mob.shareSDK.errorCode.UnsupportFeature,
                                "error_message" : error_message
                            };
                            $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Fail, error);
                        }

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
Pocket.prototype.handleAuthCallback = function (sessionId, callbackUrl)
{
    var error_message;
    var error = null;
    var reg = /^(.+):(.+)$/;
    if (reg.test(callbackUrl))
    {
        var res = reg.exec(callbackUrl);
        var code = res[2];

        if (code != null)
        {
            this._succeedAuthorize(sessionId, code);
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
Pocket.prototype.handleSSOCallback = function (sessionId, callbackUrl, sourceApplication, annotation)
{
    var error = null;

    if (callbackUrl.indexOf(this.redirectUri() + ":") === 0)
    {
        var reg = /^(.+):(.+)$/;
        if (reg.test(callbackUrl))
        {
            var res = reg.exec(callbackUrl);
            var code = res[2];

            if (code != null)
            {
                this._succeedAuthorize(sessionId, code);
            }
            else
            {
                //授权失败
                error = {
                    "error_code" : $mob.shareSDK.errorCode.InvalidAuthCallback,
                    "user_data" : callbackUrl
                };

                $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Fail, error);
            }
        }
        else
        {
            //授权失败
            error = {
                "error_code" : $mob.shareSDK.errorCode.InvalidAuthCallback,
                "user_data" : callbackUrl
            };

            $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Fail, error);
        }

        return true;
    }

    return false;
};

/**
 * 取消授权
 */
Pocket.prototype.cancelAuthorize = function ()
{
    this._setCurrentUser(null, null);
};

/**
 * 添加好友
 * @param sessionId     会话标识
 * @param user          用户信息
 * @param callback      方法回调，回调方法声明如下:function (stat, data);
 */
Pocket.prototype.addFriend = function (sessionId, user, callback)
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
Pocket.prototype.getFriends = function (cursor, size, callback)
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
Pocket.prototype.share = function (sessionId, parameters, callback)
{
    var url = null;
    var title = null;
    var tags = null;
    var tweetId = null;
    var self = this;
    var error_message;
    var error;

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

    var params = null;
    switch (type)
    {
        case $mob.shareSDK.contentType.WebPage:
        {
            url =  $mob.shareSDK.getShareParam(this.type(), parameters, "url");

            if (url != null)
            {
                title = $mob.shareSDK.getShareParam(this.type(), parameters, "title");
                tags = $mob.shareSDK.getShareParam(this.type(), parameters, "tags");
                tweetId = $mob.shareSDK.getShareParam(this.type(), parameters, "tweet_id");

                params = {
                    "url" : url
                };

                if (title != null)
                {
                    params["title"] = title;
                }
                if (tags != null)
                {
                    params["tags"] = tags.join(",");
                }
                if (tweetId != null)
                {
                    params["tweet_id"] = tweetId;
                }

                self._getCurrentUser(function (user) {

                    self._convertUrl([url], function(data) {

                        params["url"] = data.result[0];
                        self.callApi("https://getpocket.com/v3/add", "POST", params, null, function (state, data) {

                            var resultData = data;
                            if (state === $mob.shareSDK.responseState.Success)
                            {
                                //转换数据
                                if (data != null && data["item"] != null)
                                {
                                    resultData = {};
                                    resultData["raw_data"] = data["item"];
                                    resultData["cid"] = data["item"]["item_id"];

                                    if (data["item"]["normal_url"] != null)
                                    {
                                        resultData["urls"] = [data["item"]["normal_url"]];
                                    }
                                    else
                                    {
                                        resultData["urls"] = [url];
                                    }
                                }
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
};

/**
 * 获取用户信息
 * @param query         查询信息
 * @param callback      方法回调
 */
Pocket.prototype.getUserInfo = function (query, callback)
{
    var self = this;
    var error_message;
    var error;
    this._getCurrentUser(function(user) {

        if (query != null)
        {
            error_message = null;
 
            if(this._currentLanguage === "zh-Hans")
            {
                error_message = "分享平台［" + self.name() + "］不支持获取其他用户资料!";
            }
            else
            {
                error_message = "Platform [" + self.name() + "］do not support getting other's userInfo!";
            }

            error = {
                "error_code" : $mob.shareSDK.errorCode.UnsupportFeature,
                "error_message" : error_message
            };
            if (callback != null)
            {
                callback ($mob.shareSDK.responseState.Fail, error);
            }
        }
        else
        {
            if (user != null)
            {
                //没有获取用户信息接口，直接返回授权用户信息
                if (callback != null)
                {
                    callback ( $mob.shareSDK.responseState.Success, user);
                }
            }
            else
            {
                error_message = null;
 
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
        }
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
Pocket.prototype.callApi = function (url, method, params, headers, callback)
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

            params["consumer_key"] = self.consumerKey();

            //将授权用户的授权令牌作为参数进行HTTP请求
            if (user.credential != null)
            {
                params["access_token"] = user.credential.token;
            }

            headers ["Content-Type"] = "application/json; charset=UTF-8";
            headers ["X-Accept"] = "application/json2";


            $mob.ext.ssdk_callHTTPApi(self.type(), null, url, "POST", {"@body" : params}, headers, function (data) {


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

                        if (data ["status_code"] === 200)
                        {
                            var response = $mob.utils.jsonStringToObject($mob.utils.base64Decode(data["response_data"]));
                            //成功
                            if (callback)
                            {
                                callback ($mob.shareSDK.responseState.Success, response);
                            }
                        }
                        else
                        {

                            error = {
                                "error_code" : $mob.shareSDK.errorCode.APIRequestFail,
                                "user_data" : data["header"]
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
Pocket.prototype.createUserByRawData = function (rawData)
{
    return null;
};

/**
 * 转换链接
 * @param contents      内容列表
 * @param callback      回调
 * @private
 */
Pocket.prototype._convertUrl = function (contents, callback)
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
 * 根据分享参数返回分享类型
 * @param parameters            分享参数
 * @private
 */
Pocket.prototype._getShareType = function (parameters)
{
    return $mob.shareSDK.contentType.WebPage;
};

/**
 * 获取当前用户信息
 * @param callback  回调方法
 * @private
 */
Pocket.prototype._getCurrentUser = function (callback)
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
 * SSO授权
 * @param sessionId     会话标识
 * @param urlScheme     回调URL Scheme
 * @param code          请求标识
 * @param settings      授权设置
 * @private
 */
Pocket.prototype._ssoAuthorize = function (sessionId, urlScheme, code, settings)
{

    $mob.native.openURL("pocket-oauth-v1:///authorize?request_token=" + code + "&redirect_uri=" + $mob.utils.urlEncode(this.redirectUri() + ":" + code));

};

/**
 * 授权成功
 * @param sessionId             会话ID
 * @param code                  请求标识
 * @private
 */
Pocket.prototype._succeedAuthorize = function (sessionId, code)
{
    var self = this;
    var params = {
        "consumer_key" : this.consumerKey(),
        "code" : code
    };
    var error;
    $mob.ext.ssdk_callHTTPApi(this.type(), null, "https://getpocket.com/v3/oauth/authorize", "POST", params, null, function (data) {

        if (data != null)
        {
            if (data ["error_code"] != null)
            {
                //失败
                $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Fail, data);
            }
            else if (data ["status_code"] != null && data ["status_code"] === 200)
            {
                var response = $mob.utils.base64Decode(data["response_data"]);
                if (response != null)
                {
                    //成功
                    var credentialRawData = $mob.utils.parseUrlParameters(response);
                    //成功
                    var credential = {
                        "uid"       : credentialRawData["username"],
                        "token"     : $mob.utils.urlDecode(credentialRawData["access_token"]),
                        "expired"   : (new Date().getTime() +  946080000 * 1000),
                        "raw_data"  : credentialRawData,
                        "type"      : $mob.shareSDK.credentialType.OAuth2
                    };

                    var user = {
                        "platform_type" : self.type(),
                        "credential" : credential,
                        "uid" : credentialRawData["username"],
                        "nickname" : credentialRawData["username"]
                    };

                    //设置当前授权用户
                    self._setCurrentUser(user, function () {

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
};

/**
 * 设置当前用户信息
 * @param user      用户信息
 * @param callback  回调方法
 * @private
 */
Pocket.prototype._setCurrentUser = function (user, callback)
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
 * 检测是否配置URL Scheme
 * @param callback 方法回调
 * @private
 */
Pocket.prototype._checkUrlScheme = function (callback)
{
    var self = this;
    $mob.ext.getAppConfig(function (data){

        var urlScheme = null;
        var warningLog = "";
        var hasReady = false;

        var callbackScheme = self.redirectUri();

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
                        if (schema === callbackScheme)
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
            warningLog = callbackScheme;
        }

        if (!hasReady)
        {
            $mob.native.log("[ShareSDK-WARNING] 尚未配置[" + self.name() + "]URL Scheme:" + warningLog + ", 无法使用SSO授权, 将以Web方式进行授权。");
        }

        if (callback != null)
        {
            callback (hasReady, urlScheme);
        }

    });
};

/**
 * 检测应用是否有效
 * @returns {boolean}   true 有效 false 无效
 * @private
 */
Pocket.prototype._isAvailable = function ()
{
    if (this.consumerKey() != null && this.redirectUri() != null)
    {
        return true;
    }

    $mob.native.log("[ShareSDK-WARNING] [" + this.name() + "]应用信息有误，不能进行相关操作。请检查本地代码中和服务端的[" + this.name() + "]平台应用配置是否有误! " +
        "\n配置:" + $mob.utils.objectToJsonString(this._appInfo));

    return false;
};

/**
 * 检测应用信息有效性
 * @param appInfo   应用信息
 * @private
 */
Pocket.prototype._checkAppInfoAvailable = function (appInfo)
{
    //过滤
    var consumerKey = $mob.utils.trim(appInfo [PocketAppInfoKeys.ConsumerKey]);
    var redirectUri = $mob.utils.trim(appInfo [PocketAppInfoKeys.RedirectUri]);

    if (consumerKey != null)
    {
        appInfo [PocketAppInfoKeys.ConsumerKey] = consumerKey;
    }
    else
    {
        appInfo [PocketAppInfoKeys.ConsumerKey] = this.consumerKey();    
    }

    if (redirectUri != null)
    {
        appInfo [PocketAppInfoKeys.RedirectUri] = redirectUri;
    }
    else
    {
        appInfo [PocketAppInfoKeys.RedirectUri] = this.redirectUri();    
    }
    
    return appInfo;
};

/**
 * 网页授权
 * @param sessionId     会话标识
 * @param code          请求编码
 * @param settings      授权设置
 * @private
 */
Pocket.prototype._webAuthorize = function (sessionId, code, settings)
{
    var authUrl = "https://getpocket.com/auth/authorize?request_token=" + code + "&redirect_uri=" + $mob.utils.urlEncode(this.redirectUri() + ":" + code);

    //打开授权
    $mob.native.ssdk_openAuthUrl(sessionId, authUrl, this.redirectUri());
};


//注册平台
$mob.shareSDK.registerPlatformClass($mob.shareSDK.platformType.Pocket, Pocket);
