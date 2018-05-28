/**
 * Created with JetBrains WebStorm.
 * User: vim888
 * Date: 15/2/28
 * Time: 下午5:35
 * To change this template use File | Settings | File Templates.
 */

var $pluginID = "com.mob.ext";

/**
 * 流水号
 * @type {number}
 * @private
 */
var _seqId = 0;

/**
 * 扩展类
 */
$mob.ext = function () {};

/**
 * 回调方法集合
 * @type {{}}
 * @private
 */
$mob.ext._callbackFuncs = {};

/**
 * 绑定回调方法
 * @param callback      回调方法
 * @returns {string}    回调方法描述
 * @private
 */
$mob.ext._bindCallbackFunc = function (callback)
{
    var sessionId = new Date().getTime() + _seqId;
    _seqId ++;

    $mob.ext._callbackFuncs [sessionId] = function (data)
    {
        if (callback !== null)
        {
            callback (data);
        }

        delete  $mob.ext._callbackFuncs [sessionId];
        $mob.ext._callbackFuncs [sessionId] = null;
    };

    return "$mob.ext._callbackFuncs[" + sessionId + "]";
};

/**
 * 进行授权，用于使用自定义授权时接口
 * @param sessionId     授权会话标识
 * @param pluginId      插件标识
 * @param userData      用户数据
 * @param callback      回调
 */
$mob.ext.ssdk_auth = function (sessionId, pluginId, userData, callback)
{
    var func = $mob.ext._bindCallbackFunc(callback);
    $mob.native.ssdk_auth(sessionId, pluginId, userData, func);
};

/**
 * 发送HTTP请求
 * @param url       请求链接
 * @param method    请求方法
 * @param params    请求参数
 * @param header    请求头
 * @param callback  回调
 */
$mob.ext.http = function (url, method, params, header, callback)
{
    var func = $mob.ext._bindCallbackFunc(callback);
    $mob.native.http(url, method, params, header, null, null, null, func);
};

/**
 * 发送HTTP请求
 * @param url                   请求链接
 * @param method                请求方法
 * @param params                请求参数
 * @param header                请求头
 * @param oauthParams           OAuth参数
 * @param consumerSecret        消费者密钥
 * @param oauthTokenSecret      OAuth令牌密钥
 * @param callback              回调
 */
$mob.ext.oauth = function (url, method, params, header, oauthParams, consumerSecret, oauthTokenSecret, callback)
{
    var func = $mob.ext._bindCallbackFunc(callback);
    $mob.native.http(url, method, params, header, oauthParams, consumerSecret, oauthTokenSecret, func);
};

/**
 * 设置本地缓存数据
 * @param name      名称
 * @param value     数据
 * @param secure    是否进行安全加密
 * @param domain    数据域
 * @param callback  回调
 */
$mob.ext.setCacheData = function (name, value, secure, domain, callback)
{
    var func = $mob.ext._bindCallbackFunc(callback);
    $mob.native.setCacheData(name, value, secure, domain, func);
};

/**
 * 获取本地缓存数据
 * @param name      名称
 * @param secure    是否已使用安全加密
 * @param domain    数据域
 * @param callback  回调
 */
$mob.ext.getCacheData = function (name, secure, domain, callback)
{
    var func = $mob.ext._bindCallbackFunc(callback);
    $mob.native.getCacheData(name, secure, domain, func);
};

/**
 * 获取应用配置信息
 * @param callback  回调
 */
$mob.ext.getAppConfig = function (callback)
{
    var func = $mob.ext._bindCallbackFunc(callback);
    $mob.native.getAppConfig(func);
};

/**
 * 检测是否允许请求链接
 * @param url       链接
 * @param callback  回调
 */
$mob.ext.canOpenURL = function (url, callback)
{
    var func = $mob.ext._bindCallbackFunc(callback);
    $mob.native.canOpenURL(url, func);
};

/**
 * 获取是否支持多任务
 *
 * @param callback  回调
 */
$mob.ext.isMultitaskingSupported = function (callback)
{
    var func = $mob.ext._bindCallbackFunc(callback);
    $mob.native.isMultitaskingSupported(func);
};

/**
 * 获取是否为Pad设备
 *
 * @param callback  回调
 */
$mob.ext.isPad = function (callback)
{
    var func = $mob.ext._bindCallbackFunc(callback);
    $mob.native.isPad(func);
};

/**
 * 是否已经连接微信
 *
 * @param pluginKey     插件标识
 * @param callback      回调
 */
$mob.ext.isPluginRegisted = function (pluginKey, callback)
{
    var func = $mob.ext._bindCallbackFunc(callback);
    $mob.native.isPluginRegisted(pluginKey, func);
};

/**
 * 下载文件
 * @param url           下载文件链接
 * @param callback      回调
 */
$mob.ext.downloadFile = function (url, callback)
{
    var func = $mob.ext._bindCallbackFunc(callback);
    $mob.native.downloadFile(url, func);
};

/**
 * 解析XML
 * @param xmlString     XML字符串
 * @param callback      回调
 */
$mob.ext.parseXML = function (xmlString, callback)
{
    var func = $mob.ext._bindCallbackFunc(callback);
    $mob.native.parseXML(xmlString, func);
};

/**
 * 调用HTTP接口
 * @param platformType  平台类型
 * @param name          接口名称
 * @param url           接口路径
 * @param method        请求方法
 * @param params        请求参数
 * @param header        请求头信息
 * @param callback      回调
 */
$mob.ext.ssdk_callHTTPApi = function (platformType, name, url, method, params, header, callback)
{
    var func = $mob.ext._bindCallbackFunc(callback);
    $mob.native.ssdk_callHTTPApi(platformType, name, url, method, params, header, null, null, null, func);
};


/**
 * 调用上传media方法 （一般为视频 断点续传）
 * @param sessionId     会话标识
 * @param mediaURL      media本地数据地址
 * @param tag           自定义标签
 * @param accessToken   授权token
 * @param callback      回调
 */
$mob.ext.ssdk_plugin_twitter_uploadVideo = function (consumerKey, consumerSecret, token, tokenSecret, sessionId, mediaURL, tag, callback)
{
    var func = $mob.ext._bindCallbackFunc(callback);
    $mob.native.ssdk_plugin_twitter_uploadVideo(consumerKey, consumerSecret, token, tokenSecret, sessionId, mediaURL, tag, func);
};

/**
 * 调用OAuth接口
 * @param platformType          平台类型
 * @param name                  接口名称
 * @param url                   接口路径
 * @param method                请求方法
 * @param params                请求参数
 * @param header                请求头信息
 * @param oauthParams           OAuth参数
 * @param consumerSecret        消费者密钥
 * @param oauthTokenSecret      OAuth令牌密钥
 * @param callback              回调
 */
$mob.ext.ssdk_callOAuthApi = function (platformType, name, url, method, params, header, oauthParams, consumerSecret, oauthTokenSecret, callback)
{
    var func = $mob.ext._bindCallbackFunc(callback);
    $mob.native.ssdk_callHTTPApi(platformType, name, url, method, params, header, oauthParams, consumerSecret, oauthTokenSecret, func);
};

