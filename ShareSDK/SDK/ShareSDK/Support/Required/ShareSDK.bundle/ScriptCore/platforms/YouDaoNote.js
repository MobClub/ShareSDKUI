/**
 * Created with JetBrains WebStorm.
 * User: fenghj
 * Date: 15/9/18
 * Time: 下午12:05
 * To change this template use File | Settings | File Templates.
 */

var $pluginID = "com.mob.sharesdk.youdaonote";

/**
 * Flickr应用信息键名定义
 * @type {{AppKey: string, AppSecret: string, RedirectUri: string}}
 */
var YouDaoNoteInfoKeys = {
    "ConsumerKey"        : "consumer_key",
    "ConsumerSecret"     : "consumer_secret",
    "RedirectUri"        : "oauth_callback",
    "ConvertUrl"         : "covert_url"
};

/**
 * WhatsApp
 * @param type  平台类型
 * @constructor
 */
function YouDaoNote (type)
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
YouDaoNote.prototype.type = function ()
{
    return this._type;
};

/**
 * 获取平台名称
 * @returns {string}    平台名称
 */
YouDaoNote.prototype.name = function ()
{
    
    if(this._currentLanguage === "zh-Hans")
    {
        return "有道云笔记";
    }
    else
    {
        return "YouDaoNote";
    }
  
};

/**
 * 获取应用标识
 * @returns {*} 应用标识
 */
YouDaoNote.prototype.consumerKey = function ()
{
    if (this._appInfo[YouDaoNoteInfoKeys.ConsumerKey] !== undefined) 
    {
        return this._appInfo[YouDaoNoteInfoKeys.ConsumerKey];
    }

    return null;
};

/**
 * 获取应用密钥
 * @returns {*} 应用密钥
 */
YouDaoNote.prototype.consumerSecret = function ()
{
    if (this._appInfo[YouDaoNoteInfoKeys.ConsumerSecret] !== undefined) 
    {
        return this._appInfo[YouDaoNoteInfoKeys.ConsumerSecret];
    }

    return null;
};

/**
 * 获取应用密钥
 * @returns {*} 应用密钥
 */
YouDaoNote.prototype.redirectUri = function ()
{
    if (this._appInfo[YouDaoNoteInfoKeys.RedirectUri] !== undefined) 
    {
        return this._appInfo[YouDaoNoteInfoKeys.RedirectUri];
    }

    return null;
};

/**
 * 获取缓存域名
 * @returns {string}    域名
 */
YouDaoNote.prototype.cacheDomain = function ()
{
    return "SSDK-Platform-" + this.type() + "-" + this.consumerKey();
};

/**
 * 获取是否转换短链
 *
 * @return  true 转换， false 不转换
 */
YouDaoNote.prototype.convertUrlEnabled = function ()
{
    if (this._appInfo[YouDaoNoteInfoKeys.ConvertUrl] !== undefined) 
    {
        return this._appInfo[YouDaoNoteInfoKeys.ConvertUrl];
    }
    return $mob.shareSDK.convertUrlEnabled();
};

/**
 * 设置/获取应用信息
 * @param value 应用信息
 * @returns {*}
 */
YouDaoNote.prototype.setAppInfo = function (value)
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
YouDaoNote.prototype.saveConfig = function ()
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
YouDaoNote.prototype.isSupportAuth = function ()
{
    return true;
};

/**
 * 用户授权
 * @param sessionId     授权会话标识
 * @param settings      授权设置
 */
YouDaoNote.prototype.authorize = function (sessionId, settings)
{
    var error = null;
    if (this._isAvailable())
    {
        //进行网页授权
        this._webAuthorize(sessionId, settings);
    }
    else
    {
        var errorStr = null;
    
        if(this._currentLanguage === "zh-Hans")
        {
            errorStr = "分享平台［" + this.name() + "］应用信息无效!";
        }
        else
        {
            errorStr = "Platform［" + this.name() + "］Invalid congfiguration!";
        }

        error = {
            "error_code" : $mob.shareSDK.errorCode.InvaildPlatform,
            "error_message" : errorStr
        };
        $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Fail, error);
    }
};

/**
 * 处理用户授权回调
 * @param sessionId     授权会话标识
 * @param callbackUrl   回调地址
 */
