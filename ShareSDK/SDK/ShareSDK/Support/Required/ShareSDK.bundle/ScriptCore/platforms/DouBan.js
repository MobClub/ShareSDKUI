/**
 * Created with JetBrains WebStorm.
 * User: fenghj
 * Date: 15/7/31
 * Time: 上午11:35
 * To change this template use File | Settings | File Templates.
 */

var $pluginID = "com.mob.sharesdk.DouBan";

/**
 * 豆瓣应用信息键名定义
 * @type {{ApiKey: string, Secret: string, RedirectUri: string, ConvertUrl: string}}
 */
var DouBanAppInfoKeys = {
    "ApiKey"        : "api_key",
    "Secret"        : "secret",
    "RedirectUri"   : "redirect_uri",
    "ConvertUrl"    : "covert_url"
};

/**
 * 豆瓣
 * @param type  平台类型
 * @constructor
 */
function DouBan (type)
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
DouBan.prototype.type = function ()
{
    return this._type;
};

/**
 * 授权状态改变
 * @param sessionId         会话标识
 * @param data              返回数据
 * @private
 */
DouBan.prototype.authStateChanged = function (sessionId, data)
{
    $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Cancel, null);
};

/**
 * 获取平台名称
 * @returns {string}    平台名称
 */
DouBan.prototype.name = function ()
{
    if(this._currentLanguage === "zh-Hans")
    {
        return "豆瓣";
    }
    else
    {
        return "DouBan";
    }
};

/**
 * 获取应用标识
 * @returns {*} 应用标识
 */
DouBan.prototype.apiKey = function ()
{
    if (this._appInfo[DouBanAppInfoKeys.ApiKey] !== undefined) 
    {
        return this._appInfo[DouBanAppInfoKeys.ApiKey];
    }

    return null;
};

/**
 * 获取应用密钥
 * @returns {*} 应用密钥
 */
DouBan.prototype.secret = function ()
{
    if (this._appInfo[DouBanAppInfoKeys.Secret] !== undefined) 
    {
        return this._appInfo[DouBanAppInfoKeys.Secret];
    }

    return null;
};

/**
 * 获取回调地址
 * @returns {*} 回调地址
 */
DouBan.prototype.redirectUri = function ()
{
    if (this._appInfo[DouBanAppInfoKeys.RedirectUri] !== undefined) 
    {
        return this._appInfo[DouBanAppInfoKeys.RedirectUri];
    }

    return null;
};

/**
 * 获取缓存域名
 * @returns {string}    域名
 */
DouBan.prototype.cacheDomain = function ()
{
    return "SSDK-Platform-" + $mob.shareSDK.platformType.DouBan + "-" + this.apiKey();
};

/**
 * 获取是否转换短链
 *
 * @return  true 转换， false 不转换
 */
DouBan.prototype.convertUrlEnabled = function ()
{
    if (this._appInfo[DouBanAppInfoKeys.ConvertUrl] !== undefined) 
    {
        return this._appInfo[DouBanAppInfoKeys.ConvertUrl];
    }

    return $mob.shareSDK.convertUrlEnabled();
};

/**
 * 设置/获取应用信息
 * @param value 应用信息
 * @returns {*}
 */
DouBan.prototype.setAppInfo = function (value)
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
DouBan.prototype.saveConfig = function ()
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
DouBan.prototype.isSupportAuth = function ()
{
    return true;
};

/**
 * 用户授权
 * @param sessionId     授权会话标识
 * @param settings      授权设置
 */