/**
 *  微信授权
 *  @param appId         应用标识
 *  @param sessionId     会话标识
 *  @param scopes        权限列表
 *  @param callback      回调
 */
$mob.ext.ssdk_wechatAuth = function (appId, sessionId, scopes, callback)
{
    var func = $mob.ext._bindCallbackFunc(callback);
    $mob.native.ssdk_plugin_wechat_auth(appId, sessionId, scopes, func);
};

/**
 * 微信授权回调请求
 * @param appId          应用标识
 * @param sessionId      会话标识
 * @param url            请求的URL链接
 * @param callback       回调
 */
$mob.ext.ssdk_wechatHandleSSOCalback = function (appId, sessionId, url, callback)
{
    var func = $mob.ext._bindCallbackFunc(callback);
    $mob.native.ssdk_plugin_wechat_handleSSOCallback(appId, sessionId, url, func);
};

/**
 * 微信分享回调请求
 * @param appId          应用标识
 * @param url            请求的URL链接
 * @param callback       回调
 */
$mob.ext.ssdk_wechatHandleShareCalback = function (appId, url, callback)
{
    var func = $mob.ext._bindCallbackFunc(callback);
    $mob.native.ssdk_plugin_wechat_handleShareCallback(appId, url, func);
};

/**
 * 微信分享
 * @param appId             应用标识
 * @param scene             分享场景
 * @param text              分享文本
 * @param callback          回调
 */
$mob.ext.ssdk_wechatShareText = function (appId, scene, text, callback)
{
    var func = $mob.ext._bindCallbackFunc(callback);
    $mob.native.ssdk_plugin_wechat_share(appId, scene, $mob.shareSDK.contentType.Text, func, text);

};

/**
 * 微信分享图片
 * @param appId             应用标识
 * @param scene             分享场景
 * @param title             标题
 * @param desc              图片描述
 * @param thumbImage        图片缩略图
 * @param image             图片
 * @param emoticonData      表情图片数据
 * @param callback          回调
 */
$mob.ext.ssdk_wechatShareImage = function (appId, scene, title, desc, thumbImage, image, emoticonData, callback)
{
    var func = $mob.ext._bindCallbackFunc(callback);
    $mob.native.ssdk_plugin_wechat_share(appId, scene, $mob.shareSDK.contentType.Image, func, title, desc, thumbImage, image, emoticonData);

};

/**
 * 微信分享网页
 * @param appId             应用标识
 * @param scene             分享场景
 * @param title             标题
 * @param desc              网页描述
 * @param thumbImage        缩略图
 * @param url               网页地址
 * @param callback          回调
 */
$mob.ext.ssdk_wechatShareWebpage = function (appId, scene, title, desc, thumbImage, url, callback)
{
    var func = $mob.ext._bindCallbackFunc(callback);
    $mob.native.ssdk_plugin_wechat_share(appId, scene, $mob.shareSDK.contentType.WebPage, func, title, desc, thumbImage, url);
};

/**
 * 微信分享App
 * @param appId             应用标识
 * @param scene             分享场景
 * @param title             标题
 * @param desc              描述
 * @param thumbImage        缩略图
 * @param url               网页地址
 * @param extInfo           扩展信息
 * @param fileData          文件数据
 * @param callback          回调
 */
$mob.ext.ssdk_wechatShareApp = function (appId, scene, title, desc, thumbImage, url, extInfo, fileData, callback)
{
    var func = $mob.ext._bindCallbackFunc(callback);
    $mob.native.ssdk_plugin_wechat_share(appId, scene, $mob.shareSDK.contentType.App, func, title, desc, thumbImage, url, extInfo, fileData);
};

/**
 * 微信分享音频
 * @param appId             应用标识
 * @param scene             分享场景
 * @param title             标题
 * @param desc              描述
 * @param thumbImage        缩略图
 * @param url               音乐网址
 * @param musicUrl          音乐文件网址
 * @param callback          回调
 */
$mob.ext.ssdk_wechatShareAudio = function (appId, scene, title, desc, thumbImage, url, musicUrl, callback)
{
    var func = $mob.ext._bindCallbackFunc(callback);
    $mob.native.ssdk_plugin_wechat_share(appId, scene, $mob.shareSDK.contentType.Audio, func, title, desc, thumbImage, url, musicUrl);
};

/**
 * 微信分享视频
 * @param appId             应用标识
 * @param scene             分享场景
 * @param title             标题
 * @param desc              描述
 * @param thumbImage        缩略图
 * @param url               视频链接
 * @param callback          回调
 */
$mob.ext.ssdk_wechatShareVideo = function (appId, scene, title, desc, thumbImage, url, callback)
{
    var func = $mob.ext._bindCallbackFunc(callback);
    $mob.native.ssdk_plugin_wechat_share(appId, scene, $mob.shareSDK.contentType.Video, func, title, desc, thumbImage, url);
};

/**
 * 微信分享文件
 * @param appId             应用标识
 * @param scene             分享场景
 * @param title             标题
 * @param desc              描述
 * @param thumbImage        缩略图
 * @param fileExtension     文件类型
 * @param sourceFileData    文件数据
 * @param callback          回调
 */
$mob.ext.ssdk_wechatShareFile = function (appId, scene, title, desc, thumbImage, fileExtension, sourceFileData, callback)
{
    var func = $mob.ext._bindCallbackFunc(callback);
    $mob.native.ssdk_plugin_wechat_share(appId, scene, $mob.shareSDK.contentType.File, func, title, desc, thumbImage, fileExtension, sourceFileData);
};

/**
 * 微信分享小程序
 * @param appId             应用标识
 * @param scene             分享场景
 * @param title             标题
 * @param desc              描述
 * @param thumbImage        缩略图
 * @param url               视频链接
 * @param callback          回调
 */
$mob.ext.ssdk_wechatShareMiniProgram = function (appId, scene, title, desc, thumbImage, hd_thumb_image, userName, path, webpageURL, withTicket, mpType, callback)
{
    var func = $mob.ext._bindCallbackFunc(callback);
    $mob.native.ssdk_plugin_wechat_share(appId, scene, $mob.shareSDK.contentType.MiniProgram, func, title, desc, thumbImage, userName, path, webpageURL, withTicket, mpType, hd_thumb_image);
};

/**
 * 微博分享回调请求
 * @param appKey          应用标识
 * @param url            请求的URL链接
 * @param callback       回调
 */
$mob.ext.ssdk_weiboHandleShareCallback = function (appKey, url, callback)
{
    var func = $mob.ext._bindCallbackFunc(callback);
    $mob.native.ssdk_plugin_weibo_handleShareCallback(appKey, url, func);
};


//获取微博的aid参数
$mob.ext.sdk_getWeiboAid = function (appKey, callback)
{
    var func = $mob.ext._bindCallbackFunc(callback);
    $mob.native.ssdk_plugin_weibo_getAid(appKey, func);
};

/**
 * 微博分享文本
 * @param appKey            应用标识
 * @param text              分享文本
 * @param access_token      授权token
 * @param callback          回调
 */
