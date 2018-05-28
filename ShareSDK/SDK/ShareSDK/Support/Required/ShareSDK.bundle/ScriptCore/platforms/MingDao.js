/**
 * Created with JetBrains WebStorm.
 * User: fenghj
 * Date: 15/11/18
 * Time: 上午9:50
 * To change this template use File | Settings | File Templates.
 */

var $pluginID = "com.mob.sharesdk.MingDao";

/**
 * Dropbox应用信息标识
 * @type {{AppKey: string, AppSecret: string, OAuthCallback: string, ConvertUrl: string}}
 */
var MingDaoAppInfoKeys = {
    "AppKey"            : "app_key",
    "AppSecret"         : "app_secret",
    "RedirectUri"       : "redirect_uri",
    "ConvertUrl"        : "covert_url"
};


/**
 * Pinterest
 * @param type  平台类型
 * @constructor
 */
function MingDao (type)
{
    this._type = type;
    this._appInfo = {};

    this._urlScheme = null;
    this._currentUser = null;
    //设置当前语言环境
    this._currentLanguage = $mob.shareSDK.preferredLanguageLocalize();
}

/**
 * 获取平台类型
 * @returns {*} 平台类型
 */
MingDao.prototype.type = function ()
{
    return this._type;
};

/**
 * 授权状态改变
 * @param sessionId         会话标识
 * @param data              返回数据
 * @private
 */
MingDao.prototype.authStateChanged = function (sessionId, data)
{
    $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Cancel, null);
};

/**
 * 获取平台名称
 * @returns {string}    平台名称
 */
MingDao.prototype.name = function ()
{
    
    if(this._currentLanguage === "zh-Hans")
    {
        return "明道";
    }
    else
    {
        return "MingDao";
    }

};

/**
 * 获取应用标识
 * @returns {*} 应用标识
 */
MingDao.prototype.appKey = function ()
{
    if (this._appInfo[MingDaoAppInfoKeys.AppKey] !== undefined) 
    {
        return this._appInfo[MingDaoAppInfoKeys.AppKey];
    }

    return null;
};

/**
 * 获取应用密钥
 * @returns {*} 应用密钥
 */
MingDao.prototype.appSecret = function ()
{
    if (this._appInfo[MingDaoAppInfoKeys.AppSecret] !== undefined) 
    {
        return this._appInfo[MingDaoAppInfoKeys.AppSecret];
    }

    return null;
};

/**
 * 获取回调地址
 * @returns {*} 回调地址
 */
MingDao.prototype.redirectUri = function ()
{
    if (this._appInfo[MingDaoAppInfoKeys.RedirectUri] !== undefined) 
    {
        return this._appInfo[MingDaoAppInfoKeys.RedirectUri];
    }
    
    return null;
};

/**
 * 获取缓存域名
 * @returns {string}    域名
 */
MingDao.prototype.cacheDomain = function ()
{
    return "SSDK-Platform-" + this.type() + "-" + this.appKey();
};

/**
 * 获取授权方式
 *
 * @return  web 网页授权方式，sso 单点登录授权方式，both 两者共同使用，优先使用SSO
 */
MingDao.prototype.convertUrlEnabled = function ()
{
    if (this._appInfo[MingDaoAppInfoKeys.ConvertUrl] !== undefined) 
    {
        return this._appInfo[MingDaoAppInfoKeys.ConvertUrl];
    }

    return $mob.shareSDK.convertUrlEnabled();
};

/**
 * 设置/获取应用信息
 * @param value 应用信息
 * @returns {*}
 */
MingDao.prototype.setAppInfo = function (value)
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
MingDao.prototype.saveConfig = function ()
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
MingDao.prototype.isSupportAuth = function ()
{
    return true;
};

/**
 * 用户授权
 * @param sessionId     授权会话标识
 * @param settings      授权设置
 */
