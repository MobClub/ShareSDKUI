/**
 * Created with JetBrains WebStorm.
 * User: fenghj
 * Date: 15/6/16
 * Time: 下午1:58
 * To change this template use File | Settings | File Templates.
 */

var $pluginID = "com.mob.sharesdk.TencentWeibo";

/**
 * 腾讯微博应用信息键名定义
 * @type {{AppKey: string, AppSecret: string, RedirectUri: string}}
 */
var TencentWeiboAppInfoKeys = {
    "AppKey"        : "app_key",
    "AppSecret"     : "app_secret",
    "RedirectUri"   : "redirect_uri",
    "ConvertUrl"    : "covert_url"
};

/**
 * 腾讯微博
 * @param type  平台类型
 * @constructor
 */
function TencentWeibo (type)
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
TencentWeibo.prototype.type = function ()
{
    return this._type;
};

/**
 * 获取平台名称
 * @returns {string}    平台名称
 */
TencentWeibo.prototype.name = function ()
{
    
    if(this._currentLanguage === "zh-Hans")
    {
        return "腾讯微博";
    }
    else
    {
        return "TencentWeibo";
    }

};

/**
 * 获取应用标识
 * @returns {*} 应用标识
 */
TencentWeibo.prototype.appKey = function ()
{
    if (this._appInfo[TencentWeiboAppInfoKeys.AppKey] !== undefined) 
    {
        return this._appInfo[TencentWeiboAppInfoKeys.AppKey];
    }

    return null;
};

/**
 * 获取应用密钥
 * @returns {*} 应用密钥
 */
TencentWeibo.prototype.appSecret = function ()
{
    if (this._appInfo[TencentWeiboAppInfoKeys.AppSecret] !== undefined) 
    {
        return this._appInfo[TencentWeiboAppInfoKeys.AppSecret];
    }

    return null;
};

/**
 * 获取回调地址
 * @returns {*} 回调地址
 */
TencentWeibo.prototype.redirectUri = function ()
{
    if (this._appInfo[TencentWeiboAppInfoKeys.RedirectUri] !== undefined) 
    {
        return this._appInfo[TencentWeiboAppInfoKeys.RedirectUri];
    }

    return null;
};

/**
 * 获取缓存域名
 * @returns {string}    域名
 */
TencentWeibo.prototype.cacheDomain = function ()
{
    return "SSDK-Platform-" + this.type() + "-" + this.appKey();
};

/**
 * 获取是否转换短链
 *
 * @return  true 转换， false 不转换
 */
TencentWeibo.prototype.convertUrlEnabled = function ()
{
    if (this._appInfo[TencentWeiboAppInfoKeys.ConvertUrl] !== undefined) 
    {
        return this._appInfo[TencentWeiboAppInfoKeys.ConvertUrl];
    }

    return $mob.shareSDK.convertUrlEnabled();
};

/**
 * 设置/获取应用信息
 * @param value 应用信息
 * @returns {*}
 */
TencentWeibo.prototype.setAppInfo = function (value)
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
TencentWeibo.prototype.saveConfig = function ()
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

            curApps["plat_" + self.type()] = self.appKey();
            $mob.ext.setCacheData("currentApp", curApps, false, domain, null);
        }

    });
};

/**
 * 获取是否支持授权
 * @returns {boolean} true 支持， false 不支持
 */
TencentWeibo.prototype.isSupportAuth = function ()
{
    return true;
};

/**
 * 用户授权
 * @param sessionId     授权会话标识
 * @param settings      授权设置
 */
