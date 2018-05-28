/**
 * Created with JetBrains WebStorm.
 * User: fenghj
 * Date: 15/9/2
 * Time: 上午11:03
 * To change this template use File | Settings | File Templates.
 */

var $pluginID = "com.mob.sharesdk.Tumblr";

/**
 * Tumblr应用信息键名定义
 * @type {{AppKey: string, AppSecret: string, RedirectUri: string}}
 */
var TumblrAppInfoKeys = {
    "ConsumerKey"       : "consumer_key",
    "ConsumerSecret"    : "consumer_secret",
    "CallbackUrl"       : "callback_url",
    "ConvertUrl"        : "covert_url"
};

/**
 * Tumblr
 * @param type  平台类型
 * @constructor
 */
function Tumblr (type)
{
    this._oauthToken = null;
    this._oauthTokenSecret = null;
    this._type = type;
    this._appInfo = {};

    //当前授权用户
    this._currentUser = null;
    this._callbackUrlScheme = null;
    //设置当前语言环境
    this._currentLanguage = $mob.shareSDK.preferredLanguageLocalize();
}

/**
 * 获取平台类型
 * @returns {*} 平台类型
 */
Tumblr.prototype.type = function ()
{
    return this._type;
};

/**
 * 获取平台名称
 * @returns {string}    平台名称
 */
Tumblr.prototype.name = function ()
{
    return "Tumblr";
};

/**
 * 获取应用标识
 * @returns {*} 应用标识
 */
Tumblr.prototype.consumerKey = function ()
{
    if (this._appInfo[TumblrAppInfoKeys.ConsumerKey] !== undefined) 
    {
        return this._appInfo[TumblrAppInfoKeys.ConsumerKey];
    }

    return null;
};

/**
 * 获取应用密钥
 * @returns {*} 应用密钥
 */
Tumblr.prototype.consumerSecret = function ()
{
    if (this._appInfo[TumblrAppInfoKeys.ConsumerSecret] !== undefined) 
    {
        return this._appInfo[TumblrAppInfoKeys.ConsumerSecret];
    }

    return null;
};

/**
 * 获取回调地址
 * @returns {*} 回调地址
 */
Tumblr.prototype.callbackUrl = function ()
{
    if (this._appInfo[TumblrAppInfoKeys.CallbackUrl] !== undefined) 
    {
        return this._appInfo[TumblrAppInfoKeys.CallbackUrl];
    }

    return null;
};

/**
 * 获取缓存域名
 * @returns {string}    域名
 */
Tumblr.prototype.cacheDomain = function ()
{
    return "SSDK-Platform-" + this.type() + "-" + this.consumerKey();
};

/**
 * 获取授权方式
 *
 * @return  web 网页授权方式，sso 单点登录授权方式，both 两者共同使用，优先使用SSO
 */
Tumblr.prototype.convertUrlEnabled = function ()
{
    if (this._appInfo[TumblrAppInfoKeys.ConvertUrl] !== undefined) 
    {
        return this._appInfo[TumblrAppInfoKeys.ConvertUrl];
    }

    return $mob.shareSDK.convertUrlEnabled();
};

/**
 * 设置/获取应用信息
 * @param value 应用信息
 * @returns {*}
 */
Tumblr.prototype.setAppInfo = function (value)
{
    if (arguments.length === 0) 
    { 
        return this._appInfo;
    }
    else
    {
        this._appInfo = this._checkAppInfoAvailable(value);
        this._updateCallbackURLScheme();
    }
};

/**
 * 保存配置信息
 */
Tumblr.prototype.saveConfig = function ()
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
Tumblr.prototype.setCurrentLanguage = function (value)
{
    this._currentLanguage = value;
};

/**
 * 获取是否支持授权
 * @returns {boolean} true 支持， false 不支持
 */
Tumblr.prototype.isSupportAuth = function ()
{
    return true;
};

/**
 * 用户授权
 * @param sessionId     授权会话标识
 * @param settings      授权设置
 */