YouDaoNote.prototype.handleAuthCallback = function (sessionId, callbackUrl)
{
    var error = null;
    var self = this;
    var errorStr;
    var urlInfo = $mob.utils.parseUrl(callbackUrl);
    if (urlInfo != null && urlInfo.query != null)
    {
        var response = $mob.utils.parseUrlParameters(urlInfo.query);
        if (response != null && response.code != null)
        {
            var params = {

                "client_id" : this.consumerKey(),
                "client_secret" : this.consumerSecret(),
                "grant_type" : "authorization_code",
                "redirect_uri" : this.redirectUri(),
                "code" : response.code

            };

            //请求AccessToken
            $mob.ext.ssdk_callHTTPApi(self.type(), null, "https://note.youdao.com/oauth/access2", "POST", params, null, function (data) {

                if (data != null)
                {

                    var response = $mob.utils.jsonStringToObject($mob.utils.base64Decode(data["response_data"]));
                    if (response.error == null)
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
                        "error_code" : $mob.shareSDK.errorCode.APIRequestFail
                    };
                    $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Fail, error);
                }

            });
        }
        else
        {
            errorStr= null;
 
            if(this._currentLanguage === "zh-Hans")
            {
                errorStr = "无效的授权回调:[" + callbackUrl + "]";
            }
            else
            {
                errorStr = "invalid callback url:[" + callbackUrl + "]";
            }

            error = {
                "error_code" : $mob.shareSDK.errorCode.InvalidAuthCallback,
                "error_message" : errorStr
            };
            $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Fail, error);
        }
    }
    else
    {
        errorStr = null;
 
        if(this._currentLanguage === "zh-Hans")
        {
            errorStr = "无效的授权回调:[" + callbackUrl + "]";
        }
        else
        {
            errorStr = "invalid callback url:[" + callbackUrl + "]";
        }

        error = {
            "error_code" : $mob.shareSDK.errorCode.InvalidAuthCallback,
            "error_message" : errorStr
        };
        $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Fail, error);
    }
};

/**
 * 取消授权
 */
YouDaoNote.prototype.cancelAuthorize = function ()
{
    this._setCurrentUser(null, null);
};

/**
 * 添加好友
 * @param sessionId     会话标识
 * @param user          用户信息
 * @param callback      方法回调，回调方法声明如下:function (stat, data);
 */
