/**
 * Created with JetBrains WebStorm.
 * User: vim888
 * Date: 15/2/28
 * Time: 下午1:50
 * To change this template use File | Settings | File Templates.
 */

/**
 * 授权状态变更
 * @param sessionId     授权会话标识
 * @param state         授权状态
 * @param data          返回数据，成功时为用户信息，失败时为错误信息
 */
$mob.native.ssdk_authStateChanged = function (sessionId, state, data) {};

/**
 * 打开授权页面
 * @param sessionId     授权会话标识
 * @param url           授权页面地址
 * @param callbackUrl   回调地址
 */
$mob.native.ssdk_openAuthUrl = function (sessionId, url, callbackUrl) {};

/**
 * 进行授权，用于使用自定义授权时接口
 * @param sessionId     授权会话标识
 * @param pluginId      插件标识
 * @param userData      用户数据
 * @param callback      回调
 */
$mob.native.ssdk_auth = function (sessionId, pluginId, userData, callback) {};

/**
 * 打开添加好友页面
 * @param sessionId     授权会话标识
 * @param url           授权页面地址
 * @param callbackUrl   回调地址
 */
$mob.native.ssdk_openAddFriendUrl = function (sessionId, url, callbackUrl) {};

/**
 * 调用HTTP接口
 * @param platformType      平台类型
 * @param name              接口名称
 * @param url               接口路径
 * @param method            请求方法
 * @param params            请求参数
 * @param header            请求头信息
 * @param oauthParams       OAuth参数
 * @param consumerSecret    消费者密钥
 * @param oauthTokenSecret  OAuth令牌密钥
 * @param callback          回调
 */
$mob.native.ssdk_callHTTPApi = function (platformType, name, url, method, params, header, oauthParams, consumerSecret, oauthTokenSecret,  callback) {};

/**
 * 获取用户信息状态变更
 * @param sessionId     会话标识
 * @param state         状态
 * @param data          返回数据，成功时为用户信息，失败时为错误信息
 */
$mob.native.ssdk_getUserInfoStateChanged = function (sessionId, state, data) {};

/**
 * 添加好友状态变更
 * @param sessionId     会话标识
 * @param state         状态
 * @param data          返回数据，成功时为用户信息，失败时为错误信息
 */
$mob.native.ssdk_addFriendStateChanged = function (sessionId, state, data) {};

/**
 * 获取好友列表状态变更
 * @param sessionId     会话标识
 * @param state         状态
 * @param data          返回数据，成功时为好友分页信息，失败时为错误信息
 */
$mob.native.ssdk_getFriendsStateChanged = function (sessionId, state, data) {};

/**
 * 分享状态变更
 * @param sessionId     会话标识
 * @param state         状态
 * @param data          返回数据，成功时为分享实体信息，失败时为错误信息
 * @param user          分享用户
 * @param userData      附加数据
 */
$mob.native.ssdk_shareStateChanged = function (sessionId, state, data, user, userData) {};

/**
 * 微信授权
 *
 * @param appId         应用标识
 * @param sessionId     会话标识
 * @param scopes        权限列表
 * @param callback      回调
 */
$mob.native.ssdk_plugin_wechat_auth = function (appId, sessionId, scopes, callback) {};

/**
 * 处理微信授权回调请求
 * @param appId         应用标识
 * @param sessionId     会话标识
 * @param url           URL请求
 * @param callback      回调
 */
$mob.native.ssdk_plugin_wechat_handleSSOCallback = function (appId, sessionId, url, callback) {};

/**
 * 处理微信分享回调请求
 * @param appId         应用标识
 * @param url           URL请求
 * @param callback      回调
 */
$mob.native.ssdk_plugin_wechat_handleShareCallback = function (appId, url, callback) {};


/**
 * 处理微信分享回调请求
 */
$mob.native.ssdk_plugin_wechat_cancel_auth = function (sessionId) {};

/**
 * 微信分享
 * @param appId         应用标识
 * @param scene         分享场景
 * @param type          分享类型
 * @param callback      回调
 */
