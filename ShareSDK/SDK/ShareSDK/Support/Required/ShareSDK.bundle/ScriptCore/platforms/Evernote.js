/**
 * Created with JetBrains WebStorm.
 * User: fenghj
 * Date: 15/9/23
 * Time: 下午3:53
 * To change this template use File | Settings | File Templates.
 */

var $pluginID = "com.mob.sharesdk.Evernote";

/**
 * 印象笔记回调
 * @type {string}
 */
var EvernoteRedirectUri = "evernote-oauth://";

/**
 * Evernote应用信息键名定义
 * @type {{AppKey: string, AppSecret: string, RedirectUri: string}}
 */
var EvernoteInfoKeys = {
    "ConsumerKey"       : "consumer_key",
    "ConsumerSecret"    : "consumer_secret",
    "Sandbox"           : "sandbox",
    "ConvertUrl"        : "covert_url"
};

/**
 * QQ
 * @param type  平台类型
 * @constructor
 */
function Evernote (type)
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
Evernote.prototype.type = function ()
{
    return this._type;
};

/**
 * 授权状态改变
 * @param sessionId         会话标识
 * @param data              返回数据
 * @private
 */
Evernote.prototype.authStateChanged = function (sessionId, data)
{
    $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Cancel, null);
};

/**
 * 获取平台名称
 * @returns {string}    平台名称
 */
Evernote.prototype.name = function ()
{
    if (this.type() === $mob.shareSDK.platformType.Evernote)
    {
        return "Evernote";
    }
    
    if(this._currentLanguage === "zh-Hans")
    {
        return "印象笔记";
    }
    else
    {
        return "YinXiang";
    }
};

/**
 * 获取应用标识
 * @returns {*} 应用标识
 */
Evernote.prototype.consumerKey = function ()
{
    if (this._appInfo[EvernoteInfoKeys.ConsumerKey] !== undefined) 
    {
        return this._appInfo[EvernoteInfoKeys.ConsumerKey];
    }

    return null;
};

/**
 * 获取应用密钥
 * @returns {*} 应用密钥
 */
Evernote.prototype.consumerSecret = function ()
{
    if (this._appInfo[EvernoteInfoKeys.ConsumerSecret] !== undefined) 
    {
        return this._appInfo[EvernoteInfoKeys.ConsumerSecret];
    }

    return null;
};

/**
 * 获取沙箱模式
 * @returns {*} true 沙箱服务 false 正式服务
 */
Evernote.prototype.sandbox = function ()
{
    if (!this._appInfo[EvernoteInfoKeys.Sandbox]) 
    {
        return this._appInfo[EvernoteInfoKeys.Sandbox];
    }

    return true;
};

/**
 * 获取缓存域名
 * @returns {string}    域名
 */
Evernote.prototype.cacheDomain = function ()
{
    return "SSDK-Platform-" + this.type() + "-" + this.consumerKey();
};

/**
 * 获取授权方式
 *
 * @return  web 网页授权方式，sso 单点登录授权方式，both 两者共同使用，优先使用SSO
 */
Evernote.prototype.convertUrlEnabled = function ()
{

    if (this._appInfo[EvernoteInfoKeys.ConvertUrl] !== undefined) 
    {
        return this._appInfo[EvernoteInfoKeys.ConvertUrl];
    }

    return $mob.shareSDK.convertUrlEnabled();
};

/**
 * 设置/获取应用信息
 * @param value 应用信息
 * @returns {*}
 */
Evernote.prototype.setAppInfo = function (value)
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
Evernote.prototype.saveConfig = function ()
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
Evernote.prototype.isSupportAuth = function ()
{
    return true;
};

/**
 * 用户授权
 * @param sessionId     授权会话标识
 * @param settings      授权设置
 */
