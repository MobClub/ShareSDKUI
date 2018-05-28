/**
 * Created with JetBrains WebStorm.
 * User: fenghj
 * Date: 15/12/2
 * Time: 上午11:12
 * To change this template use File | Settings | File Templates.
 */

var $pluginID = "com.mob.sharesdk.Instapaper";

/**
 * 易信应用信息键名定义
 * @type {{AppId: "app_id", ConvertUrl: "covert_url"}}
 */
var InstapaperAppInfoKeys = {
    "ConsumerKey"        : "consumer_key",
    "ConsumerSecret"     : "consumer_secret",
    "ConvertUrl"         : "covert_url"
};

/**
 * Instapaper
 * @param type  平台类型
 * @constructor
 */
function Instapaper (type)
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
Instapaper.prototype.type = function ()
{
    return this._type;
};

/**
 * 授权状态改变
 * @param sessionId         会话标识
 * @param data              返回数据
 * @private
 */
Instapaper.prototype.authStateChanged = function (sessionId, data)
{
    $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Cancel, null);
};

/**
 * 获取平台名称
 * @returns {string}    平台名称
 */
Instapaper.prototype.name = function ()
{
    return "Instapaper";
};

/**
 * 获取应用标识
 * @returns {*} 应用标识
 */
Instapaper.prototype.consumerKey = function ()
{
    if (this._appInfo[InstapaperAppInfoKeys.ConsumerKey] !== undefined) 
    {
        return this._appInfo[InstapaperAppInfoKeys.ConsumerKey];
    }

    return null;
};

/**
 * 获取应用密钥
 * @returns {*} 应用标识
 */
Instapaper.prototype.consumerSecret = function ()
{
    if (this._appInfo[InstapaperAppInfoKeys.ConsumerSecret] !== undefined) 
    {
        return this._appInfo[InstapaperAppInfoKeys.ConsumerSecret];
    }

    return null;
};

/**
 * 获取缓存域名
 * @returns {string}    域名
 */
Instapaper.prototype.cacheDomain = function ()
{
    return "SSDK-Platform-" + this.type() + "-" + this.consumerKey();
};

/**
 * 获取授权方式
 *
 * @return  web 网页授权方式，sso 单点登录授权方式，both 两者共同使用，优先使用SSO
 */
Instapaper.prototype.convertUrlEnabled = function ()
{
    if (this._appInfo[InstapaperAppInfoKeys.ConvertUrl] !== undefined) 
    {
        return this._appInfo[InstapaperAppInfoKeys.ConvertUrl];
    }

    return $mob.shareSDK.convertUrlEnabled();
};

/**
 * 设置/获取应用信息
 * @param value 应用信息
 * @returns {*}
 */
Instapaper.prototype.setAppInfo = function (value)
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
Instapaper.prototype.saveConfig = function ()
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
Instapaper.prototype.isSupportAuth = function ()
{
    return true;
};

/**
 * 用户授权
 * @param sessionId     授权会话标识
 * @param settings      授权设置
 */
