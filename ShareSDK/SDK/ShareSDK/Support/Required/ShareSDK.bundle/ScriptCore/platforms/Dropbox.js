/**
 * Created with JetBrains WebStorm.
 * User: fenghj
 * Date: 15/11/12
 * Time: 下午12:11
 * To change this template use File | Settings | File Templates.
 */

var $pluginID = "com.mob.sharesdk.Dropbox";

/**
 * Dropbox应用信息标识
 * @type {{AppKey: string, AppSecret: string, OAuthCallback: string, ConvertUrl: string}}
 */
var DropboxAppInfoKeys = {
    "AppKey"            : "app_key",
    "AppSecret"         : "app_secret",
    "OAuthCallback"     : "oauth_callback",
    "ConvertUrl"        : "covert_url"
};

/**
 * Pinterest
 * @param type  平台类型
 * @constructor
 */
function Dropbox (type)
{
    this._type = type;
    this._appInfo = {};

    this._urlScheme = null;
    this._currentUser = null;
    //设置当前语言环境
    this._currentLanguage = $mob.shareSDK.preferredLanguageLocalize();
}

var DropboxShareContentSet = {};

/**
 * 获取平台类型
 * @returns {*} 平台类型
 */
Dropbox.prototype.type = function ()
{
    return this._type;
};

/**
 * 授权状态改变
 * @param sessionId         会话标识
 * @param data              返回数据
 * @private
 */
Dropbox.prototype.authStateChanged = function (sessionId, data)
{
    $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Cancel, null);
};

/**
 * 获取平台名称
 * @returns {string}    平台名称
 */
Dropbox.prototype.name = function ()
{
    return "Dropbox";
};

/**
 * 获取应用标识
 * @returns {*} 应用标识
 */
Dropbox.prototype.appKey = function ()
{
    if (this._appInfo[DropboxAppInfoKeys.AppKey] !== undefined) 
    {
        return this._appInfo[DropboxAppInfoKeys.AppKey];
    }

    return null;
};

/**
 * 获取应用密钥
 * @returns {*} 应用密钥
 */
Dropbox.prototype.appSecret = function ()
{
    if (this._appInfo[DropboxAppInfoKeys.AppSecret] !== undefined) 
    {
        return this._appInfo[DropboxAppInfoKeys.AppSecret];
    }

    return null;
};

/**
 * 获取回调地址
 * @returns {*} 回调地址
 */
Dropbox.prototype.oauthCallback = function ()
{
    if (this._appInfo[DropboxAppInfoKeys.OAuthCallback] !== undefined) 
    {
        return this._appInfo[DropboxAppInfoKeys.OAuthCallback];
    }

    return null;
};

/**
 * 获取缓存域名
 * @returns {string}    域名
 */
Dropbox.prototype.cacheDomain = function ()
{
    return "SSDK-Platform-" + this.type() + "-" + this.appKey();
};

/**
 * 获取授权方式
 *
 * @return  web 网页授权方式，sso 单点登录授权方式，both 两者共同使用，优先使用SSO
 */
Dropbox.prototype.convertUrlEnabled = function ()
{
    if (this._appInfo[DropboxAppInfoKeys.ConvertUrl] !== undefined) 
    {
        return this._appInfo[DropboxAppInfoKeys.ConvertUrl];
    }

    return $mob.shareSDK.convertUrlEnabled();
};

/**
 * 设置/获取应用信息
 * @param value 应用信息
 * @returns {*}
 */
Dropbox.prototype.setAppInfo = function (value)
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
Dropbox.prototype.saveConfig = function ()
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
Dropbox.prototype.isSupportAuth = function ()
{
    return true;
};

/**
 * 用户授权
 * @param sessionId     授权会话标识
 * @param settings      授权设置
 */