$mob.ext.ssdk_weiboShareText = function (appKey, text, access_token, callback)
{
    var func = $mob.ext._bindCallbackFunc(callback);
    $mob.native.ssdk_plugin_weibo_share(appKey, $mob.shareSDK.contentType.Text, func, text , access_token);
};

/**
 * 微博分享图片
 * @param appKey            应用标识
 * @param text              分享文本
 * @param image             图片
 * @param access_token      授权token
 * @param callback          回调
 */
$mob.ext.ssdk_weiboShareImage = function (appKey, text, images, access_token, isStory, callback)
{
    var func = $mob.ext._bindCallbackFunc(callback);
    $mob.native.ssdk_plugin_weibo_share(appKey, $mob.shareSDK.contentType.Image, func, text, images, access_token, isStory);
};

/**
 * 微博分享视频
 * @param appKey            应用标识
 * @param text              分享文本
 * @param image             图片
 * @param access_token      授权token
 * @param callback          回调
 */
$mob.ext.ssdk_weiboShareVideo = function (appKey, text, video, access_token, isStory, callback)
{
    var func = $mob.ext._bindCallbackFunc(callback);
    $mob.native.ssdk_plugin_weibo_share(appKey, $mob.shareSDK.contentType.Video, func, text, video, access_token, isStory);
};

/**
 * 微博分享网页
 * @param appKey            应用标识
 * @param title             标题
 * @param desc              描述
 * @param thumbImage        缩略图
 * @param url               链接
 * @param objectId          对象ID
 * @param access_token      授权token
 * @param callback          回调
 */
$mob.ext.ssdk_weiboShareWebpage = function (appKey, title, desc, thumbImage, url, objectId, access_token, callback)
{
    var func = $mob.ext._bindCallbackFunc(callback);
    $mob.native.ssdk_plugin_weibo_share(appKey, $mob.shareSDK.contentType.WebPage, func, title, desc, thumbImage, url, objectId , access_token);
};


/**
 * 微博分享文本
 * @param appKey            应用标识
 * @param text              分享文本
 * @param access_token      授权token
 * @param callback          回调
 */
$mob.ext.ssdk_weiboShareTextNoSDK = function (appKey, aid, access_token, text, callback)
{
    var func = $mob.ext._bindCallbackFunc(callback);
    $mob.native.ssdk_plugin_weibo_nosdk_share(appKey, $mob.shareSDK.contentType.Text, func, aid, access_token, text);
};

/**
 * 微博分享图片
 * @param appKey            应用标识
 * @param text              分享文本
 * @param image             图片
 * @param access_token      授权token
 * @param callback          回调
 */
$mob.ext.ssdk_weiboShareImageNoSDK = function (appKey, aid, access_token, text, image, callback)
{
    var func = $mob.ext._bindCallbackFunc(callback);
    $mob.native.ssdk_plugin_weibo_nosdk_share(appKey, $mob.shareSDK.contentType.Image, func, aid, access_token, text, image);
};

/**
 * QQ授权
 * @param appId              应用标识
 * @param scopes             权限列表
 * @param callback           回调
 * @param QQShareType        QQ分享类型
 */
$mob.ext.ssdk_qqAuth = function (appId, scopes, QQShareType, callback)
{
    var func = $mob.ext._bindCallbackFunc(callback);
    $mob.native.ssdk_plugin_qq_auth(appId, scopes, func , QQShareType);
};

/**
 * 处理QQ授权回调
 * @param appId              应用标识
 * @param url                请求URL
 * @param callback           回调
 */
$mob.ext.ssdk_qqHandlerSSOCallback = function (appId, url, callback)
{
    var func = $mob.ext._bindCallbackFunc(callback);
    $mob.native.ssdk_plugin_qq_handleSSOCallback(appId, url, func);
};

/**
 * QQ分享文本
 * @param appId             应用标识
 * @param scene             分享场景
 * @param text              分享文本
 * @param callback          回调
 */
$mob.ext.ssdk_qqShareText = function (appId, scene, text, QQShareType, callback)
{
    var func = $mob.ext._bindCallbackFunc(callback);
    $mob.native.ssdk_plugin_qq_share(appId, scene, $mob.shareSDK.contentType.Text, func, text , QQShareType);
};

/**
 * QQ分享图片
 * @param appId             应用标识
 * @param scene             分享场景
 * @param title             标题
 * @param desc              描述
 * @param thumbImage        缩略图
 * @param image             图片
 * @param callback          回调
 */
$mob.ext.ssdk_qqShareImage = function (appId, scene, title, desc, thumbImage, image, QQShareType, callback)
{
    var func = $mob.ext._bindCallbackFunc(callback);
    $mob.native.ssdk_plugin_qq_share(appId, scene, $mob.shareSDK.contentType.Image, func, title, desc, thumbImage, image , QQShareType);
};

/**
 * QQ分享网页
 * @param appId             应用标识
 * @param scene             分享场景
 * @param title             分享标题
 * @param desc              描述
 * @param thumbImage        缩略图
 * @param url               分享链接
 * @param callback          回调
 */
$mob.ext.ssdk_qqShareWebpage = function (appId, scene, title, desc, thumbImage, url, QQShareType, callback)
{
    var func = $mob.ext._bindCallbackFunc(callback);
    $mob.native.ssdk_plugin_qq_share(appId, scene, $mob.shareSDK.contentType.WebPage, func, title, desc, thumbImage, url , QQShareType);
};

/**
 * QQ分享音频
 * @param appId             应用标识
 * @param scene             分享场景
 * @param title             分享标题
 * @param desc              描述
 * @param thumbImage        缩略图
 * @param url               分享链接
 * @param audioFlashUrl     音频缩略图播放源
 * @param callback          回调
 */
$mob.ext.ssdk_qqShareAudio = function (appId, scene, title, desc, thumbImage, url, audioFlashUrl, QQShareType, callback)
{
    var func = $mob.ext._bindCallbackFunc(callback);
    $mob.native.ssdk_plugin_qq_share(appId, scene, $mob.shareSDK.contentType.Audio, func, title, desc, thumbImage, url, audioFlashUrl ,QQShareType);
};

/**
 * QQ分享视频
 * @param appId             应用标识
 * @param scene             分享场景
 * @param title             分享标题
 * @param desc              描述
 * @param thumbImage        缩略图
 * @param url               分享链接
 * @param videoFlashUrl     视频缩略图播放源
 * @param callback          回调
 */
$mob.ext.ssdk_qqShareVideo = function (appId, scene, title, desc, thumbImage, url, videoFlashUrl, QQShareType, callback)
{
    var func = $mob.ext._bindCallbackFunc(callback);
    $mob.native.ssdk_plugin_qq_share(appId, scene, $mob.shareSDK.contentType.Video, func, title, desc, thumbImage, url, videoFlashUrl , QQShareType);
};

/**
 * 处理QQ分享回调
 * @param appId             应用标识
 * @param url               URL请求
 * @param callback          回调
 */
