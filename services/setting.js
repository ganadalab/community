const Class = require('./class');
const status = require('./status');

class Setting extends Class {
  async get () {
    const [settings, ] = await this.conn.query(`SELECT * FROM setting ORDER BY id DESC LIMIT 1`);
    if (settings.length) {
      const setting = settings[0];
      return setting;
    } else {
      return null;
    }
  }
  async set () {
    status.setting = await this.get();
  }
  async update (data) {
    const setting = await this.get();
    data = Object.assign({
      siteNameRaw: setting.siteNameRaw,
      siteName: setting.siteName,
      siteDescription: setting.siteDescription,
      siteKeywords: setting.siteKeywords,
      siteDomain: setting.siteDomain,
      footerGuide: setting.footerGuide,
      emailService: setting.emailService,
      gmailUser: setting.gmailUser,
      gmailOauthClientId: setting.gmailOauthClientId,
      gmailOauthClientSecret: setting.gmailOauthClientSecret,
      gmailOauthRefreshToken: setting.gmailOauthRefreshToken,
      index: setting.index,
      useCustomLayout: setting.useCustomLayout,
      font: setting.font,
      theme: setting.theme,
      headerLayout: setting.headerLayout,
      footerLayout: setting.footerLayout,
      indexLayout: setting.indexLayout,
      boardTheme: setting.boardTheme,
      license: setting.license,
      headerFontColor: setting.headerFontColor,
      headerBackgroundColor: setting.headerBackgroundColor,
      bodyFontColor: setting.bodyFontColor,
      bodyBackgroundColor: setting.bodyBackgroundColor,
      pointColor: setting.pointColor,
      pointBackgroundColor: setting.pointBackgroundColor,
      desktopBannerRowsHeader: setting.desktopBannerRowsHeader,
      desktopBannerRowsIndexTop: setting.desktopBannerRowsIndexTop,
      desktopBannerRowsIndexBottom: setting.desktopBannerRowsIndexBottom,
      desktopBannerRowsSideTop: setting.desktopBannerRowsSideTop,
      desktopBannerRowsSideBottom: setting.desktopBannerRowsSideBottom,
      desktopBannerRowsArticleTop: setting.desktopBannerRowsArticleTop,
      desktopBannerRowsArticleBottom: setting.desktopBannerRowsArticleBottom,
      desktopBannerRowsCustom: setting.desktopBannerRowsCustom,
      mobileBannerRowsHeader: setting.mobileBannerRowsHeader,
      mobileBannerRowsIndexTop: setting.mobileBannerRowsIndexTop,
      mobileBannerRowsIndexBottom: setting.mobileBannerRowsIndexBottom,
      mobileBannerRowsSideTop: setting.mobileBannerRowsSideTop,
      mobileBannerRowsSideBottom: setting.mobileBannerRowsSideBottom,
      mobileBannerRowsArticleTop: setting.mobileBannerRowsArticleTop,
      mobileBannerRowsArticleBottom: setting.mobileBannerRowsArticleBottom,
      mobileBannerRowsCustom: setting.mobileBannerRowsCustom,
      bannerAlignHeader: setting.bannerAlignHeader,
      bannerAlignIndexTop: setting.bannerAlignIndexTop,
      bannerAlignIndexBottom: setting.bannerAlignIndexBottom,
      bannerAlignSideTop: setting.bannerAlignSideTop,
      bannerAlignSideBottom: setting.bannerAlignSideBottom,
      bannerAlignArticleTop: setting.bannerAlignArticleTop,
      bannerAlignArticleBottom: setting.bannerAlignArticleBottom,
      bannerAlignLeftWing: setting.bannerAlignLeftWing,
      bannerAlignRightWing: setting.bannerAlignRightWing,
      bannerAlignCustom: setting.bannerAlignCustom,
      bannerGapDesktop: setting.bannerGapDesktop,
      bannerGapMobile: setting.bannerGapMobile,
      bannerBorderRounding: setting.bannerBorderRounding,
      boardPrevNextArticle: setting.boardPrevNextArticle,
      boardAllArticle: setting.boardAllArticle,
      boardAuthorArticle: setting.boardAuthorArticle,
      writingTerm: setting.writingTerm,
      customHeadTags: setting.customHeadTags,
      customHeaderTags: setting.customHeaderTags,
      customFooterTags: setting.customFooterTags,
      terms: setting.setting,
      privacy: setting.privacy,
      adsenseIndexTop: setting.adsenseIndexTop,
      adsenseIndexBottom: setting.adsenseIndexBottom,
      adsenseSide: setting.adsenseSide,
      adsenseCustom: setting.adsenseCustom,
      adsenseArticleTop: setting.adsenseArticleTop,
      adsenseArticleBottom: setting.adsenseArticleBottom,
      adsenseArticleCenter: setting.adsenseArticleCenter,
      adsenseAds: setting.adsenseAds,
      blockWords: setting.blockWords,
      useJoinPhone: setting.useJoinPhone,
      useJoinRealName: setting.useJoinRealName,
      useCheckComments: setting.useCheckComments,
      checkComments: setting.checkComments,
      useSocialApple: setting.useSocialApple,
      useSocialGoogle: setting.useSocialGoogle,
      useSocialFacebook: setting.useSocialFacebook,
      useSocialTwitter: setting.useSocialTwitter,
      useSocialNaver: setting.useSocialNaver,
      useSocialKakao: setting.useSocialKakao,
      socialAppleServiceId: setting.socialAppleServiceId,
      socialAppleTeamId: setting.socialAppleTeamId,
      socialAppleKeyId: setting.socialAppleKeyId,
      socialAppleAuthKey: setting.socialAppleAuthKey,
      socialGoogleClientId: setting.socialGoogleClientId,
      socialGoogleClientSecret: setting.socialGoogleClientSecret,
      socialFacebookAppId: setting.socialFacebookAppId,
      socialFacebookAppSecret: setting.socialFacebookAppSecret,
      socialTwitterApiKey: setting.socialTwitterApiKey,
      socialTwitterApiSecret: setting.socialTwitterApiSecret,
      socialNaverClientId: setting.socialNaverClientId,
      socialNaverClientSecret: setting.socialNaverClientSecret,
      socialKakaoClientId: setting.socialKakaoClientId,
      socialKakaoClientSecret: setting.socialKakaoClientSecret,
      smsCallerId: setting.smsCallerId,
      smsServiceId: setting.smsServiceId,
      smsServiceSecretKey: setting.smsServiceSecretKey,
      telegramToken: setting.telegramToken,
      telegramChatId: setting.telegramChatId,
      naverCloudPlatformAccessKeyId: setting.naverCloudPlatformAccessKeyId,
      naverCloudPlatformSecretKey: setting.naverCloudPlatformSecretKey,
      googleCloudPlatformApiKey: setting.googleCloudPlatformApiKey,
      pointWithdrawLimit: setting.pointWithdrawLimit,
      checkPoint: setting.checkPoint,
      invitePoint: setting.invitePoint,
      useTermsAndPrivacy: setting.useTermsAndPrivacy,
      useAutoPermission: setting.useAutoPermission,
      useEmailAuthentication: setting.useEmailAuthentication,
      useSmsAuthentication: setting.useSmsAuthentication,
      useArticleViewCount: setting.useArticleViewCount,
      useVisitCount: setting.useVisitCount,
      useMessage: setting.useMessage,
      useChat: setting.useChat,
      useSms: setting.useSms,
      usePermissionImage: setting.usePermissionImage,
      useWithdraw: setting.useWithdraw,
      useWorkingUser: setting.useWorkingUser,
      usePointWithdraw: setting.usePointWithdraw,
    }, data);
    const { siteNameRaw, siteName, siteDescription, siteKeywords, siteDomain } = data;
    const { footerGuide } = data;
    const { emailService, gmailUser, gmailOauthClientId, gmailOauthClientSecret, gmailOauthRefreshToken } = data;
    const { index, useCustomLayout } = data;
    const { font, theme, boardTheme, license } = data;
    let { headerLayout, footerLayout, indexLayout } = data;
    const { headerFontColor, headerBackgroundColor, bodyFontColor, bodyBackgroundColor, pointColor, pointBackgroundColor } = data;
    const { desktopBannerRowsHeader, desktopBannerRowsIndexTop, desktopBannerRowsIndexBottom, desktopBannerRowsSideTop, desktopBannerRowsSideBottom, desktopBannerRowsArticleTop, desktopBannerRowsArticleBottom, desktopBannerRowsCustom, mobileBannerRowsHeader, mobileBannerRowsIndexTop, mobileBannerRowsIndexBottom, mobileBannerRowsSideTop, mobileBannerRowsSideBottom, mobileBannerRowsArticleTop, mobileBannerRowsArticleBottom, mobileBannerRowsCustom, bannerGapDesktop, bannerGapMobile, bannerBorderRounding } = data;
    const { bannerAlignHeader, bannerAlignIndexTop, bannerAlignIndexBottom, bannerAlignSideTop, bannerAlignSideBottom, bannerAlignArticleTop, bannerAlignArticleBottom, bannerAlignLeftWing, bannerAlignRightWing, bannerAlignCustom } = data;
    const { boardPrevNextArticle, boardAllArticle, boardAuthorArticle, writingTerm } = data;
    const { customHeadTags, customHeaderTags, customFooterTags } = data;
    const { terms, privacy } = data;
    const { adsenseIndexTop, adsenseIndexBottom, adsenseSide, adsenseCustom, adsenseArticleTop, adsenseArticleBottom, adsenseArticleCenter, adsenseAds } = data;
    const { blockWords, useCheckComments, checkComments } = data;
    const { useJoinPhone, useJoinRealName } = data;
    const { useSocialApple, useSocialGoogle, useSocialFacebook, useSocialTwitter, useSocialNaver, useSocialKakao, socialAppleServiceId, socialAppleTeamId, socialAppleKeyId, socialAppleAuthKey, socialGoogleClientId, socialGoogleClientSecret, socialFacebookAppId, socialFacebookAppSecret, socialTwitterApiKey, socialTwitterApiSecret, socialNaverClientId, socialNaverClientSecret, socialKakaoClientId, socialKakaoClientSecret } = data;
    const { smsCallerId, smsServiceId, smsServiceSecretKey } = data;
    const { telegramToken, telegramChatId, naverCloudPlatformAccessKeyId, naverCloudPlatformSecretKey, googleCloudPlatformApiKey } = data;
    const { pointWithdrawLimit, checkPoint, invitePoint, useTermsAndPrivacy, useAutoPermission, useEmailAuthentication, useSmsAuthentication, useArticleViewCount, useVisitCount, useMessage, useChat, useSms, usePermissionImage, useWithdraw, useWorkingUser, usePointWithdraw } = data;
    if (setting.useCustomLayout) {
      headerLayout = setting.headerLayout;
      footerLayout = setting.footerLayout;
      indexLayout = setting.indexLayout;
    }
    const query = `UPDATE setting
    SET
    siteNameRaw=?, siteName=?, siteDescription=?, siteKeywords=?, siteDomain=?,
    footerGuide=?,
    emailService=?, gmailUser=?, gmailOauthClientId=?, gmailOauthClientSecret=?, gmailOauthRefreshToken=?,
    \`index\`=?, useCustomLayout=?,
    font=?, theme=?, headerLayout=?, footerLayout=?, indexLayout=?, boardTheme=?, license=?,
    headerFontColor=?, headerBackgroundColor=?, bodyFontColor=?, bodyBackgroundColor=?, pointColor=?, pointBackgroundColor=?,
    desktopBannerRowsHeader=?, desktopBannerRowsIndexTop=?, desktopBannerRowsIndexBottom=?, desktopBannerRowsSideTop=?, desktopBannerRowsSideBottom=?, desktopBannerRowsArticleTop=?, desktopBannerRowsArticleBottom=?, desktopBannerRowsCustom=?, mobileBannerRowsHeader=?, mobileBannerRowsIndexTop=?, mobileBannerRowsIndexBottom=?, mobileBannerRowsSideTop=?, mobileBannerRowsSideBottom=?, mobileBannerRowsArticleTop=?, mobileBannerRowsArticleBottom=?, mobileBannerRowsCustom=?, bannerGapDesktop=?, bannerGapMobile=?, bannerBorderRounding=?,
    bannerAlignHeader=?, bannerAlignIndexTop=?, bannerAlignIndexBottom=?, bannerAlignSideTop=?, bannerAlignSideBottom=?, bannerAlignArticleTop=?, bannerAlignArticleBottom=?, bannerAlignLeftWing=?, bannerAlignRightWing=?, bannerAlignCustom=?,
    boardPrevNextArticle=?, boardAllArticle=?, boardAuthorArticle=?, writingTerm=?,
    customHeadTags=?, customHeaderTags=?, customFooterTags=?,
    terms=?, privacy=?,
    adsenseIndexTop=?, adsenseIndexBottom=?, adsenseSide=?, adsenseCustom=?, adsenseArticleTop=?, adsenseArticleBottom=?, adsenseArticleCenter=?, adsenseAds=?,
    blockWords=?, useCheckComments=?, checkComments=?,
    useJoinPhone=?, useJoinRealName=?,
    useSocialApple=?, useSocialGoogle=?, useSocialFacebook=?, useSocialTwitter=?, useSocialNaver=?, useSocialKakao=?, socialAppleServiceId=?, socialAppleTeamId=?, socialAppleKeyId=?, socialAppleAuthKey=?, socialGoogleClientId=?, socialGoogleClientSecret=?, socialFacebookAppId=?, socialFacebookAppSecret=?, socialTwitterApiKey=?, socialTwitterApiSecret=?, socialNaverClientId=?, socialNaverClientSecret=?, socialKakaoClientId=?, socialKakaoClientSecret=?,
    smsCallerId=?, smsServiceId=?, smsServiceSecretKey=?,
    telegramToken=?, telegramChatId=?, naverCloudPlatformAccessKeyId=?, naverCloudPlatformSecretKey=?, googleCloudPlatformApiKey=?,
    useTermsAndPrivacy=?, useEmailAuthentication=?, useSmsAuthentication=?, useArticleViewCount=?, useVisitCount=?, useMessage=?, useChat=?, useSms=?, usePermissionImage=?, useWithdraw=?, useWorkingUser=?, usePointWithdraw=?, pointWithdrawLimit=?, checkPoint=?, invitePoint=?, useAutoPermission=?
    WHERE id=?`;
    const [result, ] = await this.conn.query(query, [
      siteNameRaw, siteName, siteDescription, siteKeywords, siteDomain,
      footerGuide,
      emailService, gmailUser, gmailOauthClientId, gmailOauthClientSecret, gmailOauthRefreshToken,
      index, useCustomLayout,
      font, theme, headerLayout, footerLayout, indexLayout, boardTheme, license,
      headerFontColor, headerBackgroundColor, bodyFontColor, bodyBackgroundColor, pointColor, pointBackgroundColor,
      desktopBannerRowsHeader, desktopBannerRowsIndexTop, desktopBannerRowsIndexBottom, desktopBannerRowsSideTop, desktopBannerRowsSideBottom, desktopBannerRowsArticleTop, desktopBannerRowsArticleBottom, desktopBannerRowsCustom, mobileBannerRowsHeader, mobileBannerRowsIndexTop, mobileBannerRowsIndexBottom, mobileBannerRowsSideTop, mobileBannerRowsSideBottom, mobileBannerRowsArticleTop, mobileBannerRowsArticleBottom, mobileBannerRowsCustom, bannerGapDesktop, bannerGapMobile, bannerBorderRounding,
      bannerAlignHeader, bannerAlignIndexTop, bannerAlignIndexBottom, bannerAlignSideTop, bannerAlignSideBottom, bannerAlignArticleTop, bannerAlignArticleBottom, bannerAlignLeftWing, bannerAlignRightWing, bannerAlignCustom,
      boardPrevNextArticle, boardAllArticle, boardAuthorArticle, writingTerm,
      customHeadTags, customHeaderTags, customFooterTags,
      terms, privacy,
      adsenseIndexTop, adsenseIndexBottom, adsenseSide, adsenseCustom, adsenseArticleTop, adsenseArticleBottom, adsenseArticleCenter, adsenseAds,
      blockWords, useCheckComments, checkComments,
      useJoinPhone, useJoinRealName,
      useSocialApple, useSocialGoogle, useSocialFacebook, useSocialTwitter, useSocialNaver, useSocialKakao, socialAppleServiceId, socialAppleTeamId, socialAppleKeyId, socialAppleAuthKey, socialGoogleClientId, socialGoogleClientSecret, socialFacebookAppId, socialFacebookAppSecret, socialTwitterApiKey, socialTwitterApiSecret, socialNaverClientId, socialNaverClientSecret, socialKakaoClientId, socialKakaoClientSecret,
      smsCallerId, smsServiceId, smsServiceSecretKey,
      telegramToken, telegramChatId, naverCloudPlatformAccessKeyId, naverCloudPlatformSecretKey, googleCloudPlatformApiKey,
      useTermsAndPrivacy, useEmailAuthentication, useSmsAuthentication, useArticleViewCount, useVisitCount, useMessage, useChat, useSms, usePermissionImage, useWithdraw, useWorkingUser, usePointWithdraw, pointWithdrawLimit, checkPoint, invitePoint, useAutoPermission,
      setting.id,
    ]);
    if (result.affectedRows) {
      await this.set();
      return true;
    } else {
      throw new Error('????????? ????????? ?????????????????????');
    }
  }
}

module.exports = Setting;