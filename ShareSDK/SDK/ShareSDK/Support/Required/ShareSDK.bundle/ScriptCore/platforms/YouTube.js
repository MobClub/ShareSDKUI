/**
 * Created
 * User: peixj
 * Date: 17/2/13
 * Time: 下午5:44
 * To change this template use File | Settings | File Templates.
 */

var $pluginID = "com.mob.sharesdk.YouTube";

/**
 * YouTube 应用信息键名定义
 */
var YouTubeInfoKeys = 
{
    "ClientID"     : "client_id",
    "RedirectURI"  : "redirect_uri",
    "ClientSecret" : "client_secret",
    "ConvertUrl"   : "covert_url",
    "Scopes"       : "auth_scopes"
};

/**
 * YouTube
 * @param type  平台类型
 * @constructor
 */
function YouTube(type) 
{
    this._type = type;
    this._appInfo = {};
    //当前授权用户
    this._currentUser = null;
    //设置当前语言环境
    this._currentLanguage = $mob.shareSDK.preferredLanguageLocalize();
    this._uploading = false;
}

/**
 * 美拍分享内容集合
 * @type {{}}
 */
var YouTubeShareContentSet = {};

/**
 * 获取平台类型
 * @returns {*} 平台类型
 */
YouTube.prototype.type = function ()
{
    return this._type;
};

/**
 * 获取平台名称
 * @returns {string}    平台名称
 */
YouTube.prototype.name = function ()
{
    return "YouTube";
};

/**
 * 获取应用标识
 * @returns {*} 应用标识
 */
YouTube.prototype.clientID = function ()
{
    if (this._appInfo[YouTubeInfoKeys.ClientID] !== undefined) 
    {
        return this._appInfo[YouTubeInfoKeys.ClientID];
    }

    return null;
};

/**
 * 获取backURL
 * @returns {*} backURL
 */
YouTube.prototype.redirectURI = function ()
{
    if (this._appInfo[YouTubeInfoKeys.RedirectURI] !== undefined) 
    {
        return this._appInfo[YouTubeInfoKeys.RedirectURI];
    }

    return null;
};

YouTube.prototype.clientSecret = function ()
{
    if (this._appInfo[YouTubeInfoKeys.ClientSecret] !== undefined) 
    {
        return this._appInfo[YouTubeInfoKeys.ClientSecret];
    }

    return null;
};

/**
 * 授权状态改变
 * @param sessionId         会话标识
 * @param data              返回数据
 * @private
 */
YouTube.prototype.authStateChanged = function (sessionId, data)
{
    $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Cancel, null);
};

/**
 * 获取缓存域名
 * @returns {string}    域名
 */
YouTube.prototype.cacheDomain = function ()
{
    return "SSDK-Platform-" + $mob.shareSDK.platformType.YouTube + "-" + this.clientID();
};

/**
 * 获取是否转换短链
 *
 * @return  true 转换， false 不转换
 */
YouTube.prototype.convertUrlEnabled = function ()
{
    if (this._appInfo[YouTubeInfoKeys.ConvertUrl] !== undefined) 
    {
        return this._appInfo[YouTubeInfoKeys.ConvertUrl];
    }

    return $mob.shareSDK.convertUrlEnabled();
};

/**
 * 设置/获取应用信息
 * @param value 应用信息
 * @returns {*}
 */
YouTube.prototype.setAppInfo = function (value)
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
 * 检测应用信息中的授权信息
 * @param appInfo   应用信息
 * @private
 */
YouTube.prototype._checkAuthScopes = function (appInfo)
{
    return appInfo [YouTubeInfoKeys.Scopes];
};

/**
 * 检测应用信息有效性
 * @param appInfo   应用信息
 * @private
 */
