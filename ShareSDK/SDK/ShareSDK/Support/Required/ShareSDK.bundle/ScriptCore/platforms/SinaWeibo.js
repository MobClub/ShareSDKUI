/**
 * Created with JetBrains WebStorm.
 * User: vim888
 * Date: 15/2/10
 * Time: 上午11:35
 * To change this template use File | Settings | File Templates.
 */

var $pluginID = "com.mob.sharesdk.SinaWeibo";

/**
 * 新浪微博应用信息键名定义
 * @type {{AppKey: string, AppSecret: string, RedirectUri: string}}
 */
var SinaWeiboAppInfoKeys = {
    "AppKey"        : "app_key",
    "AppSecret"     : "app_secret",
    "RedirectUri"   : "redirect_uri",
    "AuthType"      : "auth_type",
    "ConvertUrl"    : "covert_url",
    "Scopes"        : "auth_scopes"
};

/**
 * 微博分享内容集合
 * @type {{}}
 */
var SinaWeiboShareContentSet = {};

/**
 * 新浪微博
 * @param type  平台类型
 * @constructor
 */
function SinaWeibo (type)
{
    this._type = type;
    this._appInfo = {};
    this._authScopes = null;
    //当前授权用户
    this._currentUser = null;
    //回调链接集合
    this._callbackURLSchemes = [];
    //设置当前语言环境
    this._currentLanguage = $mob.shareSDK.preferredLanguageLocalize();

    /*******/
    this._testCount = 0;
    /*******/

}

/**
 * 获取平台类型
 * @returns {*} 平台类型
 */
SinaWeibo.prototype.type = function ()
{
    return this._type;
};

/**
 * 授权状态改变
 * @param sessionId         会话标识
 * @param data              返回数据
 * @private
 */
SinaWeibo.prototype.authStateChanged = function (sessionId, data)
{
    $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Cancel, null);
};

/**
 * 获取平台名称
 * @returns {string}    平台名称
 */
SinaWeibo.prototype.name = function ()
{
    
    if(this._currentLanguage === "zh-Hans")
    {
         return "新浪微博";
    }
    else
    {
        return "SinaWeibo";
    }

};

/**
 * 获取应用标识
 * @returns {*} 应用标识
 */
SinaWeibo.prototype.appKey = function ()
{
    if (this._appInfo[SinaWeiboAppInfoKeys.AppKey] !== undefined) 
    {
        return this._appInfo[SinaWeiboAppInfoKeys.AppKey];
    }

    return null;
};

/**
 * 获取应用密钥
 * @returns {*} 应用密钥
 */
SinaWeibo.prototype.appSecret = function ()
{
    if (this._appInfo[SinaWeiboAppInfoKeys.AppSecret] !== undefined) 
    {
        return this._appInfo[SinaWeiboAppInfoKeys.AppSecret];
    }

    return null;
};

/**
 * 获取回调地址
 * @returns {*} 回调地址
 */
SinaWeibo.prototype.redirectUri = function ()
{
    if (this._appInfo[SinaWeiboAppInfoKeys.RedirectUri] !== undefined) 
    {
        return this._appInfo[SinaWeiboAppInfoKeys.RedirectUri];
    }

    return null;
};

/**
 * 获取授权方式
 *
 * @return  web 网页授权方式，sso 单点登录授权方式，both 两者共同使用，优先使用SSO
 */
SinaWeibo.prototype.authType = function ()
{
    if (this._appInfo[SinaWeiboAppInfoKeys.AuthType] !== undefined) 
    {
        return this._appInfo[SinaWeiboAppInfoKeys.AuthType];
    }

    return $mob.shareSDK.authType();
};

/**
 * 获取缓存域名
 * @returns {string}    域名
 */
SinaWeibo.prototype.cacheDomain = function ()
{
    return "SSDK-Platform-" + $mob.shareSDK.platformType.SinaWeibo + "-" + this.appKey();
};

/**
 * 获取授权方式
 *
 * @return  web 网页授权方式，sso 单点登录授权方式，both 两者共同使用，优先使用SSO
 */
SinaWeibo.prototype.convertUrlEnabled = function ()
{
    if (this._appInfo[SinaWeiboAppInfoKeys.convertUrl] !== undefined) 
    {
        return this._appInfo[SinaWeiboAppInfoKeys.convertUrl];
    }
    return $mob.shareSDK.convertUrlEnabled();
};

/**
 * 设置/获取应用信息
 * @param value 应用信息
 * @returns {*}
 */
SinaWeibo.prototype.setAppInfo = function (value)
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
        this._setupApp(this.appKey());
    }
};

/**
 * 保存配置信息
 */
SinaWeibo.prototype.saveConfig = function ()
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
SinaWeibo.prototype.isSupportAuth = function ()
{
    return true;
};

/**
 * 用户授权
 * @param sessionId     授权会话标识
 * @param settings      授权设置
 */