Evernote.prototype.authorize = function (sessionId, settings)
{
    var error = null;
    if (this._isAvailable())
    {
        //进行网页授权
        this._webAuthorize(sessionId, settings);
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
Evernote.prototype.handleAuthCallback = function (sessionId, callbackUrl)
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
            self._oauthToken = params ["oauth_token"];
            var oauthVerifier = params ["oauth_verifier"];

            //请求Access Token
            var url = self._baseUrl() + "/oauth";
            var oauthParams = {
                "oauth_consumer_key" : self.consumerKey(),
                "oauth_token" : self._oauthToken,
                "oauth_signature_method" : "HMAC-SHA1",
                "oauth_timestamp" : parseInt(new Date().getTime() / 1000).toString(),
                "oauth_nonce" : parseInt(Math.random() * 100000).toString(),
                "oauth_version" : "1.0",
                "oauth_verifier" : oauthVerifier
            };

            $mob.ext.ssdk_callOAuthApi(self.type(), null, url, "POST", null, null, oauthParams, self.consumerSecret(), self._oauthTokenSecret, function (data) {

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
Evernote.prototype.getUserInfo = function (query, callback)
{
    var error = null;
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

        error = {
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

        if (user != null && user.credential != null)
        {
            $mob.ext.ssdk_evernoteGetUserInfo (self._baseUrl(), user.credential.token, function (data) {

                var resultData = data.result;
                if (data.state === $mob.shareSDK.responseState.Success)
                {
                    //转换用户数据
                    resultData = {
                        "platform_type" : self.type()
                    };
                    self._updateUserInfo(resultData, data.result);

                    //如果用户数据和授权用户相同
                    if (resultData["uid"] === user["uid"])
                    {
                        //将授权凭证赋值给用户信息
                        resultData["credential"] = user["credential"];
                    }
                }

                if (callback != null)
                {
                    callback (data.state, resultData);
                }
            });
        }
        else
        {
            var code = $mob.shareSDK.errorCode.UserUnauth;
            error = {
                "error_code" : code
            };
            if (callback)
            {
                callback ($mob.shareSDK.responseState.Fail, error);
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
Evernote.prototype.callApi = function (url, method, params, headers, callback)
{

    var error_message = null;
 
    if(this._currentLanguage === "zh-Hans")
    {
        error_message = "平台［" + this.name() + "］不支持调用API功能!";
    }
    else
    {
        error_message = "Platform［" + this.name() + "］do not support callApi feature!";
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
 * 取消授权
 */
Evernote.prototype.cancelAuthorize = function ()
{
    this._setCurrentUser(null, null);
};

/**
 * 添加好友
 * @param sessionId     会话标识
 * @param user          用户信息
 * @param callback      方法回调，回调方法声明如下:function (stat, data);
 */
Evernote.prototype.addFriend = function (sessionId, user, callback)
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
Evernote.prototype.getFriends = function (cursor, size, callback)
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
Evernote.prototype.share = function (sessionId, parameters, callback)
{
    var self = this;
    var error = null;

    //获取分享统计标识
    var flags = parameters != null ? parameters ["@flags"] : null;
    var userData = {
        "@flags" : flags
    };

    $mob.ext.isPluginRegisted("com.mob.sharesdk.connector.evernote", function (data){
        if (data.result)
        {
            var text = $mob.shareSDK.getShareParam(self.type(), parameters, "text");
            var images = $mob.shareSDK.getShareParam(self.type(), parameters, "images");
            var title = $mob.shareSDK.getShareParam(self.type(), parameters, "title");
            var tags = $mob.shareSDK.getShareParam(self.type(), parameters, "tags");
            var notebook = $mob.shareSDK.getShareParam(self.type(), parameters, "notebook");
            var video = $mob.shareSDK.getShareParam(self.type(), parameters, "url");

            self._convertUrl([text], function (data) {

                text = data.result[0];
                //下载图片
                self._getCurrentUser(function (user) {

                    if (user != null && user.credential != null)
                    {
                        self._convertImages(images, 0, function (imgs) {
                            if(video != null)
                            {
                                images.push(video);
                            }
                            $mob.ext.ssdk_evernoteShare($mob.utils.urlDecode(user.credential["raw_data"]["edam_noteStoreUrl"]), user.credential.token, text, imgs, title, notebook, tags, function (data) {

                                var resultData = data.result;
                                if (data.state === $mob.shareSDK.responseState.Success)
                                {
                                    resultData = {};
                                    resultData["raw_data"] = data.result;
                                    resultData["cid"] = data.result != null ? data.result["guid"] : null;
                                    resultData["text"] = data.result != null ? data.result["content"] : null;
                                    resultData["images"] = images;
                                }

                                if (callback != null)
                                {
                                    callback (data.state, resultData, user, userData);
                                }

                            });

                        });
                    }
                    else
                    {
                        var code = $mob.shareSDK.errorCode.UserUnauth;
                        error = {
                            "error_code" : code
                        };
                        if (callback)
                        {
                            callback ($mob.shareSDK.responseState.Fail, error);
                        }
                    }

                });


            });
        }
        else
        {
            var error_message = null;
                              
            if(this._currentLanguage === "zh-Hans")
            {
                error_message = "平台[" + self.name() + "]需要依靠EvernoteConnector.framework进行分享，请先导入EvernoteConnector.framework后再试!";
            }
            else
            {
                error_message = "Platform [" + self.name() + "] depends on EvernoteConnector.framework，please import EvernoteConnector.framework then try again!";
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
 * 转换链接
 * @param contents      内容列表
 * @param callback      回调
 * @private
 */
Evernote.prototype._convertUrl = function (contents, callback)
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
 * 转换图片链接，对于网络图片需要下载为本地图片
 * @param images        图片集合
 * @param index         图片索引
 * @param callback      回调地址
 * @private
 */
Evernote.prototype._convertImages = function (images, index, callback)
{
    if (images != null && images.length > index)
    {
        var self = this;
        this._getImagePath(images [index], function (imageUrl) {

            images [index] = imageUrl;

            //继续下一个图片处理
            index ++;
            self._convertImages(images, index, callback);
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
 * 获取图片路径
 * @param url           图片路径
 * @param callback      回调
 * @private
 */
Evernote.prototype._getImagePath = function (url, callback)
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
 * 更新用户信息
 * @param user      用户信息
 * @param rawData   原始数据
 * @private
 */
Evernote.prototype._updateUserInfo = function (user, rawData)
{
    if (user != null && rawData != null)
    {
        user["raw_data"] = rawData;
        user["uid"] = rawData["id"];
        user["nickname"] = rawData["username"];
        user["gender"] = 2;
        user["reg_at"] = rawData["created"];
    }
};

/**
 * 授权成功
 * @param sessionId             会话ID
 * @param credentialRawData     授权凭证原始数据
 * @private
 */
Evernote.prototype._succeedAuthorize = function (sessionId, credentialRawData)
{
    var self = this;

    //成功
    var credential = {
        "uid"       : $mob.utils.urlDecode(credentialRawData["edam_userId"]),
        "token"     : $mob.utils.urlDecode(credentialRawData["oauth_token"]),
        "secret"    : $mob.utils.urlDecode(credentialRawData["oauth_token_secret"]),
        "expired"   : (new Date().getTime() +  credentialRawData ["edam_expires"] * 1000),
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
Evernote.prototype._setCurrentUser = function (user, callback)
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
Evernote.prototype._getCurrentUser = function (callback)
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
Evernote.prototype._webAuthorize = function (sessionId, settings)
{
    var self = this;
    var error = null;
    var url = this._baseUrl() + "/oauth";
    var oauthParams = {
        "oauth_consumer_key" : this.consumerKey(),
        "oauth_signature_method" : "HMAC-SHA1",
        "oauth_timestamp" : parseInt(new Date().getTime() / 1000).toString(),
        "oauth_nonce" : parseInt(Math.random() * 100000).toString(),
        "oauth_version" : "1.0",
        "oauth_callback" : EvernoteRedirectUri
    };
    $mob.ext.ssdk_callOAuthApi(this.type(), null, url, "GET", null, null, oauthParams, this.consumerSecret(), null, function (data) {

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

                    var authUrl = self._baseUrl() + "/OAuth.action?oauth_token=" + self._oauthToken;
                    //打开授权
                    $mob.native.ssdk_openAuthUrl(sessionId, authUrl, EvernoteRedirectUri);
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
};

/**
 * 获取基础URL
 * @returns {string}
 * @private
 */
Evernote.prototype._baseUrl = function ()
{
    if (this.sandbox())
    {
        return "https://sandbox.evernote.com";
    }
    else if (this.type() === $mob.shareSDK.platformType.YinXiang)
    {
        return "https://app.yinxiang.com";
    }
    else
    {
        return "https://www.evernote.com";
    }
};

/**
 * 检测应用是否有效
 * @returns {boolean}   true 有效 false 无效
 * @private
 */
Evernote.prototype._isAvailable = function ()
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
Evernote.prototype._checkAppInfoAvailable = function (appInfo)
{
    var consumerKey = $mob.utils.trim(appInfo [EvernoteInfoKeys.ConsumerKey]);
    var consumerSecret = $mob.utils.trim(appInfo [EvernoteInfoKeys.ConsumerSecret]);

    if (consumerKey != null)
    {
        appInfo [EvernoteInfoKeys.ConsumerKey] = consumerKey;
    }
    else
    {
        appInfo [EvernoteInfoKeys.ConsumerKey] = this.consumerKey();
    }

    if (consumerKey != null)
    {
        appInfo [EvernoteInfoKeys.ConsumerSecret] = consumerSecret;
    }
    else
    {
        appInfo [EvernoteInfoKeys.ConsumerSecret] = this.consumerSecret();
    }

    return appInfo;
};

//注册平台
$mob.shareSDK.registerPlatformClass($mob.shareSDK.platformType.YinXiang, Evernote);
$mob.shareSDK.registerPlatformClass($mob.shareSDK.platformType.Evernote, Evernote);
