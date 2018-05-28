/**
 * Created 
 * User: peixj
 * Date: 17/2/13
 * Time: 下午5:44
 * To change this template use File | Settings | File Templates.
 */

var $pluginID = "com.mob.sharesdk.MeiPai";

/**
 * MeiPai 应用信息键名定义
 */
var MeiPaiInfoKeys = 
{
    "AppKey" : "app_key",
    "ConvertUrl"    : "covert_url"
};

/**
 * MeiPai
 * @param type  平台类型
 * @constructor
 */
function MeiPai(type) 
{
    this._type = type;
    this._appInfo = {};
    //当前授权用户
    this._currentUser = null;
    //设置当前语言环境
    this._currentLanguage = $mob.shareSDK.preferredLanguageLocalize();
}

/**
 * 美拍分享内容集合
 * @type {{}}
 */
var MeiPaiShareContentSet = {};

/**
 * 获取平台类型
 * @returns {*} 平台类型
 */
MeiPai.prototype.type = function ()
{
    return this._type;
};

/**
 * 获取平台名称
 * @returns {string}    平台名称
 */
MeiPai.prototype.name = function ()
{
    return "MeiPai";
};

/**
 * 获取应用标识
 * @returns {*} 应用标识
 */
MeiPai.prototype.appKey = function ()
{
    if (this._appInfo[MeiPaiInfoKeys.AppKey] !== undefined) 
    {
        return this._appInfo[MeiPaiInfoKeys.AppKey];
    }

    return null;
};

/**
 * 授权状态改变
 * @param sessionId         会话标识
 * @param data              返回数据
 * @private
 */
MeiPai.prototype.authStateChanged = function (sessionId, data)
{
    $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Cancel, null);
};

/**
 * 获取缓存域名
 * @returns {string}    域名
 */
MeiPai.prototype.cacheDomain = function ()
{
    return "SSDK-Platform-" + $mob.shareSDK.platformType.MeiPai + "-" + this.appKey();
};

/**
 * 获取是否转换短链
 *
 * @return  true 转换， false 不转换
 */
MeiPai.prototype.convertUrlEnabled = function ()
{
    if (this._appInfo[MeiPaiInfoKeys.ConvertUrl] !== undefined) 
    {
        return this._appInfo[MeiPaiInfoKeys.ConvertUrl];
    }

    return $mob.shareSDK.convertUrlEnabled();
};

/**
 * 设置/获取应用信息
 * @param value 应用信息
 * @returns {*}
 */
MeiPai.prototype.setAppInfo = function (value)
{
    if (arguments.length === 0) 
    { 
        return this._appInfo;
    }
    else
    {
        this._appInfo = this._checkAppInfoAvailable(value);
        this._setupApp(this.appKey());
    }
};

/**
 * 初始化应用
 * @param appKey     应用标识
 * @private
 */
MeiPai.prototype._setupApp = function (appKey)
{
    if (appKey != null)
    {
        $mob.ext.isPluginRegisted("com.mob.sharesdk.connector.meipai", function (data) {
            if (data.result)
            {
                $mob.native.ssdk_plugin_meipai_setup(appKey);
            }
        });
    }
};

/**
 * 检测应用信息有效性
 * @param appInfo   应用信息
 * @private
 */
MeiPai.prototype._checkAppInfoAvailable = function (appInfo)
{
    var appKey = $mob.utils.trim(appInfo [MeiPaiInfoKeys.AppKey]);
    
    if (appKey != null)
    {
        appInfo [MeiPaiInfoKeys.AppKey] = appKey;
    }
    else
    {
        appInfo [MeiPaiInfoKeys.AppKey] = this.appKey();
    }
    return appInfo;
};

/**
 * 保存配置信息
 */
MeiPai.prototype.saveConfig = function ()
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
MeiPai.prototype.isSupportAuth = function ()
{
    return false;
};

/**
 * 用户授权
 * @param sessionId     授权会话标识
 * @param settings      授权设置
 */
