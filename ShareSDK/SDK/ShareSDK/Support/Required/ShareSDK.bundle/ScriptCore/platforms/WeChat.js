/**
 * Created with JetBrains WebStorm.
 * User: fenghj
 * Date: 15/6/2
 * Time: 下午3:49
 * To change this template use File | Settings | File Templates.
 */

var $pluginID = "com.mob.sharesdk.WeChat";

/**
 * 微信应用信息键名定义
 * @type {{AppId: "app_id", AppSecret: "app_secret", ConvertUrl: "covert_url"}}
 */
var WeChatAppInfoKeys = {
    "AppId"        : "app_id",
    "AppSecret"    : "app_secret",
    "ConvertUrl"   : "covert_url",
    "Scopes"       : "auth_scopes",
    "BackUnionid"   : "back_unionid"
};

/**
 * 微信场景
 * @type {{Session: number, Timeline: number, Fav: number}}
 */
var WeChatScene = {
    "Session"       : 0,
    "Timeline"      : 1,
    "Fav"           : 2
};

/** 
 * 微信分享内容集合
 * @type {{}}
 */
var WeChatShareContentSet = {};

/**
 * 微信
 * @param type  平台类型
 * @constructor
 */
function WeChat (type)
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
WeChat.prototype.type = function ()
{
    return this._type;
};

/**
 * 获取平台名称
 * @returns {string}    平台名称
 */
WeChat.prototype.name = function ()
{
    if(this._currentLanguage === "zh-Hans")
    {
        return "微信";
    }
    else
    {
        return "WeChat";
    }
};

/**
 * 获取应用标识
 * @returns {*} 应用标识
 */
WeChat.prototype.appID = function ()
{
    if (this._appInfo[WeChatAppInfoKeys.AppId] !== undefined) 
    {
        return this._appInfo[WeChatAppInfoKeys.AppId];
    }

    return null;
};

//v4.0.2增加
//returns {*} true uid = unionid ; false uid = openid
WeChat.prototype.backUnionid = function ()
{
    if (this._appInfo[WeChatAppInfoKeys.BackUnionid] !== undefined) 
    {
        return this._appInfo[WeChatAppInfoKeys.BackUnionid];
    }

     return false;
};

/**
 * 获取应用密钥
 * @returns {*} 应用密钥
 */
WeChat.prototype.appSecret = function ()
{
    if (this._appInfo[WeChatAppInfoKeys.AppSecret] !== undefined) 
    {
        return this._appInfo[WeChatAppInfoKeys.AppSecret];
    }

    return null;
};

/**
 * 获取缓存域名
 * @returns {string}    域名
 */
WeChat.prototype.cacheDomain = function ()
{
    return "SSDK-Platform-" + $mob.shareSDK.platformType.WeChat + "-" + this.appID();
};

/**
 * 获取授权方式
 *
 * @return  web 网页授权方式，sso 单点登录授权方式，both 两者共同使用，优先使用SSO
 */
WeChat.prototype.convertUrlEnabled = function ()
{
    if (this._appInfo[WeChatAppInfoKeys.ConvertUrl] !== undefined) 
    {
        return this._appInfo[WeChatAppInfoKeys.ConvertUrl];
    }

    return $mob.shareSDK.convertUrlEnabled();
};

/**
 * 设置/获取应用信息
 * @param value 应用信息
 * @returns {*}
 */
WeChat.prototype.setAppInfo = function (value)
{
    if (arguments.length === 0)
    {
        return this._appInfo;
    }
    else
    {
        this._appInfo = this._checkAppInfoAvailable(value);
        this._authScopes = this._checkAuthScopes(value);
        this._setupApp(this.appID());
    }
};

/**
 * 保存配置信息
 */
WeChat.prototype.saveConfig = function ()
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

            curApps["plat_" + self.type()] = self.appID();
            $mob.ext.setCacheData("currentApp", curApps, false, domain, null);
        }
    });
};

/**
 * 获取是否支持授权
 * @returns {boolean} true 支持， false 不支持
 */
WeChat.prototype.isSupportAuth = function ()
{
    return true;
};

/**
 * 用户授权
 * @param sessionId     授权会话标识
 * @param settings      授权设置
 */