SinaWeibo.prototype.authorize = function (sessionId, settings)
{
    var error = null;
    var self = this;
    if (self._isAvailable())
    {
        $mob.ext.isPluginRegisted("com.mob.sharesdk.connector.weibo", function (data) {
            if(data)
            {
                var authType = self.authType();
                if(authType === 'web')//如果使用web授权
                {
                    self._webAuthorize(sessionId, settings);
                }
                else//both web
                {
                    //检查UrlScheme 是否设置好
                    self._checkUrlScheme(function (hasReady, urlScheme){
                        if(hasReady)
                        {
                            //检测是否禁用后台模式
                            $mob.ext.isMultitaskingSupported(function (data){
                                if(data.result)
                                {
                                    //未禁止时调用SSO授权
                                    self._ssoAuthorize(sessionId, urlScheme, settings);
                                }
                                else
                                {
                                    //返回错误
                                    var error = {
                                        "error_code" : $mob.shareSDK.errorCode.UnsupportFeature,
                                        "error_message" : "应用已禁用后台模式，分享平台［" + self.name() + "］无法进行授权! 请在项目设置中开启后台模式后再试!"
                                    };
                                    $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Fail, error);
                                }
                            });
                        }
                        else
                        {
                            //未配置 则使用web授权
                            self._webAuthorize(sessionId, settings);
                        }
                    });
                }
            }
            else
            {
                $mob.native.log("[ShareSDK-WARNING] not find SinaWeiboConnector");
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
SinaWeibo.prototype.handleAuthCallback = function (sessionId, callbackUrl)
{
	var self = this;
	var urlInfo = $mob.utils.parseUrl(callbackUrl);
	if (urlInfo != null && urlInfo.query != null)
	{
		var params = $mob.utils.parseUrlParameters(urlInfo.query);
		if(params.access_token == null || params.uid == null)
		{
			var error = {
                "error_code" : $mob.shareSDK.errorCode.APIRequestFail,
            };
            $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Fail, error);
		}
		else
		{
			self._succeedAuthorize(sessionId, params);
		}
	}
};

/**
 * 处理SSO授权回调
 * @param sessionId     会话ID
 * @param callbackUrl   回调URL
 * @param sourceApplication     原始应用名称
 * @param annotation            附加数据
 */
SinaWeibo.prototype.handleSSOCallback = function (sessionId, callbackUrl, sourceApplication, annotation)
{
    var self = this;
    for (var i = 0; i < this._callbackURLSchemes.length; i++)
    {
        var callbackScheme = this._callbackURLSchemes [i];
        if (callbackUrl.indexOf(callbackScheme + "://") === 0)
        {
            //处理回调
            var urlObj = $mob.utils.parseUrl(callbackUrl);

            if (urlObj.domain === "response")
            {
                //使用微博SDK进行解析
                $mob.ext.ssdk_weiboHandleSSOCallback(self.appKey(), callbackUrl, function (data) {

                     switch (data.state)
                     {
                         case $mob.shareSDK.responseState.Success:
                         {
                             self._succeedAuthorize(sessionId, data.result);
                             break;
                         }
                         case $mob.shareSDK.responseState.Fail:
                         {
                             //授权失败
                             var error = {
                                 "error_code" : $mob.shareSDK.errorCode.APIRequestFail,
                                 "user_data" :  {"error_code" : data.error_code}
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
                //非微博SDK的SSO请求解析
                var params = $mob.utils.parseUrlParameters(urlObj.query);
                if (params["sso_error_user_cancelled"] != null || params["failed"] != null || params["WBOpenURLContextResultKey"] === "WBOpenURLContextResultCanceld")
                {
                    //取消授权
                    $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Cancel, null);
                }
                else if (params["sso_error_invalid_params"] != null || params["error_code"] != null)
                {
                    //授权失败
                    var error = {
                        "error_code" : $mob.shareSDK.errorCode.APIRequestFail,
                        "user_data" : params
                    };

                    $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Fail, error);
                }
                else
                {
                    //授权成功
                    this._succeedAuthorize(sessionId, params);
                }
            }

            return true;
        }
    }

    return false;
};

SinaWeibo.prototype._shareFinish = function (sessionId,data)
{
    var self = this;
    self._getCurrentUser(function (user){
        //从分享内容集合中取出分享内容
        var shareParams = SinaWeiboShareContentSet [sessionId];
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

                if (content ["image"] != null)
                {
                    resultData["images"] = [content ["image"]];
                }

                $mob.native.ssdk_shareStateChanged(sessionId, $mob.shareSDK.responseState.Success, resultData, user, userData);

                break;
            }
            case $mob.shareSDK.responseState.Fail:
            {
                    //失败
                var error = {
                    "error_code" : $mob.shareSDK.errorCode.APIRequestFail,
                    "user_data" :  {"error_code" : data.error_code}
                };

                $mob.native.ssdk_shareStateChanged(sessionId, $mob.shareSDK.responseState.Fail, error, user, userData);
                break;
            }
            default :
            {
                //取消
                $mob.native.ssdk_shareStateChanged(sessionId, $mob.shareSDK.responseState.Cancel, null, user, userData);
                break;
            }
        }
        //移除分享参数集合中的数据
        delete SinaWeiboShareContentSet[sessionId];
        SinaWeiboShareContentSet[sessionId] = null;

    });
};

SinaWeibo.prototype._saveAuthAndShareFinsih = function (sessionId , shareData)
{
    var self = this;
    //成功
    var credentialRawData = shareData.result;
    $mob.native.log(credentialRawData);
    var credential = {
        "uid"       : credentialRawData["uid"],
        "token"     : credentialRawData["access_token"],
        "expired"   : (new Date().getTime() +  10000 * 1000),
        "raw_data"  : credentialRawData,
        "type"      : $mob.shareSDK.credentialType.OAuth2
    };

    var user = {
        "platform_type" : this.type(),
        "credential" : credential
    };

    //设置当前授权用户
    self._setCurrentUser(user, function () {
        //获取用户信息
        self.getUserInfo(null, function (state, data) {

            if (state === $mob.shareSDK.responseState.Success)
            {

                //设置授权凭证给去的用户信息
                data["credential"] = user["credential"];
                user = data;
                //重新设置当前用户
                self._setCurrentUser(user, function () 
                {
                    self._shareFinish(sessionId, shareData);
                });
            }
            else
            {
                self._shareFinish(sessionId, shareData);
            }
        });
    });
};

/**
 * 处理分享回调
 * @param sessionId     会话ID
 * @param callbackUrl   回调URL
 * @param sourceApplication     原始应用名称
 * @param annotation            附加数据
 */
SinaWeibo.prototype.handleShareCallback = function (sessionId, callbackUrl, sourceApplication, annotation)
{
    var self = this;
    for (var i = 0; i < this._callbackURLSchemes.length; i++)
    {
        var callbackScheme = this._callbackURLSchemes [i];
        if (callbackUrl.indexOf(callbackScheme + "://") === 0)
        {
             $mob.ext.ssdk_isConnectedPlatformSDK("WeiboSDK",function(data){
                if (data.result)
                {
                    //处理回调
                    $mob.ext.ssdk_weiboHandleShareCallback(self.appKey(), callbackUrl, function (data) {
                        //有授权信息的情况下
                        if(data.result)
                        {
                            //保存授权信息
                            self._saveAuthAndShareFinsih(sessionId, data);
                        }
                        else
                        {
                            self._shareFinish(sessionId, data);
                        }
                    });
                }
                else
                {
                    //获取UIPasteboard取得并解析后的字典数据
                    $mob.ext.ssdk_getDataFromPasteboard(self.appKey(), sessionId, callbackUrl,$mob.shareSDK.platformType.SinaWeibo,function(data){

                        //授权返回的数据
                        if(data.result)
                        {
                            self._getCurrentUser(function (user) {
                                //从分享内容集合中取出分享内容
                                var shareParams = SinaWeiboShareContentSet [sessionId];
                                var content = null;
                                var userData = null;
                                if (shareParams != null) {
                                    content = shareParams ["content"];
                                    userData = shareParams ["user_data"];
                                }

                                if(data["retDic"]["__class"] === "WBSendMessageToWeiboResponse")
                                {
                                    var statusCode = data["retDic"]["statusCode"];
                                    switch (statusCode)
                                    {
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
                                            if (content["audio_url"])
                                            {
                                                urls.push(content["audio_url"]);
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
                                        case -1:
                                        {
                                            //取消
                                            $mob.native.ssdk_shareStateChanged(sessionId, $mob.shareSDK.responseState.Cancel, null, user, userData);
                                            break;
                                        }
                                        default :
                                        {
                                            //失败
                                            var error = {
                                                "error_code" : $mob.shareSDK.errorCode.APIRequestFail,
                                                "user_data" :  {"error_code" : statusCode}
                                            };
                                            $mob.native.ssdk_shareStateChanged(sessionId, $mob.shareSDK.responseState.Fail, error, user, userData);
                                        }
                                    }
                                }
                            });
                        }
                    });
                }
            });
            return true;
        }
    }

    return false;
};

/**
 * 刷新Access Token
 * @param user      当前的用户信息
 * @param callback  方法回调, 回调方法声明如下:function (data);
 */
SinaWeibo.prototype._refreshAccessToken = function(user, callback)
{
    var error = null;
    if(user != null)
    {
        var refreshToken = user.credential.raw_data.refresh_token;
        var refreshTokenUrl = "https://api.weibo.com/oauth2/access_token";

        var params = {
            "client_id":this.appKey(),
            "client_secret":this.appSecret(),
            "grant_type":"refresh_token",
            "redirect_uri":this.redirectUri(),
            "refresh_token":refreshToken
        };
        $mob.ext.ssdk_callHTTPApi($mob.shareSDK.platformType.SinaWeibo, null, refreshTokenUrl, "POST", params, null, function (data) {

            if(data != null)
            {
                if (data ["error_code"] != null)
                {
                    //失败
                    if(callback)
                    {
                        callback(data);
                    }
                }
                else if (data ["status_code"] != null && data ["status_code"] === 200)
                {
                    //成功
                    var response = $mob.utils.jsonStringToObject($mob.utils.base64Decode(data["response_data"]));
                    var res = {};
                    res["newCredential"] = response;
                    if(callback)
                    {
                        callback(res);
                    }
                }
                else
                {
                    //失败
                    error = {
                        "error_code" : $mob.shareSDK.errorCode.APIRequestFail,
                        "user_data" : data
                    };
                    if(callback)
                    {
                        callback(error);
                    }
                }

            }
            else
            {
                //失败
                error = {
                    "error_code" : $mob.shareSDK.errorCode.APIRequestFail,
                };
                if(callback)
                {
                    callback(error);
                }
            }
        });
    }
};

/**
 * 调用API接口
 * @param url           接口URL
 * @param method        请求方式
 * @param params        请求参数
 * @param headers       请求头
 * @param callback      方法回调, 回调方法声明如下:function (state, data);
 */
SinaWeibo.prototype.callApi = function (url, method, params, headers, callback)
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
                        //在21315(代表token过期)的情况下将进行refreshToken【注意只有SSO下才有refresh_token,webAuth没有】
                        if(response["error_code"] === 21315 && user.credential.raw_data.refresh_token != null)
                        {
                            //Token过期,进行refreshToken
                            self._refreshAccessToken(user, function(data){

                                if(data.newCredential != null)
                                {
                                    //成功refresh token,以新取代旧
                                    var cred = data.newCredential;

                                    user.credential["uid"] = cred["uid"];
                                    user.credential["token"] = cred["access_token"];
                                    user.credential["expired"] = cred["expires_in"];

                                    user.credential.raw_data["uid"] = cred["uid"];
                                    user.credential.raw_data["expires_in"] = cred["expires_in"];
                                    user.credential.raw_data["access_token"] = cred["access_token"];
                                    user.credential.raw_data["refresh_token"] = cred["refresh_token"];

                                    //设定新的用户(更新了credential字段信息)并重新发起一次相同的请求
                                    self._setCurrentUser(user, function(){
                                        self.callApi(url, method, params, headers, callback);
                                    });
                                }
                                else
                                {
                                    //refreshToken也失败,则直接返回失败
                                    var code = $mob.shareSDK.errorCode.UserUnauth;
                                    error = {
                                        "error_code" : code,
                                        "user_data" : response
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
                            var code = $mob.shareSDK.errorCode.APIRequestFail;
                            //判断是否为尚未授权
                            switch (response["error_code"])
                            {
                                case 21314:
                                //case 21315:
                                case 21316:
                                case 21317:
                                case 21325:
                                case 21327:
                                case 21501:
                                case 21332:
                                case 21301:
                                case 21321:
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
 
            if(self._currentLanguage === "zh-Hans")
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
 * 获取用户信息
 * @param query         查询信息
 * @param callback      方法回调
 */
SinaWeibo.prototype.getUserInfo = function (query, callback)
{
    var self = this;
    this._getCurrentUser(function(user) {

        var params = {};
        if (query != null)
        {
            if (query.uid != null)
            {
                params["uid"] = query.uid;
            }
            else if (query.name != null)
            {
                params["screen_name"] = query.name;
            }
        }
        else if (user != null && user.credential != null && user.credential.uid != null)
        {
            //设置当前授权用户ID
            params["uid"] = user.credential.uid;
        }

        self.callApi("https://api.weibo.com/2/users/show.json", "GET", params, null, function (state, data) {

            var resultData = data;
            if (state === $mob.shareSDK.responseState.Success)
            {
                //转换用户数据
                resultData = {"platform_type" : $mob.shareSDK.platformType.SinaWeibo};
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
 * 取消授权
 */
SinaWeibo.prototype.cancelAuthorize = function ()
{
    var self = this;
    this.callApi("https://api.weibo.com/oauth2/revokeoauth2", "POST", null, null, function (state, data) {

        if (state === $mob.shareSDK.responseState.Success)
        {
            //成功
            if (data.result)
            {
                //清除缓存
                self._setCurrentUser(null, null);
            }
        }
    });
};

/**
 * 添加好友
 * @param sessionId     会话标识
 * @param user          用户信息
 * @param callback      方法回调，回调方法声明如下:function (stat, data);
 */
SinaWeibo.prototype.addFriend = function (sessionId, user, callback)
{
    var params = {};
    if (user["uid"] != null)
    {
        params ["uid"] = user ["uid"];
    }
    else if (user["nickname"] != null)
    {
        params ["screen_name"] = user ["nickname"];
    }

    var self = this;
    this.callApi("https://api.weibo.com/2/friendships/create.json", "POST", params, null, function (state, data) {

        var resultData = data;
        if (state === $mob.shareSDK.responseState.Success)
        {
            //转换用户数据
            resultData = {"platform_type" : $mob.shareSDK.platformType.SinaWeibo};
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
SinaWeibo.prototype.getFriends = function (cursor, size, callback)
{
    var self = this;
    this._getCurrentUser(function (user) {

        var params = {
            "cursor" : cursor,
            "count" : size
        };
        if (user != null)
        {
            params ["uid"] = user ["uid"];
        }

        self.callApi("https://api.weibo.com/2/friendships/friends.json", "GET", params, null, function (state, data) {

            var resultData = data;
            if (state === $mob.shareSDK.responseState.Success)
            {
                //转换数据
                resultData = {};
                resultData["prev_cursor"] = data["previous_cursor"];
                resultData["next_cursor"] = data["next_cursor"];
                resultData["total"] = data["total_number"];

                //转换用户数据
                var users = [];
                var rawUsersData = data["users"];
                if (rawUsersData != null)
                {
                    for (var i = 0; i < rawUsersData.length; i++)
                    {
                        var user = {"platform_type" : $mob.shareSDK.platformType.SinaWeibo};
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
SinaWeibo.prototype.share = function (sessionId, parameters, callback)
{
    var self = this;
    //获取分享统计标识
    var flags = parameters != null ? parameters ["@flags"] : null;
    var userData = {
      "@flags" : flags
    };

    var type = $mob.shareSDK.getShareParam(this.type(), parameters, "type");
    if (type == null)
    {
        type = $mob.shareSDK.contentType.Auto;
    }
    
    self._shareByWeiboSDK(sessionId, type, parameters, userData, callback);
};

/**
 * 创建用户信息
 * @param rawData       原始用户数据
 * @returns {null}      用户数据
 */
SinaWeibo.prototype.createUserByRawData = function (rawData)
{
    //转换用户数据
    var user = {
        "platform_type" : this.type()
    };
    this._updateUserInfo(user, rawData);
    return $mob.utils.objectToJsonString(user);
};

/**
 * 使用微博SDK进行分享
 * @param sessionId     会话ID
 * @param type
 * @param parameters
 * @param userData
 * @param callback
 * @private
 */
SinaWeibo.prototype._shareByWeiboSDK = function (sessionId, type, parameters, userData, callback)
{
    var text = null;
    var images = null;
    var image = null;
    var error = null;
    var video = null;
    var isStory = false;
    
    var self = this;
    var error_message;
    var title;
    var url;
    
    $mob.ext.ssdk_isConnectedPlatformSDK("WeiboSDK",function(data){
        if (data.result)
        {
            if (type === $mob.shareSDK.contentType.Auto)
            {
                //获取最适合的分享类型
                type = self._getShareType(parameters, true);
            }
            //使用客户端分享
            switch (type)
            {
                case $mob.shareSDK.contentType.Text:
                {
                    text = $mob.shareSDK.getShareParam(self.type(), parameters, "text");
                    if (text != null)
                    {
                        //短链转换
                        self._convertUrl([text], function (data) {

                            text = data.result[0];
                            self._getCurrentUser(function (user) {
                                var access_token = '';
                                if(user != null  && user.credential != null)
                                {
                                    access_token = user.credential.token;
                                }
                                $mob.ext.ssdk_weiboShareText(self.appKey(), text, access_token, function (data) {
                                    var shareParams = {"platform" : self.type(), "text" : text};
                                    SinaWeiboShareContentSet [sessionId] = {"content" : shareParams, "user_data" : userData};
                                });
                            });
                        });
                    }
                    else
                    {
                        error_message = null;
                
                        if(self._currentLanguage === "zh-Hans")
                        {
                            error_message = "分享参数text不能为空!";
                        }
                        else
                        {
                            error_message = "share param text can not be nil!";
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
                    text = $mob.shareSDK.getShareParam(self.type(), parameters, "text");

                    images = $mob.shareSDK.getShareParam(self.type(), parameters, "images");

                    if ($mob.shareSDK.getShareParam(self.type(), parameters, "sina_isStory") == 1)
                    {
                        isStory = true;
                    }
                                         
                    if (Object.prototype.toString.apply(images) === '[object Array]' && images.length > 0)
                    {
                        self._convertUrl([text], function (data) {
                            text = data.result[0];
                            self._getCurrentUser(function (user) {
                                var access_token = '';
                                if(user != null  && user.credential != null)
                                {
                                    access_token = user.credential.token;
                                }
                                $mob.ext.ssdk_weiboShareImage(self.appKey(), text, images, access_token, isStory, function (data) {
                                    var shareParams = {"platform" : self.type(), "text" : text, "image" : images};
                                    SinaWeiboShareContentSet [sessionId] = {"content" : shareParams, "user_data" : userData};

                                    var code = data.error_code;
                                    if (code == -1) 
                                    {
                                        if(self._currentLanguage === "zh-Hans")
                                        {
                                            error_message = "SinaSDK图片处理失败，请检查传入参数";
                                        }
                                        else
                                        {
                                            error_message = "Image transfer did fail !";
                                        }

                                        error = {
                                                    "error_code" : -1,
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
                        error_message = null;
                
                        if(self._currentLanguage === "zh-Hans")
                        {
                            error_message = "分享参数images不能为空!";
                        }
                        else
                        {
                            error_message = "share param images can not be nil!";
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
                    text = $mob.shareSDK.getShareParam(self.type(), parameters, "text");
                    video = $mob.shareSDK.getShareParam(self.type(), parameters, "video");

                    if ($mob.shareSDK.getShareParam(self.type(), parameters, "sina_isStory") == 1)
                    {
                        isStory = true;
                    }

                    if (video != null)
                    {
                        self._convertUrl([text], function (data) {
                            text = data.result[0];
                            self._getCurrentUser(function (user) {
                                var access_token = '';
                                if(user != null  && user.credential != null)
                                {
                                    access_token = user.credential.token;
                                }
                                $mob.ext.ssdk_weiboShareVideo(self.appKey(), text, video, access_token, isStory, function (data) {
                                    var shareParams = {"platform" : self.type(), "text" : text, "video" : video};
                                    SinaWeiboShareContentSet [sessionId] = {"content" : shareParams, "user_data" : userData};

                                    var code = data.error_code;

                                    if (code == -1) 
                                    {
                                        if(self._currentLanguage === "zh-Hans")
                                        {
                                            error_message = "SinaSDK视频处理失败，请检查传入参数";
                                        }
                                        else
                                        {
                                            error_message = "Video transfer did fail !";
                                        }

                                        error = {
                                                    "error_code" : -1,
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
                        error_message = null;
                
                        if(self._currentLanguage === "zh-Hans")
                        {
                            error_message = "分享参数videos不能为空!";
                        }
                        else
                        {
                            error_message = "share param videos can not be nil!";
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
                    text = $mob.shareSDK.getShareParam(self.type(), parameters, "text");
                    title = $mob.shareSDK.getShareParam(self.type(), parameters, "title");
                    url = $mob.shareSDK.getShareParam(self.type(), parameters, "url");
                    var objectId = $mob.shareSDK.getShareParam(self.type(), parameters, "object_id");
                  
                    if (objectId == null)
                    {
                        //以当前时间产生ObjectID
                        objectId = new Date().getTime().toString();
                    }

                    images = $mob.shareSDK.getShareParam(self.type(), parameters, "images");
                    if (Object.prototype.toString.apply(images) === '[object Array]')
                    {
                        //取第一张图片进行分享
                        image = images [0];
                    }

                    if (title != null && url != null && objectId != null && image != null)
                    {
                        self._convertUrl([text, url], function (data) {

                            text = data.result[0];
                            url = data.result[1];
                            self._getCurrentUser(function (user) {
                                var access_token = '';
                                if(user != null  && user.credential != null)
                                {
                                    access_token = user.credential.token;
                                }
                                $mob.ext.ssdk_weiboShareWebpage(self.appKey(), title, text, image, url, objectId, access_token, function (data) {
                                    var shareParams = {"platform" : self.type(), "text" : text, "title" : title, "thumb_image" : image, "url" : url};
                                    SinaWeiboShareContentSet [sessionId] = {"content" : shareParams, "user_data" : userData};
                                });
                            });
                        });
                    }
                    else
                    {
                        error_message = null;
                
                        if(self._currentLanguage === "zh-Hans")
                        {
                            error_message = "分享参数title、url、objectId、image不能为空!";
                        }
                        else
                        {
                            error_message = "share param title、url、objectId、image can not be nil!";
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
            
                    if(self._currentLanguage === "zh-Hans")
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
        }
        else
        {
            $mob.ext.canOpenURL(["weibosdk://request","sinaweibo://","sinaweibohd://"],function(data){

                if (data.result)
                {
                    if (type === $mob.shareSDK.contentType.Auto)
                    {
                        //获取最适合的分享类型
                        type = self._getShareType(parameters, true);
                    }

                    var message = {};
                    var uuid = self._generateUUID();
                    var shareParameter = {};

                    //使用客户端分享
                    switch (type)
                    {
                        case $mob.shareSDK.contentType.Text:
                        {
                            text = $mob.shareSDK.getShareParam(self.type(), parameters, "text");
                            if (text != null)
                            {
                                self._convertUrl([text], function (data) {

                                    text = data.result[0];
                                    message = {"__class" : "WBMessageObject","text" :text?text:""};

                                    shareParameter["message"] = message;
                                    shareParameter["uuid"] = uuid;


                                    //记录分享内容
                                    var shareParams = {"platform" : self.type(), "text" : text, "title" : title, "thumb_image" : image, "url" : url};
                                    SinaWeiboShareContentSet [sessionId] = {"content" : shareParams, "user_data" : userData};

                                    //数据传递给UIPasteboard
                                    $mob.ext.ssdk_setDataToPasteboard($mob.shareSDK.platformType.SinaWeibo , self.appKey(), shareParameter , sessionId,function(data){

                                        if(data.result)
                                        {
                                            //构造跳转链接
                                            var urlstring = "weibosdk://request?id=" + uuid + "&sdkversion=003013000";
                                            $mob.ext.canOpenURL(urlstring,function(data){
                                                if (data.result)
                                                {
                                                    $mob.native.openURL(urlstring);
                                                }
                                            });
                                        }
                                    });
                                });
                            }
                            else
                            {
                                error_message = null;

                                if(self._currentLanguage === "zh-Hans")
                                {
                                    error_message = "分享参数text不能为空!";
                                }
                                else
                                {
                                    error_message = "share param text can not be nil!";
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
                            text = $mob.shareSDK.getShareParam(self.type(), parameters, "text");

                            images = $mob.shareSDK.getShareParam(self.type(), parameters, "images");
                            if (Object.prototype.toString.apply(images) === '[object Array]')
                            {
                                //取第一张图片进行分享
                                image = images [0];
                            }

                            if (image != null)
                            {
                                self._convertUrl([text], function (data) {
                                    text = data.result[0];

                                    $mob.ext.ssdk_getImageData(image,null,$mob.shareSDK.platformType.SinaWeibo,function(data){

                                        if(data.result)
                                        {
                                            //shareParameter["fileData"] = data.returnData["image"];
                                            //shareParameter["thumbData"] = data.returnData["thumbImage"];

                                            //图片类型分享
                                            message={
                                                "__class" : "WBMessageObject",
                                                "imageObject":{"imageData":data.returnData["image"]},
                                                "text" : text?text:""};

                                            shareParameter["message"] = message;
                                            shareParameter["uuid"] = uuid;

                                            //记录分享内容
                                            var shareParams = {"platform" : self.type(), "text" : text, "title" : title, "thumb_image" : image, "url" : url};
                                            SinaWeiboShareContentSet [sessionId] = {"content" : shareParams, "user_data" : userData};

                                            //数据传递给UIPasteboard
                                            $mob.ext.ssdk_setDataToPasteboard($mob.shareSDK.platformType.SinaWeibo , self.appKey(), shareParameter , sessionId,function(data){
                                                if(data.result)
                                                {
                                                    //构造跳转链接
                                                    var urlstring = "weibosdk://request?id=" + uuid + "&sdkversion=003013000";
                                                    $mob.ext.canOpenURL(urlstring,function(data){
                                                        if (data.result)
                                                        {
                                                            $mob.native.openURL(urlstring);
                                                        }
                                                    });
                                                }
                                            });
                                        }
                                    });
                                });
                            }
                            else
                            {
                                error_message = null;

                                if(self._currentLanguage === "zh-Hans")
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
                        {
                            text = $mob.shareSDK.getShareParam(self.type(), parameters, "text");
                            title = $mob.shareSDK.getShareParam(self.type(), parameters, "title");
                            url = $mob.shareSDK.getShareParam(self.type(), parameters, "url");
                            var objectId = $mob.shareSDK.getShareParam(self.type(), parameters, "object_id");

                            if (objectId == null)
                            {
                                //以当前时间产生ObjectID
                                objectId = new Date().getTime().toString();
                            }

                            images = $mob.shareSDK.getShareParam(self.type(), parameters, "images");
                            if (Object.prototype.toString.apply(images) === '[object Array]')
                            {
                                //取第一张图片进行分享
                                image = images [0];
                            }

                            if (title != null && url != null && objectId != null && image != null)
                            {
                                self._convertUrl([text, url], function (data) {

                                    text = data.result[0];
                                    url = data.result[1];

                                    $mob.ext.ssdk_getImageData(image,image,$mob.shareSDK.platformType.SinaWeibo,function(data){

                                        if(data.result)
                                        {
                                            //shareParameter["fileData"] = data.returnData["image"];
                                            //shareParameter["thumbData"] = data.returnData["thumbImage"];

                                            //链接类型分享
                                            message={
                                                "__class" : "WBMessageObject",
                                                "text" : text?text:"",
                                                "mediaObject":{
                                                    "__class" : "WBWebpageObject",
                                                    "description": text?text:"",
                                                    "objectID" : "identifier1",
                                                    "thumbnailData":data.returnData["thumbImage"],
                                                    "title": title?title:"",
                                                    "webpageUrl":url?url:"" }
                                            };
                                            shareParameter["message"] = message;
                                            shareParameter["uuid"] = uuid;

                                            //记录分享内容
                                            var shareParams = {"platform" : self.type(), "text" : text, "title" : title, "thumb_image" : image, "url" : url};
                                            SinaWeiboShareContentSet [sessionId] = {"content" : shareParams, "user_data" : userData};

                                            //数据传递给UIPasteboard
                                            $mob.ext.ssdk_setDataToPasteboard($mob.shareSDK.platformType.SinaWeibo , self.appKey(), shareParameter , sessionId,function(data){
                                                if(data.result)
                                                {
                                                    //构造跳转链接
                                                    var urlstring = "weibosdk://request?id=" + uuid + "&sdkversion=003013000";
                                                    $mob.ext.canOpenURL(urlstring,function(data){
                                                        if (data.result)
                                                        {
                                                            $mob.native.openURL(urlstring);
                                                        }
                                                    });
                                                }
                                            });
                                        }
                                    });
                                });
                            }
                            else
                            {
                                error_message = null;

                                if(self._currentLanguage === "zh-Hans")
                                {
                                    error_message = "分享参数title、url、objectId、image不能为空!";
                                }
                                else
                                {
                                    error_message = "share param title、url、objectId、image can not be nil!";
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

                            if(self._currentLanguage === "zh-Hans")
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
                }
                else
                {
                    //使用内置分享
                    self._shareWithoutWeiboSDK(sessionId ,type, parameters, userData, callback);
                }
            });
        }
    });
};

SinaWeibo.prototype._shareWithoutWeiboSDK = function (sessionId ,type, parameters, userData, callback)
{
    var self = this;
    var error;
    var error_message;
    var aid;
    if (type === $mob.shareSDK.contentType.Auto)
    {
        //获取最适合的分享类型
        type = self._getShareType(parameters, true);
    }
    var text;
    switch (type)
    {
        case $mob.shareSDK.contentType.Text:
        {
            text = $mob.shareSDK.getShareParam(self.type(), parameters, "text");
            if (text != null) 
            {
                self._convertUrl([text], function (data) {
                    text = data.result[0];
                    $mob.ext.sdk_getWeiboAid(self.appKey(), function (data) {
                        aid = data['aid'];
                        if(aid != null)
                        {
                            self._getCurrentUser(function (user) {
                                var access_token = '';
                                if(user != null  && user.credential != null)
                                {
                                    access_token = user.credential.token;
                                }
                                $mob.ext.ssdk_weiboShareTextNoSDK(self.appKey(), aid , access_token, text, function (data) {
                                    if(data.state)
                                    {
                                        if (callback != null)
                                        {
                                            callback (data.state, null, user, userData);
                                        }
                                    }
                                    else
                                    {
                                        var resultData;
                                        if(data.backURL != null)
                                        {
                                            var parameters = $mob.utils.parseUrlParameters(data.backURL);
                                            var code = parameters.code;
                                            //由于可能是string类型所以使用 == 不比较类型
                                            if(code == 0)
                                            {
                                                resultData = {};
                                                resultData["text"] = text;
                                                resultData["raw_data"] = parameters;
                                                if (callback != null)
                                                {
                                                    $mob.native.ssdk_shareStateChanged(sessionId, $mob.shareSDK.responseState.Success, resultData, user, userData);
                                                }
                                            }
                                            else
                                            {
                                                if (callback != null)
                                                {
                                                    error = {
                                                        "error_code" : $mob.shareSDK.errorCode.APIRequestFail,
                                                        "error_message" : parameters.msg
                                                    };
                                                    callback ($mob.shareSDK.responseState.Fail, error, user, userData);
                                                }
                                            }
                                        }
                                        else
                                        {
                                            if (callback != null)
                                            {
                                                callback ($mob.shareSDK.responseState.Fail, null, user, userData);
                                            }
                                        }
                                    }
                                });
                            });
                        }
                        else
                        {
                            if (callback != null)
                            {
                                error = {
                                    "error_code" : $mob.shareSDK.errorCode.APIRequestFail,
                                    "error_message" : data.error
                                };
                                callback ($mob.shareSDK.responseState.Fail, error, null, userData);
                            }
                        }
                    });
                });
            }
            else
            {
                error_message = null;

                if(self._currentLanguage === "zh-Hans")
                {
                    error_message = "分享参数text不能为空!";
                }
                else
                {
                    error_message = "share param text can not be nil!";
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
            text = $mob.shareSDK.getShareParam(self.type(), parameters, "text");
            var image;
            var images = $mob.shareSDK.getShareParam(self.type(), parameters, "images");
            if (Object.prototype.toString.apply(images) === '[object Array]')
            {
                //取第一张图片进行分享
                image = images [0];
            }
            if (text != null && image != null) 
            {
                self._convertUrl([text], function (data) {
                    text = data.result[0];
                    $mob.ext.sdk_getWeiboAid(self.appKey(), function (data) {
                        aid = data['aid'];
                        if(aid != null)
                        {
                             self._getCurrentUser(function (user) {
                                var access_token = '';
                                if(user != null  && user.credential != null)
                                {
                                    access_token = user.credential.token;
                                }
                                $mob.ext.ssdk_weiboShareImageNoSDK(self.appKey(), aid , access_token, text, image, function (data) {
                                    if(data.state)
                                    {
                                        if (callback != null)
                                        {
                                            callback (data.state, null, user, userData);
                                        }
                                    }
                                    else
                                    {
                                        var resultData;
                                        if(data.backURL != null)
                                        {
                                            var parameters = $mob.utils.parseUrlParameters(data.backURL);
                                            var code = parameters.code;
                                            //由于可能是string类型所以使用 == 不比较类型
                                            if(code == 0)
                                            {
                                                resultData = {};
                                                resultData["text"] = text;
                                                resultData["images"] = [image];
                                                resultData["raw_data"] = parameters;
                                                if (callback != null)
                                                {
                                                    $mob.native.ssdk_shareStateChanged(sessionId, $mob.shareSDK.responseState.Success, resultData, user, userData);
                                                }
                                            }
                                            else
                                            {
                                                if (callback != null)
                                                {
                                                    error = {
                                                        "error_code" : $mob.shareSDK.errorCode.APIRequestFail,
                                                        "error_message" : parameters.msg
                                                    };
                                                    callback ($mob.shareSDK.responseState.Fail, error, user, userData);
                                                }
                                            }
                                        }
                                        else
                                        {
                                            if (callback != null)
                                            {
                                                callback ($mob.shareSDK.responseState.Fail, null, user, userData);
                                            }
                                        }
                                    }
                                });
                            });
                        }
                        else
                        {
                            if (callback != null)
                            {
                                error = {
                                    "error_code" : $mob.shareSDK.errorCode.APIRequestFail,
                                    "error_message" : data.error
                                };
                                callback ($mob.shareSDK.responseState.Fail, error, null, userData);
                            }
                        }
                    });
                });
            }
            else
            {
                error_message = null;

                if(self._currentLanguage === "zh-Hans")
                {
                    error_message = "分享参数text image 不能为空!";
                }
                else
                {
                    error_message = "share param text image can not be nil!";
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
            text = $mob.shareSDK.getShareParam(self.type(), parameters, "text");
            var url = $mob.shareSDK.getShareParam(self.type(), parameters, "url");
            if (text != null && url != null) 
            {
                self._convertUrl([text ,url], function (data) {
                    text = data.result[0];
                    url = data.result[1];
                    $mob.ext.sdk_getWeiboAid(self.appKey(), function (data) {
                        aid = data['aid'];
                        if(aid != null)
                        {
                            self._getCurrentUser(function (user) {
                                var access_token = '';
                                if(user != null  && user.credential != null)
                                {
                                    access_token = user.credential.token;
                                }
                                $mob.ext.ssdk_weiboShareTextNoSDK(self.appKey(), aid , access_token, text+' '+url, function (data) {
                                    if(data.state)
                                    {
                                        if (callback != null)
                                        {
                                            callback (data.state, null, user, userData);
                                        }
                                    }
                                    else
                                    {
                                        var resultData;
                                        if(data.backURL != null)
                                        {
                                            var parameters = $mob.utils.parseUrlParameters(data.backURL);
                                            var code = parameters.code;
                                            //由于可能是string类型所以使用 == 不比较类型
                                            if(code == 0)
                                            {
                                                resultData = {};
                                                resultData["text"] = text;
                                                resultData["urls"] = [url];
                                                resultData["raw_data"] = parameters;
                                                if (callback != null)
                                                {
                                                    $mob.native.ssdk_shareStateChanged(sessionId, $mob.shareSDK.responseState.Success, resultData, user, userData);
                                                }
                                            }
                                            else
                                            {
                                                if (callback != null)
                                                {
                                                    error = {
                                                        "error_code" : $mob.shareSDK.errorCode.APIRequestFail,
                                                        "error_message" : parameters.msg
                                                    };
                                                    callback ($mob.shareSDK.responseState.Fail, error, user, userData);
                                                }
                                            }
                                        }
                                        else
                                        {
                                            if (callback != null)
                                            {
                                                callback ($mob.shareSDK.responseState.Fail, null, user, userData);
                                            }
                                        }
                                    }
                                });
                            });
                        }
                        else
                        {
                            if (callback != null)
                            {
                                error = {
                                    "error_code" : $mob.shareSDK.errorCode.APIRequestFail,
                                    "error_message" : data.error
                                };
                                callback ($mob.shareSDK.responseState.Fail, error, null, userData);
                            }
                        }
                    });
                });
            }
            else
            {
                error_message = null;

                if(self._currentLanguage === "zh-Hans")
                {
                    error_message = "分享参数text不能为空!";
                }
                else
                {
                    error_message = "share param text can not be nil!";
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

            if(self._currentLanguage === "zh-Hans")
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

SinaWeibo.prototype._generateUUID = function()
{
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });
    return uuid;
};

/**
 * 转换链接
 * @param contents      内容列表
 * @param callback      回调
 * @private
 */
SinaWeibo.prototype._convertUrl = function (contents, callback)
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
 * 检测应用信息中的授权信息
 * @param appInfo   应用信息
 * @private
 */
SinaWeibo.prototype._checkAuthScopes = function (appInfo)
{
    return appInfo [SinaWeiboAppInfoKeys.Scopes];
};
                    
/**
 * 检测应用信息有效性
 * @param appInfo   应用信息
 * @private
 */
SinaWeibo.prototype._checkAppInfoAvailable = function (appInfo)
{
    var appKey = $mob.utils.trim(appInfo [SinaWeiboAppInfoKeys.AppKey]);
    var appSecret = $mob.utils.trim(appInfo [SinaWeiboAppInfoKeys.AppSecret]);
    var redirectUri = $mob.utils.trim(appInfo [SinaWeiboAppInfoKeys.RedirectUri]);

    if (appKey != null)
    {
        appInfo [SinaWeiboAppInfoKeys.AppKey] = appKey;
    }
    else
    {
        appInfo [SinaWeiboAppInfoKeys.AppKey] = this.appKey();    
    }

    if (appSecret != null)
    {
        appInfo [SinaWeiboAppInfoKeys.AppSecret] = appSecret;
    }
    else
    {
        appInfo [SinaWeiboAppInfoKeys.AppSecret] = this.appSecret();   
    }

    if (redirectUri != null)
    {
        appInfo [SinaWeiboAppInfoKeys.RedirectUri] = redirectUri;
    }
    else
    {
        appInfo [SinaWeiboAppInfoKeys.RedirectUri] = this.redirectUri();    
    }

    return appInfo;
};

/**
 * 更新回调链接
 * @private
 */
SinaWeibo.prototype._updateCallbackURLSchemes = function ()
{
    //先删除之前的回调地址
    this._callbackURLSchemes.splice(0);

    var appKey = this.appKey();
    if (appKey != null)
    {
        this._callbackURLSchemes.push("sinaweibosso." + appKey);
        this._callbackURLSchemes.push("wb" + appKey);
    }
};

/**
 * 检测应用是否有效
 * @returns {boolean}   true 有效 false 无效
 * @private
 */
SinaWeibo.prototype._isAvailable = function ()
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
 * 授权成功
 * @param sessionId             会话ID
 * @param credentialRawData     授权凭证原始数据
 * @private
 */
SinaWeibo.prototype._succeedAuthorize = function (sessionId, credentialRawData)
{
    var self = this;

    //成功
    var credential = {
        "uid"       : credentialRawData["uid"],
        "token"     : credentialRawData["access_token"],
        "expired"   : (new Date().getTime() +  credentialRawData ["expires_in"] * 1000),
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
 * 检测是否配置URL Scheme
 * @param callback 方法回调
 * @private
 */
SinaWeibo.prototype._checkUrlScheme = function (callback)
{
    var self = this;
    $mob.ext.getAppConfig(function (data){

        var urlScheme = null;
        var warningLog = "";
        var hasReady = false;
        for (var n = 0; n < self._callbackURLSchemes.length; n++)
        {
            var callbackScheme = self._callbackURLSchemes [n];

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
                if (n === 0)
                {
                    warningLog += callbackScheme;
                }
                else
                {
                    warningLog += "或" + callbackScheme;
                }
            }
            else
            {
                break;
            }

        }

        if (!hasReady)
        {
            $mob.native.log("[ShareSDK-WARNING] 尚未配置[" + self.name() + "]URL Scheme:" + warningLog);
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
SinaWeibo.prototype._webAuthorize = function (sessionId, settings)
{
    var self = this;
    $mob.ext.sdk_getWeiboAid(self.appKey(), function (data) {
        if(data['aid'] != null)
        {
            var aid = data['aid'];
            var authUrl = "https://open.weibo.cn/oauth2/authorize?";
            $mob.ext.getAppConfig(function (data){
                if (data != null && data.CFBundleIdentifier != null)
                {
                    var bundleId = data.CFBundleIdentifier;
                    authUrl += "packagename=" + bundleId;
                    authUrl += "&response_type=code";
                    authUrl += "&aid=" + aid;
                    authUrl += "&key_hash=22191242ac93f71da72492a63395bf40";
                    authUrl += "&redirect_uri=" + $mob.utils.urlEncode(self.redirectUri());
                    authUrl += "&version=003203000";
                    authUrl += "&client_id=" + self.appKey();
                }
                if (settings != null && settings ["scopes"] != null && Object.prototype.toString.apply(settings ["scopes"]) === '[object Array]')
                {
                    authUrl += "&scope=" + $mob.utils.urlEncode(settings ["scopes"].join(","));
                }
                else if (self._authScopes != null)
                {   
                    authUrl += "&scope=" + $mob.utils.urlEncode(self._authScopes);
                }
                else
                {
                    authUrl += "&scope=all";
                }
                //打开授权
                $mob.native.ssdk_openAuthUrl(sessionId, authUrl, self.redirectUri());
            });
        }
        else
        {
            var error = {
                "error_code" : $mob.shareSDK.errorCode.APIRequestFail,
                "error_message" : data.error
            };
            $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Fail, error);
        }
    });
};

/**
 * SSO授权
 * @param sessionId     会话标识
 * @param urlScheme     回调URL Scheme
 * @param settings      授权设置
 * @private
 */
SinaWeibo.prototype._ssoAuthorize = function (sessionId, urlScheme, settings)
{
    var self = this;

    $mob.ext.ssdk_isConnectedPlatformSDK("WeiboSDK",function(data){

        if(data.result)
        {
            $mob.ext.isPluginRegisted("com.mob.sharesdk.connector.weibo", function (data) {
                if (data.result)
                {
                    var scope = null;
                    if (settings != null && settings ["scopes"] != null && Object.prototype.toString.apply(settings ["scopes"]) === '[object Array]')
                    {
                        scope = settings ["scopes"].join(",");
                    }
                    else if (self._authScopes != null)
                    {
                        scope = self._authScopes;
                    }
                    $mob.ext.ssdk_weiboAuth(self.appKey(), self.redirectUri(), scope, function (data) {

                        if (data["error_code"] != null)
                        {
                            //失败则使用非SDK方式进行尝试
                            self._ssoAuthorizeWithoutWeiboSDK(sessionId, urlScheme, settings);
                        }
                    });
                }
                else
                {
                    //尚未注册新浪插件则使用非SDK方式进行授权
                    self._ssoAuthorizeWithoutWeiboSDK(sessionId, urlScheme, settings);
                }
            });
        }
        else
        {
            //尚未注册新浪插件则使用非SDK方式进行授权
            self._ssoAuthorizeWithoutWeiboSDK(sessionId, urlScheme, settings);
        }
    });
};

/**
 * 不使用新浪微博SDK进行SSO授权
 * @param sessionId         会话标识
 * @param urlScheme         回调的URL Scheme
 * @param settings          授权设置
 * @private
 */
SinaWeibo.prototype._ssoAuthorizeWithoutWeiboSDK = function (sessionId, urlScheme, settings)
{
    var authType = this.authType();
    var queryString = "client_id=" + $mob.utils.urlEncode(this.appKey()) +
        "&redirect_uri=" + $mob.utils.urlEncode(this.redirectUri()) +
        "&callback_uri=" + $mob.utils.urlEncode(urlScheme + "://");

    if (settings != null && settings ["scopes"] != null && Object.prototype.toString.apply(settings ["scopes"]) === '[object Array]')
    {
        queryString += "&scope=" + $mob.utils.urlEncode(settings ["scopes"].join(","));
    }
    else if (this._authScopes != null)
    {
        queryString += "&scope=" + $mob.utils.urlEncode(this._authScopes);
    }
    
    var self = this;
    $mob.ext.isPad(function (data) {

        var padAuthUrl = "sinaweibohdsso://login?" + queryString;
        var phoneAuthUrl = "sinaweibosso://login?" + queryString;

        if (data.result)
        {
            $mob.ext.canOpenURL(padAuthUrl, function (data) {

                if (data.result)
                {
                    //进行iPad版本SSO授权
                    $mob.native.openURL(padAuthUrl);
                }
                else
                {
                    $mob.ext.canOpenURL(phoneAuthUrl, function (data) {

                        if (data.result)
                        {
                            //进行iPhone版本SSO授权
                            $mob.native.openURL(phoneAuthUrl);
                        }
                        else if (authType === "both")
                        {
                            //进行网页授权
                            self._webAuthorize(sessionId, settings);
                        }
                        else
                        {
                            var error_message = null;
 
                            if(self._currentLanguage === "zh-Hans")
                            {
                                error_message = "分享平台［" + self.name() + "］不支持[" + authType + "]授权方式!";
                            }
                            else
                            {
                                error_message = "Platform [" + self.name() + "］do not support auth type :[" + authType + "]!";
                            }

                            var error = {
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
            $mob.ext.canOpenURL(phoneAuthUrl, function (data) {

                if (data.result)
                {
                    //进行iPhone版本SSO授权
                    $mob.native.openURL(phoneAuthUrl);
                }
                else if (authType === "both")
                {
                    //进行网页授权
                    self._webAuthorize(sessionId, settings);
                }
                else
                {

                    var error_message = null;
 
                    if(self._currentLanguage === "zh-Hans")
                    {
                        error_message = "分享平台［" + self.name() + "］不支持[" + authType + "]授权方式!";
                    }
                    else
                    {
                        error_message = "Platform [" + self.name() + "］do not support auth type :[" + authType + "]!";
                    }

                    var error = {
                        "error_code" : $mob.shareSDK.errorCode.UnsupportFeature,
                        "error_message" : error_message
                    };
                    $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Fail, error);
                }
            });
        }
    });
};

/**
 * 获取当前用户信息
 * @param callback  回调方法
 * @private
 */
SinaWeibo.prototype._getCurrentUser = function (callback)
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
SinaWeibo.prototype._setCurrentUser = function (user, callback)
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
 * 更新用户信息
 * @param user      用户信息
 * @param rawData   原始数据
 * @private
 */
SinaWeibo.prototype._updateUserInfo = function (user, rawData)
{
    if (user != null && rawData != null)
    {
        user["raw_data"] = rawData;
        user["uid"] = rawData ["idstr"];
        user["nickname"] = rawData["screen_name"];
        user["icon"] = rawData["profile_image_url"];

        //性别
        var gender = 2;
        if (rawData["gender"] === "m")
        {
            gender = 0;
        }
        else if (rawData["gender"] === "f")
        {
            gender = 1;
        }
        user["gender"] = gender;

        //微博地址
        if (rawData["idstr"] != null)
        {
            user["url"] = "http://weibo.com/" + rawData["idstr"];
        }

        user["about_me"] = rawData["description"];
        user["verify_type"] = rawData["verified"] ? 1 : 0;
        user["verify_reason"] = rawData["verified_reason"];
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
 * 初始化应用
 * @param appKey     应用标识
 * @private
 */
SinaWeibo.prototype._setupApp = function (appKey)
{
    if (appKey != null)
    {
        $mob.ext.isPluginRegisted("com.mob.sharesdk.connector.weibo", function (data) {

            if (data.result)
            {
                //注册微信
                $mob.native.ssdk_plugin_weibo_setup(appKey);
            }
        });
    }
};

/**
 * 根据分享参数返回分享类型
 * @param parameters            分享参数
 * @param enabledClientShare    是否已启动
 * @private
 */
SinaWeibo.prototype._getShareType = function (parameters, enabledClientShare)
{
    var type = $mob.shareSDK.contentType.Text;
    var images = null;
    var title = null;
    var url = null;
    var objectId = null;

    if (enabledClientShare)
    {
        //使用客户端分享
        title = $mob.shareSDK.getShareParam(this.type(), parameters, "title");
        url = $mob.shareSDK.getShareParam(this.type(), parameters, "url");
        objectId = $mob.shareSDK.getShareParam(this.type(), parameters, "object_id");
        images = $mob.shareSDK.getShareParam(this.type(), parameters, "images");

        if (title != null && url != null && objectId != null && Object.prototype.toString.apply(images) === '[object Array]')
        {
            type = $mob.shareSDK.contentType.WebPage;
        }
        else if (Object.prototype.toString.apply(images) === '[object Array]')
        {
            type = $mob.shareSDK.contentType.Image;
        }
    }
    else
    {
        //应用内分享
        images = $mob.shareSDK.getShareParam(this.type(), parameters, "images");
        if (Object.prototype.toString.apply(images) === '[object Array]')
        {
            type = $mob.shareSDK.contentType.Image;
        }
    }

    return type;
};

//注册平台
$mob.shareSDK.registerPlatformClass($mob.shareSDK.platformType.SinaWeibo, SinaWeibo);