$mob.native.ssdk_plugin_wechat_share = function (appId, scene, type, callback) {};


/**
 * 初始化微信
 * @param appId         应用标识
 */
$mob.native.ssdk_plugin_wechat_setup = function (appId) {};

/**
 * 微博分享
 * @param appKey        应用标识
 * @param type          分享类型
 * @param callback      回调
 */
$mob.native.ssdk_plugin_weibo_share = function (appKey, type, callback) {};

/**
 * 处理微信分享回调请求
 * @param appKey         应用标识
 * @param url           URL请求
 * @param callback      回调
 */
$mob.native.ssdk_plugin_weibo_handleShareCallback = function (appKey, url, callback) {};

/**
 * 初始化微博
 * @param appKey        应用标识
 */
$mob.native.ssdk_plugin_weibo_setup = function (appKey) {};

/**
 * QQ授权
 * @param appId         应用标识
 * @param scopes        权限列表
 * @param callback      回调
 */
$mob.native.ssdk_plugin_qq_auth = function (appId, scopes, callback) {};

/**
 * 处理QQ授权回调请求
 * @param appId         应用标识
 * @param url           URL请求
 * @param callback      回调
 */
$mob.native.ssdk_plugin_qq_handleSSOCallback = function (appId, url, callback) {};

/**
 * QQ分享
 * @param appId         应用标识
 * @param scene         分享场景
 * @param type          分享类型
 * @param callback      回调
 */
$mob.native.ssdk_plugin_qq_share = function (appId, scene, type, callback) {};

/**
 * 处理QQ分享回调请求
 * @param appId         应用标识
 * @param url          URL请求
 * @param callback      回调
 */
$mob.native.ssdk_plugin_qq_handleShareCallback = function (appId, url, callback) {};

/**
 * 初始化QQ
 * @param appId         应用标识
 */
$mob.native.ssdk_plugin_qq_setup = function (appId) {};

/**
 * 腾讯微博授权
 * @param appKey        应用标识
 * @param appSecret     应用密钥
 * @param redirectUri   回调地址
 * @param callback      回调
 */
$mob.native.ssdk_plugin_tcweibo_auth = function (appKey, appSecret, redirectUri, callback) {};

/**
 * 处理腾讯微博SSO授权回调
 * @param appKey        应用标识
 * @param appSecret     应用密钥
 * @param redirecturi   回调地址
 * @param url           URL请求
 * @param callback      回调
 */
$mob.native.ssdk_plugin_tcweibo_handleSSOCallback = function (appKey, appSecret, redirecturi, url, callback) {};

/**
 * 新浪微博SSO授权
 * @param appKey            应用标识
 * @param redirectUri       回调地址
 * @param scope             权限列表
 * @param callback          回调
 */
$mob.native.ssdk_plugin_weibo_auth = function (appKey, redirectUri, scope, callback) {};

/**
 * 处理新浪微博SSO授权回调
 * @param appKey            应用标识
 * @param url               URL请求
 * @param callback          回调
 */
$mob.native.ssdk_plugin_weibo_handleSSOCallback = function (appKey, url, callback) {};

/**
 * 短信分享
 * @param type              分享类型
 * @param callback          回调方法
 */
$mob.native.ssdk_plugin_sms_share = function (type, callback) {};

/**
 * 邮件分享
 * @param type              分享类型
 * @param callback          回调方法
 */
$mob.native.ssdk_plugin_mail_share = function (type, callback) {};

/**
 * 拷贝
 * @param type              分享类型
 * @param callback          回调方法
 */
$mob.native.ssdk_plugin_copy = function (type, callback) {};

/**
 * 获取短链
 * @param platform          分享平台类型
 * @param urls              分享链接
 * @param user              用户信息
 * @param callback          回调
 */
$mob.native.ssdk_getShortUrls = function (platform, urls, user, callback) {};

/**
 * 初始化人人网
 * @param appId         应用标识
 * @param appKey        应用Key
 * @param secretKey     应用密钥
 */
$mob.native.ssdk_plugin_renren_setup = function (appId, appKey, secretKey) {};

