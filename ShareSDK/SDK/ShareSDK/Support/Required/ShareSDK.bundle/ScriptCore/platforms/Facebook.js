/**
 * Created with JetBrains WebStorm.
 * User: fenghj
 * Date: 15/6/15
 * Time: 上午11:44
 * To change this template use File | Settings | File Templates.
 */

var $pluginID = "com.mob.sharesdk.Facebook";

/**
 * Facebook回调地址
 * @type {string}
 */
var FacebookRedirectUri = "fbconnect://success";

/**
 * Facebook应用信息键名定义
 * @type {{AppKey: string, AppSecret: string, RedirectUri: string}}
 */
var FacebookAppInfoKeys = {
    "AppKey"        : "api_key",
    "AppSecret"     : "app_secret",
    "DisplayName"   : "display_name",
    "AuthType"      : "auth_type",
    "ConvertUrl"    : "covert_url",
    "Scopes"        : "auth_scopes"
};

/**
 * facebook分享内容集合
 * @type {{}}
 */
var FacebookShareContentSet = {};

/**
 * Facebook
 * @param type  平台类型
 * @constructor
 */
function Facebook (type)
{
    this._type = type;
    this._appInfo = {};
    this._authScopes = null;
    this._displayname = null;
    //当前授权用户
    this._currentUser = null;
    this._ssoUrlScheme = null;
    //设置当前语言环境
    this._currentLanguage = $mob.shareSDK.preferredLanguageLocalize();
}

/**
 * 获取平台类型
 * @returns {*} 平台类型
 */
Facebook.prototype.type = function ()
{
    return this._type;
};

/**
 * 授权状态改变
 * @param sessionId         会话标识
 * @param data              返回数据
 * @private
 */
Facebook.prototype.authStateChanged = function (sessionId, data)
{
    $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Cancel, null);
};

/**
 * 获取平台名称
 * @returns {string}    平台名称
 */
Facebook.prototype.name = function ()
{
    return "Facebook";
};

/**
 * 获取应用标识
 * @returns {*} 应用标识
 */
Facebook.prototype.appKey = function ()
{
    if (this._appInfo[FacebookAppInfoKeys.AppKey] !== undefined) 
    {
        return this._appInfo[FacebookAppInfoKeys.AppKey];
    }

    return null;
};

/**
 * 获取应用密钥
 * @returns {*} 应用密钥
 */
Facebook.prototype.appSecret = function ()
{
    if (this._appInfo[FacebookAppInfoKeys.AppSecret] !== undefined) 
    {
        return this._appInfo[FacebookAppInfoKeys.AppSecret];
    }

    return null;
};

/**
 * 获取授权方式
 *
 * @return  web 网页授权方式，sso 单点登录授权方式，both 两者共同使用，优先使用SSO
 */
Facebook.prototype.authType = function ()
{
    if (this._appInfo[FacebookAppInfoKeys.AuthType] !== undefined) 
    {
        return this._appInfo[FacebookAppInfoKeys.AuthType];
    }

    return $mob.shareSDK.authType();
};

/**
 * 获取缓存域名
 * @returns {string}    域名
 */
Facebook.prototype.cacheDomain = function ()
{
    return "SSDK-Platform-" + $mob.shareSDK.platformType.Facebook + "-" + this.appKey();
};

/**
 * 获取授权方式
 *
 * @return  web 网页授权方式，sso 单点登录授权方式，both 两者共同使用，优先使用SSO
 */
Facebook.prototype.convertUrlEnabled = function ()
{
    if (this._appInfo[FacebookAppInfoKeys.ConvertUrl] !== undefined) 
    {
        return this._appInfo[FacebookAppInfoKeys.ConvertUrl];
    }

    return $mob.shareSDK.convertUrlEnabled();
};


/**

 * 获取应用显示名
 * @returns {*} 应用显示名称 与分享有关系
 */
Facebook.prototype.displayname = function ()
{
    if (this._appInfo[FacebookAppInfoKeys.DisplayName] !== undefined) 
    {
        return this._appInfo[FacebookAppInfoKeys.DisplayName];
    }

    return null;
};

/**
 * 设置/获取应用信息
 * @param value 应用信息
 * @returns {*}
 */
Facebook.prototype.setAppInfo = function (value)
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
    }
};

/**
 * 保存配置信息
 */
Facebook.prototype.saveConfig = function ()
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
Facebook.prototype.isSupportAuth = function ()
{
    return true;
};
/**
 * 用户授权
 * @param sessionId     授权会话标识
 * @param settings      授权设置
 */
