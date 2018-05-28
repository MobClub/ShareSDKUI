/**
 * Created with JetBrains WebStorm.
 * User: fenghj
 * Date: 15/6/11
 * Time: 下午3:41
 * To change this template use File | Settings | File Templates.
 */

var $pluginID = "com.mob.sharesdk.QQ";

/**
 * QQ的回调地址
 * @type {string}
 */
var QQRedirectUri = "auth://www.qq.com";

/**
 * QQ应用信息键名定义
 * @type {{AppID: "app_id", AppKey: "app_key", AuthType: "auth_type", ConvertUrl: "covert_url"}}
 */
var QQAppInfoKeys = {
    "AppID"         : "app_id",
    "AppKey"        : "app_key",
    "AuthType"      : "auth_type",
    "ConvertUrl"    : "covert_url",
    "Scopes"        : "auth_scopes",
    "QQShareType"   : "qq_share_type",
    "BackUnionid"   : "back_unionid"
};

/**
 * QQ场景
 * @type {{QQFriend: number, QZone: number}}
 */
var QQScene = {
    "QQFriend"      : 0,
    "QZone"         : 1
};

/**
 * QQ分享内容集合
 * @type {{}}
 */
var QQShareContentSet = {};

/**
 * QQ
 * @param type  平台类型
 * @constructor
 */
function QQ (type)
{
    this._type = type;
    this._appInfo = {};
    this._authScopes = null;
    //当前授权用户
    this._currentUser = null;
    this._authUrlScheme = null;
    this._shareUrlScheme = null;
    //设置当前语言环境
    this._currentLanguage = $mob.shareSDK.preferredLanguageLocalize();
}

/**
 * 获取平台类型
 * @returns {*} 平台类型
 */
QQ.prototype.type = function ()
{
    return this._type;
};

/**
 * 授权状态改变
 * @param sessionId         会话标识
 * @param data              返回数据
 * @private
 */
QQ.prototype.authStateChanged = function (sessionId, data)
{
    $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Cancel, null);
};

/**
 * 获取平台名称
 * @returns {string}    平台名称
 */
QQ.prototype.name = function ()
{
    return "QQ";
};

//v4.0.2增加
//returns {*} true uid = unionid ; false uid = openid
QQ.prototype.backUnionid = function ()
{
    if (this._appInfo[QQAppInfoKeys.BackUnionid] !== undefined) 
    {
        return this._appInfo[QQAppInfoKeys.BackUnionid];
    }

     return false;
};

/**
 * 获取应用标识
 * @returns {*} 应用标识
 */
QQ.prototype.appId = function ()
{
    if (this._appInfo[QQAppInfoKeys.AppID] !== undefined) 
    {
        return this._appInfo[QQAppInfoKeys.AppID];
    }

    return null;
};

/**
 * 获取应用密钥
 * @returns {*} 应用密钥
 */
QQ.prototype.appKey = function ()
{
    if (this._appInfo[QQAppInfoKeys.AppKey] !== undefined) 
    {
        return this._appInfo[QQAppInfoKeys.AppKey];
    }

    return null;
};

/**
 * 获取授权方式
 *
 * @return  web 网页授权方式，sso 单点登录授权方式，both 两者共同使用，优先使用SSO
 */
QQ.prototype.authType = function ()
{
    if (this._appInfo[QQAppInfoKeys.AuthType] !== undefined) 
    {
        return this._appInfo[QQAppInfoKeys.AuthType];
    }

    return $mob.shareSDK.authType();
};

//v4.0.0增加
//授权 分享的 客户端类型 0 = 手Q 1 = TIM
QQ.prototype.QQShareType = function ()
{
    if (this._appInfo[QQAppInfoKeys.QQShareType] !== undefined) 
    {
        return this._appInfo[QQAppInfoKeys.QQShareType];
    }

     return 0;
};

/**
 * 获取缓存域名
 * @returns {string}    域名
 */
QQ.prototype.cacheDomain = function ()
{
    return "SSDK-Platform-" + $mob.shareSDK.platformType.QQ + "-" + this.appId();
};

/**
 * 获取授权方式
 *
 * @return  web 网页授权方式，sso 单点登录授权方式，both 两者共同使用，优先使用SSO
 */
QQ.prototype.convertUrlEnabled = function ()
{
    if (this._appInfo[QQAppInfoKeys.ConvertUrl] !== undefined) 
    {
        return this._appInfo[QQAppInfoKeys.ConvertUrl];
    }

    return $mob.shareSDK.convertUrlEnabled();
};

/**
 * 设置/获取应用信息
 * @param value 应用信息
 * @returns {*}
 */
QQ.prototype.setAppInfo = function (value)
{
    if (arguments.length === 0) 
    { 
        return this._appInfo;
    }
    else
    {
        this._appInfo = this._checkAppInfoAvailable(value);
        this._authScopes = this._checkAuthScopes(value);
        this._updateCallbackURLSchemes();
        this._setupApp(this.appId());
    }
};

/**
 * 保存配置信息
 */
QQ.prototype.saveConfig = function ()
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

            curApps["plat_" + self.type()] = self.appId();
            $mob.ext.setCacheData("currentApp", curApps, false, domain, null);
        }
    });
};

/**
 * 获取是否支持授权
 * @returns {boolean} true 支持， false 不支持
 */
QQ.prototype.isSupportAuth = function ()
{
    return true;
};

/**
 * 用户授权
 * @param sessionId     授权会话标识
 * @param settings      授权设置
 */