$mob.ext.ssdk_qqHandlerShareCallback = function (appId, url, callback)
{
    var func = $mob.ext._bindCallbackFunc(callback);
    $mob.native.ssdk_plugin_qq_handleShareCallback(appId, url, func);
};

/**
 * 进行腾讯微博授权
 * @param appKey            应用标识
 * @param appSecret         应用密钥
 * @param redirectUri       回调地址
 * @param callback          回调
 */
$mob.ext.ssdk_tcweiboAuth = function (appKey, appSecret, redirectUri, callback)
{
    var func = $mob.ext._bindCallbackFunc(callback);
    $mob.native.ssdk_plugin_tcweibo_auth(appKey, appSecret, redirectUri, func);
};

/**
 * 处理腾讯微博SSO授权回调
 * @param appKey        应用标识
 * @param appSecret     应用密钥
 * @param redirectUri   回调地址
 * @param url           URL请求
 * @param callback      回调
 */
$mob.ext.ssdk_tcweiboHandleSSOCallback = function (appKey, appSecret, redirectUri, url, callback)
{
    var func = $mob.ext._bindCallbackFunc(callback);
    $mob.native.ssdk_plugin_tcweibo_handleSSOCallback(appKey, appSecret, redirectUri, url, func);
};

/**
 * 新浪微博SSO授权
 * @param appKey            应用标识
 * @param redirectUri       回调地址
 * @param scope             权限列表
 * @param callback          回调
 */
$mob.ext.ssdk_weiboAuth = function (appKey, redirectUri, scope, callback)
{
    var func = $mob.ext._bindCallbackFunc(callback);
    $mob.native.ssdk_plugin_weibo_auth(appKey, redirectUri, scope, func);
};

/**
 * 处理新浪微博SSO授权回调
 * @param appKey            应用标识
 * @param url               URL请求
 * @param callback          回调
 */
$mob.ext.ssdk_weiboHandleSSOCallback = function (appKey, url, callback)
{
    var func = $mob.ext._bindCallbackFunc(callback);
    $mob.native.ssdk_plugin_weibo_handleSSOCallback(appKey, url, func);
};

/**
 * 获取短链
 * @param platform          分享平台类型
 * @param urls              分享链接
 * @param user              用户信息
 * @param callback          回调
 */
$mob.ext.ssdk_getShortUrls = function (platform, urls, user, callback)
{
    var func = $mob.ext._bindCallbackFunc(callback);
    $mob.native.ssdk_getShortUrls(platform, urls, user, func);
};

/**
 * 短信分享
 * @param type              分享类型
 * @param text              文本
 * @param title             标题
 * @param attachements      附件列表
 * @param recipients        接收用户
 * @param callback          回调
 */
$mob.ext.ssdk_smsShare = function (type, text, title, attachements, recipients, callback)
{
    var func = $mob.ext._bindCallbackFunc(callback);
    $mob.native.ssdk_plugin_sms_share(type, func, text, title, attachements, recipients);
};

/**
 * 邮件分享
 * @param type              分享类型
 * @param text              文本
 * @param title             标题
 * @param attachments       附件列表
 * @param recipients        接收用户
 * @param cc                抄送用户
 * @param bcc               密送用户
 * @param callback          回调
 */
$mob.ext.ssdk_mailShare = function (type, text, title, attachments, recipients, cc, bcc, callback)
{
    var func = $mob.ext._bindCallbackFunc(callback);
    $mob.native.ssdk_plugin_mail_share(type, func, text, title, attachments, recipients, cc, bcc);
};

/**
 * 拷贝
 * @param type              拷贝类型
 * @param text              文本
 * @param images            图片列表
 * @param urls              链接列表
 * @param callback          回调
 */
$mob.ext.ssdk_copy = function (type, text, images, urls, callback)
{
    var func = $mob.ext._bindCallbackFunc(callback);
    $mob.native.ssdk_plugin_copy(type, func, text, images, urls);
};

/**
 * 人人网授权
 * @param appId             应用标识
 * @param appKey            应用Key
 * @param secretKey         应用密钥
 * @param scopes            权限列表
 * @param callback          回调
 */
$mob.ext.ssdk_renrenAuth = function (appId, appKey, secretKey, scopes, callback)
{
    var func = $mob.ext._bindCallbackFunc(callback);
    $mob.native.ssdk_plugin_renren_auth(appId, appKey, secretKey, scopes, func);
};

/**
 * 人人网处理SSO授权回调
 * @param appId             应用标识
 * @param appKey            应用Key
 * @param secretKey         应用密钥
 * @param url               请求链接
 * @param callback          回调
 */
$mob.ext.ssdk_renrenHandleSSOCallback = function (appId, appKey, secretKey, url, callback)
{
    var func = $mob.ext._bindCallbackFunc(callback);
    $mob.native.ssdk_plugin_renren_handleSSOCallback(appId, appKey, secretKey, url, func);
};

/**
 * Google+分享文本
 * @param text                  分享文本
 * @param callback              回调
 */
$mob.ext.ssdk_googleplusShareText = function (text, callback)
{
    var func = $mob.ext._bindCallbackFunc(callback);
    $mob.native.ssdk_plugin_googleplus_share($mob.shareSDK.contentType.Text, func, text);
};

/**
 * Google+分享网页
 * @param text                  分享文本
 * @param url                   分享链接
 * @param callback              回调
 */
$mob.ext.ssdk_googleplusShareWebPage = function (text, url, callback)
{
    var func = $mob.ext._bindCallbackFunc(callback);
    $mob.native.ssdk_plugin_googleplus_share($mob.shareSDK.contentType.WebPage, func, text, url);

};

/**
 * facebook授权
 * @param appId                 应用标识
 * @param callback              回调
 */
$mob.ext.ssdk_faceBookAuth = function (appId, scopes, callback)
{
    var func = $mob.ext._bindCallbackFunc(callback);
    $mob.native.ssdk_plugin_facebook_auth (appId, scopes ,func);
};

/**
 *  Facebook分享网页
 *
 *  @param appId       应用标识
 *  @param redirectUrl 回调地址
 *  @param callback    回调
 *  @param caption     链接标题
 *  @param desc        链接说明
 *  @param url         分享链接
 *  @param image       分享图片
 *  @param name        附件名称
 *  @param source      附件链接地址
 */
$mob.ext.ssdk_facebookShareWebPage = function (appId, redirectUrl, caption, desc, url, image, name, source, callback)
{
    var func = $mob.ext._bindCallbackFunc(callback);
    $mob.native.ssdk_plugin_facebook_web_share($mob.shareSDK.contentType.WebPage, func, appId, redirectUrl, caption, desc, url, image, name, source);
    
};

/**
 *  Facebook分享应用
 *
 *  @param appId       应用标识
 *  @param url         分享应用地址
 *  @param image       分享应用图片地址
 *  @param callback    回调
 */
$mob.ext.ssdk_facebookShareApp = function (appId, appName, url, image, callback)
{
    var func = $mob.ext._bindCallbackFunc(callback);
    $mob.native.ssdk_plugin_facebook_web_share($mob.shareSDK.contentType.App, func, appId, appName, url, image);
}