Tumblr.prototype.authorize = function (sessionId, settings)
{
    var error = null;
    var self = this;
    if (this._isAvailable())
    {
        //检测是否设置UrlScheme
        this._checkUrlScheme(function (hasReady, urlScheme) {

            if (hasReady)
            {
                //进行授权
                //先获取OAuth Token
                var url = "https://www.tumblr.com/oauth/request_token";
                var oauthParams = {
                    "oauth_consumer_key" : self.consumerKey(),
                    "oauth_signature_method" : "HMAC-SHA1",
                    "oauth_timestamp" : parseInt(new Date().getTime() / 1000).toString(),
                    "oauth_nonce" : parseInt(Math.random() * 100000).toString(),
                    "oauth_version" : "1.0",
                    "oauth_callback" : self._callbackUrlScheme + "://tumblr-authorize"
                };

                $mob.ext.ssdk_callOAuthApi(self.type(), null, url, "GET", null, null, oauthParams, self.consumerSecret(), null, function (data) {

                    if (data != null)
                    {
                        if (data ["error_code"] != null)
                        {
                            //失败
                            $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Fail, error);
                        }
                        else
                        {
                            var responseStr = $mob.utils.base64Decode(data["response_data"]);
                            if (data ["status_code"] === 200 && responseStr != null)
                            {
                                var response = $mob.utils.parseUrlParameters (responseStr);
                                self._oauthToken = response ["oauth_token"];
                                self._oauthTokenSecret = response ["oauth_token_secret"];

                                var authUrl = "https://www.tumblr.com/oauth/authorize?oauth_token=" + $mob.utils.urlEncode(self._oauthToken);
                                $mob.native.openURL(authUrl);
                            }
                            else
                            {
                                error = {
                                    "error_code" : $mob.shareSDK.errorCode.APIRequestFail,
                                    "user_data" : responseStr
                                };
                                $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Fail, error);
                            }
                        }
                    }
                    else
                    {
                        var error_message = null;

                        if(this._currentLanguage === "zh-Hans")
                        {
                            error_message = "分享平台[" + self.name() + "]请求授权失败!";
                        }
                        else
                        {
                            error_message = "Platform [" + self.name() + "] authorize request fail!";
                        }

                        error = {
                            "error_code" : $mob.shareSDK.errorCode.APIRequestFail,
                            "error_message" : error_message
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
                    error_message = "分享平台［" + self.name() + "］尚未配置URL Scheme:" + self._callbackUrlScheme + ", 无法进行SSO授权!";
                }
                else
                {
                    error_message = "Platform［" + self.name() + "］did not set URL Scheme:" + self._callbackUrlScheme + ",unable to authorize by SSO!";
                }

                error = {
                    "error_code" : $mob.shareSDK.errorCode.UnsetURLScheme,
                    "error_message" : error_message
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
 * 处理SSO授权回调
 * @param sessionId     会话ID
 * @param callbackUrl   回调URL
 * @param sourceApplication     原始应用名称
 * @param annotation            附加数据
 */
Tumblr.prototype.handleSSOCallback = function (sessionId, callbackUrl, sourceApplication, annotation)
{
    var self = this;
    var error = null;
    var error_message;
    if (callbackUrl.toLowerCase().indexOf(this._callbackUrlScheme.toLowerCase() + "://") === 0)
    {
        //处理回调
        var urlObj = $mob.utils.parseUrl(callbackUrl);
        if (urlObj != null)
        {
            var params = $mob.utils.parseUrlParameters(urlObj.query);
            if (params != null)
            {
                self._oauthToken = params ["oauth_token"];
                var oauthParams = {
                    "oauth_token" : self._oauthToken,
                    "oauth_consumer_key" : self.consumerKey(),
                    "oauth_signature_method" : "HMAC-SHA1",
                    "oauth_timestamp" : parseInt(new Date().getTime() / 1000).toString(),
                    "oauth_nonce" : parseInt(Math.random() * 100000).toString(),
                    "oauth_version" : "1.0",
                    "oauth_verifier" : params ["oauth_verifier"]
                };

                $mob.ext.ssdk_callOAuthApi(self.type(), null, "https://www.tumblr.com/oauth/access_token", "POST", null, null, oauthParams, self.consumerSecret(), self._oauthTokenSecret, function (data) {

                    if (data != null)
                    {
                        if (data ["error_code"] != null)
                        {
                            //失败
                            $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Fail, error);
                        }
                        else
                        {
                            var responseStr = $mob.utils.base64Decode(data["response_data"]);
                            if (data ["status_code"] === 200 && responseStr != null)
                            {
                                var response = $mob.utils.parseUrlParameters (responseStr);
                                self._succeedAuthorize(sessionId, response);
                            }
                            else
                            {
                                error = {
                                    "error_code" : $mob.shareSDK.errorCode.APIRequestFail,
                                    "user_data" : responseStr
                                };
                                $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Fail, error);
                            }
                        }
                    }
                    else
                    {
                        error_message = null;

                        if(this._currentLanguage === "zh-Hans")
                        {
                            error_message = "分享平台[" + self.name() + "]请求授权失败!";
                        }
                        else
                        {
                            error_message = "Platform [" + self.name() + "] authorize request fail!";
                        }

                        error = {
                            "error_code" : $mob.shareSDK.errorCode.APIRequestFail,
                            "error_message" : error_message
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

        return true;
    }

    return false;
};

/**
 * 获取用户信息
 * @param query         查询信息
 * @param callback      方法回调
 */
Tumblr.prototype.getUserInfo = function (query, callback)
{
    var self = this;
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

    this._getCurrentUser(function (user) {

        //获取授权用户个人信息
        var url = "https://api.tumblr.com/v2/user/info";
        self.callApi(url, "GET", null, null, function (state, data) {

            var resultData = data;
            if (state === $mob.shareSDK.responseState.Success)
            {
                //转换用户数据
                resultData = {"platform_type" : self.type()};
                self._updateUserInfo(resultData, data["user"]);

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
Tumblr.prototype.callApi = function (url, method, params, headers, callback)
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

            var oauthParams = {};
            var oauthTokenSecret = null;
            //将授权用户的授权令牌作为参数进行HTTP请求
            if (user.credential != null)
            {
                oauthParams = {
                    "oauth_consumer_key" : self.consumerKey(),
                    "oauth_token" : user.credential.token,
                    "oauth_signature_method" : "HMAC-SHA1",
                    "oauth_timestamp" : parseInt(new Date().getTime() / 1000).toString(),
                    "oauth_nonce" : parseInt(Math.random() * 100000).toString(),
                    "oauth_version" : "1.0"
                };

                oauthTokenSecret = user.credential.secret;
            }

            $mob.ext.ssdk_callOAuthApi(self.type(), null, url, method, params, headers, oauthParams, self.consumerSecret(), oauthTokenSecret, function (data) {

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
                        if (response != null && response["meta"] != null && (response["meta"]["msg"] === "OK" || response["meta"]["msg"] === "Created"))
                        {
                            //成功
                            if (callback)
                            {
                                callback ($mob.shareSDK.responseState.Success, response["response"]);
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
 * 取消授权
 */
Tumblr.prototype.cancelAuthorize = function ()
{
    this._setCurrentUser(null, null);
};

/**
 * 添加好友
 * @param sessionId     会话标识
 * @param user          用户信息
 * @param callback      方法回调，回调方法声明如下:function (stat, data);
 */
Tumblr.prototype.addFriend = function (sessionId, user, callback)
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
Tumblr.prototype.getFriends = function (cursor, size, callback)
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
Tumblr.prototype.share = function (sessionId, parameters, callback)
{
    //获取分享统计标识
    var self = this;
    var text = null;
    var title = null;
    var image = null;
    var url = null;
    var blogName = null;

    //获取分享统计标识
    var flags = parameters != null ? parameters ["@flags"] : null;
    var userData = {
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

    this._getCurrentUser(function (user) {

        blogName = $mob.shareSDK.getShareParam(self.type(), parameters, "blog_name");
        if (blogName == null && user != null && user.credential != null && user.credential["raw_data"] != null)
        {
            blogName = user.credential["raw_data"]["primary_blog"];
        }

        switch (type)
        {
            case $mob.shareSDK.contentType.Text:
            {
                text = $mob.shareSDK.getShareParam(self.type(), parameters, "text");
                title = $mob.shareSDK.getShareParam(self.type(), parameters, "title");

                self._convertUrl([text], function (data) {

                    text = data.result[0];

                    var params = {
                        "type" : "text",
                        "body" : text
                    };

                    if (title != null)
                    {
                        params["title"] = title;
                    }

                    self.callApi("https://api.tumblr.com/v2/blog/" + blogName + ".tumblr.com/post", "POST", params, null, function (state, data) {

                        var resultData = data;
                        if (state === $mob.shareSDK.responseState.Success)
                        {
                            //转换数据
                            if (data != null)
                            {
                                resultData = {};
                                resultData["raw_data"] = data;
                                resultData["cid"] = data["id"];
                                resultData["text"] = text;

                                if (title != null)
                                {
                                    resultData["raw_data"]["title"] = title;
                                }
                            }
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
                var images = $mob.shareSDK.getShareParam(self.type(), parameters, "images");
                if (Object.prototype.toString.apply(images) === '[object Array]')
                {
                    image = images[0];
                }
                title = $mob.shareSDK.getShareParam(self.type(), parameters, "title");
                url = $mob.shareSDK.getShareParam(self.type(), parameters, "url");

                self._convertUrl([url], function (data) {

                    url = data.result[0];

                    var params = {
                        "type" : "photo"
                    };

                    if (!/^(file\:\/)?\//.test(image))
                    {
                        //网络图片
                        params["source"] = image;
                    }
                    else
                    {
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

                        params["data"] = "@file(" + $mob.utils.objectToJsonString(file) + ")";
                    }

                    if (title != null)
                    {
                        params["caption"] = title;
                    }

                    if (url != null)
                    {
                        params["link"] = url;
                    }


                    self.callApi("https://api.tumblr.com/v2/blog/" + blogName + ".tumblr.com/post", "POST", params, null, function (state, data) {

                        var resultData = data;
                        if (state === $mob.shareSDK.responseState.Success)
                        {
                            //转换数据
                            if (data != null)
                            {
                                resultData = {};
                                resultData["raw_data"] = data;
                                resultData["cid"] = data["id"];
                                resultData["text"] = text;
                                resultData["images"] = [image];
                                if (url != null)
                                {
                                    resultData["urls"] = [url];
                                }


                                if (title != null)
                                {
                                    resultData["raw_data"]["title"] = title;
                                }
                            }
                        }

                        if (callback != null)
                        {
                            callback (state, resultData, user, userData);
                        }

                    });
                });

                break;
            }
            default :
            {
                var error_message = null;
            
                if(this._currentLanguage === "zh-Hans")
                {
                    error_message = "不支持的分享类型[" + type + "]";
                }
                else
                {
                    error_message = "unsupported share type [" + type + "]";
                }

                var error = {
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
 * 根据分享参数返回分享类型
 * @param parameters            分享参数
 * @private
 */
Tumblr.prototype._getShareType = function (parameters)
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
 * 授权成功
 * @param sessionId             会话ID
 * @param credentialRawData     授权凭证原始数据
 * @private
 */
Tumblr.prototype._succeedAuthorize = function (sessionId, credentialRawData)
{
    var self = this;

    //成功
    var credential = {
        "token"     : credentialRawData["oauth_token"],
        "secret"    : credentialRawData["oauth_token_secret"],
        "raw_data"  : credentialRawData,
        "type"      : $mob.shareSDK.credentialType.OAuth1x
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
                user.credential["uid"] = user["uid"];

                //获取主博客名称
                var primaryBlog = null;
                var blogs = user["raw_data"]["blogs"];
                if (blogs != null)
                {
                    for (var i = 0; i < blogs.length; i++)
                    {
                        var item = blogs[i];
                        if (item["primary"])
                        {
                            primaryBlog = item["name"];
                            break;
                        }
                    }
                }
                user.credential["raw_data"]["primary_blog"] = primaryBlog;

                //重新设置当前用户
                self._setCurrentUser(user, null);
            }

            $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Success, user);

        });

    });
};

/**
 * 获取当前用户信息
 * @param callback  回调方法
 * @private
 */
Tumblr.prototype._getCurrentUser = function (callback)
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
Tumblr.prototype._setCurrentUser = function (user, callback)
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
 * 更新用户信息
 * @param user      用户信息
 * @param rawData   原始数据
 * @private
 */
Tumblr.prototype._updateUserInfo = function (user, rawData)
{
    if (user != null && rawData != null)
    {
        user["raw_data"] = rawData;
        user["uid"] = rawData ["name"];
        user["nickname"] = rawData["name"];

        //性别
        user["gender"] = 2;

        //微博地址
        var blogs = rawData["blogs"];
        if (blogs != null)
        {
            for (var i = 0; i < blogs.length; i++)
            {
                var item = blogs[i];
                if (item["primary"])
                {
                    user["url"] = item["url"];
                    user["share_count"] = item["posts"];
                    break;
                }
            }
        }
        user["follower_count"] = rawData["following"];
    }
};

/**
 * 检测是否配置URL Scheme
 * @param callback 方法回调
 * @private
 */
Tumblr.prototype._checkUrlScheme = function (callback)
{
    var self = this;
    $mob.ext.getAppConfig(function (data){

        var urlScheme = null;
        var warningLog = "";
        var hasReady = false;

        var callbackScheme = self._callbackUrlScheme;

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
            $mob.native.log("[ShareSDK-WARNING] 尚未配置[" + self.name() + "]URL Scheme:" + warningLog + ", 无法授权。");
        }

        if (callback != null)
        {
            callback (hasReady, urlScheme);
        }

    });
};

/**
 * 更新回调链接
 * @private
 */
Tumblr.prototype._updateCallbackURLScheme = function ()
{
    this._callbackUrlScheme = "tb" + this.consumerKey();
};

/**
 * 检测应用是否有效
 * @returns {boolean}   true 有效 false 无效
 * @private
 */
Tumblr.prototype._isAvailable = function ()
{
    if (this.consumerKey() != null && this.consumerSecret() != null && this.callbackUrl() != null)
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
Tumblr.prototype._checkAppInfoAvailable = function (appInfo)
{
    //对信息进行过滤
    var consumerKey = $mob.utils.trim(appInfo [TumblrAppInfoKeys.ConsumerKey]);
    var consumerSecret = $mob.utils.trim(appInfo [TumblrAppInfoKeys.ConsumerSecret]);
    var callbacUrl = $mob.utils.trim(appInfo [TumblrAppInfoKeys.CallbackUrl]);

    if (consumerKey != null)
    {
        appInfo [TumblrAppInfoKeys.ConsumerKey] = consumerKey;
    }
    else
    {
        appInfo [TumblrAppInfoKeys.ConsumerKey] = this.consumerKey();    
    }

    if (consumerSecret != null)
    {
        appInfo [TumblrAppInfoKeys.ConsumerSecret] = consumerSecret;
    }
    else
    {
        appInfo [TumblrAppInfoKeys.ConsumerSecret] = this.consumerSecret();   
    }

    if (callbacUrl != null)
    {
        appInfo [TumblrAppInfoKeys.CallbackUrl] = callbacUrl;
    }
    else
    {
        appInfo [TumblrAppInfoKeys.CallbackUrl] = this.callbackUrl();  
    }

    return appInfo;
};

/**
 * 转换链接
 * @param contents      内容列表
 * @param callback      回调
 * @private
 */
Tumblr.prototype._convertUrl = function (contents, callback)
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
 * 授权状态改变
 * @param sessionId         会话标识
 * @param data              返回数据
 * @private
 */
Tumblr.prototype.authStateChanged = function (sessionId, data)
{
    $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Cancel, null);
};

//注册平台
$mob.shareSDK.registerPlatformClass($mob.shareSDK.platformType.Tumblr, Tumblr);
