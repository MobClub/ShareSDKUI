/**
 * Created with JetBrains WebStorm.
 * User: fenghj
 * Date: 15/8/26
 * Time: 下午1:53
 * To change this template use File | Settings | File Templates.
 */

var $pluginID = "com.mob.sharesdk.LinkedIn";

/**
 * LinkedIn应用信息键名定义
 * @type {{AppKey: string, AppSecret: string, RedirectUri: string}}
 */
var LinkedInAppInfoKeys = {
    "ApiKey"        : "api_key",
    "SecretKey"     : "secret_key",
    "RedirectUrl"   : "redirect_url",
    "ConvertUrl"    : "covert_url",
    "Scopes"        : "auth_scopes"
};

/**
 * LinkedIn
 * @param type  平台类型
 * @constructor
 */
function LinkedIn (type)
{
    this._type = type;
    this._appInfo = {};
    this._authScopes = null;
    //当前授权用户
    this._currentUser = null;

    this._currentLanguage = $mob.shareSDK.preferredLanguageLocalize();

}

/**
 * 获取平台类型
 * @returns {*} 平台类型
 */
LinkedIn.prototype.type = function ()
{
    return this._type;
};

/**
 * 授权状态改变
 * @param sessionId         会话标识
 * @param data              返回数据
 * @private
 */
LinkedIn.prototype.authStateChanged = function (sessionId, data)
{
    $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Cancel, null);
};

/**
 * 获取平台名称
 * @returns {string}    平台名称
 */
LinkedIn.prototype.name = function ()
{
    return "LinkedIn";
};

/**
 * 获取应用标识
 * @returns {*} 应用标识
 */
LinkedIn.prototype.apiKey = function ()
{
    if (this._appInfo[LinkedInAppInfoKeys.ApiKey] !== undefined) 
    {
        return this._appInfo[LinkedInAppInfoKeys.ApiKey];
    }

    return null;
};

/**
 * 获取应用密钥
 * @returns {*} 应用密钥
 */
LinkedIn.prototype.secretKey = function ()
{
    if (this._appInfo[LinkedInAppInfoKeys.SecretKey] !== undefined) 
    {
        return this._appInfo[LinkedInAppInfoKeys.SecretKey];
    }

    return null;
};

/**
 * 获取回调地址
 * @returns {*} 回调地址
 */
LinkedIn.prototype.redirectUrl = function ()
{
    if (this._appInfo[LinkedInAppInfoKeys.RedirectUrl] !== undefined) 
    {
        return this._appInfo[LinkedInAppInfoKeys.RedirectUrl];
    }

    return null;
};

/**
 * 获取缓存域名
 * @returns {string}    域名
 */
LinkedIn.prototype.cacheDomain = function ()
{
    return "SSDK-Platform-" + this.type() + "-" + this.apiKey();
};

/**
 * 获取授权方式
 *
 * @return  web 网页授权方式，sso 单点登录授权方式，both 两者共同使用，优先使用SSO
 */
LinkedIn.prototype.convertUrlEnabled = function ()
{
    if (this._appInfo[LinkedInAppInfoKeys.ConvertUrl] !== undefined) 
    {
        return this._appInfo[LinkedInAppInfoKeys.ConvertUrl];
    }

    return $mob.shareSDK.convertUrlEnabled();
};

/**
 * 设置/获取应用信息
 * @param value 应用信息
 * @returns {*}
 */
LinkedIn.prototype.setAppInfo = function (value)
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
LinkedIn.prototype.saveConfig = function ()
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

            curApps["plat_" + self.type()] = self.apiKey();
            $mob.ext.setCacheData("currentApp", curApps, false, domain, null);
        }

    });
};

/**
 * 获取是否支持授权
 * @returns {boolean} true 支持， false 不支持
 */
LinkedIn.prototype.isSupportAuth = function ()
{
    return true;
};

/**
 * 用户授权
 * @param sessionId     授权会话标识
 * @param settings      授权设置
 */