/**
 *  Facebook分享应用
 *
 *  @param appId       应用标识
 *  @param url         分享应用地址
 *  @param image       分享应用图片地址
 *  @param callback    回调
 */
$mob.ext.ssdk_facebookClientShareApp = function (appId, appName, url, image, callback)
{
    var func = $mob.ext._bindCallbackFunc(callback);
    $mob.native.ssdk_plugin_facebook_share($mob.shareSDK.contentType.App, func, appId, appName, url, image);
}


/**
 *  Facebook分享链接
 *
 *  @param callback    回调
 *  @param titel     链接标题
 *  @param desc        链接说明
 *  @param url         分享链接
 */
$mob.ext.ssdk_facebookClientShareWebPage = function (appKey , appName ,url ,title, desc, imageUrl, callback )
{
    var func = $mob.ext._bindCallbackFunc(callback);
    $mob.native.ssdk_plugin_facebook_share($mob.shareSDK.contentType.WebPage,func, appKey , appName , url , title , desc ,imageUrl);
    
};


/**
 * Facebook分享图片
 * @param images            图片数组
 * @param callback          回调
 */
$mob.ext.ssdk_facebookShareImage = function (appKey ,appName, images, callback)
{
    var func = $mob.ext._bindCallbackFunc(callback);
    $mob.native.ssdk_plugin_facebook_share($mob.shareSDK.contentType.Image , func ,appKey , appName , images);
};

/**
 * Facebook分享视频
 * @param images            图片数组
 * @param callback          回调
 */
$mob.ext.ssdk_facebookShareVideo = function (appKey ,appName, video, uid, sessionId, accessToken, callback)
{
    var func = $mob.ext._bindCallbackFunc(callback);
    $mob.native.ssdk_plugin_facebook_share($mob.shareSDK.contentType.Video , func , appKey, appName , video , uid , sessionId , accessToken);
};

/**
 * facebook分享回调请求
 * @param appId          应用标识
 * @param url            请求的URL链接
 * @param callback       回调
 */
$mob.ext.ssdk_facebookHandleShareCalback = function (appId, url, callback)
{
    var func = $mob.ext._bindCallbackFunc(callback);
    $mob.native.ssdk_plugin_facebook_handleShareCallback(appId, url, func);
};

/**
 * Instagram分享
 * @param type                  分享类型
 * @param image                 分享图片
 * @param x                     菜单显示的横坐标
 * @param y                     菜单显示的纵坐标
 * @param callback              回调
 */
$mob.ext.ssdk_instagramShare = function (type, image, x, y, callback)
{
    var func = $mob.ext._bindCallbackFunc(callback);
    $mob.native.ssdk_plugin_instagram_share (type, func, image, x, y);
};

/**
 * WhatsApp分享文本
 * @param text                  文本
 * @param callback              回调
 */
$mob.ext.ssdk_whatsappShareText = function (text, callback)
{
    var func = $mob.ext._bindCallbackFunc(callback);
    $mob.native.ssdk_plugin_whatsapp_share ($mob.shareSDK.contentType.Text, func, text);
};

/**
 * WhatsApp分享图片
 * @param image                 图片对象
 * @param x                     菜单显示的横坐标
 * @param y                     菜单显示的纵坐标
 * @param callback              回调
 */
$mob.ext.ssdk_whatsappShareImage = function (image, x, y, callback)
{
    var func = $mob.ext._bindCallbackFunc(callback);
    $mob.native.ssdk_plugin_whatsapp_share ($mob.shareSDK.contentType.Image, func, image, x, y);
};

/**
 * WhatsApp分享音频
 * @param audio                  音频对象
 * @param x                      菜单显示横坐标
 * @param y                      菜单显示纵坐标
 * @param callback               回调
 */
$mob.ext.ssdk_whatsappShareAudio = function (audio, x, y, callback)
{
    var func = $mob.ext._bindCallbackFunc(callback);
    $mob.native.ssdk_plugin_whatsapp_share ($mob.shareSDK.contentType.Audio, func, audio, x, y);
};

/**
 * WhatsApp分享视频
 * @param video                  视频对象
 * @param x                      菜单显示横坐标
 * @param y                      菜单显示纵坐标
 * @param callback               回调
 */
$mob.ext.ssdk_whatsappShareVideo = function (video, x, y, callback)
{
    var func = $mob.ext._bindCallbackFunc(callback);
    $mob.native.ssdk_plugin_whatsapp_share ($mob.shareSDK.contentType.Video, func, video, x, y);
};

//相册视频并返回回调数据
$mob.ext.ssdk_facebookmessengerShareAssetVideo = function (appKey ,videoURL, callback)
{
    var func = $mob.ext._bindCallbackFunc(callback);
    $mob.native.ssdk_plugin_facebookmessenger_share ($mob.shareSDK.contentType.FBMessageVideo, func, videoURL , appKey);
};

/**
 * Facebook Messenger分享图片
 * @param image                 图片对象
 * @param callback              回调
 */
$mob.ext.ssdk_facebookmessengerShareImage = function (appKey, images, callback)
{
    var func = $mob.ext._bindCallbackFunc(callback);
    $mob.native.ssdk_plugin_facebookmessenger_share ($mob.shareSDK.contentType.Image, func, images, appKey);
};

//分享多图并返回回调数据
$mob.ext.ssdk_facebookmessengerShareImages = function (appKey ,images, callback)
{
    var func = $mob.ext._bindCallbackFunc(callback);
    $mob.native.ssdk_plugin_facebookmessenger_share ($mob.shareSDK.contentType.FBMessageImages, func, images , appKey);
};


/**
 *  Facebook Messenger分享链接
 */
$mob.ext.ssdk_facebookmessengerShareWebPage = function (appKey ,url ,title, desc, imageUrl, callback )
{
    var func = $mob.ext._bindCallbackFunc(callback);
    $mob.native.ssdk_plugin_facebookmessenger_share($mob.shareSDK.contentType.WebPage, func, appKey , url , title , desc ,imageUrl);
    
};

/**
 * Facebook Messenger分享gif
 * @param gif                   gif图片对象
 * @param callback              回调
 */
$mob.ext.ssdk_facebookmessengerShareGif = function (appKey, gif, callback)
{
    var func = $mob.ext._bindCallbackFunc(callback);
    $mob.native.ssdk_plugin_facebookmessenger_share ($mob.shareSDK.contentType.Image, func, null, appKey, gif);
};

/**
 * Facebook Messenger分享音频
 * @param audio                  音频对象
 * @param callback               回调
 */
$mob.ext.ssdk_facebookmessengerShareAudio = function (appKey, audio, callback)
{
    var func = $mob.ext._bindCallbackFunc(callback);
    $mob.native.ssdk_plugin_facebookmessenger_share ($mob.shareSDK.contentType.Audio, func, audio, appKey);
};

/**
 * Facebook Messenger分享视频
 * @param video                  视频对象
 * @param callback               回调
 */
