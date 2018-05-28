/**
 * Created with JetBrains WebStorm.
 * User: fenghj
 * Date: 15/10/21
 * Time: 下午12:31
 * To change this template use File | Settings | File Templates.
 */

var $pluginID = "com.mob.sharesdk.Pinterest";

/**
 * 基础请求地址
 * @type {string}
 */
var PinterestBaseUrl = "https://api.pinterest.com/v1/";

/**
 * Pinterest应用信息键名定义
 * @type {{AppId: "app_id", AppSecret: "app_secret", ConvertUrl: "covert_url"}}
 */
var PinterestAppInfoKeys = {
    "ClientId"          : "client_id",
    "ConvertUrl"        : "covert_url",
    "Scopes"            : "auth_scopes"
};

/**
 * Pinterest
 * @param type  平台类型
 * @constructor
 */
function Pinterest (type)
{
    this._type = type;
    this._appInfo = {};
    this._authScopes = null;
    this._urlScheme = null;
    this._currentUser = null;
    //设置当前语言环境
    this._currentLanguage = $mob.shareSDK.preferredLanguageLocalize();
}


/**
 * 获取平台类型
 * @returns {*} 平台类型
 */
Pinterest.prototype.type = function ()
{
    return this._type;
};

/**
 * 授权状态改变
 * @param sessionId         会话标识
 * @param data              返回数据
 * @private
 */
Pinterest.prototype.authStateChanged = function (sessionId, data)
{
    $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Cancel, null);
};

/**
 * 获取平台名称
 * @returns {string}    平台名称
 */
Pinterest.prototype.name = function ()
{
    return "Pinterest";
};

/**
 * 获取应用标识
 * @returns {*} 应用标识
 */
Pinterest.prototype.clientId = function ()
{
    if (this._appInfo[PinterestAppInfoKeys.ClientId] !== undefined) 
    {
        return this._appInfo[PinterestAppInfoKeys.ClientId];
    }

    return null;
};

/**
 * 获取缓存域名
 * @returns {string}    域名
 */
Pinterest.prototype.cacheDomain = function ()
{
    return "SSDK-Platform-" + this.type() + "-" + this.clientId();
};

/**
 * 获取授权方式
 *
 * @return  web 网页授权方式，sso 单点登录授权方式，both 两者共同使用，优先使用SSO
 */
Pinterest.prototype.convertUrlEnabled = function ()
{
    if (this._appInfo[PinterestAppInfoKeys.ConvertUrl] !== undefined) 
    {
        return this._appInfo[PinterestAppInfoKeys.ConvertUrl];
    }

    return $mob.shareSDK.convertUrlEnabled();
};

/**
 * 设置/获取应用信息
 * @param value 应用信息
 * @returns {*}
 */
Pinterest.prototype.setAppInfo = function (value)
{
    if (arguments.length === 0) 
    { 
        return this._appInfo;
    }
    else
    {
        this._appInfo = this._checkAppInfoAvailable(value);
        this._authScopes = this._checkAuthScopes(value);
        this._updateUrlScheme();
    }

};

/**
 * 保存配置信息
 */
Pinterest.prototype.saveConfig = function ()
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

            curApps["plat_" + self.type()] = self.clientId();
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
Pinterest.prototype.setCurrentLanguage = function (value)
{
    this._currentLanguage = value;
};

/**
 * 获取是否支持授权
 * @returns {boolean} true 支持， false 不支持
 */
Pinterest.prototype.isSupportAuth = function ()
{
    return true;
};

/**
 * 处理SSO授权回调
 * @param sessionId     会话ID
 * @param callbackUrl   回调URL
 * @param sourceApplication     原始应用名称
 * @param annotation            附加数据
 */
Pinterest.prototype.handleSSOCallback = function (sessionId, callbackUrl, sourceApplication, annotation)
{
    if (callbackUrl.indexOf(this._urlScheme + "://") === 0)
    {
        //处理回调
        this._handleAuthCallback(sessionId, callbackUrl);

        return true;
    }

    return false;
};

/**
 * 用户授权
 * @param sessionId     授权会话标识
 * @param settings      授权设置
 */