MeiPai.prototype.authorize = function (sessionId, settings)
{
    var error_message = null;
    
    if(this._currentLanguage === "zh-Hans")
    {
        error_message = "平台［" + this.name() + "］不支持授权功能!";
    }
    else
    {
        error_message = "Platform［" + this.name() + "］do not support authorize!";
    }

    var error =
    {
        "error_code" : $mob.shareSDK.errorCode.UnsupportFeature,
        "error_message" : error_message
    };
    $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Fail, error);
};

/**
 * 取消授权
 * @param callback      方法回调，回调方法声明如下:function (stat, data);
 */
MeiPai.prototype.cancelAuthorize = function (callback)
{};

/**
 * 获取用户信息
 * @param query         查询信息
 * @param callback      方法回调
 */
MeiPai.prototype.getUserInfo = function (query, callback)
{

    var error_message = null;
    
    if(this._currentLanguage === "zh-Hans")
    {
        error_message = "平台［" + this.name() + "］不支持获取用户信息功能!";
    }
    else
    {
        error_message = "Platform［" + this.name() + "］do not support getting userInfo!";
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
 * 添加好友
 * @param sessionId     会话标识
 * @param user          用户信息
 * @param callback      方法回调，回调方法声明如下:function (stat, data);
 */
MeiPai.prototype.addFriend = function (sessionId, user, callback)
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
MeiPai.prototype.getFriends = function (cursor, size, callback)
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
 * 调用API接口
 * @param url           接口URL
 * @param method        请求方式
 * @param params        请求参数
 * @param headers       请求头
 * @param callback      方法回调, 回调方法声明如下:function (state, data);
 */
MeiPai.prototype.callApi = function (url, method, params, headers, callback)
{

    var error_message = null;
    
    if(this._currentLanguage === "zh-Hans")
    {
        error_message = "平台［" + this.name() + "不支持调用API功能!";
    }
    else
    {
        error_message = "Platform［" + this.name() + "］do not support this feature";
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
 * 创建用户信息
 * @param rawData       原始用户数据
 * @returns {null}      用户数据
 */
MeiPai.prototype.createUserByRawData = function (rawData)
{
    return null;
};

/**
 * 分享内容
 * @param sessionId         会话ID
 * @param parameters        分享参数
 * @param callback          方法回调，回调方法声明如下:function (state, data, user, userData);
 */
MeiPai.prototype.share = function (sessionId, parameters, callback)
{
    var self = this;
    //获取分享统计标识
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
                //检测 URL Scheme
                self._checkUrlScheme(function (hasReady, urlScheme)
                {
                    if (hasReady)
                    {
                        //检测是否连接平台SDK 美拍
                        $mob.ext.ssdk_isConnectedPlatformSDK("MPShareSDK",function(data)
                        {
                            if (data.result)
                            {
                                //检测是否载入 connector 美拍
                                $mob.ext.isPluginRegisted("com.mob.sharesdk.connector.meipai", function (data) {
                                    if (data.result)
                                    {
                                        //有SDK
                                        self._shareWithSDK(sessionId, parameters, userData, callback);
                                    }
                                    else
                                    {
                                        //无SDk
                                        self._shareWithOutSDK(sessionId, parameters, userData, callback);
                                    }
                                });
                            }
                            else
                            {
                                //无SDK
                                self._shareWithOutSDK(sessionId, parameters, userData, callback);
                            }
                        });
                    }
                    else
                    {
                        var errorMessage = null;
                        if(this._currentLanguage === "zh-Hans")
                        {
                            errorMessage = "尚未设置分享平台［" + self.name() + "］的URL Scheme:" + self._callBackURLScheme() + "，无法进行分享!请在项目设置中设置URL Scheme后再试!";
                        }
                        else
                        {
                            errorMessage = "Can't share because platform［" + self.name() + "］did not set URL Scheme:" + self._callBackURLScheme() + "!Please try again after set URL Scheme!";
                        }
                        //返回错误
                        var error = {
                            "error_code" : $mob.shareSDK.errorCode.UnsetURLScheme,
                            "error_message" : errorMessage
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
        var errorMessage = null;
        if(this._currentLanguage === "zh-Hans")
        {
            errorMessage = "分享平台［" + this.name() + "］应用信息无效!";
        }
        else
        {
            errorMessage = "Platform［" + this.name() + "］Invalid configuration!";
        }
        var error = {
            "error_code" : $mob.shareSDK.errorCode.InvaildPlatform,
            "error_message" : errorMessage
        };
        if(callback != null && error != null)
        {
            callback($mob.shareSDK.responseState.Fail, error, null, userData);
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
MeiPai.prototype.handleShareCallback = function (sessionId, callbackUrl, sourceApplication, annotation)
{
    var self = this;
    if (callbackUrl.indexOf(self._callBackURLScheme() + "://") === 0)
    {
        $mob.ext.ssdk_isConnectedPlatformSDK("MPShareSDK",function(data)
        {
            if (data.result)
            {
                //检测是否载入 connector 美拍
                $mob.ext.isPluginRegisted("com.mob.sharesdk.connector.meipai", function (data) {
                    if (data.result)
                    {
                        //有SDK
                        $mob.ext.ssdk_meipaiHandleShareCalback(self.appKey(), callbackUrl, function (data) {
                            var shareParams = MeiPaiShareContentSet [sessionId];
                            var content = {};
                            var userData = null;
                            if (shareParams != null)
                            {
                                content = shareParams.content;
                                userData = shareParams.user_data;
                            }

                            switch (data.state)
                            {
                                case $mob.shareSDK.responseState.Success:
                                {
                                    //转换数据
                                    var resultData = {};
                                    resultData.raw_data = content;
                                    var urls = [];
                                    if (content.url)
                                    {
                                        urls.push(content.url);
                                    }
                                    resultData.urls = urls;
                                    $mob.native.ssdk_shareStateChanged(sessionId, $mob.shareSDK.responseState.Success, resultData, null, userData);
                                    break;
                                }
                                case $mob.shareSDK.responseState.Fail:
                                    //失败
                                    var error = {
                                        "error_code" : $mob.shareSDK.errorCode.APIRequestFail,
                                        "user_data" :  {"error_code" : data.error_code, "error_message" : data.error_message}
                                    };
                                    $mob.native.ssdk_shareStateChanged(sessionId, $mob.shareSDK.responseState.Fail, error, null, userData);
                                    break;
                                default :
                                    //取消
                                    $mob.native.ssdk_shareStateChanged(sessionId, $mob.shareSDK.responseState.Cancel, null, null, userData);
                                    break;
                            }

                            //移除分享参数集合中的数据
                            delete MeiPaiShareContentSet[sessionId];
                            MeiPaiShareContentSet[sessionId] = null;
                        });
                    }
                    else
                    {
                        //无SDk
                        self._handleShareCallbackWithoutSDK(sessionId, callbackUrl);
                    }
                });
            }
            else
            {
                //无SDK
                self._handleShareCallbackWithoutSDK(sessionId, callbackUrl);
            }
        });
    }
};

MeiPai.prototype._handleShareCallbackWithoutSDK = function(sessionId , callbackURL)
{
    var urlInfo = $mob.utils.parseUrl(callbackURL);
    if (urlInfo != null && urlInfo.query != null)
    {
        var callbackData = $mob.utils.parseUrlParameters (urlInfo.query);
        if(callbackData != null)
        {
            var result = callbackData.result;

            var shareParams = MeiPaiShareContentSet [sessionId];
            var content = {};
            var userData = null;
            if (shareParams != null)
            {
                content = shareParams.content;
                userData = shareParams.user_data;
            }
            if(result === 1)
            {
                var resultData = {};
                resultData.raw_data = content;
                var urls = [];
                if (content.url)
                {
                    urls.push(content.url);
                }
                resultData.urls = urls;
                $mob.native.ssdk_shareStateChanged(sessionId, $mob.shareSDK.responseState.Success, resultData, null, userData);
            }
            else
            {
                $mob.native.ssdk_shareStateChanged(sessionId, $mob.shareSDK.responseState.Cancel, null, null, userData);
            }
            delete MeiPaiShareContentSet[sessionId];
            MeiPaiShareContentSet[sessionId] = null;
        }
    }
};

/**
 * 分享内容 有SDK
 * @param sessionId         会话标识
 * @param parameters        分享参数
 * @param userData          用户数据
 * @param callback          回调
 * @private
 */
MeiPai.prototype._shareWithSDK = function(sessionId, parameters, userData, callback)
{
    var self = this;
    var error_message = null;
    self._getShareType(parameters,function(type)
    {
        if(type != null)
        {
            switch(type)
            {
                case $mob.shareSDK.contentType.Image:
                case $mob.shareSDK.contentType.Video:
                {   
                    var url = $mob.shareSDK.getShareParam(self.type(), parameters, "url");
                    if(type === $mob.shareSDK.contentType.Image)
                    {
                        var images = $mob.shareSDK.getShareParam(self.type(), parameters, "images");
                        if (images != null && Object.prototype.toString.apply(images) === '[object Array]')
                        {
                            //取第一张图片进行分享
                            url = images [0];
                        }
                    }
                    $mob.ext.ssdk_meipaiShare(self.appKey(), url ,type, function (data) {
                        if (data.error_code != null)
                        {
                            if (callback != null)
                            {
                                callback ($mob.shareSDK.responseState.Fail, data, null, userData);
                            }
                        }
                        else
                        {
                            //调用成功后不回调，等待客户端回调时再触发
                            //记录分享内容
                            var shareParams = {"platform" : self.type(), "url" : url };
                            MeiPaiShareContentSet[sessionId] = {"content" : shareParams, "user_data" : userData};
                        }
                    });
                    break;
                }
                default :
                {
                    if(self._currentLanguage === "zh-Hans")
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
        }
        else
        {
            error_message = "无法获取资源，资源格式是否正确(需为相册地址) 以及 相册是否已授权访问";
            var errors = {
                "error_code" : $mob.shareSDK.errorCode.APIRequestFail,
                "error_message" : error_message
            };
            if(callback != null)
            {
                callback ($mob.shareSDK.responseState.Fail, errors, null, userData);
            }
        }
    });
};

/**
 * 分享内容 无SDK
 * @param sessionId         会话标识
 * @param parameters        分享参数
 * @param userData          用户数据
 * @param callback          回调
 * @private
 */
MeiPai.prototype._shareWithOutSDK = function(sessionId, parameters, userData, callback , errorCallBack)
{
    var self = this;
    var error_message;
    var error;
    //检测客户单是否安装
    $mob.ext.canOpenURL('mtmv://', function (data) {
        if(data.result)
        {
            self._getShareType(parameters,function(type)
            {
                if(type != null)
                {
                    switch(type)
                    {
                        case $mob.shareSDK.contentType.Image:
                        {
                            //确认客户端是否支持图片分享
                            $mob.ext.canOpenURL('mpsharesdk11://share', function (data) {
                                if(data.result)
                                {
                                    var url = $mob.shareSDK.getShareParam(self.type(), parameters, "url");
                                    $mob.ext.getAppConfig(function (data){
                                        if (data != null && data.CFBundleIdentifier != null && data.CFBundleName != null)
                                        {
                                            var bundleId = data.CFBundleIdentifier;
                                            var appName = data.CFBundleDisplayName;
                                            if(appName == null || appName === '')
                                            {
                                                appName = data.CFBundleName;
                                            }
                                            var shareURL = "mpsharesdk11://share?bundleId="+bundleId+"&version=4.7.0&sourceApp="+$mob.utils.urlEncode(appName)+"&appkey="+self.appKey()+"&asset="+$mob.utils.urlEncode(url);
                                            $mob.ext.canOpenURL(shareURL, function (data) {
                                                if(data.result)
                                                {
                                                    var shareParams = {"platform" : self.type(), "url" : url };
                                                    MeiPaiShareContentSet[sessionId] = {"content" : shareParams, "user_data" : userData};
                                                    $mob.native.openURL(shareURL);
                                                }
                                                else
                                                {
                                                    var error_message = "分享平台［美拍］尚未安装客户端!无法进行分享!";
                                                    var error = {
                                                        "error_code" : $mob.shareSDK.errorCode.NotYetInstallClient,
                                                        "error_message" : error_message
                                                    };
                                                    if(callback != null)
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
                                    var error_message = "分享平台［美拍］客户端版本不支持图片分享功能";
                                    var error = {
                                        "error_code" : $mob.shareSDK.errorCode.UnsupportFeature,
                                        "error_message" : error_message
                                    };
                                    if(callback != null)
                                    {
                                        callback ($mob.shareSDK.responseState.Fail, error, null, userData);
                                    }
                                }
                            });
                            break;
                        }
                        case $mob.shareSDK.contentType.Video:
                        {   
                            //确认客户端是否支持视频分享
                            $mob.ext.canOpenURL('mpsharesdk10://share', function (data) {
                                if(data.result)
                                {
                                    var url = $mob.shareSDK.getShareParam(self.type(), parameters, "url");
                                    $mob.ext.getAppConfig(function (data){
                                        if (data != null)
                                        {
                                            var bundleId = data.CFBundleIdentifier;
                                            var appName = data.CFBundleDisplayName;
                                            if(appName == null || appName === '')
                                            {
                                                appName = data.CFBundleName;
                                            }
                                            var shareURL = "mpsharesdk10://share?bundleId="+bundleId+"&version=4.7.0&sourceApp="+$mob.utils.urlEncode(appName)+"&appkey="+self.appKey()+"&asset="+$mob.utils.urlEncode(url);
                                            $mob.ext.canOpenURL(shareURL, function (data) {
                                                if(data.result)
                                                {
                                                    var shareParams = {"platform" : self.type(), "url" : url };
                                                    MeiPaiShareContentSet[sessionId] = {"content" : shareParams, "user_data" : userData};
                                                    $mob.native.openURL(shareURL);
                                                }
                                                else
                                                {
                                                    var error_message = "分享平台［美拍］尚未安装客户端!无法进行分享!";
                                                    var error = {
                                                        "error_code" : $mob.shareSDK.errorCode.NotYetInstallClient,
                                                        "error_message" : error_message
                                                    };
                                                    if(callback != null)
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
                                    var error_message = "分享平台［美拍］客户端版本不支持视频分享功能";
                                    var error = {
                                        "error_code" : $mob.shareSDK.errorCode.UnsupportFeature,
                                        "error_message" : error_message
                                    };
                                    if(callback != null)
                                    {
                                        callback ($mob.shareSDK.responseState.Fail, error, null, userData);
                                    }
                                }
                            });
                            break;
                        }
                        default :
                        {
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
                    error_message = "无法获取资源，资源格式是否正确(需为相册地址) 以及 相册是否已授权访问";
                    error = {
                        "error_code" : $mob.shareSDK.errorCode.APIRequestFail,
                        "error_message" : error_message
                    };
                    if(callback != null)
                    {
                        callback ($mob.shareSDK.responseState.Fail, error, null, userData);
                    }
                }
            });
        }
        else
        {
            error_message = "分享平台［美拍］尚未安装客户端!无法进行分享!";
            error = {
                "error_code" : $mob.shareSDK.errorCode.NotYetInstallClient,
                "error_message" : error_message
            };
            if(callback != null)
            {
                callback ($mob.shareSDK.responseState.Fail, error, null, userData);
            }
        }
    });
};


/**
 * 判断是否能够进行分享
 * @private
 */
MeiPai.prototype._canShare = function ()
{
    if (this.appKey() != null)
    {
        return true;
    }
    $mob.native.log("[ShareSDK-WARNING] [" + this.name() + "]应用信息有误，不能进行相关操作。请检查本地代码中和服务端的[" + this.name() + "]平台应用配置是否有误! " +
        "\n配置:" + $mob.utils.objectToJsonString(this._appInfo));

    return false;
};

//回调地址 scheme
MeiPai.prototype._callBackURLScheme = function()
{
    return 'mp'+this.appKey();
};

/**
 * 检测是否配置URL Scheme
 * @param callback 方法回调
 * @private
 */
MeiPai.prototype._checkUrlScheme = function (callback)
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
                        if (schema === self._callBackURLScheme())
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
            $mob.native.log("[ShareSDK-WARNING] 尚未配置[" + self.name() + "]URL Scheme:" + self._callBackURLScheme());
        }

        if (callback != null)
        {
            callback (hasReady, urlScheme);
        }
    });
};

/**
 * 根据分享参数返回分享类型
 * @param parameters            分享参数
 * @private
 */
MeiPai.prototype._getShareType = function (parameters , callback)
{
    var self = this;
    var type = $mob.shareSDK.getShareParam(this.type(),parameters,"type");
    if (type == null || type === $mob.shareSDK.contentType.Auto)
    {
        //Auto 时进行自行选择
        var url = $mob.shareSDK.getShareParam(this.type(), parameters, "url");
        if(url != null)
        {
            //判断是否为相册地址
            if (/^(assets-library\:)/.test(url)) 
            {
                //对URL进行判断其为图片还是其他
                $mob.ext.isPluginRegisted("com.mob.sharesdk.connector.meipai", function (data) {
                    if (data.result)
                    {
                        //如果载入connector 插件泽调用方法进行资源类型判断
                        $mob.ext.ssdk_getAssetType(url ,function(data)
                        {
                            if(data.assetType != null)
                            {
                                if(data.assetType === 'ALAssetTypePhoto')
                                {
                                    type = $mob.shareSDK.contentType.Image;
                                }
                                else if(data.assetType === 'ALAssetTypeVideo')
                                {
                                    type = $mob.shareSDK.contentType.Video;
                                }
                                else
                                {
                                    $mob.native.log("[ShareSDK-WARNING] " + self.name() + " 传入的相册地址资源为未知类型 ALAssetTypeUnknown");
                                    type = null;
                                }
                            }
                            else
                            {
                                if(data.error_message != null)
                                {
                                    $mob.native.log("[ShareSDK-WARNING] " + self.name() + data.error_message);
                                }
                                type = null;
                            }
                            callback(type);
                        });
                    }
                    else
                    {
                        $mob.native.log("[ShareSDK-WARNING] 未载入 MeiPaiConnector 故无法判定传入相册资源的类型 则统一使用图片类型分享");
                        //无法判断类型时 默认给予图片类型
                        type = $mob.shareSDK.contentType.Image;
                        callback(type);
                    }
                });
            }
            else
            {
                $mob.ext.isPluginRegisted("com.mob.sharesdk.connector.meipai", function (data) {
                    if (data.result)
                    {
                        type = $mob.shareSDK.contentType.Image;
                        callback(type);
                    }
                    else
                    {
                        $mob.native.log("[ShareSDK-WARNING] 未载入 MeiPaiConnector");
                       //内容格式错误
                        type = null;
                        callback(type);
                    }
                });
            }
        }
        else
        {
            //无符合规则则设置为 text 类型
            type = $mob.shareSDK.contentType.Text;
            callback(type);
        }
    }
    else
    {
        callback(type);
    }
};

//注册平台
$mob.shareSDK.registerPlatformClass($mob.shareSDK.platformType.MeiPai, MeiPai);