DouBan.prototype.authorize = function (sessionId, settings)
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
DouBan.prototype.handleAuthCallback = function (sessionId, callbackUrl)
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
            params["client_id"] = this.apiKey();
            params["client_secret"] = this.secret();
            params["grant_type"] = "authorization_code";
            params["redirect_uri"] = this.redirectUri();

            //请求AccessToken
            $mob.ext.ssdk_callHTTPApi($mob.shareSDK.platformType.DouBan, null, "https://www.douban.com/service/auth2/token", "POST", params, null, function (data) {

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
                        if (response.code == null)
                        {
                            //成功
                            self._succeedAuthorize(sessionId, response);
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
DouBan.prototype.cancelAuthorize = function ()
{
    this._setCurrentUser(null, null);
};

/**
 * 添加好友
 * @param sessionId     会话标识
 * @param user          用户信息
 * @param callback      方法回调，回调方法声明如下:function (stat, data);
 */
DouBan.prototype.addFriend = function (sessionId, user, callback)
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
DouBan.prototype.getFriends = function (cursor, size, callback)
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
DouBan.prototype.share = function (sessionId, parameters, callback)
{
    var text = null;
    var url = null;
    var title = null;
    var desc = null;
    var images = null;
    var image = null;
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


    var requestUrl = "https://api.douban.com/shuo/v2/statuses/";
    var params = null;
    switch (type)
    {
        case $mob.shareSDK.contentType.Text:
        {
            text = $mob.shareSDK.getShareParam(this.type(), parameters, "text");
            params = {
                "text" : text
            };

            this._getCurrentUser(function (user) {

                self._convertUrl([text], function(data) {

                    params["text"] = data.result[0];
                    self.callApi(requestUrl, "POST", params, null, function (state, data) {

                        var resultData = data;
                        if (state === $mob.shareSDK.responseState.Success)
                        {
                            //转换数据
                            if (data != null)
                            {
                                resultData = {};
                                resultData["raw_data"] = data;
                                resultData["cid"] = data["id"];
                                resultData["text"] = data["text"];
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
            images = $mob.shareSDK.getShareParam(this.type(), parameters, "images");
            if (Object.prototype.toString.apply(images) === '[object Array]')
            {
                image = images [0];
            }

            text = $mob.shareSDK.getShareParam(this.type(), parameters, "text");

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
                    params = {
                        "image" : "@file(" + $mob.utils.objectToJsonString(file) + ")",
                        "text" : text
                    };

                    self._getCurrentUser(function (user) {

                        self._convertUrl([text], function(data) {

                            params["text"] = data.result[0];
                            self.callApi(requestUrl, "POST", params, null, function (state, data) {

                                var resultData = data;
                                if (state === $mob.shareSDK.responseState.Success)
                                {
                                    //转换数据
                                    if (data != null)
                                    {
                                        resultData = {};
                                        resultData["raw_data"] = data;
                                        resultData["cid"] = data["id"];
                                        resultData["text"] = data["text"];

                                        //获取图片
                                        resultData["images"] = [];
                                        var attachments = data ["attachments"];
                                        if (attachments != null)
                                        {
                                            for (var i = 0; i < attachments.length; i++)
                                            {
                                                var medias = attachments[i]["media"];
                                                if (medias != null)
                                                {
                                                    for (var j = 0; j < medias.length; j++)
                                                    {
                                                        var media = medias[j];
                                                        if (media["type"] === "image")
                                                        {
                                                            resultData["images"].push(media["src"]);
                                                            break;
                                                        }
                                                    }
                                                }
                                            }
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
        }
        case $mob.shareSDK.contentType.WebPage:
            url = $mob.shareSDK.getShareParam(this.type(), parameters, "url");
            text = $mob.shareSDK.getShareParam(this.type(), parameters, "text");
            title = $mob.shareSDK.getShareParam(this.type(), parameters, "title");
            desc =  $mob.shareSDK.getShareParam(this.type(), parameters, "desc");
            image = $mob.shareSDK.getShareParam(this.type(), parameters, "url_image");

            images = $mob.shareSDK.getShareParam(this.type(), parameters, "images");
            if (Object.prototype.toString.apply(images) === '[object Array]')
            {
                //获取网络图片
                for (var i = 0; i < images.length; i++)
                {
                    if (!/^(file\:\/)?\//.test(images[i]))
                    {
                        image = images[i];
                        break;
                    }
                }
            }

            if (title != null && url != null)
            {
                params = {
                    "text" : text,
                    "rec_title" : title,
                    "rec_url" : url,
                    "rec_desc" : desc,
                    "rec_image" : image
                };

                self._getCurrentUser(function (user) {

                    self._convertUrl([text, desc, url], function(data) {

                        params["text"] = data.result[0];
                        params["rec_desc"] = data.result[1];
                        params["rec_url"] = data.result[2];

                        self.callApi(requestUrl, "POST", params, null, function (state, data) {

                            var resultData = data;
                            if (state === $mob.shareSDK.responseState.Success)
                            {
                                //转换数据
                                if (data != null)
                                {
                                    resultData = {};
                                    resultData["raw_data"] = data;
                                    resultData["cid"] = data["id"];
                                    resultData["text"] = data["text"];
                                    resultData["urls"] = [url];

                                    //获取图片
                                    resultData["images"] = [];
                                    var attachments = data ["attachments"];
                                    if (attachments != null)
                                    {
                                        for (var i = 0; i < attachments.length; i++)
                                        {
                                            var medias = attachments[i]["media"];
                                            if (medias != null)
                                            {
                                                for (var j = 0; j < medias.length; j++)
                                                {
                                                    var media = medias[j];
                                                    if (media["type"] === "image")
                                                    {
                                                        resultData["images"].push(media["src"]);
                                                        break;
                                                    }
                                                }
                                            }
                                        }
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
                    error_message = "分享参数url、title不能为空!";
                }
                else
                {
                    error_message = "share param url or title can not be nil!";
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
DouBan.prototype.getUserInfo = function (query, callback)
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

    self._getCurrentUser(function (user) {

        self.callApi("https://api.douban.com/v2/user/~me", "GET", null, null, function (state, data) {

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
DouBan.prototype.callApi = function (url, method, params, headers, callback)
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

            params["source"] = self.apiKey();

            //将授权用户的授权令牌作为参数进行HTTP请求
            if (user.credential != null)
            {
                headers["Authorization"] = "Bearer " + user.credential.token;
            }

            $mob.ext.ssdk_callHTTPApi($mob.shareSDK.platformType.DouBan, null, url, method, params, headers, function (data) {

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
                            if (response["code"] == null && response["r"] == null)
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
                                    case 102:
                                    case 103:
                                    case 106:
                                    case 118:
                                    case 119:
                                    case 123:
                                    case 124:
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
DouBan.prototype.createUserByRawData = function (rawData)
{
    //转换用户数据
    var user = {
        "platform_type" : this.type()
    };
    this._updateUserInfo(user, rawData);
    return $mob.utils.objectToJsonString(user);
};

/**
 * 获取图片路径
 * @param url           图片路径
 * @param callback      回调
 * @private
 */
DouBan.prototype._getImagePath = function (url, callback)
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
 * 转换链接
 * @param contents      内容列表
 * @param callback      回调
 * @private
 */
DouBan.prototype._convertUrl = function (contents, callback)
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
DouBan.prototype._getShareType = function (parameters)
{
    var type = $mob.shareSDK.contentType.Text;

    var url = $mob.shareSDK.getShareParam(this.type(), parameters, "url");
    var title = $mob.shareSDK.getShareParam(this.type(), parameters, "title");
    if (url != null && title != null)
    {
        type = $mob.shareSDK.contentType.WebPage;
    }
    else
    {
        var images = $mob.shareSDK.getShareParam(this.type(), parameters, "images");
        if (Object.prototype.toString.apply(images) === '[object Array]')
        {

            type = $mob.shareSDK.contentType.Image;
        }
    }


    return type;
};

/**
 * 更新用户信息
 * @param user      用户信息
 * @param rawData   原始数据
 * @private
 */
DouBan.prototype._updateUserInfo = function (user, rawData)
{
    if (user != null && rawData != null)
    {
        user["raw_data"] = rawData;
        user["uid"] = rawData ["id"];
        user["nickname"] = rawData["name"];

        if (rawData["large_avatar"] != null)
        {
            user["icon"] = rawData["large_avatar"];
        }
        else if (rawData["avatar"])
        {
            user["icon"] = rawData["avatar"];
        }
        else if (rawData["small_avatar"])
        {
            user["icon"] = rawData["small_avatar"];
        }

        //性别
        user["gender"] = 2;
        user["url"] = rawData["alt"];

        if (rawData["created"] != null)
        {
            var date = null;
            var exp = /(\d+)-(\d+)-(\d+) (\d+):(\d+):(\d+)/;
            if (exp.test(rawData["created"]))
            {
                var res = exp.exec(rawData["created"]);
                date = new Date(res[1], res[2] - 1, res[3], res[4], res[5], res[6]);
            }
            else
            {
                date = new Date(rawData["created"]);
            }

            if (date.toString() !== "Invalid Date")
            {
                user["reg_at"] = date.getTime();
            }

        }


    }
};

/**
 * 网页授权
 * @param sessionId     会话标识
 * @param settings      授权设置
 * @private
 */
DouBan.prototype._webAuthorize = function (sessionId, settings)
{
    var url = "https://www.douban.com/service/auth2/auth?client_id=" + this.apiKey() + "&response_type=code&redirect_uri=" + $mob.utils.urlEncode(this.redirectUri()) + "&display=mobile";
    $mob.native.ssdk_openAuthUrl(sessionId, url, this.redirectUri());
};

/**
 * 授权成功
 * @param sessionId             会话ID
 * @param credentialRawData     授权凭证原始数据
 * @private
 */
DouBan.prototype._succeedAuthorize = function (sessionId, credentialRawData)
{
    var self = this;

    //成功
    var credential = {
        "uid"       : credentialRawData["douban_user_id"],
        "token"     : credentialRawData["access_token"],
        "expired"   : (new Date().getTime() +  credentialRawData ["expires_in"] * 1000),
        "raw_data"  : credentialRawData,
        "type"      : $mob.shareSDK.credentialType.OAuth2
    };

    var user = {
        "platform_type" : $mob.shareSDK.platformType.DouBan,
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
DouBan.prototype._setCurrentUser = function (user, callback)
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
DouBan.prototype._getCurrentUser = function (callback)
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
 * 检测应用是否有效
 * @returns {boolean}   true 有效 false 无效
 * @private
 */
DouBan.prototype._isAvailable = function ()
{
    if (this.apiKey() != null && this.secret() != null && this.redirectUri() != null)
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
DouBan.prototype._checkAppInfoAvailable = function (appInfo)
{
    var apiKey = $mob.utils.trim(appInfo [DouBanAppInfoKeys.ApiKey]);
    var secret = $mob.utils.trim(appInfo [DouBanAppInfoKeys.Secret]);
    var redirectUri = $mob.utils.trim(appInfo [DouBanAppInfoKeys.RedirectUri]);
    
    if (apiKey != null)
    {
        appInfo [DouBanAppInfoKeys.ApiKey] = apiKey;
    }
    else
    {
        appInfo [DouBanAppInfoKeys.ApiKey] = this.apiKey();
    }
    
    if (secret != null)
    {
        appInfo [DouBanAppInfoKeys.Secret] = secret;
    }
    else
    {
        appInfo [DouBanAppInfoKeys.Secret] = this.secret();
    }

    if (redirectUri != null)
    {
        appInfo [DouBanAppInfoKeys.RedirectUri] = redirectUri;
    }
    else
    {
        appInfo [DouBanAppInfoKeys.RedirectUri] = this.redirectUri();
    }
        
    return appInfo;
};

//注册平台
$mob.shareSDK.registerPlatformClass($mob.shareSDK.platformType.DouBan, DouBan);
