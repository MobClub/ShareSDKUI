/**
 * Created with JetBrains WebStorm.
 * User: fenghj
 * Date: 15/9/16
 * Time: 下午12:34
 * To change this template use File | Settings | File Templates.
 */

var $pluginID = "com.mob.sharesdk.Flickr";

/**
 * Flickr的回调地址
 * @type {string}
 */
var FlickrRedirectUri = "http://www.example.com/";

/**
 * Flickr应用信息键名定义
 * @type {{AppKey: string, AppSecret: string, RedirectUri: string}}
 */
var FlickrAppInfoKeys = {
        "ApiKey"        : "api_key",
        "ApiSecret"     : "api_secret",
        "ConvertUrl"    : "covert_url"
};

/**
 * Flickr
 * @param type  平台类型
 * @constructor
 */
function Flickr (type)
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
Flickr.prototype.type = function ()
{
    return this._type;
};

/**
 * 授权状态改变
 * @param sessionId         会话标识
 * @param data              返回数据
 * @private
 */
Flickr.prototype.authStateChanged = function (sessionId, data)
{
    $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Cancel, null);
};

/**
 * 获取平台名称
 * @returns {string}    平台名称
 */
Flickr.prototype.name = function ()
{
    return "Flickr";
};

/**
 * 获取应用标识
 * @returns {*} 应用标识
 */
Flickr.prototype.apiKey = function ()
{
    if (this._appInfo[FlickrAppInfoKeys.ApiKey] !== undefined) 
    {
        return this._appInfo[FlickrAppInfoKeys.ApiKey];
    }

    return null;
};

/**
 * 获取应用密钥
 * @returns {*} 应用密钥
 */
Flickr.prototype.apiSecret = function ()
{
    if (this._appInfo[FlickrAppInfoKeys.ApiSecret] !== undefined) 
    {
        return this._appInfo[FlickrAppInfoKeys.ApiSecret];
    }

    return null;
};

/**
 * 获取缓存域名
 * @returns {string}    域名
 */
Flickr.prototype.cacheDomain = function ()
{
    return "SSDK-Platform-" + this.type() + "-" + this.apiKey();
};

/**
 * 获取是否转换短链
 *
 * @return  true 转换， false 不转换
 */
Flickr.prototype.convertUrlEnabled = function ()
{
    if (this._appInfo[FlickrAppInfoKeys.ConvertUrl] !== undefined) 
    {
        return this._appInfo[FlickrAppInfoKeys.ConvertUrl];
    }

    return $mob.shareSDK.convertUrlEnabled();
};

Flickr.prototype.setAppInfo = function (value)
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
Flickr.prototype.saveConfig = function ()
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

            curApps["plat_" + self.type()] = self.apiKey();
            $mob.ext.setCacheData("currentApp", curApps, false, domain, null);
        }

    });
};

/**
 * 获取是否支持授权
 * @returns {boolean} true 支持， false 不支持
 */
Flickr.prototype.isSupportAuth = function ()
{
    return true;
};

/**
 * 用户授权
 * @param sessionId     授权会话标识
 * @param settings      授权设置
 */