YouTube.prototype._checkAppInfoAvailable = function (appInfo)
{
    var clientID = $mob.utils.trim(appInfo [YouTubeInfoKeys.ClientID]);
    if (clientID != null)
    {
        appInfo [YouTubeInfoKeys.ClientID] = clientID;
    }
    else
    {
        appInfo [YouTubeInfoKeys.ClientID] = this.clientID();
    }

    var redirectURI = $mob.utils.trim(appInfo [YouTubeInfoKeys.RedirectURI]);
    if (redirectURI != null)
    {
        appInfo [YouTubeInfoKeys.RedirectURI] = redirectURI;
    }
    else
    {
        appInfo [YouTubeInfoKeys.RedirectURI] = this.redirectURI();
    }

    var clientSecret = $mob.utils.trim(appInfo [YouTubeInfoKeys.ClientSecret]);
    
    if (clientSecret != null)
    {
        appInfo [YouTubeInfoKeys.ClientSecret] = clientSecret;
    }
    else
    {
        appInfo [YouTubeInfoKeys.ClientSecret] = this.clientSecret();
    }
    return appInfo;
};

/**
 * 保存配置信息
 */
YouTube.prototype.saveConfig = function ()
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

            curApps["plat_" + self.type()] = self.clientID();
            $mob.ext.setCacheData("currentApp", curApps, false, domain, null);
        }
    });
};

/**
 * 获取是否支持授权
 * @returns {boolean} true 支持， false 不支持
 */
YouTube.prototype.isSupportAuth = function ()
{
    return true;
};

/**
 * 用户授权
 * @param sessionId     授权会话标识
 * @param settings      授权设置
 */
YouTube.prototype.authorize = function (sessionId, settings)
{
    var self = this;
    var errorStr;
    if (this._isAvailable())
    {
        $mob.ext.isPluginRegisted("com.mob.sharesdk.connector.youtube", function (data) {
            if(data.result)
            {
                if (settings == null)
                {
                    settings = {};
                }
                if (settings ["scopes"] == null && self._authScopes == null)
                {
                    //设置默认权限
                    settings ["scopes"] = [
                        "https://www.googleapis.com/auth/youtube",
                        "https://www.googleapis.com/auth/plus.me"
                    ];
                }
                //只支持网页授权
                self._webAuthorize(sessionId, settings);
            }
            else
            {
                errorStr = null;
                if(self._currentLanguage === "zh-Hans")
                {
                    errorStr = "平台[" + self.name() + "]需要依靠YouTubeConnector.framework进行分享，请先导入YouTubeConnector.framework后再试!";
                }
                else
                {
                    errorStr = "Platform [" + self.name() + "] depends on YouTubeConnector.framework，please import YouTubeConnector.framework then try again!";
                }            
                var error = {
                    "error_code" : $mob.shareSDK.errorCode.APIRequestFail,
                    "error_message" : errorStr
                };
                $mob.native.ssdk_authStateChanged(sessionId,$mob.shareSDK.responseState.Fail, error);
            }
        });
    }
    else
    {
        errorStr = null;
    
        if(this._currentLanguage === "zh-Hans")
        {
            errorStr = "分享平台［" + this.name() + "］应用信息无效!";
        }
        else
        {
            errorStr = "Platform［" + this.name() + "］Invalid congfiguration!";
        }

        var error = {
            "error_code" : $mob.shareSDK.errorCode.InvaildPlatform,
            "error_message" : errorStr
        };
        $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Fail, error);
    }
};

/**
 * 网页授权
 * @param sessionId     会话标识
 * @param settings      授权设置
 * @private
 */
YouTube.prototype._webAuthorize = function (sessionId, settings)
{
    var authUrl = "https://accounts.google.com/o/oauth2/v2/auth?response_type=code" + 
                  "&redirect_uri=" + $mob.utils.urlEncode(this.redirectURI()) +
                  "&client_id=" + this.clientID();
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
    // 修改userAgent
    $mob.native.ssdk_plugin_youtube_modifyUserAgent();
    // 打开授权
    $mob.native.ssdk_openAuthUrl(sessionId, authUrl, this.redirectURI());
};

/**
 * 处理用户授权回调
 * @param sessionId     授权会话标识
 * @param callbackUrl   回调地址
 */