/**
 * 人人网授权
 * @param appId         应用标识
 * @param appKey        应用Key
 * @param secretKey     应用密钥
 * @param scopes        权限列表
 * @param callback      回调
 */
$mob.native.ssdk_plugin_renren_auth = function (appId, appKey, secretKey, scopes, callback) {};

/**
 * 人人网处理SSO回调
 * @param appId         应用标识
 * @param appKey        应用Key
 * @param secretKey     应用密钥
 * @param url           请求链接
 * @param callback      回调
 */
$mob.native.ssdk_plugin_renren_handleSSOCallback = function (appId, appKey, secretKey, url, callback) {};

/**
 * 初始化Google+
 * @param clientId      应用标识
 */
$mob.native.ssdk_plugin_googleplus_setup = function (clientId) {};

/**
 * Google+取消授权
 * @param clientId              应用标识
 */
$mob.native.ssdk_plugin_googleplus_cancelAuth = function (clientId) {};

/**
 * Google+分享
 * @param clientId              应用标识
 * @param type                  分享类型
 * @param callback              回调
 */
$mob.native.ssdk_plugin_googleplus_share = function (type, callback) {};

/**
 * Instagram分享
 * @param type                  分享类型
 * @param callback              回调
 * @param image                 分享图片
 */
$mob.native.ssdk_plugin_instagram_share = function (type, callback, image) {};

/**
 * Instagram取消授权
 * @param clientId              应用标识
 */
$mob.native.ssdk_plugin_instagram_cancelAuth = function (clientId) {};

/**
 * WhatsApp分享
 * @param type                  分享类型
 * @param callback              回调
 */
$mob.native.ssdk_plugin_whatsapp_share = function (type, callback) {};

/**
 * Line分享
 * @param type                  分享类型
 * @param callback              回调
 */
$mob.native.ssdk_plugin_line_share = function (type, callback) {};

/**
 * Line授权
 * @param callback              回调
 */
$mob.native.ssdk_plugin_line_auth = function(callback){};

/**
 * facebook messenger分享
 * @param type                  分享类型
 * @param callback              回调
 */
$mob.native.ssdk_plugin_facebookmessenger_share = function (type, callback) {};

/**
 * 获取Evernote用户信息
 * @param baseUrl               基础路径
 * @param oauthToken            令牌信息
 * @param callback              回调
 */
$mob.native.ssdk_plugin_evernote_getuserinfo = function (baseUrl, oauthToken, callback) {};

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
$mob.native.ssdk_plugin_evernote_share = function (requestUrl, oauthToken, text, images, title, notebook, tags, callback) {};

/**
 * 初始化支付宝好友
 * @param appId                 应用标识
 */
$mob.native.ssdk_plugin_alipay_setup = function (appId) {};

/**
 * 支付宝分享
 * @param appId                 应用标识
 * @param scene         		分享场景
 * @param type                  内容类型
 * @param callback              回调
 */
$mob.native.ssdk_plugin_alipay_share = function (appId, scene, type, callback) {};

/**
 * 处理分享回调
 * @param appId                 应用标识
 * @param url                   回调地址
 * @param callback              回调
 */
$mob.native.ssdk_plugin_alipay_handleShareCallback = function (appId, url, callback) {};

/**
 * 初始化Pinterest
 * @param clientId              应用标识
 */
$mob.native.ssdk_plugin_pinterest_setup = function (clientId) {};

/**
 * Pinterest分享
 * @param clientId              应用标识
 * @param text                  图片描述
 * @param image                 图片链接
 * @param url                   图片路径
 * @param callback              回调
 */
$mob.native.ssdk_plugin_pinterest_share = function (clientId, text, image, url, callback) {};

/**
 * Pinterest分享回调处理
 * @param clientId              应用标识
 * @param url                   回调地址
 * @param callback              回调
 */
$mob.native.ssdk_plugin_pinterest_handleShareCallback = function (clientId, url, callback) {};

