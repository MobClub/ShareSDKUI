/**
 * Created with JetBrains WebStorm.
 * User: fenghj
 * Date: 15/8/18
 * Time: 下午4:34
 * To change this template use File | Settings | File Templates.
 */

var $pluginID = "com.mob.sharesdk.Instagram";

/**
 * Instagram应用信息键名定义
 * @type {{AppKey: string, AppSecret: string, RedirectUri: string}}
 */
var InstagramAppInfoKeys = {
    "ClientId"          : "client_id",
    "ClientSecret"      : "client_secret",
    "RedirectUri"       : "redirect_uri",
    "ConvertUrl"        : "covert_url",
    "Scopes"            : "auth_scopes"
};

/**
 * Instagram
 * @param type  平台类型
 * @constructor
 */
function Instagram (type)
{
    this._type = type;
    this._appInfo = {};
    this._authScopes = null;
    //当前授权用户
    this._currentUser = null;
    //设置当前语言环境
    this._currentLanguage = $mob.shareSDK.preferredLanguageLocalize();
}

/**
 * 获取平台类型
 * @returns {*} 平台类型
 */
Instagram.prototype.type = function ()
{
    return this._type;
};

/**
 * 授权状态改变
 * @param sessionId         会话标识
 * @param data              返回数据
 * @private
 */
Instagram.prototype.authStateChanged = function (sessionId, data)
{
    $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Cancel, null);
};

/**
 * 获取平台名称
 * @returns {string}    平台名称
 */
Instagram.prototype.name = function ()
{
    return "Instagram";
};

/**
 * 获取应用标识
 * @returns {*} 应用标识
 */
Instagram.prototype.clientId = function ()
{
    if (this._appInfo[InstagramAppInfoKeys.ClientId] !== undefined) 
    {
        return this._appInfo[InstagramAppInfoKeys.ClientId];
    }

    return null;
};

/**
 * 获取应用密钥
 * @returns {*} 应用密钥
 */
Instagram.prototype.clientSecret = function ()
{
    if (this._appInfo[InstagramAppInfoKeys.ClientSecret] !== undefined) 
    {
        return this._appInfo[InstagramAppInfoKeys.ClientSecret];
    }

    return null;
};

/**
 * 获取授权方式
 *
 * @return  web 网页授权方式，sso 单点登录授权方式，both 两者共同使用，优先使用SSO
 */
Instagram.prototype.redirectUri = function ()
{
    if (this._appInfo[InstagramAppInfoKeys.RedirectUri] !== undefined) 
    {
        return this._appInfo[InstagramAppInfoKeys.RedirectUri];
    }

    return $mob.shareSDK.authType();
};

/**
 * 获取缓存域名
 * @returns {string}    域名
 */
Instagram.prototype.cacheDomain = function ()
{
    return "SSDK-Platform-" + this.type() + "-" + this.clientId();
};

/**
 * 获取授权方式
 *
 * @return  web 网页授权方式，sso 单点登录授权方式，both 两者共同使用，优先使用SSO
 */
Instagram.prototype.convertUrlEnabled = function ()
{
    if (this._appInfo[InstagramAppInfoKeys.ConvertUrl] !== undefined) 
    {
        return this._appInfo[InstagramAppInfoKeys.ConvertUrl];
    }

    return $mob.shareSDK.convertUrlEnabled();
};

/**
 * 设置/获取应用信息
 * @param value 应用信息
 * @returns {*}
 */
Instagram.prototype.setAppInfo = function (value)
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
Instagram.prototype.saveConfig = function ()
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
 * 获取是否支持授权
 * @returns {boolean} true 支持， false 不支持
 */
Instagram.prototype.isSupportAuth = function ()
{
    return true;
};

/**
 * 用户授权
 * @param sessionId     授权会话标识
 * @param settings      授权设置
 */
