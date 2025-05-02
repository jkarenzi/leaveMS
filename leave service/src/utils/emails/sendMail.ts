import nodemailer from 'nodemailer';
import hbs from 'handlebars';
import fs from 'fs';
import dotenv from 'dotenv';
import sgTransport from 'nodemailer-sendgrid-transport';
dotenv.config();


interface Idata {
    name: string,
    message?:string
}

const transporter = nodemailer.createTransport(
    sgTransport({
      auth: {
        api_key: process.env.SENDGRID_API_KEY
      }
    })
  );

const sendEmail = async(emailType:string, recipient:string, data:Idata | null) => {
    try{
        let subject;

        if(emailType == 'welcome'){
            subject = 'Welcome to LMS'
        }else if(emailType == 'notification'){
            subject = 'New notification'
        }
    
        const templatePath = `./src/utils/emails/templates/${emailType}.html`
        const templateFile = fs.readFileSync(templatePath, 'utf-8');
        const template = hbs.compile(templateFile); 
        const html = template(data);
        
        const mailOptions = {
            from: 'LMS <noreply@jkarenzi.tech>',
            to: recipient,
            subject: subject,
            html: html
        };
    
        const response = await transporter.sendMail(mailOptions)
        return response  
    }catch(err) {
        console.log(err)
    }
}

export default sendEmail