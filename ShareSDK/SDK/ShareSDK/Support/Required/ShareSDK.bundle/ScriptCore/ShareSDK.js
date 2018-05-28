/**
 * Created with JetBrains WebStorm.
 * User: vim888
 * Date: 15/2/10
 * Time: 上午10:09
 * To change this template use File | Settings | File Templates.
 */

var $pluginID = "com.mob.sharesdk.base";

//上下文对象
var _context = null;
//登记的平台类型列表
var _registerPlatformClasses = {};
//登记平台列表
var _registerPlatforms = {};
//各平台应用信息
var _appInfo = {
//    "xml" : {},
    "local" : {},
    "sever" : {}
};

//系统语言默认为中文
var _currentLanguage = "zh-Hans";

/**
 * 上下文对象
 * @param appKey    应用标识
 * @constructor
 */
function SSDKContext (appKey)
{
    this._appKey = appKey;

    //本地配置信息
    this._localConfiguration = {
        "auth_type" :  "both",           //授权方式：web 网页授权方式，sso 单点登录授权方式，both 两者共同使用，优先使用SSO
        "stat" : true,                   //数据统计开关
        "convert_url" : true             //转换短链开关
    };

    //服务器配置信息
    this._serverConfiguration = {};
}

/**
 * 获取应用标识
 * @returns {*}
 */
SSDKContext.prototype.appKey = function ()
{
    return this._appKey;
};

/**
 * 获取授权方式
 *
 * @return web 网页授权方式，sso 单点登录授权方式，both 两者共同使用，优先使用SSO
 */
SSDKContext.prototype.authType = function ()
{
    return this._localConfiguration ["auth_type"];
};

/**
 * 获取转换短链功能是否开启
 * @returns {*}  true 开启， false 关闭
 */
SSDKContext.prototype.convertUrlEnabled = function ()
{
    return this._localConfiguration ["convert_url"];
};

/**
 * 本地命令服务
 * @constructor
 */
function SSDKNativeCommandProvider ()
{

}

/**
 * ShareSDK APIs
 * @constructor
 */
function ShareSDK ()
{

}

/**
 * 平台类型定义
 * @type {{}}
 */
ShareSDK.platformType = {
    "Unknown"               : 0,            //未知
    "SinaWeibo"             : 1,            //新浪微博
    "TencentWeibo"          : 2,            //腾讯微博
    "DouBan"                : 5,            //豆瓣
    "QZone"                 : 6,            //QQ空间
    "Renren"                : 7,            //人人网
    "Kaixin"                : 8,            //开心网
    "Facebook"              : 10,           //Facebook
    "Twitter"               : 11,           //Twitter
    "YinXiang"              : 12,           //印象笔记
    "GooglePlus"            : 14,           //Google+
    "Instagram"             : 15,           //Instagram
    "LinkedIn"              : 16,           //LinkedIn
    "Tumblr"                : 17,           //Tumblr
    "Mail"                  : 18,           //邮件
    "SMS"                   : 19,           //短信
    "Print"                 : 20,           //打印
    "Copy"                  : 21,           //拷贝
    "WeChatSession"         : 22,           //微信好友
    "WeChatTimeline"        : 23,           //微信朋友圈
    "QQFriend"              : 24,           //QQ好友
    "Instapaper"            : 25,           //Instapaper
    "Pocket"                : 26,           //Pocket
    "YouDaoNote"            : 27,           //有道云笔记
    "Pinterest"             : 30,           //Pinterest
    "Flickr"                : 34,           //Flickr
    "Dropbox"               : 35,           //Dropbox
    "VKontakte"             : 36,           //VKontakte
    "WeChatFav"             : 37,           //微信收藏
    "YiXinSession"          : 38,           //易信好友
    "YiXinTimeline"         : 39,           //易信朋友圈
    "YiXinFav"              : 40,           //易信收藏
    "MingDao"               : 41,           //明道
    "Line"                  : 42,           //Line
    "WhatsApp"              : 43,           //WhatsApp
    "KaKaoTalk"             : 44,           //KaKao Talk
    "KaKaoStory"            : 45,           //KaKao Story
    "FacebookMessenger"     : 46,           //Facebook Messenger
    "AliPaySocial"          : 50,           //支付宝好友
    "AliPaySocialTimeline"  : 51,           //支付宝朋友圈
    "DingTalk"              : 52,           //钉钉
    "YouTube"               : 53,           //youtube
    "MeiPai"                : 54,           //美拍
    "YiXin"                 : 994,          //易信
    "KaKao"                 : 995,          //KaKao
    "Evernote"              : 996,          //印象笔记国际版
    "WeChat"                : 997,          //微信
    "QQ"                    : 998           //QQ
};

