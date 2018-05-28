/**
 * Created with JetBrains WebStorm.
 * User: fenghj
 * Date: 15/8/4
 * Time: 下午8:02
 * To change this template use File | Settings | File Templates.
 */

var $pluginID = "com.mob.sharesdk.Renren";

/**
 * 人人回调地址
 * @type {string}
 */
var RenRenRedirectUri = "http://graph.renren.com/oauth/login_success.html";

/**
 * 人人网应用信息键名定义
 * @type {{AppID: string, AppKey: string, SecretKey: string, AuthType: string, ConvertUrl: string}}
 */
var RenRenAppInfoKeys = {
    "AppID"         : "app_id",
    "AppKey"        : "app_key",
    "SecretKey"     : "secret_key",
    "AuthType"      : "auth_type",
    "ConvertUrl"    : "covert_url",
    "Scopes"        : "auth_scopes"
};

/**
 * 人人网
 * @param type  平台类型
 * @constructor
 */
function RenRen (type)
{
    this._type = type;
    this._appInfo = {};
    this._authScopes = null;
    //设置当前语言环境
    this._currentLanguage = $mob.shareSDK.preferredLanguageLocalize();

    //当前授权用户
    this._currentUser = null;
    this._authUrlScheme = null;
}

/**
 * 获取平台类型
 * @returns {*} 平台类型
 */
RenRen.prototype.type = function ()
{
    return this._type;
};

/**
 * 授权状态改变
 * @param sessionId         会话标识
 * @param data              返回数据
 * @private
 */
RenRen.prototype.authStateChanged = function (sessionId, data)
{
    $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Cancel, null);
};

/**
 * 获取平台名称
 * @returns {string}    平台名称
 */
RenRen.prototype.name = function ()
{
    if(this._currentLanguage === "zh-Hans")
    {
        return "人人网";
    }
    else
    {
        return "Renren";
    }
};

/**
 * 获取应用标识
 * @returns {*} 应用标识
 */
RenRen.prototype.appId = function ()
{
    if (this._appInfo[RenRenAppInfoKeys.AppID] !== undefined) 
    {
        return this._appInfo[RenRenAppInfoKeys.AppID];
    }

    return null;
};

/**
 * 获取应用Key
 * @returns {*} 应用密钥
 */
RenRen.prototype.appKey = function ()
{
    if (this._appInfo[RenRenAppInfoKeys.AppKey] !== undefined) 
    {
        return this._appInfo[RenRenAppInfoKeys.AppKey];
    }

    return null;
};

/**
 * 获取应用密钥
 * @returns {*} 回调地址
 */
RenRen.prototype.secretKey = function ()
{
    if (this._appInfo[RenRenAppInfoKeys.SecretKey] !== undefined) 
    {
        return this._appInfo[RenRenAppInfoKeys.SecretKey];
    }

    return null;
};

/**
 * 获取授权方式
 *
 * @return  web 网页授权方式，sso 单点登录授权方式，both 两者共同使用，优先使用SSO
 */
RenRen.prototype.authType = function ()
{
    if (this._appInfo[RenRenAppInfoKeys.AuthType] !== undefined) 
    {
        return this._appInfo[RenRenAppInfoKeys.AuthType];
    }

    return $mob.shareSDK.authType();
};

/**
 * 获取缓存域名
 * @returns {string}    域名
 */
RenRen.prototype.cacheDomain = function ()
{
    return "SSDK-Platform-" + $mob.shareSDK.platformType.Renren + "-" + this.appId();
};

/**
 * 获取是否转换短链
 *
 * @return  true 转换， false 不转换
 */
RenRen.prototype.convertUrlEnabled = function ()
{
    if (this._appInfo[RenRenAppInfoKeys.ConvertUrl] !== undefined) 
    {
        return this._appInfo[RenRenAppInfoKeys.ConvertUrl];
    }

    return $mob.shareSDK.convertUrlEnabled();
};

/**
 * 设置/获取应用信息
 * @param value 应用信息
 * @returns {*}
 */
RenRen.prototype.setAppInfo = function (value)
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
        this._setupApp(this.appId(), this.appKey(), this.secretKey());
    }
};

/**
 * 保存配置信息
 */
RenRen.prototype.saveConfig = function ()
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
RenRen.prototype.isSupportAuth = function ()
{
    return true;
};

/**
 * 用户授权
 * @param sessionId     授权会话标识
 * @param settings      授权设置
 */