$mob.ext.ssdk_facebookmessengerShareVideo = function (appKey, video, callback)
{
    var func = $mob.ext._bindCallbackFunc(callback);
    $mob.native.ssdk_plugin_facebookmessenger_share ($mob.shareSDK.contentType.Video, func, video, appKey);
};


/**
 * facebookMessenger分享回调请求
 * @param appId          应用标识
 * @param url            请求的URL链接
 * @param callback       回调
 */
$mob.ext.ssdk_facebookMessengerHandleShareCalback = function (appId, url, callback)
{
    var func = $mob.ext._bindCallbackFunc(callback);
    $mob.native.ssdk_plugin_facebookmessage_handleShareCallback(appId, url, func);
};


/**
 * Line分享文本
 * @param text                  文本
 * @param callback              回调
 */
$mob.ext.ssdk_lineShareText = function (text, callback)
{
    var func = $mob.ext._bindCallbackFunc(callback);
    $mob.native.ssdk_plugin_line_share ($mob.shareSDK.contentType.Text, func, text);
};

/**
 * Line分享图片
 * @param image                 图片
 * @param callback              回调
 */
$mob.ext.ssdk_lineShareImage = function (image, callback)
{
    var func = $mob.ext._bindCallbackFunc(callback);
    $mob.native.ssdk_plugin_line_share ($mob.shareSDK.contentType.Image, func, image);
};

/**
 * Line授权回调请求
 * @param appId          应用标识
 * @param sessionId      会话标识
 * @param url            请求的URL链接
 * @param callback       回调
 */
$mob.ext.ssdk_lineHandleSSOCalback = function (url, callback)
{
    var func = $mob.ext._bindCallbackFunc(callback);
    $mob.native.ssdk_plugin_line_handleSSOCallback(url, func);
};

/**
 * 获取Evernote用户信息
 * @param baseUrl               基础路径
 * @param oauthToken            令牌信息
 * @param callback              回调
 */
$mob.ext.ssdk_evernoteGetUserInfo = function (baseUrl, oauthToken, callback)
{
    var func = $mob.ext._bindCallbackFunc(callback);
    $mob.native.ssdk_plugin_evernote_getuserinfo (baseUrl, oauthToken, func);
};

/**
 * Evernote分享
 * @param requestUrl            请求链接
 * @param oauthToken            令牌信息
 * @param text                  分享内容
 * @param images                分享图片
 * @param title                 分享标题
 * @param notebook              笔记本Guid
 * @param tags                  标签Guid列表
 * @param callback              回调
 */
$mob.ext.ssdk_evernoteShare = function (requestUrl, oauthToken, text, images, title, notebook, tags, callback)
{
    var func = $mob.ext._bindCallbackFunc(callback);
    $mob.native.ssdk_plugin_evernote_share (requestUrl, oauthToken, text, images, title, notebook, tags, func);
};

/**
 * 支付宝好友分享文本
 * @param appId                 应用标识
 * @param text                  分享内容
 * @param callback              回调
 */
$mob.ext.ssdk_alipayShareText = function (appId, scene, text, callback)
{
    var func = $mob.ext._bindCallbackFunc(callback);
    $mob.native.ssdk_plugin_ali_share(appId, scene, $mob.shareSDK.contentType.Text, func, text);
};

/**
 * 支付宝好友分享图片
 * @param appId                 应用标识
 * @param title                 标题
 * @param desc                  描述
 * @param image                 图片
 * @param callback              回调
 */
$mob.ext.ssdk_alipayShareImage = function (appId, scene, title, desc, image, callback)
{
    var func = $mob.ext._bindCallbackFunc(callback);
    $mob.native.ssdk_plugin_ali_share(appId, scene, $mob.shareSDK.contentType.Image, func, title, desc, image);
};

/**
 * 支付宝好友分享网页
 * @param appId                 应用标识
 * @param title                 标题
 * @param desc                  描述
 * @param image                 图片
 * @param url                   网址
 * @param callback              回调
 */
$mob.ext.ssdk_alipayShareWebpage = function (appId, scene, title, desc, image, url, callback)
{
    var func = $mob.ext._bindCallbackFunc(callback);
    $mob.native.ssdk_plugin_ali_share(appId, scene, $mob.shareSDK.contentType.WebPage, func, title, desc, image, url);
};

/**
 * 处理分享回调
 * @param appId                 应用标识
 * @param url                   回调地址
 * @param callback              回调
 */
$mob.ext.ssdk_alipayHandleShareCallback = function (appId, url, callback)
{
    var func = $mob.ext._bindCallbackFunc(callback);
    $mob.native.ssdk_plugin_ali_handleShareCallback(appId, url, func);
};

/**
 * Kakao授权回调处理
 * @param appKey                应用标识
 * @param redirectUri           回调地址
 * @param scope                 权限列表
 * @param clientType            授权客户端类型，2 Talk，4 Story
 * @param callback              回调
 */
$mob.ext.ssdk_kakaoAuth = function (appKey, redirectUri, scope, clientType, callback)
{
    var func = $mob.ext._bindCallbackFunc(callback);
    $mob.native.ssdk_plugin_kakao_auth (appKey, redirectUri, scope, clientType, func);
};

/**
 * Line授权回调处理
 * @param callback              回调
 */
$mob.ext.ssdk_lineAuth = function(authType,callback)
{
    var func = $mob.ext._bindCallbackFunc(callback);
    $mob.native.ssdk_plugin_line_auth(authType,func);
};

/**
 * Kakao处理SSO授权回调
 * @param appKey                应用标识
 * @param url                   回调地址
 * @param callback              回调
 */
$mob.ext.ssdk_kakaoHandleSSOCallback = function (appKey, url, callback)
{
    var func = $mob.ext._bindCallbackFunc(callback);
    $mob.native.ssdk_plugin_kakao_handleSSOCallback (appKey, url, func);
};

/**
 * Kakao分享文本
 * @param appKey                应用标识
 * @param scene                 分享场景
 * @param text                  分享文本
 * @param callback              回调
 */
$mob.ext.ssdk_kakaoShareText = function (appKey, scene, text, callback)
{
    var func = $mob.ext._bindCallbackFunc(callback);
    $mob.native.ssdk_plugin_kakao_share (appKey, scene, $mob.shareSDK.contentType.Text, func, text);
};

/**
 * Kakao分享图片
 * @param appKey                应用标识
 * @param scene                 分享场景
 * @param text                  分享文本
 * @param imageUrl              图片路径
 * @param imageWidth            图片宽度
 * @param imageHeight           图片高度
 * @param callback              回调
 */
$mob.ext.ssdk_kakaoShareImage = function (appKey, scene, text, imageUrl, imageWidth, imageHeight, callback)
{
    var func = $mob.ext._bindCallbackFunc(callback);
    $mob.native.ssdk_plugin_kakao_share (appKey, scene, $mob.shareSDK.contentType.Image, func, text, imageUrl, imageWidth, imageHeight);
};

/**
 * Kakao分享网页
 * @param appKey                应用标识
 * @param scene                 分享场景
 * @param text                  分享文本
 * @param imageUrl              图片路径
 * @param imageWidth            图片宽度
 * @param imageHeight           图片高度
 * @param title                 标题
 * @param url                   网址
 * @param callback              回调
 */