TencentWeibo.prototype.authorize = function (sessionId, settings)
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
TencentWeibo.prototype.handleAuthCallback = function (sessionId, callbackUrl)
{
    var error = null;
    var self = this;
    var error_message;
    var urlInfo = $mob.utils.parseUrl(callbackUrl);
    if (urlInfo != null && urlInfo.fragment != null)
    {
        var params = $mob.utils.parseUrlParameters(urlInfo.fragment);
        if (params != null)
        {
            //成功
            self._succeedAuthorize(sessionId, params);
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
 * 取消授权
 */
TencentWeibo.prototype.cancelAuthorize = function ()
{
    this._setCurrentUser(null, null);
};

/**
 * 添加好友
 * @param sessionId     会话标识
 * @param user          用户信息
 * @param callback      方法回调，回调方法声明如下:function (stat, data);
 */
TencentWeibo.prototype.addFriend = function (sessionId, user, callback)
{
    var params = {};
    if (user["uid"] != null)
    {
        params ["fopenids"] = user ["uid"];
    }
    else if (user["nickname"] != null)
    {
        params ["name"] = user ["nickname"];
    }

    var self = this;
    this.callApi("https://open.t.qq.com/api/friends/add", "POST", params, null, function (state, data) {

        var resultData = data;
        if (state === $mob.shareSDK.responseState.Success)
        {
            //转换用户数据
            resultData = {"platform_type" : $mob.shareSDK.platformType.TencentWeibo};
            self._updateUserInfo(resultData, data["data"]);
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
TencentWeibo.prototype.getFriends = function (cursor, size, callback)
{
    var self = this;

    var params = {
        "format" : "json",
        "startindex" : cursor,
        "reqnum" : size
    };

    self.callApi("https://open.t.qq.com/api/friends/idollist", "GET", params, null, function (state, data) {

        var resultData = data;
        if (state === $mob.shareSDK.responseState.Success)
        {

            //转换数据
            var item = data["data"];

            resultData = {};
            resultData["prev_cursor"] = cursor - size;
            resultData["next_cursor"] = cursor + size;

            if (resultData["prev_cursor"] < 0)
            {
                resultData["prev_cursor"] = 0;
            }

            if (item != null && item["hasnext"] != null)
            {
                resultData["has_next"] = (item["hasnext"] === 0);
            }


            if (item ["info"] != null)
            {
                //转换用户数据
                var users = [];
                var rawUsersData = item["info"];
                if (rawUsersData != null)
                {
                    for (var i = 0; i < rawUsersData.length; i++)
                    {
                        var user = {"platform_type" : $mob.shareSDK.platformType.TencentWeibo};
                        self._updateUserInfo(user, rawUsersData[i]);
                        users.push(user);
                    }
                }
                resultData["users"] = users;
            }
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
TencentWeibo.prototype.share = function (sessionId, parameters, callback)
{
    var text = null;
    var lat = null;
    var lng = null;
    var self = this;

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


    var url = null;
    var params = null;
    switch (type)
    {
        case $mob.shareSDK.contentType.Text:
        {
            url = "https://open.t.qq.com/api/t/add";

            text = $mob.shareSDK.getShareParam(this.type(), parameters, "text");
            params = {
                "format" : "json",
                "content" : text
            };

            lat = $mob.shareSDK.getShareParam(this.type(), parameters, "lat");
            lng = $mob.shareSDK.getShareParam(this.type(), parameters, "long");

            if (lat != null && lng != null)
            {
                params["latitude"] = lat;
                params["longitude"] = lng;
            }

            this._getCurrentUser(function (user) {

                self._convertUrl([text], function(data) {

                    params["content"] = data.result[0];
                    self.callApi(url, "POST", params, null, function (state, data) {

                        var resultData = data;
                        if (state === $mob.shareSDK.responseState.Success)
                        {
                            //转换数据
                            var item = data["data"];

                            resultData = {};
                            resultData["raw_data"] = item;
                            resultData["cid"] = item != null ? item["id"] : null;
                            resultData["text"] = text;

                            if (data ["imgurl"] != null)
                            {
                                resultData["images"] = [data ["imgurl"]];
                            }
                        }

                        if (callback != null)
                        {
                            callback (state, resultData, user, userData);
                        }

                    });

                });

            });

            break;
        }
        case $mob.shareSDK.contentType.Image:
        {
            url = "https://open.t.qq.com/api/t/add_pic_url";

            var images = $mob.shareSDK.getShareParam(this.type(), parameters, "images");
            text = $mob.shareSDK.getShareParam(this.type(), parameters, "text");

            params = {
                "format" : "json",
                "content" : text
            };

            lat = $mob.shareSDK.getShareParam(this.type(), parameters, "lat");
            lng = $mob.shareSDK.getShareParam(this.type(), parameters, "long");

            if (lat != null && lng != null)
            {
                params["latitude"] = lat;
                params["longitude"] = lng;
            }

            this._setImagesToParams(images, 0, function (images) {

                params["pic_url"] = images.join(",");

                //分享内容
                self._getCurrentUser(function (user) {

                    self._convertUrl([text], function (data) {

                        params["content"] = data.result[0];
                        self.callApi(url, "POST", params, null, function (state, data) {

                            var resultData = data;
                            if (state === $mob.shareSDK.responseState.Success)
                            {
                                //转换数据
                                var item = data["data"];

                                resultData = {};
                                resultData["raw_data"] = item;
                                resultData["cid"] = item != null ? item["id"] : null;
                                resultData["text"] = text;

                                if (params ["pic_url"] != null)
                                {
                                    resultData["images"] = params ["pic_url"].split(",");
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
};

/**
 * 获取用户信息
 * @param query         查询信息
 * @param callback      方法回调
 */
TencentWeibo.prototype.getUserInfo = function (query, callback)
{
    var self = this;
    var url = null;
    var params = {"format" : "json"};

    if (query != null)
    {
        url = "https://open.t.qq.com/api/user/other_info";
        if (query.uid != null)
        {
            params["fopenid"] = query.uid;
        }
        else if (query.name != null)
        {
            params["name"] = query.name;
        }
    }
    else
    {
        url = "https://open.t.qq.com/api/user/info";
    }

    this._getCurrentUser(function(user) {

        self.callApi(url, "GET", params, null, function (state, data) {

            var resultData = data;
            if (state === $mob.shareSDK.responseState.Success)
            {
                //转换用户数据
                resultData = {"platform_type" : $mob.shareSDK.platformType.TencentWeibo};
                self._updateUserInfo(resultData, data["data"]);

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
TencentWeibo.prototype.callApi = function (url, method, params, headers, callback)
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

            params["oauth_consumer_key"] = self.appKey();
            params["clientip"] = "127.0.0.1";
            params["oauth_version"] = "2.a";
            params["scope"] = "all";

            //将授权用户的授权令牌作为参数进行HTTP请求
            if (user.credential != null)
            {
                params["openid"] = user.credential.uid;
                params["access_token"] = user.credential.token;
            }

            $mob.ext.ssdk_callHTTPApi($mob.shareSDK.platformType.TencentWeibo, null, url, method, params, headers, function (data) {

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
                            if (response["errcode"] == null || response["errcode"] === 0)
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
                                switch (response["errcode"])
                                {
                                    case 34:
                                    case 36:
                                    case 37:
                                    case 38:
                                    case 40:
                                    case 41:
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
TencentWeibo.prototype.createUserByRawData = function (rawData)
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
TencentWeibo.prototype._convertUrl = function (contents, callback)
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
 * 设置图片列表到参数中
 * @param images        图片列表
 * @param index         图片索引
 * @param callback      回调
 * @private
 */
TencentWeibo.prototype._setImagesToParams = function (images, index, callback)
{
    if (index < images.length)
    {
        var self = this;
        var url = "https://open.t.qq.com/api/t/upload_pic";
        var uploadParams = {"format" : "json"};

        var image = images [index];
        if (/^(file\:\/)?\//.test(image))
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
            uploadParams["pic"] = "@file(" + $mob.utils.objectToJsonString(file) + ")";
            uploadParams["pic_type"] = 2;

        }
        else
        {
            //网络图片
            uploadParams["pic_url"] = image;
            uploadParams["pic_type"] = 1;

        }

        this.callApi(url, "POST", uploadParams, null, function (state, data) {

            if (state === $mob.shareSDK.responseState.Success)
            {
                var item = data ["data"];
                if (item != null && item["imgurl"] != null)
                {
                    images[index] = item["imgurl"];
                    index ++;
                }
                else
                {
                    //移除对象
                    images.splice(index, 1);
                }
            }
            else
            {
                //进行下一张图片处理
                index ++;
            }

            self._setImagesToParams(images, index, callback);

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
 * 用户是否有效
 * @param user      用户信息
 * @returns {boolean}   如果授权凭证过期或者不存在则返回false，否则返回true
 * @private
 */
TencentWeibo.prototype._isUserAvaliable = function (user)
{
    return user.credential != null && user.credential.token != null && user.credential.expired > new Date().getTime();
};

/**
 * 检测应用信息有效性
 * @param appInfo   应用信息
 * @private
 */
TencentWeibo.prototype._checkAppInfoAvailable = function (appInfo)
{
    //过滤
    var appKey = $mob.utils.trim(appInfo [TencentWeiboAppInfoKeys.AppKey]);
    var appSecret = $mob.utils.trim(appInfo [TencentWeiboAppInfoKeys.AppSecret]);
    var redirectUri = $mob.utils.trim(appInfo [TencentWeiboAppInfoKeys.RedirectUri]);

    if (appKey != null)
    {
        appInfo [TencentWeiboAppInfoKeys.AppKey] = appKey;
    }
    else
    {
        appInfo [TencentWeiboAppInfoKeys.AppKey] = this.appKey();    
    }

    if (appSecret != null)
    {
        appInfo [TencentWeiboAppInfoKeys.AppSecret] = appSecret;
    }
    else
    {
        appInfo [TencentWeiboAppInfoKeys.AppSecret] = this.appSecret();    
    }

    if (redirectUri != null)
    {
        appInfo [TencentWeiboAppInfoKeys.RedirectUri] = redirectUri;
    }
    else
    {
        appInfo [TencentWeiboAppInfoKeys.RedirectUri] = this.redirectUri();   
    }

    return appInfo;
};


/**
 * 检测应用是否有效
 * @returns {boolean}   true 有效 false 无效
 * @private
 */
TencentWeibo.prototype._isAvailable = function ()
{
    if (this.appKey() != null && this.appSecret() != null && this.redirectUri() != null)
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
TencentWeibo.prototype._webAuthorize = function (sessionId, settings)
{
    var url = "https://open.t.qq.com/cgi-bin/oauth2/authorize?client_id=" + this.appKey() + "&response_type=token&redirect_uri=" + $mob.utils.urlEncode(this.redirectUri()) + "&wap=2&appfrom=ios";
    $mob.native.log(url);
    $mob.native.ssdk_openAuthUrl(sessionId, url, this.redirectUri());
};

/**
 * 授权成功
 * @param sessionId             会话ID
 * @param credentialRawData     授权凭证原始数据
 * @private
 */
TencentWeibo.prototype._succeedAuthorize = function (sessionId, credentialRawData)
{
    var self = this;

    //成功
    var credential = {
        "uid"       : credentialRawData["openid"],
        "token"     : credentialRawData["access_token"],
        "expired"   : (new Date().getTime() +  credentialRawData ["expires_in"] * 1000),
        "raw_data"  : credentialRawData,
        "type"      : $mob.shareSDK.credentialType.OAuth2
    };

    var user = {
        "platform_type" : $mob.shareSDK.platformType.TencentWeibo,
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
TencentWeibo.prototype._setCurrentUser = function (user, callback)
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
TencentWeibo.prototype._getCurrentUser = function (callback)
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
TencentWeibo.prototype._updateUserInfo = function (user, rawData)
{
    var list = null;
    var item = null;
    var i = null;
    if (user != null && rawData != null)
    {
        user["raw_data"] = rawData;
        user["uid"] = rawData ["name"];
        user["nickname"] = rawData["nick"];
        user["icon"] = rawData["head"] + "/120";

        //性别
        var gender = 2;
        switch (rawData["sex"])
        {
            case 0:
                gender = 2;
                break;
            case 1:
                gender = 0;
                break;
            case 2:
                gender = 1;
                break;
        }
        user["gender"] = gender;

        //微博地址
        if (rawData["name"] != null)
        {
            user["url"] = "http://t.qq.com/" + rawData["name"];
        }

        user["about_me"] = rawData["introduction"];
        user["verify_type"] = rawData["isvip"] ? 1 : 0;
        user["verify_reason"] = rawData["verifyinfo"];

        //生日
        var date = new Date(rawData["birth_year"], rawData["birth_month"], rawData["birth_day"]);
        user["birthday"] = date.getTime() / 1000;

        user["follower_count"] = rawData["fansnum"];
        user["friend_count"] = rawData["idolnum"];
        user["share_count"] = rawData["tweetnum"];
        user["reg_at"] = rawData["regtime"] * 1000;
        user["level"] = rawData["level"];

        //教育
        var edus = rawData["edu"];
        if (edus != null)
        {
            list = [];
            for (i = 0; i < edus.length; i++)
            {
                item = {};
                var edu = edus[i];

                var school = edu["schoolid"];
                if (school != null)
                {
                    item["school"] = school;
                }

                var classes = edu["departmentid"];
                if (classes != null)
                {
                    item["classes"] = classes;
                }

                var year = edu["year"];
                if (year != null)
                {
                    item["year"] = year;
                }

                list.push(item);
            }

            user["educations"] = list;
        }

        //工作
        var works = rawData["comp"];
        if (works != null)
        {
            list = [];
            for (i = 0; i < works.length; i++)
            {
                item = {};
                var work = works[i];

                var company = work["company_name"];
                if (company != null)
                {
                    item["company"] = company;
                }

                var depart = work["department_name"];
                if (depart != null)
                {
                    item["dept"] = depart;
                }

                var beginYear = work["begin_year"];
                if (beginYear != null && beginYear > 0 && beginYear !== 9999)
                {
                    item["start_date"] = beginYear * 100;
                }
                else
                {
                    item["start_date"] = 0;
                }

                var endYear = work["end_year"];
                if (endYear != null && endYear > 0 && endYear !== 9999)
                {
                    item["end_date"] = endYear * 100;
                }
                else
                {
                    item["end_date"] = 0;
                }

                list.push(item);

            }

            user["works"] = list;

        }

    }
};

/**
 * 根据分享参数返回分享类型
 * @param parameters            分享参数
 * @private
 */
TencentWeibo.prototype._getShareType = function (parameters)
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
 * 授权状态改变
 * @param sessionId         会话标识
 * @param data              返回数据
 * @private
 */
TencentWeibo.prototype.authStateChanged = function (sessionId, data)
{
    $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Cancel, null);
};

//注册平台
$mob.shareSDK.registerPlatformClass($mob.shareSDK.platformType.TencentWeibo, TencentWeibo);
