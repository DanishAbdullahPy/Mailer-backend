const express = require('express');
const nodemailer = require('nodemailer');
const { getEmailTemplate, getPlainTextTemplate } = require('../utils/emailTemplate');

const router = express.Router();

// Configure nodemailer with explicit SMTP settings
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // Use STARTTLS
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Debug authentication endpoint
router.get('/debug-auth', async (req, res) => {
  console.log('🔍 Debug Authentication:');
  console.log('GMAIL_USER:', process.env.GMAIL_USER);
  console.log('GMAIL_PASS length:', process.env.GMAIL_PASS?.length);
  console.log('GMAIL_PASS first 4 chars:', process.env.GMAIL_PASS?.substring(0, 4));
  
  const testTransporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS
    }
  });
  
  try {
    const verification = await testTransporter.verify();
    console.log('✅ Email verification successful');
    res.json({ success: true, verification });
  } catch (error) {
    console.error('❌ Email verification failed:', error);
    res.json({ success: false, error: error.message });
  }
});

// Test connection endpoint
router.get('/test-connection', async (req, res) => {
  console.log('Testing email connection...');
  console.log('Gmail User:', process.env.GMAIL_USER);
  console.log('Gmail Pass length:', process.env.GMAIL_PASS?.length);
  
  try {
    const verification = await transporter.verify();
    console.log('✅ Email connection successful:', verification);
    res.json({ success: true, message: 'Email configuration is working!' });
  } catch (error) {
    console.error('❌ Email connection failed:', {
      message: error.message,
      code: error.code,
      response: error.response,
      stack: error.stack
    });
    res.status(500).json({ 
      success: false, 
      message: 'Email configuration failed',
      error: error.message,
      code: error.code
    });
  }
});

// Extract company name from email
const extractCompanyFromEmail = (email) => {
  const domain = email.split('@')[1];
  if (!domain) return 'Your Company';
  
  const companyName = domain.split('.')[0];
  return companyName.charAt(0).toUpperCase() + companyName.slice(1);
};

// Extract name from email
const extractNameFromEmail = (email) => {
  const localPart = email.split('@')[0];
  const parts = localPart.split(/[._-]/);
  
  if (parts.length >= 2) {
    return parts.map(part => 
      part.charAt(0).toUpperCase() + part.slice(1)
    ).join(' ');
  }
  
  return localPart.charAt(0).toUpperCase() + localPart.slice(1);
};

// Send single email
router.post('/send-email', async (req, res) => {
  console.log('📧 Received send-email request:', req.body);
  
  try {
    const { email, name, company, area } = req.body;
    
    if (!email || !email.includes('@')) {
      throw new Error('Invalid email address provided');
    }
    
    const recipientName = name || extractNameFromEmail(email);
    const recipientCompany = company || extractCompanyFromEmail(email);
    const jobArea = area || 'Full Stack Developer';

    console.log('📝 Email details:', {
      to: email,
      name: recipientName,
      company: recipientCompany,
      area: jobArea
    });

    const mailOptions = {
      from: `Danish Abdullah <${process.env.GMAIL_USER}>`,
      to: email,
      subject: `Application for ${jobArea} - ${recipientCompany}`,
      html: getEmailTemplate(recipientName, recipientCompany, jobArea),
      text: getPlainTextTemplate(recipientName, recipientCompany, jobArea)
    };

    console.log('🚀 Attempting to send email...');
    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', result.messageId);
    
    res.json({ 
      success: true, 
      message: `Email sent successfully to ${email}`,
      messageId: result.messageId,
      recipient: { email, name: recipientName, company: recipientCompany }
    });
    
  } catch (error) {
    console.error('❌ Error sending email:', {
      message: error.message,
      code: error.code,
      response: error.response,
      stack: error.stack
    });
    
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send email',
      error: error.message,
      code: error.code
    });
  }
});

// Send bulk emails
router.post('/send-bulk-emails', async (req, res) => {
  console.log('📧 Received bulk email request:', req.body);
  
  try {
    const { emails, area } = req.body;
    
    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      throw new Error('No emails provided or invalid format');
    }
    
    const results = [];
    
    for (const emailData of emails) {
      try {
        const { email } = emailData;
        
        if (!email || !email.includes('@')) {
          throw new Error('Invalid email address');
        }
        
        const recipientName = emailData.name || extractNameFromEmail(email);
        const recipientCompany = emailData.company || extractCompanyFromEmail(email);
        const jobArea = area || 'Full Stack Developer';

        console.log(`📝 Processing email: ${email}`);

        const mailOptions = {
          from: `Danish Abdullah <${process.env.GMAIL_USER}>`,
          to: email,
          subject: `Application for ${jobArea} - ${recipientCompany}`,
          html: getEmailTemplate(recipientName, recipientCompany, jobArea),
          text: getPlainTextTemplate(recipientName, recipientCompany, jobArea)
        };

        const result = await transporter.sendMail(mailOptions);
        console.log(`✅ Email sent to ${email}:`, result.messageId);
        
        results.push({
          email,
          name: recipientName,
          company: recipientCompany,
          status: 'sent',
          message: 'Email sent successfully',
          messageId: result.messageId
        });

        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error) {
        console.error(`❌ Failed to send to ${emailData.email}:`, error.message);
        results.push({
          email: emailData.email,
          status: 'failed',
          message: error.message
        });
      }
    }
    
    console.log('📊 Bulk email results:', {
      total: emails.length,
      sent: results.filter(r => r.status === 'sent').length,
      failed: results.filter(r => r.status === 'failed').length
    });
    
    res.json({ 
      success: true, 
      results,
      summary: {
        total: emails.length,
        sent: results.filter(r => r.status === 'sent').length,
        failed: results.filter(r => r.status === 'failed').length
      }
    });
    
  } catch (error) {
    console.error('❌ Error in bulk email sending:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send bulk emails',
      error: error.message 
    });
  }
});

module.exports = router;