Instagram.prototype.authorize = function (sessionId, settings)
{
    var error = null;
    if (this._isAvailable())
    {
        var self = this;

        if (settings == null)
        {
            settings = {};
        }

        if (settings ["scopes"] == null && self._authScopes == null)
        {
            //设置默认权限
            settings ["scopes"] = [
                "basic"
            ];
        }

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
Instagram.prototype.handleAuthCallback = function (sessionId, callbackUrl)
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
                    error_message = "分享平台[" + self.name() + "]请求授权失败!";
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
                //获取AccessToken
                params["client_id"] = this.clientId();
                params["client_secret"] = this.clientSecret();
                params["grant_type"] = "authorization_code";
                params["redirect_uri"] = this.redirectUri();

                $mob.ext.ssdk_callHTTPApi(this.type(), null, "https://api.instagram.com/oauth/access_token", "POST", params, null, function (data) {

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
Instagram.prototype.cancelAuthorize = function ()
{
    this._setCurrentUser(null, null);
    //检测是否有注册插件
    $mob.ext.isPluginRegisted("com.mob.sharesdk.connector.instagram", function (data) {
                              
        if (data.result)
        {
            $mob.native.ssdk_plugin_instagram_cancelAuth();
        }
                              
    });
};

/**
 * 添加好友
 * @param sessionId     会话标识
 * @param user          用户信息
 * @param callback      方法回调，回调方法声明如下:function (stat, data);
 */
Instagram.prototype.addFriend = function (sessionId, user, callback)
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
Instagram.prototype.getFriends = function (cursor, size, callback)
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
Instagram.prototype.share = function (sessionId, parameters, callback)
{
    var image = null;
    var error_message = null;
    var self = this;
    var error = null;

    //获取分享统计标识
    var flags = parameters != null ? parameters ["@flags"] : null;
    var userData = {
        "@flags" : flags
    };

    //检测是否有注册插件
    $mob.ext.isPluginRegisted("com.mob.sharesdk.connector.instagram", function (data) {

        if (data.result)
        {
            //检测是否安装Instagram
            $mob.ext.canOpenURL("instagram://app", function (data) {

                if (data.result)
                {
                    //先判断是否使用客户端分享
                    var type = $mob.shareSDK.getShareParam(self.type(), parameters, "type");
                    if (type == null)
                    {
                        type = $mob.shareSDK.contentType.Auto;
                    }
                    if (type === $mob.shareSDK.contentType.Auto)
                    {
                        type = self._getShareType(parameters);
                    }
                    switch (type)
                    {
                        case $mob.shareSDK.contentType.Image:
                        {
                            var images = $mob.shareSDK.getShareParam(self.type(), parameters, "images");
                            if (Object.prototype.toString.apply(images) === '[object Array]')
                            {
                                image = images [0];
                            }

                            if (image != null)
                            {
                                self._getCurrentUser(function (user) {

                                    var x = $mob.shareSDK.getShareParam(self.type(), parameters, "menu_display_x");
                                    var y = $mob.shareSDK.getShareParam(self.type(), parameters, "menu_display_y");

                                    //判断是否为网络图片并进行下载
                                    self._getImagePath(image, function (imageUrl) {

                                        $mob.ext.ssdk_instagramShare(type, imageUrl, x, y, function (data) {

                                            var resultData = data.result;
                                            if (data.state === $mob.shareSDK.responseState.Success)
                                            {
                                                resultData = {

                                                    "images" : [image]

                                                };
                                            }

                                            if (callback != null)
                                            {
                                                callback (data.state, resultData, user, userData);
                                            }

                                        });

                                    });
                                });
                            }
                            else
                            {
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
                        case $mob.shareSDK.contentType.Video:
                        {
                            var videoURL = $mob.shareSDK.getShareParam(self.type(), parameters, "video_asset_url");
                            if(videoURL == null)
                            {
                                videoURL = $mob.shareSDK.getShareParam(self.type(), parameters, "video");
                            }
                            if (videoURL == null)
                            {
                                videoURL = $mob.shareSDK.getShareParam(self.type(), parameters, "url");
                            }
                            if(videoURL != null)
                            {
                                self._getCurrentUser(function (user) {
                                    $mob.ext.ssdk_instagramShare(type, videoURL, 0, 0, function (data) {
                                        if (data.error_code != null)
                                        {
                                            if (callback != null)
                                            {
                                                callback ($mob.shareSDK.responseState.Fail, data, user, userData);
                                            }
                                        }
                                        else
                                        {
                                            var assetPath = data.asset_path;
                                            $mob.ext.canOpenURL('instagram://library?LocalIdentifier=', function (data) {
                                                if(data.result)
                                                {
                                                    var resultData; 
                                                    if(assetPath != null)
                                                    {
                                                        resultData= {
                                                            "urls" : [videoURL,assetPath]
                                                        };
                                                    }
                                                    else
                                                    {
                                                        resultData= {
                                                            "urls" : [videoURL]
                                                        };
                                                    }
                                                    $mob.native.openURL('instagram://library?LocalIdentifier='+assetPath);
                                                    callback ($mob.shareSDK.responseState.Success, resultData, user, userData);
                                                }
                                                else
                                                {
                                                    if(this._currentLanguage === "zh-Hans")
                                                    {
                                                        error_message = "分享平台［" + self.name() + "］尚未安装客户端，不支持分享!";
                                                    }
                                                    else
                                                    {
                                                        error_message = "Platform［" + self.name() + "］app client is no installed!";
                                                    }


                                                    error = {
                                                        "error_code" : $mob.shareSDK.errorCode.NotYetInstallClient,
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
                                });
                            }
                            else
                            {
                                if(this._currentLanguage === "zh-Hans")
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
                            break;
                        }
                        default :
                        {
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
                    if(this._currentLanguage === "zh-Hans")
                    {
                        error_message = "分享平台［" + self.name() + "］尚未安装客户端，不支持分享!";
                    }
                    else
                    {
                        error_message = "Platform［" + self.name() + "］app client is no installed!";
                    }


                    error = {
                        "error_code" : $mob.shareSDK.errorCode.NotYetInstallClient,
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
            if(this._currentLanguage === "zh-Hans")
            {
                error_message = "平台[" + self.name() + "]需要依靠InstagramConnector.framework进行分享，请先导入InstagramConnector.framework后再试!";
            }
            else
            {
                error_message = "Platform [" + self.name() + "] depends on InstagramConnector.framework，please import InstagramConnector.framework then try again!";
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
 * 获取用户信息
 * @param query         查询信息
 * @param callback      方法回调
 */
Instagram.prototype.getUserInfo = function (query, callback)
{
    var self = this;
    var url = null;
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

    this._getCurrentUser(function (user){

        //获取授权用户个人信息
        url = "https://api.instagram.com/v1/users/";
        if (user != null && user.credential != null)
        {
            url += user.credential.uid;
        }
        self.callApi(url, "GET", null, null, function (state, data) {

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
Instagram.prototype.callApi = function (url, method, params, headers, callback)
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
                        if (response ["meta"] != null && response["meta"]["code"] != null && response["meta"]["code"] === 200)
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
 * 创建用户信息
 * @param rawData       原始用户数据
 * @returns {null}      用户数据
 */
Instagram.prototype.createUserByRawData = function (rawData)
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
Instagram.prototype._getImagePath = function (url, callback)
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
 * 根据分享参数返回分享类型
 * @param parameters            分享参数
 * @private
 */
Instagram.prototype._getShareType = function (parameters)
{

    var self = this;
    var type = $mob.shareSDK.getShareParam(this.type(),parameters,"type");
    if (type == null || type === $mob.shareSDK.contentType.Auto)
    {
        var images = $mob.shareSDK.getShareParam(self.type(), parameters, "images");
        if(images != null)
        {
            return $mob.shareSDK.contentType.Image;
        }
        else
        {
            return $mob.shareSDK.contentType.Video;
        }
    }
    return type;
};

/**
 * 获取当前用户信息
 * @param callback  回调方法
 * @private
 */
Instagram.prototype._getCurrentUser = function (callback)
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
Instagram.prototype._updateUserInfo = function (user, rawData)
{

    if (user != null && rawData != null)
    {
        user["raw_data"] = rawData;
        user["uid"] = rawData ["data"]["id"];
        user["nickname"] = rawData["data"]["username"];
        user["icon"] = rawData["data"]["profile_picture"];
        user["gender"] = 2;
        user["url"] = rawData["data"]["website"];
        user["about_me"] = rawData["data"]["bio"];

        var counts = rawData["data"]["counts"];
        if (counts != null)
        {
            user["follower_count"] = counts["followed_by"];
            user["friend_count"] = counts["follows"];
            user["share_count"] = counts["media"];
        }

    }
};

/**
 * 授权成功
 * @param sessionId             会话ID
 * @param credentialRawData     授权凭证原始数据
 * @private
 */
Instagram.prototype._succeedAuthorize = function (sessionId, credentialRawData)
{
    var self = this;

    //成功
    var credential = {
        "uid"       : credentialRawData["user"] != null ? credentialRawData["user"]["id"] : null,
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
Instagram.prototype._setCurrentUser = function (user, callback)
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
 * 网页授权
 * @param sessionId     会话标识
 * @param settings      授权设置
 * @private
 */
Instagram.prototype._webAuthorize = function (sessionId, settings)
{
    var authUrl = "https://instagram.com/oauth/authorize/?client_id=" + this.clientId() + "&response_type=code&redirect_uri=" + $mob.utils.urlEncode(this.redirectUri());
    if (settings != null && settings ["scopes"] != null && Object.prototype.toString.apply(settings ["scopes"]) === '[object Array]')
    {
        authUrl += "&scope=" + $mob.utils.urlEncode(settings ["scopes"].join("+"));
    }
    else if (this._authScopes != null)
    {
        var scopesStr = this._authScopes;
        scopesStr = scopesStr.replace(/,/g,"+");
        authUrl += "&scope=" + $mob.utils.urlEncode(scopesStr);
    }

    //打开授权
    $mob.native.ssdk_openAuthUrl(sessionId, authUrl, this.redirectUri());
};

/**
 * 检测应用是否有效
 * @returns {boolean}   true 有效 false 无效
 * @private
 */
Instagram.prototype._isAvailable = function ()
{
    if (this.clientId() != null && this.clientSecret() != null && this.redirectUri() != null)
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
Instagram.prototype._checkAuthScopes = function (appInfo)
{
    return appInfo [InstagramAppInfoKeys.Scopes];
};

/**
 * 检测应用信息有效性
 * @param appInfo   应用信息
 * @private
 */
Instagram.prototype._checkAppInfoAvailable = function (appInfo)
{
    //过滤
    var clientId = $mob.utils.trim(appInfo [InstagramAppInfoKeys.ClientId]);
    var clientSecret = $mob.utils.trim(appInfo [InstagramAppInfoKeys.ClientSecret]);
    var redirectUri = $mob.utils.trim(appInfo [InstagramAppInfoKeys.RedirectUri]);

    if (clientId != null)
    {
        appInfo [InstagramAppInfoKeys.ClientId] = clientId;
    }
    else
    {
        appInfo [InstagramAppInfoKeys.ClientId] = this.clientId();       
    }

    if (clientSecret != null)
    {
        appInfo [InstagramAppInfoKeys.ClientSecret] = clientSecret;
    }
    else
    {
        appInfo [InstagramAppInfoKeys.ClientSecret] = this.clientSecret();        
    }

    if (redirectUri != null)
    {
        appInfo [InstagramAppInfoKeys.RedirectUri] = redirectUri;
    }
    else
    {
        appInfo [InstagramAppInfoKeys.RedirectUri] = this.redirectUri();        
    }
    
    return appInfo;
};

//注册平台
$mob.shareSDK.registerPlatformClass($mob.shareSDK.platformType.Instagram, Instagram);