RenRen.prototype.authorize = function (sessionId, settings)
{
    var error = null;
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
                "publish_feed",
                "status_update",
                "photo_upload",
                "read_user_photo",
                "publish_share"
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
                    self._isClientInstall(function (result) {

                        if (result)
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
                                             
                                    if(this._currentLanguage === "zh-Hans")
                                    {
                                        error_message = "分享平台［" + self.name() + "］尚未配置URL Scheme:" + self._authUrlScheme + "，无法进行授权!";
                                    }
                                    else
                                    {
                                        error_message = "Platform［" + self.name() + "］did not set URL Scheme:" +  self._authUrlScheme + ",unable to authorize by SSO!";
                                    }

                                    var error = {
                                        "error_code" : $mob.shareSDK.errorCode.UnsetURLScheme,
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
                            var error_message = null;
 
                            if(this._currentLanguage === "zh-Hans")
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
                    var error_message = null;
 
                    if(this._currentLanguage === "zh-Hans")
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
            error_message = "Platform［" + this.name() + "］Invalid configuration!";
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
RenRen.prototype.handleAuthCallback = function (sessionId, callbackUrl)
{
    var error = null;
    var error_message;
    var self = this;
    var urlInfo = $mob.utils.parseUrl(callbackUrl);
    if (urlInfo != null && urlInfo.fragment != null)
    {
        var params = $mob.utils.parseUrlParameters(urlInfo.fragment);
        if (params != null)
        {
            //获取用户ID
            var header = {
                "Authorization" : "Bearer " + $mob.utils.urlDecode(params["access_token"])
            };

            $mob.ext.ssdk_callHTTPApi($mob.shareSDK.platformType.Renren, null, "https://api.renren.com/v2/user/login/get", "GET", null, header, function (data) {

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
                            params["uid"] = response["response"]["id"];
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
 * 处理SSO授权回调
 * @param sessionId     会话ID
 * @param callbackUrl   回调URL
 * @param sourceApplication     原始应用名称
 * @param annotation            附加数据
 */
RenRen.prototype.handleSSOCallback = function (sessionId, callbackUrl, sourceApplication, annotation)
{
    var self = this;
    $mob.ext.getAppConfig(function (data){

        //获取BundleID
        self._authUrlScheme = "rm" + self.appId() + data.CFBundleIdentifier;

        if (callbackUrl.indexOf(self._authUrlScheme + "://") === 0)
        {
            if (callbackUrl === self._authUrlScheme + "://cancel")
            {
                //取消授权
                $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Cancel, null);
                return true;
            }

            $mob.ext.isPluginRegisted("com.mob.sharesdk.connector.renren", function (data) {

                if (data.result)
                {
                    //处理回调
                    $mob.ext.ssdk_renrenHandleSSOCallback(self.appId(), self.appKey(), self.secretKey(),  callbackUrl, function (data) {

                        switch (data.state)
                        {
                            case $mob.shareSDK.responseState.Success:
                            {
                                //成功
                                self._succeedAuthorize(sessionId, data.result);
                                break;
                            }
                            case $mob.shareSDK.responseState.Fail:
                            {
                                //授权失败
                                var error = {
                                    "error_code" : $mob.shareSDK.errorCode.APIRequestFail,
                                    "user_data" : data.result
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
                    if (callbackUrl.indexOf("://success") !== 0)
                    {
                        var parseUrl = {};

                        if (callbackUrl.indexOf("?") !== -1)
                        {
                            var urlObj = callbackUrl.split("?");
                            var str = urlObj[1];
                            var strs = str.split("&");
                            for(var i = 0; i < strs.length; i ++) {
                                parseUrl[strs[i].split("=")[0]] = unescape(strs[i].split("=")[1]);
                            }
                        }

                        var accessToken = parseUrl["access_token"];
                        var refreshToken = parseUrl["refresh_token"];
                        var accessScope = parseUrl["scope"];

                        //把所有的"+"替换成" "
                        accessScope = accessScope.replace(/\+/g," ");

                        var expires_in = parseUrl["expires_in"];
                        var  uid = parseUrl["app_id"];

                        var sourceData = {
                            "access_token":accessToken?accessToken:"",
                            "refresh_token":refreshToken?refreshToken:"",
                            "scope" : accessScope ? accessScope : "",
                            "expires_in" : expires_in?expires_in:"",
                            "uid":uid?uid:""
                        };

                        //$mob.native.log("access_token " + accessToken
                        //    + " refresh_token " + refreshToken
                        //    + " scope " + accessScope
                        //    + " expires_in "+ expires_in
                        //    + " uid "+uid);

                        var resultData = {"state":$mob.shareSDK.responseState.Success,"result":sourceData};
                        //成功
                        self._succeedAuthorize(sessionId, resultData.result);
                    }
                    else if(callbackUrl.indexOf("://cancel") === 0)
                    {
                        //取消授权
                        $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Cancel, null);
                    }
                    else
                    {
                        //取消授权
                        $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Fail, null);
                    }
                }
            });

            return true;
        }

        return false;
    });
};

/**
 * 取消授权
 */
RenRen.prototype.cancelAuthorize = function ()
{
    this._setCurrentUser(null, null);
};

/**
 * 添加好友
 * @param sessionId     会话标识
 * @param user          用户信息
 * @param callback      方法回调，回调方法声明如下:function (stat, data);
 */
RenRen.prototype.addFriend = function (sessionId, user, callback)
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
RenRen.prototype.getFriends = function (cursor, size, callback)
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
RenRen.prototype.share = function (sessionId, parameters, callback)
{
    var text = null;
    var url = null;
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

    var params = null;
    switch (type)
    {
        case $mob.shareSDK.contentType.Image:
        {
            var images = $mob.shareSDK.getShareParam(this.type(), parameters, "images");
            if (Object.prototype.toString.apply(images) === '[object Array]')
            {
                image = images [0];
            }

            if (image != null)
            {
                var albumId = $mob.shareSDK.getShareParam(this.type(), parameters, "album_id");
                text = $mob.shareSDK.getShareParam(this.type(), parameters, "text");
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
                        "file" : "@file(" + $mob.utils.objectToJsonString(file) + ")",
                        "description" : text
                    };

                    if (albumId != null)
                    {
                        params["albumId"] = albumId;
                    }

                    self._getCurrentUser(function (user) {

                        self._convertUrl([text], function(data) {

                            params["description"] = data.result[0];
                            self.callApi("https://api.renren.com/v2/photo/upload", "POST", params, null, function (state, data) {

                                var resultData = data;
                                if (state === $mob.shareSDK.responseState.Success)
                                {
                                    //转换数据
                                    if (data != null && data["response"] != null)
                                    {
                                        resultData = {};
                                        resultData["raw_data"] = data["response"];
                                        resultData["cid"] = data["response"]["id"];
                                        resultData["text"] = data["response"]["description"];

                                        var images = data["response"]["images"];
                                        if (images != null)
                                        {
                                            for (var i = 0; i < images.length; i++)
                                            {
                                                var item = images[i];
                                                if (item["size"] === "LARGE")
                                                {
                                                    resultData["images"] = [item["url"]];
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
        {
            url = $mob.shareSDK.getShareParam(this.type(), parameters, "url");

            if (url != null) {
                text = $mob.shareSDK.getShareParam(this.type(), parameters, "text");
                params = {
                    "comment": text,
                    "url": url
                };

                this._getCurrentUser(function (user) {

                    self._convertUrl([text, url], function (data) {

                        params["comment"] = data.result[0];
                        params["url"] = data.result[1];

                        self.callApi("https://api.renren.com/v2/share/url/put", "POST", params, null, function (state, data) {

                            var resultData = data;
                            if (state === $mob.shareSDK.responseState.Success) {
                                //转换数据
                                if (data != null && data["response"] != null) {
                                    resultData = {};
                                    resultData["raw_data"] = data["response"];
                                    resultData["cid"] = data["response"]["id"];
                                    resultData["text"] = text;
                                    resultData["urls"] = [data["response"]["url"]];
                                }
                            }

                            if (callback != null) {
                                callback(state, resultData, user, userData);
                            }

                        });
                    });
                });
            }
            else {
                error_message = null;

                if (this._currentLanguage === "zh-Hans") {
                    error_message = "分享参数url不能为空!";
                }
                else {
                    error_message = "share param url can not be nil!";
                }

                error = {
                    "error_code": $mob.shareSDK.errorCode.APIRequestFail,
                    "error_message": error_message
                };

                if (callback != null) {
                    callback($mob.shareSDK.responseState.Fail, error, null, userData);
                }
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
RenRen.prototype.getUserInfo = function (query, callback)
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
        }
        else if (user != null && user.credential != null && user.credential.uid != null)
        {
            //设置当前授权用户ID
            params["uid"] = user.credential.uid;
        }

        self.callApi("https://api.renren.com/v2/user/get", "GET", null, null, function (state, data) {

            var resultData = data;
            if (state === $mob.shareSDK.responseState.Success)
            {
                //转换用户数据
                resultData = {
                    "platform_type" : $mob.shareSDK.platformType.Renren
                };
                self._updateUserInfo(resultData, data["response"]);

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
RenRen.prototype.callApi = function (url, method, params, headers, callback)
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
                headers ["Authorization"] = "Bearer " + user.credential.token;
            }

            $mob.ext.ssdk_callHTTPApi($mob.shareSDK.platformType.Renren, null, url, method, params, headers, function (data) {

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
                            if (response["error"] == null)
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
                                if (response["error"]["code"] === "invalid_authorization.INVALID-TOKEN")
                                {
                                    code = $mob.shareSDK.errorCode.UserUnauth;
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
RenRen.prototype.createUserByRawData = function (rawData)
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
RenRen.prototype._getImagePath = function (url, callback)
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
RenRen.prototype._convertUrl = function (contents, callback)
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
RenRen.prototype._updateUserInfo = function (user, rawData)
{
    var res;
    if (user != null && rawData != null)
    {
        user["raw_data"] = rawData;
        user["uid"] = rawData ["id"];
        user["nickname"] = rawData["name"];

        var i = 0;
        var item = null;
        var avatar = null;
        var exp = null;
        var avatarList = rawData["avatar"];
        if (avatarList != null)
        {
            for (i = 0; i < avatarList.length; i++)
            {
                item = avatarList[i];
                if (item["size"] === "LARGE")
                {
                    avatar = item;
                    break;
                }
                else if ((avatar == null || avatar["size"] !== "LARGE") && item["size"] === "MAIN")
                {
                    avatar = item;
                }
                else if ((avatar == null || (avatar["size"] !== "LARGE" && avatar["size"] !== "MAIN")) && item["size"] === "HEAD")
                {
                    avatar = item;
                }
                else
                {
                    avatar = item;
                }
            }
        }
        if (avatar != null)
        {
            user["icon"] = avatar["url"];
        }

        if (rawData["basicInformation"] != null)
        {
            //性别
            var gender = 2;
            if (rawData["basicInformation"]["sex"] === "MALE")
            {
                gender = 0;
            }
            else if (rawData["basicInformation"]["sex"] === "FEMALE")
            {
                gender = 1;
            }
            user["gender"] = gender;

            //生日
            var birthday = rawData["basicInformation"]["birthday"];
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
        else
        {
            user["gender"] = 2;
        }

        user["url"] = "http://www.renren.com/" + rawData["id"];
        user["verify_type"] = rawData["star"];

        var list = null;
        var edus = rawData["education"];
        if (edus != null)
        {
            //教育信息
            list = [];
            for (i = 0; i < edus.length; i++)
            {
                item = {};
                var edu = edus[i];

                item["school"] = edu["name"];
                item["classes"] = edu["department"];
                item["year"] = parseInt(edu["year"]);

                var degree = 0;
                if (edu["educationBackground"] === "DOCTOR")
                {
                    degree = 7;
                }
                else if (edu["educationBackground"] === "COLLEGE")
                {
                    degree = 5;
                }
                else if (edu["educationBackground"] === "PRIMARY")
                {
                    degree = 1;
                }
                else if (edu["educationBackground"] === "MASTER")
                {
                    degree = 6;
                }
                else if (edu["educationBackground"] === "HIGHSCHOOL")
                {
                    degree = 4;
                }
                else if (edu["educationBackground"] === "TECHNICAL")
                {
                    degree = 3;
                }
                else if (edu["educationBackground"] === "JUNIOR")
                {
                    degree = 2;
                }
                item["background"] = degree;

                list.push(item);
            }
            user["educations"] = list;
        }

        var works = rawData["work"];
        if (works != null)
        {
            //工作信息
            list = [];
            for (i = 0; i < works.length; i++)
            {
                item = {};
                var work = works[i];

                item["company"] = work["name"];
                item["industry"] = work["industry"] != null ? work["industry"]["industryCategory"] : null;
                item["position"] = work["job"] != null ? work["job"]["jobCategory"] : null;

                var time = work["time"];
                if (time != null)
                {
                    exp = /^(\d+)-(\d+)$/;
                    if (exp.test(time))
                    {
                        res = exp.exec(time);
                        item["start_date"] = parseInt(res[1]) * 100 + parseInt(res[2]);
                    }
                }

                list.push(item);
            }

            user["works"] = list;
        }
    }
};

/**
 * 获取当前用户信息
 * @param callback  回调方法
 * @private
 */
RenRen.prototype._getCurrentUser = function (callback)
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
RenRen.prototype._succeedAuthorize = function (sessionId, credentialRawData)
{
    var self = this;

    //成功
    var credential = {
        "uid"       : credentialRawData["uid"].toString(),
        "token"     : $mob.utils.urlDecode(credentialRawData["access_token"]),
        "expired"   : (new Date().getTime() +  credentialRawData ["expires_in"] * 1000),
        "raw_data"  : credentialRawData,
        "type"      : $mob.shareSDK.credentialType.OAuth2
    };

    var user = {
        "platform_type" : $mob.shareSDK.platformType.Renren,
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
RenRen.prototype._setCurrentUser = function (user, callback)
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
RenRen.prototype._checkUrlScheme = function (callback)
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
            $mob.native.log("[ShareSDK-WARNING] 尚未配置[" + self.name() + "]URL Scheme:" + warningLog + ", 无法使用SSO授权, 将以Web方式进行授权。");
        }

        if (callback != null)
        {
            callback (hasReady, urlScheme);
        }
    });
};

/**
 * 检测客户端是否安装
 * @param callback  回调
 * @private
 */
RenRen.prototype._isClientInstall = function (callback)
{
    $mob.ext.canOpenURL("renrenapi://", function (data) {

        if (data.result)
        {
            if (callback != null)
            {
                callback (true);
            }
        }
        else
        {
            $mob.ext.canOpenURL("renrenios://", function (data) {

                if (data.result)
                {
                    if (callback != null)
                    {
                        callback (true);
                    }
                }
                else
                {
                    $mob.ext.canOpenURL("renreniphone://", function (data) {

                        if (data.result)
                        {
                            if (callback != null)
                            {
                                callback (true);
                            }
                        }
                        else
                        {
                            $mob.ext.canOpenURL("renren://", function (data) {

                                if (data.result)
                                {
                                    if (callback != null)
                                    {
                                        callback (true);
                                    }
                                }
                                else
                                {
                                    if (callback != null)
                                    {
                                        callback (false);
                                    }
                                }
                            });
                        }
                    });
                }
            });
        }
    });
};

/**
 * 检测应用是否有效
 * @returns {boolean}   true 有效 false 无效
 * @private
 */
RenRen.prototype._isAvailable = function ()
{
    if (this.appId() != null && this.appKey() != null && this.secretKey() != null)
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
RenRen.prototype._webAuthorize = function (sessionId, settings)
{
    var authUrl = "https://graph.renren.com/oauth/v2/wap/authorize?client_id=" + this.appKey() + "&response_type=token&redirect_uri=" + $mob.utils.urlEncode(RenRenRedirectUri) + "&display=mobile";

    if (settings != null && settings ["scopes"] != null && Object.prototype.toString.apply(settings ["scopes"]) === '[object Array]')
    {
        authUrl += "&scope=" + $mob.utils.urlEncode(settings ["scopes"].join(","));
    }
    else if (this._authScopes != null)
    {   
        authUrl += "&scope=" + $mob.utils.urlEncode(this._authScopes);
    }

    //打开授权
    $mob.native.ssdk_openAuthUrl(sessionId, authUrl, RenRenRedirectUri);
};

/**
 * SSO授权
 * @param sessionId     会话标识
 * @param urlScheme     回调URL Scheme
 * @param settings      授权设置
 * @private
 */
RenRen.prototype._ssoAuthorize = function (sessionId, urlScheme, settings)
{
    var self = this;
    var authType = self.authType();

    $mob.ext.ssdk_isConnectedPlatformSDK("RennClient",function(data){

        if(data.result)
        {
            $mob.ext.isPluginRegisted("com.mob.sharesdk.connector.renren", function (data) {

                if (data.result)
                {
                    var scope = null;
                    if (settings != null && settings ["scopes"] != null && Object.prototype.toString.apply(settings ["scopes"]) === '[object Array]')
                    {
                        scope = settings ["scopes"];
                    }
                    else if (self._authScopes != null)
                    {
                        var scopesStr = self._authScopes;
                        scope = scopesStr.split(",");
                    }

                    $mob.ext.ssdk_renrenAuth(self.appId(), self.appKey(), self.secretKey(), scope, function (data) {

                        if (data["error_code"] != null)
                        {
                            if (data["error_code"] === $mob.shareSDK.errorCode.NotYetInstallClient && authType === "both")
                            {
                                //尚未安装客户端，将改为使用Web授权
                                self._webAuthorize(sessionId, settings);
                            }
                            else
                            {
                                //错误
                                $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Fail, data);
                            }
                        }
                    });
                }
                else
                {
                    self._ssoAuthorizeWithoutSDK(self.appId(),settings);
                }
            });
        }
        else
        {
            self._ssoAuthorizeWithoutSDK(self.appId(),settings);
        }
    });
};

RenRen.prototype._ssoAuthorizeWithoutSDK = function (appId, settings)
{
    var self = this;

    $mob.ext.getAppConfig(function (data){

        var bundleID = data.CFBundleIdentifier?data.CFBundleIdentifier:"";
        var url_scheme = "rm" + appId + bundleID;

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

        //构造跳转链接
        var urlstring = "renrenios://authorize?scope=" + scope + 
        "&sdk_version=5.0.0&client_id=" + self.appKey() + 
        "&url_scheme=" + url_scheme + "&api_version=2.0&app_id=" + self.appId() + 
        "&token_type=bearer";

        //$mob.native.log("urlstring -- " + urlstring);
        $mob.ext.canOpenURL(urlstring,function(data){
            if (data.result)
            {
                $mob.native.openURL(urlstring);
            }
        });
    });
};

/**
 * 检测应用信息中的授权信息
 * @param appInfo   应用信息
 * @private
 */
RenRen.prototype._checkAuthScopes = function (appInfo)
{
    return appInfo [RenRenAppInfoKeys.Scopes];
};

/**
 * 检测应用信息有效性
 * @param appInfo   应用信息
 * @private
 */
RenRen.prototype._checkAppInfoAvailable = function (appInfo)
{
    //过滤
    var appId = $mob.utils.trim(appInfo [RenRenAppInfoKeys.AppID]);
    var appKey = $mob.utils.trim(appInfo [RenRenAppInfoKeys.AppKey]);
    var secretKey = $mob.utils.trim(appInfo [RenRenAppInfoKeys.SecretKey]);

    if (appId != null)
    {
        appInfo [RenRenAppInfoKeys.AppID] = appId;
    }
    else
    {
        appInfo [RenRenAppInfoKeys.AppID] = this.appId();    
    }

    if (appKey != null)
    {
        appInfo [RenRenAppInfoKeys.AppKey] = appKey;
    }
    else
    {
        appInfo [RenRenAppInfoKeys.AppKey] = this.appKey();    
    }

    if (secretKey != null)
    {
        appInfo [RenRenAppInfoKeys.SecretKey] = secretKey;
    }
    else
    {
        appInfo [RenRenAppInfoKeys.SecretKey] = this.secretKey();     
    }

    return appInfo;
};

/**
 * 更新回调链接
 * @private
 */
RenRen.prototype._updateCallbackURLSchemes = function ()
{
    var self = this;
    //先删除之前的回调地址
    this._authUrlScheme = null;

    var appId = this.appId();
    if (appId != null)
    {
        $mob.ext.getAppConfig(function (data){

            //获取BundleID
            self._authUrlScheme = "rm" + appId + data.CFBundleIdentifier;
        });

    }
};

/**
 * 初始化应用
 * @param appId     应用标识
 * @param appKey    应用Key
 * @param secretKey 应用密钥
 * @private
 */
RenRen.prototype._setupApp = function (appId, appKey, secretKey)
{
    if (appId != null && appKey != null && secretKey != null)
    {
        $mob.ext.isPluginRegisted("com.mob.sharesdk.connector.renren", function (data) {

            if (data.result)
            {
                //注册微信
//                $mob.native.ssdk_plugin_renren_setup(appId, appKey, secretKey);
            }
        });
    }
};

/**
 * 根据分享参数返回分享类型
 * @param parameters            分享参数
 * @private
 */
RenRen.prototype._getShareType = function (parameters)
{
    var type = $mob.shareSDK.contentType.Text;

    var url = $mob.shareSDK.getShareParam(this.type(), parameters, "url");
    if (url != null)
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

//注册平台
$mob.shareSDK.registerPlatformClass($mob.shareSDK.platformType.Renren, RenRen);