/**
 * Kakao授权回调处理
 * @param appKey                应用标识
 * @param redirectUri           回调地址
 * @param scope                 权限列表
 * @param clientType            授权客户端类型，2 Talk，4 Story
 * @param callback              回调
 */
$mob.native.ssdk_plugin_kakao_auth = function (appKey, redirectUri, scope, clientType, callback) {};

/**
 * Kakao处理SSO授权回调
 * @param appKey                应用标识
 * @param url                   回调地址
 * @param callback              回调
 */
$mob.native.ssdk_plugin_kakao_handleSSOCallback = function (appKey, url, callback) {};

/**
 * Kakao分享
 * @param appKey                应用标识
 * @param scene                 分享场景
 * @param type                  分享类型
 * @param callback              回调
 */
$mob.native.ssdk_plugin_kakao_share = function (appKey, scene, type, callback) {};

/**
 * 易信初始化
 * @param appId                 应用标识
 */
$mob.native.ssdk_plugin_yixin_setup = function (appId) {};

/**
 * 易信授权
 * @param appId                 应用标识
 * @param callback              回调
 */
$mob.native.ssdk_plugin_yixin_auth = function (appId, callback) {};

/**
 * 易信处理SSO 授权回调
 * @param appId                 应用标识
 * @param sessionId             会话标识
 * @param url                   回调地址
 * @param callback              回调
 */
$mob.native.ssdk_plugin_yixin_handleSSOCallback = function (appId, sessionId, url, callback) {};

/**
 * 易信分享
 * @param appId                 应用标识
 * @param scene                 分享场景
 * @param type                  分享类型
 * @param callback              回调
 */
$mob.native.ssdk_plugin_yixin_share = function (appId, scene, type, callback) {};

/**
 * 处理微信分享回调请求
 * @param appId         应用标识
 * @param url           URL请求
 * @param callback      回调
 */
$mob.native.ssdk_plugin_yixin_handleShareCallback = function (appId, url, callback) {};


/**
 * 打印分享
 * @param type                  内容类型
 * @param callback              回调
 */
$mob.native.ssdk_plugin_print_share = function (type, callback) {};

/**
 * Facebook取消授权（针对Facebook - WebPage分享所用）
 * @param clientId              应用标识
 */
$mob.native.ssdk_plugin_facebook_cancelAuth = function (clientId) {};


/**
 * 初始化钉钉
 * @param appId                 应用标识
 */
$mob.native.ssdk_plugin_dingtalk_setup = function (appId) {};

/**
 * 钉钉分享
 * @param appId                 应用标识
 * @param type                  内容类型
 * @param callback              回调
 */
$mob.native.ssdk_plugin_dingtalk_share = function (appId, type, callback) {};

/**
 * 处理钉钉分享回调
 * @param appId                 应用标识
 * @param url                   回调地址
 * @param callback              回调
 */
$mob.native.ssdk_plugin_dingtalk_handleShareCallback = function (appId, url, callback) {};

/**
 * 获取粘贴板数据
 * @param platform              平台
 * @param appId                 应用标识
 * @param callback              回调
 */
$mob.native.ssdk_plugin_getDataFromPasteboard = function (appId, sessionId, url, platformType, callback) {};

/**
 * 设置粘贴板数据
 * @param platform              平台
 * @param data             需要写入粘贴板的数据
 * @param callback              回调
 */
$mob.native.ssdk_plugin_setDataToPasteboard = function (platformType, appId, data, sessionId,callback) {};

/**
 * 获取图片数据
 * @param imagePath             图片路径
 * @param thumbImagePath        缩略图片路径
 * @param callback              回调
 */
$mob.native.ssdk_plugin_getImageData = function (imagePath, thumbImagePath , platformType , callback) {};

/**
 * 检测缩略图
 * @param imagePath             图片路径
 * @param callback              回调
 */
$mob.native.ssdk_plugin_checkThumbImageSize = function (imagePath , callback) {};

/**
 * 是否连接了平台SDK
 * @param className             类名
 * @param callback              回调
 */
$mob.native.ssdk_plugin_isConnectedPlatformSDK = function (className , callback) {};