LinkedIn.prototype.authorize = function (sessionId, settings)
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
                "r_basicprofile",
                "r_emailaddress",
                "rw_company_admin",
                "w_share"
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
LinkedIn.prototype.handleAuthCallback = function (sessionId, callbackUrl)
{
    var error = null;
    var self = this;
    var error_message;
    var urlInfo = $mob.utils.parseUrl(callbackUrl);
    if (urlInfo != null && urlInfo.query != null)
    {
        var params = $mob.utils.parseUrlParameters(urlInfo.query);
        if (params != null && params.error == null)
        {
            var getAccessTokenParams = {
                "code" : params["code"],
                "client_id" : this.apiKey(),
                "client_secret" : this.secretKey(),
                "grant_type" : "authorization_code",
                "redirect_uri" : this.redirectUrl()
            };
            //请求AccessToken
            $mob.ext.ssdk_callHTTPApi(this.type(), null, "https://www.linkedin.com/uas/oauth2/accessToken", "POST", getAccessTokenParams, null, function (data) {

                if (data != null)
                {

                    var response = $mob.utils.jsonStringToObject($mob.utils.base64Decode(data["response_data"]));
                    if (response.error == null)
                    {
                        //获取用户ID
                        var getIdUrl = "https://api.linkedin.com/v1/people/~:(id)?format=json&oauth2_access_token=" + $mob.utils.urlEncode(response["access_token"]);
                        $mob.ext.ssdk_callHTTPApi(self.type(), null, getIdUrl, "GET", params, null, function (data) {

                            if (data != null)
                            {
                                var getIdResponse = $mob.utils.jsonStringToObject($mob.utils.base64Decode(data["response_data"]));
                                if (getIdResponse.error == null)
                                {
                                    //成功
                                    response["uid"] = getIdResponse["id"];
                                    self._succeedAuthorize(sessionId, response);
                                }
                                else
                                {
                                    //失败
                                    error = {
                                        "error_code" : $mob.shareSDK.errorCode.APIRequestFail,
                                        "user_data" : getIdResponse
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
LinkedIn.prototype.cancelAuthorize = function ()
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
LinkedIn.prototype.addFriend = function (sessionId, user, callback)
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
LinkedIn.prototype.getFriends = function (cursor, size, callback)
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
LinkedIn.prototype.share = function (sessionId, parameters, callback)
{
    var self = this;
    var text = null;
    var visibility = null;
    var images = null;
    var image = null;
    var shareContent = null;
    var url = null;
    var title = null;
    var desc = null;

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
    if (type === $mob.shareSDK.contentType.Auto)
    {
        type =  this._getShareType(parameters, this.type());
    }

    this._getCurrentUser(function (user){

        switch(type)
        {
            case $mob.shareSDK.contentType.Text:
                text = $mob.shareSDK.getShareParam(self.type(), parameters, "text");
                visibility = $mob.shareSDK.getShareParam(self.type(), parameters, "visibility");
                if (visibility == null)
                {
                    visibility = "anyone";
                }

                self._convertUrl([text], function(data) {

                    text = data.result[0];


                    shareContent = {
                        "comment" : text,
                        "visibility" : { "code" : visibility}
                    };

                    var headers = {
                        "Content-Type" : "application/json",
                        "x-li-format" : "json"
                    };

                    var requestUrl = "https://api.linkedin.com/v1/people/~/shares";
                    if (user != null && user.credential != null)
                    {
                        requestUrl += "?oauth2_access_token=" + user.credential.token;
                    }

                    self.callApi(requestUrl, "POST", {"@body" : shareContent}, headers, function (state, data) {

                        var resultData = data;
                        if (state === $mob.shareSDK.responseState.Success)
                        {
                            //转换数据
                            if (data != null)
                            {
                                resultData = {};
                                resultData["raw_data"] = data;
                                resultData["cid"] = data["updateKey"];
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
            case $mob.shareSDK.contentType.WebPage:
                text = $mob.shareSDK.getShareParam(self.type(), parameters, "text");
                url = $mob.shareSDK.getShareParam(self.type(), parameters, "url");
                title = $mob.shareSDK.getShareParam(self.type(), parameters, "title");
                desc = $mob.shareSDK.getShareParam(self.type(), parameters, "desc");
                visibility = $mob.shareSDK.getShareParam(self.type(), parameters, "visibility");
                if (visibility == null)
                {
                    visibility = "anyone";
                }

                images = $mob.shareSDK.getShareParam(self.type(), parameters, "images");
                if (Object.prototype.toString.apply(images) === '[object Array]')
                {
                    //获取网络图片
                    for (var i = 0; i < images.length; i++)
                    {
                        if (!/^(file\:\/)?\//.test(images[i]))
                        {
                            image = images[i];
                            break;
                        }
                    }
                }

                self._convertUrl([text, url], function(data) {

                    text = data.result[0];
                    url = data.result[1];

                    shareContent = {
                        "comment" : text,
                        "content" : {
                            "title" : title,
                            "description" : desc,
                            "submitted-url" : url,
                            "submitted-image-url" : image
                        },
                        "visibility" : {
                            "code" : visibility
                        }
                    };

                    var headers = {
                        "Content-Type" : "application/json",
                        "x-li-format" : "json"
                    };

                    var requestUrl = "https://api.linkedin.com/v1/people/~/shares";
                    if (user != null && user.credential != null)
                    {
                        requestUrl += "?oauth2_access_token=" + user.credential.token;
                    }

                    self.callApi(requestUrl, "POST", {"@body" : shareContent}, headers, function (state, data) {

                        var resultData = data;
                        if (state === $mob.shareSDK.responseState.Success)
                        {
                            //转换数据
                            if (data != null)
                            {
                                resultData = {};
                                resultData["raw_data"] = data;
                                resultData["cid"] = data["updateKey"];
                                resultData["text"] = text;
                                resultData["urls"] = [url];
                                resultData["images"] = [image];
                            }
                        }

                        if (callback != null)
                        {
                            callback (state, resultData, user, userData);
                        }

                    });
                });

                break;
            default :

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

    });
};

/**
 * 获取用户信息
 * @param query         查询信息
 * @param callback      方法回调
 */
LinkedIn.prototype.getUserInfo = function (query, callback)
{
    var self = this;
    this._getCurrentUser(function(user) {

        var params = {
            "format" : "json"
        };
        var url = "https://api.linkedin.com/v1/people/~";
        if (query != null)
        {
            if (query.uid != null)
            {
                url += "/id=" + query.uid;
            }
            else if (query.path != null)
            {
                url += "/url=" + query.path;
            }
            else
            {

                var error_message = null;
 
                if(this._currentLanguage === "zh-Hans")
                {
                    error_message = "分享平台［" + self.name() + "］不支持通过用户名来获取其他用户资料!";
                }
                else
                {
                    error_message = "Platform [" + self.name() + "］do not support getting other's userInfo by user's name";
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
        }


        url += ":(id,first-name,last-name,maiden-name,formatted-name,phonetic-first-name,phonetic-last-name,formatted-phonetic-name,headline,location,industry,distance,relation-to-viewer,current-share,num-connections,num-connections-capped,summary,specialties,positions,picture-url,site-standard-profile-request,api-standard-profile-request,public-profile-url,email-address)";
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
LinkedIn.prototype.callApi = function (url, method, params, headers, callback)
{
    //获取当前用户信息
    var error = null;
    var self = this;
    var apiCallbackfunc = function(data) {

        if (data != null)
        {
            var response = $mob.utils.jsonStringToObject($mob.utils.base64Decode(data["response_data"]));
            if (response != null && response["error"] == null && response["errorCode"] == null)
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

    };

    
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
                params["oauth2_access_token"] = user.credential.token;
            }

            $mob.ext.ssdk_callHTTPApi(self.type(), null, url, method, params, headers, apiCallbackfunc);
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
LinkedIn.prototype.createUserByRawData = function (rawData)
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
LinkedIn.prototype._convertUrl = function (contents, callback)
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
 * @param platformType          平台类型
 * @private
 */
LinkedIn.prototype._getShareType = function (parameters, platformType)
{
    var type = $mob.shareSDK.contentType.Text;

    var url = $mob.shareSDK.getShareParam(platformType, parameters, "url");
    if (url != null)
    {
        type = $mob.shareSDK.contentType.WebPage;
    }

    return type;
};

/**
 * 授权成功
 * @param sessionId             会话ID
 * @param credentialRawData     授权凭证原始数据
 * @private
 */
LinkedIn.prototype._succeedAuthorize = function (sessionId, credentialRawData)
{
    //获取用户ID
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
 * 获取当前用户信息
 * @param callback  回调方法
 * @private
 */
LinkedIn.prototype._getCurrentUser = function (callback)
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
LinkedIn.prototype._setCurrentUser = function (user, callback)
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
LinkedIn.prototype._updateUserInfo = function (user, rawData)
{
    if (user != null && rawData != null)
    {
        user["raw_data"] = rawData;
        user["uid"] = rawData ["id"];
        user["nickname"] = rawData["formattedName"];
        user["icon"] = rawData["pictureUrl"];
        user["gender"] = 2;
        user["url"] = rawData["publicProfileUrl"];
        user["about_me"] = rawData["summary"];

        var item = null;
        var positions = rawData["positions"];
        if (positions != null && positions["values"] != null)
        {
            var works = [];
            var workArr = positions["values"];
            for (var i = 0; i < workArr.length; i++)
            {
                item = {};
                var data = workArr[i];
                if (data["company"] != null)
                {
                    if (data["company"]["name"] != null)
                    {
                        item ["company"] = data["company"]["name"];
                    }

                    if (data["company"]["industry"] != null)
                    {
                        item ["industry"] = data["company"]["industry"];
                    }

                    if (data["company"]["title"] != null)
                    {
                        item ["position"] = data["company"]["title"];
                    }

                }

                works.push(item);
            }

            user["works"] = works;
        }
    }
};

/**
 * 网页授权
 * @param sessionId     会话标识
 * @param settings      授权设置
 * @private
 */
LinkedIn.prototype._webAuthorize = function (sessionId, settings)
{
    var authUrl = "https://www.linkedin.com/uas/oauth2/authorization?client_id=" + this.apiKey() +
        "&response_type=code&redirect_uri=" + $mob.utils.urlEncode(this.redirectUrl()) +
        "&state=" + (new Date().getTime());

    if (settings != null && settings ["scopes"] != null && Object.prototype.toString.apply(settings ["scopes"]) === '[object Array]')
    {
        authUrl += "&scope=" + $mob.utils.urlEncode(settings ["scopes"].join(" "));
    }
    else if (this._authScopes != null)
    {
        var scopesStr = this._authScopes;
        scopesStr = scopesStr.replace(/,/g," ");
        authUrl += "&scope=" + $mob.utils.urlEncode(scopesStr);
    }
    //打开授权
    $mob.native.ssdk_openAuthUrl(sessionId, authUrl, this.redirectUrl());
};

/**
 * 检测应用是否有效
 * @returns {boolean}   true 有效 false 无效
 * @private
 */
LinkedIn.prototype._isAvailable = function ()
{
    if (this.apiKey() != null && this.secretKey() != null && this.redirectUrl() != null)
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
LinkedIn.prototype._checkAuthScopes = function (appInfo)
{
    return appInfo [LinkedInAppInfoKeys.Scopes];
};

/**
 * 检测应用信息有效性
 * @param appInfo   应用信息
 * @private
 */
LinkedIn.prototype._checkAppInfoAvailable = function (appInfo)
{
    var appKey = $mob.utils.trim(appInfo [LinkedInAppInfoKeys.ApiKey]);
    var appSecret = $mob.utils.trim(appInfo [LinkedInAppInfoKeys.SecretKey]);
    var redirectUri = $mob.utils.trim(appInfo [LinkedInAppInfoKeys.RedirectUrl]);

    if (appKey != null)
    {
        appInfo [LinkedInAppInfoKeys.ApiKey] = appKey;
    }
    else
    {
        appInfo [LinkedInAppInfoKeys.ApiKey] = this.apiKey();   
    }

    if (appSecret != null)
    {
        appInfo [LinkedInAppInfoKeys.SecretKey] = appSecret;
    }
    else
    {
        appInfo [LinkedInAppInfoKeys.SecretKey] = this.secretKey();   
    }

    if (redirectUri != null)
    {
        appInfo [LinkedInAppInfoKeys.RedirectUrl] = redirectUri;
    }
    else
    {
        appInfo [LinkedInAppInfoKeys.RedirectUrl] = this.redirectUrl();  
    }
    
    return appInfo;
};


//注册平台
$mob.shareSDK.registerPlatformClass($mob.shareSDK.platformType.LinkedIn, LinkedIn);

