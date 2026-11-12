require('dotenv').config(); 

const nodemailer = require('nodemailer');

class MailService {
    constructor() {
        const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD } = process.env;

        if (!SMTP_HOST || !SMTP_USER || !SMTP_PASSWORD) {
            throw new Error('SMTP_HOST / SMTP_USER / SMTP_PASSWORD are not set in .env');
        }

        const port = Number(SMTP_PORT) || 587;

        this.transporter = nodemailer.createTransport({
            host: SMTP_HOST,
            port,
            secure: port === 465,
            auth: {
                user: SMTP_USER,
                pass: SMTP_PASSWORD,
            },
        });
    }

    async sendActivationMail(to, link) {
        await this.transporter.sendMail({
            from: process.env.SMTP_USER,
            to,
            subject: `Activation of account on ${process.env.API_URL}`,
            text: `For activation, please click the link: ${link}`,
            html: `
                <div>
                    <h1>For activation, please click the link</h1>
                    <a href="${link}">${link}</a>
                </div>
            `,
        });
    }
}

module.exports = new MailService();