QQ.prototype.authorize = function (sessionId, settings)
{
    var error = null;
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
                "get_simple_userinfo",
                "get_user_info",
                "add_topic",
                "upload_pic",
                "add_share"
            ];
        }

        var self = this;
        //检测URL Scheme
        this._checkUrlScheme(function (hasReady, urlScheme){

            if (hasReady)
            {
                //进行SSO授权
                self._ssoAuthorize(sessionId, urlScheme, settings);
            }
            else
            {
                var error_message = null;
                                             
                if(this._currentLanguage === "zh-Hans")
                {
                    error_message = "分享平台［" + self.name() + "］尚未配置URL Scheme:" + self._authUrlScheme + "，无法进行授权!";
                }
                else
                {
                    error_message = "Platform［" + self.name() + "］did not set URL Scheme:" + self._authUrlScheme + ",unable to authorize!";
                }

                var error = {
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
QQ.prototype.getUserInfo = function (query, callback)
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

        self.callApi("https://openmobile.qq.com/user/get_simple_userinfo", "GET", null, null, function (state, data) {

            var resultData = data;
            if (state === $mob.shareSDK.responseState.Success)
            {
                //转换用户数据
                resultData = {
                    "platform_type" : $mob.shareSDK.platformType.QZone,
                    "uid" : user.credential.uid
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
QQ.prototype.callApi = function (url, method, params, headers, callback)
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

            params["oauth_consumer_key"] = self.appId();

            //将授权用户的授权令牌作为参数进行HTTP请求
            if (user.credential != null)
            {
                params["access_token"] = user.credential.token;
                params["openid"] = user.credential.raw_data.openid;
            }

            $mob.ext.ssdk_callHTTPApi($mob.shareSDK.platformType.QZone, null, url, method, params, headers, function (data) {

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
                                case 100006:
                                case 100007:
                                case 100013:
                                case 100014:
                                case 100015:
                                case 100016:
                                case 100030:
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
 * 处理用户授权回调
 * @param sessionId     授权会话标识
 * @param callbackUrl   回调地址
 */
QQ.prototype.handleAuthCallback = function (sessionId, callbackUrl)
{
    var error = null;
    var error_message;
    var self = this;
    var urlInfo = $mob.utils.parseUrl(callbackUrl);
    if (urlInfo != null && urlInfo.query != null)
    {
        var params = $mob.utils.parseUrlParameters(urlInfo.fragment);
        if (params != null && params.access_token != null)
        {
            var getOpenIDParams;
            if(self.backUnionid())
            {
                getOpenIDParams = {
                    "access_token" : params.access_token,
                    "unionid" : "1"
                };
            }
            else
            {
                getOpenIDParams = {
                    "access_token" : params.access_token
                };
            }

            $mob.ext.ssdk_callHTTPApi($mob.shareSDK.platformType.QZone, null, "https://graph.qq.com/oauth2.0/me", "GET", getOpenIDParams, null, function (data) {

                if (data != null)
                {
                    if (data ["error_code"] != null)
                    {
                        //失败
                        $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Fail, data);
                    }
                    else if (data ["status_code"] != null && data ["status_code"] === 200)
                    {
                        //应该是无效代码
                        // var callback = function (obj)
                        // {
                        //     return obj;
                        // };
                        var responseString = $mob.utils.base64Decode(data["response_data"]);
                        var reg = new RegExp('{[\\s\\S]+}');
                        var result = reg.exec(responseString);
                        var response = $mob.utils.jsonStringToObject(result[0]);
                        if (response.openid != null)
                        {
                            //授权成功
                            if(response.unionid != null)
                            {
                                params.unionid = response.unionid; 
                            }
                            params["openid"] = response.openid;
                            self._succeedAuthorize(sessionId, params);
                        }
                        else
                        {
                            //授权失败
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

QQ.prototype.getUnionid = function (sessionId,data)
{
    var self = this;
    var getOpenIDParams = {
        "access_token" : data.access_token,
         "unionid" : "1"
     };
     $mob.ext.ssdk_callHTTPApi($mob.shareSDK.platformType.QZone, null, "https://graph.qq.com/oauth2.0/me", "GET", getOpenIDParams, null, function (backData) {
        if (backData != null)
        {
            if(backData["response_data"])
            {
                var responseString = $mob.utils.base64Decode(backData["response_data"]);
                var reg = new RegExp('{[\\s\\S]+}');
                 var result = reg.exec(responseString);
                 if(result != null)
                 {
                    var response = $mob.utils.jsonStringToObject(result[0]);
                    if(response.unionid != null)
                    {
                        data.unionid = response.unionid;
                        self._succeedAuthorize(sessionId, data);
                    }
                    else
                    {
                        $mob.native.log("[ShareSDK-WARNING] unionid get error");
                        $mob.native.log(responseString);
                        self._succeedAuthorize(sessionId, data);
                    }
                }
                else
                {
                    $mob.native.log("[ShareSDK-WARNING] unionid get error");
                    $mob.native.log(responseString);
                    self._succeedAuthorize(sessionId, data);
                }
            }
            else
            {
                $mob.native.log("[ShareSDK-WARNING] unionid get error");
                $mob.native.log(backData);
                self._succeedAuthorize(sessionId, data);
            }
        }
        else
        {
            $mob.native.log("[ShareSDK-WARNING] unionid get error");
            $mob.native.log(backData);
            self._succeedAuthorize(sessionId, data);
        }
    });
};

/**
 * 处理SSO授权回调
 * @param sessionId     会话ID
 * @param callbackUrl   回调URL
 * @param sourceApplication     原始应用名称
 * @param annotation            附加数据
 */
QQ.prototype.handleSSOCallback = function (sessionId, callbackUrl, sourceApplication, annotation)
{
    var self = this;
    if (callbackUrl.indexOf(this._authUrlScheme + "://") === 0)
    {
        $mob.ext.ssdk_isConnectedPlatformSDK("QQApiInterface",function(data)
        {
            if(data.result)
            {
                $mob.ext.isPluginRegisted("com.mob.sharesdk.connector.qq", function (data) {
                    //授权返回的数据
                    if(data.result)
                    {
                        //处理回调
                        $mob.ext.ssdk_qqHandlerSSOCallback(self.appId(), callbackUrl, function (data) {

                            switch (data.state)
                            {
                                case $mob.shareSDK.responseState.Success:
                                {
                                    if(self.backUnionid())
                                    {
                                        self.getUnionid(sessionId, data.result);
                                    }
                                    else
                                    {
                                        self._succeedAuthorize(sessionId, data.result);
                                    }
                                    break;
                                }
                                case $mob.shareSDK.responseState.Fail:
                                {
                                    //授权失败
                                    var error = {
                                        "error_code" : $mob.shareSDK.errorCode.APIRequestFail
                                    };

                                    $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Fail, error);
                                    break;
                                }
                                default :
                                    $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Cancel, null);
                                    break;
                            }

                        });
                    }
                    else
                    {
                        self._handleSSOCallbackWithoutSDK(self.appId(), sessionId, callbackUrl);
                    }
                });
            }
            else
            {
                self._handleSSOCallbackWithoutSDK(self.appId(), sessionId, callbackUrl);
            }
        });
        return true;
    }
    return false;
};

QQ.prototype._handleSSOCallbackWithoutSDK = function (appId, sessionId, callbackUrl)
{
    var self = this;

    if(callbackUrl.slice(0, "tencent".length) === "tencent")
    {
        //获取UIPasteboard取得并解析后的字典数据
        $mob.ext.ssdk_getDataFromPasteboard(appId, sessionId, callbackUrl,$mob.shareSDK.platformType.QQ,function(data){

            //$mob.native.log("data.retDic.ret " + data.retDic["ret"] + " user_cancelled " + data.retDic["user_cancelled"]);

            if(data.result)
            {
                if(data.retDic["ret"] === 0)
                {
                    //成功
                    if(self.backUnionid())
                    {
                        self.getUnionid(sessionId, data.retDic);
                    }
                    else
                    {
                        self._succeedAuthorize(sessionId, data.retDic);
                    }
                }
                else
                {
                    if(data.retDic["user_cancelled"] === 0)
                    {
                        //失败
                        $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Fail, data.retDic);
                    }
                    else
                    {
                        //取消
                        $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Cancel, data.retDic);
                    }
                }
            }
        });
    }
};

/**
 * 处理分享回调
 * @param sessionId     会话ID
 * @param callbackUrl   回调URL
 * @param sourceApplication     原始应用名称
 * @param annotation            附加数据
 */
QQ.prototype.handleShareCallback = function (sessionId, callbackUrl, sourceApplication, annotation)
{
    var self = this;
    if (callbackUrl.indexOf(this._authUrlScheme + "://") === 0 || callbackUrl.indexOf(this._shareUrlScheme + "://") === 0)
    {
        $mob.ext.ssdk_isConnectedPlatformSDK("QQApiInterface",function(data) {

            if (data.result)
            {
                $mob.ext.isPluginRegisted("com.mob.sharesdk.connector.qq", function (data) {
                    //分享返回的数据
                    if (data.result)
                    {
                        $mob.ext.ssdk_qqHandlerShareCallback(self.appId(), callbackUrl, function (data) {

                            self._getCurrentUser(function (user) {

                                //从分享内容集合中取出分享内容
                                var shareParams = QQShareContentSet [sessionId];
                                var content = null;
                                var userData = null;
                                if (shareParams != null)
                                {
                                    content = shareParams["content"];
                                    userData = shareParams["user_data"];
                                }

                                switch (data.state)
                                {
                                    case $mob.shareSDK.responseState.Success:
                                    {
                                        //转换数据
                                        var resultData = {};
                                        resultData["raw_data"] = content;
                                        resultData["text"] = content["text"];

                                        var urls = [];
                                        if (content["url"])
                                        {
                                            urls.push(content["url"]);
                                        }
                                        resultData["urls"] = urls;

                                        if (content ["thumb_image"] != null)
                                        {
                                            resultData["images"] = [content ["thumb_image"]];
                                        }
                                        else if (content ["image"] != null)
                                        {
                                            resultData["images"] = [content ["image"]];
                                        }

                                        $mob.native.ssdk_shareStateChanged(sessionId, $mob.shareSDK.responseState.Success, resultData, user, userData);

                                        break;
                                    }
                                    case $mob.shareSDK.responseState.Fail:
                                        //失败
                                        var error = {
                                            "error_code" : $mob.shareSDK.errorCode.APIRequestFail,
                                            "user_data" :  {"error_code" : data.error_code, "error_message" : data.error_message}
                                        };

                                        $mob.native.ssdk_shareStateChanged(sessionId, $mob.shareSDK.responseState.Fail, error, user, userData);
                                        break;
                                    default :
                                        //取消
                                        $mob.native.ssdk_shareStateChanged(sessionId, $mob.shareSDK.responseState.Cancel, null, user, userData);
                                        break;
                                }

                                //移除分享参数集合中的数据
                                delete QQShareContentSet[sessionId];
                                QQShareContentSet[sessionId] = null;

                            });
                        });
                    }
                    else
                    {
                        self._handleShareCallbackWithoutSDK(sessionId,callbackUrl);
                    }
                });
            }
            else
            {
                self._handleShareCallbackWithoutSDK(sessionId,callbackUrl);
            }
        });

        return true;
    }

    return false;
};

QQ.prototype._handleShareCallbackWithoutSDK = function (sessionId, callbackUrl)
{
    var self = this;
    if(callbackUrl.slice(0, "QQ".length) === "QQ")
    {
        var parseUrl = {};

        if (callbackUrl.indexOf("?") !== -1)
        {
            var urlObj = callbackUrl.split("?");
            var str = urlObj[1];
            var strs = str.split("&");
            for(var i = 0; i < strs.length; i ++) 
            {
                parseUrl[strs[i].split("=")[0]] = unescape(strs[i].split("=")[1]);
            }
        }

        if(parseUrl["error_description"])
        {
            //对数据进行base64解码
            parseUrl["error_description"] = $mob.utils.base64Decode(parseUrl["error_description"]);
        }

        self._getCurrentUser(function (user) {

            //从分享内容集合中取出分享内容
            var shareParams = QQShareContentSet [sessionId];
            var content = null;
            var userData = null;
            if (shareParams != null)
            {
                content = shareParams["content"];
                userData = shareParams["user_data"];
            }

            switch (Number(parseUrl["error"]))
            {
                //成功
                case 0:
                {
                    //转换数据
                    var resultData = {};
                    resultData["raw_data"] = content;
                    resultData["text"] = content["text"];

                    var urls = [];
                    if (content["url"])
                    {
                        urls.push(content["url"]);
                    }
                    resultData["urls"] = urls;

                    if (content ["thumb_image"] != null)
                    {
                        resultData["images"] = [content ["thumb_image"]];
                    }
                    else if (content ["image"] != null)
                    {
                        resultData["images"] = [content ["image"]];
                    }

                    $mob.native.ssdk_shareStateChanged(sessionId, $mob.shareSDK.responseState.Success, resultData, user, userData);
                    break;
                }
                //取消
                case -4:
                    $mob.native.ssdk_shareStateChanged(sessionId, $mob.shareSDK.responseState.Cancel, null, user, userData);
                    break;
                //失败
                default :
                    var error = {
                        "error_code" : $mob.shareSDK.errorCode.APIRequestFail,
                        "user_data" :  {"error_code" : parseUrl["error"]},
                        "error_message" : parseUrl
                    };

                    $mob.native.ssdk_shareStateChanged(sessionId, $mob.shareSDK.responseState.Fail, error, user, userData);
                    break;
            }

            //移除分享参数集合中的数据
            delete QQShareContentSet[sessionId];
            QQShareContentSet[sessionId] = null;
        });
    }
};

/**
 * 取消授权
 */
QQ.prototype.cancelAuthorize = function ()
{
    this._setCurrentUser(null, null);
};

/**
 * 添加好友
 * @param sessionId     会话标识
 * @param user          用户信息
 * @param callback      方法回调，回调方法声明如下:function (stat, data);
 */
QQ.prototype.addFriend = function (sessionId, user, callback)
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
QQ.prototype.getFriends = function (cursor, size, callback)
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
QQ.prototype.share = function (sessionId, parameters, callback)
{
    //获取分享统计标识
    var self = this;
    //使用系统分享
    var enableExtensionShare = parameters != null ? parameters ["@extension_share"] : false;
    self._checkShare(enableExtensionShare,sessionId,parameters,callback)
};

QQ.prototype._checkShare = function (enableExtensionShare,sessionId, parameters, callback)
{
    var self = this;
     //获取分享统计标识
    var flags = parameters != null ? parameters ["@flags"] : null;
    var userData = {
        "@flags" : flags
    };
    if(enableExtensionShare)
    {
        self._extensionShare(sessionId, parameters, userData, callback);
    }
    else
    {
        //检测是否支持多任务
        $mob.ext.isMultitaskingSupported(function (data){

            if (data.result)
            {
                self._checkShareUrlScheme(function (hasReady, urlScheme) {

                    if (hasReady)
                    {
                        $mob.ext.ssdk_isConnectedPlatformSDK("QQApiInterface",function(data)
                        {
                            if(data.result)
                            {
                                $mob.ext.isPluginRegisted("com.mob.sharesdk.connector.qq", function (data) {

                                    if (data.result)
                                    {
                                        self._share(sessionId, parameters, userData, callback);
                                    }
                                    else
                                    {
                                        self._sharewithoutsdk(sessionId, parameters, userData, callback);
                                    }
                                });
                            }
                            else
                            {
                                self._sharewithoutsdk(sessionId, parameters, userData, callback);
                            }
                        });
                    }
                    else
                    {
                        var error_message = null;

                        if(this._currentLanguage === "zh-Hans")
                        {
                            error_message = "尚未配置[" + self.name() + "]URL Scheme:" + self._shareUrlScheme + ", 无法进行分享。";
                        }
                        else
                        {
                            error_message = "Can't share because platform［" + self.name() + "］did not set URL Scheme:" + self._shareUrlScheme + "!Please try again after set URL Scheme!";
                        }

                        var error = {
                            "error_code" : $mob.shareSDK.errorCode.UnsetURLScheme,
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
                //返回错误
                var error = {
                    "error_code" : $mob.shareSDK.errorCode.UnsupportFeature,
                    "error_message" : "应用已禁用后台模式，分享平台［" + self.name() + "］无法进行分享! 请在项目设置中开启后台模式后再试!"
                };

                if (callback != null)
                {
                    callback ($mob.shareSDK.responseState.Fail, error, null, userData);
                }
            }
        });
    }
};

QQ.prototype._extensionShare = function (sessionId, parameters, userData, callback)
{
    var platformType = null;
    var scene = parameters ["qq_scene"];
    if (scene == null)
    {
        scene = QQScene.QQFriend;
    }
    switch (scene)
    {
        case QQScene.QZone:
            platformType = $mob.shareSDK.platformType.QZone;
            break;
        default :
            platformType = $mob.shareSDK.platformType.QQFriend;
            break;
    }

    var type = $mob.shareSDK.getShareParam(platformType, parameters, "type");
    if (type == null)
    {
        type = $mob.shareSDK.contentType.Auto;
    }
    if (type === $mob.shareSDK.contentType.Auto)
    {
        type =  this._getShareType(parameters, platformType);
    }
    var self = this;
    var resultData;
    switch (type)
    {
        case $mob.shareSDK.contentType.Text:
        case $mob.shareSDK.contentType.App:
        case $mob.shareSDK.contentType.Audio:
        case $mob.shareSDK.contentType.Video:
        case $mob.shareSDK.contentType.MiniProgram:
        {
            self._checkShare(false , sessionId, parameters, callback);
            break;
        }
        case $mob.shareSDK.contentType.Image:
        {
            var images = $mob.shareSDK.getShareParam(platformType, parameters, "images");
            if (Object.prototype.toString.apply(images) === '[object Array]')
            {
                if(images.length > 9)
                {
                    images.length = 9;
                }
                else if(images.length === 0)
                {
                    images = null;
                }
            }
            //确认至少有一张图片
            if(images != null)
            {
                $mob.ext.ssdk_QQExtensionShare($mob.shareSDK.contentType.Image , images, self.QQShareType(), function (data){
                    var state = data.state;
                    if(state != null)
                    {
                        resultData= {"platform" : platformType, "scene" : scene, "images" : images};
                        resultData["images"] = images;
                        self._extensionShareFinish(state , sessionId , resultData, userData);
                    }
                    else
                    {
                        self._checkShare(false , sessionId, parameters, callback);
                    }
                });
            }
            else
            {
                self._checkShare(false , sessionId, parameters, callback);
            }
            break;
        }
        case $mob.shareSDK.contentType.WebPage:
        {
            var url = $mob.shareSDK.getShareParam(platformType, parameters, "url");
            if (url != null)
            {
                $mob.ext.ssdk_QQExtensionShare($mob.shareSDK.contentType.WebPage , url, self.QQShareType(), function (data){
                    var state = data.state;
                    if(state != null)
                    {
                        resultData= {"platform" : platformType, "scene" : scene, "url" : url};
                        resultData["urls"] = [url];
                        self._extensionShareFinish(state , sessionId , resultData, userData);
                    }
                    else
                    {
                        self._checkShare(false , sessionId, parameters, callback);
                    }
                });
            }
            else
            {
                self._checkShare(false , sessionId, parameters, callback);
            }
            break;
        }
        case $mob.shareSDK.contentType.File:
        {
            var sourceFile = $mob.shareSDK.getShareParam(platformType, parameters, "url");
            if (sourceFile != null)
            {
                $mob.ext.ssdk_QQExtensionShare($mob.shareSDK.contentType.File , sourceFile, self.QQShareType(), function (data){
                    var state = data.state;
                    if(state != null)
                    {
                        resultData = {"platform" : platformType, "scene" : scene, "source_file" : sourceFile};
                        self._extensionShareFinish(state , sessionId , resultData, userData);
                    }
                    else
                    {
                        self._checkShare(false , sessionId, parameters, callback);
                    }
                });
            }
            else
            {
                self._checkShare(false , sessionId, parameters, callback);
            }
            break;
        }
        default :
        {
            self._checkShare(false , sessionId, parameters, callback);
            break;
        }
    }
};

QQ.prototype._extensionShareFinish = function (state , sessionId, parameters , userData)
{
    var self = this;
    self._getCurrentUser(function (user) {
        if(state === $mob.shareSDK.responseState.Cancel)
        {
            $mob.native.ssdk_shareStateChanged(sessionId, $mob.shareSDK.responseState.Cancel, null, user, userData);
        }
        else // $mob.shareSDK.responseState.Success:
        {
            $mob.native.ssdk_shareStateChanged(sessionId, $mob.shareSDK.responseState.Success, parameters, user, userData);
        }
    });
};

/**
 * 创建用户信息
 * @param rawData       原始用户数据
 * @returns {null}      用户数据
 */
QQ.prototype.createUserByRawData = function (rawData)
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
QQ.prototype._convertUrl = function (platformType ,contents, callback)
{
    if (this.convertUrlEnabled())
    {
        this._getCurrentUser(function(user){
            $mob.shareSDK.convertUrl(platformType, user, contents, callback);

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
QQ.prototype._isUserAvaliable = function (user)
{

    return user.credential != null && user.credential.token != null && user.credential.expired > new Date().getTime();

};

/**
 * 更新回调链接
 * @private
 */
QQ.prototype._updateCallbackURLSchemes = function ()
{
    //先删除之前的回调地址
    this._authUrlScheme = null;

    var appId = this.appId();
    if (appId != null)
    {
        this._authUrlScheme = "tencent" + appId;

        var value = parseInt(this.appId());
        var str = value.toString(16).toUpperCase();
        while (str.length < 8)
        {
            str = "0" + str;
        }
        this._shareUrlScheme = "QQ" + str;
    }
};

/**
 * 检测应用是否有效
 * @returns {boolean}   true 有效 false 无效
 * @private
 */
QQ.prototype._isAvailable = function ()
{
    if (this.appId() != null && this.appKey() != null)
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
QQ.prototype._checkAuthScopes = function (appInfo)
{
    return appInfo [QQAppInfoKeys.Scopes];
};

/**
 * 检测应用信息有效性
 * @param appInfo   应用信息
 * @private
 */
QQ.prototype._checkAppInfoAvailable = function (appInfo)
{
    //过滤
    var appId = $mob.utils.trim(appInfo [QQAppInfoKeys.AppID]);
    var appKey = $mob.utils.trim(appInfo [QQAppInfoKeys.AppKey]);
    
    if (appId != null)
    {
        appInfo [QQAppInfoKeys.AppID] = appId;
    }
    else
    {
        appInfo [QQAppInfoKeys.AppID] = this.appId();
    }
    
    if (appKey != null) 
    {
        appInfo [QQAppInfoKeys.AppKey] = appKey;
    }
    else
    {
        appInfo [QQAppInfoKeys.AppKey] = this.appKey();
    }
    
    return appInfo;
};

/**
 * 检测是否配置URL Scheme
 * @param callback 方法回调
 * @private
 */
QQ.prototype._checkUrlScheme = function (callback)
{
    var self = this;
    $mob.ext.getAppConfig(function (data){

        var urlScheme = null;
        var warningLog = "";
        var hasReady = false;

        var callbackScheme = self._authUrlScheme;

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
            $mob.native.log("[ShareSDK-WARNING] 尚未配置[" + self.name() + "]URL Scheme:" + warningLog );
        }

        if (callback != null)
        {
            callback (hasReady, urlScheme);
        }

    });
};

/**
 * 检测是否配置URL Scheme
 * @param callback  方法回调
 * @private
 */
QQ.prototype._checkShareUrlScheme = function (callback)
{
    var self = this;
    $mob.ext.getAppConfig(function (data){

        var urlScheme = null;
        var warningLog = "";
        var hasReady = false;

        var callbackScheme = self._shareUrlScheme;

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
            $mob.native.log("[ShareSDK-WARNING] 尚未配置[" + self.name() + "]URL Scheme:" + warningLog + ", 无法进行分享。");
        }

        if (callback != null)
        {
            callback (hasReady, urlScheme);
        }

    });
};

/**
 * 网页授权
 * @param sessionId     会话标识
 * @param settings      授权设置
 * @private
 */
QQ.prototype._webAuthorize = function (sessionId, settings)
{
    var self = this;
    $mob.ext.ssdk_getDeviceModel(function (data){
        var deviceModel = data.deviceModel;
        $mob.ext.getAppConfig(function (data){
            var authUrl = "https://openmobile.qq.com/oauth2.0/m_authorize?";
            authUrl += "state=test&sdkp=i&response_type=token&display=mobile&switch=1&status_version=10";
            authUrl += "&sdkv=3.2.1";
            if(deviceModel != null)
            {
                authUrl+= "&status_machine="+deviceModel;
            }
            if(data != null)
            {
                authUrl+= "&status_os="+data.MOBSystemVersion;
            }
            authUrl += "&client_id="+self.appId();
            authUrl += "&redirect_uri="+$mob.utils.urlEncode(QQRedirectUri);
            if (settings != null && settings ["scopes"] != null && Object.prototype.toString.apply(settings ["scopes"]) === '[object Array]')
            {
                authUrl += "&scope=" + $mob.utils.urlEncode(settings ["scopes"].join(","));
            }
            else if (self._authScopes != null)
            {   
                authUrl += "&scope=" + $mob.utils.urlEncode(self._authScopes);
            }
            //打开授权
            $mob.native.ssdk_openAuthUrl(sessionId, authUrl, QQRedirectUri);
        });
    });
};

/**
 * SSO授权
 * @param sessionId     会话标识
 * @param urlScheme     回调URL Scheme
 * @param settings      授权设置
 * @private
 */
QQ.prototype._ssoAuthorize = function (sessionId, urlScheme, settings)
{
    var self = this;

    $mob.ext.ssdk_isConnectedPlatformSDK("QQApiInterface",function(data)
    {
        var scope = null;

        if (settings != null && settings ["scopes"] != null && Object.prototype.toString.apply(settings ["scopes"]) === '[object Array]')
        {
            scope = settings ["scopes"];
        }
        else if (this._authScopes != null)
        {
            var scopesStr = this._authScopes;
            scope = scopesStr.split(",");
        }

        if(data.result)
        {
            $mob.ext.isPluginRegisted("com.mob.sharesdk.connector.qq", function (data) {

                if (data.result)
                {
                    $mob.ext.ssdk_qqAuth(self.appId(), scope, self.QQShareType(), function (data) {

                        if (data.state != null)
                        {
                            switch (data.state)
                            {
                                case $mob.shareSDK.responseState.Success:
                                {
                                    if(self.backUnionid())
                                    {
                                        self.getUnionid(sessionId, data.result);
                                    }
                                    else
                                    {
                                        self._succeedAuthorize(sessionId, data.result);
                                    }
                                    break;
                                }
                                case $mob.shareSDK.responseState.Fail:
                                {
                                    //授权失败
                                    $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Fail, data.result);
                                    break;
                                }
                                default :
                                    $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Cancel, null);
                                    break;
                            }
                        }
                    });
                }
                else
                {
                    self._ssoAuthorizeWithoutSDK(self.appId(),sessionId, scope , settings);
                }
            });
        }
        else
        {
            self._ssoAuthorizeWithoutSDK(self.appId(),sessionId, scope , settings);
        }
    });
};

QQ.prototype._ssoAuthorizeWithoutSDK = function (appId, sessionId, scope ,settings)
{
    var self = this;

    $mob.ext.getAppConfig(function (data){

        var appName = data.CFBundleDisplayName?data.CFBundleDisplayName:"";
        var deviceModel = data.MOBDeviceModel?data.MOBDeviceModel:"";
        var systemVersion = data.MOBSystemVersion?data.MOBSystemVersion:"";
        var authData = {
            "app_id":appId,
            "app_name":appName,
            "client_id":appId,
            "response_type":"token",
            "scope":scope.join(","),
            "sdkp" :"i",
            "sdkv" : "2.9",
            "status_machine" : deviceModel,
            "status_os" : systemVersion,
            "status_version" : systemVersion
        };

        $mob.ext.canOpenURL("mqq://",function(data){
            if (data.result)
            {
                //模拟的SSO
                $mob.ext.ssdk_setDataToPasteboard($mob.shareSDK.platformType.QQ, appId, {"type":"authorize","authData":authData} , sessionId, function(data){
                    if(data.result)
                    {
                        var urlstring = "";
                        var otherURLString = "";
                        if(self.QQShareType() === 1) //TIM
                        {
                            urlstring = "timOpensdkSSoLogin://SSoLogin/tencent" + appId + "/com.tencent.tencent" + appId + "?generalpastboard=1";
                            otherURLString = "mqqOpensdkSSoLogin://SSoLogin/tencent" + appId + "/com.tencent.tencent" + appId + "?generalpastboard=1";
                        }
                        else
                        {
                            urlstring = "mqqOpensdkSSoLogin://SSoLogin/tencent" + appId + "/com.tencent.tencent" + appId + "?generalpastboard=1";
                            otherURLString = "timOpensdkSSoLogin://SSoLogin/tencent" + appId + "/com.tencent.tencent" + appId + "?generalpastboard=1";
                        }
                        $mob.ext.canOpenURL(urlstring,function(data){
                            if (data.result)
                            {
                                $mob.native.openURL(urlstring);
                            }
                            else
                            {
                                $mob.ext.canOpenURL(otherURLString,function(data){
                                    if (data.result)
                                    {
                                        $mob.native.openURL(otherURLString);
                                    }
                                });
                            }
                        });
                    }
                });
            }
            else
            {
                //模拟的网页授权
                self._webAuthorize(sessionId,settings);
            }
        });
    });
};

/**
 * 授权成功
 * @param sessionId             会话ID
 * @param credentialRawData     授权凭证原始数据
 * @private
 */
QQ.prototype._succeedAuthorize = function (sessionId, credentialRawData)
{
    var self = this;
    //成功
    var uid = null;
    if(self.backUnionid())
    {
        uid = credentialRawData['unionid'];
    }
    if(uid == null)
    {
        uid = credentialRawData['openid'];
    }

    //成功
    var credential = {
        "uid"       : uid,
        "token"     : credentialRawData["access_token"],
        "expired"   : (new Date().getTime() +  credentialRawData ["expires_in"] * 1000),
        "raw_data"  : credentialRawData,
        "type"      : $mob.shareSDK.credentialType.OAuth2
    };

    var user = {
        "platform_type" : $mob.shareSDK.platformType.QQ,
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
QQ.prototype._setCurrentUser = function (user, callback)
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
QQ.prototype._getCurrentUser = function (callback)
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
QQ.prototype._updateUserInfo = function (user, rawData)
{
    if (user != null && rawData != null)
    {
        user["raw_data"] = rawData;
        user["nickname"] = rawData["nickname"];
        user["icon"] = rawData["figureurl_2"];

        //性别
        var gender = 2;
        if (rawData["gender"] === "男")
        {
            gender = 0;
        }
        else if (rawData["gender"] === "女")
        {
            gender = 1;
        }
        user["gender"] = gender;

        user["verify_type"] = rawData["vip"] ? 1 : 0;
        user["level"] = rawData["level"];
    }
};

/**
 * 分享内容
 * @param sessionId         会话标识
 * @param parameters        分享参数
 * @param userData          用户自定义数据
 * @param callback          回调
 * @private
 */
QQ.prototype._share = function (sessionId, parameters, userData, callback)
{
    //先判断是否使用客户端分享
    var text = null;
    var title = null;
    var thumbImage = null;
    var images = null;
    var url = null;
    var audioFlashUrl = null;
    var videoFlashUrl = null;
    var self = this;
    var platformType = null;
    var error = null;
    var error_message;

    var scene = parameters ["qq_scene"];
    if (scene == null)
    {
        scene = QQScene.QQFriend;
    }

    switch (scene)
    {
        case QQScene.QZone:
            platformType = $mob.shareSDK.platformType.QZone;
            break;
        default :
            platformType = $mob.shareSDK.platformType.QQFriend;
            break;
    }

    var type = $mob.shareSDK.getShareParam(platformType, parameters, "type");
    if (type == null)
    {
        type = $mob.shareSDK.contentType.Auto;
    }
    if (type === $mob.shareSDK.contentType.Auto)
    {
        type =  this._getShareType(parameters, platformType);
    }

    switch (type)
    {
        case $mob.shareSDK.contentType.Text:
        {
            text = $mob.shareSDK.getShareParam(platformType, parameters, "text");
            if (text != null)
            {
                this._convertUrl(platformType ,[text], function (data) {

                    text = data.result[0];
                    $mob.ext.ssdk_qqShareText(self.appId(), scene, text, self.QQShareType(), function (data) {

                        if (data.error_code != null)
                        {
                            if (callback != null)
                            {
                                callback ($mob.shareSDK.responseState.Fail, data, null, userData);
                            }
                        }
                        else
                        {
                            //调用成功后不回调，等待微信客户端回调时再触发
                            //记录分享内容
                            var shareParams = {"platform" : platformType, "text" : text};
                            QQShareContentSet [sessionId] = {"content" : shareParams, "user_data" : userData};
                        }
                    });
                });
            }
            else
            {
                error_message = null;
                
                if(this._currentLanguage === "zh-Hans")
                {
                    error_message = "分享参数text不能为空!";
                }
                else
                {
                    error_message = "Share param text can not be nil!";
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
        case $mob.shareSDK.contentType.Image:
        {
            text = $mob.shareSDK.getShareParam(platformType, parameters, "text");
            title = $mob.shareSDK.getShareParam(platformType, parameters, "title");
            thumbImage = $mob.shareSDK.getShareParam(platformType, parameters, "thumb_image");
            var image = null;

            images = $mob.shareSDK.getShareParam(platformType, parameters, "images");
            if (Object.prototype.toString.apply(images) === '[object Array]')
            {
                //取第一张图片进行分享
                image = images [0];
            }

            if (images != null)
            {
                this._convertUrl(platformType , [text], function (data) {

                    text = data.result[0];

                    $mob.ext.ssdk_qqShareImage(self.appId(), scene, title, text, thumbImage, images, self.QQShareType(), function (data){

                        if (data.error_code != null)
                        {
                            if (callback != null)
                            {
                                callback ($mob.shareSDK.responseState.Fail, data, null, userData);
                            }
                        }
                        else
                        {
                            //调用成功后不回调，等待QQ客户端回调时再触发
                            //记录分享内容
                                               
                            var shareParams = {};
                            if (scene === QQScene.QQFriend)
                            {
                                shareParams = {"platform" : platformType, "text" : text, "title" : title, "thumb_image" : thumbImage, "image" : image};
                            }
                            else
                            {
                                shareParams = {"platform" : platformType, "text" : text, "title" : title, "thumb_image" : thumbImage, "image" : images};
                            }
                                               
                            QQShareContentSet [sessionId] = {"content" : shareParams, "user_data" : userData};
                        }
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
                    error_message = "Share param image can not be nil!";
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
        case  $mob.shareSDK.contentType.WebPage:
        {
            text = $mob.shareSDK.getShareParam(platformType, parameters, "text");
            title = $mob.shareSDK.getShareParam(platformType, parameters, "title");

            thumbImage = $mob.shareSDK.getShareParam(platformType, parameters, "thumb_image");
            if (thumbImage == null)
            {
                images = $mob.shareSDK.getShareParam(platformType, parameters, "images");
                if (Object.prototype.toString.apply(images) === '[object Array]')
                {
                    //取第一张图片进行分享
                    thumbImage = images [0];
                }
            }

            url = $mob.shareSDK.getShareParam(platformType, parameters, "url");

            if (title != null && thumbImage != null && url != null)
            {
                this._convertUrl(platformType , [text, url], function (data) {

                    text = data.result[0];
                    url = data.result[1];

                    $mob.ext.ssdk_qqShareWebpage(self.appId(), scene, title, text, thumbImage, url, self.QQShareType(), function (data) {

                        if (data.error_code != null)
                        {
                            if (callback != null)
                            {
                                callback ($mob.shareSDK.responseState.Fail, data, null, userData);
                            }
                        }
                        else
                        {
                            //调用成功后不回调，等待微信客户端回调时再触发
                            //记录分享内容
                            var shareParams = {"platform" : platformType, "text" : text, "title" : title, "thumb_image" : thumbImage, "url" : url};
                            QQShareContentSet [sessionId] = {"content" : shareParams, "user_data" : userData};
                        }
                    });
                });
            }
            else
            {
                error_message = null;
                
                if(this._currentLanguage === "zh-Hans")
                {
                    error_message = "分享参数title、thumbImage、url不能为空!";
                }
                else
                {
                    error_message = "Share param title、thumbImage、url can not be nil!";
                }

                error =
                {
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
        case $mob.shareSDK.contentType.Audio:
        {
            text = $mob.shareSDK.getShareParam(platformType, parameters, "text");
            title = $mob.shareSDK.getShareParam(platformType, parameters, "title");

            thumbImage = $mob.shareSDK.getShareParam(platformType, parameters, "thumb_image");
            if (thumbImage == null)
            {
                images = $mob.shareSDK.getShareParam(platformType, parameters, "images");
                if (Object.prototype.toString.apply(images) === '[object Array]')
                {
                    //取第一张图片进行分享
                    thumbImage = images [0];
                }
            }

            url = $mob.shareSDK.getShareParam(platformType, parameters, "url");
            audioFlashUrl = $mob.shareSDK.getShareParam(platformType, parameters, "audio_flash_url");

            if (title != null && thumbImage != null && url != null)
            {
                this._convertUrl(platformType , [text, url], function (data) {

                    text = data.result[0];
                    url = data.result[1];

                    $mob.ext.ssdk_qqShareAudio(self.appId(), scene, title, text, thumbImage, url, audioFlashUrl, self.QQShareType(), function (data) {

                        if (data.error_code != null)
                        {
                            if (callback != null)
                            {
                                callback ($mob.shareSDK.responseState.Fail, data, null, userData);
                            }
                        }
                        else
                        {
                            //调用成功后不回调，等待微信客户端回调时再触发
                            //记录分享内容
                            var shareParams = {"platform" : platformType, "text" : text, "title" : title, "thumb_image" : thumbImage, "url" : url};
                            QQShareContentSet [sessionId] = {"content" : shareParams, "user_data" : userData};
                        }
                    });
                });
            }
            else
            {
                error_message = null;
                
                if(this._currentLanguage === "zh-Hans")
                {
                    error_message = "分享参数title、thumbImage、url不能为空!";
                }
                else
                {
                    error_message = "Share param title、thumbImage、url can not be nil!";
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
        case $mob.shareSDK.contentType.Video:
        {
            text = $mob.shareSDK.getShareParam(platformType, parameters, "text");
            title = $mob.shareSDK.getShareParam(platformType, parameters, "title");

            thumbImage = $mob.shareSDK.getShareParam(platformType, parameters, "thumb_image");
            if (thumbImage == null)
            {
                images = $mob.shareSDK.getShareParam(platformType, parameters, "images");
                if (Object.prototype.toString.apply(images) === '[object Array]')
                {
                    //取第一张图片进行分享
                    thumbImage = images [0];
                }
            }

            url = $mob.shareSDK.getShareParam(platformType, parameters, "url");
            videoFlashUrl = $mob.shareSDK.getShareParam(platformType, parameters, "video_flash_url");

            if (title != null && thumbImage != null && url != null)
            {
                this._convertUrl(platformType , [text, url], function (data) {

                    text = data.result[0];
                    url = data.result[1];

                    $mob.ext.ssdk_qqShareVideo(self.appId(), scene, title, text, thumbImage, url, videoFlashUrl, self.QQShareType(), function (data) {

                        if (data.error_code != null)
                        {
                            if (callback != null)
                            {
                                callback ($mob.shareSDK.responseState.Fail, data, null, userData);
                            }
                        }
                        else
                        {
                            //调用成功后不回调，等待微信客户端回调时再触发
                            //记录分享内容
                            var shareParams = {"platform" : platformType, "text" : text, "title" : title, "thumb_image" : thumbImage, "url" : url};
                            QQShareContentSet [sessionId] = {"content" : shareParams, "user_data" : userData};
                        }
                    });
                });
            }
            else if(url != null && url.indexOf("assets-library://") === 0 && scene === QQScene.QZone)  
            {
                //如果url为本地相册视频(QQ空间分享的新功能),那么是可以不需要thumbImage或者title的
                this._convertUrl(platformType ,[text, url], function (data) {

                    text = data.result[0];
                    url = data.result[1];

                    $mob.ext.ssdk_qqShareVideo(self.appId(), scene, title, text, null, url, videoFlashUrl, self.QQShareType(), function (data) {

                        if (data.error_code != null)
                        {
                            if (callback != null)
                            {
                                callback ($mob.shareSDK.responseState.Fail, data, null, userData);
                            }
                        }
                        else
                        {
                            //调用成功后不回调，等待微信客户端回调时再触发
                            //记录分享内容
                            var shareParams = {"platform" : platformType, "text" : text, "title" : title, "thumb_image" : thumbImage, "url" : url};
                            QQShareContentSet [sessionId] = {"content" : shareParams, "user_data" : userData};
                        }
                    });
                });
            }
            else 
            {

                error_message = null;
                
                if(this._currentLanguage === "zh-Hans")
                {
                    error_message = "分享参数title、thumbImage、url不能为空!";
                }
                else
                {
                    error_message = "Share param title、thumbImage、url can not be nil!";
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

QQ.prototype._checkShareType = function(callback)
{
    var self = this;
    var firstURL = "mqqapi://";
    var otherURL = "timapi://";

    if(self.QQShareType() === 1)//TIM
    {
        firstURL = "timapi://";
        otherURL = "mqqapi://";
    }
    $mob.ext.canOpenURL(firstURL,function(data){
        if (data.result)
        {
            callback(firstURL);
        }
        else
        {
            $mob.ext.canOpenURL(otherURL,function(data){
                if (data.result)
                {
                    callback(otherURL);
                }
                else
                {
                    callback("mqqapi://");
                }
            });
        }
    });
};

QQ.prototype._sharewithoutsdk = function (sessionId, parameters, userData, callback)
{
    //先判断是否使用客户端分享
    var text = null;
    var title = null;
    var thumbImage = null;
    var images = null;
    var url = null;
    var audioFlashUrl = null;
    var videoFlashUrl = null;
    var self = this;
    var platformType = null;
    var error = null;
    var shareParameter = {};
    var error_message;

    var scene = parameters ["qq_scene"];
    if (scene == null)
    {
        scene = QQScene.QQFriend;
    }

    switch (scene)
    {
        case QQScene.QZone:
            platformType = $mob.shareSDK.platformType.QZone;
            break;
        default :
            platformType = $mob.shareSDK.platformType.QQFriend;
            break;
    }

    var type = $mob.shareSDK.getShareParam(platformType, parameters, "type");
    if (type == null)
    {
        type = $mob.shareSDK.contentType.Auto;
    }
    if (type === $mob.shareSDK.contentType.Auto)
    {
        type =  this._getShareType(parameters, platformType);
    }

    switch (type)
    {
        case $mob.shareSDK.contentType.Text:
        {
            text = $mob.shareSDK.getShareParam(platformType, parameters, "text");

            if (text != null)
            {
                //记录分享内容
                var shareParams = {"platform" : platformType, "text" : text};
                QQShareContentSet [sessionId] = {"content" : shareParams, "user_data" : userData};

                this._convertUrl(platformType ,[text], function (data) {
                    text = data.result[0];
                    if(platformType === $mob.shareSDK.platformType.QZone)
                    {
                        $mob.ext.getAppConfig(function (data){

                            //构造链接
                            var appName = data.CFBundleDisplayName?data.CFBundleDisplayName:"";
                            var callbackName = self._getFormatNum(self.appId());
                            var urlstring = "share/to_fri?thirdAppDisplayName=" + 
                                    $mob.utils.base64Encode(utf16to8(appName)) + 
                                    "&shareType=1&objectlocation=pasteboard&file_type=qzone&callback_name=" + 
                                    "QQ" + 
                                    callbackName + 
                                    "&src_type=app&version=1&cflag=0&callback_type=scheme&generalpastboard=1&sdkv=3.1";
                            
                            self._checkShareType(function(urlProtocol){
                                urlstring = urlProtocol + urlstring + "&title=" + $mob.utils.base64Encode(utf16to8(text));
                                $mob.ext.canOpenURL(urlstring,function(data){
                                                    
                                    if (data.result)
                                    {
                                        $mob.native.openURL(urlstring);
                                    }
                                    else
                                    {
                                        var error_message = "qq版本过低无法进行分享";
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
                            });
                        });
                    }
                    else
                    {
                        $mob.ext.getAppConfig(function (data){

                            //构造链接
                            var appName = data.CFBundleDisplayName?data.CFBundleDisplayName:"";
                            var callbackName = self._getFormatNum(self.appId());
                            var urlstring = "share/to_fri?thirdAppDisplayName=" + 
                                $mob.utils.base64Encode(utf16to8(appName)) + 
                                "&version=1&cflag=0&callback_type=scheme&generalpastboard=1&callback_name=" + 
                                "QQ" + 
                                callbackName + 
                                "&src_type=app&shareType=0&file_type=";
                            
                            
                            self._checkShareType(function(urlProtocol){
                                urlstring = urlProtocol + urlstring + "text&file_data=" + $mob.utils.base64Encode(utf16to8(text));
                                $mob.ext.canOpenURL(urlstring,function(data){
                                    if (data.result)
                                    {
                                        $mob.native.openURL(urlstring);
                                    }
                                    else
                                    {
                                        var error_message = "qq版本过低无法进行分享";
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
                            });
                        });
                    }
                });
            }
            else
            {
                error_message = null;

                if(this._currentLanguage === "zh-Hans")
                {
                    error_message = "分享参数text不能为空!";
                }
                else
                {
                    error_message = "Share param text can not be nil!";
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
        case $mob.shareSDK.contentType.Image:
        {
            text = $mob.shareSDK.getShareParam(platformType, parameters, "text");
            title = $mob.shareSDK.getShareParam(platformType, parameters, "title");
            thumbImage = $mob.shareSDK.getShareParam(platformType, parameters, "thumb_image");
            var image = null;

            images = $mob.shareSDK.getShareParam(platformType, parameters, "images");

            if (Object.prototype.toString.apply(images) === '[object Array]')
            {
                //分享到QQ好友，取第一张图片进行分享。
                image = images [0];
            }

            if (images != null)
            {
                this._convertUrl(platformType ,[text], function (data) {

                    text = data.result[0];

                    //记录分享内容
                    var shareParams = {};
                    if (scene === QQScene.QQFriend)
                    {
                        shareParams = {"platform" : platformType, "text" : text, "title" : title, "thumb_image" : thumbImage, "image" : image};
                    }
                    else
                    {
                        shareParams = {"platform" : platformType, "text" : text, "title" : title, "thumb_image" : thumbImage, "image" : images};
                    }

                    QQShareContentSet [sessionId] = {"content" : shareParams, "user_data" : userData};

                    if(platformType === $mob.shareSDK.platformType.QZone)
                    {
                        $mob.ext.getAppConfig(function (data){

                                    //构造链接
                                    var appName = data.CFBundleDisplayName?data.CFBundleDisplayName:"";
                                    var callbackName = self._getFormatNum(self.appId());
                                    var urlstring = "share/to_fri?thirdAppDisplayName=" + 
                                        $mob.utils.base64Encode(utf16to8(appName)) + 
                                        "&shareType=1&objectlocation=pasteboard&file_type=qzone&callback_name=" + 
                                        "QQ" + 
                                        callbackName + 
                                        "&src_type=app&version=1&cflag=0&callback_type=scheme&generalpastboard=1&sdkv=3.1";

                                    self._checkShareType(function(urlProtocol){
                                        urlstring = urlProtocol + urlstring;
                                        if(text)
                                        {
                                            urlstring = urlstring + "&title=" + $mob.utils.base64Encode(utf16to8(text));
                                        }
                                        if(images.length > 0)
                                        {
                                            var times = 0;
                                            var imageArray = [];
                                            for (var k in images)
                                            {
                                                if(images.hasOwnProperty(k))
                                                {
                                                    var imagePath = images[k];
                                                    $mob.ext.ssdk_getImageData(imagePath,null,$mob.shareSDK.platformType.QQ,function(data)
                                                    {
                                                        times++;

                                                        if(data.returnData["image"])
                                                        {
                                                            imageArray.push(data.returnData["image"]);
                                                        }

                                                        if(times === images.length)
                                                        {
                                                            var objectsValue = [];
                                                            var imageCount = imageArray.length;
                                                            var publicItem0 = "$null";
                                                            var publicItem1 = {
                                                                "$class" : {"CF$UID" : (imageCount + 5)},
                                                                "NS.keys" : [{"CF$UID" : 2}],
                                                                "NS.objects" : [{"CF$UID" : 3}]};
                                                            var publicItem2 = "image_data_list";
                                                            var publicItem3 = {};
                                                            var arrayListOfItem3 = [];
                                                            for (var i = 0; i < imageCount; i++)
                                                            {
                                                                var dic = {"CF$UID" : (i + 4)};
                                                                arrayListOfItem3.push(dic);
                                                            }
                                                            publicItem3 = {
                                                                "$class" : {"CF$UID" : (imageCount + 4)},
                                                                "NS.objects" : arrayListOfItem3};
                                                            objectsValue.push(publicItem0,publicItem1,publicItem2,publicItem3);

                                                            //添加所有图片
                                                            objectsValue.push(imageArray);

                                                            //倒数第一，第二个Item为固定内容
                                                            var publicItemBottomSeccond = {
                                                                "$classes" : ["NSArray","NSObject"],
                                                                "$classname" : "NSArray"};

                                                            var publicItemBottomFirst = {
                                                                "$classes" : ["NSMutableDictionary","NSDictionary","NSObject"],
                                                                "$classname" : "NSMutableDictionary"};
                                                            objectsValue.push(publicItemBottomSeccond,publicItemBottomFirst);

                                                            var valueDic = {"$archiver" : "NSKeyedArchiver",
                                                                "$objects" : objectsValue,
                                                                "$top" : {"root" : {"CF$UID" : 1}},
                                                                "$version" : 100000};

                                                            //数据传递给UIPasteboard
                                                            $mob.ext.ssdk_setDataToPasteboard($mob.shareSDK.platformType.QQ , self.appId(), valueDic , sessionId,function(data){
                                                                if(data.result)
                                                                {
                                                                    $mob.ext.canOpenURL(urlstring,function(data){
                                                                        if (data.result)
                                                                        {
                                                                            //记录分享内容
                                                                            var shareParams = {};
                                                                            if (scene === QQScene.QQFriend)
                                                                            {
                                                                                shareParams = {"platform" : platformType, "text" : text, "title" : title, "thumb_image" : thumbImage, "image" : image};
                                                                            }
                                                                            else
                                                                            {
                                                                                shareParams = {"platform" : platformType, "text" : text, "title" : title, "thumb_image" : thumbImage, "image" : images};
                                                                            }

                                                                            QQShareContentSet [sessionId] = {"content" : shareParams, "user_data" : userData};

                                                                            //$mob.native.log("urlstring " + urlstring);
                                                                            $mob.native.openURL(urlstring);
                                                                        }
                                                                        else
                                                                        {
                                                                            var error_message = "qq版本过低无法进行分享";
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
                                                            });
                                                        }
                                                    });

                                                }
                                            }
                                        }
                                    });
                                });
                    }
                    else
                    {
                        $mob.ext.getAppConfig(function (data){

                            //构造链接
                            var appName = data.CFBundleDisplayName?data.CFBundleDisplayName:"";
                            var callbackName = self._getFormatNum(self.appId());
                            var urlstring = "share/to_fri?thirdAppDisplayName=" + 
                                $mob.utils.base64Encode(utf16to8(appName)) + 
                                "&version=1&cflag=0&callback_type=scheme&generalpastboard=1&callback_name=" + 
                                "QQ" + 
                                callbackName + 
                                "&src_type=app&shareType=0&file_type=";

                            self._checkShareType(function(urlProtocol){

                                urlstring = urlProtocol + urlstring + "img&title=" + $mob.utils.base64Encode(utf16to8(title?title:"")) + 
                                "&objectlocation=pasteboard&description=" + $mob.utils.base64Encode(utf16to8(text?text:""));

                                $mob.ext.ssdk_getImageData(image,thumbImage,$mob.shareSDK.platformType.QQ,function(data) {

                                    if (data.result)
                                    {
                                        //图片
                                        shareParameter["fileData"] = data.returnData["image"];
                                        shareParameter["thumbData"] = data.returnData["thumbImage"];

                                        var shareData = {"file_data":shareParameter["fileData"],"previewimagedata":shareParameter["thumbData"]};

                                        //数据传递给UIPasteboard
                                        $mob.ext.ssdk_setDataToPasteboard($mob.shareSDK.platformType.QQ , self.appId(), shareData , sessionId,function(data){
                                            if(data.result)
                                            {
                                                $mob.ext.canOpenURL(urlstring,function(data){
                                                    if (data.result)
                                                    {
                                                        //记录分享内容
                                                        var shareParams = {};
                                                        if (scene === QQScene.QQFriend)
                                                        {
                                                            shareParams = {"platform" : platformType, "text" : text, "title" : title, "thumb_image" : thumbImage, "image" : image};
                                                        }
                                                        else
                                                        {
                                                            shareParams = {"platform" : platformType, "text" : text, "title" : title, "thumb_image" : thumbImage, "image" : images};
                                                        }

                                                        QQShareContentSet [sessionId] = {"content" : shareParams, "user_data" : userData};

                                                        //$mob.native.log("urlstring " + urlstring);
                                                        $mob.native.openURL(urlstring);
                                                    }
                                                    else
                                                    {
                                                    	var error_message = "qq版本过低无法进行分享";
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
                                        });
                                    }
                                });
                            });
                        });
                    }
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
                    error_message = "Share param image can not be nil!";
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
        case  $mob.shareSDK.contentType.WebPage:
        {
            text = $mob.shareSDK.getShareParam(platformType, parameters, "text");
            title = $mob.shareSDK.getShareParam(platformType, parameters, "title");

            thumbImage = $mob.shareSDK.getShareParam(platformType, parameters, "thumb_image");
            if (thumbImage == null)
            {
                images = $mob.shareSDK.getShareParam(platformType, parameters, "images");
                if (Object.prototype.toString.apply(images) === '[object Array]')
                {
                    //取第一张图片进行分享
                    thumbImage = images [0];
                }
            }

            url = $mob.shareSDK.getShareParam(platformType, parameters, "url");

            if (title != null && thumbImage != null && url != null)
            {
                this._convertUrl(platformType ,[text, url], function (data) {

                    text = data.result[0];
                    url = data.result[1];

                    //记录分享内容
                    var shareParams = {"platform" : platformType, "text" : text, "title" : title, "thumb_image" : thumbImage, "url" : url};
                    QQShareContentSet [sessionId] = {"content" : shareParams, "user_data" : userData};

                    $mob.ext.getAppConfig(function (data){

                        //构造链接
                        var appName = data.CFBundleDisplayName?data.CFBundleDisplayName:"";
                        var callbackName = self._getFormatNum(self.appId());

                        self._checkShareType(function(urlProtocol){
                            var urlstring = "share/to_fri?thirdAppDisplayName=" + $mob.utils.base64Encode(utf16to8(appName)) + 
                            "&version=1&cflag=";
                            switch (scene)
                            {
                                case QQScene.QZone:
                                    urlstring = urlstring + 1;
                                    break;
                                default :
                                    urlstring = urlstring + 0;
                                    break;
                            }
                            urlstring = urlProtocol + urlstring + "&callback_type=scheme&generalpastboard=1&callback_name=QQ" + callbackName + 
                                "&src_type=app&shareType=0&file_type=";

                            urlstring = urlstring + 
                                "news&title=" + $mob.utils.base64Encode(utf16to8(title?title:"")) + 
                                "&url=" + $mob.utils.base64Encode(utf16to8(url?url:"")) + 
                                "&description=" + $mob.utils.base64Encode(utf16to8(text?text:""))+"&objectlocation=pasteboard";

                            $mob.ext.ssdk_getImageData(null,thumbImage,$mob.shareSDK.platformType.QQ,function(data) {

                                if (data.result)
                                {
                                    //图片
                                    //shareParameter["fileData"] = data.returnData["image"];
                                    shareParameter["thumbData"] = data.returnData["thumbImage"];

                                    var shareData = {"previewimagedata":shareParameter["thumbData"]};

                                    //数据传递给UIPasteboard
                                    $mob.ext.ssdk_setDataToPasteboard($mob.shareSDK.platformType.QQ , self.appId(), shareData , sessionId,function(data){
                                        if(data.result)
                                        {
                                            $mob.ext.canOpenURL(urlstring,function(data){
                                                if (data.result)
                                                {
                                                    //记录分享内容
                                                    var shareParams = {"platform" : platformType, "text" : text, "title" : title, "thumb_image" : thumbImage, "url" : url};
                                                    QQShareContentSet [sessionId] = {"content" : shareParams, "user_data" : userData};

                                                    //$mob.native.log("urlstring " + urlstring);
                                                    $mob.native.openURL(urlstring);
                                                }
                                                else
                                                {
                                                	var error_message = "qq版本过低无法进行分享";
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
                                    });
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
                    error_message = "分享参数title、thumbImage、url不能为空!";
                }
                else
                {
                    error_message = "Share param title、thumbImage、url can not be nil!";
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
        case $mob.shareSDK.contentType.Audio:
        {
            text = $mob.shareSDK.getShareParam(platformType, parameters, "text");
            title = $mob.shareSDK.getShareParam(platformType, parameters, "title");

            thumbImage = $mob.shareSDK.getShareParam(platformType, parameters, "thumb_image");
            if (thumbImage == null)
            {
                images = $mob.shareSDK.getShareParam(platformType, parameters, "images");
                if (Object.prototype.toString.apply(images) === '[object Array]')
                {
                    //取第一张图片进行分享
                    thumbImage = images [0];
                }
            }

            url = $mob.shareSDK.getShareParam(platformType, parameters, "url");
            audioFlashUrl = $mob.shareSDK.getShareParam(platformType, parameters, "audio_flash_url");

            if (title != null && thumbImage != null && url != null)
            {
                this._convertUrl(platformType ,[text, url], function (data) {

                    text = data.result[0];
                    url = data.result[1];

                    //记录分享内容
                    var shareParams = {"platform" : platformType, "text" : text, "title" : title, "thumb_image" : thumbImage, "url" : url};
                    QQShareContentSet [sessionId] = {"content" : shareParams, "user_data" : userData};

                    $mob.ext.getAppConfig(function (data){

                        //构造链接
                        var appName = data.CFBundleDisplayName?data.CFBundleDisplayName:"";
                        var callbackName = self._getFormatNum(self.appId());

                        self._checkShareType(function(urlProtocol){
                            var urlstring = "share/to_fri?thirdAppDisplayName=" + $mob.utils.base64Encode(utf16to8(appName)) + 
                            "&version=1&cflag=";
                            switch (scene)
                            {
                                case QQScene.QZone:
                                    urlstring = urlstring + 1;
                                    break;
                                default :
                                    urlstring = urlstring + 0;
                                    break;
                            }
                            urlstring = urlProtocol + urlstring + "&callback_type=scheme&generalpastboard=1&callback_name=QQ" + callbackName + 
                                "&src_type=app&shareType=0&file_type=";

                            urlstring = urlstring + 
                                "audio&title=" + $mob.utils.base64Encode(utf16to8(title?title:"")) + 
                                "&url=" + $mob.utils.base64Encode(utf16to8(url?url:"")) + 
                                "&description=" + $mob.utils.base64Encode(utf16to8(text?text:""))+"&objectlocation=pasteboard";

                            if(audioFlashUrl)
                            {
                                urlstring = urlstring + "&flashurl=" + $mob.utils.base64Encode(utf16to8(audioFlashUrl?audioFlashUrl:""));
                            }

                            $mob.ext.ssdk_getImageData(null,thumbImage,$mob.shareSDK.platformType.QQ,function(data) {

                                if (data.result)
                                {
                                    //图片
                                    //shareParameter["fileData"] = data.returnData["image"];
                                    shareParameter["thumbData"] = data.returnData["thumbImage"];

                                    var shareData = {"previewimagedata":shareParameter["thumbData"]};

                                    //数据传递给UIPasteboard
                                    $mob.ext.ssdk_setDataToPasteboard($mob.shareSDK.platformType.QQ , self.appId(), shareData , sessionId,function(data){
                                        if(data.result)
                                        {
                                            $mob.ext.canOpenURL(urlstring,function(data){
                                                if (data.result)
                                                {
                                                    //记录分享内容
                                                    var shareParams = {"platform" : platformType, "text" : text, "title" : title, "thumb_image" : thumbImage, "url" : url};
                                                    QQShareContentSet [sessionId] = {"content" : shareParams, "user_data" : userData};

                                                    //$mob.native.log("urlstring " + urlstring);
                                                    $mob.native.openURL(urlstring);
                                                }
                                                else
                                                {
                                                	var error_message = "qq版本过低无法进行分享";
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
                                    });
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
                    error_message = "分享参数title、thumbImage、url不能为空!";
                }
                else
                {
                    error_message = "Share param title、thumbImage、url can not be nil!";
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
        case $mob.shareSDK.contentType.Video:
        {
            text = $mob.shareSDK.getShareParam(platformType, parameters, "text");
            title = $mob.shareSDK.getShareParam(platformType, parameters, "title");

            thumbImage = $mob.shareSDK.getShareParam(platformType, parameters, "thumb_image");
            if (thumbImage == null)
            {
                images = $mob.shareSDK.getShareParam(platformType, parameters, "images");
                if (Object.prototype.toString.apply(images) === '[object Array]')
                {
                    //取第一张图片进行分享
                    thumbImage = images [0];
                }
            }

            url = $mob.shareSDK.getShareParam(platformType, parameters, "url");
            videoFlashUrl = $mob.shareSDK.getShareParam(platformType, parameters, "video_flash_url");

            if (title != null && thumbImage != null && url != null)
            {
                this._convertUrl(platformType ,[text, url], function (data) {

                    text = data.result[0];
                    url = data.result[1];

                    //记录分享内容
                    var shareParams = {"platform" : platformType, "text" : text, "title" : title, "thumb_image" : thumbImage, "url" : url};
                    QQShareContentSet [sessionId] = {"content" : shareParams, "user_data" : userData};

                    $mob.ext.getAppConfig(function (data){

                        //构造链接
                        var appName = data.CFBundleDisplayName?data.CFBundleDisplayName:"";
                        var callbackName = self._getFormatNum(self.appId());

                        self._checkShareType(function(urlProtocol){

                            var urlstring = "share/to_fri?thirdAppDisplayName=" + $mob.utils.base64Encode(utf16to8(appName)) + 
                            "&version=1&cflag=";
                            switch (scene)
                            {
                                case QQScene.QZone:
                                    urlstring = urlstring + 1;
                                    break;
                                default :
                                    urlstring = urlstring + 0;
                                    break;
                            }
                            urlstring = urlProtocol + urlstring + "&callback_type=scheme&generalpastboard=1&callback_name=QQ" + callbackName + 
                                "&src_type=app&shareType=0&file_type=";

                            urlstring = urlstring + 
                                "video&title=" + $mob.utils.base64Encode(utf16to8(title?title:"")) + 
                                "&url=" + $mob.utils.base64Encode(utf16to8(url?url:"")) + 
                                "&description=" + $mob.utils.base64Encode(utf16to8(text?text:""))+"&objectlocation=pasteboard";

                            if(videoFlashUrl)
                            {
                                urlstring = urlstring + "&flashurl=" + $mob.utils.base64Encode(utf16to8(videoFlashUrl?videoFlashUrl:""));
                            }

                            $mob.ext.ssdk_getImageData(null,thumbImage,$mob.shareSDK.platformType.QQ,function(data) {

                                if (data.result)
                                {
                                    //图片
                                    //shareParameter["fileData"] = data.returnData["image"];
                                    shareParameter["thumbData"] = data.returnData["thumbImage"];

                                    var shareData = {"previewimagedata":shareParameter["thumbData"]};

                                    //数据传递给UIPasteboard
                                    $mob.ext.ssdk_setDataToPasteboard($mob.shareSDK.platformType.QQ , self.appId(), shareData , sessionId,function(data){
                                        if(data.result)
                                        {
                                            $mob.ext.canOpenURL(urlstring,function(data){
                                                if (data.result)
                                                {
                                                    //记录分享内容
                                                    var shareParams = {"platform" : platformType, "text" : text, "title" : title, "thumb_image" : thumbImage, "url" : url};
                                                    QQShareContentSet [sessionId] = {"content" : shareParams, "user_data" : userData};

                                                    //$mob.native.log("urlstring " + urlstring);
                                                    $mob.native.openURL(urlstring);
                                                }
                                                else
                                                {
                                                	var error_message = "qq版本过低无法进行分享";
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
                                    });
                                }
                            });
                        });
                    });
                });
            }
            else if(url != null && url.indexOf("assets-library://") === 0 && scene === QQScene.QZone)
            {
                //如果url为本地相册视频(QQ空间分享的新功能),那么是可以不需要thumbImage或者title的
                this._convertUrl(platformType ,[text, url], function (data) {

                    text = data.result[0];
                    url = data.result[1];

                    if(platformType === $mob.shareSDK.platformType.QZone)
                    {
                        $mob.ext.isPad(function (data){

                            //iPad
                            if (data.result)
                            {
                                var error_message = null;

                                if(this._currentLanguage === "zh-Hans")
                                {
                                    error_message = "iPadQQ暂不支持分享本地视频到空间!";
                                }
                                else
                                {
                                    error_message = "QQ for iPad hasn't supported share video to Qzone!";
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
                            else
                            {
                                $mob.ext.getAppConfig(function (data){

                                    //构造链接
                                    var appName = data.CFBundleDisplayName?data.CFBundleDisplayName:"";
                                    var callbackName = self._getFormatNum(self.appId());

                                    self._checkShareType(function(urlProtocol){
                                        var urlstring = "share/to_fri?thirdAppDisplayName=" + $mob.utils.base64Encode(utf16to8(appName)) + 
                                        "&file_type=qzone&callback_name=QQ" + callbackName + 
                                        "&src_type=app&version=1&cflag=0&callback_type=scheme&generalpastboard=1&sdkv=3.1";
                                        if(text)
                                        {
                                            urlstring = urlstring + "&title==" + $mob.utils.base64Encode(utf16to8(text?text:""));
                                        }
                                        urlstring = urlProtocol + urlstring + "&video_assetURL=" + $mob.utils.base64Encode(utf16to8(url?url:""));

                                        $mob.ext.canOpenURL(urlstring,function(data){
                                            if (data.result)
                                            {
                                                //记录分享内容
                                                var shareParams = {"platform" : platformType, "text" : text, "title" : title, "thumb_image" : thumbImage, "url" : url};
                                                QQShareContentSet [sessionId] = {"content" : shareParams, "user_data" : userData};

                                                //$mob.native.log("urlstring " + urlstring);
                                                $mob.native.openURL(urlstring);
                                            }
                                            else
                                            {
                                            	var error_message = "qq版本过低无法进行分享";
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
                                    });
                                });
                            }
                        });
                    }
                });
            }
            else
            {

                error_message = null;

                if(this._currentLanguage === "zh-Hans")
                {
                    error_message = "分享参数title、thumbImage、url不能为空!";
                }
                else
                {
                    error_message = "Share param title、thumbImage、url can not be nil!";
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
 * 初始化应用
 * @param appId     应用标识
 * @private
 */
QQ.prototype._setupApp = function (appId)
{
    if (appId != null)
    {
        $mob.ext.isPluginRegisted("com.mob.sharesdk.connector.qq", function (data) {

            if (data.result)
            {
                //注册微信
                $mob.native.ssdk_plugin_qq_setup(appId);
            }
        });
    }
};

/**
 * 根据分享参数返回分享类型
 * @param parameters            分享参数
 * @param platformType          平台类型
 * @private
 */
QQ.prototype._getShareType = function (parameters, platformType)
{
    var type = $mob.shareSDK.contentType.Text;
    var title = $mob.shareSDK.getShareParam(platformType, parameters, "title");
    var thumbImage = $mob.shareSDK.getShareParam(platformType, parameters, "thumb_image");
    var url = $mob.shareSDK.getShareParam(platformType, parameters, "url");
    var images = $mob.shareSDK.getShareParam(platformType, parameters, "images");

    if (title != null && (thumbImage != null || Object.prototype.toString.apply(images) === '[object Array]') && url != null)
    {
        type = $mob.shareSDK.contentType.WebPage;
    }
    else if (Object.prototype.toString.apply(images) === '[object Array]' && platformType === $mob.shareSDK.platformType.QQFriend)
    {
        type = $mob.shareSDK.contentType.Image;
    }
    
    return type;
};

QQ.prototype._getFormatNum = function (rawNum)
{
    var formatNum = Number(rawNum).toString(16).toUpperCase();  //十六进制保持8位且大写：比如由100371282转换05FB8B52
    if(formatNum.length < 8)
    {
        for(var i=0;i<(8-formatNum.length);i++)
        {
            formatNum = "0"+formatNum;
        }
    }
    return formatNum;
};

//注册平台
$mob.shareSDK.registerPlatformClass($mob.shareSDK.platformType.QQ, QQ);