Facebook.prototype.authorize = function (sessionId, settings)
{
    var error = null;
    var error_message;
    if (this._isAvailable())
    {
        if (settings == null)
        {
            settings = {};
        }

        if (settings ["scopes"] == null)
        {
            //设置默认权限
            settings ["scopes"] = [
                "email",
                "public_profile",
            ];
        }

        var self = this;
        var authType = this.authType();
        if (authType === "both" || authType === "sso")
        {
            //检测是否支持多任务
            $mob.ext.isMultitaskingSupported(function (data){
                if (data.result)
                {
                    //检测URL Scheme
                    self._checkUrlScheme(function (hasReady, urlScheme){

                        if (hasReady)
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
                else if (authType === "both")
                {
                    //进行网页授权
                    self._webAuthorize(sessionId, settings);
                }
                else
                {
                    error_message = null;
 
                    if(self._currentLanguage === "zh-Hans")
                    {
                        error_message = "分享平台［" + self.name() + "］不支持[" + authType + "]授权方式!";
                    }
                    else
                    {
                        error_message = "Platform [" + self.name() + "］do not support auth type :[" + authType + "]!";
                    }

                    error = {
                        "error_code" : $mob.shareSDK.errorCode.UnsupportFeature,
                        "error_message" : error_message
                    };
                    $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Fail, error);
                }
            });
        }
        else if (authType === "web")
        {
            //进行网页授权
            self._webAuthorize(sessionId, settings);
        }
        else
        {

            error_message = null;
 
            if(this._currentLanguage === "zh-Hans")
            {
                error_message = "分享平台［" + self.name() + "］不支持[" + authType + "]授权方式!";
            }
            else
            {
                error_message = "Platform [" + self.name() + "］do not support auth type :[" + authType + "]!";
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
 * 处理用户授权回调
 * @param sessionId     授权会话标识
 * @param callbackUrl   回调地址
 */
Facebook.prototype.handleAuthCallback = function (sessionId, callbackUrl)
{
    var error = null;
    var self = this;
    var error_message;
    var urlInfo = $mob.utils.parseUrl(callbackUrl);
    if (urlInfo != null)
    {
        var query = urlInfo.fragment;
        if (query == null)
        {
            query = urlInfo.query;
        }

        var params = $mob.utils.parseUrlParameters(query);
        if (params != null)
        {
            if (params.error_code != null)
            {

                error_message = null;

                if(this._currentLanguage === "zh-Hans")
                {
                    error_message = "平台[" + this.name() + "]授权失败!";
                }
                else
                {
                    error_message = "Platform [" + self.name() + "] authorize request fail!";
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
                //获取用户ID
                var getUidParams = {

                    "access_token" : params["access_token"],
                    "fields" : "id"

                };
                $mob.ext.ssdk_callHTTPApi($mob.shareSDK.platformType.Facebook, null, "https://graph.facebook.com/v2.8/me", "GET", getUidParams, null, function (data) {

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
                            if (response.error == null)
                            {
                                //成功
                                params["uid"] = response.id;

                                self._succeedAuthorize(sessionId, params);
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
 * 处理添加好友返回回调
 * @param sessionId         会话标识
 * @param callbackUrl       回调地址
 * @param uid               用户ID
 */
Facebook.prototype.handleAddFriendCallback = function (sessionId, callbackUrl, uid)
{
    var error = null;
    var error_message;
    var urlInfo = $mob.utils.parseUrl(callbackUrl);
    if (urlInfo != null)
    {
        var params = $mob.utils.parseUrlParameters(urlInfo.query);
        if (params["__CANCEL__"] != null)
        {
            //取消
            $mob.native.ssdk_addFriendStateChanged(sessionId, $mob.shareSDK.responseState.Cancel, null);
        }
        else if (params["error_code"] != null)
        {
            if (params["error_code"] === 4201)
            {
                //取消
                $mob.native.ssdk_addFriendStateChanged(sessionId, $mob.shareSDK.responseState.Cancel, null);
            }
            else
            {
                error_message = null;
 
                if(this._currentLanguage === "zh-Hans")
                {
                    error_message = "添加好友失败!";
                }
                else
                {
                    error_message = "Failed to add friend!";
                }

                //失败
                error = {
                    "error_code" : $mob.shareSDK.errorCode.APIRequestFail,
                    "error_message" : error_message,
                    "user_data" : params
                };
                $mob.native.ssdk_addFriendStateChanged(sessionId, $mob.shareSDK.responseState.Fail, error);
            }
        }
        else
        {
            //成功
            var query = {
                "uid" : uid
            };

            //获取用户资料
            this.getUserInfo(query, function (state, data) {

                var user = null;
                if (state === $mob.shareSDK.responseState.Success)
                {
                    user = data;
                }

                $mob.native.ssdk_addFriendStateChanged(sessionId, $mob.shareSDK.responseState.Success, user);
            });
        }
    }
    else
    {

        error_message = null;
 
        if(this._currentLanguage === "zh-Hans")
        {
            error_message = "添加好友失败，无效的回调:[" + callbackUrl + "]";
        }
        else
        {
            error_message = "Failed to add friend.Invalid callback :[" + callbackUrl + "]";
        }

        error = {
            "error_code" : $mob.shareSDK.errorCode.APIRequestFail,
            "error_message" : error_message
        };
        $mob.native.ssdk_addFriendStateChanged(sessionId, $mob.shareSDK.responseState.Fail, error);
    }
};

/**
 * 处理SSO授权回调
 * @param sessionId     会话ID
 * @param callbackUrl   回调URL
 * @param sourceApplication     原始应用名称
 * @param annotation            附加数据
 */
Facebook.prototype.handleSSOCallback = function (sessionId, callbackUrl, sourceApplication, annotation)
{
    if (callbackUrl.indexOf(this._ssoUrlScheme + "://") === 0)
    {
        //处理回调
        this.handleAuthCallback(sessionId, callbackUrl);

        return true;
    }

    return false;
};

/**
 * 获取用户信息
 * @param query         查询信息
 * @param callback      方法回调
 */
Facebook.prototype.getUserInfo = function (query, callback)
{
    var self = this;
    var url = null;
    if (query != null && query.uid != null)
    {
        url = "https://graph.facebook.com/v2.8/" + query.uid;
    }
    else
    {
        //获取授权用户个人信息
        url = "https://graph.facebook.com/v2.8/me";
    }

    var params = {
        
        "fields" : "id,name,first_name,middle_name,last_name,gender,locale,languages,link,age_range,third_party_id,installed,timezone,updated_time,verified,birthday,cover,currency,devices,education,email,hometown,interested_in,location,political,payment_pricepoints,favorite_athletes,favorite_teams,picture,quotes,relationship_status,religion,security_settings,video_upload_limits,website,work"
        
    };
    
    self._getCurrentUser(function (user) {

        self.callApi(url, "GET", params, null, function (state, data) {

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
Facebook.prototype.callApi = function (url, method, params, headers, callback)
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

            $mob.ext.ssdk_callHTTPApi($mob.shareSDK.platformType.Facebook, null, url, method, params, headers, function (data) {

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
                                case 2500:
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
 * 取消授权
 */
Facebook.prototype.cancelAuthorize = function ()
{
    this._setCurrentUser(null, null);

    $mob.ext.isPluginRegisted("com.mob.sharesdk.connector.facebook", function (data) {
                              
        if (data.result)
        {
            $mob.native.ssdk_plugin_facebook_cancelAuth();
        }
    });

};

/**
 * 添加好友
 * @param sessionId     会话标识
 * @param user          用户信息
 * @param callback      方法回调，回调方法声明如下:function (stat, data);
 */
Facebook.prototype.addFriend = function (sessionId, user, callback)
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

    var error =
    {
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
Facebook.prototype.getFriends = function (cursor, size, callback)
{
    var self = this;
    var params = {
        "offset" : cursor,
        "limit" : size,
        "fields" : "id,name,first_name,middle_name,last_name,gender,locale,languages,link,age_range,third_party_id,installed,timezone,updated_time,verified,birthday,cover,devices,education,email,hometown,interested_in,location,political,favorite_athletes,favorite_teams,picture,quotes,relationship_status,religion,security_settings,video_upload_limits,website,work"
    };

    self.callApi("https://graph.facebook.com/v2.8/me/friends", "GET", params, null, function (state, data) {

        var resultData = data;
        if (state === $mob.shareSDK.responseState.Success)
        {
            //转换数据
            resultData = {};
            resultData["prev_cursor"] = cursor - size;
            resultData["next_cursor"] = cursor + size;

            if (resultData["prev_cursor"] < 0)
            {
                resultData["prev_cursor"] = 0;
            }

            //转换用户数据
            var users = [];
            var rawUsersData = data["data"];
            if (rawUsersData != null)
            {
                for (var i = 0; i < rawUsersData.length; i++)
                {
                    var user = {"platform_type" : $mob.shareSDK.platformType.Facebook};
                    self._updateUserInfo(user, rawUsersData[i]);
                    users.push(user);
                }
            }
            resultData["users"] = users;
            resultData ["has_next"] = (users.length === size);
        }

        if (callback != null)
        {
            callback (state, resultData);
        }

    });
};

/**
 * 分享图片
 * @param sessionId         会话ID
 * @param parameters        分享参数
 * @param userData          统计标识数据
 * @param callback          方法回调
 */
Facebook.prototype._clientShareImages = function (sessionId, parameters, userData, callback)
{
    var self = this;
    $mob.ext.isPluginRegisted("com.mob.sharesdk.connector.facebook", function (data) {
        if (data.result)
        {
            var images = $mob.shareSDK.getShareParam(self.type(), parameters, "images");
            if(images != null)
            {
                $mob.ext.ssdk_facebookShareImage(self.appKey() ,self.displayname() ,images, function (data) {
                    if (data.error_code != null)
                    {
                        self._shareWithWebFaceBook(sessionId, $mob.shareSDK.contentType.Image, parameters, userData, callback);
                    }
                    else
                    {
                        //调用成功后不回调，等待客户端回调时再触发
                        //记录分享内容
                        var shareParams = {"platform" : self.type(), "images" : images };
                        FacebookShareContentSet[sessionId] = {"content" : shareParams, "user_data" : userData};
                    }
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
                var error = {
                    "error_code" : $mob.shareSDK.errorCode.APIRequestFail,
                    "error_message" : error_message
                };
                if (callback != null)
                {
                    callback ($mob.shareSDK.responseState.Fail, error, null, userData);
                }
            }
        }
        else
        {
            self._shareWithWebFaceBook(sessionId, $mob.shareSDK.contentType.Image, parameters, userData, callback);
        }                      
    });
};

/**
 * 分享网址
 * @param sessionId         会话ID
 * @param parameters        分享参数
 * @param userData          统计标识数据
 * @param callback          方法回调
 */
Facebook.prototype._clientShareWebPage = function (sessionId, parameters, userData, callback)
{
    var error;
    var error_message;
    var self = this;
    $mob.ext.isPluginRegisted("com.mob.sharesdk.connector.facebook", function (data) {
        if (data.result)
        {
            var url = $mob.shareSDK.getShareParam(self.type(), parameters, "url");
            if(url != null)
            {
                var desc = $mob.shareSDK.getShareParam(self.type(), parameters, "text");
                var title = $mob.shareSDK.getShareParam(self.type(), parameters, "title");
                var images = $mob.shareSDK.getShareParam(self.type(), parameters, "images");
                var imageUrl = '';
                if (images != null && Object.prototype.toString.apply(images) === '[object Array]')
                {
                    //取第一张图片进行分享
                    imageUrl = images [0];
                }
                self._convertUrl([desc,url], function(data)
                {
                    desc = data.result[0];
                    url = data.result[1];
                    $mob.ext.ssdk_facebookClientShareWebPage(self.appKey(),self.displayname(),url,title,desc,imageUrl,function (data) {
                        if (data.error_code != null)
                        {
                            self._shareWithWebFaceBook(sessionId, $mob.shareSDK.contentType.WebPage, parameters, userData, callback);
                        }
                        else
                        {
                            //调用成功后不回调，等待客户端回调时再触发
                            //记录分享内容
                            var shareParams = {"platform" : self.type(), "text" : desc , 'title' : title , 'url' :url ,'images': images};
                            FacebookShareContentSet[sessionId] = {"content" : shareParams, "user_data" : userData};
                        }
                    });
                });
            }
            else
            {
                error_message = null;
                if(this._currentLanguage === "zh-Hans")
                {
                    error_message = "分享参数url不能为空!";
                }
                else
                {
                    error_message = "share param url can not be nil!";
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
        }
        else
        {
            error_message = null;
                              
            if(self._currentLanguage === "zh-Hans")
            {
                error_message = "平台[" + self.name() + "]需要依靠FacebookConnector.framework进行分享，请先导入FacebookConnector.framework后再试!";
            }
            else
            {
                error_message = "Platform [" + self.name() + "] depends on FacebookConnector.framework，please import FacebookConnector.framework then try again!";
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
 * 分享视频
 * @param sessionId         会话ID
 * @param parameters        分享参数
 * @param userData          统计标识数据
 * @param callback          方法回调
 */
Facebook.prototype._clientShareVideo = function (sessionId, parameters, userData, callback)
{
    var self = this;
    var error;
    var error_message;
    $mob.ext.isPluginRegisted("com.mob.sharesdk.connector.facebook", function (data) {
        if (data.result)
        {
            var video = $mob.shareSDK.getShareParam(self.type(), parameters, "video_asset_url");
            if(video == null)
            {
                video = $mob.shareSDK.getShareParam(self.type(), parameters, "url");
            }
            if(video != null)
            {
                self._getCurrentUser(function (user) {
                    if(user != null && self._isUserAvaliable(user))
                    {
                        $mob.ext.ssdk_facebookShareVideo( self.appKey(), self.displayname(), video, user.uid , sessionId , user.credential.token ,function (data) {
                            if (data.error_code != null)
                            {
                                if (callback != null)
                                {
                                    callback ($mob.shareSDK.responseState.Fail, data, null, userData);
                                }
                            }
                            else
                            {
                                var shareParams;
                                if(data.beginUPLoad)
                                {
                                    shareParams = {"platform" : self.type(), "video" : video };
                                    FacebookShareContentSet[sessionId] = {"content" : shareParams, "user_data" : userData};
                                    $mob.native.ssdk_shareStateChanged(sessionId, $mob.shareSDK.responseState.BeginUPLoad, null, null, null);
                                }
                                else
                                {
                                    shareParams = {"platform" : self.type(), "video" : video };
                                    FacebookShareContentSet[sessionId] = {"content" : shareParams, "user_data" : userData};
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
                            callback ($mob.shareSDK.responseState.Fail, error , null, userData);
                        }
                    }
                });
            }
            else
            {
                error_message = null;
                if(self._currentLanguage === "zh-Hans")
                {
                    error_message = "分享参数video不能为空!";
                }
                else
                {
                    error_message = "share param video can not be nil!";
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
        }
        else
        {
            error_message = null;
                              
            if(this._currentLanguage === "zh-Hans")
            {
                error_message = "平台[" + self.name() + "]需要依靠FacebookConnector.framework进行分享，请先导入ShareSDKConnector.framework后再试!";
            }
            else
            {
                error_message = "Platform [" + self.name() + "] depends on FacebookConnector.framework，please import FacebookConnector.framework then try again!";
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
 * 分享内容 客户端
 * @param sessionId         会话ID
 * @param type              类型
 * @param parameters        分享参数
 * @param userData          统计标识数据
 * @param callback          方法回调
 */
Facebook.prototype._shareWithClientFaceBook = function (sessionId, type, parameters, userData, callback)
{
    var self = this;
    switch (type)
    {
        case $mob.shareSDK.contentType.Text:
        {
            self._shareText(sessionId,parameters,userData,callback);
            break;
        }
        case $mob.shareSDK.contentType.Image:
        {
            self._clientShareImages(sessionId,parameters,userData,callback);
            break;
        }
        case $mob.shareSDK.contentType.Video:
        {
            self._clientShareVideo(sessionId,parameters,userData,callback);
            break;
        }
        case $mob.shareSDK.contentType.WebPage:
        {
            self._clientShareWebPage(sessionId,parameters,userData,callback);
            break;
        }
        case $mob.shareSDK.contentType.App:
        {
            self._clientShareApp(sessionId,parameters,userData,callback);
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
 * 分享内容
 * @param sessionId         会话ID
 * @param parameters        分享参数
 * @param callback          方法回调，回调方法声明如下:function (state, data, user, userData);
 */
Facebook.prototype.share = function (sessionId, parameters, callback)
{
    var self = this;
    var enableUseClientShare = parameters != null ? parameters ["@client_share"] : false;
    // //获取分享统计标识
    var flags = parameters != null ? parameters ["@flags"] : null;
    var userData = {
      "@flags" : flags
    };

    var type = $mob.shareSDK.getShareParam(self.type(), parameters, "type");
    if (type == null)
    {
        type = $mob.shareSDK.contentType.Auto;
    }
    if (type === $mob.shareSDK.contentType.Auto)
    {
        //获取最适合的分享类型
        type = this._getShareType(parameters, true);
    }

    if (enableUseClientShare)
    {
        //检测URL Scheme
        self._checkUrlScheme(function (hasReady, urlScheme){
            if (hasReady)
            {
                self._shareWithClientFaceBook(sessionId, type, parameters, userData, callback);
            }
            else
            {
                //使用web分享
                self._shareWithWebFaceBook(sessionId, type, parameters, userData, callback);
            }
        });
    }
    else
    {
         self._shareWithWebFaceBook(sessionId, type, parameters, userData, callback);
    }
};

/**
 * 分享文字
 * @param sessionId         会话ID
 * @param parameters        分享参数
 * @param userData          统计标识数据
 * @param callback          方法回调
 */
Facebook.prototype._shareText = function (sessionId, parameters, userData, callback)
{
    var self = this;
    var text = $mob.shareSDK.getShareParam(this.type(), parameters, "text");
    var params = {
        "message" : text
    };

    this._getCurrentUser(function (user) {
        self._convertUrl([text], function (data) {

            params["message"] = data.result[0];
            self.callApi("https://graph.facebook.com/v2.8/me/feed", "POST", params, null, function (state, data) {

                var resultData = data;
                if (state === $mob.shareSDK.responseState.Success)
                {
                    //转换数据
                    resultData = {};
                    resultData["raw_data"] = data;
                    
                    var id = data["id"];
                    var index = id.indexOf("_");
                    if (index >= 0)
                    {
                        id = id.substr(index + 1);
                    }
                    resultData["cid"] = id;

                    //获取文章信息
                    self.callApi("https://graph.facebook.com/v2.8/" + user["uid"] + "_" + id, "GET", null, null, function (state, data) {
                                 
                        if (state === $mob.shareSDK.responseState.Success)
                        {
                            resultData["raw_data"] = data;
                            resultData["text"] = data ["message"];
                        }

                        if (callback != null)
                        {
                            callback (state, resultData, user, userData);
                        }

                    });
                }
                else
                {
                    if (callback != null)
                    {
                        callback (state, resultData, user, userData);
                    }
                }

            });

        });

    });
};

/**
 * 分享图片
 * @param sessionId         会话ID
 * @param parameters        分享参数
 * @param userData          统计标识数据
 * @param callback          方法回调
 */
Facebook.prototype._shareImage = function (sessionId, parameters, userData, callback)
{
    var self = this;
    var image = null;
    var images = $mob.shareSDK.getShareParam(this.type(), parameters, "images");
    if (Object.prototype.toString.apply(images) === '[object Array]')
    {
        //取第一张图片进行分享
        image = images [0];
    }
    this._getImagePath(image, function (imagePath) {

        if (imagePath) 
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
                "source" : "@file(" + $mob.utils.objectToJsonString(file) + ")"
            };

            //文本
            var text = $mob.shareSDK.getShareParam(self.type(), parameters, "text");
            if (text != null)
            {
                params ["message"] = text;
            }

            self._getCurrentUser(function (user) {

                self._convertUrl([text], function (data){

                    params["message"] = data.result[0];
                    self.callApi("https://graph.facebook.com/v2.8/me/photos", "POST", params, null, function (state, data) {

                        var resultData = data;
                        if (state === $mob.shareSDK.responseState.Success)
                        {
                            resultData = {};
                            resultData["raw_data"] = data;
                            resultData["cid"] = data["id"];

                            //获取文章信息
                            self.callApi("https://graph.facebook.com/v2.8/" + user["uid"] + "_" + data["id"], "GET", null, null, function (state, data) {

                                if (state === $mob.shareSDK.responseState.Success)
                                {
                                    resultData["raw_data"] = data;
                                    resultData["text"] = data ["message"];

                                    if (data ["source"] != null)
                                    {
                                        resultData["images"] = [data["source"]];
                                    }
                                    else
                                    {
                                        if (image != null)
                                        {
                                            var images = [];
                                            images.push(image);
                                            resultData["images"] = images;
                                        }
                                    }
                                }

                                if (callback != null)
                                {
                                    callback (state, resultData, user, userData);
                                }

                            });
                        }
                        else
                        {
                            if (callback != null)
                            {
                                callback (state, resultData, user, userData);
                            }
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
                error_message = "分享参数image不能为空!";
            }
            else
            {
                error_message = "share param image can not be nil!";
            }

            var error = {
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

Facebook.prototype._shareWebPage = function (sessionId, parameters, userData, callback)
{
    var self = this;
    var error_message;
    var error;
    var url = $mob.shareSDK.getShareParam(self.type(), parameters, "url");
    if (url != null)
    {
        
        var caption = $mob.shareSDK.getShareParam(self.type(), parameters, "title");
        var desc = $mob.shareSDK.getShareParam(self.type(), parameters, "text");
        var images = $mob.shareSDK.getShareParam(self.type(), parameters, "images");
        
        var imageUrl = null;
        images = $mob.shareSDK.getShareParam(self.type(), parameters, "images");
        if (Object.prototype.toString.apply(images) === '[object Array]')
        {
            //取第一张图片进行分享
            imageUrl = images [0];
        }

        var name = $mob.shareSDK.getShareParam(self.type(), parameters, "url_name");
        var sourceUrl = $mob.shareSDK.getShareParam(self.type(), parameters, "attachments");

        if (imageUrl != null)
        {
            if (/^(file\:\/)?\//.test(imageUrl)) 
            {
                //如果为本地图片,那么图片无效,直接传空
                imageUrl = null;
            }
        }
        $mob.ext.isPluginRegisted("com.mob.sharesdk.connector.facebook", function (data) 
        {
            if (data.result)
            {
                self._convertUrl([url], function(data) 
                {
                    url = data.result[0];
                    $mob.ext.ssdk_facebookShareWebPage(self.appKey(), FacebookRedirectUri, caption, desc, url, imageUrl, name, sourceUrl, function(data){
                        var state = data.state;
                        var postId = data.postId;
                        var resultData = null;
                        var raw_data = {};
                        switch(state)
                        {                                       
                            case $mob.shareSDK.responseState.Success:
                            {
                                //转换数据
                                resultData = {};

                                if (postId != null) 
                                {
                                    resultData["cid"] = postId;
                                    raw_data["postId"] = postId;
                                    resultData["raw_data"] = raw_data;
                                }

                                if (imageUrl != null)
                                {
                                    var images = [];
                                    images.push(imageUrl);
                                    resultData["images"] = images;
                                }
                            
                                if (url != null)
                                {
                                    var urls = [];
                                    urls.push(url);
                                    resultData["urls"] = urls;
                                }                     
                                                       
                                if (desc != null)
                                {
                                    resultData["text"] = desc;
                                }
                                                       
                                break;
                            }
                            case $mob.shareSDK.responseState.Fail:
                            {
                                resultData = 
                                {
                                    "error_code" : data["error_code"],
                                    "error_message" : data["error_message"]
                                };

                                break;
                            }
                            case $mob.shareSDK.responseState.Cancel:
                            {
                                var resUserData = data["user_data"];
                                if (resUserData != null)
                                {
                                    for (var key in resUserData)
                                    {
                                        if(resUserData.hasOwnProperty(key)) 
                                        {
                                            userData [key] = resUserData [key];
                                        }
                                    }
                                }

                                break;
                            }
                        }

                        if (callback != null)
                        {
                            callback (state, resultData, null, null);
                        }

                    });
                });
            }
            else
            {
                error_message = null;
                                  
                if(this._currentLanguage === "zh-Hans")
                {
                    error_message = "平台[" + self.name() + "]需要依靠FacebookConnector.framework进行分享，请先导入ShareSDKConnector.framework后再试!";
                }
                else
                {
                    error_message = "Platform [" + self.name() + "] depends on FacebookConnector.framework，please import FacebookConnector.framework then try again!";
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
                error_message = "分享参数url不能为空!";
            }
            else
            {
                error_message = "share param url can not be nil!";
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

Facebook.prototype._clientShareApp = function(sessionId, parameters, userData, callback)
{
    var self = this;
    var error_message;
    var error;
    var url = $mob.shareSDK.getShareParam(self.type(), parameters, "url");
    var imageUrl = null;
    var images = $mob.shareSDK.getShareParam(self.type(), parameters, "images");
    if (Object.prototype.toString.apply(images) === '[object Array]')
    {
        imageUrl = images[0];
    }

    if (imageUrl != null)
    {
        if (/^(file\:\/)?\//.test(imageUrl)) 
        {
            //如果为本地图片,那么图片无效,直接传空
            imageUrl = null;
        }
    }

    if (imageUrl == null || url == null) 
    {
        error_message = null;
                                  
        if(this._currentLanguage === "zh-Hans")
        {
            error_message = "平台[" + self.name() + "]缺少必要分享参数";
        }
        else
        {
            error_message = "Platform [" + self.name() + "] Lack of necessary shared parameters";
        }
                                  
        error = {
                 "error_code" : $mob.shareSDK.errorCode.APIRequestFail,
                 "error_message" : error_message
                };

        if (callback != null)
        {
            callback ($mob.shareSDK.responseState.Fail, error, null, userData);
        }

        return;
    }

    $mob.ext.isPluginRegisted("com.mob.sharesdk.connector.facebook", function (data){

        if (data.result) 
        {
            // self._convertUrl([url], function(data){

            //     url = data.result[0];

                $mob.ext.ssdk_facebookClientShareApp(self.appKey(),self.displayname(),url,imageUrl,function(data){

                    if (data.error_code != null)
                    {
                        self._shareApp(sessionId, parameters, userData, callback);
                    }
                    else
                    {
                        //调用成功后不回调，等待客户端回调时再触发
                        //记录分享内容
                        var shareParams = {"platform" : self.type(), 'url' :url ,'images': images};
                        FacebookShareContentSet[sessionId] = {"content" : shareParams, "user_data" : userData};
                    }
                });
            // });
        }
        else
        {
            error_message = null;
                                  
            if(this._currentLanguage === "zh-Hans")
            {
                 error_message = "平台[" + self.name() + "]需要依靠FacebookConnector.framework进行分享，请先导入ShareSDKConnector.framework后再试!";
            }
            else
            {
                 error_message = "Platform [" + self.name() + "] depends on FacebookConnector.framework，please import FacebookConnector.framework then try again!";
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

Facebook.prototype._shareApp = function(sessionId, parameters, userData, callback)
{
    var self = this;
    var error_message;
    var error;
    var url = $mob.shareSDK.getShareParam(self.type(), parameters, "url");
    var imageUrl = null;
    var images = $mob.shareSDK.getShareParam(self.type(), parameters, "images");
    if (Object.prototype.toString.apply(images) === '[object Array]')
    {
        imageUrl = images[0];
    }

    if (imageUrl != null)
    {
        if (/^(file\:\/)?\//.test(imageUrl)) 
        {
            //如果为本地图片,那么图片无效,直接传空
            imageUrl = null;
        }
    }

    if (imageUrl == null || url == null) 
    {
        error_message = null;
                                  
        if(this._currentLanguage === "zh-Hans")
        {
            error_message = "平台[" + self.name() + "]缺少必要分享参数";
        }
        else
        {
            error_message = "Platform [" + self.name() + "] Lack of necessary shared parameters";
        }
                                  
        error = {
                 "error_code" : $mob.shareSDK.errorCode.APIRequestFail,
                 "error_message" : error_message
                };

        if (callback != null)
        {
            callback ($mob.shareSDK.responseState.Fail, error, null, userData);
        }

        return;
    }

    $mob.ext.isPluginRegisted("com.mob.sharesdk.connector.facebook", function (data){

        if (data.result) 
        {

            $mob.ext.ssdk_facebookShareApp(self.appKey(),self.displayname(),url,imageUrl,function(data){

                var state = data.state;
                var resultData = null;
                var raw_data = {};

                switch(state)
                {                                      
                    case $mob.shareSDK.responseState.Success:
                    {
                        //转换数据
                        resultData = {};

                        if (imageUrl != null)
                        {
                            var images = [];
                            images.push(imageUrl);
                            resultData["images"] = images;
                        }

                        if (url != null)
                        {
                            var urls = [];
                            urls.push(url);
                            resultData["urls"] = urls;
                        }

                        break;
                    }

                    case $mob.shareSDK.responseState.Fail:
                    {
                        resultData = 
                        {
                            "error_code" : data["error_code"],
                            "error_message" : data["error_message"]
                        };
                        break;
                    }

                    case $mob.shareSDK.responseState.Cancel:
                    {
                        var resUserData = data["user_data"];
                        if (resUserData != null)
                        {
                            for (var key in resUserData)
                            {
                                if(resUserData.hasOwnProperty(key)) 
                                {
                                         userData [key] = resUserData [key];
                                }
                            }
                        }
                        break;
                    }
                }
                
                if (callback != null)
                {
                    callback (state, resultData, null, null);
                }

            });
        }
        else
        {
            error_message = null;
                                  
            if(this._currentLanguage === "zh-Hans")
            {
                 error_message = "平台[" + self.name() + "]需要依靠FacebookConnector.framework进行分享，请先导入ShareSDKConnector.framework后再试!";
            }
            else
            {
                 error_message = "Platform [" + self.name() + "] depends on FacebookConnector.framework，please import FacebookConnector.framework then try again!";
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
 * 分享内容 web
 * @param sessionId         会话ID
 * @param type              类型
 * @param parameters        分享参数
 * @param userData          统计标识数据
 * @param callback          方法回调
 */
Facebook.prototype._shareWithWebFaceBook = function (sessionId, type, parameters, userData, callback)
{
    var self = this;
    switch (type)
    {
        case $mob.shareSDK.contentType.Text:
        {   
            self._shareText(sessionId,parameters,userData,callback);
            break;
        }
        case $mob.shareSDK.contentType.Image:
        {
            self._shareImage(sessionId,parameters,userData,callback);
            break;
        }
        case $mob.shareSDK.contentType.Video:
        {
            self._clientShareVideo(sessionId,parameters,userData,callback);
            break;
        }
        case $mob.shareSDK.contentType.WebPage:
        {
            self._shareWebPage(sessionId,parameters,userData,callback);
            break;
        }
        case $mob.shareSDK.contentType.App:
        {
            self._shareApp(sessionId,parameters,userData,callback);
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
 * 创建用户信息
 * @param rawData       原始用户数据
 * @returns {null}      用户数据
 */
Facebook.prototype.createUserByRawData = function (rawData)
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
Facebook.prototype._convertUrl = function (contents, callback)
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
Facebook.prototype._getImagePath = function (url, callback)
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
 * 检测应用是否有效
 * @returns {boolean}   true 有效 false 无效
 * @private
 */
Facebook.prototype._isAvailable = function ()
{
    if (this.appKey() != null)
    {
        return true;
    }

    $mob.native.log("[ShareSDK-WARNING] [" + this.name() + "]应用信息有误，不能进行相关操作。请检查本地代码中和服务端的[" + this.name() + "]平台应用配置是否有误! " +
        "\n配置:" + $mob.utils.objectToJsonString(this._appInfo));

    return false;
};

/**
 * 更新回调链接
 * @private
 */
Facebook.prototype._updateCallbackURLSchemes = function ()
{
    //先删除之前的回调地址
    this._ssoUrlScheme = null;

    var appKey = this.appKey();
    if (appKey != null)
    {
        this._ssoUrlScheme = "fb" + appKey;
    }
};

/**
 * 检测应用信息中的授权信息
 * @param appInfo   应用信息
 * @private
 */
Facebook.prototype._checkAuthScopes = function (appInfo)
{
    return appInfo [FacebookAppInfoKeys.Scopes];
};

/**
 * 检测应用信息有效性
 * @param appInfo   应用信息
 * @private
 */
Facebook.prototype._checkAppInfoAvailable = function (appInfo)
{
    //过滤
    var appKey = $mob.utils.trim(appInfo [FacebookAppInfoKeys.AppKey]);
    var appSecret = $mob.utils.trim(appInfo [FacebookAppInfoKeys.AppSecret]);

    if (appKey != null)
    {
        appInfo [FacebookAppInfoKeys.AppKey] = appKey;
    }
    else
    {
        appInfo [FacebookAppInfoKeys.AppKey] = this.appKey();
    }

    if (appSecret != null)
    {
        appInfo [FacebookAppInfoKeys.AppSecret] = appSecret;
    }
    else
    {
        appInfo [FacebookAppInfoKeys.AppSecret] = this.appSecret();
    }

    return appInfo;
};

/**
 * 网页授权
 * @param sessionId     会话标识
 * @param settings      授权设置
 * @private
 */
Facebook.prototype._webAuthorize = function (sessionId, settings)
{
    var authUrl = "https://m.facebook.com/dialog/oauth?client_id=" + this.appKey() + "&redirect_uri=" + FacebookRedirectUri + "&type=user_agent&display=touch";
    if (this._authScopes != null)
    {
        authUrl += "&scope=" + $mob.utils.urlEncode(this._authScopes);
    }
    else if (settings != null && settings ["scopes"] != null && Object.prototype.toString.apply(settings ["scopes"]) === '[object Array]')
    {
        authUrl += "&scope=" + $mob.utils.urlEncode(settings ["scopes"].join(","));
    }
    //打开授权
    $mob.native.ssdk_openAuthUrl(sessionId, authUrl, FacebookRedirectUri);

};

/**
 * SSO授权
 * @param sessionId     会话标识
 * @param urlScheme     回调URL Scheme
 * @param settings      授权设置
 * @private
 */
Facebook.prototype._ssoAuthorize = function (sessionId, urlScheme, settings)
{
    var authType = this.authType();
    var self = this;

    var url = "fbauth2://authorize?client_id=" + this.appKey() + "&redirect_uri=" + FacebookRedirectUri + "&type=user_agent&display=touch";
    if (this._authScopes != null)
    {
        url += "&scope=" + $mob.utils.urlEncode(this._authScopes);
    }
    else if (settings != null && settings ["scopes"] != null && Object.prototype.toString.apply(settings ["scopes"]) === '[object Array]')
    {
        url += "&scope=" + $mob.utils.urlEncode(settings ["scopes"].join(","));
    }
    $mob.ext.canOpenURL(url, function (data) {
        if (data.result)
        {
            $mob.native.openURL(url);
        }
        else
        {
            if (authType === "both")
            {
                //进行网页授权
                self._webAuthorize(sessionId, settings);
            }
            else
            {

                var error_message = null;
 
                if(this._currentLanguage === "zh-Hans")
                {
                    error_message = "分享平台［" + self.name() + "］尚未安装客户端，不支持[" + authType + "]授权方式!";
                }
                else
                {
                    error_message = "Platform［" + self.name() + "］not yet install client，authType : [" + authType + "]is unsupported!";
                }

                var error = {
                    "error_code" : $mob.shareSDK.errorCode.NotYetInstallClient,
                    "error_message" : error_message
                };
                $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Fail, error);
            }
        }

    });
};

/**
 * 处理分享回调
 * @param sessionId     会话ID
 * @param callbackUrl   回调URL
 * @param sourceApplication     原始应用名称
 * @param annotation            附加数据
 */
Facebook.prototype.handleShareCallback = function (sessionId, callbackUrl, sourceApplication, annotation)
{
    var self = this;
    if (callbackUrl.indexOf('fb'+this.appKey() + "://") === 0 && callbackUrl.indexOf('authorize') === -1)
    {

        $mob.ext.isPluginRegisted("com.mob.sharesdk.connector.facebook", function (data) {

            if(data.result)
            {
                $mob.ext.ssdk_facebookHandleShareCalback(self.appKey(), callbackUrl, function (data) {

                    self._getCurrentUser(function (user) {
                     //从分享内容集合中取出分享内容
                     var shareParams = FacebookShareContentSet [sessionId];
                        var content = {};
                        var userData = null;
                        if (shareParams != null)
                        {
                            content = shareParams ["content"];
                            userData = shareParams ["user_data"];
                        }
                        switch (data.state)
                        {
                            case $mob.shareSDK.responseState.Success:
                            {
                                //转换数据
                                var resultData = {};
                                resultData["raw_data"] = content;
                                if (content["text"] != null)
                                {
                                    resultData["text"] = content["text"];
                                }
                                if (content["title"] != null)
                                {
                                    resultData["title"] = content["title"];
                                }
                                var urls = [];
                                if (content["url"] != null)
                                {
                                    urls.push(content["url"]);
                                }
                                if (content["video"] != null)
                                {
                                    urls.push(content["video"]);
                                }
                                resultData["urls"] = urls;
                                if (content["thumb_image"] != null)
                                {
                                    resultData["images"] = content["thumb_image"];
                                }
                                else if (content ["images"] != null)
                                {
                                    resultData["images"] = content["images"];
                                }
                                $mob.native.ssdk_shareStateChanged(sessionId, $mob.shareSDK.responseState.Success, resultData, user, userData);
                                break;
                            }
                            case $mob.shareSDK.responseState.Fail:
                                var error_message_text = '';
                                if(data.error_message != null)
                                {
                                    error_message_text = data.error_message;
                                }
                                else if(data.error_description != null)
                                {
                                    error_message_text = data.error_description;
                                }
                                //失败
                                var error = {
                                    "error_code" : $mob.shareSDK.errorCode.APIRequestFail,
                                    "user_data" :  {"error_code" : data.error_code , "error_message" : error_message_text}
                                };
                                $mob.native.ssdk_shareStateChanged(sessionId, $mob.shareSDK.responseState.Fail, error, user, userData);
                                break;
                            default :
                                //取消

                                $mob.native.ssdk_shareStateChanged(sessionId, $mob.shareSDK.responseState.Cancel, null, user, userData);
                                break;
                        }

                        //移除分享参数集合中的数据
                        delete FacebookShareContentSet[sessionId];

                    });
                });
            }
        });

        return true;
    }
    return false;
};

/**
 * 授权成功
 * @param sessionId             会话ID
 * @param credentialRawData     授权凭证原始数据
 * @private
 */
Facebook.prototype._succeedAuthorize = function (sessionId, credentialRawData)
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
        "platform_type" : $mob.shareSDK.platformType.Facebook,
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
 * 用户是否有效
 * @param user      用户信息
 * @returns {boolean}   如果授权凭证过期或者不存在则返回false，否则返回true
 * @private
 */
Facebook.prototype._isUserAvaliable = function (user)
{
    return user.credential != null && user.credential.token != null && user.credential.expired > new Date().getTime();
};

/**
 * 设置当前用户信息
 * @param user      用户信息
 * @param callback  回调方法
 * @private
 */
Facebook.prototype._setCurrentUser = function (user, callback)
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
Facebook.prototype._getCurrentUser = function (callback)
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
Facebook.prototype._updateUserInfo = function (user, rawData)
{
    var date = null;
    var list = null;
    var item = null;
    var i = null;

    if (user != null && rawData != null)
    {
        user["raw_data"] = rawData;
        user["uid"] = rawData ["id"];
        user["nickname"] = rawData["name"];

        var icon = rawData["picture"];
        var typeStr = Object.prototype.toString.apply(icon);
        if (typeStr === '[object String]')
        {
            user["icon"] = icon;
        }
        else if (typeStr === '[object Object]' && icon["data"] != null)
        {
            user["icon"] = icon["data"]["url"];
        }

        //性别
        var gender = 2;
        if (rawData["gender"] === "male")
        {
            gender = 0;
        }
        else if (rawData["gender"] === "female")
        {
            gender = 1;
        }
        user["gender"] = gender;

        //个人空间地址
        user["url"] = rawData["link"];
        user["about_me"] = rawData["bio"];
        if(rawData["about"] != null)
        {
            user["about_me"] = rawData["about"];
        }
        user["verify_type"] = rawData["verified"] ? 1 : 0;

        //生日
        if (rawData["birthday"] != null)
        {
            date = new Date(rawData["birthday"]);
            user["birthday"] = date.getTime() / 1000;
        }

        //教育
        var edus = rawData["education"];
        if (edus != null)
        {
            list = [];
            for (i = 0; i < edus.length; i++)
            {
                item = {};
                var edu = edus[i];

                var school = edu["school"];
                if (school != null && school["name"] != null)
                {
                    item["school"] = school["name"];
                }

                var year = edu["year"];
                if (year != null && year["name"] != null)
                {
                    item["year"] = year["name"];
                }

                if (edu["type"] === "High School")
                {
                    item["school_type"] = "3";
                }
                else if (edu["type"] === "College")
                {
                    item["school_type"] = "4";
                }
                else
                {
                    item["school_type"] = "5";
                }

                list.push(item);
            }

            user["educations"] = list;
        }

        //工作
        var works = rawData["work"];
        if (works != null)
        {
            list = [];
            for (i = 0; i < works.length; i++)
            {
                item = {};
                var work = works[i];

                var employer = work["employer"];
                if (employer != null && employer["name"] != null)
                {
                    item["company"] = employer["name"];
                }

                var position = work["position"];
                if (position != null && position["name"] != null)
                {
                    item["position"] = position["name"];
                }

                var startDate = work["start_date"];
                if (startDate != null)
                {
                    date = new Date(startDate);
                    item["start_date"] = date.getFullYear() * 100 + date.getMonth() + 1;
                }
                else
                {
                    item["start_date"] = 0;
                }

                var endDate = work["end_date"];
                if (endDate != null)
                {
                    date = new Date(startDate);
                    item["end_date"] = date.getFullYear() * 100 + date.getMonth() + 1;
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
 * 检测是否配置URL Scheme
 * @param callback 方法回调
 * @private
 */
Facebook.prototype._checkUrlScheme = function (callback)
{
    var self = this;
    $mob.ext.getAppConfig(function (data){

        var urlScheme = null;
        var hasReady = false;

        var callbackScheme = self._ssoUrlScheme;

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
            $mob.native.log("[ShareSDK-WARNING] 尚未配置[" + self.name() + "]URL Scheme:" + self._ssoUrlScheme);
        }

        if (callback != null)
        {
            callback (hasReady, urlScheme);
        }

    });
};

/*
* 上传完成后的通知
* @param sessionId         会话标识
* @param data              返回数据
*/
Facebook.prototype.uploadFinishCallback = function (sessionId, data)
{
    var self = this;
    self._getCurrentUser(function (user) {
        var userData = null;
        var content = null;
        var shareParams = FacebookShareContentSet[sessionId];
        if(shareParams != null)
        {
            content = shareParams ["content"];
            userData = shareParams ["user_data"];
        }
        if(data.error_code != null)
        {
            if(data.error_code === $mob.shareSDK.responseState.Cancel)
            {
                $mob.native.ssdk_shareStateChanged(sessionId, $mob.shareSDK.responseState.Cancel, null, user, userData);
            }
            else
            {
                //失败
                var error = {
                    "error_code" : $mob.shareSDK.errorCode.APIRequestFail,
                    "user_data" :  {"error_code" : data.error_code , "error_message" : data.error_message}
                };
                $mob.native.ssdk_shareStateChanged(sessionId, $mob.shareSDK.responseState.Fail, error, user, userData);
            }
        }
        else
        {
            var resultData = {};
            resultData["raw_data"] = content;
            resultData["video"] = content.video;
            $mob.native.ssdk_shareStateChanged(sessionId, $mob.shareSDK.responseState.Success, resultData, user, userData);
        }
        delete FacebookShareContentSet[sessionId];
    });
};

/**
 * 根据分享参数返回分享类型
 * @param parameters            分享参数
 * @private
 */
Facebook.prototype._getShareType = function (parameters)
{
    var type = $mob.shareSDK.contentType.Text;
    var images = $mob.shareSDK.getShareParam(this.type(), parameters, "images");
    var url = $mob.shareSDK.getShareParam(this.type(), parameters, "url");
    var title = $mob.shareSDK.getShareParam(this.type(), parameters, "title");
    var video = $mob.shareSDK.getShareParam(this.type(), parameters, "video_asset_url");
    if (video != null)
    {
        type = $mob.shareSDK.contentType.Video;
    }
    if (title != null && url != null)
    {
        type = $mob.shareSDK.contentType.WebPage;
    }
    else if (Object.prototype.toString.apply(images) === '[object Array]')
    {
        type = $mob.shareSDK.contentType.Image;
    }

    return type;
};


//注册平台
$mob.shareSDK.registerPlatformClass($mob.shareSDK.platformType.Facebook, Facebook);
