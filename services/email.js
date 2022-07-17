const nodemailer = require('nodemailer');
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;
const Class = require('./class');

class Email extends Class {
  constructor (req, res, conn) {
    super (req, res, conn);
    this.oauth2Client = new OAuth2(
      this.setting.gmailOauthClientId,
      this.setting.gmailOauthClientSecret,
      'https://developers.google.com/oauthplayground',
    );

    this.oauth2Client.setCredentials({
      refresh_token: this.setting.gmailOauthRefreshToken,
    });

    this.accessToken = new Promise((resolve, reject) => {
      this.oauth2Client.getAccessToken((err, token) => {
        if (err) {
          reject('Failed to create access token :(');
        }
        resolve(token);
      });
    });
  
    this.transporter = nodemailer.createTransport({
      service: this.setting.emailService,
      auth: {
        type: 'OAuth2',
        user: this.setting.gmailUser,
        accessToken: this.accessToken,
        clientId: this.setting.gmailOauthClientId,
        clientSecret: this.setting.gmailOauthClientSecret,
        refreshToken: this.setting.gmailOauthRefreshToken,
      },
    });
  }
  async create (targetEmail, data) {
    return new Promise((resolve, reject) => {
      if (this.setting.gmailUser && this.setting.gmailOauthClientId && this.setting.gmailOauthClientSecret && this.setting.gmailOauthRefreshToken) {
        data = Object.assign({
          subject: null,
          content: null,
        }, data);
        const { subject, content } = data;
        const mailOption = {
          from: this.setting.gmailUser,
          to: targetEmail,
          subject: subject,
          html: content,
        };
        this.transporter.sendMail(mailOption, (err, info) => {
          if (err) {
            console.error('Send Mail error: ', err);
          } else {{
            resolve(info);
            // console.log('Message send: ', info);
          }}
        });
      } else {
        throw new Error('등록된 이메일이 없습니다');
      }
    });
  }
}

module.exports = Email;