/**
 * 回复状态定义
 * @type {{}}
 */
ShareSDK.responseState = {
    "Begin"     : 0,        //开始
    "Success"   : 1,        //成功
    "Fail"      : 2,        //失败
    "Cancel"    : 3,        //取消
    "BeginUPLoad" : 4       //开始上传
};

/**
 * 错误码定义
 * @type {{}}
 */
ShareSDK.errorCode = {
    "Unknown"               : 0,        //未知
    "UninitPlatform"        : 200,      //未初始化平台
    "UnsupportFeature"      : 201,      //不支持的功能
    "InvaildPlatform"       : 202,      //无效的应用平台
    "InvalidAuthCallback"   : 203,      //无效的授权回调
    "APIRequestFail"        : 204,      //API请求失败
    "UserUnauth"            : 205,      //用户尚未授权
    "UnsupportContentType"  : 206,      //不支持的分享类型
    "UnsetURLScheme"        : 207,      //尚未设置Url Scheme
    "NotYetInstallClient"   : 208       //尚未安装客户端
};

/**
 * 授权类型
 * @type {{Unknown: number, OAuth1x: number, OAuth2: number}}
 */
ShareSDK.credentialType = {
    "Unknown"               : 0,        //未知
    "OAuth1x"               : 1,        //OAuth1.x
    "OAuth2"                : 2,         //OAuth2.0
    "SMS"                : 3         //SMS
};

/**
 * 分享内容类型
 * @type {{Text: number, Image: number, WebPage: number, App: number, Audio: number, Video: number}}
 */
ShareSDK.contentType = {
    "Auto"          : 0,
    "Text"          : 1,
    "Image"         : 2,
    "WebPage"       : 3,
    "App"           : 4,
    "Audio"         : 5,
    "Video"         : 6,
    "File"          : 7,
    "FBMessageImages": 8,
    "FBMessageVideo": 9,
    "MiniProgram"   : 10
};

ShareSDK.privacyStatus = {
    "Public"      : 0,
    "Private"     : 1,
    "Unlisted"    : 2,
};

/**
 * 登记平台类型
 * @param type          平台类型
 * @param platformCls   平台类
 */
ShareSDK.registerPlatformClass = function (type, platformCls)
{
    _registerPlatformClasses [type] = platformCls;
};

/**
 * 获取平台对象
 * @param type          平台类型
 * @returns {*}         平台对象
 */
ShareSDK.getPlatformByType = function (type)
{
    var platform = _registerPlatforms [type];
    var config;
    if (platform == null)
    {
        var PlatformClass = _registerPlatformClasses [type];
        if (PlatformClass != null)
        {
            platform = new PlatformClass(type);
            _registerPlatforms [type] = platform;

            config = {};
//
//            if (_appInfo["xml"][type])
//            {
//                config = _appInfo["xml"][type];
//            }
            if (_appInfo["local"][type])
            {
                config = _appInfo["local"][type];
            }
            if (_appInfo["sever"][type])
            {
                config = _appInfo["sever"][type];
            }
            platform.setAppInfo(config);
            platform.saveConfig();
        }
    }
    else
    {
        config = {};
//        if (_appInfo["xml"][type])
//        {
//            config = _appInfo["xml"][type];
//        }
        if (_appInfo["local"][type])
        {
            config = _appInfo["local"][type];
        }
        if (_appInfo["sever"][type])
        {
            config = _appInfo["sever"][type];
        }
        platform.setAppInfo(config);
        platform.saveConfig();
    }

    return platform;
};

/**
 * 获取平台授权方式
 *
 * @return web 网页授权方式，sso 单点登录授权方式，both 两者共同使用，优先使用SSO
 */