YouTube.prototype.handleAuthCallback = function (sessionId, callbackUrl)
{
    var self = this;
    var error;
    var errorStr;
    var urlInfo = $mob.utils.parseUrl(callbackUrl);
    if (urlInfo != null && urlInfo.query != null)
    {
        var params = $mob.utils.parseUrlParameters(urlInfo.query);
        if (params != null)
        {
            if (params["error"] == null)
            {
                var accessTokenParams = {
                    "code" : params["code"],
                    "client_id" : this.clientID(),
                    "client_secret" : this.clientSecret(),
                    "grant_type" : "authorization_code",
                    "redirect_uri" : this.redirectURI()
                };
                $mob.ext.ssdk_callHTTPApi(this.type(), null, "https://accounts.google.com/o/oauth2/token", "POST", accessTokenParams, null, function (data) {

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
                                var credRawData = response;
                                //验证授权信息
                                var tokenInfoParams = {
                                    "access_token" : response["access_token"]
                                };

                                $mob.ext.ssdk_callHTTPApi(self.type(), null, "https://www.googleapis.com/oauth2/v1/tokeninfo", "GET", tokenInfoParams, null, function (data) {

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
                                                credRawData["uid"] = response["user_id"];
                                                self._succeedAuthorize(sessionId, credRawData);
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
                //失败
                error = {
                    "error_code" : $mob.shareSDK.errorCode.APIRequestFail,
                    "user_data" : params
                };
                $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Fail, error);
            }

        }
        else
        {
            errorStr = null;
 
            if(this._currentLanguage === "zh-Hans")
            {
                errorStr = "无效的授权回调:[" + callbackUrl + "]";
            }
            else
            {
                errorStr = "invalid callback url:[" + callbackUrl + "]";
            }

            error = {
                "error_code" : $mob.shareSDK.errorCode.InvalidAuthCallback,
                "error_message" : errorStr
            };
            $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Fail, error);
        }
    }
    else
    {
         errorStr = null;
 
        if(this._currentLanguage === "zh-Hans")
        {
            errorStr = "无效的授权回调:[" + callbackUrl + "]";
        }
        else
        {
            errorStr = "invalid callback url:[" + callbackUrl + "]";
        }

        error = {
            "error_code" : $mob.shareSDK.errorCode.InvalidAuthCallback,
            "error_message" : errorStr
        };
        $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Fail, error);
    }
    //恢复userAgent
    $mob.native.ssdk_plugin_googleplus_restoreUserAgent();
};

/**
 * 授权成功
 * @param sessionId             会话ID
 * @param credentialRawData     授权凭证原始数据
 * @private
 */
YouTube.prototype._succeedAuthorize = function (sessionId, credentialRawData)
{

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
    var resultData = {"platform_type" : this.type()};
    user["raw_data"] = resultData;
    //设置当前授权用户
    this._setCurrentUser(user, function () {
        $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Success, user);
    });
};

/**
 * 设置当前用户信息
 * @param user      用户信息
 * @param callback  回调方法
 * @private
 */
YouTube.prototype._setCurrentUser = function (user, callback)
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
YouTube.prototype._isAvailable = function()
{
    if (this.clientID() != null && this.redirectURI() != null)
    {
        return true;
    }

    $mob.native.log("[ShareSDK-WARNING] [" + this.name() + "]应用信息有误，不能进行相关操作。请检查本地代码中和服务端的[" + this.name() + "]平台应用配置是否有误! " +
        "\n配置:" + $mob.utils.objectToJsonString(this._appInfo));

    return false;
};

/**
 * 取消授权
 * @param callback      方法回调，回调方法声明如下:function (stat, data);
 */
YouTube.prototype.cancelAuthorize = function (callback)
{
    this._setCurrentUser(null, null);
};

YouTube.prototype._getCurrentUser = function (callback)
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
 * 获取用户信息
 * @param query         查询信息
 * @param callback      方法回调
 */