$mob.ext.ssdk_kakaoShareWebpage = function (appKey, scene, text, imageUrl, imageWidth, imageHeight, title, url, callback)
{
    var func = $mob.ext._bindCallbackFunc(callback);
    $mob.native.ssdk_plugin_kakao_share (appKey, scene, $mob.shareSDK.contentType.WebPage, func, text, imageUrl, imageWidth, imageHeight, title, url);
};

/**
 * Kakao分享应用
 * @param appKey                应用标识
 * @param scene                 分享场景
 * @param text                  分享文本
 * @param imageUrl              图片路径
 * @param imageWidth            图片宽度
 * @param imageHeight           图片高度
 * @param title                 标题
 * @param url                   网址
 * @param appButtonTitle        应用按钮标签
 * @param andoridExecParams     Android应用启动参数
 * @param iphoneExecParams      iPhone应用启动参数
 * @param ipadExecParams        iPad应用启动参数
 * @param callback              回调
 */
$mob.ext.ssdk_kakaoShareApp = function (appKey, scene, text, imageUrl, imageWidth, imageHeight, title, url, appButtonTitle, andoridExecParams, iphoneExecParams, ipadExecParams, callback)
{
    var func = $mob.ext._bindCallbackFunc(callback);
    $mob.native.ssdk_plugin_kakao_share (appKey, scene, $mob.shareSDK.contentType.App, func, text, imageUrl, imageWidth, imageHeight, title, url, appButtonTitle, andoridExecParams, iphoneExecParams, ipadExecParams);
};

/**
 * 易信授权
 * @param appId                 应用标识
 * @param callback              回调
 */
$mob.ext.ssdk_yixinAuth = function (appId, callback)
{
    var func = $mob.ext._bindCallbackFunc(callback);
    $mob.native.ssdk_plugin_yixin_auth (appId, func);

};

/**
 * 易信处理SSO回调
 * @param appId                 应用标识
 * @param sessionId             会话标识
 * @param url                   回调地址
 * @param callback              回调
 */
$mob.ext.ssdk_yixinHandleSSOCallback = function (appId, sessionId, url, callback)
{
    var func = $mob.ext._bindCallbackFunc(callback);
    $mob.native.ssdk_plugin_yixin_handleSSOCallback(appId, sessionId, url, func);
};

/**
 * 易信分享回调请求
 * @param appId          应用标识
 * @param url            请求的URL链接
 * @param callback       回调
 */
$mob.ext.ssdk_yixinHandleShareCalback = function (appId, url, callback)
{
    var func = $mob.ext._bindCallbackFunc(callback);
    $mob.native.ssdk_plugin_yixin_handleShareCallback(appId, url, func);
};


/**
 * 易信分享
 * @param appId             应用标识
 * @param scene             分享场景
 * @param text              分享文本
 * @param callback          回调
 */
$mob.ext.ssdk_yixinShareText = function (appId, scene, text, callback)
{
    var func = $mob.ext._bindCallbackFunc(callback);
    $mob.native.ssdk_plugin_yixin_share(appId, scene, $mob.shareSDK.contentType.Text, func, text);

};

/**
 * 易信分享图片
 * @param appId             应用标识
 * @param scene             分享场景
 * @param title             标题
 * @param desc              图片描述
 * @param thumbImage        图片缩略图
 * @param image             图片
 * @param callback          回调
 */
$mob.ext.ssdk_yixinShareImage = function (appId, scene, title, desc, thumbImage, image, callback)
{
    var func = $mob.ext._bindCallbackFunc(callback);
    $mob.native.ssdk_plugin_yixin_share(appId, scene, $mob.shareSDK.contentType.Image, func, title, desc, thumbImage, image);

};

/**
 * 易信分享网页
 * @param appId             应用标识
 * @param scene             分享场景
 * @param title             标题
 * @param desc              网页描述
 * @param thumbImage        缩略图
 * @param url               网页地址
 * @param callback          回调
 */
$mob.ext.ssdk_yixinShareWebpage = function (appId, scene, title, desc, thumbImage, url, callback)
{
    var func = $mob.ext._bindCallbackFunc(callback);
    $mob.native.ssdk_plugin_yixin_share(appId, scene, $mob.shareSDK.contentType.WebPage, func, title, desc, thumbImage, url);
};

/**
 * 易信分享App
 * @param appId             应用标识
 * @param scene             分享场景
 * @param title             标题
 * @param desc              描述
 * @param thumbImage        缩略图
 * @param url               网页地址
 * @param extInfo           扩展信息
 * @param fileData          文件数据
 * @param callback          回调
 */
$mob.ext.ssdk_yixinShareApp = function (appId, scene, title, desc, thumbImage, url, extInfo, fileData, callback)
{
    var func = $mob.ext._bindCallbackFunc(callback);
    $mob.native.ssdk_plugin_yixin_share(appId, scene, $mob.shareSDK.contentType.App, func, title, desc, thumbImage, url, extInfo, fileData);
};

/**
 * 易信分享视频
 * @param appId             应用标识
 * @param scene             分享场景
 * @param title             标题
 * @param desc              描述
 * @param thumbImage        缩略图
 * @param url               视频链接
 * @param callback          回调
 */
$mob.ext.ssdk_yixinShareVideo = function (appId, scene, title, desc, thumbImage, url, callback)
{
    var func = $mob.ext._bindCallbackFunc(callback);
    $mob.native.ssdk_plugin_yixin_share(appId, scene, $mob.shareSDK.contentType.Video, func, title, desc, thumbImage, url);
};

/**
 * 易信分享音频
 * @param appId             应用标识
 * @param scene             分享场景
 * @param title             标题
 * @param desc              描述
 * @param thumbImage        缩略图
 * @param url               音乐网址
 * @param musicUrl          音乐文件网址
 * @param callback          回调
 */
$mob.ext.ssdk_yixinShareAudio = function (appId, scene, title, desc, thumbImage, url, musicUrl, callback)
{
    var func = $mob.ext._bindCallbackFunc(callback);
    $mob.native.ssdk_plugin_yixin_share(appId, scene, $mob.shareSDK.contentType.Audio, func, title, desc, thumbImage, url, musicUrl);
};

/**
 * 打印分享
 * @param type                  分享类型
 * @param text                  分享文本
 * @param image                 分享图片
 * @param menuDisplayX          菜单显示位置横坐标
 * @param menuDisplayY          菜单显示位置仲坐标
 * @param callback              回调
 */
$mob.ext.ssdk_printShare = function (type, text, image, menuDisplayX, menuDisplayY, callback)
{
    var func = $mob.ext._bindCallbackFunc(callback);
    $mob.native.ssdk_plugin_print_share(type, func, text, image, menuDisplayX, menuDisplayY);
};


/**
 * 钉钉分享文本
 * @param appId                 应用标识
 * @param text                  分享内容
 * @param callback              回调
 */
