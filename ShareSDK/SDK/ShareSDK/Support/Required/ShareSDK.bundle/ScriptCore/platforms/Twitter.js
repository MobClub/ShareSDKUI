/**
 * Created with JetBrains WebStorm.
 * User: fenghj
 * Date: 15/6/9
 * Time: 下午5:44
 * To change this template use File | Settings | File Templates.
 */

var $pluginID = "com.mob.sharesdk.Twitter";

/**
 * 微信应用信息键名定义
 * @type {{AppKey: string, AppSecret: string,}}
 */
var TwitterAppInfoKeys = {
    "ConsumerKey"           : "consumer_key",
    "ConsumerSecret"        : "consumer_secret",
    "RedirectUri"           : "redirect_uri",
    "ConvertUrl"            : "covert_url"
};

var TwitterShareContentSet = {};

/**
 * @param type  平台类型
 * @constructor
 */
function Twitter (type)
{
    this._oauthToken = null;
    this._oauthTokenSecret = null;
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
Twitter.prototype.type = function ()
{
    return this._type;
};

/**
 * 获取平台名称
 * @returns {string}    平台名称
 */
Twitter.prototype.name = function ()
{
    return "Twitter";
};

/**
 * 获取应用标识
 * @returns {*} 应用标识
 */
Twitter.prototype.consumerKey = function ()
{
    if (this._appInfo[TwitterAppInfoKeys.ConsumerKey] !== undefined) 
    {
        return this._appInfo[TwitterAppInfoKeys.ConsumerKey];
    }

    return null;
};

/**
 * 获取应用密钥
 * @returns {*} 应用密钥
 */
Twitter.prototype.consumerSecret = function ()
{
    if (this._appInfo[TwitterAppInfoKeys.ConsumerSecret] !== undefined) 
    {
        return this._appInfo[TwitterAppInfoKeys.ConsumerSecret];
    }

    return null;
};

/**
 * 获取回调地址
 * @returns {*} 回调地址
 */
Twitter.prototype.redirectUri = function ()
{
    if (this._appInfo[TwitterAppInfoKeys.RedirectUri] !== undefined) 
    {
        return this._appInfo[TwitterAppInfoKeys.RedirectUri];
    }

    return null;
};

/**
 * 获取缓存域名
 * @returns {string}    域名
 */
Twitter.prototype.cacheDomain = function ()
{
    return "SSDK-Platform-" + $mob.shareSDK.platformType.Twitter + "-" + this.consumerKey();
};


/**
 * 获取授权方式
 *
 * @return  web 网页授权方式，sso 单点登录授权方式，both 两者共同使用，优先使用SSO
 */
Twitter.prototype.convertUrlEnabled = function ()
{
    if (this._appInfo[TwitterAppInfoKeys.ConvertUrl] !== undefined) 
    {
        return this._appInfo[TwitterAppInfoKeys.ConvertUrl];
    }

    return $mob.shareSDK.convertUrlEnabled();
};

/**
 * 设置/获取应用信息
 * @param value 应用信息
 * @returns {*}
 */
Twitter.prototype.setAppInfo = function (value)
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
Twitter.prototype.saveConfig = function ()
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
 * 获取是否支持授权
 * @returns {boolean} true 支持， false 不支持
 */
Twitter.prototype.isSupportAuth = function ()
{
    return true;
};

/**
 * 用户授权
 * @param sessionId     授权会话标识
 * @param settings      授权设置
 */
Twitter.prototype.authorize = function (sessionId, settings)
{
    var error = null;
    var self = this;
    if (this._isAvailable())
    {
        //先获取OAuth Token
        var url = "https://api.twitter.com/oauth/request_token";
        var oauthParams = {
            "oauth_consumer_key" : this.consumerKey(),
            "oauth_signature_method" : "HMAC-SHA1",
            "oauth_timestamp" : parseInt(new Date().getTime() / 1000).toString(),
            "oauth_nonce" : parseInt(Math.random() * 100000).toString(),
            "oauth_version" : "1.0"
        };

        $mob.ext.ssdk_callOAuthApi(this.type(), null, url, "POST", null, null, oauthParams, this.consumerSecret(), null, function (data) {

            if (data != null)
            {
                if (data ["error_code"] != null)
                {
                    //失败
                    $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Fail, error);
                }
                else
                {
                    var response = $mob.utils.jsonStringToObject($mob.utils.base64Decode(data["response_data"]));
                    if (data ["status_code"] === 200 && response == null)
                    {
                        response = $mob.utils.parseUrlParameters ($mob.utils.base64Decode(data["response_data"]));
                        self._oauthToken = response ["oauth_token"];
                        self._oauthTokenSecret = response ["oauth_token_secret"];

                        var authUrl = "https://api.twitter.com/oauth/authorize?oauth_token=" + self._oauthToken;
                        //打开授权
                        $mob.native.ssdk_openAuthUrl(sessionId, authUrl, self.redirectUri());
                    }
                    else
                    {
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
 * 处理用户授权回调
 * @param sessionId     授权会话标识
 * @param callbackUrl   回调地址
 */
Twitter.prototype.handleAuthCallback = function (sessionId, callbackUrl)
{
    var error = null;
    var self = this;
    var error_message;
    var urlInfo = $mob.utils.parseUrl(callbackUrl);
    if (urlInfo != null && urlInfo.query != null)
    {
        var params = $mob.utils.parseUrlParameters(urlInfo.query);
        if (params != null)
        {
            self._oauthToken = params ["oauth_token"];
            var oauthVerifier = params ["oauth_verifier"];

            //请求Access Token
            var url = "https://api.twitter.com/oauth/access_token";
            var oauthParams = {
                "oauth_consumer_key" : self.consumerKey(),
                "oauth_token" : self._oauthToken,
                "oauth_signature_method" : "HMAC-SHA1",
                "oauth_timestamp" : parseInt(new Date().getTime() / 1000).toString(),
                "oauth_nonce" : parseInt(Math.random() * 100000).toString(),
                "oauth_version" : "1.0",
                "oauth_callback" : self.redirectUri(),
                "oauth_verifier" : oauthVerifier
            };

            $mob.ext.ssdk_callOAuthApi(self.type(), null, url, "GET", null, null, oauthParams, self.consumerSecret(), self._oauthTokenSecret, function (data) {

                if (data != null)
                {
                    if (data ["error_code"] != null)
                    {
                        //失败
                        $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Fail, error);
                    }
                    else
                    {
                        var response = $mob.utils.jsonStringToObject($mob.utils.base64Decode(data["response_data"]));
                        if (data ["status_code"] === 200 && response == null)
                        {
                            response = $mob.utils.parseUrlParameters ($mob.utils.base64Decode(data["response_data"]));
                            self._succeedAuthorize(sessionId, response);
                        }
                        else
                        {
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
};

/**
 * 获取用户信息
 * @param query         查询信息
 * @param callback      方法回调
 */
Twitter.prototype.getUserInfo = function (query, callback)
{
    var self = this;
    this._getCurrentUser(function(user) {

        var params = {};
        if (query != null)
        {
            if (query.uid != null)
            {
                params["user_id"] = query.uid;
            }
            else if (query.name != null)
            {
                params["screen_name"] = query.name;
            }
        }
        else if (user != null && user.credential != null && user.credential.uid != null)
        {
            //设置当前授权用户ID
            params["user_id"] = user.credential.uid;
        }

        self.callApi("https://api.twitter.com/1.1/users/show.json", "GET", params, null, function (state, data) {

            var resultData = data;
            if (state === $mob.shareSDK.responseState.Success)
            {
                //转换用户数据
                resultData = {"platform_type" : $mob.shareSDK.platformType.Twitter};
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
Twitter.prototype.callApi = function (url, method, params, headers, callback)
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

                            //判断是否为尚未授权
                            switch (response["error_code"])
                            {
                                case 89:
                                case 215:
                                    code = $mob.shareSDK.errorCode.UserUnauth;
                                    break;
                            }

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
//
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
Twitter.prototype.cancelAuthorize = function ()
{
    this._setCurrentUser(null, null);
};

/**
 * 添加好友
 * @param sessionId     会话标识
 * @param user          用户信息
 * @param callback      方法回调，回调方法声明如下:function (stat, data);
 */
Twitter.prototype.addFriend = function (sessionId, user, callback)
{
    var params = {};
    if (user ["uid"] != null)
    {
        params ["user_id"] = user ["uid"];
    }
    else if (user["nickname"] != null)
    {
        params ["screen_name"] = user ["nickname"];
    }

    var self = this;
    this.callApi("https://api.twitter.com/1.1/friendships/create.json", "POST", params, null, function (state, data) {

        var resultData = data;
        if (state === $mob.shareSDK.responseState.Success)
        {
            //转换用户数据
            resultData = {"platform_type" : $mob.shareSDK.platformType.Twitter};
            self._updateUserInfo(resultData, data);
        }

        if (callback != null)
        {
            callback (state, resultData);
        }

    });
};

/**
 * 获取好友列表
 * @param cursor        分页游标
 * @param size          分页尺寸
 * @param callback      方法回调，回调方法声明如下:function (state, data);
 */
Twitter.prototype.getFriends = function (cursor, size, callback)
{
    
    var self = this;
    this._getCurrentUser(function (user) {

        var params = {};
        if (user != null && user ["uid"] != null)
        {
            params ["user"] = user ["uid"];
        }
        params["cursor"] = cursor;
        params["count"] = size;
                         
        self.callApi("https://api.twitter.com/1.1/friends/list.json", "GET", params, null, function (state, data) {
            var resultData = data;
            if (state === $mob.shareSDK.responseState.Success)
            {
                //转换数据
                resultData = {};
                resultData["prev_cursor"] = data["previous_cursor"];
                resultData["next_cursor"] = data["next_cursor"];

                //转换用户数据
                var users = [];
                var rawUsersData = data["users"];
                if (rawUsersData != null)
                {
                    for (var i = 0; i < rawUsersData.length; i++)
                    {
                        var user = {"platform_type" : $mob.shareSDK.platformType.Twitter};
                        self._updateUserInfo(user, rawUsersData[i]);
                        users.push(user);
                    }
                }
                resultData["users"] = users;
                resultData ["has_next"] = data["next_cursor"] > 0;

            }

            if (callback != null)
            {
                callback (state, resultData);
            }

        });

    });
};

/**
 * 分享内容
 * @param sessionId         会话ID
 * @param parameters        分享参数
 * @param callback          方法回调，回调方法声明如下:function (state, data, user, userData);
 */
Twitter.prototype.share = function (sessionId, parameters, callback)
{
    var self = this;
    //获取分享统计标识
    var text = null;
    var lat = null;
    var lng = null;
    var flags = parameters != null ? parameters ["@flags"] : null;
    var userData = {
        "@flags" : flags
    };
    var error_message;
    var error;

    var type = $mob.shareSDK.getShareParam(this.type(), parameters, "type");
    if (type == null)
    {
        type = $mob.shareSDK.contentType.Auto;
    }
    if (type === $mob.shareSDK.contentType.Auto)
    {
        type = this._getShareType(parameters);
    }

    var url = null;
    var params = null;
    switch (type)
    {
        case $mob.shareSDK.contentType.Text:
        {
            text = $mob.shareSDK.getShareParam(this.type(), parameters, "text");
            if (text != null)
            {
                url = "https://api.twitter.com/1.1/statuses/update.json";

                params = {
                    "status" : text
                };

                lat = $mob.shareSDK.getShareParam(this.type(), parameters, "lat");
                lng = $mob.shareSDK.getShareParam(this.type(), parameters, "long");

                if (lat != null && lng != null)
                {
                    params["lat"] = lat;
                    params["long"] = lng;
                }
            }
            break;
        }
        case $mob.shareSDK.contentType.Image:
        {
            var images = $mob.shareSDK.getShareParam(this.type(), parameters, "images");
            if (images != null)
            {
                if (images.length > 4)
                {
                    //最多只能够发4张
                    images.splice(4);
                }

                url = "https://api.twitter.com/1.1/statuses/update.json";

                params = {
                    "images" : images
                };

                text = $mob.shareSDK.getShareParam(this.type(), parameters, "text");
                if (text != null)
                {
                    params["status"] = text;
                }

                lat = $mob.shareSDK.getShareParam(this.type(), parameters, "lat");
                lng= $mob.shareSDK.getShareParam(this.type(), parameters, "long");

                if (lat != null && lng != null)
                {
                    params["lat"] = lat;
                    params["long"] = lng;
                }

            }
            break;
        }
        case $mob.shareSDK.contentType.Video:
        {
            $mob.ext.isPluginRegisted("com.mob.sharesdk.connector.twitter", function (data) {
                if (data.result)
                {
                    text = $mob.shareSDK.getShareParam(self.type(), parameters, "text");
                    var tag = $mob.shareSDK.getShareParam(self.type(), parameters, "tag");
                    lat = $mob.shareSDK.getShareParam(self.type(), parameters, "lat");
                    lng = $mob.shareSDK.getShareParam(self.type(), parameters, "long");
                    var videoURL = $mob.shareSDK.getShareParam(self.type(), parameters, "video");
                    if(videoURL == null)
                    {
                        videoURL = $mob.shareSDK.getShareParam(self.type(), parameters, "url");
                    }
                    if(videoURL != null && text != null)
                    {
                        self._getCurrentUser(function (user){
                            if(user != null)
                            {
                                $mob.ext.ssdk_plugin_twitter_uploadVideo(self.consumerKey(), self.consumerSecret(), user.credential.token, user.credential.secret, sessionId, videoURL , tag ,function (data) {
                                    if(data.error_code != null)
                                    {
                                        if (callback)
                                        {
                                            callback ($mob.shareSDK.responseState.Fail, data);
                                        }
                                    }
                                    else
                                    {
                                        var shareParams = {"platform" : self.type(), "text" : text , 'video' :videoURL ,'lat': lat , 'long':lng};
                                        TwitterShareContentSet[sessionId] = {"content" : shareParams, "user_data" : userData};
                                        $mob.native.ssdk_shareStateChanged(sessionId, $mob.shareSDK.responseState.BeginUPLoad, null, null, null);
                                    }
                                });
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
                        });
                    }
                    else
                    {
                        if(this._currentLanguage === "zh-Hans")
                        {
                            error_message = "分享参数video & text 不能为空!";
                        }
                        else
                        {
                            error_message = "share param video & text can not be nil!";
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
                else
                {
                    if(this._currentLanguage === "zh-Hans")
                    {
                        error_message = "平台[" + self.name() + "]需要依靠TwitterConnector.framework进行分享，请先导入TwitterConnector.framework后再试!";
                    }
                    else
                    {
                        error_message = "Platform [" + self.name() + "] depends on TwitterConnector.framework，please import TwitterConnector.framework then try again!";
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
            return;
        }
    }

    if (url != null && params != null)
    {
        this._share(url, params, userData, callback);
    }
    else
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
};

/**
 * 创建用户信息
 * @param rawData       原始用户数据
 * @returns {null}      用户数据
 */
Twitter.prototype.createUserByRawData = function (rawData)
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
Twitter.prototype._convertUrl = function (contents, callback)
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
 * 用户是否有效
 * @param user      用户信息
 * @returns {boolean}   如果授权凭证过期或者不存在则返回false，否则返回true
 * @private
 */
Twitter.prototype._isUserAvaliable = function (user)
{
    return user.credential != null && user.credential.token != null && user.credential.secret != null;

};

/**
 * 检测应用是否有效
 * @returns {boolean}   true 有效 false 无效
 * @private
 */
Twitter.prototype._isAvailable = function ()
{
    if (this.consumerKey() != null && this.consumerSecret() != null && this.redirectUri() != null)
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
Twitter.prototype._checkAppInfoAvailable = function (appInfo)
{
    //对信息进行过滤
    var consumerKey = $mob.utils.trim(appInfo [TwitterAppInfoKeys.ConsumerKey]);
    var consumerSecret = $mob.utils.trim(appInfo [TwitterAppInfoKeys.ConsumerSecret]);
    var redirectUri = $mob.utils.trim(appInfo [TwitterAppInfoKeys.RedirectUri]);

    if (consumerKey != null)
    {
        appInfo [TwitterAppInfoKeys.ConsumerKey] = consumerKey;
    }
    else
    {
        appInfo [TwitterAppInfoKeys.ConsumerKey] = this.consumerKey();    
    }

    if (consumerSecret != null)
    {
        appInfo [TwitterAppInfoKeys.ConsumerSecret] = consumerSecret;
    }
    else
    {
        appInfo [TwitterAppInfoKeys.ConsumerSecret] = this.consumerSecret();    
    }

    if (redirectUri != null)
    {
        appInfo [TwitterAppInfoKeys.RedirectUri] = redirectUri;

    }
    else
    {
        appInfo [TwitterAppInfoKeys.RedirectUri] = this.redirectUri();
  
    }

    return appInfo;
};

/**
 * 授权成功
 * @param sessionId             会话ID
 * @param credentialRawData     授权凭证原始数据
 * @private
 */
Twitter.prototype._succeedAuthorize = function (sessionId, credentialRawData)
{
    var self = this;

    //成功
    var credential = {
        "uid"       : credentialRawData["user_id"],
        "token"     : credentialRawData["oauth_token"],
        "secret"    : credentialRawData["oauth_token_secret"],
        "raw_data"  : credentialRawData,
        "type"      : $mob.shareSDK.credentialType.OAuth1x
    };

    var user = {
        "platform_type" : $mob.shareSDK.platformType.Twitter,
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
 * 设置当前用户信息
 * @param user      用户信息
 * @param callback  回调方法
 * @private
 */
Twitter.prototype._setCurrentUser = function (user, callback)
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
Twitter.prototype._getCurrentUser = function (callback)
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
Twitter.prototype._updateUserInfo = function (user, rawData)
{
    if (user != null && rawData != null)
    {
        user["raw_data"] = rawData;
        user["uid"] = rawData ["id_str"];
        user["nickname"] = rawData["screen_name"];
        user["icon"] = rawData["profile_image_url"];
        user["gender"] = 2;

        if (rawData["screen_name"] != null)
        {
            user["url"] = "https://twitter.com/" + rawData["screen_name"];
        }

        user["about_me"] = rawData["description"];
        user["verify_type"] = rawData["verified"] ? 1 : 0;
        user["follower_count"] = rawData["followers_count"];
        user["friend_count"] = rawData["friends_count"];
        user["share_count"] = rawData["statuses_count"];

        if (rawData["created_at"] != null)
        {
            var date = new Date(rawData["created_at"]);
            user["reg_at"] = date.getTime();
        }
    }
};

/**
 * 执行分享
 * @param url           请求链接
 * @param params        分享参数
 * @param userData      用户数据
 * @param callback      回调
 * @private
 */
Twitter.prototype._share = function (url, params, userData, callback)
{
    var self = this;
    this._getCurrentUser(function (user) {

        self._convertUrl([params["status"]], function (data){

            params["status"] = data.result[0];

            self._convertShareParams(params, function (params) {


                self.callApi(url, "POST", params, null, function (state, data) {
                    var resultData = data;
                    if (state === $mob.shareSDK.responseState.Success)
                    {
                        //转换数据
                        resultData = {};
                        resultData["raw_data"] = data;
                        resultData["cid"] = data["id_str"];
                        resultData["text"] = data["text"];

                        if ( data ["entities"] != null && data ["entities"] ["media"] != null)
                        {
                            var medias = data ["entities"] ["media"];
                            if (Object.prototype.toString.apply(medias) === '[object Array]')
                            {
                                var images = [];
                                for (var i = 0; i < medias.length; i++)
                                {
                                    var item = medias [i];
                                    if (item["type"] === "photo")
                                    {
                                        images.push(item["media_url"]);
                                    }
                                }

                                resultData["images"] = images;
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

    });
};

/**
 * 转换分享参数
 * @param params        分享参数
 * @param callback      回调，声明为：function (params);
 * @private
 */
Twitter.prototype._convertShareParams = function (params, callback)
{
    var self = this;
    if (params["images"] != null)
    {
        //先找出网络图片，然后再对网络图片进行下载，最后统一上传到Twitter
        this._downloadWebImage(params["images"], 0, function (images) {

            self._uploadImage(images, 0, function (images) {

                if (images.length > 0)
                {
                   params ["media_ids"] = images.join(",");
                }

                delete params["images"];
                params ["images"] = null;

                if (callback)
                {
                    callback (params);
                }

            });
        });
    }
    else
    {
        if (callback)
        {
            callback (params);
        }
    }
};

/**
 * 下载网络图片
 * @param images            图片列表
 * @param index             当前图片索引
 * @param callback          回调，声明为：function (images);
 * @private
 */
Twitter.prototype._downloadWebImage = function (images, index, callback)
{
    var self = this;
    if (index < images.length)
    {
        var image = images [index];

        if (!/^(file\:\/)?\//.test(image))
        {
            //网络图片
            $mob.ext.downloadFile(image, function (data) {

                if (data.result != null)
                {
                    //替换原有链接
                    images [index] = data.result;
                    index ++;
                }
                else
                {
                    images.splice(index, 1);
                }

                self._downloadWebImage(images, index, callback);
            });
        }
        else
        {
            index++;
            this._downloadWebImage(images, index, callback);
        }
    }
    else
    {
        if (callback)
        {
            callback (images);
        }
    }
};

/**
 * 上传文件到Twitter
 * @param images            图片列表
 * @param index             当前图片索引
 * @param callback          回调，声明为：function (images);
 * @private
 */
Twitter.prototype._uploadImage = function (images, index, callback)
{
    if (index < images.length)
    {
        var mediaId = null;
        var self = this;
        var url = "https://upload.twitter.com/1.1/media/upload.json";
        var image = images [index];

        var mimeType = "application/octet-stream";
        if (/\.jpe?g$/.test(image))
        {
            mimeType = "image/jpeg";
        }
        else if (/\.png$/.test(image))
        {
            mimeType = "image/png";
        }

        var file = {"path" : image, "mime_type": mimeType};
        var params = {
            "media" : "@file(" + $mob.utils.objectToJsonString(file) + ")"
        };

        this.callApi(url, "POST", params, null, function (state, data) {

            if (state === $mob.shareSDK.responseState.Success)
            {
                mediaId = data ["media_id_string"];
                images [index] = mediaId;
                index ++;

                self._uploadImage(images, index, callback);
            }
            else
            {
                //失败后进行下一张图片上传
                images.splice(index, 1);
                self._uploadImage(images, index, callback);
            }

        });
    }
    else
    {
        if (callback)
        {
            callback (images);
        }
    }
};

/**
 * 根据分享参数返回分享类型
 * @param parameters            分享参数
 * @private
 */
Twitter.prototype._getShareType = function (parameters)
{
    var type = $mob.shareSDK.contentType.Text;
    var images = $mob.shareSDK.getShareParam(this.type(), parameters, "images");
    if (Object.prototype.toString.apply(images) === '[object Array]')
    {
        type = $mob.shareSDK.contentType.Image;
    }
    else
    {
        var url = $mob.shareSDK.getShareParam(this.type(), parameters, "url");
        if (!/^(http\:)/.test(url) && !/^(https\:)/.test(url))
        {
            type = $mob.shareSDK.contentType.Video;
        }
    }
    return type;
};

/**
 * 授权状态改变
 * @param sessionId         会话标识
 * @param data              返回数据
 * @private
 */
Twitter.prototype.authStateChanged = function (sessionId, data)
{
    $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Cancel, null);
};

/*
* 上传完成后的通知
* @param sessionId         会话标识
* @param data              返回数据
*/
Twitter.prototype.uploadFinishCallback = function (sessionId, data)
{
    var self = this;
    var error;
    self._getCurrentUser(function (user) {
        var userData = null;
        var content = null;
        var shareParams = TwitterShareContentSet[sessionId];
        if(shareParams != null)
        {
            content = shareParams ["content"];
            userData = shareParams ["user_data"];
        }
        if(data.error_code != null)
        {
        	if(data.error_code === $mob.shareSDK.responseState.Cancel)
        	{
        		$mob.native.ssdk_shareStateChanged(sessionId, $mob.shareSDK.responseState.Cancel, null, user, userData);
        	}
        	else
        	{
        		//失败
	            error = {
	                "error_code" : $mob.shareSDK.errorCode.APIRequestFail,
	                "user_data" :  {"error_code" : data.error_code , "error_message" : data.error_message}
	            };
	            $mob.native.ssdk_shareStateChanged(sessionId, $mob.shareSDK.responseState.Fail, error, user, userData);
        	}
        }
        else
        {
            if(data.media_id != null && content != null)
            {
                var text = content['text'];
                var mediaID = data.media_id;
                var params = {};
                self._convertUrl([text], function (data){
                    text = data.result[0];
                    params["status"] = text;
                    if(content['lat'] != null && content['long'] != null)
                    {
                        params["lat"] = content['lat'];
                        params["long"] = content['long'];
                    }
                    params ["media_ids"] = mediaID;
                    self.callApi("https://api.twitter.com/1.1/statuses/update.json", "POST", params, null, function (state, data) {
                        var resultData = data;
                        if (state === $mob.shareSDK.responseState.Success)
                        {
                            //转换数据
                            resultData = {};
                            resultData["raw_data"] = data;
                            resultData["cid"] = data["id_str"];
                            resultData["text"] = data["text"];

                            if ( data ["entities"] != null && data ["entities"] ["media"] != null)
                            {
                                var medias = data ["entities"] ["media"];
                                if (Object.prototype.toString.apply(medias) === '[object Array]')
                                {
                                    var images = [];
                                    for (var i = 0; i < medias.length; i++)
                                    {
                                        var item = medias [i];
                                        if (item["type"] === "photo")
                                        {
                                            images.push(item["media_url"]);
                                        }
                                    }

                                    resultData["images"] = images;
                                }
                            }

                        }
                        $mob.native.ssdk_shareStateChanged(sessionId, $mob.shareSDK.responseState.Success, resultData, user, userData);
                    });
                });
            }
            else
            {
                error = {
                "error_code" : $mob.shareSDK.errorCode.APIRequestFail,
                "user_data" :  {"error_code" : $mob.shareSDK.errorCode.APIRequestFail , "error_message" : "upload error"}
                };
                $mob.native.ssdk_shareStateChanged(sessionId, $mob.shareSDK.responseState.Fail, error, user, userData);
            }
        }
        delete TwitterShareContentSet[sessionId];
    });
};

//注册平台
$mob.shareSDK.registerPlatformClass($mob.shareSDK.platformType.Twitter, Twitter);