YouTube.prototype.getUserInfo = function (query, callback)
{
    var self = this;
    self._getCurrentUser(function (user) {
        if(user != null)
        {
            if (callback != null)
            {
                callback ($mob.shareSDK.responseState.Success, user);
            }
        }
        else
        {
            if (callback != null)
            {
                var error =
                {
                    "error_code" : $mob.shareSDK.errorCode.UserUnauth,
                    "error_message" : "尚未授权"
                };
                callback ($mob.shareSDK.responseState.Fail, error);
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
YouTube.prototype.addFriend = function (sessionId, user, callback)
{

    var errorStr = null;
    
    if(this._currentLanguage === "zh-Hans")
    {
        errorStr = "平台［" + this.name() + "］不支持添加好友方法!";
    }
    else
    {
        errorStr = "Platform［" + this.name() + "］do not support adding friends";
    }

    var error =
    {
        "error_code" : $mob.shareSDK.errorCode.UnsupportFeature,
        "error_message" : errorStr
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
YouTube.prototype.getFriends = function (cursor, size, callback)
{

    var errorStr = null;
    
    if(this._currentLanguage === "zh-Hans")
    {
        errorStr = "平台［" + this.name() + "不支持获取好友列表方法!";
    }
    else
    {
        errorStr = "Platform［" + this.name() + "］do not support getting friend list";
    }


    var error =
    {
        "error_code" : $mob.shareSDK.errorCode.UnsupportFeature,
        "error_message" : errorStr
    };

    if (callback != null)
    {
        callback ($mob.shareSDK.responseState.Fail, error);
    }
};

/**
 * 创建用户信息
 * @param rawData       原始用户数据
 * @returns {null}      用户数据
 */
YouTube.prototype.createUserByRawData = function (rawData)
{
    //转换用户数据
    var user = {
        "platform_type" : this.type()
    };
    this._updateUserInfo(user, rawData);
    return $mob.utils.objectToJsonString(user);
};

/**
 * 更新用户信息
 * @param user      用户信息
 * @param rawData   原始数据
 * @private
 */
YouTube.prototype._updateUserInfo = function (user, rawData)
{
    if (user != null && rawData != null)
    {
        user["raw_data"] = rawData;
        user["uid"] = rawData ["id"];
        user["nickname"] = rawData["displayName"];
        user["gender"] = 2;

        if (rawData["image"] != null)
        {
            user["icon"] = rawData["image"]["url"];
        }

        user["url"] = rawData["url"];
        user["about_me"] = rawData["aboutMe"];
        user["verify_type"] = rawData["verified"] ? 1 : 0;


        //生日
        var birthday = rawData["birthday"];
        var exp = /^(\d+)-(\d+)-(\d+)$/;
        var res = null;
        var date = null;
        if (birthday != null && exp.test(birthday))
        {
            res = exp.exec(birthday);
            date = new Date(res[1], res[2] - 1, res[3], 0, 0, 0);
            user["birthday"] = date.getTime() / 1000;
        }

        var item = null;
        var organizations = rawData["organizations"];
        if (organizations != null)
        {
            //教育信息
            var edus = [];
            var works = [];

            for (var i = 0; i < organizations.length; i++)
            {
                item = {};
                var data = organizations[i];

                if (data["type"] === "school")
                {
                    //教育信息
                    item["school"] = data["name"];
                    item["classes"] = data["department"];

                    edus.push(item);
                }
                else if (data["type"] === "work")
                {
                    //工作信息
                    item["company"] = data["name"];
                    item["dept"] = data["department"];
                    item["position"] = data["title"];

                    works.push(item);
                }
            }


            user["educations"] = edus;
            user["works"] = works;
        }
    }
};

/**
 * 分享内容
 * @param sessionId         会话ID
 * @param parameters        分享参数
 * @param callback          方法回调，回调方法声明如下:function (state, data, user, userData);
 */
YouTube.prototype.share = function (sessionId, parameters, callback)
{
    var self = this;
    //获取分享统计标识
    var error = {};
    var errorStr;
    var flags = parameters != null ? parameters ["@flags"] : null;
    var userData =
    {
        "@flags" : flags
    };
    if(self._canShare())
    {
        //检测是否支持多任务
        $mob.ext.isMultitaskingSupported(function (data){
            if (data.result)
            {
                $mob.ext.isPluginRegisted("com.mob.sharesdk.connector.youtube", function (data) {
                    if(data.result)
                    {
                        var type = $mob.shareSDK.getShareParam(self.type(),parameters,"type");
                        if(type === $mob.shareSDK.contentType.Auto)
                        {
                            type = $mob.shareSDK.contentType.Video;
                        }
                        switch (type)
                        {
                            case $mob.shareSDK.contentType.Video:
                            {
                                //检测video资源
                                var video = $mob.shareSDK.getShareParam(self.type(), parameters, "video");
                                if(video == null)
                                {
                                    video = $mob.shareSDK.getShareParam(self.type(), parameters, "url");
                                }
                                if (video != null)
                                {
                                    var parts = $mob.shareSDK.getShareParam(self.type(), parameters, "youtube_parts");
                                    var jsonString = $mob.shareSDK.getShareParam(self.type(), parameters, "youtube_json_string");
                                    if (parts == null || jsonString == null)
                                    {
                                        parts = "snippet,status";
                                        var snippet = {};
                                        var title = $mob.shareSDK.getShareParam(self.type(), parameters, "title");
                                        if (title == null)
                                        {
                                            title = "my video";
                                        }
                                        snippet.title = title;
                                        var text = $mob.shareSDK.getShareParam(self.type(), parameters, "text");
                                        if (text == null)
                                        {
                                            text = "";
                                        }
                                        snippet.description = text;
                                        var tags = $mob.shareSDK.getShareParam(self.type(), parameters, "tags");
                                        if(tags != null)
                                        {
                                            snippet.tags = tags;
                                        }
                                        var privacyStatus = $mob.shareSDK.getShareParam(self.type(), parameters, "privacy_status");
                                        var privacyStatusStr = null;
                                        switch (privacyStatus)
                                        {
                                            case $mob.shareSDK.privacyStatus.Private:
                                                privacyStatusStr = "private";
                                                break;
                                            case $mob.shareSDK.privacyStatus.Unlisted:
                                                privacyStatusStr = "unlisted";
                                                break;
                                            default:
                                                privacyStatusStr = "public";
                                                break;
                                        }
                                        var status = {"privacyStatus" : privacyStatusStr};
                                        var postData = {"snippet" : snippet, "status" : status};
                                        jsonString = $mob.utils.objectToJsonString(postData);
                                    }
                                    self._getCurrentUser(function (user){
                                        if (user != null && self._isUserAvaliable(user))
                                        {
                                            var authorizationStr = "Bearer "+user.credential.token;
                                            $mob.ext.ssdk_upLoadYouTubeVideo(sessionId , video, jsonString, parts ,authorizationStr, function(data){
                                                if(data.error_code != null)
                                                {
                                                    if (callback)
                                                    {
                                                        callback ($mob.shareSDK.responseState.Fail, data , null, userData);
                                                    }
                                                }
                                                else
                                                {
                                                    var shareParams = {"platform" : self.type(), "postData" : jsonString , 'video' :video };
                                                    YouTubeShareContentSet[sessionId] = {"content" : shareParams, "user_data" : userData};
                                                    $mob.native.ssdk_shareStateChanged(sessionId, $mob.shareSDK.responseState.BeginUPLoad, null, null, null);
                                                }
                                            });
                                        }
                                        else
                                        {
                                            errorStr = null;
                                            if(this._currentLanguage === "zh-Hans")
                                            {
                                                errorStr = "尚未授权[" + self.name() + "]用户";
                                            }
                                            else
                                            {
                                                errorStr = "Invalid Authorization [" + self.name() + "]";
                                            }
                                            //尚未授权
                                            error = {
                                                "error_code" : $mob.shareSDK.errorCode.UserUnauth,
                                                "error_message" : errorStr
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
                                    errorStr = null;
                                    if(self._currentLanguage === "zh-Hans")
                                    {
                                        errorStr = "分享参数video不能为空!";
                                    }
                                    else
                                    {
                                        errorStr = "share param video can not be nil!";
                                    }

                                    error = {
                                        "error_code" : $mob.shareSDK.errorCode.APIRequestFail,
                                        "error_message" : errorStr
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
                                if(self._currentLanguage === "zh-Hans")
                                {
                                    errorStr = "不支持的分享类型[" + type + "]";
                                }
                                else
                                {
                                    errorStr = "unsupported share type [" + type + "]";
                                }
                                error = {
                                    "error_code" : $mob.shareSDK.errorCode.UnsupportContentType,
                                    "error_message" : errorStr
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
                        errorStr = null;
                        if(self._currentLanguage === "zh-Hans")
                        {
                            errorStr = "平台[" + self.name() + "]需要依靠YouTubeConnector.framework进行分享，请先导入YouTubeConnector.framework后再试!";
                        }
                        else
                        {
                            errorStr = "Platform [" + self.name() + "] depends on YouTubeConnector.framework，please import YouTubeConnector.framework then try again!";
                        }            
                        error = {
                            "error_code" : $mob.shareSDK.errorCode.APIRequestFail,
                            "error_message" : errorStr
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
                errorStr = null;
                if(self._currentLanguage === "zh-Hans")
                {
                    errorStr = "尚未设置分享平台［" + self.name() + "］的URL Scheme:" + self.clientID() + "，无法进行分享!请在项目设置中设置URL Scheme后再试!";
                }
                else
                {
                    errorStr = "Can't share because platform［" + self.name() + "］did not set URL Scheme:" + self.clientID() + "!Please try again after set URL Scheme!";
                }
                //返回错误
                error = {
                    "error_code" : $mob.shareSDK.errorCode.UnsetURLScheme,
                    "error_message" : errorStr
                };
                if(callback != null)
                {
                    callback($mob.shareSDK.responseState.Fail, error, null, userData);
                }
            }
        });
    }
    else
    {
        errorStr = null;
        if(self._currentLanguage === "zh-Hans")
        {
            errorStr = "分享平台［" + self.name() + "］应用信息无效!";
        }
        else
        {
            errorStr = "Platform［" + self.name() + "］Invalid configuration!";
        }
        error = {
            "error_code" : $mob.shareSDK.errorCode.InvaildPlatform,
            "error_message" : errorStr
        };
        if(callback != null && error != null)
        {
            callback($mob.shareSDK.responseState.Fail, error, null, userData);
        }
    }
};



/**
 * 判断是否能够进行分享
 * @private
 */
YouTube.prototype._canShare = function ()
{
    if (this.clientID() != null)
    {
        return true;
    }
    $mob.native.log("[ShareSDK-WARNING] [" + this.name() + "]应用信息有误，不能进行相关操作。请检查本地代码中和服务端的[" + this.name() + "]平台应用配置是否有误! " +
        "\n配置:" + $mob.utils.objectToJsonString(this._appInfo));

    return false;
};

/**
 * 调用API接口
 * @param url           接口URL
 * @param method        请求方式
 * @param params        请求参数
 * @param headers       请求头
 * @param callback      方法回调, 回调方法声明如下:function (state, data);
 */
YouTube.prototype.callApi = function (url, method, params, headers, callback)
{
    //获取当前用户信息
    var error = null;
    var self = this;
    this._getCurrentUser(function (user){

        if (user != null && self._isUserAvaliable(user))
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
            var errorStr = null;
 
            if(this._currentLanguage === "zh-Hans")
            {
                errorStr = "尚未授权[" + self.name() + "]用户";
            }
            else
            {
                errorStr = "Invalid Authorization [" + self.name() + "]";
            }

            //尚未授权
            error = {
                "error_code" : $mob.shareSDK.errorCode.UserUnauth,
                "error_message" : errorStr
            };
            if (callback)
            {
                callback ($mob.shareSDK.responseState.Fail, error);
            }
        }

    });
};

/*
* 上传完成后的通知
* @param sessionId         会话标识
* @param data              返回数据
*/
YouTube.prototype.uploadFinishCallback = function (sessionId, data)
{
    var self = this;
    self._getCurrentUser(function (user) {
        var userData = null;
        var content = null;
        var shareParams = YouTubeShareContentSet[sessionId];
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
            resultData["postData"] = content.jsonString;
            resultData["backData"] = data.finishData;
            $mob.native.ssdk_shareStateChanged(sessionId, $mob.shareSDK.responseState.Success, resultData, user, userData);
        }
        delete YouTubeShareContentSet[sessionId];
    });
};

/**
 * 用户是否有效
 * @param user      用户信息
 * @returns {boolean}   如果授权凭证过期或者不存在则返回false，否则返回true
 * @private
 */
YouTube.prototype._isUserAvaliable = function (user)
{
    return user.credential != null && user.credential.uid != null && user.credential.token != null && user.credential.expired > new Date().getTime();
};

//注册平台
$mob.shareSDK.registerPlatformClass($mob.shareSDK.platformType.YouTube, YouTube);