WeChat.prototype.authorize = function (sessionId, settings)
{
    if (this._canAuthorize())
    {
        var self = this;

        //检测是否支持多任务
        $mob.ext.isMultitaskingSupported(function (data){
            if (data.result)
            {
                //检测URL Scheme
                self._checkUrlScheme(function (hasReady, urlScheme){

                    if (hasReady)
                    {
                        if (settings == null)
                        {
                            settings = {};
                        }

                        if (settings ["scopes"] == null && self._authScopes == null)
                        {
                            //设置默认权限
                            settings ["scopes"] = [
                                "snsapi_userinfo"
                            ];
                        }

                        $mob.ext.ssdk_isConnectedPlatformSDK("WXApi",function(data)
                        {
                            if(data.result)
                            {
                                $mob.ext.isPluginRegisted("com.mob.sharesdk.connector.wechat", function (data) {

                                    if (data.result)
                                    {
                                        //进行SSO授权
                                        self._ssoAuthorize(sessionId, urlScheme, settings);
                                    }
                                    else
                                    {
                                        //不用SDK下进行SSO授权
                                        self._ssoAuthorizeWithoutSDK(sessionId,urlScheme,settings);
                                    }
                                });
                            }
                            else
                            {
                                //不用SDK下进行SSO授权
                                self._ssoAuthorizeWithoutSDK(sessionId,urlScheme,settings);
                            }
                        });
                    }
                    else
                    {
                        var error_message = null;

                        if(self._currentLanguage === "zh-Hans")
                        {
                            error_message = "尚未设置分享平台［" + self.name() + "］的URL Scheme:" + self.appID() + "，无法进行授权!请在项目设置中设置URL Scheme后再试!";
                        }
                        else
                        {
                            error_message = "Unable to authorize because platform［" + self.name() + "］did not set URL Scheme:" + self.appID() + "!Please try again after set URL Scheme!";
                        }

                        //返回错误
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
        var error_message = null;
    
        if(this._currentLanguage === "zh-Hans")
        {
            error_message = "分享平台［" + this.name() + "］应用信息无效!";
        }
        else
        {
            error_message = "Platform［" + this.name() + "］Invalid configuration!";
        }

        var error = {
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
WeChat.prototype.getUserInfo = function (query, callback)
{
    var self = this;
    this._getCurrentUser(function(user) {

        var params = {};
        if (query != null)
        {
            if (query.uid != null)
            {
                params["openid"] = query.uid;
            }
        }
        else if (user != null && user.credential != null && user.credential.uid != null)
        {
            //设置当前授权用户ID
            params["openid"] = user.credential.raw_data["openid"];
        }
          
        self.callApi("https://api.weixin.qq.com/sns/userinfo", "GET", params, null, function (state, data) {

            var resultData = data;
            if (state === $mob.shareSDK.responseState.Success)
            {
                //转换用户数据
                resultData = {"platform_type" : $mob.shareSDK.platformType.WeChat};
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
WeChat.prototype.cancelAuthorize = function ()
{
    this._setCurrentUser(null, null);
};

/**
 * 添加好友
 * @param sessionId     会话标识
 * @param user          用户信息
 * @param callback      方法回调，回调方法声明如下:function (stat, data);
 */
WeChat.prototype.addFriend = function (sessionId, user, callback)
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
WeChat.prototype.getFriends = function (cursor, size, callback)
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
 * @param sessionId         会话标识
 * @param parameters        分享参数
 * @param callback          方法回调，回调方法声明如下:function (state, data, user, userData);
 */
WeChat.prototype.share = function (sessionId, parameters, callback)
{
    //获取分享统计标识
    var self = this;
    //使用系统分享
    var enableExtensionShare = parameters != null ? parameters ["@extension_share"] : false;
    self._checkShare(enableExtensionShare,sessionId,parameters,callback);
};

WeChat.prototype._checkShare = function (enableExtensionShare,sessionId, parameters, callback)
{
	var self = this;
	var flags = parameters != null ? parameters ["@flags"] : null;
    var userData = {
        "@flags" : flags
    };
    //使用系统分享
	if(enableExtensionShare)
    {
    	self._extensionShare(sessionId, parameters, userData, callback);
    }
	else
	{
		if (this._canShare())
	    {
	        //检测是否支持多任务
	        $mob.ext.isMultitaskingSupported(function (data){

	            if (data.result)
	            {
	                //检测URL Scheme
	                self._checkUrlScheme(function (hasReady, urlScheme){

	                    if (hasReady)
	                    {
	                        $mob.ext.ssdk_isConnectedPlatformSDK("WXApi",function(data)
	                        {
	                            if(data.result)
	                            {
	                                //进行分享
	                                $mob.ext.isPluginRegisted("com.mob.sharesdk.connector.wechat", function (data) {

	                                    if (data.result)
	                                    {
	                                        self._share(sessionId, parameters, userData, callback);
	                                    }
	                                    else
	                                    {
	                                        self._shareWithoutSDK(sessionId, parameters, userData, callback);
	                                    }
	                                });
	                            }
	                            else
	                            {
	                                self._shareWithoutSDK(sessionId, parameters, userData, callback);
	                            }
	                        });
	                    }
	                    else
	                    {
	                        var error_message = null;

	                        if(this._currentLanguage === "zh-Hans")
	                        {
	                            error_message = "尚未设置分享平台［" + self.name() + "］的URL Scheme:" + self.appID() + "，无法进行分享!请在项目设置中设置URL Scheme后再试!";
	                        }
	                        else
	                        {
	                            error_message = "Can't share because platform［" + self.name() + "］did not set URL Scheme:" + self.appID() + "!Please try again after set URL Scheme!";
	                        }

	                        //返回错误
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
	    else
	    {
	        var error_message = null;
	        
	        if(this._currentLanguage === "zh-Hans")
	        {
	            error_message = "分享平台［" + this.name() + "］应用信息无效!";
	        }
	        else
	        {
	            error_message = "Platform［" + this.name() + "］Invalid configuration!";
	        }

	        var error = {
	            "error_code" : $mob.shareSDK.errorCode.InvaildPlatform,
	            "error_message" : error_message
	        };

	        if (callback != null)
	        {
	            callback ($mob.shareSDK.responseState.Fail, error, null, userData);
	        }
	    }
	}
};

WeChat.prototype._extensionShare = function (sessionId, parameters, userData, callback)
{
	var scene = parameters ["wechat_scene"];

    if (scene == null)
    {
        scene = WeChatScene.Session;
    }

    var platformType = $mob.shareSDK.platformType.Unknown;
    switch (scene)
    {
        case WeChatScene.Session:
            platformType = $mob.shareSDK.platformType.WeChatSession;
            break;
        case WeChatScene.Timeline:
            platformType = $mob.shareSDK.platformType.WeChatTimeline;
            break;
        case WeChatScene.Fav:
            platformType = $mob.shareSDK.platformType.WeChatFav;
            break;
    }

    var type = $mob.shareSDK.getShareParam(platformType, parameters, "type");
    if (type == null)
    {
        type = $mob.shareSDK.contentType.Auto;
    }
    if (type === $mob.shareSDK.contentType.Auto)
    {
        type = this._getShareType(parameters, platformType);
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
            	$mob.ext.ssdk_wechatExtensionShare($mob.shareSDK.contentType.Image , images, function (data){
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
    			$mob.ext.ssdk_wechatExtensionShare($mob.shareSDK.contentType.WebPage , url, function (data){
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
    			$mob.ext.ssdk_wechatExtensionShare($mob.shareSDK.contentType.File , sourceFile, function (data){
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


WeChat.prototype._extensionShareFinish = function (state , sessionId, parameters , userData)
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
 * 处理SSO授权回调
 * @param sessionId     会话ID
 * @param callbackUrl   回调URL
 * @param sourceApplication     原始应用名称
 * @param annotation            附加数据
 */
WeChat.prototype.handleSSOCallback = function (sessionId, callbackUrl, sourceApplication, annotation)
{
    var self = this;
    if (callbackUrl.indexOf(this.appID() + "://") === 0 && callbackUrl.indexOf(this.appID() + "://pay") !== 0)
    {
        $mob.ext.ssdk_isConnectedPlatformSDK("WXApi",function(data)
        {
            if(data.result)
            {
                $mob.ext.isPluginRegisted("com.mob.sharesdk.connector.wechat", function (data) {

                    if (data.result)
                    {
                        //处理回调
                        $mob.ext.ssdk_wechatHandleSSOCalback(self.appID(), sessionId, callbackUrl, function (data) {

                            self._authHandler(sessionId, data);

                        });
                    }
                    else
                    {
                        self._handleSSOCallbackWithoutSDK(self.appID(), sessionId, callbackUrl);
                    }
                });
            }
            else
            {
                self._handleSSOCallbackWithoutSDK(self.appID(), sessionId, callbackUrl);
            }
        });
        
        return true;
    }
    
    return false;
};

WeChat.prototype._handleSSOCallbackWithoutSDK = function (appID, sessionId, callbackUrl)
{
    var self = this;
    if(callbackUrl.slice(0, "wx".length) === "wx")
    {
        if(callbackUrl.indexOf("://oauth") !== -1)
        {
            //获取到了code
            var regex = new RegExp('code=(.+?)&');
            var codeString = regex.exec(callbackUrl)[1];
            var callbackData = {"state":1,"code":codeString};
            self._authHandler(sessionId,callbackData);
        }
        else
        {
            //获取UIPasteboard取得并解析后的字典数据
            $mob.ext.ssdk_getDataFromPasteboard(appID, sessionId, callbackUrl,$mob.shareSDK.platformType.WeChat,function(data){

                //授权返回的数据
                if(data.result)
                {
                    if(data["retDic"]["state"] && (data["retDic"]["state"] === "Weixinauth") && (data["retDic"]["result"]!==0))
                    {
                        switch (parseInt(data["retDic"]["result"]))
                        {
                            case -2:
                            {
                                //取消
                                $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Cancel, data);
                            }
                                break;
                            default :
                            {
                                //失败
                                $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Fail, data);
                            }
                                break;
                        }
                    }
                }
            });
        }
    }
};

/**
 * 处理分享回调
 * @param sessionId     会话ID
 * @param callbackUrl   回调URL
 * @param sourceApplication     原始应用名称
 * @param annotation            附加数据
 */
WeChat.prototype.handleShareCallback = function (sessionId, callbackUrl, sourceApplication, annotation)
{
    var self = this;
    if (callbackUrl.indexOf(this.appID() + "://") === 0 && callbackUrl.indexOf(this.appID() + "://pay") !== 0)
    {
        $mob.ext.ssdk_isConnectedPlatformSDK("WXApi",function(data)
        {
            if(data.result)
            {
                $mob.ext.isPluginRegisted("com.mob.sharesdk.connector.wechat", function (data) {

                    if (data.result)
                    {
                        //处理回调
                        $mob.ext.ssdk_wechatHandleShareCalback(self.appID(), callbackUrl, function (data) {

                            self._getCurrentUser(function (user) {

                                //从分享内容集合中取出分享内容
                                var shareParams = WeChatShareContentSet [sessionId];
                                var content = null;
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
                                    case $mob.shareSDK.responseState.Fail:
                                        //失败
                                        var error = {
                                            "error_code" : $mob.shareSDK.errorCode.APIRequestFail,
                                            "user_data" :  {"error_code" : data.error_code}
                                        };

                                        $mob.native.ssdk_shareStateChanged(sessionId, $mob.shareSDK.responseState.Fail, error, user, userData);
                                        break;
                                    default :
                                        //取消
                                        $mob.native.ssdk_shareStateChanged(sessionId, $mob.shareSDK.responseState.Cancel, null, user, userData);
                                        break;
                                }

                                //移除分享参数集合中的数据
                                delete WeChatShareContentSet[sessionId];
                                WeChatShareContentSet[sessionId] = null;
                            });
                        });
                    }
                    else
                    {
                        self._handleShareCallbackWithoutSDK(self.appID(), sessionId, callbackUrl);
                    }
                });
            }
            else
            {
                self._handleShareCallbackWithoutSDK(self.appID(), sessionId, callbackUrl);
            }
        });


        return true;
    }

    return false;
};

WeChat.prototype._handleShareCallbackWithoutSDK = function (appID, sessionId, callbackUrl)
{
    var self = this;
    var resultData;
    var error;
    var urls;

    //获取UIPasteboard取得并解析后的字典数据
    $mob.ext.ssdk_getDataFromPasteboard(appID, sessionId, callbackUrl,$mob.shareSDK.platformType.WeChat,function(data){

        //授权返回的数据
        if(data.result)
        {
            self._getCurrentUser(function (user) {
                //从分享内容集合中取出分享内容
                var shareParams = WeChatShareContentSet [sessionId];
                var content = null;
                var userData = null;
                if (shareParams != null)
                {
                    content = shareParams ["content"];
                    userData = shareParams ["user_data"];
                }

                if(callbackUrl.slice(0, "wx".length) === "wx")
                {
                    switch (parseInt(data["retDic"]["result"]))
                    {
                        case 0:
                        {
                            //转换数据
                            resultData = {};
                            resultData["raw_data"] = content;
                            resultData["text"] = content["text"];

                            urls = [];
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
                        }
                            break;
                        case -2:
                        {
                            //取消
                            $mob.native.ssdk_shareStateChanged(sessionId, $mob.shareSDK.responseState.Cancel, null, user, userData);
                        }
                            break;
                        case  1:
                        {
                            //App分享后留在微信,并点击链接框返回,应同样视为分享成功
                            if(data["retDic"]["objectType"] === 7)
                            {
                                //转换数据
                                resultData = {};
                                resultData["raw_data"] = content;
                                resultData["text"] = content["text"];

                                urls = [];
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
                            }
                            else
                            {
                                //失败
                                error = {
                                    "error_code" : $mob.shareSDK.errorCode.APIRequestFail,
                                    "user_data" :  {"error_code" : data.error_code}
                                };
                                $mob.native.ssdk_shareStateChanged(sessionId, $mob.shareSDK.responseState.Fail, error, user, userData);
                            }
                        }
                            break;
                        default :
                        {
                            //失败
                            error = {
                                "error_code" : $mob.shareSDK.errorCode.APIRequestFail,
                                "user_data" :  {"error_code" : data.error_code}
                            };

                            $mob.native.ssdk_shareStateChanged(sessionId, $mob.shareSDK.responseState.Fail, error, user, userData);
                        }
                            break;
                    }
                }
            });
        }
    });
};

/**
 * 刷新Access Token
 * @param user      当前的用户信息
 * @param callback  方法回调, 回调方法声明如下:function (data);
 */
WeChat.prototype._refreshAccessToken = function(user, callback)
{
    var error = null;
    if(user != null && user.credential.raw_data.refresh_token != null)
    {
        var refreshToken =  user.credential.raw_data.refresh_token;
        var params = {
            "appid" : this.appID(),
            "grant_type" : "refresh_token",
            "refresh_token" : refreshToken
        };

        var refreshTokenUrl = "https://api.weixin.qq.com/sns/oauth2/refresh_token";
        $mob.ext.ssdk_callHTTPApi($mob.shareSDK.platformType.WeChatSession, null, refreshTokenUrl, "GET", params, null, function (data) {

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
                    var response = $mob.utils.jsonStringToObject($mob.utils.base64Decode(data["response_data"]));
                    if (response.errcode == null)
                    {
                        //成功
                        var res = {};
                        res["newCredential"] = response;
                        if(callback)
                        {
                            callback(res);
                        }
                    }
                    else
                    {
                        //连refresh都过期了或refreshToken无效等错误
                        error = {
                            "error_code" : $mob.shareSDK.errorCode.APIRequestFail,
                            "user_data" : response
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
WeChat.prototype.callApi = function (url, method, params, headers, callback)
{
    //获取当前用户信息
    var error = null;
    var self = this;

    this._getCurrentUser(function (user) {

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
            $mob.ext.ssdk_callHTTPApi($mob.shareSDK.platformType.WeChatSession, null, url, method, params, headers, function (data) {

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
                        if (data ["status_code"] === 200 && response["errcode"] == null)
                        {
                            //成功
                            if (callback)
                            {
                                callback ($mob.shareSDK.responseState.Success, response);
                            }
                        }
                        else
                        {
                            //42001为access_token过期,调用refreshToken
                            if(response.errcode === 42001)
                            {
                                self._refreshAccessToken(user, function(data){

                                    if(data.newCredential != null)
                                    {
                                        var cred = data.newCredential;
                                        //更新user字段
                                        var uid = null;
                                        if(self.backUnionid())
                                        {
                                            uid = cred['unionid'];
                                        }
                                        if(uid == null)
                                        {
                                            uid = cred['openid'];
                                        }
                                        user.credential["uid"] = uid;
                                        user.credential["token"] = cred["access_token"];
                                        user.credential["expired"] = cred["expires_in"];

                                        user.credential.raw_data["access_token"] = cred["access_token"];
                                        user.credential.raw_data["expires_in"] = cred["expires_in"];
                                        user.credential.raw_data["openid"] = cred["openid"];
                                        user.credential.raw_data["refresh_token"] = cred["refresh_token"];
                                        user.credential.raw_data["scope"] = cred["scope"];
                                        //设定新的用户(更新了credential字段信息)并重新发起一次相同的请求
                                        self._setCurrentUser(user, function(){
                                            self.callApi(url,method,params,headers,callback);
                                        });
                                    }
                                    else
                                    {
                                        //在refresh token时也发生了错
                                        var code = $mob.shareSDK.errorCode.UserUnauth;
                                        //失败
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
                                //其他原因引起的失败
                                var code = $mob.shareSDK.errorCode.APIRequestFail;
                                switch (response.errcode)
                                {
                                    case 40001:
                                    case 40014:
                                    case 40029:
                                    case 41001:
                                    case 41008:
                                    case 42003:
                                        code = $mob.shareSDK.errorCode.UserUnauth;
                                        break;
                                }
                                //失败
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
WeChat.prototype.createUserByRawData = function (rawData)
{
    //转换用户数据
    var user = {
        "platform_type" : this.type()
    };
    this._updateUserInfo(user, rawData);
    return $mob.utils.objectToJsonString(user);
};

/**
 * 授权状态改变
 * @param sessionId         会话标识
 * @param data              返回数据
 * @private
 */
WeChat.prototype.authStateChanged = function (sessionId, data)
{
    this._authHandler(sessionId, data);
};

/**
 * 转换链接
 * @param contents      内容列表
 * @param callback      回调
 * @private
 */
WeChat.prototype._convertUrl = function (platformType ,contents, callback)
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
 * 授权处理
 * @param sessionId         会话标识
 * @param data              返回数据
 * @private
 */
WeChat.prototype._authHandler = function (sessionId, data)
{
    if (data.state == null)
    {
        //被视为丢弃的回调
        return;
    }
    
    var self = this;
    var error;
    switch (data.state)
    {
        case $mob.shareSDK.responseState.Success:
        {
            var code = data.code;
            var params = {
                "appid" : self.appID(),
                "secret" : self.appSecret(),
                "code" : code,
                "grant_type" : "authorization_code"
            };

            //获取AccessToken
            $mob.ext.ssdk_callHTTPApi($mob.shareSDK.platformType.WeChatSession, null, "https://api.weixin.qq.com/sns/oauth2/access_token", "GET", params, null, function (data) {

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
                        if (response.errcode == null)
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

            break;
        }
        case $mob.shareSDK.responseState.Fail:
        {
            //授权失败
            if(data.error_code != null)
            {
                error = {
                    "error_code" : data.error_code,
                    "user_data" :  data
                };
            }
            else
            {
                error = {
                    "error_code" : $mob.shareSDK.errorCode.APIRequestFail,
                    "user_data" :  {"error_code" : data.error_code}
                };
            }
            
            $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Fail, error);
            break;
        }
            
        default :
            $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Cancel, null);
            $mob.native.ssdk_plugin_wechat_cancel_auth(sessionId);
            break;
    }
};

/**
 * 检测应用信息中的授权信息
 * @param appInfo   应用信息
 * @private
 */
WeChat.prototype._checkAuthScopes = function (appInfo)
{
    return appInfo [WeChatAppInfoKeys.Scopes];
};

/**
 * 检测应用信息有效性
 * @param appInfo   应用信息
 * @private
 */
WeChat.prototype._checkAppInfoAvailable = function (appInfo)
{
    var appKey = $mob.utils.trim(appInfo [WeChatAppInfoKeys.AppId]);
    var appSecret = $mob.utils.trim(appInfo [WeChatAppInfoKeys.AppSecret]);
    
    if (appKey != null)
    {
        appInfo [WeChatAppInfoKeys.AppId] = appKey;
    }
    else
    {
        appInfo [WeChatAppInfoKeys.AppId] = this.appID();
    }
    
    if (appSecret != null)
    {
        appInfo [WeChatAppInfoKeys.AppSecret] = appSecret;
    }
    else
    {
        appInfo [WeChatAppInfoKeys.AppSecret] = this.appSecret();
    }

    return appInfo;
};

/**
 * 判断是否能够进行授权
 * @returns {boolean} true 表示可以，否则不可以
 * @private
 */
WeChat.prototype._canAuthorize = function ()
{
    $mob.native.log($mob.utils.objectToJsonString(this._appInfo));
    
    if (this.appID() != null && this.appSecret() != null)
    {
        return true;
    }

    $mob.native.log("[ShareSDK-WARNING] [" + this.name() + "]应用信息有误，不能进行相关操作。请检查本地代码中和服务端的[" + this.name() + "]平台应用配置是否有误! " +
        "\n配置:" + $mob.utils.objectToJsonString(this._appInfo));

    return false;
};

/**
 * 判断是否能够进行分享
 * @private
 */
WeChat.prototype._canShare = function ()
{
    if (this.appID() != null)
    {
        return true;
    }
    
    $mob.native.log("[ShareSDK-WARNING] [" + this.name() + "]应用信息有误，不能进行相关操作。请检查本地代码中和服务端的[" + this.name() + "]平台应用配置是否有误! " +
        "\n配置:" + $mob.utils.objectToJsonString(this._appInfo));

    return false;
};

/**
 * 检测是否配置URL Scheme
 * @param callback 方法回调
 * @private
 */
WeChat.prototype._checkUrlScheme = function (callback)
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
                        if (schema === self.appID())
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
            $mob.native.log("[ShareSDK-WARNING] 尚未配置[" + self.name() + "]URL Scheme:" + self.appID() + ", 无法使用进行授权。");
        }

        if (callback != null)
        {
            callback (hasReady, urlScheme);
        }
    });
};

/**
 * 分享内容
 * @param sessionId         会话标识
 * @param parameters        分享参数
 * @param userData          用户数据
 * @param callback          回调
 * @private
 */
WeChat.prototype._share = function (sessionId, parameters, userData, callback)
{
    var text = null;
    var title = null;
    var thumbImage = null;
    var hd_thumb_image = null;
    var images = null;
    var url = null;
    var error_message;
    var error = null;
    var scene = parameters ["wechat_scene"];

    if (scene == null)
    {
        scene = WeChatScene.Session;
    }

    var platformType = $mob.shareSDK.platformType.Unknown;
    switch (scene)
    {
        case WeChatScene.Session:
            platformType = $mob.shareSDK.platformType.WeChatSession;
            break;
        case WeChatScene.Timeline:
            platformType = $mob.shareSDK.platformType.WeChatTimeline;
            break;
        case WeChatScene.Fav:
            platformType = $mob.shareSDK.platformType.WeChatFav;
            break;
    }

    var self = this;
    var type = $mob.shareSDK.getShareParam(platformType, parameters, "type");
    if (type == null)
    {
        type = $mob.shareSDK.contentType.Auto;
    }
    if (type === $mob.shareSDK.contentType.Auto)
    {
        type = this._getShareType(parameters, platformType);
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
                    $mob.ext.ssdk_wechatShareText(self.appID(), scene, text, function (data) {

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
                            var shareParams = {"platform" : platformType, "scene" : scene, "text" : text};
                            WeChatShareContentSet [sessionId] = {"content" : shareParams, "user_data" : userData};
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
            text = $mob.shareSDK.getShareParam(platformType, parameters, "text");
            title = $mob.shareSDK.getShareParam(platformType, parameters, "title");
            thumbImage = $mob.shareSDK.getShareParam(platformType, parameters, "thumb_image");
            var image = null;
            var emoticonData = $mob.shareSDK.getShareParam(platformType, parameters, "emoticon_data");

            images = $mob.shareSDK.getShareParam(platformType, parameters, "images");
            if (Object.prototype.toString.apply(images) === '[object Array]')
            {
                //取第一张图片进行分享
                image = images [0];
            }

            if (image != null || emoticonData != null)
            {
                this._convertUrl(platformType ,[text], function (data) {

                    text = data.result[0];
                    $mob.ext.ssdk_wechatShareImage(self.appID(), scene, title, text, thumbImage, image, emoticonData, function (data){

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
                            var shareParams = {"platform" : platformType, "scene" : scene, "text" : text, "title" : title, "thumb_image" : thumbImage, "image" : image};
                            WeChatShareContentSet [sessionId] = {"content" : shareParams, "user_data" : userData};
                        }
                    });
                });
            }
            else
            {
                error_message = null;
                
                if(this._currentLanguage === "zh-Hans")
                {
                    error_message = "分享参数image或emoticon不能为空!";
                }
                else
                {
                    error_message = "share param image or emoticon can not be nil!";
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

            if (thumbImage != null && url != null)
            {
                this._convertUrl(platformType ,[text, url], function (data) {

                    text = data.result[0];
                    url = data.result[1];

                    $mob.ext.ssdk_wechatShareWebpage(self.appID(), scene, title, text, thumbImage, url, function (data) {

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
                            var shareParams = {"platform" : platformType, "scene" : scene, "text" : text, "title" : title, "thumb_image" : thumbImage, "url" : url};
                            WeChatShareContentSet [sessionId] = {"content" : shareParams, "user_data" : userData};
                        }
                    });
                });
            }
            else
            {
                error_message = null;
                
                if(this._currentLanguage === "zh-Hans")
                {
                    error_message = "分享参数thumbImage或url不能为空!";
                }
                else
                {
                    error_message = "share param thumbImage or url can not be nil!";
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
        case $mob.shareSDK.contentType.App:
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
            var extInfo = $mob.shareSDK.getShareParam(platformType, parameters, "ext_info");
            var fileData = $mob.shareSDK.getShareParam(platformType, parameters, "file_data");

            if (thumbImage != null && url != null)
            {
                this._convertUrl(platformType ,[text, url], function(data) {

                    text = data.result[0];
                    url = data.result[1];

                    $mob.ext.ssdk_wechatShareApp(self.appID(), scene, title, text, thumbImage, url, extInfo, fileData, function (data) {

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
                            var shareParams = {"platform" : platformType, "scene" : scene, "text" : text, "title" : title, "thumb_image" : thumbImage, "url" : url, "ext_info" : extInfo};
                            WeChatShareContentSet [sessionId] = {"content" : shareParams, "user_data" : userData};
                        }
                    });
                });
            }
            else
            {
                error_message = null;
                
                if(this._currentLanguage === "zh-Hans")
                {
                    error_message = "分享参数thumbImage或url不能为空!";
                }
                else
                {
                    error_message = "share param thumbImage or url can not be nil!";
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
            var musicUrl = $mob.shareSDK.getShareParam(platformType, parameters, "audio_url");

            if (thumbImage != null && url != null)
            {
                this._convertUrl(platformType , [text, url, musicUrl], function (data) {

                    text = data.result[0];
                    url = data.result[1];
                    musicUrl = data.result[2];

                    $mob.ext.ssdk_wechatShareAudio(self.appID(), scene, title, text, thumbImage, url, musicUrl, function (data) {

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
                            var shareParams = {"platform" : platformType, "scene" : scene, "text" : text, "title" : title, "thumb_image" : thumbImage, "url" : url, "audio_url" : musicUrl};
                            WeChatShareContentSet [sessionId] = {"content" : shareParams, "user_data" : userData};
                        }
                    });
                });
            }
            else
            {
                error_message = null;
                
                if(this._currentLanguage === "zh-Hans")
                {
                    error_message = "分享参数thumbImage或url不能为空!";
                }
                else
                {
                    error_message = "share param thumbImage or url can not be nil!";
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

            if (thumbImage != null && url != null)
            {
                this._convertUrl(platformType , [text, url], function (data) {

                    text = data.result[0];
                    url = data.result[1];

                    $mob.ext.ssdk_wechatShareVideo(self.appID(), scene, title, text, thumbImage, url, function (data) {

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
                            var shareParams = {"platform" : platformType, "scene" : scene, "text" : text, "title" : title, "thumb_image" : thumbImage, "url" : url};
                            WeChatShareContentSet [sessionId] = {"content" : shareParams, "user_data" : userData};
                        }
                    });
                });
            }
            else
            {
                error_message = null;
                
                if(this._currentLanguage === "zh-Hans")
                {
                    error_message = "分享参数thumbImage或url不能为空!";
                }
                else
                {
                    error_message = "share param thumbImage or url can not be nil!";
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
        case $mob.shareSDK.contentType.File:
        {
            if (platformType === $mob.shareSDK.platformType.WeChatTimeline)
            {
                error_message = null;
                
                if(this._currentLanguage === "zh-Hans")
                {
                    error_message = "微信文件分享不支持分享到朋友圈";
                }
                else
                {
                    error_message = "WeChatTimeline unsupport sharing file!";
                }
                
                error = {
                    "error_code" : $mob.shareSDK.errorCode.UnsupportContentType,
                    "error_message" : error_message
                };

                if (callback != null)
                {
                    callback ($mob.shareSDK.responseState.Fail, error, null, userData);
                }
             }
            else
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

                var fileExtension = $mob.shareSDK.getShareParam(platformType, parameters, "source_extension");
                var sourceFile = $mob.shareSDK.getShareParam(platformType, parameters, "source_file");

                if(thumbImage != null && fileExtension != null && sourceFile != null)
                {
                    
                    this._convertUrl(platformType ,[text], function(data) {

                        text = data.result[0];

                        $mob.ext.ssdk_wechatShareFile(self.appID(), scene, title, text, thumbImage, fileExtension, sourceFile, function(data) {

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
                                var shareParams = {"platform" : platformType, "scene" : scene, "text" : text, "title" : title, "thumb_image" : thumbImage, "source_extension" : fileExtension ,"source_file" : sourceFile};
                                WeChatShareContentSet [sessionId] = {"content" : shareParams, "user_data" : userData};
                            }
                        });
                    });
                }
                else
                {
                   
                    error_message = null;
                
                    if(this._currentLanguage === "zh-Hans")
                    {
                        error_message = "分享参数thumbImage、sourceFileExtension、sourceFileData不能为空";
                    }
                    else
                    {
                        error_message = "Share param thumbImage、sourceFileExtension、sourceFileData can not be!";
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
            
            break;
        }
        case $mob.shareSDK.contentType.MiniProgram:
        {
            var webpageUrl = $mob.shareSDK.getShareParam(platformType, parameters, "url");
            var userName = $mob.shareSDK.getShareParam(platformType, parameters, "wxmp_user_name");
            if (webpageUrl != null && userName != null)
            {
                text = $mob.shareSDK.getShareParam(platformType, parameters, "text");
                title = $mob.shareSDK.getShareParam(platformType, parameters, "title");
                thumbImage = $mob.shareSDK.getShareParam(platformType, parameters, "thumb_image");
                hd_thumb_image = $mob.shareSDK.getShareParam(platformType, parameters, "wxmp_hdthumbimage");
                if (thumbImage == null)
                {
                    images = $mob.shareSDK.getShareParam(platformType, parameters, "images");
                    if (Object.prototype.toString.apply(images) === '[object Array]')
                    {
                        //取第一张图片进行分享
                        thumbImage = images [0];
                    }
                }
                var path = $mob.shareSDK.getShareParam(platformType, parameters, "wxmp_path");
                var withTicket = $mob.shareSDK.getShareParam(platformType, parameters, "wxmp_with_ticket");
                var mpType = $mob.shareSDK.getShareParam(platformType, parameters, "wxmp_type");
                
                this._convertUrl(platformType , [text, url], function (data) {

                    text = data.result[0];
                    url = data.result[1];

                    $mob.ext.ssdk_wechatShareMiniProgram(self.appID(), scene, title, text, thumbImage, hd_thumb_image, userName, path, webpageUrl, withTicket, mpType, function (data) {

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
                            var shareParams = {"platform" : platformType, "scene" : scene, "text" : text, "title" : title, "thumb_image" : thumbImage, "userName" : userName , "path" : path , "url" : webpageUrl};
                            WeChatShareContentSet [sessionId] = {"content" : shareParams, "user_data" : userData};
                        }
                    });
                });
            }
            else
            {
                error_message = null;
                
                if(this._currentLanguage === "zh-Hans")
                {
                    error_message = "分享参数webpageUrl或userName不能为空!";
                }
                else
                {
                    error_message = "share param webpageUrl or userName can not be nil!";
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

WeChat.prototype._shareWithoutSDK = function (sessionId, parameters, userData, callback)
{
    var text = null;
    var title = null;
    var thumbImage = null;
    var images = null;
    var url = null;
    var error = null;
    var scene = parameters ["wechat_scene"];
    var error_message;

    if (scene == null)
    {
        scene = WeChatScene.Session;
    }

    var platformType = $mob.shareSDK.platformType.Unknown;
    switch (scene)
    {
        case WeChatScene.Session:
            platformType = $mob.shareSDK.platformType.WeChatSession;
            break;
        case WeChatScene.Timeline:
            platformType = $mob.shareSDK.platformType.WeChatTimeline;
            break;
        case WeChatScene.Fav:
            platformType = $mob.shareSDK.platformType.WeChatFav;
            break;
    }

    var self = this;
    var type = $mob.shareSDK.getShareParam(platformType, parameters, "type");
    if (type == null)
    {
        type = $mob.shareSDK.contentType.Auto;
    }
    if (type === $mob.shareSDK.contentType.Auto)
    {
        type = this._getShareType(parameters, platformType);
    }

    //构造分享参数
    var shareParameter = {"result":"1","returnFromApp":"0","scene":String(scene),"sdkver":"1.8.1","command":"1010"};

    switch (type) {
        case $mob.shareSDK.contentType.Text:
        {
            text = $mob.shareSDK.getShareParam(platformType, parameters, "text");
            if (text != null)
            {
                this._convertUrl(platformType ,[text], function (data) {

                    text = data.result[0];

                    shareParameter["command"] = "1020";
                    shareParameter["title"] = text?text:"";

                    //记录分享内容
                    var shareParams = {"platform" : platformType, "scene" : scene, "text" : text};
                    WeChatShareContentSet [sessionId] = {"content" : shareParams, "user_data" : userData};

                    //数据传递给UIPasteboard
                    $mob.ext.ssdk_setDataToPasteboard($mob.shareSDK.platformType.WeChat , self.appID(), shareParameter , sessionId,function(data){
                        if(data.result)
                        {
                            //构造跳转链接
                            var urlstring = "weixin://app/" + self.appID() + "/sendreq/?";
                            $mob.ext.canOpenURL(urlstring,function(data){
                                if (data.result)
                                {
                                    $mob.native.openURL(urlstring);
                                }
                                else
                                {
                                    var error_message = "客户端版本过低无法进行分享";
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
            text = $mob.shareSDK.getShareParam(platformType, parameters, "text");
            title = $mob.shareSDK.getShareParam(platformType, parameters, "title");
            thumbImage = $mob.shareSDK.getShareParam(platformType, parameters, "thumb_image");
            var image = null;
            var emoticonData = $mob.shareSDK.getShareParam(platformType, parameters, "emoticon_data");

            images = $mob.shareSDK.getShareParam(platformType, parameters, "images");
            if (Object.prototype.toString.apply(images) === '[object Array]')
            {
                //取第一张图片进行分享
                image = images [0];
            }

            if (image != null || emoticonData != null)
            {
                this._convertUrl(platformType ,[text], function (data) {
                    text = data.result[0];
                    if(emoticonData != null)
                    {
                        $mob.ext.ssdk_getImageData(emoticonData,thumbImage,$mob.shareSDK.platformType.WeChat,function(data){
                            if(data.result)
                            {
                                var emoData = data.returnData["image"];
                                var thumbData = data.returnData["thumbImage"];

                                //发送动态图片
                                shareParameter["title"] = title?title:"";
                                shareParameter["fileData"] = emoData;
                                shareParameter["thumbData"] = thumbData;
                                shareParameter["objectType"] = "8";

                                //记录分享内容
                                var shareParams = {"platform" : platformType, "scene" : scene, "text" : text, "title" : title, "thumb_image" : thumbImage, "image" : emoticonData};
                                WeChatShareContentSet [sessionId] = {"content" : shareParams, "user_data" : userData};

                                //数据传递给UIPasteboard
                                $mob.ext.ssdk_setDataToPasteboard($mob.shareSDK.platformType.WeChat , self.appID(), shareParameter , sessionId,function(data){
                                    if(data.result)
                                    {
                                        //构造跳转链接
                                        var urlstring = "weixin://app/" + self.appID() + "/sendreq/?";
                                        $mob.ext.canOpenURL(urlstring,function(data){
                                            if (data.result)
                                            {
                                                $mob.native.openURL(urlstring);
                                            }
                                            else
                                            {
                                                var error_message = "客户端版本过低无法进行分享";
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
                    else
                    {
                        $mob.ext.ssdk_getImageData(image,thumbImage,$mob.shareSDK.platformType.WeChat,function(data){

                            if(data.result)
                            {
                                //$mob.native.log("self.appID()"+ self.appID());
                                //$mob.native.log("ssdk_getImageData" + data.returnData + " " + data.returnData["image"] );
                                //$mob.native.log("ssdk_getImageData" + data.returnData["thumbImage"]);
                                //图片
                                shareParameter["fileData"] = data.returnData["image"];
                                shareParameter["thumbData"] = data.returnData["thumbImage"];
                                shareParameter["objectType"] = "2";

                                //记录分享内容
                                var shareParams = {"platform" : platformType, "scene" : scene, "text" : text, "title" : title, "thumb_image" : thumbImage, "image" : image};
                                WeChatShareContentSet [sessionId] = {"content" : shareParams, "user_data" : userData};

                                //数据传递给UIPasteboard
                                $mob.ext.ssdk_setDataToPasteboard($mob.shareSDK.platformType.WeChat , self.appID(), shareParameter , sessionId,function(data){
                                    if(data.result)
                                    {
                                        //构造跳转链接
                                        var urlstring = "weixin://app/" + self.appID() + "/sendreq/?";
                                        $mob.ext.canOpenURL(urlstring,function(data){
                                            if (data.result)
                                            {
                                                $mob.native.openURL(urlstring);
                                            }
                                            else
                                            {
                                                var error_message = "客户端版本过低无法进行分享";
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
                });
            }
            else
            {
                error_message = null;

                if(this._currentLanguage === "zh-Hans")
                {
                    error_message = "分享参数image或emoticon不能为空!";
                }
                else
                {
                    error_message = "share param image or emoticon can not be nil!";
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

            if (thumbImage != null && url != null)
            {
                this._convertUrl(platformType ,[text, url], function (data) {

                    text = data.result[0];
                    url = data.result[1];

                    $mob.ext.ssdk_getImageData(null,thumbImage,$mob.shareSDK.platformType.WeChat,function(data){

                        if(data.result)
                        {
                            shareParameter["description"] = text?text:"";
                            shareParameter["mediaUrl"] = url?url:"";
                            shareParameter["objectType"] = "5";
                            shareParameter["thumbData"] = data.returnData["thumbImage"];
                            shareParameter["title"] = title?title:"";

                            //记录分享内容
                            var shareParams = {"platform" : platformType, "scene" : scene, "text" : text, "title" : title, "thumb_image" : thumbImage, "url" : url};
                            WeChatShareContentSet [sessionId] = {"content" : shareParams, "user_data" : userData};

                            //数据传递给UIPasteboard
                            $mob.ext.ssdk_setDataToPasteboard($mob.shareSDK.platformType.WeChat , self.appID(), shareParameter , sessionId,function(data){
                                if(data.result)
                                {
                                    //构造跳转链接
                                    var urlstring = "weixin://app/" + self.appID() + "/sendreq/?";
                                    $mob.ext.canOpenURL(urlstring,function(data){
                                        if (data.result)
                                        {
                                            $mob.native.openURL(urlstring);
                                        }
                                        else
                                        {
                                            var error_message = "客户端版本过低无法进行分享";
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
            }
            else
            {
                error_message = null;

                if(this._currentLanguage === "zh-Hans")
                {
                    error_message = "分享参数thumbImage或url不能为空!";
                }
                else
                {
                    error_message = "share param thumbImage or url can not be nil!";
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
        case $mob.shareSDK.contentType.App:
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
            var extInfo = $mob.shareSDK.getShareParam(platformType, parameters, "ext_info");
            var fileData = $mob.shareSDK.getShareParam(platformType, parameters, "file_data");

            if (thumbImage != null && url != null)
            {
                this._convertUrl(platformType ,[text, url], function(data) {

                    text = data.result[0];
                    url = data.result[1];

                    $mob.ext.ssdk_getImageData(fileData,thumbImage,$mob.shareSDK.platformType.WeChat,function(data){

                        if(data.result)
                        {
                            shareParameter["description"] = text?text:"";
                            if(extInfo)
                            {
                                shareParameter["extInfo"] = extInfo;
                            }
                            shareParameter["fileData"] = data.returnData["image"];
                            shareParameter["mediaUrl"] = url?url:"";
                            shareParameter["objectType"] = "7";
                            shareParameter["thumbData"] = data.returnData["thumbImage"];
                            shareParameter["title"] = title?title:"";

                            //记录分享内容
                            var shareParams = {"platform" : platformType, "scene" : scene, "text" : text, "title" : title, "thumb_image" : thumbImage, "url" : url, "ext_info" : extInfo};
                            WeChatShareContentSet [sessionId] = {"content" : shareParams, "user_data" : userData};

                            //数据传递给UIPasteboard
                            $mob.ext.ssdk_setDataToPasteboard($mob.shareSDK.platformType.WeChat , self.appID(), shareParameter , sessionId,function(data){
                                if(data.result)
                                {
                                    //构造跳转链接
                                    var urlstring = "weixin://app/" + self.appID() + "/sendreq/?";
                                    $mob.ext.canOpenURL(urlstring,function(data){
                                        if (data.result)
                                        {
                                            $mob.native.openURL(urlstring);
                                        }
                                        else
                                        {
                                            var error_message = "客户端版本过低无法进行分享";
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
            }
            else
            {
                error_message = null;

                if(this._currentLanguage === "zh-Hans")
                {
                    error_message = "分享参数thumbImage或url不能为空!";
                }
                else
                {
                    error_message = "share param thumbImage or url can not be nil!";
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
            var musicUrl = $mob.shareSDK.getShareParam(platformType, parameters, "audio_url");

            if (thumbImage != null && url != null)
            {
                this._convertUrl(platformType ,[text, url, musicUrl], function (data) {

                    text = data.result[0];
                    url = data.result[1];
                    musicUrl = data.result[2];

                    $mob.ext.ssdk_getImageData(null,thumbImage,$mob.shareSDK.platformType.WeChat,function(data){

                        if(data.result)
                        {
                            //music
                            shareParameter["description"] = text?text:"";
                            shareParameter["mediaUrl"] = url?url:"";
                            shareParameter["mediaDataUrl"] = musicUrl?musicUrl:"";
                            shareParameter["objectType"] = "3";
                            shareParameter["thumbData"] = data.returnData["thumbImage"];
                            shareParameter["title"] = title?title:"";

                            //记录分享内容
                            var shareParams = {"platform" : platformType, "scene" : scene, "text" : text, "title" : title, "thumb_image" : thumbImage, "url" : url, "audio_url" : musicUrl};
                            WeChatShareContentSet [sessionId] = {"content" : shareParams, "user_data" : userData};

                            //数据传递给UIPasteboard
                            $mob.ext.ssdk_setDataToPasteboard($mob.shareSDK.platformType.WeChat , self.appID(), shareParameter , sessionId,function(data){
                                if(data.result)
                                {
                                    //构造跳转链接
                                    var urlstring = "weixin://app/" + self.appID() + "/sendreq/?";
                                    $mob.ext.canOpenURL(urlstring,function(data){
                                        if (data.result)
                                        {
                                            $mob.native.openURL(urlstring);
                                        }
                                        else
                                        {
                                            var error_message = "客户端版本过低无法进行分享";
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
            }
            else
            {
                error_message = null;

                if(this._currentLanguage === "zh-Hans")
                {
                    error_message = "分享参数thumbImage或url不能为空!";
                }
                else
                {
                    error_message = "share param thumbImage or url can not be nil!";
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

            if (thumbImage != null && url != null)
            {
                this._convertUrl(platformType ,[text, url], function (data) {

                    text = data.result[0];
                    url = data.result[1];

                    $mob.ext.ssdk_getImageData(null,thumbImage,$mob.shareSDK.platformType.WeChat,function(data){

                        if(data.result)
                        {
                            //video
                            shareParameter["description"] = text?text:"";
                            shareParameter["mediaUrl"]= url?url:"";
                            shareParameter["objectType"] = "4";
                            shareParameter["thumbData"]= data.returnData["thumbImage"];
                            shareParameter["title"] = title?title:"";

                            //记录分享内容
                            var shareParams = {"platform" : platformType, "scene" : scene, "text" : text, "title" : title, "thumb_image" : thumbImage, "url" : url};
                            WeChatShareContentSet [sessionId] = {"content" : shareParams, "user_data" : userData};

                            //数据传递给UIPasteboard
                            $mob.ext.ssdk_setDataToPasteboard($mob.shareSDK.platformType.WeChat , self.appID(), shareParameter , sessionId,function(data){
                                if(data.result)
                                {
                                    //构造跳转链接
                                    var urlstring = "weixin://app/" + self.appID() + "/sendreq/?";
                                    $mob.ext.canOpenURL(urlstring,function(data){
                                        if (data.result)
                                        {
                                            $mob.native.openURL(urlstring);
                                        }
                                        else
                                        {
                                            var error_message = "客户端版本过低无法进行分享";
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
            }
            else
            {
                error_message = null;

                if(this._currentLanguage === "zh-Hans")
                {
                    error_message = "分享参数thumbImage或url不能为空!";
                }
                else
                {
                    error_message = "share param thumbImage or url can not be nil!";
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
        case $mob.shareSDK.contentType.File:
        {
            if (platformType === $mob.shareSDK.platformType.WeChatTimeline)
            {
                error_message = null;

                if(this._currentLanguage === "zh-Hans")
                {
                    error_message = "微信文件分享不支持分享到朋友圈";
                }
                else
                {
                    error_message = "WeChatTimeline unsupport sharing file!";
                }

                error = {
                    "error_code" : $mob.shareSDK.errorCode.UnsupportContentType,
                    "error_message" : error_message
                };

                if (callback != null)
                {
                    callback ($mob.shareSDK.responseState.Fail, error, null, userData);
                }
            }
            else
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

                var fileExtension = $mob.shareSDK.getShareParam(platformType, parameters, "source_extension");
                var sourceFile = $mob.shareSDK.getShareParam(platformType, parameters, "source_file");

                if(thumbImage != null && fileExtension != null && sourceFile != null)
                {
                    this._convertUrl(platformType ,[text], function(data) {

                        text = data.result[0];
                        $mob.ext.ssdk_getImageData(sourceFile,thumbImage,$mob.shareSDK.platformType.WeChat,function(data){
                            
                            if(data.result)
                            {
                                //file
                                shareParameter["description"] = text?text:"";
                                shareParameter["fileData"] = data.returnData["image"];
                                shareParameter["objectType"] = "6";
                                shareParameter["fileExt"] = fileExtension?fileExtension:"";
                                shareParameter["thumbData"] = data.returnData["thumbImage"];
                                shareParameter["title"] = title?title:"";

                                //记录分享内容
                                var shareParams = {"platform" : platformType, "scene" : scene, "text" : text, "title" : title, "thumb_image" : thumbImage, "source_extension" : fileExtension ,"source_file" : sourceFile};
                                WeChatShareContentSet [sessionId] = {"content" : shareParams, "user_data" : userData};

                                //数据传递给UIPasteboard
                                $mob.ext.ssdk_setDataToPasteboard($mob.shareSDK.platformType.WeChat , self.appID(), shareParameter , sessionId,function(data){
                                    if(data.result)
                                    {
                                        //构造跳转链接
                                        var urlstring = "weixin://app/" + self.appID() + "/sendreq/?";
                                        $mob.ext.canOpenURL(urlstring,function(data){
                                            if (data.result)
                                            {
                                                $mob.native.openURL(urlstring);
                                            }
                                            else
                                            {
                                                var error_message = "客户端版本过低无法进行分享";
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
                }
                else
                {

                    error_message = null;

                    if(this._currentLanguage === "zh-Hans")
                    {
                        error_message = "分享参数thumbImage、sourceFileExtension、sourceFileData不能为空";
                    }
                    else
                    {
                        error_message = "Share param thumbImage、sourceFileExtension、sourceFileData can not be!";
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

            break;
        }
        case $mob.shareSDK.contentType.MiniProgram:
        {
            var webpageUrl = $mob.shareSDK.getShareParam(platformType, parameters, "url");
            var userName = $mob.shareSDK.getShareParam(platformType, parameters, "wxmp_user_name");
            if (webpageUrl != null && userName != null)
            {
                text = $mob.shareSDK.getShareParam(platformType, parameters, "text");
                title = $mob.shareSDK.getShareParam(platformType, parameters, "title");
                var path = $mob.shareSDK.getShareParam(platformType, parameters, "wxmp_path");
                var withTicket = $mob.shareSDK.getShareParam(platformType, parameters, "wxmp_with_ticket");
                var mpType = $mob.shareSDK.getShareParam(platformType, parameters, "wxmp_type");
                this._convertUrl( platformType ,[text, url], function (data) {
                    text = data.result[0];
                    url = data.result[1];
                    if(path != null)
                    {
                        shareParameter.appBrandPath = path;
                    }
                    shareParameter.appBrandUserName = userName;
                    shareParameter.mediaUrl = webpageUrl;
                    shareParameter.objectType = "36";
                    shareParameter.description = text;
                    shareParameter.title = title;
                    shareParameter.withShareTicket = withTicket;
                    shareParameter.miniprogramType = mpType;

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
                    if(thumbImage == null)
                    {
                        var shareParams = {"platform" : platformType, "scene" : scene, "text" : text, "title" : title, "thumb_image" : thumbImage, "userName" : userName , "path" : path , "url" : webpageUrl};
                        WeChatShareContentSet [sessionId] = {"content" : shareParams, "user_data" : userData};
                        $mob.ext.ssdk_setDataToPasteboard($mob.shareSDK.platformType.WeChat , self.appID(), shareParameter , sessionId,function(data){
                            if(data.result)
                            {
                                //构造跳转链接
                                var urlstring = "weixin://app/" + self.appID() + "/sendreq/?";
                                $mob.ext.canOpenURL(urlstring,function(data){
                                    if (data.result)
                                    {
                                        $mob.native.openURL(urlstring);
                                    }
                                    else
                                    {
                                        var error_message = "客户端版本过低无法进行分享";
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
                    else
                    {
                        $mob.ext.ssdk_getImageData(null,thumbImage,$mob.shareSDK.platformType.WeChat,function(data){
                            if(data.result)
                            {
                                shareParameter.thumbData = data.returnData.thumbImage;
                            }
                            var shareParams = {"platform" : platformType, "scene" : scene, "text" : text, "title" : title, "thumb_image" : thumbImage, "userName" : userName , "path" : path , "url" : webpageUrl};
                            WeChatShareContentSet [sessionId] = {"content" : shareParams, "user_data" : userData};
                            $mob.ext.ssdk_setDataToPasteboard($mob.shareSDK.platformType.WeChat , self.appID(), shareParameter , sessionId,function(data){
                                if(data.result)
                                {
                                    //构造跳转链接
                                    var urlstring = "weixin://app/" + self.appID() + "/sendreq/?";
                                    $mob.ext.canOpenURL(urlstring,function(data){
                                        if (data.result)
                                        {
                                            $mob.native.openURL(urlstring);
                                        }
                                        else
                                        {
                                            var error_message = "客户端版本过低无法进行分享";
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
                        });
                    }
                    
                });
            }
            else
            {
                error_message = null;
                
                if(this._currentLanguage === "zh-Hans")
                {
                    error_message = "分享参数webpageUrl或userName不能为空!";
                }
                else
                {
                    error_message = "share param webpageUrl or userName can not be nil!";
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
 * SSO授权
 * @param sessionId     会话标识
 * @param urlScheme     回调URL Scheme
 * @param settings      授权设置
 * @private
 */
WeChat.prototype._ssoAuthorize = function (sessionId, urlScheme, settings)
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

    var self = this;

    $mob.ext.ssdk_wechatAuth(this.appID(), sessionId, scope, function (data) {

        self._authHandler(sessionId, data);

    });
};

WeChat.prototype._ssoAuthorizeWithoutSDK = function (sessionId, urlScheme, settings)
{
    var self = this;

    $mob.ext.canOpenURL(["weixin://","wechat://"],function(data)
    {
        //是否安装客户端
        if (data.result)
        {
            //不用SDK下进行SSO授权
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

            //构造链接
            var urlstring = "weixin://app/" + self.appID() + "/auth/?scope=" + scope + "&state=Weixinauth";

            $mob.ext.canOpenURL(urlstring,function(data){
                if (data.result)
                {
                    $mob.native.openURL(urlstring);
                }
            });
        }
        else
        {
            var authUrl = "https://open.weixin.qq.com/connect/mobilecheck?appid=" + self.appID() +"&uid=1926559385";
            //打开授权
            $mob.native.ssdk_openAuthUrl(sessionId, authUrl, "");
        }
    });
};

/**
 * 授权成功
 * @param sessionId             会话ID
 * @param credentialRawData     授权凭证原始数据
 * @private
 */
WeChat.prototype._succeedAuthorize = function (sessionId, credentialRawData)
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
    var credential = {

        "uid"       : uid,
        "token"     : credentialRawData["access_token"],
        "expired"   : (new Date().getTime() +  credentialRawData ["expires_in"] * 1000),
        "raw_data"  : credentialRawData,
        "type"      : $mob.shareSDK.credentialType.OAuth2
    };
    var user = {
        "platform_type" : $mob.shareSDK.platformType.WeChat,
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
WeChat.prototype._setCurrentUser = function (user, callback)
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
 * 用户是否有效
 * @param user      用户信息
 * @returns {boolean}   如果授权凭证过期或者不存在则返回false，否则返回true
 * @private
 */
WeChat.prototype._isUserAvaliable = function (user)
{
    return user.credential != null && user.credential.token != null && user.credential.expired > new Date().getTime();
};

/**
 * 获取当前用户信息
 * @param callback  回调方法
 * @private
 */
WeChat.prototype._getCurrentUser = function (callback)
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
WeChat.prototype._updateUserInfo = function (user, rawData)
{
    if (user != null && rawData != null)
    {
        var self = this;
        user["raw_data"] = rawData;
        var uid = null;
        if(self.backUnionid())
        {
            uid = rawData['unionid'];
        }
        if(uid == null)
        {
            uid = rawData['openid'];
        }
        user["uid"] = uid;
        user["nickname"] = rawData["nickname"];
        user["icon"] = rawData["headimgurl"];


        //性别
        var gender = 2;
        if (rawData["sex"] === 1)
        {
            gender = 0;
        }
        else if (rawData["sex"] === 2)
        {
            gender = 1;
        }
        user["gender"] = gender;
    }
};

/**
 * 初始化应用
 * @param appId     应用标识
 * @private
 */
WeChat.prototype._setupApp = function (appId)
{
    if (appId != null)
    {
        $mob.ext.isPluginRegisted("com.mob.sharesdk.connector.wechat", function (data) {

            if (data.result)
            {
                //注册微信
                $mob.native.ssdk_plugin_wechat_setup(appId);
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
WeChat.prototype._getShareType = function (parameters, platformType)
{
    var type = $mob.shareSDK.contentType.Text;
    var thumbImage = $mob.shareSDK.getShareParam(platformType, parameters, "thumb_image");
    var url = $mob.shareSDK.getShareParam(platformType, parameters, "url");
    var images = $mob.shareSDK.getShareParam(platformType, parameters, "images");
    var emoticonData = $mob.shareSDK.getShareParam(platformType, parameters, "emoticon_data");
    var extInfo = $mob.shareSDK.getShareParam(platformType, parameters, "ext_info");
    var musicUrl = $mob.shareSDK.getShareParam(platformType, parameters, "audio_url");

    if ((thumbImage != null || Object.prototype.toString.apply(images) === '[object Array]') && url != null)
    {
        if (extInfo != null)
        {
            type = $mob.shareSDK.contentType.App;
        }
        else if (musicUrl != null)
        {
            type = $mob.shareSDK.contentType.Audio;
        }
        else
        {
            type = $mob.shareSDK.contentType.WebPage;
        }

    }
    else if (Object.prototype.toString.apply(images) === '[object Array]' || emoticonData != null)
    {
        type = $mob.shareSDK.contentType.Image;
    }

    return type;
};

//注册平台
$mob.shareSDK.registerPlatformClass($mob.shareSDK.platformType.WeChat, WeChat);