YouDaoNote.prototype.addFriend = function (sessionId, user, callback)
{
    var errorStr = null;
    
    if(this._currentLanguage === "zh-Hans")
    {
        errorStr = "平台［" + this.name() + "］不支持添加好友方法!";
    }
    else
    {
        errorStr = "Platform［" + this.name() + "］do not support adding friends";
    }

    var error = {
        "error_code" : $mob.shareSDK.errorCode.UnsupportFeature,
        "error_message" : errorStr
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
YouDaoNote.prototype.getFriends = function (cursor, size, callback)
{
    var errorStr = null;
    
    if(this._currentLanguage === "zh-Hans")
    {
        errorStr = "平台［" + this.name() + "不支持获取好友列表方法!";
    }
    else
    {
        errorStr = "Platform［" + this.name() + "］do not support getting friend list";
    }

    var error = {
        "error_code" : $mob.shareSDK.errorCode.UnsupportFeature,
        "error_message" : errorStr
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
YouDaoNote.prototype.share = function (sessionId, parameters, callback)
{

    var self = this;

    //获取分享统计标识
    var flags = parameters != null ? parameters ["@flags"] : null;
    var userData = {
        "@flags" : flags
    };

    var text = $mob.shareSDK.getShareParam(this.type(), parameters, "text");
    var images = $mob.shareSDK.getShareParam(this.type(), parameters, "images");
    var title = $mob.shareSDK.getShareParam(this.type(), parameters, "title");
    var source = $mob.shareSDK.getShareParam(this.type(), parameters, "source");
    var author = $mob.shareSDK.getShareParam(this.type(), parameters, "author");
    var notebook = $mob.shareSDK.getShareParam(this.type(), parameters, "notebook");

    //上传并转换image
    this._uploadImages(images, 0, function (imageContent) {

        text += imageContent;

        //转换短链
        self._convertUrl([text], function (data) {

            var params = {
                "content" : data.result[0]
            };

            if (title != null)
            {
                params["title"] = title;
            }

            if (source != null)
            {
                params["source"] = source;
            }

            if (author != null)
            {
                params["author"] = author;
            }

            if (notebook != null)
            {
                params["notebook"] = notebook;
            }

            self._getCurrentUser(function (user) {

                var headers = {
                    "Content-Type" : "multipart/form-data; boundary=Boundary-" + new Date().getTime()
                };

                self.callApi("https://note.youdao.com/yws/open/note/create.json", "POST", params, headers, function (state, data) {

                    var resultData = data;
                    if (state === $mob.shareSDK.responseState.Success)
                    {
                        resultData = {};
                        resultData["raw_data"] = data;
                        resultData["cid"] = data != null ? data["path"] : null;
                        resultData["text"] = text;
                        resultData["images"] = images;
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
 * 获取用户信息
 * @param query         查询信息
 * @param callback      方法回调
 */
YouDaoNote.prototype.getUserInfo = function (query, callback)
{
    var self = this;
    this._getCurrentUser(function(user) {

        var params = {};
        if (query != null)
        {
            var errorStr = null;
 
            if(this._currentLanguage === "zh-Hans")
            {
                errorStr = "分享平台［" + self.name() + "］不支持获取其他用户资料!";
            }
            else
            {
                errorStr = "Platform [" + self.name() + "］do not support getting other's userInfo!";
            }

            var error = {
                "error_code" : $mob.shareSDK.errorCode.UnsupportFeature,
                "error_message" : errorStr
            };
            if (callback != null)
            {
                callback ($mob.shareSDK.responseState.Fail, error);
            }

            return;
        }

        self.callApi("https://note.youdao.com/yws/open/user/get.json", "GET", params, null, function (state, data) {

            var resultData = data;
            if (state === $mob.shareSDK.responseState.Success)
            {
                //转换用户数据
                resultData = {"platform_type" : self.type()};
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
YouDaoNote.prototype.callApi = function (url, method, params, headers, callback)
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

            var oauthParams = {};
            //将授权用户的授权令牌作为参数进行HTTP请求
            if (user.credential != null)
            {
                oauthParams = {
                    "oauth_consumer_key" : self.consumerKey(),
                    "oauth_token" : user.credential.token,
                    "oauth_signature_method" : "HMAC-SHA1",
                    "oauth_timestamp" : parseInt(new Date().getTime() / 1000).toString(),
                    "oauth_nonce" : parseInt(Math.random() * 100000).toString(),
                    "oauth_version" : "2.0"
                };

                params["oauth_token"] = user.credential.token;
            }



            $mob.ext.ssdk_callOAuthApi(self.type(), null, url, method, params, headers, oauthParams, self.consumerSecret(), null, function (data) {

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
                        if (response != null && response ["error"] == null)
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

                            if (response != null)
                            {
                                //判断是否为尚未授权
                                switch (response["error_code"])
                                {
                                    case 1001:
                                    case 1015:
                                    case 1017:
                                    case 307:
                                        code = $mob.shareSDK.errorCode.UserUnauth;
                                        break;
                                }
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

            });
        }
        else
        {
            var errorStr = null;
 
            if(this._currentLanguage === "zh-Hans")
            {
                errorStr = "尚未授权[" + self.name() + "]用户";
            }
            else
            {
                errorStr = "Invalid Authorization [" + self.name() + "]";
            }

            //尚未授权
            error = {
                "error_code" : $mob.shareSDK.errorCode.UserUnauth,
                "error_message" : errorStr
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
YouDaoNote.prototype.createUserByRawData = function (rawData)
{
    //转换用户数据
    var user = {
        "platform_type" : this.type()
    };
    this._updateUserInfo(user, rawData);
    return $mob.utils.objectToJsonString(user);
};

/**
 * 上传图片
 * @param images    图片集合
 * @param index     图片索引
 * @param callback  回调方法
 * @private
 */
YouDaoNote.prototype._uploadImages = function (images, index, callback)
{
    var self = this;
    if (images != null && images.length > 0 && images.length > index)
    {
        //上传并转换image
        var image = images[index];
        this._getImagePath(image, function (imagePath) {

            var mimeType = "application/octet-stream";
            if (/\.jpe?g$/.test(imagePath))
            {
                mimeType = "image/jpeg";
            }
            else if (/\.png$/.test(imagePath))
            {
                mimeType = "image/png";
            }
            else if (/\.gif$/.test(imagePath))
            {
                mimeType = "image/gif";
            }

            var file = {"path" : imagePath, "mime_type": mimeType};
            var params = {

                "file" : "@file(" + $mob.utils.objectToJsonString(file) + ")"

            };

            self.callApi("https://note.youdao.com/yws/open/resource/upload.json", "POST", params, null, function (state, data) {

                var imageUrl = "";
                if (state === $mob.shareSDK.responseState.Success)
                {
                    if (data["src"] != null)
                    {
                        imageUrl = "<img path=\""+ data["url"] +"\" src=\"" + data["src"] + "\" >";
                    }
                    else
                    {
                        imageUrl = "<img src=\"" + data["url"] + "\" >";
                    }
                }

                //上传下一张图片
                index ++;
                self._uploadImages(images, index, function (imageContent) {

                    imageUrl += imageContent;

                    if (callback != null)
                    {
                        callback (imageUrl);
                    }

                });
            });

        });
    }
    else
    {
        if (callback != null)
        {
            callback ("");
        }
    }
};

/**
 * 转换链接
 * @param contents      内容列表
 * @param callback      回调
 * @private
 */
YouDaoNote.prototype._convertUrl = function (contents, callback)
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
YouDaoNote.prototype._updateUserInfo = function (user, rawData)
{
    if (user != null && rawData != null)
    {
        user["raw_data"] = rawData;
        user["uid"] = rawData ["id"];
        user["nickname"] = rawData["user"];
        user["gender"] = 2;
        user["reg_at"] = rawData["register_time"];
    }
};

/**
 * 获取当前用户信息
 * @param callback  回调方法
 * @private
 */
YouDaoNote.prototype._getCurrentUser = function (callback)
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
YouDaoNote.prototype._succeedAuthorize = function (sessionId, credentialRawData)
{
    var self = this;

    //成功
    var credential = {
        "token"     : credentialRawData["accessToken"],
        "raw_data"  : credentialRawData,
        "expired"   : (new Date().getTime() +  946080000 * 1000),
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
                user["credential"]["uid"] = data["uid"];
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
YouDaoNote.prototype._setCurrentUser = function (user, callback)
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
 * 检测应用信息有效性
 * @param appInfo   应用信息
 * @private
 */
YouDaoNote.prototype._checkAppInfoAvailable = function (appInfo)
{
    //过滤
    var consumerKey = $mob.utils.trim(appInfo [YouDaoNoteInfoKeys.ConsumerKey]);
    var consumerSecret = $mob.utils.trim(appInfo [YouDaoNoteInfoKeys.ConsumerSecret]);
    var redirectUri = $mob.utils.trim(appInfo [YouDaoNoteInfoKeys.RedirectUri]);

    if (consumerKey != null)
    {
        appInfo [YouDaoNoteInfoKeys.ConsumerKey] = consumerKey;
    }
    else
    {
        appInfo [YouDaoNoteInfoKeys.ConsumerKey] = this.consumerKey();   
    }

    if (consumerSecret != null)
    {
        appInfo [YouDaoNoteInfoKeys.ConsumerSecret] = consumerSecret;
    }
    else
    {
        appInfo [YouDaoNoteInfoKeys.ConsumerSecret] = this.consumerSecret();    
    }

    if (redirectUri != null)
    {
        appInfo [YouDaoNoteInfoKeys.RedirectUri] = redirectUri;
    }
    else
    {
        appInfo [YouDaoNoteInfoKeys.RedirectUri] = this.redirectUri();      
    }
    
    return appInfo;
};

/**
 * 检测应用是否有效
 * @returns {boolean}   true 有效 false 无效
 * @private
 */
YouDaoNote.prototype._isAvailable = function ()
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
 * 网页授权
 * @param sessionId     会话标识
 * @param settings      授权设置
 * @private
 */
YouDaoNote.prototype._webAuthorize = function (sessionId, settings)
{
    var authUrl = "https://note.youdao.com/oauth/authorize2?client_id=" + this.consumerKey() + "&response_type=code&redirect_uri=" + $mob.utils.urlEncode(this.redirectUri()) + "&state=" + new Date().getTime();
    //打开授权
    $mob.native.ssdk_openAuthUrl(sessionId, authUrl, this.redirectUri());
};

/**
 * 获取图片路径
 * @param url           图片路径
 * @param callback      回调
 * @private
 */
YouDaoNote.prototype._getImagePath = function (url, callback)
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
 * 授权状态改变
 * @param sessionId         会话标识
 * @param data              返回数据
 * @private
 */
YouDaoNote.prototype.authStateChanged = function (sessionId, data)
{
    $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Cancel, null);
};

//注册平台
$mob.shareSDK.registerPlatformClass($mob.shareSDK.platformType.YouDaoNote, YouDaoNote);