Pinterest.prototype.authorize = function (sessionId, settings)
{
    var self = this;
    var error = null;

    var appAuthUrl = "pinterestsdk.v1://oauth/";
    var webAuthUrl = "https://api.pinterest.com/oauth/";

    if (this._isAvailable())
    {
        if (settings == null)
        {
            settings = {};
        }

        if (settings ["scopes"] == null && this._authScopes == null)
        {
            //设置默认权限
            settings ["scopes"] = [
                "read_public",
                "write_public",
                "read_relationships",
                "write_relationships"
            ];
        }

        $mob.ext.canOpenURL(appAuthUrl, function (data) {

            if (data.result)
            {
                //使用客户端授权
                self._checkUrlScheme(function (hasReady, urlScheme, appName) {

                    if (hasReady)
                    {
                        var authUrl = appAuthUrl + "?client_id=" + self.clientId() + "&app_name=" + $mob.utils.urlEncode(appName);

                        if (settings != null && settings ["scopes"] != null && Object.prototype.toString.apply(settings ["scopes"]) === '[object Array]')
                        {
                            authUrl += "&permissions=" + $mob.utils.urlEncode(settings ["scopes"].join(","));
                        }
                        else if (self._authScopes != null)
                        {
                            authUrl += "&permissions=" + $mob.utils.urlEncode(self._authScopes);
                        }

                        $mob.native.openURL(authUrl);
                    }
                    else
                    {
                        var error_message = null;
                                             
                        if(self._currentLanguage === "zh-Hans")
                        {
                            error_message = "尚未设置分享平台［" + self.name() + "］的URL Scheme:" + self._urlScheme + "，无法进行分享!请在项目设置中设置URL Scheme后再试!";
                        }
                        else
                        {
                            error_message = "Can't share because platform［" + self.name() + "］did not set URL Scheme:" + self._urlScheme + "!Please try again after set URL Scheme!";
                        }

                        //返回错误
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
                //使用Safari授权
                $mob.ext.canOpenURL(webAuthUrl, function (data) {

                    if (data.result)
                    {
                        self._checkUrlScheme(function (hasReady, urlScheme, appName) {

                            if (hasReady)
                            {
                                var authUrl = webAuthUrl + "?response_type=token&client_id=" + self.clientId() + "&redirect_uri=" + $mob.utils.urlEncode(self._urlScheme + "://");
                                if (settings != null && settings ["scopes"] != null && Object.prototype.toString.apply(settings ["scopes"]) === '[object Array]')
                                {
                                    authUrl += "&scope=" + $mob.utils.urlEncode(settings ["scopes"].join(","));
                                }
                                else if (self._authScopes != null)
                                {
                                    authUrl += "&scope=" + $mob.utils.urlEncode(self._authScopes);
                                }

                                $mob.native.openURL(authUrl);
                            }
                            else
                            {
                                var error_message = null;
                                             
                                if(self._currentLanguage === "zh-Hans")
                                {
                                    error_message = "尚未设置分享平台［" + self.name() + "］的URL Scheme:" + self._urlScheme + "，无法进行分享!请在项目设置中设置URL Scheme后再试!";
                                }
                                else
                                {
                                    error_message = "Can't share because platform［" + self.name() + "］did not set URL Scheme:" + self._urlScheme + "!Please try again after set URL Scheme!";
                                }

                                //返回错误
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

                        if(self._currentLanguage === "zh-Hans")
                        {
                            error_message = "该版本Pinterest客户端不支持授权功能，请更新版本后再试！";
                        }
                        else
                        {
                            error_message = "Current Pinterest app version do not support SSO,please try again after updated Pinterest!";
                        }

                        error = {
                            "error_code" : $mob.shareSDK.errorCode.UnsupportFeature,
                            "error_message" : error_message
                        };
                        $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Fail, error);
                    }

                });
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
 * 取消授权
 * @param callback      方法回调，回调方法声明如下:function (stat, data);
 */
Pinterest.prototype.cancelAuthorize = function (callback)
{
    this._setCurrentUser(null, null);
};

/**
 * 获取用户信息
 * @param query         查询信息
 * @param callback      方法回调
 */
Pinterest.prototype.getUserInfo = function (query, callback)
{
    var self = this;
    var url = null;
    if (query != null)
    {
        url = PinterestBaseUrl + "users/";

        if (query.name != null)
        {
            url += query.name + "/";
        }
    }
    else
    {
        //获取授权用户个人信息
        url = PinterestBaseUrl + "me/";
    }

    var params = {
        "fields" : "id,username,first_name,last_name,bio,created_at,counts,image"
    };

    self._getCurrentUser(function (user) {

        self.callApi(url, "GET", params, null, function (state, data) {

            var resultData = data;
            if (state === $mob.shareSDK.responseState.Success)
            {
                resultData = data ["data"];
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
 * 添加好友
 * @param sessionId     会话标识
 * @param user          用户信息
 * @param callback      方法回调，回调方法声明如下:function (stat, data);
 */
Pinterest.prototype.addFriend = function (sessionId, user, callback)
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
Pinterest.prototype.getFriends = function (cursor, size, callback)
{
    var self = this;
    var params = {
        "fields" : "id,username,first_name,last_name,bio,created_at,counts,image"
    };

    this._getCurrentUser(function (user) {

        if (cursor > 0)
        {
            if (user != null && user.credential != null && user.credential.raw_data != null && user.credential.raw_data.friendsCursor != null)
            {
                params["cursor"] = user.credential.raw_data.friendsCursor [cursor - 1];
            }
        }

        self.callApi(PinterestBaseUrl + "me/following/users/", "GET", params, null, function (state, data) {

            var resultData = data;
            if (state === $mob.shareSDK.responseState.Success)
            {
                //转换数据
                resultData = {};

                if (data["data"] != null)
                {
                    //转换用户数据
                    var users = [];
                    var rawUsersData = data["data"];
                    if (rawUsersData != null)
                    {
                        for (var i = 0; i < rawUsersData.length; i++)
                        {
                            var friend = {"platform_type" : self.type()};
                            self._updateUserInfo(friend, rawUsersData[i]);
                            users.push(friend);
                        }
                    }
                    resultData ["users"] = users;
                }

                if (data["page"] != null)
                {
                    resultData ["has_next"] = (data["page"]["cursor"] != null);
                    if (resultData ["has_next"])
                    {
                        if (user != null && user.credential != null && user.credential.raw_data != null)
                        {
                            if (user.credential.raw_data.friendsCursor == null)
                            {
                                user.credential.raw_data.friendsCursor = [];
                            }

                            user.credential.raw_data.friendsCursor.push(data["page"]["cursor"]);

                            //保存用户数据
                            self._setCurrentUser(user, null);
                        }
                    }
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
Pinterest.prototype.callApi = function (url, method, params, headers, callback)
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

            //将授权用户的授权令牌作为参数进行HTTP请求
            if (user.credential != null)
            {
                params["access_token"] = user.credential.token;
            }

            $mob.ext.ssdk_callHTTPApi(self.type(), null, url, method, params, headers, function (data) {

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
                        if (data ["status_code"] === 200 || data ["status_code"] === 201)
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
 * 分享内容
 * @param sessionId         会话ID
 * @param parameters        分享参数
 * @param callback          方法回调，回调方法声明如下:function (state, data, user, userData);
 */
Pinterest.prototype.share = function (sessionId, parameters, callback)
{
    var self = this;
    var error = null;

    //获取分享统计标识
    var flags = parameters != null ? parameters ["@flags"] : null;
    var userData = {
        "@flags" : flags
    };


    if (this._canShare())
    {
    
        //进行分享
        var text = $mob.shareSDK.getShareParam(self.type(), parameters, "text");
        var images = $mob.shareSDK.getShareParam(self.type(), parameters, "images");
        var url = $mob.shareSDK.getShareParam(self.type(), parameters, "url");
        var board = $mob.shareSDK.getShareParam(self.type(), parameters, "board");

        var image = null;
        if (Object.prototype.toString.apply(images) === '[object Array]')
        {
            //取第一张图片进行分享
            image = images [0];
        }

        this._checkBoardId(board, function (board) {

            if (image != null)
            {

                self._convertUrl([text, url], function (data) {

                    text = data.result[0];
                    url = data.result[1];

                    var params = {
                        "link" : url,
                        "note" : text,
                        "board" : board
                    };

                    if (!/^(file\:\/)?\//.test(image))
                    {
                        //网络图片
                        params ["image_url"] = image;
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
                        params["image"] = "@file(" + $mob.utils.objectToJsonString(file) + ")";
                    }

                    self._getCurrentUser(function (user){

                        self.callApi(PinterestBaseUrl + "pins/", "POST", params, null, function (state, data) {

                            var resultData = data;
                            if (state === $mob.shareSDK.responseState.Success)
                            {
                                //转换数据
                                resultData = {};
                                resultData["raw_data"] = data["data"];

                                resultData["cid"] = data["data"]["id"];
                                resultData["images"] = [image];

                                if (data["data"]["note"] != null)
                                {
                                    resultData["text"] = data["data"]["note"];
                                }

                                if (data["data"]["link"] != null)
                                {
                                    resultData ["urls"] = [data["data"]["link"]];
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
                    error_message = "分享参数image不能为空并且不能为本地图片!";
                }
                else
                {
                    error_message = "Share param image can not be nil and url image only!";
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
Pinterest.prototype.createUserByRawData = function (rawData)
{
    //转换用户数据
    var user = {
        "platform_type" : this.type()
    };
    this._updateUserInfo(user, rawData);
    return $mob.utils.objectToJsonString(user);
};

/**
 * 获取当前用户信息
 * @param callback  回调方法
 * @private
 */
Pinterest.prototype._getCurrentUser = function (callback)
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
Pinterest.prototype._setCurrentUser = function (user, callback)
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
 * 处理用户授权回调
 * @param sessionId     授权会话标识
 * @param callbackUrl   回调地址
 */
Pinterest.prototype._handleAuthCallback = function (sessionId, callbackUrl)
{
    var error = null;
    var error_message;
    var self = this;
    var urlInfo = $mob.utils.parseUrl(callbackUrl);
    if (urlInfo != null)
    {
        var query = urlInfo.query;

        var params = $mob.utils.parseUrlParameters(query);
        if (params != null)
        {
            if (params.error != null)
            {
                error_message = null;
                if(this._currentLanguage === "zh-Hans")
                {
                    error_message = "平台[" + this.name() + "]授权失败!";
                }
                else
                {
                    error_message = "Platform [" + this.name() + "] authorize request fail!";
                }
                //授权失败
                error = {
                    "error_code" : $mob.shareSDK.errorCode.APIRequestFail,
                    "error_message" : error_message,
                    "user_data" : params
                };
                $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Fail, error);
            }
            else
            {
                //成功
                var credential = {
                    "token"     : params["access_token"],
                    "expired"   : (new Date().getTime() + 946080000 * 1000),
                    "type"      : $mob.shareSDK.credentialType.OAuth2
                };

                var user = {
                    "platform_type" : this.type(),
                    "credential" : credential
                };

                //设置临时授权用户
                this._setCurrentUser(user, function () {

                    //检查token有效性
                    var inspectUrl = PinterestBaseUrl + "oauth/inspect";
                    var inspectParams = {"token" : params["access_token"]};

                    self.callApi(inspectUrl, "GET", inspectParams, null, function (state, data) {

                        if (state === $mob.shareSDK.responseState.Success)
                        {
                            credential.uid = data ["data"] ["user_id"].toString();
                            credential.raw_data = data ["data"];

                            //获取用户资料
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
                        }
                        else
                        {
                            //清空当前授权用户
                            self._setCurrentUser(null, null);
                            //授权失败
                            $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Fail, data);
                        }

                    });

                });
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
 * 转换链接
 * @param contents      内容列表
 * @param callback      回调
 * @private
 */
Pinterest.prototype._convertUrl = function (contents, callback)
{
    if (this.convertUrlEnabled())
    {
        $mob.shareSDK.convertUrl(this.type(), null, contents, callback);
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
Pinterest.prototype._updateUserInfo = function (user, rawData)
{
    if (user != null && rawData != null)
    {
        user["raw_data"] = rawData;
        user["uid"] = rawData ["id"];
        user["nickname"] = rawData["username"];
        user["about_me"] = rawData["bio"];

        //性别
        user["gender"] = 2;

        if (rawData["created_at"] != null)
        {
            var date = new Date(rawData["created_at"]);
            user["reg_at"] = date.getTime();
        }

        //头像
        if (rawData["image"] != null)
        {
            var images = rawData["image"];
            for (var key in images)
            {
                if (images.hasOwnProperty(key))
                {
                    user["icon"] = rawData["image"][key]["url"];
                    break;
                }
            }
        }

        //个人空间地址
        user["url"] = rawData["url"];

        if (rawData["counts"] != null)
        {
            user["follower_count"] = rawData["counts"]["followers"];
            user["friend_count"] = rawData["counts"]["following"];
            user["share_count"] = rawData["counts"]["pins"];
        }
    }
};

/**
 * 更新URL Scheme
 * @private
 */
Pinterest.prototype._updateUrlScheme = function ()
{
    this._urlScheme = "pdk" + this.clientId();
};

/**
 * 判断是否能够进行分享
 * @private
 */
Pinterest.prototype._canShare = function ()
{
    if (this.clientId() != null)
    {
        return true;
    }

    $mob.native.log("[ShareSDK-WARNING] [" + this.name() + "]应用信息有误，不能进行相关操作。请检查本地代码中和服务端的[" + this.name() + "]平台应用配置是否有误! " +
        "\n配置:" + $mob.utils.objectToJsonString(this._appInfo));

    return false;
};

/**
 * 检测应用信息中的授权信息
 * @param appInfo   应用信息
 * @private
 */
Pinterest.prototype._checkAuthScopes = function (appInfo)
{
    return appInfo [PinterestAppInfoKeys.Scopes];
};

/**
 * 检测应用信息有效性
 * @param appInfo   应用信息
 * @private
 */
Pinterest.prototype._checkAppInfoAvailable = function (appInfo)
{
    var clientId = $mob.utils.trim(appInfo [PinterestAppInfoKeys.ClientId]);

    if (clientId != null)
    {
        appInfo [PinterestAppInfoKeys.ClientId] = clientId;
    }
    else
    {
        appInfo [PinterestAppInfoKeys.ClientId] = this.clientId(); 
    }

    return appInfo;
};

/**ive.log
 * 检测是否配置URL Scheme
 * @param callback 方法回调
 * @private
 */
Pinterest.prototype._checkUrlScheme = function (callback)
{
    var self = this;
    $mob.ext.getAppConfig(function (data){

        var urlScheme = null;
        var appName = null;
        var hasReady = false;

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
                        if (schema === self._urlScheme)
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

            appName = data.CFBundleDisplayName;
            if (appName == null)
            {
                appName = data.CFBundleName;
            }
        }

        if (!hasReady)
        {
            $mob.native.log("[ShareSDK-WARNING] 尚未配置[" + self.name() + "]URL Scheme:" + self._urlScheme + ", 无法使用进行授权。");
        }

        if (callback != null)
        {
            callback (hasReady, urlScheme, appName);
        }

    });
};

/**
 * 检测应用是否有效
 * @returns {boolean}   true 有效 false 无效
 * @private
 */
Pinterest.prototype._isAvailable = function ()
{
    if (this.clientId() != null)
    {
        return true;
    }

    $mob.native.log("[ShareSDK-WARNING] [" + this.name() + "]应用信息有误，不能进行相关操作。请检查本地代码中和服务端的[" + this.name() + "]平台应用配置是否有误! " +
        "\n配置:" + $mob.utils.objectToJsonString(this._appInfo));

    return false;
};


Pinterest.prototype._isBoardNameExist = function (targetBoardName, callback)
{

    var self = this;
    this._getCurrentUser(function (user) {
  
        if (user != null && user.credential != null) 
        {

            self.callApi(PinterestBaseUrl + "me/boards/", "GET", null, null, function (state, data) {

                if (state === $mob.shareSDK.responseState.Success)
                {
                    if (data["data"] != null && data["data"].length > 0)
                    {
                        var didFetchTarget = false;
                        var boardsNumb = data["data"].length;
                        var firstBoardId = data["data"][0]["id"];
                        var firstBoardName = data["data"][0]["name"];

                        for (var i = 0; i < boardsNumb; i++) 
                        {
                            var boardname = data["data"][i]["name"];

                            if (boardname === targetBoardName)
                            {
                                var targetBoardId = data["data"][i]["id"];
                                if(callback)    
                                {
                                    callback(targetBoardId, firstBoardId, firstBoardName);
                                }

                                didFetchTarget = true;
                            }
                        }

                        if (!didFetchTarget) 
                        {
                            //没有找到目标Board
                            if(callback)    
                            {
                                callback(null, firstBoardId, firstBoardName);
                            } 
                        }
                            
                    }
                    else
                    {
                        if (callback)
                        {
                            callback (null, null, null);
                        }
                    }
                }
                else
                {
                    if (callback)
                    {
                        callback (null, null, null);
                    }
                }

            });
        }
        else
        {
            if (callback)
            {
                callback (null, null, null);
            }
        }
    });
};

// }
/**
 * 检测Board标识的有效性
 * @param boardName     Board名字
 * @param callback      回调，声明如下，function (boardId);
 * @private
 */
Pinterest.prototype._checkBoardId = function (boardName, callback)
{
    var self = this;
    if (boardName != null)
    {
        this._isBoardNameExist(boardName, function(targetBoardId, firstBoardId){
            if(targetBoardId != null)
            {
                if (callback != null)
                {
                    callback (targetBoardId);
                }
            }
            else
            {
                //没有指定画板
                var params = {
                    "name" : boardName,
                    "description" : boardName
                };

                self.callApi(PinterestBaseUrl + "boards/", "POST", params, null, function (state, data) {

                    if (state === $mob.shareSDK.responseState.Success)
                    {
                        if (data["data"] != null)
                        {
                            var boardId = data["data"]["id"];
                            //返回
                            if (callback != null)
                            {
                                callback (boardId);
                            }
                        }
                        else
                        {
                            if (callback != null)
                            {
                                callback (null);
                            }
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
            
        });
    }
    else
    {
        this._getCurrentUser(function (user) {

            if (user != null && user.credential != null && user.credential.raw_data != null && user.credential.raw_data.board != null && user.credential.raw_data.boardName != null)
            {
                //传入上次保存的boardName
                self._isBoardNameExist(user.credential.raw_data.boardName, function(targetBoardId, firstBoardId, firstBoardName) { 

                    if (targetBoardId != null) 
                    {
                        //加载缓存,并寻找到实际存在的Board
                        if (callback != null)
                        {
                            callback (targetBoardId);
                        }
                    }
                    else
                    {

                        if (firstBoardId != null && firstBoardName != null)
                        {
                            //找不到缓存对应的Board，于是使用board列表中的第一个
                            if (user.credential.raw_data != null)
                            {
                                user.credential.raw_data = {};
                            }

                            user.credential.raw_data.board = firstBoardId;
                            user.credential.raw_data.boardName = firstBoardName;
                            //返回
                            if (callback != null)
                            {
                                callback (firstBoardId);
                            }

                            //重新设置User
                            self._setCurrentUser(user);
                        }
                        else
                        {
                            //找不到任何Board,于是自行创建Board
                            var params = {
                                "name" : "ShareSDK",
                                "description" : "ShareSDK"
                            };

                            self.callApi(PinterestBaseUrl + "boards/", "POST", params, null, function (state, data) {

                                if (state === $mob.shareSDK.responseState.Success)
                                {
                                    if (data["data"] != null)
                                    {
                                        user.credential.raw_data.board = data["data"]["id"];
                                        user.credential.raw_data.boardName = data["data"]["name"];
                                        //返回
                                        if (callback != null)
                                        {
                                            callback (user.credential.raw_data.board);
                                        }

                                        //重新设置User
                                        self._setCurrentUser(user);
                                    }
                                    else
                                    {
                                        if (callback != null)
                                        {
                                            callback (null);
                                        }
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
                    }
                });
            }
            else
            {
                if (user != null && user.credential != null)
                {
                    if (user.credential.raw_data != null)
                    {
                        user.credential.raw_data = {};
                    }

                    self._isBoardNameExist(null, function(targetBoardId, firstBoardId, firstBoardName) { 


                        if (firstBoardId != null && firstBoardName != null) 
                        {
                            //首次授权,并得到已存在的Board列表中的首个
                            user.credential.raw_data.board = firstBoardId;
                            user.credential.raw_data.boardName = firstBoardName;

                            //返回
                            if (callback != null)
                            {
                                callback (firstBoardId);
                            }

                            //重新设置User
                            self._setCurrentUser(user);

                        }
                        else
                        {
                            //首次授权,没有存在的任何Board,于是进行创建Board
                            var params = {
                                "name" : "ShareSDK",
                                "description" : "ShareSDK"
                            };
                            self.callApi(PinterestBaseUrl + "boards/", "POST", params, null, function (state, data) {

                                if (state === $mob.shareSDK.responseState.Success)
                                {
                                    if (data["data"] != null)
                                    {
                                        user.credential.raw_data.board = data["data"]["id"];

                                        //返回
                                        if (callback != null)
                                        {
                                            callback (user.credential.raw_data.board);
                                        }

                                        //重新设置User
                                        self._setCurrentUser(user);
                                    }
                                    else
                                    {
                                        if (callback != null)
                                        {
                                            callback (null);
                                        }
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
                    });
                }
                else
                {
                    if (callback != null)
                    {
                        callback (null);
                    }
                }
            }

        });
    }
};

//注册平台
$mob.shareSDK.registerPlatformClass($mob.shareSDK.platformType.Pinterest, Pinterest);
