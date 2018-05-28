/**
 * Created with JetBrains WebStorm.
 * User: fenghj
 * Date: 15/11/16
 * Time: 下午12:27
 * To change this template use File | Settings | File Templates.
 */

var $pluginID = "com.mob.sharesdk.VKontakte";

/**
 * VK回调地址
 * @type {string}
 */
var VKontakteRedirectUri = "https://oauth.vk.com/blank.html";

/**
 * VKontakte应用信息标识
 * @type {{AppKey: string, AppSecret: string, OAuthCallback: string, ConvertUrl: string}}
 */
var VKontakteAppInfoKeys = {
    "ApplicationId"     : "application_id",
    "SecretKey"         : "secret_key",
    "AuthType"          : "auth_type",
    "ConvertUrl"        : "covert_url",
    "Scopes"            : "auth_scopes"
};

/**
 * VKontakte
 * @param type  平台类型
 * @constructor
 */
function VKontakte (type)
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
VKontakte.prototype.type = function ()
{
    return this._type;
};

/**
 * 获取平台名称
 * @returns {string}    平台名称
 */
VKontakte.prototype.name = function ()
{
    return "VKontakte";
};

/**
 * 获取应用标识
 * @returns {*} 应用标识
 */
VKontakte.prototype.applicationId = function ()
{
    if (this._appInfo[VKontakteAppInfoKeys.ApplicationId] !== undefined)
    {
        return this._appInfo[VKontakteAppInfoKeys.ApplicationId];
    }

    return null;
};

/**
 * 获取应用密钥
 * @returns {*} 应用密钥
 */
VKontakte.prototype.secretKey = function ()
{
    if (this._appInfo[VKontakteAppInfoKeys.SecretKey] !== undefined)
    {
        return this._appInfo[VKontakteAppInfoKeys.SecretKey];
    }

    return null;
};

/**
 * 获取授权方式
 *
 * @return  web 网页授权方式，sso 单点登录授权方式，both 两者共同使用，优先使用SSO
 */
VKontakte.prototype.authType = function ()
{
    if (this._appInfo[VKontakteAppInfoKeys.AuthType] !== undefined)
    {
        return this._appInfo[VKontakteAppInfoKeys.AuthType];
    }
    
    return $mob.shareSDK.authType();
};


/**
 * 获取缓存域名
 * @returns {string}    域名
 */
VKontakte.prototype.cacheDomain = function ()
{
    return "SSDK-Platform-" + this.type() + "-" + this.applicationId();
};

/**
 * 获取授权方式
 *
 * @return  web 网页授权方式，sso 单点登录授权方式，both 两者共同使用，优先使用SSO
 */
VKontakte.prototype.convertUrlEnabled = function ()
{
    if (this._appInfo[VKontakteAppInfoKeys.ConvertUrl] !== undefined)
    {
        return this._appInfo[VKontakteAppInfoKeys.ConvertUrl];
    }

    return $mob.shareSDK.convertUrlEnabled();
};

/**
 * 设置/获取应用信息
 * @param value 应用信息
 * @returns {*}
 */
VKontakte.prototype.setAppInfo = function (value)
{
    if (arguments.length === 0) 
    { 
        return this._appInfo;
    }
    else
    {
        this._appInfo = this._checkAppInfoAvailable(value);
        this._authScopes = this._checkAuthScopes(value);
    }
};

/**
 * 保存配置信息
 */
VKontakte.prototype.saveConfig = function ()
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

            curApps["plat_" + self.type()] = self.applicationId();
            $mob.ext.setCacheData("currentApp", curApps, false, domain, null);
        }

    });
};

/**
 * 获取是否支持授权
 * @returns {boolean} true 支持， false 不支持
 */
VKontakte.prototype.isSupportAuth = function ()
{
    return true;
};

/**
 * 用户授权
 * @param sessionId     授权会话标识
 * @param settings      授权设置
 */