Flickr.prototype.authorize = function (sessionId, settings)
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
            error_message = "Platform［" + this.name() + "］Invalid configuration!";
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
Flickr.prototype.handleAuthCallback = function (sessionId, callbackUrl)
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
            var url = "https://www.flickr.com/services/oauth/access_token";
            var oauthParams = {
                "oauth_consumer_key" : self.apiKey(),
                "oauth_token" : self._oauthToken,
                "oauth_signature_method" : "HMAC-SHA1",
                "oauth_timestamp" : parseInt(new Date().getTime() / 1000).toString(),
                "oauth_nonce" : parseInt(Math.random() * 100000).toString(),
                "oauth_version" : "1.0",
                "oauth_callback" : FlickrRedirectUri,
                "oauth_verifier" : oauthVerifier
            };

            $mob.ext.ssdk_callOAuthApi(self.type(), null, url, "GET", null, null, oauthParams, self.apiSecret(), self._oauthTokenSecret, function (data) {

                if (data != null)
                {
                    if (data ["error_code"] != null)
                    {
                        //失败
                        $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Fail, error);
                    }
                    else
                    {
                        var response = $mob.utils.base64Decode(data["response_data"]);
                        if (response != null)
                        {
                            response = $mob.utils.parseUrlParameters (response);
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
                error_message = "Invalid callback url:[" + callbackUrl + "]";
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
            error_message = "Invalid callback url:[" + callbackUrl + "]";
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
Flickr.prototype.getUserInfo = function (query, callback)
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

        var params = {
            "api_key" : self.apiKey(),
            "user_id" : user.credential.uid,
            "method" : "flickr.people.getInfo"
        };

        self.callApi("https://api.flickr.com/services/rest", "GET", params, null, function (state, data) {

            var resultData = data;
            if (state === $mob.shareSDK.responseState.Success)
            {
                //转换用户数据
                resultData = {"platform_type" : self.type()};
                self._updateUserInfo(resultData, data["person"]);

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
Flickr.prototype.callApi = function (url, method, params, headers, callback)
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
                    "oauth_consumer_key" : self.apiKey(),
                    "oauth_token" : user.credential.token,
                    "oauth_signature_method" : "HMAC-SHA1",
                    "oauth_timestamp" : parseInt(new Date().getTime() / 1000).toString(),
                    "oauth_nonce" : parseInt(Math.random() * 100000).toString(),
                    "oauth_version" : "1.0"
                };

                oauthTokenSecret = user.credential.secret;
            }

            params ["nojsoncallback"] = 1;
            params ["format"] = "json";

            $mob.ext.ssdk_callOAuthApi(self.type(), null, url, method, params, headers, oauthParams, self.apiSecret(), oauthTokenSecret, function (data) {

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

                        var responseString = $mob.utils.base64Decode(data["response_data"]);

                        var response = $mob.utils.jsonStringToObject(responseString);
                        if (response != null)
                        {
                            if (response["stat"] === "ok")
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
                                switch (response["code"])
                                {
                                    case 98:
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
                        else
                        {
                            //判断是否为XML回复
                            $mob.ext.parseXML(responseString, function (data) {

                                if (data.result != null)
                                {
                                    response = data.result;
                                    if (response["name"] === "rsp" && response["attributes"] != null && response["attributes"]["stat"] === "ok")
                                    {
                                        //成功
                                        if (callback)
                                        {
                                            callback ($mob.shareSDK.responseState.Success, response);
                                        }
                                    }
                                    else
                                    {
                                        var code = $mob.shareSDK.errorCode.APIRequestFail;

                                        //判断是否为尚未授权
                                        var errNode = null;
                                        for (var i = 0; i < response["children"].length; i++)
                                        {
                                            var item = response["children"][i];
                                            if (item["name"] === "err")
                                            {
                                                errNode = item;
                                                break;
                                            }
                                        }

                                        var errorCode = errNode["attributes"] != null ? errNode["attributes"]["code"] : 0;
                                        switch (errorCode)
                                        {
                                            case 98:
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

                            });
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
Flickr.prototype.cancelAuthorize = function ()
{
    this._setCurrentUser(null, null);
};

/**
 * 添加好友
 * @param sessionId     会话标识
 * @param user          用户信息
 * @param callback      方法回调，回调方法声明如下:function (stat, data);
 */
Flickr.prototype.addFriend = function (sessionId, user, callback)
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
Flickr.prototype.getFriends = function (cursor, size, callback)
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
Flickr.prototype.share = function (sessionId, parameters, callback)
{
    //获取分享统计标识
    var self = this;
    var error = null;
    var flags = parameters != null ? parameters ["@flags"] : null;
    var userData = {
        "@flags" : flags
    };

    var image = null;
    var images = $mob.shareSDK.getShareParam(this.type(), parameters, "images");
    if (Object.prototype.toString.apply(images) === '[object Array]')
    {
        image = images[0];
    }

    if (image != null)
    {
        //判断是否为网络图片并进行下载
        this._getImagePath(image, function (imageUrl) {

            var mimeType = "application/octet-stream";
            if (/\.jpe?g$/.test(imageUrl))
            {
                mimeType = "image/jpeg";
            }
            else if (/\.png$/.test(imageUrl))
            {
                mimeType = "image/png";
            }
            else if (/\.gif$/.test(imageUrl))
            {
                mimeType = "image/gif";
            }

            var file = {"path" : imageUrl, "mime_type": mimeType};
            var params = {

                "photo" : "@file(" + $mob.utils.objectToJsonString(file) + ")",
                "format" : "json"

            };

            var title = $mob.shareSDK.getShareParam(self.type(), parameters, "title");
            if (title != null)
            {
                params ["title"] = title;
            }

            var desc =  $mob.shareSDK.getShareParam(self.type(), parameters, "text");
            if (desc != null)
            {
                params ["description"] = desc;
            }

            var tags = $mob.shareSDK.getShareParam(self.type(), parameters, "tags");
            if (tags != null)
            {
                //以空格分割
                params ["tags"] = tags.join(" ");
            }

            var isPublic = $mob.shareSDK.getShareParam(self.type(), parameters, "is_public");
            if (isPublic != null)
            {
                params ["is_public"] = isPublic;
            }

            var isFriend = $mob.shareSDK.getShareParam(self.type(), parameters, "is_friend");
            if (isFriend != null)
            {
                params ["is_friend"] = isFriend;
            }

            var isFamily = $mob.shareSDK.getShareParam(self.type(), parameters, "is_family");
            if (isFamily != null)
            {
                params ["is_family"] = isFamily;
            }

            var safetyLevel = $mob.shareSDK.getShareParam(self.type(), parameters, "safety_level");
            if (safetyLevel != null)
            {
                params ["safety_level"] = safetyLevel;
            }

            var contentType = $mob.shareSDK.getShareParam(self.type(), parameters, "content_type");
            if (contentType != null)
            {
                params ["contentType"] = contentType;
            }

            var hidden = $mob.shareSDK.getShareParam(self.type(), parameters, "hidden");
            if (hidden != null)
            {
                params ["hidden"] = hidden;
            }

            self._getCurrentUser(function (user) {

                //转换短链
                self._convertUrl([desc], function(data) {

                    params ["description"] = data.result[0];

                    self.callApi("https://up.flickr.com/services/upload", "POST", params, null, function (state, data) {

                        var resultData = data;
                        if (state === $mob.shareSDK.responseState.Success)
                        {
                            //查找节点数据
                            var photoidNode = null;
                            for (var i = 0; i < data["children"].length; i++)
                            {
                                var item = data["children"][i];
                                if (item["name"] === "photoid")
                                {
                                    photoidNode = item;
                                    break;
                                }
                            }

                            resultData = {};
                            resultData["raw_data"] = photoidNode;
                            resultData["cid"] = photoidNode != null ? photoidNode["text"] : null;
                            resultData["text"] = desc;
                            resultData["images"] = [image];
                        }

                        if (callback != null)
                        {
                            callback (state, resultData, user, userData);
                        }

                    });

                });
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

};

/**
 * 创建用户信息
 * @param rawData       原始用户数据
 * @returns {null}      用户数据
 */
Flickr.prototype.createUserByRawData = function (rawData)
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
Flickr.prototype._convertUrl = function (contents, callback)
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
Flickr.prototype._getImagePath = function (url, callback)
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
Flickr.prototype._updateUserInfo = function (user, rawData)
{
    if (user != null && rawData != null)
    {
        user["raw_data"] = rawData;

        var uid = null;
        if (rawData ["id"] != null)
        {
            uid = rawData ["id"];
        }
        else if (rawData ["nsid"] != null)
        {
            uid = rawData ["nsid"];
        }
        user["uid"] = uid;


        if (rawData["username"] != null)
        {
           user["nickname"] = rawData["username"]["_content"];
        }

        user["gender"] = 2;

        if (rawData["profileurl"] != null)
        {
            user["url"] = rawData["profileurl"]["_content"];
        }

        if (rawData["description"] != null)
        {
            user["about_me"] = rawData["description"]["_content"];
        }
    }
};

/**
 * 授权成功
 * @param sessionId             会话ID
 * @param credentialRawData     授权凭证原始数据
 * @private
 */
Flickr.prototype._succeedAuthorize = function (sessionId, credentialRawData)
{
    var self = this;

    //成功
    var credential = {
        "uid"       : $mob.utils.urlDecode(credentialRawData["user_nsid"]),
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
Flickr.prototype._setCurrentUser = function (user, callback)
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
Flickr.prototype._getCurrentUser = function (callback)
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
Flickr.prototype._webAuthorize = function (sessionId, settings)
{
    var error = null;
    var self = this;
    //先获取OAuth Token
    var url = "https://www.flickr.com/services/oauth/request_token";
    var oauthParams = {
        "oauth_consumer_key" : this.apiKey(),
        "oauth_signature_method" : "HMAC-SHA1",
        "oauth_timestamp" : parseInt(new Date().getTime() / 1000).toString(),
        "oauth_nonce" : parseInt(Math.random() * 100000).toString(),
        "oauth_version" : "1.0",
        "oauth_callback" : FlickrRedirectUri
    };

    $mob.ext.ssdk_callOAuthApi(this.type(), null, url, "GET", null, null, oauthParams, this.apiSecret(), null, function (data) {

        if (data != null)
        {
            if (data ["error_code"] != null)
            {
                //失败
                $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Fail, error);
            }
            else
            {
                var response = $mob.utils.base64Decode(data["response_data"]);
                if (response != null)
                {
                    response = $mob.utils.parseUrlParameters (response);
                    self._oauthToken = response ["oauth_token"];
                    self._oauthTokenSecret = response ["oauth_token_secret"];

                    var authUrl = "https://www.flickr.com/services/oauth/authorize?oauth_token=" + $mob.utils.urlEncode(self._oauthToken);
                    //打开授权
                    $mob.native.ssdk_openAuthUrl(sessionId, authUrl, FlickrRedirectUri);
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
 * 检测应用信息有效性
 * @param appInfo   应用信息
 * @private
 */
Flickr.prototype._checkAppInfoAvailable = function (appInfo)
{
    //过滤
    var apiKey = $mob.utils.trim(appInfo [FlickrAppInfoKeys.ApiKey]);
    var apiSecret = $mob.utils.trim(appInfo [FlickrAppInfoKeys.ApiSecret]);

    if (apiKey != null)
    {
        appInfo [FlickrAppInfoKeys.ApiKey] = apiKey;
    }
    else
    {
        appInfo [FlickrAppInfoKeys.ApiKey] = this.apiKey();
    }

    if (apiSecret != null)
    {
        appInfo [FlickrAppInfoKeys.ApiSecret] = apiSecret;
    }
    else
    {
        appInfo [FlickrAppInfoKeys.ApiSecret] = this.apiSecret();
    }

    return appInfo;
};

/**
 * 检测应用是否有效
 * @returns {boolean}   true 有效 false 无效
 * @private
 */
Flickr.prototype._isAvailable = function ()
{
    if (this.apiKey() != null && this.apiSecret() != null)
    {
        return true;
    }

    $mob.native.log("[ShareSDK-WARNING] [" + this.name() + "]应用信息有误，不能进行相关操作。请检查本地代码中和服务端的[" + this.name() + "]平台应用配置是否有误! " +
        "\n配置:" + $mob.utils.objectToJsonString(this._appInfo));

    return false;
};

//注册平台
$mob.shareSDK.registerPlatformClass($mob.shareSDK.platformType.Flickr, Flickr);
