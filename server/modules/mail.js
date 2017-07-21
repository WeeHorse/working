var nodemailer = require('nodemailer'),
    MailTemplates = require('./mail-templates');

module.exports = class Mail{
  constructor(){
    this.mailTemplates = new MailTemplates();
    this.setupTransporter();
  }

  async send(templateName, req, res) {
    let message = await this.mailTemplates.getTemplate(templateName, req.body);

    if (!message) {
      console.log('Error getting mail template', templateName, 'properties used', Object.keys(req.body));
      res.json('error');
      return;
    }

    this.transporter.sendMail(message, (error, info) => {
      if (error) {
        console.log('Error occurred when mailing', error.message);
        res.json('error');
        return;
      }
      console.log('Mail sent successfully using template:', templateName);
      res.json('success');
    });
  }

  setupTransporter(){
    let port = 465;
    // Create a SMTP transporter object
    this.transporter = nodemailer.createTransport({
      host: 'send.one.com',
      port: port,
      secure: !!(port == 465),
      auth: {
        user: 'test@majvall.se',
        pass: 'test123'
      },
      debug: true // include SMTP traffic in the logs
    }, {
      from: 'Mercedes-Benz Malmö <test@majvall.se>'
      // headers: {
      //     'X-Laziness-level': 1000 // just an example header, no need to use this
      // }
    });
  }
}