VKontakte.prototype.authorize = function (sessionId, settings)
{
    var error = null;
    var self = this;
    var error_message;
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
                                   "photos",
                                   "wall",
                                   "groups",
                                   "friends",
                                   "email",
                                   "audio"
            ];

        }

        var authType = this.authType();
        
        if (authType === "both" || authType === "sso")
        {
            //进行SSO授权
            self._checkUrlScheme(function (hasReady, urlScheme){
            
                if(hasReady)
                {
                    //进行SSO授权
                    self._ssoAuthorize(sessionId, urlScheme, settings);
                }
                else if (authType === "both")
                {
                    //进行网页授权
                    self._webAuthorize(sessionId, settings);
                }
                else
                {
                    error_message = null;
                                             
                    if(this._currentLanguage === "zh-Hans")
                    {
                        error_message = "尚未设置分享平台［" + self.name() + "］的URL Scheme:" + "vk" + self.applicationId() + "，无法进行分享!请在项目设置中设置URL Scheme后再试!";
                    }
                    else
                    {
                        error_message = "Platform［" + self.name() + "］not set URL Scheme:" + "vk" + self.applicationId() + "!Please try again after set URL Scheme!";
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
        else if (authType === "web")
        {
            //进行网页授权

            this._webAuthorize(sessionId, settings);
        }
        else
        {
            error_message = null;
 
            if(this._currentLanguage === "zh-Hans")
            {
                error_message = "分享平台［" + this.name() + "］不支持[" + authType + "]授权方式!";
            }
            else
            {
                error_message = "Platform [" + this.name() + "］do not support auth type :[" + authType + "]!";
            }

            error = {
                "error_code" : $mob.shareSDK.errorCode.UnsupportFeature,
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
 * 处理SSO授权回调
 * @param sessionId     会话ID
 * @param callbackUrl   回调URL
 * @param sourceApplication     原始应用名称
 * @param annotation            附加数据
 */
VKontakte.prototype.handleSSOCallback = function (sessionId, callbackUrl, sourceApplication, annotation)
{
    var self = this;
    var VKBundleId = "com.vk.vkclient";
    var VKHDBundleId = "com.vk.vkhd";
    var VKDBBundleID = "com.vk.odnoletkov.client";
    
    if(sourceApplication === VKBundleId ||
       sourceApplication === VKHDBundleId ||
       sourceApplication === VKDBBundleID)
    {
        var urlInfo = $mob.utils.parseUrl(callbackUrl);
        var params = $mob.utils.parseUrlParameters(urlInfo.fragment);

        if(params !=null && params["access_token"] != null)
        {
            self._succeedAuthorize(sessionId, params);
        }
        else
        {
            $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Cancel, null);
        }
   
        return true;
    }
    
    return false;
};

/**
 * 处理用户授权回调
 * @param sessionId     授权会话标识
 * @param callbackUrl   回调地址
 */
VKontakte.prototype.handleAuthCallback = function (sessionId, callbackUrl)
{
    var error = null;
    var self = this;
    var error_message;
    var urlInfo = $mob.utils.parseUrl(callbackUrl);
    if (urlInfo != null && urlInfo.fragment != null)
    {
        var params = $mob.utils.parseUrlParameters(urlInfo.fragment);
        if (params != null && params.code != null)
        {
            var tokenParams = {
                "client_id" : this.applicationId(),
                "client_secret" : this.secretKey(),
                "redirect_uri" : VKontakteRedirectUri,
                "code" : params.code
            };

            //请求AccessToken
            $mob.ext.ssdk_callHTTPApi(this.type(), null, "https://oauth.vk.com/access_token", "POST", tokenParams, null, function (data) {

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
VKontakte.prototype.cancelAuthorize = function ()
{
    //清除缓存
    this._setCurrentUser(null, null);

};

/**
 * 获取用户信息
 * @param query         查询信息
 * @param callback      方法回调
 */
VKontakte.prototype.getUserInfo = function (query, callback)
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
                         
        var params = { "fields":"uid,first_name,last_name,sex,bdate,city,country,photo_50,photo_100,photo_200_orig,photo_200,photo_400_orig,photo_max,photo_max_orig,online,lists,screen_name,has_mobile,contacts,education,universities,schools,can_post,can_see_all_posts,can_write_private_message,status,last_seen,relation,counters,nickname" };
                         
        self.callApi("https://api.vk.com/method/users.get", "GET", params, null, function (state, data) {
            var resultData = data;
            if (state === $mob.shareSDK.responseState.Success)
            {
                resultData = {"platform_type" : self.type()};
                self._updateUserInfo(resultData, data["response"][0]);

                //如果用户数据和授权用户相同
                if (resultData["id"] === user["uid"])
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
VKontakte.prototype.addFriend = function (sessionId, user, callback)
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
VKontakte.prototype.getFriends = function (cursor, size, callback)
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
 * 调用API接口
 * @param url           接口URL
 * @param method        请求方式
 * @param params        请求参数
 * @param headers       请求头
 * @param callback      方法回调, 回调方法声明如下:function (state, data);
 */
VKontakte.prototype.callApi = function (url, method, params, headers, callback)
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
            
            params ["v"] = "5.73";
                         
            $mob.ext.ssdk_callHTTPApi(self.type(), null, url, method, params, headers, function (data) {

                if (data != null)
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
                        if (response == null)
                        {
                            response = {
                              "message" : $mob.utils.base64Decode(data["response_data"])
                            };
                        }

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
 * 分享内容
 * @param sessionId         会话ID
 * @param parameters        分享参数
 * @param callback          方法回调，回调方法声明如下:function (state, data, user, userData);
 */
VKontakte.prototype.share = function (sessionId, parameters, callback)
{
    var self = this;
    var error = null;
    var reqUrl = "https://api.vk.com/method/wall.post";

    var params = null;
    var text = null;
    var images = null;
    var groupId = null;
    var lat = null;
    var lng = null;
    var url = null;
    var isFriend = null;
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

    text = $mob.shareSDK.getShareParam(this.type(), parameters, "text");
    lat = $mob.shareSDK.getShareParam(this.type(), parameters, "lat");
    lng = $mob.shareSDK.getShareParam(this.type(), parameters, "long");
    images = $mob.shareSDK.getShareParam(this.type(), parameters, "images");
    groupId = $mob.shareSDK.getShareParam(this.type(), parameters, "group_id");
    url = $mob.shareSDK.getShareParam(this.type(), parameters, "url");
    isFriend = $mob.shareSDK.getShareParam(this.type(), parameters, "is_friend");

    self._getCurrentUser(function (user) {

        if (user != null)
        {
            switch (type)
            {
                case $mob.shareSDK.contentType.Text:
                {

                    self._convertUrl([text], function(data) {

                        params = {

                            "message" : data.result[0]

                        };

                        if (isFriend != null)
                        {
                            params ["friends_only"] = isFriend;
                        }

                        if (lat != null && lng != null)
                        {
                            params ["lat"] = lat;
                            params ["long"] = lng;
                        }

                        self.callApi(reqUrl, "POST", params, null, function (state, data) {

                            var resultData = data["response"];
                            if (state === $mob.shareSDK.responseState.Success)
                            {
                                //转换数据
                                if (data != null)
                                {
                                    resultData = {};
                                    resultData["raw_data"] = data["response"];
                                    resultData["cid"] = data["response"]["post_id"];
                                    resultData["text"] = text;
                                }
                            }

                            if (callback != null)
                            {
                                callback (state, resultData, user, userData);
                            }

                        });

                    });

                    break;
                }
                case $mob.shareSDK.contentType.Image:
                {
                    self._uploadImages(images, 0, groupId, user, null, [], function (images, imageUrls) {

                        if (images != null && images.length > 0)
                        {
                            self._convertUrl([text], function(data) {

                                params = {
                                    "message" : data.result[0]
                                };

                                if (isFriend != null)
                                {
                                    params ["friends_only"] = isFriend;
                                }

                                if (images != null)
                                {
                                    params ["attachments"] = images.join(",");
                                }

                                if (lat != null && lng != null)
                                {
                                    params ["lat"] = lat;
                                    params ["long"] = lng;
                                }

                                self.callApi(reqUrl, "POST", params, null, function (state, data) {

                                    var resultData = data["response"];
                                    if (state === $mob.shareSDK.responseState.Success)
                                    {
                                        //转换数据
                                        if (data != null)
                                        {
                                            resultData = {};
                                            resultData["raw_data"] = data["response"];
                                            resultData["cid"] = data["response"]["post_id"];
                                            resultData["text"] = text;
                                            if (imageUrls != null)
                                            {
                                                resultData["images"] = imageUrls;
                                            }

                                        }
                                    }

                                    if (callback != null)
                                    {
                                        callback (state, resultData, user, userData);
                                    }

                                });

                            });
                        }
                        else
                        {
                            error_message = null;
 
                            if(this._currentLanguage === "zh-Hans")
                            {
                                error_message = "分享失败！传入无效的图片或者分享图片太大!";
                            }
                            else
                            {
                                error_message = "Share Failed!Image is invalid  or too big";
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

                    break;
                }
                case $mob.shareSDK.contentType.WebPage:
                {

                    self._uploadImages(images, 0, groupId, user, null, [], function (images, imageUrls) {

                        self._convertUrl([text, url], function(data) {

                            params = {

                                "message" : data.result[0]

                            };

                            if (isFriend != null)
                            {
                                params ["friends_only"] = isFriend;
                            }

                            if (images == null)
                            {
                                images = [data.result[1]];
                            }
                            else
                            {
                                images.push(data.result[1]);
                            }

                            if (images != null)
                            {
                                params ["attachments"] = images.join(",");
                            }

                            if (lat != null && lng != null)
                            {
                                params ["lat"] = lat;
                                params ["long"] = lng;
                            }

                            self.callApi(reqUrl, "POST", params, null, function (state, data) {

                                var resultData = data["response"];
                                if (state === $mob.shareSDK.responseState.Success)
                                {
                                    //转换数据
                                    if (data != null)
                                    {
                                        resultData = {};
                                        resultData["raw_data"] = data["response"];
                                        resultData["cid"] = data["response"]["post_id"];
                                        resultData["text"] = text;
                                        if (url != null)
                                        {
                                            resultData["urls"] = [url];
                                        }
                                        if (imageUrls != null)
                                        {
                                            resultData["images"] = imageUrls;
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
        }
        else
        {
            error_message = null;
 
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
                callback ($mob.shareSDK.responseState.Fail, error, null, userData);
            }
        }

    });
};

/**
 * 创建用户信息
 * @param rawData       原始用户数据
 * @returns {null}      用户数据
 */
VKontakte.prototype.createUserByRawData = function (rawData)
{
    //转换用户数据
    var user = {
        "platform_type" : this.type()
    };
    this._updateUserInfo(user, rawData);
    return $mob.utils.objectToJsonString(user);
};

/**
 * 获取分组标识
 * @param groupId       分组标识
 * @param user          用户信息
 * @param callback      回调方法
 * @private
 */
VKontakte.prototype._getGroupId = function (groupId, user, callback)
{
    if (groupId == null)
    {
        if (user.raw_data["group_id"] == null)
        {
            var self = this;
            //查找名称为share的分组
            this.callApi("https://api.vk.com/method/groups.get", "GET", {"user_id" : user.uid, "extended" : 1}, null, function (state, data) {

                if (state === $mob.shareSDK.responseState.Success && data["response"] != null)
                {
                    for (var i = 1; i < data["response"].length; i++)
                    {
                        var group = data["response"][i];
                        if (group["name"] === "share1")
                        {
                            user.raw_data["group_id"] = group["gid"];
                            //保存信息
                            self._setCurrentUser(user, null);
                            break;
                        }
                    }
                    if (user.raw_data["group_id"] == null)
                    {
                        //创建share分组
                         self.callApi("https://api.vk.com/method/groups.create", "POST", {"title":"share1"}, null, function (state, data) {

                            if (state === $mob.shareSDK.responseState.Success)
                            {
                                user.raw_data["group_id"] = data["response"]["id"];
                                //保存信息
                                self._setCurrentUser(user, null);
                            }

                            if (callback != null)
                            {
                                callback (user.raw_data["group_id"]);
                            }
                        });
                    }
                    else
                    {
                        if (callback != null)
                        {
                            callback (user.raw_data["group_id"]);
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
        else
        {
            if (callback != null)
            {
                callback (user.raw_data["group_id"]);
            }
        }
    }
    else
    {
        if (callback != null)
        {
            callback (groupId);
        }
    }
};

/**
 * 获取上传服务器地址
 * @param url           上传服务器地址
 * @param groupId       分组ID
 * @param callback      回调方法
 * @private
 */
VKontakte.prototype._getUploadUrl = function (url, groupId, callback)
{
    if (url != null)
    {
        if (callback != null)
        {
            callback (url);
        }
    }
    else
    {
        //获取上传图片服务器地址
        this.callApi("https://api.vk.com/method/photos.getWallUploadServer", "GET", {"group_id" : groupId}, null, function (state, data) {
            if (state === $mob.shareSDK.responseState.Success)
            {
                url = data["response"]["upload_url"];
            }

            if (callback != null)
            {
                callback (url);
            }

        });
    }

};

/**
 * 上传图片
 * @param images    图片集合
 * @param index     图片索引
 * @param groupId   分组标识，指定要上传到分组
 * @param user      用户信息
 * @param uploadUrl 上传服务器地址
 * @param imageUrls 图片地址路径集合
 * @param callback  回调方法
 * @private
 */
VKontakte.prototype._uploadImages = function (images, index, groupId, user, uploadUrl, imageUrls, callback)
{
    var self = this;
    if (images != null && images.length > 0 && images.length > index)
    {
        //上传并转换image
        var image = images[index];
        this._getImagePath(image, function (imagePath) {
            if (imagePath != null)
            {
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

                    "photo" : "@file(" + $mob.utils.objectToJsonString(file) + ")"

                };
                //获取分组ID
                self._getGroupId(groupId, user, function (gid) {
                    if (gid != null)
                    {
                        //获取上传服务器地址
                        self._getUploadUrl(uploadUrl, gid, function (uploadUrl) {

                            if (uploadUrl != null)
                            {
                                //上传图片
                                self.callApi(uploadUrl, "POST", params, null, function (state, data) {
                                    if (state === $mob.shareSDK.responseState.Success)
                                    {
                                        var saveParams = {
                                            "user_id" : user.uid,
                                            "group_id" : gid,
                                            "server" : data ["server"],
                                            "hash" : data ["hash"],
                                            "photo" : data ["photo"]
                                        };

                                        self.callApi("https://api.vk.com/method/photos.saveWallPhoto", "POST", saveParams, null, function (state, data) {

                                            if (state === $mob.shareSDK.responseState.Success)
                                            {
                                                images[index] = data["response"][0]["id"];
                                                imageUrls.push(data["response"][0]["src_big"]);
                                                index ++;
                                            }
                                            else
                                            {
                                                //取下一张图片
                                                images.splice(index, 1);
                                            }

                                            self._uploadImages(images, index, gid, user, uploadUrl, imageUrls, callback);

                                        });

                                    }
                                    else
                                    {
                                        //取下一张图片
                                        images.splice(index, 1);
                                        self._uploadImages(images, index, gid, user, uploadUrl, imageUrls, callback);
                                    }

                                });
                            }
                            else
                            {
                                if (callback != null)
                                {
                                    callback (null, null);
                                }
                            }

                        });
                    }
                    else
                    {
                        if (callback != null)
                        {
                            callback (null, null);
                        }
                    }

                });
            }
            else
            {
                //取下一张图片
                images.splice(index, 1);
                self._uploadImages(images, index, groupId, user, uploadUrl, imageUrls, callback);
            }

        });
    }
    else
    {
        if (callback != null)
        {
            callback (images, imageUrls);
        }
    }
};

/**
 * 获取图片路径
 * @param url           图片路径
 * @param callback      回调
 * @private
 */
VKontakte.prototype._getImagePath = function (url, callback)
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
VKontakte.prototype._convertUrl = function (contents, callback)
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
VKontakte.prototype._getShareType = function (parameters)
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
 * 更新用户信息
 * @param user      用户信息
 * @param rawData   原始数据
 * @private
 */
VKontakte.prototype._updateUserInfo = function (user, rawData)
{
    if (user != null && rawData != null)
    {
        user["raw_data"] = rawData;
        user["uid"] = rawData ["id"].toString();
        user["nickname"] = rawData["screen_name"];
        user["icon"] = rawData["photo_100"];

        var gender = 2;
        switch (rawData["sex"])
        {
            case 1:
                gender = 1;
                break;
            case 2:
                gender = 0;
                break;
        }

        user["gender"] = gender;

        user["url"] = "http://vk.com/id" + rawData["id"];
        user["about_me"] = rawData["status"];

        if (rawData["bdate"] != null)
        {
            var date = new Date (rawData["bdate"]);
            user["birthday"] = date.getTime() / 1000;
        }

        if (rawData["counters"] != null)
        {
            user["follower_count"] = rawData["counters"]["followers"];
            user["friend_count"] = rawData["counters"]["friends"];
            user["share_count"] = rawData["counters"]["notes"] + rawData["counters"]["videos"] + rawData["counters"]["audios"];
        }

        var i;
        var item;
        var edu;
        var eduList = [];
        if (rawData["universities"] != null)
        {
            //教育信息
            for (i = 0; i < rawData["universities"].length; i++)
            {
                item = {};
                edu = rawData["universities"][i];

                item["school"] = edu["name"];
                item["classes"] = edu["faculty_name"];
                item["background"] = 0;
                item["school_type"] = 4;
                eduList.push(item);
            }
        }

        if (rawData["schools"] != null)
        {
            for (i = 0; i < rawData["schools"].length; i++)
            {
                item = {};
                edu = rawData["schools"][i];

                item["school"] = edu["name"];
                item["year"] = parseInt(edu["year_from"]);
                item["background"] = 0;
                item["school_type"] = 0;
                eduList.push(item);
            }
        }

        user["educations"] = eduList;
    }
};

/**
 * 获取当前用户信息
 * @param callback  回调方法
 * @private
 */
VKontakte.prototype._getCurrentUser = function (callback)
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
VKontakte.prototype._succeedAuthorize = function (sessionId, credentialRawData)
{
    var self = this;
    
    //成功
    var credential = {
        "uid"       : credentialRawData["user_id"].toString(),
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
 * 设置当前用户信息
 * @param user      用户信息
 * @param callback  回调方法
 * @private
 */
VKontakte.prototype._setCurrentUser = function (user, callback)
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
* 检测是否配置URL Scheme
* @param callback 方法回调
* @private
*/
VKontakte.prototype._checkUrlScheme = function (callback)
{
    var self = this;
    $mob.ext.getAppConfig(function (data){
                              
        var urlScheme = null;
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
                        if (schema === ("vk" + self.applicationId()))
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
            $mob.native.log("[ShareSDK-WARNING] 尚未配置[" + self.name() + "]URL Scheme:" + "vk" + self.applicationId() + ", 无法使用进行授权。");
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
VKontakte.prototype._webAuthorize = function (sessionId, settings)
{
    var authUrl = "https://oauth.vk.com/authorize?client_id=" + this.applicationId() + "&response_type=code&redirect_uri=" + $mob.utils.urlEncode(VKontakteRedirectUri);

    if (settings != null && settings ["scopes"] != null && Object.prototype.toString.apply(settings ["scopes"]) === '[object Array]')
    {
        authUrl += "&scope=" + $mob.utils.urlEncode(settings ["scopes"].join(","));
    }
    else if (this._authScopes != null)
    {   
        authUrl += "&scope=" + $mob.utils.urlEncode(this._authScopes);
    }

    //打开授权
    $mob.native.ssdk_openAuthUrl(sessionId, authUrl, VKontakteRedirectUri);
};

/**
* SSO授权
* @param sessionId     会话标识
* @param urlScheme     回调URL Scheme
* @param settings      授权设置
* @private
*/
VKontakte.prototype._ssoAuthorize = function (sessionId, urlScheme, settings)
{
    
    
    var self = this;
    var queryString = "client_id=" + $mob.utils.urlEncode(this.applicationId()) +
        "&revoke=1";
    if (settings != null && settings ["scopes"] != null && Object.prototype.toString.apply(settings ["scopes"]) === '[object Array]')
    {
        queryString += "&scope=" + $mob.utils.urlEncode(settings ["scopes"].join(","));
    }
    else if (this._authScopes != null)
    {
        queryString += "&scope=" + $mob.utils.urlEncode(this._authScopes);
    }

    var authUrl = "vkauthorize://authorize?" + queryString;
        
    //检测能否打开VK应用
    $mob.ext.canOpenURL(authUrl, function (data){
                            
        if (data.result)
        {
            //进行SSO授权
            $mob.native.openURL(authUrl);
                            
        }
        else
        {
            //进行网页授权
            self._webAuthorize(sessionId, settings);
                            
        }
    });
};

        
/**
 * 检测应用是否有效
 * @returns {boolean}   true 有效 false 无效
 * @private
 */
VKontakte.prototype._isAvailable = function ()
{
    if (this.applicationId() != null && this.secretKey() != null)
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
VKontakte.prototype._checkAuthScopes = function (appInfo)
{
    return appInfo [VKontakteAppInfoKeys.Scopes];
};

/**
 * 检测应用信息有效性
 * @param appInfo   应用信息
 * @private
 */
VKontakte.prototype._checkAppInfoAvailable = function (appInfo)
{
    var appKey = $mob.utils.trim(appInfo [VKontakteAppInfoKeys.ApplicationId]);
    var appSecret = $mob.utils.trim(appInfo [VKontakteAppInfoKeys.SecretKey]);

    if (appKey != null)
    {
        appInfo [VKontakteAppInfoKeys.ApplicationId] = appKey;
    }
    else
    {
        appInfo [VKontakteAppInfoKeys.ApplicationId] = this.applicationId();   
    }

    if (appSecret != null)
    {
        appInfo [VKontakteAppInfoKeys.SecretKey] = appSecret;
    }
    else
    {
        appInfo [VKontakteAppInfoKeys.SecretKey] = this.secretKey();   
    }

    return appInfo;
};

/**
 * 授权状态改变
 * @param sessionId         会话标识
 * @param data              返回数据
 * @private
 */
VKontakte.prototype.authStateChanged = function (sessionId, data)
{
    $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Cancel, null);
};

//注册平台
$mob.shareSDK.registerPlatformClass($mob.shareSDK.platformType.VKontakte, VKontakte);