ShareSDK.authType = function ()
{
    return _context.authType();
};

/**
 * 获取转换短链功能是否开启
 * @returns {*}  true 开启， false 关闭
 */
ShareSDK.convertUrlEnabled = function ()
{
    return _context.convertUrlEnabled();
};


/**
 * 转换链接
 * @param type          平台类型
 * @param user          用户信息
 * @param contents      内容列表
 * @param callback      回调
 */
ShareSDK.convertUrl = function (type, user, contents, callback)
{
    if (contents != null && contents.length > 0)
    {
        var regexp = /(https?:\/\/){1}[A-Za-z0-9_\.\-\/:\?&%=,;\[\]\{\}`~!@#\$\^\*\(\)\+\\|]+/g;
        var imgRegexp = /<img[^>]*>/g;
        var imgKvRegexp = /(\w+)\s*=\s*["|']([^"']*)["|']/g;

        var urls = {};
        var imageTagsUrls = {};

        for (var i = 0; i < contents.length; i++)
        {
            var content = contents[i];
            if (content != null)
            {
                //先获取需要转换的链接
                var items = content.match(regexp);
                if (items != null)
                {
                    for (var j = 0; j < items.length; j++)
                    {
                        urls [items[j]] = "";
                    }
                }

                //获取是否有图片标签，图片标签链接不进行短链转换，否则无法显示图片
                items = content.match(imgRegexp);
                if (items != null)
                {
                    for (var n = 0; n < items.length; n++)
                    {
                        var kvRes = null;
                        while ((kvRes = imgKvRegexp.exec(items[n])) != null)
                        {
                            if (kvRes[1] === "src" || kvRes[1] === "path")
                            {
                                imageTagsUrls[kvRes[2]] = "";
                            }
                        }
                    }
                }
            }
        }

        var urlArr = [];
        for (var url in urls)
        {
            if (imageTagsUrls[url] == null)
            {
                urlArr.push(url);
            }
        }

        if (urlArr.length > 0)
        {
            //转换链接
            $mob.ext.ssdk_getShortUrls(type, urlArr, user, function (data) {

                if (data.error_code == null)
                {
                    //替换短链到内容中
                    for (var i = 0; i < contents.length; i++)
                    {
                        var content = contents[i];
                        if (content != null)
                        {
                            content = content.replace(regexp, function () {

                                var url = arguments[0];
                                for (var j = 0; j < data.urls.length; j++)
                                {
                                    var shortUrlInfo = data.urls [j];
                                    if (shortUrlInfo["source"] === url)
                                    {
                                        return shortUrlInfo["surl"];
                                    }
                                }
                                return url;
                            });
                            contents[i] = content;
                        }
                    }
                }

                if (callback)
                {
                    callback ({"result" : contents});
                }
            });
        }
        else
        {
            if (callback)
            {
                callback ({"result" : contents});
            }
        }
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
 * 初始化ShareSDK
 * @param appKey    应用信息
 */
ShareSDK.initialize = function (appKey)
{
    if (_context == null)
    {
        _context = new SSDKContext(appKey);
    }
};

/**
 * 设置XML文件配置信息
 * @param type      平台类型
 * @param appInfo   平台应用信息
 */
//ShareSDK.setPlatformXMLConfiguration = function (type, appInfo)
//{
//    _appInfo["xml"][type] = appInfo;
//    var platform = _registerPlatforms [type];
//
//    if (platform == null)
//    {
//        var PlatformClass = _registerPlatformClasses [type];
//        if (PlatformClass != null)
//        {
//            platform = new PlatformClass(type);
//            _registerPlatforms [type] = platform;
//
//            if (_appInfo["xml"][type])
//            {
//                platform.setAppInfo(_appInfo["xml"][type]);
//                platform.saveConfig();
//            }
//        }
//    }
//    else
//    {
//        if (_appInfo["xml"][type])
//        {
//            platform.setAppInfo(_appInfo["xml"][type]);
//            platform.saveConfig();
//        }
//    }
//};

/**
 * 设置平台本地配置信息
 * @param type      平台类型
 * @param appInfo   平台应用信息
 */
ShareSDK.setPlatformLocalConfiguration = function (type, appInfo)
{
    _appInfo["local"][type] = appInfo;
    var platform = _registerPlatforms [type];
    
    if (platform == null)
    {
        var PlatformClass = _registerPlatformClasses [type];
        if (PlatformClass != null)
        {
            platform = new PlatformClass(type);
            _registerPlatforms [type] = platform;
            
            if (_appInfo["local"][type])
            {
                platform.setAppInfo(_appInfo["local"][type]);
                platform.saveConfig();
            }
        }
    }
    else
    {
        if (_appInfo["local"][type])
        {
            platform.setAppInfo(_appInfo["local"][type]);
            platform.saveConfig();
        }
    }
};

/**
 * 设置平台服务器配置信息
 * @param type      平台类型
 * @param appInfo   平台应用信息
 */
ShareSDK.setPlatformServerConfiguration = function (type, appInfo)
{
    _appInfo["sever"][type] = appInfo;
    var platform = _registerPlatforms [type];
    
    if (platform == null)
    {
        var PlatformClass = _registerPlatformClasses [type];
        if (PlatformClass != null)
        {
            platform = new PlatformClass(type);
            _registerPlatforms [type] = platform;

            if (_appInfo["sever"][type])
            {
                platform.setAppInfo(_appInfo["sever"][type]);
                platform.saveConfig();
            }
            
        }
    }
    else
    {
        if (_appInfo["sever"][type])
        {
            platform.setAppInfo(_appInfo["sever"][type]);
            platform.saveConfig();
        }
    }
};

/**
 *  设定/获取平台的系统语言
 *
 *  @param type     平台类型
 *  @param language 当前系统语言
 */
ShareSDK.preferredLanguageLocalize = function (language)
{
    if (arguments.length === 0)
    {
        return _currentLanguage;
    }
    else
    {
        _currentLanguage = language;
    }
};

/**
 * 用户授权
 * @param sessionId     会话ID
 * @param type          平台类型
 * @param settings      授权设置
 */
ShareSDK.authorize = function (sessionId, type, settings)
{
    var platform = ShareSDK.getPlatformByType(type);
    if (platform != null)
    {
        platform.authorize(sessionId, settings);
    }
    else
    {
        var error = {
            "error_code" : ShareSDK.errorCode.UninitPlatform,
            "error_message" : "无法授权! 分享平台(" + type + ")尚未初始化!"
        };

        $mob.native.log("[ShareSDK-WARNING] " + error["error_message"]);
        $mob.native.ssdk_authStateChanged(sessionId, ShareSDK.responseState.Fail, error);
    }
};

/**
 * 处理授权回调
 * @param sessionId     会话ID
 * @param type          平台类型
 * @param callbackUrl   回调URL
 */
ShareSDK.handleAuthCallback = function (sessionId, type, callbackUrl)
{
    var platform = ShareSDK.getPlatformByType(type);
    if (platform != null)
    {
        platform.handleAuthCallback(sessionId, callbackUrl);
    }
    else
    {
        var error =
        {
            "error_code" : ShareSDK.errorCode.UninitPlatform,
            "error_message" : "无法授权! 分享平台(" + type + ")尚未初始化!"
        };

        $mob.native.log("[ShareSDK-WARNING] " + error["error_message"]);
        $mob.native.ssdk_authStateChanged(sessionId, ShareSDK.responseState.Fail, error);
    }
};

/**
 * 处理SSO授权回调
 * @param sessionId     会话ID
 * @param type          平台类型
 * @param callbackUrl   回调URL
 * @param sourceApplication     原始应用名称
 * @param annotation            附加数据
 */
ShareSDK.handleSSOCallback = function (sessionId, type, callbackUrl, sourceApplication, annotation)
{
    var platform = ShareSDK.getPlatformByType(type);
    if (platform != null)
    {
        return platform.handleSSOCallback(sessionId, callbackUrl, sourceApplication, annotation);
    }

    return false;
};

/**
 * 处理分享回调
 * @param sessionId             会话ID
 * @param type                  平台类型
 * @param callbackUrl           回调URL
 * @param sourceApplication     原始应用名称
 * @param annotation            附加数据
 */
ShareSDK.handleShareCallback = function (sessionId, type, callbackUrl, sourceApplication, annotation)
{
    var platform = ShareSDK.getPlatformByType(type);
    if (platform != null)
    {
        return platform.handleShareCallback(sessionId, callbackUrl, sourceApplication, annotation);
    }

    return false;
};

/**
 * 添加好友回调
 * @param sessionId             会话ID
 * @param type                  平台类型
 * @param callbackUrl           回调URL
 * @param uid                   用户ID
 */
ShareSDK.handleAddFriendCallback = function (sessionId, type, callbackUrl, uid)
{
    var platform = ShareSDK.getPlatformByType(type);
    if (platform != null)
    {
        platform.handleAddFriendCallback(sessionId, callbackUrl, uid);
    }
    else
    {
        var error = {
            "error_code" : ShareSDK.errorCode.UninitPlatform,
            "error_message" : "无法添加好友! 平台(" + type + ")尚未初始化!"
        };

        $mob.native.log("[ShareSDK-WARNING] " + error["error_message"]);
        $mob.native.ssdk_addFriendStateChanged(sessionId, ShareSDK.responseState.Fail, error);
    }
};

/**
 * 取消授权
 * @param type          平台类型
 */
ShareSDK.cancelAuthorize = function (type)
{
    var platform = ShareSDK.getPlatformByType(type);
    if (platform != null)
    {
        platform.cancelAuthorize();
    }
};

/**
 * 获取用户信息
 * @param sessionId         会话标识
 * @param type              平台类型
 * @param query             用户查询条件
 */
ShareSDK.getUserInfo = function (sessionId, type, query)
{
    var platform = ShareSDK.getPlatformByType(type);
    if (platform != null)
    {
        platform.getUserInfo(query, function (state, data){

            $mob.native.ssdk_getUserInfoStateChanged(sessionId, state, data);

        });
    }
    else
    {
        var error = {
            "error_code" : ShareSDK.errorCode.UninitPlatform,
            "error_message" : "无法获取用户信息! 分享平台(" + type + ")尚未初始化!"
        };

        $mob.native.log("[ShareSDK-WARNING] " + error["error_message"]);
        $mob.native.ssdk_getUserInfoStateChanged(sessionId, ShareSDK.responseState.Fail, error);
    }
};

/**
 * 添加好友
 * @param sessionId         会话标志
 * @param type              平台类型
 * @param user              需要添加好友的用户信息
 */
ShareSDK.addFriend = function (sessionId, type, user)
{
    var platform = ShareSDK.getPlatformByType(type);
    if (platform != null)
    {
        platform.addFriend(sessionId, user, function (state, data) {

            $mob.native.ssdk_addFriendStateChanged(sessionId, state, data);

        });
    }
    else
    {
        var error = {
            "error_code" : ShareSDK.errorCode.UninitPlatform,
            "error_message" : "无法添加好友! 分享平台(" + type + ")尚未初始化!"
        };

        $mob.native.log("[ShareSDK-WARNING] " + error["error_message"]);
        $mob.native.ssdk_addFriendStateChanged(sessionId, ShareSDK.responseState.Fail, error);
    }
};

/**
 * 获取好友列表
 * @param sessionId         会话标识
 * @param type              平台类型
 * @param cursor            分页游标
 * @param size              分页尺寸
 */
ShareSDK.getFriends = function (sessionId, type, cursor, size)
{
    var platform = ShareSDK.getPlatformByType(type);
    if (platform != null)
    {
        platform.getFriends(cursor, size, function (state, data) {

            $mob.native.ssdk_getFriendsStateChanged(sessionId, state, data);

        });
    }
    else
    {
        var error = {
            "error_code" : ShareSDK.errorCode.UninitPlatform,
            "error_message" : "无法获取好友列表! 分享平台(" + type + ")尚未初始化!"
        };

        $mob.native.log("[ShareSDK-WARNING] " + error["error_message"]);
        $mob.native.ssdk_getFriendsStateChanged(sessionId, ShareSDK.responseState.Fail, error);
    }
};

/**
 * 分享内容
 * @param sessionId             会话标识
 * @param type                  平台类型
 * @param parameters            分享参数
 */
ShareSDK.share = function (sessionId, type, parameters)
{
    var platform = ShareSDK.getPlatformByType(type);
    if (platform != null)
    {
        platform.share(sessionId, parameters, function(state, data, user, userData){

            $mob.native.ssdk_shareStateChanged(sessionId, state, data, user, userData);

        });
    }
    else
    {
        var error = {
            "error_code" : ShareSDK.errorCode.UninitPlatform,
            "error_message" : "无法分享! 分享平台(" + type + ")尚未初始化!"
        };

        $mob.native.log("[ShareSDK-WARNING] " + error["error_message"]);
        $mob.native.ssdk_shareStateChanged(sessionId, ShareSDK.responseState.Fail, error, null);
    }
};

/**
 * 调用API接口
 * @param sessionId             会话标识
 * @param type                  平台类型
 * @param url                   接口地址
 * @param method                请求接口方法
 * @param parameters            提交接口参数
 * @param headers               请求头
 */
ShareSDK.callApi = function (sessionId, type, url, method, parameters, headers)
{
    var platform = ShareSDK.getPlatformByType(type);
    if (platform != null)
    {
        platform.callApi(url, method, parameters, headers, function (state, data) {

            $mob.native.ssdk_callApiStateChanged(sessionId, state, data);

        });
    }
    else
    {
        var error = {
            "error_code" : ShareSDK.errorCode.UninitPlatform,
            "error_message" : "无法调用API! 分享平台(" + type + ")尚未初始化!"
        };

        $mob.native.log("[ShareSDK-WARNING] " + error["error_message"]);
        $mob.native.ssdk_callApiStateChanged(sessionId, ShareSDK.responseState.Fail, error);
    }
};

/**
 * 获取分享参数
 * @param platformType  平台类型
 * @param parameters    参数集合
 * @param name          参数名称
 * @returns 参数值
 */
ShareSDK.getShareParam = function (platformType, parameters, name)
{
    var self = this;
    var value = null;

    if (parameters != null)
    {
        var platParams = parameters["@platform(" + platformType + ")"];
        if (platParams != null)
        {
            value = platParams [name];
        }
        if (value == null)
        {
            value = parameters [name];
        }

        if (typeof(value) === "string")
        {
            value = value.replace(/@value\((\w+)\)/g, function (word) {

                var bindName = word.match(/\((\w+)\)/)[1];
                var bindValue = self.getShareParam(platformType, parameters, bindName);

                return bindValue ? bindValue : "";

            });
        }
    }

    return value;
};

/**
 * 获取平台缓存域名
 * @param platformType   平台类型
 * @returns {null}
 */
ShareSDK.getPlatformCacheDomain = function (platformType)
{
    var platform = ShareSDK.getPlatformByType(platformType);
    if (platform != null)
    {
        return platform.cacheDomain();
    }

    return null;
};

/**
 * 判断平台是否支持授权
 * @param platformType   平台类型
 */
ShareSDK.isSupportAuth = function (platformType)
{
    var platform = ShareSDK.getPlatformByType(platformType);
    if (platform != null)
    {
        return platform.isSupportAuth();
    }

    return false;
};

/**
 * 获取平台名称
 * @param platformType  平台类型
 * @returns 平台名称
 */
ShareSDK.getPlatformName = function (platformType)
{
    var platform = ShareSDK.getPlatformByType(platformType);
    if (platform != null)
    {
        return platform.name();
    }

    return null;
};

ShareSDK.createUserByRawData = function (platformType, userRawData)
{
    var platform = ShareSDK.getPlatformByType(platformType);
    if (platform != null)
    {
        return platform.createUserByRawData(userRawData);
    }
    return null;
};

ShareSDK.authStatheChanged = function (platformType, sessionId, data)
{
    var platform = ShareSDK.getPlatformByType(platformType);
    if (platform != null)
    {
        return platform.authStateChanged(sessionId, data);
    }
};

ShareSDK.uploadFinishCallback = function (platformType, sessionId, data)
{
    var platform = ShareSDK.getPlatformByType(platformType);
    if (platform != null)
    {
        return platform.uploadFinishCallback(sessionId, data);
    }
};

$mob.shareSDK = ShareSDK;