$mob.ext.ssdk_dingtalkShareText = function (appId, text, callback)
{
    var func = $mob.ext._bindCallbackFunc(callback);
    $mob.native.ssdk_plugin_dingtalk_share(appId, $mob.shareSDK.contentType.Text, func, text);
};

/**
 * 钉钉分享图片
 * @param appId                 应用标识
 * @param title                 标题
 * @param desc                  描述
 * @param image                 图片
 * @param callback              回调
 */
$mob.ext.ssdk_dingtalkShareImage = function (appId, title, desc, image, callback)
{
    var func = $mob.ext._bindCallbackFunc(callback);
    $mob.native.ssdk_plugin_dingtalk_share(appId, $mob.shareSDK.contentType.Image, func, title, desc, image);
};

/**
 * 钉钉分享网页
 * @param appId                 应用标识
 * @param title                 标题
 * @param desc                  描述
 * @param image                 图片
 * @param url                   网址
 * @param callback              回调
 */
$mob.ext.ssdk_dingtalkShareWebpage = function (appId, title, desc, image, url, callback)
{
    var func = $mob.ext._bindCallbackFunc(callback);
    $mob.native.ssdk_plugin_dingtalk_share(appId, $mob.shareSDK.contentType.WebPage, func, title, desc, image, url);
};

/**
 * 钉钉处理分享回调
 * @param appId                 应用标识
 * @param url                   回调地址
 * @param callback              回调
 */
$mob.ext.ssdk_dingtalkHandleShareCallback = function (appId, url, callback)
{
    var func = $mob.ext._bindCallbackFunc(callback);
    $mob.native.ssdk_plugin_dingtalk_handleShareCallback(appId, url, func);
};

/**
 * 获取粘贴板数据
 * @param platform              平台
 * @param appId                 应用标识
 * @param callback              回调
 */

$mob.ext.ssdk_getDataFromPasteboard = function (appId, sessionId, url, platformType, callback)
{
    var func = $mob.ext._bindCallbackFunc(callback);
    $mob.native.ssdk_plugin_getDataFromPasteboard(appId, sessionId, url, platformType, func);
};

/**
 * 设置粘贴板数据
 * @param platform              平台
 * @param appId                 应用标识
 * @param data                  需要写入粘贴板的数据
 * @param callback              回调
 */
$mob.ext.ssdk_setDataToPasteboard = function (platformType , appId, data , sessionId, callback)
{
    var func = $mob.ext._bindCallbackFunc(callback);
    $mob.native.ssdk_plugin_setDataToPasteboard(platformType, appId , data,sessionId, func);
};

/**
 * 获取图片数据
 * @param imagePath             图片路径
 * @param thumbImagePath        缩略图片路径
 * @param callback              回调
 */
$mob.ext.ssdk_getImageData = function (imagePath , thumbImagePath, platformType ,callback)
{
    var func = $mob.ext._bindCallbackFunc(callback);
    $mob.native.ssdk_plugin_getImageData(imagePath, thumbImagePath , platformType , func);
};

/**
 * 检测缩略图
 * @param imagePath             图片路径
 * @param callback              回调
 */
$mob.ext.checkThumbImageSize = function (imagePath , callback)
{
    var func = $mob.ext._bindCallbackFunc(callback);
    $mob.native.ssdk_plugin_checkThumbImageSize(imagePath , func);
};

/**
 * 是否连接了平台SDK
 * @param className             类名
 * @param callback              回调
 */
$mob.ext.ssdk_isConnectedPlatformSDK = function (className , callback)
{
    var func = $mob.ext._bindCallbackFunc(callback);
    $mob.native.ssdk_plugin_isConnectedPlatformSDK(className , func);
};

/**
 * 返回设备型号
 * @param callback              回调
 */
$mob.ext.ssdk_getDeviceModel = function (callback)
{
    var func = $mob.ext._bindCallbackFunc(callback);
    $mob.native.ssdk_plugin_deviceModel(func);
};

/**
 * 美拍分享
 * @param assetURL          相册地址
 * @param type              分享类型
 * @param callback          回调
 */
$mob.ext.ssdk_meipaiShare = function (appKey , assetURL, type , callback)
{
    var func = $mob.ext._bindCallbackFunc(callback);
    $mob.native.ssdk_plugin_meipai_share(appKey, func, type, assetURL);

};

/**
 * 美拍分享回调请求
 * @param appKey         应用标识
 * @param url            请求的URL链接
 * @param callback       回调
 */
$mob.ext.ssdk_meipaiHandleShareCalback = function (appKey, url, callback)
{
    var func = $mob.ext._bindCallbackFunc(callback);
    $mob.native.ssdk_plugin_MeiPai_handleShareCallback(appKey, url, func);
};

/**
 * 获取相册资源的类型
 * @param assetURL          相册链接
 * @param callback          回调
 */
$mob.ext.ssdk_getAssetType= function (assetURL, callback)
{
    var func = $mob.ext._bindCallbackFunc(callback);
    $mob.native.ssdk_plugin_getAssetType(assetURL, func);
};

/**
 * 获取指定视频的大小
 * @param videoURL          视频URL地址
 * @param callback          回调
 */
$mob.ext.ssdk_getVideoSize= function (videoURL, callback)
{
    var func = $mob.ext._bindCallbackFunc(callback);
    $mob.native.ssdk_plugin_getVideoSize(videoURL, func);
};

/**
 * youtube上传视频
 * @param videoURL          视频地址
 * @param jsonString        请求数据
 * @param parts             请求parts
 * @param authorization     授权token
 * @param callback          回调
 */
$mob.ext.ssdk_upLoadYouTubeVideo= function (sessionId ,videoURL, jsonString, parts, authorization, callback)
{
    var func = $mob.ext._bindCallbackFunc(callback);
    $mob.native.ssdk_plugin_uploadYouTubeVideo(sessionId, func , videoURL , jsonString , parts , authorization);
};

/**
 * youtube上传视频
 * @param sessionId        sessionId
 * @param fileURL          视频地址
 * @param token            授权token
 * @param callback         回调
 */
$mob.ext.ssdk_upLoadDropboxFile= function (sessionId ,fileURL, token, callback)
{
    var func = $mob.ext._bindCallbackFunc(callback);
    $mob.native.ssdk_plugin_uploadDropboxFile(sessionId, func, fileURL, token);
};

/**
 * 微信插件分享
 * @param type        分享类型
 * @param parameter   分享参数
 * @param callback    回调
 */
$mob.ext.ssdk_wechatExtensionShare= function (type , parameter, callback)
{
    var func = $mob.ext._bindCallbackFunc(callback);
    $mob.native.ssdk_plugin_wechatExtensionShare(type, parameter, func);
};

/**
 * QQ插件分享
 * @param type        分享类型
 * @param parameter   分享参数
 * @param callback    回调
 */
$mob.ext.ssdk_QQExtensionShare= function (type , parameter, QQShareType, callback)
{
    var func = $mob.ext._bindCallbackFunc(callback);
    $mob.native.ssdk_plugin_QQExtensionShare(type, parameter, func , QQShareType);
};