MingDao.prototype.authorize = function (sessionId, settings)
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
MingDao.prototype.handleAuthCallback = function (sessionId, callbackUrl)
{
    var error = null;
    var self = this;
    var error_message;
    var urlInfo = $mob.utils.parseUrl(callbackUrl);
    if (urlInfo != null && urlInfo.query != null)
    {
        var params = $mob.utils.parseUrlParameters(urlInfo.query);
        if (params != null && params.code != null)
        {
            var tokenParams = {
                "app_key" : this.appKey(),
                "app_secret" : this.appSecret(),
                "grant_type" : "authorization_code",
                "redirect_uri" : this.redirectUri(),
                "code" : params.code,
                "format" : "json"
            };

            //请求AccessToken
            $mob.ext.ssdk_callHTTPApi(this.type(), null, "https://api.mingdao.com/oauth2/access_token", "POST", tokenParams, null, function (data) {

                if (data != null)
                {
                    var response = $mob.utils.jsonStringToObject($mob.utils.base64Decode(data["response_data"]));
                    if (response["error_code"] == null)
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
MingDao.prototype.getUserInfo = function (query, callback)
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

        self.callApi("https://api.mingdao.com/passport/detail", "GET", {"format" : "json"}, null, function (state, data) {

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
MingDao.prototype.callApi = function (url, method, params, headers, callback)
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

            //将授权用户的授权令牌作为参数进行HTTP请求
            if (user.credential != null)
            {
                params ["access_token"] = user.credential.token;
            }

            $mob.ext.ssdk_callHTTPApi(self.type(), null, url, method, params, headers, function (data) {

                if (data != null)
                {

                    var response = $mob.utils.jsonStringToObject($mob.utils.base64Decode(data["response_data"]));

                    if (response ["error_code"] == null)
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
MingDao.prototype.cancelAuthorize = function ()
{
    //清除缓存
    this._setCurrentUser(null, null);

};

/**
 * 添加好友
 * @param sessionId     会话标识
 * @param user          用户信息
 * @param callback      方法回调，回调方法声明如下:function (stat, data);
 */
MingDao.prototype.addFriend = function (sessionId, user, callback)
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
MingDao.prototype.getFriends = function (cursor, size, callback)
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
MingDao.prototype.share = function (sessionId, parameters, callback)
{
    var self = this;
    var error = null;
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

    var params = null;
    var text = $mob.shareSDK.getShareParam(this.type(), parameters, "text");
    var images = $mob.shareSDK.getShareParam(this.type(), parameters, "images");
    var url = $mob.shareSDK.getShareParam(this.type(), parameters, "url");
    var title = $mob.shareSDK.getShareParam(this.type(), parameters, "title");

    switch (type)
    {
        case $mob.shareSDK.contentType.Text:
        {

            self._convertUrl([text], function(data) {

                params = {

                    "p_msg" : data.result[0],
                    "format" : "json"

                };

                self._getCurrentUser(function (user) {

                    self.callApi("https://api.mingdao.com/post/update", "POST", params, null, function (state, data) {

                        var resultData = data;
                        if (state === $mob.shareSDK.responseState.Success)
                        {
                            //转换数据
                            if (data != null)
                            {
                                resultData = {};
                                resultData["raw_data"] = data;
                                resultData["cid"] = data["post"];
                                resultData["text"] = text;
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
            if (images != null && images.length > 0)
            {
                self._getImagePath(images[0], function (imageUrl) {

                    if (imageUrl != null)
                    {
                        //本地图片
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

                        self._convertUrl([text], function(data) {

                            var file = {"path" : imageUrl, "mime_type": mimeType};
                            params = {
                                "p_msg" : data.result[0],
                                "p_img" : "@file(" + $mob.utils.objectToJsonString(file) + ")",
                                "format" : "json"
                            };

                            self._getCurrentUser(function (user) {
                                self.callApi("https://api.mingdao.com/post/upload", "POST", params, null, function (state, data) {

                                    var resultData = data;
                                    if (state === $mob.shareSDK.responseState.Success)
                                    {
                                        //转换数据
                                        if (data != null)
                                        {
                                            resultData = {};
                                            resultData["raw_data"] = data;
                                            resultData["cid"] = data["post"];
                                            resultData["text"] = text;
                                            if (data["details"] != null && data["details"].length > 0)
                                            {
                                                resultData["images"] = [data["details"][0]["original_pic"]];
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
                        var error_message = null;
                        
                        if(this._currentLanguage === "zh-Hans")
                        {
                            error_message = "分享失败！分享参数image无效!";
                        }
                        else
                        {
                            error_message = "Share Failed!Invalid param image!";
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
            }
            else
            {
                error_message = null;
                
                if(this._currentLanguage === "zh-Hans")
                {
                    error_message = "分享失败!分享参数image不能为空!";
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
        {
            if (url != null)
            {
                var image = "";
                if (images != null && images.length > 0)
                {
                    for (var i = 0; i < images.length; i++)
                    {
                        var img = images [i];
                        if (!/^(file\:\/)?\//.test(img))
                        {
                            image = img;
                            break;
                        }
                    }
                }

                if (title == null)
                {
                    title = "";
                }

                self._convertUrl([url], function(data) {

                    self._getCurrentUser(function (user) {

                        var reqUrl = "http://www.mingdao.com/share?appkey=" + self.appKey() + "&url=" + $mob.utils.urlEncode(data.result[0]) +
                            "&title=" + $mob.utils.urlEncode(title) + "&pic=" + $mob.utils.urlEncode(image);

                        $mob.native.openURL(reqUrl);

                        var resultData = {};
                        resultData["url"] = [url];
                        if (image)
                        {
                            resultData["images"] = [image];
                        }

                        if (callback != null)
                        {
                            callback ($mob.shareSDK.responseState.Success, resultData, user, userData);
                        }

                    });

                });
            }
            else
            {
                error_message = null;
                
                if(this._currentLanguage === "zh-Hans")
                {
                    error_message = "分享失败!分享参数image不能为空!";
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
        default:
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
 * 创建用户信息
 * @param rawData       原始用户数据
 * @returns {null}      用户数据
 */
MingDao.prototype.createUserByRawData = function (rawData)
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
MingDao.prototype._getImagePath = function (url, callback)
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
MingDao.prototype._convertUrl = function (contents, callback)
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
MingDao.prototype._getShareType = function (parameters)
{
    var type = $mob.shareSDK.contentType.Text;
    var images = $mob.shareSDK.getShareParam(this.type(), parameters, "images");
    var url = $mob.shareSDK.getShareParam(this.type(), parameters, "url");

    if (url != null)
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
 * 获取当前用户信息
 * @param callback  回调方法
 * @private
 */
MingDao.prototype._getCurrentUser = function (callback)
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
MingDao.prototype._updateUserInfo = function (user, rawData)
{
    if (user != null && rawData != null)
    {
        user["raw_data"] = rawData;
        user["uid"] = rawData ["id"];
        user["nickname"] = rawData["name"];
        user["icon"] = rawData["avatar"];

        var gender = 2;
        switch (rawData["gender"])
        {
            case 1:
                gender = 0;
                break;
            case 2:
                gender = 1;
                break;
        }
        user["gender"] = gender;

        var exp = null;
        var res = null;

        //生日
        var birthday = rawData["birth"];
        if (birthday != null)
        {
            exp = /^(\d+)-(\d+)-(\d+)$/;
            res = null;
            var date = null;
            if (exp.test(birthday))
            {
                res = exp.exec(birthday);
                date = new Date(res[1], res[2] - 1, res[3], 0, 0, 0);
                user["birthday"] = date.getTime() / 1000;
            }
            else
            {
                exp = /^(\d+)后-(\d+)-(\d+)$/;
                if (exp.test(birthday))
                {
                    res = exp.exec(birthday);
                    var year = parseInt(res[1]);
                    if (year === 0)
                    {
                        year = 100;
                    }
                    date = new Date(1900 + year, res[2] - 1, res[3], 0, 0, 0);
                    user["birthday"] = date.getTime() / 1000;
                }
            }
        }

        var item = null;
        var list = null;
        var edus = rawData["educations"];
        var i;
        if (edus != null)
        {
            //教育信息
            list = [];
            for (i = 0; i < edus.length; i++)
            {
                item = {};
                var edu = edus[i];

                item["school"] = edu["name"];
                item["classes"] = edu["description"];
                item["year"] = parseInt(edu["startDate"]);
                item["background"] = edu["title"];
                list.push(item);
            }
            user["educations"] = list;
        }

        var works = rawData["jobs"];
        if (works != null)
        {
            //工作信息
            list = [];
            for (i = 0; i < works.length; i++)
            {
                item = {};
                var work = works[i];

                item["company"] = work["name"];
                item["position"] = work["title"];

                var startDate = work["startDate"];
                if (startDate != null)
                {
                    exp = /^(\d+)-(\d+)$/;
                    if (exp.test(startDate))
                    {
                        res = exp.exec(startDate);
                        item["start_date"] = parseInt(res[1]) * 100 + parseInt(res[2]);
                    }
                }

                var endDate = work["endDate"];
                if (endDate != null)
                {
                    exp = /^(\d+)-(\d+)$/;
                    if (exp.test(endDate))
                    {
                        res = exp.exec(endDate);
                        item["end_date"] = parseInt(res[1]) * 100 + parseInt(res[2]);
                    }
                }

                list.push(item);
            }

            user["works"] = list;
        }

    }
};

/**
 * 授权成功
 * @param sessionId             会话ID
 * @param credentialRawData     授权凭证原始数据
 * @private
 */
MingDao.prototype._succeedAuthorize = function (sessionId, credentialRawData)
{
    var self = this;

    //成功
    var credential = {
        "token"     : credentialRawData["access_token"],
        "expired"   : (new Date().getTime() +  credentialRawData["expires_in"] * 1000),
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
                user["credential"]["uid"] = data["uid"];
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
MingDao.prototype._setCurrentUser = function (user, callback)
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
MingDao.prototype._isAvailable = function ()
{
    if (this.appKey() != null && this.appSecret() != null && this.redirectUri() != null)
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
MingDao.prototype._webAuthorize = function (sessionId, settings)
{
    var authUrl = "https://api.mingdao.com/oauth2/authorize?app_key=" + this.appKey() +
        "&response_type=code&redirect_uri=" + $mob.utils.urlEncode(this.redirectUri()) + "&display=default&state=" + new Date().getTime();

    //打开授权
    $mob.native.ssdk_openAuthUrl(sessionId, authUrl, this.redirectUri());
};


/**
 * 检测应用信息有效性
 * @param appInfo   应用信息
 * @private
 */
MingDao.prototype._checkAppInfoAvailable = function (appInfo)
{
    var appKey = $mob.utils.trim(appInfo [MingDaoAppInfoKeys.AppKey]);
    var appSecret = $mob.utils.trim(appInfo [MingDaoAppInfoKeys.AppSecret]);
    var redirectUri = $mob.utils.trim(appInfo [MingDaoAppInfoKeys.RedirectUri]);

    if (appKey != null)
    {
        appInfo [MingDaoAppInfoKeys.AppKey] = appKey;
    }
    else
    {
        appInfo [MingDaoAppInfoKeys.AppKey] = this.appKey();   
    }

    if (appSecret != null)
    {
        appInfo [MingDaoAppInfoKeys.AppSecret] = appSecret;
    }
    else
    {
        appInfo [MingDaoAppInfoKeys.AppSecret] = this.appSecret();   
    }

    if (redirectUri != null)
    {
        appInfo [MingDaoAppInfoKeys.RedirectUri] = redirectUri;
    }
    else
    {
        appInfo [MingDaoAppInfoKeys.RedirectUri] = this.redirectUri();   
    }
    
    return appInfo;
};



//注册平台
$mob.shareSDK.registerPlatformClass($mob.shareSDK.platformType.MingDao, MingDao);