Instapaper.prototype.authorize = function (sessionId, settings)
{
    var self = this;
    var error = null;
    if (this._isAvailable())
    {
        $mob.ext.isPluginRegisted("com.mob.sharesdk.connector.instapaper", function (data) {

            if (data.result)
            {
                var userData = {"consumer_key" : self.consumerKey(), "consumer_secret" : self.consumerSecret()};
                $mob.ext.ssdk_auth(sessionId, "com.mob.sharesdk.connector.instapaper", userData, function (data) {

                    if (data.state === $mob.shareSDK.responseState.Success)
                    {
                        self._succeedAuthorize(sessionId, data.result);
                    }
                    else
                    {
                        $mob.native.ssdk_authStateChanged(sessionId, data.state, data.result);
                    }

                });
            }
            else
            {

                var error_message = null;
 
                if(this._currentLanguage === "zh-Hans")
                {
                    error_message = "分享平台［" + self.name() + "］尚未初始化";
                }
                else
                {
                    error_message = "Platform［" + self.name() + "］not initialized";
                }
                //返回错误
                var error = {
                    "error_code" : $mob.shareSDK.errorCode.UninitPlatform,
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
 * 获取用户信息
 * @param query         查询信息
 * @param callback      方法回调
 */
Instapaper.prototype.getUserInfo = function (query, callback)
{
    var self = this;
    this._getCurrentUser(function(user) {

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

        self.callApi("https://www.instapaper.com/api/1/account/verify_credentials", "POST", params, null, function (state, data) {

            var resultData = data;
            if (state === $mob.shareSDK.responseState.Success)
            {
                //转换用户数据
                resultData = {"platform_type" : self.type()};
                self._updateUserInfo(resultData, data[0]);

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
Instapaper.prototype.callApi = function (url, method, params, headers, callback)
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
Instapaper.prototype.cancelAuthorize = function ()
{
    this._setCurrentUser(null, null);
};

/**
 * 添加好友
 * @param sessionId     会话标识
 * @param user          用户信息
 * @param callback      方法回调，回调方法声明如下:function (stat, data);
 */
Instapaper.prototype.addFriend = function (sessionId, user, callback)
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
Instapaper.prototype.getFriends = function (cursor, size, callback)
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
Instapaper.prototype.share = function (sessionId, parameters, callback)
{
    //获取分享统计标识
    var self = this;
    var error = null;
    var flags = parameters != null ? parameters ["@flags"] : null;
    var userData = {
        "@flags" : flags
    };

    var url = $mob.shareSDK.getShareParam(this.type(), parameters, "url");
    var title = $mob.shareSDK.getShareParam(this.type(), parameters, "title");
    var content = $mob.shareSDK.getShareParam(this.type(), parameters, "text");
    var desc = $mob.shareSDK.getShareParam(this.type(), parameters, "desc");
    var isPrivateFromSource = $mob.shareSDK.getShareParam(this.type(), parameters, "private_from_source");
    var folderId = $mob.shareSDK.getShareParam(this.type(), parameters, "folder_id");
    var resolveFinalUrl = $mob.shareSDK.getShareParam(this.type(), parameters, "resolve_final_url");


    if (url != null || (content != null && isPrivateFromSource))
    {

        this._convertUrl([url], function (data) {

            var params = null;

            if (isPrivateFromSource && content != null)
            {
                params = {
                    "is_private_from_source" : isPrivateFromSource
                };
            }
            else
            {
                params = {
                    "url" : data.result[0]
                };

            }

            if (title != null)
            {
                params ["title"] = title;
            }

            if (desc != null)
            {
                params ["description"] = desc;
            }

            if (folderId > 0)
            {
                params ["folder_id"] = folderId.toString();
            }

            if (!resolveFinalUrl)
            {
                params ["resolve_final_url"] = "0";
            }

            if (content != null)
            {
                params ["content"] = content;
            }

            self._getCurrentUser(function (user) {

                self.callApi("https://www.instapaper.com/api/1/bookmarks/add", "POST", params, null, function (state, data) {

                    var resultData = data;
                    if (state === $mob.shareSDK.responseState.Success)
                    {
                        //转换数据
                        resultData = {};
                        resultData["raw_data"] = data[0];
                        resultData["cid"] = data[0]["bookmark_id"];
                        if (data[0]["url"] != null)
                        {
                            resultData["urls"] = [data[0]["url"]];
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
        var error_message = null;
                
        if(this._currentLanguage === "zh-Hans")
        {
            error_message = "分享参数url不能为空，或者private_from_source为true并且text不能为空！";
        }
        else
        {
            error_message = "share param url can not be nil,or private_from_source be true when text not be nil!";
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
};

/**
 * 创建用户信息
 * @param rawData       原始用户数据
 * @returns {null}      用户数据
 */
Instapaper.prototype.createUserByRawData = function (rawData)
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
Instapaper.prototype._convertUrl = function (contents, callback)
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
 * 更新用户信息
 * @param user      用户信息
 * @param rawData   原始数据
 * @private
 */
Instapaper.prototype._updateUserInfo = function (user, rawData)
{
    if (user != null && rawData != null)
    {
        user["raw_data"] = rawData;
        user["uid"] = rawData ["user_id"].toString();
        user["nickname"] = rawData["username"];
        user["gender"] = 2;
    }
};

/**
 * 获取当前用户信息
 * @param callback  回调方法
 * @private
 */
Instapaper.prototype._getCurrentUser = function (callback)
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
 * 授权成功
 * @param sessionId             会话ID
 * @param credentialRawData     授权凭证原始数据
 * @private
 */
Instapaper.prototype._succeedAuthorize = function (sessionId, credentialRawData)
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
                user["credential"]["uid"] = data.uid;
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
 * 设置当前用户信息
 * @param user      用户信息
 * @param callback  回调方法
 * @private
 */
Instapaper.prototype._setCurrentUser = function (user, callback)
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
 * 检测应用是否有效
 * @returns {boolean}   true 有效 false 无效
 * @private
 */
Instapaper.prototype._isAvailable = function ()
{
    if (this.consumerKey() != null && this.consumerSecret() != null)
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
Instapaper.prototype._checkAppInfoAvailable = function (appInfo)
{
    var consumerKey = $mob.utils.trim(appInfo [InstapaperAppInfoKeys.ConsumerKey]);
    var consumerSecret = $mob.utils.trim(appInfo [InstapaperAppInfoKeys.ConsumerSecret]);

    if (consumerKey != null)
    {
        appInfo [InstapaperAppInfoKeys.ConsumerKey] = consumerKey;
    }
    else
    {
        appInfo [InstapaperAppInfoKeys.ConsumerKey] = this.consumerKey();     
    }

    if (consumerSecret != null)
    {
        appInfo [InstapaperAppInfoKeys.ConsumerSecret] = consumerSecret;
    }
    else
    {
        appInfo [InstapaperAppInfoKeys.ConsumerSecret] = this.consumerSecret();      
    }
    
    return appInfo;
};


//注册平台
$mob.shareSDK.registerPlatformClass($mob.shareSDK.platformType.Instapaper, Instapaper);