Dropbox.prototype.authorize = function (sessionId, settings)
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
Dropbox.prototype.handleAuthCallback = function (sessionId, callbackUrl)
{
    var error = null;
    var error_message;
    var self = this;
    var urlInfo = $mob.utils.parseUrl(callbackUrl);
    if (urlInfo != null && urlInfo.query != null)
    {
        var params = $mob.utils.parseUrlParameters(urlInfo.query);
        if (params != null && params.code != null)
        {
            var tokenParams = {
                "client_id" : this.appKey(),
                "client_secret" : this.appSecret(),
                "grant_type" : "authorization_code",
                "redirect_uri" : this.oauthCallback(),
                "code" : params.code
            };

            //请求AccessToken
            $mob.ext.ssdk_callHTTPApi(this.type(), null, "https://api.dropboxapi.com/oauth2/token", "POST", tokenParams, null, function (data) {

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
 * 获取用户信息
 * @param query         查询信息
 * @param callback      方法回调
 */
Dropbox.prototype.getUserInfo = function (query, callback)
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
        var headers = {"Authorization" : "Bearer "+ user.credential.token};
        self.callApi("https://api.dropboxapi.com/2/users/get_current_account", "POST", null, headers, function (state, data) {

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
Dropbox.prototype.callApi = function (url, method, params, headers, callback)
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
Dropbox.prototype.cancelAuthorize = function ()
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
Dropbox.prototype.addFriend = function (sessionId, user, callback)
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
Dropbox.prototype.getFriends = function (cursor, size, callback)
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
Dropbox.prototype.share = function (sessionId, parameters, callback)
{
    var self = this;
    var error;
    var error_message;
    //获取分享统计标识
    var flags = parameters != null ? parameters ["@flags"] : null;
    var userData = {
        "@flags" : flags
    };
    $mob.ext.isPluginRegisted("com.mob.sharesdk.connector.dropbox", function (data) {
        if(data.result)
        {
            var file = null;
            var attachments = $mob.shareSDK.getShareParam(self.type(), parameters, "attachments");
            if (attachments != null && Object.prototype.toString.apply(attachments) === '[object Array]' && attachments.length > 0)
            {
                file = attachments[0];
            }
            if (file == null)
            {
                var images = $mob.shareSDK.getShareParam(self.type(), parameters, "images");
                if (images != null && Object.prototype.toString.apply(images) === '[object Array]' && images.length > 0)
                {
                    file = images [0];
                }
            }
            if (file != null)
            {
                self._getCurrentUser(function (user){
                    if (user != null && self._isUserAvaliable(user))
                    {
                        $mob.ext.ssdk_upLoadDropboxFile(sessionId ,file , user.credential.token ,function(data){
                        	if(data.error_code != null)
                            {
                                if (callback)
                                {
                                    callback ($mob.shareSDK.responseState.Fail, data , null, userData);
                                }
                            }
                            else
                            {
                                var shareParams = {"platform" : self.type() , 'file' : file };
                    			DropboxShareContentSet[sessionId] = {"content" : shareParams, "user_data" : userData};
                    			$mob.native.ssdk_shareStateChanged(sessionId, $mob.shareSDK.responseState.BeginUPLoad, null, null, null);
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
                
                if(this._currentLanguage === "zh-Hans")
                {
                    error_message = "分享参数image or file 不能为空!";
                }
                else
                {
                    error_message = "share param image or file can not be nil!";
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
                error_message = "平台[" + self.name() + "]需要依靠DropboxConnector.framework进行分享，请先导入DropboxConnector.framework后再试!";
            }
            else
            {
                error_message = "Platform [" + self.name() + "] depends on DropboxConnector.framework，please import DropboxConnector.framework then try again!";
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
 * 用户是否有效
 * @param user      用户信息
 * @returns {boolean}   如果授权凭证过期或者不存在则返回false，否则返回true
 * @private
 */
Dropbox.prototype._isUserAvaliable = function (user)
{
    return user.credential != null && user.credential.uid != null && user.credential.token != null && user.credential.expired > new Date().getTime();
};

/**
 * 创建用户信息
 * @param rawData       原始用户数据
 * @returns {null}      用户数据
 */
Dropbox.prototype.createUserByRawData = function (rawData)
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
Dropbox.prototype._getImagePath = function (url, callback)
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
Dropbox.prototype._updateUserInfo = function (user, rawData)
{
    if (user != null && rawData != null)
    {
        user["raw_data"] = rawData;
        user["uid"] = rawData ["account_id"];
        user["nickname"] = rawData['name']["display_name"];
        user["gender"] = 2;
        user["url"] = rawData["referral_link"];
    }
};

/**
 * 获取当前用户信息
 * @param callback  回调方法
 * @private
 */
Dropbox.prototype._getCurrentUser = function (callback)
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
Dropbox.prototype._succeedAuthorize = function (sessionId, credentialRawData)
{
    var self = this;

    //成功
    var credential = {
        "uid"       : credentialRawData["uid"],
        "token"     : credentialRawData["access_token"],
        "expired"   : (new Date().getTime() +  946080000 * 1000),
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
Dropbox.prototype._setCurrentUser = function (user, callback)
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
Dropbox.prototype._isAvailable = function ()
{
    if (this.appKey() != null && this.appSecret() != null && this.oauthCallback() != null)
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
Dropbox.prototype._webAuthorize = function (sessionId, settings)
{
        var authUrl = "https://www.dropbox.com/oauth2/authorize?client_id=" + this.appKey() + "&response_type=code&redirect_uri=" + $mob.utils.urlEncode(this.oauthCallback()) + "&state=" + new Date().getTime();
        //打开授权
        $mob.native.ssdk_openAuthUrl(sessionId, authUrl, this.oauthCallback());
};

/**
 * 检测应用信息有效性
 * @param appInfo   应用信息
 * @private
 */
Dropbox.prototype._checkAppInfoAvailable = function (appInfo)
{
    var appKey = $mob.utils.trim(appInfo [DropboxAppInfoKeys.AppKey]);
    var appSecret = $mob.utils.trim(appInfo [DropboxAppInfoKeys.AppSecret]);
    var redirectUri = $mob.utils.trim(appInfo [DropboxAppInfoKeys.OAuthCallback]);

    if (appKey != null)
    {
        appInfo [DropboxAppInfoKeys.AppKey] = appKey;
    }
    else
    {
        appInfo [DropboxAppInfoKeys.AppKey] = this.appKey();
    }

    if (appSecret != null)
    {
        appInfo [DropboxAppInfoKeys.AppSecret] = appSecret;
    }
    else
    {
        appInfo [DropboxAppInfoKeys.AppSecret] = this.appSecret();
    }

    if (redirectUri != null)
    {
        appInfo [DropboxAppInfoKeys.OAuthCallback] = redirectUri;
    }
    else
    {
        appInfo [DropboxAppInfoKeys.OAuthCallback] = this.oauthCallback();
    }

    return appInfo;
};

/*
* 上传完成后的通知
* @param sessionId         会话标识
* @param data              返回数据
*/
Dropbox.prototype.uploadFinishCallback = function (sessionId, data)
{
    var self = this;
    self._getCurrentUser(function (user) {
        var userData = null;
        var content = null;
        var shareParams = DropboxShareContentSet[sessionId];
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
            resultData["file"] = content.file;
            resultData["backData"] = data.finishData;
            $mob.native.ssdk_shareStateChanged(sessionId, $mob.shareSDK.responseState.Success, resultData, user, userData);
        }
        delete DropboxShareContentSet[sessionId];
    });
};

//注册平台
$mob.shareSDK.registerPlatformClass($mob.shareSDK.platformType.Dropbox, Dropbox);
